from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CANONICAL_PATH = ROOT / "specs" / "g15_transport" / "theorem_object.json"


def load_g15_transport_witness() -> dict[str, Any]:
    data = json.loads(CANONICAL_PATH.read_text())
    return {
        "shape": data["shape_M"],
        "matrix": data["matrix_M"],
        "columns": data["columns"],
        "row_sums": data["row_sums"],
        "col_sums": data["col_sums"],
        "score_sq": data["score_sq"],
        "stats": data["stats"],
        "g15_distance_matrix": data["g15_distance_matrix"],
        "petersen_edges_indexing": data["petersen_edges_indexing"],
        "distance_expression": data["distance_expression"],
        "adjacency_polynomial": data["adjacency_polynomial"],
        "source_artifact": data["source_artifact"],
    }


def load_M() -> list[list[int]]:
    return load_g15_transport_witness()["matrix"]


def load_columns() -> list[list[int]]:
    return load_g15_transport_witness()["columns"]
