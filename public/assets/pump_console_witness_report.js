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

function pcUniqueKeyCount(rows, field) {
  return new Set(rows.map((r) => r[field])).size;
}

function pcShortKey(key, n = 72) {
  if (typeof key !== "string") return "";
  return key.length <= n ? key : `${key.slice(0, n)}…`;
}

function pcPairsText(pairs) {
  if (!Array.isArray(pairs) || !pairs.length) return "[]";
  return `[${pairs.map((pair) => `(${(pair || []).join(",")})`).join(" ")}]`;
}

function pcListText(items) {
  if (!Array.isArray(items) || !items.length) return "[]";
  return `[${items.join(",")}]`;
}

function pcCollisionLine(name, groups) {
  if (!groups.length) return `${name}: no collisions`;
  const parts = groups.slice(0, 8).map((g) => `${g.size}x {${g.labels.join(", ")}}`);
  const suffix = groups.length > 8 ? ` ... +${groups.length - 8} more collision groups` : "";
  return `${name}: ${parts.join(" ; ")}${suffix}`;
}

export function pcBuildWitnessCollisionReport(rows) {
  return {
    summary: {
      anchorCount: rows.length,
      uniqueW0: pcUniqueKeyCount(rows, "w0"),
      uniqueW1Sharp: pcUniqueKeyCount(rows, "w1Sharp"),
      uniqueW2: pcUniqueKeyCount(rows, "w2"),
      uniqueW2Sharp: pcUniqueKeyCount(rows, "w2Sharp")
    },
    collisions: {
      w0: pcGroupRowsByKeyWithLabels(rows, "w0").filter((g) => g.size > 1),
      w1Sharp: pcGroupRowsByKeyWithLabels(rows, "w1Sharp").filter((g) => g.size > 1),
      w2: pcGroupRowsByKeyWithLabels(rows, "w2").filter((g) => g.size > 1),
      w2Sharp: pcGroupRowsByKeyWithLabels(rows, "w2Sharp").filter((g) => g.size > 1)
    }
  };
}

export function pcBuildWitnessCompactSurvey(rows) {
  const report = pcBuildWitnessCollisionReport(rows);
  const summary = report.summary;

  const lines = [
    `anchors=${summary.anchorCount}`,
    `uniqueW0=${summary.uniqueW0}`,
    `uniqueW1Sharp=${summary.uniqueW1Sharp}`,
    `uniqueW2=${summary.uniqueW2}`,
    `uniqueW2Sharp=${summary.uniqueW2Sharp}`,
    pcCollisionLine("W0", report.collisions.w0),
    pcCollisionLine("W1Sharp", report.collisions.w1Sharp),
    pcCollisionLine("W2", report.collisions.w2),
    pcCollisionLine("W2Sharp", report.collisions.w2Sharp)
  ];

  return {
    summary,
    collisions: report.collisions,
    text: lines.join("\n")
  };
}

export function pcBuildWitnessCensus(rows) {
  const items = [...rows]
    .sort((a, b) => String(a.anchor).localeCompare(String(b.anchor), undefined, { numeric: true }))
    .map((row) => ({
      label: pcRowLabel(row),
      anchor: row.anchor,
      shell: row?.data?.shell || [],
      diads: row?.data?.diads || [],
      outerPairs: row?.data?.outerPairs || [],
      remainder: row?.data?.remainder || [],
      shellSource: row?.data?.source?.shellSource || null,
      diadSource: row?.data?.source?.diadSource || null,
      orderingSource: row?.data?.source?.orderingSource || null,
      w0Short: pcShortKey(row?.w0 || ""),
      w1Short: pcShortKey(row?.w1Sharp || "")
    }));

  const text = items.map((item) =>
    [
      item.label,
      `shell=${pcListText(item.shell)}`,
      `pairs=${pcPairsText(item.diads)}`,
      `outerPairs=${pcPairsText(item.outerPairs)}`,
      `remainder=${pcListText(item.remainder)}`,
      `shellSource=${item.shellSource ?? "null"}`,
      `diadSource=${item.diadSource ?? "null"}`,
      `orderingSource=${item.orderingSource ?? "null"}`
    ].join(" | ")
  ).join("\n");

  return { items, text };
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
