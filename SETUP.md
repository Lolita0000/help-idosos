# Setup — Elo de Cuidado

Instruções para rodar o projeto localmente ou via Docker.

---

## Pré-requisitos

### Instalação do Docker

**Linux**
```bash
sudo apt install docker.io docker-compose-plugin
```

**Windows**

1. Baixe o Docker Desktop em https://www.docker.com/products/docker-desktop/
2. Durante a instalação, mantenha a opção **"Use WSL 2 instead of Hyper-V"** marcada
3. Após instalar, abra o Docker Desktop e aguarde o status **"Engine running"** no canto inferior esquerdo
4. O Docker estará disponível no terminal como `docker`

> O Docker Desktop precisa estar aberto e com o engine rodando antes de executar qualquer comando `docker`.

---

### Instalação do MariaDB

Necessário apenas para rodar o backend fora do Docker.

**Linux**
```bash
sudo apt install mariadb-server
```

**Windows**

1. Baixe o instalador em https://mariadb.org/download/
2. Durante a instalação, defina uma senha para o usuário `root`
3. Ao final, adicione o MariaDB ao PATH do sistema — o executável fica em `C:\Program Files\MariaDB x.x\bin`

---

### Instalação do Entity Framework

Necessário apenas para rodar o backend fora do Docker.

```bash
dotnet tool install --global dotnet-ef
```

---

## Rodando com Docker

```bash
docker compose up
```

O projeto está pronto quando aparecer nos logs:

```
backend-1   |       Content root path: /app
```

Acesse o frontend em `http://localhost`.

> Caso já tenha subido o projeto antes e queira recriar os volumes do banco: `docker compose down -v` antes de subir novamente.

---

## Rodando localmente (sem Docker)

### 1. Configurar o banco de dados

Verifique e ajuste a senha em `backend/appsettings.Development.json`.

Acesse o MariaDB via CLI:

**Linux:**
```bash
sudo mariadb -u root -p
```

**Windows:**
```powershell
mariadb -u root -p
```

Execute os seguintes comandos sequencialmente — não esqueça do `;`:

```sql
create database if not exists elodecuidado;
create user if not exists 'appuser'@'localhost' identified by 'sua_senha_no_appsettings';
grant all privileges on elodecuidado.* to 'appuser'@'localhost';
flush privileges;
exit;
```

### 2. Rodar as migrations

Na pasta `backend`:

```bash
dotnet ef database update
```

Mensagem de sucesso esperada:

```
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      SELECT RELEASE_LOCK('__elodecuidado_EFMigrationsLock')
Done.
```

### 3. Verificar as tabelas

Acesse o banco e confirme que os outputs estão idênticos:

```
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| elodecuidado       |
| information_schema |
+--------------------+

MariaDB [(none)]> connect elodecuidado;

MariaDB [elodecuidado]> show tables;
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

### 4. Rodar o backend

```bash
cd backend
dotnet restore
dotnet run
```

Acesse: `https://localhost:5281`

### 5. Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## Verificar o banco no Docker

**Linux:**
```bash
sudo docker exec -it help-idosos-db-1 mariadb -u appuser -p
```

**Windows:**
```powershell
docker exec -it help-idosos-db-1 mariadb -u appuser -p
```

Senha: conforme definido no `.env` (padrão: `senharoot`).

Confirme os outputs conforme a seção [Verificar as tabelas](#3-verificar-as-tabelas) acima.

---

## Rodar testes

### Backend

```bash
cd backend
dotnet test
```

### Frontend

```bash
cd frontend
npm run test
```