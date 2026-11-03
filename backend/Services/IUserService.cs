using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Models;

namespace EloDeCuidado.Services;

/// <summary>
/// Contrato para operações CRUD da entidade User.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Retorna um usuário pelo ID.
    /// </summary>
    Task<UserResponse?> GetByIdAsync(int id);

    /// <summary>
    /// Cria um novo usuário.
    /// </summary>
    Task<UserResponse> CreateAsync(CreateUserRequest request);

    /// <summary>
    /// Atualiza os dados de um usuário existente. Todos os campos são opcionais.
    /// </summary>
    Task<UserResponse?> UpdateAsync(int id, UpdateUserRequest request);

    /// <summary>
    /// Deleta um usuário pelo ID.
    /// </summary>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Exclui a conta e os dados pessoais do titular, de forma irreversível
    /// (HU-05, RN-011).
    /// </summary>
    /// <remarks>
    /// As entradas do diário e os registros de auditoria permanecem, com a
    /// autoria anonimizada (RN-014): o conteúdo pertence ao histórico de saúde
    /// de outra pessoa, que não pediu exclusão.
    ///
    /// Recusa quando o titular administra workspace que ainda tem outros
    /// participantes (RN-012), para o espaço não ficar sem administrador.
    /// </remarks>
    Task<DeleteAccountResult> DeleteAccountAsync(int id);

    /// <summary>
    /// Busca a entidade de usuário pelo e-mail. Usado na autenticação, por
    /// retornar o hash da senha, que não é exposto no <see cref="UserResponse"/>.
    /// </summary>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Indica se já existe um usuário cadastrado com o e-mail informado.
    /// </summary>
    Task<bool> EmailExistsAsync(string email);
}
