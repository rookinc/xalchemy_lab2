const FRAME_MODULUS = 15;

function normFrame(n) {
  return ((n % FRAME_MODULUS) + FRAME_MODULUS) % FRAME_MODULUS;
}

function degToRad(d) {
  return (d * Math.PI) / 180;
}

function rotateY([x, y, z], a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    x * c + z * s,
    y,
    -x * s + z * c,
  ];
}

function rotateZ([x, y, z], a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    x * c - y * s,
    x * s + y * c,
    z,
  ];
}

function translate([x, y, z], [dx, dy, dz]) {
  return [x + dx, y + dy, z + dz];
}

function scale([x, y, z], k) {
  return [x * k, y * k, z * k];
}

function centroid(points) {
  const n = points.length || 1;
  let sx = 0, sy = 0, sz = 0;
  for (const [x, y, z] of points) {
    sx += x; sy += y; sz += z;
  }
  return [sx / n, sy / n, sz / n];
}

function makeTrianglePoints(size = 1) {
  const h = Math.sqrt(3) / 2;
  return [
    [0, size, 0],
    [-h * size, -0.5 * size, 0],
    [h * size, -0.5 * size, 0],
  ];
}

function closeLoop(points) {
  if (!points.length) return [];
  return [...points, points[0]];
}

function frameAngle(frame) {
  return degToRad((360 / FRAME_MODULUS) * normFrame(frame));
}

function phaseTilt(phase) {
  return phase === 1 ? degToRad(18) : degToRad(-18);
}

function sheetOffset(sheet) {
  return sheet === '-' ? -0.18 : 0.18;
}

function buildBaseMotif(state) {
  const { frame, phase, sheet } = state;

  const outerBase = makeTrianglePoints(1.0);
  const innerBase = makeTrianglePoints(0.62);
  const partnerBase = makeTrianglePoints(0.62);

  const yaw = frameAngle(frame);
  const tilt = phaseTilt(phase);
  const zShift = sheetOffset(sheet);

  const outer = outerBase
    .map((p) => rotateZ(p, tilt))
    .map((p) => rotateY(p, yaw));

  const inner = innerBase
    .map((p) => rotateZ(p, -tilt * 0.7))
    .map((p) => translate(p, [0, 0.12, zShift]))
    .map((p) => rotateY(p, yaw + degToRad(8)));

  const partner = partnerBase
    .map(([x, y, z]) => [-x, y, z])
    .map((p) => rotateZ(p, tilt * 0.5))
    .map((p) => translate(p, [0, -0.08, -zShift]))
    .map((p) => rotateY(p, yaw - degToRad(8)));

  const cOuter = centroid(outer);
  const cInner = centroid(inner);
  const cPartner = centroid(partner);

  const scaffold = [
    [0, -1.2, 0],
    [0, 1.2, 0],
  ];

  return {
    anchors: {
      outer: outer.map((p, i) => ({ id: `O${i}`, point: p })),
      inner: inner.map((p, i) => ({ id: `I${i}`, point: p })),
      partner: partner.map((p, i) => ({ id: `P${i}`, point: p })),
      centers: [
        { id: 'C0', point: cOuter },
        { id: 'C1', point: cInner },
        { id: 'C2', point: cPartner },
      ],
    },
    groups: {
      outer,
      inner,
      partner,
      scaffold,
    },
  };
}

function polylinePrimitive(id, points, style = {}) {
  return {
    type: 'polyline',
    id,
    points,
    style,
  };
}

function segmentPrimitive(id, a, b, style = {}) {
  return {
    type: 'segment',
    id,
    a,
    b,
    style,
  };
}

function labelPrimitive(id, point, text, style = {}) {
  return {
    type: 'label',
    id,
    point,
    text,
    style,
  };
}

