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

out = {}

for name, (a, b) in pairs.items():
    A = row_sets[a]
    B = row_sets[b]

    core = sorted(A & B)
    first_only = sorted(A - B)
    second_only = sorted(B - A)
    envelope = sorted(A | B)

    by_block = {}
    for blk, cols in blocks.items():
        by_block[blk] = {
            "core": sorted((A & B) & cols),
            "first_only": sorted((A - B) & cols),
            "second_only": sorted((B - A) & cols),
            "envelope": sorted((A | B) & cols),
        }

    out[name] = {
        "rows": [a, b],
        "core": core,
        "first_only": first_only,
        "second_only": second_only,
        "envelope": envelope,
        "core_size": len(core),
        "swap_size_each_side": len(first_only),
        "envelope_size": len(envelope),
        "by_block": by_block,
    }

print(json.dumps(out, indent=2))
