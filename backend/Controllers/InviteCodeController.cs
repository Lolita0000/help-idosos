using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints para gerenciamento de códigos de convite.
/// </summary>
/// <param name="inviteCodeService"></param>
[ApiController]
[Route("api/invite-code")]
public sealed class InviteCodeController(IInviteCodeService inviteCodeService) : ControllerBase
{
    /// <summary>
    /// Gera um novo código de convite.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Generate([FromBody] CreateInviteCodeRequest request)
    {
        var inviteCode = await inviteCodeService.CreateAsync(request);

        return Ok(inviteCode);
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
    /// Deleta um código de convite.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await inviteCodeService.DeleteAsync(id);

        if (!success)
            return NotFound();

        return Ok();
    }
}
