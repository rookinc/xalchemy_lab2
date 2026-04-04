export const OCCUPANCY_REGISTER = {
  host: {
    name: "AT4val[60,6]",
    graphsym_id: "AT4val[60,6]",
    house_of_graphs_id: "Graph52002",
    vertex_count: 60,
    edge_count: 120,
    regular_degree: 4,
    automorphism_group_order: 480,
    diameter: 6,
    shells: [1, 4, 8, 16, 24, 6, 1],
    role: "candidate vessel host",
  },

  register: ["W", "X", "Y", "Z", "T", "I", "W"],

  prime: {
    id: "t0",
    domain: "downstairs",
    role: "prime tetra",
    phase: "RGB",
    state: "closed",
    slot: "prime",
    notes: "closure on f4 at tick 1.0",
    points: {
      A: [-0.72, -0.48, 0.00],
      B: [ 0.72, -0.42, 0.10],
      C: [ 0.00,  0.92, 0.00],
      D: [ 0.22,  0.12, 0.56],
    },
    faces: {
      f1: ["A", "C", "D"],
      f2: ["B", "C", "D"],
      f3: ["A", "B", "D"],
      f4: ["A", "B", "C"],
    },
    fold_chirality: "left",
    realized_face_chirality: {
      f1: "right",
      f2: "right",
      f3: "right",
      f4: "left",
    },
  },

  mirrored_prime: {
    id: "u0",
    domain: "upstairs",
    role: "mirrored prime",
    phase: "CMY",
    state: "open",
    slot: "mirror-prime",
    mirror_of: "t0",
    notes: "paired upstairs companion of t0",
  },

  cycle2: {
    downstairs: [
      { id: "t3", ordinal: 0, slot: "W", attach_from: "f1", chirality: "left",  domain: "downstairs", phase: "RGB", state: "open", role: "cycle² offspring", notes: "RGB branch from t1" },
      { id: "t4", ordinal: 1, slot: "X", attach_from: "f2", chirality: "right", domain: "downstairs", phase: "RGB", state: "open", role: "cycle² offspring", notes: "RGB branch from t1" },
      { id: "t5", ordinal: 2, slot: "Y", attach_from: "f3", chirality: "left",  domain: "downstairs", phase: "RGB", state: "open", role: "cycle² offspring", notes: "RGB branch from t1" },
    ],
    upstairs: [
      { id: "u1", ordinal: 0, slot: "Z", attach_from: "f1", chirality: "right", domain: "upstairs", phase: "CMY", state: "open", role: "cycle² offspring", notes: "CMY branch from t2" },
      { id: "u2", ordinal: 1, slot: "T", attach_from: "f2", chirality: "left",  domain: "upstairs", phase: "CMY", state: "open", role: "cycle² offspring", notes: "CMY branch from t2" },
      { id: "u3", ordinal: 2, slot: "I", attach_from: "f3", chirality: "right", domain: "upstairs", phase: "CMY", state: "open", role: "cycle² offspring", notes: "CMY branch from t2" },
    ],
  },

  next_orbit: {
    downstairs: [
      { id: "t6", ordinal: 3, slot: "W′", attach_from: "f1", chirality: "right", domain: "downstairs", phase: "RGB", state: "forming", role: "next orbit", notes: "downstairs continuation begins" },
      { id: "t7", ordinal: 4, slot: "X′", attach_from: "f2", chirality: "left",  domain: "downstairs", phase: "RGB", state: "forming", role: "next orbit", notes: "downstairs continuation begins" },
      { id: "t8", ordinal: 5, slot: "Y′", attach_from: "f3", chirality: "right", domain: "downstairs", phase: "RGB", state: "forming", role: "next orbit", notes: "downstairs continuation begins" },
    ],
    upstairs: [
      { id: "u4", ordinal: 3, slot: "Z′", attach_from: "f1", chirality: "left",  domain: "upstairs", phase: "CMY", state: "closed", role: "next orbit", notes: "upstairs accumulation visible by tick 3.0" },
      { id: "u5", ordinal: 4, slot: "T′", attach_from: "f2", chirality: "right", domain: "upstairs", phase: "CMY", state: "closed", role: "next orbit", notes: "upstairs accumulation visible by tick 3.0" },
      { id: "u6", ordinal: 5, slot: "I′", attach_from: "f3", chirality: "left",  domain: "upstairs", phase: "CMY", state: "closed", role: "next orbit", notes: "upstairs accumulation visible by tick 3.0" },
    ],
  },
};

export function allOccupants() {
  return [
    OCCUPANCY_REGISTER.prime,
    OCCUPANCY_REGISTER.mirrored_prime,
    ...OCCUPANCY_REGISTER.cycle2.downstairs,
    ...OCCUPANCY_REGISTER.cycle2.upstairs,
    ...OCCUPANCY_REGISTER.next_orbit.downstairs,
    ...OCCUPANCY_REGISTER.next_orbit.upstairs,
  ];
}

export function occupantMap() {
  return Object.fromEntries(allOccupants().map((row) => [row.id, row]));
}
