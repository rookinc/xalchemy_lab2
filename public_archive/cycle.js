(function () {
  const canvas = document.getElementById("cycle-stage");
  const ctx = canvas.getContext("2d");

  const titleEl = document.getElementById("page-title");
  const statusEl = document.getElementById("cycle-status");
  const notesEl = document.getElementById("cycle-notes");

  const stepInput = document.getElementById("step-input");
  const showLabelsEl = document.getElementById("show-labels");
  const showMarksEl = document.getElementById("show-marks");
  const showTrailsEl = document.getElementById("show-trails");

  const btnStep = document.getElementById("btn-step");
  const btnAuto = document.getElementById("btn-auto");
  const btnReset = document.getElementById("btn-reset");
  const btnPrevMark = document.getElementById("btn-prev-mark");
  const btnNextMark = document.getElementById("btn-next-mark");
  const btnApplyStep = document.getElementById("btn-apply-step");

  let autoTimer = null;

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const cycleKey = pathParts[pathParts.length - 1] || "g15";
  const spec = window.CYCLE_SPECS[cycleKey] || window.CYCLE_SPECS.g15;

  const ui = {
    step: 0
  };

  titleEl.textContent = spec.title;
  stepInput.max = String(spec.totalSteps);
  notesEl.textContent = spec.notes.join("\n");

  function setStatus(state) {
    statusEl.textContent =
      `cycle ${state.cycleKey} | step ${state.step}/${state.totalSteps} | ` +
      `slot ${state.baseSlot}/${state.baseModulus} | ` +
      `pass ${state.passNumber}/${state.passCount} | ` +
      `closure ${state.closure}`;
  }

  function setStep(nextStep) {
    const safe = Math.max(0, Math.min(spec.totalSteps, Math.floor(Number(nextStep) || 0)));
    ui.step = safe;
    stepInput.value = String(safe);
    render();
  }

  function nextMarkStep(currentStep) {
    for (const mark of spec.closureMarks) {
      if (mark.step > currentStep) return mark.step;
    }
    return spec.totalSteps;
  }

  function prevMarkStep(currentStep) {
    let out = 0;
    for (const mark of spec.closureMarks) {
      if (mark.step < currentStep) out = mark.step;
    }
    return out;
  }

  function toggleAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
      btnAuto.textContent = "auto";
      return;
    }

    autoTimer = setInterval(() => {
      if (ui.step >= spec.totalSteps) {
        clearInterval(autoTimer);
        autoTimer = null;
        btnAuto.textContent = "auto";
        return;
      }
      setStep(ui.step + 1);
    }, 600);

    btnAuto.textContent = "stop";
  }

  function clearStage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#040404";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawNode(x, y, radius, active, marked) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.lineWidth = active ? 5 : 2;
    ctx.strokeStyle = active ? "#00f5b0" : marked ? "#ffd166" : "rgba(0,245,176,0.35)";
    ctx.stroke();
  }

  function drawLabel(x, y, text, active) {
    ctx.fillStyle = active ? "#00f5b0" : "rgba(0,245,176,0.7)";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function drawRing(centerX, centerY, radius, count, activeIndex, marks, labelPrefix, drawTrail) {
    const points = [];

    for (let i = 0; i < count; i += 1) {
      const theta = (-Math.PI / 2) + (2 * Math.PI * i / count);
      const x = centerX + radius * Math.cos(theta);
      const y = centerY + radius * Math.sin(theta);
      points.push({ x, y });
    }

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(0,245,176,0.18)";
    ctx.beginPath();
    for (let i = 0; i < count; i += 1) {
      const a = points[i];
      const b = points[(i + 1) % count];
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();

    if (drawTrail && activeIndex > 0) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255,209,102,0.28)";
      ctx.beginPath();
      for (let i = 0; i < activeIndex; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % count];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
    }

    for (let i = 0; i < count; i += 1) {
      const marked = marks.has(i + 1) || marks.has(i);
      const active = i === activeIndex;
      drawNode(points[i].x, points[i].y, 18, active, marked);
      if (showLabelsEl.checked) {
        drawLabel(points[i].x, points[i].y, `${labelPrefix}${i}`, active);
      }
    }
  }

  function drawProjection(state) {
    clearStage();

    const markSteps = new Set(
      showMarksEl.checked ? spec.closureMarks.map((m) => m.step) : []
    );

    if (spec.projection === "ring15") {
      drawRing(
        canvas.width / 2,
        canvas.height / 2,
        240,
        15,
        state.baseSlot,
        markSteps,
        "",
        showTrailsEl.checked && state.step > 0
      );
      return;
    }

    if (spec.projection === "double15") {
      const topActive = state.passNumber === 1 ? state.baseSlot : -1;
      const bottomActive = state.passNumber === 2 ? state.baseSlot : -1;

      drawRing(
        canvas.width / 2,
        220,
        130,
        15,
        topActive,
        new Set(spec.closureMarks.filter(m => m.step <= 15).map(m => m.step % 15)),
        "a",
        showTrailsEl.checked && state.passNumber === 1
      );

      drawRing(
        canvas.width / 2,
        500,
        130,
        15,
        bottomActive,
        new Set(spec.closureMarks.filter(m => m.step > 15).map(m => m.step % 15)),
        "b",
        showTrailsEl.checked && state.passNumber === 2
      );

      return;
    }

    if (spec.projection === "stacked15x4") {
      const centers = [140, 280, 440, 580];

      for (let p = 0; p < 4; p += 1) {
        const active = state.passIndex === p ? state.baseSlot : -1;
        drawRing(
          canvas.width / 2,
          centers[p],
          88,
          15,
          active,
          new Set(),
          `p${p + 1}:`,
          showTrailsEl.checked && state.passIndex === p
        );
      }

      return;
    }
  }

  function render() {
    const state = window.getCycleState(spec, ui.step);
    setStatus(state);
    drawProjection(state);
  }

  btnStep.addEventListener("click", () => {
    setStep(ui.step + 1);
  });

  btnReset.addEventListener("click", () => {
    setStep(0);
  });

  btnAuto.addEventListener("click", () => {
    toggleAuto();
  });

  btnApplyStep.addEventListener("click", () => {
    setStep(stepInput.value);
  });

  btnNextMark.addEventListener("click", () => {
    setStep(nextMarkStep(ui.step));
  });

  btnPrevMark.addEventListener("click", () => {
    setStep(prevMarkStep(ui.step));
  });

  showLabelsEl.addEventListener("change", render);
  showMarksEl.addEventListener("change", render);
  showTrailsEl.addEventListener("change", render);

  render();
})();
