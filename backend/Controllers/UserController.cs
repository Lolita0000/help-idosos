using EloDeCuidado.DTOs;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UserController(IUserService userService) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await userService.GetByIdAsync(id);

        if (user is null)
            return NotFound();

        return Ok(user);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var user = await userService.CreateAsync(request);

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await userService.UpdateAsync(id, request);

        if (user is null)
            return NotFound();

        return Ok(user);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await userService.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}