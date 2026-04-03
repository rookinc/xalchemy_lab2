const els = {
  resetBtn: document.getElementById('reset-btn'),
  stepBtn: document.getElementById('step-btn'),
  playBtn: document.getElementById('play-btn'),
  frameInput: document.getElementById('frame-input'),
  phaseInput: document.getElementById('phase-input'),
  hzInput: document.getElementById('hz-input'),
  modeInput: document.getElementById('mode-input'),
  statusText: document.getElementById('status-text'),
  codeText: document.getElementById('code-text'),
  stateText: document.getElementById('state-text'),
  phaseText: document.getElementById('phase-text'),
  alignmentText: document.getElementById('alignment-text'),
  payloadText: document.getElementById('payload-text'),
  consoleOutput: document.getElementById('console-output'),
};

const state = {
  frame: 0,
  phase: 0,
  r: 1,
  isPlaying: false,
  timer: null,
  stepCount: 0,
  alternateFlip: false,
};

function frameCount(r = 1) {
  return 5 * r;
}

function clampFrame(frame, r = 1) {
  const n = frameCount(r);
  return ((frame % n) + n) % n;
}

function setStatus(text) {
  els.statusText.textContent = text;
}

function setRunningUI(isRunning) {
  els.playBtn.classList.toggle('is-running', isRunning);
  els.playBtn.textContent = isRunning ? 'Pause' : 'Play';
}

async function fetchAssembly(frame, phase, r = 1) {
  const url = `/witness/api/assembly?frame=${frame}&phase=${phase}&r=${r}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

function renderConsole(payload) {
  const lines = [
    `state            : (${payload.frame},${payload.phase})`,
    `code             : ${payload.code}`,
    `phase_label      : ${payload.phase_label}`,
    `alignment        : ${payload.alignment}`,
    `spread           : ${payload.spread}`,
    `fiber            : ${payload.fiber}`,
    `payload          : ${payload.payload}`,
    `is_exact_payload : ${payload.is_exact_payload}`,
    ``,
    `assembly         : ${JSON.stringify(payload.assembly, null, 2)}`,
    ``,
    `witness_cycle    : ${JSON.stringify(payload.witness_cycle)}`,
    `action_cell      : ${JSON.stringify(payload.action_cell)}`,
    `closed_word      : ${JSON.stringify(payload.closed_witness_word)}`,
    ``,
    `diads            : ${JSON.stringify(payload.diads)}`,
    `couplers         : ${JSON.stringify(payload.couplers)}`,
    `rigid_edges      : ${JSON.stringify(payload.rigid_edges)}`,
    `variable_edges   : ${JSON.stringify(payload.variable_edges)}`,
    ``,
    `tau              : ${JSON.stringify(payload.tau)}`,
    `tau_inv          : ${JSON.stringify(payload.tau_inv)}`,
    `mu               : ${JSON.stringify(payload.mu)}`,
    ``,
    `step_count       : ${state.stepCount}`,
  ];

  els.consoleOutput.textContent = lines.join('\n');
}

function renderStatus(payload) {
  els.codeText.textContent = payload.code;
  els.stateText.textContent = `(${payload.frame},${payload.phase})`;
  els.phaseText.textContent = payload.phase_label;
  els.alignmentText.textContent = payload.alignment;
  els.payloadText.textContent = payload.payload;
}

async function syncFromInputs() {
  state.frame = clampFrame(Number(els.frameInput.value) || 0, state.r);
  state.phase = Number(els.phaseInput.value) || 0;
  els.frameInput.value = String(state.frame);
  els.phaseInput.value = String(state.phase);
  await loadCurrentState();
}

function nextStateByMode(payload) {
  const mode = els.modeInput.value;

  if (mode === 'tau') {
    return { frame: payload.tau[0], phase: payload.tau[1] };
  }

  if (mode === 'mu') {
    return { frame: payload.mu[0], phase: payload.mu[1] };
  }

  if (mode === 'alternate') {
    state.alternateFlip = !state.alternateFlip;
    const target = state.alternateFlip ? payload.tau : payload.mu;
    return { frame: target[0], phase: target[1] };
  }

  return { frame: payload.tau[0], phase: payload.tau[1] };
}

async function loadCurrentState() {
  setStatus('loading');
  try {
    const data = await fetchAssembly(state.frame, state.phase, state.r);
    const payload = data.payload;
    renderStatus(payload);
    renderConsole(payload);
    setStatus('ready');
    return payload;
  } catch (err) {
    console.error(err);
    setStatus('error');
    els.consoleOutput.textContent = String(err);
    return null;
  }
}

async function stepOnce() {
  const payload = await loadCurrentState();
  if (!payload) return;

  const next = nextStateByMode(payload);
  state.frame = clampFrame(next.frame, state.r);
  state.phase = next.phase;
  state.stepCount += 1;

  els.frameInput.value = String(state.frame);
  els.phaseInput.value = String(state.phase);

  await loadCurrentState();
}

function stopPlayback(status = 'paused') {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  state.isPlaying = false;
  setRunningUI(false);
  setStatus(status);
}

function startPlayback() {
  stopPlayback('running');
  state.isPlaying = true;
  setRunningUI(true);
  setStatus('running');

  const hz = Math.max(1, Math.min(60, Number(els.hzInput.value) || 2));
  const intervalMs = Math.floor(1000 / hz);

  state.timer = setInterval(async () => {
    if (!state.isPlaying) return;
    await stepOnce();
  }, intervalMs);
}

els.resetBtn.addEventListener('click', async () => {
  stopPlayback('ready');
  state.frame = 0;
  state.phase = 0;
  state.stepCount = 0;
  state.alternateFlip = false;
  els.frameInput.value = '0';
  els.phaseInput.value = '0';
  await loadCurrentState();
});

els.stepBtn.addEventListener('click', async () => {
  stopPlayback('ready');
  await stepOnce();
});

els.playBtn.addEventListener('click', () => {
  if (state.isPlaying) {
    stopPlayback('paused');
  } else {
    startPlayback();
  }
});

els.frameInput.addEventListener('change', syncFromInputs);
els.phaseInput.addEventListener('change', syncFromInputs);
els.modeInput.addEventListener('change', () => {
  state.alternateFlip = false;
});
els.hzInput.addEventListener('change', () => {
  if (state.isPlaying) startPlayback();
});

setRunningUI(false);
loadCurrentState();
