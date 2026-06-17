using EloDeCuidado.DTOs;

namespace EloDeCuidado.Services;

/// <summary>
/// Contrato para operações CRUD da entidade Workspace.
/// </summary>
public interface IWorkspaceService
{
    /// <summary>
    /// Retorna um workspace pelo ID.
    /// </summary>
    Task<WorkspaceResponse?> GetByIdAsync(int id);

    /// <summary>
    /// Cria um novo workspace.
    /// </summary>
    Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request);

    /// <summary>
    /// Atualiza os dados de um workspace existente. Todos os campos são opcionais.
    /// </summary>
    Task<WorkspaceResponse?> UpdateAsync(int id, UpdateWorkspaceRequest request);

    /// <summary>
    /// Deleta um workspace pelo ID.
    /// </summary>
    Task<bool> DeleteAsync(int id);
}