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

function pcPhaseKey(phaseSign) {
  return phaseSign === 1 ? "+" : "-";
}

function pcRowLabel(state = {}, anchorId = null) {
  const hostMode = state?.hostMode ?? "?";
  const activeSlot = state?.activeSlot ?? "?";
  const phase = pcPhaseKey(state?.phaseSign);
  const anchor = anchorId ?? state?.anchorVertexOverride ?? "(none)";
  return `${anchor}@Q${hostMode}${activeSlot}${phase}`;
}

function pcBuildWitnessRow(anchorId, data, state = null) {
  return {
    anchor: anchorId ?? data?.anchor ?? data?.coupler ?? null,
    label: pcRowLabel(state, anchorId ?? data?.anchor ?? data?.coupler ?? null),
    state,
    data,
    w0: pcCanonW0(data),
    w1Sharp: pcCanonW1Sharp(data),
    w2: pcCanonW2(data),
    w2Sharp: pcCanonW2Sharp(data)
  };
}

export function pcRunWitnessSmokeFromReadout(readout, options = {}) {
  const data = pcExtractWitnessDataFromReadout(readout, options);
  const row = pcBuildWitnessRow(readout?.coupler || data?.anchor || null, data, null);
  return pcBuildWitnessDebugDump(row);
}

export function pcRunWitnessSmokeFromPipeline(pipe, options = {}) {
  const data = pcExtractWitnessDataFromPipeline(pipe, options);
  const anchorId =
    pipe?.readout?.coupler ||
    pipe?.anchor?.anchorVertex ||
    data?.anchor ||
    null;

  const state = pipe?.graphState?.state || null;
  const row = pcBuildWitnessRow(anchorId, data, state);
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

    rows.push(pcBuildWitnessRow(anchorId, data, state));
  }

  const report = pcBuildWitnessCollisionReport(rows);
  return {
    ...report,
    rows
  };
}
