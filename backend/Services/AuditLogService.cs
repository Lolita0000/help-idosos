using EloDeCuidado.Data;
using EloDeCuidado.DTOs.AuditLogs;
using EloDeCuidado.Models;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Services;

/// <summary>
/// Trilha de auditoria das ações sensíveis (RN-010, RNF-006).
/// </summary>
/// <param name="db">O contexto de banco de dados.</param>
public sealed class AuditLogService(AppDbContext db) : IAuditLogService
{
    /// <inheritdoc />
    public void Record(
        int workspaceId, int userId, AuditAction action, AuditEntity entity, int entityId) =>
        db.AuditLogs.Add(Build(workspaceId, userId, action, entity, entityId));

    /// <inheritdoc />
    public async Task<AuditLogResponse> CreateAsync(
        int workspaceId, int userId, AuditAction action, AuditEntity entity, int entityId)
    {
        var log = Build(workspaceId, userId, action, entity, entityId);

        db.AuditLogs.Add(log);
        await db.SaveChangesAsync();

        return ToResponse(log);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<AuditLogResponse>> GetByWorkspaceAsync(int workspaceId)
    {
        var logs = await db.AuditLogs
            .Where(l => l.WorkspaceId == workspaceId)
            .OrderByDescending(l => l.Timestamp)
            .ThenByDescending(l => l.Id)
            .ToListAsync();

        return logs.Select(ToResponse).ToList();
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(int id)
    {
        var log = await db.AuditLogs.FindAsync(id);

        if (log is null)
            return false;

        db.AuditLogs.Remove(log);
        await db.SaveChangesAsync();

        return true;
    }

    private static AuditLog Build(
        int workspaceId, int userId, AuditAction action, AuditEntity entity, int entityId) =>
        new()
        {
            WorkspaceId = workspaceId,
            // Quem respondeu pela ação, não quem foi afetado por ela (RN-010).
            UserId = userId,
            Action = NameOf(action),
            Entity = NameOf(entity),
            EntityId = entityId,
            // Relógio do servidor: horário informado pelo cliente não serve de
            // prova, porque é justamente o que um responsável tentaria alterar.
            Timestamp = DateTime.UtcNow,
        };

    /// <summary>
    /// Nome gravado no banco. O mapeamento é explícito para que renomear um
    /// valor do enum em C# não altere, em silêncio, o que já está gravado na
    /// trilha de auditoria.
    /// </summary>
    internal static string NameOf(AuditAction action) => action switch
    {
        AuditAction.DiaryEntryUpdated => "diary_entry.updated",
        AuditAction.DiaryEntryDeleted => "diary_entry.deleted",
        _ => throw new ArgumentOutOfRangeException(nameof(action), action, "Ação de auditoria sem nome definido."),
    };

    /// <inheritdoc cref="NameOf(AuditAction)" />
    internal static string NameOf(AuditEntity entity) => entity switch
    {
        AuditEntity.DiaryEntry => "diary_entry",
        _ => throw new ArgumentOutOfRangeException(nameof(entity), entity, "Entidade de auditoria sem nome definido."),
    };

    private static AuditLogResponse ToResponse(AuditLog log) =>
        new(log.Id, log.WorkspaceId, log.UserId, log.Action, log.Entity, log.EntityId, log.Timestamp);
}
