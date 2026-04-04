#!/usr/bin/env python3
from __future__ import annotations

import argparse
import heapq
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

sys.path.insert(0, str(Path("scripts").resolve()))
import g15_transport_search as base

TRACKED_PAIRS = [
    (1, 3),
    (1, 8),
    (3, 9),
    (4, 14),
    (4, 8),
    (9, 14),
]

def load_state(path: Path) -> base.SearchState:
    data = json.loads(path.read_text())
    return base.make_state(data["columns"])

def canonical_key(columns: List[List[int]]) -> Tuple[Tuple[int, ...], ...]:
    return tuple(tuple(col) for col in columns)

def wrong_pairs(state: base.SearchState) -> List[dict]:
    out = []
    for (i, j) in base.PAIR_LIST:
        d = base.PAIR_DISTANCE[(i, j)]
        tgt = base.TARGET_BY_DISTANCE[d]
        got = state.pair_counts[(i, j)]
        err = got - tgt
        if err != 0:
            out.append({
                "pair": [i, j],
                "distance": d,
                "got": got,
                "target": tgt,
                "err": err,
            })
    out.sort(key=lambda x: (x["distance"], x["pair"]))
    return out

def tracked_defect_objective(state: base.SearchState) -> Tuple[int, int, int]:
    vals = []
    for pair in TRACKED_PAIRS:
        d = base.PAIR_DISTANCE[pair]
        tgt = base.TARGET_BY_DISTANCE[d]
        got = state.pair_counts[pair]
        vals.append(got - tgt)
    sq = sum(v * v for v in vals)
    ab = sum(abs(v) for v in vals)
    mx = max(abs(v) for v in vals) if vals else 0
    return (sq, ab, mx)

def d1_miss_count(state: base.SearchState) -> int:
    c = 0
    for (i, j) in base.PAIR_LIST:
        if base.PAIR_DISTANCE[(i, j)] != 1:
            continue
        tgt = base.TARGET_BY_DISTANCE[1]
        got = state.pair_counts[(i, j)]
        if got != tgt:
            c += 1
    return c

def rank_key(state: base.SearchState) -> Tuple[int, int, int, Tuple[int, int, int]]:
    return (
        state.score_sq,
        state.stats["wrong_pair_count"],
        d1_miss_count(state),
        tracked_defect_objective(state),
    )

def save_state(state: base.SearchState, path: Path, note: str, depth: int) -> None:
    payload = {
        "note": note,
        "depth": depth,
        "score_sq": state.score_sq,
        "rank_key": list(rank_key(state)),
        "tracked_defect_objective": list(tracked_defect_objective(state)),
        "d1_miss_count": d1_miss_count(state),
        "columns": state.columns,
        "matrix": base.matrix_from_columns(state.columns),
        "row_sums": base.row_sums_from_columns(state.columns),
        "col_sums": [len(c) for c in state.columns],
        "stats": state.stats,
        "wrong_pairs": wrong_pairs(state),
    }
    base.json_dump(path, payload)

def candidate_moves(
    state: base.SearchState,
    max_column_pairs: int,
    top_swaps_per_pair: int,
    score_cap: int,
) -> List[Tuple[Tuple, base.SearchState, dict]]:
    out = []
    col_pairs_examined = 0

    for a in range(base.N_COLS):
        for b in range(a + 1, base.N_COLS):
            col_pairs_examined += 1
            if col_pairs_examined > max_column_pairs:
                return sorted(out, key=lambda x: x[0])

            swaps = base.candidate_swaps(state.columns[a], state.columns[b])
            scored = []

            for r, s in swaps:
                new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(state, a, b, r, s)
                if new_score_sq > score_cap:
                    continue
                new_cols = base.apply_swap_to_columns(state.columns, a, b, r, s)
                new_state = base.SearchState(
                    columns=new_cols,
                    pair_counts=new_pair_counts,
                    score_sq=new_score_sq,
                    stats=new_stats,
                )
                rk = rank_key(new_state)
                scored.append((rk, new_state, {"a": a, "b": b, "r": r, "s": s}))

            scored.sort(key=lambda x: x[0])
            out.extend(scored[:top_swaps_per_pair])

    out.sort(key=lambda x: x[0])
    return out

def beam_search(
    start: base.SearchState,
    outdir: Path,
    beam_width: int,
    max_depth: int,
    score_cap: int,
    max_column_pairs: int,
    top_swaps_per_pair: int,
) -> base.SearchState:
    best = start
    best_key = rank_key(start)
    seen: Dict[Tuple[Tuple[int, ...], ...], Tuple] = {canonical_key(start.columns): best_key}
    frontier = [(best_key, 0, start)]

    save_state(start, outdir / "plateau_start.json", "plateau start", 0)

    for depth in range(1, max_depth + 1):
        pool: List[Tuple[Tuple, int, base.SearchState]] = []

        for _, _, state in frontier:
            moves = candidate_moves(
                state=state,
                max_column_pairs=max_column_pairs,
                top_swaps_per_pair=top_swaps_per_pair,
                score_cap=score_cap,
            )
            for rk, new_state, meta in moves:
                key = canonical_key(new_state.columns)
                prev = seen.get(key)
                if prev is not None and prev <= rk:
                    continue
                seen[key] = rk
                pool.append((rk, depth, new_state))

        if not pool:
            print(f"[beam] depth={depth} no candidates under score_cap={score_cap}")
            break

        pool.sort(key=lambda x: x[0])
        frontier = pool[:beam_width]

        fk = frontier[0][0]
        print(f"[beam] depth={depth} frontier_best={fk}")

        if fk < best_key:
            best_key = fk
            best = frontier[0][2]
            save_state(best, outdir / "plateau_best.json", f"improved at depth {depth}", depth)
            print(f"[improved] depth={depth} best={best_key}")
            if best.score_sq == 0:
                break

    save_state(best, outdir / "plateau_final.json", "plateau final", max_depth)
    return best

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="artifacts/g15_transport_search/defect_walk_best.json")
    ap.add_argument("--outdir", default="artifacts/g15_transport_search")
    ap.add_argument("--beam-width", type=int, default=32)
    ap.add_argument("--max-depth", type=int, default=5)
    ap.add_argument("--score-cap", type=int, default=6)
    ap.add_argument("--max-column-pairs", type=int, default=435)
    ap.add_argument("--top-swaps-per-pair", type=int, default=3)
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    start = load_state(Path(args.input))
    print("[start] rank_key=", rank_key(start))
    print("[start] wrong_pairs=")
    for x in wrong_pairs(start):
        print(f"  pair={tuple(x['pair'])} dist={x['distance']} got={x['got']} target={x['target']} err={x['err']}")

    best = beam_search(
        start=start,
        outdir=outdir,
        beam_width=args.beam_width,
        max_depth=args.max_depth,
        score_cap=args.score_cap,
        max_column_pairs=args.max_column_pairs,
        top_swaps_per_pair=args.top_swaps_per_pair,
    )

    print("[final] rank_key=", rank_key(best))
    print("[final] wrong_pairs=")
    for x in wrong_pairs(best):
        print(f"  pair={tuple(x['pair'])} dist={x['distance']} got={x['got']} target={x['target']} err={x['err']}")

if __name__ == "__main__":
    main()
