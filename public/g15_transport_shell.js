import * as THREE from "/public/vendor/three/three.module.js";
import { OrbitControls } from "/public/vendor/three/OrbitControls.js";

const stage = document.getElementById("stage");
const lensSelect = document.getElementById("lens-select");
const viewSelect = document.getElementById("view-select");
const lensNote = document.getElementById("lens-note");

const stateStepEl = document.getElementById("state-step");
const stateLandmarkEl = document.getElementById("state-landmark");
const stateFrameEl = document.getElementById("state-frame");
const statePhaseEl = document.getElementById("state-phase");
const stateSheetEl = document.getElementById("state-sheet");
const stateHostPassEl = document.getElementById("state-host-pass");
const stateRegionEl = document.getElementById("state-region");

const playToggleBtn = document.getElementById("play-toggle");
const stepBackBtn = document.getElementById("step-back");
const stepForwardBtn = document.getElementById("step-forward");
const stepSlider = document.getElementById("step-slider");
const jumpButtons = Array.from(document.querySelectorAll(".jump-step"));

const REGION_COLORS = {
  upstairs: 0x96d95d,
  stairs: 0xf59d48,
  downstairs: 0x71d7ef,
};

const SIGN_COLORS = {
  parallel: 0x77d0ff,
  crossed: 0xff5f8a,
};

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
stage.appendChild(renderer.domElement);

const labelLayer = document.createElement("div");
labelLayer.className = "label-layer";
stage.appendChild(labelLayer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071018);

const camera = new THREE.PerspectiveCamera(
  42,
  stage.clientWidth / stage.clientHeight,
  0.1,
  100
);
camera.position.set(5.8, 4.0, 7.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.1, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.85));

const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
keyLight.position.set(6, 7, 8);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
fillLight.position.set(-5, 3, -6);
scene.add(fillLight);

const root = new THREE.Group();
scene.add(root);

const W = 2.55;
const H = 2.7;
const D = 2.05;

const SHEET_POSITIONS = [
  [ W, -H,  D],
  [ W * 0.82, -H * 0.86,  D * 0.62],
  [ W,  H, -D],
  [ W,  H * 0.54,  D * 0.10],
  [-W,  H * 0.50,  D * 0.12],
  [-W, -H * 0.80,  D * 0.15],
  [ W,  H,  D],
  [ W * 0.45, -H * 0.05,  D * 0.55],
  [-W * 0.30, -H * 0.10,  D * 0.05],
  [-W * 0.68, -H * 0.02, -D * 0.04],
  [ W * 0.10, -H * 0.16,  D * 0.15],
  [ W * 0.10,  H * 0.10, -D * 0.08],
  [ 0.0,  H * 0.74, -D * 0.12],
  [ 0.0, -H * 0.88,  D * 0.08],
  [ 0.0, -H * 0.06,  0.0]
];

const CUBE_POSITIONS = [
  [ 0,  0,  0],
  [ 0, -H,  0],
  [ 0,  H,  0],
  [  W,  H,  D],
  [  W,  H, -D],
  [  W, -H,  D],
  [ -W,  H, -D],
  [ -W, -H, -D],
  [  0,  0,  D],
  [  W,  0,  0],
  [ -W,  0,  0],
  [  0,  0, -D],
  [ -W,  H,  D],
  [  0, -H * 0.65,  0],
  [  0,  H * 0.05, 0]
];

const TA = [ 0.0,  2.65,  0.0];
const TB = [-2.35, -1.65,  1.45];
const TC = [ 2.35, -1.65,  1.45];
const TD = [ 0.0, -1.65, -2.25];

function mid(p, q) {
  return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
}
function centroid3(a, b, c) {
  return [
    (a[0] + b[0] + c[0]) / 3,
    (a[1] + b[1] + c[1]) / 3,
    (a[2] + b[2] + c[2]) / 3,
  ];
}
function centroid4(a, b, c, d) {
  return [
    (a[0] + b[0] + c[0] + d[0]) / 4,
    (a[1] + b[1] + c[1] + d[1]) / 4,
    (a[2] + b[2] + c[2] + d[2]) / 4,
  ];
}

