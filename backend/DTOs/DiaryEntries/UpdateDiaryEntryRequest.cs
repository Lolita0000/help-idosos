namespace EloDeCuidado.DTOs.DiaryEntries;

/// <summary>
/// Dados para alterar uma entrada do diário (HU-06). Todos os campos são
/// opcionais: o que vier nulo permanece como está.
/// </summary>
/// <param name="Title">Novo título.</param>
/// <param name="Content">Nova descrição.</param>
/// <param name="Label">Nova categoria.</param>
/// <param name="MoodLevel">
/// Nova escala de humor. Só é aceita se a entrada ficar na categoria <c>mood</c>.
/// </param>
public sealed record UpdateDiaryEntryRequest(
    string? Title,
    string? Content,
    string? Label,
    int? MoodLevel
);
