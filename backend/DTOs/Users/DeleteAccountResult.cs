namespace EloDeCuidado.DTOs.Users;

/// <summary>
/// Desfecho do pedido de exclusão de conta (HU-05).
/// </summary>
public enum DeleteAccountStatus
{
    /// <summary>Conta e dados pessoais removidos.</summary>
    Deleted,

    /// <summary>A conta informada não existe.</summary>
    NotFound,

    /// <summary>
    /// A pessoa administra um workspace que ainda tem outros participantes
    /// ativos (RN-012).
    /// </summary>
    AdminHasMembers,
}

/// <summary>
/// Resultado da exclusão, com os workspaces que impedem a operação quando for
/// o caso.
/// </summary>
/// <param name="Status">Desfecho do pedido.</param>
/// <param name="BlockingWorkspaces">
/// Nomes dos workspaces que a pessoa administra e que ainda têm outros membros.
/// Serve para a tela dizer o que precisa ser resolvido, em vez de apenas recusar.
/// </param>
public sealed record DeleteAccountResult(
    DeleteAccountStatus Status,
    IReadOnlyList<string>? BlockingWorkspaces = null
);
