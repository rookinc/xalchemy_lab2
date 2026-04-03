import { TETRA_FOLD_LADDER } from '/assets/spinor/tetra_fold_ladder.js';

const els = {
  ghostUpstairsFacePolys: document.getElementById('ghost-upstairs-face-polys'),
  ghostUpstairsEdgeLines: document.getElementById('ghost-upstairs-edge-lines'),
  ghostUpstairsMarkLayer: document.getElementById('ghost-upstairs-mark-layer'),

  ghostDownstairsFacePolys: document.getElementById('ghost-downstairs-face-polys'),
  ghostDownstairsEdgeLines: document.getElementById('ghost-downstairs-edge-lines'),

  correspondenceLines: document.getElementById('correspondence-lines'),

  upstairsFacePolys: document.getElementById('upstairs-face-polys'),
  upstairsEdgeLines: document.getElementById('upstairs-edge-lines'),
  upstairsMarkLayer: document.getElementById('upstairs-mark-layer'),
  upstairsAnchorDots: document.getElementById('upstairs-anchor-dots'),
  upstairsAnchorLabels: document.getElementById('upstairs-anchor-labels'),

  downstairsFacePolys: document.getElementById('downstairs-face-polys'),
  downstairsEdgeLines: document.getElementById('downstairs-edge-lines'),
  downstairsMarkLayer: document.getElementById('downstairs-mark-layer'),
  downstairsAnchorDots: document.getElementById('downstairs-anchor-dots'),
  downstairsAnchorLabels: document.getElementById('downstairs-anchor-labels'),

  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  toggleAnchors: document.getElementById('toggle-anchors'),
  toggleLabels: document.getElementById('toggle-labels'),
  toggleFaces: document.getElementById('toggle-faces'),
  toggleMarks: document.getElementById('toggle-marks'),
  toggleUpstairs: document.getElementById('toggle-upstairs'),
  toggleDownstairs: document.getElementById('toggle-downstairs'),
  toggleCorrespondence: document.getElementById('toggle-correspondence'),
  toggleDownstairsLabels: document.getElementById('toggle-downstairs-labels'),
  toggleGhost: document.getElementById('toggle-ghost'),
  metricStep: document.getElementById('metric-step'),
  metricIndex: document.getElementById('metric-index'),
  metricFaces: document.getElementById('metric-faces'),
  metricOpen: document.getElementById('metric-open'),
  readout: document.getElementById('fold-readout'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  index: 0,
  showAnchors: true,
  showLabels: true,
  showFaces: true,
  showMarks: true,
  showUpstairs: true,
  showDownstairs: true,
  showCorrespondence: true,
  showDownstairsLabels: true,
  showGhost: true,
};

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

function currentStep() {
  return TETRA_FOLD_LADDER.steps[state.index];
}

function previousStep() {
  if (state.index <= 0) return null;
  return TETRA_FOLD_LADDER.steps[state.index - 1];
}

function paletteForStep(step) {
  if (step.phase === 'objective') {
    return ['#ff4d4d', '#4dff88', '#4d88ff'];
  }
  return ['#00ffff', '#ff00ff', '#ffff00'];
}

function orientedFacePoints(facePoints, chirality) {
  return chirality === 'right' ? [...facePoints].reverse() : facePoints;
}

function projectPoint([x, y, z]) {
  const cx = 450;
  const cy = 320;
  const sx = 175;
  const sy = 165;
  return [
    cx + x * sx + z * 70,
    cy - y * sy + z * 35,
  ];
}

function projectPointUpstairs([x, y, z]) {
  const [px, py] = projectPoint([x, y, z]);
  return [px, py - 92];
}

function projectPointDownstairs([x, y, z]) {
  const [px, py] = projectPoint([x * 0.68, y * 0.52, z * 0.25]);
  return [px, py + 120];
}

function downstairsPointOf(step, keyOrPoint) {
  const pt = pointOf(step, keyOrPoint);
  return [pt[0], pt[1], pt[2] || 0];
}

function downstairsAnchorEntries(step) {
  const keys = Object.keys(step.anchors);
  if (keys.length === 0) return [];
  const chosen = [];
  const stride = Math.max(1, Math.floor(keys.length / 4));
  for (let i = 0; i < keys.length; i += stride) {
    chosen.push(keys[i]);
  }
  if (!chosen.includes(keys[keys.length - 1])) {
    chosen.push(keys[keys.length - 1]);
  }
  return chosen.slice(0, 5).map((k, i) => ({
    id: `d${i}`,
    source: k,
    point: downstairsPointOf(step, k),
  }));
}

function pointOf(step, keyOrPoint) {
  if (Array.isArray(keyOrPoint)) return keyOrPoint;
  return step.anchors[keyOrPoint];
}

function pathString(step, ids, projector = projectPointUpstairs) {
  return ids
    .map((id, i) => {
      const [x, y] = projector(pointOf(step, id));
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function polyString(step, ids, projector = projectPointUpstairs) {
  return ids
    .map((id) => {
      const [x, y] = projector(pointOf(step, id));
      return `${x},${y}`;
    })
    .join(' ');
}

function drawGhost(step) {
  els.ghostUpstairsFacePolys.textContent = '';
  els.ghostUpstairsEdgeLines.textContent = '';
  els.ghostUpstairsMarkLayer.textContent = '';
  els.ghostDownstairsFacePolys.textContent = '';
  els.ghostDownstairsEdgeLines.textContent = '';

  if (!state.showGhost || !step) return;

  if (state.showUpstairs && state.showFaces) {
    const palette = paletteForStep(step);
    step.faces.forEach((face, i) => {
      const poly = svgEl('polygon', {
        points: polyString(step, orientedFacePoints(face.points, step.chirality), projectPointUpstairs),
        class: 'ghost-face-poly',
        fill: palette[i % palette.length],
      });
      els.ghostUpstairsFacePolys.appendChild(poly);
    });
  }

  if (state.showUpstairs) {
    for (const [a, b] of step.edges) {
      const path = svgEl('path', {
        d: pathString(step, [a, b], projectPointUpstairs),
        class: 'ghost-edge-line',
      });
      els.ghostUpstairsEdgeLines.appendChild(path);
    }
  }

  if (state.showUpstairs && state.showMarks) {
    for (const mark of step.marks || []) {
      if (mark.kind === 'number') {
        const [x, y] = projectPointUpstairs(mark.at);
        const t = svgEl('text', {
          x,
          y,
          class: 'ghost-mark-label',
        });
        t.textContent = mark.label;
        els.ghostUpstairsMarkLayer.appendChild(t);
      }
    }
  }

  if (state.showDownstairs) {
    const ds = downstairsAnchorEntries(step);
    if (ds.length >= 3 && state.showFaces) {
      const poly = svgEl('polygon', {
        points: ds.slice(0, 3).map((row) => {
          const [x, y] = projectPointDownstairs(row.point);
          return `${x},${y}`;
        }).join(' '),
        class: 'ghost-face-poly',
        fill: 'rgba(138,180,255,0.18)',
      });
      els.ghostDownstairsFacePolys.appendChild(poly);
    }

    for (let i = 0; i < ds.length - 1; i += 1) {
      const [x1, y1] = projectPointDownstairs(ds[i].point);
      const [x2, y2] = projectPointDownstairs(ds[i + 1].point);
      const path = svgEl('path', {
        d: `M ${x1} ${y1} L ${x2} ${y2}`,
        class: 'ghost-edge-line',
      });
      els.ghostDownstairsEdgeLines.appendChild(path);
    }

    const centroid = [0, 0, 0];
    const [cx, cy] = projectPointDownstairs(centroid);
    const [nx, ny] = projectPointDownstairs([0, 0.85, 0]);
    const spine = svgEl('path', {
      d: `M ${cx} ${cy} L ${nx} ${ny}`,
      class: 'ghost-edge-line',
    });
    els.ghostDownstairsEdgeLines.appendChild(spine);
  }
}

function drawUpstairs(step) {
  els.upstairsFacePolys.textContent = '';
  els.upstairsEdgeLines.textContent = '';
  els.upstairsMarkLayer.textContent = '';
  els.upstairsAnchorDots.textContent = '';
  els.upstairsAnchorLabels.textContent = '';

  if (state.showUpstairs && state.showFaces) {
    const palette = paletteForStep(step);
    step.faces.forEach((face, i) => {
      const poly = svgEl('polygon', {
        points: polyString(step, orientedFacePoints(face.points, step.chirality), projectPointUpstairs),
        class: 'face-poly',
        fill: palette[i % palette.length],
      });
      els.upstairsFacePolys.appendChild(poly);
    });
  }

  if (state.showUpstairs) {
    for (const [a, b] of step.edges) {
      const path = svgEl('path', {
        d: pathString(step, [a, b], projectPointUpstairs),
        class: 'edge-line',
      });
      els.upstairsEdgeLines.appendChild(path);
    }
  }

  if (state.showUpstairs && state.showMarks) {
    for (const mark of step.marks || []) {
      if (mark.kind === 'number') {
        const [x, y] = projectPointUpstairs(mark.at);
        const t = svgEl('text', {
          x,
          y,
          class: 'mark-label region',
        });
        t.textContent = mark.label;
        els.upstairsMarkLayer.appendChild(t);
      } else if (mark.kind === 'dot') {
        const [x, y] = projectPointUpstairs(pointOf(step, mark.at));
        const c = svgEl('circle', {
          cx: x,
          cy: y,
          r: 5,
          fill: 'rgba(232,240,248,0.95)',
        });
        els.upstairsMarkLayer.appendChild(c);

        const t = svgEl('text', {
          x,
          y: y - 16,
          class: 'mark-label',
        });
        t.textContent = mark.label;
        els.upstairsMarkLayer.appendChild(t);
      }
    }
  }

  if (!state.showUpstairs || (!state.showAnchors && !state.showLabels)) {
    return;
  }

  for (const [id, pt] of Object.entries(step.anchors)) {
    const [x, y] = projectPointUpstairs(pt);

    if (state.showAnchors) {
      const dot = svgEl('circle', {
        cx: x,
        cy: y,
        r: 4,
        class: 'anchor-dot',
      });
      els.upstairsAnchorDots.appendChild(dot);
    }

    if (state.showLabels) {
      const label = svgEl('text', {
        x,
        y: y - 14,
        class: 'anchor-label',
      });
      label.textContent = id;
      els.upstairsAnchorLabels.appendChild(label);
    }
  }

  const band = svgEl('text', { x: 26, y: 34, class: 'band-label' });
  band.textContent = 'upstairs';
  els.upstairsAnchorLabels.appendChild(band);
}

function drawDownstairs(step) {
  els.downstairsFacePolys.textContent = '';
  els.downstairsEdgeLines.textContent = '';
  els.downstairsMarkLayer.textContent = '';
  els.downstairsAnchorDots.textContent = '';
  els.downstairsAnchorLabels.textContent = '';

  if (!state.showDownstairs) return;

  const ds = downstairsAnchorEntries(step);
  if (ds.length === 0) return;

  if (state.showFaces && ds.length >= 3) {
    const poly = svgEl('polygon', {
      points: ds.slice(0, 3).map((row) => {
        const [x, y] = projectPointDownstairs(row.point);
        return `${x},${y}`;
      }).join(' '),
      class: 'downstairs-face-poly',
      fill: 'rgba(138,180,255,0.30)',
    });
    els.downstairsFacePolys.appendChild(poly);
  }

  for (let i = 0; i < ds.length - 1; i += 1) {
    const [x1, y1] = projectPointDownstairs(ds[i].point);
    const [x2, y2] = projectPointDownstairs(ds[i + 1].point);
    const path = svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      class: 'downstairs-edge-line',
    });
    els.downstairsEdgeLines.appendChild(path);
  }

  const centroid = [0, 0, 0];
  const [cx, cy] = projectPointDownstairs(centroid);
  const [nx, ny] = projectPointDownstairs([0, 0.85, 0]);
  const spine = svgEl('path', {
    d: `M ${cx} ${cy} L ${nx} ${ny}`,
    class: 'downstairs-edge-line',
  });
  els.downstairsEdgeLines.appendChild(spine);

  for (const row of ds) {
    const [x, y] = projectPointDownstairs(row.point);

    if (state.showAnchors) {
      const dot = svgEl('circle', {
        cx: x,
        cy: y,
        r: 4,
        class: 'downstairs-anchor-dot',
      });
      els.downstairsAnchorDots.appendChild(dot);
    }

    if (state.showDownstairsLabels) {
      const label = svgEl('text', {
        x,
        y: y - 14,
        class: 'downstairs-anchor-label',
      });
      label.textContent = row.id;
      els.downstairsAnchorLabels.appendChild(label);
    }
  }

  if (state.showMarks) {
    const t = svgEl('text', {
      x: cx,
      y: cy + 20,
      class: 'downstairs-anchor-label',
    });
    t.textContent = 'q(step)';
    els.downstairsMarkLayer.appendChild(t);
  }

  const band = svgEl('text', { x: 26, y: 560, class: 'band-label' });
  band.textContent = 'downstairs';
  els.downstairsAnchorLabels.appendChild(band);
}

function drawCorrespondence(step) {
  els.correspondenceLines.textContent = '';
  if (!state.showCorrespondence || !state.showUpstairs || !state.showDownstairs) return;

  for (const row of downstairsAnchorEntries(step)) {
    const up = pointOf(step, row.source);
    const down = row.point;
    const [x1, y1] = projectPointUpstairs(up);
    const [x2, y2] = projectPointDownstairs(down);

    const line = svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      class: 'correspondence-line',
    });
    els.correspondenceLines.appendChild(line);
  }
}

