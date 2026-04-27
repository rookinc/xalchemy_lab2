function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function pointFromAny(v) {
  if (!v) return { x: 0, y: 0, z: 0 };
  if (Array.isArray(v)) {
    return { x: safeNumber(v[0]), y: safeNumber(v[1]), z: safeNumber(v[2]) };
  }
  return { x: safeNumber(v.x), y: safeNumber(v.y), z: safeNumber(v.z) };
}

function centroidOfVertices(vertices) {
  if (!Array.isArray(vertices) || vertices.length === 0) return { x: 0, y: 0, z: 0 };
  let sx = 0, sy = 0, sz = 0;
  for (const v of vertices) {
    const p = pointFromAny(v);
    sx += p.x; sy += p.y; sz += p.z;
  }
  const n = vertices.length;
  return { x: sx / n, y: sy / n, z: sz / n };
}

function tetraVerticesOf(item) {
  if (!item) return null;
  if (Array.isArray(item.vertices) && item.vertices.length >= 4) return item.vertices.slice(0, 4).map(pointFromAny);
  if (Array.isArray(item.points) && item.points.length >= 4) return item.points.slice(0, 4).map(pointFromAny);
  if (Array.isArray(item.verts) && item.verts.length >= 4) return item.verts.slice(0, 4).map(pointFromAny);
  return null;
}

function centroidOfItem(item) {
  if (!item) return null;
  if (item.centroid) return pointFromAny(item.centroid);
  const verts = tetraVerticesOf(item);
  if (verts) return centroidOfVertices(verts);
  if ("x" in item && "y" in item && "z" in item) return pointFromAny(item);
  return null;
}

function collectBestTetraArray(runtime) {
  const candidates = [];
  const probe = (ownerName, obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const [key, value] of Object.entries(obj)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      const sample = value[0];
      if (!sample || typeof sample !== "object") continue;
      const looksLikeTetra =
        (Array.isArray(sample.vertices) && sample.vertices.length >= 4) ||
        (Array.isArray(sample.points) && sample.points.length >= 4) ||
        (Array.isArray(sample.verts) && sample.verts.length >= 4) ||
        !!sample.centroid;
      if (looksLikeTetra) candidates.push({ ownerName, key, value, size: value.length });
    }
  };
  probe("runtime", runtime);
  probe("window", window);
  probe("window.__GRAPH_VIEWER__", window.__GRAPH_VIEWER__);
  probe("window.__D4_RUNTIME__", window.__D4_RUNTIME__);
  candidates.sort((a, b) => b.size - a.size);
  return candidates[0] || null;
}

function serializeTetraArray(items) {
  return items.map((item, index) => ({
    index,
    centroid: centroidOfItem(item),
    vertices: tetraVerticesOf(item),
    phase: item.phase ?? null,
    residue: item.residue ?? null,
    turn: item.turn ?? null,
    shell: item.shell ?? null,
    chirality: item.chirality ?? null,
  }));
}

function triggerJsonDownload(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCentroids(runtime) {
  const best = collectBestTetraArray(runtime);
  if (!best) throw new Error("No tetra-like array found in runtime.");
  const centroids = best.value.map(centroidOfItem).filter(Boolean);
  triggerJsonDownload("centroids.json", centroids);
  return { source: `${best.ownerName}.${best.key}`, count: centroids.length };
}

export function exportTetrahedra(runtime) {
  const best = collectBestTetraArray(runtime);
  if (!best) throw new Error("No tetra-like array found in runtime.");
  const tetrahedra = serializeTetraArray(best.value);
  triggerJsonDownload("tetrahedra.json", tetrahedra);
  return { source: `${best.ownerName}.${best.key}`, count: tetrahedra.length };
}

export function exportSceneState(runtime, uiState = {}) {
  const best = collectBestTetraArray(runtime);
  const payload = {
    exported_at: new Date().toISOString(),
    tetra_source: best ? `${best.ownerName}.${best.key}` : null,
    tetra_count: best ? best.value.length : 0,
    ui_state: uiState,
    camera: runtime?.camera ?? null,
    metrics: runtime?.metrics ?? null,
    playback: runtime?.playback ?? null,
  };
  triggerJsonDownload("scene_state.json", payload);
  return payload;
}
