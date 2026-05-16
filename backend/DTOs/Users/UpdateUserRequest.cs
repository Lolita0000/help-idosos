namespace EloDeCuidado.DTOs.Users;

// todo: adicionar documentação xml
public sealed record UpdateUserRequest(string? Name, string? Email, string? Password);
