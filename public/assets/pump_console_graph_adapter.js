import { getModeRecord, getPhaseRecord } from '/assets/pump_console_frames.js';

let datasetRegistryCache = null;
const datasetCache = new Map();

async function loadDatasetRegistry() {
  if (datasetRegistryCache) return datasetRegistryCache;
  const res = await fetch('/assets/data/pump_dataset_registry.json');
  if (!res.ok) {
    throw new Error(`failed to load dataset registry: ${res.status}`);
  }
  datasetRegistryCache = await res.json();
  return datasetRegistryCache;
}

async function loadGraphState(datasetId = null) {
  const registry = await loadDatasetRegistry();
  const selectedId = datasetId || registry.defaultDataset;
  const meta = registry.datasets?.[selectedId];

  if (!meta) {
    throw new Error(`unknown dataset: ${selectedId}`);
  }

  if (datasetCache.has(selectedId)) {
    return { meta, snapshot: datasetCache.get(selectedId) };
  }

  const res = await fetch(meta.path);
  if (!res.ok) {
    throw new Error(`failed to load dataset ${selectedId}: ${res.status}`);
  }

  const snapshot = await res.json();
  datasetCache.set(selectedId, snapshot);
  return { meta, snapshot };
}

function rotate(list, shift) {
  const n = list.length;
  if (n === 0) return [];
  return list.map((_, i) => list[(i + shift) % n]);
}

function baseSlotMeta() {
  return [
    { slotKey: 'D0', slotName: 'Upstream' },
    { slotKey: 'D1', slotName: 'Crossflow' },
    { slotKey: 'D2', slotName: 'Downstream' }
  ];
}

function slotMetaFor(activeSlot) {
  return rotate(baseSlotMeta(), activeSlot);
}

function baseChannelMeta() {
  return [
    { channelKey: 'C0', channelName: 'Channel 0' },
    { channelKey: 'C1', channelName: 'Channel 1' },
    { channelKey: 'C2', channelName: 'Channel 2' }
  ];
}

function neighborsOf(snapshot, vertex) {
  const adjacency = snapshot?.adjacency ?? {};
  return adjacency[vertex] ?? [];
}

function quotientOwnerOf(snapshot, vertex) {
  return snapshot?.quotients?.v4_action?.owner?.[vertex] ?? null;
}

function normalizeQuotientShell(snapshot, shellBase) {
  return [...new Set(
    (shellBase || [])
      .map(v => quotientOwnerOf(snapshot, v))
      .filter(Boolean)
  )].sort((a, b) => {
    const ai = Number(String(a).replace(/^g15_/, ''));
    const bi = Number(String(b).replace(/^g15_/, ''));
    return ai - bi;
  });
}

function isEmptyDataset(snapshot) {
  return Object.keys(snapshot?.adjacency ?? {}).length === 0;
}

