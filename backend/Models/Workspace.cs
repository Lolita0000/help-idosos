using System.ComponentModel.DataAnnotations;

namespace EloDeCuidado.Models;

public sealed class Workspace
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Objetivo do espaço de cuidado. Opcional.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Nome da pessoa acompanhada neste workspace.
    /// </summary>
    /// <remarks>
    /// Guardado como texto porque o sujeito não é, necessariamente, um usuário
    /// do sistema: ele não recebe convite automático na criação do workspace.
    /// Caso venha a ingressar mais tarde por código de convite, o vínculo é
    /// representado por um <see cref="WorkspaceMember"/> com <c>IsSubject</c>.
    /// </remarks>
    [Required, MaxLength(100)]
    public required string SubjectName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<WorkspaceMember> Members { get; set; } = [];
    public ICollection<InviteCode> InviteCodes { get; set; } = [];
    public ICollection<DiaryEntry> DiaryEntries { get; set; } = [];
}
