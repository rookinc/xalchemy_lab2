import {
  canonicalPrimeVertices,
  tetraFaceMap,
  D4_FACE_ORDER,
  D4_CYCLE_SUM,
  getCyclePhase,
  getLadderRegime,
  defaultCompositeState,
} from "./d4_spec.js";

function vecAdd(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vecSub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vecScale(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function norm(v) {
  return Math.sqrt(dot(v, v));
}

function normalize(v) {
  const n = norm(v);
  if (n < 1e-12) return { x: 0, y: 0, z: 0 };
  return vecScale(v, 1 / n);
}

function centroid(points) {
  const c = points.reduce((acc, p) => vecAdd(acc, p), { x: 0, y: 0, z: 0 });
  return vecScale(c, 1 / points.length);
}

function reflectPointAcrossPlane(point, a, b, c) {
  const n = normalize(cross(vecSub(b, a), vecSub(c, a)));
  const d = dot(vecSub(point, a), n);
  return vecSub(point, vecScale(n, 2 * d));
}

function faceKey(vertexIds) {
  return [...vertexIds].sort((a, b) => a - b).join("|");
}

function edgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function nextChirality(chirality) {
  return chirality === "left" ? "right" : "left";
}

export class D4GrowthEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.turnIndex = 0;
    this.currentD4s = 0;
    this.vertexCounter = 0;
    this.tetraCounter = 0;
    this.vertices = [];
    this.vertexMap = new Map();
    this.tetrahedra = [];
    this.openFaces = [];
    this.internalFaces = [];
    this.edgeSet = new Set();
    this.activeTetraId = null;
    this.activeFaceLabel = null;
    this.activeChirality = null;
    this.seed();
  }

  seed() {
    const verts = canonicalPrimeVertices().map((p) => this._addVertex(p));
    this._addTetra({
      vertexIds: verts,
      chirality: "left",
      parentTetraId: null,
      generatedByFace: null,
      generatedByOperation: null,
      generation: 0,
      turnIndex: 0,
    });
    this.currentD4s = 1;
    this.activeTetraId = this.tetrahedra[0].id;
    this.activeFaceLabel = 1;
    this.activeChirality = "left";
  }

  step() {
    const face = this._selectNextOpenFace();
    if (!face) return this.snapshot();

    const parent = this.tetrahedra.find((t) => t.id === face.tetraId);
    if (!parent) return this.snapshot();

    const faceVerts = face.vertexIds.map((id) => this.vertexMap.get(id));
    const opposite = this.vertexMap.get(face.oppositeVertexId);
    const newApex = this._addVertex(
      reflectPointAcrossPlane(opposite, faceVerts[0], faceVerts[1], faceVerts[2])
    );

    face.state = "internal";
    this.internalFaces.push({
      faceKey: face.faceKey,
      tetraId: face.tetraId,
      faceLabel: face.faceLabel,
      vertexIds: [...face.vertexIds],
    });

    const childChirality = nextChirality(parent.chirality);
    const child = this._addTetra({
      vertexIds: [face.vertexIds[0], face.vertexIds[1], face.vertexIds[2], newApex],
      chirality: childChirality,
      parentTetraId: parent.id,
      generatedByFace: face.faceLabel,
      generatedByOperation: "mirror",
      generation: parent.generation + 1,
      turnIndex: this.turnIndex + 1,
    });

    this.turnIndex += 1;
    this.currentD4s = this.tetrahedra.length;
    this.activeTetraId = child.id;
    this.activeFaceLabel = D4_FACE_ORDER[this.turnIndex % D4_FACE_ORDER.length];
    this.activeChirality = child.chirality;

    return this.snapshot();
  }

  snapshot() {
    const openVertexSet = new Set();
    for (const face of this.openFaces) {
      if (face.state !== "open") continue;
      for (const vid of face.vertexIds) openVertexSet.add(vid);
    }

    return {
      currentD4s: this.currentD4s,
      turnIndex: this.turnIndex,
      cycle: getCyclePhase(this.currentD4s),
      regime: getLadderRegime(this.currentD4s),
      activeTetraId: this.activeTetraId,
      activeFaceLabel: this.activeFaceLabel,
      activeChirality: this.activeChirality,
      topology: {
        vertices: this.vertices.length,
        openVertices: openVertexSet.size,
        closedVertices: this.vertices.length - openVertexSet.size,
        edges: this.edgeSet.size,
        internalFaces: this.internalFaces.length,
        exposedFaces: this.openFaces.filter((f) => f.state === "open").length,
        cells: this.tetrahedra.length,
        chambers: Math.floor(this.turnIndex / 3),
      },
      tetrahedra: this.tetrahedra,
      vertices: this.vertices,
      openFaces: this.openFaces.filter((f) => f.state === "open"),
      internalFaces: this.internalFaces,
    };
  }

  _addVertex(point) {
    const id = this.vertexCounter++;
    const v = { id, x: point.x, y: point.y, z: point.z };
    this.vertices.push(v);
    this.vertexMap.set(id, v);
    return id;
  }

  _addTetra({
    vertexIds,
    chirality,
    parentTetraId,
    generatedByFace,
    generatedByOperation,
    generation,
    turnIndex,
  }) {
    const id = this.tetraCounter++;
    const tetra = {
      id,
      vertexIds: [...vertexIds],
      chirality,
      parentTetraId,
      generatedByFace,
      generatedByOperation,
      generation,
      turnIndex,
      centroid: centroid(vertexIds.map((vid) => this.vertexMap.get(vid))),
      compositeState: defaultCompositeState(),
    };
    this.tetrahedra.push(tetra);

    for (const [a, b] of [
      [vertexIds[0], vertexIds[1]],
      [vertexIds[0], vertexIds[2]],
      [vertexIds[0], vertexIds[3]],
      [vertexIds[1], vertexIds[2]],
      [vertexIds[1], vertexIds[3]],
      [vertexIds[2], vertexIds[3]],
    ]) {
      this.edgeSet.add(edgeKey(a, b));
    }

    const faces = tetraFaceMap(vertexIds);
    for (const faceLabel of D4_FACE_ORDER) {
      const data = faces[faceLabel];
      this.openFaces.push({
        tetraId: id,
        faceLabel,
        vertexIds: [...data.face],
        oppositeVertexId: data.opposite,
        faceKey: faceKey(data.face),
        state: "open",
      });
    }

    return tetra;
  }

  _selectNextOpenFace() {
    const desired = D4_FACE_ORDER[this.turnIndex % D4_FACE_ORDER.length];
    const open = this.openFaces.filter((f) => f.state === "open");
    if (!open.length) return null;

    const preferred = open.find((f) => f.faceLabel === desired);
    return preferred || open[0];
  }
}
