using EloDeCuidado.Data;
using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.Models;
using EloDeCuidado.Services.Helpers;
using Microsoft.EntityFrameworkCore;

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
    /// Prazo máximo de validade de um código de convite, conforme a RN-005.
    /// </summary>
    private static readonly TimeSpan MaximumLifetime = TimeSpan.FromHours(24);

    /// <summary>
    /// Cria um novo código de convite para um workspace.
    /// </summary>
    /// <param name="request">Os dados necessários para criar um novo código de convite.</param>
    /// <returns>
    /// O código de convite criado, ou <c>null</c> se o workspace informado não existir.
    /// </returns>
    public async Task<InviteCodeResponse?> CreateAsync(CreateInviteCodeRequest request)
    {
        // O WorkspaceId é obrigatório no model. Sem esta verificação, um id
        // inexistente só falharia no banco, por violação de chave estrangeira.
        var workspaceExists = await db.Workspaces.AnyAsync(w => w.Id == request.WorkspaceId);

        if (!workspaceExists)
            return null;

        var limit = DateTime.UtcNow.Add(MaximumLifetime);

        // A expiração informada é respeitada, desde que não ultrapasse o teto
        // de 24 horas definido pela RN-005.
        var expiresAt = request.ExpiresAt is { } requested && requested < limit
            ? requested
            : limit;

        var inviteCode = new InviteCode
        {
            WorkspaceId = request.WorkspaceId,
            Code = UniqueCodeGenerator.Generate(8),
            ExpiresAt = expiresAt,
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

    public async Task<IReadOnlyList<InviteCodeResponse>> GetByWorkspaceAsync(int workspaceId)
    {
        var codes = await db.InviteCodes
            .Where(c => c.WorkspaceId == workspaceId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return codes.Select(ToResponse.InviteCode).ToList();
    }

    public async Task<JoinResult> JoinAsync(string? code, int userId)
    {
        var normalized = Normalize(code);

        if (normalized.Length == 0)
            return new JoinResult(JoinStatus.Empty);

        var inviteCode = await db.InviteCodes.FirstOrDefaultAsync(c => c.Code == normalized);

        if (inviteCode is null)
            return new JoinResult(JoinStatus.NotFound);

        // Código expirado não pode ser usado; o administrador precisa gerar outro (RN-005).
        if (inviteCode.ExpiresAt <= DateTime.UtcNow)
            return new JoinResult(JoinStatus.Expired, inviteCode.WorkspaceId);

        var alreadyMember = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == inviteCode.WorkspaceId && m.UserId == userId);

        // O vínculo não é duplicado (HU-03, cenário 4).
        if (alreadyMember)
            return new JoinResult(JoinStatus.AlreadyMember, inviteCode.WorkspaceId);

        // Quem entra por convite é membro comum, qualquer que seja sua relação
        // com o sujeito acompanhado (RN-004).
        db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = inviteCode.WorkspaceId,
            UserId = userId,
            Role = MemberRole.Member,
            IsSubject = false,
        });
        await db.SaveChangesAsync();

        return new JoinResult(JoinStatus.Joined, inviteCode.WorkspaceId);
    }

    public async Task<bool> IsAdminAsync(int workspaceId, int userId) =>
        await db.WorkspaceMembers.AnyAsync(m =>
            m.WorkspaceId == workspaceId && m.UserId == userId && m.Role == MemberRole.Admin);

    public async Task<int?> GetWorkspaceIdAsync(int inviteCodeId) =>
        await db.InviteCodes
            .Where(c => c.Id == inviteCodeId)
            .Select(c => (int?)c.WorkspaceId)
            .FirstOrDefaultAsync();

    /// <summary>
    /// Aceita o código como o usuário digita: com hífen (KHO6-NY67), espaços ou minúsculas.
    /// </summary>
    private static string Normalize(string? code) =>
        new((code ?? string.Empty).Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());
}
