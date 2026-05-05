import { D4_LADDER, getCyclePhase } from "./d4_spec.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const REGIME_CONFIG = {
  seed: {
    title: "Seed / mediator",
    overlays: {
      scaffold: false,
      prime: true,
      composite: true,
      labels: true,
    },
    labelDensity: "high",
    aggregation: "none",
    cameraPreset: "junction",
    description: "Pre-unit or half-layer mediator state.",
  },
  packet: {
    title: "Local packet",
    overlays: {
      scaffold: false,
      prime: true,
      composite: true,
      labels: true,
    },
    labelDensity: "high",
    aggregation: "none",
    cameraPreset: "look_down_face_1",
    description: "Local packet / controller regime.",
  },
  transport: {
    title: "Transport organization",
    overlays: {
      scaffold: true,
      prime: true,
      composite: true,
      labels: true,
    },
    labelDensity: "medium",
    aggregation: "light",
    cameraPreset: "look_down_face_2",
    description: "Packet coupled into transport organization.",
  },
  carrier: {
    title: "Carrier substrate",
    overlays: {
      scaffold: true,
      prime: true,
      composite: true,
      labels: false,
    },
    labelDensity: "medium",
    aggregation: "light",
    cameraPreset: "look_down_face_3",
    description: "Controller carried by rigid substrate.",
  },
  reconcile_1: {
    title: "First reconciliation",
    overlays: {
      scaffold: true,
      prime: true,
      composite: true,
      labels: false,
    },
    labelDensity: "medium",
    aggregation: "medium",
    cameraPreset: "junction",
    description: "First reconciliation / merge regime.",
  },
  closure: {
    title: "Extended closure",
    overlays: {
      scaffold: true,
      prime: true,
      composite: true,
      labels: false,
    },
    labelDensity: "low",
    aggregation: "medium",
    cameraPreset: "front",
    description: "Extended closure packet regime.",
  },
  macro_packet: {
    title: "Macro packet",
    overlays: {
      scaffold: true,
      prime: true,
      composite: false,
      labels: false,
    },
    labelDensity: "low",
    aggregation: "macro",
    cameraPreset: "front",
    description: "Macro packet replication regime.",
  },
  macro_carrier: {
    title: "Macro carrier",
    overlays: {
      scaffold: true,
      prime: true,
      composite: false,
      labels: false,
    },
    labelDensity: "low",
    aggregation: "macro",
    cameraPreset: "top",
    description: "Macro carrier substrate regime.",
  },
  macro_reconcile: {
    title: "Macro reconciliation",
    overlays: {
      scaffold: true,
      prime: true,
      composite: true,
      labels: false,
    },
    labelDensity: "low",
    aggregation: "macro_reconcile",
    cameraPreset: "top",
    description: "Macro reconciliation / full composite regime.",
  },
};

function defaultRegime() {
  return {
    value: 0,
    regime: "seed",
    label: "Seed / mediator",
  };
}

export function getLadderRung(currentD4s) {
  let active = defaultRegime();
  for (const rung of D4_LADDER) {
    if (currentD4s >= rung.value) active = rung;
  }
  return active;
}

export function getRegimeConfig(currentD4s) {
  const rung = getLadderRung(currentD4s);
  const config = REGIME_CONFIG[rung.regime] || REGIME_CONFIG.seed;
  return {
    rung: clone(rung),
    config: clone(config),
  };
}

export function getCycleEnvelope(currentD4s) {
  const cycle = getCyclePhase(currentD4s);
  const cycleIndex = Math.floor(currentD4s / 18);

  return {
    cycleIndex,
    residue: cycle.residue,
    phase: cycle.phase,
    phaseIndex: cycle.phaseIndex,
    incrementTarget:
      cycle.phase === "A" ? 3 :
      cycle.phase === "B" ? 6 :
      9,
  };
}

export function describeLadderState(currentD4s) {
  const { rung, config } = getRegimeConfig(currentD4s);
  const cycle = getCycleEnvelope(currentD4s);

  return {
    currentD4s,
    rungValue: rung.value,
    rungRegime: rung.regime,
    rungLabel: rung.label,
    regimeTitle: config.title,
    regimeDescription: config.description,
    cycleIndex: cycle.cycleIndex,
    cycleResidue: cycle.residue,
    cyclePhase: cycle.phase,
    incrementTarget: cycle.incrementTarget,
    overlays: config.overlays,
    cameraPreset: config.cameraPreset,
    aggregation: config.aggregation,
    labelDensity: config.labelDensity,
  };
}

export function applyRegimeToDisplayState(currentD4s, displayState = {}) {
  const { config } = getRegimeConfig(currentD4s);

  return {
    ...displayState,
    showScaffold:
      displayState.showScaffold ?? config.overlays.scaffold,
    showPrime:
      displayState.showPrime ?? config.overlays.prime,
    showComposite:
      displayState.showComposite ?? config.overlays.composite,
    showLabels:
      displayState.showLabels ?? config.overlays.labels,
    cameraPreset:
      displayState.cameraPreset ?? config.cameraPreset,
    aggregationMode:
      displayState.aggregationMode ?? config.aggregation,
    labelDensity:
      displayState.labelDensity ?? config.labelDensity,
  };
}
