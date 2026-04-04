export const TETRA_INSTANT = {
  name: "tetra_instant_v1",

  spine: {
    n0: [0, -1.0, 0],
    n1: [0,  0.0, 0],
    n2: [0,  1.0, 0],
  },

  anchors: {
    a3:  [-1.25, -1.00,  0.00],
    a4:  [-1.10,  0.18,  0.00],
    a5:  [ 0.00,  1.28,  0.00],
    a6:  [ 1.28,  1.08,  0.00],
    a7:  [ 0.86, -0.02,  0.28],
    a8:  [-0.52, -0.42, -0.10],
    a9:  [-0.58,  0.08,  0.18],
    a10: [ 0.54,  0.08,  0.18],
    a11: [ 1.24, -0.40,  0.00],
    a12: [ 0.28, -1.00,  0.00],
    a14: [-0.02, -0.16,  0.00],
  },

  layers: {
    lower:  ["a3", "a8", "a14", "a11", "a12"],
    middle: ["a4", "a9", "a10", "a7", "a14"],
    upper:  ["a4", "a5", "a6", "a3"],
  },

  paths: {
    subjective: {
      left: {
        cyan:    ["a3", "a8", "a14", "a11", "a12"],
        magenta: ["a4", "a9", "a10", "a7", "a14"],
        yellow:  ["a4", "a5", "a6", "a3"],
      },
      right: {
        cyan:    ["a3", "a14", "a8", "a12", "a11"],
        magenta: ["a4", "a10", "a9", "a14", "a7"],
        yellow:  ["a3", "a5", "a4", "a6"],
      },
    },
    objective: {
      left: {
        red:   ["a3", "a4", "a5"],
        green: ["a5", "a6", "a7"],
        blue:  ["a3", "a12", "a11"],
      },
      right: {
        red:   ["a3", "a5", "a4"],
        green: ["a5", "a7", "a6"],
        blue:  ["a3", "a11", "a12"],
      },
    },
  },

  faces: {
    subjective: {
      left: [
        ["a3", "a8", "a14"],
        ["a4", "a9", "a14"],
        ["a10", "a7", "a14"],
      ],
      right: [
        ["a3", "a14", "a8"],
        ["a4", "a14", "a10"],
        ["a9", "a7", "a14"],
      ],
    },
    objective: {
      left: [
        ["a3", "a4", "a5"],
        ["a5", "a6", "a7"],
        ["a3", "a12", "a11"],
      ],
      right: [
        ["a3", "a5", "a4"],
        ["a5", "a7", "a6"],
        ["a3", "a11", "a12"],
      ],
    },
  },

  palettes: {
    subjective: ["cyan", "magenta", "yellow"],
    objective: ["red", "green", "blue"],
  },
};
