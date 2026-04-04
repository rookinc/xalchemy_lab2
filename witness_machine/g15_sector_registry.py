from __future__ import annotations

from typing import Any

from .g15_core import g15_core
from .g15_sector import build_M, sector_rows


def _matmul_transpose(M: list[list[int]]) -> list[list[int]]:
    n = len(M)
    m = len(M[0]) if M else 0
    out = [[0 for _ in range(n)] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            s = 0
            for k in range(m):
                s += M[i][k] * M[j][k]
            out[i][j] = s
    return out


def _matmul(A: list[list[int]], B: list[list[int]]) -> list[list[int]]:
    n = len(A)
    p = len(B)
    q = len(B[0]) if B else 0
    if not A or not B or len(A[0]) != p:
        raise ValueError("matrix shapes do not align")
    out = [[0 for _ in range(q)] for _ in range(n)]
    for i in range(n):
        for j in range(q):
            s = 0
            for k in range(p):
                s += A[i][k] * B[k][j]
            out[i][j] = s
    return out


def _add(A: list[list[int]], B: list[list[int]]) -> list[list[int]]:
    return [[A[i][j] + B[i][j] for j in range(len(A[0]))] for i in range(len(A))]


def _scale(c: int, A: list[list[int]]) -> list[list[int]]:
    return [[c * A[i][j] for j in range(len(A[0]))] for i in range(len(A))]


def _eye(n: int) -> list[list[int]]:
    return [[1 if i == j else 0 for j in range(n)] for i in range(n)]


def _distance_overlap_histogram(Q: list[list[int]], D: list[list[int]]) -> dict[str, list[int]]:
    buckets: dict[str, list[int]] = {"0": [], "1": [], "2": [], "3": []}
    n = len(Q)
    for i in range(n):
        for j in range(n):
            d = D[i][j]
            if d in {0, 1, 2, 3}:
                buckets[str(d)].append(Q[i][j])
    return {k: sorted(set(v)) for k, v in buckets.items()}


def g15_sector_registry() -> dict[str, Any]:
    core = g15_core()
    A = core["adjacency_matrix"]
    D = core["distance_matrix"]
    M = build_M(core)
    Q = _matmul_transpose(M)

    A2 = _matmul(A, A)
    A3 = _matmul(A2, A)
    rhs = _add(_add(A3, _scale(2, A2)), _scale(2, _eye(len(A))))

    rows = sector_rows(core)
    registry_rows = []
    for idx, row in enumerate(rows):
        registry_rows.append({
            "vertex": row["vertex"],
            "vertex_index": row["vertex_index"],
            "edge_indices": row["edge_indices"],
            "edge_labels": row["edge_labels"],
            "weight": row["weight"],
            "Q_row": Q[idx],
            "distance_row": D[idx],
        })

    return {
        "name": "g15_sector_registry",
        "core_graph": {
            "name": core["name"],
            "construction": core["construction"],
            "vertex_count": core["vertex_count"],
            "edge_count": core["edge_count"],
            "regular_degree": core["regular_degree"],
        },
        "matrix_data": {
            "vertex_labels": [v["id"] for v in core["vertices"]],
            "edge_labels": [e["id"] for e in core["edges"]],
            "M": M,
            "Q": Q,
            "A": A,
            "A2": A2,
            "A3": A3,
            "poly_rhs": rhs,
        },
        "rows": registry_rows,
        "summary": {
            "row_weights": [sum(row) for row in M],
            "column_weights": [sum(M[i][j] for i in range(len(M))) for j in range(len(M[0]))],
            "distance_overlap_values": _distance_overlap_histogram(Q, D),
            "polynomial_identity_holds": Q == rhs,
            "expected_distance_overlap": {
                "0": [14],
                "1": [9],
                "2": [5],
                "3": [4],
            },
        },
    }


def g15_sector_registry_summary() -> dict[str, Any]:
    payload = g15_sector_registry()
    return {
        "name": payload["name"],
        "core_graph": payload["core_graph"],
        "row_weights": payload["summary"]["row_weights"],
        "column_weights": payload["summary"]["column_weights"],
        "distance_overlap_values": payload["summary"]["distance_overlap_values"],
        "polynomial_identity_holds": payload["summary"]["polynomial_identity_holds"],
    }
