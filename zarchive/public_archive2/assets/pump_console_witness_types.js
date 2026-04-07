function pcVertexIndex(value) {
  const m = String(value).match(/^v(\d+)$/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

export function pcCompareVertexIds(a, b) {
  const ai = pcVertexIndex(a);
  const bi = pcVertexIndex(b);
  if (Number.isFinite(ai) && Number.isFinite(bi) && ai !== bi) return ai - bi;
  return String(a).localeCompare(String(b));
}

export function pcSorted(arr) {
  return [...arr].sort(pcCompareVertexIds);
}

export function pcStableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(pcStableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${pcStableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function pcNormalizeEdge(a, b) {
  return pcCompareVertexIds(a, b) <= 0 ? [a, b] : [b, a];
}

export function pcNormalizeSubset(subset) {
  return pcSorted(subset);
}

export function pcNormalizeDiad(diad) {
  return pcNormalizeSubset(diad);
}

export function pcNormalizeDiads(diads) {
  return [...diads]
    .map(pcNormalizeDiad)
    .sort((a, b) => pcStableStringify(a).localeCompare(pcStableStringify(b)));
}

export function pcClassKeyFromSubset(subset) {
  return JSON.stringify(pcNormalizeSubset(subset));
}
