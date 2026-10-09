namespace EloDeCuidado.DTOs;

/// <summary>
/// Dados de um workspace de cuidado.
/// </summary>
/// <param name="Id">Identificador do workspace.</param>
/// <param name="Name">Nome do espaço.</param>
/// <param name="Description">Objetivo do espaço, quando informado.</param>
/// <param name="SubjectName">Nome da pessoa acompanhada.</param>
/// <param name="CreatedBy">Nome de quem criou o workspace.</param>
/// <param name="MemberCount">Quantidade de membros.</param>
/// <param name="CreatedAt">Momento da criação.</param>
public sealed record WorkspaceResponse(
    int Id,
    string Name,
    string? Description,
    string SubjectName,
    string CreatedBy,
    int MemberCount,
    DateTime CreatedAt
);
