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
    private int _outsiderUserId;
    private const string InitialWorkspaceName = "Workspace Inicial de Teste";
    private const string InitialSubjectName = "Joana Pereira";
    private const string CreatorName = "Carlos Pereira";
    private const string OutsiderName = "Julia Silva";

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
        // Segundo usuário, sem vínculo com o workspace da fixture, usado para
        // verificar o isolamento entre participantes.
        var outsider = new User
        {
            Name = OutsiderName,
            Email = "julia@gmail.com",
            PasswordHash = "hash-irrelevante-para-este-teste",
        };

        _db.Users.AddRange(creator, outsider);
        await _db.SaveChangesAsync();

        _creatorUserId = creator.Id;
        _outsiderUserId = outsider.Id;

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
    public async Task GetByUserAsync_DeveRetornarApenasOsWorkspacesDoUsuario()
    {
        // RNF-002: um usuário não acessa dados de workspace do qual não participa.

        // Arrange
        var service = new WorkspaceService(_db);
        await service.CreateAsync(
            new CreateWorkspaceRequest("Cuidados da Vovo", "Joana Pereira", null), _creatorUserId);
        await service.CreateAsync(
            new CreateWorkspaceRequest("Pos Cirurgia do Tio", "Roberto Silva", null), _outsiderUserId);

        // Act
        var doCriador = await service.GetByUserAsync(_creatorUserId);
        var doOutro = await service.GetByUserAsync(_outsiderUserId);

        // Assert
        Assert.Equal("Cuidados da Vovo", Assert.Single(doCriador).Name);
        Assert.Equal("Pos Cirurgia do Tio", Assert.Single(doOutro).Name);
    }

    [Fact]
    public async Task GetByUserAsync_DeveOrdenarDoMaisRecenteParaOMaisAntigo()
    {
        // Arrange
        var service = new WorkspaceService(_db);
        await service.CreateAsync(
            new CreateWorkspaceRequest("Primeiro", "Sujeito Um", null), _creatorUserId);
        await service.CreateAsync(
            new CreateWorkspaceRequest("Segundo", "Sujeito Dois", null), _creatorUserId);

        // Act
        var result = await service.GetByUserAsync(_creatorUserId);

        // Assert
        Assert.Collection(
            result,
            primeiro => Assert.Equal("Segundo", primeiro.Name),
            segundo => Assert.Equal("Primeiro", segundo.Name));
    }

    [Fact]
    public async Task GetByUserAsync_DeveFiltrarPeloPapelDoSolicitante()
    {
        // Abas Admin e Membro da listagem.

        // Arrange
        var service = new WorkspaceService(_db);
        var proprio = await service.CreateAsync(
            new CreateWorkspaceRequest("Onde sou admin", "Sujeito", null), _creatorUserId);

        // O criador participa de um segundo workspace como membro comum.
        var deTerceiro = await service.CreateAsync(
            new CreateWorkspaceRequest("Onde sou membro", "Sujeito", null), _outsiderUserId);
        _db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = deTerceiro.Id,
            UserId = _creatorUserId,
            Role = MemberRole.Member,
        });
        await _db.SaveChangesAsync();

        // Act
        var comoAdmin = await service.GetByUserAsync(_creatorUserId, MemberRole.Admin);
        var comoMembro = await service.GetByUserAsync(_creatorUserId, MemberRole.Member);
        var todos = await service.GetByUserAsync(_creatorUserId);

        // Assert
        Assert.Equal(proprio.Id, Assert.Single(comoAdmin).Id);
        Assert.Equal(deTerceiro.Id, Assert.Single(comoMembro).Id);
        Assert.Equal(2, todos.Count);
    }

    [Fact]
    public async Task GetByUserAsync_DeveExporOPapelDoSolicitante()
    {
        // Badge exibido no card da listagem.

        // Arrange
        var service = new WorkspaceService(_db);
        await service.CreateAsync(
            new CreateWorkspaceRequest("Cuidados da Vovo", "Joana Pereira", null), _creatorUserId);

        // Act
        var result = await service.GetByUserAsync(_creatorUserId);

        // Assert
        Assert.Equal("admin", Assert.Single(result).MyRole);
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarPapelNulo_QuandoSolicitanteNaoParticipa()
    {
        // Arrange
        var service = new WorkspaceService(_db);
        var criado = await service.CreateAsync(
            new CreateWorkspaceRequest("Cuidados da Vovo", "Joana Pereira", null), _creatorUserId);

        // Act
        var result = await service.GetByIdAsync(criado.Id, _outsiderUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result!.MyRole);
    }

    [Fact]
    public async Task GetMembersAsync_DeveListarParticipantesComSeusPapeis()
    {
        // Arrange
        var service = new WorkspaceService(_db);
        var criado = await service.CreateAsync(
            new CreateWorkspaceRequest("Cuidados da Vovo", "Joana Pereira", null), _creatorUserId);

        _db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = criado.Id,
            UserId = _outsiderUserId,
            Role = MemberRole.Member,
        });
        await _db.SaveChangesAsync();

        // Act
        var members = await service.GetMembersAsync(criado.Id);

        // Assert: administradores primeiro, como na tela de membros.
        Assert.NotNull(members);
        Assert.Collection(
            members!,
            primeiro =>
            {
                Assert.Equal(CreatorName, primeiro.Name);
                Assert.Equal("admin", primeiro.Role);
            },
            segundo =>
            {
                Assert.Equal(OutsiderName, segundo.Name);
                Assert.Equal("member", segundo.Role);
            });
    }

    [Fact]
    public async Task GetMembersAsync_DeveRetornarNull_QuandoWorkspaceNaoExistir()
    {
        // Arrange
        var service = new WorkspaceService(_db);

        // Act
        var members = await service.GetMembersAsync(999);

        // Assert
        Assert.Null(members);
    }

    [Fact]
    public async Task IsMemberAsync_DeveDistinguirParticipanteDeNaoParticipante()
    {
        // Base da restrição de acesso aos membros do workspace.

        // Arrange
        var service = new WorkspaceService(_db);
        var criado = await service.CreateAsync(
            new CreateWorkspaceRequest("Cuidados da Vovo", "Joana Pereira", null), _creatorUserId);

        // Act & Assert
        Assert.True(await service.IsMemberAsync(criado.Id, _creatorUserId));
        Assert.False(await service.IsMemberAsync(criado.Id, _outsiderUserId));
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