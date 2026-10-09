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
}
