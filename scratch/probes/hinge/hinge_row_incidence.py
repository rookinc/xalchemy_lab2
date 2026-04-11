#!/usr/bin/env python3
import json

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

M = th["matrix_M"]
hinges = [10, 14, 18]

print("hinge columns:", hinges)
print()

for i, row in enumerate(M):
    present = [h for h in hinges if row[h] == 1]
    print(f"row {i:2d}: hinge_count={len(present)} hinges={present}")
