import { D4GrowthEngine } from "./kernel/d4_growth_engine.js";
import {
  createUIState,
  setDisplayMode,
  setPauseAt,
  setHz,
  setStatus,
  applyLadderDefaults,
  buildUIReadout,
  stageLabelText,
  cameraReadoutText
} from "./kernel/d4_ui_state.js";
import {
  createDefaultCamera,
  zoomCamera,
  rotateCamera,
  panCamera,
  toggleOrbit,
  stepOrbit,
  applyCameraPreset,
  clamp
} from "./kernel/d4_camera.js";
import {
  resizeCanvasToDisplaySize,
  createProjector,
  clearStage,
  drawStageGrid,
  drawCenterGuides,
  drawStageFrame,
  drawStageLabel,
  drawTopRightReadout
} from "./kernel/d4_projector.js";
import { buildScaffoldPoints, renderScaffold } from "./kernel/d4_render_scaffold.js";
import { renderPrimeScene } from "./kernel/d4_render_prime.js";

const engine = new D4GrowthEngine();
const ui = createUIState();
ui.camera = createDefaultCamera();

<<<<<<< HEAD
ui.display.showTrurtle = true;
=======
ui.display.showSpinors = true;
ui.display.showTrurtle = true;
ui.display.showFaces = true;
>>>>>>> b198ef2 (ui stable)
ui.display.showEdges = true;
ui.display.showColorEdges = true;
ui.display.spinorOpacity = 0.28;
ui.display.leftFaceOpacity = 0.8;
ui.display.rightFaceOpacity = 0.8;
ui.display.showAxes = false;
ui.display.cameraPreset = "perspective_default";

const canvas = document.getElementById("stage-canvas");
const ctx = canvas.getContext("2d");

const els = {
<<<<<<< Updated upstream
  // top bar
=======
>>>>>>> Stashed changes
  toggleFaces: document.getElementById("toggle-faces"),
  toggleEdges: document.getElementById("toggle-edges"),
  leftFaceOpacitySlider: document.getElementById("left-face-opacity-slider"),
  rightFaceOpacitySlider: document.getElementById("right-face-opacity-slider"),
  resetBtn: document.getElementById("reset-btn"),
  stepBackBtn: document.getElementById("step-back-btn"),
  stepBtn: document.getElementById("step-btn"),
  playBtn: document.getElementById("play-btn"),

<<<<<<< Updated upstream
  // rail
=======
>>>>>>> Stashed changes
  displayModeSelect: document.getElementById("display-mode-select"),
  toggleColorEdges: document.getElementById("toggle-color-edges"),
  toggleTrurtle: document.getElementById("toggle-trurtle"),
  toggleSpinors: document.getElementById("toggle-spinors"),
  spinorOpacityField: document.getElementById("spinor-opacity-field"),
  spinorOpacitySlider: document.getElementById("spinor-opacity-slider"),
  pauseAtInput: document.getElementById("pause-at-input"),
  hzInput: document.getElementById("hz-input"),
  cameraPresetSelect: document.getElementById("camera-preset-select"),
  toggleGrid: document.getElementById("toggle-grid"),
  toggleAxes: document.getElementById("toggle-axes"),
  toggleLabels: document.getElementById("toggle-labels"),
  zoomSlider: document.getElementById("zoom-slider"),

<<<<<<< Updated upstream
  // stage footer
=======
>>>>>>> Stashed changes
  statusText: document.getElementById("status-text"),
  metricTurn: document.getElementById("metric-turn"),
  metricCameraDistance: document.getElementById("metric-camera-distance"),
  metricCameraYaw: document.getElementById("metric-camera-yaw"),
  metricCameraPitch: document.getElementById("metric-camera-pitch"),

<<<<<<< Updated upstream
  // hidden bindings + console
=======
>>>>>>> Stashed changes
  metricCurrent: document.getElementById("metric-current"),
  metricCells: document.getElementById("metric-cells"),
  metricFaces: document.getElementById("metric-faces"),
  metricOpenVertices: document.getElementById("metric-open-vertices"),
  metricPhase: document.getElementById("metric-phase"),
  metricResidue: document.getElementById("metric-residue"),
  metricIncrement: document.getElementById("metric-increment"),
  metricRegime: document.getElementById("metric-regime"),
  metricRung: document.getElementById("metric-rung"),
  metricAggregation: document.getElementById("metric-aggregation"),
  metricActiveTetra: document.getElementById("metric-active-tetra"),
  metricActiveFace: document.getElementById("metric-active-face"),
  metricActiveChirality: document.getElementById("metric-active-chirality"),
  metricTrurtle: document.getElementById("metric-trurtle"),
  metricEdges: document.getElementById("metric-edges"),
  metricColorEdges: document.getElementById("metric-color-edges"),
  metricLeftOpacity: document.getElementById("metric-left-opacity"),
  metricRightOpacity: document.getElementById("metric-right-opacity"),
  metricCameraPreset: document.getElementById("metric-camera-preset"),
  mobileCurrent: document.getElementById("mobile-current"),
  mobilePhase: document.getElementById("mobile-phase"),
  mobileResidue: document.getElementById("mobile-residue"),
  mobileRegime: document.getElementById("mobile-regime"),
  mobileActiveTetra: document.getElementById("mobile-active-tetra"),
  metricsConsole: document.getElementById("metrics-console")
};

