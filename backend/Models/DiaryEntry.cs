using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EloDeCuidado.Models;

public sealed class DiaryEntry
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkspaceId { get; set; }

    [ForeignKey(nameof(WorkspaceId))]
    public Workspace Workspace { get; set; } = null!;

    [Required]
    public int AuthorId { get; set; }

    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; } = null!;

    [Required, MaxLength(10000)]
    public required string Content { get; set; }

    [Required]
    public EntryLabel Label { get; set; }

    [Required]
    public EntryStatus Status { get; set; } = EntryStatus.Active;

    public DateTime? EditedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
