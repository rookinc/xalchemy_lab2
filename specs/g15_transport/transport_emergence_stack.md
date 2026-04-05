# G15 transport emergence stack

This file states where faces and chirality emerge in the transport stack.

## Core claim

Faces emerge at projection.

Chirality emerges at transport.

## Layer 1: G15 kernel

The G15 kernel provides:

- vertices
- edges
- distance classes
- the exact transport matrix `M`
- the Gram matrix `Q`

This is the combinatorial kernel.

At this layer:

- faces are not yet intrinsic
- chirality is not yet primary

So G15 gives exact structure, but not yet the full shell face story.

## Layer 2: shell projection

Faces become legible when the lifted state is projected into the shell as:

- upstairs
- downstairs
- stairs
- inverse face
- distinguished anchors

At this layer:

- faces emerge
- chirality is only preparatory

So a face is not just an edge pattern. A face is a projected side of the lifted transport state.

## Layer 3: G30 lift

The lifted transport state keeps:

- frame
- phase
- sheet

This is where oriented transport becomes lawful.

At this layer:

- the distinction between present face and inverse face is retained
- one traversal can flip sheet
- two traversals can restore identity

So chirality emerges here, because transport now remembers how it crossed.

## Layer 4: G60 host

G60 adds:

- host_pass

This does not create a new local chirality.

Instead, it orders face and chirality events across the full host chronology.

So G60 is the chronology layer.

## Definitions

### Face
A face is a projected side of the lifted transport state.

### Chirality
Chirality is the retained memory of how transport crosses between sides.

## Rules

- Do not claim that bare G15 adjacency already fixes the face ontology.
- Do not treat chirality as mere styling.
- Do not define chirality before sheet memory is retained.
- Do not treat G60 as a source of new local chirality.

## Relation to other specs

- `theorem_object.json` anchors the exact kernel object
- `transport_shell_grammar.json` anchors the shell face interpretation
- `transport_state_machine.json` anchors the lifted G30 law
- `transport_host_state_machine.json` anchors the G60 host chronology
- `transport_cocycle.json` anchors overlap and loop-memory transitions

## Short forms

- faces emerge at projection
- chirality emerges at transport
- G15 gives kernel
- shell gives sides
- G30 gives handed transport
- G60 gives chronology
