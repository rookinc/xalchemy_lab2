#!/usr/bin/env python3
import json

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]

wings = {
    "B1": list(range(6, 11)),
    "B2": list(range(11, 16)),
    "B3": list(range(16, 21)),
}

# rows excluding anchors A0,A1,A2
rows = [3,4,5,6,7,8,9,10,11,12,13,14]

for bname, idxs in wings.items():
    print("=" * 72)
    print(bname)
    for j in idxs:
        sig = [M[r][j] for r in rows]
        print(f"col {j:2d}: {sig}")
    print()
