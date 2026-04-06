import {
  pcRunWitnessSmokeFromReadout,
  pcRunWitnessSmokeFromPipeline,
  pcRunWitnessSmokeFromState,
  pcRunWitnessSurveySmokeFromStates
} from "./pump_console_witness_smoke.js";
import { pipelineFromGraph } from "./pump_console_graph_adapter.js";

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
    }
  };

  return target.pcWitnessDebug;
}

if (typeof window !== "undefined") {
  installPumpConsoleWitnessDebug(window);
}
