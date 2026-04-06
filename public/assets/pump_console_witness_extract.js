import {
  pcClassKeyFromSubset,
  pcNormalizeEdge,
  pcNormalizeDiads,
  pcSorted
} from "./pump_console_witness_types.js";

function pcNeighborsFromAdjacency(adjacency, vertexId) {
  return adjacency?.[vertexId] || [];
}

function pcChooseShell(readout) {
  const shellBase = Array.isArray(readout?.shellBase) ? readout.shellBase : [];
  const shell = Array.isArray(readout?.shell) ? readout.shell : [];
  return shellBase.length ? shellBase.slice() : shell.slice();
}

function pcChooseDiads(readout) {
  const orderedRawDiads = Array.isArray(readout?.orderedRawDiads) ? readout.orderedRawDiads : [];
  const rawDiads = Array.isArray(readout?.rawDiads) ? readout.rawDiads : [];
  const diads = Array.isArray(readout?.diads) ? readout.diads : [];

  if (orderedRawDiads.length) return orderedRawDiads.map((pair) => [...pair]);
  if (rawDiads.length) return rawDiads.map((pair) => [...pair]);
  return diads.map((pair) => [...pair]);
}

function pcChooseOuterPairs(readout) {
  const outerPairs = Array.isArray(readout?.outerPairs) ? readout.outerPairs : [];
  return outerPairs.map((pair) => [...pair]);
}

function pcChooseRemainder(readout) {
  const nonShell = Array.isArray(readout?.nonShell) ? readout.nonShell : [];
  return nonShell.slice();
}

function pcDetectWitnessMode(readout, shell, diads, remainder) {
  const shellSource = readout?.shellSource || null;
  const diadSource = readout?.diadSource || null;
  const datasetId = readout?.datasetId || null;
  const isCanonicalLocalMachine = Boolean(readout?.isCanonicalLocalMachine);
  const outerPairs = pcChooseOuterPairs(readout);

  const hasShell = Array.isArray(shell) && shell.length > 0;
  const hasDiads = Array.isArray(diads) && diads.length > 0;
  const hasOuterPairs = Array.isArray(outerPairs) && outerPairs.length > 0;
  const hasRemainder = Array.isArray(remainder) && remainder.length > 0;

  if (
    shellSource === "full-graph/ring1" ||
    diadSource === "full-graph/outer-pairs-derived" ||
    diadSource === "full-graph/not-yet-chamberized"
  ) {
    return {
      witnessMode: hasOuterPairs
        ? "full-graph-outer-pairs-shell"
        : "full-graph-ring1-placeholder",
      chamberStatus: hasOuterPairs ? "outer-pairs-only" : "placeholder",
      note: hasOuterPairs
        ? "Full-graph path exposes ring1 shell, ring2 remainder, and explicit outer-pair structure; chamberized diads are not yet derived."
        : "Full-graph path is currently using ring1 shell / ring2 remainder without chamberized outer-pair derivation."
    };
  }

  if (isCanonicalLocalMachine && hasShell && hasDiads && hasRemainder) {
    return {
      witnessMode: "chamberized-local-machine",
      chamberStatus: "full",
      note: "Readout includes shell, outer-pair structure, and remainder for a chamberized local machine."
    };
  }

  if (hasShell && hasRemainder && !hasDiads) {
    return {
      witnessMode: "shell-plus-remainder",
      chamberStatus: "partial",
      note: "Readout has shell and remainder data but no outer-pair chamberization."
    };
  }

  if (hasShell && !hasRemainder) {
    return {
      witnessMode: "shell-only",
      chamberStatus: "partial",
      note: "Readout currently exposes shell data without richer remainder structure."
    };
  }

  return {
    witnessMode: datasetId ? `unknown:${datasetId}` : "unknown",
    chamberStatus: "unknown",
    note: "Witness extraction could not classify the readout into a clearer chamber regime."
  };
}

export function pcExtractWitnessData(graphAdapter, anchorId, options = {}) {
  if (!graphAdapter || typeof graphAdapter.neighbors !== "function") {
    throw new Error("pcExtractWitnessData requires graphAdapter.neighbors(vertexId)");
  }

  const shell = pcExtractShell(graphAdapter, anchorId, options);
  const diads = pcExtractDiads(graphAdapter, anchorId, shell, options);
  const outerPairs = pcChooseOuterPairs(options?.readout || {});
  const remainder = pcExtractRemainder(graphAdapter, anchorId, shell, diads, options);
  const attachments = pcExtractAttachments(graphAdapter, shell, remainder);
  const remainderEdges = pcExtractRemainderEdges(graphAdapter, remainder);
  const attachmentClasses = pcGroupVerticesByAttachment(attachments);
  const classInteraction = pcBuildClassInteraction(attachmentClasses, remainderEdges);

  return {
    anchor: anchorId,
    shell: pcSorted(shell),
    diads: pcNormalizeDiads(diads),
    outerPairs: pcNormalizeDiads(outerPairs),
    outerPairs: pcNormalizeDiads(outerPairs),
    remainder: pcSorted(remainder),
    attachments,
    remainderEdges,
    attachmentClasses,
    classInteraction
  };
}

