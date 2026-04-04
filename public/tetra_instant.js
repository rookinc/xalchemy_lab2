import { TETRA_INSTANT } from '/assets/spinor/tetra_instant_schema.js';

const els = {
  stage: document.getElementById('instant-stage'),
  layerLines: document.getElementById('layer-lines'),
  facePolys: document.getElementById('face-polys'),
  spineLines: document.getElementById('spine-lines'),
  pathLines: document.getElementById('path-lines'),
  anchorDots: document.getElementById('anchor-dots'),
  anchorLabels: document.getElementById('anchor-labels'),
  phaseSubjective: document.getElementById('phase-subjective'),
  phaseObjective: document.getElementById('phase-objective'),
  chiralityLeft: document.getElementById('chirality-left'),
  chiralityRight: document.getElementById('chirality-right'),
  toggleAnchors: document.getElementById('toggle-anchors'),
  togglePaths: document.getElementById('toggle-paths'),
  toggleFaces: document.getElementById('toggle-faces'),
  toggleLayers: document.getElementById('toggle-layers'),
  metricPhase: document.getElementById('metric-phase'),
  metricChirality: document.getElementById('metric-chirality'),
  metricPalette: document.getElementById('metric-palette'),
  readout: document.getElementById('instant-readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  phase: 'subjective',
  chirality: 'left',
  showAnchors: true,
  showPaths: true,
  showFaces: true,
  showLayers: true,
};

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

function paletteForPhase() {
  return TETRA_INSTANT.palettes[state.phase];
}

function activeFaces() {
  return TETRA_INSTANT.faces[state.phase][state.chirality];
}

function paletteName() {
  return state.phase === 'subjective' ? 'CMY' : 'RGB';
}

function colorMap() {
  return state.phase === 'subjective'
    ? { cyan: '#00ffff', magenta: '#ff00ff', yellow: '#ffff00' }
    : { red: '#ff4d4d', green: '#4dff88', blue: '#4d88ff' };
}

function activePathSet() {
  return TETRA_INSTANT.paths[state.phase][state.chirality];
}

function projectPoint([x, y, z]) {
  const cx = 450;
  const cy = 320;
  const sx = 185;
  const sy = 165;

  const chiralitySign = state.chirality === 'right' ? -1 : 1;
  const zx = chiralitySign * z * 90;
  const zy = chiralitySign * z * 45;

  const px = cx + x * sx + zx;
  const py = cy - y * sy + zy;
  return [px, py];
}

function maybeReverse(ids) {
  return state.chirality === 'right' ? [...ids].reverse() : ids;
}

function anchorPoint(id) {
  if (TETRA_INSTANT.anchors[id]) return TETRA_INSTANT.anchors[id];
  if (TETRA_INSTANT.spine[id]) return TETRA_INSTANT.spine[id];
  throw new Error(`Unknown point id: ${id}`);
}

function pointList(ids) {
  return maybeReverse(ids).map((id) => projectPoint(anchorPoint(id)));
}

function polyString(ids) {
  return pointList(ids).map(([x, y]) => `${x},${y}`).join(' ');
}

function pathString(ids) {
  const pts = pointList(ids);
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function drawLayers() {
  els.layerLines.textContent = '';
  if (!state.showLayers) return;

  const layers = [
    ['lower', TETRA_INSTANT.layers.lower],
    ['middle', TETRA_INSTANT.layers.middle],
    ['upper', TETRA_INSTANT.layers.upper],
  ];

  for (const [cls, ids] of layers) {
    const path = svgEl('polygon', {
      points: polyString(ids),
      class: `layer-line ${cls}`,
    });
    els.layerLines.appendChild(path);
  }
}

function drawSpine() {
  els.spineLines.textContent = '';
  const spineIds = ['n0', 'n1', 'n2'];
  const pts = pointList(spineIds);
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const path = svgEl('path', { d, class: 'spine-line' });
  els.spineLines.appendChild(path);
}

function drawFaces() {
  els.facePolys.textContent = '';
  if (!state.showFaces) return;

  const faces = activeFaces();
  const colors = paletteForPhase();

  faces.forEach((ids, i) => {
    const poly = svgEl('polygon', {
      points: polyString(ids),
      class: 'face-poly',
      fill: colors[i],
    });
    els.facePolys.appendChild(poly);
  });
}

function drawPaths() {
  els.pathLines.textContent = '';
  if (!state.showPaths) return;

  const cmap = colorMap();
  const pathSet = activePathSet();

  for (const [key, ids] of Object.entries(pathSet)) {
    const path = svgEl('path', {
      d: pathString(ids),
      class: 'path-line',
      stroke: cmap[key],
    });
    els.pathLines.appendChild(path);
  }
}

function drawAnchors() {
  els.anchorDots.textContent = '';
  els.anchorLabels.textContent = '';
  if (!state.showAnchors) return;

  const ids = [
    ...Object.keys(TETRA_INSTANT.spine),
    ...Object.keys(TETRA_INSTANT.anchors),
  ];

  for (const id of ids) {
    const [x, y] = projectPoint(anchorPoint(id));
    const dot = svgEl('circle', {
      cx: x,
      cy: y,
      r: id.startsWith('n') ? 5 : 4,
      class: 'anchor-dot',
    });
    els.anchorDots.appendChild(dot);

    const label = svgEl('text', {
      x,
      y: y - 14,
      class: 'anchor-label',
    });
    label.textContent = id;
    els.anchorLabels.appendChild(label);
  }
}

function updateMetrics() {
  els.metricPhase.textContent = state.phase;
  els.metricChirality.textContent = state.chirality;
  els.metricPalette.textContent = paletteName();

  const faces = activeFaces().map((face, i) => `${i}: ${face.join(' → ')}`);
  const paths = Object.entries(activePathSet())
    .map(([key, ids]) => `${key}: ${ids.join(' → ')}`);

  els.readout.textContent = [
    `phase              : ${state.phase}`,
    `chirality          : ${state.chirality}`,
    `palette            : ${paletteName()}`,
    `chirality_rule     : mirrored z-projection`,
    ``,
    `faces`,
    ...faces.map((x) => `  ${x}`),
    ``,
    `paths`,
    ...paths.map((x) => `  ${x}`),
  ].join('\n');
}

function setButtonState() {
  els.phaseSubjective.classList.toggle('is-active', state.phase === 'subjective');
  els.phaseObjective.classList.toggle('is-active', state.phase === 'objective');
  els.chiralityLeft.classList.toggle('is-active', state.chirality === 'left');
  els.chiralityRight.classList.toggle('is-active', state.chirality === 'right');
  els.toggleAnchors.classList.toggle('is-active', state.showAnchors);
  els.togglePaths.classList.toggle('is-active', state.showPaths);
  els.toggleFaces.classList.toggle('is-active', state.showFaces);
  els.toggleLayers.classList.toggle('is-active', state.showLayers);
}

function render() {
  drawLayers();
  drawFaces();
  drawSpine();
  drawPaths();
  drawAnchors();
  updateMetrics();
  setButtonState();
}

els.phaseSubjective.addEventListener('click', () => {
  state.phase = 'subjective';
  render();
});

els.phaseObjective.addEventListener('click', () => {
  state.phase = 'objective';
  render();
});

els.chiralityLeft.addEventListener('click', () => {
  state.chirality = 'left';
  render();
});

els.chiralityRight.addEventListener('click', () => {
  state.chirality = 'right';
  render();
});

els.toggleAnchors.addEventListener('click', () => {
  state.showAnchors = !state.showAnchors;
  render();
});

els.togglePaths.addEventListener('click', () => {
  state.showPaths = !state.showPaths;
  render();
});

els.toggleFaces.addEventListener('click', () => {
  state.showFaces = !state.showFaces;
  render();
});

els.toggleLayers.addEventListener('click', () => {
  state.showLayers = !state.showLayers;
  render();
});

render();
