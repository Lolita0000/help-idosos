using EloDeCuidado.DTOs.AuditLogs;

namespace EloDeCuidado.Services;

/// <summary>
/// Trilha de auditoria das ações sensíveis (RN-010, RNF-006).
/// </summary>
/// <remarks>
/// Não existe operação de alteração, e isso é deliberado: um registro de
/// auditoria que pode ser editado não prova nada. O contrato só permite criar,
/// consultar e remover.
///
/// Este serviço não tem controller. Ele é injetado nos serviços que executam
/// ações sensíveis, para o registro nascer junto da operação.
/// </remarks>
public interface IAuditLogService
{
    /// <summary>
    /// Enfileira um registro de auditoria no contexto, <b>sem gravar</b>.
    /// </summary>
    /// <remarks>
    /// É a forma de usar dentro de outra operação. Como a gravação fica por
    /// conta do <c>SaveChanges</c> de quem chamou, o registro e a operação
    /// auditada entram na mesma transação: ou os dois acontecem, ou nenhum.
    /// A RNF-006 exige exatamente isso, e gravar em seguida, por fora, deixaria
    /// a brecha de a operação ocorrer sem rastro se a segunda gravação falhasse.
    /// </remarks>
    void Record(int workspaceId, int userId, AuditAction action, AuditEntity entity, int entityId);

    /// <summary>
    /// Cria e grava um registro de auditoria isolado, fora de outra operação.
    /// </summary>
    Task<AuditLogResponse> CreateAsync(
        int workspaceId, int userId, AuditAction action, AuditEntity entity, int entityId);

    /// <summary>
    /// Lista os registros de um workspace, do mais recente para o mais antigo.
    /// </summary>
    Task<IReadOnlyList<AuditLogResponse>> GetByWorkspaceAsync(int workspaceId);

    /// <summary>
    /// Remove um registro de auditoria.
    /// </summary>
    /// <remarks>
    /// Existe para atender ao direito de eliminação da LGPD (HU-05, #63), não
    /// para uso corriqueiro: apagar trilha de auditoria à vontade anularia a
    /// própria auditoria. O conflito entre reter para auditar e eliminar a
    /// pedido do titular é o objeto da política de ciclo de vida dos dados (#61).
    /// </remarks>
    Task<bool> DeleteAsync(int id);
}
