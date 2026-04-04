const els = {
  gridLayer: document.getElementById('grid-layer'),
  faceLayer: document.getElementById('face-layer'),
  edgeLayer: document.getElementById('edge-layer'),
  nodeLayer: document.getElementById('node-layer'),
  labelLayer: document.getElementById('label-layer'),
  tickPrev: document.getElementById('tick-prev'),
  tickNext: document.getElementById('tick-next'),
  statusHost: document.getElementById('status-host'),
  statusTick: document.getElementById('status-tick'),
  statusNodes: document.getElementById('status-nodes'),
  statusEdges: document.getElementById('status-edges'),
  statusFaces: document.getElementById('status-faces'),
  statusTetra: document.getElementById('status-tetra'),
  readout: document.getElementById('readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  tick: 1,
  payload: null,
};

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function clearLayers() {
  els.gridLayer.textContent = '';
  els.faceLayer.textContent = '';
  els.edgeLayer.textContent = '';
  els.nodeLayer.textContent = '';
  els.labelLayer.textContent = '';
}

function drawGrid() {
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

function posMap() {
  return {
    n0: [450, 310],
    n1: [450, 250],
    n2: [450, 180],

    "3":  [330, 230],
    "4":  [250, 135],
    "5":  [450, 105],
    "6":  [650, 135],

    "7":  [565, 225],
    "8":  [360, 385],
    "9":  [255, 320],
    "10": [560, 290],

    "11": [670, 375],
    "12": [455, 500],
    "13": [450, 285],
    "14": [430, 345],
  };
}

function edgePair(edgeKey) {
  const [a, b] = edgeKey.split('|');
  return [a, b];
}

function faceTriple(faceKey) {
  return faceKey.split('|');
}

function projectNode(id) {
  return posMap()[id] || [450, 310];
}

function polygonPoints(ids) {
  return ids.map((id) => projectNode(id).join(',')).join(' ');
}

function edgePath(a, b) {
  const [x1, y1] = projectNode(a);
  const [x2, y2] = projectNode(b);
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

function drawFaces(payload) {
  const occupied = new Set(payload.occupied.faces);
  const frontier = new Set(payload.frontier.faces);

  for (const faceKey of occupied) {
    const ids = faceTriple(faceKey);
    els.faceLayer.appendChild(svgEl('polygon', {
      points: polygonPoints(ids),
      fill: frontier.has(faceKey) ? 'rgba(255,211,110,0.28)' : 'rgba(142,166,200,0.12)',
      class: 'face-poly',
    }));
  }
}

function drawEdges(payload) {
  const occupied = new Set(payload.occupied.edges);
  const frontier = new Set(payload.frontier.edges);

  for (const edgeKey of occupied) {
    const [a, b] = edgePair(edgeKey);
    els.edgeLayer.appendChild(svgEl('path', {
      d: edgePath(a, b),
      class: 'edge-line',
      stroke: frontier.has(edgeKey)
        ? 'rgba(255,230,110,0.92)'
        : 'rgba(232,240,248,0.34)',
    }));
  }
}

function drawNodes(payload) {
  const occupied = new Set(payload.occupied.nodes);
  const frontier = new Set(payload.frontier.nodes);
  const latestPrimary = payload.latest_delta.primary_node;

  for (const id of occupied) {
    const [x, y] = projectNode(id);
    let fill = 'rgba(152,174,205,0.72)';
    let r = 10;

    if (frontier.has(id)) {
      fill = 'rgba(255,211,110,0.95)';
      r = 11;
    }
    if (id === latestPrimary) {
      fill = 'rgba(255,110,110,0.96)';
      r = 13;
    }

    els.nodeLayer.appendChild(svgEl('circle', {
      cx: x,
      cy: y,
      r,
      fill,
      class: 'ring-node',
    }));

    const t = svgEl('text', { x, y: y - 16, class: 'label' });
    t.textContent = id;
    els.labelLayer.appendChild(t);
  }
}

function drawLawfulSummary(payload) {
  const t1 = svgEl('text', { x: 120, y: 72, class: 'domain-label' });
  t1.textContent = `lawful faces ${payload.lawful_cells.face_count}`;
  els.labelLayer.appendChild(t1);

  const t2 = svgEl('text', { x: 120, y: 102, class: 'domain-label' });
  t2.textContent = `lawful tetra ${payload.lawful_cells.tetra_count}`;
  els.labelLayer.appendChild(t2);
}

function render(bundle) {
  const payload = bundle.occupancy;
  const chronology = bundle.chronology;
  clearLayers();
  drawGrid();
  drawFaces(payload);
  drawEdges(payload);
  drawNodes(payload);
  drawLawfulSummary(payload);

  els.statusHost.textContent = payload.host.name;
  els.statusTick.textContent = String(payload.tick);
  els.statusNodes.textContent = String(payload.counts.occupied_nodes);
  els.statusEdges.textContent = String(payload.counts.occupied_edges);
  els.statusFaces.textContent = String(payload.counts.occupied_faces);
  els.statusTetra.textContent = String(payload.counts.occupied_tetra);

  const latest = payload.latest_delta;

  const tetraBirthRows = chronology.tetra_birth || [];

  els.readout.textContent = [
    `host              : ${payload.host.name}`,
    `hog               : ${payload.host.house_of_graphs_id}`,
    `gsym              : ${payload.host.graphsym_id}`,
    `status            : ${payload.host.status}`,
    `role              : ${payload.host.role}`,
    `diameter          : ${payload.host.diameter}`,
    `shells            : ${payload.host.distance_shells_from_anchor.join(', ')}`,
    ``,
    `tick              : ${payload.tick}`,
    `ticks_applied     : ${payload.ticks_applied.length}`,
    ``,
    `occupied_nodes    : ${payload.counts.occupied_nodes}`,
    `occupied_edges    : ${payload.counts.occupied_edges}`,
    `occupied_faces    : ${payload.counts.occupied_faces}`,
    `occupied_tetra    : ${payload.counts.occupied_tetra}`,
    ``,
    `frontier_nodes    : ${payload.counts.frontier_nodes}`,
    `frontier_edges    : ${payload.counts.frontier_edges}`,
    `frontier_faces    : ${payload.counts.frontier_faces}`,
    `frontier_tetra    : ${payload.counts.frontier_tetra}`,
    ``,
    `lawful_faces      : ${payload.lawful_cells.face_count}`,
    `lawful_tetra      : ${payload.lawful_cells.tetra_count}`,
    ``,
    `latest_primary    : ${latest.primary_node}`,
    `latest_g15        : ${latest.g15_vertex}`,
    `latest_g60_class  : ${latest.g60_class}`,
    `delta_nodes       : ${latest.delta_nodes.join(', ') || '-'}`,
    `delta_edges       : ${latest.delta_edges.join(', ') || '-'}`,
    ``,
    `tetra_births`,
    ...tetraBirthRows.map((row) => `  ${row.name || row.tetra} @ tick ${row.birth_tick ?? '-' } :: ${row.tetra}`),
    ``,
    `occupied_face_ids`,
    ...payload.occupied.faces.map((x) => `  ${x}`),
    ``,
    `occupied_tetra_ids`,
    ...payload.occupied.tetra.map((x) => `  ${x}`),
  ].join('\n');
}

async function fetchPayload(tick) {
  const [occRes, chrRes] = await Promise.all([
    fetch(`/frontier/api/g60-occupancy/${tick}`, { cache: 'no-store' }),
    fetch(`/frontier/api/g60-chronology/${tick}`, { cache: 'no-store' }),
  ]);
  if (!occRes.ok) throw new Error(`occupancy fetch failed: ${occRes.status}`);
  if (!chrRes.ok) throw new Error(`chronology fetch failed: ${chrRes.status}`);
  return {
    occupancy: await occRes.json(),
    chronology: await chrRes.json(),
  };
}

async function setTick(nextTick) {
  state.tick = Math.max(1, Math.min(24, nextTick));
  state.payload = await fetchPayload(state.tick);
  render(state.payload);
}

els.tickPrev.addEventListener('click', async () => {
  try { await setTick(state.tick - 1); } catch (err) { console.error(err); }
});

els.tickNext.addEventListener('click', async () => {
  try { await setTick(state.tick + 1); } catch (err) { console.error(err); }
});

(async function boot() {
  try {
    await setTick(1);
  } catch (err) {
    console.error(err);
    els.readout.textContent = String(err);
  }
})();
