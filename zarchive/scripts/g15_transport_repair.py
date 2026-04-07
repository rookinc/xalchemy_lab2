#!/usr/bin/env python3
from __future__ import annotations

import argparse
import heapq
import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple, Set

# Reuse the existing search module
import g15_transport_search as base

N_ROWS = base.N_ROWS
N_COLS = base.N_COLS
TARGET_BY_DISTANCE = base.TARGET_BY_DISTANCE
PAIR_LIST = base.PAIR_LIST
PAIR_DISTANCE = base.PAIR_DISTANCE

@dataclass
class Node:
    score_sq: int
    depth: int
    columns: List[List[int]]
    pair_counts: Dict[Tuple[int, int], int]
    stats: dict
    move_log: List[dict]

def canonical_key(columns: List[List[int]]) -> Tuple[Tuple[int, ...], ...]:
    return tuple(tuple(col) for col in columns)

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
            })
    out.sort(key=lambda x: (abs(x["err"]), x["distance"], x["pair"]), reverse=True)
    return out

def defect_rows(defects: List[dict]) -> Set[int]:
    rows = set()
    for d in defects:
        rows.add(d["pair"][0])
        rows.add(d["pair"][1])
    return rows

def load_node(path: Path) -> Node:
    data = json.loads(path.read_text())
    columns = data["columns"]
    state = base.make_state(columns)
    return Node(
        score_sq=state.score_sq,
        depth=0,
        columns=state.columns,
        pair_counts=state.pair_counts,
        stats=state.stats,
        move_log=[],
    )

def save_node(node: Node, path: Path, note: str = "") -> None:
    payload = {
        "note": note,
        "shape": [base.N_ROWS, base.N_COLS],
        "score_sq": node.score_sq,
        "columns": node.columns,
        "matrix": base.matrix_from_columns(node.columns),
        "row_sums": base.row_sums_from_columns(node.columns),
        "col_sums": [len(c) for c in node.columns],
        "stats": node.stats,
        "move_log": node.move_log,
        "defects": defect_pairs(node.pair_counts),
        "g15_distance_matrix": base.G15_DIST,
        "petersen_edges_indexing": base.PETERSEN_EDGES,
    }
    base.json_dump(path, payload)

def candidate_column_pairs(node: Node, focus_rows: Set[int]) -> List[Tuple[int, int]]:
    # Prefer column pairs touching the defect rows
    col_sets = [set(col) for col in node.columns]
    touched = []
    other = []
    for a in range(N_COLS):
        for b in range(a + 1, N_COLS):
            if (col_sets[a] & focus_rows) or (col_sets[b] & focus_rows):
                touched.append((a, b))
            else:
                other.append((a, b))
    return touched + other

def prioritized_swaps(node: Node, a: int, b: int, focus_rows: Set[int]) -> List[Tuple[int, int]]:
    swaps = base.candidate_swaps(node.columns[a], node.columns[b])
    # Strong preference for swaps that move defect rows
    scored = []
    for r, s in swaps:
        pri = 0
        if r in focus_rows:
            pri += 2
        if s in focus_rows:
            pri += 2
        scored.append((pri, r, s))
    scored.sort(reverse=True)
    return [(r, s) for pri, r, s in scored]

def expand_node(
    node: Node,
    top_moves_per_pair: int,
    max_column_pairs: int,
) -> List[Node]:
    defects = defect_pairs(node.pair_counts)
    focus_rows = defect_rows(defects)
    col_pairs = candidate_column_pairs(node, focus_rows)[:max_column_pairs]

    candidates: List[Tuple[int, Node]] = []

    for a, b in col_pairs:
        swaps = prioritized_swaps(node, a, b, focus_rows)[:top_moves_per_pair]
        for r, s in swaps:
            new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(
                base.SearchState(node.columns, node.pair_counts, node.score_sq, node.stats),
                a, b, r, s
            )
            if new_score_sq > node.score_sq + 2:
                continue

            new_cols = base.apply_swap_to_columns(node.columns, a, b, r, s)
            new_node = Node(
                score_sq=new_score_sq,
                depth=node.depth + 1,
                columns=new_cols,
                pair_counts=new_pair_counts,
                stats=new_stats,
                move_log=node.move_log + [{
                    "a": a, "b": b, "swap_out_in": [r, s], "score_sq": new_score_sq
                }],
            )
            candidates.append((new_score_sq, new_node))

    candidates.sort(key=lambda x: (x[0], len(defect_pairs(x[1].pair_counts))))
    return [n for _, n in candidates]

