import { projectPoint } from "./d4_camera.js";

export function getViewportFromCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

export function resizeCanvasToDisplaySize(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  return {
    width: rect.width,
    height: rect.height,
    dpr,
  };
}

export function createProjector(canvas, camera) {
  return function project3D(point) {
    const viewport = getViewportFromCanvas(canvas);
    return projectPoint(point, camera, viewport);
  };
}

export function clearStage(ctx, canvas) {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
}

export function drawStageGrid(ctx, canvas, enabled = true) {
  if (!enabled) return;

  const rect = canvas.getBoundingClientRect();
  ctx.save();
  ctx.strokeStyle = "rgba(140, 170, 210, 0.09)";
  ctx.lineWidth = 1;

  const step = 32;
  for (let x = 0; x < rect.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rect.height);
    ctx.stroke();
  }

  for (let y = 0; y < rect.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(rect.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCenterGuides(ctx, canvas) {
  const rect = canvas.getBoundingClientRect();

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(rect.width / 2, 0);
  ctx.lineTo(rect.width / 2, rect.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, rect.height / 2);
  ctx.lineTo(rect.width, rect.height / 2);
  ctx.stroke();

  ctx.restore();
}

export function drawStageFrame(ctx, canvas) {
  const rect = canvas.getBoundingClientRect();

  ctx.save();
  ctx.strokeStyle = "rgba(42, 52, 66, 0.9)";
  ctx.lineWidth = 1;
  roundRectPath(ctx, 14, 14, rect.width - 28, rect.height - 28, 24);
  ctx.stroke();
  ctx.restore();
}

export function drawStageLabel(ctx, canvas, label, hidden = false) {
  if (hidden) return;
  const rect = canvas.getBoundingClientRect();

  ctx.save();
  ctx.fillStyle = "rgba(232,240,248,0.18)";
  ctx.font = "600 34px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, rect.width / 2, rect.height / 2);
  ctx.restore();
}

export function drawTopRightReadout(ctx, canvas, text) {
  const rect = canvas.getBoundingClientRect();

  ctx.save();
  const padX = 12;
  const padY = 10;
  ctx.font = "13px sans-serif";
  const metrics = ctx.measureText(text);
  const boxW = metrics.width + padX * 2;
  const boxH = 34;
  const x = rect.width - boxW - 28;
  const y = 28;

  ctx.fillStyle = "rgba(12, 18, 27, 0.82)";
  ctx.strokeStyle = "rgba(42, 52, 66, 0.95)";
  ctx.lineWidth = 1;
  roundRectPath(ctx, x, y, boxW, boxH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(146,164,185,0.95)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + padX, y + boxH / 2);
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
