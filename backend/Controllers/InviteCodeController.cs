using EloDeCuidado.DTOs;
using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints para gerenciamento de códigos de convite (HU-03).
/// </summary>
/// <param name="inviteCodeService"></param>
/// <param name="workspaceService"></param>
[ApiController]
[Authorize]
[Route("api/invite-code")]
public sealed class InviteCodeController(
    IInviteCodeService inviteCodeService,
    IWorkspaceService workspaceService) : ControllerBase
{
    /// <summary>
    /// Gera um novo código de convite para um workspace. O código expira em 24 horas.
    /// Apenas o administrador do workspace pode gerar códigos.
    /// </summary>
    /// <response code="200">Código gerado.</response>
    /// <response code="403">O usuário não é administrador do workspace (ou ele não existe).</response>
    [HttpPost]
    [ProducesResponseType(typeof(InviteCodeResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Generate([FromBody] CreateInviteCodeRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        // Sem vínculo de administrador não há o que gerar: a resposta é a mesma para
        // workspace inexistente e alheio, para não revelar quais ids existem (RNF-002).
        if (!await inviteCodeService.IsAdminAsync(request.WorkspaceId, userId.Value))
            return StatusCode(StatusCodes.Status403Forbidden,
                new { error = "Apenas o administrador pode gerar convites." });

        var inviteCode = await inviteCodeService.CreateAsync(request);

        if (inviteCode is null)
            return NotFound(new { error = "Workspace não encontrado." });

        return Ok(inviteCode);
    }

    /// <summary>
    /// Lista os códigos de convite de um workspace (ativos e expirados). Apenas o administrador.
    /// </summary>
    /// <response code="200">Lista de códigos, do mais recente para o mais antigo.</response>
    /// <response code="403">O usuário não é administrador do workspace.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<InviteCodeResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByWorkspace([FromQuery] int workspaceId)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        if (!await inviteCodeService.IsAdminAsync(workspaceId, userId.Value))
            return StatusCode(StatusCodes.Status403Forbidden,
                new { error = "Apenas o administrador gerencia convites." });

        return Ok(await inviteCodeService.GetByWorkspaceAsync(workspaceId));
    }

    /// <summary>
    /// Ingressa no workspace do código informado como membro com papel padrão (HU-03).
    /// </summary>
    /// <response code="200">Ingresso realizado; retorna o workspace.</response>
    /// <response code="400">Código em branco.</response>
    /// <response code="404">Código inexistente.</response>
    /// <response code="409">O usuário já participa do workspace.</response>
    /// <response code="410">Código expirado (mais de 24 horas).</response>
    [HttpPost("join")]
    [ProducesResponseType(typeof(WorkspaceResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Join([FromBody] JoinWithCodeRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var result = await inviteCodeService.JoinAsync(request.Code, userId.Value);

        return result.Status switch
        {
            JoinStatus.Joined => Ok(await workspaceService.GetByIdAsync(result.WorkspaceId!.Value, userId)),
            JoinStatus.Empty => BadRequest(new { error = "Informe o código de convite." }),
            JoinStatus.NotFound => NotFound(new
            {
                error = "Código inválido. Verifique o código e tente novamente.",
                code = "INVITE_INVALID",
            }),
            JoinStatus.Expired => StatusCode(StatusCodes.Status410Gone, new
            {
                error = "Este código expirou (validade de 24 horas). Peça um novo código ao administrador.",
                code = "INVITE_EXPIRED",
            }),
            _ => Conflict(new
            {
                error = "Você já faz parte deste workspace.",
                code = "ALREADY_MEMBER",
            }),
        };
    }

    /// <summary>
    /// Retorna um código de convite válido
    /// </summary>
    [HttpGet("{id:int}/valid")]
    public async Task<IActionResult> GetValid(int id)
    {
        var inviteCode = await inviteCodeService.GetByIdAsync(id);

        if (inviteCode is null)
            return NotFound();

        return Ok(inviteCode);
    }

    /// <summary>
    /// Deleta um código de convite. Apenas o administrador do workspace.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var workspaceId = await inviteCodeService.GetWorkspaceIdAsync(id);

        if (workspaceId is null)
            return NotFound();

        if (!await inviteCodeService.IsAdminAsync(workspaceId.Value, userId.Value))
            return StatusCode(StatusCodes.Status403Forbidden,
                new { error = "Apenas o administrador pode remover convites." });

        await inviteCodeService.DeleteAsync(id);

        return Ok();
    }
}
