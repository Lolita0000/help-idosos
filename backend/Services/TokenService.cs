using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EloDeCuidado.Models;
using Microsoft.IdentityModel.Tokens;

namespace EloDeCuidado.Services;

/// <summary>
/// Emite tokens JWT assinados com chave simétrica (HMAC-SHA256).
/// </summary>
/// <param name="configuration">Configuração da aplicação, de onde vêm os parâmetros da seção <c>Jwt</c>.</param>
public sealed class TokenService(IConfiguration configuration) : ITokenService
{
    /// <inheritdoc />
    public (string Token, DateTime ExpiresAt) Generate(User user)
    {
        var settings = configuration.GetSection("Jwt");

        var secret = settings["Secret"]
            ?? throw new InvalidOperationException(
                "A chave de assinatura do JWT não está configurada (Jwt:Secret).");

        var expiresAt = DateTime.UtcNow.AddHours(
            settings.GetValue("ExpirationHours", 8));

        // Claims mínimas para identificar o usuário nas requisições seguintes.
        // A senha e o hash nunca entram no token: ele é apenas assinado, não cifrado.
        Claim[] claims =
        [
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.Name),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        ];

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: settings["Issuer"],
            audience: settings["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
