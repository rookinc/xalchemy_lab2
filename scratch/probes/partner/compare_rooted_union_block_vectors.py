#!/usr/bin/env python3
import json

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

with open("theorem_petrie_probe.json", "r", encoding="utf-8") as f:
    probe = json.load(f)

M = th["matrix_M"]

blocks = [
    range(0, 6),
    range(6, 11),
    range(11, 16),
    range(16, 21),
    range(21, 30),
]

# theorem row block vectors
theorem_block = []
for i, row in enumerate(M):
    counts = [sum(row[j] for j in B) for B in blocks]
    theorem_block.append(counts)

print("root | rooted-union block vector | theorem row block vector")
print("-" * 60)

for row in probe["rows"]:
    r = row["root"]
    supp = set(row["edge_ids"])
    rooted_counts = [sum(1 for j in B if j in supp) for B in blocks]
    print(f"{r:>4} | {rooted_counts} | {theorem_block[r]}")
