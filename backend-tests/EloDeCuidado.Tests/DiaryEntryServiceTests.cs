using System.Text.Json;
using EloDeCuidado.Data;
using EloDeCuidado.DTOs.DiaryEntries;
using EloDeCuidado.Models;
using EloDeCuidado.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Tests;

public class DiaryEntryServiceTests : IAsyncLifetime
{
    private SqliteConnection _connection = null!;
    private AppDbContext _db = null!;
    private int _workspaceId;
    private int _autorId;
    private int _outroMembroId;
    private int _estranhoId;

    public async ValueTask InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();

        var autor = new User { Name = "Carlos Pereira", Email = "carlos@teste.com", PasswordHash = "x" };
        var outro = new User { Name = "Julia Silva", Email = "julia@teste.com", PasswordHash = "x" };
        // Terceiro usuário sem vínculo, para verificar o isolamento entre workspaces.
        var estranho = new User { Name = "Roberto Lima", Email = "roberto@teste.com", PasswordHash = "x" };
        _db.Users.AddRange(autor, outro, estranho);
        await _db.SaveChangesAsync();

        _autorId = autor.Id;
        _outroMembroId = outro.Id;
        _estranhoId = estranho.Id;

        var workspace = new Workspace { Name = "Cuidados da Vovo", SubjectName = "Joana Pereira" };
        _db.Workspaces.Add(workspace);
        await _db.SaveChangesAsync();
        _workspaceId = workspace.Id;

        _db.WorkspaceMembers.AddRange(
            new WorkspaceMember { WorkspaceId = _workspaceId, UserId = _autorId, Role = MemberRole.Admin },
            new WorkspaceMember { WorkspaceId = _workspaceId, UserId = _outroMembroId, Role = MemberRole.Member });
        await _db.SaveChangesAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    private DiaryEntryService Servico() => new(_db, new WorkspaceService(_db));

    private CreateDiaryEntryRequest Nova(
        string? titulo = "Tomou o remédio da pressão",
        string? conteudo = "Losartana 50mg às 8h, sem reclamar de tontura.",
        string? categoria = "medication",
        int? humor = null) =>
        new(_workspaceId, titulo, conteudo, categoria, humor);

    // HU-04, registrar entrada

