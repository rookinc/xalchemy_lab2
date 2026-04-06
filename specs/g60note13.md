Hidden orientation and priming law

Let the hidden orientation state be

  chi_t = (f_t, h_t) in Z2 x Z2

where
- f_t = frame bit
- h_t = sheet bit

Let the raw residue be

  R_t^raw = W_{t+1} ⊖ T_vis(W_t)

and let

  u_t = 1 iff R_t^raw is nontrivial
      = 0 otherwise

Let L_t = lead(R_t^raw) be the leading nontrivial residue under priority

  C > A > S > Lambda

Define a residue parity map

  epsilon : L -> Z2

and a hidden-orientation character

  phi(f,h) = f xor h

Then the informative-action sign is

  sigma_t = (-1)^( epsilon(L_t) xor f_t xor h_t )

for u_t = 1.

Let the priming register be

  pi_t in Z4

with update

  pi_{t+1} = pi_t + u_t * sigma_t mod 4

where sigma_t = +1 or -1 is identified with +1 or -1 in Z4.

Let the hidden-state update be

  chi_{t+1} = chi_t xor u_t * delta(L_t)

for some machine lift

  delta : L -> Z2^2

A minimal canonical choice is

  delta(C)      = (1,0)
  delta(A)      = (0,1)
  delta(S)      = (1,1)
  delta(Lambda) = (0,0)

Interpretation

- if u_t = 0, visible transport fully explains the next witness
- if u_t = 1, an informative action occurs
- informative action both increments the priming register and updates the hidden orientation state
- G60 lock-in requires nontrivial accumulation in pi_t driven by oriented residue
