# G15 transport state machine

This file is the anti-drift anchor for the lifted transport law.

## Core statement

The true transport walk is a **G30 lifted-state walk**.

The visible G15 walk is its **forgetful shadow**.

## Canonical lifted state

The transport state is:

- `frame`
- `phase`
- `sheet`

where:

- `frame` is position on the 15-step core register
- `phase` is the subjective/objective toggle
- `sheet` is the lift/sign/orientation memory retained by G30 and forgotten by G15

## Forgetful boundary

The projection

- `G30 -> G15`

forgets `sheet`.

So G15 is not the full transport law. It is only the shadow of the lifted law.

## Cycle law

One full G15 traversal:

- restores `frame`
- preserves `phase`
- flips `sheet`

This is the sign-closing rule:

- `n_15 = -n_0`

Two full G15 traversals:

- restore `frame`
- preserve `phase`
- restore `sheet`

This is the identity-closing rule:

- `n_30 = n_0`

## Human interpretation

The first full walk gets you to the corresponding position on the inverse face, but does not yet restore orientation identity.

The second full walk corrects the orientation and restores identity.

## House / shell reading

The transport shell is read through:

- upstairs
- downstairs
- stairs

In cube lens:

- `v0` is the stairs midpoint / cube centroid
- the stairs are the distinguished overlap region
- the walk starts on the stairs
- after one full walk, the inverse-face counterpart is reached
- after the second full walk, orientation is corrected

## Render rule

A shell page must not treat the transport as a pure G15 vertex walk when the intended law depends on `sheet`.

Use:

- **G15 lens** for the forgetful shadow
- **G30 lens** for the lifted truth

## Relation to other specs

- `theorem_object.json` anchors the exact kernel object `M` and `Q`
- `transport_shell_grammar.json` anchors the shell interpretation
- `transport_cocycle.json` anchors the overlap/transition law
- this file anchors the lifted transport walk that binds them together
