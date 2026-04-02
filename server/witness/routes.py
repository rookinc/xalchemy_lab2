from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from witness_machine.core import (
    apply_word,
    frame_count,
    state_count,
    state_dict,
    validate_state,
)

router = APIRouter(prefix="/api/witness", tags=["witness"])


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
    state = validate_state((frame, phase), r)
    return {
        "ok": True,
        "payload": state_dict(state, r),
    }


@router.post("/apply")
def api_witness_apply(body: ApplyRequest, r: int = Query(1, ge=1)):
    if len(body.state) != 2:
        raise HTTPException(status_code=400, detail="state must be [frame, phase]")

    state = validate_state((int(body.state[0]), int(body.state[1])), r)
    next_state = apply_word(state, [body.op], r)

    return {
        "ok": True,
        "payload": state_dict(next_state, r),
    }
