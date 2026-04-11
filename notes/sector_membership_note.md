# Sector Membership Note
## Working note for the Thalean project

## Current conclusion

The edge-to-column bridge is not recoverable from simple edge-local data on G15 alone.

What is trustworthy:
- the graph G15
- the cocycle on the 30 edges of G15
- the 15 row sectors encoded by M
- the fact that row intersections reproduce Q exactly

What failed:
- naive local edge rules
- local distance-type rules
- simple line-graph recovery
- weak assignment without a real sector law

So the correct pivot is:

**derive sector membership first.**

Columns should not be treated as primary.
Columns should emerge from edge incidence across the 15 sectors.

---

## Primary object

For each core vertex x in G15, define a sector

S(x) ⊆ E(G15)

such that:
- |S(x)| = 14
- |S(x) ∩ S(y)| = Q_xy
- rows of M are the characteristic vectors of the sectors S(x)

This is the real missing lemma.

---

## New target lemma

### Sector Membership Lemma
There exists a lawful transport-side criterion deciding, for each core vertex x and each colored edge e of G15, whether e ∈ S(x), and this criterion reproduces the 15 row supports of M.

If this is derived, then:
- rows are explained
- columns become automatic
- the edge-to-column bridge becomes bookkeeping
- sigma alignment becomes downstream

---

## Why this is the right move

The experiments already established:

1. graph-only rules are too coarse
2. graph+cocycle local rules are still not enough
3. the rows are exact and stable

So the construction should proceed:

transport law -> sectors -> columns -> signed column order -> Q_sigma

not:

edge heuristics -> guessed columns

---

## Practical program

### Step 1
Treat each row of M as the characteristic vector of an unknown sector S(x).

### Step 2
Work transport-side:
ask what property of the AT4val[60,6] transport system makes an edge of G15 belong to S(x).

### Step 3
Once S(x) is known for all 15 x:
- recover each column as the set of x such that e ∈ S(x)

### Step 4
Use the cocycle values on the already-known G15 edges to align sigma with the recovered column order.

---

## Immediate next question

For a fixed core vertex x:
what transport-side condition selects exactly 14 of the 30 G15 edges?

That is the next real question.

