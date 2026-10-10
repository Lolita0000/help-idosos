namespace EloDeCuidado.DTOs;

/// <summary>
/// Participante de um workspace de cuidado.
/// </summary>
/// <param name="UserId">Identificador do usuário.</param>
/// <param name="Name">Nome do participante.</param>
/// <param name="Email">E-mail do participante.</param>
/// <param name="Role">Papel no workspace: <c>admin</c> ou <c>member</c>.</param>
/// <param name="IsSubject">Indica se é a pessoa acompanhada no workspace.</param>
/// <param name="JoinedAt">Momento em que passou a participar.</param>
public sealed record WorkspaceMemberResponse(
    int UserId,
    string Name,
    string Email,
    string Role,
    bool IsSubject,
    DateTime JoinedAt
);
