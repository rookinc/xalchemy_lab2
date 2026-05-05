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
  speed: 1,
  mode: 'overlay'
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

function getMode() {
  const checked = document.querySelector('input[name="cw-mode"]:checked');
  CW.mode = checked?.value ?? CW.mode ?? 'overlay';
  return CW.mode;
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

function currentStateObject() {
  const stations = stationValues();
  const maxu = Math.max(...CW.u.map(Math.abs));

  return {
    artifact: "collapse_witness_lens_state",
    version: "0.6",
    theorem_object: CW.theorem?.name ?? null,
    lens: CW.lens?.name ?? null,
    mode: getMode(),
    phase: getMode() === "overlay" ? currentPhaseName() : "raw G15 quotient",
    phase_lock: typeof isPhaseLocked === "function" ? isPhaseLocked() : false,
    capture_mode: (typeof isPhaseLocked === "function" && isPhaseLocked()) ? "morphology_preset" : "live_graph_state",
    time: Number(CW.t.toFixed(3)),
    max_abs_u: Number(maxu.toFixed(6)),
    stations: Object.fromEntries(
      ["A", "D", "E", "C", "B", "F"].map(k => [k, Number((stations[k] ?? 0).toFixed(6))])
    ),
    source_vertex: CW.params?.forcing?.source_vertex ?? null,
    note: "Exploratory visual lens state. This is not a theorem object and not a physical derivation."
  };
}

function updateStateJson() {
  const el = document.getElementById("cw-state-json");
  if (!el || !CW.theorem || !CW.lens || !CW.params) return;
  el.textContent = JSON.stringify(currentStateObject(), null, 2);
}

async function copyStateJson() {
  const text = JSON.stringify(currentStateObject(), null, 2);

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied current collapse witness state JSON to clipboard.");
  } catch (err) {
    setStatus("Clipboard copy failed. State JSON is visible in the provenance panel.");
    console.error(err);
  }
}

function exportWitnessSvg() {
  const svg = document.getElementById("witness-panel");
  if (!svg) return;

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const state = currentStateObject();
  const metadata = document.createElementNS("http://www.w3.org/2000/svg", "metadata");
  metadata.textContent = JSON.stringify(state);
  clone.prepend(metadata);

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const filename = `collapse_witness_${state.mode.replaceAll(" ", "_")}_${state.phase.replaceAll(" ", "_")}_${String(state.time).replace(".", "p")}.svg`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  setStatus(`Exported ${filename}`);
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
  const mode = getMode();
  const m = mode === 'overlay'
    ? phaseMorphology()
    : {
        round: 1,
        defect: 0,
        cup: 0,
        throat: 0,
        rebound: 0,
        relax: 0,
        crownIndent: 0,
        shoulderLift: 0,
        throatPinch: 0,
        throatDrop: 0,
        jetExtend: 0,
        reboundDome: 0,
        asymmetry: 0
      };

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
  phaseLabel.textContent = getMode() === 'overlay' ? currentPhaseName() : 'RAW G15 QUOTIENT';
  svg.appendChild(phaseLabel);
}