export function pcExtractWitnessDataFromReadout(readout, options = {}) {
  const adjacency = readout?.snapshot?.adjacency || {};
  const graphAdapter = {
    neighbors(vertexId) {
      return pcNeighborsFromAdjacency(adjacency, vertexId);
    }
  };

  const shell = pcChooseShell(readout);
  const diads = pcChooseDiads(readout);
  const outerPairs = pcChooseOuterPairs(readout);
  const remainder = pcChooseRemainder(readout);
  const attachments = pcExtractAttachments(graphAdapter, shell, remainder);
  const remainderEdges = pcExtractRemainderEdges(graphAdapter, remainder);
  const attachmentClasses = pcGroupVerticesByAttachment(attachments);
  const classInteraction = pcBuildClassInteraction(attachmentClasses, remainderEdges);
  const regime = pcDetectWitnessMode(readout, shell, diads, remainder);

  return {
    anchor: readout?.coupler || null,
    coupler: readout?.coupler || null,
    shell: pcSorted(shell),
    diads: pcNormalizeDiads(diads),
    remainder: pcSorted(remainder),
    attachments,
    remainderEdges,
    attachmentClasses,
    classInteraction,
    source: {
      shellSource: readout?.shellSource || null,
      diadSource: readout?.diadSource || null,
      orderingSource: readout?.orderingSource || null,
      datasetId: readout?.datasetId || null,
      graphKey: readout?.graphKey || null,
      isCanonicalLocalMachine: Boolean(readout?.isCanonicalLocalMachine),
      witnessMode: regime.witnessMode,
      chamberStatus: regime.chamberStatus,
      witnessModeNote: regime.note
    }
  };
}

export function pcExtractWitnessDataFromPipeline(pipe, options = {}) {
  if (!pipe?.readout) {
    throw new Error("pcExtractWitnessDataFromPipeline requires pipe.readout");
  }
  return pcExtractWitnessDataFromReadout(pipe.readout, options);
}

export function pcExtractShell(graphAdapter, anchorId, options = {}) {
  if (Array.isArray(options.shell)) return options.shell.slice();
  throw new Error("pcExtractShell not implemented; use pcExtractWitnessDataFromReadout/FromPipeline or pass options.shell");
}

export function pcExtractDiads(graphAdapter, anchorId, shell, options = {}) {
  if (Array.isArray(options.diads)) return options.diads.map((pair) => [...pair]);
  throw new Error("pcExtractDiads not implemented; use pcExtractWitnessDataFromReadout/FromPipeline or pass options.diads");
}

export function pcExtractRemainder(graphAdapter, anchorId, shell, diads, options = {}) {
  if (Array.isArray(options.remainder)) return options.remainder.slice();
  throw new Error("pcExtractRemainder not implemented; use pcExtractWitnessDataFromReadout/FromPipeline or pass options.remainder");
}

export function pcExtractAttachments(graphAdapter, shell, remainder) {
  const shellSet = new Set(shell);
  const out = {};

  for (const r of remainder) {
    const nbrs = (graphAdapter.neighbors?.(r) || []).filter((v) => shellSet.has(v));
    out[r] = pcSorted(nbrs);
  }

  return Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => a.localeCompare(b))
  );
}

export function pcExtractRemainderEdges(graphAdapter, remainder) {
  const remainderSet = new Set(remainder);
  const seen = new Set();
  const edges = [];

  for (const u of remainder) {
    const nbrs = graphAdapter.neighbors?.(u) || [];
    for (const v of nbrs) {
      if (!remainderSet.has(v)) continue;
      const [a, b] = pcNormalizeEdge(u, v);
      const key = `${a}|${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, b]);
    }
  }

  edges.sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
  return edges;
}

export function pcGroupVerticesByAttachment(attachments) {
  const classes = {};

  for (const [vertexId, subset] of Object.entries(attachments)) {
    const classKey = pcClassKeyFromSubset(subset);
    if (!classes[classKey]) classes[classKey] = [];
    classes[classKey].push(vertexId);
  }

  for (const classKey of Object.keys(classes)) {
    classes[classKey].sort();
  }

  return Object.fromEntries(
    Object.entries(classes).sort(([a], [b]) => a.localeCompare(b))
  );
}

export function pcBuildClassInteraction(attachmentClasses, remainderEdges) {
  const vertexToClass = {};
  const vertexCounts = {};
  const edgeCounts = {};

  for (const [classKey, vertices] of Object.entries(attachmentClasses)) {
    vertexCounts[classKey] = vertices.length;
    for (const v of vertices) {
      vertexToClass[v] = classKey;
    }
  }

  for (const [u, v] of remainderEdges) {
    const cu = vertexToClass[u];
    const cv = vertexToClass[v];
    if (!cu || !cv) continue;
    const edgeKey = cu < cv ? `${cu}|${cv}` : `${cv}|${cu}`;
    edgeCounts[edgeKey] = (edgeCounts[edgeKey] || 0) + 1;
  }

  return {
    vertexCounts: Object.fromEntries(
      Object.entries(vertexCounts).sort(([a], [b]) => a.localeCompare(b))
    ),
    edgeCounts: Object.fromEntries(
      Object.entries(edgeCounts).sort(([a], [b]) => a.localeCompare(b))
    )
  };
}
