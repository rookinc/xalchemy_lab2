from __future__ import annotations

from typing import Any

from .g15_core import g15_core


def _edge_index_by_vertex_pair(core: dict[str, Any]) -> dict[tuple[int, int], int]:
    out: dict[tuple[int, int], int] = {}
    for edge in core["edges"]:
        a_label, b_label = edge["vertices"]
        a = int(a_label[1:])
        b = int(b_label[1:])
        key = (a, b) if a < b else (b, a)
        out[key] = edge["index"]
    return out


def edge_labels(core: dict[str, Any] | None = None) -> list[str]:
    core = core or g15_core()
    return [edge["id"] for edge in core["edges"]]


def vertex_labels(core: dict[str, Any] | None = None) -> list[str]:
    core = core or g15_core()
    return [vertex["id"] for vertex in core["vertices"]]


def closed_neighborhood(vertex_index: int, core: dict[str, Any] | None = None) -> list[int]:
    core = core or g15_core()
    n = core["vertex_count"]
    if not (0 <= vertex_index < n):
        raise ValueError(f"vertex_index must satisfy 0 <= i < {n}")

    adj = core["adjacency_matrix"]
    hood = {vertex_index}
    for j in range(n):
        if adj[vertex_index][j] == 1:
            hood.add(j)
    return sorted(hood)


def incident_edge_indices(vertices: list[int], core: dict[str, Any] | None = None) -> list[int]:
    core = core or g15_core()
    edge_map = _edge_index_by_vertex_pair(core)
    verts = sorted(set(vertices))
    out: set[int] = set()

    for i in range(len(verts)):
        for j in range(i + 1, len(verts)):
            a, b = verts[i], verts[j]
            key = (a, b)
            if key in edge_map:
                out.add(edge_map[key])

    return sorted(out)


def sector_support(vertex_index: int, core: dict[str, Any] | None = None) -> dict[str, Any]:
    core = core or g15_core()
    hood = closed_neighborhood(vertex_index, core)
    edge_ix = incident_edge_indices(hood, core)

    return {
        "vertex": f"v{vertex_index}",
        "vertex_index": vertex_index,
        "closed_neighborhood": [f"v{i}" for i in hood],
        "edge_indices": edge_ix,
        "edge_labels": [f"e{i}" for i in edge_ix],
        "weight": len(edge_ix),
    }


def build_M(core: dict[str, Any] | None = None) -> list[list[int]]:
    core = core or g15_core()
    n = core["vertex_count"]
    m = core["edge_count"]

    rows: list[list[int]] = []
    for i in range(n):
        support = set(sector_support(i, core)["edge_indices"])
        row = [1 if j in support else 0 for j in range(m)]
        rows.append(row)
    return rows


def sector_rows(core: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    core = core or g15_core()
    rows = []
    M = build_M(core)

    for i, row in enumerate(M):
        edge_ix = [j for j, x in enumerate(row) if x == 1]
        rows.append(
            {
                "vertex": f"v{i}",
                "vertex_index": i,
                "edge_indices": edge_ix,
                "edge_labels": [f"e{j}" for j in edge_ix],
                "weight": len(edge_ix),
            }
        )
    return rows


def column_weights(M: list[list[int]]) -> list[int]:
    if not M:
        return []
    row_count = len(M)
    col_count = len(M[0])
    return [sum(M[i][j] for i in range(row_count)) for j in range(col_count)]


def row_weights(M: list[list[int]]) -> list[int]:
    return [sum(row) for row in M]


def sector_matrix_payload() -> dict[str, Any]:
    core = g15_core()
    M = build_M(core)

    return {
        "name": "G15_sector_matrix_first_pass",
        "construction": "closed_neighborhood_edge_incidence",
        "vertex_labels": vertex_labels(core),
        "edge_labels": edge_labels(core),
        "matrix": M,
        "rows": sector_rows(core),
        "row_weights": row_weights(M),
        "column_weights": column_weights(M),
    }


def sector_validation_report() -> dict[str, Any]:
    payload = sector_matrix_payload()
    M = payload["matrix"]
    rw = payload["row_weights"]
    cw = payload["column_weights"]

    rectangular = bool(M) and all(len(row) == len(M[0]) for row in M)
    binary = all(x in (0, 1) for row in M for x in row)

    return {
        "ok": rectangular and binary,
        "construction": payload["construction"],
        "row_count": len(M),
        "column_count": len(M[0]) if M else 0,
        "row_weights": rw,
        "column_weights": cw,
        "distinct_row_weights": sorted(set(rw)),
        "distinct_column_weights": sorted(set(cw)),
        "rectangular": rectangular,
        "binary": binary,
    }
