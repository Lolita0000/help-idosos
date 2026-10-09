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
    public async Task<WorkspaceResponse?> GetByIdAsync(int id)
    {
        var workspace = await db.Workspaces
            .Include(w => w.Members)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(w => w.Id == id);

        return workspace is null ? null : ToResponse(workspace);
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

        return ToResponse(workspace);
    }

    /// <inheritdoc />
    public async Task<WorkspaceResponse?> UpdateAsync(int id, UpdateWorkspaceRequest request)
    {
        var workspace = await db.Workspaces
            .Include(w => w.Members)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(w => w.Id == id);

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

        return ToResponse(workspace);
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

    private static WorkspaceResponse ToResponse(Workspace workspace)
    {
        // O administrador é o criador do workspace (RN-001).
        var creator = workspace.Members
            .FirstOrDefault(m => m.Role == MemberRole.Admin)?.User?.Name
            ?? string.Empty;

        return new WorkspaceResponse(
            workspace.Id,
            workspace.Name,
            workspace.Description,
            workspace.SubjectName,
            creator,
            workspace.Members.Count,
            workspace.CreatedAt);
    }
}
