#!/usr/bin/env python3
import json
from collections import Counter, defaultdict

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]

n = len(Q)
m = len(M[0])

# ---------- G15 edges from Q ----------
g15_edges = []
nbr = {i: set() for i in range(n)}
for i in range(n):
    for j in range(i + 1, n):
        if Q[i][j] == 9:
            g15_edges.append((i, j))
            nbr[i].add(j)
            nbr[j].add(i)

assert len(g15_edges) == 30

# ---------- Column supports ----------
col_supports = []
for j in range(m):
    supp = tuple(i for i in range(n) if M[i][j] == 1)
    col_supports.append(set(supp))

assert len(col_supports) == 30
assert all(len(s) == 7 for s in col_supports)

# ---------- Intersection profile of columns ----------
profile = Counter()
pairs = []
for a in range(m):
    for b in range(a + 1, m):
        inter = len(col_supports[a] & col_supports[b])
        profile[inter] += 1
        pairs.append((a, b, inter))

print("Column-column support intersection profile:")
for k, v in sorted(profile.items()):
    print(f"  {k}: {v}")
print()

# ---------- True line graph profile from G15 ----------
# In L(G15), two edges are adjacent iff they share one endpoint.
lg_profile = Counter()
edge_pairs = []
for i, e1 in enumerate(g15_edges):
    s1 = set(e1)
    for j, e2 in enumerate(g15_edges):
        if j <= i:
            continue
        share = len(s1 & set(e2))
        lg_profile[share] += 1
        edge_pairs.append((i, j, share))

print("G15 edge-pair shared-endpoint profile:")
for k, v in sorted(lg_profile.items()):
    print(f"  share {k}: {v}")
print()

# ---------- Candidate thresholds ----------
# We expect one intersection value on columns to occur exactly 90 times,
# because L(G15) has 30 vertices of degree 6, so number of adjacencies = 30*6/2 = 90.
candidates = [k for k, v in profile.items() if v == 90]

print("Candidate column intersection values with multiplicity 90:", candidates)
print()

for t in candidates:
    # Build candidate column graph H_t: columns adjacent if support intersection == t
    H_edges = set()
    deg = [0]*m
    for a, b, inter in pairs:
        if inter == t:
            H_edges.add((a, b))
            deg[a] += 1
            deg[b] += 1

    deg_profile = Counter(deg)
    print(f"Testing threshold t = {t}")
    print("  number of edges:", len(H_edges))
    print("  degree profile:", dict(sorted(deg_profile.items())))

    # degree 6 regular on 30 vertices is what L(G15) should have
    if len(H_edges) == 90 and deg_profile == Counter({6: 30}):
        print("  *** This has the right size/profile to be a candidate line graph. ***")
    print()

print("Done.")
