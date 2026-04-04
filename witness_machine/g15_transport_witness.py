from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CANONICAL_PATH = ROOT / "artifacts" / "g15_transport_search" / "cpsat_exact_solution.json"

def load_g15_transport_witness() -> dict:
    data = json.loads(CANONICAL_PATH.read_text())
    return {
        "shape": data["shape"],
        "matrix": data["matrix"],
        "columns": data["columns"],
        "row_sums": data["row_sums"],
        "col_sums": data["col_sums"],
        "score_sq": data["score_sq"],
        "stats": data["stats"],
        "g15_distance_matrix": data["g15_distance_matrix"],
        "petersen_edges_indexing": data["petersen_edges_indexing"],
    }

def load_M() -> list[list[int]]:
    return load_g15_transport_witness()["matrix"]

def load_columns() -> list[list[int]]:
    return load_g15_transport_witness()["columns"]
