namespace EloDeCuidado.DTOs.AuditLogs;

/// <summary>
/// Ações sensíveis que a RN-010 exige registrar em AuditLog.
/// </summary>
/// <remarks>
/// A RN-010 lista edição e exclusão de registros, remoção de membros,
/// transferência de administração e redefinição de senha. Edição, exclusão,
/// remoção de membros e transferência de administração já existem; a
/// redefinição de senha entra quando a funcionalidade existir (HU-10).
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

    /// <summary>Participante removido do workspace pelo administrador (RN-010).</summary>
    MemberRemoved,

    /// <summary>Administração do workspace passada a outro participante (RN-010).</summary>
    AdminTransferred,
}

/// <summary>
/// Entidades que podem ser alvo de uma ação auditada.
/// </summary>
public enum AuditEntity
{
    /// <summary>Entrada do diário de cuidado.</summary>
    DiaryEntry,

    /// <summary>Vínculo de um usuário com o workspace; o id registrado é o do usuário afetado.</summary>
    WorkspaceMember,
}
