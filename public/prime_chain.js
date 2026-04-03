import { PRIME_ATTACHMENT } from '/assets/spinor/prime_attachment_grammar.js';

const els = {
  gridLayer: document.getElementById('grid-layer'),
  ghostLayer: document.getElementById('ghost-layer'),
  faceLayer: document.getElementById('face-layer'),
  edgeLayer: document.getElementById('edge-layer'),
  labelLayer: document.getElementById('label-layer'),
  togglePrime: document.getElementById('toggle-prime'),
  toggleChildren: document.getElementById('toggle-children'),
  toggleLabels: document.getElementById('toggle-labels'),
  toggleGhosts: document.getElementById('toggle-ghosts'),
  focusAll: document.getElementById('focus-all'),
  focusF1: document.getElementById('focus-f1'),
  focusF2: document.getElementById('focus-f2'),
  focusF3: document.getElementById('focus-f3'),
  statusPrime: document.getElementById('status-prime'),
  statusChildren: document.getElementById('status-children'),
  statusMode: document.getElementById('status-mode'),
  statusRegister: document.getElementById('status-register'),
  readout: document.getElementById('readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  showPrime: true,
  showChildren: true,
  showLabels: true,
  showGhosts: true,
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
  return [
    cx + x * 150 + z * 80,
    cy - y * 150 + z * 40,
  ];
}

function colorForPhase(phase) {
  return phase === 'objective'
    ? ['rgba(255,77,77,0.30)', 'rgba(77,255,136,0.30)', 'rgba(77,136,255,0.30)']
    : ['rgba(0,255,255,0.28)', 'rgba(255,0,255,0.28)', 'rgba(255,255,0,0.28)'];
}

function edgeColor(phase) {
  return phase === 'objective'
    ? 'rgba(232,240,248,0.78)'
    : 'rgba(232,240,248,0.64)';
}

function prime() {
  return PRIME_ATTACHMENT.prime;
}

function faceCenter(points, ids) {
  const sum = ids.reduce((acc, id) => {
    const p = points[id];
    return [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]];
  }, [0,0,0]);
  return [sum[0] / ids.length, sum[1] / ids.length, sum[2] / ids.length];
}

