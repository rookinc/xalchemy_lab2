#!/usr/bin/env python3
import json
import sys
from collections import deque

ADJ_OVERLAP = 9

def load_object(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_Q(obj):
    if "Q" in obj:
        return obj["Q"]
    if "gram_Q" in obj:
        return obj["gram_Q"]
    raise KeyError("Could not find Q in theorem object.")

def build_graph(Q):
    n = len(Q)
    g = {i: [] for i in range(n)}
    for i in range(n):
        for j in range(n):
            if i != j and Q[i][j] == ADJ_OVERLAP:
                g[i].append(j)
    return g

def bfs_distances(g, src):
    dist = {src: 0}
    q = deque([src])
    while q:
        u = q.popleft()
        for v in g[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def main():
    path = sys.argv[1]
    obj = load_object(path)
    Q = extract_Q(obj)
    g = build_graph(Q)

    degrees = sorted(len(v) for v in g.values())
    connected = True
    all_dists = []

    for i in g:
        d = bfs_distances(g, i)
        if len(d) != len(g):
            connected = False
        all_dists.extend(d.values())

    diameter = max(all_dists) if connected and all_dists else None
    regular_4 = all(d == 4 for d in degrees)

    result = {
        "claim_id": "T6",
        "status": "pass" if connected and regular_4 and diameter == 3 else "fail",
        "details": {
            "adjacency_overlap": ADJ_OVERLAP,
            "degrees": degrees,
            "regular_4": regular_4,
            "connected": connected,
            "diameter": diameter
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