function edgeExists(snapshot, a, b) {
  return new Set(neighborsOf(snapshot, a)).has(b);
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
    const nextCandidates = quad.filter(v => v !== curr && v !== prev && edgeExists(snapshot, curr, v));
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

function shellTouchSignature(snapshot, vertex, shellBase) {
  const nbrs = new Set(neighborsOf(snapshot, vertex));
  return shellBase.filter(v => nbrs.has(v));
}

function signatureDistance(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let shared = 0;
  for (const x of A) if (B.has(x)) shared += 1;
  return a.length + b.length - 2 * shared;
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
  const sigA = shellTouchSignature(snapshot, a, shellBase);
  const sigB = shellTouchSignature(snapshot, b, shellBase);

  const edgePenalty = edgeExists(snapshot, a, b) ? -5 : 5;
  const balanceReward = (sigA.length === 2 && sigB.length === 2) ? 2 : 0;
  const complementReward = signatureDistance(sigA, sigB);

  return edgePenalty + balanceReward + complementReward + 1;
}

function scoreMatching(snapshot, matching, shellBase) {
  return matching.reduce((sum, pair) => sum + scorePair(snapshot, pair, shellBase), 0);
}

function neighborhoodSummary(snapshot, coupler) {
  const ring1 = neighborsOf(snapshot, coupler)
    .slice()
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

  const ring1set = new Set(ring1);
  const ring2set = new Set();

  for (const v of ring1) {
    for (const u of neighborsOf(snapshot, v)) {
      if (u !== coupler && !ring1set.has(u)) ring2set.add(u);
    }
  }

  const ring2 = [...ring2set].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  return { ring1, ring2, ring1Count: ring1.length, ring2Count: ring2.length };
}

function ring2Degree(snapshot, vertex, coupler) {
  const hood = neighborhoodSummary(snapshot, coupler);
  const ring2set = new Set(hood.ring2);
  let count = 0;
  for (const u of neighborsOf(snapshot, vertex)) {
    if (ring2set.has(u)) count += 1;
  }
  return count;
}

function varianceLike(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((acc, x) => acc + (x - mean) * (x - mean), 0);
}

function transportGeometryScore(snapshot, matching, shellBase) {
  const shellSize = shellBase.length;

  const details = matching.map(pair => {
    const [a, b] = pair;
    const sigA = shellTouchSignature(snapshot, a, shellBase);
    const sigB = shellTouchSignature(snapshot, b, shellBase);
    const union = [...new Set([...sigA, ...sigB])];
    union.sort((x, y) => shellBase.indexOf(x) - shellBase.indexOf(y));

    const idx = union.map(v => shellBase.indexOf(v)).sort((m, n) => m - n);
    let spread = 0;
    if (idx.length >= 2) {
      let minArc = shellSize;
      for (let i = 0; i < idx.length; i += 1) {
        const p = idx[i];
        const q = idx[(i + 1) % idx.length];
        const diff = (q - p + shellSize) % shellSize;
        if (diff !== 0) minArc = Math.min(minArc, diff);
      }
      spread = minArc === shellSize ? 0 : minArc;
    }

    return {
      pair,
      sigA,
      sigB,
      union,
      spread,
      twoTwo: sigA.length === 2 && sigB.length === 2
    };
  });

  const coverageCount = new Map(shellBase.map(v => [v, 0]));
  for (const item of details) {
    for (const v of item.union) {
      coverageCount.set(v, (coverageCount.get(v) ?? 0) + 1);
    }
  }

  const coverageValues = shellBase.map(v => coverageCount.get(v) ?? 0);
  const coverageVariance = varianceLike(coverageValues);

  const spreadValues = details.map(d => d.spread);
  const spreadVariance = varianceLike(spreadValues);
  const spreadMean = spreadValues.reduce((a, b) => a + b, 0) / (spreadValues.length || 1);

  const twoTwoCount = details.filter(d => d.twoTwo).length;

  const score =
    8 * twoTwoCount +
    6 * (3 - coverageVariance) +
    4 * (3 - spreadVariance) +
    2 * spreadMean;

  return {
    score,
    coverageValues,
    coverageVariance,
    spreadValues,
    spreadVariance,
    twoTwoCount,
    details: details.map(d => ({
      pair: d.pair,
      sigA: d.sigA,
      sigB: d.sigB,
      union: d.union,
      spread: d.spread,
      twoTwo: d.twoTwo
    }))
  };
}

function scoreShellAndMatching(snapshot, coupler, shellBase) {
  const couplerNeighbors = neighborsOf(snapshot, coupler);
  const shellSet = new Set(shellBase);
  const nonShell = couplerNeighbors
    .filter(v => !shellSet.has(v))
    .slice()
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

  if (shellBase.length !== 4 || nonShell.length !== 6) return null;

  const internalShellEdges = allPairs(shellBase).filter(([a, b]) => edgeExists(snapshot, a, b)).length;
  const matchings = generatePerfectMatchings(nonShell).map(normalizeMatching);

  let bestMatching = null;
  for (const matching of matchings) {
    const score = scoreMatching(snapshot, matching, shellBase);
    const transport = transportGeometryScore(snapshot, matching, shellBase);
    const combined = score + transport.score;
    if (!bestMatching || combined > bestMatching.combinedScore) {
      bestMatching = {
        matching,
        matchingScore: score,
        transport,
        combinedScore: combined
      };
    }
  }

  const shellRing2Degrees = shellBase.map(v => ring2Degree(snapshot, v, coupler));
  const boundaryVariance = varianceLike(shellRing2Degrees);
  const boundaryUniformityScore = 20 - boundaryVariance;

  return {
    shellBase,
    nonShell,
    matching: bestMatching ? bestMatching.matching : [],
    matchingScore: bestMatching ? bestMatching.matchingScore : -999,
    transportScore: bestMatching ? bestMatching.transport.score : -999,
    transportDebug: bestMatching ? bestMatching.transport : null,
    shellRing2Degrees,
    boundaryVariance,
    boundaryUniformityScore,
    totalScore:
      100 +
      internalShellEdges +
      (bestMatching ? bestMatching.matchingScore : -999) +
      (bestMatching ? bestMatching.transport.score : -999) +
      boundaryUniformityScore
  };
}
function discoverShellBundle(snapshot, coupler) {
  const quads = allQuads(neighborsOf(snapshot, coupler));
  const candidates = [];

  for (const quad of quads) {
    const cycle = cycleOrderForQuad(snapshot, quad);
    if (!cycle) continue;
    const bundle = scoreShellAndMatching(snapshot, coupler, cycle);
    if (!bundle) continue;
    candidates.push(bundle);
  }

  candidates.sort((a, b) => b.totalScore - a.totalScore);

  const best = candidates[0];
  if (!best) {
    return {
      shellBase: [],
      shellSource: 'joint-shell-diad/not-found',
      nonShell: [],
      rawDiads: [],
      matchingScore: null,
      transportScore: null,
      transportDebug: null,
      shellRing2Degrees: [],
      boundaryVariance: null,
      boundaryUniformityScore: null,
      shellDebug: []
    };
  }

  return {
    shellBase: best.shellBase,
    shellSource: 'joint-shell-diad/discovered',
    nonShell: best.nonShell,
    rawDiads: best.matching,
    matchingScore: best.matchingScore,
    transportScore: best.transportScore,
    transportDebug: best.transportDebug,
    shellRing2Degrees: best.shellRing2Degrees,
    boundaryVariance: best.boundaryVariance,
    boundaryUniformityScore: best.boundaryUniformityScore,
    shellDebug: candidates.slice(0, 8).map(c => ({
      shellBase: c.shellBase,
      nonShell: c.nonShell,
      matching: c.matching,
      matchingScore: c.matchingScore,
      transportScore: c.transportScore,
      transportDebug: c.transportDebug,
      shellRing2Degrees: c.shellRing2Degrees,
      boundaryVariance: c.boundaryVariance,
      boundaryUniformityScore: c.boundaryUniformityScore,
      totalScore: c.totalScore
    }))
  };
}

function deriveSeededShell(snapshot, coupler, hostMode) {
  const seeded = ['v2', 'v3', 'v4', 'v5'];
  const shellSet = new Set(seeded);
  const couplerNeighbors = neighborsOf(snapshot, coupler);
  const neighborSet = new Set(couplerNeighbors);

  const shellBase = seeded.filter(v => neighborSet.has(v));
  const nonShell = couplerNeighbors
    .filter(v => !shellSet.has(v))
    .slice()
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

  const seededRawDiads = [['v1','v8'], ['v6','v14'], ['v7','v9']]
    .map(pair => pair.slice().sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))))
    .filter(pair => nonShell.includes(pair[0]) && nonShell.includes(pair[1]));

  const shellRing2Degrees = shellBase.map(v => ring2Degree(snapshot, v, coupler));
  const boundaryVariance = varianceLike(shellRing2Degrees);
  const boundaryUniformityScore = 20 - boundaryVariance;

  return {
    shell: rotate(shellBase, hostMode),
    shellBase,
    shellSource: 'seeded-witness/rotated',
    shellDebug: [{
      shellBase,
      nonShell,
      matching: seededRawDiads,
      matchingScore: null,
      transportScore: null,
      transportDebug: null,
      shellRing2Degrees,
      boundaryVariance,
      boundaryUniformityScore,
      totalScore: null
    }],
    nonShell,
    rawDiads: seededRawDiads,
    matchingScore: null,
    transportScore: null,
    transportDebug: null,
    shellRing2Degrees,
    boundaryVariance,
    boundaryUniformityScore
  };
}

