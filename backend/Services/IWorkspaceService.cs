using EloDeCuidado.DTOs;
using EloDeCuidado.Models;

namespace EloDeCuidado.Services;

/// <summary>
/// Contrato para operações CRUD da entidade Workspace.
/// </summary>
public interface IWorkspaceService
{
    /// <summary>
    /// Retorna um workspace pelo ID.
    /// </summary>
    /// <param name="id">Identificador do workspace.</param>
    /// <param name="viewerUserId">
    /// Usuário que faz a consulta, usado para preencher o papel dele no
    /// workspace. Quando omitido, o papel retorna nulo.
    /// </param>
    Task<WorkspaceResponse?> GetByIdAsync(int id, int? viewerUserId = null);

    /// <summary>
    /// Retorna os workspaces dos quais o usuário participa, do mais recente
    /// para o mais antigo.
    /// </summary>
    /// <param name="userId">Usuário autenticado.</param>
    /// <param name="role">
    /// Quando informado, restringe aos workspaces em que o usuário tem esse
    /// papel. Corresponde às abas Admin e Membro da listagem.
    /// </param>
    Task<IReadOnlyList<WorkspaceResponse>> GetByUserAsync(int userId, MemberRole? role = null);

    /// <summary>
    /// Cria um novo workspace, vinculando o criador como administrador (RN-001).
    /// </summary>
    /// <param name="request">Nome, sujeito acompanhado e descrição opcional.</param>
    /// <param name="creatorUserId">Usuário autenticado que será o administrador.</param>
    Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request, int creatorUserId);

    /// <summary>
    /// Retorna os participantes de um workspace, com administradores primeiro.
    /// </summary>
    /// <returns>
    /// A lista de participantes, ou <c>null</c> se o workspace não existir.
    /// </returns>
    Task<IReadOnlyList<WorkspaceMemberResponse>?> GetMembersAsync(int workspaceId);

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