#!/usr/bin/env python3
import json

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

cols = th["columns"]
for j, c in enumerate(cols):
    print(f"col {j:2d}: {c}")
