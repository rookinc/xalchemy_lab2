# Stepwise priming law

We extend the lifted machine to:

  X_t = (Q_t, chi_t, pi_t)

where

  Q_t   = visible coarse state
  chi_t in Z2^2 = hidden frame/sheet residue
  pi_t  in Z4   = priming register

## Informative action

At each step t, let

  u_t in Z2

indicate whether the step carries informative hidden transport not recoverable
from Q_t alone.

Let

  s_t = s(chi_t, Q_t) in {+1, -1}

be the hidden orientation sign of that informative action.

Then the minimal local priming update is

  pi_{t+1} = pi_t + u_t s_t (mod 4)

equivalently:
- no informative action: increment 0
- positively oriented informative action: increment +1
- negatively oriented informative action: increment -1 = 3 mod 4

## Cycle priming monodromy

For one full visible cycle Gamma:

  C_Gamma = sum_{t in Gamma} u_t s_t (mod 4)

Interpretation:
- C_Gamma = 0  -> no net priming
- C_Gamma = 2  -> order-2 obstruction only
- C_Gamma = 1 or 3 -> order-4 priming, hence G60 lock-in

## Meaning

The machine can visibly close while still carrying hidden priming remainder.
If informative action does not accumulate nontrivially in Z4, the machine falls
back to the lower closure ladder.

Thus G60 requires not just motion, but signed informative transport.
