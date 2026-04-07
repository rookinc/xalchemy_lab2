from __future__ import annotations

from typing import Any


def g60_scaffold() -> dict[str, Any]:
    """
    First-pass combinatorial scaffold extracted from the three-sheet sketch.

    This is intentionally a host/scaffold grammar, not yet the full G60 graph.
    """

    nodes = {
        "n0": {
            "id": "n0",
            "kind": "axis",
            "level": 0,
            "label": "base axis anchor",
        },
        "n1": {
            "id": "n1",
            "kind": "axis",
            "level": 1,
            "label": "middle axis anchor",
        },
        "n2": {
            "id": "n2",
            "kind": "axis",
            "level": 2,
            "label": "upper axis anchor",
        },

        "3":  {"id": "3",  "kind": "anchor", "sheet_hint": "bottom"},
        "4":  {"id": "4",  "kind": "anchor", "sheet_hint": "top"},
        "5":  {"id": "5",  "kind": "anchor", "sheet_hint": "top"},
        "6":  {"id": "6",  "kind": "anchor", "sheet_hint": "top"},
        "7":  {"id": "7",  "kind": "anchor", "sheet_hint": "middle"},
        "8":  {"id": "8",  "kind": "anchor", "sheet_hint": "bottom"},
        "9":  {"id": "9",  "kind": "anchor", "sheet_hint": "middle"},
        "10": {"id": "10", "kind": "anchor", "sheet_hint": "middle"},
        "11": {"id": "11", "kind": "anchor", "sheet_hint": "bottom"},
        "12": {"id": "12", "kind": "anchor", "sheet_hint": "bottom"},
        "13": {"id": "13", "kind": "anchor", "sheet_hint": "axis-near"},
        "14": {"id": "14", "kind": "anchor", "sheet_hint": "axis-near"},
    }

    sheets = {
        "bottom": {
            "id": "bottom",
            "color_hint": "cyan",
            "nodes": ["3", "8", "11", "12", "14"],
            "paths": [
                ["3", "8", "14", "11", "12", "3"],
            ],
        },
        "middle": {
            "id": "middle",
            "color_hint": "orange",
            "nodes": ["8", "9", "10", "13", "14", "3"],
            "paths": [
                ["3", "9", "10", "7", "8", "3"],
                ["14", "13"],
            ],
        },
        "top": {
            "id": "top",
            "color_hint": "green",
            "nodes": ["4", "5", "6", "3", "7", "n2"],
            "paths": [
                ["4", "5", "6", "3", "4"],
                ["4", "5", "n2", "3", "6"],
            ],
        },
    }

    axis = {
        "id": "axis",
        "nodes": ["n0", "n1", "n2"],
        "links": [
            ["n0", "n1"],
            ["n1", "n2"],
        ],
    }

    transport = {
        "vertical": [
            ["n0", "n1"],
            ["n1", "n2"],
            ["n0", "14"],
            ["n1", "13"],
            ["n2", "5"],
        ],
        "diagonal": [
            ["4", "n2"],
            ["n2", "6"],
            ["14", "3"],
            ["14", "7"],
            ["5", "3"],
            ["8", "13"],
            ["13", "10"],
            ["7", "11"],
        ],
        "cross_sheet": [
            ["8", "9"],
            ["3", "10"],
            ["3", "7"],
            ["14", "13"],
            ["13", "n2"],
        ],
    }

    return {
        "name": "G60_scaffold_first_pass",
        "status": "scaffold_only",
        "source": "three-sheet sketch",
        "nodes": nodes,
        "sheets": sheets,
        "axis": axis,
        "transport": transport,
    }


def scaffold_node_ids() -> list[str]:
    return sorted(g60_scaffold()["nodes"].keys(), key=_node_sort_key)


def scaffold_sheet_ids() -> list[str]:
    return list(g60_scaffold()["sheets"].keys())


def scaffold_axis_nodes() -> list[str]:
    return list(g60_scaffold()["axis"]["nodes"])


def scaffold_sheet_membership(node_id: str) -> list[str]:
    scaffold = g60_scaffold()
    out: list[str] = []
    for sheet_id, sheet in scaffold["sheets"].items():
        if node_id in sheet["nodes"]:
            out.append(sheet_id)
    return out


def scaffold_edges() -> list[dict[str, Any]]:
    """
    Flatten all scaffold links into labeled undirected edges.
    """
    scaffold = g60_scaffold()
    seen: set[tuple[str, str, str]] = set()
    out: list[dict[str, Any]] = []

    def add_edge(a: str, b: str, family: str) -> None:
        x, y = sorted((a, b), key=_node_sort_key)
        key = (x, y, family)
        if key in seen:
            return
        seen.add(key)
        out.append(
            {
                "id": f"{family}:{x}-{y}",
                "family": family,
                "nodes": [x, y],
            }
        )

    for sheet_id, sheet in scaffold["sheets"].items():
        for path in sheet["paths"]:
            for i in range(len(path) - 1):
                add_edge(path[i], path[i + 1], f"sheet:{sheet_id}")

    for a, b in scaffold["axis"]["links"]:
        add_edge(a, b, "axis")

    for family, links in scaffold["transport"].items():
        for a, b in links:
            add_edge(a, b, f"transport:{family}")

    return sorted(out, key=lambda row: row["id"])


def scaffold_adjacency() -> dict[str, list[str]]:
    adj: dict[str, set[str]] = {node_id: set() for node_id in scaffold_node_ids()}
    for edge in scaffold_edges():
        a, b = edge["nodes"]
        adj[a].add(b)
        adj[b].add(a)
    return {k: sorted(v, key=_node_sort_key) for k, v in adj.items()}


def scaffold_validation_report() -> dict[str, Any]:
    scaffold = g60_scaffold()
    node_ids = set(scaffold["nodes"].keys())
    edges = scaffold_edges()
    adjacency = scaffold_adjacency()

    missing_edge_nodes = []
    for edge in edges:
        for node_id in edge["nodes"]:
            if node_id not in node_ids:
                missing_edge_nodes.append({"edge": edge["id"], "node": node_id})

    axis_nodes = scaffold_axis_nodes()
    axis_ok = axis_nodes == ["n0", "n1", "n2"]

    sheet_membership_counts = {
        node_id: len(scaffold_sheet_membership(node_id))
        for node_id in node_ids
    }

    return {
        "ok": len(missing_edge_nodes) == 0 and axis_ok,
        "node_count": len(node_ids),
        "edge_count": len(edges),
        "sheet_count": len(scaffold["sheets"]),
        "axis_nodes": axis_nodes,
        "axis_ok": axis_ok,
        "missing_edge_nodes": missing_edge_nodes,
        "sheet_membership_counts": dict(
            sorted(sheet_membership_counts.items(), key=lambda kv: _node_sort_key(kv[0]))
        ),
        "degrees": {
            node_id: len(neighbors)
            for node_id, neighbors in sorted(adjacency.items(), key=lambda kv: _node_sort_key(kv[0]))
        },
    }


def _node_sort_key(node_id: str) -> tuple[int, int | str]:
    if node_id.startswith("n"):
        try:
            return (0, int(node_id[1:]))
        except ValueError:
            return (0, node_id)
    try:
        return (1, int(node_id))
    except ValueError:
        return (2, node_id)
