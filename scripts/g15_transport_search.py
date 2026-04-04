#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import multiprocessing as mp
import os
import random
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

N_ROWS = 15
N_COLS = 30
ROW_TARGET = 14
COL_TARGET = 7

# Target overlap law by G15 distance
TARGET_BY_DISTANCE = {
    0: 14,
    1: 9,
    2: 5,
    3: 4,
}

# ---------------------------------------------------------------------
# G15 = line graph of the Petersen graph
# We construct Petersen as Kneser KG(5,2): 10 vertices = 2-subsets of {0..4}
# Adjacent iff disjoint.
# Then G15 is the line graph of that graph: 15 vertices = edges of Petersen.
# ---------------------------------------------------------------------

def build_petersen_edges() -> List[Tuple[int, int]]:
    two_sets = []
    for a in range(5):
        for b in range(a + 1, 5):
            two_sets.append((a, b))  # 10 vertices
    edges = []
    for i in range(len(two_sets)):
        ai = set(two_sets[i])
        for j in range(i + 1, len(two_sets)):
            aj = set(two_sets[j])
            if ai.isdisjoint(aj):
                edges.append((i, j))
    assert len(edges) == 15, f"Expected 15 Petersen edges, got {len(edges)}"
    return edges

def build_line_graph_adjacency(edges: List[Tuple[int, int]]) -> List[List[int]]:
    n = len(edges)
    adj = [[0] * n for _ in range(n)]
    for i in range(n):
        a1, a2 = edges[i]
        for j in range(i + 1, n):
            b1, b2 = edges[j]
            if len({a1, a2, b1, b2}) < 4:
                adj[i][j] = 1
                adj[j][i] = 1
    # G15 should be 4-regular
    degrees = [sum(row) for row in adj]
    assert all(d == 4 for d in degrees), f"G15 not 4-regular: {degrees}"
    return adj

def floyd_warshall_dist(adj: List[List[int]]) -> List[List[int]]:
    n = len(adj)
    INF = 10**9
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
        for j in range(n):
            if adj[i][j]:
                dist[i][j] = 1
    for k in range(n):
        dk = dist[k]
        for i in range(n):
            dik = dist[i][k]
            if dik >= INF:
                continue
            di = dist[i]
            for j in range(n):
                cand = dik + dk[j]
                if cand < di[j]:
                    di[j] = cand
    return dist

PETERSEN_EDGES = build_petersen_edges()
G15_ADJ = build_line_graph_adjacency(PETERSEN_EDGES)
G15_DIST = floyd_warshall_dist(G15_ADJ)

PAIR_LIST: List[Tuple[int, int]] = [(i, j) for i in range(N_ROWS) for j in range(i + 1, N_ROWS)]
PAIR_DISTANCE: Dict[Tuple[int, int], int] = {(i, j): G15_DIST[i][j] for (i, j) in PAIR_LIST}

# ---------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------

def json_dump(path: Path, obj: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, indent=2, sort_keys=True))
    tmp.replace(path)

def matrix_from_columns(columns: List[List[int]]) -> List[List[int]]:
    M = [[0] * N_COLS for _ in range(N_ROWS)]
    for c, rows in enumerate(columns):
        for r in rows:
            M[r][c] = 1
    return M

def row_sums_from_columns(columns: List[List[int]]) -> List[int]:
    rs = [0] * N_ROWS
    for rows in columns:
        for r in rows:
            rs[r] += 1
    return rs

def pair_counts_from_columns(columns: List[List[int]]) -> Dict[Tuple[int, int], int]:
    counts = {(i, j): 0 for (i, j) in PAIR_LIST}
    for rows in columns:
        s = sorted(rows)
        for a in range(len(s)):
            ra = s[a]
            for b in range(a + 1, len(s)):
                rb = s[b]
                counts[(ra, rb)] += 1
    return counts

def score_from_pair_counts(pair_counts: Dict[Tuple[int, int], int]) -> Tuple[int, dict]:
    # Pure off-diagonal theorem objective
    # score = sum of squared errors within distance classes
    by_distance = {1: [], 2: [], 3: []}
    sq = 0
    abs_sum = 0
    max_abs = 0
    wrong_pairs = 0

    for (i, j), got in pair_counts.items():
        d = PAIR_DISTANCE[(i, j)]
        if d == 0:
            continue
        tgt = TARGET_BY_DISTANCE[d]
        err = got - tgt
        by_distance[d].append(got)
        sq += err * err
        ae = abs(err)
        abs_sum += ae
        max_abs = max(max_abs, ae)
        if err != 0:
            wrong_pairs += 1

    stats = {
        "score_sq": sq,
        "score_abs": abs_sum,
        "max_abs_error": max_abs,
        "wrong_pair_count": wrong_pairs,
        "bucket_hist": {
            str(d): histogram(vals) for d, vals in by_distance.items()
        },
        "bucket_summary": {
            str(d): summary(vals, TARGET_BY_DISTANCE[d]) for d, vals in by_distance.items()
        },
    }
    return sq, stats

