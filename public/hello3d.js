import * as THREE from '/assets/vendor/three/three.module.js';
import { OrbitControls } from '/assets/vendor/three/OrbitControls.js';

const canvas = document.getElementById('stage');
const overlayCanvas = document.getElementById('overlay-canvas');
const overlayCtx = overlayCanvas.getContext('2d');
const labelLayer = document.getElementById('label-layer');

const metricTick = document.getElementById('metric-tick');
const metricDist = document.getElementById('metric-dist');
const metricYaw = document.getElementById('metric-yaw');
const metricPitch = document.getElementById('metric-pitch');
const metricView = document.getElementById('metric-view');
const metricFace = document.getElementById('metric-face');
const metricVLabels = document.getElementById('metric-vlabels');
const metricFLabels = document.getElementById('metric-flabels');

const resetBtn = document.getElementById('reset-camera');
const stepLeftBtn = document.getElementById('step-left');
const stepRightBtn = document.getElementById('step-right');
const spinBtn = document.getElementById('toggle-spin');
const toggleVLabelsBtn = document.getElementById('toggle-vlabels');
const toggleFLabelsBtn = document.getElementById('toggle-flabels');
const toggleRegisterBtn = document.getElementById('toggle-register');
const toggleLiveG15Btn = document.getElementById('toggle-live-g15');
const stepG15PrevBtn = document.getElementById('step-g15-prev');
const stepG15NextBtn = document.getElementById('step-g15-next');

const camIsoBtn = document.getElementById('cam-iso');
const camFrontBtn = document.getElementById('cam-front');
const camTopBtn = document.getElementById('cam-top');

const faceOpacityInput = document.getElementById('face-opacity');
const innerOpacityInput = document.getElementById('inner-opacity');
const glowOpacityInput = document.getElementById('glow-opacity');
const wireOpacityInput = document.getElementById('wire-opacity');
const sectorHud = document.getElementById('sector-hud');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x081019);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0.12, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.82);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.25);
key.position.set(4, 5, 3);
scene.add(key);

const rim = new THREE.DirectionalLight(0x88aaff, 0.42);
rim.position.set(-3, 2, -4);
scene.add(rim);

const grid = new THREE.GridHelper(12, 24, 0x2f5d9a, 0x1d3557);
grid.position.y = -1.15;
scene.add(grid);

function createCanonicalTetraGeometry(scale = 1.1) {
  const raw = [
    new THREE.Vector3( 1,  1,  1),
    new THREE.Vector3(-1, -1,  1),
    new THREE.Vector3(-1,  1, -1),
    new THREE.Vector3( 1, -1, -1),
  ];

  const baseRadius = raw[0].length();
  const s = scale / baseRadius;
  const vertices = raw.map(v => v.clone().multiplyScalar(s));

  const positions = [];
  const faces = [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2],
  ];

  for (const [a, b, c] of faces) {
    const va = vertices[a];
    const vb = vertices[b];
    const vc = vertices[c];
    positions.push(
      va.x, va.y, va.z,
      vb.x, vb.y, vb.z,
      vc.x, vc.y, vc.z,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.computeVertexNormals();

  geometry.userData.vertices = vertices.map((v, i) => ({
    id: `v${i}`,
    x: v.x,
    y: v.y,
    z: v.z,
  }));

  geometry.userData.faces = faces.map((f, i) => ({
    id: `f${i}`,
    verts: [...f],
  }));

  return geometry;
}

const tetraGeometry = createCanonicalTetraGeometry(1.1);

const tetraMaterial = new THREE.MeshStandardMaterial({
  color: 0x8ab4ff,
  transparent: true,
  opacity: 0.78,
  metalness: 0.08,
  roughness: 0.32,
  flatShading: true,
  side: THREE.DoubleSide,
});

const innerMaterial = new THREE.MeshStandardMaterial({
  color: 0xffa8d6,
  transparent: true,
  opacity: 0.78,
  metalness: 0.02,
  roughness: 0.42,
  flatShading: true,
  side: THREE.DoubleSide,
});

const tetra = new THREE.Mesh(tetraGeometry, tetraMaterial);
scene.add(tetra);

const inner = new THREE.Mesh(
  createCanonicalTetraGeometry(0.92),
  innerMaterial
);
scene.add(inner);

const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(tetraGeometry),
  new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0,
  })
);
tetra.add(edges);

