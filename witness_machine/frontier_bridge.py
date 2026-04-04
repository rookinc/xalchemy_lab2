from __future__ import annotations

from typing import Any

from .g30_translator import make_g30_state, project_g30_to_witness_state
from .g15_live_adapter import g30_state_to_g15_focus
from .g15_sector import sector_support
from .g15_core import g15_core
from .g60_live_adapter import g30_state_to_g60_focus


REGISTER = ["W", "X", "Y", "Z", "T", "I"]


def _slot_at(index: int) -> str:
    return REGISTER[index % len(REGISTER)]


def _sheet_for_tick(tick: int) -> str:
    return "+" if tick % 2 == 1 else "-"


def _phase_for_tick(tick: int) -> int:
    # closed frontier remains objective-facing in the current working convention
    return 1


def _frame_for_tick(tick: int) -> int:
    # first-pass transport clock
    return (tick - 1) % 15


def _frontier_local_payload(tick: int) -> dict[str, Any]:
    slot = _slot_at(tick - 1)
    next_slot = _slot_at(tick)
    return {
        "tick": tick,
        "slot": slot,
        "next_slot": next_slot,
        "socket": "T",
        "closed_id": f"t{tick}",
        "open_id": f"t{tick + 1}",
        "closed_payload": f"t{tick}",
        "open_payload": f"t{tick + 1}",
        "join": "f4" if tick == 1 else f"t{tick - 1}r",
        "sheet": _sheet_for_tick(tick),
    }


def frontier_tick_to_g60_focus(tick: int) -> dict[str, Any]:
    if not isinstance(tick, int) or tick < 1:
        raise ValueError("tick must be an integer >= 1")

    local = _frontier_local_payload(tick)

    frame = _frame_for_tick(tick)
    phase = _phase_for_tick(tick)
    sheet = local["sheet"]

    g30_state = make_g30_state(frame, phase, sheet)
    projected_witness_state = list(project_g30_to_witness_state(g30_state))

    g15_focus = g30_state_to_g15_focus(frame, phase, sheet)
    vertex_index = projected_witness_state[0]
    core = g15_core()
    g15_sector_support = sector_support(vertex_index, core)

    g60_focus = g30_state_to_g60_focus(frame, phase, sheet)

    return {
        "tick": tick,
        "frontier": local,
        "g30_state": dict(g30_state),
        "projected_witness_state": projected_witness_state,
        "g15_focus": g15_focus,
        "g15_sector_support": g15_sector_support,
        "g60_focus": g60_focus,
        "bridge_summary": {
            "route": "frontier -> g30 -> g15 -> g60",
            "frame": frame,
            "phase": phase,
            "sheet": sheet,
            "slot": local["slot"],
            "next_slot": local["next_slot"],
            "socket": local["socket"],
        },
    }
