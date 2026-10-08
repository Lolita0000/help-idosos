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
    private int _creatorUserId;
    private const string InitialWorkspaceName = "Workspace Inicial de Teste";
    private const string InitialSubjectName = "Joana Pereira";
    private const string CreatorName = "Carlos Pereira";

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

        var creator = new User
        {
            Name = CreatorName,
            Email = "carlosp@gmail.com",
            PasswordHash = "hash-irrelevante-para-este-teste",
        };
        _db.Users.Add(creator);
        await _db.SaveChangesAsync();

        _creatorUserId = creator.Id;

        var workspace = new Workspace
        {
            Name = InitialWorkspaceName,
            SubjectName = InitialSubjectName,
        };
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
        var request = new CreateWorkspaceRequest(
            "Workspace do Charlinho", "Charles Silva", "Acompanhamento pos-cirurgico");

        // Act
        var result = await service.CreateAsync(request, _creatorUserId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal("Workspace do Charlinho", result.Name);
        Assert.Equal("Charles Silva", result.SubjectName);
        Assert.Equal("Acompanhamento pos-cirurgico", result.Description);

        using var contextCheck = new AppDbContext(_options);
        var dbCheck = await contextCheck.Workspaces.FindAsync(result.Id);
        Assert.NotNull(dbCheck);
        Assert.Equal("Workspace do Charlinho", dbCheck!.Name);
        Assert.Equal("Charles Silva", dbCheck.SubjectName);
    }

    [Fact]
    public async Task CreateAsync_DeveVincularCriadorComoAdministrador()
    {
        // RN-001: ao criar um workspace, o criador assume o papel de administrador.

        // Arrange
        var service = new WorkspaceService(_db);
        var request = new CreateWorkspaceRequest("Cuidados da Vovo", "Joana Pereira", null);

        // Act
        var result = await service.CreateAsync(request, _creatorUserId);

        // Assert
        using var contextCheck = new AppDbContext(_options);
        var members = await contextCheck.WorkspaceMembers
            .Where(m => m.WorkspaceId == result.Id)
            .ToListAsync();

        var admin = Assert.Single(members);
        Assert.Equal(_creatorUserId, admin.UserId);
        Assert.Equal(MemberRole.Admin, admin.Role);

        // O sujeito acompanhado nao recebe acesso automatico: ele e apenas
        // identificado por nome ate ingressar por codigo de convite.
        Assert.False(admin.IsSubject);
    }

    [Fact]
    public async Task CreateAsync_DeveExporAutorEContagemDeMembros()
    {
        // Dados exibidos no card da listagem de workspaces.

        // Arrange
        var service = new WorkspaceService(_db);
        var request = new CreateWorkspaceRequest("Cuidados da Vovo", "Joana Pereira", null);

        // Act
        var result = await service.CreateAsync(request, _creatorUserId);

        // Assert
        Assert.Equal(CreatorName, result.CreatedBy);
        Assert.Equal(1, result.MemberCount);
    }

    [Fact]
    public async Task UpdateAsync_DeveAtualizarNome_QuandoIdExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);
        var request = new UpdateWorkspaceRequest("Workspace Atualizado Super Novo", null, null);

        // Act
        var result = await service.UpdateAsync(_existingWorkspaceId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Workspace Atualizado Super Novo", result!.Name);

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
        var request = new UpdateWorkspaceRequest("Workspace Fantasma", null, null);

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