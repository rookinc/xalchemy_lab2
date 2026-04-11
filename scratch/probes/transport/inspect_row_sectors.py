#!/usr/bin/env python3
import json
from collections import Counter

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]

n = len(M)
m = len(M[0])

row_supports = []
for i in range(n):
    supp = tuple(j for j in range(m) if M[i][j] == 1)
    row_supports.append(supp)

print("rows:", n)
print("cols:", m)
print("row sizes:", Counter(len(s) for s in row_supports))
print()

# reconstruct graph from Q off-diagonal 9
edges = []
dist1 = set()
for i in range(n):
    for j in range(i+1, n):
        if Q[i][j] == 9:
            edges.append((i,j))
            dist1.add((i,j))

print("graph edges from Q==9:", len(edges))
print()

# compare row intersections to Q directly
ok = True
profile = Counter()
for i in range(n):
    for j in range(i, n):
        inter = len(set(row_supports[i]) & set(row_supports[j]))
        profile[(Q[i][j], inter)] += 1
        if inter != Q[i][j]:
            ok = False

print("intersection profile (Q-entry, actual intersection size):")
for k, v in sorted(profile.items()):
    print(" ", k, "->", v)

print()
print("row-support intersections exactly reproduce Q?:", ok)
print()

for i in range(min(5, n)):
    print(f"row {i}: {row_supports[i]}")
