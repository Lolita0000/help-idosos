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

    /// <summary>
    /// Convite destinado à pessoa acompanhada (HU-11, RN-002). Quem entra com ele
    /// já passa a ser a pessoa acompanhada do workspace, sem o administrador ter
    /// de marcar depois, e o código deixa de valer logo em seguida: um convite
    /// desses é de uma pessoa só, para outra não tomar o lugar dela.
    /// </summary>
    public bool ForSubject { get; set; }
}
