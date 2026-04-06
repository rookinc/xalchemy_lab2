export const FIELD_SEEDS = {
  instant_subjective_left: {
    id: "instant_subjective_left",
    label: "Instant · subjective · left",
    phase: "subjective",
    chirality: "left",
    points: [
      [-0.55, -0.40, 0.00],
      [ 0.55, -0.25, 0.10],
      [ 0.00,  0.75, 0.00],
      [ 0.35,  0.20, 0.45],
    ],
    edges: [
      [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
    ],
    faces: [
      [0,2,3],
      [1,2,3],
      [0,1,2],
    ],
  },

  fold_x3: {
    id: "fold_x3",
    label: "Fold x3",
    phase: "subjective",
    chirality: "left",
    points: [
      [-0.62, -0.55, 0.00],
      [ 0.62, -0.55, 0.00],
      [ 0.00,  0.82, 0.00],
      [ 0.00, -0.05, 0.22],
    ],
    edges: [
      [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
    ],
    faces: [
      [0,2,3],
      [1,2,3],
      [0,1,3],
    ],
  },

  fold_x5: {
    id: "fold_x5",
    label: "Fold x5",
    phase: "objective",
    chirality: "right",
    points: [
      [-0.75, -0.60, 0.00],
      [ 0.70, -0.45, 0.10],
      [ 0.00,  0.88, 0.00],
      [ 0.22,  0.10, 0.50],
    ],
    edges: [
      [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
    ],
    faces: [
      [0,2,3],
      [1,2,3],
      [0,1,2],
    ],
  },
};
