import {
  buildSpinorScene,
  buildSpinorStateHistory,
  buildSpinorHistoryScene,
} from '/assets/spinor/spinor_scene.js';

const pre = document.getElementById('scene-debug');

const start = { frame: 0, phase: 0, sheet: '+' };
const ops = ['tau', 'mu', 'g15'];
const history = buildSpinorStateHistory(start, ops, 6);

const payload = {
  single: buildSpinorScene(start, { showLabels: true, showScaffold: true }),
  history: buildSpinorHistoryScene(history, { showLabels: false, showScaffold: true }),
};

pre.textContent = JSON.stringify(payload, null, 2);
