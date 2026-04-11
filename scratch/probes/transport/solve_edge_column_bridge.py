#!/usr/bin/env python3
import json
from collections import Counter, defaultdict

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

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
    col_supports.append(supp)
assert len(col_supports) == 30
assert all(len(s) == 7 for s in col_supports)

# --- edge-edge relation signatures ---
def edge_pair_type(e1, e2):
    u, v = e1
    a, b = e2
    vals = sorted([dist[u][a], dist[u][b], dist[v][a], dist[v][b]])
    return tuple(vals)

edge_rel = {}
edge_hists = []
for i, e1 in enumerate(edges):
    hist = Counter()
    for j, e2 in enumerate(edges):
        if i == j:
            continue
        t = edge_pair_type(e1, e2)
        edge_rel[(i, j)] = t
        hist[t] += 1
    edge_hists.append(tuple(sorted(hist.items())))

# --- column-column relation signatures ---
col_rel = {}
col_hists = []
for i, s1 in enumerate(col_supports):
    s1 = set(s1)
    hist = Counter()
    for j, s2 in enumerate(col_supports):
        if i == j:
            continue
        inter = len(s1 & set(s2))
        col_rel[(i, j)] = inter
        hist[inter] += 1
    col_hists.append(tuple(sorted(hist.items())))

# --- coarse classing by histogram ---
edge_classes = defaultdict(list)
for i, h in enumerate(edge_hists):
    edge_classes[h].append(i)

col_classes = defaultdict(list)
for i, h in enumerate(col_hists):
    col_classes[h].append(i)

print("Edge histogram classes:")
for k, v in edge_classes.items():
    print(len(v), "->", v)
print()

print("Column histogram classes:")
for k, v in col_classes.items():
    print(len(v), "->", v)
print()

# --- quick sanity ---
edge_class_sizes = sorted(len(v) for v in edge_classes.values())
col_class_sizes = sorted(len(v) for v in col_classes.values())

print("Edge class sizes:", edge_class_sizes)
print("Column class sizes:", col_class_sizes)
print()

# --- dump detailed signatures for manual inspection ---
out = {
    "edges": [{"idx": i, "edge": list(edges[i]), "hist": list(edge_hists[i])} for i in range(30)],
    "columns": [{"idx": i, "support": list(col_supports[i]), "hist": list(col_hists[i])} for i in range(30)]
}

with open("edge_column_signatures.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)

print("Wrote edge_column_signatures.json")
