const els = {
  resetBtn: document.getElementById('reset-btn'),
  traceBtn: document.getElementById('trace-btn'),
  verifyBtn: document.getElementById('verify-btn'),
  playBtn: document.getElementById('play-btn'),
  frameInput: document.getElementById('frame-input'),
  phaseInput: document.getElementById('phase-input'),
  sheetInput: document.getElementById('sheet-input'),
  hzInput: document.getElementById('hz-input'),
  hzValue: document.getElementById('hz-value'),
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
  stageViz: document.getElementById('stage-viz'),
  stageVizGrid: document.getElementById('stage-viz-grid'),
  stageVizPath: document.getElementById('stage-viz-path'),
  stageVizPulses: document.getElementById('stage-viz-pulses'),
  stageVizNodes: document.getElementById('stage-viz-nodes'),
  stageVizLabels: document.getElementById('stage-viz-labels'),
  g60Stage: document.getElementById('g60-stage'),
  g60StageEdges: document.getElementById('g60-stage-edges'),
  g60StageEdgeOverlay: document.getElementById('g60-stage-edge-overlay'),
  g60StageNodes: document.getElementById('g60-stage-nodes'),
  g60StageNodeOverlay: document.getElementById('g60-stage-node-overlay'),
  g60StageLabels: document.getElementById('g60-stage-labels'),
  g60G30Class: document.getElementById('g60-g30-class'),
  g60G15Class: document.getElementById('g60-g15-class'),
  g60PrimaryNode: document.getElementById('g60-primary-node'),
  g60OpLabel: document.getElementById('g60-op-label'),
  g60PhaseLabel: document.getElementById('g60-phase-label'),
  g60SheetLabel: document.getElementById('g60-sheet-label'),
};

const LAB = {
  frameModulus: 15,
  maxHistory: 240,
  g30MotifsPerLoop: 10,
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
  g60LayoutReady: false,
  g60LastFocusKey: '',
  lastTransitionOp: 'start',
  g60LastPrimaryNode: null,
  g60TauPulseToken: 0,
};

function setStatus(text) {
  if (els.statusText) {
    els.statusText.textContent = text;
  }
  if (els.metricStatus) {
    els.metricStatus.textContent = text;
  }
}


function updateHzLabel() {
  if (els.hzInput && els.hzValue) {
    els.hzValue.textContent = String(els.hzInput.value);
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


function summarizeOpsForDisplay(ops, maxChars = 120) {
  const text = ops.join(',');
  if (text.length <= maxChars) return text || '(none)';

  let out = '';
  let count = 0;
  for (const op of ops) {
    const next = out ? `${out},${op}` : op;
    if (next.length > maxChars - 12) break;
    out = next;
    count += 1;
  }

  const remaining = Math.max(ops.length - count, 0);
  return remaining > 0 ? `${out}, … (+${remaining} more)` : out;
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
  if (!els.traceOutput) return;
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
  if (!els.traceOutput) return;
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
    `current_op          : ${state.isPlaying ? currentOpLabel() : '(stopped)'}`,
    ``,
    `end_state           : ${formatStateTriple(end.state)}`,
    `end_projected       : ${formatWitnessPair(end.projected_witness_state)}`,
    ``,
    `sheet_changed       : ${start.sheet !== end.state.sheet}`,
    `phase_changed       : ${start.phase !== end.state.phase}`,
    `frame_changed       : ${start.frame !== end.state.frame}`,
  ];

  const hasPlaybackHistory = state.playIndex > 0 || state.loopCount > 0 || state.playHistory.length > 0;
  const totalSteps = hasPlaybackHistory ? state.playIndex : (payload.trace.length - 1);
  const motifCount = hasPlaybackHistory ? state.loopCount : Math.floor((payload.trace.length - 1) / 3);
  const g30LoopsObserved = Math.floor(motifCount / LAB.g30MotifsPerLoop);
  const windowSteps = payload.trace.length - 1;
  const windowG15Count = ops.filter(op => op === 'g15').length;

  lines.push('');
  lines.push(`total_steps         : ${totalSteps}`);
  lines.push(`motif_count         : ${motifCount}`);
  lines.push(`g30_loops_observed  : ${g30LoopsObserved}`);
  lines.push(`window_steps        : ${windowSteps}`);
  lines.push(`window_g15_count    : ${windowG15Count}`);



  if (verification) {
    lines.push('');
    lines.push(`verify_status       : ${verification.ok ? 'match' : 'mismatch'}`);
    if (verification.reason) {
      lines.push(`verify_reason       : ${verification.reason}`);
    }
  }

  els.summaryOutput.textContent = lines.join('\n');
}



const SVG_NS = 'http://www.w3.org/2000/svg';

const G60_LAYOUT = {
  n0: [450, 312],
  n1: [450, 220],
  n2: [450, 128],
  "3": [450, 78],
  "4": [280, 60],
  "5": [450, 48],
  "6": [620, 60],
  "7": [620, 150],
  "8": [280, 258],
  "9": [280, 170],
  "10": [620, 228],
  "11": [620, 302],
  "12": [280, 302],
  "13": [450, 170],
  "14": [450, 258],
};

async function fetchG60Focus(stateTriple) {
  const params = new URLSearchParams({
    frame: String(stateTriple.frame),
    phase: String(stateTriple.phase),
    sheet: String(stateTriple.sheet),
  });
  const res = await fetch(`/witness/api/g60/from-g30?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} :: ${await res.text()}`);
  }
  const data = await res.json();
  return data.payload;
}

