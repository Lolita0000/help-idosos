using EloDeCuidado.Data;
using EloDeCuidado.DTOs.InviteCode;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

public class InviteCodeServiceTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;
    private int _workspaceId;

    // todo: transformar em helper global se possível
    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();
        await using var cmd = _connection.CreateCommand();
        cmd.CommandText = "PRAGMA foreign_keys = OFF;";
        await cmd.ExecuteNonQueryAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;

        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();

        var workspace = new Workspace { Name = "Workspace do Jorginho da Maciota" };
        _db.Workspaces.Add(workspace);
        await _db.SaveChangesAsync();
        _workspaceId = workspace.Id;
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    [Fact]
    public async Task GenerateAsync_DeveGerarCodigoValido()
    {
        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest { ExpiresAt = DateTime.UtcNow.AddDays(10) };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.Equal(8, result.Code.Length);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task CreateAsync_DeveDefinirDataExpiracaoPadrao_QuandoNaoForFornecida()
    {
        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest { ExpiresAt = null };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.True(
            result.ExpiresAt > DateTime.UtcNow.AddDays(6)
                && result.ExpiresAt <= DateTime.UtcNow.AddDays(7)
        );
    }

    [Fact]
    public async Task CreateAsync_DeveDefinirDataExpiracao_QuandoForFornecida()
    {
        var service = new InviteCodeService(_db);

        var expectedExpiration = DateTime.UtcNow.AddDays(10);
        var createRequest = new CreateInviteCodeRequest { ExpiresAt = expectedExpiration };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.Equal(expectedExpiration, result.ExpiresAt, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task DeleteAsync_DeveInvalidarCodigoExistente()
    {
        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest { ExpiresAt = DateTime.UtcNow.AddDays(10) };
        var createdInvite = await service.CreateAsync(createRequest);

        var deleteResult = await service.DeleteAsync(createdInvite.Id);
        Assert.True(deleteResult);

        var getResult = await service.GetByIdAsync(createdInvite.Id);
        Assert.Null(getResult);
    }

    [Fact]
    public async Task DeleteAsync_DeveRetornarFalse_QuandoCodigoNaoExistir()
    {
        var service = new InviteCodeService(_db);

        var deleteResult = await service.DeleteAsync(999);
        Assert.False(deleteResult);
    }
}
