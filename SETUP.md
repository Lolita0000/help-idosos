# Setup — Elo de Cuidado

Instruções para rodar o projeto. O caminho com **Docker é o recomendado**: sobe o banco e a API com um comando só, e não exige instalar .NET nem MariaDB na máquina.

> A interface do projeto é o aplicativo Android, em `mobile/`. Para rodá-lo, veja o [README do app](mobile/README.md). Ele funciona em modo demonstração sem depender desta API.

## Pré-requisitos

### Docker

**Windows**

1. Baixe o Docker Desktop em https://www.docker.com/products/docker-desktop/
2. Durante a instalação, mantenha a opção **"Use WSL 2 instead of Hyper-V"** marcada
3. Após instalar, abra o Docker Desktop e aguarde o status **"Engine running"** no canto inferior esquerdo
4. O Docker estará disponível no terminal como `docker`

**Linux**

Siga a documentação oficial: https://docs.docker.com/engine/install/ubuntu/

> O Docker Desktop precisa estar aberto e com o engine rodando antes de executar qualquer comando `docker`.

Para rodar com Docker, **esse é o único pré-requisito**. As instalações de .NET SDK e MariaDB descritas no final deste documento são necessárias apenas para quem for rodar o backend fora do Docker.

---

## Rodando com Docker

### 1. Clonar o repositório

```bash
git clone https://github.com/Lolita0000/help-idosos.git
cd help-idosos
```

O arquivo `.env` já vem versionado com as credenciais de desenvolvimento, então **não há nada para configurar** antes de subir.

### 2. Subir o projeto

```bash
docker compose up -d --build
```

A primeira execução leva alguns minutos, porque baixa as imagens do .NET SDK, do MariaDB e do Node.

### 3. Conferir que subiu

```bash
docker compose ps
```

Os dois serviços devem aparecer como `Up`, com o banco marcado `healthy`:

```
SERVICE    STATUS                    PORTS
backend    Up 25 seconds             0.0.0.0:8080->8080/tcp
db         Up 46 seconds (healthy)   0.0.0.0:3307->3306/tcp
```

Em seguida, confirme a mensagem de sucesso do backend:

```bash
docker compose logs backend | grep "Content root"
```

```
backend-1  |       Content root path: /app
```

As migrations são aplicadas automaticamente no primeiro start. Para acompanhar:

```bash
docker compose logs backend | grep "Applying migration"
```

### 4. Acessar

| Serviço | Endereço |
|---|---|
| Swagger (documentação e teste da API) | http://localhost:8080/swagger |
| Banco de dados (host) | `localhost:3307` |

> A porta do banco é **3307** no host, não 3306, para não conflitar com uma instalação local do MariaDB.

---

## Testando a API

O **Swagger** (http://localhost:8080/swagger) é o caminho mais prático: permite disparar os endpoints pelo navegador, sem terminal.

Pela linha de comando:

```bash
# criar usuário
curl -X POST http://localhost:8080/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Carlos Pereira","email":"carlosp@gmail.com","password":"Senha@2026"}'

# criar workspace
curl -X POST http://localhost:8080/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name":"Cuidados da Vovó Joana"}'

# buscar workspace
curl http://localhost:8080/api/workspaces/1
```

Os três retornam **200** com o JSON do recurso.

> **Atenção às rotas.** Elas não seguem o padrão REST óbvio: o cadastro de usuário é `POST /api/users/create` (não `/api/users`) e o convite é `/api/invite-code` (singular, com hífen). Na dúvida, consulte o Swagger.

### Verificar o banco

```bash
docker compose exec db mariadb -u appuser -psenharoot elodecuidado -e "SHOW TABLES;"
```

Saída esperada:

```
+------------------------+
| Tables_in_elodecuidado |
+------------------------+
| AuditLogs              |
| DiaryEntries           |
| InviteCodes            |
| Users                  |
| WorkspaceMembers       |
| Workspaces             |
| __EFMigrationsHistory  |
+------------------------+
```

Para abrir um terminal interativo no banco:

```bash
docker compose exec db mariadb -u appuser -p elodecuidado
```

Senha conforme o `.env` (padrão: `senharoot`).

---

## Comandos úteis

```bash
docker compose logs -f backend    # acompanhar os logs do backend em tempo real
docker compose restart backend    # reiniciar apenas o backend
docker compose down               # parar os containers, preservando os dados
docker compose down -v            # parar e apagar o banco, recomeçando do zero
docker compose up -d --build      # reconstruir após mudar o código do backend
```

> Ao alterar código do backend, é preciso reconstruir a imagem (`--build`).

---

## Problemas conhecidos

| Sintoma | Causa |
|---|---|
| `POST /api/invite-code` retorna erro de chave estrangeira | O serviço não preenche o `WorkspaceId`. Defeito de regra de negócio em aberto — não é problema de ambiente. |
| Porta 80 ou 8080 já em uso | Outro serviço ocupa a porta. Pare-o ou ajuste o mapeamento no `compose.yml`. |
| `docker compose` não encontrado | Docker Desktop não está aberto ou o engine não subiu. |

---

## Rodando sem Docker (alternativa)

Necessário apenas para quem for desenvolver o backend diretamente na máquina. Exige **.NET SDK 10.0** e **MariaDB** instalados.

### Pré-requisitos adicionais

**.NET SDK 10.0** — baixe em https://dotnet.microsoft.com/download. Confira com:

```bash
dotnet --list-sdks
```

Se a saída vier vazia, apenas o runtime está instalado e não será possível compilar.

**MariaDB**

```bash
# Linux
sudo apt install mariadb-server mariadb-client -y
```

No Windows, baixe o instalador em https://mariadb.org/download/, defina a senha do `root` e adicione `C:\Program Files\MariaDB x.x\bin` ao PATH.

**Ferramenta de migrations**

```bash
dotnet tool install --global dotnet-ef
```

### 1. Criar o banco

Acesse o MariaDB (`sudo mariadb -u root -p` no Linux, `mariadb -u root -p` no Windows) e execute:

```sql
create database if not exists elodecuidado;
create user if not exists 'appuser'@'localhost' identified by 'sua_senha_no_appsettings';
grant all privileges on elodecuidado.* to 'appuser'@'localhost';
flush privileges;
exit;
```

Ajuste a senha correspondente em `backend/appsettings.Development.json`.

### 2. Aplicar as migrations

```bash
cd backend
dotnet ef database update
```

### 3. Rodar o backend

```bash
cd backend
dotnet restore EloDeCuidado.csproj
dotnet run
```

> Use o `.csproj` explicitamente. A solução `EloDeCuidado.slnx` inclui o projeto de testes, que fica fora da pasta `backend/`.

### 4. Rodar o aplicativo

O app fica em `mobile/` e tem instruções próprias no [README do app](mobile/README.md).

```bash
cd mobile
npm install
npx expo start
```

Sem a variável `EXPO_PUBLIC_API_URL`, o app roda em modo demonstração, com os dados no próprio aparelho, sem precisar desta API. Para apontar para a API local, consulte o README do app.

---

## Rodar testes

### Backend

Exige o .NET SDK instalado. Na pasta do projeto de testes:

```bash
cd backend-tests/EloDeCuidado.Tests
dotnet test
```

> Rode de dentro da pasta do projeto. O `global.json` declara o runner `Microsoft.Testing.Platform`, e a combinação `--project` com `--no-build` faz o `dotnet test` não reconhecer o runner e rodar zero teste.

### Aplicativo

```bash
cd mobile
npx tsc --noEmit
```