const glow = new THREE.Mesh(
  new THREE.CircleGeometry(1.5, 48),
  new THREE.MeshBasicMaterial({
    color: 0x8ab4ff,
    transparent: true,
    opacity: 0.08,
  })
);
glow.rotation.x = -Math.PI / 2;
glow.position.y = -1.13;
scene.add(glow);

const canonicalVertices = tetraGeometry.userData.vertices.map(v =>
  new THREE.Vector3(v.x, v.y, v.z)
);

const TETRA_EDGE_REGISTER = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];


function petersenEdgeToFaceSlot(edge, phase, sheet) {
  if (!Array.isArray(edge) || edge.length !== 2) return 0;
  const a = Number(edge[0]) || 0;
  const b = Number(edge[1]) || 0;

  // First-pass structured register:
  // - edge sum chooses a base face
  // - phase toggles the face family
  // - sheet flips orientation within that family
  let slot = (a + b) % 4;
  if (phase === 1) slot = (slot + 1) % 4;
  if (sheet === '-') slot = (slot + 2) % 4;
  return slot;
}

function sectorEdgesToTetraSlots(edgeIndices, phase, sheet) {
  const raw = (edgeIndices || [])
    .slice(0, 6)
    .map((edgeIndex) => {
      const base = (Number(edgeIndex) || 0) % 6;
      const phaseShift = phase === 1 ? 1 : 0;
      const sheetShift = sheet === '-' ? 2 : 0;
      return (base + phaseShift + sheetShift) % 6;
    });

  return raw;
}


const canonicalFaces = tetraGeometry.userData.faces.map(face => {
  const verts = face.verts.map(idx => canonicalVertices[idx].clone());
  const centroid = new THREE.Vector3();
  verts.forEach(v => centroid.add(v));
  centroid.multiplyScalar(1 / 3);
  return {
    id: face.id,
    verts: face.verts,
    centroid,
  };
});

const faceAccentGeometry = canonicalFaces.map((face) => {
  const verts = face.verts.map(idx => canonicalVertices[idx].clone().multiplyScalar(0.985));
  const positions = [];
  positions.push(
    verts[0].x, verts[0].y, verts[0].z,
    verts[1].x, verts[1].y, verts[1].z,
    verts[2].x, verts[2].y, verts[2].z,
  );
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
});

const faceAccentMeshes = faceAccentGeometry.map((geometry, i) => {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0x8ab4ff,
      transparent: true,
      opacity: 0.0,
      metalness: 0.05,
      roughness: 0.28,
      side: THREE.DoubleSide,
    })
  );
  tetra.add(mesh);
  return mesh;
});

const tetraEdgeAccentLines = TETRA_EDGE_REGISTER.map(([a, b]) => {
  const va = canonicalVertices[a];
  const vb = canonicalVertices[b];
  const geometry = new THREE.BufferGeometry().setFromPoints([va.clone(), vb.clone()]);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0x8ab4ff,
      transparent: true,
      opacity: 0.0,
    })
  );
  tetra.add(line);
  return line;
});


const vertexLabelElements = tetraGeometry.userData.vertices.map((v, i) => {
  const el = document.createElement('div');
  el.className = 'stage-label vertex-label';
  el.textContent = `v${i}`;
  labelLayer.appendChild(el);
  return el;
});

const faceLabelElements = canonicalFaces.map((face, i) => {
  const el = document.createElement('div');
  el.className = 'stage-label face-label';
  el.textContent = `f${i}`;
  labelLayer.appendChild(el);
  return el;
});

const witnessRegister = {
  order: ["W", "X", "Y", "Z", "T", "I"],
  closedWord: ["W", "X", "Y", "Z", "T", "I", "W"],
  diads: [["W", "X"], ["Y", "Z"], ["T", "I"]],
  couplers: [["X", "Y"], ["Z", "T"], ["I", "W"]],
  slots: {
    W: "o0",
    X: "o1",
    Y: "o2",
    Z: "s2",
    T: "t0",
    I: "s0",
  }
};

