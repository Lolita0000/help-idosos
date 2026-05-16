namespace EloDeCuidado.DTOs.InviteCode;

/// <summary>
/// DTO de resposta para a entidade InviteCode.
/// </summary>
public sealed record InviteCodeResponse(
    int Id,
    string Code,
    DateTime ExpiresAt,
    DateTime CreatedAt
);
