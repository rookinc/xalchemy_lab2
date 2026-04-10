#!/usr/bin/env python3
import json
import sys

def load_object(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_M(obj):
    if "M" in obj:
        return obj["M"]
    if "matrix_M" in obj:
        return obj["matrix_M"]
    raise KeyError("Could not find M in theorem object.")

def main():
    path = sys.argv[1]
    obj = load_object(path)
    M = extract_M(obj)

    bad = []
    for i, row in enumerate(M):
        for j, val in enumerate(row):
            if val not in (0, 1):
                bad.append({"row": i, "col": j, "value": val})

    result = {
        "claim_id": "T1.binary",
        "status": "pass" if not bad else "fail",
        "details": {
            "bad_entries": bad[:20],
            "bad_entry_count": len(bad)
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
