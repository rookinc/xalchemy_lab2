from __future__ import annotations

from typing import Any


def g60_host_metadata() -> dict[str, Any]:
    return {
        "name": "AT4val[60,6]",
        "house_of_graphs_id": "Graph52002",
        "graphsym_id": "AT4val[60,6]",
        "status": "canonical_host",
        "description": "Canonical 60-vertex vessel host: AT4val[60,6] / Graph52002.",
    }


def g60_expected_invariants() -> dict[str, Any]:
    return {
        "vertex_count": 60,
        "edge_count": 120,
        "regular_degree": 4,
        "automorphism_group_order": 480,
        "diameter": 6,
        "distance_shells_from_anchor": [1, 4, 8, 16, 24, 6, 1],
    }


def g60_quotient_interfaces() -> dict[str, Any]:
    return {
        "intended_stack": [
            "G60_host",
            "G30_intermediate",
            "G15_core_lens",
        ],
        "required_maps": [
            {
                "name": "g60_to_g30",
                "status": "stub",
                "description": "Map host-level objects to intermediate quotient fibers.",
            },
            {
                "name": "g30_to_g15",
                "status": "stub",
                "description": "Map intermediate fibers to the G15 core lens.",
            },
            {
                "name": "g60_sector_to_g15_row",
                "status": "stub",
                "description": "Push an upstairs sector/support object down to a G15 row of M.",
            },
        ],
        "required_outputs": [
            "sector_matrix_M",
            "quadratic_lens_Q = M M^T",
            "comparison_target_Q_poly = A^3 + 2A^2 + 2I",
        ],
    }


def g60_host_contract() -> dict[str, Any]:
    return {
        "metadata": g60_host_metadata(),
        "expected_invariants": g60_expected_invariants(),
        "quotient_interfaces": g60_quotient_interfaces(),
    }


def g60_host_validation_report() -> dict[str, Any]:
    meta = g60_host_metadata()
    inv = g60_expected_invariants()
    iface = g60_quotient_interfaces()

    ok = (
        inv["vertex_count"] == 60
        and inv["edge_count"] == 120
        and inv["regular_degree"] == 4
        and inv["diameter"] == 6
        and inv["automorphism_group_order"] == 480
        and inv["distance_shells_from_anchor"] == [1, 4, 8, 16, 24, 6, 1]
        and len(iface["required_maps"]) == 3
    )

    return {
        "ok": ok,
        "name": meta["name"],
        "house_of_graphs_id": meta["house_of_graphs_id"],
        "graphsym_id": meta["graphsym_id"],
        "vertex_count": inv["vertex_count"],
        "edge_count": inv["edge_count"],
        "regular_degree": inv["regular_degree"],
        "automorphism_group_order": inv["automorphism_group_order"],
        "diameter": inv["diameter"],
        "distance_shells_from_anchor": inv["distance_shells_from_anchor"],
        "required_map_count": len(iface["required_maps"]),
        "status": meta["status"],
    }
