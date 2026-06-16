using EloDeCuidado.Data;
using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.Models;
using EloDeCuidado.Services.Helpers;

namespace EloDeCuidado.Services;

/// <summary>
/// Serviço responsável pelas operações CRUD da entidade InviteCode.
/// </summary>
/// <param name="db">O contexto de banco de dados.</param>
public sealed class InviteCodeService(AppDbContext db) : IInviteCodeService
{
    /// <summary>
    /// Obtém um código de convite pelo seu ID.
    /// </summary>
    /// <param name="id">O ID do código de convite a ser buscado.</param>
    /// <returns>O código de convite encontrado ou null se não for encontrado.</returns>
    public async Task<InviteCodeResponse?> GetByIdAsync(int id)
    {
        var inviteCode = await db.InviteCodes.FindAsync(id);
        return inviteCode is null ? null : ToResponse.InviteCode(inviteCode);
    }

    /// <summary>
    /// Cria um novo código de convite com base nos dados fornecidos na requisição.
    /// </summary>
    /// <param name="request">Os dados necessários para criar um novo código de convite.</param>
    /// <returns>O código de convite criado.</returns>
    public async Task<InviteCodeResponse> CreateAsync(CreateInviteCodeRequest request)
    {
        var inviteCode = new InviteCode
        {
            WorkspaceId = request.WorkspaceId,
            Code = UniqueCodeGenerator.Generate(8),
            ExpiresAt = request.ExpiresAt ?? DateTime.UtcNow.AddDays(7),
        };

        db.InviteCodes.Add(inviteCode);
        await db.SaveChangesAsync();

        return ToResponse.InviteCode(inviteCode);
    }

    /// <summary>
    /// Não será implementado nessa TW.
    /// Exclui um código de convite pelo seu ID. Retorna os detalhes do código de convite excluído.
    /// </summary>
    /// <param name="id">O ID do código de convite a ser excluído.</param>
    /// <returns>true se a exclusão foi bem-sucedida, false se o código de convite não foi encontrado.</returns>
    public async Task<bool> DeleteAsync(int id)
    {
        var inviteCode = await db.InviteCodes.FindAsync(id);
        if (inviteCode is null)
            return false;

        db.InviteCodes.Remove(inviteCode);
        await db.SaveChangesAsync();
        return true;
    }
}
