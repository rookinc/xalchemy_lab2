export const initialState = Object.freeze({
  hostMode: 0,
  activeSlot: 0,
  phaseSign: 1,
  datasetId: 'local_patch_v0',
  discoveryMode: 'seeded',
  stepCount: 0,
  lastAction: 'boot',
  anchorVertexOverride: null,
});

export function createState() {
  return { ...initialState };
}

export function resetStateValues(state) {
  Object.assign(state, createState(), { lastAction: 'reset' });
}

export function snapshotProbeState(state) {
  return {
    hostMode: state.hostMode,
    activeSlot: state.activeSlot,
    phaseSign: state.phaseSign,
    stepCount: state.stepCount,
    anchorVertexOverride: state.anchorVertexOverride || null,
  };
}

export function restoreProbeState(state, snap) {
  state.hostMode = snap.hostMode;
  state.activeSlot = snap.activeSlot;
  state.phaseSign = snap.phaseSign;
  state.stepCount = snap.stepCount;
  state.anchorVertexOverride = snap.anchorVertexOverride;
}
