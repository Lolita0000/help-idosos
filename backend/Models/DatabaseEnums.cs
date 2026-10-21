namespace EloDeCuidado.Models;

/// <summary>
/// Categoria de uma entrada do diário, escolhida por quem registra.
/// </summary>
public enum EntryLabel
{
    /// <summary>Medicamento administrado ou prescrito.</summary>
    Medication,

    /// <summary>Estado de humor. Nesta categoria a entrada aceita uma escala de 1 a 5.</summary>
    Mood,

    /// <summary>Sintoma observado.</summary>
    Symptom,

    /// <summary>Consulta ou exame.</summary>
    Appointment,

    /// <summary>Observação geral.</summary>
    Note,

    /// <summary>Qualquer registro que não se encaixe nas demais categorias.</summary>
    Other,
}

/// <summary>
/// Situação de uma entrada do diário.
/// </summary>
/// <remarks>
/// Não existe estado de excluída: pela RN-006 a exclusão é física e o registro sai
/// do banco, sem recuperação. O vestígio da remoção fica no AuditLog (#28, #58).
/// </remarks>
public enum EntryStatus
{
    /// <summary>Entrada como foi registrada, sem alterações.</summary>
    Active,

    /// <summary>Entrada alterada pelo autor depois de registrada.</summary>
    Edited,
}

public enum MemberRole
{
    Admin,
    Member,
}
