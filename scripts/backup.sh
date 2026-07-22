#!/usr/bin/env bash
# Lumina OS — DB backup & recovery (WS4 Reliability)
# Usage:
#   ./scripts/backup.sh backup          # create snapshot + WAL archive
#   ./scripts/backup.sh restore <file>  # restore from snapshot
#   ./scripts/backup.sh list            # list available snapshots

set -euo pipefail

DB="${LUMINA_DB_PATH:-dev.db}"
BACKUP_DIR="${LUMINA_BACKUP_DIR:-./.backups}"
TS=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

case "${1:-}" in
  backup)
    echo "==> Backing up $DB"
    cp "$DB" "$BACKUP_DIR/db_$TS.db"
    [ -f "${DB}-shm" ] && cp "${DB}-shm" "$BACKUP_DIR/db_${TS}.db-shm" 2>/dev/null || true
    [ -f "${DB}-wal" ] && cp "${DB}-wal" "$BACKUP_DIR/db_${TS}.db-wal" 2>/dev/null || true
    echo "==> Snapshot: $BACKUP_DIR/db_$TS.db"
    # Keep last 7 daily backups, remove older
    ls -t "$BACKUP_DIR"/db_*.db 2>/dev/null | tail -n +8 | xargs -r rm
    echo "==> Done"
    ;;
  restore)
    FILE="${2:-}"
    if [ -z "$FILE" ]; then
      echo "Usage: $0 restore <backup-file>"
      exit 1
    fi
    if [ ! -f "$FILE" ]; then
      echo "Error: $FILE not found"
      exit 1
    fi
    echo "==> Restoring $FILE → $DB"
    cp "$FILE" "$DB"
    # Restore WAL if present
    WAL="${FILE%.db}.db-wal"
    SHM="${FILE%.db}.db-shm"
    [ -f "$WAL" ] && cp "$WAL" "${DB}-wal" || true
    [ -f "$SHM" ] && cp "$SHM" "${DB}-shm" || true
    echo "==> Done"
    ;;
  list)
    echo "==> Available snapshots:"
    ls -lh "$BACKUP_DIR"/db_*.db 2>/dev/null | awk '{print $5, $9}' || echo "(no backups)"
    ;;
  *)
    echo "Usage: $0 {backup|restore|list}"
    exit 1
    ;;
esac
