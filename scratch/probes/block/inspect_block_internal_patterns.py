#!/usr/bin/env python3
import json
from collections import defaultdict

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

cols = th["columns"]

blocks = {
    "B0": list(range(0, 6)),
    "B1": list(range(6, 11)),
    "B2": list(range(11, 16)),
    "B3": list(range(16, 21)),
    "B4": list(range(21, 30)),
}

for name, idxs in blocks.items():
    print("=" * 72)
    print(name)
    for j in idxs:
        print(f"col {j:2d}: {cols[j]}")
    print()
    print("pairwise intersections:")
    for a in range(len(idxs)):
        for b in range(a+1, len(idxs)):
            i, k = idxs[a], idxs[b]
            inter = len(set(cols[i]) & set(cols[k]))
            print(f"  ({i},{k}) -> {inter}")
    print()
