#!/usr/bin/env python3
import json

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]

hinges = [10, 14, 18]
blocks = [
    range(0, 6),
    range(6, 11),
    range(11, 16),
    range(16, 21),
    range(21, 30),
]

species_name = {
    0: "A0",
    1: "A1",
    2: "A2",
    3: "F0+",
    6: "F0-",
    4: "F1+",
    9: "F1-",
    7: "F2+",
    10: "F2-",
    5: "C2+",
    12: "C2-",
    8: "C1+",
    13: "C1-",
    11: "C0+",
    14: "C0-",
}

for i, row in enumerate(M):
    support = [j for j, v in enumerate(row) if v == 1]
    block_vec = [sum(row[j] for j in B) for B in blocks]
    h = [x for x in hinges if row[x] == 1]
    print(
        f"row {i:2d}  {species_name[i]:>3}  "
        f"hinges={h}  hcount={len(h)}  "
        f"blocks={block_vec}  support={support}"
    )
