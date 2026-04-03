export const PRIME_ATTACHMENT = {
  name: "prime_attachment_v1",

  prime: {
    id: "t0",
    phase: "objective",
    fold_chirality: "left",
    realized_face_chirality: {
      f1: "right",
      f2: "right",
      f3: "right",
      f4: "left",
    },

    // Canonical tetra support
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

  attachments: [
    {
      id: "t1",
      parent: "t0",
      attach_from_face: "f1",
      mode: "mirror",
      generated_from: "f4",
      generated_chirality: "left",
      register: ["W","X","Y","Z","T","I","W"],
    },
    {
      id: "t2",
      parent: "t0",
      attach_from_face: "f2",
      mode: "mirror",
      generated_from: "f4",
      generated_chirality: "left",
      register: ["W","X","Y","Z","T","I","W"],
    },
    {
      id: "t3",
      parent: "t0",
      attach_from_face: "f3",
      mode: "mirror",
      generated_from: "f4",
      generated_chirality: "left",
      register: ["W","X","Y","Z","T","I","W"],
    },
  ],
};
