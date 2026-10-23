namespace EloDeCuidado.DTOs.DiaryEntries;

/// <summary>
/// Entrada do diário como exposta pela API.
/// </summary>
/// <param name="Id">Identificador da entrada.</param>
/// <param name="WorkspaceId">Workspace a que pertence.</param>
/// <param name="AuthorId">Identificador de quem registrou.</param>
/// <param name="AuthorName">Nome de quem registrou, exibido na listagem.</param>
/// <param name="Title">Título da entrada.</param>
/// <param name="Content">Descrição da observação.</param>
/// <param name="Label">
/// Categoria em minúsculas: <c>medication</c>, <c>mood</c>, <c>symptom</c>,
/// <c>appointment</c>, <c>note</c> ou <c>other</c>.
/// </param>
/// <param name="MoodLevel">Escala de 1 a 5, presente apenas na categoria <c>mood</c>.</param>
/// <param name="Edited">Indica se a entrada foi alterada depois de registrada.</param>
/// <param name="EditedAt">Momento da última alteração, nulo se nunca foi editada.</param>
/// <param name="CreatedAt">Momento do registro.</param>
public sealed record DiaryEntryResponse(
    int Id,
    int WorkspaceId,
    int AuthorId,
    string AuthorName,
    string Title,
    string Content,
    string Label,
    int? MoodLevel,
    bool Edited,
    DateTime? EditedAt,
    DateTime CreatedAt
);
