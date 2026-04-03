const els = {
  resetBtn: document.getElementById('reset-btn'),
  traceBtn: document.getElementById('trace-btn'),
  verifyBtn: document.getElementById('verify-btn'),
  playBtn: document.getElementById('play-btn'),
  frameInput: document.getElementById('frame-input'),
  phaseInput: document.getElementById('phase-input'),
  sheetInput: document.getElementById('sheet-input'),
  hzInput: document.getElementById('hz-input'),
  opsInput: document.getElementById('ops-input'),
  statusText: document.getElementById('status-text'),
  startText: document.getElementById('start-text'),
  projectedText: document.getElementById('projected-text'),
  stepsText: document.getElementById('steps-text'),
  opsText: document.getElementById('ops-text'),
  traceOutput: document.getElementById('trace-output'),
  summaryOutput: document.getElementById('summary-output'),
  stageLiveState: document.getElementById('stage-live-state'),
  stageLiveProjected: document.getElementById('stage-live-projected'),
  stageCurrentOp: document.getElementById('stage-current-op'),
  metricStatus: document.getElementById('metric-status'),
  metricLoops: document.getElementById('metric-loops'),
  metricSteps: document.getElementById('metric-steps'),
  metricEnd: document.getElementById('metric-end'),
};

const LAB = {
  frameModulus: 15,
  maxHistory: 240,
};

const state = {
  isPlaying: false,
  timer: null,
  loopCount: 0,
  playIndex: 0,
  liveState: null,
  playStartState: null,
  lastPayload: null,
  playHistory: [],
};

function setStatus(text) {
  if (els.statusText) {
    els.statusText.textContent = text;
  }
  if (els.metricStatus) {
    els.metricStatus.textContent = text;
  }
}

function setRunningUI(isRunning) {
  els.playBtn.classList.toggle('is-running', isRunning);
  els.playBtn.textContent = isRunning ? 'Pause' : 'Play';
}

function parseOps(text) {
  return text.split(',').map(x => x.trim()).filter(Boolean);
}

function normalizeFrame(n) {
  return ((n % LAB.frameModulus) + LAB.frameModulus) % LAB.frameModulus;
}

function makeState(frame, phase, sheet) {
  return {
    frame: normalizeFrame(Number(frame) || 0),
    phase: Number(phase) === 1 ? 1 : 0,
    sheet: sheet === '-' ? '-' : '+',
  };
}

function cloneState(s) {
  return { frame: s.frame, phase: s.phase, sheet: s.sheet };
}

function flipSheet(sheet) {
  return sheet === '+' ? '-' : '+';
}

function projectWitnessState(s) {
  return [s.frame, s.phase];
}

function applyOp(s, op) {
  const cur = cloneState(s);

  if (op === 'tau') {
    cur.frame = normalizeFrame(cur.frame + 1);
    return cur;
  }
  if (op === 'tau_inv') {
    cur.frame = normalizeFrame(cur.frame - 1);
    return cur;
  }
  if (op === 'mu') {
    cur.phase = cur.phase === 0 ? 1 : 0;
    return cur;
  }
  if (op === 'g15') {
    cur.sheet = flipSheet(cur.sheet);
    return cur;
  }
  if (op === 'g30') {
    return cur;
  }

  throw new Error(`Unknown op: ${op}`);
}

function formatStateTriple(s) {
  return `(${s.frame},${s.phase},${s.sheet})`;
}

function formatWitnessPair(pair) {
  return `(${pair[0]},${pair[1]})`;
}

function currentOpLabel() {
  const ops = getOpsFromInput();
  if (!ops.length) return '(none)';
  return ops[state.playIndex % ops.length];
}

function buildTrace(startState, ops) {
  const trace = [
    {
      step: 0,
      op: 'start',
      state: cloneState(startState),
      projected_witness_state: projectWitnessState(startState),
    },
  ];

  let cur = cloneState(startState);
  for (let i = 0; i < ops.length; i += 1) {
    cur = applyOp(cur, ops[i]);
    trace.push({
      step: i + 1,
      op: ops[i],
      state: cloneState(cur),
      projected_witness_state: projectWitnessState(cur),
    });
  }

  return {
    start: cloneState(startState),
    ops: [...ops],
    trace,
  };
}

