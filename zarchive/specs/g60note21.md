Sheet/Frame Operator Model

State:
  chi=(f,h) in Z2^2

Generators:
  C(f,h)=(f+1,h)     # frame crossing
  A(f,h)=(f,h+1)     # sheet crossing
  P(f,h)=(f,h)       # preserving / dwell

Relations:
  C^2 = id
  A^2 = id
  CA = AC
  P = id on sector state

Parity:
  pi(f,h)=f+h mod 2

Classes:
  unprimed diagonal: (0,0)
  primed diagonal:   (1,1)
  off-diagonal:      (1,0), (0,1)

Priming:
  achieved exactly by two distinct informative crossings

Minimal priming words:
  CA, AC

Locking:
  priming followed by preserving tail P^r

Observable shadow in Q=MM^T:
  repeated residence on (1,1) appears as a terminal coherence block
