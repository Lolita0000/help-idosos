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
    /// Retorna os dados de um workspace pelo ID. Apenas para quem participa dele.
    /// </summary>
    /// <response code="200">Dados do workspace.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não participa deste workspace.</response>
    /// <response code="404">Workspace não encontrado.</response>
    [Authorize]
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(WorkspaceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var workspace = await workspaceService.GetByIdAsync(id, userId);

        if (workspace is null)
            return NotFound();

        // O workspace expõe o nome da pessoa acompanhada, que é dado pessoal:
        // só quem participa pode lê-lo (RNF-002).
        if (!await workspaceService.IsMemberAsync(id, userId.Value))
            return Forbid();

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
    /// <response code="400">Nome ou sujeito em branco, ou texto acima do limite.</response>
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

        // Mesmas regras da edição: sem isso, uma chamada direta à API criava
        // workspace sem nome ou estourava a coluna com erro 500.
        var invalid = ValidateUpdate(new UpdateWorkspaceRequest(
            request.Name ?? "", request.SubjectName ?? "", request.Description));

        if (invalid is not null)
            return BadRequest(new { error = invalid });

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
    /// Atualiza os dados de um workspace existente. Apenas o administrador.
    /// </summary>
    /// <response code="200">Workspace atualizado.</response>
    /// <response code="400">Nome ou sujeito em branco, ou texto acima do limite.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra este workspace (ou ele não existe).</response>
    [Authorize]
    [HttpPatch("{id:int}")]
    [ProducesResponseType(typeof(WorkspaceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkspaceRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        // A resposta é a mesma para workspace inexistente e alheio, para não
        // revelar quais ids existem (RNF-002).
        if (!await workspaceService.IsAdminAsync(id, userId.Value))
            return Forbid();

        // Nome e sujeito são obrigatórios na criação; permitir esvaziá-los na
        // edição deixaria o workspace sem identificação. Os limites espelham as
        // colunas, onde exceder viraria erro 500 em vez de mensagem clara.
        var invalid = ValidateUpdate(request);

        if (invalid is not null)
            return BadRequest(new { error = invalid });

        var workspace = await workspaceService.UpdateAsync(id, request);

        if (workspace is null)
            return NotFound();

        return Ok(workspace);
    }

    /// <summary>
    /// Totais do workspace (participantes e entradas), para a tela de
    /// configuração. Apenas para quem participa dele.
    /// </summary>
    /// <response code="200">Totais do workspace.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não participa deste workspace (ou ele não existe).</response>
    [Authorize]
    [HttpGet("{id:int}/stats")]
    [ProducesResponseType(typeof(WorkspaceStatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetStats(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        if (!await workspaceService.IsMemberAsync(id, userId.Value))
            return Forbid();

        var stats = await workspaceService.GetStatsAsync(id);

        return stats is null ? NotFound() : Ok(stats);
    }

    /// <summary>
    /// Deleta um workspace pelo ID. Apenas o administrador.
    /// </summary>
    /// <remarks>
    /// <b>Irreversível.</b> Membros, convites, entradas do diário e a trilha de
    /// auditoria do workspace saem junto, em cascata (RN-012). As contas dos
    /// participantes permanecem. A confirmação em duas etapas é responsabilidade
    /// do cliente.
    ///
    /// A trilha de auditoria sai com o workspace porque ela pertence a ele:
    /// não há onde registrar a exclusão sem manter dados do que foi apagado.
    /// </remarks>
    /// <response code="204">Workspace excluído.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não administra este workspace (ou ele não existe).</response>
    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        if (!await workspaceService.IsAdminAsync(id, userId.Value))
            return Forbid();

        var deleted = await workspaceService.DeleteAsync(id);

        return !deleted ? NotFound() : NoContent();
    }

    private const int NameMax = 100;
    private const int DescriptionMax = 500;

    private static string? ValidateUpdate(UpdateWorkspaceRequest request)
    {
        if (request.Name is not null && string.IsNullOrWhiteSpace(request.Name))
            return "Informe o nome do espaço.";

        if (request.SubjectName is not null && string.IsNullOrWhiteSpace(request.SubjectName))
            return "O nome do sujeito acompanhado é obrigatório.";

        if (request.Name?.Trim().Length > NameMax)
            return $"O nome do espaço aceita até {NameMax} caracteres.";

        if (request.SubjectName?.Trim().Length > NameMax)
            return $"O nome do sujeito aceita até {NameMax} caracteres.";

        if (request.Description?.Trim().Length > DescriptionMax)
            return $"A descrição aceita até {DescriptionMax} caracteres.";

        return null;
    }
}
