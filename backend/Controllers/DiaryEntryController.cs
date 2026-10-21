using EloDeCuidado.DTOs.DiaryEntries;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints das entradas do diário (HU-04, HU-06, HU-07). Todas as rotas exigem
/// token válido e participação no workspace da entrada (RNF-002).
/// </summary>
/// <param name="diaryEntryService">Serviço das entradas do diário.</param>
[ApiController]
[Authorize]
[Route("api/diary-entries")]
public sealed class DiaryEntryController(IDiaryEntryService diaryEntryService) : ControllerBase
{
    /// <summary>
    /// Lista as entradas de um workspace, da mais recente para a mais antiga.
    /// </summary>
    /// <response code="200">Entradas do workspace.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O usuário não participa deste workspace.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DiaryEntryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByWorkspace([FromQuery] int workspaceId)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var entries = await diaryEntryService.GetByWorkspaceAsync(workspaceId, userId.Value);

        // A mesma resposta para workspace inexistente e alheio, para não revelar
        // quais ids existem (RNF-002).
        return entries is null ? Forbid() : Ok(entries);
    }

    /// <summary>
    /// Retorna uma entrada pelo ID.
    /// </summary>
    /// <response code="200">Dados da entrada.</response>
    /// <response code="403">O usuário não participa do workspace da entrada.</response>
    /// <response code="404">Entrada não encontrada.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DiaryEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        return Traduzir(await diaryEntryService.GetByIdAsync(id, userId.Value));
    }

    /// <summary>
    /// Registra uma entrada no diário de um workspace (HU-04).
    /// </summary>
    /// <remarks>
    /// A autoria e o momento do registro são definidos pelo servidor a partir do
    /// token e não são aceitos no corpo da requisição (RN-008).
    /// </remarks>
    /// <response code="201">Entrada registrada.</response>
    /// <response code="400">Título, descrição, categoria ou escala de humor inválidos.</response>
    /// <response code="403">O usuário não participa deste workspace.</response>
    [HttpPost]
    [ProducesResponseType(typeof(DiaryEntryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateDiaryEntryRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var result = await diaryEntryService.CreateAsync(request, userId.Value);

        if (result.Status is not DiaryEntryStatus.Ok)
            return Traduzir(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Entry!.Id }, result.Entry);
    }

    /// <summary>
    /// Altera uma entrada existente. Apenas o autor (HU-06, RN-008).
    /// </summary>
    /// <response code="200">Entrada alterada.</response>
    /// <response code="400">Valor inválido.</response>
    /// <response code="403">O usuário não é o autor da entrada.</response>
    /// <response code="404">Entrada não encontrada.</response>
    [HttpPatch("{id:int}")]
    [ProducesResponseType(typeof(DiaryEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDiaryEntryRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        return Traduzir(await diaryEntryService.UpdateAsync(id, request, userId.Value));
    }

    /// <summary>
    /// Exclui uma entrada de forma definitiva (HU-07, RN-006).
    /// </summary>
    /// <remarks>
    /// A exclusão é física: o registro sai do banco e não é recuperável. A
    /// permissão do administrador para excluir entrada alheia entra na #57, e o
    /// vestígio em AuditLog na #58.
    /// </remarks>
    /// <response code="204">Entrada excluída.</response>
    /// <response code="403">O usuário não é o autor da entrada.</response>
    /// <response code="404">Entrada não encontrada.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        var result = await diaryEntryService.DeleteAsync(id, userId.Value);

        return result.Status is DiaryEntryStatus.Ok ? NoContent() : Traduzir(result);
    }

    /// <summary>
    /// Converte o desfecho do serviço no código HTTP correspondente, para a
    /// tradução ficar num lugar só e não divergir entre as rotas.
    /// </summary>
    private IActionResult Traduzir(DiaryEntryResult result) => result.Status switch
    {
        DiaryEntryStatus.Ok => Ok(result.Entry),
        DiaryEntryStatus.Invalid => BadRequest(new { error = result.Error }),
        DiaryEntryStatus.NotFound => NotFound(),
        DiaryEntryStatus.NotMember => Forbid(),
        _ => StatusCode(StatusCodes.Status403Forbidden, new
        {
            error = "Apenas quem registrou a entrada pode alterá-la ou removê-la.",
            code = "NOT_AUTHOR",
        }),
    };
}
