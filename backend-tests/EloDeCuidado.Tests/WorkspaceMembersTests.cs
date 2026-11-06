using System.Security.Claims;
using EloDeCuidado.Controllers;
using EloDeCuidado.Data;
using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

/// <summary>
/// Remoção de membros e transferência de administração (RN-001, RN-010, RN-012).
/// </summary>
public class WorkspaceMembersTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;
    private int _adminId;
    private int _juliaId;
    private int _robertoId;
    private int _estranhoId;
    private int _workspaceId;

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();

        var admin = new User { Name = "Carlos Pereira", Email = "carlos@teste.com", PasswordHash = "hash" };
        var julia = new User { Name = "Julia Silva", Email = "julia@teste.com", PasswordHash = "hash" };
        var roberto = new User { Name = "Roberto Lima", Email = "roberto@teste.com", PasswordHash = "hash" };
        var estranho = new User { Name = "Maria Souza", Email = "maria@teste.com", PasswordHash = "hash" };
        _db.Users.AddRange(admin, julia, roberto, estranho);
        await _db.SaveChangesAsync();

        (_adminId, _juliaId, _robertoId, _estranhoId) = (admin.Id, julia.Id, roberto.Id, estranho.Id);

        _workspaceId = await CriarWorkspaceAsync("Cuidados da Vovo", _adminId, _juliaId, _robertoId);
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    private async Task<int> CriarWorkspaceAsync(string nome, int adminId, params int[] membros)
    {
        var ws = new Workspace { Name = nome, SubjectName = "Joana Pereira" };
        _db.Workspaces.Add(ws);
        await _db.SaveChangesAsync();

        _db.WorkspaceMembers.Add(new WorkspaceMember { WorkspaceId = ws.Id, UserId = adminId, Role = MemberRole.Admin });
        foreach (var id in membros)
            _db.WorkspaceMembers.Add(new WorkspaceMember { WorkspaceId = ws.Id, UserId = id, Role = MemberRole.Member });
        await _db.SaveChangesAsync();

        return ws.Id;
    }

    private WorkspaceMembersController ComoUsuario(int userId) =>
        new(new WorkspaceMemberService(_db, new AuditLogService(_db)))
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

    private Task<MemberRole?> PapelAsync(int workspaceId, int userId) =>
        _db.WorkspaceMembers
            .Where(m => m.WorkspaceId == workspaceId && m.UserId == userId)
            .Select(m => (MemberRole?)m.Role)
            .FirstOrDefaultAsync();

    // Remover membro

    [Fact]
    public async Task Remover_DeveTirarOMembro_MantendoContaEEntradas()
    {
        _db.DiaryEntries.Add(new DiaryEntry
        {
            WorkspaceId = _workspaceId,
            AuthorId = _juliaId,
            Title = "Consulta",
            Content = "Cardiologista",
            Label = EntryLabel.Appointment,
        });
        await _db.SaveChangesAsync();

        var resultado = await ComoUsuario(_adminId).Remove(_workspaceId, _juliaId);

        Assert.IsType<NoContentResult>(resultado);
        Assert.Null(await PapelAsync(_workspaceId, _juliaId));
        Assert.True(await _db.Users.AnyAsync(u => u.Id == _juliaId));
        Assert.Equal(_juliaId, (await _db.DiaryEntries.SingleAsync()).AuthorId);
    }

    [Fact]
    public async Task Remover_DeveRegistrarNaAuditoria_QuemRemoveEQuemFoiRemovido()
    {
        await ComoUsuario(_adminId).Remove(_workspaceId, _juliaId);

        var log = Assert.Single(_db.AuditLogs);
        Assert.Equal("workspace_member.removed", log.Action);
        Assert.Equal("workspace_member", log.Entity);
        Assert.Equal(_juliaId, log.EntityId);
        Assert.Equal(_adminId, log.UserId);
        Assert.Equal(_workspaceId, log.WorkspaceId);
    }

    [Fact]
    public async Task Remover_NaoDeveAfetarOutroWorkspace()
    {
        var outro = await CriarWorkspaceAsync("Outro espaco", _adminId, _juliaId);

        await ComoUsuario(_adminId).Remove(_workspaceId, _juliaId);

        Assert.Equal(MemberRole.Member, await PapelAsync(outro, _juliaId));
    }

    [Fact]
    public async Task Remover_DeveRecusarMembroComum()
    {
        var resultado = await ComoUsuario(_juliaId).Remove(_workspaceId, _robertoId);

        Assert.IsType<ForbidResult>(resultado);
        Assert.Equal(MemberRole.Member, await PapelAsync(_workspaceId, _robertoId));
        Assert.Empty(_db.AuditLogs);
    }

    [Fact]
    public async Task Remover_DeveRecusarQuemNaoParticipa_EWorkspaceInexistente()
    {
        Assert.IsType<ForbidResult>(await ComoUsuario(_estranhoId).Remove(_workspaceId, _juliaId));
        Assert.IsType<ForbidResult>(await ComoUsuario(_adminId).Remove(9999, _juliaId));
        Assert.Equal(MemberRole.Member, await PapelAsync(_workspaceId, _juliaId));
    }

    [Fact]
    public async Task Remover_DeveRecusarQueOAdministradorSeRemova()
    {
        var resultado = await ComoUsuario(_adminId).Remove(_workspaceId, _adminId);

        Assert.IsType<BadRequestObjectResult>(resultado);
        Assert.Equal(MemberRole.Admin, await PapelAsync(_workspaceId, _adminId));
        Assert.Empty(_db.AuditLogs);
    }

    [Fact]
    public async Task Remover_DeveRecusarRemoverOutroAdministrador()
    {
        (await _db.WorkspaceMembers.SingleAsync(m => m.UserId == _juliaId)).Role = MemberRole.Admin;
        await _db.SaveChangesAsync();

        var resultado = await ComoUsuario(_adminId).Remove(_workspaceId, _juliaId);

        Assert.IsType<BadRequestObjectResult>(resultado);
        Assert.Equal(MemberRole.Admin, await PapelAsync(_workspaceId, _juliaId));
    }

    [Fact]
    public async Task Remover_DeveInformarQuando_APessoaNaoParticipa()
    {
        var resultado = await ComoUsuario(_adminId).Remove(_workspaceId, _estranhoId);

        Assert.IsType<NotFoundObjectResult>(resultado);
        Assert.Empty(_db.AuditLogs);
    }

    // Passar a administração

    [Fact]
    public async Task Transferir_DeveTrocarOsPapeis_NaMesmaOperacao()
    {
        var resultado = await ComoUsuario(_adminId).TransferAdmin(_workspaceId, _juliaId);

        Assert.IsType<NoContentResult>(resultado);
        Assert.Equal(MemberRole.Admin, await PapelAsync(_workspaceId, _juliaId));
        Assert.Equal(MemberRole.Member, await PapelAsync(_workspaceId, _adminId));
        Assert.Equal(1, await _db.WorkspaceMembers.CountAsync(m => m.WorkspaceId == _workspaceId && m.Role == MemberRole.Admin));
        Assert.Equal(MemberRole.Member, await PapelAsync(_workspaceId, _robertoId));
    }

    [Fact]
    public async Task Transferir_DeveRegistrarNaAuditoria()
    {
        await ComoUsuario(_adminId).TransferAdmin(_workspaceId, _juliaId);

        var log = Assert.Single(_db.AuditLogs);
        Assert.Equal("workspace_member.admin_transferred", log.Action);
        Assert.Equal(_juliaId, log.EntityId);
        Assert.Equal(_adminId, log.UserId);
    }

    [Fact]
    public async Task Transferir_PassaAGestaoParaOutraPessoa()
    {
        await ComoUsuario(_adminId).TransferAdmin(_workspaceId, _juliaId);

        Assert.IsType<ForbidResult>(await ComoUsuario(_adminId).Remove(_workspaceId, _robertoId));
        Assert.IsType<NoContentResult>(await ComoUsuario(_juliaId).Remove(_workspaceId, _robertoId));
    }

    [Fact]
    public async Task Transferir_DeveRecusarOsCasosInvalidos_SemMudarNada()
    {
        // Para si mesmo, para quem já é administrador e para quem não participa.
        (await _db.WorkspaceMembers.SingleAsync(m => m.UserId == _robertoId)).Role = MemberRole.Admin;
        await _db.SaveChangesAsync();

        Assert.IsType<BadRequestObjectResult>(await ComoUsuario(_adminId).TransferAdmin(_workspaceId, _adminId));
        Assert.IsType<BadRequestObjectResult>(await ComoUsuario(_adminId).TransferAdmin(_workspaceId, _robertoId));
        Assert.IsType<NotFoundObjectResult>(await ComoUsuario(_adminId).TransferAdmin(_workspaceId, _estranhoId));
        // Quem não administra não passa a administração.
        Assert.IsType<ForbidResult>(await ComoUsuario(_juliaId).TransferAdmin(_workspaceId, _juliaId));
        Assert.IsType<ForbidResult>(await ComoUsuario(_estranhoId).TransferAdmin(_workspaceId, _juliaId));

        Assert.Equal(MemberRole.Admin, await PapelAsync(_workspaceId, _adminId));
        Assert.Equal(MemberRole.Member, await PapelAsync(_workspaceId, _juliaId));
        Assert.Empty(_db.AuditLogs);
    }

    // Conciliação com RN-012: quem passou a administração pode excluir a conta

    [Fact]
    public async Task Transferir_LiberaAExclusaoDaContaDeQuemPassou()
    {
        var antes = await new UserService(_db).DeleteAccountAsync(_adminId);
        Assert.Equal(DeleteAccountStatus.AdminHasMembers, antes.Status);

        await ComoUsuario(_adminId).TransferAdmin(_workspaceId, _juliaId);

        var depois = await new UserService(_db).DeleteAccountAsync(_adminId);
        Assert.Equal(DeleteAccountStatus.Deleted, depois.Status);
        Assert.Equal(MemberRole.Admin, await PapelAsync(_workspaceId, _juliaId));
        Assert.True(await _db.Workspaces.AnyAsync(w => w.Id == _workspaceId));
    }
}
