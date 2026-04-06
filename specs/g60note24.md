Minimal local chamber state machine

State:
  S=(u,chi,ell)
  u in Z60
  chi in Z2^2
  ell in {0,1}

Events:
  P = preserving
  C = frame crossing
  A = sheet crossing

Update:
  u' = u+1 mod 60

  chi' = chi           if event=P
  chi' = chi+(1,0)     if event=C
  chi' = chi+(0,1)     if event=A
  (mod 2)

Primed state:
  chi=(1,1)

Lock rule:
  lock may activate only from primed state under preserving action
  lock persists only while chi=(1,1)

Named chamber states:
  N  = ((0,0),0)
  DF = ((1,0),0)
  DS = ((0,1),0)
  P  = ((1,1),0)
  L  = ((1,1),1)

Closure depths:
  G15  = sign depth
  G30  = identity depth
  G60  = hidden orbit depth

Strong forms:
  primed G60 = G60 with chi=(1,1)
  locked G60 = G60 with chi=(1,1) and ell=1
