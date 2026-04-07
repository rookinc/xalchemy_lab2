from __future__ import annotations

from math import ceil, gcd, log2
from typing import Any, List, Tuple

State = Tuple[int, int]  # (frame, phase), phase 0=subjective, 1=objective


def mod_n(i: int, n: int) -> int:
    return i % n


def lcm(a: int, b: int) -> int:
    return abs(a * b) // gcd(a, b)


def frame_count(r: int = 1) -> int:
    if r < 1:
        raise ValueError("r must be >= 1")
    return 5 * r


def state_count(r: int = 1) -> int:
    return 2 * frame_count(r)


def frame_bits(r: int = 1) -> int:
    n = frame_count(r)
    return max(1, ceil(log2(n)))


def bit_count(r: int = 1) -> int:
    return frame_bits(r) + 1


def make_state(frame: int, phase: int) -> State:
    return (frame, phase)


def validate_state(state: State, r: int = 1) -> State:
    frame, phase = state
    n = frame_count(r)
    if not isinstance(frame, int) or not isinstance(phase, int):
        raise TypeError("state entries must be ints")
    if not (0 <= frame < n):
        raise ValueError(f"frame must satisfy 0 <= frame < {n}")
    if phase not in (0, 1):
        raise ValueError("phase must be 0 or 1")
    return state


def _o(i: int) -> str:
    return f"o{i}"


def _s(i: int) -> str:
    return f"s{i}"


def _t(i: int) -> str:
    return f"t{i}"


def subjective_cycle(i: int, r: int = 1) -> List[str]:
    n = frame_count(r)
    i = mod_n(i, n)
    return [
        _o(i),
        _o(mod_n(i + 1, n)),
        _o(mod_n(i + 2, n)),
        _s(mod_n(i + 2, n)),
        _t(i),
        _s(i),
    ]


def objective_cycle(i: int, r: int = 1) -> List[str]:
    n = frame_count(r)
    i = mod_n(i, n)
    return [
        _o(i),
        _o(mod_n(i + 1, n)),
        _o(mod_n(i + 2, n)),
        _s(mod_n(i + 3, n)),
        _t(mod_n(i + 3, n)),
        _s(i),
    ]


def witness_cycle(state: State, r: int = 1) -> List[str]:
    frame, phase = validate_state(state, r)
    return subjective_cycle(frame, r) if phase == 0 else objective_cycle(frame, r)


def action_cell(i: int, r: int = 1) -> List[str]:
    n = frame_count(r)
    i = mod_n(i, n)
    return [
        _o(mod_n(i + 2, n)),
        _s(mod_n(i + 2, n)),
        _t(i),
        _s(i),
        _t(mod_n(i + 3, n)),
        _s(mod_n(i + 3, n)),
    ]


def species_of_state(state: State) -> str:
    return "O-O-O-S-T-S"


def species_of_action(i: int, r: int = 1) -> str:
    return "O-S-T-S-T-S"


def phase_label(state: State, r: int = 1) -> str:
    _, phase = validate_state(state, r)
    return "subjective" if phase == 0 else "objective"


def alignment(state: State, r: int = 1) -> str:
    _, phase = validate_state(state, r)
    return "return" if phase == 0 else "forward"


def spread(state: State, r: int = 1) -> int:
    _, phase = validate_state(state, r)
    return 4 if phase == 0 else 5


def fiber_size(state: State, r: int = 1) -> int:
    _, phase = validate_state(state, r)
    return 26 if phase == 0 else 18


def tau(state: State, r: int = 1) -> State:
    frame, phase = validate_state(state, r)
    n = frame_count(r)
    return (mod_n(frame + 1, n), phase)


def tau_inv(state: State, r: int = 1) -> State:
    frame, phase = validate_state(state, r)
    n = frame_count(r)
    return (mod_n(frame - 1, n), phase)


