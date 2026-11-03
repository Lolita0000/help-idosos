#!/bin/sh
# Backup do banco do Elo de Cuidado (RNF-005).
#
# Executa dentro do contêiner de backup, que alcança o serviço "db" pela rede
# interna do Compose. Não depende de nada instalado na máquina do desenvolvedor.
#
# Variáveis esperadas:
#   DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
#   BACKUP_DIR   destino dos arquivos (padrão /backups)
#   BACKUP_KEEP  quantos backups manter (padrão 7)
set -eu

DB_HOST="${DB_HOST:-db}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_KEEP="${BACKUP_KEEP:-7}"

mkdir -p "$BACKUP_DIR"

CARIMBO=$(date -u +%Y%m%d-%H%M%S)
PARCIAL="$BACKUP_DIR/.em-andamento-$CARIMBO.sql.gz"
FINAL="$BACKUP_DIR/elodecuidado-$CARIMBO.sql.gz"

# --single-transaction tira a cópia de um instante coerente sem travar escrita,
# o que importa porque o backup roda com a aplicação no ar.
# --routines e --triggers para a restauração reproduzir o schema por inteiro.
mariadb-dump \
  --host="$DB_HOST" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  --databases "$DB_NAME" \
  | gzip -c > "$PARCIAL"

# O arquivo só recebe o nome definitivo depois de fechado. Sem isso, um backup
# interrompido no meio ficaria no diretório parecendo íntegro, e seria escolhido
# numa restauração de emergência.
gzip -t "$PARCIAL"
mv "$PARCIAL" "$FINAL"

echo "backup gerado: $(basename "$FINAL") ($(wc -c < "$FINAL") bytes)"

# Retenção: mantém os mais recentes e descarta o excedente.
ls -1t "$BACKUP_DIR"/elodecuidado-*.sql.gz 2>/dev/null \
  | tail -n "+$((BACKUP_KEEP + 1))" \
  | while read -r antigo; do
      echo "removendo backup antigo: $(basename "$antigo")"
      rm -f "$antigo"
    done

# Sobras de execuções interrompidas não devem se acumular.
find "$BACKUP_DIR" -name '.em-andamento-*' -mmin +60 -delete 2>/dev/null || true
