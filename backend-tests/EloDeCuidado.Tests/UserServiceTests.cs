using EloDeCuidado.DTOs;
using EloDeCuidado.Services;
using NSubstitute;

namespace EloDeCuidado.Tests;

public class UserServiceTests
{
    [Fact]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoUsuarioNaoExiste()
    {
        var service = Substitute.For<IUserService>();
        service.GetByIdAsync(999).Returns((UserResponse?)null);

        var result = await service.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_NaoDeveAlterar_CamposEnviadosComoNull()
    {
        var service = Substitute.For<IUserService>();
        var request = new UpdateUserRequest(null, "novo@email.com", null);

        var expected = new UserResponse(1, "Maria", "novo@email.com", DateTime.UtcNow);
        service.UpdateAsync(1, request).Returns(expected);

        var result = await service.UpdateAsync(1, request);

        Assert.NotNull(result);
        Assert.Equal("Maria", result.Name);
        Assert.Equal("novo@email.com", result.Email);
    }
}