const TETRA_POSITIONS = [
  centroid4(TA, TB, TC, TD),
  mid(TA, TB),
  TA,
  TB,
  TC,
  TD,
  centroid3(TA, TB, TC),
  centroid3(TA, TB, TD),
  centroid3(TA, TC, TD),
  centroid3(TB, TC, TD),
  mid(TA, TC),
  mid(TA, TD),
  mid(TB, TC),
  mid(TB, TD),
  mid(TC, TD),
];

let positions = SHEET_POSITIONS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
const labels = Array.from({ length: 15 }, (_, i) => `v${i}`);

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${path}`);
  }
  return await res.json();
}

let shellGrammar = null;
let shellProjection = null;

let currentStep = 0;
let isPlaying = false;
let lastAdvanceMs = 0;
const STEP_INTERVAL_MS = 700;
const TRAIL_LENGTH = 5;

function stepToState(step) {
  const s = ((step % 60) + 60) % 60;
  const frame = s % 15;
  const quarter = Math.floor(s / 15);
  const sheet = quarter === 0 || quarter === 2 ? "+" : "-";
  const host_pass = quarter;
  const phase = 0;
  return { step: s, frame, phase, sheet, host_pass };
}

function landmarkForStep(step) {
  if (step === 0) return "origin";
  if (step === 15) return "sign closure";
  if (step === 30) return "identity closure";
  if (step === 45) return "third-pass return";
  return step === 59 ? "approaching host closure" : "in flight";
}

function isLandmarkStep(step) {
  return step === 0 || step === 15 || step === 30 || step === 45;
}

async function loadSpecs() {
  try {
    const [grammar, projection] = await Promise.all([
      loadJson("/specs/g15_transport/transport_shell_grammar.json"),
      loadJson("/specs/g15_transport/transport_shell_projection.json"),
    ]);
    shellGrammar = grammar;
    shellProjection = projection;
    applySpecsToUI();
  } catch (err) {
    console.warn("Failed to load one or more transport specs:", err);
  }
}

function applySpecsToUI() {
  document.getElementById("shell-title").textContent = "G15 Transport Shell";
  document.getElementById("shell-subtitle").textContent =
    shellGrammar?.ontology?.description ||
    "A sheeted transport system with upstairs, downstairs, and stairs.";

  document.getElementById("shell-vertex-count").textContent =
    `Vertices: ${shellGrammar?.shell?.vertex_count ?? 15}`;
  document.getElementById("shell-edge-count").textContent = "Edges: 30";

  const legendGreen = document.getElementById("legend-green");
  const legendOrange = document.getElementById("legend-orange");
  const legendBlue = document.getElementById("legend-blue");

  if ((lensSelect?.value || "tetra") === "signed") {
    legendGreen.textContent = "Parallel lift";
    legendOrange.textContent = "Stairs / overlap";
    legendBlue.textContent = "Crossed lift";
  } else {
    legendGreen.textContent = shellGrammar?.color_legend?.green || "Upstairs walk";
    legendOrange.textContent = shellGrammar?.color_legend?.orange || "Stairs / middle crossing";
    legendBlue.textContent = shellGrammar?.color_legend?.blue || "Downstairs walk";
  }
}

function buildPetersenEdges() {
  const twoSets = [];
  for (let a = 0; a < 5; a += 1) {
    for (let b = a + 1; b < 5; b += 1) {
      twoSets.push([a, b]);
    }
  }
  return twoSets;
}

function buildLineGraphEdges(petersenEdges) {
  const out = [];
  for (let i = 0; i < petersenEdges.length; i += 1) {
    const [a1, a2] = petersenEdges[i];
    for (let j = i + 1; j < petersenEdges.length; j += 1) {
      const [b1, b2] = petersenEdges[j];
      if (new Set([a1, a2, b1, b2]).size < 4) {
        out.push([i, j]);
      }
    }
  }
  return out;
}

const petersenEdges = buildPetersenEdges();
const g15Edges = buildLineGraphEdges(petersenEdges);

const shellGroup = new THREE.Group();
const graphGroup = new THREE.Group();
const highlightGroup = new THREE.Group();
const nodeGroup = new THREE.Group();
root.add(shellGroup, graphGroup, highlightGroup, nodeGroup);

const cube = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(W * 2, H * 2, D * 2)),
  new THREE.LineBasicMaterial({ color: 0x3f5d82, transparent: true, opacity: 0.6 })
);
shellGroup.add(cube);

function addPlane(width, height, color, opacity, position, rotation) {
  const geom = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.copy(position);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  shellGroup.add(mesh);

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(geom),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity + 0.18 })
  );
  edge.position.copy(position);
  edge.rotation.copy(mesh.rotation);
  shellGroup.add(edge);
  return { mesh, edge };
}

const upstairsPlane = addPlane(
  5.0, 3.4, 0x96d95d, 0.12,
  new THREE.Vector3(0.0, 1.75, 0.2),
  new THREE.Euler(-0.20, -0.08, 0.05)
);

const downstairsPlane = addPlane(
  5.4, 3.8, 0x71d7ef, 0.12,
  new THREE.Vector3(0.15, -1.55, 0.0),
  new THREE.Euler(-0.15, 0.18, 0.03)
);

const stairsPlane = addPlane(
  3.8, 2.1, 0xf59d48, 0.10,
  new THREE.Vector3(-0.2, -0.05, 0.15),
  new THREE.Euler(-0.03, 0.02, 0.0)
);

const stairsGeom = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, -2.15, 0),
  new THREE.Vector3(0,  2.25, 0),
]);
const stairsLine = new THREE.Line(
  stairsGeom,
  new THREE.LineBasicMaterial({ color: 0xf2f5f8, transparent: true, opacity: 0.7 })
);
shellGroup.add(stairsLine);

const arrows = [];
function addArrow(y0, y1, color) {
  const dir = new THREE.Vector3(0, y1 - y0, 0).normalize();
  const origin = new THREE.Vector3(0, y0, 0);
  const len = Math.abs(y1 - y0);
  const arrow = new THREE.ArrowHelper(dir, origin, len, color, 0.18, 0.1);
  shellGroup.add(arrow);
  arrows.push(arrow);
}
addArrow(-2.05, -1.15, 0x71d7ef);
addArrow(-0.95, -0.10, 0xf59d48);
addArrow(0.20, 1.15, 0x96d95d);
addArrow(1.25, 2.00, 0x96d95d);

function makeLine(points, color, opacity) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geometry, material);
}

const graphLines = [];
g15Edges.forEach(([a, b], idx) => {
  const line = makeLine([positions[a], positions[b]], 0x6f8caf, 0.28);
  graphGroup.add(line);
  graphLines.push({ a, b, idx, line });
});

const nodeMeshes = positions.map((point, index) => {
  const geometry = new THREE.SphereGeometry(index === 0 ? 0.14 : index >= 8 && index <= 13 ? 0.11 : 0.095, 20, 20);
  const material = new THREE.MeshStandardMaterial({
    color: index === 0 ? 0xffefb3 : 0xe4edf7,
    metalness: 0.08,
    roughness: 0.34,
    emissive: index === 0 ? 0x4a3d12 : 0x000000,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(point);
  nodeGroup.add(mesh);
  return mesh;
});

const labelEls = labels.map((text) => {
  const el = document.createElement("div");
  el.className = "node-label";
  el.textContent = text;
  labelLayer.appendChild(el);
  return el;
});

let highlightLines = [];
let haloMeshes = [];

function clearHighlights() {
  for (const line of highlightLines) {
    highlightGroup.remove(line);
    line.geometry.dispose();
    line.material.dispose();
  }
  highlightLines = [];

  for (const mesh of haloMeshes) {
    highlightGroup.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  haloMeshes = [];
}

function addHighlightLine(a, b, color, opacity = 0.95) {
  const line = makeLine([positions[a], positions[b]], color, opacity);
  highlightGroup.add(line);
  highlightLines.push(line);
}

function addHalo(index, color, scale = 1.6, opacity = 0.35) {
  const base = nodeMeshes[index];
  if (!base) return;
  const geom = new THREE.SphereGeometry(base.geometry.parameters.radius * scale, 18, 18);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.copy(base.position);
  highlightGroup.add(mesh);
  haloMeshes.push(mesh);
}

function regionForFrame(frame) {
  const part = shellProjection?.frame_partition;
  if (!part) {
    if (frame === 0 || frame === 5 || frame === 10) return "stairs";
    if ([1, 2, 3, 4, 11, 12].includes(frame)) return "upstairs";
    return "downstairs";
  }
  if (part.stairs_frames?.includes(frame)) return "stairs";
  if (part.upstairs_frames?.includes(frame)) return "upstairs";
  if (part.downstairs_frames?.includes(frame)) return "downstairs";
  return "stairs";
}

function updateStateReadout(state) {
  const region = regionForFrame(state.frame);
  stateStepEl.textContent = `step: ${state.step}`;
  stateLandmarkEl.textContent = `landmark: ${landmarkForStep(state.step)}`;
  stateFrameEl.textContent = `frame: ${state.frame}`;
  statePhaseEl.textContent = `phase: ${state.phase}`;
  stateSheetEl.textContent = `sheet: ${state.sheet}`;
  stateHostPassEl.textContent = `host_pass: ${state.host_pass}`;
  stateRegionEl.textContent = `region: ${region}`;
  if (stepSlider) {
    stepSlider.value = String(state.step);
  }
}

function applyNodeRegionColors() {
  for (let i = 0; i < nodeMeshes.length; i += 1) {
    const region = regionForFrame(i);
    const mesh = nodeMeshes[i];
    if (i === 0) {
      mesh.material.color.setHex(0xffefb3);
      mesh.material.emissive.setHex(0x4a3d12);
    } else {
      mesh.material.color.setHex(REGION_COLORS[region]);
      mesh.material.emissive.setHex(0x000000);
    }
  }
}

function signedLiftClassForEdge(edgeIndex, a, b) {
  const parity = (edgeIndex + a + 2 * b) % 2;
  return parity === 0 ? "parallel" : "crossed";
}

function trailOpacity(rank) {
  const values = [0.95, 0.72, 0.52, 0.34, 0.20];
  return values[Math.min(rank, values.length - 1)];
}

function pulseOpacity(step, nowMs) {
  if (!isLandmarkStep(step)) return 0.18;
  const t = (nowMs % 1000) / 1000;
  return 0.28 + 0.22 * (0.5 + 0.5 * Math.sin(2 * Math.PI * t));
}

function renderProjectedLift(nowMs = 0) {
  clearHighlights();
  applyNodeRegionColors();

  const state = stepToState(currentStep);
  updateStateReadout(state);

  for (let i = 0; i < TRAIL_LENGTH; i += 1) {
    const s = stepToState(currentStep - i);
    const next = stepToState(currentStep - i + 1);
    const color = REGION_COLORS[regionForFrame(s.frame)];
    addHighlightLine(s.frame, next.frame, color, trailOpacity(i));
  }

  const stairsFrames = shellProjection?.frame_partition?.stairs_frames || [0, 5, 10];
  for (const f of stairsFrames) {
    const pulse = isLandmarkStep(currentStep) && f === state.frame;
    addHalo(
      f,
      REGION_COLORS.stairs,
      f === 0 ? 2.2 : 1.5,
      pulse ? pulseOpacity(currentStep, nowMs) : 0.16
    );
  }

  addHalo(state.frame, REGION_COLORS[regionForFrame(state.frame)], 2.0, 0.34);

  if (isLandmarkStep(currentStep)) {
    addHalo(state.frame, 0xffffff, 2.8, pulseOpacity(currentStep, nowMs) * 0.75);
  }

  const lensName = lensSelect?.value || "tetra";
  const lensText =
    lensName === "cube"
      ? "Cube lens: v0 is the stairs midpoint / cube centroid."
      : lensName === "tetra"
        ? "Tetra lens: simplex view of the projected host state."
        : "Sheet lens: tilted analysis view of the projected host state.";

  lensNote.textContent =
    `${lensText} Step 15: sign closure. Step 30: identity closure. Step 45: third-pass return. Step 60: host closure.`;
}

function renderSignedLift(nowMs = 0) {
  clearHighlights();
  applyNodeRegionColors();

  for (const { a, b, idx } of graphLines) {
    const cls = signedLiftClassForEdge(idx, a, b);
    addHighlightLine(a, b, SIGN_COLORS[cls], 0.88);
  }

  const state = stepToState(currentStep);
  addHalo(0, REGION_COLORS.stairs, 2.2, 0.42);
  if (isLandmarkStep(currentStep)) {
    addHalo(state.frame, 0xffffff, 2.8, pulseOpacity(currentStep, nowMs) * 0.75);
  }
  updateStateReadout(state);

  lensNote.textContent =
    "Signed-lift lens: edge colors show the lift layer. Blue = parallel, pink = crossed. This is companion transport memory, not the quadratic overlap law.";
}

function setPositions(source, nowMs = 0) {
  positions = source.map(([x, y, z]) => new THREE.Vector3(x, y, z));

  nodeMeshes.forEach((mesh, i) => mesh.position.copy(positions[i]));

  graphLines.forEach(({ a, b, line }) => {
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints([positions[a], positions[b]]);
  });

  if ((lensSelect?.value || "tetra") === "signed") {
    renderSignedLift(nowMs);
  } else {
    renderProjectedLift(nowMs);
  }
}

function applyTetraViewPreset() {
  const view = viewSelect?.value || "front";

  if (view === "top") {
    camera.position.copy(new THREE.Vector3(0.0, 9.5, 0.001));
    controls.target.copy(new THREE.Vector3(0, 0, 0));
    camera.up.set(0, 0, -1);
  } else if (view === "core") {
    camera.position.copy(new THREE.Vector3(0.0, 0.35, 3.6));
    controls.target.copy(new THREE.Vector3(0, -0.15, 0));
    camera.up.set(0, 1, 0);
  } else if (view === "oblique") {
    camera.position.copy(new THREE.Vector3(4.8, 3.0, 7.8));
    controls.target.copy(new THREE.Vector3(0, -0.15, 0));
    camera.up.set(0, 1, 0);
  } else {
    camera.position.copy(new THREE.Vector3(0.0, 1.8, 8.8));
    controls.target.copy(new THREE.Vector3(0, -0.15, 0));
    camera.up.set(0, 1, 0);
  }

  controls.update();
  camera.lookAt(controls.target);
  camera.updateProjectionMatrix();
}

function applyLens(lens, nowMs = 0) {
  applySpecsToUI();

  if (lens === "cube" || lens === "signed") {
    setPositions(CUBE_POSITIONS, nowMs);
    upstairsPlane.mesh.visible = false;
    upstairsPlane.edge.visible = false;
    downstairsPlane.mesh.visible = false;
    downstairsPlane.edge.visible = false;
    stairsPlane.mesh.visible = false;
    stairsPlane.edge.visible = false;
    cube.visible = true;
    stairsLine.visible = lens !== "signed";
    arrows.forEach((a) => { a.visible = lens !== "signed"; });
    camera.position.set(6.0, 4.6, 8.2);
    controls.target.set(0, 0, 0);
  } else if (lens === "tetra") {
    setPositions(TETRA_POSITIONS, nowMs);
    upstairsPlane.mesh.visible = false;
    upstairsPlane.edge.visible = false;
    downstairsPlane.mesh.visible = false;
    downstairsPlane.edge.visible = false;
    stairsPlane.mesh.visible = false;
    stairsPlane.edge.visible = false;
    cube.visible = false;
    stairsLine.visible = false;
    arrows.forEach((a) => { a.visible = false; });
    applyTetraViewPreset();
  } else {
    setPositions(SHEET_POSITIONS, nowMs);
    upstairsPlane.mesh.visible = true;
    upstairsPlane.edge.visible = true;
    downstairsPlane.mesh.visible = true;
    downstairsPlane.edge.visible = true;
    stairsPlane.mesh.visible = true;
    stairsPlane.edge.visible = true;
    cube.visible = true;
    stairsLine.visible = true;
    arrows.forEach((a) => { a.visible = true; });
    camera.position.set(5.8, 4.0, 7.2);
    controls.target.set(0, 0.1, 0);
  }

  camera.updateProjectionMatrix();
}

function projectToScreen(vec3) {
  const p = vec3.clone().project(camera);
  const x = (p.x * 0.5 + 0.5) * stage.clientWidth;
  const y = (-p.y * 0.5 + 0.5) * stage.clientHeight;
  return { x, y };
}

function updateLabels() {
  for (let i = 0; i < nodeMeshes.length; i += 1) {
    const pos = nodeMeshes[i].getWorldPosition(new THREE.Vector3());
    const screen = projectToScreen(pos);
    const el = labelEls[i];
    el.style.left = `${screen.x}px`;
    el.style.top = `${screen.y}px`;
    el.style.display = "block";
  }
}

function setStep(step, nowMs = 0) {
  currentStep = ((step % 60) + 60) % 60;
  if ((lensSelect?.value || "tetra") === "signed") {
    renderSignedLift(nowMs);
  } else {
    renderProjectedLift(nowMs);
  }
}

function togglePlay() {
  isPlaying = !isPlaying;
  playToggleBtn.textContent = isPlaying ? "Pause" : "Play";
}

function animate(now = 0) {
  if (isPlaying && now - lastAdvanceMs > STEP_INTERVAL_MS) {
    currentStep = (currentStep + 1) % 60;
    lastAdvanceMs = now;
  }

  if ((lensSelect?.value || "tetra") === "signed") {
    renderSignedLift(now);
  } else {
    renderProjectedLift(now);
  }

  controls.update();
  renderer.render(scene, camera);
  updateLabels();
  requestAnimationFrame(animate);
}

function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

window.addEventListener("resize", resize);

if (lensSelect) {
  lensSelect.addEventListener("change", (e) => applyLens(e.target.value));
}

if (viewSelect) {
  viewSelect.addEventListener("change", () => {
    if ((lensSelect?.value || "tetra") === "tetra") {
      applyLens("tetra", performance.now());
    }
  });
}

if (playToggleBtn) {
  playToggleBtn.addEventListener("click", togglePlay);
}
if (stepBackBtn) {
  stepBackBtn.addEventListener("click", () => setStep(currentStep - 1));
}
if (stepForwardBtn) {
  stepForwardBtn.addEventListener("click", () => setStep(currentStep + 1));
}
if (stepSlider) {
  stepSlider.addEventListener("input", (e) => {
    const next = Number(e.target.value);
    setStep(next);
  });
}
for (const btn of jumpButtons) {
  btn.addEventListener("click", () => {
    const target = Number(btn.dataset.step || "0");
    setStep(target);
  });
}

await loadSpecs();
applySpecsToUI();
applyLens(lensSelect?.value || "tetra");
setStep(0);
animate();
