import * as THREE from '/public/vendor/three/three.module.js';
import { OrbitControls } from '/public/vendor/three/OrbitControls.js';
import { nthFrontier } from '/public/assets/spinor/frontier_grammar.js';

const els = {
  canvas: document.getElementById('stage3d'),
  tickPrev: document.getElementById('tick-prev'),
  tickNext: document.getElementById('tick-next'),
  cameraReset: document.getElementById('camera-reset'),
  statusTick: document.getElementById('status-tick'),
  statusSlot: document.getElementById('status-slot'),
  statusNextSlot: document.getElementById('status-next-slot'),
  statusJoin: document.getElementById('status-join'),
  statusSheet: document.getElementById('status-sheet'),
  readout: document.getElementById('readout'),
  bridgeReadout: document.getElementById('bridge-readout'),
};

const state = { tick: 1 };

const renderer = new THREE.WebGLRenderer({
  canvas: els.canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(els.canvas.clientWidth, els.canvas.clientHeight, false);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  42,
  els.canvas.clientWidth / els.canvas.clientHeight,
  0.1,
  100
);
camera.position.set(0, 0.5, 11);

const controls = new OrbitControls(camera, els.canvas);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.82));
const dir = new THREE.DirectionalLight(0xffffff, 0.92);
dir.position.set(4, 6, 8);
scene.add(dir);

const root = new THREE.Group();
scene.add(root);

const GRID_SIZE = 10;
const grid = new THREE.GridHelper(GRID_SIZE, 20, 0x325a8f, 0x1a2f4a);
grid.position.y = -4.2;
grid.material.opacity = 0.18;
grid.material.transparent = true;
scene.add(grid);

