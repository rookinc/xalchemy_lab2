import { tetraEdgePairs } from "./d4_spec.js";

function rgbFaceColor(faceLabel, alpha) {
  if (faceLabel === 1) return `rgba(255, 96, 96, ${alpha})`;
  if (faceLabel === 2) return `rgba(96, 220, 120, ${alpha})`;
  return `rgba(96, 156, 255, ${alpha})`;
}

function cmyFaceColor(faceLabel, alpha) {
  if (faceLabel === 1) return `rgba(120, 236, 255, ${alpha})`;
  if (faceLabel === 2) return `rgba(255, 120, 220, ${alpha})`;
  return `rgba(255, 236, 120, ${alpha})`;
}

function edgeColor(alpha = 0.5) {
  return `rgba(255, 255, 255, ${alpha})`;
}

function compositeFill(alpha = 0.16) {
  return `rgba(208, 248, 219, ${alpha})`;
}

function compositeStroke(alpha = 0.55) {
  return `rgba(208, 248, 219, ${alpha})`;
}

function faceKey(vertexIds) {
  return [...vertexIds].sort((a, b) => a - b).join("|");
}

function tetraFaces(vertexIds) {
  return [
    { label: 1, ids: [vertexIds[1], vertexIds[2], vertexIds[3]] },
    { label: 2, ids: [vertexIds[0], vertexIds[2], vertexIds[3]] },
    { label: 3, ids: [vertexIds[0], vertexIds[1], vertexIds[3]] },
    { label: 4, ids: [vertexIds[0], vertexIds[1], vertexIds[2]] }
  ];
}

function faceFillForTetra(tetra, faceLabel, alpha) {
  return tetra.chirality === "left"
    ? rgbFaceColor(faceLabel, alpha)
    : cmyFaceColor(faceLabel, alpha);
}

function faceStrokeForTetra(tetra, faceLabel, alpha) {
  return tetra.chirality === "left"
    ? rgbFaceColor(faceLabel, alpha)
    : cmyFaceColor(faceLabel, alpha);
}

export function renderPrimeScene(ctx, scene, project3D, options = {}) {
  const {
    showFaces = true,
    showEdges = true,
    showColorEdges = true,
    showLabels = false,
    highlightActive = true,
    leftFaceOpacity = 0.8,
    rightFaceOpacity = 0.8
  } = options;

  if (!scene || !scene.tetrahedra || !scene.tetrahedra.length) return;

  const projectedVertices = new Map();
  for (const v of scene.vertices) {
    projectedVertices.set(v.id, project3D(v));
  }

  const openFaceKeys = new Set(scene.openFaces.map((f) => f.faceKey));

  const tetraItems = scene.tetrahedra.map((tetra) => {
    const pts = tetra.vertexIds.map((id) => projectedVertices.get(id));
    const depth = pts.reduce((sum, p) => sum + p.depth, 0) / pts.length;
    return { tetra, depth };
  });

  tetraItems.sort((a, b) => b.depth - a.depth);

  ctx.save();

  const leftAlpha = Math.max(0, Math.min(1, leftFaceOpacity));
  const rightAlpha = Math.max(0, Math.min(1, rightFaceOpacity));

  for (const item of tetraItems) {
    const tetra = item.tetra;
    const isActive = highlightActive && tetra.id === scene.activeTetraId;
    const baseAlpha = tetra.chirality === "left" ? leftAlpha : rightAlpha;

    const faces = tetraFaces(tetra.vertexIds).map((face) => {
      const pts = face.ids.map((id) => projectedVertices.get(id));
      const depth = pts.reduce((sum, p) => sum + p.depth, 0) / pts.length;
      return {
        label: face.label,
        ids: face.ids,
        pts,
        depth,
        key: faceKey(face.ids)
      };
    });

    faces.sort((a, b) => b.depth - a.depth);

    if (showFaces) {
      for (const face of faces) {
        const isComposite = face.label === 4;
        const isOpen = !isComposite && openFaceKeys.has(face.key);
        const isActiveFace = isActive && face.label === scene.activeFaceLabel;

        ctx.beginPath();
        ctx.moveTo(face.pts[0].x, face.pts[0].y);
        ctx.lineTo(face.pts[1].x, face.pts[1].y);
        ctx.lineTo(face.pts[2].x, face.pts[2].y);
        ctx.closePath();

        if (isComposite) {
          ctx.fillStyle = compositeFill((isActiveFace ? 0.22 : 0.12) * baseAlpha);
          ctx.strokeStyle = showColorEdges ? compositeStroke(isActiveFace ? 0.9 : 0.55) : "transparent";
          ctx.lineWidth = isActiveFace ? 2.0 : 1.0;
        } else if (isActiveFace) {
          ctx.fillStyle = faceFillForTetra(tetra, face.label, 0.30 * baseAlpha);
          ctx.strokeStyle = showColorEdges ? faceStrokeForTetra(tetra, face.label, 0.95) : "transparent";
          ctx.lineWidth = 2.2;
        } else if (isOpen) {
          ctx.fillStyle = faceFillForTetra(tetra, face.label, 0.18 * baseAlpha);
          ctx.strokeStyle = showColorEdges ? faceStrokeForTetra(tetra, face.label, 0.80) : "transparent";
          ctx.lineWidth = 1.2;
        } else {
          ctx.fillStyle = faceFillForTetra(tetra, face.label, 0.12 * baseAlpha);
          ctx.strokeStyle = showColorEdges ? faceStrokeForTetra(tetra, face.label, 0.62) : "transparent";
          ctx.lineWidth = 1.0;
        }

        ctx.fill();
        if (showColorEdges) {
          ctx.stroke();
        }

        if (showLabels && isComposite) {
          const cx = (face.pts[0].x + face.pts[1].x + face.pts[2].x) / 3;
          const cy = (face.pts[0].y + face.pts[1].y + face.pts[2].y) / 3;
          ctx.fillStyle = "rgba(232,240,248,0.85)";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`T${tetra.id}`, cx, cy);
        }
      }
    }

    if (showEdges) {
      for (const [a, b] of tetraEdgePairs(tetra.vertexIds)) {
        const pa = projectedVertices.get(a);
        const pb = projectedVertices.get(b);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = edgeColor(isActive ? 0.72 : 0.50);
        ctx.lineWidth = isActive ? 1.5 : 1.0;
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}
