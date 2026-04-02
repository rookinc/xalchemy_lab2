const els = {
  resetBtn: document.getElementById("reset-btn"),
  stepBackBtn: document.getElementById("step-back-btn"),
  tauBtn: document.getElementById("tau-btn"),
  tauInvBtn: document.getElementById("tau-inv-btn"),
  muBtn: document.getElementById("mu-btn"),
  stepForwardBtn: document.getElementById("step-forward-btn"),
  playBtn: document.getElementById("play-btn"),
  autoplayOp: document.getElementById("autoplay-op"),
  hzInput: document.getElementById("hz-input"),
  statusText: document.getElementById("status-text"),
  playbackText: document.getElementById("playback-text"),
  stateText: document.getElementById("state-text"),
  codeText: document.getElementById("code-text"),
  cursorText: document.getElementById("cursor-text"),
  traceSizeText: document.getElementById("trace-size-text"),
  consoleOutput: document.getElementById("console-output"),
};

const app = {
  current: null,
  info: null,
  isPlaying: false,
  timerId: null,
  history: [],
  cursor: -1,
  inFlight: false,
  shutdown: false,
};

function setStatus(text) {
  els.statusText.textContent = text;
}

function setPlaybackText() {
  els.playbackText.textContent = app.isPlaying ? "running" : "paused";
  els.playBtn.textContent = app.isPlaying ? "Pause" : "Play";
}

function hzValue() {
  const n = Number(els.hzInput.value);
  return Number.isFinite(n) && n > 0 ? n : 2;
}

function formatCycle(name, values) {
  return `${name.padEnd(14)}: ${Array.isArray(values) ? values.join(" -> ") : values}`;
}

function pushState(payload) {
  app.history = app.history.slice(0, app.cursor + 1);
  app.history.push(payload);
  app.cursor = app.history.length - 1;
}

function orbitTrace() {
  return app.history.map((payload, idx) => {
    const marker = idx === app.cursor ? ">" : " ";
    return `${marker} ${String(idx).padStart(2)}  [${payload.state.join(", ")}]  ${payload.code}  ${payload.phase_label}  ${payload.alignment}`;
  });
}

function renderConsole(payload) {
  if (!payload) {
    els.consoleOutput.textContent = "no payload";
    return;
  }

  const lines = [
    `state          : [${payload.state.join(", ")}]`,
    `code           : ${payload.code}`,
    `frame          : ${payload.frame}`,
    `phase          : ${payload.phase}`,
    `phase_label    : ${payload.phase_label}`,
    formatCycle("witness_cycle", payload.witness_cycle),
    `species        : ${payload.species}`,
    `alignment      : ${payload.alignment}`,
    `spread         : ${payload.spread}`,
    `fiber          : ${payload.fiber}`,
    formatCycle("action_cell", payload.action_cell),
    `action_species : ${payload.action_species}`,
    `tau            : [${payload.tau.join(", ")}]`,
    `tau_inv        : [${payload.tau_inv.join(", ")}]`,
    `mu             : [${payload.mu.join(", ")}]`,
    `output         : alignment=${payload.output.alignment}, spread=${payload.output.spread}, fiber=${payload.output.fiber}`,
    ``,
    `--- orbit ---`,
    ...orbitTrace(),
  ];

  els.consoleOutput.textContent = lines.join("\n");
  els.stateText.textContent = `[${payload.state.join(", ")}]`;
  els.codeText.textContent = payload.code;
  els.cursorText.textContent = app.cursor >= 0 ? String(app.cursor) : "-";
  els.traceSizeText.textContent = String(app.history.length);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function loadInfo() {
  const data = await fetchJson("/api/witness/info");
  app.info = data.payload;
}

async function loadState(frame = 0, phase = 0) {
  const data = await fetchJson(`/api/witness/state?frame=${frame}&phase=${phase}`);
  app.current = data.payload;
  app.history = [];
  app.cursor = -1;
  pushState(app.current);
  renderConsole(app.current);
}

async function applyOp(op) {
  if (!app.current || app.inFlight || app.shutdown) return false;

  app.inFlight = true;
  try {
    const data = await fetchJson("/api/witness/apply", {
      method: "POST",
      body: JSON.stringify({
        state: app.current.state,
        op,
      }),
    });

    if (app.shutdown) return false;

    app.current = data.payload;
    pushState(app.current);
    renderConsole(app.current);
    return true;
  } finally {
    app.inFlight = false;
  }
}

function stepBack() {
  if (app.cursor > 0) {
    app.cursor -= 1;
    app.current = app.history[app.cursor];
    renderConsole(app.current);
    setStatus("step back");
  }
}

function stepForward() {
  if (app.cursor < app.history.length - 1) {
    app.cursor += 1;
    app.current = app.history[app.cursor];
    renderConsole(app.current);
    setStatus("step forward");
  }
}

function stopPlayback(status = "paused") {
  if (app.timerId) {
    clearTimeout(app.timerId);
    app.timerId = null;
  }
  app.isPlaying = false;
  setPlaybackText();
  setStatus(status);
}

async function playbackTick() {
  if (!app.isPlaying || app.shutdown) return;

  try {
    await applyOp(els.autoplayOp.value);
  } catch (err) {
    console.error(err);
    stopPlayback("playback error");
    return;
  }

  if (!app.isPlaying || app.shutdown) return;

  const delayMs = Math.max(20, Math.round(1000 / hzValue()));
  app.timerId = setTimeout(() => {
    void playbackTick();
  }, delayMs);
}

function startPlayback() {
  stopPlayback();
  app.isPlaying = true;
  setPlaybackText();
  setStatus(`running ${els.autoplayOp.value} @ ${hzValue()} Hz`);
  void playbackTick();
}

function togglePlayback() {
  if (app.isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function handlePageShutdown(reason) {
  app.shutdown = true;
  stopPlayback(reason);
}

function bindControls() {
  els.resetBtn.addEventListener("click", async () => {
    stopPlayback("reset");
    await loadState(0, 0);
    setStatus("reset to [0, 0]");
  });

  els.stepBackBtn.addEventListener("click", () => {
    stopPlayback();
    stepBack();
  });

  els.tauBtn.addEventListener("click", async () => {
    stopPlayback();
    await applyOp("tau");
    setStatus("applied tau");
  });

  els.tauInvBtn.addEventListener("click", async () => {
    stopPlayback();
    await applyOp("tau_inv");
    setStatus("applied tau_inv");
  });

  els.muBtn.addEventListener("click", async () => {
    stopPlayback();
    await applyOp("mu");
    setStatus("applied mu");
  });

  els.stepForwardBtn.addEventListener("click", () => {
    stopPlayback();
    stepForward();
  });

  els.playBtn.addEventListener("click", () => {
    togglePlayback();
  });

  els.hzInput.addEventListener("change", () => {
    if (app.isPlaying) {
      startPlayback();
    }
  });

  els.autoplayOp.addEventListener("change", () => {
    if (app.isPlaying) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", () => {
    handlePageShutdown("unloading");
  });

  window.addEventListener("pagehide", () => {
    handlePageShutdown("page hidden");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && app.isPlaying) {
      stopPlayback("hidden");
    }
  });
}

async function boot() {
  try {
    setStatus("loading");
    setPlaybackText();
    bindControls();
    await loadInfo();
    await loadState(
      app.info.initial_state[0],
      app.info.initial_state[1],
    );
    setStatus("ready");
  } catch (err) {
    console.error(err);
    stopPlayback("boot error");
    els.consoleOutput.textContent = String(err);
  }
}

void boot();
