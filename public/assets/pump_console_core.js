import { nextPort, nextSlot } from '/assets/pump_console_tables.js';
import { pipelineFromGraph } from '/assets/pump_console_graph_adapter.js';

export function signedLabelFor(mode, slot, phaseSign) {
  const phaseKey = phaseSign === 1 ? '+' : '-';
  return `Q${mode}${slot}${phaseKey}`;
}

export function nextState(mode, slot, phaseSign = 1) {
  return {
    hostMode: nextPort(mode),
    activeSlot: nextSlot(slot),
    phaseSign: -phaseSign,
  };
}

export function previousState(mode, slot, phaseSign = 1) {
  const prevPorts = [];
  for (let p = 0; p < 4; p += 1) {
    if (nextPort(p) === mode) prevPorts.push(p);
  }

  const prevSlots = [];
  for (let s = 0; s < 3; s += 1) {
    if (nextSlot(s) === slot) prevSlots.push(s);
  }

  return {
    hostMode: prevPorts[0] ?? mode,
    activeSlot: prevSlots[0] ?? slot,
    phaseSign: -phaseSign,
  };
}

export async function getFrame(state) {
  const pipe = await pipelineFromGraph(state);
  return pipe.readout;
}

export function pump(state) {
  const prev = signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign);
  const next = nextState(state.hostMode, state.activeSlot, state.phaseSign);
  return {
    prev,
    next: signedLabelFor(next.hostMode, next.activeSlot, next.phaseSign),
    hostMode: next.hostMode,
    activeSlot: next.activeSlot,
    phaseSign: next.phaseSign,
    note: `${prev} -> ${signedLabelFor(next.hostMode, next.activeSlot, next.phaseSign)}`,
  };
}

export async function tracePipeline(state) {
  const pipe = await pipelineFromGraph(state);
  const r = pipe.readout;
  const p = pump(state);

  return {
    graphState: pipe.graphState,
    frame: r,
    anchor: {
      x: pipe.anchor.anchorVertex,
      note: `x=${pipe.anchor.anchorVertex} -> chamber selected for ${signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign)} in ${r.portKey}`,
    },
    cluster: {
      note: `port=${r.portKey} shell={${r.shell.join(', ')}} coupler=${r.coupler} diads=[(${r.diads[0].join(',')}), (${r.diads[1].join(',')}), (${r.diads[2].join(',')})] phase=${r.phaseKey} shellSource=${r.shellSource} diadSource=${r.diadSource}`,
    },
    order: {
      note: `port=${r.portKey} (${r.portName}) slot=${r.slotKey} (${r.slotName}) phase=${r.phaseKey} (${r.phaseName})`,
    },
    readout: {
      note: `R(F)=(${r.eta}, ${r.rho}, ${r.phaseKey}) => ${signedLabelFor(r.eta, r.rho, r.phaseSign)}`,
    },
    validation: {
      note: `shellTouchesCoupler=${r.validation.shellTouchesCoupler} diadsTouchCoupler=${r.validation.diadsTouchCoupler}`,
    },
    pump: p,
  };
}
