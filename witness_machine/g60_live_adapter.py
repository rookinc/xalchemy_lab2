from __future__ import annotations

from typing import Any

from .g30_translator import make_g30_state, project_g30_to_witness_state
from .g60_quotient import scaffold_to_g30_classes, g30_to_g15_classes
from .g60_scaffold import scaffold_adjacency, scaffold_edges


FRAME_TO_G30_SLOT = [
    "g30_00",
    "g30_01",
    "g30_02",
    "g30_03",
    "g30_04",
    "g30_05",
    "g30_06",
    "g30_07",
    "g30_08",
    "g30_09",
    "g30_10",
    "g30_11",
    "g30_00",
    "g30_01",
    "g30_02",
]


def _incident_edge_ids(node_id: str) -> list[str]:
    out: list[str] = []
    for edge in scaffold_edges():
        if node_id in edge["nodes"]:
            out.append(edge["id"])
    return out


def _primary_member(members: list[str], phase: int, sheet: str) -> str:
    if len(members) == 1:
        return members[0]

    # First-pass lift choice:
    # - sheet chooses the default side of the fiber
    # - phase toggles which side is emphasized
    use_last = (sheet == "-")
    if phase == 1:
        use_last = not use_last

    return members[-1] if use_last else members[0]


def g30_state_to_g60_focus(frame: int, phase: int, sheet: str) -> dict[str, Any]:
    state = make_g30_state(frame, phase, sheet)
    projected = list(project_g30_to_witness_state(state))

    s2g30 = scaffold_to_g30_classes()
    g30_to_g15 = g30_to_g15_classes()["g30_to_g15"]
    adj = scaffold_adjacency()

    frame_slot = state["frame"] % 15
    g30_class_id = FRAME_TO_G30_SLOT[frame_slot]
    members = list(s2g30["classes"][g30_class_id])
    primary = _primary_member(members, state["phase"], state["sheet"])

    phase_band = "objective" if state["phase"] else "subjective"

    return {
        "name": "g60_live_focus_first_pass",
        "status": "provisional",
        "input_state": dict(state),
        "projected_witness_state": projected,
        "g30_focus": {
            "class_id": g30_class_id,
            "members": members,
            "frame_slot": frame_slot,
        },
        "g15_focus": {
            "class_id": g30_to_g15[g30_class_id],
        },
        "scaffold_focus": {
            "primary_node": primary,
            "active_nodes": members,
            "neighbor_nodes": adj.get(primary, []),
            "active_edges": _incident_edge_ids(primary),
            "phase_band": phase_band,
            "sheet_accent": state["sheet"],
            "fiber_size": len(members),
        },
        "legend": {
            "note": "First-pass scaffold focus driven by provisional quotient classes.",
        },
    }
