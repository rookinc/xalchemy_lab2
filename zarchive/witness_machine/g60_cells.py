from __future__ import annotations

from itertools import combinations
from typing import Any

from .g60_scaffold import scaffold_adjacency, scaffold_node_ids


def _edge_key(a: str, b: str) -> str:
    return "|".join(sorted((a, b)))


def _tri_key(a: str, b: str, c: str) -> str:
    return "|".join(sorted((a, b, c)))


def _tet_key(a: str, b: str, c: str, d: str) -> str:
    return "|".join(sorted((a, b, c, d)))


def lawful_faces() -> list[str]:
    """
    First-pass lawful face inventory:
    all 3-cycles in the current scaffold adjacency.
    """
    adj = scaffold_adjacency()
    nodes = scaffold_node_ids()
    out: set[str] = set()

    for a, b, c in combinations(nodes, 3):
        if (
            b in adj.get(a, [])
            and c in adj.get(a, [])
            and c in adj.get(b, [])
        ):
            out.add(_tri_key(a, b, c))

    return sorted(out)


def lawful_tetra() -> list[str]:
    """
    First-pass lawful tetra inventory:
    all K4 cliques in the current scaffold adjacency.
    """
    adj = scaffold_adjacency()
    nodes = scaffold_node_ids()
    out: set[str] = set()

    for a, b, c, d in combinations(nodes, 4):
        pairs = [
            (a, b), (a, c), (a, d),
            (b, c), (b, d), (c, d),
        ]
        if all(v in adj.get(u, []) for u, v in pairs):
            out.add(_tet_key(a, b, c, d))

    return sorted(out)


def face_boundary_edges(face_key: str) -> list[str]:
    a, b, c = face_key.split("|")
    return sorted([
        _edge_key(a, b),
        _edge_key(a, c),
        _edge_key(b, c),
    ])


def tetra_boundary_faces(tet_key: str) -> list[str]:
    a, b, c, d = tet_key.split("|")
    return sorted([
        _tri_key(a, b, c),
        _tri_key(a, b, d),
        _tri_key(a, c, d),
        _tri_key(b, c, d),
    ])


def realized_faces(occupied_edges: set[str]) -> list[str]:
    out = []
    for face in lawful_faces():
        if all(edge in occupied_edges for edge in face_boundary_edges(face)):
            out.append(face)
    return sorted(out)


def realized_tetra(occupied_faces: set[str]) -> list[str]:
    out = []
    for tet in lawful_tetra():
        if all(face in occupied_faces for face in tetra_boundary_faces(tet)):
            out.append(tet)
    return sorted(out)


def g60_cells_payload() -> dict[str, Any]:
    faces = lawful_faces()
    tetra = lawful_tetra()
    return {
        "name": "g60_cells_first_pass",
        "status": "lawful_cell_inventory",
        "lawful_faces": faces,
        "lawful_tetra": tetra,
        "face_count": len(faces),
        "tetra_count": len(tetra),
    }
