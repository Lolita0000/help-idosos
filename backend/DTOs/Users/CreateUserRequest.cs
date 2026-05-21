namespace EloDeCuidado.DTOs.Users;

// todo: adicionar documentação xml
public sealed record CreateUserRequest(string Name, string Email, string Password);
