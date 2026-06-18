using EloDeCuidado.DTOs;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints para gerenciamento de workspaces.
/// </summary>
[ApiController]
[Route("api/workspaces")]
public sealed class WorkspaceController(IWorkspaceService workspaceService) : ControllerBase
{
    /// <summary>
    /// Retorna os dados de um workspace pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var workspace = await workspaceService.GetByIdAsync(id);

        if (workspace is null)
            return NotFound();

        return Ok(workspace);
    }

    /// <summary>
    /// Cria um novo workspace.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkspaceRequest request)
    {
        var workspace = await workspaceService.CreateAsync(request);

        return Ok(workspace);
    }

    /// <summary>
    /// Atualiza os dados de um workspace existente.
    /// </summary>
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkspaceRequest request)
    {
        var workspace = await workspaceService.UpdateAsync(id, request);

        if (workspace is null)
            return NotFound();

        return Ok(workspace);
    }

    /// <summary>
    /// Deleta um workspace pelo ID.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await workspaceService.DeleteAsync(id);

        return !deleted ? NotFound() : NoContent();
    }
}