def histogram(vals: List[int]) -> Dict[str, int]:
    out: Dict[str, int] = {}
    for v in vals:
        out[str(v)] = out.get(str(v), 0) + 1
    return dict(sorted(out.items(), key=lambda kv: int(kv[0])))

def summary(vals: List[int], target: int) -> dict:
    if not vals:
        return {"target": target, "count": 0}
    return {
        "target": target,
        "count": len(vals),
        "min": min(vals),
        "max": max(vals),
        "avg": sum(vals) / len(vals),
        "exact": sum(1 for v in vals if v == target),
    }

def validate_columns(columns: List[List[int]]) -> dict:
    row_sums = row_sums_from_columns(columns)
    col_sums = [len(col) for col in columns]
    pair_counts = pair_counts_from_columns(columns)
    score, stats = score_from_pair_counts(pair_counts)

    return {
        "ok_row_sums": all(x == ROW_TARGET for x in row_sums),
        "ok_col_sums": all(x == COL_TARGET for x in col_sums),
        "row_sums": row_sums,
        "col_sums": col_sums,
        "score_sq": score,
        "stats": stats,
    }

# ---------------------------------------------------------------------
# Initialization with exact margins
# ---------------------------------------------------------------------

def build_initial_columns(rng: random.Random, max_restarts: int = 2000) -> List[List[int]]:
    # We need 30 columns of size 7, and each of 15 rows used exactly 14 times.
    # Strategy:
    #   repeatedly construct columns greedily from remaining row capacities.
    #   restart if we get stuck.
    for _attempt in range(max_restarts):
        remaining = [ROW_TARGET] * N_ROWS
        columns: List[List[int]] = []
        success = True

        for c in range(N_COLS):
            chosen: List[int] = []
            chosen_set = set()

            for _ in range(COL_TARGET):
                candidates = [r for r in range(N_ROWS) if remaining[r] > 0 and r not in chosen_set]
                if not candidates:
                    success = False
                    break

                # Bias toward rows with largest remaining need, but randomize ties
                rng.shuffle(candidates)
                candidates.sort(key=lambda r: remaining[r], reverse=True)

                # Soft random pick from the best few
                topk = candidates[: min(6, len(candidates))]
                r = rng.choice(topk)
                chosen.append(r)
                chosen_set.add(r)
                remaining[r] -= 1

            if not success:
                break

            # Quick feasibility filter:
            slots_left = (N_COLS - (c + 1)) * COL_TARGET
            if sum(remaining) != slots_left:
                success = False
                break
            if any(x < 0 for x in remaining):
                success = False
                break
            # A row can appear at most once per future column
            if any(x > (N_COLS - (c + 1)) for x in remaining):
                success = False
                break

            columns.append(sorted(chosen))

        if success and all(x == 0 for x in remaining) and len(columns) == N_COLS:
            return columns

    raise RuntimeError("Failed to construct initial exact-margin columns")

# ---------------------------------------------------------------------
# Search state
# ---------------------------------------------------------------------

@dataclass
class SearchState:
    columns: List[List[int]]
    pair_counts: Dict[Tuple[int, int], int]
    score_sq: int
    stats: dict

def make_state(columns: List[List[int]]) -> SearchState:
    pair_counts = pair_counts_from_columns(columns)
    score_sq, stats = score_from_pair_counts(pair_counts)
    return SearchState(columns=columns, pair_counts=pair_counts, score_sq=score_sq, stats=stats)

def candidate_swaps(col_a: List[int], col_b: List[int]) -> List[Tuple[int, int]]:
    set_a = set(col_a)
    set_b = set(col_b)
    only_a = [r for r in col_a if r not in set_b]
    only_b = [r for r in col_b if r not in set_a]
    out = []
    for r in only_a:
        for s in only_b:
            out.append((r, s))
    return out

