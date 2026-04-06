function pcPhaseKey(phaseSign) {
  return phaseSign === 1 ? "+" : "-";
}

function pcRowLabel(row) {
  const state = row?.state || {};
  const hostMode = state?.hostMode ?? "?";
  const activeSlot = state?.activeSlot ?? "?";
  const phase = pcPhaseKey(state?.phaseSign);
  const anchor = row?.anchor ?? state?.anchorVertexOverride ?? "(none)";
  return `${anchor}@Q${hostMode}${activeSlot}${phase}`;
}

function pcGroupRowsByKeyWithLabels(rows, field) {
  const groups = new Map();

  for (const row of rows) {
    const key = row[field];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(pcRowLabel(row));
  }

  return [...groups.entries()]
    .map(([key, labels]) => ({
      key,
      labels: [...labels].sort(),
      size: labels.length
    }))
    .sort((a, b) => b.size - a.size || a.key.localeCompare(b.key));
}

export function pcBuildWitnessCollisionReport(rows) {
  return {
    summary: {
      anchorCount: rows.length,
      uniqueW0: new Set(rows.map((r) => r.w0)).size,
      uniqueW1Sharp: new Set(rows.map((r) => r.w1Sharp)).size,
      uniqueW2: new Set(rows.map((r) => r.w2)).size,
      uniqueW2Sharp: new Set(rows.map((r) => r.w2Sharp)).size
    },
    collisions: {
      w0: pcGroupRowsByKeyWithLabels(rows, "w0").filter((g) => g.size > 1),
      w1Sharp: pcGroupRowsByKeyWithLabels(rows, "w1Sharp").filter((g) => g.size > 1),
      w2: pcGroupRowsByKeyWithLabels(rows, "w2").filter((g) => g.size > 1),
      w2Sharp: pcGroupRowsByKeyWithLabels(rows, "w2Sharp").filter((g) => g.size > 1)
    }
  };
}

export function pcBuildWitnessDebugDump(row) {
  return {
    anchor: row.anchor,
    label: pcRowLabel(row),
    state: row.state || null,
    w0: row.w0,
    w1Sharp: row.w1Sharp,
    w2: row.w2,
    w2Sharp: row.w2Sharp,
    data: row.data
  };
}
