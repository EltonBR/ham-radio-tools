#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PORT="${PORT:-8000}"
PID_FILE="$ROOT_DIR/.httpd-$PORT.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "Nenhum servidor registrado em $PID_FILE"
  exit 0
fi

PID="$(cat "$PID_FILE")"
if [ -z "$PID" ]; then
  rm -f "$PID_FILE"
  echo "Arquivo de pid vazio removido."
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "Servidor parado (pid $PID)"
else
  echo "Processo $PID nao esta rodando."
fi

rm -f "$PID_FILE"
