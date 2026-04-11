#!/usr/bin/env python3
import json

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]

blocks = {
    "B0": set(range(0, 6)),
    "B1": set(range(6, 11)),
    "B2": set(range(11, 16)),
    "B3": set(range(16, 21)),
    "B4": set(range(21, 30)),
}

pairs = {
    "F0": (3, 6),
    "F1": (4, 9),
    "F2": (7, 10),
    "C2": (5, 12),
    "C1": (8, 13),
    "C0": (11, 14),
}

row_sets = {}
for i, row in enumerate(M):
    row_sets[i] = {j for j, v in enumerate(row) if v == 1}

for name, (a, b) in pairs.items():
    A = row_sets[a]
    B = row_sets[b]
    only_a = sorted(A - B)
    only_b = sorted(B - A)

    print("=" * 72)
    print(f"{name}: rows {a} vs {b}")
    print("only in first :", only_a)
    print("only in second:", only_b)
    print()

    for blk, cols in blocks.items():
        xa = sorted((A - B) & cols)
        xb = sorted((B - A) & cols)
        if xa or xb:
            print(f"{blk}: first-only={xa} second-only={xb}")
    print()
