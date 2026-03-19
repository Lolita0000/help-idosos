using System.ComponentModel.DataAnnotations;

namespace EloDeCuidado.Models;

public sealed class User
{
    [Key]
    public int Id { get; set; }

    // Jay: Número máximo de caracteres permitidos em um e-mail válido. Pelo amor de deus não deixa chegar perto desse número.
    [Required, MaxLength(254)]
    public required string Email { get; set; }

    [Required, MaxLength(500)]
    public required string PasswordHash { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<WorkspaceMember> Memberships { get; set; } = [];
}
