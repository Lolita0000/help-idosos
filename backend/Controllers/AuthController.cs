using EloDeCuidado.DTOs.Auth;
using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Services;
using EloDeCuidado.Services.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

/// <summary>
/// Endpoints de cadastro e autenticação de usuários.
/// </summary>
[ApiController]
[Route("api/auth")]
public sealed class AuthController(IUserService userService, ITokenService tokenService)
    : ControllerBase
{
    /// <summary>
    /// Cria uma conta e já autentica o usuário, retornando o token.
    /// </summary>
    /// <param name="request">Nome, e-mail e senha.</param>
    /// <response code="200">Conta criada. Retorna o token e os dados do usuário.</response>
    /// <response code="400">Senha fora da política de segurança.</response>
    /// <response code="409">O e-mail já está cadastrado.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
    {
        if (!PasswordHasher.IsStrong(request.Password, out var passwordError))
            return BadRequest(new { error = passwordError });

        if (await userService.EmailExistsAsync(request.Email))
            return Conflict(new { error = "Este e-mail já está em uso." });

        await userService.CreateAsync(request);

        // Recupera a entidade para emitir o token com os dados persistidos.
        var user = await userService.GetByEmailAsync(request.Email);

        if (user is null)
            return Problem("Não foi possível concluir o cadastro.");

        var (token, expiresAt) = tokenService.Generate(user);

        return Ok(new AuthResponse(token, expiresAt, ToResponse.User(user)));
    }

    /// <summary>
    /// Autentica um usuário por e-mail e senha.
    /// </summary>
    /// <param name="request">Credenciais de acesso.</param>
    /// <response code="200">Autenticado. Retorna o token e os dados do usuário.</response>
    /// <response code="401">Credenciais inválidas.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userService.GetByEmailAsync(request.Email);

        // A resposta é a mesma para e-mail inexistente e senha incorreta, para não
        // revelar quais e-mails estão cadastrados.
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { error = "E-mail ou senha incorretos." });

        var (token, expiresAt) = tokenService.Generate(user);

        return Ok(new AuthResponse(token, expiresAt, ToResponse.User(user)));
    }
}
