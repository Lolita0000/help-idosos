# Elo de Cuidado — aplicativo móvel (v0.1 Fundação e Acesso)

App em React Native com Expo (SDK 57) que implementa a entrega **v0.1 — Fundação e Acesso (10/10/2026)**
do Plano de Iterações, seguindo a página **"Mobile – MVP v1.0"** do Figma.

| Requisito | História | Telas |
|---|---|---|
| RF01 | HU-02 Cadastrar usuário | `cadastro`, `termos`, `privacidade` |
| RF02 | HU-13 Autenticar usuário | `login` |
| RF03 | HU-01 Criar workspace | `criar-workspace`, `workspace-criado`, `workspace/[id]` (membros) |
| RF04 | HU-03 Entrar por convite | `workspaces` (Entrar com código), `workspace/[id]/convites` |

Fora desta entrega (v0.2 em diante): diário, edição/exclusão de registros, histórico e exclusão de conta.

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

O APK usa a API do grupo hospedada no Railway: `https://api-production-457f.up.railway.app`.

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
  | `GET` | `/api/invite-code?workspaceId=` | depende do merge da issue #51 |
  | `POST` | `/api/invite-code` | |
  | `POST` | `/api/invite-code/join` | depende do merge da issue #51 |
  | `DELETE` | `/api/invite-code/{id}` | |

## Gerar o APK

O workflow `.github/workflows/mobile-apk.yml` gera o APK a cada push em `mobile/` e o publica na release
`mobile-v0.1` do repositório. Para gerar localmente (com Android SDK e JDK 17 instalados):

```bash
cd mobile
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

## Verificação

`npx tsc --noEmit` checa os tipos. A jornada completa da v0.1 (cadastro → login → criar workspace → gerar código →
segundo usuário entra pelo código, incluindo os casos de erro) foi executada na versão web.
