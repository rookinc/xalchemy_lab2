export const G60_VESSEL = {
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

  rails: {
    upstairs: ["u0", "u1", "u2", "u3", "u4", "u5", "u6"],
    downstairs: ["t0", "t3", "t4", "t5", "t6", "t7", "t8"],
  },

  occupants: {
    t0: {
      id: "t0",
      slot: "prime",
      domain: "downstairs",
      phase: "RGB",
      state: "closed",
      role: "prime tetra",
      notes: "closure on f4 at tick 1.0",
    },
    u0: {
      id: "u0",
      slot: "mirror-prime",
      domain: "upstairs",
      phase: "CMY",
      state: "open",
      role: "mirrored prime",
      notes: "paired upstairs companion of t0",
    },

    t3: { id: "t3", slot: "W", domain: "downstairs", phase: "RGB", state: "open", role: "cycle² offspring", notes: "RGB branch from t1" },
    t4: { id: "t4", slot: "X", domain: "downstairs", phase: "RGB", state: "open", role: "cycle² offspring", notes: "RGB branch from t1" },
    t5: { id: "t5", slot: "Y", domain: "downstairs", phase: "RGB", state: "open", role: "cycle² offspring", notes: "RGB branch from t1" },

    u1: { id: "u1", slot: "Z", domain: "upstairs", phase: "CMY", state: "open", role: "cycle² offspring", notes: "CMY branch from t2" },
    u2: { id: "u2", slot: "T", domain: "upstairs", phase: "CMY", state: "open", role: "cycle² offspring", notes: "CMY branch from t2" },
    u3: { id: "u3", slot: "I", domain: "upstairs", phase: "CMY", state: "open", role: "cycle² offspring", notes: "CMY branch from t2" },

    t6: { id: "t6", slot: "W′", domain: "downstairs", phase: "RGB", state: "forming", role: "next orbit", notes: "downstairs continuation begins" },
    t7: { id: "t7", slot: "X′", domain: "downstairs", phase: "RGB", state: "forming", role: "next orbit", notes: "downstairs continuation begins" },
    t8: { id: "t8", slot: "Y′", domain: "downstairs", phase: "RGB", state: "forming", role: "next orbit", notes: "downstairs continuation begins" },

    u4: { id: "u4", slot: "Z′", domain: "upstairs", phase: "CMY", state: "closed", role: "next orbit", notes: "upstairs accumulation visible by tick 3.0" },
    u5: { id: "u5", slot: "T′", domain: "upstairs", phase: "CMY", state: "closed", role: "next orbit", notes: "upstairs accumulation visible by tick 3.0" },
    u6: { id: "u6", slot: "I′", domain: "upstairs", phase: "CMY", state: "closed", role: "next orbit", notes: "upstairs accumulation visible by tick 3.0" },
  },
};
