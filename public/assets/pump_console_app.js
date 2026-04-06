import '/assets/pump_console_witness_debug.js';
import { pcRunWitnessSmokeFromState, pcRunWitnessSurveySmokeFromStates } from '/assets/pump_console_witness_smoke.js';
import { getEls } from '/assets/pump_console_dom.js';
import { createState } from '/assets/pump_console_state.js';
import { writeLine } from '/assets/pump_console_log.js';
import { render } from '/assets/pump_console_view.js';
import {
  boot,
  stepPump,
  traceStep,
  deriveTrace,
  frameSweep,
  anchorSweep,
  orbitSweep,
  runCycle,
  resetConsoleState,
  dumpState,
  clearConsole,
} from '/assets/pump_console_actions.js';

const state = createState();
const els = getEls();

els.datasetSelect.addEventListener('change', (e) => {
  state.datasetId = e.target.value;
  state.lastAction = 'dataset-change';
  void render(state, els);
  writeLine(els, 'DATASET', `dataset -> ${state.datasetId}`);
});

els.modeSelect.addEventListener('change', (e) => {
  state.discoveryMode = e.target.value;
  state.lastAction = 'mode-change';
  void render(state, els);
  writeLine(els, 'MODE', `discovery mode -> ${state.discoveryMode}`);
});

els.bootBtn.addEventListener('click', () => { void boot(state, els); });
els.stepBtn.addEventListener('click', () => { void stepPump(state, els, true); });
els.traceBtn.addEventListener('click', () => { void traceStep(state, els); });
els.deriveBtn.addEventListener('click', () => { void deriveTrace(state, els); });
els.sweepBtn.addEventListener('click', () => { void frameSweep(state, els); });
els.anchorSweepBtn.addEventListener('click', () => { void anchorSweep(state, els); });
els.orbitSweepBtn.addEventListener('click', () => { void orbitSweep(state, els); });
els.cycleBtn.addEventListener('click', () => { void runCycle(state, els); });
els.resetBtn.addEventListener('click', () => { void resetConsoleState(state, els); });
els.dumpBtn.addEventListener('click', () => { void dumpState(state, els); });
els.clearBtn.addEventListener('click', () => { void clearConsole(state, els); });

void boot(state, els).then(async () => {
  try {
    const witness = await pcRunWitnessSmokeFromState(state);
    writeLine(els, 'WITNESS', JSON.stringify(witness, null, 2));
  } catch (err) {
    writeLine(els, 'WITNESS_ERR', err?.stack || err?.message || String(err));
  }

  try {
    const baseState = {
      hostMode: 0,
      activeSlot: 0,
      phaseSign: 1,
      datasetId: 'full_graph_placeholder',
      discoveryMode: 'structure',
      stepCount: 0,
      lastAction: 'survey',
    };

    const survey = await pcRunWitnessSurveySmokeFromStates([
      { ...baseState, anchorVertexOverride: 'v0' },
      { ...baseState, anchorVertexOverride: 'v1' },
      { ...baseState, anchorVertexOverride: 'v2' },
      { ...baseState, anchorVertexOverride: 'v3' },
      { ...baseState, anchorVertexOverride: 'v4' },
      { ...baseState, anchorVertexOverride: 'v5' },
      { ...baseState, anchorVertexOverride: 'v6' },
      { ...baseState, anchorVertexOverride: 'v7' },
      { ...baseState, anchorVertexOverride: 'v8' },
      { ...baseState, anchorVertexOverride: 'v9' }
    ]);

    writeLine(els, 'WITNESS_SURVEY', JSON.stringify(survey, null, 2));
  } catch (err) {
    writeLine(els, 'WITNESS_SURVEY_ERR', err?.stack || err?.message || String(err));
  }
});