function renderTrace(payload) {
  const lines = [];
  for (const row of payload.trace) {
    const marker = row.step === payload.trace.length - 1 ? '>' : ' ';
    lines.push(
      `${marker} ${String(row.step).padEnd(3)} ${row.op.padEnd(8)} ${formatStateTriple(row.state).padEnd(12)} -> ${formatWitnessPair(row.projected_witness_state)}`
    );
  }
  els.traceOutput.textContent = lines.join('\n');
}

function renderPlayHistory() {
  if (!state.isPlaying || state.playHistory.length === 0) return;

  const lines = ['play history', ''];
  for (const row of state.playHistory) {
    lines.push(
      `${String(row.index).padEnd(3)} ${row.op.padEnd(8)} ${formatStateTriple(row.before).padEnd(12)} -> ${formatStateTriple(row.after).padEnd(12)} -> ${formatWitnessPair(projectWitnessState(row.after))}`
    );
  }
  els.traceOutput.textContent = lines.join('\n');
}

function renderSummary(payload, verification = null) {
  const start = payload.start;
  const end = payload.trace[payload.trace.length - 1];
  const ops = payload.ops;

  const lines = [
    `start_state         : ${formatStateTriple(start)}`,
    `start_projected     : ${formatWitnessPair(payload.trace[0].projected_witness_state)}`,
    ``,
    `op_word             : ${ops.join(',') || '(none)'}`,
    `step_count          : ${payload.trace.length - 1}`,
    `loop_count          : ${state.loopCount}`,
    `play_index          : ${state.playIndex}`,
    `current_op          : ${state.isPlaying ? currentOpLabel() : '(stopped)'}`,
    ``,
    `end_state           : ${formatStateTriple(end.state)}`,
    `end_projected       : ${formatWitnessPair(end.projected_witness_state)}`,
    ``,
    `sheet_changed       : ${start.sheet !== end.state.sheet}`,
    `phase_changed       : ${start.phase !== end.state.phase}`,
    `frame_changed       : ${start.frame !== end.state.frame}`,
  ];

  const g15Count = ops.filter(op => op === 'g15').length;
  const g30Count = ops.filter(op => op === 'g30').length;
  if (g15Count || g30Count) {
    lines.push('');
    lines.push(`g15_count          : ${g15Count}`);
    lines.push(`g30_count          : ${g30Count}`);
  }

  if (state.isPlaying) {
    lines.push('');
    lines.push(`history_rows        : ${state.playHistory.length}`);
  }

  if (verification) {
    lines.push('');
    lines.push(`verify_status       : ${verification.ok ? 'match' : 'mismatch'}`);
    if (verification.reason) {
      lines.push(`verify_reason       : ${verification.reason}`);
    }
  }

  els.summaryOutput.textContent = lines.join('\n');
}


function updateStagePanel(payload) {
  if (!els.stageLiveState) return;

  const end = payload.trace[payload.trace.length - 1];
  const live = state.isPlaying && state.liveState ? state.liveState : end.state;
  const liveProjected = projectWitnessState(live);
  const currentOp = state.isPlaying ? currentOpLabel() : end.op;

  els.stageLiveState.textContent = formatStateTriple(live);
  els.stageLiveProjected.textContent = formatWitnessPair(liveProjected);
  els.stageCurrentOp.textContent = currentOp || 'start';

  if (els.metricStatus) els.metricStatus.textContent = state.isPlaying ? 'running' : 'ready';
  if (els.metricLoops) els.metricLoops.textContent = String(state.loopCount);
  if (els.metricSteps) els.metricSteps.textContent = String(state.isPlaying ? state.playIndex : (payload.trace.length - 1));
  if (els.metricEnd) els.metricEnd.textContent = formatStateTriple(live);
}

function renderPayload(payload, verification = null) {
  if (els.startText) {
    els.startText.textContent = formatStateTriple(payload.start);
  }
  if (els.projectedText) {
    els.projectedText.textContent = formatWitnessPair(payload.trace[0].projected_witness_state);
  }
  if (els.stepsText) {
    els.stepsText.textContent = String(payload.trace.length - 1);
  }
  if (els.opsText) {
    els.opsText.textContent = payload.ops.join(',');
  }
  if (state.isPlaying) {
    renderPlayHistory();
  } else {
    renderTrace(payload);
  }
  renderSummary(payload, verification);
  updateStagePanel(payload);
  state.lastPayload = payload;
}


