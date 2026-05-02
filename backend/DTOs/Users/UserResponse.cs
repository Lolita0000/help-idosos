namespace EloDeCuidado.DTOs;

public sealed record UserResponse(int Id, string Name, string Email, DateTime CreatedAt);