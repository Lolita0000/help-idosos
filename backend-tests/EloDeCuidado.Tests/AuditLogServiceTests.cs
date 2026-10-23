using EloDeCuidado.Data;
using EloDeCuidado.DTOs.AuditLogs;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

public class AuditLogServiceTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;
    private int _workspaceId;
    private int _userId;

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();

        var user = new User { Name = "Carlos Pereira", Email = "carlos@teste.com", PasswordHash = "x" };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        _userId = user.Id;

        var workspace = new Workspace { Name = "Cuidados da Vovo", SubjectName = "Joana Pereira" };
        _db.Workspaces.Add(workspace);
        await _db.SaveChangesAsync();
        _workspaceId = workspace.Id;
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    private AuditLogService Servico() => new(_db);

    // Critério de aceite: é possível criar um registro

    [Fact]
    public async Task CreateAsync_DeveRegistrarResponsavelEntidadeEMomento()
    {
        // RN-010: identificação do responsável, entidade afetada e timestamp.

        var antes = DateTime.UtcNow;

        var result = await Servico().CreateAsync(
            _workspaceId, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 42);

        Assert.Equal(_workspaceId, result.WorkspaceId);
        Assert.Equal(_userId, result.UserId);
        Assert.Equal("diary_entry.deleted", result.Action);
        Assert.Equal("diary_entry", result.Entity);
        Assert.Equal(42, result.EntityId);
        Assert.InRange(result.Timestamp, antes.AddSeconds(-5), DateTime.UtcNow.AddSeconds(5));
    }

    [Fact]
    public async Task CreateAsync_DeveGravarNoBanco()
    {
        var result = await Servico().CreateAsync(
            _workspaceId, _userId, AuditAction.DiaryEntryUpdated, AuditEntity.DiaryEntry, 7);

        var gravado = await _db.AuditLogs.AsNoTracking().FirstAsync(l => l.Id == result.Id);
        Assert.Equal("diary_entry.updated", gravado.Action);
        Assert.Equal(7, gravado.EntityId);
    }

    // Critério de aceite: é possível deletar um registro

    [Fact]
    public async Task DeleteAsync_DeveRemoverRegistroExistente()
    {
        // Existe para o direito de eliminação da LGPD (#63), não para uso
        // corriqueiro. A tensão entre reter e eliminar é objeto da #61.

        var service = Servico();
        var criado = await service.CreateAsync(
            _workspaceId, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 1);

        Assert.True(await service.DeleteAsync(criado.Id));
        Assert.Empty(_db.AuditLogs);
    }

    [Fact]
    public async Task DeleteAsync_DeveRetornarFalse_QuandoRegistroNaoExistir()
    {
        Assert.False(await Servico().DeleteAsync(999));
    }

    // Critério de aceite: não deve ser possível editar um registro

    [Fact]
    public void IAuditLogService_NaoDeveExporOperacaoDeAlteracao()
    {
        // Um registro de auditoria que pode ser editado não prova nada. A
        // proteção é o contrato não oferecer o caminho: este teste falha se
        // alguém acrescentar um Update ao serviço no futuro.

        var metodos = typeof(IAuditLogService)
            .GetMethods()
            .Select(m => m.Name)
            .ToArray();

        Assert.DoesNotContain("UpdateAsync", metodos);
        Assert.DoesNotContain("Update", metodos);
        Assert.DoesNotContain("EditAsync", metodos);
        Assert.Contains("CreateAsync", metodos);
        Assert.Contains("DeleteAsync", metodos);
    }

    [Fact]
    public void AuditLogResponse_NaoDeveTerCampoDeConteudo()
    {
        // RN-010: o AuditLog não armazena o conteúdo das entradas. Guardar o
        // texto faria a exclusão definitiva da RN-006 deixar de ser definitiva.

        var campos = typeof(AuditLogResponse).GetProperties().Select(p => p.Name).ToArray();

        Assert.DoesNotContain("Content", campos);
        Assert.DoesNotContain("Title", campos);
        Assert.DoesNotContain("Description", campos);
    }

    // Mesma transação (RNF-006)

    [Fact]
    public async Task Record_NaoDeveGravarSozinho()
    {
        // Record apenas enfileira: sem o SaveChanges de quem chamou, nada é
        // gravado. É o que permite o registro entrar na mesma transação da
        // operação auditada.

        Servico().Record(_workspaceId, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 5);

        using var outroContexto = new AppDbContext(
            new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);
        Assert.Empty(outroContexto.AuditLogs);
    }

    [Fact]
    public async Task Record_DeveSerGravadoPeloSaveChangesDeQuemChamou()
    {
        var service = Servico();

        service.Record(_workspaceId, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 5);
        await _db.SaveChangesAsync();

        var log = Assert.Single(_db.AuditLogs);
        Assert.Equal("diary_entry.deleted", log.Action);
        Assert.Equal(5, log.EntityId);
    }

    [Fact]
    public async Task Record_DeveSerDescartado_QuandoAOperacaoFalhar()
    {
        // Esta é a garantia que a RNF-006 exige: se a operação auditada não se
        // concretiza, o registro também não. Aqui a gravação falha por violação
        // de chave estrangeira, e a auditoria não sobrevive à falha.

        var service = Servico();
        service.Record(_workspaceId, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 5);

        // Entrada com workspace inexistente: o SaveChanges inteiro é recusado.
        _db.DiaryEntries.Add(new DiaryEntry
        {
            WorkspaceId = 9999,
            AuthorId = _userId,
            Title = "Invalida",
            Content = "x",
            CreatedAt = DateTime.UtcNow,
        });

        await Assert.ThrowsAnyAsync<Exception>(() => _db.SaveChangesAsync());

        using var outroContexto = new AppDbContext(
            new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);
        Assert.Empty(outroContexto.AuditLogs);
    }

    // Consulta

    [Fact]
    public async Task GetByWorkspaceAsync_DeveListarDoMaisRecenteParaOMaisAntigo()
    {
        var service = Servico();
        var primeiro = await service.CreateAsync(
            _workspaceId, _userId, AuditAction.DiaryEntryUpdated, AuditEntity.DiaryEntry, 1);
        var entidade = await _db.AuditLogs.FindAsync(primeiro.Id);
        entidade!.Timestamp = DateTime.UtcNow.AddHours(-1);
        await _db.SaveChangesAsync();
        var segundo = await service.CreateAsync(
            _workspaceId, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 2);

        var lista = await service.GetByWorkspaceAsync(_workspaceId);

        Assert.Equal([segundo.Id, primeiro.Id], lista.Select(l => l.Id));
    }

    [Fact]
    public async Task GetByWorkspaceAsync_NaoDeveVazarRegistroDeOutroWorkspace()
    {
        var outro = new Workspace { Name = "Outro", SubjectName = "Outra Pessoa" };
        _db.Workspaces.Add(outro);
        await _db.SaveChangesAsync();

        var service = Servico();
        await service.CreateAsync(_workspaceId, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 1);
        await service.CreateAsync(outro.Id, _userId, AuditAction.DiaryEntryDeleted, AuditEntity.DiaryEntry, 2);

        var lista = await service.GetByWorkspaceAsync(_workspaceId);

        Assert.Equal(1, Assert.Single(lista).EntityId);
    }
}
