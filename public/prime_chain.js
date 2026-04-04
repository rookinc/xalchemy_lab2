import { OCCUPANCY_REGISTER } from '/assets/spinor/occupancy_register.js';
import { nthFrontier } from '/assets/spinor/frontier_grammar.js';

const els = {
  gridLayer: document.getElementById('grid-layer'),
  ghostLayer: document.getElementById('ghost-layer'),
  faceLayer: document.getElementById('face-layer'),
  edgeLayer: document.getElementById('edge-layer'),
  labelLayer: document.getElementById('label-layer'),

  tickPrev: document.getElementById('tick-prev'),
  tickNext: document.getElementById('tick-next'),
  tick1: document.getElementById('tick-1'),
  tick2: document.getElementById('tick-2'),
  tick3: document.getElementById('tick-3'),

  viewFrontier: document.getElementById('view-frontier') || null,
  viewRings: document.getElementById('view-rings') || null,

  togglePrime: document.getElementById('toggle-prime') || null,
  toggleClosure: document.getElementById('toggle-closure') || null,
  toggleUpstairs: document.getElementById('toggle-upstairs') || null,
  toggleDownstairs: document.getElementById('toggle-downstairs') || null,
  toggleChildren: document.getElementById('toggle-children') || null,
  toggleLabels: document.getElementById('toggle-labels') || null,
  toggleGhosts: document.getElementById('toggle-ghosts') || null,
  toggleHistory: document.getElementById('toggle-history') || null,

  focusAll: document.getElementById('focus-all') || null,
  focusF1: document.getElementById('focus-f1') || null,
  focusF2: document.getElementById('focus-f2') || null,
  focusF3: document.getElementById('focus-f3') || null,

  statusCycle: document.getElementById('status-cycle'),
  statusPrime: document.getElementById('status-prime'),
  statusChildren: document.getElementById('status-children'),
  statusClosure: document.getElementById('status-closure'),
  statusDomains: document.getElementById('status-domains'),
  statusRegister: document.getElementById('status-register'),
  readout: document.getElementById('readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  tick: 1,
  view: 'frontier',
  showPrime: true,
  showClosure: true,
  showLabels: true,
  showGhosts: true,
  showHistory: false,
  focusFace: 'all',
};

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
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
  const cy = 310;
  return [cx + x * 150 + z * 80, cy - y * 150 + z * 40];
}

function polyPoints(points, ids) {
  return ids.map((id) => {
    const [x, y] = project(points[id]);
    return `${x},${y}`;
  }).join(' ');
}

function pathD(points, a, b) {
  const [x1, y1] = project(points[a]);
  const [x2, y2] = project(points[b]);
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

function faceCenter(points, ids) {
  const sum = ids.reduce((acc, id) => {
    const p = points[id];
    return [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]];
  }, [0, 0, 0]);
  return [sum[0] / ids.length, sum[1] / ids.length, sum[2] / ids.length];
}

function prime() {
  return OCCUPANCY_REGISTER.prime;
}

function edgeColor(phase) {
  return phase === 'RGB'
    ? 'rgba(232,240,248,0.84)'
    : 'rgba(232,240,248,0.64)';
}

function facePalette(phase, stateName) {
  if (phase === 'RGB') {
    return stateName === 'closed'
      ? ['rgba(255,77,77,0.34)', 'rgba(77,255,136,0.34)', 'rgba(77,136,255,0.34)']
      : ['rgba(255,77,77,0.18)', 'rgba(77,255,136,0.18)', 'rgba(77,136,255,0.18)'];
  }
  return stateName === 'open' || stateName === 'opening'
    ? ['rgba(0,255,255,0.26)', 'rgba(255,0,255,0.26)', 'rgba(255,255,0,0.26)']
    : ['rgba(0,255,255,0.16)', 'rgba(255,0,255,0.16)', 'rgba(255,255,0,0.16)'];
}

function transformForFrontier(kind, frontier) {
  if (kind === 'closed') return frontier.transform.closed;
  if (kind === 'open') return frontier.transform.open;
  if (kind === 'history-left') {
    return { tx: -0.95, ty: 0.16, tz: -0.04, scale: 0.70, flipZ: 1 };
  }
  if (kind === 'history-right') {
    return { tx: 0.98, ty: 0.04, tz: 0.04, scale: 0.70, flipZ: -1 };
  }
  return { tx: 0, ty: 0, tz: 0, scale: 1, flipZ: 1 };
}

function transformPoints(basePoints, tf) {
  const out = {};
  for (const [id, p] of Object.entries(basePoints)) {
    out[id] = [
      p[0] * tf.scale + tf.tx,
      p[1] * tf.scale + tf.ty,
      p[2] * tf.scale * tf.flipZ + tf.tz,
    ];
  }
  return out;
}

