const CW = {
  theorem: null,
  lens: null,
  params: null,
  nodes: [],
  edges: [],
  u: [],
  v: [],
  t: 0,
  playing: true,
  lastFrame: null,
  speed: 1
};

const PHASES = [
  { name: 'latent round', start: 0.00, end: 0.16 },
  { name: 'defect selection', start: 0.16, end: 0.30 },
  { name: 'cup fold', start: 0.30, end: 0.46 },
  { name: 'throat bridge', start: 0.46, end: 0.62 },
  { name: 'rebound jet', start: 0.62, end: 0.78 },
  { name: 'relaxation', start: 0.78, end: 1.01 }
];

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function phasePosition() {
  const cycle = CW.params?.cycle_duration ?? 6.0;
  return ((CW.t % cycle) / cycle);
}

function currentPhaseName() {
  const x = phasePosition();
  return PHASES.find(p => x >= p.start && x < p.end)?.name ?? 'relaxation';
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function phaseWindow(start, peak, end, x) {
  return smoothstep(start, peak, x) * (1 - smoothstep(peak, end, x));
}

function phaseMorphology() {
  const x = phasePosition();

  const defect = phaseWindow(0.12, 0.24, 0.38, x);
  const cup = phaseWindow(0.26, 0.40, 0.56, x);
  const throat = phaseWindow(0.42, 0.55, 0.70, x);
  const rebound = phaseWindow(0.60, 0.72, 0.88, x);
  const relax = smoothstep(0.78, 1.0, x);

  return {
    round: 1 - Math.max(defect, cup, throat, rebound) * 0.45,
    defect,
    cup,
    throat,
    rebound,
    relax,

    // Positive values here are drawing instructions, not theorem claims.
    crownIndent: 34 * defect + 18 * cup - 8 * rebound,
    shoulderLift: 10 * defect + 30 * cup + 10 * throat,
    throatPinch: 20 * cup + 44 * throat,
    throatDrop: 18 * cup + 20 * throat,
    jetExtend: 58 * rebound,
    reboundDome: 22 * rebound,
    asymmetry: 14 * defect - 8 * rebound
  };
}

function colorFor(value) {
  const x = clamp(value, -2.5, 2.5);
  if (x >= 0) {
    const k = Math.round(80 + 70 * Math.min(1, x / 2.5));
    return `rgb(${k + 70}, ${90 + k / 2}, 110)`;
  }
  const k = Math.round(80 + 90 * Math.min(1, -x / 2.5));
  return `rgb(70, ${100 + k / 2}, ${k + 80})`;
}

function makeSvg(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function setStatus(text) {
  const el = document.getElementById('cw-status');
  if (el) el.textContent = text;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function buildLayout() {
  const cx = 210;
  const cy = 160;
  const outer = 110;
  const inner = 55;

  CW.nodes = Array.from({ length: 15 }, (_, i) => {
    if (i < 10) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / 10;
      return { id: i, x: cx + outer * Math.cos(angle), y: cy + outer * Math.sin(angle) };
    }

    const angle = -Math.PI / 2 + (2 * Math.PI * (i - 10)) / 5 + Math.PI / 5;
    return { id: i, x: cx + inner * Math.cos(angle), y: cy + inner * Math.sin(angle) };
  });

  CW.edges = CW.theorem.petersen_edges_indexing || [];
}

function laplacian(u) {
  const out = Array(15).fill(0);
  const deg = Array(15).fill(0);

  for (const [a, b] of CW.edges) {
    deg[a] += 1;
    deg[b] += 1;
    out[a] -= u[b];
    out[b] -= u[a];
  }

  for (let i = 0; i < 15; i++) out[i] += deg[i] * u[i];
  return out;
}

function pulseAt(t) {
  const p = CW.params;
  const cycle = p.cycle_duration ?? 6.0;
  const local = t % cycle;
  const center = p.forcing.center_time;
  const width = p.forcing.width;
  return Math.exp(-((local - center) ** 2) / (width ** 2));
}

function step(dt) {
  const p = CW.params;
  const L = laplacian(CW.u);

  const damping = Number(document.getElementById('cw-damping')?.value ?? p.damping);
  const amplitude = Number(document.getElementById('cw-force')?.value ?? p.forcing.amplitude);
  const source = p.forcing.source_vertex;

  for (let i = 0; i < 15; i++) {
    const sourcePulse = i === source ? amplitude * pulseAt(CW.t) : 0;

    const nonlinear = p.nonlinear * CW.u[i] ** 3;
    const acc = sourcePulse
      - damping * CW.v[i]
      - p.stiffness * CW.u[i]
      - nonlinear
      - p.coupling * L[i];

    CW.v[i] += acc * dt;
    CW.u[i] += CW.v[i] * dt;
    CW.u[i] = clamp(CW.u[i], -4, 4);
  }

  CW.t += dt;
}

function columnResponse() {
  const M = CW.theorem.matrix_M;
  const cols = Array(30).fill(0);

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 30; c++) cols[c] += M[r][c] * CW.u[r];
  }

  return cols.map(x => x / 7);
}

