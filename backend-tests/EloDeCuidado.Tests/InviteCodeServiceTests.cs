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
    // HU-03 — Entrar por convite

    private async Task<string> NovoCodigoAsync(DateTime? expiresAt = null)
    {
        var service = new InviteCodeService(_db);
        var created = await service.CreateAsync(new CreateInviteCodeRequest { WorkspaceId = _workspaceId });
        if (expiresAt is not null)
        {
            var entity = await _db.InviteCodes.FindAsync(created!.Id);
            entity!.ExpiresAt = expiresAt.Value;
            await _db.SaveChangesAsync();
        }
        return created!.Code;
    }

    [Fact]
    public async Task JoinAsync_DeveVincularComoMembro_QuandoCodigoValido()
    {
        var service = new InviteCodeService(_db);
        var code = await NovoCodigoAsync();

        var result = await service.JoinAsync(code, userId: 42);

        Assert.Equal(JoinStatus.Joined, result.Status);
        Assert.Equal(_workspaceId, result.WorkspaceId);
        var member = Assert.Single(_db.WorkspaceMembers.Where(m => m.UserId == 42));
        Assert.Equal(MemberRole.Member, member.Role);
        Assert.False(member.IsSubject);
    }

    [Fact]
    public async Task JoinAsync_DeveAceitarCodigoComHifenEMinusculas()
    {
        var service = new InviteCodeService(_db);
        var code = await NovoCodigoAsync();
        var digitado = $"{code[..4]}-{code[4..]}".ToLowerInvariant();

        var result = await service.JoinAsync(digitado, userId: 7);

        Assert.Equal(JoinStatus.Joined, result.Status);
    }

    [Fact]
    public async Task JoinAsync_DeveRecusar_QuandoCodigoExpirado()
    {
        // RN-005: código com mais de 24 horas não é aceito.
        var service = new InviteCodeService(_db);
        var code = await NovoCodigoAsync(DateTime.UtcNow.AddMinutes(-1));

        var result = await service.JoinAsync(code, userId: 42);

        Assert.Equal(JoinStatus.Expired, result.Status);
        Assert.Empty(_db.WorkspaceMembers.Where(m => m.UserId == 42));
    }

    [Fact]
    public async Task JoinAsync_DeveRecusar_QuandoCodigoInexistente()
    {
        var service = new InviteCodeService(_db);

        var result = await service.JoinAsync("ZZZZ9999", userId: 42);

        Assert.Equal(JoinStatus.NotFound, result.Status);
        Assert.Empty(_db.WorkspaceMembers.Where(m => m.UserId == 42));
    }

    [Fact]
    public async Task JoinAsync_NaoDeveDuplicarVinculo_QuandoUsuarioJaEMembro()
    {
        var service = new InviteCodeService(_db);
        var code = await NovoCodigoAsync();
        await service.JoinAsync(code, userId: 42);

        var result = await service.JoinAsync(code, userId: 42);

        Assert.Equal(JoinStatus.AlreadyMember, result.Status);
        Assert.Single(_db.WorkspaceMembers.Where(m => m.UserId == 42));
    }

    [Fact]
    public async Task JoinAsync_DeveRecusar_QuandoCodigoEmBranco()
    {
        var service = new InviteCodeService(_db);

        var result = await service.JoinAsync("  ", userId: 42);

        Assert.Equal(JoinStatus.Empty, result.Status);
    }

    [Fact]
    public async Task IsAdminAsync_DeveDistinguirAdministradorDeMembro()
    {
        var service = new InviteCodeService(_db);
        _db.WorkspaceMembers.Add(new WorkspaceMember { WorkspaceId = _workspaceId, UserId = 1, Role = MemberRole.Admin });
        _db.WorkspaceMembers.Add(new WorkspaceMember { WorkspaceId = _workspaceId, UserId = 2, Role = MemberRole.Member });
        await _db.SaveChangesAsync();

        Assert.True(await service.IsAdminAsync(_workspaceId, 1));
        Assert.False(await service.IsAdminAsync(_workspaceId, 2));
        Assert.False(await service.IsAdminAsync(_workspaceId, 3));
    }

    [Fact]
    public async Task GetByWorkspaceAsync_DeveListarDoMaisRecenteParaOMaisAntigo()
    {
        var service = new InviteCodeService(_db);
        var primeiro = await service.CreateAsync(new CreateInviteCodeRequest { WorkspaceId = _workspaceId });
        var entity = await _db.InviteCodes.FindAsync(primeiro!.Id);
        entity!.CreatedAt = DateTime.UtcNow.AddHours(-1);
        await _db.SaveChangesAsync();
        var segundo = await service.CreateAsync(new CreateInviteCodeRequest { WorkspaceId = _workspaceId });

        var lista = await service.GetByWorkspaceAsync(_workspaceId);

        Assert.Equal(new[] { segundo!.Id, primeiro.Id }, lista.Select(c => c.Id));
    }
}