function animateG60TauPulse(fromNodeId, toNodeId, minus = false) {
  if (!els.g60StageNodeOverlay) return;
  if (!fromNodeId || !toNodeId) return;
  if (!G60_LAYOUT[fromNodeId] || !G60_LAYOUT[toNodeId]) return;

  const token = ++state.g60TauPulseToken;
  const [x1, y1] = G60_LAYOUT[fromNodeId];
  const [x2, y2] = G60_LAYOUT[toNodeId];

  const line = svgEl('line', {
    x1, y1, x2, y2,
    class: `g60-edge active op-tau${minus ? ' sheet-minus' : ''}`,
    'stroke-opacity': '0.75',
  });

  const dot = svgEl('circle', {
    cx: x1,
    cy: y1,
    r: 7,
    class: `g60-node active primary${minus ? ' sheet-minus' : ''}`,
  });

  els.g60StageNodeOverlay.appendChild(line);
  els.g60StageNodeOverlay.appendChild(dot);

  const durationMs = 260;
  const started = performance.now();

  function step(now) {
    if (token !== state.g60TauPulseToken) return;

    const t = Math.min(1, (now - started) / durationMs);
    const ease = 1 - Math.pow(1 - t, 3);

    const x = x1 + (x2 - x1) * ease;
    const y = y1 + (y2 - y1) * ease;

    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('opacity', String(1 - 0.35 * t));

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (line.parentNode) line.parentNode.removeChild(line);
      if (dot.parentNode) dot.parentNode.removeChild(dot);
    }
  }

  requestAnimationFrame(step);
}

function drawG60Base() {
  if (!els.g60Stage || !els.g60StageEdges || !els.g60StageNodes || !els.g60StageLabels) return;
  if (state.g60LayoutReady) return;

  const edgeDefs = [
    ['n0','n1'], ['n1','n2'],
    ['3','8'], ['8','14'], ['14','11'], ['11','12'], ['12','3'],
    ['3','9'], ['9','10'], ['10','7'], ['7','8'],
    ['14','13'],
    ['4','5'], ['5','6'], ['6','3'], ['3','4'],
    ['5','n2'], ['n2','3'],
    ['n0','14'], ['n1','13'], ['n2','5'],
    ['4','n2'], ['n2','6'], ['14','3'], ['14','7'], ['5','3'], ['8','13'], ['13','10'], ['7','11'],
    ['8','9'], ['3','10'], ['3','7'], ['13','n2'],
  ];

  const seen = new Set();
  for (const [a, b] of edgeDefs) {
    const key = [a, b].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    const [x1, y1] = G60_LAYOUT[a];
    const [x2, y2] = G60_LAYOUT[b];
    const line = svgEl('line', {
      x1, y1, x2, y2,
      class: 'g60-edge',
      'data-edge': key,
    });
    els.g60StageEdges.appendChild(line);
  }

  for (const [nodeId, [x, y]] of Object.entries(G60_LAYOUT)) {
    const circle = svgEl('circle', {
      cx: x,
      cy: y,
      r: 13,
      class: 'g60-node',
      'data-node': nodeId,
    });
    els.g60StageNodes.appendChild(circle);

    const label = svgEl('text', {
      x,
      y: y + 30,
      class: 'g60-label',
    });
    label.textContent = nodeId;
    els.g60StageLabels.appendChild(label);
  }

  state.g60LayoutReady = true;
}

