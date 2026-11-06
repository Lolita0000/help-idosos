using System.ComponentModel.DataAnnotations;

namespace EloDeCuidado.Models;

public sealed class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(256)]
    public required string Name { get; set; }

    // Jay: Número máximo de caracteres permitidos em um e-mail válido. Pelo amor de deus não deixa chegar perto desse número.
    [Required, MaxLength(254)]
    public required string Email { get; set; }

    [Required, MaxLength(500)]
    public required string PasswordHash { get; set; }

    /// <summary>Somente dígitos, com DDD (10 ou 11). Opcional.</summary>
    [MaxLength(11)]
    public string? Phone { get; set; }

    public DateOnly? BirthDate { get; set; }

    /// <summary>Um dos valores de <c>ProfileRules.Genders</c>. Opcional.</summary>
    [MaxLength(30)]
    public string? Gender { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<WorkspaceMember> Memberships { get; set; } = [];
}
