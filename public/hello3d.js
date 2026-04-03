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

const camIsoBtn = document.getElementById('cam-iso');
const camFrontBtn = document.getElementById('cam-front');
const camTopBtn = document.getElementById('cam-top');

const faceOpacityInput = document.getElementById('face-opacity');
const innerOpacityInput = document.getElementById('inner-opacity');
const glowOpacityInput = document.getElementById('glow-opacity');
const wireOpacityInput = document.getElementById('wire-opacity');

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

  metricTick.textContent = String(tick);
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
