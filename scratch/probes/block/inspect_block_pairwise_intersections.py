#!/usr/bin/env python3
import json
from collections import Counter

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

cols = [set(c) for c in th["columns"]]

blocks = {
    "B0_none": list(range(0, 6)),
    "B1_only2": list(range(6, 11)),
    "B2_only1": list(range(11, 16)),
    "B3_only0": list(range(16, 21)),
    "B4_all012": list(range(21, 30)),
}

names = list(blocks.keys())

for a in names:
    for b in names:
        hist = Counter()
        for i in blocks[a]:
            for j in blocks[b]:
                if a == b and j <= i:
                    continue
                hist[len(cols[i] & cols[j])] += 1
        print(f"{a} vs {b}: {dict(sorted(hist.items()))}")
    print()
