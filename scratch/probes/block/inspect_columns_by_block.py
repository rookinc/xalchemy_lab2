#!/usr/bin/env python3
import json

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
    print(name)
    for j in B:
        print(f"  col {j:2d}: {cols[j]}")
    print()
