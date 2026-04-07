# G15 transport face projection

This file records the point that the tetrahedral face pattern is a projection property of the transport object, not a camera artifact.

## Core claim

Faces belong to the projection, not to the camera.

## Context

The construction begins with local transport on dodecahedral flags, passes through the quotient tower

- G60
- G30
- G15

and becomes algebraically legible on the quotient core

- `G15 ≅ L(Petersen)`

The paper separates two companion structures:

- the sector overlap geometry on `G15`, encoded by `M` and `Q = MM^T`
- the signed 2-lift / cocycle carried by `G30 -> G15`

So projection must be placed after transport and quotient, not after camera choice. 0

## Projection law

Under admissible projections, the transport object exhibits a stable tetrahedral 3-plus-1 face decomposition:

- `F0`, `F1`, `F2` are manifest faces
- `F3` is the closure face

This means the object is read as:

- three faces assembling first
- one face folding in to complete tetrahedral closure

## What the camera does

The camera only chooses an observer orientation.

It may change:

- which face appears left or right
- which face is foregrounded
- how obvious the closure process looks

It does not change:

- which face is the closure face
- the existence of the manifest triad
- the underlying 3-plus-1 decomposition

So the correct rule is:

the camera reveals; the projection defines.

## Lens stability

The same 3-plus-1 decomposition should persist across admissible lenses:

- tetra lens
- cube lens
- sheet lens
- signed-lift lens

A lens may distort or emphasize different parts of the structure, but it should not invent a different primitive face decomposition.

## Layer order

The correct order is:

1. local dodecahedral transport
2. G60 chamber graph
3. G30 lifted transport memory
4. G15 quotient core
5. projection into face structure
6. lens rendering
7. camera orientation

This keeps the causal order correct.

## Relation to chirality

This file does not define chirality.

Chirality belongs to oriented transport retained by the lift. It is not a camera property and not a primitive raw face label.

## Renderer checks

The renderer should satisfy these tests:

- changing camera must not reassign the closure face
- changing lens must preserve the 3-plus-1 decomposition up to distortion
- a face label may move on screen without changing projection role
- the closure face may become clearer or less clear, but it must not be reassigned by viewpoint alone

## Short form

- the camera reveals; the projection defines
- three assemble, one closes
- faces are projection properties
- camera is orientation only
