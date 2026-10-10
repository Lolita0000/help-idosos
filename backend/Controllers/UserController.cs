using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Services;
using EloDeCuidado.Services.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints para gerenciamento de usuários. Todas as rotas exigem token válido e
/// operam somente sobre a própria conta: um usuário não lê nem altera os dados de
/// outro (RNF-002). Os participantes de um workspace são obtidos em
/// <c>GET /api/workspaces/{id}/members</c>, que já filtra por vínculo.
/// </summary>
[ApiController]
[Authorize]
[Route("api/users")]
public sealed class UserController(IUserService userService) : ControllerBase
{
    /// <summary>
    /// Retorna os dados da própria conta.
    /// </summary>
    /// <response code="200">Dados do usuário autenticado.</response>
    /// <response code="401">Token ausente ou inválido.</response>
    /// <response code="403">O id informado não é o do usuário autenticado.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        // Sem esta checagem, qualquer usuário autenticado percorreria ids
        // sequenciais e colheria o e-mail de todos os cadastrados.
        if (id != userId.Value)
            return Forbid();

        var user = await userService.GetByIdAsync(id);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    /// <summary>
    /// Cria um novo usuário.
    /// </summary>
    /// <remarks>
    /// O cadastro público é feito em <c>POST /api/auth/register</c>, que devolve o
    /// token. Esta rota permanece por compatibilidade e aplica as mesmas garantias,
    /// para não ser um caminho mais fraco que o do cadastro.
    /// </remarks>
    /// <response code="200">Usuário criado.</response>
    /// <response code="400">Senha fora da política de segurança.</response>
    /// <response code="409">O e-mail já está cadastrado.</response>
    [HttpPost("create")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (!PasswordHasher.IsStrong(request.Password, out var passwordError))
            return BadRequest(new { error = passwordError });

        if (await userService.EmailExistsAsync(request.Email))
            return Conflict(new { error = "Este e-mail já está em uso." });

        var user = await userService.CreateAsync(request);

        return Ok(user);
    }

    /// <summary>
    /// Atualiza os dados da própria conta. Todos os campos são opcionais.
    /// </summary>
    /// <response code="200">Dados atualizados.</response>
    /// <response code="400">Senha fora da política de segurança.</response>
    /// <response code="403">O id informado não é o do usuário autenticado.</response>
    /// <response code="409">O e-mail já pertence a outra conta.</response>
    [HttpPut("{id:int}/update")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        if (id != userId.Value)
            return Forbid();

        // A troca de senha por aqui não pode burlar a política aplicada no cadastro.
        if (request.Password is not null
            && !PasswordHasher.IsStrong(request.Password, out var passwordError))
            return BadRequest(new { error = passwordError });

        var current = await userService.GetByIdAsync(id);

        if (current is null)
            return NotFound();

        // O e-mail identifica a conta no login: deixar dois iguais tornaria o
        // acesso ambíguo.
        if (request.Email is not null
            && !request.Email.Equals(current.Email, StringComparison.OrdinalIgnoreCase)
            && await userService.EmailExistsAsync(request.Email))
            return Conflict(new { error = "Este e-mail já está em uso." });

        var user = await userService.UpdateAsync(id, request);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    /// <summary>
    /// Exclui a própria conta.
    /// </summary>
    /// <response code="204">Conta excluída.</response>
    /// <response code="403">O id informado não é o do usuário autenticado.</response>
    [HttpDelete("{id:int}/delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = this.GetAuthenticatedUserId();

        if (userId is null)
            return Unauthorized();

        // Sem esta checagem, qualquer usuário autenticado apagaria a conta de outro.
        if (id != userId.Value)
            return Forbid();

        var deleted = await userService.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
