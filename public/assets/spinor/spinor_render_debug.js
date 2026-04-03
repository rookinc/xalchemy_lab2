import * as THREE from '/assets/vendor/three/three.module.js';
import { OrbitControls } from '/assets/vendor/three/OrbitControls.js';
import {
  buildSpinorScene,
  buildSpinorStateHistory,
  buildSpinorHistoryScene,
} from '/assets/spinor/spinor_scene.js';
import {
  buildSpinorObject,
  buildSpinorHistoryObject,
} from '/assets/spinor/spinor_render.js';

const canvas = document.getElementById('stage');
const modeText = document.getElementById('mode-text');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x081019);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(2.7, 2.1, 3.5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.0);
key.position.set(4, 5, 3);
scene.add(key);

const grid = new THREE.GridHelper(12, 24, 0x2f5d9a, 0x1d3557);
grid.position.y = -1.4;
scene.add(grid);

let activeObject = null;
let showingHistory = false;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function clearActive() {
  if (activeObject) {
    scene.remove(activeObject);
    activeObject = null;
  }
}

function renderSingle() {
  clearActive();
  const payload = buildSpinorScene(
    { frame: 0, phase: 0, sheet: '+' },
    { showLabels: false, showScaffold: true }
  );
  activeObject = buildSpinorObject(payload);
  scene.add(activeObject);
  modeText.textContent = 'single';
  showingHistory = false;
}

function renderHistory() {
  clearActive();
  const states = buildSpinorStateHistory(
    { frame: 0, phase: 0, sheet: '+' },
    ['tau', 'mu', 'g15'],
    30
  );
  const payload = buildSpinorHistoryScene(states, {
    showLabels: false,
    showScaffold: true,
  });
  activeObject = buildSpinorHistoryObject(payload);
  scene.add(activeObject);
  modeText.textContent = 'history';
  showingHistory = true;
}

document.getElementById('single-btn').addEventListener('click', renderSingle);
document.getElementById('history-btn').addEventListener('click', renderHistory);
document.getElementById('toggle-btn').addEventListener('click', () => {
  if (showingHistory) renderSingle();
  else renderHistory();
});

window.addEventListener('resize', resize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
renderSingle();
animate();
