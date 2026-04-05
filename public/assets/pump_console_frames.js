const HOST_PORTS = [
  {
    modeKey: 'P0',
    modeName: 'Right In',
    shell: ['v2', 'v3', 'v4', 'v5'],
  },
  {
    modeKey: 'P1',
    modeName: 'Right Out',
    shell: ['v3', 'v4', 'v5', 'v2'],
  },
  {
    modeKey: 'P2',
    modeName: 'Left Out',
    shell: ['v4', 'v5', 'v2', 'v3'],
  },
  {
    modeKey: 'P3',
    modeName: 'Left In',
    shell: ['v5', 'v2', 'v3', 'v4'],
  },
];

const SLOT_NAMES = [
  { slotKey: 'D0', slotName: 'Upstream' },
  { slotKey: 'D1', slotName: 'Crossflow' },
  { slotKey: 'D2', slotName: 'Downstream' },
];

const DIAD_SLOTS = [
  ['v1', 'v6'],
  ['v7', 'v8'],
  ['v9', 'v14'],
];

export const PHASE_META = {
  1: { phaseKey: '+', phaseName: 'Positive' },
  [-1]: { phaseKey: '-', phaseName: 'Negative' },
};

function rotateDiads(diads, shift) {
  const n = diads.length;
  return diads.map((_, i) => diads[(i - shift + n) % n]);
}

function rotateSlotMeta(meta, shift) {
  const n = meta.length;
  return meta.map((_, i) => meta[(i - shift + n) % n]);
}

export function getModeRecord(hostMode) {
  return HOST_PORTS[hostMode % 4];
}

export function getPhaseRecord(phaseSign) {
  return PHASE_META[phaseSign] ?? PHASE_META[1];
}

export function getFrameForState(hostMode, activeSlot, phaseSign = 1) {
  const mode = getModeRecord(hostMode);
  const phase = getPhaseRecord(phaseSign);

  return {
    graph: 'AT4val[60,6]',
    modeKey: mode.modeKey,
    modeName: mode.modeName,
    phaseKey: phase.phaseKey,
    phaseName: phase.phaseName,
    coupler: 'v0',
    shell: mode.shell,
    diads: rotateDiads(DIAD_SLOTS, activeSlot),
    slotMeta: rotateSlotMeta(SLOT_NAMES, activeSlot),
    hostMode,
    activeSlot,
    phaseSign,
  };
}
