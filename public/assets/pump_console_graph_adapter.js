import { getModeRecord, getPhaseRecord } from '/assets/pump_console_frames.js';

let graphCache = null;

async function loadGraphState() {
  if (graphCache) return graphCache;
  const res = await fetch('/assets/data/pump_graph_state.json');
  if (!res.ok) {
    throw new Error(`failed to load graph state: ${res.status}`);
  }
  graphCache = await res.json();
  return graphCache;
}

function rotate(list, shift) {
  const n = list.length;
  return list.map((_, i) => list[(i + shift) % n]);
}

function slotMetaFor(activeSlot) {
  const base = [
    { slotKey: 'D0', slotName: 'Upstream' },
    { slotKey: 'D1', slotName: 'Crossflow' },
    { slotKey: 'D2', slotName: 'Downstream' }
  ];
  return rotate(base, activeSlot);
}

function neighborsOf(snapshot, vertex) {
  const adjacency = snapshot?.adjacency ?? {};
  return adjacency[vertex] ?? [];
}

function edgeExists(snapshot, a, b) {
  const nbrs = new Set(neighborsOf(snapshot, a));
  return nbrs.has(b);
}

function pairKey(a, b) {
  return [a, b].slice().sort().join('|');
}

function allPairs(vertices) {
  const out = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      out.push([vertices[i], vertices[j]]);
    }
  }
  return out;
}

function allQuads(vertices) {
  const out = [];
  for (let a = 0; a < vertices.length; a += 1) {
    for (let b = a + 1; b < vertices.length; b += 1) {
      for (let c = b + 1; c < vertices.length; c += 1) {
        for (let d = c + 1; d < vertices.length; d += 1) {
          out.push([vertices[a], vertices[b], vertices[c], vertices[d]]);
        }
      }
    }
  }
  return out;
}

function cycleOrderForQuad(snapshot, quad) {
  const edges = new Set(
    allPairs(quad)
      .filter(([a, b]) => edgeExists(snapshot, a, b))
      .map(([a, b]) => pairKey(a, b))
  );

  if (edges.size !== 4) return null;

  const deg = Object.fromEntries(quad.map(v => [v, 0]));
  for (const key of edges) {
    const [a, b] = key.split('|');
    deg[a] += 1;
    deg[b] += 1;
  }

  if (!quad.every(v => deg[v] === 2)) return null;

  const start = quad.slice().sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)))[0];
  const ordered = [start];
  let prev = null;
  let curr = start;

  for (let step = 0; step < quad.length - 1; step += 1) {
    const nextCandidates = quad.filter(v => v !== curr && edgeExists(snapshot, curr, v) && v !== prev);
    if (nextCandidates.length === 0) return null;
    nextCandidates.sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)));
    const next = nextCandidates[0];
    ordered.push(next);
    prev = curr;
    curr = next;
  }

  if (!edgeExists(snapshot, ordered[ordered.length - 1], ordered[0])) return null;
  if (new Set(ordered).size !== 4) return null;

  return ordered;
}

function deriveShellCandidates(snapshot, coupler) {
  const couplerNeighbors = neighborsOf(snapshot, coupler);
  const quads = allQuads(couplerNeighbors);

  const scored = quads.map(quad => {
    const cycle = cycleOrderForQuad(snapshot, quad);
    const internalEdges = allPairs(quad).filter(([a, b]) => edgeExists(snapshot, a, b)).length;
    return {
      quad,
      cycle,
      score: cycle ? 100 + internalEdges : internalEdges
    };
  });

  scored.sort((x, y) => y.score - x.score);

  const best = scored[0];
  if (!best || !best.cycle) {
    return {
      shellBase: [],
      shellSource: 'adjacency-cycle/not-found'
    };
  }

  return {
    shellBase: best.cycle,
    shellSource: 'adjacency-cycle/discovered'
  };
}

