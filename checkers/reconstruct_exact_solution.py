#!/usr/bin/env python3
import json
import hashlib
import sys
from collections import Counter, deque
from pathlib import Path

ADJ_OVERLAP = 9

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_json(obj) -> str:
    blob = json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return sha256_bytes(blob)

def load_json(path):
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

def row_sums(M):
    return [sum(r) for r in M]

def col_sums(M):
    rows = len(M)
    cols = len(M[0])
    return [sum(M[i][j] for i in range(rows)) for j in range(cols)]

def overlap_spectrum(Q):
    n = len(Q)
    c = Counter()
    for i in range(n):
        for j in range(i + 1, n):
            c[Q[i][j]] += 1
    return dict(sorted(c.items()))

def build_graph(Q, overlap=ADJ_OVERLAP):
    n = len(Q)
    A = [[0] * n for _ in range(n)]
    adj = {i: [] for i in range(n)}
    for i in range(n):
        for j in range(n):
            if i != j and Q[i][j] == overlap:
                A[i][j] = 1
                adj[i].append(j)
    return A, adj

def bfs(adj, src):
    dist = {src: 0}
    q = deque([src])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def graph_summary(Q):
    A, adj = build_graph(Q)
    degrees = [len(adj[i]) for i in range(len(adj))]
    connected = True
    D = [[-1] * len(adj) for _ in range(len(adj))]
    for i in range(len(adj)):
        d = bfs(adj, i)
        if len(d) != len(adj):
            connected = False
        for j, val in d.items():
            D[i][j] = val
    counts = Counter()
    for row in D:
        for x in row:
            counts[x] += 1
    finite = [x for row in D for x in row if x >= 0]
    diameter = max(finite) if finite else None
    return {
        "adjacency_overlap": ADJ_OVERLAP,
        "degrees": degrees,
        "connected": connected,
        "diameter": diameter,
        "distance_count_profile": dict(sorted(counts.items())),
        "adjacency_matrix": A,
        "distance_matrix": D,
    }

def main():
    theorem_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    note_path = Path(sys.argv[3])

    obj = load_json(theorem_path)
    M = extract_M(obj)
    Q = extract_Q(obj)

    rs = row_sums(M)
    cs = col_sums(M)
    spectrum = overlap_spectrum(Q)
    g = graph_summary(Q)

    payload = {
        "artifact_name": "cpsat_exact_solution.json",
        "artifact_kind": "reconstructed_exact_witness",
        "status": "reconstructed_from_canonical_theorem_object",
        "historical_status": "not_claimed_to_be_original_solver_output",
        "source_theorem_object": str(theorem_path),
        "reconstruction_method": {
            "description": "Reconstructed directly from the canonical discrete theorem object by extracting M and Q and recomputing derived summaries.",
            "preserves_discrete_witness": True,
            "preserves_original_solver_trace": False
        },
        "shapes": {
            "M": [len(M), len(M[0])],
            "Q": [len(Q), len(Q[0])]
        },
        "matrix_M": M,
        "gram_Q": Q,
        "row_sums": rs,
        "col_sums": cs,
        "overlap_spectrum_off_diagonal": spectrum,
        "overlap9_graph": {
            "connected": g["connected"],
            "degrees": g["degrees"],
            "diameter": g["diameter"],
            "distance_count_profile": g["distance_count_profile"]
        },
        "hashes": {
            "matrix_M_sha256": sha256_json(M),
            "gram_Q_sha256": sha256_json(Q)
        }
    }

    note = {
        "artifact": "theorem/cpsat_exact_solution.json",
        "status": "honest_reconstruction",
        "summary": [
            "This file is a reconstructed exact witness artifact.",
            "It is derived from the current canonical theorem object.",
            "It is not asserted to be the original historical CP-SAT solver output.",
            "Its purpose is to provide a truthful provenance anchor for the discrete witness now under verification."
        ],
        "source_theorem_object": str(theorem_path),
        "derived_hashes": payload["hashes"]
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")

    with open(note_path, "w", encoding="utf-8") as f:
        json.dump(note, f, indent=2)
        f.write("\n")

    print(json.dumps({
        "status": "ok",
        "written": [str(out_path), str(note_path)],
        "matrix_shape": payload["shapes"]["M"],
        "gram_shape": payload["shapes"]["Q"]
    }, indent=2))

if __name__ == "__main__":
    main()
