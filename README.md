# Elo de Cuidado 💙

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)
![React](https://img.shields.io/badge/React-TypeScript-blue.svg)
![Backend](https://img.shields.io/badge/Backend-ASP.NET_Core-purple.svg)
![Database](https://img.shields.io/badge/Database-MariaDB-teal.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Lolita0000/help-idosos/graphs/commit-activity)

> Aplicação de diário de saúde compartilhado, voltada para famílias que acompanham a saúde de idosos. Um workspace representa um núcleo de cuidado onde membros registram e acompanham observações de saúde ao longo do tempo.

---

## Pré-requisitos

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) `>= 18`
- [.NET SDK](https://dotnet.microsoft.com/) `>= 10`

---

## Instalação

```sh
git clone https://github.com/Lolita0000/help-idosos.git
cd help-idosos
```

---

## Como rodar

### Com Docker

```sh
docker compose up
```

### Frontend (manual)

```sh
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

### Backend (manual)

```sh
cd backend
dotnet restore
dotnet run
```

Acesse: `https://localhost:5001`

---

## Rodar testes

### Backend

```sh
cd backend
dotnet test
```

### Frontend

```sh
cd frontend
npm run test
```

---

## Estrutura do repositório

```
/
├── backend/    # API REST em ASP.NET Core
├── frontend/   # Interface em React + TypeScript
└── docs/       # Documentação técnica e diagramas
```

---

## 🤝 Contribuindo

Contributions, issues e feature requests são bem-vindos!
Consulte a [página de issues](https://github.com/Lolita0000/help-idosos/issues) e leia o [guia de contribuição](CONTRIBUTING.md) antes de abrir um PR.