function deriveShell(snapshot, coupler, hostMode, discoveryMode = 'seeded', datasetKind = '') {
  const allowSeededWitness =
    discoveryMode === 'seeded' &&
    coupler === 'v0' &&
    datasetKind === 'seeded-local-patch';

  if (allowSeededWitness) {
    return deriveSeededShell(snapshot, coupler, hostMode);
  }

  const discovered = discoverShellBundle(snapshot, coupler);

  if (discovered.shellBase.length !== 4) {
    return {
      shell: discovered.shellBase,
      shellBase: discovered.shellBase,
      shellSource: discovered.shellSource,
      shellDebug: discovered.shellDebug,
      nonShell: discovered.nonShell,
      rawDiads: discovered.rawDiads,
      matchingScore: discovered.matchingScore,
      transportScore: discovered.transportScore,
      transportDebug: discovered.transportDebug,
      shellRing2Degrees: discovered.shellRing2Degrees,
      boundaryVariance: discovered.boundaryVariance,
      boundaryUniformityScore: discovered.boundaryUniformityScore
    };
  }

  return {
    shell: rotate(discovered.shellBase, hostMode),
    shellBase: discovered.shellBase,
    shellSource: `${discovered.shellSource}/rotated`,
    shellDebug: discovered.shellDebug,
    nonShell: discovered.nonShell,
    rawDiads: discovered.rawDiads,
    matchingScore: discovered.matchingScore,
    transportScore: discovered.transportScore,
    transportDebug: discovered.transportDebug,
    shellRing2Degrees: discovered.shellRing2Degrees,
    boundaryVariance: discovered.boundaryVariance,
    boundaryUniformityScore: discovered.boundaryUniformityScore
  };
}

