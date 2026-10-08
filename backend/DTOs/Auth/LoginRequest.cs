namespace EloDeCuidado.DTOs.Auth;

/// <summary>
/// Credenciais informadas no login.
/// </summary>
/// <param name="Email">E-mail cadastrado.</param>
/// <param name="Password">Senha em texto puro, verificada contra o hash armazenado.</param>
public sealed record LoginRequest(string Email, string Password);
