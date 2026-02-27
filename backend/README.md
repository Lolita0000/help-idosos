
---

# README — Backend

```markdown
# Help Idosos - Backend

API REST do projeto **Help Idosos**, desenvolvida em ASP.NET Core utilizando arquitetura em camadas.

## Tecnologias

- C#
- ASP.NET Core
- Entity Framework (em implementação)

---

## Estrutura do Projeto

backend/
 ├─ Controllers/
 ├─ Data/
 ├─ DTOs/
 ├─ Models/
 ├─ Repositories/
 ├─ Services/
 └─ Program.cs

### Organização

- **Controllers** → Endpoints da API
- **Services** → Regras de negócio
- **Repositories** → Acesso a dados
- **DTOs** → Objetos de transferência
- **Models** → Entidades do sistema
- **Data** → Configuração de banco

---

## Como rodar o projeto

Restaurar dependências:

```bash
dotnet restore

Executar:

dotnet run

A API será iniciada em:

https://localhost:5001
Rotas principais
Criar usuário

POST /api/user

Exemplo:

{
  "nome": "Maria",
  "telefone": "61999999999"
}
Arquitetura

Arquitetura baseada em:

Controller

Service

Repository

Separando responsabilidades para facilitar manutenção e escalabilidade.