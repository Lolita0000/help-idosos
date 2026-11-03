using EloDeCuidado.Data;
using EloDeCuidado.DTOs.DiaryEntries;
using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

/// <summary>
/// Exclusão de conta e dados pessoais (HU-05, RN-011, RN-012, RN-014).
/// </summary>
public class DeleteAccountTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;
    private int _titularId;
    private int _outroId;

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();

        var titular = new User { Name = "Carlos Pereira", Email = "carlos@teste.com", PasswordHash = "hash" };
        var outro = new User { Name = "Julia Silva", Email = "julia@teste.com", PasswordHash = "hash" };
        _db.Users.AddRange(titular, outro);
        await _db.SaveChangesAsync();

        _titularId = titular.Id;
        _outroId = outro.Id;
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    private UserService Servico() => new(_db);

    private DiaryEntryService Diario() =>
        new(_db, new WorkspaceService(_db), new AuditLogService(_db));

    /// <summary>Cria um workspace com o titular como administrador.</summary>
    private async Task<int> WorkspaceDoTitularAsync(bool comOutroMembro)
    {
        var ws = new Workspace { Name = "Cuidados da Vovo", SubjectName = "Joana Pereira" };
        _db.Workspaces.Add(ws);
        await _db.SaveChangesAsync();

        _db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = ws.Id,
            UserId = _titularId,
            Role = MemberRole.Admin,
        });

        if (comOutroMembro)
            _db.WorkspaceMembers.Add(new WorkspaceMember
            {
                WorkspaceId = ws.Id,
                UserId = _outroId,
                Role = MemberRole.Member,
            });

        await _db.SaveChangesAsync();
        return ws.Id;
    }

    // RN-011: exclusão irreversível dos dados pessoais

    [Fact]
    public async Task DeleteAccountAsync_DeveRemoverOsDadosPessoais()
    {
        var result = await Servico().DeleteAccountAsync(_titularId);

        Assert.Equal(DeleteAccountStatus.Deleted, result.Status);
        Assert.Null(await _db.Users.FindAsync(_titularId));
    }

    [Fact]
    public async Task DeleteAccountAsync_DeveRetornarNotFound_QuandoContaNaoExistir()
    {
        var result = await Servico().DeleteAccountAsync(999);

        Assert.Equal(DeleteAccountStatus.NotFound, result.Status);
    }

    // RN-012: workspace não pode ficar sem administrador

    [Fact]
    public async Task DeleteAccountAsync_DeveRecusar_QuandoAdministraWorkspaceComOutrosMembros()
    {
        // Excluir aqui deixaria o histórico de saúde dos demais participantes
        // sem ninguém com poder de administrar o espaço.

        await WorkspaceDoTitularAsync(comOutroMembro: true);

        var result = await Servico().DeleteAccountAsync(_titularId);

        Assert.Equal(DeleteAccountStatus.AdminHasMembers, result.Status);
        Assert.Equal("Cuidados da Vovo", Assert.Single(result.BlockingWorkspaces!));
        // A conta continua intacta: a recusa não pode ter efeito colateral.
        Assert.NotNull(await _db.Users.FindAsync(_titularId));
    }

    [Fact]
    public async Task DeleteAccountAsync_DevePermitir_QuandoAdministraWorkspaceSozinho()
    {
        // Sem outros participantes, não há histórico de terceiro a preservar.

        var wsId = await WorkspaceDoTitularAsync(comOutroMembro: false);

        var result = await Servico().DeleteAccountAsync(_titularId);

        Assert.Equal(DeleteAccountStatus.Deleted, result.Status);
        // O workspace sem ninguém deixa de existir, senão ficaria inacessível.
        Assert.Null(await _db.Workspaces.FindAsync(wsId));
    }

    [Fact]
    public async Task DeleteAccountAsync_DevePermitir_QuandoEApenasMembroComum()
    {
        // Membro comum saindo não deixa o espaço sem administrador.

        var ws = new Workspace { Name = "Do outro", SubjectName = "Alguem" };
        _db.Workspaces.Add(ws);
        await _db.SaveChangesAsync();
        _db.WorkspaceMembers.AddRange(
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _outroId, Role = MemberRole.Admin },
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _titularId, Role = MemberRole.Member });
        await _db.SaveChangesAsync();

        var result = await Servico().DeleteAccountAsync(_titularId);

        Assert.Equal(DeleteAccountStatus.Deleted, result.Status);
        // O workspace do outro permanece, sem o vínculo de quem saiu.
        Assert.NotNull(await _db.Workspaces.FindAsync(ws.Id));
        Assert.Empty(_db.WorkspaceMembers.Where(m => m.UserId == _titularId));
    }

    // RN-014: autoria anonimizada, conteúdo preservado

    [Fact]
    public async Task DeleteAccountAsync_DevePreservarEntradasComAutoriaAnonimizada()
    {
        // O relato pertence ao histórico de saúde dos demais participantes.
        // Apagar junto removeria dado de quem não pediu exclusão.

        var ws = new Workspace { Name = "Do outro", SubjectName = "Alguem" };
        _db.Workspaces.Add(ws);
        await _db.SaveChangesAsync();
        _db.WorkspaceMembers.AddRange(
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _outroId, Role = MemberRole.Admin },
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _titularId, Role = MemberRole.Member });
        await _db.SaveChangesAsync();

        var criada = await Diario().CreateAsync(
            new CreateDiaryEntryRequest(ws.Id, "Tomou o remedio", "Losartana 50mg", "medication", null),
            _titularId);

        await Servico().DeleteAccountAsync(_titularId);

        var naBase = await _db.DiaryEntries.AsNoTracking().FirstAsync(e => e.Id == criada.Entry!.Id);
        Assert.Null(naBase.AuthorId);
        // O conteúdo permanece: é o histórico do sujeito acompanhado.
        Assert.Equal("Tomou o remedio", naBase.Title);
        Assert.Equal("Losartana 50mg", naBase.Content);
    }

    [Fact]
    public async Task DiarioDeveExibirUsuarioRemovido_ParaEntradaAnonimizada()
    {
        // É a string que o aplicativo já usa no modo demonstração.

        var ws = new Workspace { Name = "Do outro", SubjectName = "Alguem" };
        _db.Workspaces.Add(ws);
        await _db.SaveChangesAsync();
        _db.WorkspaceMembers.AddRange(
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _outroId, Role = MemberRole.Admin },
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _titularId, Role = MemberRole.Member });
        await _db.SaveChangesAsync();

        await Diario().CreateAsync(
            new CreateDiaryEntryRequest(ws.Id, "Entrada", "Texto", "note", null), _titularId);

        await Servico().DeleteAccountAsync(_titularId);

        var lista = await Diario().GetByWorkspaceAsync(ws.Id, _outroId);
        var entrada = Assert.Single(lista!);
        Assert.Equal("Usuário removido", entrada.AuthorName);
        // Id zero não casa com nenhum usuário, então o cliente não oferece editar.
        Assert.Equal(0, entrada.AuthorId);
    }

    [Fact]
    public async Task DeleteAccountAsync_DevePreservarAuditoriaSemOResponsavel()
    {
        // A trilha guarda o que foi feito e quando, perdendo apenas quem fez.

        var ws = new Workspace { Name = "Do outro", SubjectName = "Alguem" };
        _db.Workspaces.Add(ws);
        await _db.SaveChangesAsync();
        _db.WorkspaceMembers.AddRange(
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _outroId, Role = MemberRole.Admin },
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _titularId, Role = MemberRole.Member });
        await _db.SaveChangesAsync();

        var diario = Diario();
        var criada = await diario.CreateAsync(
            new CreateDiaryEntryRequest(ws.Id, "Entrada", "Texto", "note", null), _titularId);
        await diario.UpdateAsync(
            criada.Entry!.Id, new UpdateDiaryEntryRequest("Corrigido", null, null, null), _titularId);

        await Servico().DeleteAccountAsync(_titularId);

        var log = Assert.Single(_db.AuditLogs.AsNoTracking());
        Assert.Null(log.UserId);
        Assert.Equal("diary_entry.updated", log.Action);
    }
}
