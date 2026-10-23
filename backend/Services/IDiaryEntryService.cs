using EloDeCuidado.DTOs.DiaryEntries;

namespace EloDeCuidado.Services;

/// <summary>
/// Contrato das operações sobre entradas do diário (HU-04, HU-06, HU-07).
/// </summary>
public interface IDiaryEntryService
{
    /// <summary>
    /// Lista as entradas de um workspace, da mais recente para a mais antiga.
    /// </summary>
    /// <param name="workspaceId">Workspace consultado.</param>
    /// <param name="requesterId">Usuário autenticado, que precisa participar dele.</param>
    Task<IReadOnlyList<DiaryEntryResponse>?> GetByWorkspaceAsync(int workspaceId, int requesterId);

    /// <summary>
    /// Retorna uma entrada pelo ID, se o solicitante participar do workspace dela.
    /// </summary>
    Task<DiaryEntryResult> GetByIdAsync(int id, int requesterId);

    /// <summary>
    /// Registra uma entrada. A autoria e o momento vêm do servidor (RN-008).
    /// </summary>
    Task<DiaryEntryResult> CreateAsync(CreateDiaryEntryRequest request, int authorId);

    /// <summary>
    /// Altera uma entrada existente. Apenas o autor pode alterar (RN-008).
    /// </summary>
    Task<DiaryEntryResult> UpdateAsync(int id, UpdateDiaryEntryRequest request, int requesterId);

    /// <summary>
    /// Remove uma entrada do banco de forma definitiva (RN-006).
    /// </summary>
    Task<DiaryEntryResult> DeleteAsync(int id, int requesterId);
}
