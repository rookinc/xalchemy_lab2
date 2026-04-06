# Witness Ladder Note
## Shell / diad / remainder derivation status

This note records the current derivation ladder for the local witness package around an anchor in the AT4val[60,6] setting.

The goal is to determine what data is actually needed for a **local chamber witness** that is strong enough to distinguish meaningful local structure, without collapsing immediately into “record the whole graph.”

---

# 1. Starting point

We began with the candidate

\[
W_0(a) = (S(a), D(a))
\]

where:

- \(S(a)\) is the shell 4-set at anchor \(a\),
- \(D(a)\) is the diad partition of that shell.

Interpretation:

- \(S(a)\) says which four shell vertices were selected,
- \(D(a)\) says how those four vertices split into two diads.

This is the most minimal shell-level witness package.

---

# 2. Why \(W_0\) is too weak

By construction, \(W_0\) remembers only shell-side information:

- the chosen shell vertices,
- their split into two diads.

It does **not** remember:

- how remainder / ring-2 vertices attach to the shell,
- whether one shell vertex is more exposed to the remainder than another,
- whether one diad is remainder-heavier than the other,
- whether remainder attachment is within-diad or cross-diad,
- any organization of the outer layer.

So \(W_0\) throws away all remainder-side structure.

Therefore \(W_0\) can only be sufficient if remainder behavior is **forced** by shell+diad data alone.

No such rigidity statement has been established.

So the correct status is:

- \(W_0\) is a **coarse descriptor**,
- not a trusted working local witness package.

---

# 3. First refinement: add remainder data

This motivates the next rung:

\[
W_1(a) = (S(a), D(a), F_2(a))
\]

where \(F_2(a)\) is some remainder-side fingerprint.

At first, the weakest candidates for \(F_2\) were count-based, for example:

- per-shell exposure counts,
- diad-aware exposure counts.

These improve on \(W_0\), because they restore some outward information.

But they still only record **marginals**.

They do not record which incidences are realized by the same remainder vertex.

So they lose attachment correlation structure.

That means count-level remainder fingerprints are still not trustworthy as a full local witness term.

Their correct status is:

- better than \(W_0\),
- but still compressed and potentially lossy.

---

# 4. Stronger first-order refinement: attachment multiset

The next correct move is to record, for each remainder vertex \(r\), which subset of the shell it sees.

Define

\[
A(r) := N(r) \cap S(a).
\]

Then define the attachment multiset

\[
\mathcal{A}(a) = \{\!\{ A(r) : r \in R(a) \}\!\},
\]

where \(R(a)\) is the remainder vertex set relative to the shell.

This records:

- which shell-attachment subsets occur,
- with what multiplicity.

This is much stronger than exposure counts, because it captures actual attachment pattern rather than only shell-load marginals.

However, the raw multiset \(\mathcal{A}(a)\) may still be over-labeled, because shell labels that are already invisible under the shell/diad witness should not matter.

---

# 5. Correct first-order quotient: \(F_2^\sharp\)

Let

\[
\mathrm{Aut}(S(a), D(a))
\]

be the shell symmetry group preserving the diad partition.

Then define the first-order remainder signature

\[
F_2^\sharp(a) := [\mathcal{A}(a)]_{\mathrm{Aut}(S(a), D(a))}.
\]

Interpretation:

- two attachment multisets are identified if they differ only by symmetries already invisible in the shell+diad witness.

This is the right first-order quotient.

So the first serious candidate local witness is

\[
W_1^\sharp(a) = \bigl(S(a), D(a), F_2^\sharp(a)\bigr).
\]

Status:

- \(W_1^\sharp\) is the first **serious** local witness candidate,
- because it captures full first-order shell-facing remainder structure,
- modulo only the shell/diad symmetries already declared irrelevant.

---

# 6. Why \(W_1^\sharp\) may still be insufficient

Even \(W_1^\sharp\) only records how remainder vertices attach to the shell.

It does **not** record:

- adjacency among remainder vertices,
- whether remainder vertices lie in one outer component or several,
- whether equally attached remainder vertices are wired differently,
- any graph shape internal to the outer layer.

So \(W_1^\sharp\) captures **first-order docking**, but not **second-order outer organization**.

This means \(W_1^\sharp\) is sufficient only if “local witness” is intended to stop at first-order shell-facing incidence.

If the intended local chamber witness includes actual outward chamber organization, then a second-order term is necessary.

---

# 7. Second-order refinement: interaction signature \(C_2\)

A first compressed second-order term is obtained by grouping remainder vertices by shell-attachment class.

For each realized attachment class \(B \subseteq S(a)\), define

\[
R_B(a) := \{ r \in R(a) : A(r) = B \}.
\]

Then define:

- vertex counts
  \[
  n_B := |R_B(a)|
  \]

- internal edge counts
  \[
  m_{BB} := |E(R_B(a))|
  \]