def mu(state: State, r: int = 1) -> State:
    frame, phase = validate_state(state, r)
    return (frame, 1 - phase)


def output_signature(state: State, r: int = 1) -> tuple[str, int, int]:
    return (alignment(state, r), spread(state, r), fiber_size(state, r))


def list_states(r: int = 1) -> List[State]:
    n = frame_count(r)
    return [(i, phase) for i in range(n) for phase in (0, 1)]


def list_actions(r: int = 1) -> List[dict[str, Any]]:
    n = frame_count(r)
    out = []
    for i in range(n):
        out.append(
            {
                "frame": i,
                "action_cycle": action_cell(i, r),
                "species": species_of_action(i, r),
            }
        )
    return out


def state_code(state: State, r: int = 1) -> str:
    frame, phase = validate_state(state, r)
    fb = frame_bits(r)
    return f"{frame:0{fb}b}{phase:b}"


def valid_codes(r: int = 1) -> list[str]:
    return [state_code(st, r) for st in list_states(r)]


def normalize_cycle(cycle: list[str]) -> list[str]:
    n = len(cycle)
    rots = [cycle[i:] + cycle[:i] for i in range(n)]
    rev = list(reversed(cycle))
    rots += [rev[i:] + rev[:i] for i in range(n)]
    return min(rots)


def cycle_key(cycle: list[str]) -> tuple[str, ...]:
    return tuple(normalize_cycle(cycle))


def cycle_distance(a: list[str], b: list[str]) -> int:
    aa = normalize_cycle(a)
    bb = normalize_cycle(b)
    if len(aa) != len(bb):
        raise ValueError("cycle_distance requires equal-length cycles")
    return sum(1 for x, y in zip(aa, bb) if x != y)


def classify_cycle(cycle: list[str], r: int = 1) -> dict[str, Any]:
    key = cycle_key(cycle)
    n = frame_count(r)

    subjective_matches = []
    objective_matches = []
    action_matches = []

    subjective_nearest = []
    objective_nearest = []
    action_nearest = []

    best_s = None
    best_o = None
    best_a = None

    for i in range(n):
        s = subjective_cycle(i, r)
        ds = cycle_distance(cycle, s)
        s_record = {
            "frame": i,
            "phase": 0,
            "phase_label": "subjective",
            "cycle": s,
            "alignment": "return",
            "spread": 4,
            "fiber": 26,
            "distance": ds,
        }
        if cycle_key(s) == key:
            subjective_matches.append({k: v for k, v in s_record.items() if k != "distance"})
        if best_s is None or ds < best_s:
            best_s = ds
            subjective_nearest = [s_record]
        elif ds == best_s:
            subjective_nearest.append(s_record)

        o = objective_cycle(i, r)
        do = cycle_distance(cycle, o)
        o_record = {
            "frame": i,
            "phase": 1,
            "phase_label": "objective",
            "cycle": o,
            "alignment": "forward",
            "spread": 5,
            "fiber": 18,
            "distance": do,
        }
        if cycle_key(o) == key:
            objective_matches.append({k: v for k, v in o_record.items() if k != "distance"})
        if best_o is None or do < best_o:
            best_o = do
            objective_nearest = [o_record]
        elif do == best_o:
            objective_nearest.append(o_record)

        a = action_cell(i, r)
        da = cycle_distance(cycle, a)
        a_record = {
            "frame": i,
            "cycle": a,
            "species": "O-S-T-S-T-S",
            "distance": da,
        }
        if cycle_key(a) == key:
            action_matches.append({k: v for k, v in a_record.items() if k != "distance"})
        if best_a is None or da < best_a:
            best_a = da
            action_nearest = [a_record]
        elif da == best_a:
            action_nearest.append(a_record)

    s_exact = len(subjective_matches) > 0
    o_exact = len(objective_matches) > 0
    a_exact = len(action_matches) > 0

    if s_exact and not o_exact:
        classification = "subjective-state"
        confidence = "exact"
    elif o_exact and not s_exact:
        classification = "objective-state"
        confidence = "exact"
    elif a_exact and not s_exact and not o_exact:
        classification = "action-cell"
        confidence = "exact"
    elif s_exact and o_exact:
        classification = "mixed"
        confidence = "exact"
    else:
        scores = {
            "subjective-state": best_s,
            "objective-state": best_o,
            "action-cell": best_a,
        }
        best = min(v for v in scores.values() if v is not None)
        winners = [k for k, v in scores.items() if v == best]
        if len(winners) == 1:
            classification = winners[0]
            confidence = "nearest"
        else:
            classification = "unresolved"
            confidence = "ambiguous"

    return {
        "input_cycle": cycle,
        "normalized_cycle": list(key),
        "classification": classification,
        "confidence": confidence,
        "distance_summary": {
            "best_subjective_distance": best_s,
            "best_objective_distance": best_o,
            "best_action_distance": best_a,
        },
        "subjective_matches": subjective_matches,
        "objective_matches": objective_matches,
        "action_matches": action_matches,
        "nearest": {
            "subjective": subjective_nearest,
            "objective": objective_nearest,
            "action": action_nearest,
        },
    }


