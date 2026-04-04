#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple

from ortools.sat.python import cp_model

sys.path.insert(0, str(Path("scripts").resolve()))
import g15_transport_search as base

N_ROWS = base.N_ROWS
N_COLS = base.N_COLS

def load_hint_matrix(path: Path | None) -> List[List[int]] | None:
    if path is None or not path.exists():
        return None
    data = json.loads(path.read_text())
    if "matrix" in data:
        return data["matrix"]
    if "columns" in data:
        return base.matrix_from_columns(data["columns"])
    return None

def target_overlap(i: int, j: int) -> int:
    d = base.PAIR_DISTANCE[(i, j)]
    return base.TARGET_BY_DISTANCE[d]

def wrong_pairs_from_matrix(M: List[List[int]]) -> List[dict]:
    out = []
    for i, j in base.PAIR_LIST:
        got = sum(M[i][c] * M[j][c] for c in range(N_COLS))
        tgt = target_overlap(i, j)
        err = got - tgt
        if err != 0:
            out.append({
                "pair": [i, j],
                "distance": base.PAIR_DISTANCE[(i, j)],
                "got": got,
                "target": tgt,
                "err": err,
            })
    out.sort(key=lambda x: (x["distance"], x["pair"]))
    return out

def validate_matrix(M: List[List[int]]) -> dict:
    row_sums = [sum(M[r][c] for c in range(N_COLS)) for r in range(N_ROWS)]
    col_sums = [sum(M[r][c] for r in range(N_ROWS)) for c in range(N_COLS)]
    pair_counts = {}
    for i, j in base.PAIR_LIST:
        pair_counts[(i, j)] = sum(M[i][c] * M[j][c] for c in range(N_COLS))
    score_sq, stats = base.score_from_pair_counts(pair_counts)
    return {
        "ok_row_sums": all(x == base.ROW_TARGET for x in row_sums),
        "ok_col_sums": all(x == base.COL_TARGET for x in col_sums),
        "row_sums": row_sums,
        "col_sums": col_sums,
        "score_sq": score_sq,
        "stats": stats,
        "wrong_pairs": wrong_pairs_from_matrix(M),
    }

def save_solution(
    path: Path,
    M: List[List[int]],
    meta: dict,
) -> None:
    payload = {
        "meta": meta,
        "shape": [N_ROWS, N_COLS],
        "matrix": M,
        "columns": [[r for r in range(N_ROWS) if M[r][c] == 1] for c in range(N_COLS)],
        **validate_matrix(M),
        "g15_distance_matrix": base.G15_DIST,
        "petersen_edges_indexing": base.PETERSEN_EDGES,
    }
    base.json_dump(path, payload)

def add_basic_constraints(model: cp_model.CpModel, x):
    for r in range(N_ROWS):
        model.Add(sum(x[r][c] for c in range(N_COLS)) == base.ROW_TARGET)
    for c in range(N_COLS):
        model.Add(sum(x[r][c] for r in range(N_ROWS)) == base.COL_TARGET)

def add_overlap_constraints(model: cp_model.CpModel, x):
    y = {}
    for i, j in base.PAIR_LIST:
        ys = []
        for c in range(N_COLS):
            v = model.NewBoolVar(f"y_{i}_{j}_{c}")
            # v = x[i,c] AND x[j,c]
            model.Add(v <= x[i][c])
            model.Add(v <= x[j][c])
            model.Add(v >= x[i][c] + x[j][c] - 1)
            y[(i, j, c)] = v
            ys.append(v)
        model.Add(sum(ys) == target_overlap(i, j))
    return y

def add_symmetry_breaking(model: cp_model.CpModel, x):
    # Mild symmetry breaking:
    # sort columns lexicographically by interpreting each column as a binary number from row 0..14
    weights = [1 << (N_ROWS - 1 - r) for r in range(N_ROWS)]
    col_vals = []
    for c in range(N_COLS):
        v = model.NewIntVar(0, (1 << N_ROWS) - 1, f"colval_{c}")
        model.Add(v == sum(weights[r] * x[r][c] for r in range(N_ROWS)))
        col_vals.append(v)
    for c in range(N_COLS - 1):
        model.Add(col_vals[c] <= col_vals[c + 1])

def build_model(hint_matrix: List[List[int]] | None, use_symmetry: bool):
    model = cp_model.CpModel()
    x = [[model.NewBoolVar(f"x_{r}_{c}") for c in range(N_COLS)] for r in range(N_ROWS)]

    add_basic_constraints(model, x)
    add_overlap_constraints(model, x)

    if use_symmetry:
        add_symmetry_breaking(model, x)

    if hint_matrix is not None:
        for r in range(N_ROWS):
            for c in range(N_COLS):
                model.AddHint(x[r][c], int(hint_matrix[r][c]))

    return model, x

