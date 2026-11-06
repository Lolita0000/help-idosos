namespace EloDeCuidado.Services;

/// <summary>
/// Resultado de uma alteração na equipe de um workspace.
/// </summary>
public enum MemberChangeStatus
{
    /// <summary>Alteração feita.</summary>
    Ok,

    /// <summary>O solicitante não administra o workspace, ou ele não existe.</summary>
    Forbidden,

    /// <summary>A pessoa alvo não participa do workspace.</summary>
    TargetNotFound,

    /// <summary>A regra de negócio recusa a alteração; a mensagem explica o motivo.</summary>
    Refused,
}

/// <param name="Status">Desfecho da operação.</param>
/// <param name="Message">Explicação para o usuário quando o desfecho é <see cref="MemberChangeStatus.Refused"/>.</param>
public sealed record MemberChangeResult(MemberChangeStatus Status, string? Message = null);

/// <summary>
/// Gestão da equipe de um workspace pelo administrador (RN-001, RN-010).
/// </summary>
public interface IWorkspaceMemberService
{
    /// <summary>
    /// Remove um participante comum do workspace. A conta dele e as entradas que
    /// ele registrou permanecem; ele só perde o acesso.
    /// </summary>
    /// <remarks>
    /// Recusa remover o próprio administrador, que precisa passar a administração
    /// antes, para o workspace nunca ficar sem administrador (RN-012).
    /// </remarks>
    Task<MemberChangeResult> RemoveAsync(int workspaceId, int targetUserId, int requesterId);

    /// <summary>
    /// Passa a administração para outro participante: ele vira administrador e
    /// quem passou vira membro comum, na mesma transação.
    /// </summary>
    Task<MemberChangeResult> TransferAdminAsync(int workspaceId, int targetUserId, int requesterId);
}
