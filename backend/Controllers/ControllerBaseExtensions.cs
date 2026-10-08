using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Métodos de apoio para controllers que dependem do usuário autenticado.
/// </summary>
public static class ControllerBaseExtensions
{
    /// <summary>
    /// Obtém o ID do usuário autenticado a partir da claim <c>sub</c> do token.
    /// </summary>
    /// <param name="controller">O controller em execução.</param>
    /// <returns>O ID do usuário, ou <c>null</c> se não houver token válido.</returns>
    public static int? GetAuthenticatedUserId(this ControllerBase controller)
    {
        // O middleware de autenticação mapeia 'sub' para NameIdentifier; a
        // primeira busca cobre o caso em que esse mapeamento está desativado.
        var claim = controller.User.FindFirst(JwtRegisteredClaimNames.Sub)
            ?? controller.User.FindFirst(ClaimTypes.NameIdentifier);

        return int.TryParse(claim?.Value, out var id) ? id : null;
    }
}
