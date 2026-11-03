# Elo de Cuidado 💙

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![React Native](https://img.shields.io/badge/React_Native-Expo-blue.svg)
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
| Aplicativo | React Native + Expo (Android) |
| Backend | ASP.NET Core (.NET 10) |
| Banco de dados | MariaDB 11 |
| ORM | Entity Framework Core |
| Autenticação | JWT HMAC-SHA256 + BCrypt |
| Infraestrutura | Docker Compose |

## O que está entregue

| Versão | Entrega |
|---|---|
| **v0.1** | Cadastro com aceite dos termos, autenticação por token, criação de workspace e ingresso por código de convite |
| **v0.2** | Diário de cuidado: registrar, editar e excluir entradas, com permissão por autor e administrador e trilha de auditoria |
| **v1.0** | Histórico com filtros, ajuste de tamanho de fonte, exclusão de conta e dados pessoais, backup automático |

O aplicativo Android é distribuído pelas
[releases](https://github.com/Lolita0000/help-idosos/releases) do repositório.
Sem endereço de API configurado, ele funciona em **modo demonstração**, com os
dados no próprio aparelho.

Fora do MVP: geração de relatório em PDF, recuperação de senha e registro de
observações pelo próprio sujeito acompanhado.

## Estrutura do repositório

```
/
├── backend/        # API REST em ASP.NET Core
├── backend-tests/  # Testes automatizados da API
├── mobile/         # Aplicativo Android em React Native + Expo
├── scripts/        # Backup e restauração do banco
└── docs/           # Documentação técnica e diagramas
```

## Como rodar

Consulte o [guia de setup](SETUP.md) para instalação e execução local via Docker,
a [arquitetura](docs/ARCHITECTURE.md) para as decisões de projeto e o
[procedimento de backup](docs/BACKUP.md) para a política de cópia e restauração
do banco.

## 🤝 Contribuindo

Contributions, issues e feature requests são bem-vindos!
Consulte a [página de issues](https://github.com/Lolita0000/help-idosos/issues) e leia o [guia de contribuição](CONTRIBUTING.md) antes de abrir um PR.