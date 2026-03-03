# Guia de Contribuição — Elo de Cuidado

## Índice

- [Convenção de Branches](#convenção-de-branches)
- [Padrão de Issues](#padrão-de-issues)
- [Padrão de Commits](#padrão-de-commits)
- [Pull Requests](#pull-requests)
- [Padrões de Código](#padrões-de-código)
  - [Backend (C#)](#backend-c)
  - [Frontend (React/TypeScript)](#frontend-reacttypescript)

---

## Convenção de Branches

- Sempre em **letras minúsculas**
- Palavras separadas por hífen
- Prefixo correspondente ao tipo da issue

```
<tipo>/<descricao-curta>
```

### Prefixos

| Prefixo | Quando usar |
|---|---|
| `feature/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `docs/` | Documentação |
| `test/` | Testes |
| `refactor/` | Refatoração |

### Exemplos

```
feature/autenticacao-usuario
fix/validacao-invite-code
docs/contributing
test/diary-entry-soft-delete
refactor/workspace-service
```

---

## Padrão de Issues

O título de toda issue deve seguir o formato:

```
[Tipo] Descrição curta e objetiva
```

### Tipos válidos

| Tipo | Quando usar |
|---|---|
| `[Feature]` | Nova funcionalidade |
| `[Fix]` | Correção de bug |
| `[Docs]` | Documentação |
| `[Test]` | Testes |
| `[Refactor]` | Refatoração sem mudança de comportamento |

### Exemplos de issues

---

**[Feature]**

```
[Feature] Implementa criação de workspace com invite code
```

**Objetivo**
Permitir que um usuário crie um workspace, vire admin e gere um invite code para convidar membros.

**Escopo**
- Criar endpoint `POST /api/workspace`
- Gerar `InviteCode` com prazo de expiração ao criar workspace
- Usuário criador assume role `admin` e flag `is_subject` opcional

**Critério de Aceite**
- [ ] Workspace criado com nome e admin corretos
- [ ] Invite code gerado e retornado na resposta
- [ ] Expiração do invite code respeitada

---

**[Fix]**

```
[Fix] Invite code expirado retorna 200 em vez de 400
```

**Problema**
Ao tentar entrar em um workspace com um invite code expirado, a API retorna status 200 e adiciona o usuário mesmo assim.

**Causa Provável**
A validação de `expires_at` no `InviteCodeService` não está sendo chamada antes da inserção do `WorkspaceMember`.

**O que deve ser feito**
- Verificar o fluxo de validação em `InviteCodeService`
- Garantir que `expires_at` é checado antes do insert

**Impacto:** Alto — qualquer usuário com código expirado consegue acesso indevido ao workspace.

**Critério de Aceite**
- [ ] Código expirado retorna `400` com mensagem clara
- [ ] Usuário não é inserido como membro

---

**[Refactor]**

```
[Refactor] Extrai lógica de soft delete para DiaryEntryService
```

**Objetivo**
A lógica de soft delete está duplicada no controller e no repository. Centralizar no service para facilitar manutenção.

**Escopo**
- Mover lógica de atualização de `status` e `deleted_at` para `DiaryEntryService`
- Remover duplicação no `DiaryEntryController`

**Critério de Aceite**
- [ ] Comportamento externo não muda
- [ ] Lógica centralizada no service

---

**[Test]**

```
[Test] Testes unitários para soft delete de DiaryEntry
```

**Objetivo**
Cobrir os cenários de deleção de entries, garantindo que o soft delete funciona corretamente para autor e admin.

**Escopo**
- [ ] Unitário

**Critério de Aceite**
- [ ] Autor consegue deletar própria entry
- [ ] Admin consegue deletar entry de outro membro
- [ ] Membro sem permissão recebe erro
- [ ] Entry deletada recebe status `deleted` e timestamp

---

**[Docs]**

```
[Docs] Adiciona diagrama de classes ao ARCHITECTURE.md
```

**Objetivo**
Complementar a documentação técnica com o diagrama de classes após a modelagem do banco estar finalizada.

**Critério de Aceite**
- [ ] Diagrama adicionado e referenciado no ARCHITECTURE.md

---

## Padrão de Commits

```
<tipo>: descrição curta em português
```

### Exemplos

```
feature: implementa endpoint de criação de workspace
fix: corrige validação de invite code expirado
docs: adiciona CONTRIBUTING.md
test: adiciona testes unitários para DiaryEntry
refactor: extrai lógica de soft delete para service
```

---

## Pull Requests

- Todo PR deve referenciar a issue correspondente (`Closes #N`)
- O código deve passar no linter antes de abrir o PR — PRs com falha de lint são reprovados na hora
- Adição de lógica de negócio sem testes unitários é reprovada na hora
- Mínimo de 1 reviewer antes do merge
- Squash merge obrigatório para manter o histórico limpo

---

## Padrões de Código

### Backend (C#)

O backend segue as [convenções oficiais de código C# da Microsoft](https://learn.microsoft.com/pt-br/dotnet/csharp/fundamentals/coding-style/coding-conventions).

**Linter:** [CSharpier](https://csharpier.com/) — rodar antes de todo commit:

```sh
dotnet csharpier .
```

#### Regras principais

- Todo o **código em inglês**; toda a **documentação em português**
- Variáveis locais com tipo inferível usam `var`
- Variáveis com tipo não óbvio usam tipo explícito
- Nomes de variáveis devem ser descritivos — sem abreviações (`userData`, não `ud`)
- Indentação com **4 espaços** — sem tabs
- Uma instrução por linha
- Chaves no estilo Allman (abre e fecha em linha própria)
- `using` fora da declaração de namespace
- Interpolação de string em vez de concatenação (`$"Olá, {name}"`)
- `&&` e `||` em vez de `&` e `|` em comparações
- Membros estáticos acessados pelo nome da classe
- Comentários XML em todos os membros públicos

#### Exemplo

```csharp
// Correto
var workspaceName = request.Name;
string errorMessage = GetErrorMessage(code);

// Errado
var em = GetErrorMessage(code);
String workspaceName = request.Name;
```

---

### Frontend (React/TypeScript)

**Linter:** [Prettier](https://prettier.io/) — rodar antes de todo commit:

```sh
npm run format
```

#### Regras principais

- Componentes em **PascalCase** (`DiaryEntry`, `WorkspaceCard`)
- Funções e variáveis em **camelCase** (`handleSubmit`, `isLoading`)
- Arquivos de componente com extensão `.tsx`
- Um componente por arquivo
- Props tipadas com `interface` ou `type` explícito — sem `any`
- Sem lógica de negócio dentro de componentes — use controllers/services