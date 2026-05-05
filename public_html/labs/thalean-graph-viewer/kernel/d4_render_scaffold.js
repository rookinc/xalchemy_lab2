import { D4_MODEL_SCALE } from "./d4_spec.js";

function paletteColor(palette, arm, alpha = 0.74) {
  const p = (palette || "cmy").toLowerCase();

  if (p === "rob") {
    return arm === 0
      ? `rgba(255, 120, 120, ${alpha})`
      : arm === 1
      ? `rgba(255, 176, 96, ${alpha})`
      : `rgba(120, 170, 255, ${alpha})`;
  }

  return arm === 0
    ? `rgba(255, 196, 230, ${alpha})`
    : arm === 1
    ? `rgba(186, 239, 255, ${alpha})`
    : `rgba(208, 248, 219, ${alpha})`;
}

function buildArmPoints(armIndex, count, armAngle) {
  const pts = [];
  if (count <= 0) return pts;

  const k = D4_MODEL_SCALE;

  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);
    const z = (-7 + t * 14) * k;
    const funnelRadius = (0.24 + 1.7 * Math.pow(t, 0.88)) * k;
    const ripple = 1 + 0.18 * Math.sin(12 * t * Math.PI + armIndex * 0.8);
    const r = funnelRadius * ripple;

    const axis = {
      x: Math.cos(armAngle),
      y: Math.sin(armAngle),
      z: 0
    };

    const up = { x: 0, y: 0, z: 1 };
    const side = {
      x: up.y * axis.z - up.z * axis.y,
      y: up.z * axis.x - up.x * axis.z,
      z: up.x * axis.y - up.y * axis.x
    };

    const center = {
      x: axis.x * (1.8 * k + z * 0.62),
      y: axis.y * (1.8 * k + z * 0.62),
      z: z * 1.12
    };

    const ringCount = 6;
    const ring = [];
    for (let kIndex = 0; kIndex < ringCount; kIndex += 1) {
      const a = (Math.PI * 2 * kIndex) / ringCount;
      const offsetA = Math.cos(a) * r;
      const offsetB = Math.sin(a) * r * 0.62;

      ring.push({
        x: center.x + side.x * offsetA + up.x * offsetB,
        y: center.y + side.y * offsetA + up.y * offsetB,
        z: center.z + side.z * offsetA + up.z * offsetB,
        arm: armIndex,
        i,
        k: kIndex
      });
    }

    pts.push(...ring);
  }

  return pts;
}

export function buildScaffoldPoints(currentD4s) {
  const total = Math.max(0, currentD4s);
  if (total === 0) return [];

  const perArm = Math.ceil(total / 3);
  const arms = [
    { arm: 0, angle: -Math.PI / 2 },
    { arm: 1, angle: Math.PI / 6 },
    { arm: 2, angle: Math.PI * 5 / 6 }
  ];

  let points = [];
  for (const cfg of arms) {
    points = points.concat(buildArmPoints(cfg.arm, perArm, cfg.angle));
  }
  return points.slice(0, total * 6);
}

export function renderScaffold(ctx, points, project3D, options = {}) {
  const {
    showFaces = true,
    showLabels = false,
    alphaScale = 1,
    palette = "cmy",
    faceOpacity = 0.8
  } = options;

  if (!showFaces || points.length < 12) return;

  const ringSize = 6;
  const byArm = [[], [], []];
  for (const p of points) byArm[p.arm].push(p);

  ctx.save();
  ctx.lineWidth = 1.15;

  const opacity = Math.max(0.05, Math.min(1, faceOpacity));

  for (let arm = 0; arm < 3; arm += 1) {
    const arr = byArm[arm];
    const color = paletteColor(palette, arm, 0.72 * alphaScale * opacity);

    for (let n = 0; n + ringSize * 2 <= arr.length; n += ringSize) {
      for (let k = 0; k < ringSize; k += 1) {
        const a = project3D(arr[n + k]);
        const b = project3D(arr[n + ((k + 1) % ringSize)]);
        const c = project3D(arr[n + ringSize + k]);

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  if (showLabels) {
    const projected = points.map((p) => ({ p, s: project3D(p) }));
    projected.sort((a, b) => b.s.depth - a.s.depth);

    for (const item of projected) {
      const { p, s } = item;
      if (p.k === 0 && p.i % 8 === 0) {
        ctx.fillStyle = "rgba(232,240,248,0.82)";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`${p.arm}:${p.i}`, s.x + 5, s.y);
      }
    }
  }

  ctx.restore();
}
