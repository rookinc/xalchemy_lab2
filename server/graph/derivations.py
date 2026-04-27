from __future__ import annotations

import math
from collections import deque
from typing import Any


def derive_identity_graph(
    graph: dict[str, Any],
    base_nodes: list[dict[str, Any]],
    base_edges: list[dict[str, Any]],
    view: dict[str, Any],
    view_nodes: list[dict[str, Any]],
    view_edges: list[dict[str, Any]],
) -> dict[str, Any]:
    derived_graph = {
        "id": graph["id"],
        "graph_key": graph["graph_key"],
        "label": graph["label"],
        "description": graph.get("description"),
        "graph_kind": graph.get("graph_kind"),
        "status": "derived",
    }

    return {
        "graph": derived_graph,
        "source_graph": graph,
        "view": view,
        "nodes": base_nodes,
        "edges": base_edges,
        "view_nodes": view_nodes,
        "view_edges": view_edges,
    }


def derive_line_graph(
    graph: dict[str, Any],
    base_nodes: list[dict[str, Any]],
    base_edges: list[dict[str, Any]],
    view: dict[str, Any],
    view_nodes: list[dict[str, Any]],
    view_edges: list[dict[str, Any]],
) -> dict[str, Any]:
    node_id_to_key = {row["id"]: row["node_key"] for row in base_nodes}

    derived_nodes: list[dict[str, Any]] = []
    edge_to_vertex: dict[int, dict[str, Any]] = {}

    for idx, edge in enumerate(base_edges):
        source_key = node_id_to_key.get(edge["source_node_id"], str(edge["source_node_id"]))
        target_key = node_id_to_key.get(edge["target_node_id"], str(edge["target_node_id"]))
        derived_key = edge["edge_key"] or f"e_{source_key}_{target_key}"

        derived_node = {
            "id": idx + 1,
            "graph_id": graph["id"],
            "node_key": derived_key,
            "label": derived_key,
            "payload_json": {
                "source_edge_id": edge["id"],
                "source_edge_key": edge["edge_key"],
                "source_edge_class": edge["edge_class"],
                "source_node_ids": [edge["source_node_id"], edge["target_node_id"]],
                "source_node_keys": [source_key, target_key],
            },
            "sort_order": idx,
        }
        derived_nodes.append(derived_node)
        edge_to_vertex[edge["id"]] = derived_node

    derived_edges: list[dict[str, Any]] = []
    seen_pairs: set[tuple[int, int]] = set()

    for i in range(len(base_edges)):
        for j in range(i + 1, len(base_edges)):
            a = base_edges[i]
            b = base_edges[j]

            shared = {
                a["source_node_id"],
                a["target_node_id"],
            } & {
                b["source_node_id"],
                b["target_node_id"],
            }

            if not shared:
                continue

            va = edge_to_vertex[a["id"]]
            vb = edge_to_vertex[b["id"]]
            pair = tuple(sorted((va["id"], vb["id"])))
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)

            shared_node_ids = sorted(shared)
            shared_node_keys = [node_id_to_key[x] for x in shared_node_ids]

            derived_edges.append(
                {
                    "id": len(derived_edges) + 1,
                    "graph_id": graph["id"],
                    "source_node_id": va["id"],
                    "target_node_id": vb["id"],
                    "edge_key": f"lg_{va['node_key']}__{vb['node_key']}",
                    "edge_class": "line_graph_adjacency",
                    "payload_json": {
                        "shared_node_ids": shared_node_ids,
                        "shared_node_keys": shared_node_keys,
                        "source_edge_ids": [a["id"], b["id"]],
                        "source_edge_keys": [a["edge_key"], b["edge_key"]],
                    },
                    "sort_order": len(derived_edges),
                }
            )

    n = len(derived_nodes)
    radius = 220.0

    derived_view_nodes: list[dict[str, Any]] = []
    for i, node in enumerate(derived_nodes):
        angle = (2.0 * math.pi * i) / max(n, 1)
        derived_view_nodes.append(
            {
                "id": i + 1,
                "graph_view_id": None,
                "graph_node_id": node["id"],
                "x": math.cos(angle) * radius,
                "y": math.sin(angle) * radius,
                "z": 0.0,
                "pinned": 0,
                "style_json": None,
            }
        )

    derived_view_edges: list[dict[str, Any]] = []
    for i, edge in enumerate(derived_edges):
        derived_view_edges.append(
            {
                "id": i + 1,
                "graph_view_id": None,
                "graph_edge_id": edge["id"],
                "style_json": {
                    "stroke": "#9d7bff",
                    "lineWidth": 2.0,
                },
                "is_visible": 1,
            }
        )

    derived_view = {
        "id": None,
        "graph_id": graph["id"],
        "view_key": "derived_line_graph",
        "label": f"{graph['label']} through Line Graph Lens",
        "view_kind": "spring_2d",
        "renderer_key": "canvas_2d",
        "params_json": {
            "repulsion": 9000,
            "springK": 0.01,
            "springLength": 120,
            "centering": 0.002,
            "damping": 0.85,
            "maxSpeed": 12,
            "nodeRadius": 10,
        },
        "is_default": 0,
        "status": "derived",
    }

    derived_graph = {
        "id": graph["id"],
        "graph_key": f"{graph['graph_key']}__line_graph",
        "label": f"{graph['label']} :: Line Graph Lens",
        "description": f"Derived graph produced by applying the line_graph lens to '{graph['graph_key']}'.",
        "graph_kind": "derived_line_graph",
        "status": "derived",
    }

    return {
        "graph": derived_graph,
        "source_graph": graph,
        "view": derived_view,
        "nodes": derived_nodes,
        "edges": derived_edges,
        "view_nodes": derived_view_nodes,
        "view_edges": derived_view_edges,
    }


