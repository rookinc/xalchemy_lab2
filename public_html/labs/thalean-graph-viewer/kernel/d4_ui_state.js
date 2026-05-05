import {
  D4_DISPLAY_MODES,
  createDefaultPlaybackState,
} from "./d4_spec.js";
import { createDefaultCamera, cameraReadout } from "./d4_camera.js";
import { describeLadderState, applyRegimeToDisplayState } from "./d4_ladder.js";

export function createUIState() {
  return {
    playback: createDefaultPlaybackState(),
    camera: createDefaultCamera(),
    display: {
      mode: "prime",
      showStageGrid: true,
      showFaces: true,
      showLabels: false,
      showScaffold: false,
      showPrime: true,
      showComposite: true,
      cameraPreset: "junction",
      aggregationMode: "none",
      labelDensity: "high",
    },
    drag: {
      mode: null,
      lastPointer: { x: 0, y: 0 },
    },
    statusText: "ready",
  };
}

export function setDisplayMode(uiState, mode) {
  if (!D4_DISPLAY_MODES.includes(mode)) return uiState.display.mode;
  uiState.display.mode = mode;

  if (mode === "scaffold") {
    uiState.display.showScaffold = true;
    uiState.display.showPrime = false;
    uiState.display.showComposite = false;
  } else if (mode === "prime") {
    uiState.display.showScaffold = false;
    uiState.display.showPrime = true;
    uiState.display.showComposite = false;
  } else if (mode === "prime_plus_composite") {
    uiState.display.showScaffold = false;
    uiState.display.showPrime = true;
    uiState.display.showComposite = true;
  } else if (mode === "hybrid") {
    uiState.display.showScaffold = true;
    uiState.display.showPrime = true;
    uiState.display.showComposite = true;
  } else if (mode === "cubic") {
    uiState.display.showScaffold = false;
    uiState.display.showPrime = false;
    uiState.display.showComposite = false;
  }

  return uiState.display.mode;
}

export function setPauseAt(uiState, value) {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 0) {
    uiState.playback.pauseAtD4s = Math.floor(n);
  }
  return uiState.playback.pauseAtD4s;
}

export function setHz(uiState, value) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    uiState.playback.hz = n;
  }
  return uiState.playback.hz;
}

export function togglePlay(uiState) {
  uiState.playback.isPlaying = !uiState.playback.isPlaying;
  uiState.statusText = uiState.playback.isPlaying ? "running" : "paused";
  return uiState.playback.isPlaying;
}

export function stopPlayback(uiState, statusText = "paused") {
  uiState.playback.isPlaying = false;
  uiState.statusText = statusText;
}

export function setStatus(uiState, statusText) {
  uiState.statusText = statusText;
}

export function applyLadderDefaults(uiState, currentD4s) {
  uiState.display = applyRegimeToDisplayState(currentD4s, uiState.display);
  return uiState.display;
}

export function buildUIReadout(uiState, sceneSnapshot) {
  const ladder = describeLadderState(sceneSnapshot.currentD4s);
  const camera = cameraReadout(uiState.camera);

  return {
    currentD4s: sceneSnapshot.currentD4s,
    turnIndex: sceneSnapshot.turnIndex,
    activeTetraId: sceneSnapshot.activeTetraId,
    activeFaceLabel: sceneSnapshot.activeFaceLabel,
    activeChirality: sceneSnapshot.activeChirality,
    cyclePhase: sceneSnapshot.cycle.phase,
    cycleResidue: sceneSnapshot.cycle.residue,
    regime: ladder.regimeTitle,
    regimeDescription: ladder.regimeDescription,
    rungValue: ladder.rungValue,
    incrementTarget: ladder.incrementTarget,
    topology: sceneSnapshot.topology,
    playback: {
      pauseAtD4s: uiState.playback.pauseAtD4s,
      hz: uiState.playback.hz,
      isPlaying: uiState.playback.isPlaying,
    },
    display: {
      mode: uiState.display.mode,
      showStageGrid: uiState.display.showStageGrid,
      showFaces: uiState.display.showFaces,
      showLabels: uiState.display.showLabels,
      showScaffold: uiState.display.showScaffold,
      showPrime: uiState.display.showPrime,
      showComposite: uiState.display.showComposite,
      aggregationMode: uiState.display.aggregationMode,
      labelDensity: uiState.display.labelDensity,
    },
    camera,
    statusText: uiState.statusText,
  };
}

export function stageLabelText(sceneSnapshot) {
  return `${sceneSnapshot.currentD4s} > STAGE`;
}

export function cameraReadoutText(uiState) {
  const c = cameraReadout(uiState.camera);
  return `dist ${c.distance} · yaw ${c.yaw} · pitch ${c.pitch}`;
}