export function buildSpinorScene(state, options = {}) {
  const {
    showLabels = false,
    showScaffold = true,
  } = options;

  const motif = buildBaseMotif(state);
  const primitives = [];

  primitives.push(
    polylinePrimitive(
      'outer-loop',
      closeLoop(motif.groups.outer),
      { family: 'outer', colorHint: 'outer', opacity: 1.0 }
    )
  );

  primitives.push(
    polylinePrimitive(
      'inner-loop',
      closeLoop(motif.groups.inner),
      { family: 'inner', colorHint: 'inner', opacity: 0.85 }
    )
  );

  primitives.push(
    polylinePrimitive(
      'partner-loop',
      closeLoop(motif.groups.partner),
      { family: 'partner', colorHint: 'partner', opacity: 0.85 }
    )
  );

  primitives.push(
    segmentPrimitive(
      'coupler-outer-inner',
      motif.groups.outer[0],
      motif.groups.inner[0],
      { family: 'coupler', colorHint: 'coupler', opacity: 0.7 }
    )
  );

  primitives.push(
    segmentPrimitive(
      'coupler-outer-partner',
      motif.groups.outer[2],
      motif.groups.partner[2],
      { family: 'coupler', colorHint: 'coupler', opacity: 0.7 }
    )
  );

  if (showScaffold) {
    primitives.push(
      polylinePrimitive(
        'scaffold-axis',
        motif.groups.scaffold,
        { family: 'scaffold', colorHint: 'scaffold', opacity: 0.35 }
      )
    );
  }

  if (showLabels) {
    for (const row of motif.anchors.outer) {
      primitives.push(labelPrimitive(`label-${row.id}`, row.point, row.id, { family: 'label' }));
    }
    for (const row of motif.anchors.inner) {
      primitives.push(labelPrimitive(`label-${row.id}`, row.point, row.id, { family: 'label' }));
    }
    for (const row of motif.anchors.partner) {
      primitives.push(labelPrimitive(`label-${row.id}`, row.point, row.id, { family: 'label' }));
    }
  }

  return {
    kind: 'spinor-scene',
    state: { ...state },
    cameraHint: {
      preset: 'iso',
      dist: 4.5,
      yaw: 0.98,
      pitch: 0.31,
    },
    styleHints: {
      outer: { colorHint: 'outer' },
      inner: { colorHint: 'inner' },
      partner: { colorHint: 'partner' },
      scaffold: { colorHint: 'scaffold' },
      coupler: { colorHint: 'coupler' },
    },
    primitives,
    history: [],
  };
}

export function buildSpinorHistoryScene(historyStates, options = {}) {
  const scenes = historyStates.map((state, i) => {
    const scene = buildSpinorScene(state, options);
    const fade = Math.max(0.08, Math.min(1, (i + 1) / Math.max(1, historyStates.length)));

    scene.primitives = scene.primitives.map((p) => ({
      ...p,
      style: {
        ...(p.style || {}),
        opacity: ((p.style?.opacity ?? 1) * fade),
      },
    }));

    return scene;
  });

  return {
    kind: 'spinor-history-scene',
    count: scenes.length,
    scenes,
  };
}

export function applyOpToSpinorState(state, op) {
  const next = { ...state };

  if (op === 'tau') {
    next.frame = normFrame(next.frame + 1);
    return next;
  }
  if (op === 'tau_inv') {
    next.frame = normFrame(next.frame - 1);
    return next;
  }
  if (op === 'mu') {
    next.phase = next.phase === 0 ? 1 : 0;
    return next;
  }
  if (op === 'g15') {
    next.sheet = next.sheet === '+' ? '-' : '+';
    return next;
  }
  if (op === 'g30') {
    return next;
  }

  throw new Error(`Unknown spinor op: ${op}`);
}

export function buildSpinorStateHistory(startState, ops, steps = 1) {
  const out = [{ ...startState }];
  let cur = { ...startState };

  for (let i = 0; i < steps; i += 1) {
    const op = ops[i % ops.length];
    cur = applyOpToSpinorState(cur, op);
    out.push({ ...cur });
  }

  return out;
}
