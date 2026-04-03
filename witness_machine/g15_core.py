from __future__ import annotations

from collections import deque
from typing import Any


def _canonical_edge(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


def petersen_vertices() -> list[int]:
    return list(range(10))


def petersen_edges() -> list[tuple[int, int]]:
    outer = [_canonical_edge(i, (i + 1) % 5) for i in range(5)]
    spokes = [_canonical_edge(i, i + 5) for i in range(5)]
    inner = [_canonical_edge(i + 5, 5 + ((i + 2) % 5)) for i in range(5)]
    edges = outer + spokes + inner
    return sorted(edges)


def petersen_adjacency() -> dict[int, list[int]]:
    adj = {v: set() for v in petersen_vertices()}
    for a, b in petersen_edges():
        adj[a].add(b)
        adj[b].add(a)
    return {k: sorted(vs) for k, vs in adj.items()}


def g15_vertices() -> list[str]:
    return [f"v{i}" for i in range(15)]


def g15_edge_labels() -> list[str]:
    return [f"e{i}" for i in range(30)]


def g15_core() -> dict[str, Any]:
    p_edges = petersen_edges()

    # Each Petersen edge becomes a G15 vertex.
    vertex_rows: list[dict[str, Any]] = []
    for i, edge in enumerate(p_edges):
        vertex_rows.append(
            {
                "id": f"v{i}",
                "index": i,
                "petersen_edge": list(edge),
            }
        )

    # G15 adjacency: two vertices adjacent iff the underlying Petersen edges share an endpoint.
    g15_adj_sets: dict[int, set[int]] = {i: set() for i in range(len(p_edges))}
    g15_edges: list[tuple[int, int]] = []

    for i in range(len(p_edges)):
        a1, b1 = p_edges[i]
        s1 = {a1, b1}
        for j in range(i + 1, len(p_edges)):
            a2, b2 = p_edges[j]
            s2 = {a2, b2}
            if s1 & s2:
                g15_adj_sets[i].add(j)
                g15_adj_sets[j].add(i)
                g15_edges.append((i, j))

    adjacency = {f"v{i}": [f"v{j}" for j in sorted(g15_adj_sets[i])] for i in range(15)}

    adjacency_matrix = [[0 for _ in range(15)] for _ in range(15)]
    for i in range(15):
        for j in g15_adj_sets[i]:
            adjacency_matrix[i][j] = 1

    edge_rows: list[dict[str, Any]] = []
    for k, (i, j) in enumerate(g15_edges):
        edge_rows.append(
            {
                "id": f"e{k}",
                "index": k,
                "vertices": [f"v{i}", f"v{j}"],
            }
        )

    distance_matrix = _distance_matrix(g15_adj_sets)

    return {
        "name": "G15",
        "construction": "line_graph_of_petersen",
        "vertex_count": 15,
        "edge_count": len(g15_edges),
        "regular_degree": 4,
        "vertices": vertex_rows,
        "edges": edge_rows,
        "adjacency": adjacency,
        "adjacency_matrix": adjacency_matrix,
        "distance_matrix": distance_matrix,
    }


def _distance_matrix(adj_sets: dict[int, set[int]]) -> list[list[int]]:
    n = len(adj_sets)
    out = [[-1 for _ in range(n)] for _ in range(n)]

    for src in range(n):
        dist = [-1] * n
        dist[src] = 0
        q: deque[int] = deque([src])

        while q:
            u = q.popleft()
            for v in sorted(adj_sets[u]):
                if dist[v] == -1:
                    dist[v] = dist[u] + 1
                    q.append(v)

        out[src] = dist

    return out


def g15_validation_report() -> dict[str, Any]:
    core = g15_core()
    adj = core["adjacency_matrix"]
    dist = core["distance_matrix"]

    degrees = [sum(row) for row in adj]
    symmetric_adj = all(adj[i][j] == adj[j][i] for i in range(15) for j in range(15))
    zero_diag = all(adj[i][i] == 0 for i in range(15))
    connected = all(dist[0][j] >= 0 for j in range(15))

    return {
        "ok": (
            core["vertex_count"] == 15
            and core["edge_count"] == 30
            and all(d == 4 for d in degrees)
            and symmetric_adj
            and zero_diag
            and connected
        ),
        "vertex_count": core["vertex_count"],
        "edge_count": core["edge_count"],
        "degrees": degrees,
        "adjacency_symmetric": symmetric_adj,
        "adjacency_zero_diagonal": zero_diag,
        "connected": connected,
        "diameter": max(max(row) for row in dist),
    }
