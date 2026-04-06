Q-Lens Primed Lock Criterion

Let M be the row-stack of sector occupancy vectors e_{chi_t},
with chi_t in Z2^2.

Let Q = MM^T.

Then:
  - priming occurs iff at least one row of M equals e_11
  - primed lock occurs iff a terminal block of at least two rows of M
    are all equal to e_11

Equivalently in Q:
  - priming is the existence of at least one diagonal index corresponding to e_11
  - primed lock is the existence of a terminal all-ones principal subblock
    induced by repeated e_11 occupancy
