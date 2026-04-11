#!/usr/bin/env python3
import json

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]

row_supports = []
for i, row in enumerate(M):
    supp = [j for j, v in enumerate(row) if v == 1]
    row_supports.append(supp)
    print(f"row {i}: size={len(supp)} cols={supp}")