function drawTetra(points, faces, phase, stateName, labelText, dashed = false) {
  const fills = facePalette(phase, stateName);

  Object.entries(faces).forEach(([faceId, ids], i) => {
    els.faceLayer.appendChild(svgEl('polygon', {
      points: polyPoints(points, ids),
      class: faceId === 'f4' && state.showClosure ? 'closure-poly' : 'face-poly',
      fill: fills[i % fills.length],
    }));
  });

  const seen = new Set();
  Object.values(faces).forEach((ids) => {
    for (let i = 0; i < ids.length; i += 1) {
      const a = ids[i];
      const b = ids[(i + 1) % ids.length];
      const key = [a, b].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      els.edgeLayer.appendChild(svgEl('path', {
        d: pathD(points, a, b),
        class: dashed ? 'ring-link' : 'edge-line',
        stroke: edgeColor(phase),
      }));
    }
  });

  if (state.showLabels) {
    const c = faceCenter(points, faces.f4);
    const [x, y] = project(c);
    const t = svgEl('text', { x, y, class: 'closure-label' });
    t.textContent = labelText;
    els.labelLayer.appendChild(t);
  }
}

function frontierForTick(tick) {
  const f = nthFrontier(tick);
  return {
    closed: {
      id: f.closed.id,
      phase: f.closed.phase,
      state: f.closed.state,
      joined_on: f.join,
    },
    open: {
      id: f.open.id,
      phase: f.open.phase,
      state: f.open.state,
      joined_on: f.join,
    },
    note: f.note,
    slot: f.slot,
    next_slot: f.next_slot,
    transform: f.transform,
  };
}

function drawJoinLocus(joinText) {
  const [x, y] = project([0.0, 0.02, 0.0]);

  els.faceLayer.appendChild(svgEl('circle', {
    cx: x,
    cy: y,
    r: 7,
    class: 'node',
    fill: 'rgba(232,240,248,0.95)',
  }));

  if (state.showLabels) {
    const t = svgEl('text', { x, y: y - 20, class: 'node-sub' });
    t.textContent = `join ${joinText}`;
    els.labelLayer.appendChild(t);
  }
}

function drawFrontier() {
  const p = prime();
  const f = frontierForTick(state.tick);

  if (state.showPrime) {
    const closedPts = transformPoints(p.points, transformForFrontier('closed', f));
    drawTetra(closedPts, p.faces, f.closed.phase, f.closed.state, f.closed.id);

    const openPts = transformPoints(p.points, transformForFrontier('open', f));
    drawTetra(openPts, p.faces, f.open.phase, f.open.state, f.open.id);

    if (state.showHistory && state.tick >= 2) {
      const leftPts = transformPoints(p.points, transformForFrontier('history-left'));
      drawTetra(leftPts, p.faces, 'RGB', 'closed', 'history', true);
    }
    if (state.showHistory && state.tick >= 3) {
      const rightPts = transformPoints(p.points, transformForFrontier('history-right'));
      drawTetra(rightPts, p.faces, 'CMY', 'open', 'history', true);
    }
  }

  drawJoinLocus(f.closed.joined_on);

  const [x1, y1] = project([-0.18, 0.02, 0.02]);
  const [x2, y2] = project([ 0.20, 0.02, 0.02]);
  els.edgeLayer.appendChild(svgEl('path', {
    d: `M ${x1} ${y1} L ${x2} ${y2}`,
    class: 'cross-link',
  }));
}

function ringPoint(cx, cy, r, ordinal, total = 6) {
  const angle = -Math.PI / 2 + (ordinal / total) * Math.PI * 2;
  return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
}

function ringColor(chirality, domain) {
  if (domain === 'downstairs') {
    return chirality === 'left' ? 'rgba(77,180,255,0.92)' : 'rgba(255,120,180,0.92)';
  }
  return chirality === 'left' ? 'rgba(255,230,90,0.92)' : 'rgba(90,255,170,0.92)';
}

function drawRingFamily(items, domain, cx, cy, r) {
  items.forEach((item, i) => {
    const nxt = items[(i + 1) % items.length];
    const [x1, y1] = ringPoint(cx, cy, r, item.ordinal, items.length);
    const [x2, y2] = ringPoint(cx, cy, r, nxt.ordinal, items.length);

    els.edgeLayer.appendChild(svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      class: 'ring-link',
      stroke: ringColor(item.chirality, domain),
    }));
  });

  items.forEach((item) => {
    const [x, y] = ringPoint(cx, cy, r, item.ordinal, items.length);
    els.faceLayer.appendChild(svgEl('circle', {
      cx: x, cy: y, r: 18, class: 'ring-node',
      fill: ringColor(item.chirality, domain),
    }));
    if (state.showLabels) {
      const t = svgEl('text', { x, y, class: 'ring-node-label' });
      t.textContent = item.id;
      els.labelLayer.appendChild(t);
    }
  });
}

function drawCycle2Rings() {
  drawRingFamily(OCCUPANCY_REGISTER.cycle2.downstairs, 'downstairs', 280, 320, 110);
  drawRingFamily(OCCUPANCY_REGISTER.cycle2.upstairs, 'upstairs', 620, 320, 110);
}

