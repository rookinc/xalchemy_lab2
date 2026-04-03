import { G60_VESSEL } from '/assets/spinor/g60_vessel_seed.js';

const els = {
  gridLayer: document.getElementById('grid-layer'),
  linkLayer: document.getElementById('link-layer'),
  nodeLayer: document.getElementById('node-layer'),
  labelLayer: document.getElementById('label-layer'),
  toggleUpstairs: document.getElementById('toggle-upstairs'),
  toggleDownstairs: document.getElementById('toggle-downstairs'),
  toggleLinks: document.getElementById('toggle-links'),
  toggleLabels: document.getElementById('toggle-labels'),
  focusAll: document.getElementById('focus-all'),
  focusPrime: document.getElementById('focus-prime'),
  focusCycle2: document.getElementById('focus-cycle2'),
  focusNext: document.getElementById('focus-next'),
  statusHost: document.getElementById('status-host'),
  statusDomains: document.getElementById('status-domains'),
  statusRegister: document.getElementById('status-register'),
  statusPrime: document.getElementById('status-prime'),
  readout: document.getElementById('readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  showUpstairs: true,
  showDownstairs: true,
  showLinks: true,
  showLabels: true,
  focus: 'all',
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

function ringColor(phase, stateName) {
  if (phase === 'RGB') {
    if (stateName === 'closed') return 'rgba(255,90,90,0.95)';
    if (stateName === 'forming') return 'rgba(255,150,90,0.95)';
    return 'rgba(90,170,255,0.92)';
  }
  if (stateName === 'closed') return 'rgba(255,235,110,0.95)';
  if (stateName === 'forming') return 'rgba(255,190,120,0.95)';
  return 'rgba(255,90,220,0.92)';
}

function nodeRadius(role) {
  if (role.includes('prime')) return 24;
  if (role.includes('next orbit')) return 18;
  return 20;
}

function occupantIdsForFocus() {
  const occ = G60_VESSEL.occupants;
  if (state.focus === 'prime') return ['t0', 'u0'];
  if (state.focus === 'cycle2') return ['t3', 't4', 't5', 'u1', 'u2', 'u3'];
  if (state.focus === 'next') return ['t6', 't7', 't8', 'u4', 'u5', 'u6'];
  return Object.keys(occ);
}

function layout() {
  return {
    t0: [450, 400],
    u0: [450, 220],

    t3: [180, 420],
    t4: [290, 420],
    t5: [400, 420],

    t6: [560, 420],
    t7: [670, 420],
    t8: [780, 420],

    u1: [180, 200],
    u2: [290, 200],
    u3: [400, 200],

    u4: [560, 200],
    u5: [670, 200],
    u6: [780, 200],
  };
}

function drawLinks(pos, ids) {
  if (!state.showLinks) return;

  const downRail = [['t0','t3'],['t3','t4'],['t4','t5'],['t5','t6'],['t6','t7'],['t7','t8']];
  const upRail = [['u0','u1'],['u1','u2'],['u2','u3'],['u3','u4'],['u4','u5'],['u5','u6']];
  const cross = [['t0','u0'],['t3','u1'],['t4','u2'],['t5','u3'],['t6','u4'],['t7','u5'],['t8','u6']];

  const allowed = new Set(ids);

  for (const [a,b] of downRail) {
    if (!allowed.has(a) || !allowed.has(b) || !state.showDownstairs) continue;
    const [x1,y1] = pos[a];
    const [x2,y2] = pos[b];
    els.linkLayer.appendChild(svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      class: 'rail-link',
    }));
  }

  for (const [a,b] of upRail) {
    if (!allowed.has(a) || !allowed.has(b) || !state.showUpstairs) continue;
    const [x1,y1] = pos[a];
    const [x2,y2] = pos[b];
    els.linkLayer.appendChild(svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      class: 'rail-link',
    }));
  }

  for (const [a,b] of cross) {
    if (!allowed.has(a) || !allowed.has(b)) continue;
    if ((a.startsWith('t') && !state.showDownstairs) || (b.startsWith('u') && !state.showUpstairs)) continue;
    const [x1,y1] = pos[a];
    const [x2,y2] = pos[b];
    els.linkLayer.appendChild(svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      class: 'cross-link',
    }));
  }
}

