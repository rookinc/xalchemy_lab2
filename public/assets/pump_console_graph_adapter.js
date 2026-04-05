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

function deriveShell(snapshot, coupler, hostMode) {
  const couplerNeighbors = new Set(neighborsOf(snapshot, coupler));
  const shellBase = (snapshot.shellCandidates ?? []).filter(v => couplerNeighbors.has(v));

  if (shellBase.length !== 4) {
    return {
      shell: shellBase,
      shellSource: 'adjacency-filter/incomplete'
    };
  }

  return {
    shell: rotate(shellBase, hostMode),
    shellSource: 'adjacency-filter/rotated'
  };
}

function deriveRawDiads(snapshot, coupler) {
  const couplerNeighbors = neighborsOf(snapshot, coupler);
  const shellSet = new Set(snapshot.shellCandidates ?? []);
  const nonShell = couplerNeighbors
    .filter(v => !shellSet.has(v))
    .slice()
    .sort((a, b) => {
      const na = Number(a.slice(1));
      const nb = Number(b.slice(1));
      return na - nb;
    });

  if (nonShell.length !== 6) {
    return {
      rawDiads: [],
      diadSource: 'adjacency-nonshell/incomplete'
    };
  }

  const rawDiads = [
    [nonShell[0], nonShell[1]],
    [nonShell[2], nonShell[3]],
    [nonShell[4], nonShell[5]]
  ];

  return {
    rawDiads,
    diadSource: 'adjacency-nonshell/canonical-pairing'
  };
}

function deriveDiads(snapshot, coupler, activeSlot) {
  const raw = deriveRawDiads(snapshot, coupler);
  return {
    diads: rotate(raw.rawDiads, activeSlot),
    diadSource: raw.diadSource,
    rawDiads: raw.rawDiads
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
  const diadDerived = deriveDiads(snapshot, coupler, activeSlot);
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
      diadSource: diadDerived.diadSource,
      rawDiads: diadDerived.rawDiads,
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
    diadSource: cluster.debug.diadSource,
    rawDiads: cluster.debug.rawDiads,
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
    diadSource: order.diadSource,
    rawDiads: order.rawDiads,
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
