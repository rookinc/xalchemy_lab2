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

    rows = len(M)
    cols = len(M[0]) if M else 0
    rectangular = all(len(row) == cols for row in M)

    result = {
        "claim_id": "T1",
        "status": "pass" if rectangular and rows == 15 and cols == 30 else "fail",
        "details": {
            "rows": rows,
            "cols": cols,
            "rectangular": rectangular
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
