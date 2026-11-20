using System.Security.Claims;
using EloDeCuidado.Controllers;
using EloDeCuidado.Data;
using EloDeCuidado.DTOs.DiaryEntries;
using EloDeCuidado.DTOs.InviteCode;
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

    // Sujeito acompanhado (RN-002, HU-11)

    private Task<bool> EhSujeitoAsync(int userId) =>
        _db.WorkspaceMembers
            .Where(m => m.WorkspaceId == _workspaceId && m.UserId == userId)
            .Select(m => m.IsSubject)
            .SingleAsync();

    private DiaryEntryService Diario() => new(_db, new WorkspaceService(_db), new AuditLogService(_db));

    private Task<DiaryEntryResult> RegistrarAsync(int autorId, string titulo) =>
        Diario().CreateAsync(new(_workspaceId, titulo, "Dormi bem e me senti disposta.", "mood", null), autorId);

    [Fact]
    public async Task Sujeito_AdministradorMarcaUmMembro_ERegistraNaAuditoria()
    {
        var resultado = await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);

        Assert.IsType<NoContentResult>(resultado);
        Assert.True(await EhSujeitoAsync(_juliaId));
        var log = Assert.Single(_db.AuditLogs);
        Assert.Equal("workspace_member.subject_changed", log.Action);
        Assert.Equal(_juliaId, log.EntityId);
    }

    [Fact]
    public async Task Sujeito_MarcarOutro_DesmarcaOAnterior()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _robertoId);

        Assert.False(await EhSujeitoAsync(_juliaId));
        Assert.True(await EhSujeitoAsync(_robertoId));
        Assert.Equal(1, await _db.WorkspaceMembers.CountAsync(m => m.WorkspaceId == _workspaceId && m.IsSubject));
    }

    [Fact]
    public async Task Sujeito_AdministradorPodeSerOSujeito()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _adminId);

        Assert.True(await EhSujeitoAsync(_adminId));
    }

    [Fact]
    public async Task Sujeito_Desmarcar_DeixaOWorkspaceSemSujeitoMarcado()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);

        var resultado = await ComoUsuario(_adminId).UnmarkSubject(_workspaceId, _juliaId);

        Assert.IsType<NoContentResult>(resultado);
        Assert.False(await EhSujeitoAsync(_juliaId));
    }

    [Fact]
    public async Task Sujeito_RepetirOMesmoPedido_NaoAuditaDeNovo()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);

        Assert.Single(_db.AuditLogs);
    }

    [Fact]
    public async Task Sujeito_RecusaQuemNaoAdministra_EQuemNaoParticipa()
    {
        Assert.IsType<ForbidResult>(await ComoUsuario(_juliaId).MarkSubject(_workspaceId, _juliaId));
        Assert.IsType<ForbidResult>(await ComoUsuario(_estranhoId).MarkSubject(_workspaceId, _juliaId));
        Assert.IsType<NotFoundObjectResult>(await ComoUsuario(_adminId).MarkSubject(_workspaceId, _estranhoId));

        Assert.False(await EhSujeitoAsync(_juliaId));
        Assert.Empty(_db.AuditLogs);
    }

    [Fact]
    public async Task Entrada_DoSujeito_SaiIdentificadaComoDaPerspectivaDele()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);

        var dela = await RegistrarAsync(_juliaId, "Como me sinto hoje");
        var doAdmin = await RegistrarAsync(_adminId, "Observacao do cuidador");

        Assert.True(dela.Entry!.FromSubject);
        Assert.False(doAdmin.Entry!.FromSubject);
        // Todos os membros enxergam as duas no histórico, cada uma com a sua marca.
        var lista = await Diario().GetByWorkspaceAsync(_workspaceId, _robertoId);
        Assert.Equal(2, lista!.Count);
        Assert.Single(lista, e => e.FromSubject);
    }

    [Fact]
    public async Task Entrada_DeQuemNaoEhSujeito_NaoCarregaAMarca()
    {
        var resultado = await RegistrarAsync(_juliaId, "Observacao comum");

        Assert.False(resultado.Entry!.FromSubject);
    }

    [Fact]
    public async Task Entrada_ContinuaDoSujeito_DepoisQueOutraPessoaPassaASer()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);
        var antiga = await RegistrarAsync(_juliaId, "Registrada quando eu era o sujeito");

        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _robertoId);
        var depois = await RegistrarAsync(_juliaId, "Agora sou so membro");

        var lista = await Diario().GetByWorkspaceAsync(_workspaceId, _adminId);
        Assert.True(lista!.Single(e => e.Id == antiga.Entry!.Id).FromSubject);
        Assert.False(lista!.Single(e => e.Id == depois.Entry!.Id).FromSubject);
    }

    [Fact]
    public async Task Entrada_DoSujeito_EditarNaoMudaAMarca_EOsMesmosFluxosValem()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);
        var criada = await RegistrarAsync(_juliaId, "Primeira versao");

        var editada = await Diario().UpdateAsync(criada.Entry!.Id, new(null, "Segunda versao", null, null), _juliaId);
        var invalida = await Diario().CreateAsync(new(_workspaceId, "  ", "texto", "mood", null), _juliaId);
        var alheia = await Diario().UpdateAsync(criada.Entry.Id, new(null, "Invasao", null, null), _robertoId);

        Assert.Equal(DiaryEntryStatus.Ok, editada.Status);
        Assert.True(editada.Entry!.FromSubject);
        Assert.Equal(DiaryEntryStatus.Invalid, invalida.Status);
        Assert.Equal(DiaryEntryStatus.NotAuthor, alheia.Status);
    }

    // Convite para a pessoa acompanhada (HU-11, RN-002)

    private InviteCodeService Convites() => new(_db);

    private async Task<string> GerarConviteAsync(bool paraSujeito)
    {
        var criado = await Convites().CreateAsync(new CreateInviteCodeRequest
        {
            WorkspaceId = _workspaceId,
            ForSubject = paraSujeito,
        });

        Assert.Equal(paraSujeito, criado!.ForSubject);
        return criado.Code;
    }

    [Fact]
    public async Task Convite_ParaSujeito_QuemEntraJaSaiMarcada_ComoMembroComum()
    {
        var codigo = await GerarConviteAsync(paraSujeito: true);

        var resultado = await Convites().JoinAsync(codigo, _estranhoId);

        Assert.Equal(JoinStatus.Joined, resultado.Status);
        var vinculo = await _db.WorkspaceMembers.SingleAsync(m => m.WorkspaceId == _workspaceId && m.UserId == _estranhoId);
        Assert.True(vinculo.IsSubject);
        Assert.Equal(MemberRole.Member, vinculo.Role);
    }

    [Fact]
    public async Task Convite_ParaSujeito_TiraAMarcaDeQuemJaEra()
    {
        await ComoUsuario(_adminId).MarkSubject(_workspaceId, _juliaId);
        var codigo = await GerarConviteAsync(paraSujeito: true);

        await Convites().JoinAsync(codigo, _estranhoId);

        Assert.False(await EhSujeitoAsync(_juliaId));
        Assert.True(await EhSujeitoAsync(_estranhoId));
        Assert.Equal(1, await _db.WorkspaceMembers.CountAsync(m => m.WorkspaceId == _workspaceId && m.IsSubject));
    }

    [Fact]
    public async Task Convite_ParaSujeito_ServeUmaVezSo()
    {
        var outro = new User { Name = "Pedro Alves", Email = "pedro@teste.com", PasswordHash = "hash" };
        _db.Users.Add(outro);
        await _db.SaveChangesAsync();
        var codigo = await GerarConviteAsync(paraSujeito: true);

        await Convites().JoinAsync(codigo, _estranhoId);
        var segundo = await Convites().JoinAsync(codigo, outro.Id);

        Assert.Equal(JoinStatus.Expired, segundo.Status);
        Assert.False(await _db.WorkspaceMembers.AnyAsync(m => m.WorkspaceId == _workspaceId && m.UserId == outro.Id));
        Assert.True(await EhSujeitoAsync(_estranhoId));
    }

    [Fact]
    public async Task Convite_Comum_NaoMarcaNinguem_ECodigoContinuaValendo()
    {
        var outro = new User { Name = "Pedro Alves", Email = "pedro@teste.com", PasswordHash = "hash" };
        _db.Users.Add(outro);
        await _db.SaveChangesAsync();
        var codigo = await GerarConviteAsync(paraSujeito: false);

        await Convites().JoinAsync(codigo, _estranhoId);
        var segundo = await Convites().JoinAsync(codigo, outro.Id);

        Assert.Equal(JoinStatus.Joined, segundo.Status);
        Assert.False(await EhSujeitoAsync(_estranhoId));
        Assert.False(await EhSujeitoAsync(outro.Id));
        Assert.Empty(_db.AuditLogs);
    }

    [Fact]
    public async Task Convite_ParaSujeito_QuemJaEhMembro_NaoMudaNada_ENaoGastaOCodigo()
    {
        var codigo = await GerarConviteAsync(paraSujeito: true);

        var resultado = await Convites().JoinAsync(codigo, _robertoId);

        Assert.Equal(JoinStatus.AlreadyMember, resultado.Status);
        Assert.False(await EhSujeitoAsync(_robertoId));
        // Continua valendo para a pessoa certa.
        Assert.Equal(JoinStatus.Joined, (await Convites().JoinAsync(codigo, _estranhoId)).Status);
    }

    [Fact]
    public async Task Convite_ParaSujeito_RegistraNaAuditoria_QuemPassouASerOSujeito()
    {
        var codigo = await GerarConviteAsync(paraSujeito: true);

        await Convites().JoinAsync(codigo, _estranhoId);

        var log = Assert.Single(_db.AuditLogs);
        Assert.Equal("workspace_member.subject_changed", log.Action);
        Assert.Equal(_estranhoId, log.EntityId);
        Assert.Equal(_estranhoId, log.UserId);
    }

    [Fact]
    public async Task Convite_ParaSujeito_AEntradaDaPessoaQueEntrouSaiComAPerspectivaDela()
    {
        var codigo = await GerarConviteAsync(paraSujeito: true);
        await Convites().JoinAsync(codigo, _estranhoId);

        var entrada = await RegistrarAsync(_estranhoId, "Meu primeiro relato");

        Assert.True(entrada.Entry!.FromSubject);
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