def derive_incidence_graph(
    graph: dict[str, Any],
    base_nodes: list[dict[str, Any]],
    base_edges: list[dict[str, Any]],
    view: dict[str, Any],
    view_nodes: list[dict[str, Any]],
    view_edges: list[dict[str, Any]],
) -> dict[str, Any]:
    source_vertex_nodes: list[dict[str, Any]] = []
    source_edge_nodes: list[dict[str, Any]] = []

    source_node_id_to_derived_id: dict[int, int] = {}
    source_edge_id_to_derived_id: dict[int, int] = {}

    next_id = 1

    for idx, node in enumerate(base_nodes):
        derived_node = {
            "id": next_id,
            "graph_id": graph["id"],
            "node_key": f"v::{node['node_key']}",
            "label": node["label"] or node["node_key"],
            "payload_json": {
                "source_kind": "vertex",
                "source_node_id": node["id"],
                "source_node_key": node["node_key"],
            },
            "sort_order": idx,
        }
        source_vertex_nodes.append(derived_node)
        source_node_id_to_derived_id[node["id"]] = next_id
        next_id += 1

    for idx, edge in enumerate(base_edges):
        derived_node = {
            "id": next_id,
            "graph_id": graph["id"],
            "node_key": f"e::{edge['edge_key'] or edge['id']}",
            "label": edge["edge_key"] or f"e{edge['id']}",
            "payload_json": {
                "source_kind": "edge",
                "source_edge_id": edge["id"],
                "source_edge_key": edge["edge_key"],
                "source_edge_class": edge["edge_class"],
            },
            "sort_order": len(base_nodes) + idx,
        }
        source_edge_nodes.append(derived_node)
        source_edge_id_to_derived_id[edge["id"]] = next_id
        next_id += 1

    derived_nodes = source_vertex_nodes + source_edge_nodes

    derived_edges: list[dict[str, Any]] = []
    for edge in base_edges:
        edge_vertex_id = source_edge_id_to_derived_id[edge["id"]]
        for source_node_id in (edge["source_node_id"], edge["target_node_id"]):
            derived_edges.append(
                {
                    "id": len(derived_edges) + 1,
                    "graph_id": graph["id"],
                    "source_node_id": source_node_id_to_derived_id[source_node_id],
                    "target_node_id": edge_vertex_id,
                    "edge_key": f"inc_{source_node_id}_{edge['id']}",
                    "edge_class": "incidence",
                    "payload_json": {
                        "source_node_id": source_node_id,
                        "source_edge_id": edge["id"],
                    },
                    "sort_order": len(derived_edges),
                }
            )

    vertex_radius = 220.0
    edge_radius = 120.0

    derived_view_nodes: list[dict[str, Any]] = []

    for i, node in enumerate(source_vertex_nodes):
        angle = (2.0 * math.pi * i) / max(len(source_vertex_nodes), 1)
        derived_view_nodes.append(
            {
                "id": len(derived_view_nodes) + 1,
                "graph_view_id": None,
                "graph_node_id": node["id"],
                "x": math.cos(angle) * vertex_radius,
                "y": math.sin(angle) * vertex_radius,
                "z": 0.0,
                "pinned": 0,
                "style_json": {"fill": "#7cc4ff"},
            }
        )

    for i, node in enumerate(source_edge_nodes):
        angle = (2.0 * math.pi * i) / max(len(source_edge_nodes), 1)
        derived_view_nodes.append(
            {
                "id": len(derived_view_nodes) + 1,
                "graph_view_id": None,
                "graph_node_id": node["id"],
                "x": math.cos(angle) * edge_radius,
                "y": math.sin(angle) * edge_radius,
                "z": 0.0,
                "pinned": 0,
                "style_json": {"fill": "#ffd166"},
            }
        )

    derived_view_edges: list[dict[str, Any]] = []
    for i, edge in enumerate(derived_edges):
        derived_view_edges.append(
            {
                "id": i + 1,
                "graph_view_id": None,
                "graph_edge_id": edge["id"],
                "style_json": {
                    "stroke": "#7cc4ff",
                    "lineWidth": 1.8,
                },
                "is_visible": 1,
            }
        )

    derived_view = {
        "id": None,
        "graph_id": graph["id"],
        "view_key": "derived_incidence",
        "label": f"{graph['label']} through Incidence Lens",
        "view_kind": "spring_2d",
        "renderer_key": "canvas_2d",
        "params_json": {
            "repulsion": 9000,
            "springK": 0.01,
            "springLength": 100,
            "centering": 0.002,
            "damping": 0.85,
            "maxSpeed": 12,
            "nodeRadius": 10,
        },
        "is_default": 0,
        "status": "derived",
    }

    derived_graph = {
        "id": graph["id"],
        "graph_key": f"{graph['graph_key']}__incidence",
        "label": f"{graph['label']} :: Incidence Lens",
        "description": f"Derived incidence graph produced from '{graph['graph_key']}'.",
        "graph_kind": "derived_incidence",
        "status": "derived",
    }

    return {
        "graph": derived_graph,
        "source_graph": graph,
        "view": derived_view,
        "nodes": derived_nodes,
        "edges": derived_edges,
        "view_nodes": derived_view_nodes,
        "view_edges": derived_view_edges,
    }


