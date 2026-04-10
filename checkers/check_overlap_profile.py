#!/usr/bin/env python3
import json
import sys
from collections import Counter

TARGET = {4: 15, 5: 60, 9: 30}

def load_object(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_Q(obj):
    if "Q" in obj:
        return obj["Q"]
    if "gram_Q" in obj:
        return obj["gram_Q"]
    raise KeyError("Could not find Q in theorem object.")

def main():
    path = sys.argv[1]
    obj = load_object(path)
    Q = extract_Q(obj)

    counts = Counter()
    n = len(Q)
    for i in range(n):
        for j in range(i + 1, n):
            counts[Q[i][j]] += 1

    observed = dict(sorted(counts.items()))
    ok = observed == TARGET

    result = {
        "claim_id": "T5",
        "status": "pass" if ok else "fail",
        "details": {
            "observed": observed,
            "expected": TARGET
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
