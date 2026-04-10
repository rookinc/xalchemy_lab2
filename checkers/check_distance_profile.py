#!/usr/bin/env python3
import json
import sys
from collections import Counter, deque

ADJ_OVERLAP = 9
TARGET_COUNTS = {0: 15, 1: 60, 2: 120, 3: 30}

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

def bfs(g, src):
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

    n = len(g)
    D = [[-1] * n for _ in range(n)]
    for i in range(n):
        d = bfs(g, i)
        for j, val in d.items():
            D[i][j] = val

    counts = Counter()
    for i in range(n):
        for j in range(n):
            counts[D[i][j]] += 1

    observed = dict(sorted(counts.items()))
    ok = observed == TARGET_COUNTS

    result = {
        "claim_id": "T7",
        "status": "pass" if ok else "fail",
        "details": {
            "adjacency_overlap": ADJ_OVERLAP,
            "observed_distance_counts": observed,
            "expected_distance_counts": TARGET_COUNTS
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
