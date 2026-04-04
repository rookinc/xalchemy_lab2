from __future__ import annotations

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from witness_machine.g15_core import g15_core
from witness_machine.g15_transport_solver import theorem_shape_report

ART = ROOT / "artifacts"
ART.mkdir(parents=True, exist_ok=True)

TARGET = {0: 14, 1: 9, 2: 5, 3: 4}


def overlap(a: list[int], b: list[int]) -> int:
    return sum(x * y for x, y in zip(a, b))


def score(M: list[list[int]], D: list[list[int]]) -> int:
    rep = theorem_shape_report(M)
    s = 0
    for i in range(15):
        for j in range(15):
            t = TARGET[D[i][j]]
            s += abs(overlap(M[i], M[j]) - t) * (50 if i != j else 1)
    return s


def save(path: Path, M: list[list[int]], D: list[list[int]], meta: dict) -> None:
    rep = theorem_shape_report(M)
    payload = {
        "meta": meta,
        "score": score(M, D),
        "report": rep,
        "M": M,
    }
    path.write_text(json.dumps(payload, indent=2))


def build_seed() -> list[list[int]]:
    # Deterministic balanced seed from previous success pattern: cyclic windows.
    col_to_rows = {c: [] for c in range(30)}
    M = [[0] * 30 for _ in range(15)]

    # Each row gets 14 cols, each col ends with weight 7.
    # Simple modular pattern, then repaired by greedy balancing below.
    for r in range(15):
        cols = {(r + k) % 30 for k in range(14)}
        for c in cols:
            M[r][c] = 1

    # Balance columns to 7 with naive row-internal swaps.
    changed = True
    while changed:
        changed = False
        col_w = [sum(M[r][c] for r in range(15)) for c in range(30)]
        hi = [c for c, w in enumerate(col_w) if w > 7]
        lo = [c for c, w in enumerate(col_w) if w < 7]
        if not hi or not lo:
            break
        for c_hi in hi:
            moved = False
            for c_lo in lo:
                for r in range(15):
                    if M[r][c_hi] == 1 and M[r][c_lo] == 0:
                        M[r][c_hi] = 0
                        M[r][c_lo] = 1
                        changed = True
                        moved = True
                        break
                if moved:
                    break

    return M


def bad_pairs(M: list[list[int]], D: list[list[int]]) -> list[tuple[int, int, int]]:
    out = []
    for i in range(15):
        for j in range(i + 1, 15):
            t = TARGET[D[i][j]]
            ov = overlap(M[i], M[j])
            out.append((abs(ov - t), i, j))
    out.sort(reverse=True)
    return out


def paired_swap_candidates(M: list[list[int]], i: int, j: int):
    # columns in i not j, in j not i, both, neither
    i_only = [c for c in range(30) if M[i][c] == 1 and M[j][c] == 0]
    j_only = [c for c in range(30) if M[i][c] == 0 and M[j][c] == 1]
    both = [c for c in range(30) if M[i][c] == 1 and M[j][c] == 1]
    neither = [c for c in range(30) if M[i][c] == 0 and M[j][c] == 0]
    return i_only, j_only, both, neither


def do_two_row_swap(M: list[list[int]], r1: int, out_c: int, in_c: int, r2: int):
    N = [row[:] for row in M]
    N[r1][out_c] = 0
    N[r1][in_c] = 1
    N[r2][out_c] = 1
    N[r2][in_c] = 0
    return N


def search(max_steps: int = 20000, report_every: int = 250, seed_val: int = 1729):
    rng = random.Random(seed_val)
    core = g15_core()
    D = core["distance_matrix"]

    M = build_seed()
    best = [row[:] for row in M]
    best_score = score(best, D)
    save(ART / "transport_solver_paired_best.json", best, D, {"phase": "init"})

    print("initial score:", best_score)
    print("initial report:", theorem_shape_report(best)["distance_overlap_values"])

    for step in range(1, max_steps + 1):
        improved = False
        pairs = bad_pairs(best, D)[:12]

        for _, i, j in pairs:
            tgt = TARGET[D[i][j]]
            ov = overlap(best[i], best[j])

            i_only, j_only, both, neither = paired_swap_candidates(best, i, j)

            # If overlap too low, try to increase commonality:
            # move a column from i_only into j and remove a j_only from j into i via a balanced 2-row swap with helper row
            # If overlap too high, do the reverse by breaking commonality.
            # We use helper rows to preserve column weights exactly.

            trials = []

            if ov < tgt:
                # make i and j share more columns
                for c_add in i_only[:6]:
                    for c_drop in neither[:6]:
                        # helper row k with c_drop=1 and c_add=0
                        for k in range(15):
                            if k in {i, j}:
                                continue
                            if best[k][c_drop] == 1 and best[k][c_add] == 0 and best[j][c_add] == 0 and best[j][c_drop] == 0:
                                N = do_two_row_swap(best, j, c_drop, c_add, k)
                                trials.append(N)
            elif ov > tgt:
                # reduce commonality
                for c_common in both[:6]:
                    for c_new in neither[:6]:
                        for k in range(15):
                            if k in {i, j}:
                                continue
                            if best[k][c_new] == 1 and best[k][c_common] == 0:
                                # move common column out of j, replace with new
                                if best[j][c_common] == 1 and best[j][c_new] == 0:
                                    N = do_two_row_swap(best, j, c_common, c_new, k)
                                    trials.append(N)

            rng.shuffle(trials)
            for N in trials[:40]:
                s = score(N, D)
                if s < best_score:
                    best = N
                    best_score = s
                    improved = True
                    save(
                        ART / "transport_solver_paired_best.json",
                        best,
                        D,
                        {"phase": "search", "step": step, "pair": [i, j]},
                    )
                    break
            if improved:
                break

        if step % report_every == 0:
            rep = theorem_shape_report(best)
            print(
                f"step={step} score={best_score} "
                f"rows_ok={rep['row_weight_ok']} cols_ok={rep['column_weight_ok']} "
                f"overlap={rep['distance_overlap_values']}"
            )

    save(ART / "transport_solver_paired_final.json", best, D, {"phase": "final", "steps": max_steps})
    rep = theorem_shape_report(best)
    print("\nfinal score:", best_score)
    print("row weights:", rep["row_weights"])
    print("column weights:", rep["column_weights"])
    print("distance overlaps:", rep["distance_overlap_values"])
    print("theorem shape ok:", rep["theorem_shape_ok"])


if __name__ == "__main__":
    search()
