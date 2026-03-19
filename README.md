# Elo de Cuidado 💙

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)
![React](https://img.shields.io/badge/React-TypeScript-blue.svg)
![Backend](https://img.shields.io/badge/Backend-ASP.NET_Core-purple.svg)
![Database](https://img.shields.io/badge/Database-MariaDB-teal.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Lolita0000/help-idosos/graphs/commit-activity)

> Diário de saúde compartilhado para famílias e cuidadores.

Muitas famílias dividem entre si a responsabilidade de cuidar de um idoso. Nesse processo, informações sobre medicamentos, sintomas e consultas médicas acabam espalhadas em cadernos, conversas de WhatsApp e na memória de cada envolvido. O resultado é esquecimento, falta de comunicação e dificuldade de acompanhar a evolução da saúde ao longo do tempo.

O **Elo de Cuidado** oferece um espaço colaborativo onde familiares, cuidadores e o próprio acompanhado registram e consultam essas informações de forma organizada. Um **workspace** representa um núcleo de cuidado: uma pessoa acompanhada e os membros autorizados a registrar observações. Todos acessam o mesmo histórico, sempre atualizado.

O sistema também serve para quem quer acompanhar a própria saúde física ou mental de forma individual, com estrutura e histórico persistente.

Diferente de aplicativos como MyTherapy, Medisafe ou Google Keep, focados em uso individual, o Elo de Cuidado foi pensado para o cuidado coletivo.

## Quem usa

| Perfil | Como usa |
|---|---|
| **Familiar** | Registra observações, consulta o histórico e gera relatórios em PDF para médicos |
| **Cuidador** | Registra medicamentos administrados e eventos de saúde no dia a dia |
| **Sujeito acompanhado** | Contribui com suas próprias observações no workspace |
| **Uso pessoal** | Cria um workspace individual para acompanhar a própria saúde |

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript |
| Backend | ASP.NET Core (.NET 10) |
| Banco de dados | MariaDB |
| ORM | Entity Framework |
| Infraestrutura | Docker |
| Geração de PDF | Typst |

## Estrutura do repositório

```
/
├── backend/    # API REST em ASP.NET Core
├── frontend/   # Interface em React + TypeScript
└── docs/       # Documentação técnica e diagramas
```

## Como rodar

Consulte o [guia de setup](SETUP.md) para instruções de instalação e execução local e via Docker.

## 🤝 Contribuindo

Contributions, issues e feature requests são bem-vindos!
Consulte a [página de issues](https://github.com/Lolita0000/help-idosos/issues) e leia o [guia de contribuição](CONTRIBUTING.md) antes de abrir um PR.