function updateReadout() {
  const f = frontierForTick(state.tick);

  els.statusCycle.textContent = String(state.tick);
  els.statusPrime.textContent = `${f.closed.id} / ${f.open.id}`;
  els.statusChildren.textContent = '2';
  els.statusClosure.textContent = f.closed.joined_on;
  els.statusDomains.textContent = 'frontier';
  els.statusRegister.textContent = OCCUPANCY_REGISTER.register.join('');

  els.readout.textContent = [
    `tick                  : ${state.tick}`,
    `view                  : ${state.view}`,
    `register              : ${OCCUPANCY_REGISTER.register.join('')}`,
    ``,
    `closed                : ${f.closed.id}  ${f.closed.phase}  ${f.closed.state}`,
    `open                  : ${f.open.id}  ${f.open.phase}  ${f.open.state}`,
    `join                  : ${f.closed.joined_on}`,
    `sheet                 : ${f.sheet || '?'}`,
    `slot                  : ${f.slot}`,
    `next_slot             : ${f.next_slot}`,
    `socket                : ${f.socket || 'T'},
    `closed_payload        : ${f.closed.payload || f.closed.id},
    `open_payload          : ${f.open.payload || f.open.id},
    `socket                : T`,
    `closed_payload        : ${f.closed.payload || f.closed.id}`,
    `open_payload          : ${f.open.payload || f.open.id}`,
    `law                   : ${f.note}`,
    ``,
    `grammar               : closed RGB frontier emits open CMY frontier`,
    `successor             : F(n+1) derived from F(n)`,
    ``,
    `show_prime            : ${state.showPrime}`,
    `show_closure          : ${state.showClosure}`,
    `show_labels           : ${state.showLabels}`,
    `show_ghosts           : ${state.showGhosts}`,
    `show_history          : ${state.showHistory}`,
  ].join('\n');
}

function setButtons() {
  els.tick1?.classList.toggle('is-active', state.tick === 1);
  els.tick2?.classList.toggle('is-active', state.tick === 2);
  els.tick3?.classList.toggle('is-active', state.tick === 3);

  els.viewFrontier?.classList.toggle('is-active', state.view === 'frontier');
  els.viewRings?.classList.toggle('is-active', state.view === 'rings');

  els.togglePrime?.classList.toggle('is-active', state.showPrime);
  els.toggleClosure?.classList.toggle('is-active', state.showClosure);
  els.toggleLabels?.classList.toggle('is-active', state.showLabels);
  els.toggleGhosts?.classList.toggle('is-active', state.showGhosts);
  els.toggleHistory?.classList.toggle('is-active', state.showHistory);

  els.focusAll?.classList.toggle('is-active', state.focusFace === 'all');
  els.focusF1?.classList.toggle('is-active', state.focusFace === 'f1');
  els.focusF2?.classList.toggle('is-active', state.focusFace === 'f2');
  els.focusF3?.classList.toggle('is-active', state.focusFace === 'f3');
}

function render() {
  els.gridLayer.textContent = '';
  els.ghostLayer.textContent = '';
  els.faceLayer.textContent = '';
  els.edgeLayer.textContent = '';
  els.labelLayer.textContent = '';

  drawGrid();

  if (state.view === 'frontier') {
    drawFrontier();
  } else {
    drawCycle2Rings();
  }

  updateReadout();
  setButtons();
}

els.tickPrev?.addEventListener('click', () => {
  state.tick = Math.max(1, state.tick - 1);
  render();
});
els.tickNext?.addEventListener('click', () => {
  state.tick = Math.min(12, state.tick + 1);
  render();
});

els.tick1?.addEventListener('click', () => { state.tick = 1; render(); });
els.tick2?.addEventListener('click', () => { state.tick = 2; render(); });
els.tick3?.addEventListener('click', () => { state.tick = 3; render(); });

els.viewFrontier?.addEventListener('click', () => { state.view = 'frontier'; render(); });
els.viewRings?.addEventListener('click', () => { state.view = 'rings'; render(); });

els.togglePrime?.addEventListener('click', () => { state.showPrime = !state.showPrime; render(); });
els.toggleClosure?.addEventListener('click', () => { state.showClosure = !state.showClosure; render(); });
els.toggleLabels?.addEventListener('click', () => { state.showLabels = !state.showLabels; render(); });
els.toggleGhosts?.addEventListener('click', () => { state.showGhosts = !state.showGhosts; render(); });
els.toggleHistory?.addEventListener('click', () => { state.showHistory = !state.showHistory; render(); });

els.focusAll?.addEventListener('click', () => { state.focusFace = 'all'; render(); });
els.focusF1?.addEventListener('click', () => { state.focusFace = 'f1'; render(); });
els.focusF2?.addEventListener('click', () => { state.focusFace = 'f2'; render(); });
els.focusF3?.addEventListener('click', () => { state.focusFace = 'f3'; render(); });

render();
