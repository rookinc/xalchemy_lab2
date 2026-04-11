#!/usr/bin/env python3
import json

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
    "F0+": [3],
    "F0-": [6],
    "F1+": [4],
    "F1-": [9],
    "F2+": [7],
    "F2-": [10],
    "C2+": [5],
    "C2-": [12],
    "C1+": [8],
    "C1-": [13],
    "C0+": [11],
    "C0-": [14],
}

for bname, cols in blocks.items():
    print("=" * 72)
    print(bname)
    for j in cols:
        sig = []
        for sname, rows in species.items():
            r = rows[0]
            sig.append((sname, M[r][j]))
        print(f"col {j:2d}: {sig}")
    print()
