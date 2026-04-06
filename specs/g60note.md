# G60 Primed Chamber Spec — Current Summary

## Status

Working derivation for a minimal **primed local chamber machine** that closes in exactly **60 steps** rather than collapsing to a shorter orbit.

This is currently a **lawful chamber-machine model** and a **working explanatory spec**. It is **not yet** a finalized intrinsic theorem about AT4val[60,6].

---

## Core idea

The current claim is:

> The pump must be primed in order to lock in at G60.
> Otherwise it falls back in on itself.

More precisely:

> It requires an informative action.

The interpretation is that a local chamber machine needs a **carried informational residue** so that the evolution law is not purely repetitive. Without that retained distinction, the machine collapses into a shorter orbit. With it, the orbit can extend to exact length 60.

---

## State space

A state is modeled as

\[
A_k = (c_k,\ a_k \to b_k,\ m_k,\ \epsilon_k)
\]

where:

- \(c_k \in \mathbb{Z}_3\) is the chamber/channel phase
- \(a_k \to b_k\) is an **ordered shell incidence** on the shell 4-cycle
- \(m_k \in \mathbb{Z}_3\) is the transported memory mark
- \(\epsilon_k \in \{+,-\}\) is the sign/phase

Shell vertices are modeled on \( \mathbb{Z}_4 \), so \(a_k,b_k \in \mathbb{Z}_4\).

Seed state:

\[
A_0 = (0,\ 0 \to 1,\ 0,\ +)
\]

---

## Displacement class

Define the incoming displacement

\[
d_k = b_k - a_k \pmod 4
\]

with values in

\[
d_k \in \{1,2,3\}
\]

Interpretation:

- \(d=1\): forward edge step
- \(d=2\): opposite jump
- \(d=3\): backward edge step

---

## Global update skeleton

At each step:

\[
c_{k+1} = c_k + 1 \pmod 3
\]

\[
\epsilon_{k+1} = -\epsilon_k
\]

The ordered incidence updates by transporting the head:

\[
(a_k,b_k) \mapsto (b_k,\ b_k + s(d_k,m_k,\epsilon_k))
\]

So the old target becomes the new source, and the next target is determined by a step law \(s\).

---

## Step law

### Positive phase

On \(+\), the machine repeats the incoming displacement:

\[
s(d,m,+)=d
\]

### Negative phase

On \(-\), the machine is rigid unless the memory mark is charged:

\[
s(d,m,-)=
\begin{cases}
d, & m \neq 2 \\
d^+, & m = 2
\end{cases}
\]

where \(d^+\) is the cyclic successor on \(\{1,2,3\}\):

\[
1^+=2,\quad 2^+=3,\quad 3^+=1
\]

Interpretation:

- positive phase = **carry**
- negative phase = **decision**
- only a charged memory mark triggers a nontrivial geometric kick

---

## Memory update law

### Positive phase

\[
m_{k+1} = m_k + \mu_+(d_k) \pmod 3
\]

with

\[
\mu_+(1)=0,\quad \mu_+(2)=0,\quad \mu_+(3)=2
\]

### Negative phase

\[
m_{k+1} = m_k + \mu_-(d_k) \pmod 3
\]

with

\[
\mu_-(1)=2,\quad \mu_-(2)=1,\quad \mu_-(3)=1
\]

---

## Full update law

Putting everything together:

\[
(c,a \to b,m,\epsilon)
\mapsto
\bigl(c+1,\ b \to (b+s(d,m,\epsilon)),\ m+\mu_\epsilon(d),\ -\epsilon\bigr)
\]

where

\[
d = b-a \pmod 4
\]

This is the current **minimal primed G60 law**.

---

## First orbit segment

Seed:

\[
A_0=(0,\ 0\to1,\ 0,\ +)
\]

Then:

\[
A_1=(1,\ 1\to2,\ 0,\ -)
\]

\[
A_2=(2,\ 2\to3,\ 2,\ +)
\]

\[
A_3=(0,\ 3\to0,\ 2,\ -)
\]

\[
A_4=(1,\ 0\to2,\ 1,\ +)
\]

\[
A_5=(2,\ 2\to0,\ 1,\ -)
\]

\[
A_6=(0,\ 0\to2,\ 2,\ +)
\]

\[
A_7=(1,\ 2\to0,\ 2,\ -)
\]

\[
A_8=(2,\ 0\to3,\ 0,\ +)
\]

\[
A_9=(0,\ 3\to2,\ 2,\ -)
\]

\[
A_{10}=(1,\ 2\to3,\ 0,\ +)
\]

\[
A_{11}=(2,\ 3\to0,\ 0,\ -)
\]

\[
A_{12}=(0,\ 0\to1,\ 2,\ +)
\]

Key observation:

After 12 steps, the ordered incidence has returned to the seed incidence, but the memory mark has **not** returned. That is the present anti-collapse mechanism.

---

## Closure claim

The current working closure claim is:

\[
A_{60}=A_0=(0,\ 0\to1,\ 0,\ +)
\]

So the machine has exact orbit length

\[
\boxed{60}
\]

This is the current working meaning of **G60** in the primed chamber model.

---

## Interpretation

This law supports the reading:

- **Positive phase** = carry
- **Negative phase** = decision
- **Memory mark** = transported informational residue
- **Kick event** = informative action altering future transport

So the machine does not achieve G60 merely by having more motion. It achieves G60 because a retained informational residue occasionally changes the rule of motion itself.

That is the current precise meaning of:

> It requires an informative action.

---

## Locked working statement

A local chamber machine with state space

\[
\mathbb{Z}_3 \times \mathrm{OrdInc}(C_4) \times \mathbb{Z}_3 \times \mathbb{Z}_2
\]

admits an exact 60-cycle when:

1. the chamber coordinate advances mod 3
2. sign flips each step
3. ordered shell incidence transports by the current displacement
4. the negative phase applies a memory-gated successor kick when the memory mark equals 2
5. the transported memory mark updates by phase-sensitive displacement residue rules

In this sense, a **single carried informational residue** is sufficient to lift the local chamber machine from a shorter collapsing orbit into a full G60 orbit.

---

## Current caution

This should currently be treated as:

- a lawful chamber-machine construction
- a successful working G60 model
- a strong explanatory candidate
- **not yet** a graph-intrinsic theorem about AT4val[60,6]

So at present it lives on the **model/spec** side, not yet the fully proved **intrinsic invariant** side.

---

## Immediate next tasks

1. Rewrite as a theorem/proposition
2. Produce the full 60-state transition table
3. Separate primitive structure from derived structure
4. Separate intrinsic content from presentation-dependent content
5. Relate the primed chamber law back to the AT4val[60,6] witness language
