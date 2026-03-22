namespace EloDeCuidado.DTOs;

public sealed record CreateUserRequest(string Name, string Email, string Password);

public sealed record UpdateUserRequest(string? Name, string? Email, string? Password);

public sealed record UserResponse(int Id, string Name, string Email, DateTime CreatedAt);
