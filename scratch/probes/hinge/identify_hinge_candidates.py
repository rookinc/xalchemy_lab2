#!/usr/bin/env python3
import json
from collections import Counter

with open("species_core_swap_decomposition.json", "r", encoding="utf-8") as f:
    data = json.load(f)

core_count = Counter()

for name, payload in data.items():
    for j in payload["core"]:
        core_count[j] += 1

print("columns by number of species-cores they belong to:")
for j, c in sorted(core_count.items(), key=lambda x: (-x[1], x[0])):
    print(f"col {j:2d}: core_count={c}")
