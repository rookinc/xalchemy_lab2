import * as THREE from '/assets/vendor/three/three.module.js';

function colorForHint(hint) {
  if (hint === 'outer') return 0xffffff;
  if (hint === 'inner') return 0xffb3d1;
  if (hint === 'partner') return 0xc8ffd8;
  if (hint === 'scaffold') return 0x6f8db8;
  if (hint === 'coupler') return 0x9fd0ff;
  return 0xffffff;
}

function toVector3([x, y, z]) {
  return new THREE.Vector3(x, y, z);
}

function makeLineFromPoints(points, style = {}) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(toVector3));
  const material = new THREE.LineBasicMaterial({
    color: colorForHint(style.colorHint),
    transparent: true,
    opacity: style.opacity ?? 1,
  });
  return new THREE.Line(geometry, material);
}

function makeSegment(a, b, style = {}) {
  const geometry = new THREE.BufferGeometry().setFromPoints([toVector3(a), toVector3(b)]);
  const material = new THREE.LineBasicMaterial({
    color: colorForHint(style.colorHint),
    transparent: true,
    opacity: style.opacity ?? 1,
  });
  return new THREE.Line(geometry, material);
}

export function buildSpinorObject(scenePayload) {
  const root = new THREE.Group();

  for (const primitive of scenePayload.primitives || []) {
    if (primitive.type === 'polyline') {
      root.add(makeLineFromPoints(primitive.points, primitive.style));
      continue;
    }

    if (primitive.type === 'segment') {
      root.add(makeSegment(primitive.a, primitive.b, primitive.style));
    }
  }

  return root;
}

export function buildSpinorHistoryObject(historyPayload) {
  const root = new THREE.Group();

  for (const scenePayload of historyPayload.scenes || []) {
    root.add(buildSpinorObject(scenePayload));
  }

  return root;
}
