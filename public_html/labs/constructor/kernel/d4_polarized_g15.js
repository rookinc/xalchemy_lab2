function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function pointFromAny(v) {
  if (!v) return { x: 0, y: 0, z: 0 };
  if (Array.isArray(v)) {
    return {
      x: safeNumber(v[0]),
      y: safeNumber(v[1]),
      z: safeNumber(v[2]),
    };
  }
  return {
    x: safeNumber(v.x),
    y: safeNumber(v.y),
    z: safeNumber(v.z),
  };
}

function tetraVerticesOf(item) {
  if (!item) return null;
  if (Array.isArray(item.vertices) && item.vertices.length >= 4) return item.vertices.slice(0, 4).map(pointFromAny);
  if (Array.isArray(item.points) && item.points.length >= 4) return item.points.slice(0, 4).map(pointFromAny);
  if (Array.isArray(item.verts) && item.verts.length >= 4) return item.verts.slice(0, 4).map(pointFromAny);
  return null;
}

function centroidOfVertices(vertices) {
  if (!Array.isArray(vertices) || vertices.length === 0) return { x: 0, y: 0, z: 0 };
  let sx = 0, sy = 0, sz = 0;
  for (const v of vertices) {
    sx += v.x;
    sy += v.y;
    sz += v.z;
  }
  const n = vertices.length;
  return { x: sx / n, y: sy / n, z: sz / n };
}

function centroidOfItem(item) {
  if (!item) return null;
  if (item.centroid) return pointFromAny(item.centroid);
  const verts = tetraVerticesOf(item);
  if (verts) return centroidOfVertices(verts);
  if ("x" in item && "y" in item && "z" in item) return pointFromAny(item);
  return null;
}

function sqdist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function mean(points) {
  let sx = 0, sy = 0, sz = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
    sz += p.z;
  }
  const n = Math.max(1, points.length);
  return { x: sx / n, y: sy / n, z: sz / n };
}

function normalizePoints(points) {
  const c = mean(points);
  const centered = points.map((p) => ({
    x: p.x - c.x,
    y: p.y - c.y,
    z: p.z - c.z,
  }));

  let maxAbs = 0;
  for (const p of centered) {
    maxAbs = Math.max(maxAbs, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
  }
  maxAbs = maxAbs || 1;

  return centered.map((p) => ({
    x: p.x / maxAbs,
    y: p.y / maxAbs,
    z: p.z / maxAbs,
  }));
}

function buildPolarizedSites() {
  const poleZ = 0.5;
  const sideR = 0.5;
  const cornerR = 0.5;
  const cornerZ = 0.5;
  const s = cornerR / Math.sqrt(2);

  return [
    { label: "C",  point: { x: 0, y: 0, z: 0 } },

    { label: "Fp", point: { x: 0, y: 0, z: poleZ } },
    { label: "Fm", point: { x: 0, y: 0, z: -poleZ } },

    { label: "E0", point: { x: sideR, y: 0, z: 0 } },
    { label: "E1", point: { x: 0, y: sideR, z: 0 } },
    { label: "E2", point: { x: -sideR, y: 0, z: 0 } },
    { label: "E3", point: { x: 0, y: -sideR, z: 0 } },

    { label: "K0", point: { x:  s, y:  s, z:  cornerZ } },
    { label: "K1", point: { x: -s, y:  s, z:  cornerZ } },
    { label: "K2", point: { x: -s, y: -s, z:  cornerZ } },
    { label: "K3", point: { x:  s, y: -s, z:  cornerZ } },

    { label: "K4", point: { x:  s, y:  s, z: -cornerZ } },
    { label: "K5", point: { x: -s, y:  s, z: -cornerZ } },
    { label: "K6", point: { x: -s, y: -s, z: -cornerZ } },
    { label: "K7", point: { x:  s, y: -s, z: -cornerZ } },
  ];
}

function classifyPoint(point, sites) {
  let best = sites[0];
  let bestD2 = sqdist(point, best.point);
  for (let i = 1; i < sites.length; i += 1) {
    const d2 = sqdist(point, sites[i].point);
    if (d2 < bestD2) {
      best = sites[i];
      bestD2 = d2;
    }
  }
  return best.label;
}

function matchesRoleFilter(role, filterValue) {
  if (!filterValue || filterValue === "all") return true;
  if (filterValue === "center") return role === "C";
  if (filterValue === "poles") return role === "Fp" || role === "Fm";
  if (filterValue === "equator") return /^E[0-3]$/.test(role);
  if (filterValue === "corners") return /^K[0-7]$/.test(role);
  return role === filterValue;
}

function getArrayField(snapshot) {
  if (Array.isArray(snapshot?.tetrahedra)) return "tetrahedra";
  if (Array.isArray(snapshot?.tetras)) return "tetras";
  if (Array.isArray(snapshot?.primes)) return "primes";
  if (Array.isArray(snapshot?.cells)) return "cells";
  return null;
}

export function classifyPolarizedRoles(snapshot) {
  const field = getArrayField(snapshot);
  if (!field) return { items: [], counts: {} };

  const items = snapshot[field];
  const centroids = items.map(centroidOfItem);
  const valid = centroids.map((c, i) => ({ c, i })).filter((x) => !!x.c);

  if (!valid.length) return { items: [], counts: {} };

  const normalized = normalizePoints(valid.map((x) => x.c));
  const sites = buildPolarizedSites();

  const result = items.map((item, idx) => ({
    item,
    index: idx,
    role: null,
  }));

  const counts = {};

  for (let j = 0; j < valid.length; j += 1) {
    const idx = valid[j].i;
    const role = classifyPoint(normalized[j], sites);
    result[idx].role = role;
    counts[role] = (counts[role] || 0) + 1;
  }

  return { items: result, counts };
}

export function filterSnapshotByPolarizedRole(snapshot, filterValue) {
  const field = getArrayField(snapshot);
  if (!field || !filterValue || filterValue === "all") {
    return {
      snapshot,
      counts: {},
      filteredCount: Array.isArray(snapshot?.[field]) ? snapshot[field].length : 0,
    };
  }

  const classified = classifyPolarizedRoles(snapshot);
  const kept = classified.items.filter((row) => matchesRoleFilter(row.role, filterValue)).map((row) => row.item);

  const cloned = { ...snapshot, [field]: kept };

  return {
    snapshot: cloned,
    counts: classified.counts,
    filteredCount: kept.length,
  };
}
