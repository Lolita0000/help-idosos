# Elo de Cuidado 💙

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)
![React](https://img.shields.io/badge/React-TypeScript-blue.svg)
![Backend](https://img.shields.io/badge/Backend-ASP.NET_Core-purple.svg)
![Database](https://img.shields.io/badge/Database-MariaDB-teal.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Lolita0000/help-idosos/graphs/commit-activity)

> Diário de saúde compartilhado para famílias e cuidadores.

---

O acompanhamento de saúde de um idoso envolve múltiplos atores — familiares, cuidadores, médicos — que frequentemente atuam de forma descoordenada. Informações sobre medicamentos, consultas e sintomas ficam dispersas entre anotações pessoais, mensagens de WhatsApp e memória individual de cada envolvido.

O **Elo de Cuidado** centraliza esse histórico em um ambiente colaborativo e seguro. Um **workspace** representa um núcleo de cuidado: uma pessoa acompanhada e os membros que registram observações ao longo do tempo. Todos têm acesso ao mesmo histórico, sempre atualizado.

Além do contexto familiar, o sistema serve para quem quer acompanhar a própria saúde física ou mental — um diário pessoal com estrutura e histórico persistente.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript |
| Backend | ASP.NET Core (.NET 10) |
| Banco de dados | MariaDB |
| ORM | Entity Framework |
| Infraestrutura | Docker |
| Geração de PDF | Typst |

---

## Estrutura do repositório

```
/
├── backend/    # API REST em ASP.NET Core
├── frontend/   # Interface em React + TypeScript
└── docs/       # Documentação técnica e diagramas
```

---

## Como rodar

Consulte o [guia de setup](SETUP.md) para instruções de instalação e execução local e via Docker.

---

## 🤝 Contribuindo

Contributions, issues e feature requests são bem-vindos!
Consulte a [página de issues](https://github.com/Lolita0000/help-idosos/issues) e leia o [guia de contribuição](CONTRIBUTING.md) antes de abrir um PR.