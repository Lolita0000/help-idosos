using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EloDeCuidado.Models;

public sealed class InviteCode
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkspaceId { get; set; }

    [ForeignKey(nameof(WorkspaceId))]
    public Workspace Workspace { get; set; } = null!;

    [Required, MaxLength(64)]
    public required string Code { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
