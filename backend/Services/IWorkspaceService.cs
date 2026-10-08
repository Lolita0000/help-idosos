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
    /// Cria um novo workspace, vinculando o criador como administrador (RN-001).
    /// </summary>
    /// <param name="request">Nome, sujeito acompanhado e descrição opcional.</param>
    /// <param name="creatorUserId">Usuário autenticado que será o administrador.</param>
    Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request, int creatorUserId);

    /// <summary>
    /// Atualiza os dados de um workspace existente. Todos os campos são opcionais.
    /// </summary>
    Task<WorkspaceResponse?> UpdateAsync(int id, UpdateWorkspaceRequest request);

    /// <summary>
    /// Deleta um workspace pelo ID.
    /// </summary>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Indica se o usuário participa do workspace informado.
    /// </summary>
    Task<bool> IsMemberAsync(int workspaceId, int userId);
}