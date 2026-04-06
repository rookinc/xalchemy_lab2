const frameInput = document.getElementById("frame");
const phaseInput = document.getElementById("phase");
const opSelect = document.getElementById("op");
const zoomInput = document.getElementById("zoom");
const ghostInput = document.getElementById("ghost");
const showLabelsInput = document.getElementById("showLabels");
const showLatticeInput = document.getElementById("showLattice");
const showActionInput = document.getElementById("showAction");


const out = document.getElementById("out");
const statusLine = document.getElementById("status");
const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");

const R = 1;
const FRAME_COUNT = 5 * R;

let currentPayload = null;
let autoTimer = null;

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

function o(i) { return `o${i}`; }
function s(i) { return `s${i}`; }
function t(i) { return `t${i}`; }

function subjectiveCycle(i) {
  i = mod(i, FRAME_COUNT);
  return [o(i), o(mod(i + 1, FRAME_COUNT)), o(mod(i + 2, FRAME_COUNT)), s(mod(i + 2, FRAME_COUNT)), t(i), s(i)];
}

function objectiveCycle(i) {
  i = mod(i, FRAME_COUNT);
  return [o(i), o(mod(i + 1, FRAME_COUNT)), o(mod(i + 2, FRAME_COUNT)), s(mod(i + 3, FRAME_COUNT)), t(mod(i + 3, FRAME_COUNT)), s(i)];
}

function witnessCycle(state) {
  const [frame, phase] = validateState(state);
  return phase === 0 ? subjectiveCycle(frame) : objectiveCycle(frame);
}

function actionCell(frame) {
  frame = mod(frame, FRAME_COUNT);
  return [o(mod(frame + 2, FRAME_COUNT)), s(mod(frame + 2, FRAME_COUNT)), t(frame), s(frame), t(mod(frame + 3, FRAME_COUNT)), s(mod(frame + 3, FRAME_COUNT))];
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
  return `${frame.toString(2).padStart(frameBits(), "0")}${phase}`;
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
  return [parseInt(frameInput.value, 10), parseInt(phaseInput.value, 10)];
}

function setStateInputs(state) {
  frameInput.value = state[0];
  phaseInput.value = state[1];
}

function setStatus(msg) {
  statusLine.textContent = msg;
}

function syncStatusStrip(payload, sourceLabel) {
}

function asciiBlock(payload, sourceLabel) {
  return [
    `source  ${sourceLabel}`,
    ``,
    `state   [${payload.state.join(", ")}]`,
    `code    ${payload.code}`,
    `phase   ${payload.phase_label}`,
    `align   ${payload.alignment}`,
    `spread  ${payload.spread}`,
    `fiber   ${payload.fiber}`,
    ``,
    `cycle   ${payload.witness_cycle.join(" -> ")}`,
    `action  ${payload.action_cell.join(" -> ")}`,
    ``,
    `tau     [${payload.tau.join(", ")}]`,
    `tau^-1  [${payload.tau_inv.join(", ")}]`,
    `mu      [${payload.mu.join(", ")}]`,
  ].join("\n");
}

function renderPayload(payload, sourceLabel = "local") {
  currentPayload = payload;
  syncStatusStrip(payload, sourceLabel);
  drawGraph(payload);
  out.textContent = asciiBlock(payload, sourceLabel);
}

function renderError(err) {
  out.textContent = `error\n\n${err.message}`;
}

function apply() {
  try {
    const nextState = applyLocal(getStateFromInputs(), opSelect.value);
    const payload = stateDict(nextState);
    setStateInputs(nextState);
    renderPayload(payload, "local");
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

    renderPayload(data.payload, "canon");
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

function resetState() {
  const state = [0, 0];
  setStateInputs(state);
  renderPayload(stateDict(state), "local");
  setStatus("reset");
}

function toggleAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    setStatus("auto stopped");
    return;
  }
  autoTimer = setInterval(() => {
    try {
      step(opSelect.value);
    } catch (_) {}
  }, 500);
  setStatus("auto running");
}

function getNodePositions() {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const zoom = parseInt(zoomInput.value, 10) / 100;

  const outerR = Math.min(w, h) * 0.34 * zoom;
  const innerR = outerR * 0.62;
  const midR = outerR * 0.82;

  const positions = {};

  for (let i = 0; i < FRAME_COUNT; i++) {
    const aOuter = -Math.PI / 2 + (2 * Math.PI * i) / FRAME_COUNT;
    const aInner = aOuter;
    const aMid = aOuter + Math.PI / FRAME_COUNT;

    positions[`o${i}`] = { x: cx + outerR * Math.cos(aOuter), y: cy + outerR * Math.sin(aOuter), kind: "o" };
    positions[`s${i}`] = { x: cx + innerR * Math.cos(aInner), y: cy + innerR * Math.sin(aInner), kind: "s" };
    positions[`t${i}`] = { x: cx + midR * Math.cos(aMid), y: cy + midR * Math.sin(aMid), kind: "t" };
  }

  return positions;
}

