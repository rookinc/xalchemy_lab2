#!/usr/bin/env python3
import json

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

for i, row in enumerate(M):
    counts = []
    for B in blocks:
        counts.append(sum(row[j] for j in B))
    print(f"row {i}: {counts}")
