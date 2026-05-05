export function createDefaultCamera() {
  return {
    projection: "perspective",
    distance: 14.0,
    yaw: 0.0,
    pitch: -0.28,
    panX: 0.0,
    panY: 0.0,
    orbitEnabled: false,
  };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function resetCamera(camera) {
  camera.projection = "perspective";
  camera.distance = 14.0;
  camera.yaw = 0.0;
  camera.pitch = -0.28;
  camera.panX = 0.0;
  camera.panY = 0.0;
  camera.orbitEnabled = false;
  return camera;
}

export function rotateY(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: c * point.x + s * point.z,
    y: point.y,
    z: -s * point.x + c * point.z,
  };
}

export function rotateX(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: point.x,
    y: c * point.y - s * point.z,
    z: s * point.y + c * point.z,
  };
}

export function projectPoint(point, camera, viewport) {
  let q = rotateY(point, camera.yaw);
  q = rotateX(q, camera.pitch);

  q.x += camera.panX;
  q.y += camera.panY;

  if (camera.projection === "orthographic") {
    const scale = Math.min(viewport.width, viewport.height) * 0.12;
    return {
      x: viewport.width / 2 + q.x * scale,
      y: viewport.height / 2 - q.y * scale,
      scale,
      depth: q.z + camera.distance,
    };
  }

  const zCamera = q.z + camera.distance;
  const focal = Math.min(viewport.width, viewport.height) * 0.58;
  const scale = focal / Math.max(1.5, zCamera);

  return {
    x: viewport.width / 2 + q.x * scale,
    y: viewport.height / 2 - q.y * scale,
    scale,
    depth: zCamera,
  };
}

export function zoomCamera(camera, deltaY) {
  const factor = deltaY < 0 ? 0.92 : 1.08;
  camera.distance = clamp(camera.distance * factor, 4.5, 60);
  return camera;
}

export function rotateCamera(camera, dx, dy) {
  camera.yaw += dx * 0.008;
  camera.pitch = clamp(camera.pitch + dy * 0.006, -1.45, 1.45);
  return camera;
}

export function panCamera(camera, dx, dy) {
  const panScale = 0.01 * camera.distance;
  camera.panX += dx * panScale;
  camera.panY -= dy * panScale;
  return camera;
}

export function stepOrbit(camera, delta = 0.004) {
  if (camera.orbitEnabled) {
    camera.yaw += delta;
  }
  return camera;
}

export function toggleOrbit(camera) {
  camera.orbitEnabled = !camera.orbitEnabled;
  return camera.orbitEnabled;
}

export function applyCameraPreset(camera, preset) {
  switch (preset) {
    case "front":
      camera.yaw = 0.0;
      camera.pitch = -0.18;
      camera.distance = 16.0;
      camera.panX = 0.0;
      camera.panY = 0.0;
      break;

    case "top":
      camera.yaw = 0.0;
      camera.pitch = -1.35;
      camera.distance = 18.0;
      camera.panX = 0.0;
      camera.panY = 0.0;
      break;

    case "look_down_face_1":
      camera.yaw = -1.57;
      camera.pitch = -0.12;
      camera.distance = 10.0;
      camera.panX = 0.0;
      camera.panY = 0.0;
      break;

    case "look_down_face_2":
      camera.yaw = 0.52;
      camera.pitch = -0.10;
      camera.distance = 10.0;
      camera.panX = 0.0;
      camera.panY = 0.0;
      break;

    case "look_down_face_3":
      camera.yaw = 2.62;
      camera.pitch = -0.10;
      camera.distance = 10.0;
      camera.panX = 0.0;
      camera.panY = 0.0;
      break;

    case "junction":
    default:
      camera.yaw = 0.0;
      camera.pitch = -0.55;
      camera.distance = 14.0;
      camera.panX = 0.0;
      camera.panY = 0.0;
      break;
  }

  return camera;
}

export function cameraReadout(camera) {
  return {
    projection: camera.projection,
    distance: camera.distance.toFixed(2),
    yaw: camera.yaw.toFixed(2),
    pitch: camera.pitch.toFixed(2),
    panX: camera.panX.toFixed(2),
    panY: camera.panY.toFixed(2),
    orbitEnabled: camera.orbitEnabled,
  };
}