async function verifyAgainstBackend() {
  const start = getStartStateFromInputs();
  const ops = getOpsFromInput();
  const localPayload = buildTrace(start, ops);

  const params = new URLSearchParams({
    frame: String(start.frame),
    phase: String(start.phase),
    sheet: String(start.sheet),
    ops: ops.join(','),
  });

  const res = await fetch(`/witness/api/g30/trace?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} :: ${await res.text()}`);
  }

  const data = await res.json();
  const remote = data.payload;

  const localTrace = localPayload.trace.map((row) => ({
    op: row.op,
    state: [row.state.frame, row.state.phase, row.state.sheet],
    projected: row.projected_witness_state,
  }));

  const remoteTrace = remote.trace.map((row) => ({
    op: row.op,
    state: row.state,
    projected: row.projected_witness_state,
  }));

  const sameLength = localTrace.length === remoteTrace.length;
  const sameRows = sameLength && localTrace.every((row, i) => {
    const other = remoteTrace[i];
    return (
      row.op === other.op &&
      JSON.stringify(row.state) === JSON.stringify(other.state) &&
      JSON.stringify(row.projected) === JSON.stringify(other.projected)
    );
  });

  return {
    payload: localPayload,
    verification: sameRows
      ? { ok: true, reason: 'local trace matches /witness/api/g30/trace' }
      : { ok: false, reason: 'local trace differs from /witness/api/g30/trace' },
  };
}

function getStartStateFromInputs() {
  return makeState(
    els.frameInput.value,
    els.phaseInput.value,
    els.sheetInput.value
  );
}

function getOpsFromInput() {
  const ops = parseOps(els.opsInput.value.trim() || 'tau');
  return ops.length ? ops : ['tau'];
}

function syncInputsFromState(s) {
  els.frameInput.value = String(s.frame);
  els.phaseInput.value = String(s.phase);
  els.sheetInput.value = s.sheet;
}

function runTraceFromInputs() {
  const start = getStartStateFromInputs();
  const ops = getOpsFromInput();
  const payload = buildTrace(start, ops);
  renderPayload(payload);
  state.playStartState = cloneState(start);
  state.liveState = cloneState(payload.trace[payload.trace.length - 1].state);
  setStatus(state.isPlaying ? 'running' : 'ready');
}

function stopPlayback(status = 'paused') {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  state.isPlaying = false;
  setRunningUI(false);
  setStatus(status);
  if (state.lastPayload) {
    renderPayload(state.lastPayload);
  }
}

function scheduleNextTick() {
  if (!state.isPlaying) return;
  const hz = Math.max(1, Math.min(10, Number(els.hzInput.value) || 2));
  const delayMs = Math.max(150, Math.floor(1000 / hz));
  state.timer = setTimeout(playbackTick, delayMs);
}

function pushHistory(entry) {
  state.playHistory.push(entry);
  if (state.playHistory.length > LAB.maxHistory) {
    state.playHistory.shift();
  }
}

function playbackTick() {
  try {
    if (!state.isPlaying) return;

    const ops = getOpsFromInput();
    if (!ops.length) {
      stopPlayback('ready');
      return;
    }

    if (!state.liveState) {
      state.liveState = getStartStateFromInputs();
    }

    const op = ops[state.playIndex % ops.length];
    const before = cloneState(state.liveState);
    const after = applyOp(before, op);

    pushHistory({
      index: state.playIndex,
      op,
      before,
      after,
    });

    const start = cloneState(state.playStartState || getStartStateFromInputs());
    const payload = {
      start,
      ops: state.playHistory.map(row => row.op),
      trace: [
        {
          step: 0,
          op: 'start',
          state: cloneState(start),
          projected_witness_state: projectWitnessState(start),
        },
        ...state.playHistory.map((row, idx) => ({
          step: idx + 1,
          op: row.op,
          state: cloneState(row.after),
          projected_witness_state: projectWitnessState(row.after),
        })),
      ],
    };

    state.liveState = cloneState(after);
    syncInputsFromState(after);

    state.playIndex += 1;
    if (state.playIndex % ops.length === 0) {
      state.loopCount += 1;
    }

    renderPayload(payload);
    setStatus('running');
    scheduleNextTick();
  } catch (err) {
    console.error('playbackTick failed:', err);
    stopPlayback('play error');
    const fallback = state.lastPayload || buildTrace(getStartStateFromInputs(), getOpsFromInput());
    renderPayload(fallback, { ok: false, reason: `playback error: ${String(err.message || err)}` });
  }
}

