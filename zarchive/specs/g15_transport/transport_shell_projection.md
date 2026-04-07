# G15 transport shell projection

This file is the companion projection spec for the lifted transport state machine.

## Core statement

The shell page should render a projection of the lifted G30 transport state.

It should not invent an independent walk law.

## Input state

The lifted transport state is:

- `frame`
- `phase`
- `sheet`

## Output shell state

The shell page should derive and render:

- `region`
- `anchor`
- `inverse anchor`
- `orientation class`
- `lens anchor role`

## Region reading

The shell is read through:

- upstairs
- downstairs
- stairs

The stairs are the distinguished overlap region where lift/sign memory is most legible.

## Sheet reading

The shell must treat `sheet` as inverse-face memory.

- `sheet = +` means base face / present face orientation
- `sheet = -` means inverse face / sign-flipped orientation

This is not cosmetic styling.

## Anchor reading

`frame` is the primary register position.

A shell page should map `frame` to a shell anchor and then, when needed, to the corresponding inverse-face counterpart.

## Cube lens rule

In cube lens:

- `v0` is the distinguished stairs midpoint / cube centroid anchor

This override must remain stable.

## First and second full walks

### First full walk
Starting from a lifted state with `sheet = +`, one full G15 traversal preserves `frame`, preserves `phase`, and flips `sheet`.

In shell language:

- the same projected frame class is seen
- but the inverse-face counterpart is reached
- orientation is not yet identity-restored

### Second full walk
The second full traversal restores `sheet`.

In shell language:

- orientation is corrected
- identity is restored

## Render rule

A shell page must show, either explicitly or by faithful projection:

- region
- anchor
- sheet memory or its absence
- distinguished stairs behavior

A shell page must not assume that a pure G15 walk is the full law.

## Relation to other specs

- `transport_state_machine.json` defines the lifted walk law
- `transport_shell_grammar.json` defines the shell ontology
- `transport_cocycle.json` defines the overlap/transition law
- this file defines how the lifted walk lands on the shell
