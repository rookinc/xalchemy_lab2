#!/usr/bin/env python3
import json
import sys
from collections import deque

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def edge_key(u, v):
    return (u, v) if u < v else (v, u)

def build_graph(cocycle):
    edges = [tuple(item["edge"]) for item in cocycle["edge_cocycle"]]
    adj = {}
    for u, v in edges:
        adj.setdefault(u, []).append(v)
        adj.setdefault(v, []).append(u)
    return adj, edges

def spanning_tree(adj, root=0):
    parent = {root: None}
    order = [root]
    q = deque([root])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if v not in parent:
                parent[v] = u
                q.append(v)
                order.append(v)
    tree_edges = {edge_key(v, p) for v, p in parent.items() if p is not None}
    return parent, tree_edges

def path_to_root(parent, v):
    path = []
    while v is not None:
        path.append(v)
        v = parent[v]
    return path

def tree_path_edges(parent, u, v):
    pu = path_to_root(parent, u)
    pv = path_to_root(parent, v)
    set_pu = set(pu)

    lca = None
    for x in pv:
        if x in set_pu:
            lca = x
            break

    edges = []
    x = u
    while x != lca:
        p = parent[x]
        edges.append(edge_key(x, p))
        x = p

    down = []
    y = v
    while y != lca:
        p = parent[y]
        down.append(edge_key(y, p))
        y = p

    edges.extend(reversed(down))
    return edges

def main():
    cocycle_path = sys.argv[1]
    cocycle = load_json(cocycle_path)

    values = {edge_key(*item["edge"]): item["value"] for item in cocycle["edge_cocycle"]}
    adj, edges = build_graph(cocycle)

    root = min(adj)
    parent, tree_edges = spanning_tree(adj, root=root)

    odd_cycles = []
    for u, v in edges:
        e = edge_key(u, v)
        if e in tree_edges:
            continue
        cycle_edges = tree_path_edges(parent, u, v) + [e]
        parity = sum(values[x] for x in cycle_edges) % 2
        if parity == 1:
            odd_cycles.append([list(x) for x in cycle_edges])

    result = {
        "claim_id": "C4",
        "status": "pass" if odd_cycles else "fail",
        "details": {
            "odd_cycle_count": len(odd_cycles),
            "sample_odd_cycle": odd_cycles[0] if odd_cycles else []
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
