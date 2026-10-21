using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EloDeCuidado.Models;

/// <summary>
/// Observação de saúde registrada por um participante no diário de um workspace
/// (HU-04). É o núcleo do produto: medicamentos, sintomas, consultas e humor.
/// </summary>
public sealed class DiaryEntry
{
    /// <summary>Identificador da entrada.</summary>
    [Key]
    public int Id { get; set; }

    /// <summary>Workspace em que a entrada foi registrada.</summary>
    [Required]
    public int WorkspaceId { get; set; }

    /// <inheritdoc cref="WorkspaceId" />
    [ForeignKey(nameof(WorkspaceId))]
    public Workspace Workspace { get; set; } = null!;

    /// <summary>
    /// Quem registrou. Definido pelo servidor a partir do token, nunca pelo
    /// cliente, porque a autoria decide quem pode editar depois (RN-008).
    /// </summary>
    [Required]
    public int AuthorId { get; set; }

    /// <inheritdoc cref="AuthorId" />
    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; } = null!;

    /// <summary>Título da entrada, exibido na listagem do diário.</summary>
    [Required, MaxLength(120)]
    public required string Title { get; set; }

    /// <summary>Descrição da observação.</summary>
    [Required, MaxLength(10000)]
    public required string Content { get; set; }

    /// <summary>Categoria da entrada.</summary>
    [Required]
    public EntryLabel Label { get; set; }

    /// <summary>
    /// Escala de humor de 1 a 5. Só se aplica à categoria <see cref="EntryLabel.Mood"/>;
    /// nas demais permanece nulo.
    /// </summary>
    [Range(1, 5)]
    public int? MoodLevel { get; set; }

    /// <summary>Indica se a entrada foi alterada depois de registrada.</summary>
    [Required]
    public EntryStatus Status { get; set; } = EntryStatus.Active;

    /// <summary>Momento da última alteração, nulo enquanto a entrada não for editada.</summary>
    public DateTime? EditedAt { get; set; }

    /// <summary>Momento do registro.</summary>
    public DateTime CreatedAt { get; set; }
}
