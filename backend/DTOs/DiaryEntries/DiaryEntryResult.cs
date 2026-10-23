namespace EloDeCuidado.DTOs.DiaryEntries;

/// <summary>
/// Desfecho de uma operação sobre entrada do diário. Cada valor vira um código
/// HTTP próprio no controller, sem ele precisar inferir nada.
/// </summary>
public enum DiaryEntryStatus
{
    /// <summary>Operação concluída.</summary>
    Ok,

    /// <summary>Campo obrigatório ausente ou valor fora do permitido.</summary>
    Invalid,

    /// <summary>A entrada informada não existe.</summary>
    NotFound,

    /// <summary>O usuário não participa do workspace da entrada (RNF-002).</summary>
    NotMember,

    /// <summary>A operação exige ser o autor da entrada (RN-008).</summary>
    NotAuthor,
}

/// <summary>
/// Resultado de uma operação, com a entrada quando houver e a mensagem de
/// validação quando o desfecho for <see cref="DiaryEntryStatus.Invalid"/>.
/// </summary>
/// <param name="Status">Desfecho da operação.</param>
/// <param name="Entry">Entrada afetada, quando a operação foi concluída.</param>
/// <param name="Error">Motivo da recusa, quando houver.</param>
public sealed record DiaryEntryResult(
    DiaryEntryStatus Status,
    DiaryEntryResponse? Entry = null,
    string? Error = null
);