def apply_swap_to_columns(columns: List[List[int]], a: int, b: int, r: int, s: int) -> List[List[int]]:
    new_cols = [col[:] for col in columns]
    A = set(new_cols[a])
    B = set(new_cols[b])
    A.remove(r)
    A.add(s)
    B.remove(s)
    B.add(r)
    new_cols[a] = sorted(A)
    new_cols[b] = sorted(B)
    return new_cols

def local_score_of_columns(col_rows: List[int]) -> Dict[Tuple[int, int], int]:
    s = sorted(col_rows)
    out: Dict[Tuple[int, int], int] = {}
    for i in range(len(s)):
        for j in range(i + 1, len(s)):
            out[(s[i], s[j])] = out.get((s[i], s[j]), 0) + 1
    return out

def delta_score_for_swap(state: SearchState, a: int, b: int, r: int, s: int) -> Tuple[int, Dict[Tuple[int, int], int], dict]:
    oldA = state.columns[a]
    oldB = state.columns[b]
    newA = sorted((set(oldA) - {r}) | {s})
    newB = sorted((set(oldB) - {s}) | {r})

    affected = set()
    for pair in local_score_of_columns(oldA).keys():
        affected.add(pair)
    for pair in local_score_of_columns(oldB).keys():
        affected.add(pair)
    for pair in local_score_of_columns(newA).keys():
        affected.add(pair)
    for pair in local_score_of_columns(newB).keys():
        affected.add(pair)

    oldA_pairs = local_score_of_columns(oldA)
    oldB_pairs = local_score_of_columns(oldB)
    newA_pairs = local_score_of_columns(newA)
    newB_pairs = local_score_of_columns(newB)

    new_pair_counts = dict(state.pair_counts)
    for pair in affected:
        val = new_pair_counts[pair]
        val -= oldA_pairs.get(pair, 0)
        val -= oldB_pairs.get(pair, 0)
        val += newA_pairs.get(pair, 0)
        val += newB_pairs.get(pair, 0)
        new_pair_counts[pair] = val

    new_score_sq, new_stats = score_from_pair_counts(new_pair_counts)
    return new_score_sq, new_pair_counts, new_stats

def greedy_or_anneal_step(state: SearchState, rng: random.Random, temperature: float) -> SearchState:
    a, b = rng.sample(range(N_COLS), 2)
    swaps = candidate_swaps(state.columns[a], state.columns[b])
    if not swaps:
        return state

    # Sample a small set of candidate swaps first; full eval only if needed
    rng.shuffle(swaps)
    sample = swaps[: min(24, len(swaps))]

    best = None
    best_tuple = None

    for r, s in sample:
        new_score_sq, new_pair_counts, new_stats = delta_score_for_swap(state, a, b, r, s)
        delta = new_score_sq - state.score_sq
        if best is None or new_score_sq < best:
            best = new_score_sq
            best_tuple = (r, s, new_pair_counts, new_stats)

        if delta <= 0:
            new_cols = apply_swap_to_columns(state.columns, a, b, r, s)
            return SearchState(new_cols, new_pair_counts, new_score_sq, new_stats)

    # No improving swap in the sampled set; maybe accept a worse move
    if best_tuple is not None and temperature > 1e-9:
        delta = best - state.score_sq
        p = math.exp(-delta / temperature) if delta > 0 else 1.0
        if rng.random() < p:
            r, s, new_pair_counts, new_stats = best_tuple
            new_cols = apply_swap_to_columns(state.columns, a, b, r, s)
            return SearchState(new_cols, new_pair_counts, best, new_stats)

    return state

def run_single_worker(
    worker_id: int,
    iterations: int,
    seed: int,
    outdir: str,
    checkpoint_every: int,
    start_temperature: float,
    cooling: float,
) -> dict:
    rng = random.Random(seed)
    out_path = Path(outdir)

    columns = build_initial_columns(rng)
    state = make_state(columns)
    best = state
    best_iter = 0
    temp = start_temperature

    worker_prefix = out_path / f"worker_{worker_id:02d}"

    for it in range(1, iterations + 1):
        state = greedy_or_anneal_step(state, rng, temp)
        temp *= cooling

        if state.score_sq < best.score_sq:
            best = SearchState(
                columns=[col[:] for col in state.columns],
                pair_counts=dict(state.pair_counts),
                score_sq=state.score_sq,
                stats=json.loads(json.dumps(state.stats)),
            )
            best_iter = it
            save_state(best, worker_prefix.with_name(worker_prefix.name + "_best.json"), worker_id, seed, it)

            if best.score_sq == 0:
                break

        if checkpoint_every > 0 and it % checkpoint_every == 0:
            save_state(best, worker_prefix.with_name(worker_prefix.name + "_checkpoint.json"), worker_id, seed, it)

    final_path = worker_prefix.with_name(worker_prefix.name + "_final.json")
    save_state(best, final_path, worker_id, seed, best_iter)

    return {
        "worker_id": worker_id,
        "seed": seed,
        "best_iter": best_iter,
        "score_sq": best.score_sq,
        "path": str(final_path),
    }

