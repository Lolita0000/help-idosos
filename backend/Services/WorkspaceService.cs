using EloDeCuidado.Data;
using EloDeCuidado.DTOs;
using EloDeCuidado.Models;

namespace EloDeCuidado.Services;

/// <summary>
/// Serviço responsável pelas operações CRUD da entidade Workspace.
/// </summary>
public sealed class WorkspaceService(AppDbContext db) : IWorkspaceService
{
    /// <inheritdoc />
    public async Task<WorkspaceResponse?> GetByIdAsync(int id)
    {
        var workspace = await db.Workspaces.FindAsync(id);

        if (workspace is null)
            return null;

        return ToResponse(workspace);
    }

    /// <inheritdoc />
    public async Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request)
    {
        var workspace = new Workspace
        {
            Name = request.Name,
        };

        db.Workspaces.Add(workspace);
        await db.SaveChangesAsync();

        return ToResponse(workspace);
    }

    /// <inheritdoc />
    public async Task<WorkspaceResponse?> UpdateAsync(int id, UpdateWorkspaceRequest request)
    {
        var workspace = await db.Workspaces.FindAsync(id);

        if (workspace is null)
            return null;

        if (request.Name is not null)
            workspace.Name = request.Name;

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

    private static WorkspaceResponse ToResponse(Workspace workspace) =>
        new(workspace.Id, workspace.Name, workspace.CreatedAt);
}