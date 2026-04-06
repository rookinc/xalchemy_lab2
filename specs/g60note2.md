# G60 Priming Note — Current Working Summary

## Context

We are treating the current local chamber console as a **G15/G30-capable local machine** built from:

- a coupler
- a shell 4-cycle
- a triad of diads
- a coarse state update rule

with coarse update

\[
\Pi(k,i,\sigma) = (\mathrm{nextPort}(k), \mathrm{nextSlot}(i), -\sigma)
\]

where:

- \(k \in Z_4\) is port
- \(i \in Z_3\) is slot
- \(\sigma \in Z_2\) is phase/sign

This gives a **12-step coarse closure** because \(4 \times 3 = 12\) and the sign flips each step.

The current seeded local witness at \(v0\) is:

- shell = \(\{v2,v3,v4,v5\}\)
- diads = \((v1,v8), (v6,v14), (v7,v9)\)

and the console presently realizes a chamberized local machine at this anchor.

---

## Locked distinction

We now distinguish three levels:

### 1. Local coarse closure
This is the current 12-step pump rule on \((k,i,\sigma)\).

This is already implemented and visible in the console.

### 2. Sign closure / doubled closure
Because phase flips on every step, one full 12-step walk returns the machine to the same coarse combinatorial position with opposite sign-parity bookkeeping, while a doubled walk restores the full sign convention.

This is the current **G30-style idea** already present in our framing:
- one cycle closes sign
- two cycles restore full identity

### 3. Global lock / G60
A true **G60 lock** is not obtained merely by repeating the coarse pump.
It requires that the walk accumulate enough structured information so that the machine does not collapse back into a merely local repeating orbit.

This is the new point:

> **G60 requires priming.**
> A bare pump recycles local combinatorics.
> A primed pump carries informative action.

---

## Core thesis

### Claim
The pump must be **primed by informative action** in order to lock at G60.

### Meaning
A bare periodic update on the coarse chamber coordinates is not sufficient to generate a genuine global witness cycle.

Without additional carried structure, the machine can:
- repeat
- oscillate
- sign-close
- or fold back into a smaller effective orbit

rather than producing a distinct global closure.

So the difference between:
- a local repeating chamber machine
and
- a globally locked G60 witness machine

is not just more steps.

It is the presence of **informative transport**.

---

## Definition: informative action

We use **informative action** to mean:

> an action of the machine that transports nontrivial structured witness data across steps, so that successive states are not merely re-labeled repeats of the same local chamber picture.

Equivalently:

A step is informative when it changes not only the coarse coordinates \((k,i,\sigma)\), but also carries forward some invariant-bearing payload that distinguishes position in the larger orbit.

Examples of such payload, in principle, include:

- attachment fingerprints
- remainder interaction structure
- transport class labels
- shell/diad incidence refinements
- affine witness displacement data
- any lawful observable that survives relabeling and accumulates along the walk

---

## Why the current full-graph placeholder does not yet lock

In the current full-graph placeholder survey:

- shells are present
- remainders are present
- outer-pair placeholders are present
- but chamberized diads are not yet derived
- attachment data is empty
- remainder edge data is empty
- interaction classes are trivial

So the current global census is structurally useful, but not yet informative enough to generate a genuine G60 lock.

What it currently shows is:

- many distinct local shell witnesses
- but no transported action payload
- therefore no demonstrated global witness transport law

That is why the system remains at:

- **structure first**
- **operation second**

and why global orbit claims are still deferred.

---

## Proposition

### Proposition (Priming Requirement for G60)
Let a chamber machine evolve under the coarse update rule

\[
\Pi(k,i,\sigma) = (\mathrm{nextPort}(k), \mathrm{nextSlot}(i), -\sigma).
\]

Then coarse periodicity alone does not guarantee a genuine G60 lock.
A G60 lock requires an additional transported witness structure \(I_t\) such that the extended evolution

\[
(k_t,i_t,\sigma_t,I_t) \mapsto (k_{t+1}, i_{t+1}, \sigma_{t+1}, I_{t+1})
\]

is not reducible to periodic repetition of the coarse chamber state alone.

In short:

\[
\text{G60} = \text{coarse pump} + \text{informative action}.
\]

---

## Proof sketch

### Step 1. Coarse rule alone is finite and periodic
The state space of \((k,i,\sigma)\) is finite:

\[
|Z_4| \cdot |Z_3| \cdot |Z_2| = 24.
\]

So iteration of the coarse rule alone must eventually repeat.

Thus bare coarse evolution cannot by itself certify a distinguished global lock; it only guarantees recurrence.

### Step 2. Recurrence is weaker than global closure
A repeated coarse state can mean:
- true global return
- sign-return only
- quotient return
- or collapse into a smaller effective orbit

So recurrence at the coarse level is insufficient to distinguish genuine G60 closure from local recycling.

### Step 3. A global lock needs extra state
To distinguish larger-orbit transport from local repetition, the machine must carry additional observable structure across steps.

This extra structure is the informative payload \(I_t\).

### Step 4. Therefore priming is necessary
If no such payload is transported, then the machine has no lawful way to tell whether it has advanced globally or merely repeated locally.

Hence a genuine G60 lock requires priming by informative action.

QED (working level)

---

## Operational interpretation

This gives us a clean engineering statement:

### Bare pump
The current console already has this.

It updates:
- port
- slot
- phase

and rotates the visible local chamber organization.

### Primed pump
The future G60-capable machine must additionally update and preserve a transported witness payload.

That payload must be derived from actual graph structure, not invented UI state.

So the engineering task is:

1. derive a nontrivial witness payload from the full graph
2. transport it lawfully across steps
3. verify that this payload distinguishes global orbit position
4. then test whether closure occurs only at the larger scale

---

## Present working formula

The current shorthand is:

\[
\boxed{\text{G60 lock} = \text{pump} + \text{informative action}}
\]

or more explicitly,

\[
\boxed{\text{global closure} \neq \text{mere coarse periodicity}}
\]

and

\[
\boxed{\text{a pump must be primed to lock globally}}
\]

---

## What this means for the next derivation

The next derivation is not "run more steps."

The next derivation is:

### Find the priming datum.

That means identifying the smallest lawful witness payload that:

- is graph-derived
- is transported step to step
- survives relabeling
- distinguishes local recurrence from global advance
- can serve as the informative component needed for G60 lock

Candidate directions already on the board include:

- shell/remainder attachment fingerprints
- diad transport classes
- paired-cell transport data
- affine witness displacement structure
- admissible-action observables

---

## Current status line

- G15/G30 local chamber logic: present
- 12-step coarse pump: present
- seeded local witness: present
- full-graph shell census: present
- chamberized global diads: not yet derived
- informative transport payload: not yet derived
- G60 lock: not yet established
- conceptual requirement for G60: now stated clearly

---

## One-sentence summary

A coarse chamber machine can cycle locally by rule alone, but a true G60 lock requires the pump to be primed with transported witness information; otherwise the system falls back into local recurrence instead of achieving global closure.
