#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import random
from pathlib import Path
from typing import Dict, List, Tuple

import sys
sys.path.insert(0, str(Path("scripts").resolve()))
import g15_transport_search as base

# Signed defect target from current incumbent:
# negative means overlap too small and should go up by 1
# positive means overlap too large and should go down by 1
TARGET_DEFECTS = {
    (1, 8): -1,
    (4, 14): -1,
    (3, 9): -1,
    (1, 3): +1,
    (4, 8): +1,
    (9, 14): +1,
}

FOCUS_ROWS = {1, 3, 4, 8, 9, 14}

def norm_pair(a: int, b: int) -> Tuple[int, int]:
    return (a, b) if a < b else (b, a)

def load_state(path: Path) -> base.SearchState:
    data = json.loads(path.read_text())
    return base.make_state(data["columns"])

def current_defect_vector(state: base.SearchState) -> Dict[Tuple[int, int], int]:
    out = {}
    for pair, target_sign in TARGET_DEFECTS.items():
        d = base.PAIR_DISTANCE[pair]
        tgt = base.TARGET_BY_DISTANCE[d]
        got = state.pair_counts[pair]
        out[pair] = got - tgt
    return out

def defect_objective(state: base.SearchState) -> Tuple[int, int, int]:
    vec = current_defect_vector(state)
    abs_sum = sum(abs(v) for v in vec.values())
    sq_sum = sum(v * v for v in vec.values())
    max_abs = max(abs(v) for v in vec.values())
    return (sq_sum, abs_sum, max_abs)

def move_gain(old_state: base.SearchState, new_state: base.SearchState) -> Tuple[int, int, int]:
    old = defect_objective(old_state)
    new = defect_objective(new_state)
    return (old[0] - new[0], old[1] - new[1], old[2] - new[2])

def candidate_moves(state: base.SearchState, top_k: int = 80):
    moves = []
    for a in range(base.N_COLS):
        for b in range(a + 1, base.N_COLS):
            swaps = base.candidate_swaps(state.columns[a], state.columns[b])
            for r, s in swaps:
                if r not in FOCUS_ROWS and s not in FOCUS_ROWS:
                    continue
                new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(state, a, b, r, s)
                new_cols = base.apply_swap_to_columns(state.columns, a, b, r, s)
                new_state = base.SearchState(
                    columns=new_cols,
                    pair_counts=new_pair_counts,
                    score_sq=new_score_sq,
                    stats=new_stats,
                )
                gain = move_gain(state, new_state)

                # Prefer global theorem score first, then the tracked signed defect vector
                key = (
                    new_state.score_sq,
                    -gain[0],          # better defect sq reduction
                    -gain[1],          # better defect abs reduction
                    -gain[2],          # better max abs reduction
                )
                moves.append((key, a, b, r, s, new_state))

    moves.sort(key=lambda x: x[0])
    return moves[:top_k]

def save_state(state: base.SearchState, path: Path, note: str, steps: int):
    payload = {
        "note": note,
        "steps": steps,
        "score_sq": state.score_sq,
        "defect_objective": defect_objective(state),
        "defect_vector": {f"{a}-{b}": v for (a, b), v in current_defect_vector(state).items()},
        "columns": state.columns,
        "matrix": base.matrix_from_columns(state.columns),
        "row_sums": base.row_sums_from_columns(state.columns),
        "col_sums": [len(c) for c in state.columns],
        "stats": state.stats,
    }
    base.json_dump(path, payload)

def walk(start: base.SearchState, outdir: Path, steps: int, seed: int):
    rng = random.Random(seed)
    cur = start
    best = start
    save_state(best, outdir / "defect_walk_start.json", "start", 0)

    for step in range(1, steps + 1):
        moves = candidate_moves(cur, top_k=120)
        if not moves:
            break

        # choose among top few to avoid deterministically looping
        pick = rng.choice(moves[: min(12, len(moves))])
        _, a, b, r, s, nxt = pick
        cur = nxt

        if (cur.score_sq, defect_objective(cur)) < (best.score_sq, defect_objective(best)):
            best = cur
            save_state(best, outdir / "defect_walk_best.json", f"improved at step {step}", step)
            print(
                f"[improved] step={step} "
                f"score_sq={best.score_sq} defect={defect_objective(best)} "
                f"move=({a},{b}; {r}<->{s})"
            )
            if best.score_sq == 0:
                break

        if step % 200 == 0:
            print(
                f"[walk] step={step} current_score={cur.score_sq} best_score={best.score_sq} "
                f"current_defect={defect_objective(cur)}"
            )

    save_state(best, outdir / "defect_walk_final.json", "final", steps)
    return best

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="artifacts/g15_transport_search/best_global.json")
    ap.add_argument("--outdir", default="artifacts/g15_transport_search")
    ap.add_argument("--steps", type=int, default=5000)
    ap.add_argument("--seed", type=int, default=20260404)
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    start = load_state(Path(args.input))
    print("[start] score_sq=", start.score_sq)
    print("[start] defect_objective=", defect_objective(start))
    print("[start] defect_vector=", current_defect_vector(start))

    best = walk(start, outdir, args.steps, args.seed)

    print("[final] score_sq=", best.score_sq)
    print("[final] defect_objective=", defect_objective(best))
    print("[final] defect_vector=", current_defect_vector(best))

if __name__ == "__main__":
    main()
