#!/bin/sh
set -eu

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PID_FILE="$ROOT_DIR/.httpd-$PORT.pid"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Servidor ja esta rodando em http://127.0.0.1:$PORT/ (pid $PID)"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

busybox httpd -p "$HOST:$PORT" -h "$ROOT_DIR"

PID="$(ss -ltnp 2>/dev/null | awk -v port=":$PORT" '$4 ~ port "$" { sub(/.*pid=/, "", $0); sub(/,.*/, "", $0); print $0; exit }')"
if [ -z "$PID" ]; then
  echo "Nao foi possivel identificar o pid do busybox httpd." >&2
  exit 1
fi

echo "$PID" > "$PID_FILE"
echo "Servidor iniciado em http://127.0.0.1:$PORT/ (pid $PID)"
