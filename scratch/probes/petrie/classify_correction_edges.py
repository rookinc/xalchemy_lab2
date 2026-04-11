#!/usr/bin/env python3
import json
from collections import Counter

def norm_edge(u, v):
    return (u, v) if u <= v else (v, u)

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

Q = th["gram_Q"]

# theorem G15 edges
edges = []
for i in range(len(Q)):
    for j in range(i + 1, len(Q)):
        if Q[i][j] == 9:
            edges.append((i, j))
edges = sorted(edges)

# distances
INF = 10**9
n = len(Q)
dist = [[INF]*n for _ in range(n)]
for i in range(n):
    dist[i][i] = 0
for u, v in edges:
    dist[u][v] = dist[v][u] = 1
for k in range(n):
    for i in range(n):
        dik = dist[i][k]
        if dik == INF:
            continue
        for j in range(n):
            cand = dik + dist[k][j]
            if cand < dist[i][j]:
                dist[i][j] = cand

missed = [
    (4,5),(6,8),(11,14),(1,2),(6,12),(9,10),(3,10),(7,8),(5,12),(8,13),
    (10,11),(4,14),(9,11),(0,14),(1,8)
]

def edge_profile(e):
    u, v = e
    prof = []
    for x in range(n):
        prof.append(tuple(sorted((dist[x][u], dist[x][v]))))
    return tuple(prof)

groups = {}
for e in missed:
    groups.setdefault(edge_profile(e), []).append(e)

print("correction-edge profile classes:")
for prof, es in groups.items():
    print(len(es), "->", es)