function stationValues() {
  const out = {};
  for (const [name, rows] of Object.entries(CW.lens.stations)) {
    const sum = rows.reduce((acc, i) => acc + CW.u[i], 0);
    out[name] = rows.length ? sum / rows.length : 0;
  }
  return out;
}

function renderGraph() {
  const svg = document.getElementById('g15-panel');
  svg.innerHTML = '';

  for (const [a, b] of CW.edges) {
    const na = CW.nodes[a];
    const nb = CW.nodes[b];
    svg.appendChild(makeSvg('line', {
      class: 'cw-edge',
      x1: na.x,
      y1: na.y,
      x2: nb.x,
      y2: nb.y
    }));
  }

  for (const n of CW.nodes) {
    const val = CW.u[n.id];
    const r = 10 + 6 * Math.min(1, Math.abs(val) / 2.5);

    svg.appendChild(makeSvg('circle', {
      class: 'cw-node',
      cx: n.x,
      cy: n.y,
      r,
      fill: colorFor(val)
    }));

    const label = makeSvg('text', {
      class: 'cw-label',
      x: n.x,
      y: n.y
    });
    label.textContent = n.id;
    svg.appendChild(label);
  }

  const phase = makeSvg('text', {
    class: 'cw-label',
    x: 210,
    y: 300
  });
  phase.textContent = currentPhaseName();
  svg.appendChild(phase);
}

function renderIncidence() {
  const svg = document.getElementById('incidence-panel');
  svg.innerHTML = '';

  const values = columnResponse();
  const w = 10;
  const gap = 3;
  const baseY = 168;
  const scale = CW.params.render?.incidence_scale ?? 110;
  const startX = 20;

  svg.appendChild(makeSvg('line', {
    class: 'cw-axis',
    x1: 12,
    y1: baseY,
    x2: 408,
    y2: baseY
  }));

  values.forEach((raw, i) => {
    const v = Math.tanh(raw * 0.9);
    const h = Math.max(2, Math.abs(v) * scale);
    const x = startX + i * (w + gap);
    const y = v >= 0 ? baseY - h : baseY;

    svg.appendChild(makeSvg('rect', {
      class: 'cw-bar',
      x,
      y,
      width: w,
      height: h,
      rx: 2,
      fill: colorFor(raw)
    }));
  });

  const label = makeSvg('text', {
    class: 'cw-label',
    x: 210,
    y: 292
  });
  label.textContent = 'Mᵀu — 30 incidence columns';
  svg.appendChild(label);
}

