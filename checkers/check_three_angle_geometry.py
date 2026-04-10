#!/usr/bin/env python3
import json
import sys
from fractions import Fraction

def load_object(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_M(obj):
    if "M" in obj:
        return obj["M"]
    if "matrix_M" in obj:
        return obj["matrix_M"]
    raise KeyError("Could not find M in theorem object.")

def mat_mul(A, B):
    n = len(A)
    k = len(B)
    m = len(B[0])
    out = [[0] * m for _ in range(n)]
    for i in range(n):
        for j in range(m):
            s = 0
            for t in range(k):
                s += A[i][t] * B[t][j]
            out[i][j] = s
    return out

def transpose(A):
    return [list(row) for row in zip(*A)]

def mean_vector(rows):
    n = len(rows)
    m = len(rows[0])
    return [Fraction(sum(rows[i][j] for i in range(n)), n) for j in range(m)]

def center_rows(M):
    mu = mean_vector(M)
    centered = []
    for row in M:
        centered.append([Fraction(x) - mu[j] for j, x in enumerate(row)])
    return centered

def dot(u, v):
    return sum(u[i] * v[i] for i in range(len(u)))

def gram(rows):
    n = len(rows)
    G = [[Fraction(0) for _ in range(n)] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            G[i][j] = dot(rows[i], rows[j])
    return G

def main():
    path = sys.argv[1]
    obj = load_object(path)
    M = extract_M(obj)

    C = center_rows(M)
    Gc = gram(C)

    norms = [Gc[i][i] for i in range(len(Gc))]
    same_norm = all(x == norms[0] for x in norms)
    norm = norms[0]

    values = set()
    for i in range(len(Gc)):
        for j in range(len(Gc)):
            if i != j:
                values.add(Gc[i][j] / norm)

    observed = sorted(str(v) for v in values)
    expected_set = {
        Fraction(37, 112),
        Fraction(-23, 112),
        Fraction(-38, 112),
    }
    expected = sorted(str(v) for v in expected_set)

    ok = same_norm and values == expected_set

    result = {
        "claim_id": "T10",
        "status": "pass" if ok else "fail",
        "details": {
            "common_centered_norm": str(norm),
            "same_norm": same_norm,
            "observed_normalized_inner_products": observed,
            "expected_normalized_inner_products": expected
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
