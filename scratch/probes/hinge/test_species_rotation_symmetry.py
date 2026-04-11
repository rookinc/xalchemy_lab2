#!/usr/bin/env python3
import json

with open("species_core_swap_decomposition.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# block rotation on the three one-anchor wings:
# B1 -> B2 -> B3 -> B1
rot_block = {
    "B0": "B0",
    "B1": "B2",
    "B2": "B3",
    "B3": "B1",
    "B4": "B4",
}

def rotate_blocks(by_block):
    out = {}
    for b_src, payload in by_block.items():
        b_dst = rot_block[b_src]
        out[b_dst] = payload
    return out

def brief(x):
    return {
        b: {
            "core": v["core"],
            "first_only": v["first_only"],
            "second_only": v["second_only"],
            "envelope": v["envelope"],
        }
        for b, v in x.items()
    }

for fam in [("C2", "C1"), ("C1", "C0"), ("F0", "F1"), ("F1", "F2")]:
    a, b = fam
    ra = rotate_blocks(data[a]["by_block"])
    print("=" * 72)
    print(f"{a} rotated vs {b}")
    print("rotated", a)
    print(json.dumps(brief(ra), indent=2))
    print("actual ", b)
    print(json.dumps(brief(data[b]["by_block"]), indent=2))
