import {
  pcClassKeyFromSubset,
  pcNormalizeDiads,
  pcSorted,
  pcStableStringify
} from "./pump_console_witness_types.js";

export function pcCanonW0(data) {
  return pcStableStringify({
    shell: pcSorted(data.shell),
    diads: pcNormalizeDiads(data.diads)
  });
}

export function pcCanonF2Sharp(data) {
  const perms = pcEnumerateShellSymmetries(data.shell);
  let best = null;

  for (const perm of perms) {
    const relabeled = pcRelabelAttachmentMultiset(data.attachments, perm);
    const key = pcStableStringify(relabeled);
    if (best === null || key < best) best = key;
  }

  return best;
}

export function pcCanonW1Sharp(data) {
  return pcStableStringify({
    w0: JSON.parse(pcCanonW0(data)),
    f2Sharp: JSON.parse(pcCanonF2Sharp(data))
  });
}

export function pcCanonC2(data) {
  const perms = pcEnumerateShellSymmetries(data.shell);
  let best = null;

  for (const perm of perms) {
    const relabeled = pcRelabelClassInteraction(data.classInteraction, perm);
    const key = pcStableStringify(relabeled);
    if (best === null || key < best) best = key;
  }

  return best;
}

export function pcCanonW2(data) {
  return pcStableStringify({
    w1Sharp: JSON.parse(pcCanonW1Sharp(data)),
    c2: JSON.parse(pcCanonC2(data))
  });
}

export function pcCanonC2Sharp(data) {
  const perms = pcEnumerateShellSymmetries(data.shell);
  let best = null;

  for (const perm of perms) {
    const relabeled = pcRelabelDecoratedRemainderGraph(data, perm);
    const key = pcStableStringify(relabeled);
    if (best === null || key < best) best = key;
  }

  return best;
}

export function pcCanonW2Sharp(data) {
  return pcStableStringify({
    w1Sharp: JSON.parse(pcCanonW1Sharp(data)),
    c2Sharp: JSON.parse(pcCanonC2Sharp(data))
  });
}

export function pcEnumerateShellSymmetries(shell) {
  const base = pcSorted(shell);
  if (base.length === 0) return [{}];

  const perms = [];
  const seen = new Set();

  const addPermFromImage = (image) => {
    const perm = {};
    for (let i = 0; i < base.length; i += 1) {
      perm[base[i]] = image[i];
    }
    const key = pcStableStringify(perm);
    if (seen.has(key)) return;
    seen.add(key);
    perms.push(perm);
  };

  for (let shift = 0; shift < base.length; shift += 1) {
    const rotated = base.map((_, i) => base[(i + shift) % base.length]);
    addPermFromImage(rotated);
  }

  const reversed = [...base].reverse();
  for (let shift = 0; shift < reversed.length; shift += 1) {
    const rotated = reversed.map((_, i) => reversed[(i + shift) % reversed.length]);
    addPermFromImage(rotated);
  }

  return perms;
}

export function pcRelabelSubset(subset, perm) {
  return pcSorted(subset.map((v) => perm[v] || v));
}

export function pcRelabelAttachmentMultiset(attachments, perm) {
  const attachmentMultiset = Object.values(attachments)
    .map((subset) => pcRelabelSubset(subset, perm))
    .sort((a, b) => pcStableStringify(a).localeCompare(pcStableStringify(b)));

  return { attachmentMultiset };
}

export function pcRelabelClassInteraction(classInteraction, perm) {
  const vertexCounts = {};
  const edgeCounts = {};

  for (const [classKey, count] of Object.entries(classInteraction.vertexCounts)) {
    const relabeledClassKey = pcClassKeyFromSubset(
      pcRelabelSubset(JSON.parse(classKey), perm)
    );
    vertexCounts[relabeledClassKey] = (vertexCounts[relabeledClassKey] || 0) + count;
  }

  for (const [pairKey, count] of Object.entries(classInteraction.edgeCounts)) {
    const parts = pairKey.match(/^(\[.*\])\|(\[.*\])$/);
    if (!parts) {
      throw new Error(`Invalid class interaction edge key: ${pairKey}`);
    }

    const left = parts[1];
    const right = parts[2];

    const l2 = pcClassKeyFromSubset(pcRelabelSubset(JSON.parse(left), perm));
    const r2 = pcClassKeyFromSubset(pcRelabelSubset(JSON.parse(right), perm));
    const edgeKey = l2 < r2 ? `${l2}|${r2}` : `${r2}|${l2}`;
    edgeCounts[edgeKey] = (edgeCounts[edgeKey] || 0) + count;
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

export function pcRelabelDecoratedRemainderGraph(data, perm) {
  const vertexLabels = {};

  for (const [vertexId, subset] of Object.entries(data.attachments)) {
    vertexLabels[vertexId] = pcRelabelSubset(subset, perm);
  }

  const remainderEdges = [...data.remainderEdges].sort((a, b) =>
    pcStableStringify(a).localeCompare(pcStableStringify(b))
  );

  return {
    vertexLabels: Object.fromEntries(
      Object.entries(vertexLabels).sort(([a], [b]) => a.localeCompare(b))
    ),
    remainderEdges
  };
}
