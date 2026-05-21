namespace EloDeCuidado.DTOs.Users;

// todo: adicionar documentação xml
public sealed record UserResponse(int Id, string Name, string Email, DateTime CreatedAt);
