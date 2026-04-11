#!/usr/bin/env python3
import json
from collections import Counter

def norm_edge(u, v):
    return (u, v) if u <= v else (v, u)

def canonical_cycle(cycle):
    cyc = list(cycle)
    n = len(cyc)
    reps = []
    for i in range(n):
        reps.append(tuple(cyc[i:] + cyc[:i]))
    rev = list(reversed(cyc))
    for i in range(n):
        reps.append(tuple(rev[i:] + rev[:i]))
    return min(reps)

def directed_rotations(cycle):
    cyc = list(cycle)
    n = len(cyc)
    out = []
    for i in range(n):
        out.append(tuple(cyc[i:] + cyc[:i]))
    rev = list(reversed(cyc))
    for i in range(n):
        out.append(tuple(rev[i:] + rev[:i]))
    return out

def cycle_edges(cycle):
    n = len(cycle)
    return [norm_edge(cycle[i], cycle[(i + 1) % n]) for i in range(n)]

def find_5cycles(adj):
    n = len(adj)
    seen = set()
    out = []
    for a in range(n):
        for b in adj[a]:
            for c in adj[b]:
                if c in (a, b):
                    continue
                for d in adj[c]:
                    if d in (a, b, c):
                        continue
                    for e in adj[d]:
                        if e in (a, b, c, d):
                            continue
                        if a in adj[e]:
                            cyc = canonical_cycle((a, b, c, d, e))
                            if cyc not in seen:
                                seen.add(cyc)
                                out.append(cyc)
    return sorted(out)

def choose_cycle_for_directed_edge(root, nbr, cycles):
    candidates = []
    for cyc in cycles:
        for rot in directed_rotations(cyc):
            if rot[0] == root and rot[1] == nbr:
                candidates.append(rot)
    return min(candidates) if candidates else None

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]

n = len(Q)

# theorem G15
adj = {i: set() for i in range(n)}
edges = []
for i in range(n):
    for j in range(i + 1, n):
        if Q[i][j] == 9:
            adj[i].add(j)
            adj[j].add(i)
            edges.append((i, j))
edges = sorted(edges)
edge_index = {e: k for k, e in enumerate(edges)}

# theorem row supports as edge-index sets
row_supports = []
for i in range(n):
    supp = tuple(j for j, v in enumerate(M[i]) if v == 1)
    row_supports.append(set(supp))

cycles5 = find_5cycles(adj)

print("THEOREM PETRIE/5-CYCLE PROBE")
print("vertices:", n)
print("edges:", len(edges))
print("5-cycles:", len(cycles5))
print()

# root -> chosen directed 5-cycles starting with each outgoing edge
root_rows = []
size_hist = Counter()

for root in range(n):
    chosen = []
    used_edges = set()
    for nbr in sorted(adj[root]):
        cyc = choose_cycle_for_directed_edge(root, nbr, cycles5)
        if cyc is None:
            continue
        chosen.append(cyc)
        used_edges.update(cycle_edges(cyc))

    edge_ids = {edge_index[e] for e in used_edges}
    size_hist[len(edge_ids)] += 1

    overlap = len(edge_ids & row_supports[root])
    root_rows.append({
        "root": root,
        "chosen_cycles": chosen,
        "edge_ids": sorted(edge_ids),
        "size": len(edge_ids),
        "theorem_row_size": len(row_supports[root]),
        "overlap_with_theorem_row": overlap,
        "missed_from_theorem": sorted(row_supports[root] - edge_ids),
        "extra_vs_theorem": sorted(edge_ids - row_supports[root]),
    })

print("rooted 5-cycle union size histogram:", dict(sorted(size_hist.items())))
print()

for row in root_rows:
    print(
        f'root {row["root"]:2d} | size={row["size"]:2d} | '
        f'overlap={row["overlap_with_theorem_row"]:2d}/14 | '
        f'missed={len(row["missed_from_theorem"]):2d} | '
        f'extra={len(row["extra_vs_theorem"]):2d}'
    )

with open("theorem_petrie_probe.json", "w", encoding="utf-8") as f:
    json.dump({
        "edges": edges,
        "cycles5": cycles5,
        "rows": root_rows,
    }, f, indent=2)

print()
print("wrote theorem_petrie_probe.json")
