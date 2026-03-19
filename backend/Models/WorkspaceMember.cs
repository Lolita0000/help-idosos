using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EloDeCuidado.Models;

public sealed class WorkspaceMember
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

    [Required]
    public MemberRole Role { get; set; }

    public bool IsSubject { get; set; } = false;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
