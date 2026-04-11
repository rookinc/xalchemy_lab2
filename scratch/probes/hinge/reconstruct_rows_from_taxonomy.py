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

def hinge_subset(row):
    return tuple(h for h in hinges if row[h] == 1)

def block_vec(row):
    return tuple(sum(row[j] for j in B) for B in blocks)

taxonomy_groups = defaultdict(list)

for i, row in enumerate(M):
    h = hinge_subset(row)
    bv = block_vec(row)
    taxonomy_groups[(h, bv)].append((i, species_name[i]))

print("taxonomy groups keyed by (hinge subset, block vector):")
print()

for key, rows in sorted(taxonomy_groups.items()):
    h, bv = key
    print(f"hinges={h}  blocks={bv}")
    for i, name in rows:
        print(f"  row {i:2d}  {name}")
    print()

print("summary:")
for key, rows in sorted(taxonomy_groups.items()):
    label = "unique" if len(rows) == 1 else "partner-pair"
    print(f"{key} -> {label}")
