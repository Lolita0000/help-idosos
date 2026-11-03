# Elo de Cuidado — aplicativo móvel (MVP v0.1 → v1.0)

App em React Native com Expo (SDK 57) que implementa as entregas do MVP do Plano de Iterações
(v0.1 Fundação e Acesso — 10/10, v0.2 Diário — 24/10, v1.0 — 07/11). O Documento de Requisitos é a referência
do escopo; a página **"Mobile – MVP v1.0"** do Figma é a referência visual.

| Entrega | Requisito | História | Telas |
|---|---|---|---|
| v0.1 | RF01 | HU-02 Cadastrar usuário | `cadastro`, `termos`, `privacidade` |
| v0.1 | RF02 | HU-13 Autenticar usuário | `login` |
| v0.1 | RF03 | HU-01 Criar workspace | `criar-workspace`, `workspace-criado`, `workspace/[id]/membros` |
| v0.1 | RF04 | HU-03 Entrar por convite | `workspaces` (Entrar com código), `workspace/[id]/convites` |
| v0.2 | — | HU-04 Registrar entrada no diário | `workspace/[id]/diario/entrada` |
| v0.2 | — | HU-06 Editar e HU-07 Excluir a própria entrada | `workspace/[id]` (Diário), `workspace/[id]/diario/entrada` |
| v1.0 | — | HU-08 Histórico com filtros por categoria e autor e contagem de registros | `workspace/[id]` (Diário) |
| v1.0 | — | HU-05 Exclusão da conta (LGPD), com aviso e dupla confirmação | `conta` |
| v1.0 | RNF-004 | Ajuste do tamanho da fonte (Pequena, Média, Grande) em todo o app | `acessibilidade` |

Fora do MVP: HU-09 a HU-12.

## Como avaliar

- **Android:** baixe o `elo-de-cuidado-v0.1.apk` na release
  [mobile-v0.1](https://github.com/Lolita0000/help-idosos/releases/tag/mobile-v0.1) e instale
  (o Android pede para permitir a instalação de fontes desconhecidas).

Não há conta pronta: toque em **Começar → Cadastre-se** e crie a sua (a senha precisa de 8 caracteres, com maiúscula,
minúscula, número e caractere especial, ex.: `Cuidado@2026`). Roteiro da v0.1:

1. Cadastre-se e entre (HU-02, HU-13).
2. Toque em **+ Criar Workspace**, informe o nome do espaço e o nome da pessoa acompanhada (HU-01).
3. Em **Acessar Workspace → Convites → Convidar membros**, gere um código e anote-o.
4. Abra o menu (☰) → **Sair da conta**, crie uma segunda conta e use **Entrar com código** (HU-03).

Por padrão o APK roda em **modo demonstração**, com os dados no próprio aparelho, sem depender de servidor. Para apontar o build para uma API real, defina a variável de repositório `API_URL` em Settings → Secrets and variables → Actions → Variables.

## Rodar no celular com Expo Go

```bash
cd mobile
npm install
npx expo start
```

Abra o app **Expo Go** no celular e leia o QR code exibido no terminal.
Para a versão web: `npx expo start --web`.

## Onde ficam os dados

O app tem uma camada de dados única (`src/core`, o núcleo compartilhado) com duas implementações do mesmo contrato `EloApi`:

- **`localApi.ts` (padrão)** — modo demonstração. Os dados ficam no próprio aparelho e as regras da v0.1 são aplicadas
  como na API: senha só como hash BCrypt, aceite dos termos com data e hora, mensagem de login genérica,
  bloqueio de 15 minutos após 5 tentativas, criador vira administrador, sujeito sem convite automático,
  código de convite de 8 caracteres válido por 24 horas, recusa de código inexistente, expirado ou já usado pelo membro.
- **`httpApi.ts`** — usa a API ASP.NET da pasta `backend/`. É ativada definindo a URL da API:

  ```bash
  EXPO_PUBLIC_API_URL=https://sua-api npx expo start
  ```

  Rotas que o `httpApi.ts` consome:

  | Método | Rota | Observação |
  |---|---|---|
  | `POST` | `/api/auth/register` | |
  | `POST` | `/api/auth/login` | |
  | `GET` | `/api/workspaces` | |
  | `POST` | `/api/workspaces` | |
  | `GET` | `/api/workspaces/{id}` | |
  | `GET` | `/api/workspaces/{id}/members` | |
  | `GET` | `/api/invite-code?workspaceId=` | |
  | `POST` | `/api/invite-code` | |
  | `POST` | `/api/invite-code/join` | |
  | `DELETE` | `/api/invite-code/{id}` | |
  | `GET` | `/api/diary-entries?workspaceId=` | v0.2 — PR #85 |
  | `POST` | `/api/diary-entries` | v0.2 — PR #85 |
  | `GET` | `/api/diary-entries/{id}` | v0.2 — PR #85 |
  | `PATCH` | `/api/diary-entries/{id}` | v0.2 — PR #85 |
  | `DELETE` | `/api/diary-entries/{id}` | v0.2 — PR #85 |
  | `DELETE` | `/api/users/{id}/delete` | v1.0 — precisa anonimizar a autoria e bloquear admin com membros (ver PR) |

## Gerar o APK

O workflow `.github/workflows/mobile-apk.yml` gera o APK a cada push em `mobile/` e o publica na release
`mobile-v0.1` do repositório. Para gerar localmente (com Android SDK e JDK 17 instalados):

```bash
cd mobile
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

## Verificação

`npx tsc --noEmit` checa os tipos. As jornadas foram executadas na versão web:

- v0.1: cadastro → login → criar workspace → gerar código → segundo usuário entra pelo código, incluindo os casos de erro.
- v0.2: registrar, editar e excluir a própria entrada; outro membro não vê as ações de editar e excluir.
- v1.0: contagem e filtros combinados no histórico; fonte Grande aplicada em todas as telas e mantida após reabrir;
  exclusão de conta com dupla confirmação, entradas do membro excluído exibidas como "Usuário removido"
  e administrador com outros membros impedido de excluir.
