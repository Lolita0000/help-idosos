using EloDeCuidado.Data;
using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

public class UserServiceTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;

        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoUsuarioNaoExiste()
    {
        // Arrange
        var service = new UserService(_db);

        // Act
        var result = await service.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_DevePersistirUsuario_QuandoDadosValidos()
    {
        // Arrange
        var service = new UserService(_db);
        var request = new CreateUserRequest("Maria", "maria@exemplo.com", "senha123");

        // Act
        var result = await service.CreateAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Maria", result.Name);
        Assert.Equal("maria@exemplo.com", result.Email);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task UpdateAsync_NaoDeveAlterar_CamposEnviadosComoNull()
    {
        // Arrange
        var service = new UserService(_db);

        var user = new User
        {
            Name = "Maria",
            Email = "maria@exemplo.com",
            PasswordHash = "senha123",
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new UpdateUserRequest(null, "novo@email.com", null);

        // Act
        var result = await service.UpdateAsync(user.Id, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Maria", result.Name);
        Assert.Equal("novo@email.com", result.Email);
    }

    [Fact]
    public async Task DeleteAsync_DeveRetornarFalse_QuandoUsuarioNaoExiste()
    {
        // Arrange
        var service = new UserService(_db);

        // Act
        var result = await service.DeleteAsync(999);

        // Assert
        Assert.False(result);
    }
}
