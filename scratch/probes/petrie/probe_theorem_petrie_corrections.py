#!/usr/bin/env python3
import json
from collections import Counter

def norm_edge(u, v):
    return (u, v) if u <= v else (v, u)

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

with open("theorem/cocycle_data.json", "r", encoding="utf-8") as f:
    coc = json.load(f)

with open("theorem_petrie_probe.json", "r", encoding="utf-8") as f:
    probe = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]

# theorem edge order from Q
edges = []
for i in range(len(Q)):
    for j in range(i + 1, len(Q)):
        if Q[i][j] == 9:
            edges.append((i, j))
edges = sorted(edges)
edge_index = {e: k for k, e in enumerate(edges)}
index_edge = {k: e for e, k in edge_index.items()}

# cocycle values on theorem edges
edge_coc = {}
for row in coc["edge_cocycle"]:
    e = norm_edge(*row["edge"])
    edge_coc[e] = row["value"]   # 0 parallel, 1 crossed

# theorem row supports
row_supports = []
for i in range(len(M)):
    row_supports.append(set(j for j, v in enumerate(M[i]) if v == 1))

print("ROOTED 5-CYCLE CORRECTION PROBE")
print()

miss_sign_hist = Counter()
extra_sign_hist = Counter()
miss_edge_hist = Counter()

for row in probe["rows"]:
    root = row["root"]
    rooted = set(row["edge_ids"])
    theorem = row_supports[root]

    missed = sorted(theorem - rooted)
    extra = sorted(rooted - theorem)

    print(f"root {root:2d}")
    print(f"  missed ids : {missed}")
    print(f"  extra ids  : {extra}")

    miss_edges = [index_edge[i] for i in missed]
    extra_edges = [index_edge[i] for i in extra]

    print(f"  missed edges: {miss_edges}")
    print(f"  extra edges : {extra_edges}")

    ms = [edge_coc[e] for e in miss_edges]
    es = [edge_coc[e] for e in extra_edges]

    print(f"  missed signs: {ms}")
    print(f"  extra signs : {es}")
    print()

    for e in miss_edges:
        miss_sign_hist[edge_coc[e]] += 1
        miss_edge_hist[e] += 1
    for e in extra_edges:
        extra_sign_hist[edge_coc[e]] += 1

print("aggregate missed sign histogram:", dict(sorted(miss_sign_hist.items())))
print("aggregate extra sign histogram :", dict(sorted(extra_sign_hist.items())))
print()
print("most common missed edges:")
for e, c in miss_edge_hist.most_common(15):
    print(f"  {e}: {c}")
