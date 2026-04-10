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

def extract_Q(obj):
    if "Q" in obj:
        return obj["Q"]
    if "gram_Q" in obj:
        return obj["gram_Q"]
    raise KeyError("Could not find Q in theorem object.")

def mmT(M):
    rows = len(M)
    cols = len(M[0])
    out = [[0] * rows for _ in range(rows)]
    for i in range(rows):
        for j in range(rows):
            s = 0
            for k in range(cols):
                s += M[i][k] * M[j][k]
            out[i][j] = s
    return out

def main():
    path = sys.argv[1]
    obj = load_object(path)
    M = extract_M(obj)
    Q = extract_Q(obj)
    calc = mmT(M)

    mismatches = []
    for i in range(len(Q)):
        for j in range(len(Q[0])):
            if Q[i][j] != calc[i][j]:
                mismatches.append({
                    "row": i,
                    "col": j,
                    "expected": calc[i][j],
                    "actual": Q[i][j]
                })

    result = {
        "claim_id": "T4",
        "status": "pass" if not mismatches else "fail",
        "details": {
            "mismatch_count": len(mismatches),
            "mismatches": mismatches[:20]
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
