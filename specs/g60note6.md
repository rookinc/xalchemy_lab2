# Hidden sheet-frame lift

Let the full lifted witness state be

\[
\mathcal W_t = (Q_t,\chi_t),
\qquad
Q_t = M_tM_t^{\mathsf T},
\qquad
\chi_t=(s_t,f_t)\in \mathbb Z_2^2.
\]

Interpretation:
- \(Q_t\) is the visible lens image.
- \(s_t\) is the hidden sheet bit.
- \(f_t\) is the hidden frame bit.

## Hidden transport law

A machine move \(g\) acts on the hidden register by an affine map

\[
\chi \mapsto A_g \chi + b_g
\]

over \(\mathbb Z_2\).

The simplest specialization is additive transport:

\[
\chi \mapsto \chi + \delta_g,
\qquad
\delta_g \in \mathbb Z_2^2.
\]

Meaning:
- \((0,0)\): preserves sheet and frame
- \((1,0)\): toggles sheet
- \((0,1)\): toggles frame
- \((1,1)\): toggles both

For a path \(g_1,\dots,g_n\),

\[
\chi_n = \chi_0 + \sum_{k=1}^n \delta_{g_k}.
\]

## Informative action

A move is informative iff it changes hidden residue:

\[
\delta_g \neq (0,0).
\]

A path is informative iff its total hidden displacement is nonzero:

\[
\Delta(\gamma)=\sum_{g\in\gamma}\delta_g \neq (0,0).
\]

Primed means nontrivial residue:

\[
\mathrm{Primed}(\chi)\iff \chi\neq(0,0).
\]

## Closure principle

Visible closure does not imply lifted closure.

True closure requires both:
\[
Q_{t+n}=Q_t
\quad\text{and}\quad
\chi_{t+n}=\chi_t.
\]

In the additive model this becomes:
\[
Q_{t+n}=Q_t
\quad\text{and}\quad
\sum_{k=t}^{t+n-1}\delta_{g_k}=(0,0).
\]

So the lens may close before the hidden sheet-frame lift closes.