function diadShellSignature(snapshot, pair, shellBase) {
  const sigA = shellTouchSignature(snapshot, pair[0], shellBase);
  const sigB = shellTouchSignature(snapshot, pair[1], shellBase);
  const union = [...new Set([...sigA, ...sigB])];
  union.sort((a, b) => shellBase.indexOf(a) - shellBase.indexOf(b));
  return union;
}

function cyclicSpread(signature, shellBase) {
  if (signature.length < 2) return 0;
  const idx = signature.map(v => shellBase.indexOf(v)).filter(i => i >= 0).sort((a, b) => a - b);
  if (idx.length < 2) return 0;

  let minArc = shellBase.length;
  for (let i = 0; i < idx.length; i += 1) {
    const a = idx[i];
    const b = idx[(i + 1) % idx.length];
    const diff = (b - a + shellBase.length) % shellBase.length;
    if (diff !== 0) minArc = Math.min(minArc, diff);
  }
  return minArc === shellBase.length ? 0 : minArc;
}

function inferOrderedRawDiads(snapshot, rawDiads, shellBase) {
  const enriched = rawDiads.map(pair => {
    const sig = diadShellSignature(snapshot, pair, shellBase);
    return {
      pair,
      signature: sig,
      spread: cyclicSpread(sig, shellBase),
      sigLen: sig.length,
      minVertex: Math.min(Number(pair[0].slice(1)), Number(pair[1].slice(1)))
    };
  });

  enriched.sort((a, b) => {
    if (a.spread !== b.spread) return a.spread - b.spread;
    if (a.sigLen !== b.sigLen) return a.sigLen - b.sigLen;
    return a.minVertex - b.minVertex;
  });

  const orderedRawDiads = enriched.map(x => x.pair);
  const channelMeta = baseChannelMeta();

  return {
    orderedRawDiads,
    orderedChannels: orderedRawDiads.map((pair, idx) => ({
      channelKey: channelMeta[idx].channelKey,
      channelName: channelMeta[idx].channelName,
      pair
    })),
    orderingSource: 'shell-signature/spread-rank',
    orderingDebug: enriched.map((x, idx) => ({
      channelKey: channelMeta[idx].channelKey,
      pair: x.pair,
      signature: x.signature,
      spread: x.spread,
      sigLen: x.sigLen
    }))
  };
}