function renderBubbleAnalog() {
  const svg = document.getElementById('bubble-panel');
  if (!svg) return;

  svg.innerHTML = '';

  const live = stationValues();
  const mode = getMode();
  const m = mode === 'overlay'
    ? phaseMorphology()
    : {
        round: 1,
        defect: 0,
        cup: 0,
        throat: 0,
        rebound: 0,
        relax: 0,
        crownIndent: 0,
        shoulderLift: 0,
        throatPinch: 0,
        throatDrop: 0,
        jetExtend: 0,
        reboundDome: 0,
        asymmetry: 0
      };

  const defs = makeSvg('defs');
  const marker = makeSvg('marker', {
    id: 'bubble-arrow',
    markerWidth: 8,
    markerHeight: 8,
    refX: 6,
    refY: 3,
    orient: 'auto',
    markerUnits: 'strokeWidth'
  });
  marker.appendChild(makeSvg('path', {
    d: 'M 0 0 L 6 3 L 0 6 z',
    fill: 'rgba(235, 239, 247, 0.55)'
  }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  const cx = 210;
  const cy = 158;

  const liveTop = clamp(live.A ?? 0, -1, 1);
  const liveLeft = clamp(((live.D ?? 0) + (live.C ?? 0)) / 2, -1, 1);
  const liveRight = clamp(((live.E ?? 0) + (live.B ?? 0)) / 2, -1, 1);
  const liveBottom = clamp(live.F ?? 0, -1, 1);

  const cup = m.cup;
  const throat = m.throat;
  const rebound = m.rebound;
  const defect = m.defect;
  const relax = m.relax;

  const rx = 94 + 14 * m.round + 10 * rebound - 24 * throat;
  const ry = 76 + 8 * m.round + 16 * rebound - 18 * throat;

  const asym = m.asymmetry;
  const topY = cy - ry + m.crownIndent + 5 * liveTop;
  const bottomY = cy + ry + m.jetExtend * 0.26 + 8 * liveBottom;

  const shoulderY = cy - 42 - m.shoulderLift * 0.55;
  const sideLobeY = cy + 8 + 16 * cup + 8 * throat;
  const throatY = cy + 38 + m.throatDrop;

  const leftShoulderX = cx - rx - 7 * cup + 5 * liveLeft - asym;
  const rightShoulderX = cx + rx + 7 * cup + 5 * liveRight + asym * 0.35;

  const waistHalf = Math.max(10, 55 - m.throatPinch * 0.86);
  const lobeSpread = 70 + 24 * cup + 8 * throat;
  const lobeRx = 34 + 26 * cup + 10 * throat;
  const lobeRy = 26 + 18 * cup + 6 * throat;

  // Reference original cavity.
  svg.appendChild(makeSvg('ellipse', {
    class: 'cw-bubble-ghost',
    cx,
    cy,
    rx: 100,
    ry: 78
  }));

  // Side lobes, most visible in cup/throat phases.
  const lobeOpacity = clamp(0.15 + 0.65 * Math.max(cup, throat), 0, 0.85);
  if (cup > 0.08 || throat > 0.08) {
    svg.appendChild(makeSvg('ellipse', {
      class: 'cw-bubble-lobe',
      cx: cx - lobeSpread,
      cy: sideLobeY,
      rx: lobeRx,
      ry: lobeRy,
      opacity: lobeOpacity
    }));
    svg.appendChild(makeSvg('ellipse', {
      class: 'cw-bubble-lobe',
      cx: cx + lobeSpread,
      cy: sideLobeY,
      rx: lobeRx,
      ry: lobeRy,
      opacity: lobeOpacity
    }));
  }

  // Pressure/defect patch.
  if (defect > 0.05 || cup > 0.05) {
    svg.appendChild(makeSvg('ellipse', {
      class: 'cw-bubble-pressure',
      cx: cx - 20 + asym,
      cy: topY - 6,
      rx: 18 + 24 * defect + 8 * cup,
      ry: 10 + 12 * cup,
      transform: `rotate(-18 ${cx - 20 + asym} ${topY - 6})`,
      opacity: clamp(0.25 + 0.55 * Math.max(defect, cup), 0, 0.82)
    }));
  }

  // Main cavity contour:
  // rounded upper body → cup shoulders → pinched throat → lower closure/jet base.
  const d = [
    `M ${leftShoulderX} ${cy - 4}`,
    `C ${leftShoulderX - 2 * cup} ${shoulderY}, ${cx - 48 + asym} ${topY}, ${cx + asym} ${topY}`,
    `C ${cx + 48 + asym} ${topY}, ${rightShoulderX + 2 * cup} ${shoulderY}, ${rightShoulderX} ${cy - 4}`,
    `C ${rightShoulderX - 2 * cup} ${cy + 36}, ${cx + lobeSpread * 0.62} ${sideLobeY + 18}, ${cx + waistHalf} ${throatY}`,
    `C ${cx + 30} ${bottomY - 24}, ${cx + 10} ${bottomY}, ${cx} ${bottomY}`,
    `C ${cx - 10} ${bottomY}, ${cx - 30} ${bottomY - 24}, ${cx - waistHalf} ${throatY}`,
    `C ${cx - lobeSpread * 0.62} ${sideLobeY + 18}, ${leftShoulderX + 2 * cup} ${cy + 36}, ${leftShoulderX} ${cy - 4}`,
    'Z'
  ].join(' ');

  svg.appendChild(makeSvg('path', {
    class: 'cw-bubble-cavity',
    d
  }));

  // Throat tube overlay in bridge phase.
  if (throat > 0.10) {
    const tubeHalf = Math.max(8, waistHalf * 0.46);
    const tubeTop = throatY - 34;
    const tubeBottom = throatY + 34 + 14 * rebound;
    const tube = `M ${cx - tubeHalf} ${tubeTop}
                  C ${cx - tubeHalf * 1.15} ${throatY - 8}, ${cx - tubeHalf * 1.15} ${throatY + 8}, ${cx - tubeHalf} ${tubeBottom}
                  L ${cx + tubeHalf} ${tubeBottom}
                  C ${cx + tubeHalf * 1.15} ${throatY + 8}, ${cx + tubeHalf * 1.15} ${throatY - 8}, ${cx + tubeHalf} ${tubeTop}
                  Z`;

    svg.appendChild(makeSvg('path', {
      class: 'cw-bubble-throat-tube',
      d: tube,
      opacity: clamp(0.15 + 0.75 * throat, 0, 0.9)
    }));
  }

  // Collapse disk/ring during the transition between throat and rebound.
  const collapseDisk = Math.max(0, Math.min(throat, 1 - Math.abs(rebound - 0.25)));
  if (throat > 0.35 || (rebound > 0.18 && rebound < 0.72)) {
    svg.appendChild(makeSvg('ellipse', {
      class: 'cw-bubble-collapse-disk',
      cx,
      cy: throatY + 30,
      rx: 46 + 18 * throat,
      ry: 10 + 5 * collapseDisk,
      opacity: clamp(0.15 + 0.55 * collapseDisk, 0.15, 0.75)
    }));

    svg.appendChild(makeSvg('ellipse', {
      class: 'cw-bubble-collapse-ring',
      cx,
      cy: throatY + 30,
      rx: 50 + 20 * throat,
      ry: 12 + 5 * collapseDisk,
      opacity: clamp(0.12 + 0.62 * collapseDisk, 0.12, 0.82)
    }));
  }

  // Rebound jet feature.
  if (rebound > 0.08) {
    const jetTop = bottomY - 40;
    const jetBottom = clamp(bottomY + 48 * rebound, 232, 306);
    const jetW = 7 + 12 * rebound;

    const jet = `M ${cx - jetW} ${jetTop}
                 C ${cx - jetW * 0.85} ${jetTop - 18}, ${cx + jetW * 0.85} ${jetTop - 18}, ${cx + jetW} ${jetTop}
                 L ${cx + jetW * 0.48} ${jetBottom}
                 C ${cx + jetW * 0.22} ${jetBottom + 8}, ${cx - jetW * 0.22} ${jetBottom + 8}, ${cx - jetW * 0.48} ${jetBottom}
                 Z`;

    svg.appendChild(makeSvg('path', {
      class: 'cw-bubble-jet',
      d: jet,
      opacity: clamp(0.25 + 0.65 * rebound, 0, 0.95)
    }));

    svg.appendChild(makeSvg('rect', {
      class: 'cw-bubble-jet-core',
      x: cx - Math.max(2, jetW * 0.22),
      y: jetTop - 4,
      width: Math.max(4, jetW * 0.44),
      height: Math.max(12, jetBottom - jetTop),
      rx: 3,
      opacity: clamp(0.12 + 0.48 * rebound, 0, 0.65)
    }));
  }

  // Flow arrows, strongest during fold/throat/rebound.
  const flow = Math.max(cup, throat, rebound);
  if (flow > 0.08) {
    const arrows = [
      [cx - 128, cy - 80, cx - 92, cy - 42],
      [cx + 128, cy - 80, cx + 92, cy - 42],
      [cx - 122, cy + 16, cx - 78, cy + 12],
      [cx + 122, cy + 16, cx + 78, cy + 12],
      [cx - 55, cy + 96, cx - 24, throatY + 24],
      [cx + 55, cy + 96, cx + 24, throatY + 24],
      [cx, cy - 112, cx, topY + 16]
    ];

    for (const [x1, y1, x2, y2] of arrows) {
      svg.appendChild(makeSvg('line', {
        class: 'cw-bubble-flow',
        x1,
        y1,
        x2,
        y2,
        opacity: 0.20 + 0.58 * flow
      }));
    }
  }

  // Phase dots: source/crown and rebound pole.
  svg.appendChild(makeSvg('circle', {
    class: 'cw-bubble-phase-dot',
    cx: cx + asym,
    cy: topY,
    r: 3.5 + 2.5 * defect,
    opacity: clamp(0.35 + 0.55 * Math.max(defect, cup), 0.35, 0.95)
  }));

  svg.appendChild(makeSvg('circle', {
    class: 'cw-bubble-phase-dot',
    cx,
    cy: bottomY,
    r: 3.5 + 3.5 * rebound,
    opacity: clamp(0.25 + 0.65 * rebound, 0.25, 0.95)
  }));

  svg.appendChild(makeSvg('line', {
    class: 'cw-axis',
    x1: cx,
    y1: 34,
    x2: cx,
    y2: 296
  }));

  const label = makeSvg('text', {
    class: 'cw-bubble-label',
    x: cx,
    y: 304
  });
  label.textContent = mode === 'overlay' ? currentPhaseName() : 'RAW QUOTIENT CONTOUR';
  svg.appendChild(label);
}


const PHASE_SEQUENCE = [
  'latent round',
  'defect selection',
  'cup fold',
  'throat bridge',
  'rebound jet',
  'relaxation'
];

const PHASE_PRESETS = {
  'latent round': {
    round: 1.0,
    defect: 0.0,
    cup: 0.05,
    throat: 0.0,
    rebound: 0.0,
    relax: 0.15,
    crownIndent: 0,
    shoulderLift: 0,
    throatPinch: 0,
    throatDrop: 0,
    jetExtend: 0,
    reboundDome: 0,
    asymmetry: 0
  },
  'defect selection': {
    round: 0.78,
    defect: 1.0,
    cup: 0.12,
    throat: 0.06,
    rebound: 0.0,
    relax: 0.12,
    crownIndent: 18,
    shoulderLift: 8,
    throatPinch: 6,
    throatDrop: 4,
    jetExtend: 0,
    reboundDome: 0,
    asymmetry: 12
  },
  'cup fold': {
    round: 0.52,
    defect: 0.45,
    cup: 1.0,
    throat: 0.28,
    rebound: 0.0,
    relax: 0.08,
    crownIndent: 8,
    shoulderLift: 16,
    throatPinch: 18,
    throatDrop: 10,
    jetExtend: 0,
    reboundDome: 0,
    asymmetry: 5
  },
  'throat bridge': {
    round: 0.28,
    defect: 0.18,
    cup: 0.65,
    throat: 1.0,
    rebound: 0.0,
    relax: 0.05,
    crownIndent: 4,
    shoulderLift: 12,
    throatPinch: 42,
    throatDrop: 18,
    jetExtend: 10,
    reboundDome: 0,
    asymmetry: 0
  },
  'rebound jet': {
    round: 0.22,
    defect: 0.08,
    cup: 0.34,
    throat: 0.52,
    rebound: 1.0,
    relax: 0.0,
    crownIndent: 2,
    shoulderLift: 8,
    throatPinch: 24,
    throatDrop: 12,
    jetExtend: 70,
    reboundDome: 18,
    asymmetry: 0
  },
  'relaxation': {
    round: 0.78,
    defect: 0.0,
    cup: 0.10,
    throat: 0.0,
    rebound: 0.10,
    relax: 1.0,
    crownIndent: 0,
    shoulderLift: 0,
    throatPinch: 0,
    throatDrop: 0,
    jetExtend: 0,
    reboundDome: 6,
    asymmetry: 0
  }
};

let phaseLockIndex = null;

function phaseTitleCase(name) {
  return String(name || '')
    .split(' ')
    .map(part => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(' ');
}

function phaseIndexFromName(name) {
  const key = String(name || '').trim().toLowerCase();
  const idx = PHASE_SEQUENCE.indexOf(key);
  return idx >= 0 ? idx : 0;
}

function isPhaseLocked() {
  return phaseLockIndex !== null;
}

function phasePreset(name) {
  const key = String(name || '').trim().toLowerCase();
  return { ...(PHASE_PRESETS[key] || PHASE_PRESETS['latent round']) };
}

function clickButtonByExactLabel(label) {
  const buttons = Array.from(document.querySelectorAll('button'));
  const btn = buttons.find(el => el.textContent.trim().toLowerCase() === label.toLowerCase());
  if (btn) btn.click();
}

function ensurePausedForStepCapture() {
  clickButtonByExactLabel('Pause');
}

function resumeIfPaused() {
  clickButtonByExactLabel('Play');
}

const liveCurrentPhaseName = currentPhaseName;
const livePhaseMorphology = phaseMorphology;

currentPhaseName = function() {
  if (isPhaseLocked()) {
    return PHASE_SEQUENCE[phaseLockIndex];
  }
  return liveCurrentPhaseName();
};

phaseMorphology = function() {
  if (isPhaseLocked()) {
    return phasePreset(PHASE_SEQUENCE[phaseLockIndex]);
  }
  return livePhaseMorphology();
};

function updatePhaseStepper() {
  const liveBtn = document.getElementById('phase-live');
  if (liveBtn) liveBtn.disabled = !isPhaseLocked();
}

function bindPhaseStepper() {
  const prev = document.getElementById('phase-prev');
  const next = document.getElementById('phase-next');
  const live = document.getElementById('phase-live');

  if (!prev || prev.dataset.bound === '1') return;

  prev.dataset.bound = '1';
  if (next) next.dataset.bound = '1';
  if (live) live.dataset.bound = '1';

  prev.addEventListener('click', () => {
    ensurePausedForStepCapture();
    if (phaseLockIndex === null) {
      phaseLockIndex = phaseIndexFromName(liveCurrentPhaseName());
    }
    phaseLockIndex = (phaseLockIndex + PHASE_SEQUENCE.length - 1) % PHASE_SEQUENCE.length;
    renderAll();
  });

  if (next) {
    next.addEventListener('click', () => {
      ensurePausedForStepCapture();
      if (phaseLockIndex === null) {
        phaseLockIndex = phaseIndexFromName(liveCurrentPhaseName());
      }
      phaseLockIndex = (phaseLockIndex + 1) % PHASE_SEQUENCE.length;
      renderAll();
    });
  }

  if (live) {
    live.addEventListener('click', () => {
      phaseLockIndex = null;
      updatePhaseStepper();
      renderAll();
      resumeIfPaused();
    });
  }
}

function updateReadouts() {
  const s = stationValues();
  const maxu = Math.max(...CW.u.map(Math.abs));

  const mode = getMode();
  const locked = typeof isPhaseLocked === "function" && isPhaseLocked();
  setText('cw-phase', mode === 'overlay' ? currentPhaseName() : 'raw G15 quotient');
  setText('cw-mode-readout', locked ? 'locked preset' : (mode === 'overlay' ? 'collapse overlay' : 'raw G15'));
  setText('cw-time', CW.t.toFixed(2));
  setText('cw-maxu', maxu.toFixed(3));
  setText(
    'cw-stations',
    ['A', 'D', 'E', 'C', 'B', 'F'].map(k => `${k}:${(s[k] ?? 0).toFixed(2)}`).join('  ')
  );
}

function renderAll() {
  bindPhaseStepper();
  renderGraph();
  renderIncidence();
  renderWitness();
  renderBubbleAnalog();
  updateReadouts();
  updatePhaseStepper();
  updateStateJson();
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
    loadJson('/json/theorem_object.json'),
    loadJson('/json/bubble_witness_lens.json'),
    loadJson('/json/collapse_params.json')
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

  document.querySelectorAll('input[name="cw-mode"]').forEach(input => {
    input.addEventListener('change', () => {
      getMode();
      renderAll();
    });
  });

  document.getElementById('cw-export-svg')?.addEventListener('click', exportWitnessSvg);
  document.getElementById('cw-copy-state')?.addEventListener('click', copyStateJson);

  setStatus(`Loaded canonical G15 transport theorem object. Current view: exploratory collapse witness lens.`);
  requestAnimationFrame(frame);
}

bootCollapseWitness().catch(error => {
  console.error(error);
  setStatus(`Error: ${error.message}`);
});
