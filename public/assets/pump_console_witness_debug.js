import {
  pcRunWitnessSmokeFromReadout,
  pcRunWitnessSmokeFromPipeline,
  pcRunWitnessSmokeFromState,
  pcRunWitnessSurveySmokeFromStates
} from "./pump_console_witness_smoke.js";
import { pipelineFromGraph } from "./pump_console_graph_adapter.js";
import { pcBuildWitnessCensus } from "./pump_console_witness_report.js";

function defaultWitnessState(overrides = {}) {
  return {
    hostMode: 0,
    activeSlot: 0,
    phaseSign: 1,
    datasetId: "local_patch_v0",
    discoveryMode: "seeded",
    stepCount: 0,
    lastAction: "debug",
    anchorVertexOverride: null,
    ...overrides
  };
}

function buildAnchorStates(count, baseOverrides = {}) {
  const base = defaultWitnessState(baseOverrides);
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    anchorVertexOverride: `v${i}`
  }));
}

export function installPumpConsoleWitnessDebug(target = window) {
  target.pcWitnessDebug = {
    defaultState: defaultWitnessState,

    async pipeline(overrides = {}) {
      return pipelineFromGraph(defaultWitnessState(overrides));
    },

    async smoke(overrides = {}) {
      return pcRunWitnessSmokeFromState(defaultWitnessState(overrides));
    },

    async smokeFromPipeline(overrides = {}) {
      const pipe = await pipelineFromGraph(defaultWitnessState(overrides));
      return pcRunWitnessSmokeFromPipeline(pipe);
    },

    async smokeFromReadout(overrides = {}) {
      const pipe = await pipelineFromGraph(defaultWitnessState(overrides));
      return pcRunWitnessSmokeFromReadout(pipe.readout);
    },

    async survey(stateOverridesList = []) {
      const states = stateOverridesList.map((overrides) => defaultWitnessState(overrides));
      return pcRunWitnessSurveySmokeFromStates(states);
    },

    async anchorSurvey(count = 60, overrides = {}) {
      const states = buildAnchorStates(count, overrides);
      return pcRunWitnessSurveySmokeFromStates(states);
    },

    async fullSurvey60() {
      return pcRunWitnessSurveySmokeFromStates(
        buildAnchorStates(60, {
          datasetId: "full_graph_placeholder",
          discoveryMode: "structure",
          hostMode: 0,
          activeSlot: 0,
          phaseSign: 1,
          lastAction: "debug-full-survey"
        })
      );
    },

    async fullSurvey60Census() {
      const survey = await pcRunWitnessSurveySmokeFromStates(
        buildAnchorStates(60, {
          datasetId: "full_graph_placeholder",
          discoveryMode: "structure",
          hostMode: 0,
          activeSlot: 0,
          phaseSign: 1,
          lastAction: "debug-full-survey"
        })
      );
      return {
        summary: survey.summary,
        collisions: survey.collisions,
        census: Array.isArray(survey.rows) ? pcBuildWitnessCensus(survey.rows) : null,
        rows: survey.rows || []
      };
    }
  };

  return target.pcWitnessDebug;
}

if (typeof window !== "undefined") {
  installPumpConsoleWitnessDebug(window);
}
