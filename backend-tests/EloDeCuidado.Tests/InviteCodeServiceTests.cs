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

    [Fact]
    public async Task GetWorkspaceIdAsync_DeveApontarOWorkspaceDoCodigo()
    {
        // As rotas de convite decidem a autorização a partir deste valor: sem ele
        // não há como saber qual workspace o código abre.

        var service = new InviteCodeService(_db);
        var criado = await service.CreateAsync(new CreateInviteCodeRequest { WorkspaceId = _workspaceId });

        Assert.Equal(_workspaceId, await service.GetWorkspaceIdAsync(criado!.Id));
    }

    [Fact]
    public async Task GetWorkspaceIdAsync_DeveRetornarNull_QuandoCodigoNaoExistir()
    {
        // Código inexistente não tem workspace, e a rota responde 403 igual ao
        // caso de código alheio, para não revelar quais ids existem.

        var service = new InviteCodeService(_db);

        Assert.Null(await service.GetWorkspaceIdAsync(999));
    }

    // HU-03, ingresso por código de convite

    /// <summary>
    /// Cria um código no workspace da fixture. Quando <paramref name="expiresAt"/> é
    /// informado, sobrescreve a expiração direto na entidade, porque o serviço
    /// limita a 24 horas e não permitiria gravar uma data no passado.
    /// </summary>
    private async Task<string> NovoCodigoAsync(DateTime? expiresAt = null)
    {
        var service = new InviteCodeService(_db);
        var criado = await service.CreateAsync(new CreateInviteCodeRequest { WorkspaceId = _workspaceId });

        if (expiresAt is not null)
        {
            var entidade = await _db.InviteCodes.FindAsync(criado!.Id);
            entidade!.ExpiresAt = expiresAt.Value;
            await _db.SaveChangesAsync();
        }

        return criado!.Code;
    }

    [Fact]
    public async Task JoinAsync_DeveVincularComoMembroComum_QuandoCodigoValido()
    {
        // RN-004: quem entra por convite é membro comum, não administrador.

        var service = new InviteCodeService(_db);
        var codigo = await NovoCodigoAsync();

        var result = await service.JoinAsync(codigo, userId: 42);

        Assert.Equal(JoinStatus.Joined, result.Status);
        Assert.Equal(_workspaceId, result.WorkspaceId);

        var membro = Assert.Single(_db.WorkspaceMembers.Where(m => m.UserId == 42));
        Assert.Equal(MemberRole.Member, membro.Role);
        Assert.False(membro.IsSubject);
    }

    [Fact]
    public async Task JoinAsync_DeveAceitarCodigoComHifenEMinusculas()
    {
        // O código é exibido como KHO6-NY67. Exigir a forma exata quebraria o
        // uso normal, porque a pessoa digita o que vê.

        var service = new InviteCodeService(_db);
        var codigo = await NovoCodigoAsync();
        var digitado = $"{codigo[..4]}-{codigo[4..]}".ToLowerInvariant();

        var result = await service.JoinAsync(digitado, userId: 7);

        Assert.Equal(JoinStatus.Joined, result.Status);
        Assert.Single(_db.WorkspaceMembers.Where(m => m.UserId == 7));
    }

    [Fact]
    public async Task JoinAsync_DeveRecusarENaoInserirMembro_QuandoCodigoExpirado()
    {
        // RN-005: código com mais de 24 horas não é aceito.

        var service = new InviteCodeService(_db);
        var codigo = await NovoCodigoAsync(DateTime.UtcNow.AddMinutes(-1));

        var result = await service.JoinAsync(codigo, userId: 42);

        Assert.Equal(JoinStatus.Expired, result.Status);
        Assert.Empty(_db.WorkspaceMembers.Where(m => m.UserId == 42));
    }

    [Fact]
    public async Task JoinAsync_DeveRecusar_QuandoCodigoInexistente()
    {
        var service = new InviteCodeService(_db);

        var result = await service.JoinAsync("ZZZZ9999", userId: 42);

        Assert.Equal(JoinStatus.NotFound, result.Status);
        Assert.Null(result.WorkspaceId);
        Assert.Empty(_db.WorkspaceMembers.Where(m => m.UserId == 42));
    }

    [Fact]
    public async Task JoinAsync_DeveRecusar_QuandoCodigoEmBranco()
    {
        // Distinto de código inexistente: a rota responde 400, e não 404.

        var service = new InviteCodeService(_db);

        var result = await service.JoinAsync("  ", userId: 42);

        Assert.Equal(JoinStatus.Empty, result.Status);
        Assert.Empty(_db.WorkspaceMembers.Where(m => m.UserId == 42));
    }

    [Fact]
    public async Task JoinAsync_NaoDeveDuplicarVinculo_QuandoUsuarioJaEMembro()
    {
        var service = new InviteCodeService(_db);
        var codigo = await NovoCodigoAsync();
        await service.JoinAsync(codigo, userId: 42);

        var result = await service.JoinAsync(codigo, userId: 42);

        Assert.Equal(JoinStatus.AlreadyMember, result.Status);
        Assert.Single(_db.WorkspaceMembers.Where(m => m.UserId == 42));
    }

    [Fact]
    public async Task JoinAsync_NaoDeveRebaixarAdministrador_QuandoEleUsaOProprioCodigo()
    {
        // O administrador já participa: o reingresso cai em AlreadyMember e o
        // papel dele continua intacto, sem virar membro comum.

        var service = new InviteCodeService(_db);
        _db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = _workspaceId,
            UserId = 1,
            Role = MemberRole.Admin,
        });
        await _db.SaveChangesAsync();
        var codigo = await NovoCodigoAsync();

        var result = await service.JoinAsync(codigo, userId: 1);

        Assert.Equal(JoinStatus.AlreadyMember, result.Status);
        var membro = Assert.Single(_db.WorkspaceMembers.Where(m => m.UserId == 1));
        Assert.Equal(MemberRole.Admin, membro.Role);
    }
}
