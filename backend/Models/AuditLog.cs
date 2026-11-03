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

    /// <summary>
    /// Responsável pela ação registrada (RN-010).
    /// </summary>
    /// <remarks>
    /// Fica nulo quando o responsável exerce o direito de eliminação (HU-05).
    /// A trilha preserva o que foi feito e quando, perdendo apenas a
    /// identificação de quem fez. É o ponto de atrito entre reter para auditar
    /// e eliminar a pedido do titular, tratado na política de dados (#61).
    /// </remarks>
    public int? UserId { get; set; }

    /// <inheritdoc cref="UserId" />
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required, MaxLength(100)]
    public required string Action { get; set; }

    [Required, MaxLength(100)]
    public required string Entity { get; set; }

    [Required]
    public int EntityId { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
