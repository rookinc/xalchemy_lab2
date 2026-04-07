import {
  REGISTER,
  SOCKET_SLOT,
  spiralPoseForTick,
  angleForSlot,
  radiusForTick,
} from '/public/assets/spinor/frontier_grammar.js';

const els = {
  gridLayer: document.getElementById('grid-layer'),
  guideLayer: document.getElementById('guide-layer'),
  rayLayer: document.getElementById('ray-layer'),
  faceLayer: document.getElementById('face-layer'),
  edgeLayer: document.getElementById('edge-layer'),
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

function stagePoint(x, y) {
  const cx = 450;
  const cy = 320;
  const scale = 150;
  return [cx + x * scale, cy - y * scale];
}

function polarPoint(r, theta) {
  return [r * Math.cos(theta), r * Math.sin(theta)];
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

function drawGuides(maxTick) {
  els.guideLayer.textContent = '';
  for (let t = 1; t <= maxTick + 2; t += 1) {
    const r = radiusForTick(t);
    const [cx, cy] = stagePoint(0, 0);
    els.guideLayer.appendChild(svgEl('circle', {
      cx, cy, r: r * 150, class: t === maxTick + 2 ? 'guide-circle outer' : 'guide-circle',
    }));
  }
}

function poseAtTick(tick) {
  return spiralPoseForTick(tick);
}

function parseJoinIndex(join) {
  const m = /^t(\d+)r$/.exec(join || '');
  return m ? Number(m[1]) : null;
}

function drawRegisterAnchors(pose) {
  const ringR = 2.05;
  REGISTER.forEach((slot) => {
    const theta = angleForSlot(slot);
    const [x, y] = polarPoint(ringR, theta);
    const [sx, sy] = stagePoint(x, y);

    const isActive = slot === pose.slot;
    const isNext = slot === pose.next_slot;
    const isSocket = slot === SOCKET_SLOT;

    els.nodeLayer.appendChild(svgEl('circle', {
      cx: sx,
      cy: sy,
      r: isSocket ? 6 : 4.5,
      class: 'anchor-node',
      fill: isSocket
        ? 'rgba(255,235,110,0.95)'
        : isActive
        ? 'rgba(255,110,110,0.95)'
        : isNext
        ? 'rgba(255,90,220,0.92)'
        : 'rgba(180,210,255,0.82)',
      stroke: isSocket ? 'rgba(255,255,255,0.95)' : 'rgba(232,240,248,0.85)',
      'stroke-width': isSocket ? 2.5 : 2,
    }));

    const [lx, ly] = stagePoint(x * 1.10, y * 1.10);
    const t = svgEl('text', { x: lx, y: ly, class: 'slot-label' });
    t.textContent = isSocket ? `${slot}◉` : slot;
    els.labelLayer.appendChild(t);
  });
}

function drawRay(theta, cls) {
  const [x1, y1] = stagePoint(0, 0);
  const [x2, y2] = stagePoint(2.35 * Math.cos(theta), 2.35 * Math.sin(theta));
  els.rayLayer.appendChild(svgEl('line', { x1, y1, x2, y2, class: cls }));
}

function drawTriangle(center, a, b, clsFill, clsEdge) {
  const [cx, cy] = stagePoint(center[0], center[1]);
  const [x1, y1] = stagePoint(a[0], a[1]);
  const [x2, y2] = stagePoint(b[0], b[1]);

  els.faceLayer.appendChild(svgEl('polygon', {
    points: `${cx},${cy} ${x1},${y1} ${x2},${y2}`,
    class: clsFill,
  }));

  els.edgeLayer.appendChild(svgEl('line', { x1: cx, y1: cy, x2: x1, y2: y1, class: clsEdge }));
  els.edgeLayer.appendChild(svgEl('line', { x1: cx, y1: cy, x2: x2, y2: y2, class: clsEdge }));
  els.edgeLayer.appendChild(svgEl('line', { x1, y1, x2, y2, class: clsEdge }));
}

function drawHistory(currentTick) {
  const start = Math.max(1, currentTick - 3);
  for (let t = start; t < currentTick; t += 1) {
    const pose = poseAtTick(t);
    const center = [0, 0];
    const closedPt = polarPoint(pose.r_closed, pose.theta_closed);
    const openPt = polarPoint(pose.r_open, pose.theta_open);
    drawRay(pose.theta_closed, 'history-ray');
    drawTriangle(center, closedPt, openPt, 'ghost-tri', 'history-edge');
  }
}

function realizedFamily(currentTick) {
  const down = [];
  const up = [];
  const start = Math.max(1, currentTick - 2);

  for (let t = start; t <= currentTick; t += 1) {
    const pose = poseAtTick(t);
    const closedPt = polarPoint(pose.r_closed, pose.theta_closed);
    const openPt = polarPoint(pose.r_open, pose.theta_open);

    down.push({
      id: pose.frontier.closed.id,
      phase: pose.frontier.closed.phase,
      pt: closedPt,
      tick: t,
    });

    up.push({
      id: pose.frontier.open.id,
      phase: pose.frontier.open.phase,
      pt: openPt,
      tick: t,
    });
  }

  return { down, up };
}

function drawRealizedFamilies(currentTick, currentPose) {
  const fam = realizedFamily(currentTick);

  fam.down.forEach((row) => {
    if (row.id === currentPose.frontier.closed.id) return;
    const [x, y] = stagePoint(row.pt[0], row.pt[1]);
    els.nodeLayer.appendChild(svgEl('circle', {
      cx: x, cy: y, r: 10, class: 'realized-down-node',
    }));
  });

  fam.up.forEach((row) => {
    if (row.id === currentPose.frontier.open.id) return;
    const [x, y] = stagePoint(row.pt[0], row.pt[1]);
    els.nodeLayer.appendChild(svgEl('circle', {
      cx: x, cy: y, r: 9, class: 'realized-up-node',
    }));
  });

  for (let i = 0; i < fam.down.length; i += 1) {
    const d = fam.down[i];
    const u = fam.up[i];
    if (!d || !u) continue;

    if (d.id === currentPose.frontier.closed.id && u.id === currentPose.frontier.open.id) continue;

    drawTriangle([0, 0], d.pt, u.pt, 'bilateral-tri', 'bilateral-edge');
  }

  const dLab = svgEl('text', { x: 140, y: 500, class: 'domain-label' });
  dLab.textContent = 'downstairs realized';
  els.labelLayer.appendChild(dLab);

  const uLab = svgEl('text', { x: 140, y: 120, class: 'domain-label' });
  uLab.textContent = 'upstairs realized';
  els.labelLayer.appendChild(uLab);

  return fam;
}

function drawNodes(center, closedPt, openPt, pose) {
  const [cx, cy] = stagePoint(center[0], center[1]);
  const [x1, y1] = stagePoint(closedPt[0], closedPt[1]);
  const [x2, y2] = stagePoint(openPt[0], openPt[1]);

  els.nodeLayer.appendChild(svgEl('circle', { cx, cy, r: 7, class: 'center-node' }));
  els.nodeLayer.appendChild(svgEl('circle', { cx: x1, cy: y1, r: 18, class: 'closed-node' }));
  els.nodeLayer.appendChild(svgEl('circle', { cx: x2, cy: y2, r: 16, class: 'open-node' }));

  const c = svgEl('text', { x: cx, y: cy - 18, class: 'label' });
  c.textContent = 'I';
  els.labelLayer.appendChild(c);

  const cl = svgEl('text', { x: x1, y: y1, class: 'node-label' });
  cl.textContent = pose.frontier.closed.id;
  els.labelLayer.appendChild(cl);

  const cls = svgEl('text', { x: x1, y: y1 + 28, class: 'node-sub' });
  cls.textContent = `${pose.frontier.closed.phase} · ${pose.payload_closed}`;
  els.labelLayer.appendChild(cls);

  const op = svgEl('text', { x: x2, y: y2, class: 'node-label' });
  op.textContent = pose.frontier.open.id;
  els.labelLayer.appendChild(op);

  const ops = svgEl('text', { x: x2, y: y2 + 26, class: 'node-sub' });
  ops.textContent = `${pose.frontier.open.phase} · ${pose.payload_open}`;
  els.labelLayer.appendChild(ops);
}

function drawJoinLabel(pose, closedPt, openPt) {
  const mx = (closedPt[0] + openPt[0]) / 2;
  const my = (closedPt[1] + openPt[1]) / 2;
  const [sx, sy] = stagePoint(mx * 0.92, my * 0.92);

  els.nodeLayer.appendChild(svgEl('circle', {
    cx: sx, cy: sy - 8, r: 4.5, class: 'join-node',
  }));

  const t = svgEl('text', { x: sx + 22, y: sy - 10, class: 'join-label' });
  t.textContent = pose.join;
  els.labelLayer.appendChild(t);
}

function drawCarryPath(pose, closedPt, openPt) {
  const prevIndex = parseJoinIndex(pose.join);
  if (prevIndex == null) return;

  const prevPose = poseAtTick(prevIndex);
  const prevClosed = polarPoint(prevPose.r_closed, prevPose.theta_closed);

  const [x0, y0] = stagePoint(prevClosed[0], prevClosed[1]);
  const [x1, y1] = stagePoint(closedPt[0], closedPt[1]);
  const [x2, y2] = stagePoint(openPt[0], openPt[1]);

  els.edgeLayer.appendChild(svgEl('path', {
    d: `M ${x0} ${y0} Q ${(x0 + x1)/2} ${(y0 + y1)/2 - 24} ${x1} ${y1}`,
    class: 'carry-link',
  }));

  els.edgeLayer.appendChild(svgEl('path', {
    d: `M ${x1} ${y1} Q ${(x1 + x2)/2} ${(y1 + y2)/2 - 18} ${x2} ${y2}`,
    class: 'carry-link-next',
  }));
}

function updateStatus(pose) {
  els.statusTick.textContent = String(state.tick);
  els.statusSlot.textContent = pose.slot;
  els.statusNextSlot.textContent = pose.next_slot;
  els.statusJoin.textContent = pose.join;
  els.statusSheet.textContent = pose.sheet;
}

function updateReadout(pose, fam) {
  els.readout.textContent = [
    `tick          : ${state.tick}`,
    `slot          : ${pose.slot}`,
    `next_slot     : ${pose.next_slot}`,
    `join          : ${pose.join}`,
    `sheet         : ${pose.sheet}`,
    `socket        : T`,
    `closed_id     : ${pose.frontier.closed.id}`,
    `closed_phase  : ${pose.frontier.closed.phase}`,
    `closed_pay    : ${pose.payload_closed}`,
    `open_id       : ${pose.frontier.open.id}`,
    `open_phase    : ${pose.frontier.open.phase}`,
    `open_pay      : ${pose.payload_open}`,
    `theta_closed  : ${pose.theta_closed.toFixed(3)}`,
    `theta_open    : ${pose.theta_open.toFixed(3)}`,
    `r_closed      : ${pose.r_closed.toFixed(3)}`,
    `r_open        : ${pose.r_open.toFixed(3)}`,
    `register      : ${REGISTER.join('')}`,
    `active_socket : ${SOCKET_SLOT}`,
    ``,
    `downstairs    : ${fam.down.map((x) => x.id).join(', ')}`,
    `upstairs      : ${fam.up.map((x) => x.id).join(', ')}`,
  ].join('\n');
}

function render() {
  els.gridLayer.textContent = '';
  els.guideLayer.textContent = '';
  els.rayLayer.textContent = '';
  els.faceLayer.textContent = '';
  els.edgeLayer.textContent = '';
  els.nodeLayer.textContent = '';
  els.labelLayer.textContent = '';

  drawGrid();

  const pose = poseAtTick(state.tick);
  const center = [0, 0];
  const closedPt = polarPoint(pose.r_closed, pose.theta_closed);
  const openPt = polarPoint(pose.r_open, pose.theta_open);

  drawGuides(state.tick);
  drawHistory(state.tick);
  const fam = drawRealizedFamilies(state.tick, pose);
  drawRegisterAnchors(pose);
  drawRay(pose.theta_closed, 'ray-line');
  drawRay(pose.theta_open, 'ray-next');
  drawTriangle(center, closedPt, openPt, 'witness-tri closed-fill', 'witness-tri');
  els.faceLayer.appendChild(svgEl('polygon', {
    points: `${stagePoint(0,0).join(',')} ${stagePoint(openPt[0], openPt[1]).join(',')} ${stagePoint(closedPt[0], closedPt[1]).join(',')}`,
    class: 'witness-tri open-fill',
  }));
  drawCarryPath(pose, closedPt, openPt);
  drawNodes(center, closedPt, openPt, pose);
  drawJoinLabel(pose, closedPt, openPt);
  updateStatus(pose);
  updateReadout(pose, fam);
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
