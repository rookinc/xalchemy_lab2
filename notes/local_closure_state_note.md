# Local Closure State Note
## Working legend for theorem-side sector derivation

## Current position

The theorem sector rows are not being explained well by:
- raw rooted Petrie unions
- raw transition support
- simple edge-local rules on G15

The more promising direction is a rooted local chamber grammar.

The hand sketches suggest that the relevant object is not "a cycle" first.
It is a local closure state.

---

## Proposed local closure-state ladder

We introduce the following rooted local states.

### State 0: null
No local support present.

Symbolically:
- empty
- no occupied chamber content

### State 1: point
A single occupied point / incident presence.

Interpretation:
- first local activation
- one anchored contact only

### State 2: segment
Two-point connected support.

Interpretation:
- first genuine link
- minimal coupler state

### State 3: open wedge
A two-branch open support.

Interpretation:
- bifurcating local support
- not yet closed

### State 4: closed triangle
First closed local chamber.

Interpretation:
- minimal closure
- local cycle achieved

### State 5: loaded closure
Closed triangle with attached continuation / active tail.

Interpretation:
- closure plus propagation
- closed support with directed continuation

---

## Working interpretation

The theorem columns may be better understood as rooted chamber states relative to a distinguished anchor system, not as raw edges first.

The theorem rows may then be selected by a rule of the form:

S(root) = { columns whose rooted local closure-state lies in an allowed state family }

This would explain why:
- the theorem rows are crisp
- the column order already has strong block anatomy
- the rooted Petrie support is related but too coarse

---

## Block anatomy already observed

The 30 columns decompose into five anchor-incidence strata relative to {0,1,2}:

- B0 = contains none of {0,1,2}
- B1 = contains 2 only
- B2 = contains 1 only
- B3 = contains 0 only
- B4 = contains all of {0,1,2}

The theorem rows then fall into clean block vectors, including:
- anchor rows:
  - row 0 = [0,0,0,5,9]
  - row 1 = [0,0,5,0,9]
  - row 2 = [0,5,0,0,9]
- non-anchor species:
  - [4,3,3,2,2]
  - [4,3,2,3,2]
  - [3,5,1,1,4]
  - [3,1,5,1,4]
  - [3,1,1,5,4]

This suggests that the theorem rows are chamber-state selectors over the five block strata.

---

## New target lemma

### Local Closure Sector Lemma
For each theorem root, there is a rooted local closure-state rule on the column chambers such that the resulting selected columns reproduce the theorem row support.

This becomes the new theorem-side target.

---

## Immediate next question

For each theorem column:
- what local rooted chamber-state does it encode relative to the anchor triple?
- and how do the row classes select among those states?

That is the next derivation front.