def batch_classify_cycles(items: list[dict[str, Any]] | list[list[str]], r: int = 1) -> dict[str, Any]:
    results = []
    counts = {
        "subjective-state": 0,
        "objective-state": 0,
        "action-cell": 0,
        "mixed": 0,
        "unresolved": 0,
    }

    for idx, item in enumerate(items):
        if isinstance(item, dict):
            label = item.get("label", f"item_{idx}")
            cycle = item.get("cycle")
            meta = {k: v for k, v in item.items() if k not in {"cycle"}}
        else:
            label = f"item_{idx}"
            cycle = item
            meta = {"label": label}

        if not cycle:
            result = {
                "label": label,
                "error": "missing cycle",
            }
        else:
            c = classify_cycle(cycle, r)
            result = {
                "label": label,
                "classification": c["classification"],
                "confidence": c["confidence"],
                "distance_summary": c["distance_summary"],
                "normalized_cycle": c["normalized_cycle"],
                "meta": meta,
            }
            counts[c["classification"]] = counts.get(c["classification"], 0) + 1

        results.append(result)

    return {
        "scale": r,
        "count": len(results),
        "classification_counts": counts,
        "results": results,
    }


def word_delta(word: list[str], r: int = 1) -> tuple[int, int]:
    n = frame_count(r)
    di = 0
    dp = 0
    for op in word:
        if op == "tau":
            di += 1
        elif op == "tau_inv":
            di -= 1
        elif op == "mu":
            dp += 1
        else:
            raise ValueError(f"unknown op: {op}")
    return (mod_n(di, n), dp % 2)


def apply_word(state: State, word: list[str], r: int = 1) -> State:
    state = validate_state(state, r)
    for op in word:
        if op == "tau":
            state = tau(state, r)
        elif op == "tau_inv":
            state = tau_inv(state, r)
        elif op == "mu":
            state = mu(state, r)
        else:
            raise ValueError(f"unknown op: {op}")
    return state


def frame_component_order(di: int, r: int = 1) -> int:
    n = frame_count(r)
    if di == 0:
        return 1
    return n // gcd(n, di)


def phase_component_order(dp: int) -> int:
    return 1 if dp == 0 else 2


def word_orbit_length(word: list[str], r: int = 1) -> int:
    di, dp = word_delta(word, r)
    ord_frame = frame_component_order(di, r)
    ord_phase = phase_component_order(dp)
    return lcm(ord_frame, ord_phase)


