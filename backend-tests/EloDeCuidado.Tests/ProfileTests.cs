using System.Security.Claims;
using EloDeCuidado.Controllers;
using EloDeCuidado.Data;
using EloDeCuidado.DTOs;
using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using EloDeCuidado.Services.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

/// <summary>
/// Dados pessoais da conta (#64) e validação da criação de workspace.
/// </summary>
public class ProfileTests : IAsyncLifetime
{
    private static readonly DateOnly Hoje = new(2026, 11, 3);

    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;
    private int _userId;
    private int _otherId;

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();
        _db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);
        await _db.Database.EnsureCreatedAsync();

        var user = new User { Name = "Carlos Pereira", Email = "carlos@teste.com", PasswordHash = "hash" };
        var other = new User { Name = "Julia Silva", Email = "julia@teste.com", PasswordHash = "hash", Phone = "61988887777" };
        _db.Users.AddRange(user, other);
        await _db.SaveChangesAsync();
        _userId = user.Id;
        _otherId = other.Id;
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    private UserController UserComo(int id) => new(new UserService(_db))
    {
        ControllerContext = Contexto(id),
    };

    private WorkspaceController WorkspaceComo(int id) => new(new WorkspaceService(_db))
    {
        ControllerContext = Contexto(id),
    };

    private static ControllerContext Contexto(int id) => new()
    {
        HttpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, id.ToString())], "teste")),
        },
    };

    // Leitura e edição

    [Fact]
    public async Task Perfil_DeveComecarSemDadosOpcionais()
    {
        var ok = Assert.IsType<OkObjectResult>(await UserComo(_userId).GetProfile());
        var perfil = Assert.IsType<ProfileResponse>(ok.Value);

        Assert.Equal("Carlos Pereira", perfil.Name);
        Assert.Null(perfil.Phone);
        Assert.Null(perfil.BirthDate);
        Assert.Null(perfil.Gender);
    }

    [Fact]
    public async Task Editar_DevePersistirTelefoneSoComDigitos()
    {
        var req = new UpdateProfileRequest(null, "(61) 99999-0000", new DateOnly(1950, 5, 20), false, "feminino");

        Assert.IsType<OkObjectResult>(await UserComo(_userId).UpdateProfile(req));

        var salvo = await _db.Users.AsNoTracking().SingleAsync(u => u.Id == _userId);
        Assert.Equal("61999990000", salvo.Phone);
        Assert.Equal(new DateOnly(1950, 5, 20), salvo.BirthDate);
        Assert.Equal("feminino", salvo.Gender);
        Assert.Equal("Carlos Pereira", salvo.Name);
    }

    [Fact]
    public async Task Editar_CampoOmitidoNaoMuda_EVazioApaga()
    {
        await UserComo(_userId).UpdateProfile(new UpdateProfileRequest(null, "61999990000", new DateOnly(1950, 5, 20), false, "outro"));

        // Só o nome: o resto fica.
        await UserComo(_userId).UpdateProfile(new UpdateProfileRequest("  Carlos P. Silva ", null, null));
        var meio = await _db.Users.AsNoTracking().SingleAsync(u => u.Id == _userId);
        Assert.Equal("Carlos P. Silva", meio.Name);
        Assert.Equal("61999990000", meio.Phone);
        Assert.Equal("outro", meio.Gender);

        // Vazio e ClearBirthDate apagam.
        await UserComo(_userId).UpdateProfile(new UpdateProfileRequest(null, "", null, true, ""));
        var fim = await _db.Users.AsNoTracking().SingleAsync(u => u.Id == _userId);
        Assert.Null(fim.Phone);
        Assert.Null(fim.BirthDate);
        Assert.Null(fim.Gender);
    }

    [Fact]
    public async Task Editar_NaoDeveAlterarDadosDeOutraConta()
    {
        await UserComo(_userId).UpdateProfile(new UpdateProfileRequest("Novo Nome", "61911112222", null));

        var outro = await _db.Users.AsNoTracking().SingleAsync(u => u.Id == _otherId);
        Assert.Equal("Julia Silva", outro.Name);
        Assert.Equal("61988887777", outro.Phone);
    }

    [Fact]
    public async Task Editar_Invalido_NaoGrava()
    {
        var resultado = await UserComo(_userId).UpdateProfile(new UpdateProfileRequest("   ", "123", null));

        Assert.IsType<BadRequestObjectResult>(resultado);
        var salvo = await _db.Users.AsNoTracking().SingleAsync(u => u.Id == _userId);
        Assert.Equal("Carlos Pereira", salvo.Name);
        Assert.Null(salvo.Phone);
    }

    // Regras de validação

    [Theory]
    [InlineData("6199999000")]       // 10 dígitos: fixo
    [InlineData("61999990000")]      // 11 dígitos: celular
    [InlineData("(61) 3333-4444")]
    [InlineData("")]                 // vazio apaga
    [InlineData(null)]
    public void Telefone_Valido(string? telefone) =>
        Assert.Null(ProfileRules.Validate(new UpdateProfileRequest(null, telefone, null), Hoje));

    [Theory]
    [InlineData("12345")]
    [InlineData("619999900001")]     // 12 dígitos
    [InlineData("0699990000")]       // DDD começando em 0
    [InlineData("abcdefghij")]
    public void Telefone_Invalido(string telefone) =>
        Assert.NotNull(ProfileRules.Validate(new UpdateProfileRequest(null, telefone, null), Hoje));

    [Fact]
    public void Nascimento_NaoPodeSerNoFuturoNemAntesDe1900()
    {
        Assert.NotNull(ProfileRules.Validate(new UpdateProfileRequest(null, null, Hoje.AddDays(1)), Hoje));
        Assert.NotNull(ProfileRules.Validate(new UpdateProfileRequest(null, null, new DateOnly(1899, 12, 31)), Hoje));
        Assert.Null(ProfileRules.Validate(new UpdateProfileRequest(null, null, Hoje), Hoje));
        Assert.Null(ProfileRules.Validate(new UpdateProfileRequest(null, null, new DateOnly(1900, 1, 1)), Hoje));
    }

    [Theory]
    [InlineData("feminino", true)]
    [InlineData("nao_informar", true)]
    [InlineData("Feminino", false)]
    [InlineData("alienigena", false)]
    public void Genero_SoAceitaOsValoresDefinidos(string genero, bool valido) =>
        Assert.Equal(valido, ProfileRules.Validate(new UpdateProfileRequest(null, null, null, false, genero), Hoje) is null);

    [Fact]
    public void Nome_NaoPodeFicarEmBrancoNemExcederOLimite()
    {
        Assert.NotNull(ProfileRules.Validate(new UpdateProfileRequest("  ", null, null), Hoje));
        Assert.NotNull(ProfileRules.Validate(new UpdateProfileRequest(new string('a', 257), null, null), Hoje));
        Assert.Null(ProfileRules.Validate(new UpdateProfileRequest(new string('a', 256), null, null), Hoje));
    }

    // Criação de workspace: validação no servidor (pendente da #65)

    [Theory]
    [InlineData("", "Joana")]
    [InlineData("Espaco", "   ")]
    [InlineData("Espaco", null)]
    public async Task CriarWorkspace_DeveRetornar400_QuandoNomeOuSujeitoFaltar(string nome, string? sujeito)
    {
        var resultado = await WorkspaceComo(_userId).Create(new CreateWorkspaceRequest(nome, sujeito!, null));

        Assert.IsType<BadRequestObjectResult>(resultado);
        Assert.False(await _db.Workspaces.AnyAsync());
    }

    [Fact]
    public async Task CriarWorkspace_DeveRetornar400_AcimaDoLimiteDaColuna()
    {
        var resultado = await WorkspaceComo(_userId).Create(
            new CreateWorkspaceRequest(new string('a', 101), "Joana", null));

        Assert.IsType<BadRequestObjectResult>(resultado);
        Assert.False(await _db.Workspaces.AnyAsync());
    }

    [Fact]
    public async Task CriarWorkspace_DeveApararOsTextos()
    {
        await WorkspaceComo(_userId).Create(new CreateWorkspaceRequest("  Espaco  ", " Joana ", "  desc "));

        var ws = await _db.Workspaces.SingleAsync();
        Assert.Equal("Espaco", ws.Name);
        Assert.Equal("Joana", ws.SubjectName);
        Assert.Equal("desc", ws.Description);
    }
}
