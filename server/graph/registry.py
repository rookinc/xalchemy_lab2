from __future__ import annotations


def list_supported_graphs() -> list[dict]:
    return [
        {
            "graph_key": "petersen",
            "label": "Petersen",
        }
    ]


def list_supported_lenses(graph_key: str) -> list[dict]:
    if graph_key != "petersen":
        return []

    return [
        {"lens_key": "identity", "label": "Identity"},
        {"lens_key": "line_graph", "label": "Line graph"},
        {"lens_key": "incidence", "label": "Incidence"},
    ]