let snapshot = engine.snapshot();
let projector = null;
let orbitFrame = null;
let playTimer = null;

function sliderPctToAlpha(value) {
  return clamp(Number(value) / 100, 0, 1);
}

function syncUIFlags() {
  ui.display.showFaces = els.toggleFaces?.checked ?? true;
  ui.display.showEdges = els.toggleEdges?.checked ?? true;
  ui.display.showColorEdges = els.toggleColorEdges?.checked ?? true;
  ui.display.showTrurtle = els.toggleTrurtle?.checked ?? true;
<<<<<<< HEAD
=======
  ui.display.showSpinors = els.toggleSpinors?.checked ?? true;
>>>>>>> b198ef2 (ui stable)
  ui.display.showLabels = els.toggleLabels?.checked ?? false;
  ui.display.showStageGrid = els.toggleGrid?.checked ?? true;
  ui.display.showAxes = els.toggleAxes?.checked ?? false;
  ui.display.spinorOpacity = sliderPctToAlpha(els.spinorOpacitySlider?.value ?? 28);
  ui.display.leftFaceOpacity = sliderPctToAlpha(els.leftFaceOpacitySlider?.value ?? 80);
  ui.display.rightFaceOpacity = sliderPctToAlpha(els.rightFaceOpacitySlider?.value ?? 80);
}

function syncZoomSlider() {
  if (els.zoomSlider) {
    els.zoomSlider.value = String(ui.camera.distance);
  }
}

function syncDisplayModeControl() {
  if (els.displayModeSelect) {
<<<<<<< HEAD
    els.displayModeSelect.value = ui.display.mode;
=======
    els.displayModeSelect.value = "prime";
>>>>>>> b198ef2 (ui stable)
  }
}

<<<<<<< Updated upstream
=======
function syncPauseAtInput() {
  if (!els.pauseAtInput) return;
  if (Number.isFinite(ui.playback.pauseAtD4s) && ui.playback.pauseAtD4s > 0) {
    els.pauseAtInput.value = String(ui.playback.pauseAtD4s);
    els.pauseAtInput.placeholder = "";
  } else {
    els.pauseAtInput.value = "";
    els.pauseAtInput.placeholder = "off";
  }
}

<<<<<<< HEAD
>>>>>>> Stashed changes
=======
function syncSpinorOpacityVisibility() {
  if (!els.spinorOpacityField) return;
  els.spinorOpacityField.classList.toggle("is-hidden", !ui.display.showSpinors);
}

