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

        var workspace = new Workspace
        {
            Name = "Workspace do Jorginho da Maciota",
            SubjectName = "Jorge da Maciota",
        };
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

        var createRequest = new CreateInviteCodeRequest { WorkspaceId = _workspaceId };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.Equal(8, result!.Code.Length);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task CreateAsync_DeveVincularCodigoAoWorkspace()
    {
        // O WorkspaceId é obrigatório no model: sem ele, a inserção falha por
        // violação de chave estrangeira.

        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest { WorkspaceId = _workspaceId };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.Equal(_workspaceId, result!.WorkspaceId);
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarNull_QuandoWorkspaceNaoExistir()
    {
        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest { WorkspaceId = 999 };

        var result = await service.CreateAsync(createRequest);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_DeveExpirarEm24Horas_QuandoNaoForFornecida()
    {
        // RN-005: o código de convite tem prazo de validade de 24 horas.

        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest { WorkspaceId = _workspaceId };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.Equal(DateTime.UtcNow.AddHours(24), result!.ExpiresAt, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task CreateAsync_DeveLimitarA24Horas_QuandoExpiracaoInformadaUltrapassarOPrazo()
    {
        // Uma expiração distante não pode burlar a RN-005.

        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest
        {
            WorkspaceId = _workspaceId,
            ExpiresAt = DateTime.UtcNow.AddDays(10),
        };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.Equal(DateTime.UtcNow.AddHours(24), result!.ExpiresAt, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task CreateAsync_DeveRespeitarExpiracao_QuandoForMenorQue24Horas()
    {
        var service = new InviteCodeService(_db);

        var expectedExpiration = DateTime.UtcNow.AddHours(2);
        var createRequest = new CreateInviteCodeRequest
        {
            WorkspaceId = _workspaceId,
            ExpiresAt = expectedExpiration,
        };

        var result = await service.CreateAsync(createRequest);

        Assert.NotNull(result);
        Assert.Equal(expectedExpiration, result!.ExpiresAt, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task DeleteAsync_DeveInvalidarCodigoExistente()
    {
        var service = new InviteCodeService(_db);

        var createRequest = new CreateInviteCodeRequest { WorkspaceId = _workspaceId };
        var createdInvite = await service.CreateAsync(createRequest);

        Assert.NotNull(createdInvite);

        var deleteResult = await service.DeleteAsync(createdInvite!.Id);
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