const registerAnchors = {
  W: new THREE.Vector3(-1.30,  0.95,  0.10),
  X: new THREE.Vector3(-0.45,  1.22,  0.72),
  Y: new THREE.Vector3( 0.62,  1.05,  0.80),
  Z: new THREE.Vector3( 1.24,  0.12,  0.18),
  T: new THREE.Vector3( 0.42, -0.98, -0.72),
  I: new THREE.Vector3(-0.92, -0.72, -0.44),
};

const registerLabelElements = {};
for (const key of witnessRegister.order) {
  const el = document.createElement('div');
  el.className = 'stage-label register-label';
  el.textContent = `${key}:${witnessRegister.slots[key]}`;
  labelLayer.appendChild(el);
  registerLabelElements[key] = el;
}

let spinning = true;
let tick = 0;
let currentPreset = 'iso';
let vertexLabelsVisible = true;
let faceLabelsVisible = true;
let registerVisible = true;
let liveG15Enabled = false;
let liveG15Frame = 0;
let liveG15Phase = 0;
let liveG15Sheet = '+';
let lastG15Payload = null;
let liveStateChannel = null;
const LIVE_STATE_KEY = 'lab2_live_state_v1';

function resize() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  overlayCanvas.width = Math.floor(width * dpr);
  overlayCanvas.height = Math.floor(height * dpr);
  overlayCanvas.style.width = `${width}px`;
  overlayCanvas.style.height = `${height}px`;
  overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setActivePreset(name) {
  currentPreset = name;
  metricView.textContent = name[0].toUpperCase() + name.slice(1);
  [camIsoBtn, camFrontBtn, camTopBtn].forEach(btn => btn.classList.remove('is-active'));
  if (name === 'iso') camIsoBtn.classList.add('is-active');
  if (name === 'front') camFrontBtn.classList.add('is-active');
  if (name === 'top') camTopBtn.classList.add('is-active');
}

function setVertexLabelsVisible(flag) {
  vertexLabelsVisible = flag;
  metricVLabels.textContent = flag ? 'on' : 'off';
  toggleVLabelsBtn.classList.toggle('is-active', flag);
  toggleVLabelsBtn.textContent = flag ? 'Vertex labels' : 'Vertex labels off';
  vertexLabelElements.forEach(el => el.classList.toggle('is-hidden', !flag));
}

function setFaceLabelsVisible(flag) {
  faceLabelsVisible = flag;
  metricFLabels.textContent = flag ? 'on' : 'off';
  toggleFLabelsBtn.classList.toggle('is-active-face', flag);
  toggleFLabelsBtn.textContent = flag ? 'Face labels' : 'Face labels off';
  faceLabelElements.forEach(el => el.classList.toggle('is-hidden', !flag));
}

function setRegisterVisible(flag) {
  registerVisible = flag;
  toggleRegisterBtn.classList.toggle('is-active-reg', flag);
  toggleRegisterBtn.textContent = flag ? 'WXYZTIW overlay' : 'WXYZTIW overlay off';
  Object.values(registerLabelElements).forEach(el => el.classList.toggle('is-hidden', !flag));
}

function applyCameraPreset(name) {
  if (name === 'front') {
    camera.position.set(0, 0.35, 4.4);
    controls.target.set(0, 0.10, 0);
  } else if (name === 'top') {
    camera.position.set(0, 4.8, 0.01);
    controls.target.set(0, 0.02, 0);
  } else {
    camera.position.set(2.8, 2.2, 3.6);
    controls.target.set(0, 0.12, 0);
  }
  controls.update();
  setActivePreset(name);
}

function resetCamera() {
  applyCameraPreset(currentPreset);
}

function applyFaceOpacity() {
  tetraMaterial.opacity = Number(faceOpacityInput.value) / 100;
  metricFace.textContent = `${Math.round(tetraMaterial.opacity * 100)}%`;
}

function applyInnerOpacity() {
  innerMaterial.opacity = Number(innerOpacityInput.value) / 100;
}

function applyGlowOpacity() {
  glow.material.opacity = Number(glowOpacityInput.value) / 100;
}

function applyWireOpacity() {
  edges.material.opacity = Number(wireOpacityInput.value) / 100;
}

