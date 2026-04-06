import { nthFrontier } from '/public/assets/spinor/frontier_grammar.js';

const els = {
  gridLayer: document.getElementById('grid-layer'),
  guideLayer: document.getElementById('guide-layer'),
  edgeLayer: document.getElementById('edge-layer'),
  faceLayer: document.getElementById('face-layer'),
  nodeLayer: document.getElementById('node-layer'),
  labelLayer: document.getElementById('label-layer'),
  tickPrev: document.getElementById('tick-prev'),
  tickNext: document.getElementById('tick-next'),
  statusTick: document.getElementById('status-tick'),
  statusSlot: document.getElementById('status-slot'),
  statusNextSlot: document.getElementById('status-next-slot'),
  statusJoin: document.getElementById('status-join'),
  statusSheet: document.getElementById('status-sheet'),
  readout: document.getElementById('readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const state = { tick: 1 };

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function drawGrid() {
  els.gridLayer.textContent = '';
  for (let x = 60; x <= 840; x += 40) {
    els.gridLayer.appendChild(svgEl('line', { x1: x, y1: 20, x2: x, y2: 600, class: 'grid-line' }));
  }
  for (let y = 20; y <= 600; y += 40) {
    els.gridLayer.appendChild(svgEl('line', { x1: 20, y1: y, x2: 880, y2: y, class: 'grid-line' }));
  }
}

function pt(x, y) {
  const cx = 450;
  const cy = 320;
  const s = 110;
  return [cx + x * s, cy + y * s];
}

function crownPoints(kind, level = 0) {
  const yBase = kind === 'up' ? -1.28 + level * 0.07 : 1.28 - level * 0.07;
  const innerY = kind === 'up' ? -0.82 + level * 0.05 : 0.82 - level * 0.05;
  const outerY = kind === 'up' ? -0.96 + level * 0.05 : 0.96 - level * 0.05;
  const tipY = kind === 'up' ? -1.72 + level * 0.08 : 1.72 - level * 0.08;

  return {
    hub: [0, yBase],
    leftOuter: [-1.52, outerY],
    leftInner: [-0.72, innerY],
    rightInner: [0.72, innerY],
    rightOuter: [1.52, outerY],
    tip: [0, tipY],
    bottomLeft: [-0.48, kind === 'up' ? -1.42 + level * 0.07 : 1.42 - level * 0.07],
    bottomRight: [0.48, kind === 'up' ? -1.42 + level * 0.07 : 1.42 - level * 0.07],
  };
}

function drawSpine() {
  const [x1, y1] = pt(0, -1.95);
  const [x2, y2] = pt(0, 1.95);
  els.guideLayer.appendChild(svgEl('line', { x1, y1, x2, y2, class: 'spine-guide' }));

  const [cx, cy] = pt(0, 0);
  const [ux, uy] = pt(0, -0.62);
  const [dx, dy] = pt(0, 0.62);

  els.edgeLayer.appendChild(svgEl('line', { x1: cx, y1: cy, x2: ux, y2: uy, class: 'spine-line' }));
  els.edgeLayer.appendChild(svgEl('line', { x1: cx, y1: cy, x2: dx, y2: dy, class: 'spine-line' }));

  els.nodeLayer.appendChild(svgEl('circle', { cx, cy, r: 7, class: 'center-node' }));
  els.nodeLayer.appendChild(svgEl('circle', { cx: ux, cy: uy, r: 6, class: 'spine-node' }));
  els.nodeLayer.appendChild(svgEl('circle', { cx: dx, cy: dy, r: 6, class: 'spine-node' }));

  const lab = svgEl('text', { x: cx, y: cy - 18, class: 'label' });
  lab.textContent = 'I';
  els.labelLayer.appendChild(lab);

  const upLab = svgEl('text', { x: 150, y: 110, class: 'domain-label' });
  upLab.textContent = 'upstairs';
  els.labelLayer.appendChild(upLab);

  const downLab = svgEl('text', { x: 150, y: 520, class: 'domain-label' });
  downLab.textContent = 'downstairs';
  els.labelLayer.appendChild(downLab);
}

function line(a, b, cls) {
  const [x1, y1] = pt(a[0], a[1]);
  const [x2, y2] = pt(b[0], b[1]);
  els.edgeLayer.appendChild(svgEl('line', { x1, y1, x2, y2, class: cls }));
}

function poly(points, cls) {
  const pts = points.map(([x, y]) => pt(x, y).join(',')).join(' ');
  els.faceLayer.appendChild(svgEl('polygon', { points: pts, class: cls }));
}

function node(p, r, cls, labelText = null, subText = null) {
  const [x, y] = pt(p[0], p[1]);
  els.nodeLayer.appendChild(svgEl('circle', { cx: x, cy: y, r, class: cls }));
  if (labelText) {
    const t = svgEl('text', { x, y, class: 'node-label' });
    t.textContent = labelText;
    els.labelLayer.appendChild(t);
  }
  if (subText) {
    const s = svgEl('text', { x, y: y + 24, class: 'node-sub' });
    s.textContent = subText;
    els.labelLayer.appendChild(s);
  }
}

function drawCrown(kind, level, current = false, frontier = null) {
  const c = crownPoints(kind, level);

  line(c.hub, c.leftOuter, current ? 'current-edge' : 'realized-edge');
  line(c.hub, c.leftInner, current ? 'current-edge' : 'realized-edge');
  line(c.hub, c.rightInner, current ? 'current-edge' : 'realized-edge');
  line(c.hub, c.rightOuter, current ? 'current-edge' : 'realized-edge');
  line(c.hub, c.tip, current ? 'current-edge' : 'realized-edge');

  line(c.leftInner, c.rightInner, current ? 'current-edge' : 'realized-edge');
  line(c.leftInner, c.tip, current ? 'current-edge' : 'realized-edge');
  line(c.rightInner, c.tip, current ? 'current-edge' : 'realized-edge');
  line(c.leftInner, c.bottomRight, current ? 'current-edge' : 'realized-edge');
  line(c.rightInner, c.bottomLeft, current ? 'current-edge' : 'realized-edge');
  line(c.bottomLeft, c.bottomRight, current ? 'current-edge' : 'realized-edge');

  poly([c.hub, c.leftInner, c.rightInner], current ? (kind === 'up' ? 'current-up-fill' : 'current-down-fill') : (kind === 'up' ? 'realized-up-fill' : 'realized-down-fill'));
  poly([c.hub, c.tip, c.leftInner], current ? (kind === 'up' ? 'current-up-fill' : 'current-down-fill') : (kind === 'up' ? 'realized-up-fill' : 'realized-down-fill'));
  poly([c.hub, c.tip, c.rightInner], current ? (kind === 'up' ? 'current-up-fill' : 'current-down-fill') : (kind === 'up' ? 'realized-up-fill' : 'realized-down-fill'));

  if (current && frontier) {
    node(c.hub, kind === 'up' ? 16 : 18, kind === 'up' ? 'current-up-node' : 'current-down-node',
      kind === 'up' ? frontier.open.id : frontier.closed.id,
      kind === 'up' ? `${frontier.open.phase} · ${frontier.open.payload}` : `${frontier.closed.phase} · ${frontier.closed.payload}`
    );
  } else {
    node(c.hub, kind === 'up' ? 9 : 10, kind === 'up' ? 'realized-up-node' : 'realized-down-node');
  }

  node(c.tip, 7, kind === 'up' ? 'realized-up-node' : 'realized-down-node');
  node(c.leftOuter, 6, kind === 'up' ? 'realized-up-node' : 'realized-down-node');
  node(c.rightOuter, 6, kind === 'up' ? 'realized-up-node' : 'realized-down-node');
  node(c.leftInner, 5, kind === 'up' ? 'realized-up-node' : 'realized-down-node');
  node(c.rightInner, 5, kind === 'up' ? 'realized-up-node' : 'realized-down-node');
  node(c.bottomLeft, 4.5, kind === 'up' ? 'realized-up-node' : 'realized-down-node');
  node(c.bottomRight, 4.5, kind === 'up' ? 'realized-up-node' : 'realized-down-node');

  return c;
}

function parseJoinIndex(join) {
  const m = /^t(\d+)r$/.exec(join || '');
  return m ? Number(m[1]) : null;
}

function drawJoin(frontier, upCrown, downCrown) {
  const prev = parseJoinIndex(frontier.join);
  if (prev == null) return;

  const joinPos = [
    (upCrown.leftInner[0] + downCrown.rightInner[0]) / 2,
    (upCrown.leftInner[1] + downCrown.rightInner[1]) / 2,
  ];

  const [x, y] = pt(joinPos[0], joinPos[1]);
  els.nodeLayer.appendChild(svgEl('circle', { cx: x, cy: y, r: 5, class: 'join-node' }));

  const t = svgEl('text', { x: x + 26, y: y - 8, class: 'node-sub' });
  t.textContent = frontier.join;
  els.labelLayer.appendChild(t);

  line(downCrown.hub, joinPos, 'current-edge');
  line(joinPos, upCrown.hub, 'current-edge');
}

function updateStatus(f) {
  els.statusTick.textContent = String(state.tick);
  els.statusSlot.textContent = f.slot;
  els.statusNextSlot.textContent = f.next_slot;
  els.statusJoin.textContent = f.join;
  els.statusSheet.textContent = f.sheet;
}

function updateReadout(f, realizedDown, realizedUp) {
  els.readout.textContent = [
    `tick          : ${f.tick}`,
    `slot          : ${f.slot}`,
    `next_slot     : ${f.next_slot}`,
    `join          : ${f.join}`,
    `sheet         : ${f.sheet}`,
    `socket        : ${f.socket}`,
    `closed_id     : ${f.closed.id}`,
    `closed_phase  : ${f.closed.phase}`,
    `closed_pay    : ${f.closed.payload}`,
    `open_id       : ${f.open.id}`,
    `open_phase    : ${f.open.phase}`,
    `open_pay      : ${f.open.payload}`,
    `register      : WXYZTI`,
    ``,
    `downstairs    : ${realizedDown.join(', ')}`,
    `upstairs      : ${realizedUp.join(', ')}`,
  ].join('\n');
}

function render() {
  els.gridLayer.textContent = '';
  els.guideLayer.textContent = '';
  els.edgeLayer.textContent = '';
  els.faceLayer.textContent = '';
  els.nodeLayer.textContent = '';
  els.labelLayer.textContent = '';

  drawGrid();
  drawSpine();

  const frontier = nthFrontier(state.tick);

  const realizedDown = [];
  const realizedUp = [];

  for (let k = Math.max(1, state.tick - 2); k < state.tick; k += 1) {
    const f = nthFrontier(k);
    realizedDown.push(f.closed.id);
    realizedUp.push(f.open.id);
    drawCrown('up', k - state.tick, false, null);
    drawCrown('down', k - state.tick, false, null);
  }

  realizedDown.push(frontier.closed.id);
  realizedUp.push(frontier.open.id);

  const upCrown = drawCrown('up', 0, true, frontier);
  const downCrown = drawCrown('down', 0, true, frontier);
  drawJoin(frontier, upCrown, downCrown);

  updateStatus(frontier);
  updateReadout(frontier, realizedDown, realizedUp);
}

els.tickPrev.addEventListener('click', () => {
  state.tick = Math.max(1, state.tick - 1);
  render();
});

els.tickNext.addEventListener('click', () => {
  state.tick = Math.min(24, state.tick + 1);
  render();
});

render();
