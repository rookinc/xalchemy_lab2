#!/usr/bin/env python3
import json
from collections import defaultdict

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]

blocks = {
    "B0": list(range(0, 6)),
    "B1": list(range(6, 11)),
    "B2": list(range(11, 16)),
    "B3": list(range(16, 21)),
    "B4": list(range(21, 30)),
}

species = {
    "A0": [0],
    "A1": [1],
    "A2": [2],
    "F0": [3, 6],
    "F1": [4, 9],
    "F2": [7, 10],
    "C2": [5, 12],
    "C1": [8, 13],
    "C0": [11, 14],
}

row_sets = {}
for i, row in enumerate(M):
    row_sets[i] = {j for j, v in enumerate(row) if v == 1}

for name, rows in species.items():
    print("=" * 72)
    print(name, "rows =", rows)

    union = set()
    inter = None
    for r in rows:
        s = row_sets[r]
        union |= s
        inter = s if inter is None else (inter & s)

    print("union size:", len(union))
    print("intersection size:", len(inter))
    print("symmetric diff size:", len(union - inter))
    print()

    for bname, cols in blocks.items():
        cols = set(cols)
        inter_b = sorted(inter & cols)
        union_b = sorted(union & cols)
        swing_b = sorted((union - inter) & cols)
        print(f"{bname}:")
        print("  core :", inter_b)
        print("  swing:", swing_b)
        print("  union:", union_b)
    print()
