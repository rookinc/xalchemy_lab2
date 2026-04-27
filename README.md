ZY UNIVERSE KERNEL — BASELINE NOTE

Status
- Kernel is live.
- Solo packet locks.
- Shared packet locks.
- Shared collapsed, semistructured, and structured+x-echo all converge to the same local fixed point.

Core roles
- I = locked informative vertex
- x, y, z = trinary operators
- T / t = execution phases of the animation, not static geometry
- R = continuation direction / inherited direction class

Current local law
- Vertex identity locks pre-sheet.
- Face chirality is assigned afterward.
- Lock occurs on completion of operator packet {x,y,z}.
- Sheet memory is tracked separately and read out as bias after lock.
- Faces are signed from operator order plus closure polarity.

Current fixed point
- class census = (('K_R_2_top', 1),)
- sign census  = (('+', 1), ('-', 2))

Interpretation
- The local attractor is one promoted chamber of class K_R_2_top.
- Its local face fan stabilizes as one positive face and two negative faces.
- This repeats immediately from round 0 to round 1 onward in all current shared modes.

Mode results
- collapsed: repeats
- semistructured: repeats
- structured + x-forward echo: repeats

Meaning
- Exploratory routing, reconciled routing, and shared joint routing all collapse to the same lazy-universe local regime.
- The kernel currently prefers the minimum stable chamber completion and does not branch further once the packet resolves.

Important conceptual split
- Vertices are pre-sheet identities.
- Faces carry chirality.
- Closure polarity belongs to realized faces, not bare vertex identity.

Current baseline sentence
- The lazy-universe kernel stabilizes to a local chamber attractor K_R_2_top with a persistent face-sign census of one positive and two negative faces.

Next perturbations to test
1. inherited_direction = L instead of R
2. change z sheet tendency
3. alter face fan for K_R_* classes
4. remove x-forward echo from structured mode
5. change t2 routing bias for y
6. allow more than one promoted winner per round
7. increase shared field size beyond one promoted chamber

Baseline file
- graph_generator/packet_kernel.py

Baseline rule to preserve before perturbing
- If a change breaks repetition of:
  class census = (('K_R_2_top', 1),)
    sign census  = (('+', 1), ('-', 2))
      then that change has altered the current lazy-universe attractor.
