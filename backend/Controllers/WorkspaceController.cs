using EloDeCuidado.DTOs;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Authorization;
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
    /// Cria um novo workspace. O usuário autenticado se torna o administrador.
    /// </summary>
    /// <remarks>
    /// O sujeito acompanhado é registrado apenas pelo nome e não recebe acesso
    /// automático. Para que ele participe, gere um código de convite depois.
    /// </remarks>
    /// <response code="200">Workspace criado.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(WorkspaceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateWorkspaceRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var workspace = await workspaceService.CreateAsync(request, userId.Value);

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
