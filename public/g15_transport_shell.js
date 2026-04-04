import * as THREE from "/public/vendor/three/three.module.js";
import { OrbitControls } from "/public/vendor/three/OrbitControls.js";

const stage = document.getElementById("stage");
const lensSelect = document.getElementById("lens-select");
const lensNote = document.getElementById("lens-note");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
stage.appendChild(renderer.domElement);

const labelLayer = document.createElement("div");
labelLayer.className = "label-layer";
stage.appendChild(labelLayer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071018);

const camera = new THREE.PerspectiveCamera(42, stage.clientWidth / stage.clientHeight, 0.1, 100);
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
  [ 0,  0,  0],   // v0 centroid / stairs midpoint
  [ 0, -H,  0],   // v1 bottom face
  [ 0,  H,  0],   // v2 top face
  [  W,  H,  D],  // v3
  [  W,  H, -D],  // v4
  [  W, -H,  D],  // v5
  [ -W,  H, -D],  // v6
  [ -W, -H, -D],  // v7
  [  0,  0,  D],  // v8 front face
  [  W,  0,  0],  // v9 right face
  [ -W,  0,  0],  // v10 left face
  [  0,  0, -D],  // v11 back face
  [ -W,  H,  D],  // v12 top sheet anchor
  [  0, -H * 0.65,  0], // v13 bottom sheet anchor
  [  0,  H * 0.05, 0]   // v14 stairs inner transition
];

// Tetrahedral decomposition: 4 corners, 6 edge midpoints, 4 face centroids, 1 centroid
const TA = [ 0.0,  2.65,  0.0];
const TB = [-2.35, -1.65,  1.45];
const TC = [ 2.35, -1.65,  1.45];
const TD = [ 0.0, -1.65, -2.25];

function mid(p, q) {
  return [(p[0]+q[0])/2, (p[1]+q[1])/2, (p[2]+q[2])/2];
}
function centroid3(a, b, c) {
  return [(a[0]+b[0]+c[0])/3, (a[1]+b[1]+c[1])/3, (a[2]+b[2]+c[2])/3];
}
function centroid4(a, b, c, d) {
  return [(a[0]+b[0]+c[0]+d[0])/4, (a[1]+b[1]+c[1]+d[1])/4, (a[2]+b[2]+c[2]+d[2])/4];
}

const TETRA_POSITIONS = [
  centroid4(TA, TB, TC, TD), // v0 tetra centroid
  mid(TA, TB),               // v1
  TA,                        // v2
  TB,                        // v3
  TC,                        // v4
  TD,                        // v5
  centroid3(TA, TB, TC),     // v6
  centroid3(TA, TB, TD),     // v7
  centroid3(TA, TC, TD),     // v8
  centroid3(TB, TC, TD),     // v9
  mid(TA, TC),               // v10
  mid(TA, TD),               // v11
  mid(TB, TC),               // v12
  mid(TB, TD),               // v13
  mid(TC, TD)                // v14
];

let positions = SHEET_POSITIONS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
const labels = Array.from({ length: 15 }, (_, i) => `v${i}`);

async function loadShellGrammar() {
  try {
    const res = await fetch("/specs/g15_transport/transport_shell_grammar.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to load transport shell grammar spec:", err);
    return null;
  }
}

function applyGrammarToUI(grammar) {
  if (!grammar) return;
  document.getElementById("shell-title").textContent = "G15 Transport Shell";
  document.getElementById("shell-subtitle").textContent =
    grammar.ontology?.description || "A sheeted transport system with upstairs, downstairs, and stairs.";
  document.getElementById("shell-vertex-count").textContent = `Vertices: ${grammar.shell?.vertex_count ?? 15}`;
  document.getElementById("shell-edge-count").textContent = "Edges: 30";
  document.getElementById("legend-green").textContent = grammar.color_legend?.green || "Upstairs walk";
  document.getElementById("legend-orange").textContent = grammar.color_legend?.orange || "Stairs / middle crossing";
  document.getElementById("legend-blue").textContent = grammar.color_legend?.blue || "Downstairs walk";
}

function buildPetersenEdges() {
  const twoSets = [];
  for (let a = 0; a < 5; a += 1) {
    for (let b = a + 1; b < 5; b += 1) twoSets.push([a, b]);
  }
  const edges = [];
  for (let i = 0; i < twoSets.length; i += 1) {
    const ai = new Set(twoSets[i]);
    for (let j = i + 1; j < twoSets.length; j += 1) {
      const aj = new Set(twoSets[j]);
      const disjoint = [...ai].every((x) => !aj.has(x));
      if (disjoint) edges.push([i, j]);
    }
  }
  return edges;
}

function buildLineGraphEdges(petersenEdges) {
  const out = [];
  for (let i = 0; i < petersenEdges.length; i += 1) {
    const [a1, a2] = petersenEdges[i];
    for (let j = i + 1; j < petersenEdges.length; j += 1) {
      const [b1, b2] = petersenEdges[j];
      if (new Set([a1, a2, b1, b2]).size < 4) out.push([i, j]);
    }
  }
  return out;
}

const petersenEdges = buildPetersenEdges();
const g15Edges = buildLineGraphEdges(petersenEdges);

const shellGroup = new THREE.Group();
const graphGroup = new THREE.Group();
const pathGroup = new THREE.Group();
const nodeGroup = new THREE.Group();
root.add(shellGroup, graphGroup, pathGroup, nodeGroup);

