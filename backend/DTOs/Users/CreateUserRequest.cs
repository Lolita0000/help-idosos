using System.ComponentModel.DataAnnotations;

namespace EloDeCuidado.DTOs.Users;

/// <summary>Dados necessários para criar um novo usuário.</summary>
public sealed record CreateUserRequest(
    [Required, MinLength(1), MaxLength(256)] string Name,
    [Required, EmailAddress, MaxLength(254)] string Email,
    [Required, MinLength(6), MaxLength(500)] string Password
);