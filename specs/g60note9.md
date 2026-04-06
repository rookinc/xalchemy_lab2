# Minimal priming register for G60

We model the machine with three layers:

  X = (Q, chi, pi)

where

  Q   = visible quotient / admissible lens image
  chi = first hidden lift, chi in Z2^2
  pi  = priming register, pi in Z4

## Cycle action

For one full visible cycle Gamma:

  Q   -> Q
  chi -> A_Gamma chi + B_Gamma
  pi  -> pi + C_Gamma (mod 4)

with:
  A_Gamma chi + B_Gamma   = first hidden monodromy
  C_Gamma in Z4           = priming monodromy

## Closure ladder

- visible closure:
    Q closes after 1 visible cycle  -> G15 level

- first hidden closure:
    chi closes after 2 visible cycles -> G30 level

- priming closure:
    pi closes after 4 visible cycles  -> G60 level

## Minimal theorem

If G15 is visible closure and G30 is first hidden identity restoration,
then a true G60 requires an additional order-4 register.
The smallest additive choice is:

  pi ~= Z4

A bare Z2 priming bit cannot distinguish four cycle phases.

## Informative action

Informative action is represented by a cocycle increment:

  pi_{t+1} = pi_t + c(Q_t, chi_t, u_t) mod 4

where u_t is the informative action token.

The cycle sum

  C_Gamma = sum_{t in Gamma} c(Q_t, chi_t, u_t) mod 4

is the priming monodromy.

Interpretation:
- C_Gamma = 0  -> no priming obstruction
- C_Gamma = 2  -> only order-2 obstruction
- C_Gamma = 1 or 3 -> order-4 priming, hence a route to G60

So:
G60 lock-in means the visible quotient has closed, but the upstream machine
has not yet returned to its original priming phase. :wq
            
