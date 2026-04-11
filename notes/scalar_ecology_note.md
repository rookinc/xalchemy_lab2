# Scalar Ecology Note
## Working note for the Thalean project

## Purpose
This note records the current scalar stratification emerging from the Thalean project.

The goal is to separate scalar objects by stratum rather than letting all meaningful numbers blur together.

At present, four scalar objects appear to belong to three distinct strata:

- the ring = 900
- trace consonance = 210
- Perron scalar = 98
- centered consonance = 112

This is a structure note, not a theorem note.

---

## 1. Guiding principle

Not every meaningful number belongs to the same layer.

The current project picture suggests that the Thalean construction has at least three scalar strata:

1. ladder stratum
2. raw quadratic stratum
3. centered / spherical stratum

The safest way to prevent conceptual drift is to assign each scalar to its natural stratum.

---

## 2. Ladder stratum

### Native ladder
The native Thalean ladder is:

15, 30, 60

Interpretation:
- 15 = quotient-visible core scale
- 30 = intermediate lift scale
- 60 = thalion scale

### the ring
The ring is the formal name for the 900-object.

Defining relation:

30^2 = 15 * 60 = 900

Interpretation:
- 30 is the multiplicative midpoint of the native ladder
- 900 is the balance witness of that ladder

Current role:
- first Thalean consonance scalar
- ladder-side balance witness
- belongs to the native ladder, not to the quadratic core

Compact reading:
the ring = ladder consonance

---

## 3. Raw quadratic stratum

### Quadratic core object
On the quotient core G15, the sector-edge incidence matrix is

M in {0,1}^{15 x 30}

and the quadratic core object is

Q := M M^T

This is the Gram matrix of the sector system.

The paper gives:
- row count = 15
- column count = 30
- row weight = 14
- column weight = 7
- Q = A^3 + 2A^2 + 2I
- Q = 14D0 + 9D1 + 5D2 + 4D3

So Q is the genuine theorem-level quadratic object on the core.

### trace consonance = 210
Since every diagonal entry of Q is 14 and there are 15 rows,

tr(Q) = 15 * 14 = 210

Equivalent factorization:

210 = 30 * 7

Interpretation:
- 15 = core count
- 14 = sector size / diagonal entry
- 30 = edge count / column count
- 7 = column weight

Current role:
- first quadratic-side companion scalar to the ring
- trace mass of the quadratic core
- belongs to raw Q, not to the ladder

Compact reading:
trace consonance = raw quadratic trace mass

### Perron scalar = 98
Because Q has constant row sum, each row sums to

98

This is also the top eigenvalue of Q.

Interpretation:
- global all-ones mode of raw Q
- dominant uncentered coherence scalar

Current role:
- Perron scalar of the raw quadratic layer
- global row-sum scalar
- not centered, not ladder-side

Compact reading:
Perron scalar = raw quadratic global mode

---

## 4. Centered / spherical stratum

### Centered geometry
After centering and normalization, the sector vectors yield a spherical code.
The inner products are:

37/112
-23/112
-38/112

So 112 appears as the common denominator governing the normalized centered geometry.

### centered consonance = 112
A second appearance of 112 occurs when the trivial all-ones mode is removed from Q.
The remaining nontrivial spectral mass is:

5 * 18 + 4 * 3 + 5 * 2 = 112

Interpretation:
- residue of the quadratic spectrum after removing the global Perron mode
- normalization scalar of the spherical layer
- natural scalar of the centered quadratic geometry

Current role:
- centered-side companion scalar
- spherical normalization scalar
- belongs to the centered / normalized stratum, not to the ladder and not to raw Q as such

Compact reading:
centered consonance = centered spectral residue / spherical denominator

---

## 5. Scalar map

### Ladder stratum
- the ring = 900
- role = balance witness
- source = 30^2 = 15 * 60

### Raw quadratic stratum
- trace consonance = 210
- role = trace mass of Q
- source = tr(Q) = 15 * 14 = 30 * 7

- Perron scalar = 98
- role = row-sum scalar / top eigenvalue of Q
- source = Q * 1 = 98 * 1

### Centered / spherical stratum
- centered consonance = 112
- role = centered spectral residue / spherical normalization scalar
- source = nontrivial spectral mass and denominator of the normalized inner products

---

## 6. Why this map matters

This map prevents several confusions.

### confusion 1
Thinking the ring is a scalar of Q.

Correction:
the ring belongs to the ladder stratum, not directly to the quadratic core.

### confusion 2
Thinking trace consonance competes with the ring.

Correction:
trace consonance belongs to raw Q and acts as a companion scalar, not a rival scalar.

### confusion 3
Thinking 112 is just an incidental denominator.

Correction:
112 appears both in the centered spectral residue and in the normalized spherical geometry, so it deserves object status.

### confusion 4
Thinking all meaningful numbers should be forced by one formula.

Correction:
different strata naturally produce different scalar witnesses.

---

## 7. Current naming status

### locked
- the ring = 900

### candidate names
- trace consonance = 210
- centered consonance = 112

### descriptive but not necessarily final
- Perron scalar = 98

---

## 8. Non-claims

This note does not claim:
- that the scalar ecology is complete
- that these names are final
- that every scalar listed is theorem-level
- that the ring determines Q
- that Q determines the ring
- that 112 is the only meaningful centered scalar
- that 98 is more fundamental than 210
- that all future scalar objects must fit this map

This note only records the present best stratified reading.

---

## 9. Current best summary

The Thalean construction presently appears to support a scalar ecology with at least three strata:

1. ladder stratum
   - the ring = 900

2. raw quadratic stratum
   - trace consonance = 210
   - Perron scalar = 98

3. centered / spherical stratum
   - centered consonance = 112

These scalars should be read as belonging to different layers of legibility rather than as competing names for the same phenomenon.

---

## 10. Next possible moves

1. Test whether centered consonance = 112 deserves a more precise or better name.
2. Test whether 98 admits a stronger harmonic interpretation than "Perron scalar".
3. Look for higher scalar objects downstream of the centered layer.
4. Explore whether the scalar ecology can be encoded in a more formal UETLang-style syntax.
5. Test whether any direct functional relation exists among 900, 210, 98, and 112 beyond shared construction lineage.

