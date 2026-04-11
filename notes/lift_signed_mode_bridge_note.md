# Lift-Signed Mode Bridge Note
## Working note for the Thalean project

## Purpose
This note records the current next-step bridge between:

- the centered quadratic mode families of Q
- the signed lift / cocycle layer
- the first weak-visibility predicate for particle-like mode families

This is not a theorem note.
It is a construction note.

The goal is to define the first natural operator that carries the signed-lift data into the centered Q-arena.

---

## 1. Background objects

### Quadratic core object
On the quotient core G15, the sector-edge incidence matrix is

M in {0,1}^{15 x 30}

and the quadratic core object is

Q := M M^T

This is the unsigned sector-overlap Gram matrix.

### Signed lift / cocycle data
The intermediate quotient

G30 -> G15

is a signed 2-lift.

Each edge of G15 is classified as either:
- parallel
- crossed

Equivalently, the lift carries a sign function

sigma : E(G15) -> {+1, -1}

or a Z2-valued cocycle

epsilon : E(G15) -> Z2

This data is independent of the quadratic overlap law and belongs to the lift layer.

### Centered mode arena
After removing the all-ones / Perron mode from Q, we work on the centered 14-dimensional subspace.

The nontrivial centered mode families are presently associated with the nontrivial eigenvalue families of Q:
- E18
- E3
- E2

These are currently the first particle-family candidates.

---

## 2. Problem

At present, the centered Q-families are visible, but the lift/cocycle layer has not yet been pushed into the same arena in operator form.

So the missing bridge is:

How do we convert the signed edge data of the lift into an operator acting on the centered sector-mode space?

This note records the simplest first answer.

---

## 3. Edge-sign diagonal operator

Let the 30 edges of G15 be the column index set of M.

Define the signed edge operator on edge space by

S_sigma := diag(sigma(e1), ..., sigma(e30))

Interpretation:
- +1 on parallel-lift edges
- -1 on crossed-lift edges

This is the first linearized cocycle witness.

It acts on edge coordinates, not yet on sector coordinates.

---

## 4. Signed sector-overlap operator

Push the edge-sign operator through M to obtain a sector-space operator:

Q_sigma := M S_sigma M^T

Interpretation:
- Q = M I M^T is the unsigned sector-overlap operator
- Q_sigma = M S_sigma M^T is the signed sector-overlap operator

So:
- Q measures unsigned sector overlap
- Q_sigma measures signed sector overlap induced by the lift

This is the first natural operator that places the lift/cocycle data in the same algebraic arena as Q.

---

## 5. Centered signed operator

To compare like with like, restrict Q_sigma to the centered subspace, just as one does for Q after removing the all-ones mode.

Define

Qhat_sigma := Q_sigma restricted to 1-perp

where 1-perp is the centered codimension-one subspace.

Now the centered arena contains two operators:
- Qhat = centered unsigned quadratic operator
- Qhat_sigma = centered signed lift-sensitive operator

This is the first real particle-mode arena.

---

## 6. First weak-visibility predicate

For each centered mode family E_lambda of Qhat, define the first weak-visibility test by asking whether Qhat_sigma acts nontrivially on that family.

Proposed predicate:

W(E_lambda) = 1 iff Qhat_sigma acts nontrivially on E_lambda

First practical interpretations:
- if Qhat_sigma restricted to E_lambda is zero or trivial, then W = 0
- if Qhat_sigma restricted to E_lambda is nonzero, splits the family, or distinguishes internal structure, then W = 1

So the signed lift becomes a direct family-level discriminator.

---

## 7. Why this matters

This construction is the first non-handwavy bridge between:

- centered mode families of Q
- weak-style lift sensitivity
- particle-family classification

Without this bridge, electron-like and neutrino-like language remains intuitive but ungrounded.

With this bridge, the project gets the first honest weak predicate.

---

## 8. Current centered family program

The present centered family candidates are:

- E18
- E3
- E2

The next concrete task is to test how Qhat_sigma acts on each one.

The key possibilities are:

### Case A
One family responds strongly, one weakly, one not at all.

This would be ideal for a first family split.

### Case B
All three respond equally.

Then the signed operator is too coarse and a finer lift-sensitive construction is needed.

### Case C
Qhat_sigma mixes the families.

This is also interesting.
It would suggest that particle candidates are not eigenspaces of Qhat alone, but joint structures of:
- Qhat
- Qhat_sigma

This may be the richer outcome.

---

## 9. Particle-family interpretation

If the bridge works, then the first family dictionary can be refined as follows.

### Electron-like family
A centered family that is:
- closure-stable under Qhat
- weak-visible under Qhat_sigma
- strongly legible in ordinary centered geometry

### Neutrino-like family
A centered family that is:
- closure-stable under Qhat
- weak-visible under Qhat_sigma
- weak or faint in ordinary centered geometry

### Silent centered family
A centered family that is:
- closure-stable under Qhat
- weak-silent under Qhat_sigma
- weak or absent in ordinary visibility

This remains provisional, but becomes structurally meaningful once Qhat_sigma exists.

---

## 10. Compact construction summary

1. Build the edge-sign diagonal:

   S_sigma = diag(sigma(e1), ..., sigma(e30))

2. Push it into sector space:

   Q_sigma = M S_sigma M^T

3. Restrict to the centered subspace:

   Qhat_sigma = Q_sigma | 1-perp

4. Test the centered Q-families:

   E18, E3, E2

5. Define weak visibility by nontrivial action:

   W(E_lambda) = 1 iff Qhat_sigma acts nontrivially on E_lambda

This is the first honest weak-mode bridge.

---

## 11. Distinction from existing objects

This note does not redefine:

- the ring
- trace consonance
- centered consonance
- the Perron scalar
- the hinge scalar

Instead, it adds a new operator object:

Q_sigma

and its centered restriction:

Qhat_sigma

These are not scalar companions.
They are interaction bridges.

---

## 12. Non-claims

This note does not claim:
- that Q_sigma is already theorem-level
- that Q_sigma preserves the Qhat eigenspaces
- that the electron or neutrino has already been identified
- that the cocycle has already been linearized uniquely
- that this is the only possible bridge from lift data into the centered mode arena

This note only records the simplest first bridge.

---

## 13. Current best summary

The simplest first bridge from the signed-lift layer into the centered mode arena is:

Q_sigma = M S_sigma M^T

and, after centering,

Qhat_sigma

This operator provides the first natural weak-visibility test on the centered mode families E18, E3, and E2.

If it acts nontrivially on a family, that family is weak-visible.
If not, it is weak-silent.

This is the first proper path from the cocycle layer toward particle-family discrimination.

