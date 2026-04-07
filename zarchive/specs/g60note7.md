# Hidden priming lift for the pump

Let the lifted machine state be

  W = (Q, chi)

with

  Q = M M^T
  chi = (s,f) in Z2^2

where:
- s = sheet bit
- f = frame bit

Interpretation:
- Q is the lens-visible quotient
- chi is the hidden sheet/frame residue

## Generator ansatz

Take primitive hidden toggles

  tau : chi -> chi + (1,0)
  mu  : chi -> chi + (0,1)

Then the four hidden sectors are

  (0,0), (1,0), (0,1), (1,1)

So Z2^2 is the minimal four-sector hidden lift.

## Extended pump rule

Visible coarse rule:

  Pi(k,i,sigma) = (k+1, i+1, -sigma)

Lifted rule:

  Pi~(k,i,sigma; chi) = (k+1, i+1, -sigma; A_Pi chi + b_Pi)

Simplest case:
  A_Pi = I
  b_Pi in Z2^2

More general case:
  A_Pi in GL(2,2)

## Closure hierarchy

G15 = visible quotient closure in Q

If one visible cycle contributes nonzero hidden displacement Delta,
then additive hidden closure occurs only after doubling:

  2 Delta = 0  in Z2^2

So:

- G15 = quotient closure
- G30 = additive lifted closure
- G60 = affine full lifted closure

## Priming principle

The pump is primed iff the machine occupies and transports a nontrivial hidden sector.

Formally:
- primed state: chi != 0
- informative action: b_Pi != 0 or A_Pi != I

Without informative transport, the machine collapses back to a smaller quotient.
