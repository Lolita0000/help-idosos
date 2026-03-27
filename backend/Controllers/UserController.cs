using EloDeCuidado.DTOs;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints para gerenciamento de usuários.
/// </summary>
[ApiController]
[Route("api/users")]
public sealed class UserController(IUserService userService) : ControllerBase
{
    /// <summary>
    /// Retorna os dados de um usuário pelo ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await userService.GetByIdAsync(id);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    /// <summary>
    /// Cria um novo usuário.
    /// </summary>
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var user = await userService.CreateAsync(request);

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    /// <summary>
    /// Atualiza os dados de um usuário existente. Todos os campos são opcionais.
    /// </summary>
    [HttpPut("{id}/update")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await userService.UpdateAsync(id, request);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    /// <summary>
    /// Deleta um usuário pelo ID.
    /// </summary>
    [HttpDelete("{id}/delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await userService.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}