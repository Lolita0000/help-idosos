using System.Security.Claims;
using EloDeCuidado.Controllers;
using EloDeCuidado.Data;
using EloDeCuidado.DTOs;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

/// <summary>
/// Zona de Perigo do workspace: exclusão, edição e totais (#65, RN-012).
/// </summary>
/// <remarks>
/// Usa chaves estrangeiras ativas: a cascata é do banco, e sem elas o teste
/// passaria mesmo com a exclusão deixando registros órfãos.
/// </remarks>
public class WorkspaceDeletionTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;
    private int _adminId;
    private int _memberId;
    private int _workspaceId;
    private int _otherWorkspaceId;

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();

        var admin = new User { Name = "Carlos Pereira", Email = "carlos@teste.com", PasswordHash = "hash" };
        var member = new User { Name = "Julia Silva", Email = "julia@teste.com", PasswordHash = "hash" };
        _db.Users.AddRange(admin, member);
        await _db.SaveChangesAsync();

        _adminId = admin.Id;
        _memberId = member.Id;

        _workspaceId = await CriarWorkspaceAsync("Cuidados da Vovo");
        _otherWorkspaceId = await CriarWorkspaceAsync("Outro espaco");
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    /// <summary>Workspace com admin, um membro, um convite, duas entradas e um registro de auditoria.</summary>
    private async Task<int> CriarWorkspaceAsync(string nome)
    {
        var ws = new Workspace { Name = nome, SubjectName = "Joana Pereira" };
        _db.Workspaces.Add(ws);
        await _db.SaveChangesAsync();

        _db.WorkspaceMembers.AddRange(
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _adminId, Role = MemberRole.Admin },
            new WorkspaceMember { WorkspaceId = ws.Id, UserId = _memberId, Role = MemberRole.Member });
        _db.InviteCodes.Add(new InviteCode
        {
            WorkspaceId = ws.Id,
            Code = Guid.NewGuid().ToString("N")[..8],
            ExpiresAt = DateTime.UtcNow.AddHours(24),
        });
        _db.DiaryEntries.AddRange(
            new DiaryEntry { WorkspaceId = ws.Id, AuthorId = _adminId, Title = "Remedio", Content = "Losartana", Label = EntryLabel.Medication },
            new DiaryEntry { WorkspaceId = ws.Id, AuthorId = _memberId, Title = "Consulta", Content = "Cardiologista", Label = EntryLabel.Appointment });
        _db.AuditLogs.Add(new AuditLog
        {
            WorkspaceId = ws.Id,
            UserId = _adminId,
            Action = "DiaryEntryUpdated",
            Entity = "DiaryEntry",
            EntityId = 1,
        });
        await _db.SaveChangesAsync();

        return ws.Id;
    }

    private WorkspaceController ComoUsuario(int userId) => new(new WorkspaceService(_db))
    {
        ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId.ToString())], "teste")),
            },
        },
    };

    // Exclusão

    [Fact]
    public async Task Excluir_DeveRemoverTudoQuePertenceAoWorkspace()
    {
        var resultado = await ComoUsuario(_adminId).Delete(_workspaceId);

        Assert.IsType<NoContentResult>(resultado);
        Assert.False(await _db.Workspaces.AnyAsync(w => w.Id == _workspaceId));
        Assert.False(await _db.WorkspaceMembers.AnyAsync(m => m.WorkspaceId == _workspaceId));
        Assert.False(await _db.InviteCodes.AnyAsync(i => i.WorkspaceId == _workspaceId));
        Assert.False(await _db.DiaryEntries.AnyAsync(e => e.WorkspaceId == _workspaceId));
        Assert.False(await _db.AuditLogs.AnyAsync(a => a.WorkspaceId == _workspaceId));
    }

    [Fact]
    public async Task Excluir_NaoDeveAfetarOutroWorkspaceNemAsContas()
    {
        await ComoUsuario(_adminId).Delete(_workspaceId);

        Assert.True(await _db.Workspaces.AnyAsync(w => w.Id == _otherWorkspaceId));
        Assert.Equal(2, await _db.WorkspaceMembers.CountAsync(m => m.WorkspaceId == _otherWorkspaceId));
        Assert.Equal(2, await _db.DiaryEntries.CountAsync(e => e.WorkspaceId == _otherWorkspaceId));
        Assert.Equal(1, await _db.InviteCodes.CountAsync(i => i.WorkspaceId == _otherWorkspaceId));
        Assert.Equal(2, await _db.Users.CountAsync());
    }

    [Fact]
    public async Task Excluir_DeveRetornar403_QuandoForMembroComum()
    {
        var resultado = await ComoUsuario(_memberId).Delete(_workspaceId);

        Assert.IsType<ForbidResult>(resultado);
        Assert.True(await _db.Workspaces.AnyAsync(w => w.Id == _workspaceId));
        Assert.Equal(2, await _db.DiaryEntries.CountAsync(e => e.WorkspaceId == _workspaceId));
    }

    [Fact]
    public async Task Excluir_DeveRetornar403_QuandoWorkspaceNaoExistir()
    {
        var resultado = await ComoUsuario(_adminId).Delete(999);

        Assert.IsType<ForbidResult>(resultado);
    }

    // Edição

    [Fact]
    public async Task Editar_DevePersistirNomeEDescricao()
    {
        var resultado = await ComoUsuario(_adminId).Update(
            _workspaceId, new UpdateWorkspaceRequest("  Cuidados da Vovo Joana  ", null, "Rotina de remedios"));

        var ok = Assert.IsType<OkObjectResult>(resultado);
        var resposta = Assert.IsType<WorkspaceResponse>(ok.Value);
        Assert.Equal("Cuidados da Vovo Joana", resposta.Name);

        var salvo = await _db.Workspaces.AsNoTracking().SingleAsync(w => w.Id == _workspaceId);
        Assert.Equal("Cuidados da Vovo Joana", salvo.Name);
        Assert.Equal("Rotina de remedios", salvo.Description);
        Assert.Equal("Joana Pereira", salvo.SubjectName);
    }

    [Fact]
    public async Task Editar_DeveRetornar403_QuandoForMembroComum()
    {
        var resultado = await ComoUsuario(_memberId).Update(
            _workspaceId, new UpdateWorkspaceRequest("Invasao", null, null));

        Assert.IsType<ForbidResult>(resultado);
        var salvo = await _db.Workspaces.AsNoTracking().SingleAsync(w => w.Id == _workspaceId);
        Assert.Equal("Cuidados da Vovo", salvo.Name);
    }

    [Theory]
    [InlineData("   ", null)]
    [InlineData("", null)]
    [InlineData(null, "   ")]
    public async Task Editar_DeveRetornar400_QuandoNomeOuSujeitoFicarEmBranco(string? nome, string? sujeito)
    {
        var resultado = await ComoUsuario(_adminId).Update(
            _workspaceId, new UpdateWorkspaceRequest(nome, sujeito, null));

        Assert.IsType<BadRequestObjectResult>(resultado);
        var salvo = await _db.Workspaces.AsNoTracking().SingleAsync(w => w.Id == _workspaceId);
        Assert.Equal("Cuidados da Vovo", salvo.Name);
        Assert.Equal("Joana Pereira", salvo.SubjectName);
    }

    [Fact]
    public async Task Editar_DeveRetornar400_QuandoExcederOLimiteDaColuna()
    {
        var resultado = await ComoUsuario(_adminId).Update(
            _workspaceId, new UpdateWorkspaceRequest(new string('a', 101), null, null));

        Assert.IsType<BadRequestObjectResult>(resultado);
    }

    // Totais

    [Fact]
    public async Task Totais_DeveContarMembrosEEntradasSoDoWorkspace()
    {
        var resultado = await ComoUsuario(_adminId).GetStats(_workspaceId);

        var ok = Assert.IsType<OkObjectResult>(resultado);
        var stats = Assert.IsType<WorkspaceStatsResponse>(ok.Value);
        Assert.Equal(2, stats.MemberCount);
        Assert.Equal(2, stats.EntryCount);
    }

    [Fact]
    public async Task Totais_DeveRetornar403_QuandoNaoParticipar()
    {
        var estranho = new User { Name = "Pedro", Email = "pedro@teste.com", PasswordHash = "hash" };
        _db.Users.Add(estranho);
        await _db.SaveChangesAsync();

        var resultado = await ComoUsuario(estranho.Id).GetStats(_workspaceId);

        Assert.IsType<ForbidResult>(resultado);
    }
}
