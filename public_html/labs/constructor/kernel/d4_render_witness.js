function drawNode(ctx, x, y, label, options = {}) {
  const {
    radius = 16,
    fill = "rgba(28,36,52,0.92)",
    stroke = "rgba(232,240,248,0.88)",
    text = "rgba(232,240,248,0.96)",
  } = options;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = text;
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}

function drawCycle(ctx, points, labels, options = {}) {
  const {
    stroke = "rgba(120,170,255,0.88)",
    lineWidth = 2,
    dashed = false,
  } = options;

  if (!points || points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([7, 5]);

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < points.length; i += 1) {
    drawNode(ctx, points[i].x, points[i].y, labels[i]);
  }
}

function regularPolygon(cx, cy, r, n, rotation = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = rotation + (Math.PI * 2 * i) / n;
    pts.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
    });
  }
  return pts;
}

function drawCenterAxis(ctx, canvas) {
  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.5;

  ctx.save();
  ctx.strokeStyle = "rgba(232,240,248,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 220);
  ctx.lineTo(cx, cy + 220);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 220, cy);
  ctx.lineTo(cx + 220, cy);
  ctx.stroke();
  ctx.restore();
}

function drawReadout(ctx, payload) {
  const lines = [
    `state  : (${payload.frame},${payload.phase})`,
    `code   : ${payload.code}`,
    `phase  : ${payload.phase_label}`,
    `align  : ${payload.alignment}`,
    `spread : ${payload.spread}`,
    `fiber  : ${payload.fiber}`,
    `species: ${payload.species}`,
    `action : ${payload.action_species}`,
  ];

  const x = 20;
  const y = 20;
  const w = 260;
  const h = 20 + lines.length * 18;

  ctx.save();
  ctx.fillStyle = "rgba(10,14,20,0.78)";
  ctx.strokeStyle = "rgba(232,240,248,0.18)";
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "rgba(232,240,248,0.94)";
  ctx.font = "13px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  lines.forEach((line, i) => {
    ctx.fillText(line, x + 12, y + 10 + i * 18);
  });

  ctx.restore();
}

function labelColorForPhase(phase) {
  return phase === 0
    ? "rgba(120,170,255,0.92)"
    : "rgba(255,120,220,0.92)";
}

export function renderWitnessScene(ctx, canvas, payload, options = {}) {
  if (!payload) return;

  const {
    showWitnessCycle = true,
    showActionCell = true,
  } = options;

  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.56;

  const witnessRadius = Math.min(canvas.width, canvas.height) * 0.17;
  const actionRadius = Math.min(canvas.width, canvas.height) * 0.28;

  const witnessPts = regularPolygon(cx, cy, witnessRadius, 6, -Math.PI / 2);
  const actionPts = regularPolygon(cx, cy, actionRadius, 6, -Math.PI / 2 + Math.PI / 6);

  drawCenterAxis(ctx, canvas);

  if (showActionCell && payload.action_cell) {
    drawCycle(ctx, actionPts, payload.action_cell, {
      stroke: "rgba(255,196,120,0.82)",
      lineWidth: 1.8,
      dashed: true,
    });
  }

  if (showWitnessCycle && payload.witness_cycle) {
    drawCycle(ctx, witnessPts, payload.witness_cycle, {
      stroke: labelColorForPhase(payload.phase),
      lineWidth: 2.5,
      dashed: false,
    });
  }

  drawReadout(ctx, payload);
}
