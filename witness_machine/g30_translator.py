from __future__ import annotations

from typing import Any, TypedDict



class G30State(TypedDict):
    frame: int
    phase: int
    sheet: str


def g30_translator_metadata() -> dict[str, Any]:
    return {
        "name": "G30_translator",
        "status": "lifted_state_enabled",
        "description": "Intermediate translator layer where lift, twist, and sheet memory live.",
    }


def g30_translator_state_model() -> dict[str, Any]:
    return {
        "base_coordinates": {
            "frame_modulus": 15,
            "phase_modulus": 2,
            "sheet_modulus": 2,
        },
        "canonical_state_shape": {
            "frame": "int in [0,14]",
            "phase": "0|1",
            "sheet": "+|-",
        },
        "interpretation": {
            "frame": "position on the G15 cycle register",
            "phase": "subjective/objective style toggle",
            "sheet": "lift/sign memory retained by G30 and forgotten by G15",
        },
    }


def g30_translator_operators() -> dict[str, Any]:
    return {
        "operators": [
            {
                "name": "tau",
                "status": "implemented",
                "description": "Advance one frame while preserving phase and sheet.",
            },
            {
                "name": "tau_inv",
                "status": "implemented",
                "description": "Retreat one frame while preserving phase and sheet.",
            },
            {
                "name": "mu",
                "status": "implemented",
                "description": "Toggle subjective/objective phase while preserving frame and sheet.",
            },
            {
                "name": "lift_flip",
                "status": "implemented",
                "description": "Sheet/sign transition induced by one full G15 traversal.",
            },
        ],
        "cycle_rules": {
            "g15_sign_closing_rule": "After one full G15 traversal, identity is not restored; the sheet flips.",
            "g30_identity_restoring_rule": "After two full G15 traversals, identity is restored.",
            "short_form": {
                "g15": "n_15 = -n_0",
                "g30": "n_30 = n_0",
            },
        },
    }


def g30_projection_contract() -> dict[str, Any]:
    return {
        "maps": [
            {
                "name": "g60_to_g30",
                "status": "stub",
                "description": "Map host-level objects into translator fibers or lifted states.",
            },
            {
                "name": "g30_to_g15",
                "status": "implemented",
                "description": "Forget sheet memory and project translator states to the G15 core lens.",
            },
            {
                "name": "g30_state_to_witness_state",
                "status": "implemented",
                "description": "Project (frame, phase, sheet) to the witness machine state (frame, phase).",
            },
        ],
        "forgetful_boundary": {
            "retained_in_g30": ["frame", "phase", "sheet"],
            "forgotten_by_g15_projection": ["sheet"],
        },
    }


def make_g30_state(frame: int, phase: int, sheet: str = "+") -> G30State:
    state: G30State = {
        "frame": frame,
        "phase": phase,
        "sheet": sheet,
    }
    return validate_g30_state(state)


def validate_g30_state(state: G30State) -> G30State:
    frame = state["frame"]
    phase = state["phase"]
    sheet = state["sheet"]

    if not isinstance(frame, int):
        raise ValueError("frame must be an int")
    if not (0 <= frame < 15):
        raise ValueError("frame must satisfy 0 <= frame < 15")

    if phase not in {0, 1}:
        raise ValueError("phase must be 0 or 1")

    if sheet not in {"+", "-"}:
        raise ValueError("sheet must be '+' or '-'")

    return {
        "frame": frame,
        "phase": phase,
        "sheet": sheet,
    }


def flip_sheet(sheet: str) -> str:
    if sheet == "+":
        return "-"
    if sheet == "-":
        return "+"
    raise ValueError("sheet must be '+' or '-'")


def project_g30_to_witness_state(state: G30State) -> tuple[int, int]:
    state = validate_g30_state(state)
    return (state["frame"], state["phase"])


def tau_g30(state: G30State, r: int = 1) -> G30State:
    state = validate_g30_state(state)
    n = 5 * 3 * r
    return {
        "frame": (state["frame"] + 1) % n,
        "phase": state["phase"],
        "sheet": state["sheet"],
    }


def tau_inv_g30(state: G30State, r: int = 1) -> G30State:
    state = validate_g30_state(state)
    n = 5 * 3 * r
    return {
        "frame": (state["frame"] - 1) % n,
        "phase": state["phase"],
        "sheet": state["sheet"],
    }


def mu_g30(state: G30State) -> G30State:
    state = validate_g30_state(state)
    return {
        "frame": state["frame"],
        "phase": 1 - state["phase"],
        "sheet": state["sheet"],
    }


def walk_g15_once_g30(state: G30State, r: int = 1) -> G30State:
    state = validate_g30_state(state)
    n = 5 * 3 * r
    return {
        "frame": (state["frame"] + n) % n,
        "phase": state["phase"],
        "sheet": flip_sheet(state["sheet"]),
    }


