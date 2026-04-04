#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

sys.path.insert(0, str(Path("scripts").resolve()))
import g15_transport_search as base

TRACKED_PAIRS = [
    (3, 8),
    (4, 14),
    (11, 12),
    (3, 11),
    (4, 12),
    (8, 14),
]

def load_state(path: Path) -> base.SearchState:
    data = json.loads(path.read_text())
    return base.make_state(data["columns"])

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

def save_state(state: base.SearchState, path: Path, note: str, meta: dict) -> None:
    payload = {
        "note": note,
        "meta": meta,
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

def first_layer_moves(
    state: base.SearchState,
    first_score_cap: int,
    max_column_pairs: int,
    top_swaps_per_pair: int,
) -> List[Tuple[Tuple, base.SearchState, dict]]:
    out = []
    pair_count = 0
    for a in range(base.N_COLS):
        for b in range(a + 1, base.N_COLS):
            pair_count += 1
            if pair_count > max_column_pairs:
                out.sort(key=lambda x: x[0])
                return out
            swaps = base.candidate_swaps(state.columns[a], state.columns[b])
            local = []
            for r, s in swaps:
                new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(state, a, b, r, s)
                if new_score_sq > first_score_cap:
                    continue
                new_cols = base.apply_swap_to_columns(state.columns, a, b, r, s)
                new_state = base.SearchState(
                    columns=new_cols,
                    pair_counts=new_pair_counts,
                    score_sq=new_score_sq,
                    stats=new_stats,
                )
                local.append((rank_key(new_state), new_state, {"a": a, "b": b, "r": r, "s": s}))
            local.sort(key=lambda x: x[0])
            out.extend(local[:top_swaps_per_pair])
    out.sort(key=lambda x: x[0])
    return out

def second_layer_best(
    state: base.SearchState,
    final_score_cap: int,
    max_column_pairs: int,
    top_swaps_per_pair: int,
) -> Tuple[Tuple, base.SearchState | None, dict | None]:
    best = None
    pair_count = 0
    for a in range(base.N_COLS):
        for b in range(a + 1, base.N_COLS):
            pair_count += 1
            if pair_count > max_column_pairs:
                return best if best is not None else ((999,999,999,(999,999,999)), None, None)
            swaps = base.candidate_swaps(state.columns[a], state.columns[b])
            local = []
            for r, s in swaps:
                new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(state, a, b, r, s)
                if new_score_sq > final_score_cap:
                    continue
                new_cols = base.apply_swap_to_columns(state.columns, a, b, r, s)
                new_state = base.SearchState(
                    columns=new_cols,
                    pair_counts=new_pair_counts,
                    score_sq=new_score_sq,
                    stats=new_stats,
                )
                rk = rank_key(new_state)
                local.append((rk, new_state, {"a": a, "b": b, "r": r, "s": s}))
            local.sort(key=lambda x: x[0])
            for cand in local[:top_swaps_per_pair]:
                if best is None or cand[0] < best[0]:
                    best = cand
    return best if best is not None else ((999,999,999,(999,999,999)), None, None)

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="artifacts/g15_transport_search/defect_walk_best.json")
    ap.add_argument("--outdir", default="artifacts/g15_transport_search")
    ap.add_argument("--first-score-cap", type=int, default=8)
    ap.add_argument("--final-score-cap", type=int, default=6)
    ap.add_argument("--max-column-pairs", type=int, default=435)
    ap.add_argument("--top-swaps-per-pair", type=int, default=2)
    ap.add_argument("--top-first-layer", type=int, default=80)
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    start = load_state(Path(args.input))
    start_key = rank_key(start)

    print("[start] rank_key=", start_key)
    for x in wrong_pairs(start):
        print(f"  pair={tuple(x['pair'])} dist={x['distance']} got={x['got']} target={x['target']} err={x['err']}")

    layer1 = first_layer_moves(
        state=start,
        first_score_cap=args.first_score_cap,
        max_column_pairs=args.max_column_pairs,
        top_swaps_per_pair=args.top_swaps_per_pair,
    )[:args.top_first_layer]

    print(f"[layer1] candidates={len(layer1)}")

    best_key = start_key
    best_state = start
    best_meta = {"stage": "start"}

    for idx, (rk1, mid_state, move1) in enumerate(layer1, start=1):
        rk2, end_state, move2 = second_layer_best(
            state=mid_state,
            final_score_cap=args.final_score_cap,
            max_column_pairs=args.max_column_pairs,
            top_swaps_per_pair=args.top_swaps_per_pair,
        )
        if end_state is None:
            continue
        if rk2 < best_key:
            best_key = rk2
            best_state = end_state
            best_meta = {"stage": "macro2", "move1": move1, "move2": move2, "mid_rank_key": rk1}
            save_state(best_state, outdir / "macro2_best.json", "macro2 improved", best_meta)
            print(f"[improved] idx={idx} best_key={best_key}")

    save_state(best_state, outdir / "macro2_final.json", "macro2 final", best_meta)

    print("[final] rank_key=", best_key)
    for x in wrong_pairs(best_state):
        print(f"  pair={tuple(x['pair'])} dist={x['distance']} got={x['got']} target={x['target']} err={x['err']}")

if __name__ == "__main__":
    main()
