#!/usr/bin/env python3
import json
from collections import defaultdict, Counter

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

with open("edge_column_assignment.json", "r", encoding="utf-8") as f:
    ass = json.load(f)["assignment"]

Q = th["gram_Q"]
M = th["matrix_M"]

n = len(Q)

# build graph edges + distances
edges = []
for i in range(n):
    for j in range(i+1, n):
        if Q[i][j] == 9:
            edges.append((i,j))

INF = 10**9
dist = [[INF]*n for _ in range(n)]
for i in range(n):
    dist[i][i] = 0
for u,v in edges:
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

assign = {}
for row in ass:
    e = tuple(row["edge"])
    c = row["column"] - 1
    assign[e] = c

col_supports = []
for j in range(len(M[0])):
    supp = tuple(i for i in range(len(M)) if M[i][j] == 1)
    col_supports.append(set(supp))

def edge_rel(e1,e2):
    u,v = e1
    a,b = e2
    share = len({u,v} & {a,b})
    pattern = tuple(sorted([dist[u][a], dist[u][b], dist[v][a], dist[v][b]]))
    return (share, pattern)

bucket = defaultdict(list)

elist = sorted(assign)
for i,e1 in enumerate(elist):
    for e2 in elist[i+1:]:
        c1, c2 = assign[e1], assign[e2]
        inter = len(col_supports[c1] & col_supports[c2])
        bucket[edge_rel(e1,e2)].append(inter)

for rel, vals in sorted(bucket.items()):
    print(rel, "->", dict(sorted(Counter(vals).items())))
