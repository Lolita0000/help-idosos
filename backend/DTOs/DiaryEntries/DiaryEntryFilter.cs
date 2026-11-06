using EloDeCuidado.Models;

namespace EloDeCuidado.DTOs.DiaryEntries;

/// <summary>
/// Filtros opcionais da listagem do histórico (HU-08). Os critérios se combinam
/// com "e": uma entrada só aparece se atender a todos os informados.
/// </summary>
/// <param name="Label">Mantém só as entradas desta categoria.</param>
/// <param name="AuthorId">Mantém só as entradas registradas por este usuário.</param>
/// <param name="Search">Texto procurado no título ou na descrição, sem diferenciar maiúsculas.</param>
public sealed record DiaryEntryFilter(EntryLabel? Label = null, int? AuthorId = null, string? Search = null)
{
    /// <summary>Tamanho máximo aceito para o texto de busca.</summary>
    public const int SearchMax = 100;
}
