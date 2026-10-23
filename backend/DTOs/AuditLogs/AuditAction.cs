namespace EloDeCuidado.DTOs.AuditLogs;

/// <summary>
/// Ações sensíveis que a RN-010 exige registrar em AuditLog.
/// </summary>
/// <remarks>
/// A RN-010 lista edição e exclusão de registros, remoção de membros,
/// transferência de administração e redefinição de senha. Apenas as duas
/// primeiras pertencem à v0.2; as demais entram quando as funcionalidades
/// existirem, e por isso ainda não constam aqui.
///
/// O enum existe para que o nome da ação não seja digitado solto em cada
/// chamada: um erro de grafia passaria despercebido e só apareceria na
/// auditoria, que é justamente onde não se pode confiar em aproximação.
/// </remarks>
public enum AuditAction
{
    /// <summary>Entrada do diário alterada pelo autor (RN-008).</summary>
    DiaryEntryUpdated,

    /// <summary>Entrada do diário removida em definitivo (RN-006, RN-007).</summary>
    DiaryEntryDeleted,
}

/// <summary>
/// Entidades que podem ser alvo de uma ação auditada.
/// </summary>
public enum AuditEntity
{
    /// <summary>Entrada do diário de cuidado.</summary>
    DiaryEntry,
}