def normalize_word(word: list[str], r: int = 1) -> dict[str, Any]:
    di, dp = word_delta(word, r)
    n = frame_count(r)
    ord_frame = frame_component_order(di, r)
    ord_phase = phase_component_order(dp)
    orbit = lcm(ord_frame, ord_phase)
    return {
        "word": word,
        "frame_delta": di,
        "phase_delta": dp,
        "frame_modulus": n,
        "phase_modulus": 2,
        "frame_component_order": ord_frame,
        "phase_component_order": ord_phase,
        "orbit_formula": f"lcm({ord_frame}, {ord_phase}) = {orbit}",
        "orbit_length": orbit,
        "affine_form": f"(i,e) -> (i+{di} mod {n}, e+{dp} mod 2)",
    }


def state_dict(state: State, r: int = 1) -> dict[str, Any]:
    state = validate_state(state, r)
    frame, phase = state
    return {
        "state": [frame, phase],
        "code": state_code(state, r),
        "frame": frame,
        "phase": phase,
        "phase_label": phase_label(state, r),
        "witness_cycle": witness_cycle(state, r),
        "species": species_of_state(state),
        "alignment": alignment(state, r),
        "spread": spread(state, r),
        "fiber": fiber_size(state, r),
        "action_cell": action_cell(frame, r),
        "action_species": species_of_action(frame, r),
        "tau": list(tau(state, r)),
        "tau_inv": list(tau_inv(state, r)),
        "mu": list(mu(state, r)),
        "output": {
            "alignment": alignment(state, r),
            "spread": spread(state, r),
            "fiber": fiber_size(state, r),
        },
    }


def action_dict(frame: int, r: int = 1) -> dict[str, Any]:
    n = frame_count(r)
    frame = mod_n(frame, n)
    return {
        "frame": frame,
        "action_cycle": action_cell(frame, r),
        "species": species_of_action(frame, r),
        "subjective_state": [frame, 0],
        "objective_state": [frame, 1],
    }


def export_machine(r: int = 1) -> dict[str, Any]:
    states = list_states(r)
    return {
        "scale": r,
        "frame_count": frame_count(r),
        "state_count": len(states),
        "frame_bits": frame_bits(r),
        "bit_count": bit_count(r),
        "valid_codes": valid_codes(r),
        "state_species": "O-O-O-S-T-S",
        "action_species": "O-S-T-S-T-S",
        "states": [state_dict(st, r) for st in states],
        "actions": [action_dict(i, r) for i in range(frame_count(r))],
        "transitions": {
            "tau": [
                {"from": list(st), "to": list(tau(st, r))}
                for st in states
            ],
            "mu": [
                {"from": list(st), "to": list(mu(st, r))}
                for st in states
            ],
        },
    }


def normalized_diff(a: list[str], b: list[str]) -> list[dict[str, Any]]:
    aa = normalize_cycle(a)
    bb = normalize_cycle(b)
    if len(aa) != len(bb):
        raise ValueError("normalized_diff requires equal-length cycles")
    out = []
    for i, (x, y) in enumerate(zip(aa, bb)):
        if x != y:
            out.append(
                {
                    "position": i,
                    "from": x,
                    "to": y,
                }
            )
    return out


def nearest_action_frames(classification_result: dict[str, Any]) -> list[int]:
    frames = sorted(
        {
            rec["frame"]
            for rec in classification_result.get("nearest", {}).get("action", [])
        }
    )
    return frames


def is_exact_action_frame(classification_result: dict[str, Any], frame: int) -> bool:
    return any(
        rec.get("frame") == frame
        for rec in classification_result.get("action_matches", [])
    )


def is_nearest_action_frame(classification_result: dict[str, Any], frame: int) -> bool:
    return any(
        rec.get("frame") == frame
        for rec in classification_result.get("nearest", {}).get("action", [])
    )


def target_cycle_for_spec(spec: str, r: int = 1) -> list[str]:
    kind, value = spec.split(":", 1)
    frame = int(value)
    if kind == "action":
        return action_cell(frame, r)
    if kind == "subjective":
        return subjective_cycle(frame, r)
    if kind == "objective":
        return objective_cycle(frame, r)
    raise ValueError("target spec must be one of action:<i>, subjective:<i>, objective:<i>")


