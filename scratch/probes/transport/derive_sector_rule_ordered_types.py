#!/usr/bin/env python3
import json
from collections import Counter, defaultdict
from itertools import combinations

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]

n = len(Q)

# build G15
edges = []
for i in range(n):
    for j in range(i + 1, n):
        if Q[i][j] == 9:
            edges.append((i, j))

# distances
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

# actual column supports
actual_supports = []
for j in range(len(M[0])):
    supp = tuple(i for i in range(len(M)) if M[i][j] == 1)
    actual_supports.append(supp)
actual_multiset = Counter(actual_supports)

# ordered types
all_types = set()
edge_types_by_vertex = {x: {} for x in range(n)}
for x in range(n):
    for e in edges:
        u, v = e
        t = (dist[x][u], dist[x][v])   # ordered now
        edge_types_by_vertex[x][e] = t
        all_types.add(t)

all_types = sorted(all_types)

print("Ordered edge-types that occur:")
for t in all_types:
    print(" ", t)
print()

def supports_from_type_subset(T):
    T = set(T)
    row_sectors = []
    for x in range(n):
        selected = [e for e in edges if edge_types_by_vertex[x][e] in T]
        row_sectors.append(selected)

    row_sizes = [len(s) for s in row_sectors]
    if len(set(row_sizes)) != 1:
        return None, Counter(row_sizes), None

    edge_to_vertices = {}
    for e in edges:
        supp = tuple(sorted(x for x in range(n) if e in row_sectors[x]))
        edge_to_vertices[e] = supp

    derived_supports = list(edge_to_vertices.values())
    derived_multiset = Counter(derived_supports)
    return row_sectors, Counter(row_sizes), derived_multiset

print("Testing all subsets of ordered edge-types...\n")

found = False
for r in range(1, len(all_types) + 1):
    for subset in combinations(all_types, r):
        row_sectors, row_size_counter, derived_multiset = supports_from_type_subset(subset)
        if row_sectors is None:
            continue
        if row_size_counter != Counter({14: n}):
            continue

        exact = (derived_multiset == actual_multiset)
        print("RULE subset:", subset)
        print("  row sizes:", dict(row_size_counter))
        print("  exact column-support multiset match:", exact)
        print()

        if exact:
            found = True
            edge_to_vertices = {}
            for e in edges:
                supp = tuple(sorted(
                    x for x in range(n)
                    if edge_types_by_vertex[x][e] in set(subset)
                ))
                edge_to_vertices[e] = supp

            support_to_cols = defaultdict(list)
            for j, supp in enumerate(actual_supports, start=1):
                support_to_cols[supp].append(j)

            used = set()
            assignment = []
            for e in sorted(edges):
                supp = edge_to_vertices[e]
                col = next(c for c in support_to_cols[supp] if c not in used)
                used.add(col)
                assignment.append({"edge": list(e), "column": col, "support": list(supp)})

            out = {
                "rule_types": [list(t) for t in subset],
                "assignment": assignment
            }
            with open("edge_column_bridge.json", "w", encoding="utf-8") as f:
                json.dump(out, f, indent=2)
            print("*** EXACT RULE FOUND ***")
            print("wrote edge_column_bridge.json\n")

if not found:
    print("No exact ordered-type-subset rule found.")
