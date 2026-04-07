from __future__ import annotations

from itertools import combinations
from typing import Any

from .frontier_bridge import frontier_tick_to_g60_focus
from .g60_host import g60_host_metadata, g60_expected_invariants
from .g60_scaffold import scaffold_adjacency
from .g60_cells import realized_faces, realized_tetra, g60_cells_payload


def _edge_key(a: str, b: str) -> str:
    return "|".join(sorted((a, b)))


def _tri_key(a: str, b: str, c: str) -> str:
    return "|".join(sorted((a, b, c)))


def _tet_key(a: str, b: str, c: str, d: str) -> str:
    return "|".join(sorted((a, b, c, d)))


def _normalize_active_edge(edge_id: str) -> tuple[str, str] | None:
    # examples:
    #   sheet:middle:7-10
    #   transport:cross_sheet:3-10
    m = edge_id.rsplit(":", 1)
    if len(m) != 2:
        return None
    tail = m[1]
    if "-" not in tail:
        return None
    a, b = tail.split("-", 1)
    return tuple(sorted((a, b)))


def frontier_tick_delta(tick: int) -> dict[str, Any]:
    bridge = frontier_tick_to_g60_focus(tick)
    focus = bridge["g60_focus"]["scaffold_focus"]

    primary = focus.get("primary_node")
    active_nodes = list(focus.get("active_nodes", []))
    neighbor_nodes = list(focus.get("neighbor_nodes", []))
    active_edges_raw = list(focus.get("active_edges", []))

    delta_nodes: set[str] = set()
    if primary:
        delta_nodes.add(primary)
    delta_nodes.update(active_nodes)
    delta_nodes.update(neighbor_nodes)

    delta_edges: set[str] = set()
    for edge_id in active_edges_raw:
        pair = _normalize_active_edge(edge_id)
        if pair is None:
            continue
        delta_edges.add(_edge_key(*pair))
        delta_nodes.update(pair)

    return {
        "tick": tick,
        "frontier": bridge["frontier"],
        "bridge_summary": bridge["bridge_summary"],
        "g30_state": bridge["g30_state"],
        "projected_witness_state": bridge["projected_witness_state"],
        "g15_vertex": bridge["g15_focus"]["g15_focus"]["vertex"],
        "g60_class": bridge["g60_focus"]["g30_focus"]["class_id"],
        "primary_node": primary,
        "active_nodes": sorted(set(active_nodes)),
        "neighbor_nodes": sorted(set(neighbor_nodes)),
        "active_edges_raw": active_edges_raw,
        "delta_nodes": sorted(delta_nodes),
        "delta_edges": sorted(delta_edges),
    }




def accumulate_g60_occupancy(max_tick: int) -> dict[str, Any]:
    if not isinstance(max_tick, int) or max_tick < 1:
        raise ValueError("max_tick must be an integer >= 1")

    deltas = [frontier_tick_delta(t) for t in range(1, max_tick + 1)]

    occupied_nodes: set[str] = set()
    occupied_edges: set[str] = set()

    frontier_nodes: set[str] = set()
    frontier_edges: set[str] = set()

    for d in deltas:
        occupied_nodes.update(d["delta_nodes"])
        occupied_edges.update(d["delta_edges"])

    frontier_nodes.update(deltas[-1]["delta_nodes"])
    frontier_edges.update(deltas[-1]["delta_edges"])

    occupied_faces = set(realized_faces(occupied_edges))
    frontier_faces = set(realized_faces(frontier_edges))

    occupied_tetra = set(realized_tetra(occupied_faces))
    frontier_tetra = set(realized_tetra(frontier_faces))

    adjacency = scaffold_adjacency()
    occupied_degrees = {
        node: len([nbr for nbr in adjacency.get(node, []) if nbr in occupied_nodes])
        for node in sorted(occupied_nodes)
    }

    host_meta = g60_host_metadata()
    host_inv = g60_expected_invariants()

    return {
        "host": {
            "name": host_meta["name"],
            "house_of_graphs_id": host_meta["house_of_graphs_id"],
            "graphsym_id": host_meta["graphsym_id"],
            "status": host_meta["status"],
            "role": "canonical vessel host",
            "vertex_count": host_inv["vertex_count"],
            "edge_count": host_inv["edge_count"],
            "regular_degree": host_inv["regular_degree"],
            "automorphism_group_order": host_inv["automorphism_group_order"],
            "diameter": host_inv["diameter"],
            "distance_shells_from_anchor": host_inv["distance_shells_from_anchor"],
        },
        "lawful_cells": g60_cells_payload(),
        "tick": max_tick,
        "ticks_applied": list(range(1, max_tick + 1)),
        "latest_delta": deltas[-1],
        "occupied": {
            "nodes": sorted(occupied_nodes),
            "edges": sorted(occupied_edges),
            "faces": sorted(occupied_faces),
            "tetra": sorted(occupied_tetra),
        },
        "frontier": {
            "nodes": sorted(frontier_nodes),
            "edges": sorted(frontier_edges),
            "faces": sorted(frontier_faces),
            "tetra": sorted(frontier_tetra),
        },
        "counts": {
            "occupied_nodes": len(occupied_nodes),
            "occupied_edges": len(occupied_edges),
            "occupied_faces": len(occupied_faces),
            "occupied_tetra": len(occupied_tetra),
            "frontier_nodes": len(frontier_nodes),
            "frontier_edges": len(frontier_edges),
            "frontier_faces": len(frontier_faces),
            "frontier_tetra": len(frontier_tetra),
        },
        "occupied_degrees": occupied_degrees,
        "deltas": deltas,
    }


def g60_occupancy_summary(max_tick: int) -> dict[str, Any]:
    payload = accumulate_g60_occupancy(max_tick)
    return {
        "tick": payload["tick"],
        "host": payload["host"]["name"],
        "counts": payload["counts"],
        "latest_delta": {
            "primary_node": payload["latest_delta"]["primary_node"],
            "g15_vertex": payload["latest_delta"]["g15_vertex"],
            "g60_class": payload["latest_delta"]["g60_class"],
            "delta_nodes": payload["latest_delta"]["delta_nodes"],
            "delta_edges": payload["latest_delta"]["delta_edges"],
        },
    }
