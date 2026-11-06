#!/usr/bin/env bash
# Restauração do banco do Elo de Cuidado (RNF-005).
#
# Uso, a partir da raiz do repositório:
#   bash scripts/restore.sh                       restaura o backup mais recente
#   bash scripts/restore.sh backups/arquivo.sql.gz  restaura um backup específico
#
# A restauração SUBSTITUI o conteúdo atual do banco.
set -euo pipefail

cd "$(dirname "$0")/.."

[ -f .env ] && set -a && . ./.env && set +a
DB_NAME="${DB_NAME:-elodecuidado}"

ARQUIVO="${1:-}"
if [ -z "$ARQUIVO" ]; then
  ARQUIVO=$(ls -1t backups/elodecuidado-*.sql.gz 2>/dev/null | head -1 || true)
  [ -n "$ARQUIVO" ] || { echo "erro: nenhum backup encontrado em backups/"; exit 1; }
  echo "backup mais recente: $(basename "$ARQUIVO")"
fi

[ -f "$ARQUIVO" ] || { echo "erro: arquivo nao encontrado: $ARQUIVO"; exit 1; }

# Conferir a integridade ANTES de apagar o que existe: restaurar a partir de um
# arquivo truncado destruiria o banco atual sem ter como voltar.
gzip -t "$ARQUIVO" || { echo "erro: o arquivo esta corrompido, restauracao abortada"; exit 1; }
echo "integridade do arquivo: ok"

if [ "${FORCE:-}" != "1" ]; then
  echo
  echo "Isto SUBSTITUI todo o conteudo atual do banco '$DB_NAME'."
  printf "Digite RESTAURAR para confirmar: "
  read -r confirmacao
  [ "$confirmacao" = "RESTAURAR" ] || { echo "cancelado."; exit 1; }
fi

echo "restaurando..."
gunzip -c "$ARQUIVO" | docker compose exec -T db mariadb -uroot -p"${DB_ROOT_PASSWORD}"

echo "restauracao concluida."
docker compose exec -T db mariadb -uroot -p"${DB_ROOT_PASSWORD}" "$DB_NAME" -e "
SELECT 'Users' AS tabela, COUNT(*) AS registros FROM Users
UNION ALL SELECT 'Workspaces', COUNT(*) FROM Workspaces
UNION ALL SELECT 'DiaryEntries', COUNT(*) FROM DiaryEntries
UNION ALL SELECT 'AuditLogs', COUNT(*) FROM AuditLogs;"

echo
echo "A aplicacao precisa ser reiniciada para descartar conexoes antigas:"
echo "  docker compose restart backend"