async function updateG60Panel(payload) {
  if (!els.g60Stage) return;
  drawG60Base();

  const end = payload.trace[payload.trace.length - 1];
  if (!end || !end.state) return;

  const previousPrimary = state.g60LastPrimaryNode;
  const focus = await fetchG60Focus(end.state);
  const sf = focus.scaffold_focus;
  const key = JSON.stringify(focus.input_state);
  state.g60LastFocusKey = key;

  const opLabel = state.lastTransitionOp || 'start';
  const phaseLabel = sf.phase_band || 'subjective';
  const sheetLabel = sf.sheet_accent || '+';

  const g60Card = els.g60Stage.closest('.g60-card');
  if (g60Card) {
    g60Card.classList.remove('op-tau', 'op-mu', 'op-g15');
    if (opLabel === 'tau') g60Card.classList.add('op-tau');
    if (opLabel === 'mu') g60Card.classList.add('op-mu');
    if (opLabel === 'g15') g60Card.classList.add('op-g15');
  }

  if (els.g60G30Class) els.g60G30Class.textContent = focus.g30_focus.class_id;
  if (els.g60G15Class) els.g60G15Class.textContent = focus.g15_focus.class_id;
  if (els.g60PrimaryNode) els.g60PrimaryNode.textContent = sf.primary_node;
  if (els.g60OpLabel) els.g60OpLabel.textContent = opLabel;
  if (els.g60PhaseLabel) els.g60PhaseLabel.textContent = phaseLabel;
  if (els.g60SheetLabel) {
    els.g60SheetLabel.textContent = sheetLabel;
    els.g60SheetLabel.classList.remove('sheet-plus', 'sheet-minus');
    els.g60SheetLabel.classList.add(sheetLabel === '-' ? 'sheet-minus' : 'sheet-plus');
  }

  els.g60StageEdgeOverlay.textContent = '';
  els.g60StageNodeOverlay.textContent = '';

  const nodeEls = Array.from(els.g60StageNodes.querySelectorAll('.g60-node'));
  nodeEls.forEach((node) => {
    node.classList.remove('active', 'neighbor', 'primary', 'sheet-minus', 'op-mu', 'op-g15');
  });

  const active = new Set(sf.active_nodes || []);
  const neighbors = new Set(sf.neighbor_nodes || []);
  const primary = sf.primary_node;
  const minus = sf.sheet_accent === '-';

  nodeEls.forEach((node) => {
    const id = node.getAttribute('data-node');
    if (neighbors.has(id)) node.classList.add('neighbor');
    if (active.has(id)) node.classList.add('active');
    if (id === primary) node.classList.add('primary');
    if (minus && (active.has(id) || id === primary)) node.classList.add('sheet-minus');
    if (opLabel === 'mu' && (active.has(id) || id === primary)) node.classList.add('op-mu');
    if (opLabel === 'g15' && (active.has(id) || id === primary)) node.classList.add('op-g15');
  });

  const overlayDefs = [
    ['n0','n1'], ['n1','n2'],
    ['3','8'], ['8','14'], ['14','11'], ['11','12'], ['12','3'],
    ['3','9'], ['9','10'], ['10','7'], ['7','8'],
    ['14','13'],
    ['4','5'], ['5','6'], ['6','3'], ['3','4'],
    ['5','n2'], ['n2','3'],
    ['n0','14'], ['n1','13'], ['n2','5'],
    ['4','n2'], ['n2','6'], ['14','3'], ['14','7'], ['5','3'], ['8','13'], ['13','10'], ['7','11'],
    ['8','9'], ['3','10'], ['3','7'], ['13','n2'],
  ];

  for (const [a, b] of overlayDefs) {
    const aActive = active.has(a) || a === primary;
    const bActive = active.has(b) || b === primary;
    if (!(aActive && bActive) && !(a === primary && neighbors.has(b)) && !(b === primary && neighbors.has(a))) {
      continue;
    }
    const [x1, y1] = G60_LAYOUT[a];
    const [x2, y2] = G60_LAYOUT[b];
    const extraOpClass = opLabel === 'tau' ? ' op-tau' : (opLabel === 'mu' ? ' op-mu' : (opLabel === 'g15' ? ' op-g15' : ''));
    const line = svgEl('line', {
      x1, y1, x2, y2,
      class: `g60-edge active${minus ? ' sheet-minus' : ''}${extraOpClass}`,
    });
    els.g60StageEdgeOverlay.appendChild(line);
  }

  if (primary && G60_LAYOUT[primary]) {
    const [x, y] = G60_LAYOUT[primary];
    const extraOpClass = opLabel === 'tau' ? ' op-tau' : (opLabel === 'mu' ? ' op-mu' : (opLabel === 'g15' ? ' op-g15' : ''));
    const ring = svgEl('circle', {
      cx: x,
      cy: y,
      r: 20,
      class: `g60-ring ${sf.phase_band === 'objective' ? 'phase-objective' : 'phase-subjective'}${extraOpClass}`,
    });
    els.g60StageNodeOverlay.appendChild(ring);
  }

  if (opLabel === 'tau' && previousPrimary && previousPrimary !== primary) {
    animateG60TauPulse(previousPrimary, primary, minus);
  }

  state.g60LastPrimaryNode = primary || null;
}