function renderWitness() {
  const svg = document.getElementById('witness-panel');
  svg.innerHTML = '';

  const live = stationValues();
  const m = phaseMorphology();

  // Live station values remain visible in colors/readouts.
  // Morphology offsets give the quotient a deliberate collapse/rebound grammar.
  const liveK = 10;

  const pts = {
    A: {
      x: 210 + m.asymmetry * 0.35,
      y: 78 + m.crownIndent - liveK * live.A
    },
    D: {
      x: 112 - m.throatPinch * 0.18 - m.asymmetry,
      y: 122 - m.shoulderLift - liveK * live.D
    },
    E: {
      x: 308 + m.throatPinch * 0.18 + m.asymmetry * 0.35,
      y: 122 - m.shoulderLift - liveK * live.E
    },
    C: {
      x: 150 + m.throatPinch * 0.62,
      y: 188 + m.throatDrop + liveK * live.C
    },
    B: {
      x: 270 - m.throatPinch * 0.62,
      y: 188 + m.throatDrop + liveK * live.B
    },
    F: {
      x: 210,
      y: 252 + m.jetExtend + liveK * live.F
    }
  };

  const domeTop = {
    x: 210 + m.asymmetry * 0.15,
    y: 92 - m.reboundDome + 8 * m.round
  };

  svg.appendChild(makeSvg('line', {
    class: 'cw-axis',
    x1: 210,
    y1: 36,
    x2: 210,
    y2: 296
  }));

  const glowRadiusX = 90 + 24 * m.rebound + 12 * m.round;
  const glowRadiusY = 66 + 18 * m.rebound - 10 * m.throat;
  svg.appendChild(makeSvg('ellipse', {
    class: 'cw-phase-glow',
    cx: 210,
    cy: 166 + 20 * m.rebound,
    rx: glowRadiusX,
    ry: glowRadiusY
  }));

  if (m.throat > 0.08) {
    svg.appendChild(makeSvg('line', {
      class: 'cw-throat',
      x1: pts.C.x,
      y1: pts.C.y,
      x2: pts.B.x,
      y2: pts.B.y
    }));
  }

  if (m.rebound > 0.08) {
    const jetW = 9 + 8 * m.rebound;
    const jetTop = pts.F.y - 22;
    const jetBottom = clamp(pts.F.y + 26 * m.rebound, 240, 306);
    const jetPath = `M ${210 - jetW} ${jetTop}
                     Q 210 ${jetTop - 14} ${210 + jetW} ${jetTop}
                     L ${210 + jetW * 0.45} ${jetBottom}
                     Q 210 ${jetBottom + 8} ${210 - jetW * 0.45} ${jetBottom}
                     Z`;
    svg.appendChild(makeSvg('path', {
      class: 'cw-jet',
      d: jetPath
    }));
  }

  const surface = `M ${pts.D.x} ${pts.D.y}
                   Q ${domeTop.x} ${domeTop.y} ${pts.E.x} ${pts.E.y}
                   Q ${pts.B.x} ${pts.B.y} ${pts.F.x} ${pts.F.y}
                   Q ${pts.C.x} ${pts.C.y} ${pts.D.x} ${pts.D.y}
                   Z`;

  svg.appendChild(makeSvg('path', {
    class: 'cw-witness-surface',
    d: surface
  }));

  const skeleton = [
    ['D', 'A'], ['A', 'E'],
    ['D', 'C'], ['E', 'B'],
    ['C', 'B'], ['A', 'F'],
    ['C', 'F'], ['B', 'F']
  ];

  for (const [a, b] of skeleton) {
    svg.appendChild(makeSvg('line', {
      class: 'cw-witness-line',
      x1: pts[a].x,
      y1: pts[a].y,
      x2: pts[b].x,
      y2: pts[b].y
    }));
  }

  for (const [name, point] of Object.entries(pts)) {
    svg.appendChild(makeSvg('circle', {
      class: 'cw-node',
      cx: point.x,
      cy: point.y,
      r: 12,
      fill: colorFor(live[name] ?? 0)
    }));

    const label = makeSvg('text', {
      class: 'cw-label',
      x: point.x,
      y: point.y
    });
    label.textContent = name;
    svg.appendChild(label);
  }

  const phaseLabel = makeSvg('text', {
    class: 'cw-phase-label',
    x: 210,
    y: 304
  });
  phaseLabel.textContent = currentPhaseName();
  svg.appendChild(phaseLabel);
}

function updateReadouts() {
  const s = stationValues();
  const maxu = Math.max(...CW.u.map(Math.abs));

  setText('cw-phase', currentPhaseName());
  setText('cw-time', CW.t.toFixed(2));
  setText('cw-maxu', maxu.toFixed(3));
  setText(
    'cw-stations',
    ['A', 'D', 'E', 'C', 'B', 'F'].map(k => `${k}:${(s[k] ?? 0).toFixed(2)}`).join('  ')
  );
}

function renderAll() {
  renderGraph();
  renderIncidence();
  renderWitness();
  updateReadouts();
}

function resetSimulation() {
  CW.u = Array(15).fill(0);
  CW.v = Array(15).fill(0);
  CW.t = 0;
  renderAll();
}

function frame(timestamp) {
  if (CW.lastFrame === null) CW.lastFrame = timestamp;
  const elapsed = Math.min(0.05, (timestamp - CW.lastFrame) / 1000);
  CW.lastFrame = timestamp;

  CW.speed = Number(document.getElementById('cw-speed')?.value ?? 1);

  if (CW.playing) {
    const dt = CW.params.dt;
    const steps = Math.max(1, Math.round((elapsed * CW.speed) / dt * 2));
    for (let i = 0; i < steps; i++) step(dt);
    renderAll();
  }

  requestAnimationFrame(frame);
}

async function bootCollapseWitness() {
  const [theorem, lens, params] = await Promise.all([
    loadJson('json/theorem_object.json'),
    loadJson('json/bubble_witness_lens.json'),
    loadJson('json/collapse_params.json')
  ]);

  CW.theorem = theorem;
  CW.lens = lens;
  CW.params = params;

  buildLayout();
  resetSimulation();

  document.getElementById('cw-play')?.addEventListener('click', event => {
    CW.playing = !CW.playing;
    event.currentTarget.textContent = CW.playing ? 'Pause' : 'Play';
  });

  document.getElementById('cw-reset')?.addEventListener('click', resetSimulation);

  setStatus(`Loaded ${theorem.name} through ${lens.name}. Exploratory lens active.`);
  requestAnimationFrame(frame);
}

bootCollapseWitness().catch(error => {
  console.error(error);
  setStatus(`Error: ${error.message}`);
});
