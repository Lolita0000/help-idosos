namespace EloDeCuidado.DTOs;

public sealed record CreateUserRequest(string Name, string Email, string Password);