using EloDeCuidado.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Gestão da equipe do workspace pelo administrador: remover membros e passar a
/// administração (RN-001, RN-010).
/// </summary>
/// <param name="members">Serviço da equipe do workspace.</param>
[ApiController]
[Authorize]
[Route("api/workspaces/{workspaceId:int}/members")]
public sealed class WorkspaceMembersController(IWorkspaceMemberService members) : ControllerBase
{
    /// <summary>
    /// Remove um membro comum do workspace.
    /// </summary>
    /// <remarks>
    /// A conta e as entradas da pessoa permanecem; ela apenas perde o acesso ao
    /// workspace. A remoção fica registrada na auditoria.
    /// </remarks>
    /// <param name="workspaceId">Workspace.</param>
    /// <param name="userId">Usuário a remover.</param>
    /// <response code="204">Membro removido.</response>
    /// <response code="400">Tentativa de remover o próprio administrador.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra este workspace (ou ele não existe).</response>
    /// <response code="404">A pessoa não participa do workspace.</response>
    [HttpDelete("{userId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remove(int workspaceId, int userId)
    {
        var requesterId = this.GetAuthenticatedUserId();

        if (requesterId is null)
            return Unauthorized();

        return Translate(await members.RemoveAsync(workspaceId, userId, requesterId.Value));
    }

    /// <summary>
    /// Passa a administração do workspace para outro participante.
    /// </summary>
    /// <remarks>
    /// A pessoa escolhida vira administradora e quem passou vira membro comum, na
    /// mesma operação. A transferência fica registrada na auditoria.
    /// </remarks>
    /// <param name="workspaceId">Workspace.</param>
    /// <param name="userId">Participante que passa a administrar.</param>
    /// <response code="204">Administração transferida.</response>
    /// <response code="400">A pessoa já é administradora, ou é o próprio solicitante.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra este workspace (ou ele não existe).</response>
    /// <response code="404">A pessoa não participa do workspace.</response>
    [HttpPost("{userId:int}/transfer-admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TransferAdmin(int workspaceId, int userId)
    {
        var requesterId = this.GetAuthenticatedUserId();

        if (requesterId is null)
            return Unauthorized();

        return Translate(await members.TransferAdminAsync(workspaceId, userId, requesterId.Value));
    }

    private IActionResult Translate(MemberChangeResult result) => result.Status switch
    {
        MemberChangeStatus.Ok => NoContent(),
        MemberChangeStatus.Forbidden => Forbid(),
        MemberChangeStatus.TargetNotFound => NotFound(new { error = "Essa pessoa não participa deste workspace." }),
        _ => BadRequest(new { error = result.Message }),
    };
}