function updateReadout(step) {
  els.metricStep.textContent = step.id;
  els.metricIndex.textContent = `${state.index + 1}/${TETRA_FOLD_LADDER.steps.length}`;
  els.metricFaces.textContent = String(step.metrics.faces);
  els.metricOpen.textContent = String(step.metrics.open_vertices);

  els.readout.textContent = [
    `id                : ${step.id}`,
    `label             : ${step.label}`,
    `phase             : ${step.phase}`,
    `chirality         : ${step.chirality}`,
    `note              : ${step.note}`,
    ``,
    `level             : ${step.metrics.level}`,
    `faces             : ${step.metrics.faces}`,
    `closed_vertices   : ${step.metrics.closed_vertices}`,
    `open_vertices     : ${step.metrics.open_vertices}`,
    `anchor_count      : ${Object.keys(step.anchors).length}`,
    `edge_count        : ${step.edges.length}`,
    `mark_count        : ${(step.marks || []).length}`,
    `upstairs          : ${state.showUpstairs}`,
    `downstairs        : ${state.showDownstairs}`,
    `correspondence    : ${state.showCorrespondence}`,
    `ghost_prev        : ${state.showGhost}`,
  ].join('\n');
}

function setButtonState() {
  els.toggleAnchors.classList.toggle('is-active', state.showAnchors);
  els.toggleLabels.classList.toggle('is-active', state.showLabels);
  els.toggleFaces.classList.toggle('is-active', state.showFaces);
  els.toggleMarks.classList.toggle('is-active', state.showMarks);
  els.toggleUpstairs.classList.toggle('is-active', state.showUpstairs);
  els.toggleDownstairs.classList.toggle('is-active', state.showDownstairs);
  els.toggleCorrespondence.classList.toggle('is-active', state.showCorrespondence);
  els.toggleDownstairsLabels.classList.toggle('is-active', state.showDownstairsLabels);
  els.toggleGhost.classList.toggle('is-active', state.showGhost);
}

