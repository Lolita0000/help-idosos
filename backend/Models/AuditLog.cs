using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EloDeCuidado.Models;

public sealed class AuditLog
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkspaceId { get; set; }

    [ForeignKey(nameof(WorkspaceId))]
    public Workspace Workspace { get; set; } = null!;

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required, MaxLength(100)]
    public required string Action { get; set; }

    [Required, MaxLength(100)]
    public required string Entity { get; set; }

    [Required]
    public int EntityId { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
