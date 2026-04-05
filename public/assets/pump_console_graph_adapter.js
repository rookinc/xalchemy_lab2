import { getModeRecord, getPhaseRecord } from '/assets/pump_console_frames.js';

let graphCache = null;

async function loadGraphSeed() {
  if (graphCache) return graphCache;
  const res = await fetch('/assets/data/pump_graph_seed.json');
  if (!res.ok) {
    throw new Error(`failed to load graph seed: ${res.status}`);
  }
  graphCache = await res.json();
  return graphCache;
}

function rotate(list, shift) {
  const n = list.length;
  return list.map((_, i) => list[(i - shift + n) % n]);
}

function slotMetaFor(activeSlot) {
  const base = [
    { slotKey: 'D0', slotName: 'Upstream' },
    { slotKey: 'D1', slotName: 'Crossflow' },
    { slotKey: 'D2', slotName: 'Downstream' }
  ];
  return rotate(base, activeSlot);
}

export async function getGraphState(state) {
  const seed = await loadGraphSeed();
  return {
    graphKey: seed.graphKey,
    source: 'graph-seed-json',
    seed,
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
  const coupler = graphState.seed.roles.coupler;

  return {
    graphKey: graphState.graphKey,
    source: graphState.source,
    anchorVertex: coupler,
    chamberKey: `${mode.modeKey}-D${activeSlot}-${phase.phaseKey}`,
    coupler,
    mode,
    phase,
    graphState
  };
}

export async function clusterFromGraph(anchor) {
  const { hostMode, activeSlot } = anchor.graphState.state;
  const roles = anchor.graphState.seed.roles;

  return {
    coupler: anchor.coupler,
    shell: roles.shellModes[hostMode % 4],
    diads: rotate(roles.slotBase, activeSlot),
    slotMeta: slotMetaFor(activeSlot),
    mode: anchor.mode,
    phase: anchor.phase,
    graphState: anchor.graphState
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
