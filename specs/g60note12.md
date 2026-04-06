Witness comparator

Let

  W = (S, C, A, Lambda)

with
- S = ordered shell 4-tuple
- C = ordered canonical channel triple
- A = slot assignment D -> C
- Lambda = remainder / attachment structure

Define raw residue componentwise:

  W' ⊖ W_vis = (r_S, r_C, r_A, r_Lambda)

1. Shell residue
   r_S = 0 if S' = S_vis
       = cyclic offset in Z4 if S' is a cyclic rotation of S_vis
       = bottom otherwise

2. Canonical channel residue
   r_C = 0 if C' = C_vis
       = cyclic offset in Z3 if C' is a cyclic permutation of C_vis
       = bottom otherwise

3. Slot residue
   r_A = A' o (A_vis)^(-1) in S3

4. Attachment residue
   r_Lambda = (
     remainder-set symmetric difference,
     attachment-label disagreement set,
     remainder-edge symmetric difference,
     class-summary difference
   )

Informative action bit

  u_t = 1 iff at least one of r_S, r_C, r_A, r_Lambda is nontrivial
      = 0 otherwise

Leading residue priority

  C > A > S > Lambda

Let L_t be the first nontrivial residue in that order.

Given hidden frame/sheet state chi_t in Z2^2, define the priming sign

  s_t = sgn(L_t, chi_t) in {+1,-1}

Priming update

  pi_{t+1} = pi_t + u_t s_t mod 4

Interpretation

- u_t = 0: the visible transport fully explains the next witness
- u_t = 1: an informative action occurred
- G60 lock-in requires nontrivial accumulation of oriented residue