function deriveShell(snapshot, coupler, hostMode) {
  const shellCandidates = deriveShellCandidates(snapshot, coupler);
  if (shellCandidates.shellBase.length !== 4) {
    return {
      shell: shellCandidates.shellBase,
      shellBase: shellCandidates.shellBase,
      shellSource: shellCandidates.shellSource
    };
  }

  return {
    shell: rotate(shellCandidates.shellBase, hostMode),
    shellBase: shellCandidates.shellBase,
    shellSource: `${shellCandidates.shellSource}/rotated`
  };
}

function shellTouchSignature(snapshot, vertex, shellBase) {
  const shellSet = new Set(shellBase);
  const nbrs = new Set(neighborsOf(snapshot, vertex));
  return shellBase.filter(v => shellSet.has(v) && nbrs.has(v));
}

function signatureDistance(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let shared = 0;
  for (const x of A) if (B.has(x)) shared += 1;
  return (a.length + b.length - 2 * shared);
}

function generatePerfectMatchings(vertices) {
  if (vertices.length === 0) return [[]];

  const [first, ...rest] = vertices;
  const out = [];

  for (let i = 0; i < rest.length; i += 1) {
    const partner = rest[i];
    const remaining = rest.filter((_, idx) => idx !== i);
    const pair = [first, partner].slice().sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)));
    const tails = generatePerfectMatchings(remaining);

    for (const tail of tails) {
      out.push([pair, ...tail]);
    }
  }

  return out;
}

function normalizeMatching(matching) {
  return matching
    .map(pair => pair.slice().sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))))
    .sort((p, q) => Number(p[0].slice(1)) - Number(q[0].slice(1)));
}

function scorePair(snapshot, pair, shellBase) {
  const [a, b] = pair;
  const edgePenalty = edgeExists(snapshot, a, b) ? -5 : 5;

  const sigA = shellTouchSignature(snapshot, a, shellBase);
  const sigB = shellTouchSignature(snapshot, b, shellBase);

  const balanceReward = (sigA.length === 2 && sigB.length === 2) ? 2 : 0;
  const complementReward = signatureDistance(sigA, sigB);
  const distinctReward = pair[0] !== pair[1] ? 1 : -100;

  return edgePenalty + balanceReward + complementReward + distinctReward;
}

function scoreMatching(snapshot, matching, shellBase) {
  let total = 0;
  for (const pair of matching) {
    total += scorePair(snapshot, pair, shellBase);
  }
  return total;
}

function deriveRawDiads(snapshot, coupler, shellBase) {
  const couplerNeighbors = neighborsOf(snapshot, coupler);
  const shellSet = new Set(shellBase);
  const nonShell = couplerNeighbors
    .filter(v => !shellSet.has(v))
    .slice()
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

  if (nonShell.length !== 6) {
    return {
      rawDiads: [],
      diadSource: 'adjacency-matching/incomplete',
      matchingScore: null
    };
  }

  const matchings = generatePerfectMatchings(nonShell).map(normalizeMatching);

  let best = null;
  for (const matching of matchings) {
    const score = scoreMatching(snapshot, matching, shellBase);
    if (!best || score > best.score) {
      best = { matching, score };
    }
  }

  return {
    rawDiads: best ? best.matching : [],
    diadSource: 'adjacency-matching/best-score',
    matchingScore: best ? best.score : null
  };
}

function deriveDiads(snapshot, coupler, shellBase, activeSlot) {
  const raw = deriveRawDiads(snapshot, coupler, shellBase);
  return {
    diads: rotate(raw.rawDiads, activeSlot),
    diadSource: raw.diadSource,
    rawDiads: raw.rawDiads,
    matchingScore: raw.matchingScore
  };
}

function validateLocalCluster(snapshot, coupler, shell, diads) {
  const couplerNeighbors = new Set(neighborsOf(snapshot, coupler));

  const shellTouchesCoupler = shell.every(v => couplerNeighbors.has(v));
  const diadsTouchCoupler = diads.flat().every(v => couplerNeighbors.has(v));
  const hasThreeDiads = diads.length === 3 && diads.every(pair => Array.isArray(pair) && pair.length === 2);

  return {
    shellTouchesCoupler,
    diadsTouchCoupler,
    hasThreeDiads
  };
}