def walk_g30_once_g30(state: G30State, r: int = 1) -> G30State:
    state = validate_g30_state(state)
    n = 2 * 5 * 3 * r
    return {
        "frame": (state["frame"] + n) % (5 * 3 * r),
        "phase": state["phase"],
        "sheet": state["sheet"],
    }


def g30_state_dict(state: G30State, r: int = 1) -> dict[str, Any]:
    state = validate_g30_state(state)
    projected = project_g30_to_witness_state(state)
    after_tau = tau_g30(state, r)
    after_tau_inv = tau_inv_g30(state, r)
    after_mu = mu_g30(state)
    after_g15 = walk_g15_once_g30(state, r)
    after_g30 = walk_g30_once_g30(state, r)

    return {
        "state": {
            "frame": state["frame"],
            "phase": state["phase"],
            "sheet": state["sheet"],
        },
        "projected_witness_state": list(projected),
        "tau": after_tau,
        "tau_inv": after_tau_inv,
        "mu": after_mu,
        "after_g15": after_g15,
        "after_g30": after_g30,
    }


def g30_trace(state: G30State, ops: list[str], r: int = 1) -> list[dict[str, Any]]:
    cur = validate_g30_state(state)
    out: list[dict[str, Any]] = [
        {
            "step": 0,
            "op": "start",
            "state": dict(cur),
            "projected_witness_state": list(project_g30_to_witness_state(cur)),
        }
    ]

    for i, op in enumerate(ops, start=1):
        if op == "tau":
            cur = tau_g30(cur, r)
        elif op == "tau_inv":
            cur = tau_inv_g30(cur, r)
        elif op == "mu":
            cur = mu_g30(cur)
        elif op == "g15":
            cur = walk_g15_once_g30(cur, r)
        elif op == "g30":
            cur = walk_g30_once_g30(cur, r)
        else:
            raise ValueError(f"unknown g30 op: {op}")

        out.append(
            {
                "step": i,
                "op": op,
                "state": dict(cur),
                "projected_witness_state": list(project_g30_to_witness_state(cur)),
            }
        )

    return out


def g30_translator_contract() -> dict[str, Any]:
    return {
        "metadata": g30_translator_metadata(),
        "state_model": g30_translator_state_model(),
        "operators": g30_translator_operators(),
        "projection_contract": g30_projection_contract(),
    }


def g30_example_states() -> dict[str, Any]:
    base_subj = make_g30_state(0, 0, "+")
    base_obj = make_g30_state(0, 1, "+")
    after_one_g15 = walk_g15_once_g30(base_subj)
    after_two_g15 = walk_g15_once_g30(after_one_g15)

    return {
        "examples": [
            {
                "label": "base_subjective_plus",
                "state": base_subj,
                "projects_to_g15": list(project_g30_to_witness_state(base_subj)),
            },
            {
                "label": "base_objective_plus",
                "state": base_obj,
                "projects_to_g15": list(project_g30_to_witness_state(base_obj)),
            },
            {
                "label": "after_one_g15_walk_subjective",
                "state": after_one_g15,
                "projects_to_g15": list(project_g30_to_witness_state(after_one_g15)),
                "note": "Same G15-visible state, opposite sheet.",
            },
            {
                "label": "after_two_g15_walks_subjective",
                "state": after_two_g15,
                "projects_to_g15": list(project_g30_to_witness_state(after_two_g15)),
                "note": "Identity restored at G30.",
            },
        ]
    }


def g30_translator_validation_report() -> dict[str, Any]:
    meta = g30_translator_metadata()
    model = g30_translator_state_model()
    ops = g30_translator_operators()
    proj = g30_projection_contract()

    base = make_g30_state(0, 0, "+")
    after_g15 = walk_g15_once_g30(base)
    after_g30 = walk_g30_once_g30(base)

    ok = (
        model["base_coordinates"]["frame_modulus"] == 15
        and model["base_coordinates"]["phase_modulus"] == 2
        and model["base_coordinates"]["sheet_modulus"] == 2
        and len(ops["operators"]) == 4
        and len(proj["maps"]) == 3
        and ops["cycle_rules"]["short_form"]["g15"] == "n_15 = -n_0"
        and ops["cycle_rules"]["short_form"]["g30"] == "n_30 = n_0"
        and project_g30_to_witness_state(after_g15) == (0, 0)
        and after_g15["sheet"] == "-"
        and after_g30 == base
    )

    return {
        "ok": ok,
        "name": meta["name"],
        "status": meta["status"],
        "frame_modulus": model["base_coordinates"]["frame_modulus"],
        "phase_modulus": model["base_coordinates"]["phase_modulus"],
        "sheet_modulus": model["base_coordinates"]["sheet_modulus"],
        "operator_count": len(ops["operators"]),
        "projection_map_count": len(proj["maps"]),
        "g15_rule": ops["cycle_rules"]["short_form"]["g15"],
        "g30_rule": ops["cycle_rules"]["short_form"]["g30"],
        "base_state": base,
        "after_g15": after_g15,
        "after_g30": after_g30,
    }
