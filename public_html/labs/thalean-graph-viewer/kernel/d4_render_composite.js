import { D4_PLEAT_ORDER, D4_PLEAT_ROLES } from "./d4_spec.js";

function rgba(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function centroid2D(points) {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function faceNormal(a, b, c) {
  const ux = b.x - a.x;
  const uy = b.y - a.y;
  const uz = b.z - a.z;
  const vx = c.x - a.x;
  const vy = c.y - a.y;
  const vz = c.z - a.z;
  return {
    x: uy * vz - uz * vy,
    y: uz * vx - ux * vz,
    z: ux * vy - uy * vx,
  };
}

function normalize(v) {
  const n = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / n, y: v.y / n, z: v.z / n };
}

function basisFromCompositeFace(v0, v1, v2) {
  const center = {
    x: (v0.x + v1.x + v2.x) / 3,
    y: (v0.y + v1.y + v2.y) / 3,
    z: (v0.z + v1.z + v2.z) / 3,
  };

  const northRaw = {
    x: (v2.x - center.x),
    y: (v2.y - center.y),
    z: (v2.z - center.z),
  };
  const north = normalize(northRaw);
  const down = normalize(faceNormal(v0, v1, v2));
  const east = normalize({
    x: down.y * north.z - down.z * north.y,
    y: down.z * north.x - down.x * north.z,
    z: down.x * north.y - down.y * north.x,
  });

  return { center, north, east, down };
}

function pointInPlane(center, north, east, u, v, scale) {
  return {
    x: center.x + scale * (u * east.x + v * north.x),
    y: center.y + scale * (u * east.y + v * north.y),
    z: center.z + scale * (u * east.z + v * north.z),
  };
}

function pleatOffsets() {
  return {
    4:  { u: 0.00,  v: 0.00, ring: 0 },
    5:  { u: 0.00,  v: 1.00, ring: 1 },
    6:  { u: 0.70,  v: 0.70, ring: 1 },
    7:  { u: 1.00,  v: 0.00, ring: 1 },
    8:  { u: 0.70,  v: -0.70, ring: 1 },
    9:  { u: 0.00,  v: -1.00, ring: 1 },
    10: { u: -0.70, v: -0.70, ring: 1 },
    11: { u: -1.00, v: 0.00, ring: 1 },
    12: { u: -0.70, v: 0.70, ring: 1 },
  };
}

function pleatColor(state, active) {
  if (active) return rgba(255, 230, 140, 0.95);
  switch (state) {
    case "occupied":
      return rgba(208, 248, 219, 0.92);
    case "cohered":
      return rgba(186, 239, 255, 0.92);
    case "mirrored":
      return rgba(255, 196, 230, 0.92);
    case "closed":
      return rgba(180, 188, 200, 0.80);
    case "reserved":
      return rgba(190, 170, 255, 0.86);
    case "open":
    default:
      return rgba(120, 170, 220, 0.78);
  }
}

export function renderCompositeOverlay(ctx, scene, project3D, options = {}) {
  const {
    showLabels = false,
    activeOnly = true,
  } = options;

  if (!scene || !scene.tetrahedra?.length) return;

  const targetTetra = activeOnly
    ? scene.tetrahedra.find((t) => t.id === scene.activeTetraId)
    : scene.tetrahedra[scene.tetrahedra.length - 1];

  if (!targetTetra) return;

  const [aId, bId, cId] = [
    targetTetra.vertexIds[0],
    targetTetra.vertexIds[1],
    targetTetra.vertexIds[2],
  ];

  const v0 = scene.vertices.find((v) => v.id === aId);
  const v1 = scene.vertices.find((v) => v.id === bId);
  const v2 = scene.vertices.find((v) => v.id === cId);
  if (!v0 || !v1 || !v2) return;

  const { center, north, east } = basisFromCompositeFace(v0, v1, v2);
  const offsets = pleatOffsets();

  const edgeLen = Math.hypot(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const scale = edgeLen * 0.16;

  const projectedFace = [project3D(v0), project3D(v1), project3D(v2)];
  const center2 = centroid2D(projectedFace);

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(projectedFace[0].x, projectedFace[0].y);
  ctx.lineTo(projectedFace[1].x, projectedFace[1].y);
  ctx.lineTo(projectedFace[2].x, projectedFace[2].y);
  ctx.closePath();
  ctx.fillStyle = rgba(70, 90, 110, 0.10);
  ctx.strokeStyle = rgba(208, 248, 219, 0.55);
  ctx.lineWidth = 1.2;
  ctx.fill();
  ctx.stroke();

  for (const pleatId of D4_PLEAT_ORDER) {
    const off = offsets[pleatId];
    const point3 = pointInPlane(center, north, east, off.u, off.v, scale);
    const point2 = project3D(point3);

    const state = targetTetra.compositeState?.[pleatId] || "open";
    const isCenter = pleatId === 4;
    const isActive = isCenter && targetTetra.id === scene.activeTetraId;

    ctx.beginPath();
    ctx.arc(point2.x, point2.y, isCenter ? 8 : 6, 0, Math.PI * 2);
    ctx.fillStyle = pleatColor(state, isActive);
    ctx.strokeStyle = rgba(20, 24, 32, 0.85);
    ctx.lineWidth = isActive ? 2.0 : 1.0;
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      const label = `${pleatId}`;
      ctx.fillStyle = rgba(232, 240, 248, 0.90);
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(label, point2.x, point2.y - 10);
    }
  }

  const north3 = pointInPlane(center, north, east, 0, 1.35, scale);
  const north2 = project3D(north3);

  ctx.beginPath();
  ctx.moveTo(center2.x, center2.y);
  ctx.lineTo(north2.x, north2.y);
  ctx.strokeStyle = rgba(255, 230, 140, 0.95);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(north2.x, north2.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = rgba(255, 230, 140, 0.98);
  ctx.fill();

  if (showLabels) {
    ctx.fillStyle = rgba(255, 230, 140, 0.95);
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("N", north2.x + 8, north2.y);
    ctx.fillStyle = rgba(232, 240, 248, 0.92);
    ctx.fillText(
      `T${targetTetra.id} composite carrier`,
      center2.x + 10,
      center2.y + 14
    );
  }

  ctx.restore();
}