function stepRotation(dir) {
  tetra.rotation.y += 0.18 * dir;
  tetra.rotation.x += 0.05 * dir;
  inner.rotation.y += 0.14 * dir;
  inner.rotation.x += 0.04 * dir;
}

function updateTelemetry() {
  const dx = camera.position.x - controls.target.x;
  const dy = camera.position.y - controls.target.y;
  const dz = camera.position.z - controls.target.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));

  const liveStep = lastG15Payload && lastG15Payload.input_state
    ? Number(lastG15Payload.input_state.frame) || 0
    : 0;

  metricTick.textContent = String(liveStep);
  metricDist.textContent = dist.toFixed(2);
  metricYaw.textContent = yaw.toFixed(2);
  metricPitch.textContent = pitch.toFixed(2);
}

function placeLabel(el, worldPoint, visibleFlag) {
  if (!visibleFlag) {
    el.classList.add('is-hidden');
    return null;
  }

  const projected = worldPoint.clone().project(camera);
  const visible = projected.z >= -1 && projected.z <= 1;

  if (!visible) {
    el.classList.add('is-hidden');
    return null;
  }

  const x = (projected.x * 0.5 + 0.5) * canvas.clientWidth;
  const y = (-projected.y * 0.5 + 0.5) * canvas.clientHeight;

  el.classList.remove('is-hidden');
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  return { x, y };
}

function updateVertexLabels() {
  canonicalVertices.forEach((vertex, i) => {
    const world = tetra.localToWorld(vertex.clone());
    placeLabel(vertexLabelElements[i], world, vertexLabelsVisible);
  });
}

function updateFaceLabels() {
  canonicalFaces.forEach((face, i) => {
    const world = tetra.localToWorld(face.centroid.clone());
    placeLabel(faceLabelElements[i], world, faceLabelsVisible);
  });
}

function drawRegisterEdges(points) {
  overlayCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  if (!registerVisible) return;

  const isDiad = (a, b) =>
    witnessRegister.diads.some(([x, y]) => x === a && y === b);

  const isCoupler = (a, b) =>
    witnessRegister.couplers.some(([x, y]) => x === a && y === b);

  overlayCtx.lineCap = 'round';
  overlayCtx.lineJoin = 'round';

  for (let i = 0; i < witnessRegister.closedWord.length - 1; i++) {
    const a = witnessRegister.closedWord[i];
    const b = witnessRegister.closedWord[i + 1];
    const pa = points[a];
    const pb = points[b];
    if (!pa || !pb) continue;

    if (isDiad(a, b)) {
      overlayCtx.strokeStyle = 'rgba(138,180,255,0.92)';
      overlayCtx.lineWidth = 2.2;
    } else if (isCoupler(a, b)) {
      overlayCtx.strokeStyle = 'rgba(255,214,234,0.92)';
      overlayCtx.lineWidth = 1.8;
      overlayCtx.setLineDash([7, 5]);
    } else {
      overlayCtx.strokeStyle = 'rgba(232,240,248,0.75)';
      overlayCtx.lineWidth = 1.5;
    }

    overlayCtx.beginPath();
    overlayCtx.moveTo(pa.x, pa.y);
    overlayCtx.lineTo(pb.x, pb.y);
    overlayCtx.stroke();
    overlayCtx.setLineDash([]);
  }
}

function updateRegisterOverlay() {
  const points = {};
  for (const key of witnessRegister.order) {
    const local = registerAnchors[key].clone();
    const world = tetra.localToWorld(local);
    registerLabelElements[key].textContent = `${key}:${witnessRegister.slots[key]}`;
    const p = placeLabel(registerLabelElements[key], world, registerVisible);
    if (p) points[key] = p;
  }
  drawRegisterEdges(points);
}


function setLiveG15Enabled(flag) {
  liveG15Enabled = flag;
  if (toggleLiveG15Btn) {
    toggleLiveG15Btn.classList.toggle('is-live', flag);
    toggleLiveG15Btn.textContent = flag ? 'Live G15 on' : 'Live G15 off';
  }
}