function line(a, b, width = 1, alpha = 1) {
  ctx.beginPath();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function circle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function drawBackgroundLattice(pos) {
  if (!showLatticeInput.checked) return;
  ctx.strokeStyle = "#123d31";
  for (let i = 0; i < FRAME_COUNT; i++) {
    const ni = mod(i + 1, FRAME_COUNT);
    line(pos[`o${i}`], pos[`o${ni}`], 1, 0.35);
    line(pos[`s${i}`], pos[`s${ni}`], 1, 0.2);
    line(pos[`o${i}`], pos[`s${i}`], 1, 0.18);
    line(pos[`s${i}`], pos[`t${i}`], 1, 0.18);
    line(pos[`t${i}`], pos[`o${ni}`], 1, 0.14);
  }
}

function drawPath(names, pos, color, width, closeLoop = true) {
  if (!names || names.length < 2) return;
  ctx.strokeStyle = color;
  for (let i = 0; i < names.length - 1; i++) {
    line(pos[names[i]], pos[names[i + 1]], width, 1);
  }
  if (closeLoop) {
    line(pos[names[names.length - 1]], pos[names[0]], width, 1);
  }
}

function drawNodes(pos, payload) {
  const cycleSet = new Set(payload?.witness_cycle || []);
  const actionSet = new Set(payload?.action_cell || []);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "18px monospace";

  for (const [name, p] of Object.entries(pos)) {
    let radius = p.kind === "o" ? 20 : p.kind === "t" ? 16 : 15;
    let fill = "#0a1814";
    let stroke = "#1b5d49";
    let lineWidth = 2;

    if (actionSet.has(name)) {
      fill = "#2b1200";
      stroke = "#ff9f1a";
      lineWidth = 3;
    }

    if (cycleSet.has(name)) {
      fill = "#08231a";
      stroke = "#00f7a5";
      lineWidth = 4;
    }

    if (cycleSet.has(name) && actionSet.has(name)) {
      fill = "#2e2410";
      stroke = "#fff27a";
      lineWidth = 4;
    }

    circle(p.x, p.y, radius);
    ctx.fillStyle = fill;
    ctx.fill();

    circle(p.x, p.y, radius);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    if (showLabelsInput.checked) {
      ctx.fillStyle = "#dfffee";
      ctx.fillText(name, p.x, p.y);
    }
  }
}

function drawLegend(payload) {
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "16px monospace";
  ctx.fillStyle = "#b5f7db";
  ctx.fillText(`state ${payload.state[0]},${payload.state[1]}  ${payload.phase_label}`, 18, 18);
  ctx.fillText(`align ${payload.alignment}  spread ${payload.spread}  fiber ${payload.fiber}`, 18, 40);
  ctx.fillStyle = "#00f7a5";
  ctx.fillText("cycle", 18, 68);
  if (showActionInput.checked) {
    ctx.fillStyle = "#ffb347";
    ctx.fillText("action", 18, 90);
  }
}

function drawGraph(payload) {
  const ghost = parseInt(ghostInput.value, 10) / 100;
  if (ghost > 0) {
    ctx.fillStyle = `rgba(0,0,0,${ghost})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const pos = getNodePositions();
  drawBackgroundLattice(pos);

  if (showActionInput.checked) {
    drawPath(payload.action_cell, pos, "#ffb347", 4, true);
  }

  drawPath(payload.witness_cycle, pos, "#00f7a5", 6, true);
  drawNodes(pos, payload);
  drawLegend(payload);
}

zoomInput.addEventListener("input", () => {
  if (currentPayload) drawGraph(currentPayload);
});

ghostInput.addEventListener("input", () => {
  if (currentPayload) drawGraph(currentPayload);
});

showLabelsInput.addEventListener("change", () => {
  if (currentPayload) drawGraph(currentPayload);
});

showLatticeInput.addEventListener("change", () => {
  if (currentPayload) drawGraph(currentPayload);
});

showActionInput.addEventListener("change", () => {
  if (currentPayload) drawGraph(currentPayload);
});

window.apply = apply;
window.verify = verify;
window.step = step;
window.resetState = resetState;
window.toggleAuto = toggleAuto;

try {
  const initial = stateDict(getStateFromInputs());
  renderPayload(initial, "local");
  setStatus("ready");
} catch (err) {
  renderError(err);
  setStatus("initialization failed");
}