function syncSpinorOpacitySlider() {
  if (!els.spinorOpacitySlider) return;
  els.spinorOpacitySlider.value = String(Math.round((ui.display.spinorOpacity ?? 0.28) * 100));
}

>>>>>>> b198ef2 (ui stable)
function formatConsole(readout) {
  return [
    `current_d4s      : ${readout.currentD4s}`,
    `turn             : ${readout.turnIndex}`,
    `cells            : ${readout.topology.cells}`,
    `exposed_faces    : ${readout.topology.exposedFaces}`,
    `open_vertices    : ${readout.topology.openVertices}`,
    `phase            : ${readout.cyclePhase}`,
    `residue          : ${readout.cycleResidue}`,
    `increment_target : ${readout.incrementTarget}`,
    `regime           : ${readout.regime}`,
    `rung             : ${readout.rungValue}`,
    `aggregation      : ${readout.display.aggregationMode}`,
    `active_tetra     : ${readout.activeTetraId ?? "-"}`,
    `active_face      : ${readout.activeFaceLabel ?? "-"}`,
    `active_chirality : ${readout.activeChirality ?? "-"}`,
<<<<<<< HEAD
=======
    `spinors          : ${ui.display.showSpinors ? "on" : "off"}`,
    `spinor_opacity   : ${Math.round((ui.display.spinorOpacity ?? 0.28) * 100)}%`,
>>>>>>> b198ef2 (ui stable)
    `trurtle          : ${ui.display.showTrurtle ? "on" : "off"}`,
    `edges            : ${ui.display.showEdges ? "on" : "off"}`,
    `color_edges      : ${ui.display.showColorEdges ? "on" : "off"}`,
    `left_opacity     : ${Math.round(ui.display.leftFaceOpacity * 100)}%`,
    `right_opacity    : ${Math.round(ui.display.rightFaceOpacity * 100)}%`,
    `camera_distance  : ${readout.camera.distance}`,
    `camera_yaw       : ${readout.camera.yaw}`,
    `camera_pitch     : ${readout.camera.pitch}`,
    `camera_preset    : ${ui.display.cameraPreset}`
  ].join("\n");
}

function updateReadouts() {
  const readout = buildUIReadout(ui, snapshot);

  if (els.statusText) els.statusText.textContent = readout.statusText;
  if (els.metricTurn) els.metricTurn.textContent = String(readout.turnIndex);
  if (els.metricCameraDistance) els.metricCameraDistance.textContent = readout.camera.distance;
  if (els.metricCameraYaw) els.metricCameraYaw.textContent = readout.camera.yaw;
  if (els.metricCameraPitch) els.metricCameraPitch.textContent = readout.camera.pitch;

  if (els.metricCurrent) els.metricCurrent.textContent = String(readout.currentD4s);
  if (els.metricCells) els.metricCells.textContent = String(readout.topology.cells);
  if (els.metricFaces) els.metricFaces.textContent = String(readout.topology.exposedFaces);
  if (els.metricOpenVertices) els.metricOpenVertices.textContent = String(readout.topology.openVertices);
  if (els.metricPhase) els.metricPhase.textContent = readout.cyclePhase;
  if (els.metricResidue) els.metricResidue.textContent = String(readout.cycleResidue);
  if (els.metricIncrement) els.metricIncrement.textContent = String(readout.incrementTarget);
  if (els.metricRegime) els.metricRegime.textContent = readout.regime;
  if (els.metricRung) els.metricRung.textContent = String(readout.rungValue);
  if (els.metricAggregation) els.metricAggregation.textContent = readout.display.aggregationMode;
  if (els.metricActiveTetra) els.metricActiveTetra.textContent = readout.activeTetraId ?? "-";
  if (els.metricActiveFace) els.metricActiveFace.textContent = readout.activeFaceLabel ?? "-";
  if (els.metricActiveChirality) els.metricActiveChirality.textContent = readout.activeChirality ?? "-";
  if (els.metricTrurtle) els.metricTrurtle.textContent = ui.display.showTrurtle ? "on" : "off";
  if (els.metricEdges) els.metricEdges.textContent = ui.display.showEdges ? "on" : "off";
  if (els.metricColorEdges) els.metricColorEdges.textContent = ui.display.showColorEdges ? "on" : "off";
  if (els.metricLeftOpacity) els.metricLeftOpacity.textContent = `${Math.round(ui.display.leftFaceOpacity * 100)}%`;
  if (els.metricRightOpacity) els.metricRightOpacity.textContent = `${Math.round(ui.display.rightFaceOpacity * 100)}%`;
  if (els.metricCameraPreset) els.metricCameraPreset.textContent = ui.display.cameraPreset;

  if (els.mobileCurrent) els.mobileCurrent.textContent = String(readout.currentD4s);
  if (els.mobilePhase) els.mobilePhase.textContent = readout.cyclePhase;
  if (els.mobileResidue) els.mobileResidue.textContent = String(readout.cycleResidue);
  if (els.mobileRegime) els.mobileRegime.textContent = readout.regime;
  if (els.mobileActiveTetra) els.mobileActiveTetra.textContent = readout.activeTetraId ?? "-";

  if (els.metricsConsole) {
    els.metricsConsole.textContent = formatConsole(readout);
  }
}

