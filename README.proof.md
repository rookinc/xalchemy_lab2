# Proof Pipeline Notes

## What this is
This repository contains a verification-first proof scaffold for the canonical transport object.

## Official command
Run:

    python3 proof/verify.py

This regenerates the machine verification report in reports/.

## What is actually proved here
The current proof layer mechanically checks that:

- M is a 15x30 binary matrix.
- Every row of M has sum 14.
- Every column of M has sum 7.
- Q = M M^T.
- The off-diagonal overlap spectrum of Q is exactly {4:15, 5:60, 9:30}.
- The overlap-9 derived graph is connected, 4-regular, and has diameter 3.
- The ordered distance-count profile of the overlap-9 graph is exactly {0:15, 1:60, 2:120, 3:30}.
- The exported adjacency and distance matrices of the overlap-9 graph are symmetric, have zero diagonal, and the adjacency matrix has constant row sum 4.
- If A is the overlap-9 adjacency matrix derived from Q, then Q = A^3 + 2A^2 + 2I.
- After centering and normalization of the row vectors of M, the induced spherical configuration has exactly three off-diagonal inner products: 37/112, -23/112, and -38/112.
- A theorem-facing Z2-valued cocycle representative is fixed on the active overlap-9 graph edge set.
- The cocycle representative has 10 parallel edges and 20 crossed edges.
- Within its switching class, the cocycle has minimal support size 6.
- The cocycle has odd-holonomy witness cycles and is therefore nontrivial.

## Exact witness artifacts
- theorem/theorem_object.json is the canonical theorem object.
- theorem/cpsat_exact_solution.json is a truthful reconstructed exact witness artifact derived from the canonical theorem object.
- theorem/reconstruction_note.json explains the reconstruction status and limits.
- theorem/cocycle_data.json is the active theorem-facing cocycle representative.
- theorem/cocycle_status.json records cocycle-layer verification status.

## Boundary
- theorem/ contains theorem-facing artifacts.
- checkers/ contains machine checks.
- reports/ contains generated verification outputs.
- proof/verify.py is the official wrapper command.
- public_html/ remains the public site and demo surface.

## Current stance
This is currently a verified witness pipeline with a verified cocycle companion layer, not yet a fully reproduced historical generator pipeline.

## Provenance status
The original upstream CP-SAT artifact was not recovered.
A truthful reconstructed exact witness artifact now exists at theorem/cpsat_exact_solution.json.

## Demo boundary
The public G60 PHP/JS console is a visualization layer, not the proof kernel.

## Interpretive boundary
The cocycle is no longer just narrative in this repo: a fixed representative, switching-minimality, and odd-holonomy nontriviality are now machine-checked.
