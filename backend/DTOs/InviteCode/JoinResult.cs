namespace EloDeCuidado.DTOs.InviteCode;

/// <summary>
/// Resultado do ingresso por código. Cada falha corresponde a um cenário da HU-03.
/// </summary>
public enum JoinStatus
{
    /// <summary>Usuário vinculado como membro com papel padrão (cenário 1).</summary>
    Joined,

    /// <summary>Código em branco (cenário 5).</summary>
    Empty,

    /// <summary>Código inexistente (cenário 3).</summary>
    NotFound,

    /// <summary>Código com mais de 24 horas (cenário 2, RN-005).</summary>
    Expired,

    /// <summary>Usuário já participa do workspace (cenário 4).</summary>
    AlreadyMember,
}

/// <summary>Status do ingresso e, quando houver, o workspace ao qual o código pertence.</summary>
public sealed record JoinResult(JoinStatus Status, int? WorkspaceId = null);
