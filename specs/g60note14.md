Channel residue parity

Let c_vis in {0,1,2} be the visible-predicted active channel class
and c_obs in {0,1,2} be the observed effective channel class
extracted from the next witness.

Define channel displacement

  Delta_C = c_obs - c_vis mod 3.

A channel residue occurs iff Delta_C != 0.

Define channel residue parity by

  epsilon_C(Delta_C) =
    0  if Delta_C = 0
    1  if Delta_C != 0

Therefore, for any genuine leading channel residue L_t = C,

  epsilon(L_t) = 1.

So the informative-action sign law becomes

  sigma_t = (-1)^(1 xor f_t xor h_t)

whenever the leading residue is channel residue.

Interpretation:
- channel residue is intrinsically parity-odd
- hidden frame/sheet state orients that odd residue into signed priming
- channel residue also updates the hidden state by

  delta(C) = (1,0)

so a channel residue flips the frame bit.
