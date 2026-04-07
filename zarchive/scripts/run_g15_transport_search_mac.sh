#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

PYTHON_BIN="${PYTHON_BIN:-python3}"
OUTDIR="${OUTDIR:-artifacts/g15_transport_search}"
WORKERS="${WORKERS:-6}"
ITERATIONS="${ITERATIONS:-300000}"
SEED="${SEED:-20260403}"
CHECKPOINT_EVERY="${CHECKPOINT_EVERY:-25000}"
START_TEMPERATURE="${START_TEMPERATURE:-2.0}"
COOLING="${COOLING:-0.99995}"

mkdir -p "$OUTDIR"

echo "[info] python=$PYTHON_BIN"
echo "[info] outdir=$OUTDIR"
echo "[info] workers=$WORKERS iterations=$ITERATIONS seed=$SEED"

"$PYTHON_BIN" scripts/g15_transport_search.py search \
  --workers "$WORKERS" \
  --iterations "$ITERATIONS" \
  --seed "$SEED" \
  --outdir "$OUTDIR" \
  --checkpoint-every "$CHECKPOINT_EVERY" \
  --start-temperature "$START_TEMPERATURE" \
  --cooling "$COOLING"
