import { pcExtractWitnessData } from "./pump_console_witness_extract.js";
import {
  pcCanonW0,
  pcCanonW1Sharp,
  pcCanonW2,
  pcCanonW2Sharp
} from "./pump_console_witness_canon.js";

function pcPhaseKey(phaseSign) {
  return phaseSign === 1 ? "+" : "-";
}

function pcStateLabel(state = {}, anchorId = null) {
  const hostMode = state?.hostMode ?? "?";
  const activeSlot = state?.activeSlot ?? "?";
  const phase = pcPhaseKey(state?.phaseSign);
  const anchor = anchorId ?? state?.anchorVertexOverride ?? "(none)";
  return `${anchor}@Q${hostMode}${activeSlot}${phase}`;
}

export function pcSurveyWitnesses(graphAdapter, anchorIds, options = {}) {
  const rows = [];

  for (const anchorId of anchorIds) {
    const data = pcExtractWitnessData(graphAdapter, anchorId, options);
    rows.push({
      anchor: anchorId,
      label: pcStateLabel(options?.state, anchorId),
      state: options?.state || null,
      data,
      w0: pcCanonW0(data),
      w1Sharp: pcCanonW1Sharp(data),
      w2: pcCanonW2(data),
      w2Sharp: pcCanonW2Sharp(data)
    });
  }

  return rows;
}

export function pcGroupRowsByKey(rows, field) {
  const groups = new Map();

  for (const row of rows) {
    const key = row[field];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row.label || row.anchor);
  }

  return [...groups.entries()]
    .map(([key, labels]) => ({
      key,
      labels: [...labels].sort(),
      size: labels.length
    }))
    .sort((a, b) => b.size - a.size || a.key.localeCompare(b.key));
}

export function pcSummarizeWitnessSurvey(rows) {
  return {
    anchorCount: rows.length,
    uniqueW0: new Set(rows.map((r) => r.w0)).size,
    uniqueW1Sharp: new Set(rows.map((r) => r.w1Sharp)).size,
    uniqueW2: new Set(rows.map((r) => r.w2)).size,
    uniqueW2Sharp: new Set(rows.map((r) => r.w2Sharp)).size
  };
}