- cross-class edge counts
  \[
  m_{BC} := |\{ \{r,r'\} \in E(R(a)) : r \in R_B(a),\ r' \in R_C(a) \}|
  \quad (B \neq C)
  \]

Collect these into the class-interaction object

\[
I(a) = \bigl(\{n_B\}, \{m_{BC}\}\bigr).
\]

Then define

\[
C_2(a) := [I(a)]_{\mathrm{Aut}(S(a), D(a))}.
\]

This records second-order structure in compressed form:

- how many remainder vertices belong to each shell-attachment class,
- how many edges lie within and between these classes.

This is a natural second-order summary.

So the next witness package is

\[
W_2(a) = \bigl(S(a), D(a), F_2^\sharp(a), C_2(a)\bigr).
\]

Status:

- \(W_2\) is a **compressed second-order descriptor**,
- stronger than \(W_1^\sharp\),
- but still potentially lossy.

---

# 8. Why \(C_2\) is still not fully faithful

The interaction signature \(C_2\) records only edge-count marginals between attachment classes.

It does **not** determine the actual graph shape within those classes or between them.

Examples of distinctions invisible to \(C_2\):

- two disjoint edges versus a 2-edge path inside one class,
- a matching versus a star between two classes,
- different component structure with identical class edge totals,
- different labeled remainder-graph isomorphism types sharing the same class counts.

So \(C_2\) detects some second-order distinctions, but not all.

Therefore \(W_2\) is useful but not guaranteed to be a faithful local chamber witness.

---

# 9. Full second-order refinement: \(C_2^\sharp\)

Let \(\mathcal{R}(a)\) be the decorated remainder graph:

- vertex set: \(R(a)\),
- each vertex labeled by its shell-attachment class \(A(r)\),
- edges inherited from the ambient graph among vertices in \(R(a)\).

Then define the full second-order orbit object

\[
C_2^\sharp(a) := [\mathcal{R}(a)]_{\mathrm{Aut}(S(a), D(a))}.
\]

Interpretation:

- this is the isomorphism class of the labeled remainder graph,
- modulo only the shell/diad symmetries already invisible in \((S,D)\).

This is the natural full second-order term.

So the serious second-order witness candidate is

\[
W_2^\sharp(a)
=
\bigl(
  S(a),
  D(a),
  F_2^\sharp(a),
  C_2^\sharp(a)
\bigr).
\]

Status:

- \(W_2^\sharp\) is the first **non-obviously-lossy second-order witness candidate**.

It is the natural point where the witness becomes faithful to actual outer-layer graph shape, at least at the remainder-layer level.

---

# 10. Ladder summary

The witness ladder is now:

## Rung 0
\[
W_0 = (S, D)
\]

Status:
- coarse shell descriptor,
- clearly too weak for a full local witness.

## Rung 1 (weak count versions)
\[
(S, D, \text{exposure counts})
\]

Status:
- restores some remainder information,
- but still only marginal and lossy.

## Rung 1 sharp
\[
W_1^\sharp = (S, D, F_2^\sharp)
\]

Status:
- first serious first-order witness candidate,
- captures shell-facing attachment structure.

## Rung 2 compressed
\[
W_2 = (S, D, F_2^\sharp, C_2)
\]

Status:
- compressed second-order descriptor,
- captures class interaction counts,
- still potentially lossy.

## Rung 2 sharp
\[
W_2^\sharp = (S, D, F_2^\sharp, C_2^\sharp)
\]

Status:
- first non-obviously-lossy second-order candidate,
- captures actual labeled remainder-layer graph shape modulo shell/diad symmetries.

---

# 11. Current honest conclusion

The most honest current position is:

1. \(W_0 = (S,D)\) is too weak to serve as the working local witness package.
2. Count-level remainder fingerprints are also too weak in general.
3. The first serious first-order candidate is
   \[
   W_1^\sharp = (S,D,F_2^\sharp).
   \]
4. If local witness identity is intended to include outward chamber organization, then \(W_1^\sharp\) is still incomplete.
5. A compressed second-order refinement is
   \[
   W_2 = (S,D,F_2^\sharp,C_2),
   \]
   but \(C_2\) is still only a class-level marginal summary.
6. The first serious second-order candidate is
   \[
   W_2^\sharp = (S,D,F_2^\sharp,C_2^\sharp).
   \]

So the witness ladder cleanly separates:

- shell structure,
- first-order docking structure,
- compressed outer interaction structure,
- full second-order outer graph structure.

---

# 12. Practical project language

In project terms:

- \(S\): the shell boundary,
- \(D\): the shell’s split into two diads,
- \(F_2^\sharp\): how the exterior docks onto that boundary,
- \(C_2\): aggregate interaction among the docked exterior classes,
- \(C_2^\sharp\): the actual outer chamber graph shape at the remainder layer.

This is likely spec-worthy, because it gives a principled hierarchy rather than an ad hoc list of signatures.

---

# 13. Suggested status labels

For README/spec language, the following status labels are clean:

- **descriptor**: useful summary but clearly lossy
- **compressed invariant candidate**: structured quotient that may still collapse distinct local machines
- **faithful candidate**: first object not obviously lossy at the intended order

Suggested assignment:

- \(W_0\): descriptor
- count-level \(F_2\): descriptor
- \(W_1^\sharp\): faithful first-order candidate
- \(W_2\): compressed second-order candidate
- \(W_2^\sharp\): faithful second-order candidate

---

# 14. Next work items

Natural next steps:

1. instantiate these definitions concretely on the actual AT4val[60,6] local chamber data,
2. test whether anchor collisions occur at the levels \(W_0\), \(W_1^\sharp\), \(W_2\), \(W_2^\sharp\),
3. determine whether \(W_2^\sharp\) is actually needed in practice, or whether \(W_2\) already separates all relevant anchors in the observed survey,
4. turn the ladder into canonicalization/spec language if implementation is next.

