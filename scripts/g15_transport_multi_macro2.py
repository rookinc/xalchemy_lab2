#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List, Tuple

sys.path.insert(0, str(Path("scripts").resolve()))
import g15_transport_search as base

def load_state(path: Path) -> base.SearchState:
    data = json.loads(path.read_text())
    return base.make_state(data["columns"])

def wrong_pairs(state: base.SearchState):
    out = []
    for (i, j) in base.PAIR_LIST:
        d = base.PAIR_DISTANCE[(i, j)]
        tgt = base.TARGET_BY_DISTANCE[d]
        got = state.pair_counts[(i, j)]
        err = got - tgt
        if err != 0:
            out.append((i, j, d, got, tgt, err))
    return out

def d1_miss_count(state: base.SearchState) -> int:
    c = 0
    for (i, j) in base.PAIR_LIST:
        if base.PAIR_DISTANCE[(i, j)] != 1:
            continue
        if state.pair_counts[(i, j)] != base.TARGET_BY_DISTANCE[1]:
            c += 1
    return c

def rank_key(state: base.SearchState):
    return (
        state.score_sq,
        state.stats["wrong_pair_count"],
        d1_miss_count(state),
        state.stats["max_abs_error"],
    )

def save_state(state: base.SearchState, path: Path, note: str, meta: dict):
    payload = {
        "note": note,
        "meta": meta,
        "score_sq": state.score_sq,
        "rank_key": list(rank_key(state)),
        "columns": state.columns,
        "matrix": base.matrix_from_columns(state.columns),
        "row_sums": base.row_sums_from_columns(state.columns),
        "col_sums": [len(c) for c in state.columns],
        "stats": state.stats,
        "wrong_pairs": [
            {"pair":[i,j], "distance":d, "got":got, "target":tgt, "err":err}
            for (i,j,d,got,tgt,err) in wrong_pairs(state)
        ],
    }
    base.json_dump(path, payload)

def first_layer_moves(
    state: base.SearchState,
    first_score_cap: int,
    max_column_pairs: int,
    top_swaps_per_pair: int,
):
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
                new_state = base.SearchState(new_cols, new_pair_counts, new_score_sq, new_stats)
                local.append((rank_key(new_state), new_state, {"a":a,"b":b,"r":r,"s":s}))
            local.sort(key=lambda x: x[0])
            out.extend(local[:top_swaps_per_pair])
    out.sort(key=lambda x: x[0])
    return out

def second_layer_best(
    state: base.SearchState,
    final_score_cap: int,
    max_column_pairs: int,
    top_swaps_per_pair: int,
):
    best = None
    pair_count = 0
    for a in range(base.N_COLS):
        for b in range(a + 1, base.N_COLS):
            pair_count += 1
            if pair_count > max_column_pairs:
                return best
            swaps = base.candidate_swaps(state.columns[a], state.columns[b])
            local = []
            for r, s in swaps:
                new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(state, a, b, r, s)
                if new_score_sq > final_score_cap:
                    continue
                new_cols = base.apply_swap_to_columns(state.columns, a, b, r, s)
                new_state = base.SearchState(new_cols, new_pair_counts, new_score_sq, new_stats)
                local.append((rank_key(new_state), new_state, {"a":a,"b":b,"r":r,"s":s}))
            local.sort(key=lambda x: x[0])
            for cand in local[:top_swaps_per_pair]:
                if best is None or cand[0] < best[0]:
                    best = cand
    return best

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outdir", default="artifacts/g15_transport_search")
    ap.add_argument("--first-score-cap", type=int, default=10)
    ap.add_argument("--final-score-cap", type=int, default=6)
    ap.add_argument("--max-column-pairs", type=int, default=435)
    ap.add_argument("--top-swaps-per-pair", type=int, default=3)
    ap.add_argument("--top-first-layer", type=int, default=120)
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    anchor_paths = [
        outdir / "best_global.json",
        outdir / "defect_walk_best.json",
        outdir / "macro2_final.json",
    ]

    anchors = []
    for p in anchor_paths:
        if p.exists():
            st = load_state(p)
            anchors.append((p.name, st))
            print(f"[anchor] {p.name} rank_key={rank_key(st)}")

    global_best = None
    global_best_key = None
    global_meta = None

    for anchor_name, anchor_state in anchors:
        layer1 = first_layer_moves(
            state=anchor_state,
            first_score_cap=args.first_score_cap,
            max_column_pairs=args.max_column_pairs,
            top_swaps_per_pair=args.top_swaps_per_pair,
        )[:args.top_first_layer]

        print(f"[anchor] {anchor_name} layer1={len(layer1)}")

        anchor_best_key = rank_key(anchor_state)
        anchor_best_state = anchor_state
        anchor_best_meta = {"anchor": anchor_name, "stage": "start"}

        for idx, (rk1, mid_state, move1) in enumerate(layer1, start=1):
            cand = second_layer_best(
                state=mid_state,
                final_score_cap=args.final_score_cap,
                max_column_pairs=args.max_column_pairs,
                top_swaps_per_pair=args.top_swaps_per_pair,
            )
            if cand is None:
                continue
            rk2, end_state, move2 = cand
            if rk2 < anchor_best_key:
                anchor_best_key = rk2
                anchor_best_state = end_state
                anchor_best_meta = {
                    "anchor": anchor_name,
                    "stage": "macro2",
                    "move1": move1,
                    "move2": move2,
                    "mid_rank_key": rk1,
                }
                print(f"[improved] anchor={anchor_name} idx={idx} rank_key={anchor_best_key}")

        save_state(anchor_best_state, outdir / f"multi_macro2_{anchor_name}", f"best from {anchor_name}", anchor_best_meta)

        if global_best is None or anchor_best_key < global_best_key:
            global_best = anchor_best_state
            global_best_key = anchor_best_key
            global_meta = anchor_best_meta

    if global_best is not None:
        save_state(global_best, outdir / "multi_macro2_best.json", "global best", global_meta)
        print(f"[global_best] rank_key={global_best_key}")
        for i, j, d, got, tgt, err in wrong_pairs(global_best):
            print(f"  pair=({i},{j}) dist={d} got={got} target={tgt} err={err}")

if __name__ == "__main__":
    main()
