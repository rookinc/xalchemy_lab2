Slot residue parity

Let a_vis in {0,1,2} be the visible-predicted slot class
and a_obs in {0,1,2} be the observed effective slot class.

Define slot displacement

  Delta_A = a_obs - a_vis mod 3.

A slot residue occurs iff Delta_A != 0.

Define slot residue parity by

  epsilon_A(Delta_A) =
    0  if Delta_A = 0
    1  if Delta_A != 0

Therefore, for any genuine leading slot residue L_t = A,

  epsilon(L_t) = 1.

The hidden-state update for slot residue is

  delta(A) = (0,1).

Interpretation:
- slot residue is intrinsically parity-odd
- it flips the sheet bit of the hidden register
- it contributes signed priming through

  sigma_t = (-1)^(1 xor f_t xor h_t)

whenever the leading residue is slot residue.
