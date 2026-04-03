from __future__ import annotations

from fastapi import APIRouter, Query

from witness_machine.core import (
    action_dict,
    state_assembly,
    state_dict,
    validate_state,
)
from witness_machine.g15_core import g15_core, g15_validation_report
from witness_machine.g15_sector import (
    sector_matrix_payload,
    sector_support,
    sector_validation_report,
)

router = APIRouter(tags=["witness-api"])


@router.get("/state")
def get_witness_state(
    frame: int = Query(..., ge=0),
    phase: int = Query(..., ge=0, le=1),
    r: int = Query(1, ge=1),
):
    state = validate_state((frame, phase), r)
    return {
        "ok": True,
        "payload": state_dict(state, r),
    }


@router.get("/assembly")
def get_witness_assembly(
    frame: int = Query(..., ge=0),
    phase: int = Query(..., ge=0, le=1),
    r: int = Query(1, ge=1),
):
    state = validate_state((frame, phase), r)
    return {
        "ok": True,
        "payload": state_assembly(state, r),
    }


@router.get("/action")
def get_witness_action(
    frame: int = Query(..., ge=0),
    r: int = Query(1, ge=1),
):
    return {
        "ok": True,
        "payload": action_dict(frame, r),
    }


@router.get("/g15/core")
def get_g15_core():
    return {
        "ok": True,
        "payload": g15_core(),
    }


@router.get("/g15/validate")
def get_g15_validate():
    return {
        "ok": True,
        "payload": g15_validation_report(),
    }


@router.get("/g15/sector")
def get_g15_sector(
    vertex: int = Query(..., ge=0, le=14),
):
    return {
        "ok": True,
        "payload": sector_support(vertex),
    }


@router.get("/g15/sector-matrix")
def get_g15_sector_matrix():
    return {
        "ok": True,
        "payload": sector_matrix_payload(),
    }


@router.get("/g15/sector-validate")
def get_g15_sector_validate():
    return {
        "ok": True,
        "payload": sector_validation_report(),
    }
