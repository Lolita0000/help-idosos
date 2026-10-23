using System.Reflection;
using System.Text;
using EloDeCuidado.Data;
using EloDeCuidado.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(
        builder.Configuration.GetConnectionString("Default"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("Default"))
    );
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IInviteCodeService, InviteCodeService>();
builder.Services.AddScoped<IDiaryEntryService, DiaryEntryService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Autenticação por JWT. A chave de assinatura vem da configuração; em produção
// deve ser fornecida por variável de ambiente, nunca versionada.
var jwt = builder.Configuration.GetSection("Jwt");
var jwtSecret = jwt["Secret"]
    ?? throw new InvalidOperationException(
        "A chave de assinatura do JWT não está configurada (Jwt:Secret).");

// O valor que acompanha o repositório serve apenas para desenvolvimento local e
// é público, por estar versionado. Em produção, assinar tokens com ele permitiria
// a qualquer pessoa forjar um token para qualquer usuário. A aplicação se recusa
// a subir nessa condição, em vez de subir insegura e em silêncio.
const string developmentJwtSecret =
    "desenvolvimento-apenas-trocar-em-producao-por-variavel-de-ambiente-32b+";

if (!builder.Environment.IsDevelopment())
{
    if (jwtSecret == developmentJwtSecret)
        throw new InvalidOperationException(
            "A chave de assinatura do JWT ainda é a de desenvolvimento, que é pública. "
            + "Defina Jwt__Secret por variável de ambiente antes de publicar.");

    // HMAC-SHA256 exige pelo menos 256 bits de chave.
    if (Encoding.UTF8.GetByteCount(jwtSecret) < 32)
        throw new InvalidOperationException(
            "A chave de assinatura do JWT precisa ter ao menos 32 bytes.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateLifetime = true,
            // Sem tolerância de relógio: um token expirado é recusado de imediato.
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);

    // Habilita o botão "Authorize" no Swagger, para testar rotas protegidas.
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Informe apenas o token. O prefixo 'Bearer' é adicionado automaticamente.",
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer", document), [] },
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Em hospedagem gerenciada o TLS termina no proxy da plataforma, e o contêiner
// recebe a requisição em HTTP puro. Sem ler o X-Forwarded-Proto, o
// UseHttpsRedirection abaixo não reconheceria a chamada original como segura e
// redirecionaria todas elas para HTTPS, criando um laço de redirecionamento que
// derruba a API inteira. Precisa vir antes dele.
if (!app.Environment.IsDevelopment())
{
    var forwardedHeaders = new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor,
    };

    // O endereço do proxy da plataforma não é fixo nem conhecido de antemão, então
    // não há lista de proxies a declarar. Confiar no cabeçalho só é aceitável
    // porque a borda da plataforma é o único caminho de entrada: o contêiner não
    // recebe tráfego direto da internet.
    forwardedHeaders.KnownNetworks.Clear();
    forwardedHeaders.KnownProxies.Clear();

    app.UseForwardedHeaders(forwardedHeaders);
}

app.UseHttpsRedirection();

// A documentação fica disponível também em produção. Todas as rotas exigem token
// desde a #50, então o Swagger expõe o contrato, não os dados, e é por onde a
// equipe e o professor verificam a API publicada.
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
});

// A ordem importa: a autenticação identifica quem é o usuário e precisa vir
// antes da autorização, que decide o que ele pode acessar.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