function deriveDiads(snapshot, coupler, shellBase, rawDiads, nonShell, activeSlot) {
  const ordered = inferOrderedRawDiads(snapshot, rawDiads, shellBase);
  const slotMeta = slotMetaFor(activeSlot);
  const operationalChannels = rotate(ordered.orderedChannels, activeSlot).map((item, idx) => ({
    ...item,
    slotKey: slotMeta[idx].slotKey,
    slotName: slotMeta[idx].slotName
  }));

  return {
    diads: operationalChannels.map(x => x.pair),
    channelMeta: ordered.orderedChannels,
    operationalChannels,
    diadSource: 'joint-shell-diad/matching',
    nonShell,
    rawDiads,
    orderedRawDiads: ordered.orderedRawDiads,
    orderingSource: ordered.orderingSource,
    orderingDebug: ordered.orderingDebug
  };
}

function validateLocalCluster(snapshot, coupler, shell, diads) {
  const couplerNeighbors = new Set(neighborsOf(snapshot, coupler));
  return {
    shellTouchesCoupler: shell.every(v => couplerNeighbors.has(v)),
    diadsTouchCoupler: diads.flat().every(v => couplerNeighbors.has(v)),
    hasThreeDiads: diads.length === 3 && diads.every(pair => Array.isArray(pair) && pair.length === 2)
  };
}
export async function getGraphState(state) {
  const datasetId = state.datasetId || null;
  const { meta, snapshot } = await loadGraphState(datasetId);
  return {
    graphKey: snapshot.graphKey || meta.graphKey,
    datasetId: datasetId || (await loadDatasetRegistry()).defaultDataset,
    datasetMeta: meta,
    source: meta.path.split('/').slice(-1)[0],
    snapshot,
    state: {
      hostMode: state.hostMode,
      activeSlot: state.activeSlot,
      phaseSign: state.phaseSign,
      datasetId: datasetId || (await loadDatasetRegistry()).defaultDataset,
      discoveryMode: state.discoveryMode || 'seeded',
      anchorVertexOverride: state.anchorVertexOverride || null
    }
  };
}