async function fetchLiveG15(frame, phase, sheet) {
  const params = new URLSearchParams({
    frame: String(frame),
    phase: String(phase),
    sheet: String(sheet),
  });
  const res = await fetch(`/witness/api/g15/from-g30?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} :: ${await res.text()}`);
  }
  const data = await res.json();
  return data.payload;
}

function formatSectorHud(payload, activeFace, normalizedEdgeSlots) {
  if (!payload) return 'no payload';

  const state = payload.input_state;
  const g15 = payload.g15_focus;
  const sector = payload.sector_focus;

  return [
    `state              : (${state.frame},${state.phase},${state.sheet})`,
    `projected          : (${payload.projected_witness_state[0]},${payload.projected_witness_state[1]})`,
    ``,
    `g15_vertex         : ${g15.vertex}`,
    `petersen_edge      : ${g15.petersen_edge.join('-')}`,
    `tetra_face_slot    : ${activeFace}`,
    `face_rule          : (a+b)%4 with phase/sheet shifts`,
    ``,
    `closed_neighborhood: ${sector.closed_neighborhood.join(', ')}`,
    `sector_edges       : ${sector.edge_labels.join(', ')}`,
    `tetra_edge_slots   : ${normalizedEdgeSlots.join(', ') || '(none)'}`,
    `sector_weight      : ${sector.weight}`,
  ].join('\n');
}

function g15VertexToAnchorPoint(index) {
  const anchors = [
    new THREE.Vector3( 0.00,  1.15,  0.00),
    new THREE.Vector3(-0.82,  0.58,  0.58),
    new THREE.Vector3( 0.82,  0.58,  0.58),
    new THREE.Vector3( 0.82,  0.58, -0.58),
    new THREE.Vector3(-0.82,  0.58, -0.58),

    new THREE.Vector3( 0.00, -1.02,  0.00),
    new THREE.Vector3(-0.72, -0.44,  0.72),
    new THREE.Vector3( 0.72, -0.44,  0.72),
    new THREE.Vector3( 0.72, -0.44, -0.72),
    new THREE.Vector3(-0.72, -0.44, -0.72),

    new THREE.Vector3(-1.08,  0.04,  0.00),
    new THREE.Vector3( 1.08,  0.04,  0.00),
    new THREE.Vector3( 0.00,  0.04,  1.08),
    new THREE.Vector3( 0.00,  0.04, -1.08),
    new THREE.Vector3( 0.00,  0.48,  0.00),
  ];
  return anchors[index % anchors.length].clone();
}

const liveG15Marker = new THREE.Mesh(
  new THREE.SphereGeometry(0.11, 18, 18),
  new THREE.MeshStandardMaterial({
    color: 0x8ab4ff,
    transparent: true,
    opacity: 0.95,
    metalness: 0.08,
    roughness: 0.28,
  })
);
scene.add(liveG15Marker);

const liveG15Halo = new THREE.Mesh(
  new THREE.TorusGeometry(0.19, 0.015, 12, 40),
  new THREE.MeshBasicMaterial({
    color: 0xffd6ea,
    transparent: true,
    opacity: 0.92,
  })
);
scene.add(liveG15Halo);

const liveG15Neighborhood = [];
for (let i = 0; i < 4; i += 1) {
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 14, 14),
    new THREE.MeshStandardMaterial({
      color: 0x8ab4ff,
      transparent: true,
      opacity: 0.55,
      metalness: 0.02,
      roughness: 0.45,
    })
  );
  scene.add(dot);
  liveG15Neighborhood.push(dot);
}