function vecSub(a, b) {
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

function vecAdd(a, b) {
  return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
}

function vecScale(a, s) {
  return [a[0]*s, a[1]*s, a[2]*s];
}

function mirrorChild(parent, attachFace) {
  const ids = parent.faces[attachFace];
  const center = faceCenter(parent.points, ids);

  const childPoints = {};
  for (const [id, pt] of Object.entries(parent.points)) {
    const rel = vecSub(pt, center);
    const mirrored = [-rel[0], rel[1], -rel[2]];
    const shifted = vecAdd(vecAdd(center, mirrored), vecScale(center, 0.16));
    childPoints[id] = shifted;
  }

  return {
    points: childPoints,
    faces: parent.faces,
  };
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

function drawPrime() {
  if (!state.showPrime) return;

  const p = prime();
  const palette = colorForPhase(p.phase);

  Object.entries(p.faces).forEach(([faceId, ids], i) => {
    const fill = palette[i % palette.length];
    els.faceLayer.appendChild(svgEl('polygon', {
      points: polyPoints(p.points, ids),
      class: 'face-poly',
      fill,
    }));

    if (state.showGhosts && faceId !== 'f4') {
      els.ghostLayer.appendChild(svgEl('polygon', {
        points: polyPoints(p.points, ids),
        class: 'ghost-poly',
      }));
    }
  });

  const seen = new Set();
  Object.values(p.faces).forEach((ids) => {
    for (let i = 0; i < ids.length; i += 1) {
      const a = ids[i];
      const b = ids[(i + 1) % ids.length];
      const key = [a, b].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      els.edgeLayer.appendChild(svgEl('path', {
        d: pathD(p.points, a, b),
        class: 'edge-line',
        stroke: edgeColor(p.phase),
      }));
    }
  });

  if (state.showLabels) {
    for (const [id, pt] of Object.entries(p.points)) {
      const [x, y] = project(pt);
      const t = svgEl('text', { x, y: y - 14, class: 'label' });
      t.textContent = id;
      els.labelLayer.appendChild(t);
    }
  }
}

function drawChildren() {
  if (!state.showChildren) return;

  const p = prime();

  PRIME_ATTACHMENT.attachments.forEach((att, idx) => {
    if (state.focusFace !== 'all' && state.focusFace !== att.attach_from_face) return;

    const child = mirrorChild(p, att.attach_from_face);
    const palette = colorForPhase('objective');

    Object.entries(p.faces).forEach(([faceId, ids], i) => {
      const fill = palette[(i + idx) % palette.length].replace('0.30', '0.18');
      els.faceLayer.appendChild(svgEl('polygon', {
        points: polyPoints(child.points, ids),
        class: 'face-poly',
        fill,
      }));
    });

    const seen = new Set();
    Object.values(p.faces).forEach((ids) => {
      for (let i = 0; i < ids.length; i += 1) {
        const a = ids[i];
        const b = ids[(i + 1) % ids.length];
        const key = [a, b].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        els.edgeLayer.appendChild(svgEl('path', {
          d: pathD(child.points, a, b),
          class: 'edge-line',
          stroke: 'rgba(232,240,248,0.44)',
        }));
      }
    });

    if (state.showLabels) {
      const ids = p.faces[att.attach_from_face];
      const c = faceCenter(child.points, ids);
      const [x, y] = project(c);
      const t = svgEl('text', { x, y, class: 'label' });
      t.textContent = `${att.id}@${att.attach_from_face}`;
      els.labelLayer.appendChild(t);
    }
  });
}

function updateReadout() {
  const p = prime();
  const visibleChildren = PRIME_ATTACHMENT.attachments.filter((att) => {
    return state.focusFace === 'all' || state.focusFace === att.attach_from_face;
  });

  els.statusPrime.textContent = p.id;
  els.statusChildren.textContent = String(visibleChildren.length);
  els.statusMode.textContent = 'mirror attach';
  els.statusRegister.textContent = 'WXYZTIW';

  els.readout.textContent = [
    `prime_id              : ${p.id}`,
    `prime_phase           : ${p.phase}`,
    `fold_chirality        : ${p.fold_chirality}`,
    `f1/f2/f3 realized     : ${p.realized_face_chirality.f1}, ${p.realized_face_chirality.f2}, ${p.realized_face_chirality.f3}`,
    `f4 formative          : ${p.realized_face_chirality.f4}`,
    ``,
    `shortcut              : fold to prime, then attach mirrored children`,
    `focus_face            : ${state.focusFace}`,
    `show_prime            : ${state.showPrime}`,
    `show_children         : ${state.showChildren}`,
    `show_labels           : ${state.showLabels}`,
    `show_face_ghosts      : ${state.showGhosts}`,
    ``,
    ...visibleChildren.map((att) =>
      `${att.id}: parent=${att.parent} attach=${att.attach_from_face} generated_from=${att.generated_from} child_chirality=${att.generated_chirality}`
    ),
  ].join('\n');
}

function setButtons() {
  els.togglePrime.classList.toggle('is-active', state.showPrime);
  els.toggleChildren.classList.toggle('is-active', state.showChildren);
  els.toggleLabels.classList.toggle('is-active', state.showLabels);
  els.toggleGhosts.classList.toggle('is-active', state.showGhosts);

  els.focusAll.classList.toggle('is-active', state.focusFace === 'all');
  els.focusF1.classList.toggle('is-active', state.focusFace === 'f1');
  els.focusF2.classList.toggle('is-active', state.focusFace === 'f2');
  els.focusF3.classList.toggle('is-active', state.focusFace === 'f3');
}

function render() {
  els.gridLayer.textContent = '';
  els.ghostLayer.textContent = '';
  els.faceLayer.textContent = '';
  els.edgeLayer.textContent = '';
  els.labelLayer.textContent = '';

  drawGrid();
  drawPrime();
  drawChildren();
  updateReadout();
  setButtons();
}

els.togglePrime.addEventListener('click', () => {
  state.showPrime = !state.showPrime;
  render();
});

els.toggleChildren.addEventListener('click', () => {
  state.showChildren = !state.showChildren;
  render();
});

els.toggleLabels.addEventListener('click', () => {
  state.showLabels = !state.showLabels;
  render();
});

els.toggleGhosts.addEventListener('click', () => {
  state.showGhosts = !state.showGhosts;
  render();
});

els.focusAll.addEventListener('click', () => {
  state.focusFace = 'all';
  render();
});

els.focusF1.addEventListener('click', () => {
  state.focusFace = 'f1';
  render();
});

els.focusF2.addEventListener('click', () => {
  state.focusFace = 'f2';
  render();
});

els.focusF3.addEventListener('click', () => {
  state.focusFace = 'f3';
  render();
});

render();
