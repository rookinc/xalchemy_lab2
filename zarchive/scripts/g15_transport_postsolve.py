#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from fractions import Fraction

sys.path.insert(0, str(Path("scripts").resolve()))
import g15_transport_search as base

def load_solution(path: Path) -> dict:
    data = json.loads(path.read_text())
    if "matrix" not in data:
        raise ValueError(f"{path} does not contain 'matrix'")
    return data

def matmul(A, B):
    n = len(A)
    m = len(B[0])
    k = len(B)
    out = [[0 for _ in range(m)] for _ in range(n)]
    for i in range(n):
        for t in range(k):
            if A[i][t] == 0:
                continue
            ait = A[i][t]
            for j in range(m):
                out[i][j] += ait * B[t][j]
    return out

def transpose(M):
    return [list(row) for row in zip(*M)]

def identity(n):
    I = [[0]*n for _ in range(n)]
    for i in range(n):
        I[i][i] = 1
    return I

def add(A, B):
    n = len(A); m = len(A[0])
    return [[A[i][j] + B[i][j] for j in range(m)] for i in range(n)]

def scale(c, A):
    n = len(A); m = len(A[0])
    return [[c * A[i][j] for j in range(m)] for i in range(n)]

def equal(A, B):
    if len(A) != len(B) or len(A[0]) != len(B[0]):
        return False
    for i in range(len(A)):
        for j in range(len(A[0])):
            if A[i][j] != B[i][j]:
                return False
    return True

def build_distance_matrices():
    n = base.N_ROWS
    D0 = identity(n)
    D1 = [[0]*n for _ in range(n)]
    D2 = [[0]*n for _ in range(n)]
    D3 = [[0]*n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            d = base.G15_DIST[i][j]
            if d == 1:
                D1[i][j] = 1
            elif d == 2:
                D2[i][j] = 1
            elif d == 3:
                D3[i][j] = 1
    return D0, D1, D2, D3

def compute_Q(M):
    return matmul(M, transpose(M))

def matrix_to_text(M):
    return "\n".join(" ".join(str(x) for x in row) for row in M)

def matrix_to_py_literal(M, name):
    lines = [f"{name} = ["]
    for row in M:
        lines.append("    [" + ", ".join(str(x) for x in row) + "],")
    lines.append("]")
    return "\n".join(lines)

def derive_polynomial_Q_of_A():
    # G15 adjacency matrix A = D1
    D0, D1, D2, D3 = build_distance_matrices()
    A = D1
    A2 = matmul(A, A)
    A3 = matmul(A2, A)

    # We search for Q = c0 I + c1 A + c2 A^2 + c3 A^3
    # Using known exact identity Q = 14 D0 + 9 D1 + 5 D2 + 4 D3
    # Solve coefficients by linear relations using a basis of entries by distance.
    # For the line graph of Petersen:
    # on distance classes d=0,1,2,3 evaluate I,A,A2,A3.
    samples = []
    seen = set()
    for i in range(base.N_ROWS):
        for j in range(base.N_ROWS):
            d = base.G15_DIST[i][j]
            if d not in seen:
                seen.add(d)
                samples.append((i, j, d))
    samples.sort(key=lambda x: x[2])

    # linear system over rationals
    rows = []
    rhs = []
    target = add(add(scale(14, D0), scale(9, D1)), add(scale(5, D2), scale(4, D3)))
    for i, j, d in samples:
        rows.append([Fraction(D0[i][j]), Fraction(D1[i][j]), Fraction(A2[i][j]), Fraction(A3[i][j])])
        rhs.append(Fraction(target[i][j]))

    # Gaussian elimination 4x4
    n = 4
    M = [rows[r] + [rhs[r]] for r in range(n)]
    for col in range(n):
        pivot = None
        for r in range(col, n):
            if M[r][col] != 0:
                pivot = r
                break
        if pivot is None:
            raise RuntimeError("Singular system while deriving polynomial")
        if pivot != col:
            M[col], M[pivot] = M[pivot], M[col]
        fac = M[col][col]
        M[col] = [x / fac for x in M[col]]
        for r in range(n):
            if r == col:
                continue
            fac = M[r][col]
            if fac != 0:
                M[r] = [M[r][k] - fac * M[col][k] for k in range(n + 1)]
    coeffs = [M[i][n] for i in range(n)]
    return coeffs, A, A2, A3, target

def print_cmd(args):
    data = load_solution(Path(args.input))
    M = data["matrix"]

    print("shape:", len(M), "x", len(M[0]))
    print("score_sq:", data.get("score_sq"))
    print()

    if args.format == "text":
        print(matrix_to_text(M))
    elif args.format == "python":
        print(matrix_to_py_literal(M, "M"))
    elif args.format == "json":
        print(json.dumps(M, indent=2))
    else:
        raise ValueError(f"unknown format {args.format}")

def verify_cmd(args):
    data = load_solution(Path(args.input))
    M = data["matrix"]

    Q = compute_Q(M)
    D0, D1, D2, D3 = build_distance_matrices()

    Q_distance = add(add(scale(14, D0), scale(9, D1)), add(scale(5, D2), scale(4, D3)))
    ok_distance = equal(Q, Q_distance)

    coeffs, A, A2, A3, target = derive_polynomial_Q_of_A()
    c0, c1, c2, c3 = coeffs

    # clear denominators
    den = 1
    for c in coeffs:
        den = den * c.denominator
    ints = [int(c * den) for c in coeffs]

    Q_poly_scaled = add(
        add(scale(ints[0], D0), scale(ints[1], A)),
        add(scale(ints[2], A2), scale(ints[3], A3)),
    )
    Q_scaled = scale(den, Q)
    ok_poly = equal(Q_scaled, Q_poly_scaled)

    report = {
        "ok_distance_expression": ok_distance,
        "distance_expression": "Q = 14 I + 9 D1 + 5 D2 + 4 D3",
        "ok_adjacency_polynomial": ok_poly,
        "adjacency_polynomial_scaled": {
            "lhs": f"{den} Q",
            "rhs": f"{ints[0]} I + {ints[1]} A + {ints[2]} A^2 + {ints[3]} A^3",
        },
        "adjacency_polynomial_rational": {
            "Q": f"({c0}) I + ({c1}) A + ({c2}) A^2 + ({c3}) A^3"
        },
        "Q": Q,
    }

    outpath = Path(args.out)
    outpath.parent.mkdir(parents=True, exist_ok=True)
    outpath.write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))

