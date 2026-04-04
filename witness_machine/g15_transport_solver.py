from __future__ import annotations

from typing import Any

from .g15_transport_witness import load_g15_transport_witness

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


def theorem_shape_report(M: list[list[int]]) -> dict[str, Any]:
    witness = load_g15_transport_witness()
    D = witness["g15_distance_matrix"]
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


def exact_transport_matrix() -> list[list[int]]:
    return load_g15_transport_witness()["matrix"]


def solver_scaffold_report() -> dict[str, Any]:
    witness = load_g15_transport_witness()
    M = witness["matrix"]

    return {
        "name": "g15_transport_solver",
        "status": "exact_canonical_witness",
        "target": {
            "row_count": 15,
            "column_count": 30,
            "row_weight": TARGET_ROW_WEIGHT,
            "column_weight": TARGET_COLUMN_WEIGHT,
            "overlap_by_distance": TARGET_OVERLAP_BY_DISTANCE,
        },
        "exact_witness_report": theorem_shape_report(M),
        "exact_M": M,
        "witness_score_sq": witness["score_sq"],
        "witness_stats": witness["stats"],
    }