function startPlayback() {
  stopPlayback('running');
  state.isPlaying = true;
  state.loopCount = 0;
  state.playIndex = 0;
  state.playStartState = getStartStateFromInputs();
  state.liveState = cloneState(state.playStartState);
  state.playHistory = [];
  setRunningUI(true);
  setStatus('running');

  const seed = {
    start: cloneState(state.playStartState),
    ops: [],
    trace: [
      {
        step: 0,
        op: 'start',
        state: cloneState(state.playStartState),
        projected_witness_state: projectWitnessState(state.playStartState),
      },
    ],
  };
  renderPayload(seed);

  playbackTick();
}

async function fetchServerTrace(start, ops) {
  const params = new URLSearchParams({
    frame: String(start.frame),
    phase: String(start.phase),
    sheet: start.sheet,
    ops: ops.join(','),
  });
  const res = await fetch(`/witness/api/g30/trace?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${body ? ` :: ${body}` : ''}`);
  }
  return res.json();
}

function statesEqual(a, b) {
  return a.frame === b.frame && a.phase === b.phase && a.sheet === b.sheet;
}

function pairsEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === 2 && b.length === 2 && a[0] === b[0] && a[1] === b[1];
}

function comparePayloads(localPayload, serverPayload) {
  const server = serverPayload.payload;
  if (!server || !Array.isArray(server.trace)) {
    return { ok: false, reason: 'server payload missing trace' };
  }

  if (server.trace.length !== localPayload.trace.length) {
    return { ok: false, reason: `trace length mismatch local=${localPayload.trace.length} server=${server.trace.length}` };
  }

  for (let i = 0; i < localPayload.trace.length; i += 1) {
    const l = localPayload.trace[i];
    const s = server.trace[i];

    if (l.op !== s.op) {
      return { ok: false, reason: `op mismatch at step ${i}: local=${l.op} server=${s.op}` };
    }
    if (!statesEqual(l.state, s.state)) {
      return {
        ok: false,
        reason: `state mismatch at step ${i}: local=${formatStateTriple(l.state)} server=${formatStateTriple(s.state)}`
      };
    }
    if (!pairsEqual(l.projected_witness_state, s.projected_witness_state)) {
      return {
        ok: false,
        reason: `projection mismatch at step ${i}: local=${formatWitnessPair(l.projected_witness_state)} server=${formatWitnessPair(s.projected_witness_state)}`
      };
    }
  }

  return { ok: true };
}

els.resetBtn.addEventListener('click', () => {
  stopPlayback('ready');
  state.loopCount = 0;
  state.playIndex = 0;
  state.playHistory = [];
  els.frameInput.value = '0';
  els.phaseInput.value = '0';
  els.sheetInput.value = '+';
  els.opsInput.value = 'tau,mu,g15';
  runTraceFromInputs();
});

els.traceBtn.addEventListener('click', () => {
  stopPlayback('ready');
  state.loopCount = 0;
  state.playIndex = 0;
  state.playHistory = [];
  runTraceFromInputs();
});

els.verifyBtn.addEventListener('click', async () => {
  try {
    setStatus('verifying');
    const { payload, verification } = await verifyAgainstBackend();
    renderPayload(payload, verification);
    state.liveState = cloneState(payload.trace[payload.trace.length - 1].state);
    setStatus(verification.ok ? 'verified' : 'mismatch');
  } catch (err) {
    const fallback = state.lastPayload || buildTrace(getStartStateFromInputs(), getOpsFromInput());
    renderPayload(fallback, { ok: false, reason: String(err.message || err) });
    setStatus('verify error');
  }
});

els.playBtn.addEventListener('click', () => {
  if (state.isPlaying) {
    stopPlayback('paused');
  } else {
    startPlayback();
  }
});

els.hzInput.addEventListener('change', () => {
  if (state.isPlaying) {
    startPlayback();
  }
});

setRunningUI(false);
runTraceFromInputs();
