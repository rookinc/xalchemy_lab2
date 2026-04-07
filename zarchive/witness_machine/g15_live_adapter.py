from __future__ import annotations

from typing import Any

from .g30_translator import make_g30_state, project_g30_to_witness_state
from .g15_sector import sector_support
from .g15_core import g15_core


def g30_state_to_g15_focus(frame: int, phase: int, sheet: str) -> dict[str, Any]:
    state = make_g30_state(frame, phase, sheet)
    projected = list(project_g30_to_witness_state(state))

    vertex_index = projected[0]
    if not (0 <= vertex_index < 15):
        raise ValueError("projected frame must satisfy 0 <= frame < 15")

    core = g15_core()
    support = sector_support(vertex_index, core)

    vertex_row = core["vertices"][vertex_index]
    distance_row = core["distance_matrix"][vertex_index]
    adjacency_row = core["adjacency"][f"v{vertex_index}"]

    return {
        "name": "g15_live_focus_first_pass",
        "status": "sector_focus_ready",
        "input_state": dict(state),
        "projected_witness_state": projected,
        "g15_focus": {
            "vertex": vertex_row["id"],
            "vertex_index": vertex_index,
            "petersen_edge": vertex_row["petersen_edge"],
            "adjacent_vertices": adjacency_row,
            "distance_row": distance_row,
        },
        "sector_focus": support,
        "legend": {
            "note": "Transport-induced sector support on G15 selected from projected G30 state.",
        },
    }
