export const PRIME_ATTACHMENT = {
  name: "prime_attachment_v2",

  cycle_1: {
    closure_face: "f4",
    register: ["W","X","Y","Z","T","I","W"],
  },

  prime: {
    id: "t0",
    domain: "downstairs",
    role: "prime",
    phase: "objective",
    fold_chirality: "left",
    realized_face_chirality: {
      f1: "right",
      f2: "right",
      f3: "right",
      f4: "left",
    },

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
  },

  mirrored_prime: {
    id: "u0",
    domain: "upstairs",
    role: "mirrored_prime",
    mirror_of: "t0",
  },

  cycle_2: {
    note: "Ordered bilateral propagation after cycle^1 closure on f4.",

    downstairs_hexad: [
      { id: "d0", ordinal: 0, attach_from: "f1", chirality: "left"  },
      { id: "d1", ordinal: 1, attach_from: "f2", chirality: "right" },
      { id: "d2", ordinal: 2, attach_from: "f3", chirality: "left"  },
      { id: "d3", ordinal: 3, attach_from: "f1", chirality: "right" },
      { id: "d4", ordinal: 4, attach_from: "f2", chirality: "left"  },
      { id: "d5", ordinal: 5, attach_from: "f3", chirality: "right" },
    ],

    upstairs_hexad: [
      { id: "u1", ordinal: 0, attach_from: "f1", chirality: "right" },
      { id: "u2", ordinal: 1, attach_from: "f2", chirality: "left"  },
      { id: "u3", ordinal: 2, attach_from: "f3", chirality: "right" },
      { id: "u4", ordinal: 3, attach_from: "f1", chirality: "left"  },
      { id: "u5", ordinal: 4, attach_from: "f2", chirality: "right" },
      { id: "u6", ordinal: 5, attach_from: "f3", chirality: "left"  },
    ],
  },
};
