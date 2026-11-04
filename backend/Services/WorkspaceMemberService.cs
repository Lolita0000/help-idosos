using EloDeCuidado.Data;
using EloDeCuidado.DTOs.AuditLogs;
using EloDeCuidado.Models;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Services;

/// <summary>
/// Remoção de membros e transferência de administração (RN-001, RN-010, RN-012).
/// </summary>
/// <param name="db">O contexto de banco de dados.</param>
/// <param name="auditLog">
/// Trilha de auditoria. O registro é enfileirado com <c>Record</c> e gravado pelo
/// mesmo <c>SaveChanges</c> da operação, então ação e rastro entram juntos (RNF-006).
/// </param>
public sealed class WorkspaceMemberService(AppDbContext db, IAuditLogService auditLog) : IWorkspaceMemberService
{
    private static readonly MemberChangeResult Forbidden = new(MemberChangeStatus.Forbidden);
    private static readonly MemberChangeResult TargetNotFound = new(MemberChangeStatus.TargetNotFound);
    private static readonly MemberChangeResult Done = new(MemberChangeStatus.Ok);

    private static MemberChangeResult Refused(string message) => new(MemberChangeStatus.Refused, message);

    /// <inheritdoc />
    public async Task<MemberChangeResult> RemoveAsync(int workspaceId, int targetUserId, int requesterId)
    {
        var team = await db.WorkspaceMembers.Where(m => m.WorkspaceId == workspaceId).ToListAsync();

        // A mesma resposta para workspace inexistente, alheio ou sem permissão,
        // para não revelar quais ids existem (RNF-002).
        if (team.FirstOrDefault(m => m.UserId == requesterId) is not { Role: MemberRole.Admin })
            return Forbidden;

        if (targetUserId == requesterId)
            return Refused("Você é o administrador deste workspace e não pode se remover. Passe a administração para outra pessoa primeiro.");

        var target = team.FirstOrDefault(m => m.UserId == targetUserId);

        if (target is null)
            return TargetNotFound;

        if (target.Role == MemberRole.Admin)
            return Refused("Um administrador não pode ser removido. Passe a administração antes.");

        db.WorkspaceMembers.Remove(target);
        auditLog.Record(workspaceId, requesterId, AuditAction.MemberRemoved, AuditEntity.WorkspaceMember, targetUserId);
        await db.SaveChangesAsync();

        return Done;
    }

    /// <inheritdoc />
    public async Task<MemberChangeResult> TransferAdminAsync(int workspaceId, int targetUserId, int requesterId)
    {
        var team = await db.WorkspaceMembers.Where(m => m.WorkspaceId == workspaceId).ToListAsync();

        if (team.FirstOrDefault(m => m.UserId == requesterId) is not { Role: MemberRole.Admin } me)
            return Forbidden;

        if (targetUserId == requesterId)
            return Refused("Você já é o administrador deste workspace.");

        var target = team.FirstOrDefault(m => m.UserId == targetUserId);

        if (target is null)
            return TargetNotFound;

        if (target.Role == MemberRole.Admin)
            return Refused("Essa pessoa já é administradora deste workspace.");

        // Os dois papéis mudam no mesmo SaveChanges: nunca existe um instante em
        // que o workspace fica sem administrador (RN-012).
        target.Role = MemberRole.Admin;
        me.Role = MemberRole.Member;
        auditLog.Record(workspaceId, requesterId, AuditAction.AdminTransferred, AuditEntity.WorkspaceMember, targetUserId);
        await db.SaveChangesAsync();

        return Done;
    }
}
