#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"
DOCROOT="${DOCROOT:-public_html}"

cd "$(dirname "$0")"

if ! command -v php >/dev/null 2>&1; then
  echo "ERROR: php is not installed or not on PATH."
  echo "Install it in Termux with: pkg install php"
  exit 1
fi

if [ ! -d "$DOCROOT" ]; then
  echo "ERROR: document root not found: $DOCROOT"
  exit 1
fi

echo "Serving Aletheos.ai"
echo "Root:   $PWD/$DOCROOT"
echo "URL:    http://$HOST:$PORT/"
echo
echo "Routes:"
echo "  http://$HOST:$PORT/"
echo "  http://$HOST:$PORT/labs.php"
echo "  http://$HOST:$PORT/collapse_witness.php"
echo "  http://$HOST:$PORT/the_thalean_graph_at4val_60_6.php"
echo
echo "Press Ctrl+C to stop."
echo

exec php -S "$HOST:$PORT" -t "$DOCROOT"
