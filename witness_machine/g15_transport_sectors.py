from __future__ import annotations

from typing import Any

from .g15_transport_witness import load_g15_transport_witness


TRANSPORT_SECTOR_ROWS: dict[str, list[str]] = {
    "v0": ["e16", "e17", "e18", "e19", "e20", "e21", "e22", "e23", "e24", "e25", "e26", "e27", "e28", "e29"],
    "v1": ["e11", "e12", "e13", "e14", "e15", "e21", "e22", "e23", "e24", "e25", "e26", "e27", "e28", "e29"],
    "v2": ["e6", "e7", "e8", "e9", "e10", "e21", "e22", "e23", "e24", "e25", "e26", "e27", "e28", "e29"],
    "v3": ["e2", "e3", "e4", "e5", "e8", "e9", "e10", "e13", "e14", "e15", "e19", "e20", "e28", "e29"],
    "v4": ["e1", "e3", "e4", "e5", "e7", "e9", "e10", "e12", "e15", "e18", "e19", "e20", "e27", "e29"],
    "v5": ["e3", "e4", "e5", "e6", "e7", "e8", "e9", "e10", "e15", "e20", "e24", "e25", "e26", "e29"],
    "v6": ["e0", "e1", "e2", "e5", "e6", "e7", "e10", "e11", "e12", "e14", "e16", "e17", "e23", "e26"],
    "v7": ["e0", "e1", "e4", "e5", "e7", "e9", "e11", "e12", "e14", "e17", "e18", "e20", "e23", "e27"],
    "v8": ["e0", "e2", "e5", "e7", "e11", "e12", "e13", "e14", "e15", "e17", "e22", "e23", "e25", "e27"],
    "v9": ["e0", "e1", "e2", "e3", "e6", "e8", "e10", "e11", "e13", "e16", "e17", "e18", "e21", "e26"],
    "v10": ["e0", "e2", "e3", "e4", "e6", "e8", "e13", "e14", "e15", "e16", "e18", "e19", "e21", "e28"],
    "v11": ["e0", "e1", "e3", "e6", "e13", "e16", "e17", "e18", "e19", "e20", "e21", "e22", "e24", "e28"],
    "v12": ["e0", "e1", "e2", "e6", "e7", "e8", "e9", "e10", "e11", "e16", "e24", "e25", "e26", "e29"],
    "v13": ["e2", "e4", "e5", "e8", "e11", "e12", "e13", "e14", "e15", "e19", "e21", "e22", "e25", "e28"],
    "v14": ["e1", "e3", "e4", "e9", "e12", "e16", "e17", "e18", "e19", "e20", "e22", "e23", "e24", "e27"],
}


def _edge_index(label: str) -> int:
    if not label.startswith("e"):
        raise ValueError(f"invalid edge label: {label}")
    try:
        idx = int(label[1:])
    except ValueError as exc:
        raise ValueError(f"invalid edge label: {label}") from exc
    if not (0 <= idx < 30):
        raise ValueError(f"edge label out of range: {label}")
    return idx


def transport_sector_labels() -> list[str]:
    return [f"v{i}" for i in range(15)]


def transport_sector_rows() -> dict[str, list[str]]:
    return {k: list(v) for k, v in TRANSPORT_SECTOR_ROWS.items()}


def build_transport_M() -> list[list[int]]:
    rows = transport_sector_rows()
    out: list[list[int]] = []

    for label in transport_sector_labels():
        edge_labels = rows.get(label, [])
        edge_set = set(edge_labels)
        row = [1 if f"e{j}" in edge_set else 0 for j in range(30)]
        out.append(row)

    return out


def _row_weights(M: list[list[int]]) -> list[int]:
    return [sum(row) for row in M]


def _column_weights(M: list[list[int]]) -> list[int]:
    if not M:
        return []
    n_rows = len(M)
    n_cols = len(M[0])
    return [sum(M[i][j] for i in range(n_rows)) for j in range(n_cols)]


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


def _distance_overlap_histogram(Q: list[list[int]], D: list[list[int]]) -> dict[str, list[int]]:
    buckets: dict[str, list[int]] = {"0": [], "1": [], "2": [], "3": []}
    n = len(Q)
    for i in range(n):
        for j in range(n):
            d = D[i][j]
            if d in {0, 1, 2, 3}:
                buckets[str(d)].append(Q[i][j])
    return {k: sorted(set(v)) for k, v in buckets.items()}


def transport_sector_validation_report() -> dict[str, Any]:
    witness = load_g15_transport_witness()
    rows = transport_sector_rows()
    labels = transport_sector_labels()

    missing_rows = [label for label in labels if label not in rows]
    extra_rows = [label for label in rows if label not in labels]

    duplicate_entries: dict[str, list[str]] = {}
    bad_labels: dict[str, list[str]] = {}
    row_sizes: dict[str, int] = {}

    for label in labels:
        edge_labels = rows.get(label, [])
        row_sizes[label] = len(edge_labels)

        seen: set[str] = set()
        dups: list[str] = []
        bads: list[str] = []
        for edge in edge_labels:
            if edge in seen:
                dups.append(edge)
            seen.add(edge)
            try:
                _edge_index(edge)
            except ValueError:
                bads.append(edge)

        if dups:
            duplicate_entries[label] = sorted(set(dups))
        if bads:
            bad_labels[label] = sorted(set(bads))

    M = build_transport_M()
    Q = _matmul_transpose(M)
    D = witness["g15_distance_matrix"]
    overlaps = _distance_overlap_histogram(Q, D)

    canonical_M = witness["matrix"]
    canonical_match = M == canonical_M

    return {
        "name": "g15_transport_sectors",
        "status": "exact_canonical_rows",
        "missing_rows": missing_rows,
        "extra_rows": extra_rows,
        "row_sizes": row_sizes,
        "duplicate_entries": duplicate_entries,
        "bad_labels": bad_labels,
        "row_weights": _row_weights(M),
        "column_weights": _column_weights(M),
        "distance_overlap_values": overlaps,
        "expected_distance_overlap": {
            "0": [14],
            "1": [9],
            "2": [5],
            "3": [4],
        },
        "canonical_match": canonical_match,
        "canonical_score_sq": witness["score_sq"],
        "theorem_shape_ok": (
            canonical_match
            and len(missing_rows) == 0
            and len(extra_rows) == 0
            and all(w == 14 for w in _row_weights(M))
            and all(w == 7 for w in _column_weights(M))
            and overlaps == {"0": [14], "1": [9], "2": [5], "3": [4]}
        ),
        "M": M,
        "Q": Q,
    }