def solve_exact(
    outdir: Path,
    hint_path: Path | None,
    time_limit: int,
    workers: int,
    symmetry: bool,
) -> None:
    hint_matrix = load_hint_matrix(hint_path)

    print("[build] constructing model")
    t0 = time.time()
    model, x = build_model(hint_matrix, use_symmetry=symmetry)
    print(f"[build] done in {time.time()-t0:.2f}s")

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(time_limit)
    solver.parameters.num_search_workers = workers
    solver.parameters.log_search_progress = True
    solver.parameters.cp_model_presolve = True

    print("[solve] starting exact feasibility search")
    started = time.time()
    status = solver.Solve(model)
    elapsed = time.time() - started

    status_name = solver.StatusName(status)
    print(f"[solve] status={status_name} elapsed={elapsed:.2f}s")

    summary = {
        "mode": "exact",
        "status": status_name,
        "elapsed_seconds": elapsed,
        "time_limit_seconds": time_limit,
        "workers": workers,
        "hint_path": str(hint_path) if hint_path else None,
        "symmetry_breaking": symmetry,
    }

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        M = [[int(solver.Value(x[r][c])) for c in range(N_COLS)] for r in range(N_ROWS)]
        save_solution(outdir / "cpsat_exact_solution.json", M, summary)
        print("[solve] wrote artifacts/g15_transport_search/cpsat_exact_solution.json")
    else:
        base.json_dump(outdir / "cpsat_exact_summary.json", summary)
        print("[solve] no exact solution found in time limit")

def solve_soft(
    outdir: Path,
    hint_path: Path | None,
    time_limit: int,
    workers: int,
    symmetry: bool,
) -> None:
    hint_matrix = load_hint_matrix(hint_path)

    print("[build] constructing soft model")
    t0 = time.time()

    model = cp_model.CpModel()
    x = [[model.NewBoolVar(f"x_{r}_{c}") for c in range(N_COLS)] for r in range(N_ROWS)]

    add_basic_constraints(model, x)

    if symmetry:
        add_symmetry_breaking(model, x)

    deviations = []
    pair_meta = []

    for i, j in base.PAIR_LIST:
        ys = []
        for c in range(N_COLS):
            v = model.NewBoolVar(f"y_{i}_{j}_{c}")
            model.Add(v <= x[i][c])
            model.Add(v <= x[j][c])
            model.Add(v >= x[i][c] + x[j][c] - 1)
            ys.append(v)

        ov = model.NewIntVar(0, N_COLS, f"ov_{i}_{j}")
        model.Add(ov == sum(ys))

        tgt = target_overlap(i, j)
        pos = model.NewIntVar(0, N_COLS, f"pos_{i}_{j}")
        neg = model.NewIntVar(0, N_COLS, f"neg_{i}_{j}")
        model.Add(ov - tgt == pos - neg)

        absdev = model.NewIntVar(0, N_COLS, f"abs_{i}_{j}")
        model.Add(absdev == pos + neg)

        deviations.append(absdev)
        pair_meta.append((i, j, ov, absdev, tgt))

    model.Minimize(sum(deviations))

    if hint_matrix is not None:
        for r in range(N_ROWS):
            for c in range(N_COLS):
                model.AddHint(x[r][c], int(hint_matrix[r][c]))

    print(f"[build] done in {time.time()-t0:.2f}s")

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(time_limit)
    solver.parameters.num_search_workers = workers
    solver.parameters.log_search_progress = True
    solver.parameters.cp_model_presolve = True

    print("[solve] starting soft optimization")
    started = time.time()
    status = solver.Solve(model)
    elapsed = time.time() - started

    status_name = solver.StatusName(status)
    print(f"[solve] status={status_name} elapsed={elapsed:.2f}s")

    summary = {
        "mode": "soft",
        "status": status_name,
        "elapsed_seconds": elapsed,
        "time_limit_seconds": time_limit,
        "workers": workers,
        "hint_path": str(hint_path) if hint_path else None,
        "symmetry_breaking": symmetry,
        "objective_absdev": int(solver.ObjectiveValue()) if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else None,
    }

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        M = [[int(solver.Value(x[r][c])) for c in range(N_COLS)] for r in range(N_ROWS)]
        payload = validate_matrix(M)
        payload["meta"] = summary
        payload["shape"] = [N_ROWS, N_COLS]
        payload["matrix"] = M
        payload["columns"] = [[r for r in range(N_ROWS) if M[r][c] == 1] for c in range(N_COLS)]
        payload["pair_deviations"] = [
            {
                "pair": [i, j],
                "distance": base.PAIR_DISTANCE[(i, j)],
                "got": int(solver.Value(ov)),
                "target": tgt,
                "absdev": int(solver.Value(absdev)),
            }
            for (i, j, ov, absdev, tgt) in pair_meta
            if int(solver.Value(absdev)) != 0
        ]
        base.json_dump(outdir / "cpsat_soft_solution.json", payload)
        print("[solve] wrote artifacts/g15_transport_search/cpsat_soft_solution.json")
    else:
        base.json_dump(outdir / "cpsat_soft_summary.json", summary)
        print("[solve] no soft solution found")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["exact", "soft"], default="exact")
    ap.add_argument("--hint", default="artifacts/g15_transport_search/multi_macro2_best.json")
    ap.add_argument("--outdir", default="artifacts/g15_transport_search")
    ap.add_argument("--time-limit", type=int, default=1800)
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--no-symmetry", action="store_true")
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    hint_path = Path(args.hint) if args.hint else None
    symmetry = not args.no_symmetry

    if args.mode == "exact":
        solve_exact(outdir, hint_path, args.time_limit, args.workers, symmetry)
    else:
        solve_soft(outdir, hint_path, args.time_limit, args.workers, symmetry)

if __name__ == "__main__":
    main()
