from __future__ import annotations

from itertools import combinations
from typing import Any

from .g15_core import g15_core


TARGET_ROW_WEIGHT = 14
TARGET_COLUMN_WEIGHT = 7
TARGET_OVERLAP_BY_DISTANCE = {
    0: 14,
    1: 9,
    2: 5,
    3: 4,
}


def _row_overlap(a: list[int], b: list[int]) -> int:
    return sum(x * y for x, y in zip(a, b))


def _distance_constraints(core: dict[str, Any]) -> dict[tuple[int, int], int]:
    D = core["distance_matrix"]
    out: dict[tuple[int, int], int] = {}
    for i in range(len(D)):
        for j in range(len(D)):
            d = D[i][j]
            if d in TARGET_OVERLAP_BY_DISTANCE:
                out[(i, j)] = TARGET_OVERLAP_BY_DISTANCE[d]
    return out


def _column_weights(M: list[list[int]]) -> list[int]:
    if not M:
        return [0] * 30
    n_rows = len(M)
    n_cols = len(M[0])
    return [sum(M[i][j] for i in range(n_rows)) for j in range(n_cols)]


def _row_weights(M: list[list[int]]) -> list[int]:
    return [sum(row) for row in M]


def _distance_overlap_values(M: list[list[int]], D: list[list[int]]) -> dict[str, list[int]]:
    buckets: dict[str, list[int]] = {"0": [], "1": [], "2": [], "3": []}
    n = len(M)
    for i in range(n):
        for j in range(n):
            d = D[i][j]
            if d in {0, 1, 2, 3}:
                buckets[str(d)].append(_row_overlap(M[i], M[j]))
    return {k: sorted(set(v)) for k, v in buckets.items()}


def zero_matrix() -> list[list[int]]:
    return [[0 for _ in range(30)] for _ in range(15)]


def matrix_from_row_sets(row_sets: list[set[int]]) -> list[list[int]]:
    M = []
    for s in row_sets:
        M.append([1 if j in s else 0 for j in range(30)])
    return M


def theorem_shape_report(M: list[list[int]]) -> dict[str, Any]:
    core = g15_core()
    D = core["distance_matrix"]
    row_weights = _row_weights(M)
    col_weights = _column_weights(M)
    overlaps = _distance_overlap_values(M, D)

    return {
        "row_weights": row_weights,
        "column_weights": col_weights,
        "distance_overlap_values": overlaps,
        "expected_distance_overlap": {
            "0": [14],
            "1": [9],
            "2": [5],
            "3": [4],
        },
        "row_weight_ok": all(w == TARGET_ROW_WEIGHT for w in row_weights),
        "column_weight_ok": all(w == TARGET_COLUMN_WEIGHT for w in col_weights),
        "overlap_ok": overlaps == {"0": [14], "1": [9], "2": [5], "3": [4]},
        "theorem_shape_ok": (
            all(w == TARGET_ROW_WEIGHT for w in row_weights)
            and all(w == TARGET_COLUMN_WEIGHT for w in col_weights)
            and overlaps == {"0": [14], "1": [9], "2": [5], "3": [4]}
        ),
    }


def seeded_candidate_from_distance_shells() -> list[list[int]]:
    """
    Very rough first-pass constructor:
    each row starts with itself, all distance-1 vertices, all distance-2 vertices,
    then trims deterministically to 14 using edge indices.

    This is not expected to solve the theorem. It just provides a structured seed.
    """
    core = g15_core()
    D = core["distance_matrix"]

    row_sets: list[set[int]] = []
    for i in range(15):
        chosen = {j for j in range(30) if (j + i) % 2 == 0}
        # deterministically trim or expand to 14
        ordered = sorted(chosen)
        if len(ordered) >= TARGET_ROW_WEIGHT:
            row_sets.append(set(ordered[:TARGET_ROW_WEIGHT]))
        else:
            fill = list(range(30))
            k = 0
            while len(ordered) < TARGET_ROW_WEIGHT:
                if fill[k] not in chosen:
                    ordered.append(fill[k])
                k += 1
            row_sets.append(set(sorted(ordered[:TARGET_ROW_WEIGHT])))

    return matrix_from_row_sets(row_sets)


def greedy_overlap_repair(
    M: list[list[int]],
    max_passes: int = 2000,
) -> list[list[int]]:
    """
    Hill-climb style repair:
    swap a 1 and 0 within a row if it improves total overlap error
    while preserving row weight 14.
    """
    core = g15_core()
    D = core["distance_matrix"]

    def score(mat: list[list[int]]) -> int:
        err = 0
        # row weights
        for w in _row_weights(mat):
            err += abs(w - TARGET_ROW_WEIGHT) * 1000
        # column weights
        for w in _column_weights(mat):
            err += abs(w - TARGET_COLUMN_WEIGHT) * 100
        # overlaps
        for i in range(15):
            for j in range(15):
                target = TARGET_OVERLAP_BY_DISTANCE[D[i][j]]
                err += abs(_row_overlap(mat[i], mat[j]) - target)
        return err

    cur = [row[:] for row in M]
    cur_score = score(cur)

    for _ in range(max_passes):
        improved = False
        for i in range(15):
            ones = [j for j, x in enumerate(cur[i]) if x == 1]
            zeros = [j for j, x in enumerate(cur[i]) if x == 0]

            for a in ones:
                for b in zeros:
                    trial = [row[:] for row in cur]
                    trial[i][a] = 0
                    trial[i][b] = 1
                    s = score(trial)
                    if s < cur_score:
                        cur = trial
                        cur_score = s
                        improved = True
                        break
                if improved:
                    break
            if improved:
                break
        if not improved:
            break

    return cur


def solver_scaffold_report() -> dict[str, Any]:
    seed = seeded_candidate_from_distance_shells()
    repaired = seed

    return {
        "name": "g15_transport_solver_scaffold",
        "target": {
            "row_count": 15,
            "column_count": 30,
            "row_weight": TARGET_ROW_WEIGHT,
            "column_weight": TARGET_COLUMN_WEIGHT,
            "overlap_by_distance": TARGET_OVERLAP_BY_DISTANCE,
        },
        "seed_report": theorem_shape_report(seed),
        "repaired_report": theorem_shape_report(repaired),
        "seed_M": seed,
        "repaired_M": repaired,
    }
