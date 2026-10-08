using EloDeCuidado.Models;

namespace EloDeCuidado.Services;

/// <summary>
/// Contrato para emissão de tokens de autenticação.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Emite um token JWT para o usuário informado.
    /// </summary>
    /// <param name="user">O usuário autenticado.</param>
    /// <returns>O token assinado e o seu momento de expiração, em UTC.</returns>
    (string Token, DateTime ExpiresAt) Generate(User user);
}
