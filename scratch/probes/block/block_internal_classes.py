#!/usr/bin/env python3
import json
from collections import defaultdict

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]
cols = th["columns"]

blocks = {
    "B0": list(range(0, 6)),
    "B1": list(range(6, 11)),
    "B2": list(range(11, 16)),
    "B3": list(range(16, 21)),
    "B4": list(range(21, 30)),
}

species = [
    ("A0", 0),
    ("A1", 1),
    ("A2", 2),
    ("F0+", 3),
    ("F0-", 6),
    ("F1+", 4),
    ("F1-", 9),
    ("F2+", 7),
    ("F2-", 10),
    ("C2+", 5),
    ("C2-", 12),
    ("C1+", 8),
    ("C1-", 13),
    ("C0+", 11),
    ("C0-", 14),
]

for bname, idxs in blocks.items():
    classes = defaultdict(list)
    for j in idxs:
        sig = tuple(M[r][j] for _, r in species)
        classes[sig].append(j)

    print("=" * 72)
    print(bname)
    print(f"columns: {idxs}")
    print(f"class count: {len(classes)}")
    print()

    for k, (sig, js) in enumerate(sorted(classes.items(), key=lambda kv: kv[1])):
        on = [name for (name, _), bit in zip(species, sig) if bit == 1]
        print(f"class {k}: cols={js}")
        print(f"  on-species: {on}")
        print(f"  supports:")
        for j in js:
            print(f"    col {j:2d}: {cols[j]}")
        print()
