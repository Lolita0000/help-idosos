# Backup e restauração do banco

Atende ao **RNF-005**: nenhum registro confirmado é perdido, o backup é gerado
automaticamente e a restauração é possível e verificada.

## Política

| | |
|---|---|
| **Periodicidade** | A cada 6 horas, mais um backup imediato ao subir o ambiente |
| **Local** | `backups/` na raiz do repositório, no disco do host |
| **Retenção** | Os 7 mais recentes; os anteriores são descartados automaticamente |
| **Formato** | `elodecuidado-AAAAMMDD-HHMMSS.sql.gz`, com carimbo em UTC |
| **Conteúdo** | Esquema e dados de todas as tabelas, incluindo rotinas e gatilhos |

O destino fica **fora do volume do banco**, de propósito. Backup guardado dentro
do próprio volume se perderia junto com ele, que é o cenário em que o backup
precisaria existir.

A pasta `backups/` está no `.gitignore`: os arquivos contêm dados reais e não
pertencem ao repositório.

Periodicidade e retenção são ajustáveis pelo `.env`:

```
BACKUP_INTERVAL_SECONDS=21600
BACKUP_KEEP=7
```

## Como funciona

O serviço `backup` do Compose roda em laço enquanto o ambiente estiver de pé,
chamando `scripts/backup.sh`. Ele usa `mariadb-dump` com `--single-transaction`,
que tira uma cópia coerente de um instante sem travar escrita — necessário
porque o backup roda com a aplicação no ar.

O arquivo é gravado com nome provisório e só recebe o nome definitivo depois de
fechado e verificado. Sem isso, um backup interrompido no meio ficaria no
diretório aparentando estar íntegro e poderia ser escolhido numa restauração de
emergência.

## Gerar um backup agora

```bash
docker compose exec backup sh /usr/local/bin/backup.sh
```

> No Git Bash do Windows, prefixe com `MSYS_NO_PATHCONV=1` e use `//usr/...`,
> senão o caminho é convertido para `C:/Program Files/Git/usr/...`.

## Restaurar

```bash
bash scripts/restore.sh                            # o backup mais recente
bash scripts/restore.sh backups/arquivo.sql.gz     # um backup específico
```

O script confere a integridade do arquivo **antes** de tocar no banco e exige
que você digite `RESTAURAR` para confirmar. Restaurar a partir de um arquivo
truncado destruiria o banco atual sem possibilidade de volta.

Depois da restauração, reinicie a aplicação para descartar conexões antigas:

```bash
docker compose restart backend
```

## Verificação executada

Ciclo completo em 03/11/2026, com dados criados pela API:

```
estado inicial     8 usuários · 7 workspaces · 10 entradas
backup gerado      elodecuidado-20261103-120034.sql.gz (3.669 bytes)
integridade        gzip -t: ok · 7 tabelas no dump
                   marcador "WORKSPACE-PARA-RESTAURAR" presente no arquivo
dados destruídos   0 · 0 · 0   (TRUNCATE em todas as tabelas)
após restaurar     8 · 7 · 10
                   WORKSPACE-PARA-RESTAURAR e ENTRADA-PARA-RESTAURAR recuperados
```

A verificação **destrói os dados e os recupera**, em vez de apenas reiniciar o
contêiner. Persistência após reinício não comprova que existe backup íntegro nem
que a restauração funciona, que era o apontamento do Parecer 01.

## Limitações conhecidas

O backup roda **enquanto o Compose estiver de pé**. Com a máquina desligada não
há geração, e o intervalo não é recuperado depois: na volta sai um backup e a
contagem recomeça. É adequado ao uso atual, em que o ambiente sobe para
demonstração, e insuficiente para operação contínua.

Os arquivos ficam **na mesma máquina do banco**. Protegem contra perda de dados
por falha da aplicação, erro de operação ou corrupção do volume, mas não contra
perda do equipamento. Cópia externa exigiria destino remoto, fora do escopo
desta entrega.
