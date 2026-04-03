import { FIELD_SEEDS } from '/assets/spinor/field_seed_library.js';

const els = {
  gridLayer: document.getElementById('grid-layer'),
  faceLayer: document.getElementById('face-layer'),
  edgeLayer: document.getElementById('edge-layer'),
  presetSeed: document.getElementById('preset-seed'),
  presetCluster: document.getElementById('preset-cluster'),
  presetField: document.getElementById('preset-field'),
  seedSelect: document.getElementById('seed-select'),
  countSlider: document.getElementById('count-slider'),
  spreadSlider: document.getElementById('spread-slider'),
  opacitySlider: document.getElementById('opacity-slider'),
  edgeSlider: document.getElementById('edge-slider'),
  phaseSlider: document.getElementById('phase-slider'),
  chiralitySlider: document.getElementById('chirality-slider'),
  spreadValue: document.getElementById('spread-value'),
  opacityValue: document.getElementById('opacity-value'),
  edgeValue: document.getElementById('edge-value'),
  phaseValue: document.getElementById('phase-value'),
  chiralityValue: document.getElementById('chirality-value'),
  statusPreset: document.getElementById('status-preset'),
  statusSeed: document.getElementById('status-seed'),
  statusCount: document.getElementById('status-count'),
  statusPhase: document.getElementById('status-phase'),
  statusChirality: document.getElementById('status-chirality'),
  readout: document.getElementById('field-readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  preset: 'seed',
  seedId: 'instant_subjective_left',
  count: 1,
  spread: 1.0,
  opacity: 0.32,
  edge: 0.70,
  phaseMix: 0.50,
  chiralityMix: 0.50,
};

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function seed() {
  return FIELD_SEEDS[state.seedId];
}

function setPreset(name) {
  state.preset = name;
  if (name === 'seed') {
    state.count = 1;
    state.spread = 1.0;
  } else if (name === 'cluster') {
    state.count = 18;
    state.spread = 2.6;
  } else {
    state.count = 140;
    state.spread = 6.0;
  }
  syncInputs();
  render();
}

function syncInputs() {
  els.countSlider.value = String(state.count);
  els.spreadSlider.value = String(state.spread);
  els.opacitySlider.value = String(state.opacity);
  els.edgeSlider.value = String(state.edge);
  els.phaseSlider.value = String(state.phaseMix);
  els.chiralitySlider.value = String(state.chiralityMix);
}

function drawGrid() {
  els.gridLayer.textContent = '';
  for (let x = 60; x <= 840; x += 40) {
    els.gridLayer.appendChild(svgEl('line', {
      x1: x, y1: 20, x2: x, y2: 600, class: 'grid-line'
    }));
  }
  for (let y = 20; y <= 600; y += 40) {
    els.gridLayer.appendChild(svgEl('line', {
      x1: 20, y1: y, x2: 880, y2: y, class: 'grid-line'
    }));
  }
}

function project([x, y, z]) {
  const cx = 450;
  const cy = 290;
  const px = cx + x * 62 + z * 36;
  const py = cy - y * 62 + z * 18;
  return [px, py];
}

function colorPalette(phase, chirality) {
  if (phase === 'objective') {
    return chirality === 'right'
      ? ['rgba(255,77,77,ALPHA)', 'rgba(77,255,136,ALPHA)', 'rgba(77,136,255,ALPHA)']
      : ['rgba(190,55,55,ALPHA)', 'rgba(55,190,110,ALPHA)', 'rgba(55,110,190,ALPHA)'];
  }
  return chirality === 'right'
    ? ['rgba(255,255,0,ALPHA)', 'rgba(255,0,255,ALPHA)', 'rgba(0,255,255,ALPHA)']
    : ['rgba(220,220,0,ALPHA)', 'rgba(220,0,220,ALPHA)', 'rgba(0,220,220,ALPHA)'];
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function instanceState(i) {
  const rnd = mulberry32(12345 + i * 97);
  const phase = rnd() < state.phaseMix ? 'subjective' : 'objective';
  const chirality = rnd() < state.chiralityMix ? 'left' : 'right';
  const angle = rnd() * Math.PI * 2;
  const radius = (0.25 + rnd()) * state.spread;
  const lift = (rnd() - 0.5) * state.spread * 0.7;
  const scale = 0.7 + rnd() * 0.9;
  return {
    phase,
    chirality,
    tx: Math.cos(angle) * radius,
    ty: Math.sin(angle) * radius * 0.55,
    tz: lift,
    scale,
  };
}

function transformPoint(pt, inst) {
  const chiralitySign = inst.chirality === 'right' ? -1 : 1;
  return [
    pt[0] * inst.scale,
    pt[1] * inst.scale,
    pt[2] * inst.scale * chiralitySign,
  ];
}

function translatePoint(pt, inst) {
  return [
    pt[0] + inst.tx,
    pt[1] + inst.ty,
    pt[2] + inst.tz,
  ];
}

function drawField() {
  els.faceLayer.textContent = '';
  els.edgeLayer.textContent = '';

  const s = seed();

  for (let i = 0; i < state.count; i += 1) {
    const inst = instanceState(i);
    const pts = s.points.map((pt) => translatePoint(transformPoint(pt, inst), inst));
    const pal = colorPalette(inst.phase, inst.chirality);

    s.faces.forEach((face, idx) => {
      const points = face.map((j) => {
        const [x, y] = project(pts[j]);
        return `${x},${y}`;
      }).join(' ');
      const fill = pal[idx % pal.length].replace('ALPHA', state.opacity.toFixed(3));
      els.faceLayer.appendChild(svgEl('polygon', {
        points,
        class: 'face-poly',
        fill,
      }));
    });

    s.edges.forEach(([a, b]) => {
      const [x1, y1] = project(pts[a]);
      const [x2, y2] = project(pts[b]);
      els.edgeLayer.appendChild(svgEl('path', {
        d: `M ${x1} ${y1} L ${x2} ${y2}`,
        class: 'edge-line',
        stroke: `rgba(232,240,248,${state.edge.toFixed(3)})`,
      }));
    });
  }
}

function render() {
  drawGrid();
  drawField();

  els.presetSeed.classList.toggle('is-active', state.preset === 'seed');
  els.presetCluster.classList.toggle('is-active', state.preset === 'cluster');
  els.presetField.classList.toggle('is-active', state.preset === 'field');

  els.spreadValue.textContent = state.spread.toFixed(1);
  els.opacityValue.textContent = state.opacity.toFixed(2);
  els.edgeValue.textContent = state.edge.toFixed(2);
  els.phaseValue.textContent = state.phaseMix.toFixed(2);
  els.chiralityValue.textContent = state.chiralityMix.toFixed(2);

  els.statusPreset.textContent = state.preset[0].toUpperCase() + state.preset.slice(1);
  els.statusSeed.textContent = state.seedId;
  els.statusCount.textContent = String(state.count);
  els.statusPhase.textContent = state.phaseMix.toFixed(2);
  els.statusChirality.textContent = state.chiralityMix.toFixed(2);

  const s = seed();
  els.readout.textContent = [
    `seed_id          : ${s.id}`,
    `seed_label       : ${s.label}`,
    `seed_phase       : ${s.phase}`,
    `seed_chirality   : ${s.chirality}`,
    ``,
    `preset           : ${state.preset}`,
    `count            : ${state.count}`,
    `spread           : ${state.spread.toFixed(1)}`,
    `opacity          : ${state.opacity.toFixed(2)}`,
    `edge             : ${state.edge.toFixed(2)}`,
    `phase_mix        : ${state.phaseMix.toFixed(2)}`,
    `chirality_mix    : ${state.chiralityMix.toFixed(2)}`,
  ].join('\n');
}

els.presetSeed.addEventListener('click', () => setPreset('seed'));
els.presetCluster.addEventListener('click', () => setPreset('cluster'));
els.presetField.addEventListener('click', () => setPreset('field'));

els.seedSelect.addEventListener('change', () => {
  state.seedId = els.seedSelect.value;
  render();
});

els.countSlider.addEventListener('input', () => {
  state.count = Number(els.countSlider.value);
  render();
});

els.spreadSlider.addEventListener('input', () => {
  state.spread = Number(els.spreadSlider.value);
  render();
});

els.opacitySlider.addEventListener('input', () => {
  state.opacity = Number(els.opacitySlider.value);
  render();
});

els.edgeSlider.addEventListener('input', () => {
  state.edge = Number(els.edgeSlider.value);
  render();
});

els.phaseSlider.addEventListener('input', () => {
  state.phaseMix = Number(els.phaseSlider.value);
  render();
});

els.chiralitySlider.addEventListener('input', () => {
  state.chiralityMix = Number(els.chiralitySlider.value);
  render();
});

syncInputs();
render();
