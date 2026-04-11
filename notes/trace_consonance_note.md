# Trace Consonance Note
## Working note for the Thalean project

## Purpose
This note records the current candidate interpretation of the scalar

210

as the first quadratic-side companion scalar to the ring.

This is not yet a theorem-level naming.
It is a project note.

---

## 1. Context

The current Thalean picture distinguishes at least two scalar strata:

### Ladder-side scalar
The ring:
- value = 900
- role = first Thalean consonance scalar
- source = native ladder 15, 30, 60
- defining relation:

30^2 = 15 * 60 = 900

The ring belongs to the native ladder of the construction.

### Quadratic-side scalar
A distinct scalar appears on the quotient-visible quadratic layer:

tr(Q) = 210

This scalar does not come from the ladder directly.
It comes from the quadratic core object Q.

---

## 2. Quadratic core reminder

On the quotient core G15, the sector-edge incidence matrix is

M in {0,1}^{15 x 30}

and the quadratic core object is

Q := M M^T

This is the Gram matrix of the sector system.
Its diagonal entries are all equal to 14, since each sector has size 14.

Therefore:

tr(Q) = 15 * 14 = 210

This is the first obvious scalar invariant of Q.

---

## 3. Equivalent factorizations

The scalar 210 admits at least two native factorizations:

210 = 15 * 14
210 = 30 * 7

Interpretation:
- 15 = core vertex / sector count
- 14 = sector size = diagonal value of Q
- 30 = core edge count / column count of M
- 7 = column weight of M

So 210 couples:
- core cardinality with sector weight
- edge cardinality with edge participation multiplicity

This gives 210 real structural density.

---

## 4. Proposed name

Current candidate name:

trace consonance

Reason:
- "trace" because the scalar is defined by tr(Q)
- "consonance" because it couples native quantities on the quadratic layer in a clean, harmonically suggestive way
- it pairs naturally with the ring without competing with it

---

## 5. Distinction from the ring

This distinction must remain sharp.

### the ring
- value = 900
- source = native ladder
- role = balance witness / first Thalean consonance scalar
- governing relation = 30^2 = 15 * 60

### trace consonance
- value = 210
- source = quadratic core Q
- role = first quadratic-side companion scalar
- governing relation = tr(Q) = 15 * 14 = 30 * 7

So:
- the ring belongs to the ladder
- trace consonance belongs to the quadratic core

---

## 6. Why 210 matters

210 matters because it is the first visible scalar that belongs honestly to Q.

Unlike the ring, which lives upstream as a ladder object, 210 is immediately present as a direct scalar invariant of the quadratic layer.

That gives it a different kind of legitimacy.

The ring does not appear directly as:
- tr(Q)
- row sum of Q
- determinant of Q
- first obvious spectral scalar of Q

But 210 does.

So 210 may be the first scalar that tells us:
this is what the quadratic core weighs in its own native arithmetic.

---

## 7. Companion role

The current project reading is:

- the ring is the first consonance scalar of the native ladder
- trace consonance is the first consonance scalar of the quadratic core

This makes 210 a natural companion object rather than a competing object.

The pairing is:

- ring -> ladder consonance
- trace consonance -> quadratic consonance

---

## 8. Non-claims

This note does not claim:
- that trace consonance is a theorem-level term
- that 210 is more fundamental than the ring
- that 210 controls the spectrum of Q
- that 210 is the only meaningful scalar on the quadratic side
- that the naming is final

It is only a current structural candidate.

---

## 9. Compact summary

trace consonance is the proposed name for the scalar

tr(Q) = 210 = 15 * 14 = 30 * 7

It is the first quadratic-side companion scalar to the ring and belongs to the quotient-visible core rather than to the native ladder.