def frame2_exact_prototype(r: int = 1) -> list[str]:
    return normalize_cycle(action_cell(2, r))


def frame2_socket_cycle(t_value: str, r: int = 1) -> list[str]:
    if r != 1:
        raise ValueError("frame2_socket_cycle is currently defined only for r=1")
    n = frame_count(r)
    vocab = {f"o{i}" for i in range(n)} | {f"s{i}" for i in range(n)} | {f"t{i}" for i in range(n)}
    vocab.add("t2")
    if t_value not in vocab:
        raise ValueError(f"invalid T payload: {t_value}")
    return ["o4", "s0", "t0", "s2", t_value, "s4"]


def socket_payload(cycle: list[str]) -> str:
    norm = normalize_cycle(cycle)
    if len(norm) < 5:
        raise ValueError("socket_payload requires a cycle of length at least 5")
    return norm[4]


def witness_assembly(cycle: list[str], r: int = 1) -> dict[str, Any]:
    norm = normalize_cycle(cycle)
    if len(norm) != 6:
        raise ValueError("witness_assembly currently expects a normalized 6-cycle")
    W, X, Y, Z, T, I = norm
    return {
        "normalized_cycle": norm,
        "assembly": {
            "W": W,
            "X": X,
            "Y": Y,
            "Z": Z,
            "T": T,
            "I": I,
        },
        "scaffold_register": {
            "W": W,
            "X": X,
            "Y": Y,
            "Z": Z,
            "I": I,
        },
        "socket": "T",
        "payload": T,
        "exact_frame2_payload": "t2",
        "is_exact_payload": T == "t2",
        "closed_witness_word": norm + [norm[0]],
        "rigid_edges": ["WX", "XY", "YZ", "IW"],
        "variable_edges": ["ZT", "TI"],
        "diads": ["WX", "YZ", "TI"],
        "couplers": ["XY", "ZT", "IW"],
    }


def subjective_family_row(i: int, r: int = 1) -> dict[str, Any]:
    cyc = subjective_cycle(i, r)
    return {
        "i": i,
        "phase": "subjective",
        "cycle": cyc,
        "normalized_cycle": normalize_cycle(cyc),
        "alignment": alignment((i, 0), r),
        "spread": spread((i, 0), r),
        "fiber": fiber_size((i, 0), r),
        "assembly": witness_assembly(cyc, r),
    }


def objective_family_row(i: int, r: int = 1) -> dict[str, Any]:
    cyc = objective_cycle(i, r)
    return {
        "i": i,
        "phase": "objective",
        "cycle": cyc,
        "normalized_cycle": normalize_cycle(cyc),
        "alignment": alignment((i, 1), r),
        "spread": spread((i, 1), r),
        "fiber": fiber_size((i, 1), r),
        "assembly": witness_assembly(cyc, r),
    }


def subjective_objective_family(r: int = 1) -> dict[str, Any]:
    rows = []
    n = frame_count(r)
    for i in range(n):
        rows.append({
            "i": i,
            "subjective": subjective_family_row(i, r),
            "objective": objective_family_row(i, r),
        })
    return {
        "scale": r,
        "frame_count": n,
        "rows": rows,
        "summary": {
            "subjective_alignment": "return",
            "subjective_spread": 4,
            "subjective_fiber": 26,
            "objective_alignment": "forward",
            "objective_spread": 5,
            "objective_fiber": 18,
        },
    }


