using System.ComponentModel.DataAnnotations;

namespace EloDeCuidado.Models;

public sealed class Workspace
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Name { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<WorkspaceMember> Members { get; set; } = [];
    public ICollection<InviteCode> InviteCodes { get; set; } = [];
    public ICollection<DiaryEntry> DiaryEntries { get; set; } = [];
}
