State:
  chi_t = (f_t, h_t) in Z2^2

Crossing increments:
  C -> (1,0)
  A -> (0,1)
  P -> (0,0)

Primed sector:
  (1,1)

Occupancy encoding:
  m_t = e_{chi_t}
  M = stack_t(m_t)
  Q = MM^T

Interpretation:
  Q_ij = 1 iff chi_i = chi_j   (in one-hot occupancy encoding)

Primed reach:
  exists t such that m_t = e_11

Primed lock:
  exists terminal index block T with |T| >= 2
  such that m_t = e_11 for all t in T

Minimal priming words:
  CA, AC

Minimal primed-lock words:
  CAPP, ACPP

Observable distinction:
  CA/AC gives a singleton e_11 hit
  CAPP/ACPP gives a terminal coherent e_11 block in Q