function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

function stagePoint(frame, phase) {
  const left = 74;
  const right = 860;
  const topY = 72;
  const bottomY = 190;
  const stepX = (right - left) / 14;
  return {
    x: left + (stepX * frame),
    y: phase === 1 ? topY : bottomY,
  };
}

function drawStageGrid() {
  if (!els.stageVizGrid || !els.stageVizNodes || !els.stageVizLabels) return;
  if (els.stageVizGrid.dataset.ready === '1') return;

  for (let f = 0; f < 15; f += 1) {
    const p0 = stagePoint(f, 0);
    const p1 = stagePoint(f, 1);

    els.stageVizGrid.appendChild(svgEl('line', {
      x1: p1.x,
      y1: 42,
      x2: p0.x,
      y2: 220,
      class: 'stage-grid-line',
    }));

    const label = svgEl('text', {
      x: p0.x,
      y: 242,
      class: 'stage-node-label',
    });
    label.textContent = String(f);
    els.stageVizLabels.appendChild(label);
  }

  els.stageVizGrid.appendChild(svgEl('line', {
    x1: 46,
    y1: 72,
    x2: 874,
    y2: 72,
    class: 'stage-grid-line phase-divider',
  }));
  els.stageVizGrid.appendChild(svgEl('line', {
    x1: 46,
    y1: 190,
    x2: 874,
    y2: 190,
    class: 'stage-grid-line phase-divider',
  }));

  const phase1 = svgEl('text', { x: 16, y: 76, class: 'stage-phase-label' });
  phase1.textContent = 'φ1';
  els.stageVizLabels.appendChild(phase1);

  const phase0 = svgEl('text', { x: 16, y: 194, class: 'stage-phase-label' });
  phase0.textContent = 'φ0';
  els.stageVizLabels.appendChild(phase0);

  for (let phase = 0; phase <= 1; phase += 1) {
    for (let frame = 0; frame < 15; frame += 1) {
      const p = stagePoint(frame, phase);
      els.stageVizNodes.appendChild(svgEl('circle', {
        cx: p.x,
        cy: p.y,
        r: 7,
        class: 'stage-node',
        'data-frame': frame,
        'data-phase': phase,
      }));
    }
  }

  els.stageVizGrid.dataset.ready = '1';
}

