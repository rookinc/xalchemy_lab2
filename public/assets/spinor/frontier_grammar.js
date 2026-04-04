export const REGISTER = ["W", "X", "Y", "Z", "T", "I"];

export const SOCKET_SLOT = "T";
export const EXACT_FRAME2_PAYLOAD = "t2";

function mod(n, m) {
  return ((n % m) + m) % m;
}

export function slotAt(index) {
  return REGISTER[mod(index, REGISTER.length)];
}

export function nextSlot(slot) {
  const i = REGISTER.indexOf(slot);
  return slotAt(i + 1);
}

export function prevSlot(slot) {
  const i = REGISTER.indexOf(slot);
  return slotAt(i - 1);
}

export function nextJoin(join) {
  if (join === "f4") return "t1r";
  const m = /^t(\d+)r$/.exec(join);
  if (!m) return join;
  return `t${Number(m[1]) + 1}r`;
}

export function normalizeWitnessCycle(cycle) {
  if (!Array.isArray(cycle) || cycle.length !== 6) {
    throw new Error("normalizeWitnessCycle expects a 6-cycle");
  }
  return [...cycle];
}

export function socketPayload(cycle) {
  const norm = normalizeWitnessCycle(cycle);
  return norm[4];
}

export function witnessAssemblyFromPayload(payload) {
  const cycle = ["o4", "s0", "t0", "s2", payload, "s4"];
  return {
    normalized_cycle: cycle,
    assembly: {
      W: cycle[0],
      X: cycle[1],
      Y: cycle[2],
      Z: cycle[3],
      T: cycle[4],
      I: cycle[5],
    },
    scaffold_register: {
      W: cycle[0],
      X: cycle[1],
      Y: cycle[2],
      Z: cycle[3],
      I: cycle[5],
    },
    socket: SOCKET_SLOT,
    payload: cycle[4],
    exact_frame2_payload: EXACT_FRAME2_PAYLOAD,
    is_exact_payload: cycle[4] === EXACT_FRAME2_PAYLOAD,
    closed_witness_word: [...cycle, cycle[0]],
    rigid_edges: ["WX", "XY", "YZ", "IW"],
    variable_edges: ["ZT", "TI"],
    diads: ["WX", "YZ", "TI"],
    couplers: ["XY", "ZT", "IW"],
  };
}

function payloadForTickOpen(tick) {
  return `t${tick + 1}`;
}

function payloadForTickClosed(tick) {
  return `t${tick}`;
}

function phaseForState(kind) {
  return kind === "closed" ? "RGB" : "CMY";
}

function stateForKind(kind) {
  return kind === "closed" ? "closed" : "open";
}

function transformForTick(tick) {
  const step = tick - 1;

  return {
    closed: {
      tx: -0.35 + step * 0.20,
      ty:  0.10 - step * 0.03,
      tz:  0.00 + step * 0.03,
      scale: 0.92,
      flipZ: 1,
    },
    open: {
      tx:  0.42 + step * 0.20,
      ty: -0.02 - step * 0.03,
      tz:  0.10 + step * 0.03,
      scale: 0.88,
      flipZ: -1,
    },
  };
}

function sheetForTick(tick) {
  return tick % 2 === 1 ? "+" : "-";
}

export function seedFrontier() {
  return frontierAtTick(1);
}

export function frontierAtTick(tick) {
  if (!Number.isInteger(tick) || tick < 1) {
    throw new Error("frontierAtTick expects integer tick >= 1");
  }

  const closedId = `t${tick}`;
  const openId = `t${tick + 1}`;
  const slot = slotAt(tick - 1);
  const next_slot = slotAt(tick);
  const join = tick === 1 ? "f4" : `t${tick - 1}r`;

  const closedPayload = payloadForTickClosed(tick);
  const openPayload = payloadForTickOpen(tick);

  const closedWitness = witnessAssemblyFromPayload(closedPayload);
  const openWitness = witnessAssemblyFromPayload(openPayload);

  return {
    tick,
    sheet: sheetForTick(tick),

    closed: {
      id: closedId,
      phase: phaseForState("closed"),
      state: stateForKind("closed"),
      payload: closedPayload,
      witness: closedWitness,
    },

    open: {
      id: openId,
      phase: phaseForState("open"),
      state: stateForKind("open"),
      payload: openPayload,
      witness: openWitness,
    },

    slot,
    next_slot,
    join,

    socket: SOCKET_SLOT,
    exact_frame2_payload: EXACT_FRAME2_PAYLOAD,

    note: `${closedId} closed (RGB), ${openId} open (CMY), joined on ${join}`,

    transform: transformForTick(tick),
  };
}

export function successor(state) {
  return frontierAtTick(state.tick + 1);
}

export function nthFrontier(n) {
  return frontierAtTick(n);
}

export function radiusForTick(tick) {
  return 0.42 + (tick - 1) * 0.22;
}

export function angleStep() {
  return Math.PI / 3;
}

export function angleForSlot(slot) {
  const i = REGISTER.indexOf(slot);
  return -Math.PI / 2 + i * angleStep();
}

export function spiralPoseForTick(tick) {
  const f = frontierAtTick(tick);
  return {
    center: { x: 0, y: 0 },
    slot: f.slot,
    next_slot: f.next_slot,
    theta_closed: angleForSlot(f.slot),
    theta_open: angleForSlot(f.next_slot),
    r_closed: radiusForTick(tick),
    r_open: radiusForTick(tick + 1),
    join: f.join,
    sheet: f.sheet,
    payload_closed: f.closed.payload,
    payload_open: f.open.payload,
    frontier: f,
  };
}
