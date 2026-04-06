import { pipelineFromGraph } from "./pump_console_graph_adapter.js";
import {
  pcExtractWitnessDataFromPipeline,
  pcExtractWitnessDataFromReadout
} from "./pump_console_witness_extract.js";
import {
  pcCanonW0,
  pcCanonW1Sharp,
  pcCanonW2,
  pcCanonW2Sharp
} from "./pump_console_witness_canon.js";
import {
  pcBuildWitnessCollisionReport,
  pcBuildWitnessDebugDump
} from "./pump_console_witness_report.js";

function pcBuildWitnessRow(anchorId, data) {
  return {
    anchor: anchorId ?? data?.anchor ?? data?.coupler ?? null,
    data,
    w0: pcCanonW0(data),
    w1Sharp: pcCanonW1Sharp(data),
    w2: pcCanonW2(data),
    w2Sharp: pcCanonW2Sharp(data)
  };
}

export function pcRunWitnessSmokeFromReadout(readout, options = {}) {
  const data = pcExtractWitnessDataFromReadout(readout, options);
  const row = pcBuildWitnessRow(readout?.coupler || data?.anchor || null, data);
  return pcBuildWitnessDebugDump(row);
}

export function pcRunWitnessSmokeFromPipeline(pipe, options = {}) {
  const data = pcExtractWitnessDataFromPipeline(pipe, options);
  const anchorId =
    pipe?.readout?.coupler ||
    pipe?.anchor?.anchorVertex ||
    data?.anchor ||
    null;

  const row = pcBuildWitnessRow(anchorId, data);
  return pcBuildWitnessDebugDump(row);
}

export async function pcRunWitnessSmokeFromState(state, options = {}) {
  const pipe = await pipelineFromGraph(state);
  return pcRunWitnessSmokeFromPipeline(pipe, options);
}

export async function pcRunWitnessSurveySmokeFromStates(states, options = {}) {
  const rows = [];

  for (const state of states) {
    const pipe = await pipelineFromGraph(state);
    const data = pcExtractWitnessDataFromPipeline(pipe, options);
    const anchorId =
      pipe?.readout?.coupler ||
      pipe?.anchor?.anchorVertex ||
      data?.anchor ||
      null;

    rows.push(pcBuildWitnessRow(anchorId, data));
  }

  return pcBuildWitnessCollisionReport(rows);
}
