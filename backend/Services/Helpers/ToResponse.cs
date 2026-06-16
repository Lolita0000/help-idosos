using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Models;

namespace EloDeCuidado.Services.Helpers;

/// <summary>
/// Classe estática que contém métodos de extensão para converter entidades do banco de dados em objetos de resposta (DTOs).
/// </summary>
public static class ToResponse
{
    /// <summary>
    /// Converte um objeto User em um UserResponse
    /// </summary>
    /// <param name="user">O objeto User a ser convertido</param>
    /// <returns>Um objeto UserResponse contendo os dados do usuário</returns>
    public static UserResponse User(User user) =>
        new(user.Id, user.Name, user.Email, user.CreatedAt);

    /// <summary>
    /// Converte um objeto InviteCode em um InviteCodeResponse
    /// </summary>
    /// <param name="inviteCode">O objeto InviteCode a ser convertido</param>
    /// <returns>Um objeto InviteCodeResponse contendo os dados do código de convite</returns>
    public static InviteCodeResponse InviteCode(InviteCode inviteCode) =>
        new(inviteCode.Id, inviteCode.Code, inviteCode.ExpiresAt, inviteCode.CreatedAt);
}
