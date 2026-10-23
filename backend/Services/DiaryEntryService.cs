using EloDeCuidado.Data;
using EloDeCuidado.DTOs.AuditLogs;
using EloDeCuidado.DTOs.DiaryEntries;
using EloDeCuidado.Models;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Services;

/// <summary>
/// Operações sobre as entradas do diário de um workspace.
/// </summary>
/// <param name="db">O contexto de banco de dados.</param>
/// <param name="workspaceService">
/// Fonte da verificação de papel. A regra de quem administra um workspace mora
/// num lugar só: duplicá-la aqui criaria duas definições de permissão para
/// manter em sincronia.
/// </param>
/// <param name="auditLog">
/// Trilha de auditoria das ações sensíveis (RN-010). Os registros são
/// enfileirados com <c>Record</c> e gravados pelo <c>SaveChanges</c> desta
/// classe, de modo que auditoria e operação entram na mesma transação (RNF-006).
/// </param>
public sealed class DiaryEntryService(
    AppDbContext db,
    IWorkspaceService workspaceService,
    IAuditLogService auditLog) : IDiaryEntryService
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<DiaryEntryResponse>?> GetByWorkspaceAsync(
        int workspaceId, int requesterId)
    {
        // O diário contém observações de saúde de uma pessoa: só quem participa
        // do workspace pode lê-lo (RNF-002).
        if (!await IsMemberAsync(workspaceId, requesterId))
            return null;

        var entries = await db.DiaryEntries
            .Where(e => e.WorkspaceId == workspaceId)
            .Include(e => e.Author)
            // A tela do diário mostra o registro mais recente primeiro.
            .OrderByDescending(e => e.CreatedAt)
            .ThenByDescending(e => e.Id)
            .ToListAsync();

        return entries.Select(ToResponse).ToList();
    }

    /// <inheritdoc />
    public async Task<DiaryEntryResult> GetByIdAsync(int id, int requesterId)
    {
        var entry = await LoadAsync(id);

        if (entry is null)
            return new DiaryEntryResult(DiaryEntryStatus.NotFound);

        if (!await IsMemberAsync(entry.WorkspaceId, requesterId))
            return new DiaryEntryResult(DiaryEntryStatus.NotMember);

        return new DiaryEntryResult(DiaryEntryStatus.Ok, ToResponse(entry));
    }

    /// <inheritdoc />
    public async Task<DiaryEntryResult> CreateAsync(CreateDiaryEntryRequest request, int authorId)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return Invalid("Informe o título da entrada.");

        if (string.IsNullOrWhiteSpace(request.Content))
            return Invalid("Informe a descrição da entrada.");

        if (!TryParseLabel(request.Label, out var label))
            return Invalid($"Categoria inválida. Use uma destas: {LabelNames}.");

        if (!TryNormalizeMood(label, request.MoodLevel, out var mood, out var moodError))
            return Invalid(moodError!);

        if (!await IsMemberAsync(request.WorkspaceId, authorId))
            return new DiaryEntryResult(DiaryEntryStatus.NotMember);

        var entry = new DiaryEntry
        {
            WorkspaceId = request.WorkspaceId,
            // Vem do token, nunca do corpo da requisição: a autoria decide quem
            // pode editar depois (RN-008).
            AuthorId = authorId,
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            Label = label,
            MoodLevel = mood,
            Status = EntryStatus.Active,
            CreatedAt = DateTime.UtcNow,
        };

        db.DiaryEntries.Add(entry);
        await db.SaveChangesAsync();

        // Recarrega o autor para compor o nome exibido na listagem.
        await db.Entry(entry).Reference(e => e.Author).LoadAsync();

        return new DiaryEntryResult(DiaryEntryStatus.Ok, ToResponse(entry));
    }

    /// <inheritdoc />
    public async Task<DiaryEntryResult> UpdateAsync(
        int id, UpdateDiaryEntryRequest request, int requesterId)
    {
        var entry = await LoadAsync(id);

        if (entry is null)
            return new DiaryEntryResult(DiaryEntryStatus.NotFound);

        if (!await IsMemberAsync(entry.WorkspaceId, requesterId))
            return new DiaryEntryResult(DiaryEntryStatus.NotMember);

        // Só o autor corrige o que escreveu. Um relato de saúde alterado por
        // terceiros perderia a confiabilidade (RN-008).
        if (entry.AuthorId != requesterId)
            return new DiaryEntryResult(DiaryEntryStatus.NotAuthor);

        if (request.Title is not null && string.IsNullOrWhiteSpace(request.Title))
            return Invalid("O título não pode ficar em branco.");

        if (request.Content is not null && string.IsNullOrWhiteSpace(request.Content))
            return Invalid("A descrição não pode ficar em branco.");

        var label = entry.Label;

        if (request.Label is not null && !TryParseLabel(request.Label, out label))
            return Invalid($"Categoria inválida. Use uma destas: {LabelNames}.");

        // A escala é validada contra a categoria final, não a anterior: mudar de
        // Mood para outra categoria precisa descartar o valor de humor.
        var informedMood = request.MoodLevel ?? (request.Label is null ? entry.MoodLevel : null);

        if (!TryNormalizeMood(label, informedMood, out var mood, out var moodError))
            return Invalid(moodError!);

        if (request.Title is not null)
            entry.Title = request.Title.Trim();

        if (request.Content is not null)
            entry.Content = request.Content.Trim();

        entry.Label = label;
        entry.MoodLevel = mood;
        entry.Status = EntryStatus.Edited;
        entry.EditedAt = DateTime.UtcNow;

        // Edição é ação sensível (RN-010). Enfileirado antes do SaveChanges
        // para entrar na mesma transação: se a alteração falhar, não fica
        // registro de uma edição que não aconteceu.
        auditLog.Record(
            entry.WorkspaceId, requesterId, AuditAction.DiaryEntryUpdated,
            AuditEntity.DiaryEntry, entry.Id);

        await db.SaveChangesAsync();

        return new DiaryEntryResult(DiaryEntryStatus.Ok, ToResponse(entry));
    }

    /// <inheritdoc />
    public async Task<DiaryEntryResult> DeleteAsync(int id, int requesterId)
    {
        var entry = await LoadAsync(id);

        if (entry is null)
            return new DiaryEntryResult(DiaryEntryStatus.NotFound);

        if (!await IsMemberAsync(entry.WorkspaceId, requesterId))
            return new DiaryEntryResult(DiaryEntryStatus.NotMember);

        // Excluem o autor e o administrador do workspace (RN-007). O
        // administrador precisa conseguir remover registro indevido de qualquer
        // membro, senão um relato impróprio ficaria no histórico de saúde sem
        // ninguém com poder de tirá-lo.
        var podeExcluir = entry.AuthorId == requesterId
            || await workspaceService.IsAdminAsync(entry.WorkspaceId, requesterId);

        if (!podeExcluir)
            return new DiaryEntryResult(DiaryEntryStatus.NotAuthor);

        // O vestígio é registrado antes da remoção e na mesma transação
        // (RN-010, RNF-006). Depois do SaveChanges a entrada não existe mais, e
        // o AuditLog passa a ser o único rastro de que ela existiu: guarda quem
        // removeu, o que foi removido e quando, nunca o conteúdo (RN-010).
        auditLog.Record(
            entry.WorkspaceId, requesterId, AuditAction.DiaryEntryDeleted,
            AuditEntity.DiaryEntry, entry.Id);

        // Exclusão física: o registro sai do banco e não é recuperável (RN-006).
        db.DiaryEntries.Remove(entry);
        await db.SaveChangesAsync();

        return new DiaryEntryResult(DiaryEntryStatus.Ok);
    }

    private async Task<DiaryEntry?> LoadAsync(int id) =>
        await db.DiaryEntries
            .Include(e => e.Author)
            .FirstOrDefaultAsync(e => e.Id == id);

    private async Task<bool> IsMemberAsync(int workspaceId, int userId) =>
        await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId);

    private static DiaryEntryResult Invalid(string error) =>
        new(DiaryEntryStatus.Invalid, null, error);

    private static readonly string LabelNames =
        string.Join(", ", Enum.GetNames<EntryLabel>().Select(n => n.ToLowerInvariant()));

    /// <summary>
    /// Aceita a categoria em qualquer caixa, para o cliente não depender da
    /// grafia exata nem da representação numérica do enum.
    /// </summary>
    private static bool TryParseLabel(string? label, out EntryLabel parsed) =>
        Enum.TryParse(label, ignoreCase: true, out parsed) && Enum.IsDefined(parsed);

    /// <summary>
    /// A escala de humor é opcional e só existe na categoria Mood.
    /// </summary>
    /// <remarks>
    /// Na categoria Mood a escala pode vir nula: humor é uma categoria de
    /// registro, não uma medição obrigatória, e a tela do diário registra humor
    /// sem pedir nota. Informá-la fora dessa categoria continua sendo recusado,
    /// em vez de ignorado em silêncio, porque aí o cliente estaria enviando um
    /// dado que nunca seria exibido de volta.
    /// </remarks>
    private static bool TryNormalizeMood(
        EntryLabel label, int? informed, out int? mood, out string? error)
    {
        mood = null;
        error = null;

        if (label != EntryLabel.Mood)
        {
            if (informed is not null)
            {
                error = "A escala de humor só se aplica a entradas da categoria 'mood'.";
                return false;
            }

            return true;
        }

        if (informed is null)
            return true;

        if (informed is < 1 or > 5)
        {
            error = "A escala de humor vai de 1 a 5.";
            return false;
        }

        mood = informed;
        return true;
    }

    private static DiaryEntryResponse ToResponse(DiaryEntry entry) =>
        new(
            entry.Id,
            entry.WorkspaceId,
            entry.AuthorId,
            entry.Author?.Name ?? string.Empty,
            entry.Title,
            entry.Content,
            entry.Label.ToString().ToLowerInvariant(),
            entry.MoodLevel,
            entry.Status == EntryStatus.Edited,
            entry.EditedAt,
            entry.CreatedAt);
}
