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

    row_sums = [sum(row) for row in M]
    col_sums = [sum(M[i][j] for i in range(len(M))) for j in range(len(M[0]))]

    rows_ok = all(x == 14 for x in row_sums)
    cols_ok = all(x == 7 for x in col_sums)

    result = {
        "claims": [
            {
                "claim_id": "T2",
                "status": "pass" if rows_ok else "fail",
                "details": {
                    "row_sums": row_sums
                }
            },
            {
                "claim_id": "T3",
                "status": "pass" if cols_ok else "fail",
                "details": {
                    "col_sums": col_sums
                }
            }
        ]
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