function drawNodes() {
  els.nodeLayer.textContent = '';
  els.labelLayer.textContent = '';

  const pos = layout();
  const ids = occupantIdsForFocus();

  drawLinks(pos, ids);

  const upBand = svgEl('text', { x: 450, y: 80, class: 'band-label' });
  upBand.textContent = 'upstairs';
  const downBand = svgEl('text', { x: 450, y: 545, class: 'band-label' });
  downBand.textContent = 'downstairs';
  if (state.showLabels && state.showUpstairs) els.labelLayer.appendChild(upBand);
  if (state.showLabels && state.showDownstairs) els.labelLayer.appendChild(downBand);

  ids.forEach((id) => {
    const occ = G60_VESSEL.occupants[id];
    const isUp = occ.domain === 'upstairs';
    if ((isUp && !state.showUpstairs) || (!isUp && !state.showDownstairs)) return;

    const [x,y] = pos[id];
    const fill = ringColor(occ.phase, occ.state);

    els.nodeLayer.appendChild(svgEl('circle', {
      cx: x,
      cy: y,
      r: nodeRadius(occ.role),
      class: 'node',
      fill,
    }));

    if (state.showLabels) {
      const t = svgEl('text', { x, y, class: 'node-label' });
      t.textContent = occ.id;
      els.labelLayer.appendChild(t);

      const t2 = svgEl('text', { x, y: y + 28, class: 'node-sub' });
      t2.textContent = `${occ.slot} · ${occ.phase} · ${occ.state}`;
      els.labelLayer.appendChild(t2);
    }
  });
}

function updateReadout() {
  const h = G60_VESSEL.host;
  const ids = occupantIdsForFocus();
  const rows = ids.map((id) => {
    const o = G60_VESSEL.occupants[id];
    return `  ${o.id}  ${o.domain.padEnd(10)}  ${o.phase.padEnd(3)}  ${o.state.padEnd(7)}  ${o.slot.padEnd(11)}  ${o.role}`;
  });

  els.statusHost.textContent = h.name;
  els.statusDomains.textContent = '7↓ / 7↑';
  els.statusRegister.textContent = G60_VESSEL.register.join('');
  els.statusPrime.textContent = 't0 / u0';

  els.readout.textContent = [
    `host_name            : ${h.name}`,
    `graphsym_id          : ${h.graphsym_id}`,
    `house_of_graphs_id   : ${h.house_of_graphs_id}`,
    `vertex_count         : ${h.vertex_count}`,
    `edge_count           : ${h.edge_count}`,
    `regular_degree       : ${h.regular_degree}`,
    `automorphism_order   : ${h.automorphism_group_order}`,
    `diameter             : ${h.diameter}`,
    `shells               : ${h.shells.join(', ')}`,
    `role                 : ${h.role}`,
    ``,
    `register             : ${G60_VESSEL.register.join('')}`,
    `focus                : ${state.focus}`,
    `show_upstairs        : ${state.showUpstairs}`,
    `show_downstairs      : ${state.showDownstairs}`,
    `show_links           : ${state.showLinks}`,
    `show_labels          : ${state.showLabels}`,
    ``,
    `occupants`,
    ...rows,
  ].join('\n');
}

function setButtons() {
  els.toggleUpstairs.classList.toggle('is-active', state.showUpstairs);
  els.toggleDownstairs.classList.toggle('is-active', state.showDownstairs);
  els.toggleLinks.classList.toggle('is-active', state.showLinks);
  els.toggleLabels.classList.toggle('is-active', state.showLabels);
  els.focusAll.classList.toggle('is-active', state.focus === 'all');
  els.focusPrime.classList.toggle('is-active', state.focus === 'prime');
  els.focusCycle2.classList.toggle('is-active', state.focus === 'cycle2');
  els.focusNext.classList.toggle('is-active', state.focus === 'next');
}

function render() {
  els.gridLayer.textContent = '';
  els.linkLayer.textContent = '';
  els.nodeLayer.textContent = '';
  els.labelLayer.textContent = '';

  drawGrid();
  drawNodes();
  updateReadout();
  setButtons();
}

els.toggleUpstairs.addEventListener('click', () => {
  state.showUpstairs = !state.showUpstairs;
  render();
});

els.toggleDownstairs.addEventListener('click', () => {
  state.showDownstairs = !state.showDownstairs;
  render();
});

els.toggleLinks.addEventListener('click', () => {
  state.showLinks = !state.showLinks;
  render();
});

els.toggleLabels.addEventListener('click', () => {
  state.showLabels = !state.showLabels;
  render();
});

els.focusAll.addEventListener('click', () => {
  state.focus = 'all';
  render();
});

els.focusPrime.addEventListener('click', () => {
  state.focus = 'prime';
  render();
});

els.focusCycle2.addEventListener('click', () => {
  state.focus = 'cycle2';
  render();
});

els.focusNext.addEventListener('click', () => {
  state.focus = 'next';
  render();
});

render();
