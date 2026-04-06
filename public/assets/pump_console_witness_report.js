import {
  pcGroupRowsByKey,
  pcSummarizeWitnessSurvey
} from "./pump_console_witness_compare.js";

export function pcBuildWitnessCollisionReport(rows) {
  return {
    summary: pcSummarizeWitnessSurvey(rows),
    collisions: {
      w0: pcGroupRowsByKey(rows, "w0").filter((g) => g.size > 1),
      w1Sharp: pcGroupRowsByKey(rows, "w1Sharp").filter((g) => g.size > 1),
      w2: pcGroupRowsByKey(rows, "w2").filter((g) => g.size > 1),
      w2Sharp: pcGroupRowsByKey(rows, "w2Sharp").filter((g) => g.size > 1)
    }
  };
}

export function pcBuildWitnessDebugDump(row) {
  return {
    anchor: row.anchor,
    w0: row.w0,
    w1Sharp: row.w1Sharp,
    w2: row.w2,
    w2Sharp: row.w2Sharp,
    data: row.data
  };
}
