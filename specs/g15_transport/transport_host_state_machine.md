# G15 transport host state machine

This file is the host-scale companion to the lifted transport state machine.

## Core statement

G60 is the host chronology of the lifted transport law.

It does not replace G15 or G30.

Instead:

- G15 gives sign closure
- G30 gives identity closure
- G60 gives host closure

## Canonical host state

The host state is:

- `frame`
- `phase`
- `sheet`
- `host_pass`

where:

- `frame` is the 15-step core register position
- `phase` is the subjective/objective toggle
- `sheet` is the lifted sign/orientation memory
- `host_pass` tells us which 15-step quarter of the 60-step host cycle we are in

## Quotient stack

The stack is:

- `G60 -> G30` by forgetting `host_pass`
- `G30 -> G15` by forgetting `sheet`

So:

- G15 is the shadow
- G30 is the lifted truth
- G60 is the ordered host chronology of that lifted truth

## Cycle landmarks

### Step 15
One full G15 traversal:

- restores `frame`
- preserves `phase`
- flips `sheet`
- advances `host_pass`

This is sign closure:

- `n_15 = -n_0`

### Step 30
Two full G15 traversals:

- restore `frame`
- preserve `phase`
- restore `sheet`

This is identity closure:

- `n_30 = n_0`

### Step 45
Three full G15 traversals place the walk in the third host quarter.

This mirrors the sign-flipped closure at the higher host level.

### Step 60
Four full G15 traversals:

- restore `frame`
- preserve `phase`
- restore `sheet`
- restore `host_pass`

This is full host closure.

## Human reading

The progression is:

- first pass: sign flips
- second pass: identity restored
- third pass: higher-order return
- fourth pass: host closure

So G60 is not “more random walking.”

It is the same transport law ordered into a 60-step host chronology.

## Render rule

A G60-aware shell page should show:

- `frame`
- `phase`
- `sheet`
- `host_pass`
- `region`

It should not try to explain G60 as merely hitting more G15 edges.

## Lens guidance

- **tetra** is the best default host-scale lens
- **cube** is the best teaching lens
- **sheet** is the best analysis lens
- **signed-lift** is the best cocycle-memory lens

## Anti-drift rule

Do not model G60 without an explicit host chronology coordinate.

That coordinate is `host_pass`, or something equivalent.
