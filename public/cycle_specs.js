(function () {
  const CYCLE_SPECS = {
    g15: {
      key: "g15",
      title: "Witness // G15",
      totalSteps: 15,
      baseModulus: 15,
      passCount: 1,
      projection: "ring15",
      closureMarks: [
        { step: 15, kind: "sign", label: "sign closure" }
      ],
      notes: [
        "G15 is the base register view.",
        "One traversal closes sign, not identity.",
        "Use this page to teach the local cyclic substrate."
      ]
    },

    g30: {
      key: "g30",
      title: "Witness // G30",
      totalSteps: 30,
      baseModulus: 15,
      passCount: 2,
      projection: "double15",
      closureMarks: [
        { step: 15, kind: "sign", label: "sign closure" },
        { step: 30, kind: "identity", label: "identity closure" }
      ],
      notes: [
        "G30 is the doubled traversal of the 15-slot substrate.",
        "Step 15 closes sign.",
        "Step 30 restores identity."
      ]
    },

    g60: {
      key: "g60",
      title: "Witness // G60",
      totalSteps: 60,
      baseModulus: 15,
      passCount: 4,
      projection: "stacked15x4",
      closureMarks: [
        { step: 15, kind: "pass1", label: "pass 1" },
        { step: 30, kind: "mid", label: "mid closure" },
        { step: 45, kind: "pass3", label: "pass 3" },
        { step: 60, kind: "identity", label: "identity closure" }
      ],
      notes: [
        "G60 is a lifted multi-pass frame over the same 15-slot substrate.",
        "This first viewer treats it as four stacked 15-passes.",
        "The projection can change later without changing the cycle law."
      ]
    }
  };

  function clampStep(step, totalSteps) {
    const n = Number.isFinite(step) ? Math.floor(step) : 0;
    if (n < 0) return 0;
    if (n > totalSteps) return totalSteps;
    return n;
  }

  function determineClosure(step, spec) {
    const s = clampStep(step, spec.totalSteps);
    let closure = "open";
    for (const mark of spec.closureMarks) {
      if (s === mark.step) {
        closure = mark.kind;
      }
    }
    if (s === spec.totalSteps && closure === "open") {
      closure = "complete";
    }
    return closure;
  }

  function getCycleState(spec, step) {
    const safeStep = clampStep(step, spec.totalSteps);
    const passIndex = Math.min(
      spec.passCount - 1,
      Math.floor(Math.max(0, safeStep === spec.totalSteps ? safeStep - 1 : safeStep) / spec.baseModulus)
    );
    const passNumber = passIndex + 1;
    const baseSlot = safeStep % spec.baseModulus;
    const closure = determineClosure(safeStep, spec);

    return {
      cycleKey: spec.key,
      step: safeStep,
      totalSteps: spec.totalSteps,
      baseModulus: spec.baseModulus,
      baseSlot,
      passIndex,
      passNumber,
      passCount: spec.passCount,
      closure
    };
  }

  window.CYCLE_SPECS = CYCLE_SPECS;
  window.getCycleState = getCycleState;
})();
