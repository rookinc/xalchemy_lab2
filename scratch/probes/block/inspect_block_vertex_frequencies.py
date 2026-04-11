#!/usr/bin/env python3
import json
from collections import Counter

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

cols = th["columns"]

blocks = {
    "B0_none": range(0, 6),
    "B1_only2": range(6, 11),
    "B2_only1": range(11, 16),
    "B3_only0": range(16, 21),
    "B4_all012": range(21, 30),
}

for name, B in blocks.items():
    c = Counter()
    for j in B:
        for v in cols[j]:
            c[v] += 1
    print(name)
    for v in range(15):
        print(f"  {v}: {c[v]}")
    print()
