#!/usr/bin/env python3
import json
from collections import defaultdict

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]

blocks = [
    range(0, 6),
    range(6, 11),
    range(11, 16),
    range(16, 21),
    range(21, 30),
]

classes = defaultdict(list)

for i, row in enumerate(M):
    vec = tuple(sum(row[j] for j in B) for B in blocks)
    classes[vec].append(i)

print("row block classes:")
for vec, rows in sorted(classes.items()):
    print(vec, "->", rows)
