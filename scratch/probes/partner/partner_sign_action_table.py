#!/usr/bin/env python3
import json

with open("species_core_swap_decomposition.json", "r", encoding="utf-8") as f:
    data = json.load(f)

order = ["F0", "F1", "F2", "C2", "C1", "C0"]

for name in order:
    d = data[name]
    print("=" * 72)
    print(name, "rows", d["rows"])
    print("core       :", d["core"])
    print("first_only :", d["first_only"])
    print("second_only:", d["second_only"])
    print("envelope   :", d["envelope"])
    print()
    for blk, x in d["by_block"].items():
        print(
            f"{blk}: core={x['core']} | +only={x['first_only']} | -only={x['second_only']}"
        )
    print()
