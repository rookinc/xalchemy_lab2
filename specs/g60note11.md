# Chamber-native priming law

Let the local chamber witness at step t be

  W_t = (S_t, Delta_t, Lambda_t)

where
- S_t = ordered shell
- Delta_t = ordered diad/channel package
- Lambda_t = attachment/remainder package

Let T_vis be the transport predicted by the visible coarse rule alone.

Define the hidden witness residue by

  R_t = W_{t+1} ⊖ T_vis(W_t)

Interpretation:
R_t is the chamber remainder after factoring out visible pump motion.

## Informative action token

Define

  u_t = 1  if R_t != 0
      = 0  if R_t = 0

So informative action means:
the step carries nontrivial hidden witness transport not recoverable from
the visible state Q_t alone.

## Orientation sign

Let chi_t in Z2^2 be the hidden frame/sheet state.
Define the sign

  s_t = sgn(R_t, chi_t) in {+1, -1}

using the oriented leading nontrivial witness residue.

Operational precedence:
1. diad/channel residue
2. shell residue
3. attachment residue

## Priming update

  pi_{t+1} = pi_t + u_t s_t (mod 4)

## Cycle criterion

For a visible cycle Gamma,

  C_Gamma = sum_{t in Gamma} u_t s_t (mod 4)

Interpretation:
- C_Gamma = 0 : no net priming
- C_Gamma = 2 : only order-2 obstruction
- C_Gamma = 1 or 3 : order-4 priming, hence G60 lock-in

## Meaning

Visible closure is not enough.
G60 requires accumulation of signed hidden witness residue.
Without that priming remainder, the machine falls back into lower closure.  :wq