const mats = {
  spineEdge: new THREE.LineBasicMaterial({ color: 0xd8e8ff, transparent: true, opacity: 0.72 }),
  accumEdge: new THREE.LineBasicMaterial({ color: 0x9fb8d8, transparent: true, opacity: 0.22 }),
  currentEdge: new THREE.LineBasicMaterial({ color: 0xe8f0f8, transparent: true, opacity: 0.78 }),
  joinEdge: new THREE.LineBasicMaterial({ color: 0xffe66e, transparent: true, opacity: 0.90 }),

  center: new THREE.MeshStandardMaterial({ color: 0xe8f0f8 }),
  spine: new THREE.MeshStandardMaterial({ color: 0xa8c9ff }),
  accum: new THREE.MeshStandardMaterial({ color: 0x98aecd, transparent: true, opacity: 0.45 }),
  current: new THREE.MeshStandardMaterial({ color: 0xff6e6e, emissive: 0x330000 }),
  currentNeighbor: new THREE.MeshStandardMaterial({ color: 0xffeb6e, emissive: 0x665200 }),
  join: new THREE.MeshStandardMaterial({ color: 0xffeb6e, emissive: 0x443900 }),

  accumFace: new THREE.MeshStandardMaterial({
    color: 0x8ea6c8,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  currentFace: new THREE.MeshStandardMaterial({
    color: 0xffd36e,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide,
    depthWrite: false,
    emissive: 0x332200,
  }),
};

const geos = {
  center: new THREE.SphereGeometry(0.13, 20, 20),
  spine: new THREE.SphereGeometry(0.11, 18, 18),
  accum: new THREE.SphereGeometry(0.09, 16, 16),
  current: new THREE.SphereGeometry(0.18, 20, 20),
  neighbor: new THREE.SphereGeometry(0.12, 18, 18),
  join: new THREE.SphereGeometry(0.10, 18, 18),
};

let graph = null;

function resetCamera() {
  camera.position.set(0, 0.5, 11);
  controls.target.set(0, 0, 0);
  controls.update();
}

function clearRoot() {
  while (root.children.length) {
    const obj = root.children.pop();
    if (obj.userData?.isTextSprite && obj.material?.map) {
      obj.material.map.dispose?.();
    }
    if (obj.geometry) obj.geometry.dispose?.();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
      else obj.material.dispose?.();
    }
  }
}

function scaffoldPositionMap() {
  return {
    n0: new THREE.Vector3(0.00,  0.00,  0.00),
    n1: new THREE.Vector3(0.00, -0.70,  0.00),
    n2: new THREE.Vector3(0.00, -1.45,  0.00),

    "3":  new THREE.Vector3(-1.10, -1.10,  0.10),
    "4":  new THREE.Vector3(-1.65, -2.05,  0.20),
    "5":  new THREE.Vector3( 0.00, -2.25,  0.00),
    "6":  new THREE.Vector3( 1.65, -2.05, -0.20),

    "7":  new THREE.Vector3( 1.05, -1.00, -0.10),
    "8":  new THREE.Vector3(-0.95,  0.95,  0.10),
    "9":  new THREE.Vector3(-1.55,  0.20,  0.20),
    "10": new THREE.Vector3( 0.95, -0.05, -0.10),

    "11": new THREE.Vector3( 1.70,  0.85, -0.15),
    "12": new THREE.Vector3( 0.10,  1.85,  0.00),
    "13": new THREE.Vector3( 0.00, -0.10,  0.00),
    "14": new THREE.Vector3(-0.10,  0.40,  0.00),
  };
}

function makeNode(id, pos, opts = {}) {
  return {
    id,
    pos: pos.clone(),
    vel: new THREE.Vector3(),
    pinned: !!opts.pinned,
    pin: pos.clone(),
    kind: opts.kind || 'accum',
    mesh: null,
  };
}

function makeEdge(a, b, kind = 'accum') {
  return { a, b, kind, line: null };
}

function edgeKey(a, b) {
  return [a, b].sort().join('|');
}

function triKey(a, b, c) {
  return [a, b, c].sort().join('|');
}

function tetKey(a, b, c, d) {
  return [a, b, c, d].sort().join('|');
}

function normalizeEdgeId(edgeId) {
  const m = /:([A-Za-z0-9]+)-([A-Za-z0-9]+)$/.exec(edgeId);
  if (!m) return null;
  return edgeKey(m[1], m[2]);
}

async function fetchBridge(tick) {
  const res = await fetch(`/frontier/api/g60-focus/${tick}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`bridge fetch failed: ${res.status}`);
  return await res.json();
}

async function fetchBridgeRange(maxTick) {
  const out = [];
  for (let t = 1; t <= maxTick; t += 1) out.push(await fetchBridge(t));
  return out;
}

function buildFaces(nodeMap, accumEdgeKeys, currentEdgeKeys) {
  const ids = [...nodeMap.keys()].filter((id) => !id.startsWith('I_') && !id.startsWith('spine_') && !/^t\d+r$/.test(id));
  const faces = [];
  const seen = new Set();

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      for (let k = j + 1; k < ids.length; k += 1) {
        const a = ids[i], b = ids[j], c = ids[k];
        const e1 = edgeKey(a, b);
        const e2 = edgeKey(a, c);
        const e3 = edgeKey(b, c);

        const allAccum = accumEdgeKeys.has(e1) && accumEdgeKeys.has(e2) && accumEdgeKeys.has(e3);
        if (!allAccum) continue;

        const key = triKey(a, b, c);
        if (seen.has(key)) continue;
        seen.add(key);

        const current =
          currentEdgeKeys.has(e1) ||
          currentEdgeKeys.has(e2) ||
          currentEdgeKeys.has(e3);

        faces.push({
          a: nodeMap.get(a),
          b: nodeMap.get(b),
          c: nodeMap.get(c),
          kind: current ? 'currentFace' : 'accumFace',
          mesh: null,
        });
      }
    }
  }

  return faces;
}

function buildTetra(nodeMap, accumEdgeKeys, currentEdgeKeys) {
  const ids = [...nodeMap.keys()].filter((id) => !id.startsWith('I_') && !id.startsWith('spine_') && !/^t\d+r$/.test(id));
  const tets = [];
  const seen = new Set();

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      for (let k = j + 1; k < ids.length; k += 1) {
        for (let l = k + 1; l < ids.length; l += 1) {
          const a = ids[i], b = ids[j], c = ids[k], d = ids[l];
          const edges = [
            edgeKey(a, b), edgeKey(a, c), edgeKey(a, d),
            edgeKey(b, c), edgeKey(b, d), edgeKey(c, d),
          ];
          const present = edges.filter((e) => accumEdgeKeys.has(e));
          const current = edges.filter((e) => currentEdgeKeys.has(e));

          const key = tetKey(a, b, c, d);
          if (seen.has(key)) continue;
          seen.add(key);

          if (present.length === 6) {
            tets.push({
              ids: [a, b, c, d].sort(),
              nodes: [nodeMap.get(a), nodeMap.get(b), nodeMap.get(c), nodeMap.get(d)],
              status: current.length > 0 ? 'forming' : 'realized',
            });
          } else if (present.length === 5 && current.length > 0) {
            tets.push({
              ids: [a, b, c, d].sort(),
              nodes: [nodeMap.get(a), nodeMap.get(b), nodeMap.get(c), nodeMap.get(d)],
              status: 'forming',
            });
          }
        }
      }
    }
  }

  return tets;
}

function buildGraph(frontier, bridges) {
  const posMap = scaffoldPositionMap();

  const nodeKinds = new Map();
  const accumEdgeKeys = new Set();
  const currentEdgeKeys = new Set();

  let currentPrimary = null;
  let currentNeighbors = new Set();

  for (const b of bridges) {
    const focus = b?.g60_focus?.scaffold_focus || {};
    const primary = focus.primary_node || null;
    const neighbors = focus.neighbor_nodes || [];
    const activeEdges = focus.active_edges || [];

    if (primary && posMap[primary] && !nodeKinds.has(primary)) nodeKinds.set(primary, 'accum');
    for (const n of neighbors) {
      if (posMap[n] && !nodeKinds.has(n)) nodeKinds.set(n, 'accum');
    }
    for (const e of activeEdges) {
      const k = normalizeEdgeId(e);
      if (k) accumEdgeKeys.add(k);
    }
  }

  const lastBridge = bridges[bridges.length - 1];
  const lastFocus = lastBridge?.g60_focus?.scaffold_focus || {};
  currentPrimary = lastFocus.primary_node || null;
  currentNeighbors = new Set(lastFocus.neighbor_nodes || []);
  for (const e of lastFocus.active_edges || []) {
    const k = normalizeEdgeId(e);
    if (k) currentEdgeKeys.add(k);
  }

  if (currentPrimary && posMap[currentPrimary]) nodeKinds.set(currentPrimary, 'current');
  for (const n of currentNeighbors) {
    if (posMap[n]) nodeKinds.set(n, 'neighbor');
  }

  const nodes = [];
  const nodeMap = new Map();

  function addNode(id, pos, kind, pinned = false) {
    if (nodeMap.has(id)) return nodeMap.get(id);
    const n = makeNode(id, pos, { kind, pinned });
    if (pinned) n.pin.copy(pos);
    nodeMap.set(id, n);
    nodes.push(n);
    return n;
  }

  const center = addNode('I_center', new THREE.Vector3(0, 0, 0), 'center', true);
  const spineUp = addNode('spine_up', new THREE.Vector3(0, -0.70, 0), 'spine', true);
  const spineDown = addNode('spine_down', new THREE.Vector3(0, 0.70, 0), 'spine', true);
  const joinNode = addNode(frontier.join, new THREE.Vector3(0, 0, 0), 'join', true);

  for (const [id, kind] of nodeKinds.entries()) {
    if (!posMap[id]) continue;
    addNode(id, posMap[id].clone(), kind, kind === 'current');
  }

  const edges = [
    makeEdge(center, joinNode, 'spine'),
    makeEdge(center, spineUp, 'spine'),
    makeEdge(center, spineDown, 'spine'),
  ];

  for (const k of accumEdgeKeys) {
    const [aId, bId] = k.split('|');
    if (!nodeMap.has(aId) || !nodeMap.has(bId)) continue;
    const kind = currentEdgeKeys.has(k) ? 'currentEdge' : 'accumEdge';
    edges.push(makeEdge(nodeMap.get(aId), nodeMap.get(bId), kind));
  }

  if (currentPrimary && nodeMap.has(currentPrimary)) {
    edges.push(makeEdge(joinNode, nodeMap.get(currentPrimary), 'joinEdge'));
  }

  const faces = buildFaces(nodeMap, accumEdgeKeys, currentEdgeKeys);
  const tetra = buildTetra(nodeMap, accumEdgeKeys, currentEdgeKeys);

  return {
    nodes,
    edges,
    faces,
    tetra,
    accumEdgeKeys,
    currentEdgeKeys,
  };
}

function geometryForKind(kind) {
  if (kind === 'center') return geos.center;
  if (kind === 'spine') return geos.spine;
  if (kind === 'join') return geos.join;
  if (kind === 'current') return geos.current;
  if (kind === 'neighbor') return geos.neighbor;
  return geos.accum;
}

function materialForKind(kind) {
  if (kind === 'center') return mats.center;
  if (kind === 'spine') return mats.spine;
  if (kind === 'join') return mats.join;
  if (kind === 'current') return mats.current;
  if (kind === 'neighbor') return mats.currentNeighbor;
  return mats.accum;
}

function lineMaterialForKind(kind) {
  if (kind === 'spine') return mats.spineEdge;
  if (kind === 'joinEdge') return mats.joinEdge;
  if (kind === 'currentEdge') return mats.currentEdge;
  return mats.accumEdge;
}

function faceMesh(a, b, c, material) {
  const geom = new THREE.BufferGeometry();
  const verts = new Float32Array([
    a.x, a.y, a.z,
    b.x, b.y, b.z,
    c.x, c.y, c.z,
  ]);
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geom.computeVertexNormals();
  return new THREE.Mesh(geom, material);
}

function makeTextSprite(text, color = '#f2f6ff', scale = 0.8) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '34px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale * 2.8, scale * 0.7, 1);
  sprite.userData.isTextSprite = true;
  return sprite;
}

function tetCentroid(nodes) {
  const c = new THREE.Vector3();
  for (const n of nodes) c.add(n.pos);
  return c.multiplyScalar(1 / nodes.length);
}

function instantiateGraph(frontier, bridges) {
  clearRoot();
  graph = buildGraph(frontier, bridges);

  for (const f of graph.faces) {
    const mesh = faceMesh(
      f.a.pos, f.b.pos, f.c.pos,
      f.kind === 'currentFace' ? mats.currentFace : mats.accumFace
    );
    root.add(mesh);
    f.mesh = mesh;
  }

  for (const n of graph.nodes) {
    const mesh = new THREE.Mesh(geometryForKind(n.kind), materialForKind(n.kind));
    mesh.position.copy(n.pos);
    root.add(mesh);
    n.mesh = mesh;
  }

  for (const e of graph.edges) {
    const geo = new THREE.BufferGeometry().setFromPoints([e.a.pos, e.b.pos]);
    const line = new THREE.Line(geo, lineMaterialForKind(e.kind));
    root.add(line);
    e.line = line;
  }

  for (const t of graph.tetra) {
    if (t.status !== 'forming') {
      t.label = null;
      continue;
    }
    const label = `△ ${t.ids.join('_')}`;
    const sprite = makeTextSprite(label, '#ffd96e', 0.95);
    sprite.position.copy(tetCentroid(t.nodes)).add(new THREE.Vector3(0, 0.12, 0));
    root.add(sprite);
    t.label = sprite;
  }
}

function springStep() {
  if (!graph) return;

  const repel = 0.014;
  const springK = 0.062;
  const damping = 0.84;
  const zFlatten = 0.06;

  for (const n of graph.nodes) {
    if (!n.pinned) n.vel.multiplyScalar(damping);
  }

  for (let i = 0; i < graph.nodes.length; i += 1) {
    for (let j = i + 1; j < graph.nodes.length; j += 1) {
      const a = graph.nodes[i];
      const b = graph.nodes[j];
      const d = new THREE.Vector3().subVectors(a.pos, b.pos);
      const len2 = Math.max(d.lengthSq(), 0.05);
      const force = repel / len2;
      d.normalize().multiplyScalar(force);

      if (!a.pinned) a.vel.add(d);
      if (!b.pinned) b.vel.sub(d);
    }
  }

  for (const e of graph.edges) {
    const a = e.a;
    const b = e.b;
    const d = new THREE.Vector3().subVectors(b.pos, a.pos);
    const len = Math.max(d.length(), 0.0001);

    const rest =
      e.kind === 'spine' ? 0.70 :
      e.kind === 'joinEdge' ? 1.05 :
      e.kind === 'currentEdge' ? 0.96 :
      0.82;

    const f = springK * (len - rest);
    d.normalize().multiplyScalar(f);

    if (!a.pinned) a.vel.add(d);
    if (!b.pinned) b.vel.sub(d);
  }

  for (const n of graph.nodes) {
    if (n.pinned) {
      n.pos.lerp(n.pin, 0.45);
      n.pos.x *= 0.82;
      n.pos.z *= 0.82;
      continue;
    }

    n.pos.add(n.vel);

    if (n.pos.y < 0) n.vel.y += (-1.10 - n.pos.y) * 0.008;
    if (n.pos.y > 0) n.vel.y += ( 1.10 - n.pos.y) * 0.008;

    n.vel.x += (-n.pos.x) * 0.008;
    n.vel.z += (-n.pos.z) * zFlatten;
  }

  for (const n of graph.nodes) {
    n.mesh.position.copy(n.pos);
  }

  for (const e of graph.edges) {
    e.line.geometry.setFromPoints([e.a.pos, e.b.pos]);
  }

  for (const f of graph.faces) {
    f.mesh.geometry.dispose();
    f.mesh.geometry = new THREE.BufferGeometry();
    const verts = new Float32Array([
      f.a.pos.x, f.a.pos.y, f.a.pos.z,
      f.b.pos.x, f.b.pos.y, f.b.pos.z,
      f.c.pos.x, f.c.pos.y, f.c.pos.z,
    ]);
    f.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    f.mesh.geometry.computeVertexNormals();
  }

  for (const t of graph.tetra) {
    if (!t.label) continue;
    t.label.position.copy(tetCentroid(t.nodes)).add(new THREE.Vector3(0, 0.12, 0));
  }
}

function updateStatus(frontier) {
  els.statusTick.textContent = String(state.tick);
  els.statusSlot.textContent = frontier.slot;
  els.statusNextSlot.textContent = frontier.next_slot;
  els.statusJoin.textContent = frontier.join;
  els.statusSheet.textContent = frontier.sheet;
}

function updateReadout(frontier, bridges) {
  const bridge = bridges[bridges.length - 1];
  const focus = bridge?.g60_focus?.scaffold_focus || {};
  const g15 = bridge?.g15_focus?.g15_focus || {};
  const g30 = bridge?.g60_focus?.g30_focus || {};

  const occupiedNodes = new Set();
  const occupiedEdges = new Set();

  for (const b of bridges) {
    const f = b?.g60_focus?.scaffold_focus || {};
    if (f.primary_node) occupiedNodes.add(f.primary_node);
    (f.neighbor_nodes || []).forEach((n) => occupiedNodes.add(n));
    (f.active_edges || []).forEach((e) => occupiedEdges.add(e));
  }

  const realizedTetra = (graph?.tetra || []).filter((t) => t.status === 'realized').length;
  const formingTetra = (graph?.tetra || []).filter((t) => t.status === 'forming').length;

  els.readout.textContent = [
    `tick          : ${frontier.tick}`,
    `slot          : ${frontier.slot}`,
    `next_slot     : ${frontier.next_slot}`,
    `join          : ${frontier.join}`,
    `sheet         : ${frontier.sheet}`,
    `socket        : ${frontier.socket}`,
    `closed_id     : ${frontier.closed.id}`,
    `open_id       : ${frontier.open.id}`,
    `g15_vertex    : ${g15.vertex || '?'}`,
    `g30_class     : ${g30.class_id || '?'}`,
    `primary_node  : ${focus.primary_node || '?'}`,
    `neighbors     : ${(focus.neighbor_nodes || []).join(', ') || '-'}`,
    `occupied_nodes: ${occupiedNodes.size}`,
    `occupied_edges: ${occupiedEdges.size}`,
    `occupied_faces: ${graph?.faces?.length ?? 0}`,
    `realized_tetra: ${realizedTetra}`,
    `forming_tetra : ${formingTetra}`,
  ].join('\n');

  els.bridgeReadout.textContent = [
    `route         : frontier -> g30 -> g15 -> g60`,
    `frame         : ${bridge?.bridge_summary?.frame ?? '?'}`,
    `phase         : ${bridge?.bridge_summary?.phase ?? '?'}`,
    `sheet         : ${bridge?.bridge_summary?.sheet ?? '?'}`,
    `slot          : ${bridge?.bridge_summary?.slot ?? '?'}`,
    `next_slot     : ${bridge?.bridge_summary?.next_slot ?? '?'}`,
    `socket        : ${bridge?.bridge_summary?.socket ?? '?'}`,
    ``,
    `g15_vertex    : ${g15.vertex || '?'}`,
    `closed_nbhd   : ${(bridge?.g15_sector_support?.closed_neighborhood || []).join(', ') || '-'}`,
    ``,
    `g60_class     : ${g30.class_id || '?'}`,
    `members       : ${(g30.members || []).join(', ') || '-'}`,
    `primary_node  : ${focus.primary_node || '?'}`,
    `active_nodes  : ${(focus.active_nodes || []).join(', ') || '-'}`,
    `neighbors     : ${(focus.neighbor_nodes || []).join(', ') || '-'}`,
    `active_edges  : ${(focus.active_edges || []).join(', ') || '-'}`,
  ].join('\n');
}

async function setTick(nextTick) {
  state.tick = Math.max(1, Math.min(24, nextTick));
  const frontier = nthFrontier(state.tick);
  const bridges = await fetchBridgeRange(state.tick);
  instantiateGraph(frontier, bridges);
  updateStatus(frontier);
  updateReadout(frontier, bridges);
}

function onResize() {
  const w = els.canvas.clientWidth;
  const h = els.canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', onResize);

els.tickPrev.addEventListener('click', async () => {
  try { await setTick(state.tick - 1); } catch (e) { console.error(e); }
});
els.tickNext.addEventListener('click', async () => {
  try { await setTick(state.tick + 1); } catch (e) { console.error(e); }
});
els.cameraReset.addEventListener('click', resetCamera);

function animate() {
  requestAnimationFrame(animate);
  springStep();
  controls.update();
  renderer.render(scene, camera);
}

(async function boot() {
  resetCamera();
  onResize();
  try {
    await setTick(1);
  } catch (e) {
    console.error(e);
    els.readout.textContent = String(e);
    els.bridgeReadout.textContent = 'bridge boot failed';
  }
  animate();
})();
