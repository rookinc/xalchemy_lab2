# Monodromy derivation for G15 / G30 / G60

Let one full visible cycle Gamma act on the hidden lift chi by

  M_Gamma(chi) = A_Gamma chi + B_Gamma

with chi in Z2^2.

## Classification

1. Pure closure
   A_Gamma = I
   B_Gamma = 0

2. Additive obstruction
   A_Gamma = I
   B_Gamma != 0

   Then:
     M_Gamma^2(chi) = chi + 2 B_Gamma = chi

   So additive Z2^2 transport can explain doubling:
     G15 -> G30

   But it cannot explain true G60.

3. Affine obstruction
   A_Gamma != I

   Since GL(2,2) ~= S3, the possible orders are only 1, 2, 3.
   So Z2^2 affine transport can give cycle multipliers up to 3:
     15, 30, 45
   but not intrinsic 60.

## Conclusion

If G15 is visible sign-closure and G30 is identity restoration,
then a true G60 cannot come from Q alone,
and cannot come from a bare Z2^2 lift alone.

Therefore G60 requires an additional informative register pi.

Full machine:

  X = (Q, chi, pi)

with:
  Q   = visible quotient, e.g. Q = M M^T
  chi = first hidden lift (sheet/frame style Z2^2 residue)
  pi  = priming / informative-action memory

Then closure layers are:

  G15 = visible quotient closure
  G30 = first hidden identity closure
  G60 = full primed lock-in closure

Interpretation:
The pump must be primed because without the extra informative register,
the machine collapses back into the smaller quotient.