    [Fact]
    public async Task CreateAsync_DeveRegistrarEntrada_ComAutoriaDoServidor()
    {
        var service = Servico();

        var result = await service.CreateAsync(Nova(), _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal(_autorId, result.Entry!.AuthorId);
        Assert.Equal("Carlos Pereira", result.Entry.AuthorName);
        Assert.Equal("medication", result.Entry.Label);
        Assert.False(result.Entry.Edited);
        Assert.Null(result.Entry.EditedAt);
    }

    [Fact]
    public async Task CreateAsync_DeveIgnorarAutoriaEHorarioForjadosPeloCliente()
    {
        // RF05: a autoria e o horário são atribuídos pelo servidor, não informados
        // pelo cliente. Aqui o corpo chega como chegaria pela API, com authorId e
        // createdAt forjados, e o resultado prova que nenhum dos dois sobreviveu.
        //
        // Sem isso, qualquer pessoa registraria observação de saúde em nome de
        // outra, e como a autoria decide quem pode editar (RN-008), também
        // conseguiria travar a edição para o autor verdadeiro.

        var corpoForjado = $$"""
        {
          "workspaceId": {{_workspaceId}},
          "title": "Entrada forjada",
          "content": "Tentativa de atribuir a outro autor.",
          "label": "note",
          "authorId": {{_outroMembroId}},
          "createdAt": "2020-01-01T00:00:00Z"
        }
        """;

        // JsonSerializerDefaults.Web reproduz a desserialização do ASP.NET Core.
        var request = JsonSerializer.Deserialize<CreateDiaryEntryRequest>(
            corpoForjado, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;

        var antes = DateTime.UtcNow;
        var result = await Servico().CreateAsync(request, _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);

        // A autoria é de quem está autenticado, não do id enviado no corpo.
        Assert.Equal(_autorId, result.Entry!.AuthorId);
        Assert.NotEqual(_outroMembroId, result.Entry.AuthorId);

        // O horário é o do servidor, não o de 2020 enviado pelo cliente.
        Assert.InRange(result.Entry.CreatedAt, antes.AddSeconds(-5), DateTime.UtcNow.AddSeconds(5));
        Assert.NotEqual(2020, result.Entry.CreatedAt.Year);

        // Confirma no banco, e não apenas no DTO devolvido.
        var gravada = await _db.DiaryEntries.AsNoTracking().FirstAsync(e => e.Id == result.Entry.Id);
        Assert.Equal(_autorId, gravada.AuthorId);
        Assert.NotEqual(2020, gravada.CreatedAt.Year);
    }

    [Fact]
    public void CreateDiaryEntryRequest_NaoDeveTerCampoDeAutoriaNemDeHorario()
    {
        // A proteção acima não depende de validação em tempo de execução: o
        // contrato simplesmente não tem onde guardar autoria ou horário. Este
        // teste falha se alguém acrescentar esses campos ao DTO no futuro.

        var campos = typeof(CreateDiaryEntryRequest)
            .GetProperties()
            .Select(p => p.Name)
            .ToArray();

        Assert.DoesNotContain("AuthorId", campos);
        Assert.DoesNotContain("CreatedAt", campos);
        Assert.DoesNotContain("Author", campos);
    }

    [Fact]
    public async Task CreateAsync_DeveAceitarCategoriaEmQualquerCaixa()
    {
        // O cliente não deve depender da grafia exata do enum.
        var service = Servico();

        var result = await service.CreateAsync(Nova(categoria: "SYMPTOM"), _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal("symptom", result.Entry!.Label);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateAsync_DeveRecusar_QuandoTituloEmBranco(string? titulo)
    {
        // O título é obrigatório por decisão de requisito.
        var service = Servico();

        var result = await service.CreateAsync(Nova(titulo: titulo), _autorId);

        Assert.Equal(DiaryEntryStatus.Invalid, result.Status);
        Assert.Empty(_db.DiaryEntries);
    }

    [Fact]
    public async Task CreateAsync_DeveRecusar_QuandoDescricaoEmBranco()
    {
        var service = Servico();

        var result = await service.CreateAsync(Nova(conteudo: "  "), _autorId);

        Assert.Equal(DiaryEntryStatus.Invalid, result.Status);
        Assert.Empty(_db.DiaryEntries);
    }

    [Fact]
    public async Task CreateAsync_DeveRecusar_QuandoCategoriaInvalida()
    {
        var service = Servico();

        var result = await service.CreateAsync(Nova(categoria: "inexistente"), _autorId);

        Assert.Equal(DiaryEntryStatus.Invalid, result.Status);
        Assert.Empty(_db.DiaryEntries);
    }

    [Fact]
    public async Task CreateAsync_DeveRecusar_QuandoNaoParticipaDoWorkspace()
    {
        // RNF-002: o diário tem observações de saúde e só é acessível a quem participa.
        var service = Servico();

        var result = await service.CreateAsync(Nova(), _estranhoId);

        Assert.Equal(DiaryEntryStatus.NotMember, result.Status);
        Assert.Empty(_db.DiaryEntries);
    }

    // Escala de humor

    [Fact]
    public async Task CreateAsync_DeveGravarEscala_QuandoCategoriaForMood()
    {
        var service = Servico();

        var result = await service.CreateAsync(Nova(categoria: "mood", humor: 4), _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal(4, result.Entry!.MoodLevel);
    }

    [Fact]
    public async Task CreateAsync_DeveAceitarMoodSemEscala()
    {
        // A escala é opcional: humor é categoria de registro, não medição
        // obrigatória. A tela do diário (#86) oferece a categoria Humor sem
        // pedir nota, e exigir a escala a deixaria inutilizável no aplicativo.

        var service = Servico();

        var result = await service.CreateAsync(Nova(categoria: "mood"), _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal("mood", result.Entry!.Label);
        Assert.Null(result.Entry.MoodLevel);
    }

    [Fact]
    public async Task UpdateAsync_DeveAceitarMoodSemEscala()
    {
        // O mesmo vale ao editar: o aplicativo envia categoria, título e
        // descrição juntos, sempre com a escala nula.

        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.UpdateAsync(
            criada.Entry!.Id,
            new UpdateDiaryEntryRequest("Humor hoje", null, "mood", null),
            _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal("mood", result.Entry!.Label);
        Assert.Null(result.Entry.MoodLevel);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    public async Task CreateAsync_DeveRecusar_QuandoEscalaForaDe1a5(int humor)
    {
        var service = Servico();

        var result = await service.CreateAsync(Nova(categoria: "mood", humor: humor), _autorId);

        Assert.Equal(DiaryEntryStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task CreateAsync_DeveRecusar_QuandoEscalaEmCategoriaQueNaoEMood()
    {
        // Recusar, e não ignorar em silêncio: o cliente estaria enviando um dado
        // que nunca seria devolvido.
        var service = Servico();

        var result = await service.CreateAsync(Nova(categoria: "note", humor: 3), _autorId);

        Assert.Equal(DiaryEntryStatus.Invalid, result.Status);
    }

    // HU-06, editar entrada

    [Fact]
    public async Task UpdateAsync_DeveAlterarEMarcarComoEditada()
    {
        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.UpdateAsync(
            criada.Entry!.Id, new UpdateDiaryEntryRequest("Corrigido", null, null, null), _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal("Corrigido", result.Entry!.Title);
        Assert.True(result.Entry.Edited);
        Assert.NotNull(result.Entry.EditedAt);
        // O que não foi informado permanece.
        Assert.Equal(criada.Entry.Content, result.Entry.Content);
    }

    [Fact]
    public async Task UpdateAsync_DeveRecusar_QuandoNaoForOAutor()
    {
        // RN-008: um relato de saúde alterado por terceiros perde a confiabilidade.
        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.UpdateAsync(
            criada.Entry!.Id, new UpdateDiaryEntryRequest("Invadido", null, null, null), _outroMembroId);

        Assert.Equal(DiaryEntryStatus.NotAuthor, result.Status);
        var naBase = await _db.DiaryEntries.FindAsync(criada.Entry.Id);
        Assert.Equal(criada.Entry.Title, naBase!.Title);
    }

    [Fact]
    public async Task UpdateAsync_DeveDescartarEscala_QuandoSairDaCategoriaMood()
    {
        // Sem isso, a entrada guardaria um humor que a categoria nova não exibe.
        var service = Servico();
        var criada = await service.CreateAsync(Nova(categoria: "mood", humor: 5), _autorId);

        var result = await service.UpdateAsync(
            criada.Entry!.Id, new UpdateDiaryEntryRequest(null, null, "note", null), _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal("note", result.Entry!.Label);
        Assert.Null(result.Entry.MoodLevel);
    }

    [Fact]
    public async Task UpdateAsync_DeveRecusar_QuandoTituloFicarEmBranco()
    {
        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.UpdateAsync(
            criada.Entry!.Id, new UpdateDiaryEntryRequest("   ", null, null, null), _autorId);

        Assert.Equal(DiaryEntryStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task UpdateAsync_DeveRetornarNotFound_QuandoEntradaNaoExistir()
    {
        var service = Servico();

        var result = await service.UpdateAsync(
            999, new UpdateDiaryEntryRequest("x", null, null, null), _autorId);

        Assert.Equal(DiaryEntryStatus.NotFound, result.Status);
    }

    // HU-07, excluir entrada

    [Fact]
    public async Task DeleteAsync_DeveRemoverDoBancoDeFormaDefinitiva()
    {
        // RN-006: a exclusão é física, sem status de excluída e sem recuperação.
        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.DeleteAsync(criada.Entry!.Id, _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Empty(_db.DiaryEntries);
    }

    [Fact]
    public async Task DeleteAsync_DeveRecusar_QuandoForMembroComumENaoAutor()
    {
        // RN-007: membro comum não remove registro alheio.
        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.DeleteAsync(criada.Entry!.Id, _outroMembroId);

        Assert.Equal(DiaryEntryStatus.NotAuthor, result.Status);
        Assert.Single(_db.DiaryEntries);
    }

    [Fact]
    public async Task DeleteAsync_DevePermitirAoAdministrador_EmEntradaAlheia()
    {
        // RN-007: o administrador remove registro indevido de qualquer membro.
        // Sem isso, um relato impróprio ficaria no histórico de saúde sem
        // ninguém com poder de tirá-lo.
        //
        // _autorId é o administrador da fixture; a entrada aqui é do membro comum.

        var service = Servico();
        var criada = await service.CreateAsync(Nova(titulo: "Do membro"), _outroMembroId);

        var result = await service.DeleteAsync(criada.Entry!.Id, _autorId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Empty(_db.DiaryEntries);
    }

    [Fact]
    public async Task DeleteAsync_NaoDevePermitirAAdministradorDeOutroWorkspace()
    {
        // Ser administrador em algum lugar não dá poder em todo lugar: a
        // verificação é por workspace da entrada.

        var outro = new Workspace { Name = "Outro", SubjectName = "Outra Pessoa" };
        _db.Workspaces.Add(outro);
        await _db.SaveChangesAsync();
        _db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = outro.Id,
            UserId = _estranhoId,
            Role = MemberRole.Admin,
        });
        await _db.SaveChangesAsync();

        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.DeleteAsync(criada.Entry!.Id, _estranhoId);

        // Nem sequer participa deste workspace: para antes da checagem de papel.
        Assert.Equal(DiaryEntryStatus.NotMember, result.Status);
        Assert.Single(_db.DiaryEntries);
    }

    [Fact]
    public async Task UpdateAsync_NaoDevePermitirAoAdministrador_EditarEntradaAlheia()
    {
        // A permissão do administrador é só para excluir (RN-007). Editar
        // continua restrito ao autor (RN-008): um relato alterado por terceiro
        // perderia a confiabilidade, mesmo vindo de quem administra.

        var service = Servico();
        var criada = await service.CreateAsync(Nova(titulo: "Do membro"), _outroMembroId);

        var result = await service.UpdateAsync(
            criada.Entry!.Id, new UpdateDiaryEntryRequest("Alterado pelo admin", null, null, null), _autorId);

        Assert.Equal(DiaryEntryStatus.NotAuthor, result.Status);
        var naBase = await _db.DiaryEntries.FindAsync(criada.Entry.Id);
        Assert.Equal("Do membro", naBase!.Title);
    }

    // Listagem

    [Fact]
    public async Task GetByWorkspaceAsync_DeveListarDaMaisRecenteParaAMaisAntiga()
    {
        var service = Servico();
        var primeira = await service.CreateAsync(Nova(titulo: "Primeira"), _autorId);
        var entidade = await _db.DiaryEntries.FindAsync(primeira.Entry!.Id);
        entidade!.CreatedAt = DateTime.UtcNow.AddHours(-1);
        await _db.SaveChangesAsync();
        await service.CreateAsync(Nova(titulo: "Segunda"), _outroMembroId);

        var lista = await service.GetByWorkspaceAsync(_workspaceId, _autorId);

        Assert.NotNull(lista);
        Assert.Equal(["Segunda", "Primeira"], lista!.Select(e => e.Title));
    }

    [Fact]
    public async Task GetByWorkspaceAsync_DeveRetornarNull_QuandoNaoParticipa()
    {
        var service = Servico();
        await service.CreateAsync(Nova(), _autorId);

        var lista = await service.GetByWorkspaceAsync(_workspaceId, _estranhoId);

        Assert.Null(lista);
    }

    [Fact]
    public async Task GetByIdAsync_DeveRecusar_QuandoNaoParticipaDoWorkspace()
    {
        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.GetByIdAsync(criada.Entry!.Id, _estranhoId);

        Assert.Equal(DiaryEntryStatus.NotMember, result.Status);
    }

    [Fact]
    public async Task GetByIdAsync_DevePermitirLeituraPorOutroMembro()
    {
        // O diário é compartilhado: todo participante lê o que os demais registram.
        var service = Servico();
        var criada = await service.CreateAsync(Nova(), _autorId);

        var result = await service.GetByIdAsync(criada.Entry!.Id, _outroMembroId);

        Assert.Equal(DiaryEntryStatus.Ok, result.Status);
        Assert.Equal(criada.Entry.Id, result.Entry!.Id);
    }
}
