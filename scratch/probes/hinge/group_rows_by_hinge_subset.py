#!/usr/bin/env python3
import json
from collections import defaultdict

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

groups = defaultdict(list)

for i, row in enumerate(M):
    h = tuple(x for x in hinges if row[x] == 1)
    block_vec = tuple(sum(row[j] for j in B) for B in blocks)
    groups[h].append((i, species_name[i], block_vec))

for h, rows in sorted(groups.items()):
    print("=" * 72)
    print("hinges:", h)
    for i, name, vec in rows:
        print(f"  row {i:2d}  {name:>3}  blocks={vec}")