export async function getGraphState(state) {
  const snapshot = await loadGraphState();
  return {
    graphKey: snapshot.graphKey,
    source: 'pump_graph_state.json',
    snapshot,
    state: {
      hostMode: state.hostMode,
      activeSlot: state.activeSlot,
      phaseSign: state.phaseSign
    }
  };
}

export async function anchorFromGraph(graphState) {
  const { hostMode, activeSlot, phaseSign } = graphState.state;
  const mode = getModeRecord(hostMode);
  const phase = getPhaseRecord(phaseSign);
  const anchorVertex = graphState.snapshot.anchorVertex;

  return {
    graphKey: graphState.graphKey,
    source: graphState.source,
    anchorVertex,
    chamberKey: `${mode.modeKey}-D${activeSlot}-${phase.phaseKey}`,
    mode,
    phase,
    graphState,
    debug: {
      neighborCount: neighborsOf(graphState.snapshot, anchorVertex).length
    }
  };
}

export async function clusterFromGraph(anchor) {
  const { hostMode, activeSlot } = anchor.graphState.state;
  const snapshot = anchor.graphState.snapshot;

  const coupler = anchor.anchorVertex;
  const shellDerived = deriveShell(snapshot, coupler, hostMode);
  const diadDerived = deriveDiads(snapshot, coupler, shellDerived.shellBase, activeSlot);
  const slotMeta = slotMetaFor(activeSlot);
  const validation = validateLocalCluster(snapshot, coupler, shellDerived.shell, diadDerived.diads);

  return {
    coupler,
    shell: shellDerived.shell,
    diads: diadDerived.diads,
    slotMeta,
    mode: anchor.mode,
    phase: anchor.phase,
    graphState: anchor.graphState,
    debug: {
      neighbors: neighborsOf(snapshot, coupler),
      shellSource: shellDerived.shellSource,
      shellBase: shellDerived.shellBase,
      diadSource: diadDerived.diadSource,
      rawDiads: diadDerived.rawDiads,
      matchingScore: diadDerived.matchingScore,
      validation
    }
  };
}

export async function orderFromGraph(cluster) {
  const active = cluster.slotMeta[0];

  return {
    portKey: cluster.mode.modeKey,
    portName: cluster.mode.modeName,
    slotKey: active.slotKey,
    slotName: active.slotName,
    phaseKey: cluster.phase.phaseKey,
    phaseName: cluster.phase.phaseName,
    coupler: cluster.coupler,
    shell: cluster.shell,
    diads: cluster.diads,
    slotMeta: cluster.slotMeta,
    validation: cluster.debug.validation,
    shellSource: cluster.debug.shellSource,
    shellBase: cluster.debug.shellBase,
    diadSource: cluster.debug.diadSource,
    rawDiads: cluster.debug.rawDiads,
    matchingScore: cluster.debug.matchingScore,
    graphState: cluster.graphState
  };
}

export async function readoutFromGraph(order) {
  const { hostMode, activeSlot, phaseSign } = order.graphState.state;

  return {
    eta: hostMode,
    rho: activeSlot,
    phaseSign,
    portKey: order.portKey,
    portName: order.portName,
    slotKey: order.slotKey,
    slotName: order.slotName,
    phaseKey: order.phaseKey,
    phaseName: order.phaseName,
    coupler: order.coupler,
    shell: order.shell,
    diads: order.diads,
    slotMeta: order.slotMeta,
    validation: order.validation,
    shellSource: order.shellSource,
    shellBase: order.shellBase,
    diadSource: order.diadSource,
    rawDiads: order.rawDiads,
    matchingScore: order.matchingScore,
    graphKey: order.graphState.graphKey,
    source: order.graphState.source
  };
}

export async function pipelineFromGraph(state) {
  const graphState = await getGraphState(state);
  const anchor = await anchorFromGraph(graphState);
  const cluster = await clusterFromGraph(anchor);
  const order = await orderFromGraph(cluster);
  const readout = await readoutFromGraph(order);

  return {
    graphState,
    anchor,
    cluster,
    order,
    readout
  };
}