def so_orbit_summary(i: int, r: int = 1) -> dict[str, Any]:
    n = frame_count(r)
    i = mod_n(i, n)

    subj0 = (i, 0)
    obj0 = (i, 1)

    subj_g15 = apply_word(subj0, ["tau"] * n, r)
    obj_g15 = apply_word(obj0, ["tau"] * n, r)

    subj_g30 = apply_word(subj0, ["tau"] * (2 * n), r)
    obj_g30 = apply_word(obj0, ["tau"] * (2 * n), r)

    def sheet_after_g15(sheet: str) -> str:
        return "-" if sheet == "+" else "+"

    def sheet_after_g30(sheet: str) -> str:
        return sheet

    start_sheet = "+"

    return {
        "i": i,
        "scale": r,
        "g15_length": n,
        "g30_length": 2 * n,
        "subjective_start": {
            "state": list(subj0),
            "phase": phase_label(subj0, r),
            "cycle": subjective_cycle(i, r),
            "alignment": alignment(subj0, r),
            "spread": spread(subj0, r),
            "fiber": fiber_size(subj0, r),
            "sheet": start_sheet,
            "sheet_state": [subj0[0], subj0[1], start_sheet],
        },
        "objective_start": {
            "state": list(obj0),
            "phase": phase_label(obj0, r),
            "cycle": objective_cycle(i, r),
            "alignment": alignment(obj0, r),
            "spread": spread(obj0, r),
            "fiber": fiber_size(obj0, r),
            "sheet": start_sheet,
            "sheet_state": [obj0[0], obj0[1], start_sheet],
        },
        "after_g15": {
            "subjective_state": list(subj_g15),
            "objective_state": list(obj_g15),
            "subjective_phase": phase_label(subj_g15, r),
            "objective_phase": phase_label(obj_g15, r),
            "subjective_sheet": sheet_after_g15(start_sheet),
            "objective_sheet": sheet_after_g15(start_sheet),
            "subjective_sheet_state": [subj_g15[0], subj_g15[1], sheet_after_g15(start_sheet)],
            "objective_sheet_state": [obj_g15[0], obj_g15[1], sheet_after_g15(start_sheet)],
            "sign_closing_rule": "n_15 = -n_0",
        },
        "after_g30": {
            "subjective_state": list(subj_g30),
            "objective_state": list(obj_g30),
            "subjective_phase": phase_label(subj_g30, r),
            "objective_phase": phase_label(obj_g30, r),
            "subjective_sheet": sheet_after_g30(start_sheet),
            "objective_sheet": sheet_after_g30(start_sheet),
            "subjective_sheet_state": [subj_g30[0], subj_g30[1], sheet_after_g30(start_sheet)],
            "objective_sheet_state": [obj_g30[0], obj_g30[1], sheet_after_g30(start_sheet)],
            "identity_restoring_rule": "n_30 = n_0",
        },
    }


def state_assembly(state: State, r: int = 1) -> dict[str, Any]:
    state = validate_state(state, r)
    cyc = witness_cycle(state, r)
    asm = witness_assembly(cyc, r)
    frame, phase = state

    return {
        "state": [frame, phase],
        "code": state_code(state, r),
        "frame": frame,
        "phase": phase,
        "phase_label": phase_label(state, r),
        "alignment": alignment(state, r),
        "spread": spread(state, r),
        "fiber": fiber_size(state, r),
        "witness_cycle": cyc,
        "action_cell": action_cell(frame, r),
        "assembly": asm["assembly"],
        "scaffold_register": asm["scaffold_register"],
        "socket": asm["socket"],
        "payload": asm["payload"],
        "exact_frame2_payload": asm["exact_frame2_payload"],
        "is_exact_payload": asm["is_exact_payload"],
        "closed_witness_word": asm["closed_witness_word"],
        "rigid_edges": asm["rigid_edges"],
        "variable_edges": asm["variable_edges"],
        "diads": asm["diads"],
        "couplers": asm["couplers"],
        "output": {
            "alignment": alignment(state, r),
            "spread": spread(state, r),
            "fiber": fiber_size(state, r),
        },
        "tau": list(tau(state, r)),
        "tau_inv": list(tau_inv(state, r)),
        "mu": list(mu(state, r)),
    }
