using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints para gerenciamento de códigos de convite. Todas as rotas exigem token
/// válido, e gerar, consultar ou remover um código é privilégio do administrador do
/// workspace (RN-001).
/// </summary>
/// <param name="inviteCodeService">Serviço dos códigos de convite.</param>
/// <param name="workspaceService">Usado para verificar o papel do solicitante.</param>
[ApiController]
[Authorize]
[Route("api/invite-code")]
public sealed class InviteCodeController(
    IInviteCodeService inviteCodeService,
    IWorkspaceService workspaceService) : ControllerBase
{
    /// <summary>
    /// Gera um novo código de convite para um workspace. O código expira em 24 horas.
    /// Apenas o administrador do workspace.
    /// </summary>
    /// <response code="200">Código gerado.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra este workspace (ou ele não existe).</response>
    [HttpPost]
    [ProducesResponseType(typeof(InviteCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Generate([FromBody] CreateInviteCodeRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        // Sem esta checagem, qualquer pessoa geraria convite para um workspace
        // alheio e entraria nele. A resposta é a mesma para workspace inexistente,
        // para não revelar quais ids existem (RNF-002).
        if (!await workspaceService.IsAdminAsync(request.WorkspaceId, userId.Value))
            return Forbid();

        var inviteCode = await inviteCodeService.CreateAsync(request);

        if (inviteCode is null)
            return NotFound(new { error = "Workspace não encontrado." });

        return Ok(inviteCode);
    }

    /// <summary>
    /// Retorna um código de convite pelo ID. Apenas o administrador do workspace.
    /// </summary>
    /// <response code="200">Dados do código.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra o workspace do código (ou o código não existe).</response>
    [HttpGet("{id:int}/valid")]
    [ProducesResponseType(typeof(InviteCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetValid(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        // Esta rota devolve o próprio código no corpo da resposta. Sem a
        // verificação abaixo, bastava percorrer ids sequenciais para colher
        // códigos válidos de workspaces alheios e ingressar neles.
        var workspaceId = await inviteCodeService.GetWorkspaceIdAsync(id);

        if (workspaceId is null || !await workspaceService.IsAdminAsync(workspaceId.Value, userId.Value))
            return Forbid();

        var inviteCode = await inviteCodeService.GetByIdAsync(id);

        if (inviteCode is null)
            return NotFound();

        return Ok(inviteCode);
    }

    /// <summary>
    /// Deleta um código de convite. Apenas o administrador do workspace.
    /// </summary>
    /// <response code="200">Código removido.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra o workspace do código (ou o código não existe).</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var workspaceId = await inviteCodeService.GetWorkspaceIdAsync(id);

        if (workspaceId is null || !await workspaceService.IsAdminAsync(workspaceId.Value, userId.Value))
            return Forbid();

        await inviteCodeService.DeleteAsync(id);

        return Ok();
    }
}
