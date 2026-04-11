#!/usr/bin/env python3
import json
import numpy as np

with open("theorem/theorem_object.json", "r", encoding="utf-8") as f:
    th = json.load(f)

Q = np.array(th["gram_Q"], dtype=float)
n = Q.shape[0]

# center projector
J = np.ones((n, n)) / n
P = np.eye(n) - J

Qhat = P @ Q @ P

# eigendecomposition
vals, vecs = np.linalg.eigh(Qhat)

# group eigenvalues numerically
# expected: 0, 2, 3, 18, 98? after centering the 98/Perron should disappear,
# so we should see approximately 0 plus 2,3,18 with mult 5,4,5.
rounded = [round(v, 8) for v in vals]
print("eigenvalues:")
for v in rounded:
    print(v)

# cluster by rounded value
groups = {}
for i, v in enumerate(rounded):
    groups.setdefault(v, []).append(i)

print("\nindex groups:")
for v, idxs in groups.items():
    print(v, "->", idxs)

# extract nonzero centered eigenspaces
target_vals = [v for v in groups.keys() if abs(v) > 1e-7]
target_vals = sorted(target_vals)

print("\nnonzero centered eigenvalue groups:", target_vals)

# row signatures = squared norms of projections of each basis vector e_x
# onto each eigenspace
row_sigs = []
for x in range(n):
    ex = np.zeros(n)
    ex[x] = 1.0
    sig = []
    for v in target_vals:
        idxs = groups[v]
        B = vecs[:, idxs]
        proj = B @ (B.T @ ex)
        sig.append(float(np.dot(proj, proj)))
    row_sigs.append(sig)

print("\nrow signatures (projection mass into each nonzero eigenspace):")
for i, sig in enumerate(row_sigs):
    print(i, [round(s, 8) for s in sig])

