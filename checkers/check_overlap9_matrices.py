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

def build_A(Q):
    n = len(Q)
    A = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j and Q[i][j] == ADJ_OVERLAP:
                A[i][j] = 1
    return A

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

def build_D(A):
    return [bfs(A, i) for i in range(len(A))]

def main():
    path = sys.argv[1]
    out_path = sys.argv[2]

    obj = load_object(path)
    Q = extract_Q(obj)
    A = build_A(Q)
    D = build_D(A)

    symmetric_A = all(A[i][j] == A[j][i] for i in range(len(A)) for j in range(len(A)))
    zero_diag_A = all(A[i][i] == 0 for i in range(len(A)))
    degree_sums = [sum(row) for row in A]
    regular_4 = all(x == 4 for x in degree_sums)

    symmetric_D = all(D[i][j] == D[j][i] for i in range(len(D)) for j in range(len(D)))
    zero_diag_D = all(D[i][i] == 0 for i in range(len(D)))
    finite_only = all(D[i][j] >= 0 for i in range(len(D)) for j in range(len(D)))

    payload = {
        "claim_id": "T8",
        "status": "pass" if all([symmetric_A, zero_diag_A, regular_4, symmetric_D, zero_diag_D, finite_only]) else "fail",
        "details": {
            "adjacency_overlap": ADJ_OVERLAP,
            "symmetric_A": symmetric_A,
            "zero_diag_A": zero_diag_A,
            "degree_sums": degree_sums,
            "regular_4": regular_4,
            "symmetric_D": symmetric_D,
            "zero_diag_D": zero_diag_D,
            "finite_only": finite_only
        },
        "exports": {
            "adjacency_matrix": A,
            "distance_matrix": D
        }
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(json.dumps({
        "claim_id": "T8",
        "status": payload["status"],
        "details": payload["details"],
        "written": out_path
    }, indent=2))

if __name__ == "__main__":
    main()
