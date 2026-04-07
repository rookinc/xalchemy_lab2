# G15 transport shell grammar

This file is the anti-drift anchor for the transport shell page.

## Core interpretation

The G15 transport shell is not to be treated as a generic graph in a box.

It is a sheeted transport system with:

- an upstairs
- a downstairs
- stairs in between

## Shell anchors

The 15 anchors are:

- 8 cube corners
- 6 face centroids
- 1 cube centroid

## Walk interpretation

The colored traces represent the walk through 3 sectors.

The walk has:

- 2 lifts
- 3 descents

## Color legend

- green = upstairs walk
- orange = stairs / middle crossing
- blue = downstairs walk

## Render priority

The page should prioritize:

1. sheet geometry
2. stairs
3. walk
4. graph scaffold

The graph scaffold is supporting structure, not the primary meaning.

## Lens rule

There are multiple visual lenses.

### Sheet lens
Preserves the tilted sheet geometry for analysis.

### Tetra lens
Reinterprets the shell as a tetrahedral decomposition:

- 4 tetra corners
- 6 edge midpoints
- 4 face centroids
- 1 tetra centroid

In tetra lens:

- **v0 is the tetra centroid**
- the shell is read as a simplex-style incidence scaffold

This is a **visual shell assignment only**.  
It is **not** a renumbering of the exact theorem object rows in the transport matrix.

### Cube lens
Flattens the reading into a cube-first teaching view.

In cube lens:

- **v0 is the stairs midpoint**
- that stairs midpoint **coincides with the cube centroid**
- the walk is read as **starting and stopping on the stairs**

This is a **visual shell assignment only**.  
It is **not** a renumbering of the exact theorem object rows in the transport matrix.

## Register bridge

This shell grammar is intended to bridge the existing W-X-Y-Z-T-I register/frontier grammar into the transport-shell rendering without replacing that deeper grammar.

## Anti-drift rules

- Do not reinterpret the shell as a generic graph-only diagram.
- Do not demote upstairs/downstairs/stairs to incidental styling.
- Do not remove the 15-anchor shell ontology.
- Do not treat the colored traces as arbitrary decoration.
- Do not treat lens anchor assignments as theorem-object renumberings.
- Do not treat tetra-lens anchor assignments as theorem-object renumberings.
- In cube lens, preserve v0 as the distinguished stairs midpoint / cube centroid anchor.
