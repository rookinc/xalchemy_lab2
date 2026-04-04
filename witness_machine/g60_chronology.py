from __future__ import annotations

from typing import Any

from .g60_cells import g60_cells_payload
from .g60_occupancy import accumulate_g60_occupancy

TETRA_NAME_MAP = {
    "3|4|5|n2": "τ1",
    "3|5|6|n2": "τ2",
    "14|3|7|8": "τ3",
}

def tetra_display_name(tet: str) -> str:
    return TETRA_NAME_MAP.get(tet, tet)


def g60_birth_chronology(max_tick: int) -> dict[str, Any]:
    if not isinstance(max_tick, int) or max_tick < 1:
        raise ValueError("max_tick must be an integer >= 1")

    lawful = g60_cells_payload()
    lawful_faces = list(lawful["lawful_faces"])
    lawful_tetra = list(lawful["lawful_tetra"])

    face_birth: dict[str, int | None] = {face: None for face in lawful_faces}
    tetra_birth: dict[str, int | None] = {tet: None for tet in lawful_tetra}

    tick_rows = []

    for tick in range(1, max_tick + 1):
        occ = accumulate_g60_occupancy(tick)
        occ_faces = set(occ["occupied"]["faces"])
        occ_tetra = set(occ["occupied"]["tetra"])

        born_faces_this_tick = []
        for face in lawful_faces:
            if face_birth[face] is None and face in occ_faces:
                face_birth[face] = tick
                born_faces_this_tick.append(face)

        born_tetra_this_tick = []
        for tet in lawful_tetra:
            if tetra_birth[tet] is None and tet in occ_tetra:
                tetra_birth[tet] = tick
                born_tetra_this_tick.append(tet)

        tick_rows.append({
            "tick": tick,
            "occupied_face_count": len(occ_faces),
            "occupied_tetra_count": len(occ_tetra),
            "born_faces": born_faces_this_tick,
            "born_tetra": born_tetra_this_tick,
        })

    face_birth_rows = [
        {"face": face, "birth_tick": face_birth[face]}
        for face in lawful_faces
    ]
    tetra_birth_rows = [
        {
            "tetra": tet,
            "name": tetra_display_name(tet),
            "birth_tick": tetra_birth[tet],
        }
        for tet in lawful_tetra
    ]

    face_hist: dict[str, int] = {}
    for row in face_birth_rows:
      key = "unborn" if row["birth_tick"] is None else str(row["birth_tick"])
      face_hist[key] = face_hist.get(key, 0) + 1

    tetra_hist: dict[str, int] = {}
    for row in tetra_birth_rows:
      key = "unborn" if row["birth_tick"] is None else str(row["birth_tick"])
      tetra_hist[key] = tetra_hist.get(key, 0) + 1

    return {
        "max_tick": max_tick,
        "lawful_face_count": len(lawful_faces),
        "lawful_tetra_count": len(lawful_tetra),
        "face_birth": face_birth_rows,
        "tetra_birth": tetra_birth_rows,
        "face_birth_histogram": dict(sorted(face_hist.items(), key=lambda kv: (kv[0] == "unborn", kv[0]))),
        "tetra_birth_histogram": dict(sorted(tetra_hist.items(), key=lambda kv: (kv[0] == "unborn", kv[0]))),
        "tick_rows": tick_rows,
    }


def g60_birth_summary(max_tick: int) -> dict[str, Any]:
    payload = g60_birth_chronology(max_tick)
    realized_faces = [x for x in payload["face_birth"] if x["birth_tick"] is not None]
    realized_tetra = [x for x in payload["tetra_birth"] if x["birth_tick"] is not None]

    return {
        "max_tick": max_tick,
        "lawful_face_count": payload["lawful_face_count"],
        "lawful_tetra_count": payload["lawful_tetra_count"],
        "realized_face_count": len(realized_faces),
        "realized_tetra_count": len(realized_tetra),
        "last_face_birth_tick": max((x["birth_tick"] for x in realized_faces), default=None),
        "last_tetra_birth_tick": max((x["birth_tick"] for x in realized_tetra), default=None),
        "face_birth_histogram": payload["face_birth_histogram"],
        "tetra_birth_histogram": payload["tetra_birth_histogram"],
    }
