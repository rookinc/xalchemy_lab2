#!/usr/bin/env python3
import json
from collections import Counter, defaultdict

# ------------------------------------------------------------
# load data
# ------------------------------------------------------------
with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

with open("theorem/cocycle_data.json", "r", encoding="utf-8") as f:
    coc = json.load(f)

Q = th["gram_Q"]
M = th["matrix_M"]
columns = [tuple(col) for col in th["columns"]]

n = len(Q)
m = len(M[0])

assert n == 15
assert m == 30

# ------------------------------------------------------------
# active G15 graph from Q
# ------------------------------------------------------------
edges = []
for i in range(n):
    for j in range(i + 1, n):
        if Q[i][j] == 9:
            edges.append((i, j))

assert len(edges) == 30
edges = sorted(edges)

edge_to_coc = {}
for item in coc["edge_cocycle"]:
    e = tuple(sorted(item["edge"]))
    edge_to_coc[e] = item["value"]   # 0 parallel, 1 crossed

assert set(edge_to_coc) == set(edges)

# ------------------------------------------------------------
# actual column supports from M
# ------------------------------------------------------------
col_supports = []
for j in range(m):
    supp = tuple(i for i in range(n) if M[i][j] == 1)
    col_supports.append(supp)

assert len(col_supports) == 30
assert all(len(s) == 7 for s in col_supports)

# ------------------------------------------------------------
# distances on G15
# ------------------------------------------------------------
INF = 10**9
dist = [[INF] * n for _ in range(n)]
for i in range(n):
    dist[i][i] = 0
for u, v in edges:
    dist[u][v] = 1
    dist[v][u] = 1

for k in range(n):
    for i in range(n):
        dik = dist[i][k]
        if dik == INF:
            continue
        for j in range(n):
            cand = dik + dist[k][j]
            if cand < dist[i][j]:
                dist[i][j] = cand

# ------------------------------------------------------------
# coarse signatures
# edge side: cocycle value + histogram of ordered local types
# column side: histogram of column intersections
# ------------------------------------------------------------
def edge_sig(e):
    own = edge_to_coc[e]
    hist = Counter()
    u, v = e
    for f in edges:
        if f == e:
            continue
        a, b = f
        t = tuple(sorted([dist[u][a], dist[u][b], dist[v][a], dist[v][b]]))
        share = len({u, v} & {a, b})
        hist[(own, edge_to_coc[f], share, t)] += 1
    return tuple(sorted(hist.items()))

def col_sig(j):
    sj = set(col_supports[j])
    hist = Counter()
    for k in range(m):
        if k == j:
            continue
        hist[len(sj & set(col_supports[k]))] += 1
    return tuple(sorted(hist.items()))

edge_sigs = {e: edge_sig(e) for e in edges}
col_sigs = {j: col_sig(j) for j in range(m)}

# ------------------------------------------------------------
# initial domains
#
# This first version is intentionally conservative:
# every edge can go to every column. We then prune with cheap tests.
# ------------------------------------------------------------
domains = {e: set(range(m)) for e in edges}

# Optional mild pruning:
# group columns by signature class
col_classes = defaultdict(list)
for j, s in col_sigs.items():
    col_classes[s].append(j)

edge_classes = defaultdict(list)
for e, s in edge_sigs.items():
    edge_classes[s].append(e)

print("Edge class sizes:", sorted(len(v) for v in edge_classes.values()))
print("Column class sizes:", sorted(len(v) for v in col_classes.values()))
print()

# ------------------------------------------------------------
# compatibility tests
#
# Since we do not yet know the exact bridge law, we only use
# universal constraints that must hold for any assignment.
# ------------------------------------------------------------
def pair_column_intersection(c1, c2):
    return len(set(col_supports[c1]) & set(col_supports[c2]))

def pair_edge_shared_endpoint(e1, e2):
    return len(set(e1) & set(e2))

def pair_edge_cocycle_pattern(e1, e2):
    return (edge_to_coc[e1], edge_to_coc[e2], pair_edge_shared_endpoint(e1, e2))

# Very weak consistency cache. This is a placeholder for stronger rules later.
pair_cache = {}

def pair_compatible(e1, c1, e2, c2):
    key = (e1, c1, e2, c2)
    if key in pair_cache:
        return pair_cache[key]

    # universal quantities
    edge_share = pair_edge_shared_endpoint(e1, e2)
    col_inter = pair_column_intersection(c1, c2)

    # hard bounds only: if two edges share an endpoint, their columns
    # should not be completely unrelated. We keep this loose for now.
    ok = True
    if edge_share == 1 and col_inter < 1:
        ok = False

    pair_cache[key] = ok
    return ok

# ------------------------------------------------------------
# backtracking solver
# ------------------------------------------------------------
assignment = {}
used_cols = set()

def choose_edge():
    unassigned = [e for e in edges if e not in assignment]
    # smallest remaining domain first
    unassigned.sort(key=lambda e: (len(domains[e]), e))
    return unassigned[0] if unassigned else None

def forward_check(e, c):
    removed = []

    # injective assignment
    for e2 in edges:
        if e2 == e or e2 in assignment:
            continue
        if c in domains[e2]:
            domains[e2].remove(c)
            removed.append((e2, c))
            if not domains[e2]:
                return False, removed

    # pairwise pruning against already assigned edges
    for e2, c2 in assignment.items():
        if not pair_compatible(e, c, e2, c2):
            return False, removed

    # pairwise pruning against unassigned edges
    for e2 in edges:
        if e2 == e or e2 in assignment:
            continue
        bad = []
        for c2 in list(domains[e2]):
            if not pair_compatible(e, c, e2, c2):
                bad.append(c2)
        for c2 in bad:
            domains[e2].remove(c2)
            removed.append((e2, c2))
        if not domains[e2]:
            return False, removed

    return True, removed

def undo(removed):
    for e, c in removed:
        domains[e].add(c)

def solve():
    e = choose_edge()
    if e is None:
        return True

    # heuristic ordering: smaller support signatures first
    candidates = sorted(domains[e], key=lambda j: (len(col_supports[j]), j))

    for c in candidates:
        if c in used_cols:
            continue

        assignment[e] = c
        used_cols.add(c)

        ok, removed = forward_check(e, c)
        if ok and solve():
            return True

        undo(removed)
        used_cols.remove(c)
        del assignment[e]

    return False

# ------------------------------------------------------------
# run
# ------------------------------------------------------------
print("Starting exact assignment search...")
ok = solve()
print("Solved:", ok)

if ok:
    out = []
    for e in sorted(assignment):
        j = assignment[e]
        out.append({
            "edge": list(e),
            "cocycle_value": edge_to_coc[e],
            "column": j + 1,
            "support": list(col_supports[j])
        })

    with open("edge_column_assignment.json", "w", encoding="utf-8") as f:
        json.dump({"assignment": out}, f, indent=2)

    print("Wrote edge_column_assignment.json")
else:
    print("No assignment found with current constraints.")
    print("That is expected if the compatibility rules are still too weak.")
