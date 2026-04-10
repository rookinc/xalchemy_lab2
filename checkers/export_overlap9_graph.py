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

def build_adjacency_matrix(Q, overlap):
    n = len(Q)
    A = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j and Q[i][j] == overlap:
                A[i][j] = 1
    return A

def adjacency_list(A):
    return {str(i): [j for j, x in enumerate(row) if x] for i, row in enumerate(A)}

def bfs(A, src):
    n = len(A)
    dist = [-1] * n
    dist[src] = 0
    q = deque([src])
    while q:
        u = q.popleft()
        for v, x in enumerate(A[u]):
            if x and dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def distance_matrix(A):
    return [bfs(A, i) for i in range(len(A))]

def main():
    theorem_path = sys.argv[1]
    out_path = sys.argv[2]

    obj = load_object(theorem_path)
    Q = extract_Q(obj)
    A = build_adjacency_matrix(Q, ADJ_OVERLAP)
    D = distance_matrix(A)

    degrees = [sum(row) for row in A]
    finite_d = [d for row in D for d in row if d >= 0]
    diameter = max(finite_d) if finite_d else None

    payload = {
        "graph_name": "overlap_9_graph",
        "derived_from": theorem_path,
        "adjacency_rule": "A[i][j] = 1 iff i != j and Q[i][j] == 9",
        "vertex_count": len(A),
        "degrees": degrees,
        "diameter": diameter,
        "adjacency_matrix": A,
        "adjacency_list": adjacency_list(A),
        "distance_matrix": D
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(json.dumps({
        "status": "ok",
        "written": out_path,
        "vertex_count": len(A),
        "diameter": diameter
    }, indent=2))

if __name__ == "__main__":
    main()