const cube = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(W * 2, H * 2, D * 2)),
  new THREE.LineBasicMaterial({ color: 0x3f5d82, transparent: true, opacity: 0.6 })
);
shellGroup.add(cube);

function addPlane(width, height, color, opacity, position, rotation) {
  const geom = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false
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

const upstairsPlane = addPlane(5.0, 3.4, 0x96d95d, 0.12, new THREE.Vector3(0.0, 1.75, 0.2), new THREE.Euler(-0.20, -0.08, 0.05));
const downstairsPlane = addPlane(5.4, 3.8, 0x71d7ef, 0.12, new THREE.Vector3(0.15, -1.55, 0.0), new THREE.Euler(-0.15, 0.18, 0.03));
const stairsPlane = addPlane(3.8, 2.1, 0xf59d48, 0.10, new THREE.Vector3(-0.2, -0.05, 0.15), new THREE.Euler(-0.03, 0.02, 0.0));

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
g15Edges.forEach(([a, b]) => {
  const line = makeLine([positions[a], positions[b]], 0x6f8caf, 0.28);
  graphGroup.add(line);
  graphLines.push({ a, b, line });
});

const pathDefs = [
  { indices: [4, 12, 2, 6, 3, 12, 4], color: 0x96d95d, opacity: 0.95 },
  { indices: [5, 9, 10, 3, 7, 13, 8, 5], color: 0xf59d48, opacity: 0.95 },
  { indices: [13, 8, 14, 11, 7, 1, 0], color: 0x71d7ef, opacity: 0.95 },
];
const pathLines = pathDefs.map((def) => {
  const line = makeLine(def.indices.map((i) => positions[i]), def.color, def.opacity);
  pathGroup.add(line);
  return { ...def, line };
});

const nodeMeshes = positions.map((point, index) => {
  const isCenter = index === 14 || index === 0;
  const isFace = index >= 8 && index <= 13;
  const geometry = new THREE.SphereGeometry(isCenter ? 0.14 : isFace ? 0.11 : 0.095, 20, 20);
  const material = new THREE.MeshStandardMaterial({
    color: index === 0 ? 0xffefb3 : isCenter ? 0xf7e0aa : isFace ? 0xaad8ff : 0xe4edf7,
    metalness: 0.08,
    roughness: 0.34,
    emissive: index === 0 ? 0x4a3d12 : isCenter ? 0x3a2f16 : 0x000000,
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

function setPositions(source) {
  positions = source.map(([x, y, z]) => new THREE.Vector3(x, y, z));

  nodeMeshes.forEach((mesh, i) => mesh.position.copy(positions[i]));

  graphLines.forEach(({ a, b, line }) => {
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints([positions[a], positions[b]]);
  });

  pathLines.forEach((entry) => {
    entry.line.geometry.dispose();
    entry.line.geometry = new THREE.BufferGeometry().setFromPoints(entry.indices.map((i) => positions[i]));
  });
}

function applyLens(lens) {
  if (lens === "cube") {
    setPositions(CUBE_POSITIONS);
    upstairsPlane.mesh.visible = false;
    upstairsPlane.edge.visible = false;
    downstairsPlane.mesh.visible = false;
    downstairsPlane.edge.visible = false;
    stairsPlane.mesh.visible = false;
    stairsPlane.edge.visible = false;
    cube.visible = true;
    stairsLine.visible = true;
    arrows.forEach((a) => a.visible = true);
    lensNote.textContent = "Flattened teaching view: cube-first, with the walk read as starting and stopping on the stairs.";
    camera.position.set(6.0, 4.6, 8.2);
    controls.target.set(0, 0, 0);
  } else if (lens === "tetra") {
    setPositions(TETRA_POSITIONS);
    upstairsPlane.mesh.visible = false;
    upstairsPlane.edge.visible = false;
    downstairsPlane.mesh.visible = false;
    downstairsPlane.edge.visible = false;
    stairsPlane.mesh.visible = false;
    stairsPlane.edge.visible = false;
    cube.visible = false;
    stairsLine.visible = false;
    arrows.forEach((a) => a.visible = false);
    lensNote.textContent = "Tetra lens: simplex-first view with 4 corners, 6 edge midpoints, 4 face centroids, and v0 at the tetra centroid.";
    camera.position.set(0.0, 2.8, 8.6);
    controls.target.set(0, -0.2, 0);
  } else {
    setPositions(SHEET_POSITIONS);
    upstairsPlane.mesh.visible = true;
    upstairsPlane.edge.visible = true;
    downstairsPlane.mesh.visible = true;
    downstairsPlane.edge.visible = true;
    stairsPlane.mesh.visible = true;
    stairsPlane.edge.visible = true;
    cube.visible = true;
    stairsLine.visible = true;
    arrows.forEach((a) => a.visible = true);
    lensNote.textContent = "Sheet lens: analysis view with tilted sheets preserved.";
    camera.position.set(5.8, 4.0, 7.2);
    controls.target.set(0, 0.1, 0);
  }
  camera.updateProjectionMatrix();
}

function projectToScreen(vec3) {
  const p = vec3.clone().project(camera);
  const x = (p.x * 0.5 + 0.5) * stage.clientWidth;
  const y = (-p.y * 0.5 + 0.5) * stage.clientHeight;
  return { x, y, visible: p.z < 1 };
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

function animate() {
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
lensSelect.addEventListener("change", (e) => applyLens(e.target.value));

loadShellGrammar().then(applyGrammarToUI);
applyLens(lensSelect?.value || "sheet");
animate();
