from __future__ import annotations

from typing import Any

from .g60_scaffold import g60_scaffold, scaffold_node_ids


def scaffold_to_g30_classes() -> dict[str, Any]:
    """
    First-pass quotient from scaffold nodes to provisional G30 fibers.

    This is a controllable grouping layer derived from the sketch scaffold.
    It is explicitly provisional and intended for inspection.
    """

    classes = {
        "g30_00": ["n0", "n1"],
        "g30_01": ["n2", "5"],
        "g30_02": ["3"],
        "g30_03": ["4"],
        "g30_04": ["6"],
        "g30_05": ["7"],
        "g30_06": ["8"],
        "g30_07": ["9"],
        "g30_08": ["10"],
        "g30_09": ["11"],
        "g30_10": ["12"],
        "g30_11": ["13", "14"],
    }

    node_to_class: dict[str, str] = {}
    for class_id, members in classes.items():
        for node_id in members:
            if node_id in node_to_class:
                raise ValueError(f"duplicate scaffold node in quotient classes: {node_id}")
            node_to_class[node_id] = class_id

    return {
        "name": "scaffold_to_g30_first_pass",
        "status": "provisional",
        "classes": classes,
        "node_to_class": node_to_class,
    }


def g30_to_g15_classes() -> dict[str, Any]:
    """
    First-pass quotient from provisional G30 classes to provisional G15 classes.
    """

    classes = {
        "g15_00": ["g30_00"],
        "g15_01": ["g30_01"],
        "g15_02": ["g30_02"],
        "g15_03": ["g30_03"],
        "g15_04": ["g30_04"],
        "g15_05": ["g30_05"],
        "g15_06": ["g30_06"],
        "g15_07": ["g30_07"],
        "g15_08": ["g30_08"],
        "g15_09": ["g30_09"],
        "g15_10": ["g30_10"],
        "g15_11": ["g30_11"],
    }

    g30_to_g15: dict[str, str] = {}
    for class_id, members in classes.items():
        for g30_id in members:
            if g30_id in g30_to_g15:
                raise ValueError(f"duplicate g30 class in g15 quotient: {g30_id}")
            g30_to_g15[g30_id] = class_id

    return {
        "name": "g30_to_g15_first_pass",
        "status": "provisional",
        "classes": classes,
        "g30_to_g15": g30_to_g15,
    }


def scaffold_to_g15_map() -> dict[str, str]:
    s2g30 = scaffold_to_g30_classes()["node_to_class"]
    g30_to_g15 = g30_to_g15_classes()["g30_to_g15"]

    out: dict[str, str] = {}
    for node_id, g30_id in s2g30.items():
        out[node_id] = g30_to_g15[g30_id]
    return out


def quotient_payload() -> dict[str, Any]:
    scaffold = g60_scaffold()
    s2g30 = scaffold_to_g30_classes()
    g30_to_g15 = g30_to_g15_classes()
    s2g15 = scaffold_to_g15_map()

    return {
        "name": "g60_quotient_first_pass",
        "status": "provisional",
        "source": scaffold["name"],
        "scaffold_to_g30": s2g30,
        "g30_to_g15": g30_to_g15,
        "scaffold_to_g15": s2g15,
    }


def quotient_validation_report() -> dict[str, Any]:
    scaffold = g60_scaffold()
    node_ids = scaffold_node_ids()

    s2g30 = scaffold_to_g30_classes()
    g30_to_g15 = g30_to_g15_classes()
    s2g15 = scaffold_to_g15_map()

    mapped_nodes = sorted(s2g30["node_to_class"].keys(), key=_node_sort_key)
    missing_nodes = [node_id for node_id in node_ids if node_id not in s2g30["node_to_class"]]
    extra_nodes = [node_id for node_id in mapped_nodes if node_id not in node_ids]

    g30_class_sizes = {
        class_id: len(members)
        for class_id, members in sorted(s2g30["classes"].items())
    }

    g15_class_sizes = {
        class_id: len(members)
        for class_id, members in sorted(g30_to_g15["classes"].items())
    }

    g15_fibers: dict[str, list[str]] = {}
    for node_id, g15_id in s2g15.items():
        g15_fibers.setdefault(g15_id, []).append(node_id)

    g15_fibers = {
        k: sorted(v, key=_node_sort_key)
        for k, v in sorted(g15_fibers.items())
    }

    return {
        "ok": len(missing_nodes) == 0 and len(extra_nodes) == 0,
        "scaffold_node_count": len(node_ids),
        "mapped_node_count": len(mapped_nodes),
        "g30_class_count": len(s2g30["classes"]),
        "g15_class_count": len(g30_to_g15["classes"]),
        "missing_nodes": missing_nodes,
        "extra_nodes": extra_nodes,
        "g30_class_sizes": g30_class_sizes,
        "g15_class_sizes": g15_class_sizes,
        "g15_fibers": g15_fibers,
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
