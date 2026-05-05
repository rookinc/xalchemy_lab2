export const D4_MODEL_SCALE = 3.2;

export const D4_LADDER = [
  { value: 1.5, regime: "seed", label: "Seed / mediator" },
  { value: 15,  regime: "packet", label: "Local packet" },
  { value: 30,  regime: "transport", label: "Transport organization" },
  { value: 60,  regime: "carrier", label: "Carrier substrate" },
  { value: 90,  regime: "reconcile_1", label: "First reconciliation" },
  { value: 150, regime: "closure", label: "Extended closure" },
  { value: 300, regime: "macro_packet", label: "Macro packet" },
  { value: 600, regime: "macro_carrier", label: "Macro carrier" },
  { value: 900, regime: "macro_reconcile", label: "Macro reconciliation" }
];

export const D4_FACE_ORDER = [1, 2, 3];
export const D4_CYCLE_INCREMENTS = [3, 6, 9];
export const D4_CYCLE_SUM = 18;

export const D4_PLEAT_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export const D4_PLEAT_ROLES = {
  4: "carrier_center",
  5: "north",
  6: "north_east",
  7: "east",
  8: "south_east",
  9: "south",
  10: "south_west",
  11: "west",
  12: "north_west"
};

export const D4_DISPLAY_MODES = [
  "scaffold",
  "prime",
  "prime_plus_composite",
  "hybrid",
  "witness"
];

export function canonicalPrimeVertices() {
  const s3 = Math.sqrt(3);
  const h = Math.sqrt(2 / 3);
  const k = D4_MODEL_SCALE;
  return [
    { id: "v0", x: -0.5 * k, y: -(s3 / 6) * k, z: 0.0 },
    { id: "v1", x:  0.5 * k, y: -(s3 / 6) * k, z: 0.0 },
    { id: "v2", x:  0.0,     y:  (s3 / 3) * k, z: 0.0 },
    { id: "v3", x:  0.0,     y:  0.0,          z: h * k }
  ];
}

export function tetraFaceMap(vertexIds) {
  return {
    1: { face: [vertexIds[1], vertexIds[2], vertexIds[3]], opposite: vertexIds[0] },
    2: { face: [vertexIds[0], vertexIds[2], vertexIds[3]], opposite: vertexIds[1] },
    3: { face: [vertexIds[0], vertexIds[1], vertexIds[3]], opposite: vertexIds[2] },
    4: { face: [vertexIds[0], vertexIds[1], vertexIds[2]], opposite: vertexIds[3] }
  };
}

export function tetraEdgePairs(vertexIds) {
  return [
    [vertexIds[0], vertexIds[1]],
    [vertexIds[0], vertexIds[2]],
    [vertexIds[0], vertexIds[3]],
    [vertexIds[1], vertexIds[2]],
    [vertexIds[1], vertexIds[3]],
    [vertexIds[2], vertexIds[3]]
  ];
}

export function getCyclePhase(currentD4s) {
  const residue = ((currentD4s % D4_CYCLE_SUM) + D4_CYCLE_SUM) % D4_CYCLE_SUM;
  if (residue === 0) {
    return { residue, phase: "C*", phaseIndex: 2 };
  }
  if (residue >= 1 && residue <= 3) {
    return { residue, phase: "A", phaseIndex: 0 };
  }
  if (residue >= 4 && residue <= 9) {
    return { residue, phase: "B", phaseIndex: 1 };
  }
  return { residue, phase: "C", phaseIndex: 2 };
}

export function getLadderRegime(currentD4s) {
  let active = D4_LADDER[0];
  for (const rung of D4_LADDER) {
    if (currentD4s >= rung.value) {
      active = rung;
    }
  }
  return active;
}

export function defaultCompositeState() {
  return {
    4: "occupied",
    5: "open",
    6: "open",
    7: "open",
    8: "open",
    9: "open",
    10: "open",
    11: "open",
    12: "open"
  };
}

export function createDefaultPlaybackState() {
  return {
    currentD4s: 0,
    pauseAtD4s: 900,
    hz: 30,
    isPlaying: false,
    displayMode: "prime"
  };
}
