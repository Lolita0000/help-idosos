namespace EloDeCuidado.DTOs;

/// <summary>
/// Dados para criação de um workspace de cuidado.
/// </summary>
/// <param name="Name">Nome do espaço. Ex: "Cuidados com a vovó Joana".</param>
/// <param name="SubjectName">Nome da pessoa acompanhada. Ex: "Joana Pereira".</param>
/// <param name="Description">Objetivo do espaço. Opcional.</param>
public sealed record CreateWorkspaceRequest(
    string Name,
    string SubjectName,
    string? Description
);
