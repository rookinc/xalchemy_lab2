#!/usr/bin/env python3
import json
import sys

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def edge_key(u, v):
    return (u, v) if u < v else (v, u)

def main():
    cocycle_path = sys.argv[1]
    cocycle = load_json(cocycle_path)

    edges = [tuple(item["edge"]) for item in cocycle["edge_cocycle"]]
    values = {edge_key(*item["edge"]): item["value"] for item in cocycle["edge_cocycle"]}

    vertices = sorted({v for e in edges for v in e})
    n = len(vertices)

    best = None
    best_supports = []

    for mask in range(1 << (n - 1)):
        tau = {vertices[0]: 0}
        for i, v in enumerate(vertices[1:]):
            tau[v] = (mask >> i) & 1

        switched = {}
        for u, v in edges:
            k = edge_key(u, v)
            switched[k] = (values[k] + tau[u] + tau[v]) % 2

        support = sorted([list(k) for k, val in switched.items() if val == 1])
        w = len(support)

        if best is None or w < best:
            best = w
            best_supports = [support]
        elif w == best:
            best_supports.append(support)

    # dedupe supports
    unique = []
    seen = set()
    for supp in best_supports:
        key = tuple(tuple(x) for x in supp)
        if key not in seen:
            seen.add(key)
            unique.append(supp)

    result = {
        "claim_id": "C3",
        "status": "pass" if best == 6 else "fail",
        "details": {
            "minimal_support_size": best,
            "expected_minimal_support_size": 6,
            "number_of_distinct_minimal_supports": len(unique),
            "sample_minimal_support": unique[0] if unique else []
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
