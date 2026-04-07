Toy 60-step model

Hidden:
  x_n = T^n x_0
  T^60 = I

Sign lens:
  sigma(n+15) = -sigma(n)

Identity lens:
  iota(n+30) = iota(n)

Informative lens:
  chi_n = (f_n,h_n) in Z2^2
  chi_{n+1} = chi_n + delta_n mod 2

Example event schedule:
  delta_10 = (1,0)
  delta_22 = (0,1)
  all other delta_n = (0,0)

Result:
  0..9   : chi=(0,0)
  10..21 : chi=(1,0)
  23..59 : chi=(1,1)

Interpretation:
  G15  occurs while system is off-diagonal
  G30  occurs after primed diagonal is first reached
  G60  occurs with terminal residence on primed diagonal

Therefore:
  bare G60 = T^60 = I
  primed G60 = T^60 = I plus terminal lock on (1,1)
