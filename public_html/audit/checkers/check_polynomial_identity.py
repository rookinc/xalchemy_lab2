#!/usr/bin/env python3
import json
import sys

def load_object(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_Q(obj):
    if "Q" in obj:
        return obj["Q"]
    if "gram_Q" in obj:
        return obj["gram_Q"]
    raise KeyError("Could not find Q in theorem object.")

def zero_matrix(n):
    return [[0] * n for _ in range(n)]

def identity_matrix(n):
    I = zero_matrix(n)
    for i in range(n):
        I[i][i] = 1
    return I

def mat_add(A, B):
    n = len(A)
    m = len(A[0])
    return [[A[i][j] + B[i][j] for j in range(m)] for i in range(n)]

def scalar_mul(c, A):
    n = len(A)
    m = len(A[0])
    return [[c * A[i][j] for j in range(m)] for i in range(n)]

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

def build_A_from_Q(Q, overlap=9):
    n = len(Q)
    A = zero_matrix(n)
    for i in range(n):
        for j in range(n):
            if i != j and Q[i][j] == overlap:
                A[i][j] = 1
    return A

def mismatch_list(A, B, limit=20):
    out = []
    for i in range(len(A)):
        for j in range(len(A[0])):
            if A[i][j] != B[i][j]:
                out.append({
                    "row": i,
                    "col": j,
                    "lhs": A[i][j],
                    "rhs": B[i][j]
                })
                if len(out) >= limit:
                    return out
    return out

def main():
    path = sys.argv[1]
    obj = load_object(path)
    Q = extract_Q(obj)

    n = len(Q)
    A = build_A_from_Q(Q, overlap=9)
    I = identity_matrix(n)

    A2 = mat_mul(A, A)
    A3 = mat_mul(A2, A)

    rhs = mat_add(mat_add(A3, scalar_mul(2, A2)), scalar_mul(2, I))

    ok = (Q == rhs)
    mismatches = mismatch_list(Q, rhs)

    result = {
        "claim_id": "T9",
        "status": "pass" if ok else "fail",
        "details": {
            "identity": "Q = A^3 + 2A^2 + 2I",
            "adjacency_rule": "A[i][j] = 1 iff i != j and Q[i][j] == 9",
            "mismatch_count": 0 if ok else sum(
                1 for i in range(n) for j in range(n) if Q[i][j] != rhs[i][j]
            ),
            "sample_mismatches": mismatches
        }
    }
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