export async function anchorFromGraph(graphState) {
  const { hostMode, activeSlot, phaseSign } = graphState.state;
  const mode = getModeRecord(hostMode);
  const phase = getPhaseRecord(phaseSign);

  const adjacencyKeys = Object.keys(graphState.snapshot.adjacency || {}).sort(
    (a, b) => Number(a.slice(1)) - Number(b.slice(1))
  );

  const requestedAnchor =
    graphState.state.anchorVertexOverride ||
    graphState.snapshot.anchorVertex ||
    adjacencyKeys[0] ||
    null;

  const anchorVertex =
    requestedAnchor && graphState.snapshot.adjacency?.[requestedAnchor]
      ? requestedAnchor
      : (adjacencyKeys[0] || null);

  return {
    graphKey: graphState.graphKey,
    datasetId: graphState.datasetId,
    datasetMeta: graphState.datasetMeta,
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

  if (isEmptyDataset(snapshot)) {
    return {
      coupler: anchor.anchorVertex,
      shell: [],
      diads: [],
      mode: anchor.mode,
      phase: anchor.phase,
      graphState: anchor.graphState,
      debug: {
        neighbors: [],
        shellSource: 'dataset-empty',
        shellBase: [],
        shellDebug: [],
        shellRing2Degrees: [],
        boundaryVariance: null,
        boundaryUniformityScore: null,
        matchingScore: null,
        transportScore: null,
        transportDebug: null,
        diadSource: 'dataset-empty',
        nonShell: [],
        rawDiads: [],
        orderedRawDiads: [],
        channelMeta: [],
        operationalChannels: [],
        orderingSource: 'dataset-empty',
        orderingDebug: [],
        neighborhood: { ring1: [], ring2: [], ring1Count: 0, ring2Count: 0 },
        validation: {
          shellTouchesCoupler: false,
          diadsTouchCoupler: false,
          hasThreeDiads: false
        }
      }
    };
  }

  const coupler = anchor.anchorVertex;
  const datasetKind = anchor.graphState.datasetMeta?.kind || '';
  const neighborhood = neighborhoodSummary(snapshot, coupler);

  if (datasetKind === 'full-graph') {
    const shellBase = neighborhood.ring1 || [];
    const shell = rotate(shellBase, hostMode);
    const shellRing2Degrees = shellBase.map(v => ring2Degree(snapshot, v, coupler));
    const quotientShell = normalizeQuotientShell(snapshot, shellBase);

    return {
      coupler,
      shell,
      diads: [],
      mode: anchor.mode,
      phase: anchor.phase,
      graphState: anchor.graphState,
      debug: {
        neighbors: neighborsOf(snapshot, coupler),
        shellSource: 'full-graph/ring1',
        shellBase,
        quotientShell,
        shellDebug: [{
          shellBase,
          quotientShell,
          nonShell: neighborhood.ring2 || [],
          matching: [],
          matchingScore: null,
          transportScore: null,
          transportDebug: null,
          shellRing2Degrees,
          boundaryVariance: null,
          boundaryUniformityScore: null,
          totalScore: null
        }],
        shellRing2Degrees,
        boundaryVariance: null,
        boundaryUniformityScore: null,
        matchingScore: null,
        transportScore: null,
        transportDebug: null,
        diadSource: 'full-graph/not-yet-chamberized',
        nonShell: neighborhood.ring2 || [],
        rawDiads: [],
        orderedRawDiads: [],
        channelMeta: [],
        operationalChannels: [],
        orderingSource: 'full-graph/not-yet-chamberized',
        orderingDebug: [],
        neighborhood,
        validation: {
          shellTouchesCoupler: shellBase.every(v => neighborsOf(snapshot, coupler).includes(v)),
          diadsTouchCoupler: false,
          hasThreeDiads: false
        }
      }
    };
  }

  const shellDerived = deriveShell(
    snapshot,
    coupler,
    hostMode,
    anchor.graphState.state.discoveryMode,
    datasetKind
  );
  const diadDerived = deriveDiads(
    snapshot,
    coupler,
    shellDerived.shellBase,
    shellDerived.rawDiads,
    shellDerived.nonShell,
    activeSlot
  );
  const validation = validateLocalCluster(snapshot, coupler, shellDerived.shell, diadDerived.diads);

  return {
    coupler,
    shell: shellDerived.shell,
    diads: diadDerived.diads,
    mode: anchor.mode,
    phase: anchor.phase,
    graphState: anchor.graphState,
    debug: {
      neighbors: neighborsOf(snapshot, coupler),
      shellSource: shellDerived.shellSource,
      shellBase: shellDerived.shellBase,
      shellDebug: shellDerived.shellDebug,
      shellRing2Degrees: shellDerived.shellRing2Degrees,
      boundaryVariance: shellDerived.boundaryVariance,
      boundaryUniformityScore: shellDerived.boundaryUniformityScore,
      matchingScore: shellDerived.matchingScore,
      transportScore: shellDerived.transportScore,
      transportDebug: shellDerived.transportDebug,
      diadSource: diadDerived.diadSource,
      nonShell: diadDerived.nonShell,
      rawDiads: diadDerived.rawDiads,
      orderedRawDiads: diadDerived.orderedRawDiads,
      channelMeta: diadDerived.channelMeta,
      operationalChannels: diadDerived.operationalChannels,
      orderingSource: diadDerived.orderingSource,
      orderingDebug: diadDerived.orderingDebug,
      neighborhood,
      validation
    }
  };
}

export async function orderFromGraph(cluster) {
  const active = cluster.debug.operationalChannels?.[0] ?? null;
  const isFullGraph = cluster.graphState.datasetMeta?.kind === 'full-graph';
  const hasNeighborhoodShell = (cluster.debug.shellBase || []).length === 4;
  const isCanonicalLocalMachine = isFullGraph ? hasNeighborhoodShell : Boolean(active);

  return {
    portKey: cluster.mode.modeKey,
    portName: cluster.mode.modeName,
    slotKey: active?.slotKey ?? null,
    slotName: active?.slotName ?? null,
    phaseKey: cluster.phase.phaseKey,
    phaseName: cluster.phase.phaseName,
    coupler: cluster.coupler,
    shell: cluster.shell,
    diads: cluster.diads,
    validation: cluster.debug.validation,
    shellSource: cluster.debug.shellSource,
    shellBase: cluster.debug.shellBase,
    quotientShell: cluster.debug.quotientShell || [],
    shellDebug: cluster.debug.shellDebug,
    shellRing2Degrees: cluster.debug.shellRing2Degrees,
    boundaryVariance: cluster.debug.boundaryVariance,
    boundaryUniformityScore: cluster.debug.boundaryUniformityScore,
    matchingScore: cluster.debug.matchingScore,
    transportScore: cluster.debug.transportScore,
    transportDebug: cluster.debug.transportDebug,
    diadSource: cluster.debug.diadSource,
    nonShell: cluster.debug.nonShell,
    rawDiads: cluster.debug.rawDiads,
    orderedRawDiads: cluster.debug.orderedRawDiads,
    channelMeta: cluster.debug.channelMeta,
    operationalChannels: cluster.debug.operationalChannels,
    orderingSource: cluster.debug.orderingSource,
    orderingDebug: cluster.debug.orderingDebug,
    neighborhood: cluster.debug.neighborhood,
    graphState: cluster.graphState,
    isCanonicalLocalMachine
  };
}

export async function readoutFromGraph(order) {
  const { hostMode, activeSlot, phaseSign, datasetId } = order.graphState.state;
  const slotMeta = (order.operationalChannels || []).map(x => ({
    slotKey: x.slotKey,
    slotName: x.slotName
  }));

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
    slotMeta,
    validation: order.validation,
    shellSource: order.shellSource,
    shellBase: order.shellBase,
    shellDebug: order.shellDebug,
    shellRing2Degrees: order.shellRing2Degrees,
    boundaryVariance: order.boundaryVariance,
    boundaryUniformityScore: order.boundaryUniformityScore,
    matchingScore: order.matchingScore,
    transportScore: order.transportScore,
    transportDebug: order.transportDebug,
    diadSource: order.diadSource,
    nonShell: order.nonShell,
    rawDiads: order.rawDiads,
    orderedRawDiads: order.orderedRawDiads,
    channelMeta: order.channelMeta,
    operationalChannels: order.operationalChannels,
    orderingSource: order.orderingSource,
    orderingDebug: order.orderingDebug,
    neighborhood: order.neighborhood,
    graphKey: order.graphState.graphKey,
    datasetId,
    datasetMeta: order.graphState.datasetMeta,
    source: order.graphState.source,
    snapshot: order.graphState.snapshot,
    isCanonicalLocalMachine: order.isCanonicalLocalMachine
  };
}

export async function pipelineFromGraph(state) {
  const graphState = await getGraphState(state);
  const anchor = await anchorFromGraph(graphState);
  const cluster = await clusterFromGraph(anchor);
  const order = await orderFromGraph(cluster);
  const readout = await readoutFromGraph(order);

  return { graphState, anchor, cluster, order, readout };
}
