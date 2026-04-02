from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from witness_machine.core import (
    action_cell,
    apply_word,
    frame_count,
    state_count,
    state_dict,
    validate_state,
)

router = APIRouter(tags=["witness"])


class ApplyRequest(BaseModel):
    state: list[int]
    op: Literal["tau", "tau_inv", "mu"]


@router.get("/info")
def api_witness_info(r: int = Query(1, ge=1)):
    return {
        "ok": True,
        "payload": {
            "scale": r,
            "frame_count": frame_count(r),
            "state_count": state_count(r),
            "initial_state": [0, 0],
            "phase_labels": {
                "0": "subjective",
                "1": "objective",
            },
            "ops": ["tau", "tau_inv", "mu"],
        },
    }


@router.get("/state")
def api_witness_state(
    frame: int = Query(..., ge=0),
    phase: int = Query(..., ge=0, le=1),
    r: int = Query(1, ge=1),
):
    state = (frame, phase)
    validate_state(state, r)
    payload = state_dict(state, r)
    return {"ok": True, "payload": payload}


@router.get("/action")
def api_witness_action(
    frame: int = Query(..., ge=0),
    phase: int = Query(..., ge=0, le=1),
    r: int = Query(1, ge=1),
):
    state = (frame, phase)
    validate_state(state, r)
    payload = {
        "state": [frame, phase],
        "action_cell": action_cell(frame, r),
    }
    return {"ok": True, "payload": payload}


@router.post("/apply")
def api_witness_apply(req: ApplyRequest, r: int = Query(1, ge=1)):
    state = (req.state[0], req.state[1])
    validate_state(state, r)

    try:
        next_state = apply_word(state, [req.op], r)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    payload = state_dict(next_state, r)
    return {"ok": True, "payload": payload}
