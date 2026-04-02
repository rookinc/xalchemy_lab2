const frameInput = document.getElementById("frame");
const phaseInput = document.getElementById("phase");
const opSelect = document.getElementById("op");
const out = document.getElementById("out");
const statusLine = document.getElementById("status");

const R = 1;
const FRAME_COUNT = 5 * R;

function mod(n, m) {
  return ((n % m) + m) % m;
}

function validateState(state) {
  const [frame, phase] = state;
  if (!Number.isInteger(frame) || !Number.isInteger(phase)) {
    throw new Error("state entries must be integers");
  }
  if (frame < 0 || frame >= FRAME_COUNT) {
    throw new Error(`frame must satisfy 0 <= frame < ${FRAME_COUNT}`);
  }
  if (phase !== 0 && phase !== 1) {
    throw new Error("phase must be 0 or 1");
  }
  return state;
}

function o(i) {
  return `o${i}`;
}

function s(i) {
  return `s${i}`;
}

function t(i) {
  return `t${i}`;
}

function subjectiveCycle(i) {
  i = mod(i, FRAME_COUNT);
  return [
    o(i),
    o(mod(i + 1, FRAME_COUNT)),
    o(mod(i + 2, FRAME_COUNT)),
    s(mod(i + 2, FRAME_COUNT)),
    t(i),
    s(i),
  ];
}

function objectiveCycle(i) {
  i = mod(i, FRAME_COUNT);
  return [
    o(i),
    o(mod(i + 1, FRAME_COUNT)),
    o(mod(i + 2, FRAME_COUNT)),
    s(mod(i + 3, FRAME_COUNT)),
    t(mod(i + 3, FRAME_COUNT)),
    s(i),
  ];
}

function witnessCycle(state) {
  const [frame, phase] = validateState(state);
  return phase === 0 ? subjectiveCycle(frame) : objectiveCycle(frame);
}

function actionCell(frame) {
  frame = mod(frame, FRAME_COUNT);
  return [
    o(mod(frame + 2, FRAME_COUNT)),
    s(mod(frame + 2, FRAME_COUNT)),
    t(frame),
    s(frame),
    t(mod(frame + 3, FRAME_COUNT)),
    s(mod(frame + 3, FRAME_COUNT)),
  ];
}

function phaseLabel(state) {
  return validateState(state)[1] === 0 ? "subjective" : "objective";
}

function alignment(state) {
  return validateState(state)[1] === 0 ? "return" : "forward";
}

function spread(state) {
  return validateState(state)[1] === 0 ? 4 : 5;
}

function fiberSize(state) {
  return validateState(state)[1] === 0 ? 26 : 18;
}

function frameBits() {
  return Math.max(1, Math.ceil(Math.log2(FRAME_COUNT)));
}

function stateCode(state) {
  const [frame, phase] = validateState(state);
  const fb = frameBits();
  return `${frame.toString(2).padStart(fb, "0")}${phase}`;
}

function tau(state) {
  const [frame, phase] = validateState(state);
  return [mod(frame + 1, FRAME_COUNT), phase];
}

function tauInv(state) {
  const [frame, phase] = validateState(state);
  return [mod(frame - 1, FRAME_COUNT), phase];
}

function mu(state) {
  const [frame, phase] = validateState(state);
  return [frame, 1 - phase];
}

function applyLocal(state, op) {
  validateState(state);
  if (op === "tau") return tau(state);
  if (op === "tau_inv") return tauInv(state);
  if (op === "mu") return mu(state);
  throw new Error(`unknown op: ${op}`);
}

function stateDict(state) {
  validateState(state);
  const [frame, phase] = state;
  return {
    state: [frame, phase],
    code: stateCode(state),
    frame,
    phase,
    phase_label: phaseLabel(state),
    witness_cycle: witnessCycle(state),
    species: "O-O-O-S-T-S",
    alignment: alignment(state),
    spread: spread(state),
    fiber: fiberSize(state),
    action_cell: actionCell(frame),
    action_species: "O-S-T-S-T-S",
    tau: tau(state),
    tau_inv: tauInv(state),
    mu: mu(state),
    output: {
      alignment: alignment(state),
      spread: spread(state),
      fiber: fiberSize(state),
    },
  };
}

function getStateFromInputs() {
  return [
    parseInt(frameInput.value, 10),
    parseInt(phaseInput.value, 10),
  ];
}

function setStateInputs(state) {
  frameInput.value = state[0];
  phaseInput.value = state[1];
}

function renderPayload(payload, sourceLabel = "local") {
  out.textContent =
`source: ${sourceLabel}

state: [${payload.state.join(", ")}]
code: ${payload.code}
phase: ${payload.phase_label}

cycle:
  ${payload.witness_cycle.join(" -> ")}

action:
  ${payload.action_cell.join(" -> ")}

invariants:
  alignment: ${payload.alignment}
  spread: ${payload.spread}
  fiber: ${payload.fiber}

transitions:
  tau: [${payload.tau.join(", ")}]
  tau_inv: [${payload.tau_inv.join(", ")}]
  mu: [${payload.mu.join(", ")}]`;
}

function renderError(err) {
  out.textContent = `error: ${err.message}`;
}

function setStatus(msg) {
  statusLine.textContent = msg;
}

function apply() {
  try {
    const state = getStateFromInputs();
    const op = opSelect.value;
    const nextState = applyLocal(state, op);
    const payload = stateDict(nextState);
    setStateInputs(nextState);
    renderPayload(payload, "local echo");
    setStatus("local step complete");
  } catch (err) {
    renderError(err);
    setStatus("local step failed");
  }
}

async function verify() {
  try {
    const state = getStateFromInputs();
    validateState(state);
    const url = `/witness/api/state?frame=${state[0]}&phase=${state[1]}&r=${R}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.detail || "verification failed");
    }

    renderPayload(data.payload, "witness canon");
    setStatus("verified against witness harness");
  } catch (err) {
    renderError(err);
    setStatus("verification failed");
  }
}

function step(op) {
  opSelect.value = op;
  apply();
}

window.apply = apply;
window.verify = verify;
window.step = step;

try {
  const initial = stateDict(getStateFromInputs());
  renderPayload(initial, "local echo");
  setStatus("ready");
} catch (err) {
  renderError(err);
  setStatus("initialization failed");
}
