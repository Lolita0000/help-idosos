namespace EloDeCuidado.DTOs;

/// <summary>
/// Dados para atualização de um workspace. Todos os campos são opcionais.
/// </summary>
/// <param name="Name">Novo nome do espaço.</param>
/// <param name="SubjectName">Novo nome da pessoa acompanhada.</param>
/// <param name="Description">Novo objetivo do espaço.</param>
public sealed record UpdateWorkspaceRequest(
    string? Name,
    string? SubjectName,
    string? Description
);
