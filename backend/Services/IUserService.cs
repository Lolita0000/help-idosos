using EloDeCuidado.DTOs;

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
}