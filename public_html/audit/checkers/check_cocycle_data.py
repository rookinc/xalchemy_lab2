#!/usr/bin/env python3
import json
import sys
from collections import Counter

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_Q(obj):
    if "Q" in obj:
        return obj["Q"]
    if "gram_Q" in obj:
        return obj["gram_Q"]
    raise KeyError("Could not find Q in theorem object.")

def build_edges_from_Q(Q, overlap=9):
    n = len(Q)
    edges = []
    for i in range(n):
        for j in range(i + 1, n):
            if Q[i][j] == overlap:
                edges.append((i, j))
    return edges

def main():
    theorem_path = sys.argv[1]
    cocycle_path = sys.argv[2]

    obj = load_json(theorem_path)
    cocycle = load_json(cocycle_path)

    Q = extract_Q(obj)
    graph_edges = sorted(build_edges_from_Q(Q))
    cocycle_edges = sorted(tuple(item["edge"]) for item in cocycle["edge_cocycle"])

    counts = Counter(item["value"] for item in cocycle["edge_cocycle"])
    ok_edges = (graph_edges == cocycle_edges)
    ok_counts = (counts.get(0, 0) == 10 and counts.get(1, 0) == 20)

    result = {
        "claims": [
            {
                "claim_id": "C1",
                "status": "pass" if ok_edges else "fail",
                "details": {
                    "edge_count_graph": len(graph_edges),
                    "edge_count_cocycle": len(cocycle_edges),
                    "edge_sets_match": ok_edges
                }
            },
            {
                "claim_id": "C2",
                "status": "pass" if ok_counts else "fail",
                "details": {
                    "parallel_count": counts.get(0, 0),
                    "crossed_count": counts.get(1, 0),
                    "expected_parallel": 10,
                    "expected_crossed": 20
                }
            }
        ]
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
