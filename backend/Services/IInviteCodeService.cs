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
    /// Retorna o workspace ao qual o código pertence, ou <c>null</c> se o código
    /// não existir. Permite decidir a autorização antes de expor o código.
    /// </summary>
    Task<int?> GetWorkspaceIdAsync(int inviteCodeId);

    /// <summary>
    /// Vincula o usuário ao workspace do código informado, como membro com papel
    /// padrão (HU-03, RN-004, RN-005).
    /// </summary>
    /// <param name="code">
    /// Código como o usuário digitou. Hífen, espaços e minúsculas são aceitos.
    /// </param>
    /// <param name="userId">Usuário autenticado que está ingressando.</param>
    Task<JoinResult> JoinAsync(string? code, int userId);
}