function draw() {
  resizeCanvasToDisplaySize(canvas, ctx);
  syncUIFlags();

  applyLadderDefaults(ui, snapshot.currentD4s);
<<<<<<< HEAD

  const mode = ui.display.mode;
  ui.camera.projectionMode = mode === "cubic" ? "orthographic" : "perspective";
=======
  setDisplayMode(ui, "prime");
  ui.camera.projectionMode = "perspective";
>>>>>>> b198ef2 (ui stable)
  projector = createProjector(canvas, ui.camera);

  syncZoomSlider();
  syncDisplayModeControl();
<<<<<<< Updated upstream
=======
  syncPauseAtInput();
<<<<<<< HEAD
>>>>>>> Stashed changes
=======
  syncSpinorOpacitySlider();
  syncSpinorOpacityVisibility();
>>>>>>> b198ef2 (ui stable)

  clearStage(ctx, canvas);
  drawStageGrid(ctx, canvas, ui.display.showStageGrid);
  drawCenterGuides(ctx, canvas);

  const spinorPoints = buildScaffoldPoints(snapshot.currentD4s);

<<<<<<< HEAD
  if (ui.display.showTrurtle && (mode === "scaffold" || mode === "hybrid")) {
    renderScaffold(ctx, scaffoldPoints, projector, {
=======
  if (ui.display.showSpinors) {
    renderScaffold(ctx, spinorPoints, projector, {
>>>>>>> b198ef2 (ui stable)
      showFaces: ui.display.showFaces,
      showLabels: ui.display.showLabels,
      alphaScale: ui.display.spinorOpacity ?? 0.28
    });
  }

  renderPrimeScene(ctx, snapshot, projector, {
    showFaces: ui.display.showFaces,
    showEdges: ui.display.showEdges,
    showColorEdges: ui.display.showColorEdges,
    showLabels: ui.display.showLabels,
    highlightActive: true,
    leftFaceOpacity: ui.display.leftFaceOpacity,
    rightFaceOpacity: ui.display.rightFaceOpacity
  });

  drawStageFrame(ctx, canvas);
  drawStageLabel(ctx, canvas, stageLabelText(snapshot), snapshot.currentD4s > 0);
  drawTopRightReadout(ctx, canvas, cameraReadoutText(ui));
  updateReadouts();
}

function stopPlayTimer() {
  if (playTimer !== null) {
    clearInterval(playTimer);
    playTimer = null;
  }
  ui.playback.isPlaying = false;
  if (els.playBtn) els.playBtn.textContent = "▶";
}

function startPlayTimer() {
  stopPlayTimer();
  ui.playback.isPlaying = true;
  if (els.playBtn) els.playBtn.textContent = "❚❚";

  const delay = Math.max(16, Math.round(1000 / Math.max(1, ui.playback.hz)));
  playTimer = setInterval(() => {
    snapshot = engine.step();

    if (
      Number.isFinite(ui.playback.pauseAtD4s) &&
      ui.playback.pauseAtD4s > 0 &&
      snapshot.currentD4s >= ui.playback.pauseAtD4s
    ) {
      const hit = ui.playback.pauseAtD4s;
      stopPlayTimer();
      ui.playback.pauseAtD4s = Infinity;

      if (els.pauseAtInput) {
        els.pauseAtInput.value = "";
        els.pauseAtInput.placeholder = "off";
      }

      setStatus(ui, `auto-paused at ${snapshot.currentD4s}; threshold ${hit} cleared`);
      draw();
      return;
    }

    draw();
  }, delay);
}

function ensureOrbitLoop() {
  if (orbitFrame !== null) return;
  const loop = () => {
    orbitFrame = requestAnimationFrame(loop);
    if (ui.camera.orbitEnabled && !ui.playback.isPlaying) {
      stepOrbit(ui.camera, 0.004);
      draw();
    }
  };
  orbitFrame = requestAnimationFrame(loop);
}

function pointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function applyPreset(name) {
  if (!name) return;

  if (name === "perspective_default") {
    ui.camera.projectionMode = "perspective";
    ui.camera.panX = 0;
    ui.camera.panY = 0;
    ui.camera.distance = 15;
    ui.camera.yaw = 0;
    ui.camera.pitch = 0;
  } else if (name === "perspective_15_0_0") {
    ui.camera.projectionMode = "perspective";
    ui.camera.panX = 0;
    ui.camera.panY = 0;
    ui.camera.distance = 15;
    ui.camera.yaw = 0;
    ui.camera.pitch = 0;
  } else {
    applyCameraPreset(ui.camera, name);
  }

  ui.display.cameraPreset = name;
  setStatus(ui, `camera preset: ${name}`);
}

els.displayModeSelect?.addEventListener("change", () => {
<<<<<<< HEAD
  setDisplayMode(ui, els.displayModeSelect.value);
  setStatus(ui, `display mode: ${ui.display.mode}`);
=======
  setDisplayMode(ui, "prime");
  if (els.displayModeSelect) {
    els.displayModeSelect.value = "prime";
  }
  setStatus(ui, "render mode: prime");
>>>>>>> b198ef2 (ui stable)
  draw();
});

els.pauseAtInput?.addEventListener("change", () => {
<<<<<<< Updated upstream
  setPauseAt(ui, els.pauseAtInput.value);
  setStatus(ui, `pause threshold set to ${ui.playback.pauseAtD4s}`);
=======
  const raw = String(els.pauseAtInput.value ?? "").trim();

  if (!raw) {
    ui.playback.pauseAtD4s = Infinity;
    els.pauseAtInput.placeholder = "off";
    setStatus(ui, "auto-pause off");
  } else {
    setPauseAt(ui, raw);
    setStatus(ui, `pause threshold set to ${ui.playback.pauseAtD4s}`);
  }

>>>>>>> Stashed changes
  draw();
});

els.hzInput?.addEventListener("change", () => {
  setHz(ui, els.hzInput.value);
  if (ui.playback.isPlaying) startPlayTimer();
  setStatus(ui, `rate set to ${ui.playback.hz} hz`);
  draw();
});

els.cameraPresetSelect?.addEventListener("change", () => {
  applyPreset(els.cameraPresetSelect.value);
  draw();
});

els.zoomSlider?.addEventListener("input", () => {
  ui.camera.distance = clamp(Number(els.zoomSlider.value), 4.5, 60);
  setStatus(ui, `zoom set to ${ui.camera.distance.toFixed(1)}`);
  draw();
});

els.spinorOpacitySlider?.addEventListener("input", () => {
  ui.display.spinorOpacity = sliderPctToAlpha(els.spinorOpacitySlider.value);
  setStatus(ui, `spinor opacity set to ${els.spinorOpacitySlider.value}%`);
  draw();
});

els.leftFaceOpacitySlider?.addEventListener("input", () => {
  setStatus(ui, `left opacity set to ${els.leftFaceOpacitySlider.value}%`);
  draw();
});

els.rightFaceOpacitySlider?.addEventListener("input", () => {
  setStatus(ui, `right opacity set to ${els.rightFaceOpacitySlider.value}%`);
  draw();
});

[
  els.toggleFaces,
  els.toggleEdges,
  els.toggleColorEdges,
  els.toggleTrurtle,
  els.toggleSpinors,
  els.toggleGrid,
  els.toggleAxes,
  els.toggleLabels
].forEach((el) => el?.addEventListener("change", draw));

els.resetBtn?.addEventListener("click", () => {
  engine.reset();
  snapshot = engine.snapshot();
  stopPlayTimer();
  setStatus(ui, "reset to seed");
  draw();
});

els.stepBackBtn?.addEventListener("click", () => {
  stopPlayTimer();
  engine.reset();
  snapshot = engine.snapshot();
  setStatus(ui, "step back not yet implemented");
  draw();
});

els.stepBtn?.addEventListener("click", () => {
  stopPlayTimer();
  snapshot = engine.step();
  setStatus(ui, "stepped");
  draw();
});

els.playBtn?.addEventListener("click", () => {
  if (ui.playback.isPlaying) {
    stopPlayTimer();
    setStatus(ui, "paused");
  } else {
    startPlayTimer();
    setStatus(ui, `running at ${ui.playback.hz} hz`);
  }
  draw();
});

canvas.addEventListener("contextmenu", (event) => event.preventDefault());

canvas.addEventListener("pointerdown", (event) => {
  ui.drag.lastPointer = pointerPos(event);
  if (event.button === 2 || event.shiftKey) {
    ui.drag.mode = "pan";
    canvas.classList.remove("rotating");
    canvas.classList.add("panning");
  } else {
    ui.drag.mode = "rotate";
    canvas.classList.add("rotating");
    canvas.classList.remove("panning");
  }
});

window.addEventListener("pointermove", (event) => {
  if (!ui.drag.mode) return;
  const p = pointerPos(event);
  const dx = p.x - ui.drag.lastPointer.x;
  const dy = p.y - ui.drag.lastPointer.y;
  ui.drag.lastPointer = p;

  if (ui.drag.mode === "rotate") {
    rotateCamera(ui.camera, dx, dy);
  } else {
    panCamera(ui.camera, dx, dy);
  }
  draw();
});

window.addEventListener("pointerup", () => {
  ui.drag.mode = null;
  canvas.classList.remove("rotating");
  canvas.classList.remove("panning");
});

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    zoomCamera(ui.camera, event.deltaY);
    draw();
  },
  { passive: false }
);

window.addEventListener("resize", draw);

<<<<<<< HEAD
setDisplayMode(ui, els.displayModeSelect?.value || "prime");
<<<<<<< Updated upstream
setPauseAt(ui, els.pauseAtInput?.value || 900);
=======
=======
setDisplayMode(ui, "prime");
if (els.displayModeSelect) {
  els.displayModeSelect.value = "prime";
}
>>>>>>> b198ef2 (ui stable)

const initialPause = String(els.pauseAtInput?.value ?? "").trim();
if (initialPause) {
  setPauseAt(ui, initialPause);
} else {
  ui.playback.pauseAtD4s = Infinity;
}

>>>>>>> Stashed changes
setHz(ui, els.hzInput?.value || 30);
applyPreset(els.cameraPresetSelect?.value || "perspective_default");

draw();
ensureOrbitLoop();
