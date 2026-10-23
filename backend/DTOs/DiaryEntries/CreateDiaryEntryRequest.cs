namespace EloDeCuidado.DTOs.DiaryEntries;

/// <summary>
/// Dados para registrar uma entrada no diário (HU-04).
/// </summary>
/// <remarks>
/// A autoria e o momento do registro não entram aqui: são definidos pelo servidor
/// a partir do token, porque a autoria decide quem pode editar depois (RN-008).
/// </remarks>
/// <param name="WorkspaceId">Workspace em que a entrada será registrada.</param>
/// <param name="Title">Título da entrada. Obrigatório.</param>
/// <param name="Content">Descrição da observação. Obrigatório.</param>
/// <param name="Label">
/// Categoria, aceita em qualquer caixa: <c>medication</c>, <c>mood</c>,
/// <c>symptom</c>, <c>appointment</c>, <c>note</c> ou <c>other</c>.
/// </param>
/// <param name="MoodLevel">
/// Escala de humor de 1 a 5. Só é aceita quando a categoria é <c>mood</c>.
/// </param>
public sealed record CreateDiaryEntryRequest(
    int WorkspaceId,
    string? Title,
    string? Content,
    string? Label,
    int? MoodLevel
);
