using EloDeCuidado.Data;
using EloDeCuidado.DTOs;
using EloDeCuidado.Models;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Services;

/// <summary>
/// Serviço responsável pelas operações CRUD da entidade Workspace.
/// </summary>
public sealed class WorkspaceService(AppDbContext db) : IWorkspaceService
{
    /// <inheritdoc />
    public async Task<WorkspaceResponse?> GetByIdAsync(int id, int? viewerUserId = null)
    {
        var workspace = await LoadWithMembersAsync(id);

        return workspace is null ? null : ToResponse(workspace, viewerUserId);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<WorkspaceResponse>> GetByUserAsync(int userId, MemberRole? role = null)
    {
        var query = db.Workspaces
            .Where(w => w.Members.Any(m => m.UserId == userId));

        // O filtro das abas Todos / Admin / Membro considera o papel do
        // solicitante, e não o papel de outros participantes.
        if (role is not null)
            query = query.Where(w => w.Members.Any(m => m.UserId == userId && m.Role == role));

        var workspaces = await query
            .Include(w => w.Members)
            .ThenInclude(m => m.User)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();

        return workspaces.Select(w => ToResponse(w, userId)).ToList();
    }

    /// <inheritdoc />
    public async Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request, int creatorUserId)
    {
        var workspace = new Workspace
        {
            Name = request.Name,
            Description = request.Description,
            SubjectName = request.SubjectName,
        };

        // O criador vira administrador do workspace (RN-001). Workspace e
        // vínculo são gravados na mesma transação: um workspace sem
        // administrador violaria a regra e ficaria inacessível.
        workspace.Members.Add(new WorkspaceMember
        {
            UserId = creatorUserId,
            Role = MemberRole.Admin,
            // O sujeito acompanhado não recebe acesso automático: ele é apenas
            // identificado por nome. Quem cria o workspace é administrador, não
            // a pessoa acompanhada.
            IsSubject = false,
        });

        db.Workspaces.Add(workspace);
        await db.SaveChangesAsync();

        // Recarrega o vínculo com o usuário para compor o nome do criador.
        await db.Entry(workspace)
            .Collection(w => w.Members)
            .Query()
            .Include(m => m.User)
            .LoadAsync();

        return ToResponse(workspace, creatorUserId);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<WorkspaceMemberResponse>?> GetMembersAsync(int workspaceId)
    {
        var exists = await db.Workspaces.AnyAsync(w => w.Id == workspaceId);

        if (!exists)
            return null;

        var members = await db.WorkspaceMembers
            .Where(m => m.WorkspaceId == workspaceId)
            .Include(m => m.User)
            // Administradores primeiro, como na tela de membros; dentro de cada
            // grupo, pela ordem de ingresso.
            .OrderBy(m => m.Role)
            .ThenBy(m => m.JoinedAt)
            .ToListAsync();

        return members
            .Select(m => new WorkspaceMemberResponse(
                m.UserId,
                m.User.Name,
                m.User.Email,
                RoleName(m.Role),
                m.IsSubject,
                m.JoinedAt))
            .ToList();
    }

    /// <inheritdoc />
    public async Task<WorkspaceResponse?> UpdateAsync(int id, UpdateWorkspaceRequest request)
    {
        var workspace = await LoadWithMembersAsync(id);

        if (workspace is null)
            return null;

        if (request.Name is not null)
            workspace.Name = request.Name;

        if (request.Description is not null)
            workspace.Description = request.Description;

        if (request.SubjectName is not null)
            workspace.SubjectName = request.SubjectName;

        workspace.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return ToResponse(workspace, null);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(int id)
    {
        var workspace = await db.Workspaces.FindAsync(id);

        if (workspace is null)
            return false;

        db.Workspaces.Remove(workspace);
        await db.SaveChangesAsync();

        return true;
    }

    /// <inheritdoc />
    public async Task<bool> IsMemberAsync(int workspaceId, int userId) =>
        await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId);

    private async Task<Workspace?> LoadWithMembersAsync(int id) =>
        await db.Workspaces
            .Include(w => w.Members)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(w => w.Id == id);

    /// <summary>
    /// Nome do papel exposto na API, em minúsculas, para o cliente não depender
    /// da representação numérica do enum.
    /// </summary>
    internal static string RoleName(MemberRole role) =>
        role == MemberRole.Admin ? "admin" : "member";

    private static WorkspaceResponse ToResponse(Workspace workspace, int? viewerUserId)
    {
        // O administrador é o criador do workspace (RN-001).
        var creator = workspace.Members
            .FirstOrDefault(m => m.Role == MemberRole.Admin)?.User?.Name
            ?? string.Empty;

        var myRole = viewerUserId is null
            ? null
            : workspace.Members
                .Where(m => m.UserId == viewerUserId)
                .Select(m => RoleName(m.Role))
                .FirstOrDefault();

        return new WorkspaceResponse(
            workspace.Id,
            workspace.Name,
            workspace.Description,
            workspace.SubjectName,
            creator,
            workspace.Members.Count,
            myRole,
            workspace.CreatedAt);
    }
}
