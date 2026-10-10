using EloDeCuidado.DTOs;
using EloDeCuidado.Models;
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
    /// Lista os workspaces dos quais o usuário autenticado participa.
    /// </summary>
    /// <param name="role">
    /// Filtro opcional por papel: <c>admin</c> ou <c>member</c>. Corresponde às
    /// abas da tela de listagem. Omitido, retorna todos.
    /// </param>
    /// <response code="200">Lista dos workspaces do usuário.</response>
    /// <response code="400">Valor de papel inválido.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<WorkspaceResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMine([FromQuery] string? role)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        MemberRole? filter;

        switch (role?.ToLowerInvariant())
        {
            case null or "":
                filter = null;
                break;
            case "admin":
                filter = MemberRole.Admin;
                break;
            case "member":
                filter = MemberRole.Member;
                break;
            default:
                return BadRequest(new { error = "Papel inválido. Use 'admin' ou 'member'." });
        }

        var workspaces = await workspaceService.GetByUserAsync(userId.Value, filter);

        return Ok(workspaces);
    }

    /// <summary>
    /// Retorna os dados de um workspace pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var workspace = await workspaceService.GetByIdAsync(id, this.GetAuthenticatedUserId());

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
    /// Lista os participantes de um workspace, com administradores primeiro.
    /// </summary>
    /// <response code="200">Participantes do workspace.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não participa deste workspace.</response>
    /// <response code="404">Workspace não encontrado.</response>
    [Authorize]
    [HttpGet("{id:int}/members")]
    [ProducesResponseType(typeof(IEnumerable<WorkspaceMemberResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMembers(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var members = await workspaceService.GetMembersAsync(id);

        if (members is null)
            return NotFound();

        // Apenas quem participa do workspace enxerga seus membros (RNF-002).
        if (!await workspaceService.IsMemberAsync(id, userId.Value))
            return Forbid();

        return Ok(members);
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
