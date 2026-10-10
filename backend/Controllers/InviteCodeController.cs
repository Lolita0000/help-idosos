using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints para gerenciamento de códigos de convite. Todas as rotas exigem token
/// válido, e gerar, consultar ou remover um código é privilégio do administrador do
/// workspace (RN-001). O ingresso é a exceção: qualquer usuário autenticado que
/// tenha um código válido pode entrar.
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
    /// Lista os códigos de convite de um workspace, ativos e expirados. Apenas o
    /// administrador.
    /// </summary>
    /// <remarks>
    /// Os expirados são incluídos de propósito: a tela de convites mostra os dois
    /// estados, para o administrador entender por que um código deixou de funcionar.
    /// </remarks>
    /// <response code="200">Códigos do workspace, do mais recente para o mais antigo.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra este workspace (ou ele não existe).</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<InviteCodeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByWorkspace([FromQuery] int workspaceId)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        // O código é o próprio segredo de acesso ao workspace: listá-los é
        // privilégio de quem administra (RN-001, RNF-002).
        if (!await workspaceService.IsAdminAsync(workspaceId, userId.Value))
            return Forbid();

        return Ok(await inviteCodeService.GetByWorkspaceAsync(workspaceId));
    }

    /// <summary>
    /// Ingressa no workspace do código informado, como membro com papel padrão (HU-03).
    /// </summary>
    /// <remarks>
    /// Esta rota não exige papel de administrador: é o caminho pelo qual um convidado
    /// entra. O código é aceito com ou sem hífen e em qualquer caixa.
    /// </remarks>
    /// <response code="200">Ingresso realizado. Retorna o workspace.</response>
    /// <response code="400">Código em branco.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="404">Código inexistente.</response>
    /// <response code="409">O usuário já participa do workspace.</response>
    /// <response code="410">Código expirado, com mais de 24 horas (RN-005).</response>
    [HttpPost("join")]
    [ProducesResponseType(typeof(DTOs.WorkspaceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<IActionResult> Join([FromBody] JoinWithCodeRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var result = await inviteCodeService.JoinAsync(request.Code, userId.Value);

        // Cada desfecho tem um código próprio no corpo, porque o aplicativo
        // mostra mensagens diferentes para cada um.
        return result.Status switch
        {
            JoinStatus.Joined =>
                Ok(await workspaceService.GetByIdAsync(result.WorkspaceId!.Value, userId)),

            JoinStatus.Empty =>
                BadRequest(new { error = "Informe o código de convite." }),

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
