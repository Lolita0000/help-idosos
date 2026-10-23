namespace EloDeCuidado.DTOs.AuditLogs;

/// <summary>
/// Registro de auditoria como exposto pela aplicação.
/// </summary>
/// <remarks>
/// Não há campo para o conteúdo da entrada afetada, de propósito: a RN-010
/// determina que o AuditLog registre quem fez, o que fez e quando, sem reter o
/// que foi escrito. Guardar o texto faria a exclusão definitiva da RN-006
/// deixar de ser definitiva.
/// </remarks>
/// <param name="Id">Identificador do registro de auditoria.</param>
/// <param name="WorkspaceId">Workspace em que a ação ocorreu.</param>
/// <param name="UserId">Usuário responsável pela ação.</param>
/// <param name="Action">Ação registrada.</param>
/// <param name="Entity">Tipo da entidade afetada.</param>
/// <param name="EntityId">Identificador da entidade afetada.</param>
/// <param name="Timestamp">Momento da ação, pelo relógio do servidor.</param>
public sealed record AuditLogResponse(
    int Id,
    int WorkspaceId,
    int UserId,
    string Action,
    string Entity,
    int EntityId,
    DateTime Timestamp
);
