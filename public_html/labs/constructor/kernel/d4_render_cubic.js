function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function pointFromAny(v) {
  if (!v) return { x: 0, y: 0, z: 0 };
  if (Array.isArray(v)) return { x: safeNumber(v[0]), y: safeNumber(v[1]), z: safeNumber(v[2]) };
  return { x: safeNumber(v.x), y: safeNumber(v.y), z: safeNumber(v.z) };
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
    sx += v.x; sy += v.y; sz += v.z;
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

function getArrayField(snapshot) {
  if (Array.isArray(snapshot?.tetrahedra)) return "tetrahedra";
  if (Array.isArray(snapshot?.tetras)) return "tetras";
  if (Array.isArray(snapshot?.primes)) return "primes";
  if (Array.isArray(snapshot?.cells)) return "cells";
  return null;
}

function mean(points) {
  let sx = 0, sy = 0, sz = 0;
  for (const p of points) {
    sx += p.x; sy += p.y; sz += p.z;
  }
  const n = Math.max(1, points.length);
  return { x: sx / n, y: sy / n, z: sz / n };
}

function normalizePoints(points) {
  const c = mean(points);
  const centered = points.map((p) => ({ x: p.x - c.x, y: p.y - c.y, z: p.z - c.z }));
  let maxAbs = 0;
  for (const p of centered) maxAbs = Math.max(maxAbs, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
  maxAbs = maxAbs || 1;
  return centered.map((p) => ({ x: p.x / maxAbs, y: p.y / maxAbs, z: p.z / maxAbs }));
}

function sqdist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function buildPolarizedSites() {
  const poleZ = 0.5;
  const sideR = 0.5;
  const cornerR = 0.5;
  const cornerZ = 0.5;
  const s = cornerR / Math.sqrt(2);

  return [
    { label: "C",  point: { x: 0, y: 0, z: 0 }, color: "rgba(255,255,255,0.95)" },
    { label: "Fp", point: { x: 0, y: 0, z: poleZ }, color: "rgba(255,170,170,0.95)" },
    { label: "Fm", point: { x: 0, y: 0, z: -poleZ }, color: "rgba(170,200,255,0.95)" },
    { label: "E0", point: { x: sideR, y: 0, z: 0 }, color: "rgba(170,255,200,0.95)" },
    { label: "E1", point: { x: 0, y: sideR, z: 0 }, color: "rgba(170,255,200,0.95)" },
    { label: "E2", point: { x: -sideR, y: 0, z: 0 }, color: "rgba(170,255,200,0.95)" },
    { label: "E3", point: { x: 0, y: -sideR, z: 0 }, color: "rgba(170,255,200,0.95)" },
    { label: "K0", point: { x:  s, y:  s, z:  cornerZ }, color: "rgba(255,220,170,0.95)" },
    { label: "K1", point: { x: -s, y:  s, z:  cornerZ }, color: "rgba(255,220,170,0.95)" },
    { label: "K2", point: { x: -s, y: -s, z:  cornerZ }, color: "rgba(255,220,170,0.95)" },
    { label: "K3", point: { x:  s, y: -s, z:  cornerZ }, color: "rgba(255,220,170,0.95)" },
    { label: "K4", point: { x:  s, y:  s, z: -cornerZ }, color: "rgba(255,220,170,0.95)" },
    { label: "K5", point: { x: -s, y:  s, z: -cornerZ }, color: "rgba(255,220,170,0.95)" },
    { label: "K6", point: { x: -s, y: -s, z: -cornerZ }, color: "rgba(255,220,170,0.95)" },
    { label: "K7", point: { x:  s, y: -s, z: -cornerZ }, color: "rgba(255,220,170,0.95)" },
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
  return best;
}

function cubeVertices() {
  return [
    { x: -1, y: -1, z: -1 }, { x:  1, y: -1, z: -1 },
    { x:  1, y:  1, z: -1 }, { x: -1, y:  1, z: -1 },
    { x: -1, y: -1, z:  1 }, { x:  1, y: -1, z:  1 },
    { x:  1, y:  1, z:  1 }, { x: -1, y:  1, z:  1 },
  ];
}

function cubeEdges() {
  return [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
  ];
}

function drawLine(ctx, projector, a, b, color, width = 1, alpha = 1) {
  const pa = projector.project(a);
  const pb = projector.project(b);
  if (!pa.visible || !pb.visible) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.lineTo(pb.x, pb.y);
  ctx.stroke();
  ctx.restore();
}

function drawPoint(ctx, projector, p, color, r = 3, alpha = 1) {
  const pp = projector.project(p);
  if (!pp.visible) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLabel(ctx, projector, p, text, color) {
  const pp = projector.project(p);
  if (!pp.visible) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "12px sans-serif";
  ctx.fillText(text, pp.x + 6, pp.y - 6);
  ctx.restore();
}

function includeByStyle(style, label) {
  if (style === "sites_only") return false;
  if (style === "frame") return false;
  if (style === "center") return label === "C";
  if (style === "poles") return label === "Fp" || label === "Fm";
  if (style === "equator") return /^E[0-3]$/.test(label);
  if (style === "corners") return /^K[0-7]$/.test(label);
  return true;
}

export function renderCubicScene(ctx, snapshot, projector, options = {}) {
  const {
    showLabels = false,
    showSites = true,
    pointAlpha = 0.22,
    style = "full",
  } = options;

  const field = getArrayField(snapshot);
  if (!field) return;

  const rawItems = snapshot[field];
  const rawCentroids = rawItems.map(centroidOfItem).filter(Boolean);
  if (!rawCentroids.length) return;

  const normalized = normalizePoints(rawCentroids);
  const sites = buildPolarizedSites();

  const roleCounts = {};
  const classified = normalized.map((p) => {
    const site = classifyPoint(p, sites);
    roleCounts[site.label] = (roleCounts[site.label] || 0) + 1;
    return { point: p, site };
  });

  const verts = cubeVertices();
  for (const [i, j] of cubeEdges()) {
    drawLine(ctx, projector, verts[i], verts[j], "rgba(220,235,255,0.65)", 2.0, 1);
  }

  if (style !== "sites_only" && style !== "frame") {
    for (const row of classified) {
      if (!includeByStyle(style, row.site.label)) continue;
      drawPoint(ctx, projector, row.point, row.site.color, 1.6, pointAlpha);
    }
  }

  if (showSites) {
    for (const site of sites) {
      if (style !== "full" && style !== "frame" && style !== "sites_only" && !includeByStyle(style, site.label)) continue;
      drawPoint(ctx, projector, site.point, site.color, 5.2, 0.98);
      if (showLabels) drawLabel(ctx, projector, site.point, site.label, site.color);
    }
  }

  snapshot.__polarizedRoleCounts = roleCounts;
}
