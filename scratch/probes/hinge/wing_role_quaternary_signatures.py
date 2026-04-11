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

pairs = [
    ("F0", (3, 6)),
    ("F1", (4, 9)),
    ("F2", (7, 10)),
    ("C2", (5, 12)),
    ("C1", (8, 13)),
    ("C0", (11, 14)),
]

def pair_state(a, b):
    if a == 0 and b == 0:
        return "0"
    if a == 1 and b == 0:
        return "+"
    if a == 0 and b == 1:
        return "-"
    return "*"

for bname, cols in wings.items():
    print("=" * 72)
    print(bname)
    for j in cols:
        sig = []
        for name, (r1, r2) in pairs:
            sig.append(f"{name}:{pair_state(M[r1][j], M[r2][j])}")
        print(f"col {j:2d}: {' | '.join(sig)}")
    print()
