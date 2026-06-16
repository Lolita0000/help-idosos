using EloDeCuidado.Data;
using EloDeCuidado.DTOs;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

public class WorkspaceServiceTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private DbContextOptions<AppDbContext> _options = null!;
    private AppDbContext _db = null!;
    private int _existingWorkspaceId;
    private const string InitialWorkspaceName = "Workspace Inicial de Teste";

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();
        
        await using var cmd = _connection.CreateCommand();
        cmd.CommandText = "PRAGMA foreign_keys = OFF;";
        await cmd.ExecuteNonQueryAsync();

        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new AppDbContext(_options);
        await _db.Database.EnsureCreatedAsync();

        // Semeia um registro inicial necessário para testar queries, updates e deletes
        var workspace = new Workspace { Name = InitialWorkspaceName };
        _db.Workspaces.Add(workspace);
        await _db.SaveChangesAsync();
        
        _existingWorkspaceId = workspace.Id;
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarWorkspace_QuandoIdExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);

        // Act
        var result = await service.GetByIdAsync(_existingWorkspaceId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(_existingWorkspaceId, result!.Id);
        Assert.Equal(InitialWorkspaceName, result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoIdNaoExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);

        // Act
        var result = await service.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_DeveSalvarWorkspaceComSucesso()
    {
        // Arrange
        var service = new WorkspaceService(_db);
        // CORREÇÃO: Passando o argumento diretamente no construtor posicional do Record
        var request = new CreateWorkspaceRequest("Workspace do Charlinho");

        // Act
        var result = await service.CreateAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal("Workspace do Charlinho", result.Name);

        // Validação com contexto isolado para garantir persistência física no banco
        using var contextCheck = new AppDbContext(_options);
        var dbCheck = await contextCheck.Workspaces.FindAsync(result.Id);
        Assert.NotNull(dbCheck);
        Assert.Equal("Workspace do Charlinho", dbCheck!.Name);
    }

    [Fact]
    public async Task UpdateAsync_DeveAtualizarNome_QuandoIdExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);
        // CORREÇÃO: Passando o argumento diretamente no construtor posicional do Record
        var request = new UpdateWorkspaceRequest("Workspace Atualizado Super Novo");

        // Act
        var result = await service.UpdateAsync(_existingWorkspaceId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Workspace Atualizado Super Novo", result!.Name);

        // Validação com contexto isolado para mitigar o cache do Identity Map
        using var contextCheck = new AppDbContext(_options);
        var dbCheck = await contextCheck.Workspaces.FindAsync(_existingWorkspaceId);
        Assert.NotNull(dbCheck);
        Assert.Equal("Workspace Atualizado Super Novo", dbCheck!.Name);
    }

    [Fact]
    public async Task UpdateAsync_DeveRetornarNull_QuandoIdNaoExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);
        // CORREÇÃO: Passando o argumento diretamente no construtor posicional do Record
        var request = new UpdateWorkspaceRequest("Workspace Fantasma");

        // Act
        var result = await service.UpdateAsync(999, request);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_DeveRemoverWorkspace_QuandoIdExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);

        // Act
        var deleteResult = await service.DeleteAsync(_existingWorkspaceId);

        // Assert
        Assert.True(deleteResult);

        // Validação com contexto isolado
        using var contextCheck = new AppDbContext(_options);
        var dbCheck = await contextCheck.Workspaces.FindAsync(_existingWorkspaceId);
        Assert.Null(dbCheck);
    }

    [Fact]
    public async Task DeleteAsync_DeveRetornarFalse_QuandoIdNaoExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);

        // Act
        var deleteResult = await service.DeleteAsync(999);

        // Assert
        Assert.False(deleteResult);
    }
}