function render() {
  const step = currentStep();
  const prev = previousStep();
  drawGhost(prev);
  drawCorrespondence(step);
  drawUpstairs(step);
  drawDownstairs(step);
  updateReadout(step);
  setButtonState();
}

els.prevBtn.addEventListener('click', () => {
  state.index = Math.max(0, state.index - 1);
  render();
});

els.nextBtn.addEventListener('click', () => {
  state.index = Math.min(TETRA_FOLD_LADDER.steps.length - 1, state.index + 1);
  render();
});

els.toggleAnchors.addEventListener('click', () => {
  state.showAnchors = !state.showAnchors;
  render();
});

els.toggleLabels.addEventListener('click', () => {
  state.showLabels = !state.showLabels;
  render();
});

els.toggleFaces.addEventListener('click', () => {
  state.showFaces = !state.showFaces;
  render();
});

els.toggleMarks.addEventListener('click', () => {
  state.showMarks = !state.showMarks;
  render();
});

els.toggleUpstairs.addEventListener('click', () => {
  state.showUpstairs = !state.showUpstairs;
  render();
});

els.toggleDownstairs.addEventListener('click', () => {
  state.showDownstairs = !state.showDownstairs;
  render();
});

els.toggleCorrespondence.addEventListener('click', () => {
  state.showCorrespondence = !state.showCorrespondence;
  render();
});

els.toggleDownstairsLabels.addEventListener('click', () => {
  state.showDownstairsLabels = !state.showDownstairsLabels;
  render();
});

els.toggleGhost.addEventListener('click', () => {
  state.showGhost = !state.showGhost;
  render();
});

render();