def realize_petersen_shell(
    base_graph: dict[str, Any],
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
    view: dict[str, Any],
    view_nodes: list[dict[str, Any]],
    view_edges: list[dict[str, Any]],
    *,
    anchor_node_key: str | None = None,
) -> dict[str, Any]:
    if not nodes:
        raise ValueError("Petersen shell walker requires source nodes.")

    node_by_key = {str(node["node_key"]): node for node in nodes}
    sorted_nodes = sorted(nodes, key=lambda node: (node.get("sort_order", 0), node["id"]))

    if anchor_node_key is None:
        anchor = sorted_nodes[0]
    else:
        anchor = node_by_key.get(str(anchor_node_key))
        if anchor is None:
            raise ValueError(f"Unknown Petersen anchor node_key: {anchor_node_key}")

    adjacency: dict[int, set[int]] = {node["id"]: set() for node in nodes}
    for edge in edges:
        adjacency.setdefault(edge["source_node_id"], set()).add(edge["target_node_id"])
        adjacency.setdefault(edge["target_node_id"], set()).add(edge["source_node_id"])

    distance_by_id: dict[int, int] = {anchor["id"]: 0}
    parent_by_id: dict[int, int | None] = {anchor["id"]: None}
    order: list[int] = []
    queue: deque[int] = deque([anchor["id"]])

    while queue:
        current = queue.popleft()
        order.append(current)
        neighbors = sorted(
            adjacency.get(current, set()),
            key=lambda node_id: (
                node_by_key[str(next(node["node_key"] for node in nodes if node["id"] == node_id))]
                if False else node_id
            ),
        )
        for nxt in sorted(adjacency.get(current, set())):
            if nxt in distance_by_id:
                continue
            distance_by_id[nxt] = distance_by_id[current] + 1
            parent_by_id[nxt] = current
            queue.append(nxt)

    order_index = {node_id: index for index, node_id in enumerate(order)}

    shell_groups: dict[int, list[int]] = {}
    for node_id, dist in distance_by_id.items():
        shell_groups.setdefault(dist, []).append(node_id)

    for group in shell_groups.values():
        group.sort(key=lambda node_id: order_index.get(node_id, 9999))

    def role_for_distance(dist: int) -> str:
        if dist == 0:
            return "anchor"
        if dist == 1:
            return "ring_1"
        return "ring_2"

    derived_nodes: list[dict[str, Any]] = []
    for idx, node in enumerate(
        sorted(nodes, key=lambda item: (distance_by_id.get(item["id"], 999), order_index.get(item["id"], 9999)))
    ):
        dist = distance_by_id.get(node["id"], 999)
        role = role_for_distance(dist)

        if role == "anchor":
            style = {"fill": "#ffd166", "stroke": "#3b2f08", "radius": 14, "lineWidth": 3}
        elif role == "ring_1":
            style = {"fill": "#6aa9ff", "stroke": "#10253f", "radius": 11, "lineWidth": 2}
        else:
            style = {"fill": "#c792ea", "stroke": "#2c163b", "radius": 10, "lineWidth": 2}

        derived_nodes.append(
            {
                "id": node["id"],
                "graph_id": graph["id"],
                "node_key": node["node_key"],
                "label": node["label"] or node["node_key"],
                "payload_json": {
                    "source_kind": "walker",
                    "walker_key": "petersen_shell",
                    "anchor_node_key": anchor["node_key"],
                    "role": role,
                    "shell": dist,
                    "visit_order": order_index.get(node["id"], None),
                    "parent_node_id": parent_by_id.get(node["id"]),
                    "receipt": (
                        "selected_as_anchor"
                        if dist == 0
                        else "adjacent_to_anchor"
                        if dist == 1
                        else "distance_2_from_anchor"
                    ),
                },
                "sort_order": idx,
            }
        )

    derived_edges: list[dict[str, Any]] = []
    for idx, edge in enumerate(edges):
        a_shell = distance_by_id.get(edge["source_node_id"], 999)
        b_shell = distance_by_id.get(edge["target_node_id"], 999)
        crosses_shell = a_shell != b_shell
        shell_signature = tuple(sorted((a_shell, b_shell)))

        if shell_signature == (0, 1):
            edge_style = {"stroke": "#ffd166", "lineWidth": 3.2}
            edge_role = "anchor_registration"
        elif shell_signature == (1, 2):
            edge_style = {"stroke": "#6aa9ff", "lineWidth": 2.6}
            edge_role = "outer_registration"
        else:
            edge_style = {"stroke": "#6b7280", "lineWidth": 1.5, "lineDash": [6, 4]}
            edge_role = "intra_shell_relation"

        derived_edges.append(
            {
                "id": edge["id"],
                "graph_id": graph["id"],
                "source_node_id": edge["source_node_id"],
                "target_node_id": edge["target_node_id"],
                "edge_key": edge["edge_key"],
                "edge_class": edge_role,
                "payload_json": {
                    "source_kind": "walker",
                    "walker_key": "petersen_shell",
                    "anchor_node_key": anchor["node_key"],
                    "source_shell": a_shell,
                    "target_shell": b_shell,
                    "crosses_shell": crosses_shell,
                    "receipt": edge_role,
                },
                "sort_order": idx,
                "_style_json": edge_style,
            }
        )

    anchor_y = -170.0
    ring_1_radius = 115.0
    ring_2_radius = 245.0
    ring_1_center_y = -20.0
    ring_2_center_y = 60.0

    positions: dict[int, tuple[float, float]] = {
        anchor["id"]: (0.0, anchor_y),
    }

    ring_1 = shell_groups.get(1, [])
    ring_2 = shell_groups.get(2, [])

    for i, node_id in enumerate(ring_1):
        if len(ring_1) == 1:
            angle = -math.pi / 2.0
        else:
            angle = -math.pi / 2.0 + (2.0 * math.pi * i) / len(ring_1)
        positions[node_id] = (
            math.cos(angle) * ring_1_radius,
            ring_1_center_y + math.sin(angle) * ring_1_radius * 0.5,
        )

    for i, node_id in enumerate(ring_2):
        angle = -math.pi / 2.0 + (2.0 * math.pi * i) / max(len(ring_2), 1)
        positions[node_id] = (
            math.cos(angle) * ring_2_radius,
            ring_2_center_y + math.sin(angle) * ring_2_radius * 0.7,
        )

    derived_view_nodes: list[dict[str, Any]] = []
    for idx, node in enumerate(derived_nodes):
        x, y = positions.get(node["id"], (0.0, 0.0))
        derived_view_nodes.append(
            {
                "id": idx + 1,
                "graph_view_id": None,
                "graph_node_id": node["id"],
                "x": x,
                "y": y,
                "z": 0.0,
                "pinned": 1,
                "style_json": node["payload_json"] and {
                    "fill": (
                        "#ffd166"
                        if node["payload_json"]["role"] == "anchor"
                        else "#6aa9ff"
                        if node["payload_json"]["role"] == "ring_1"
                        else "#c792ea"
                    ),
                    "stroke": (
                        "#3b2f08"
                        if node["payload_json"]["role"] == "anchor"
                        else "#10253f"
                        if node["payload_json"]["role"] == "ring_1"
                        else "#2c163b"
                    ),
                    "radius": 14 if node["payload_json"]["role"] == "anchor" else 11 if node["payload_json"]["role"] == "ring_1" else 10,
                    "lineWidth": 3 if node["payload_json"]["role"] == "anchor" else 2,
                    "fontSize": 12,
                    "text": "#0f1318",
                },
            }
        )

    derived_view_edges: list[dict[str, Any]] = []
    for idx, edge in enumerate(derived_edges):
        derived_view_edges.append(
            {
                "id": idx + 1,
                "graph_view_id": None,
                "graph_edge_id": edge["id"],
                "style_json": edge["_style_json"],
                "is_visible": 1,
            }
        )
        del edge["_style_json"]

    derived_view = {
        "id": None,
        "graph_id": graph["id"],
        "view_key": "walker_petersen_shell",
        "label": f"{graph['label']} through Petersen Shell Walker",
        "view_kind": "walker_2d",
        "renderer_key": "canvas_2d",
        "params_json": {
            "repulsion": 4000,
            "springK": 0.005,
            "springLength": 90,
            "centering": 0.001,
            "damping": 0.88,
            "maxSpeed": 10,
            "nodeRadius": 10,
        },
        "is_default": 0,
        "status": "derived",
    }

    derived_graph = {
        "id": graph["id"],
        "graph_key": f"{graph['graph_key']}__petersen_shell",
        "label": f"{graph['label']} :: Petersen Shell Walker",
        "description": f"Anchor-shell registration walk on '{graph['graph_key']}' from anchor '{anchor['node_key']}'.",
        "graph_kind": "walker_petersen_shell",
        "status": "derived",
    }

    receipts = [
        {
            "step": order_index[node_id],
            "node_id": node_id,
            "node_key": next(node["node_key"] for node in nodes if node["id"] == node_id),
            "shell": distance_by_id[node_id],
            "reason": (
                "selected_as_anchor"
                if distance_by_id[node_id] == 0
                else "adjacent_to_anchor"
                if distance_by_id[node_id] == 1
                else "distance_2_from_anchor"
            ),
        }
        for node_id in order
    ]

    return {
        "graph": derived_graph,
        "source_graph": graph,
        "view": derived_view,
        "nodes": derived_nodes,
        "edges": derived_edges,
        "view_nodes": derived_view_nodes,
        "view_edges": derived_view_edges,
        "walker": {
            "walker_key": "petersen_shell",
            "label": "Petersen Shell Walker",
            "walker_kind": "registration",
            "anchor_node_key": anchor["node_key"],
        },
        "receipts": receipts,
    }