def export_cmd(args):
    data = load_solution(Path(args.input))
    M = data["matrix"]
    Q = compute_Q(M)

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    (outdir / "g15_transport_matrix_M.txt").write_text(matrix_to_text(M) + "\n")
    (outdir / "g15_transport_matrix_M.py").write_text(matrix_to_py_literal(M, "M") + "\n")
    (outdir / "g15_transport_gram_Q.txt").write_text(matrix_to_text(Q) + "\n")

    coeffs, _, _, _, _ = derive_polynomial_Q_of_A()
    c0, c1, c2, c3 = coeffs
    den = 1
    for c in coeffs:
        den = den * c.denominator
    ints = [int(c * den) for c in coeffs]

    summary = {
        "M_path_txt": str(outdir / "g15_transport_matrix_M.txt"),
        "M_path_py": str(outdir / "g15_transport_matrix_M.py"),
        "Q_path_txt": str(outdir / "g15_transport_gram_Q.txt"),
        "distance_expression": "Q = 14 I + 9 D1 + 5 D2 + 4 D3",
        "adjacency_polynomial_scaled": {
            "lhs": f"{den} Q",
            "rhs": f"{ints[0]} I + {ints[1]} A + {ints[2]} A^2 + {ints[3]} A^3",
        },
        "adjacency_polynomial_rational": {
            "Q": f"({c0}) I + ({c1}) A + ({c2}) A^2 + ({c3}) A^3"
        },
    }
    (outdir / "g15_transport_postsolve_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("print")
    p.add_argument("--input", default="artifacts/g15_transport_search/cpsat_exact_solution.json")
    p.add_argument("--format", choices=["text", "python", "json"], default="text")
    p.set_defaults(func=print_cmd)

    v = sub.add_parser("verify")
    v.add_argument("--input", default="artifacts/g15_transport_search/cpsat_exact_solution.json")
    v.add_argument("--out", default="artifacts/g15_transport_search/g15_transport_verify_report.json")
    v.set_defaults(func=verify_cmd)

    e = sub.add_parser("export")
    e.add_argument("--input", default="artifacts/g15_transport_search/cpsat_exact_solution.json")
    e.add_argument("--outdir", default="artifacts/g15_transport_search")
    e.set_defaults(func=export_cmd)

    args = ap.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