function applyLiveG15Payload(payload) {
  lastG15Payload = payload;

  const vertexIndex = payload.g15_focus.vertex_index;
  const closed = payload.sector_focus.closed_neighborhood || [];
  const edgeIndices = payload.sector_focus.edge_indices || [];
  const edgeCount = edgeIndices.length;
  const phase = payload.input_state.phase;
  const sheet = payload.input_state.sheet;

  const anchor = g15VertexToAnchorPoint(vertexIndex);
  liveG15Marker.position.copy(anchor);
  liveG15Halo.position.copy(anchor);
  liveG15Halo.rotation.x = Math.PI / 2;

  const markerScale = 1 + 0.02 * Math.min(edgeCount, 10);
  liveG15Marker.scale.setScalar(markerScale);

  const isMinus = sheet === '-';
  const baseBlue = 0x8ab4ff;
  const basePink = 0xffa8d6;

  if (isMinus) {
    liveG15Marker.material.color.setHex(basePink);
  } else {
    liveG15Marker.material.color.setHex(baseBlue);
  }

  if (phase === 1) {
    liveG15Halo.material.color.setHex(0xffd6ea);
    liveG15Halo.material.opacity = 0.95;
  } else {
    liveG15Halo.material.color.setHex(baseBlue);
    liveG15Halo.material.opacity = 0.65;
  }

  const activeFace = petersenEdgeToFaceSlot(payload.g15_focus.petersen_edge, phase, sheet);
  for (let i = 0; i < faceAccentMeshes.length; i += 1) {
    const mesh = faceAccentMeshes[i];
    if (i === activeFace) {
      mesh.material.opacity = phase === 1 ? 0.36 : 0.26;
      mesh.material.color.setHex(isMinus ? basePink : baseBlue);
    } else {
      mesh.material.opacity = 0.03;
      mesh.material.color.setHex(baseBlue);
    }
  }

  // Explicit 6-edge register: sector edge slots drive the 6 tetra edges.
  const normalizedEdgeSlots = sectorEdgesToTetraSlots(edgeIndices, phase, sheet);

  for (let i = 0; i < tetraEdgeAccentLines.length; i += 1) {
    const line = tetraEdgeAccentLines[i];
    const hitCount = normalizedEdgeSlots.filter((slot) => slot === i).length;
    const active = hitCount > 0;

    line.material.opacity = active ? (0.28 + 0.18 * hitCount) : 0.04;
    line.material.color.setHex(isMinus ? basePink : baseBlue);
  }

  const edgeEnergy = Math.min(1, edgeCount / 6);
  edges.material.opacity = 0.30 + 0.70 * edgeEnergy;
  innerMaterial.opacity = 0.18 + 0.48 * (Math.max(0, closed.length - 1) / 4);
  glow.material.opacity = 0.03 + 0.22 * (phase === 1 ? 1 : 0.55) * edgeEnergy;

  if (isMinus) {
    innerMaterial.color.setHex(basePink);
  } else {
    innerMaterial.color.setHex(0xffc9e2);
  }

  // Let the active face slightly steer the whole tetra orientation.
  tetra.rotation.z = (activeFace - 1.5) * 0.08;
  inner.rotation.z = tetra.rotation.z * 0.7;

  const offsets = [
    new THREE.Vector3(-0.22,  0.14,  0.00),
    new THREE.Vector3( 0.22,  0.14,  0.00),
    new THREE.Vector3( 0.00, -0.20,  0.16),
    new THREE.Vector3( 0.00, -0.20, -0.16),
  ];

  for (let i = 0; i < liveG15Neighborhood.length; i += 1) {
    const dot = liveG15Neighborhood[i];
    if (i < Math.max(0, closed.length - 1)) {
      dot.visible = true;
      dot.position.copy(anchor).add(offsets[i % offsets.length]);
      if (isMinus) {
        dot.material.color.setHex(0xffd6ea);
      } else {
        dot.material.color.setHex(baseBlue);
      }
      dot.material.opacity = 0.35 + 0.12 * i;
    } else {
      dot.visible = false;
    }
  }

  metricReg.textContent = `${payload.g15_focus.vertex} · ${payload.g15_focus.petersen_edge.join('-')}`;
  metricFace.textContent = `${Math.round(tetraMaterial.opacity * 100)}%`;

  if (sectorHud) {
    sectorHud.textContent = formatSectorHud(payload, activeFace, normalizedEdgeSlots);
  }
}

async function refreshLiveG15() {
  if (!liveG15Enabled) return;
  try {
    const payload = await fetchLiveG15(liveG15Frame, liveG15Phase, liveG15Sheet);
    applyLiveG15Payload(payload);
  } catch (err) {
    console.error('refreshLiveG15 failed:', err);
  }
}

