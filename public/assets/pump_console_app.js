import '/assets/pump_console_witness_debug.js';
import {
  pcRunWitnessSmokeFromState,
  pcRunWitnessSurveySmokeFromStates
} from '/assets/pump_console_witness_smoke.js';
import { pipelineFromGraph } from '/assets/pump_console_graph_adapter.js';
import { pcExtractWitnessDataFromPipeline } from '/assets/pump_console_witness_extract.js';
import {
  pcCanonW0,
  pcCanonW1Sharp,
  pcCanonW2,
  pcCanonW2Sharp
} from '/assets/pump_console_witness_canon.js';
import { pcBuildWitnessCensus } from '/assets/pump_console_witness_report.js';
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

function phaseKey(phaseSign) {
  return phaseSign === 1 ? '+' : '-';
}

function buildWitnessRowFromPipe(pipe) {
  const data = pcExtractWitnessDataFromPipeline(pipe);
  const anchor =
    pipe?.readout?.coupler ||
    pipe?.anchor?.anchorVertex ||
    data?.anchor ||
    null;

  const rowState = pipe?.graphState?.state || null;

  return {
    anchor,
    label: `${anchor}@Q${rowState?.hostMode ?? '?'}${rowState?.activeSlot ?? '?'}${phaseKey(rowState?.phaseSign)}`,
    state: rowState,
    data,
    w0: pcCanonW0(data),
    w1Sharp: pcCanonW1Sharp(data),
    w2: pcCanonW2(data),
    w2Sharp: pcCanonW2Sharp(data)
  };
}

async function buildSurveyRows(states) {
  const rows = [];
  for (const s of states) {
    const pipe = await pipelineFromGraph(s);
    rows.push(buildWitnessRowFromPipe(pipe));
  }
  return rows;
}

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

    const anchorIds = Array.from({ length: 60 }, (_, i) => `v${i}`);
    const states = anchorIds.map((anchorVertexOverride) => ({
      ...baseState,
      anchorVertexOverride
    }));

    const survey = await pcRunWitnessSurveySmokeFromStates(states);

    writeLine(
      els,
      'WITNESS_SURVEY_SUMMARY',
      [
        `dataset=${baseState.datasetId}`,
        `mode=${baseState.discoveryMode}`,
        `anchorCount=${anchorIds.length}`,
        `anchorRange=${anchorIds[0]}..${anchorIds[anchorIds.length - 1]}`,
        `uniqueW0=${survey.summary.uniqueW0}`,
        `uniqueW1Sharp=${survey.summary.uniqueW1Sharp}`,
        `uniqueW2=${survey.summary.uniqueW2}`,
        `uniqueW2Sharp=${survey.summary.uniqueW2Sharp}`,
        `W0 collisions=${survey.collisions.w0.length}`,
        `W1Sharp collisions=${survey.collisions.w1Sharp.length}`,
        `W2 collisions=${survey.collisions.w2.length}`,
        `W2Sharp collisions=${survey.collisions.w2Sharp.length}`
      ].join('\n')
    );

    writeLine(els, 'WITNESS_SURVEY', JSON.stringify(survey, null, 2));

    const rows = await buildSurveyRows(states);
    const census = pcBuildWitnessCensus(rows);
    const censusLines = census.text.split('\n');
    const preview = censusLines.slice(0, 20).join('\n');
    const suffix =
      censusLines.length > 20
        ? `\n... (${censusLines.length - 20} more anchors omitted from preview)`
        : '';

    writeLine(els, 'WITNESS_CENSUS_PREVIEW', `${preview}${suffix}`);
  } catch (err) {
    writeLine(els, 'WITNESS_SURVEY_ERR', err?.stack || err?.message || String(err));
  }
});
