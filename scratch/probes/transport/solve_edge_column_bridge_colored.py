#!/usr/bin/env python3
import json
from collections import Counter, defaultdict

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

with open("theorem/cocycle_data.json", "r", encoding="utf-8") as f:
    coc = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]

n = len(Q)
m = len(M[0])

# --- build G15 edges from Q ---
edges = []
for i in range(n):
    for j in range(i + 1, n):
        if Q[i][j] == 9:
            edges.append((i, j))
assert len(edges) == 30

edge_index = {e: i for i, e in enumerate(edges)}

# --- cocycle values on edges ---
edge_val = {}
for item in coc["edge_cocycle"]:
    e = tuple(sorted(item["edge"]))
    edge_val[e] = item["value"]   # 0 = parallel, 1 = crossed

# sanity
assert set(edge_val.keys()) == set(edges), "Cocycle edge set does not match graph edge set"

# --- distances on G15 ---
INF = 10**9
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

# --- column supports ---
col_supports = []
for j in range(m):
    supp = tuple(i for i in range(n) if M[i][j] == 1)
    col_supports.append(set(supp))
assert len(col_supports) == 30
assert all(len(s) == 7 for s in col_supports)

# --- colored edge signatures ---
def edge_pair_type(e1, e2):
    u, v = e1
    a, b = e2
    vals = tuple(sorted([dist[u][a], dist[u][b], dist[v][a], dist[v][b]]))
    share = len(set(e1) & set(e2))
    return (share, vals)

edge_hists = []
for e1 in edges:
    hist = Counter()
    own = edge_val[e1]
    for e2 in edges:
        if e1 == e2:
            continue
        hist[(own, edge_val[e2], edge_pair_type(e1, e2))] += 1
    edge_hists.append(tuple(sorted(hist.items())))

# --- column signatures (same as before) ---
col_hists = []
for s1 in col_supports:
    hist = Counter()
    for s2 in col_supports:
        if s1 is s2:
            continue
        hist[len(s1 & s2)] += 1
    col_hists.append(tuple(sorted(hist.items())))

# --- class partitions ---
edge_classes = defaultdict(list)
for i, h in enumerate(edge_hists):
    edge_classes[h].append(i)

col_classes = defaultdict(list)
for i, h in enumerate(col_hists):
    col_classes[h].append(i)

print("Colored edge histogram classes:")
for _, v in edge_classes.items():
    print(len(v), "->", v)
print()

print("Column histogram classes:")
for _, v in col_classes.items():
    print(len(v), "->", v)
print()

print("Colored edge class sizes:", sorted(len(v) for v in edge_classes.values()))
print("Column class sizes:", sorted(len(v) for v in col_classes.values()))
print()

# dump detailed data
out = {
    "edges": [
        {
            "idx": i,
            "edge": list(edges[i]),
            "value": edge_val[edges[i]],
            "hist": list(edge_hists[i])
        }
        for i in range(30)
    ],
    "columns": [
        {
            "idx": i,
            "support": sorted(col_supports[i]),
            "hist": list(col_hists[i])
        }
        for i in range(30)
    ]
}
with open("edge_column_signatures_colored.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)

print("Wrote edge_column_signatures_colored.json")