function ensureLiveStateChannel() {
  if (liveStateChannel || typeof BroadcastChannel === 'undefined') return liveStateChannel;
  try {
    liveStateChannel = new BroadcastChannel('lab2_live_state');
    liveStateChannel.addEventListener('message', async (event) => {
      if (!liveG15Enabled) return;
      const data = event.data;
      if (!data || !data.state) return;
      liveG15Frame = data.state.frame;
      liveG15Phase = data.state.phase;
      liveG15Sheet = data.state.sheet;
      await refreshLiveG15();
    });
  } catch (err) {
    console.warn('BroadcastChannel unavailable:', err);
  }
  return liveStateChannel;
}

function loadLiveStateSnapshot() {
  try {
    const raw = localStorage.getItem(LIVE_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('localStorage read failed:', err);
    return null;
  }
}

async function syncFromLiveSnapshot() {
  const snap = loadLiveStateSnapshot();
  if (!snap || !snap.state) return;
  liveG15Frame = snap.state.frame;
  liveG15Phase = snap.state.phase;
  liveG15Sheet = snap.state.sheet;
  await refreshLiveG15();
}

resetBtn.addEventListener('click', resetCamera);

spinBtn.addEventListener('click', () => {
  spinning = !spinning;
  spinBtn.textContent = spinning ? 'Pause' : 'Play';
});

toggleVLabelsBtn.addEventListener('click', () => {
  setVertexLabelsVisible(!vertexLabelsVisible);
});

toggleFLabelsBtn.addEventListener('click', () => {
  setFaceLabelsVisible(!faceLabelsVisible);
});

toggleRegisterBtn.addEventListener('click', () => {
  setRegisterVisible(!registerVisible);
});

stepLeftBtn.addEventListener('click', () => stepRotation(-1));
stepRightBtn.addEventListener('click', () => stepRotation(1));

camIsoBtn.addEventListener('click', () => applyCameraPreset('iso'));
camFrontBtn.addEventListener('click', () => applyCameraPreset('front'));
camTopBtn.addEventListener('click', () => applyCameraPreset('top'));

faceOpacityInput.addEventListener('input', applyFaceOpacity);
innerOpacityInput.addEventListener('input', applyInnerOpacity);
glowOpacityInput.addEventListener('input', applyGlowOpacity);
wireOpacityInput.addEventListener('input', applyWireOpacity);


if (toggleLiveG15Btn) {
  toggleLiveG15Btn.addEventListener('click', async () => {
    setLiveG15Enabled(!liveG15Enabled);
    if (liveG15Enabled) {
      ensureLiveStateChannel();
      await syncFromLiveSnapshot();
    }
  });
}

if (stepG15PrevBtn) {
  stepG15PrevBtn.addEventListener('click', async () => {
    setLiveG15Enabled(false);
    liveG15Frame = (liveG15Frame + 14) % 15;
    await refreshLiveG15();
  });
}

if (stepG15NextBtn) {
  stepG15NextBtn.addEventListener('click', async () => {
    setLiveG15Enabled(false);
    liveG15Frame = (liveG15Frame + 1) % 15;
    await refreshLiveG15();
  });
}

window.addEventListener('storage', async (event) => {
  if (!liveG15Enabled) return;
  if (event.key !== LIVE_STATE_KEY || !event.newValue) return;
  try {
    const snap = JSON.parse(event.newValue);
    if (!snap || !snap.state) return;
    liveG15Frame = snap.state.frame;
    liveG15Phase = snap.state.phase;
    liveG15Sheet = snap.state.sheet;
    await refreshLiveG15();
  } catch (err) {
    console.warn('storage sync failed:', err);
  }
});

window.addEventListener('resize', resize);

function animate() {
  tick += 1;

  if (spinning) {
    tetra.rotation.x += 0.004;
    tetra.rotation.y += 0.008;
    inner.rotation.x += 0.003;
    inner.rotation.y += 0.006;
  }

  controls.update();
  updateTelemetry();
  updateVertexLabels();
  updateFaceLabels();
  updateRegisterOverlay();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

try {
  applyFaceOpacity();
  applyInnerOpacity();
  applyGlowOpacity();
  applyWireOpacity();
  resize();
  applyCameraPreset('iso');
  setVertexLabelsVisible(true);
  setFaceLabelsVisible(true);
  setRegisterVisible(true);
  animate();
} catch (err) {
  console.error(err);
}
