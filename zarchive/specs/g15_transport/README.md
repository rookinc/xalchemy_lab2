# G15 transport theorem object

This folder contains the canonical specification of the exact G15 transport-sector theorem object.

Core object:
- binary matrix M in {0,1}^{15x30}
- row weight 14
- column weight 7

Gram law:
- Q = M M^T
- distance 0 -> 14
- distance 1 -> 9
- distance 2 -> 5
- distance 3 -> 4

Equivalent adjacency-polynomial identity on G15:
- Q = 2I + 2A^2 + A^3

Canonical source:
- theorem_object.json

Generated source artifact:
- ../../artifacts/g15_transport_search/cpsat_exact_solution.json
