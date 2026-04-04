#!/usr/bin/env python3
from __future__ import annotations

import argparse
import collections
import json
import random
import time
from pathlib import Path
from typing import Dict, List, Tuple, Set

import g15_transport_search as base

PAIR_LIST = base.PAIR_LIST
PAIR_DISTANCE = base.PAIR_DISTANCE
TARGET_BY_DISTANCE = base.TARGET_BY_DISTANCE

def defect_pairs(pair_counts: Dict[Tuple[int, int], int]) -> List[dict]:
    out = []
    for (i, j) in PAIR_LIST:
        d = PAIR_DISTANCE[(i, j)]
        tgt = TARGET_BY_DISTANCE[d]
        got = pair_counts[(i, j)]
        err = got - tgt
        if err != 0:
            out.append({
                "pair": [i, j],
                "distance": d,
                "got": got,
                "target": tgt,
                "err": err,
                "abs_err": abs(err),
            })
    out.sort(key=lambda x: (-x["abs_err"], x["distance"], x["pair"]))
    return out

def defect_rows(defects: List[dict]) -> Set[int]:
    rows = set()
    for d in defects:
        rows.add(d["pair"][0])
        rows.add(d["pair"][1])
    return rows

def load_state(path: Path) -> base.SearchState:
    data = json.loads(path.read_text())
    columns = data["columns"]
    return base.make_state(columns)

def save_state(state: base.SearchState, path: Path, note: str, steps: int) -> None:
    payload = {
        "note": note,
        "steps": steps,
        "score_sq": state.score_sq,
        "columns": state.columns,
        "matrix": base.matrix_from_columns(state.columns),
        "row_sums": base.row_sums_from_columns(state.columns),
        "col_sums": [len(c) for c in state.columns],
        "stats": state.stats,
        "defects": defect_pairs(state.pair_counts),
        "g15_distance_matrix": base.G15_DIST,
        "petersen_edges_indexing": base.PETERSEN_EDGES,
    }
    base.json_dump(path, payload)

def move_signature(a: int, b: int, r: int, s: int) -> Tuple[int, int, int, int]:
    if a > b:
        a, b = b, a
        r, s = s, r
    return (a, b, min(r, s), max(r, s))

def candidate_column_pairs(columns: List[List[int]], focus_rows: Set[int]) -> List[Tuple[int, int]]:
    col_sets = [set(c) for c in columns]
    touched = []
    other = []
    for a in range(base.N_COLS):
        for b in range(a + 1, base.N_COLS):
            hit = bool(col_sets[a] & focus_rows) or bool(col_sets[b] & focus_rows)
            if hit:
                touched.append((a, b))
            else:
                other.append((a, b))
    return touched + other

def ranked_moves(
    state: base.SearchState,
    focus_rows: Set[int],
    max_column_pairs: int,
    max_moves: int,
    tabu: collections.deque,
) -> List[Tuple[float, Tuple[int, int, int, int], base.SearchState]]:
    tabu_set = set(tabu)
    out = []

    col_pairs = candidate_column_pairs(state.columns, focus_rows)[:max_column_pairs]

    for a, b in col_pairs:
        swaps = base.candidate_swaps(state.columns[a], state.columns[b])
        scored_swaps = []
        for r, s in swaps:
            pri = 0
            if r in focus_rows:
                pri += 2
            if s in focus_rows:
                pri += 2
            scored_swaps.append((pri, r, s))
        scored_swaps.sort(reverse=True)

        for _, r, s in scored_swaps[:12]:
            sig = move_signature(a, b, r, s)
            new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(
                state, a, b, r, s
            )
            new_cols = base.apply_swap_to_columns(state.columns, a, b, r, s)
            new_state = base.SearchState(
                columns=new_cols,
                pair_counts=new_pair_counts,
                score_sq=new_score_sq,
                stats=new_stats,
            )

            defects = defect_pairs(new_pair_counts)
            wrong = len(defects)
            max_abs = new_stats["max_abs_error"]
            focus_hits = int(r in focus_rows) + int(s in focus_rows)

            # lexicographic-ish score: lower is better
            heuristic = (
                new_score_sq * 1000
                + wrong * 50
                + max_abs * 10
                - focus_hits
            )

            if sig in tabu_set:
                heuristic += 25

            out.append((heuristic, sig, new_state))

    out.sort(key=lambda x: x[0])
    return out[:max_moves]

def run_tabu(
    start: base.SearchState,
    outdir: Path,
    seed: int,
    steps: int,
    tabu_len: int,
    max_column_pairs: int,
    max_moves: int,
    restart_every: int,
) -> base.SearchState:
    rng = random.Random(seed)

    current = start
    best = start
    tabu = collections.deque(maxlen=tabu_len)

    save_state(best, outdir / "tabu_start.json", note="tabu start", steps=0)

    for step in range(1, steps + 1):
        defects = defect_pairs(current.pair_counts)
        focus_rows = defect_rows(defects)

        ranked = ranked_moves(
            state=current,
            focus_rows=focus_rows,
            max_column_pairs=max_column_pairs,
            max_moves=max_moves,
            tabu=tabu,
        )

        if not ranked:
            current = best
            continue

        # choose among top few, not always the first
        topk = ranked[: min(8, len(ranked))]
        heuristic, sig, nxt = rng.choice(topk)

        tabu.append(sig)
        current = nxt

        if current.score_sq < best.score_sq:
            best = current
            save_state(best, outdir / "tabu_best.json", note=f"improved at step {step}", steps=step)
            print(f"[improved] step={step} score_sq={best.score_sq}")
            if best.score_sq == 0:
                break

        if step % 1000 == 0:
            print(f"[tabu] step={step} current={current.score_sq} best={best.score_sq}")

        if restart_every > 0 and step % restart_every == 0:
            current = best

    save_state(best, outdir / "tabu_final.json", note="tabu final", steps=steps)
    return best

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="artifacts/g15_transport_search/best_global.json")
    ap.add_argument("--outdir", default="artifacts/g15_transport_search")
    ap.add_argument("--seed", type=int, default=20260404)
    ap.add_argument("--steps", type=int, default=50000)
    ap.add_argument("--tabu-len", type=int, default=400)
    ap.add_argument("--max-column-pairs", type=int, default=220)
    ap.add_argument("--max-moves", type=int, default=120)
    ap.add_argument("--restart-every", type=int, default=4000)
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    start = load_state(Path(args.input))
    print(f"[start] score_sq={start.score_sq}")
    for d in defect_pairs(start.pair_counts):
        print(
            f"  pair={tuple(d['pair'])} dist={d['distance']} "
            f"got={d['got']} target={d['target']} err={d['err']}"
        )

    best = run_tabu(
        start=start,
        outdir=outdir,
        seed=args.seed,
        steps=args.steps,
        tabu_len=args.tabu_len,
        max_column_pairs=args.max_column_pairs,
        max_moves=args.max_moves,
        restart_every=args.restart_every,
    )

    print(f"[final] score_sq={best.score_sq}")
    for d in defect_pairs(best.pair_counts):
        print(
            f"  pair={tuple(d['pair'])} dist={d['distance']} "
            f"got={d['got']} target={d['target']} err={d['err']}"
        )

if __name__ == "__main__":
    main()