function updateStageViz(payload) {
  if (!els.stageViz) return;
  drawStageGrid();

  els.stageVizPath.textContent = '';
  els.stageVizPulses.textContent = '';

  const nodes = Array.from(els.stageVizNodes.querySelectorAll('.stage-node'));
  nodes.forEach((node) => {
    node.classList.remove('visited', 'current', 'sheet-flip');
  });

  const trace = payload.trace || [];
  const pts = [];

  for (const row of trace) {
    const pair = row.projected_witness_state;
    if (!pair || pair.length !== 2) continue;
    const p = stagePoint(pair[0], pair[1]);
    pts.push({ ...p, row });
  }

  if (pts.length >= 2) {
    const d = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    els.stageVizPath.appendChild(svgEl('path', {
      d,
      class: 'stage-path-line',
    }));
  }

  for (const p of pts) {
    els.stageVizPath.appendChild(svgEl('circle', {
      cx: p.x,
      cy: p.y,
      r: 3.4,
      class: 'stage-path-dot',
    }));
  }

  for (const row of trace) {
    const pair = row.projected_witness_state;
    if (!pair || pair.length !== 2) continue;
    const sel = `.stage-node[data-frame="${pair[0]}"][data-phase="${pair[1]}"]`;
    const node = els.stageVizNodes.querySelector(sel);
    if (node) node.classList.add('visited');
    if (node && row.op === 'g15') node.classList.add('sheet-flip');
  }

  const end = trace[trace.length - 1];
  if (end && end.projected_witness_state) {
    const [frame, phase] = end.projected_witness_state;
    const sel = `.stage-node[data-frame="${frame}"][data-phase="${phase}"]`;
    const node = els.stageVizNodes.querySelector(sel);
    if (node) node.classList.add('current');

    const pulse = svgEl('circle', {
      cx: stagePoint(frame, phase).x,
      cy: stagePoint(frame, phase).y,
      r: 13,
      class: 'stage-pulse',
    });
    els.stageVizPulses.appendChild(pulse);
  }
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
  updateStageViz(payload);
  updateG60Panel(payload).catch((err) => console.error('updateG60Panel failed:', err));
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
  return makeState(0, 0, '+');
}

function getOpsFromInput() {
  return ['tau', 'mu', 'g15'];
}

function syncInputsFromState(s) {
  if (els.frameInput) {
    els.frameInput.value = String(s.frame);
  }
  if (els.phaseInput) {
    els.phaseInput.value = String(s.phase);
  }
  void s;
}

function runTraceFromInputs() {
  const start = getStartStateFromInputs();
  const ops = getOpsFromInput();
  const payload = buildTrace(start, ops);
  const end = payload.trace[payload.trace.length - 1];
  state.lastTransitionOp = end && end.op ? end.op : 'start';
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
  const hz = Math.max(2, Math.min(60, Number(els.hzInput.value) || 2));
  const delayMs = Math.max(16, Math.floor(1000 / hz));
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

    state.lastTransitionOp = op;

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
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }

  const isFreshStart = !state.liveState || !state.playStartState || state.playHistory.length === 0;

  state.isPlaying = true;

  if (isFreshStart) {
    state.loopCount = 0;
    state.playIndex = 0;
    state.playStartState = getStartStateFromInputs();
    state.liveState = cloneState(state.playStartState);
    state.playHistory = [];

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
  }

  setRunningUI(true);
  setStatus('running');
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
  if (els.frameInput) els.frameInput.value = '0';
  if (els.phaseInput) els.phaseInput.value = '0';
  
  if (els.opsInput) els.opsInput.value = 'tau,mu,g15';
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

els.hzInput.addEventListener('input', () => {
  updateHzLabel();
});

setRunningUI(false);
updateHzLabel();
runTraceFromInputs();