def beam_repair(
    start: Node,
    beam_width: int,
    max_depth: int,
    top_moves_per_pair: int,
    max_column_pairs: int,
    outdir: Path,
) -> Node:
    best = start
    seen = {canonical_key(start.columns): start.score_sq}
    frontier = [start]

    save_node(best, outdir / "repair_start.json", note="repair start")

    for depth in range(1, max_depth + 1):
        next_pool: List[Node] = []
        for node in frontier:
            children = expand_node(
                node=node,
                top_moves_per_pair=top_moves_per_pair,
                max_column_pairs=max_column_pairs,
            )
            for child in children:
                key = canonical_key(child.columns)
                old = seen.get(key)
                if old is not None and old <= child.score_sq:
                    continue
                seen[key] = child.score_sq
                next_pool.append(child)

        if not next_pool:
            break

        next_pool.sort(
            key=lambda n: (
                n.score_sq,
                len(defect_pairs(n.pair_counts)),
                n.depth,
            )
        )
        frontier = next_pool[:beam_width]

        frontier_best = frontier[0]
        if frontier_best.score_sq < best.score_sq:
            best = frontier_best
            save_node(best, outdir / "repair_best.json", note=f"improved at depth {depth}")
            print(f"[improved] depth={depth} score_sq={best.score_sq}")

        print(
            f"[beam] depth={depth} frontier_best={frontier_best.score_sq} "
            f"global_best={best.score_sq} frontier_size={len(frontier)}"
        )

        if best.score_sq == 0:
            break

    save_node(best, outdir / "repair_final.json", note="repair final")
    return best

def greedy_polish(node: Node, rounds: int, outdir: Path) -> Node:
    best = node
    improved = True

    while improved and rounds > 0 and best.score_sq > 0:
        improved = False
        rounds -= 1

        defects = defect_pairs(best.pair_counts)
        focus_rows = defect_rows(defects)
        col_pairs = candidate_column_pairs(best, focus_rows)

        local_best = best
        for a, b in col_pairs:
            swaps = prioritized_swaps(best, a, b, focus_rows)
            for r, s in swaps:
                new_score_sq, new_pair_counts, new_stats = base.delta_score_for_swap(
                    base.SearchState(best.columns, best.pair_counts, best.score_sq, best.stats),
                    a, b, r, s
                )
                if new_score_sq < local_best.score_sq:
                    new_cols = base.apply_swap_to_columns(best.columns, a, b, r, s)
                    local_best = Node(
                        score_sq=new_score_sq,
                        depth=best.depth + 1,
                        columns=new_cols,
                        pair_counts=new_pair_counts,
                        stats=new_stats,
                        move_log=best.move_log + [{
                            "a": a, "b": b, "swap_out_in": [r, s], "score_sq": new_score_sq
                        }],
                    )

        if local_best.score_sq < best.score_sq:
            best = local_best
            improved = True
            save_node(best, outdir / "repair_polish_best.json", note="greedy polish improved")
            print(f"[polish] score_sq={best.score_sq}")

    return best

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--input",
        default="artifacts/g15_transport_search/best_global.json",
        help="Input incumbent JSON"
    )
    ap.add_argument(
        "--outdir",
        default="artifacts/g15_transport_search",
        help="Artifact output dir"
    )
    ap.add_argument("--beam-width", type=int, default=24)
    ap.add_argument("--max-depth", type=int, default=4)
    ap.add_argument("--top-moves-per-pair", type=int, default=8)
    ap.add_argument("--max-column-pairs", type=int, default=220)
    ap.add_argument("--polish-rounds", type=int, default=6)
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    start = load_node(Path(args.input))
    defects = defect_pairs(start.pair_counts)

    print(f"[start] score_sq={start.score_sq}")
    print("[start] defects:")
    for d in defects:
        print(
            f"  pair={tuple(d['pair'])} dist={d['distance']} "
            f"got={d['got']} target={d['target']} err={d['err']}"
        )

    best = beam_repair(
        start=start,
        beam_width=args.beam_width,
        max_depth=args.max_depth,
        top_moves_per_pair=args.top_moves_per_pair,
        max_column_pairs=args.max_column_pairs,
        outdir=outdir,
    )

    best = greedy_polish(best, rounds=args.polish_rounds, outdir=outdir)

    print(f"[final] score_sq={best.score_sq}")
    final_defects = defect_pairs(best.pair_counts)
    for d in final_defects:
        print(
            f"  pair={tuple(d['pair'])} dist={d['distance']} "
            f"got={d['got']} target={d['target']} err={d['err']}"
        )

if __name__ == "__main__":
    main()
