#!/usr/bin/env python3
from __future__ import annotations

import json

REGISTER = ["W", "X", "Y", "Z", "T", "I"]
REGISTER_INDEX = {s: i for i, s in enumerate(REGISTER)}


def build_petersen_edges():
    two_sets = []
    for a in range(5):
        for b in range(a + 1, 5):
            two_sets.append((a, b))
    return two_sets


def build_g15_edges():
    petersen_edges = build_petersen_edges()
    out = []
    for i, (a1, a2) in enumerate(petersen_edges):
        for j in range(i + 1, len(petersen_edges)):
            b1, b2 = petersen_edges[j]
            if len({a1, a2, b1, b2}) < 4:
                out.append((i, j))
    return out


G15_EDGES = build_g15_edges()
G15_EDGE_SET = {tuple(sorted(e)) for e in G15_EDGES}


def slot_at(index: int) -> str:
    return REGISTER[index % len(REGISTER)]


def frontier_slot_pair(tick: int) -> tuple[str, str]:
    return slot_at(tick - 1), slot_at(tick)


def edges_from_path(path: list[int]) -> set[tuple[int, int]]:
    out: set[tuple[int, int]] = set()
    for a, b in zip(path, path[1:]):
        e = tuple(sorted((a, b)))
        if e in G15_EDGE_SET:
            out.add(e)
    return out


def path_for_tick_lifted(tick: int, orient: int) -> dict[str, list[int]]:
    """
    Minimal lifted model:
    - slot progression comes from the 6-register grammar
    - orient in {0,1} selects between base face and inverse face
    - second walk should restore orient, so we flip orient each tick
    """
    slot, next_slot = frontier_slot_pair(tick)
    s = REGISTER_INDEX[slot]
    n = REGISTER_INDEX[next_slot]

    if orient == 0:
        upstairs = [
            (2 + s) % 15,
            (12 + s) % 15,
            (2 + n) % 15,
            (6 + n) % 15,
        ]
        stairs = [
            (5 + s) % 15,
            (9 + s) % 15,
            14,
            (10 + n) % 15,
            (3 + n) % 15,
        ]
        downstairs = [
            13,
            (8 + s) % 15,
            14,
            (7 + n) % 15,
            (1 + n) % 15,
            0,
        ]
    else:
        # inverse-face / orientation-correcting companion
        upstairs = [
            (3 + s) % 15,
            (11 + s) % 15,
            (3 + n) % 15,
            (7 + n) % 15,
        ]
        stairs = [
            (4 + s) % 15,
            (8 + s) % 15,
            0,
            (9 + n) % 15,
            (2 + n) % 15,
        ]
        downstairs = [
            12,
            (10 + s) % 15,
            0,
            (6 + n) % 15,
            (2 + n) % 15,
            14,
        ]

    return {
        "upstairs": upstairs,
        "stairs": stairs,
        "downstairs": downstairs,
    }


def lifted_coverage_after_steps(num_steps: int) -> dict:
    covered: set[tuple[int, int]] = set()
    per_step = []
    orient = 0

    for step in range(1, num_steps + 1):
        tick = ((step - 1) % 6) + 1
        paths = path_for_tick_lifted(tick, orient)

        step_edges: set[tuple[int, int]] = set()
        region_edges = {}

        for region, path in paths.items():
            region_set = edges_from_path(path)
            region_edges[region] = sorted(region_set)
            step_edges |= region_set

        covered |= step_edges

        per_step.append(
            {
                "step": step,
                "tick": tick,
                "slot_pair": frontier_slot_pair(tick),
                "orient_in": orient,
                "step_edge_count": len(step_edges),
                "cumulative_edge_count": len(covered),
                "region_edges": region_edges,
            }
        )

        orient = 1 - orient

    missing = sorted(G15_EDGE_SET - covered)
    return {
        "num_steps": num_steps,
        "total_g15_edges": len(G15_EDGE_SET),
        "covered_edge_count": len(covered),
        "missing_edge_count": len(missing),
        "coverage_fraction": len(covered) / len(G15_EDGE_SET),
        "covered_edges": sorted(covered),
        "missing_edges": missing,
        "per_step": per_step,
    }


def main():
    table = []
    for steps in range(1, 25):
        data = lifted_coverage_after_steps(steps)
        table.append(
            {
                "steps": steps,
                "covered": data["covered_edge_count"],
                "missing": data["missing_edge_count"],
                "coverage_fraction": data["coverage_fraction"],
            }
        )

    out = {
        "g15_edge_count": len(G15_EDGE_SET),
        "coverage_table": table,
        "detail_at_24_steps": lifted_coverage_after_steps(24),
    }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
