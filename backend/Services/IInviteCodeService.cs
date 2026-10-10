using EloDeCuidado.DTOs.InviteCode;

namespace EloDeCuidado.Services;

/// <summary>
/// Contrato para operações CRUD da entidade InviteCode.
/// </summary>
public interface IInviteCodeService
{
    /// <summary>
    /// Retorna um código de convite pelo ID.
    /// </summary>
    Task<InviteCodeResponse?> GetByIdAsync(int id);

    /// <summary>
    /// Cria um novo código de convite para um workspace.
    /// </summary>
    /// <returns>
    /// O código criado, ou <c>null</c> se o workspace informado não existir.
    /// </returns>
    Task<InviteCodeResponse?> CreateAsync(CreateInviteCodeRequest request);

    /// <summary>
    /// Exclui um código de convite pelo ID.
    /// </summary>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Lista os códigos de um workspace, do mais recente para o mais antigo,
    /// incluindo os expirados (a tela de convites mostra os dois estados).
    /// </summary>
    Task<IReadOnlyList<InviteCodeResponse>> GetByWorkspaceAsync(int workspaceId);

    /// <summary>
    /// Vincula o usuário ao workspace do código como membro com papel padrão (HU-03, RN-004, RN-005).
    /// </summary>
    Task<JoinResult> JoinAsync(string? code, int userId);

    /// <summary>
    /// Indica se o usuário é administrador do workspace. Só o administrador gera,
    /// lista e remove códigos de convite (RN-001).
    /// </summary>
    Task<bool> IsAdminAsync(int workspaceId, int userId);

    /// <summary>
    /// Retorna o workspace ao qual o código pertence, ou <c>null</c> se o código não existir.
    /// </summary>
    Task<int?> GetWorkspaceIdAsync(int inviteCodeId);
}
