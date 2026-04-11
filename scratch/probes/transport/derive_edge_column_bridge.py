#!/usr/bin/env python3
import json
from collections import defaultdict, Counter

# ---------- load ----------
with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]
columns = [tuple(col) for col in th["columns"]]   # 30 supports, each size 7

n = len(Q)

# ---------- graph from Q ----------
edges = []
nbr = {i: set() for i in range(n)}
for i in range(n):
    for j in range(i + 1, n):
        if Q[i][j] == 9:
            edges.append((i, j))
            nbr[i].add(j)
            nbr[j].add(i)

assert len(edges) == 30, f"Expected 30 edges, got {len(edges)}"

# ---------- actual column supports from M ----------
# convert matrix columns to 7-sets of row indices where entry=1
actual_supports = []
for j in range(len(M[0])):
    supp = tuple(i for i in range(len(M)) if M[i][j] == 1)
    actual_supports.append(supp)

assert len(actual_supports) == 30
assert all(len(s) == 7 for s in actual_supports), "Not all columns have weight 7"

actual_multiset = Counter(actual_supports)

print("Loaded:")
print("  vertices:", n)
print("  edges:", len(edges))
print("  columns:", len(actual_supports))
print()

# ---------- distance matrix ----------
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
        row_i = dist[i]
        row_k = dist[k]
        for j in range(n):
            cand = dik + row_k[j]
            if cand < row_i[j]:
                row_i[j] = cand

# ---------- candidate rules ----------
def supp_common_neighbors(u, v):
    return tuple(sorted(nbr[u] & nbr[v]))

def supp_union_closed_nbr(u, v):
    return tuple(sorted((nbr[u] | nbr[v] | {u, v})))

def supp_not_adjacent_to_e(u, v):
    # vertices at distance >=2 from both endpoints
    return tuple(sorted(x for x in range(n) if dist[x][u] >= 2 and dist[x][v] >= 2))

def supp_eqdist_1_2(u, v):
    # one endpoint at dist1, other at dist2 (either way)
    return tuple(sorted(
        x for x in range(n)
        if (dist[x][u], dist[x][v]) in {(1,2), (2,1)}
    ))

def supp_shell_122(u, v):
    # vertices with min distance 1 and max distance 2
    return tuple(sorted(
        x for x in range(n)
        if min(dist[x][u], dist[x][v]) == 1 and max(dist[x][u], dist[x][v]) == 2
    ))

def supp_excluding_endpoints_union(u, v):
    # neighbors of either endpoint, excluding the endpoints
    return tuple(sorted((nbr[u] | nbr[v]) - {u, v}))

def supp_vertices_closer_to_edge_than_far(u, v):
    # heuristic: vertices with dist sum <= 3
    return tuple(sorted(
        x for x in range(n)
        if dist[x][u] + dist[x][v] <= 3
    ))

RULES = {
    "common_neighbors": supp_common_neighbors,
    "union_closed_nbr": supp_union_closed_nbr,
    "not_adjacent_to_e": supp_not_adjacent_to_e,
    "eqdist_1_2": supp_eqdist_1_2,
    "shell_122": supp_shell_122,
    "excluding_endpoints_union": supp_excluding_endpoints_union,
    "dist_sum_le_3": supp_vertices_closer_to_edge_than_far,
}

# ---------- evaluate ----------
print("Testing candidate support rules...")
print()

for name, fn in RULES.items():
    supports = [fn(u, v) for (u, v) in edges]
    sizes = Counter(len(s) for s in supports)
    multiset = Counter(supports)
    exact = (multiset == actual_multiset)

    print(f"RULE: {name}")
    print(f"  size distribution: {dict(sorted(sizes.items()))}")
    print(f"  exact multiset match: {exact}")

    if exact:
        print("  *** EXACT MATCH FOUND ***")
        edge_to_support = {e: fn(*e) for e in edges}
        # build one valid edge->column assignment
        support_to_cols = defaultdict(list)
        for j, supp in enumerate(actual_supports, start=1):
            support_to_cols[supp].append(j)

        used = set()
        assignment = []
        for e in sorted(edges):
            supp = edge_to_support[e]
            # take the first unused matching column
            col = next(c for c in support_to_cols[supp] if c not in used)
            used.add(col)
            assignment.append({"edge": list(e), "column": col, "support": list(supp)})

        out = {
            "rule": name,
            "assignment": assignment
        }
        with open("edge_column_bridge.json", "w", encoding="utf-8") as f:
            json.dump(out, f, indent=2)
        print("  wrote edge_column_bridge.json")
    print()

print("Done.")
