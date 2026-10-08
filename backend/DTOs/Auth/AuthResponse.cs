using EloDeCuidado.DTOs.Users;

namespace EloDeCuidado.DTOs.Auth;

/// <summary>
/// Resposta de uma autenticação bem-sucedida.
/// </summary>
/// <param name="Token">Token JWT a ser enviado no cabeçalho <c>Authorization: Bearer</c>.</param>
/// <param name="ExpiresAt">Momento de expiração do token, em UTC.</param>
/// <param name="User">Dados públicos do usuário autenticado.</param>
public sealed record AuthResponse(string Token, DateTime ExpiresAt, UserResponse User);