def save_state(state: SearchState, path: Path, worker_id: int, seed: int, iteration: int) -> None:
    row_sums = row_sums_from_columns(state.columns)
    payload = {
        "worker_id": worker_id,
        "seed": seed,
        "iteration": iteration,
        "shape": [N_ROWS, N_COLS],
        "row_target": ROW_TARGET,
        "col_target": COL_TARGET,
        "score_sq": state.score_sq,
        "row_sums": row_sums,
        "col_sums": [len(col) for col in state.columns],
        "columns": state.columns,
        "matrix": matrix_from_columns(state.columns),
        "stats": state.stats,
        "g15_distance_matrix": G15_DIST,
        "petersen_edges_indexing": PETERSEN_EDGES,
    }
    json_dump(path, payload)

# ---------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------

def cmd_search(args: argparse.Namespace) -> None:
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    workers = args.workers
    if workers <= 0:
        cpu = os.cpu_count() or 4
        workers = max(1, min(8, cpu - 1))

    base_seed = args.seed if args.seed is not None else int(time.time())

    started = time.time()
    results = []

    ctx = mp.get_context("spawn")
    with ProcessPoolExecutor(max_workers=workers, mp_context=ctx) as ex:
        futs = []
        for worker_id in range(workers):
            seed = base_seed + 10007 * worker_id
            fut = ex.submit(
                run_single_worker,
                worker_id,
                args.iterations,
                seed,
                str(outdir),
                args.checkpoint_every,
                args.start_temperature,
                args.cooling,
            )
            futs.append(fut)

        for fut in as_completed(futs):
            result = fut.result()
            results.append(result)
            print(
                f"[done] worker={result['worker_id']} seed={result['seed']} "
                f"score_sq={result['score_sq']} best_iter={result['best_iter']} "
                f"path={result['path']}"
            )

    # Find global best
    best_result = min(results, key=lambda x: x["score_sq"])
    best_data = json.loads(Path(best_result["path"]).read_text())
    global_best_path = outdir / "best_global.json"
    json_dump(global_best_path, best_data)

    summary_payload = {
        "command": "search",
        "started_unix": started,
        "finished_unix": time.time(),
        "elapsed_seconds": time.time() - started,
        "workers": workers,
        "iterations_per_worker": args.iterations,
        "base_seed": base_seed,
        "results": results,
        "best_global_path": str(global_best_path),
        "best_global_score_sq": best_result["score_sq"],
    }
    json_dump(outdir / "run_summary.json", summary_payload)

    print(f"[summary] best_global_score_sq={best_result['score_sq']}")
    print(f"[summary] best_global_path={global_best_path}")

def cmd_validate(args: argparse.Namespace) -> None:
    path = Path(args.input)
    data = json.loads(path.read_text())

    if "columns" in data:
        columns = data["columns"]
    elif "matrix" in data:
        M = data["matrix"]
        columns = []
        for c in range(N_COLS):
            col = [r for r in range(N_ROWS) if M[r][c] == 1]
            columns.append(col)
    else:
        raise ValueError("Input JSON must contain either 'columns' or 'matrix'")

    report = validate_columns(columns)
    print(json.dumps(report, indent=2, sort_keys=True))

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Search for a G15 transport-sector matrix M")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search", help="Run multistart search")
    s.add_argument("--iterations", type=int, default=250000, help="Iterations per worker")
    s.add_argument("--workers", type=int, default=0, help="Worker count (0 = auto)")
    s.add_argument("--seed", type=int, default=None, help="Base seed")
    s.add_argument("--outdir", type=str, default="artifacts/g15_transport_search")
    s.add_argument("--checkpoint-every", type=int, default=25000)
    s.add_argument("--start-temperature", type=float, default=2.0)
    s.add_argument("--cooling", type=float, default=0.99995)
    s.set_defaults(func=cmd_search)

    v = sub.add_parser("validate", help="Validate a saved candidate")
    v.add_argument("input", type=str, help="Path to candidate JSON")
    v.set_defaults(func=cmd_validate)

    return p

def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
