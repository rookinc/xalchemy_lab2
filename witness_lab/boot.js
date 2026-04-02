const els = {
  resetBtn: document.getElementById("reset-btn"),
  tauBtn: document.getElementById("tau-btn"),
  tauInvBtn: document.getElementById("tau-inv-btn"),
  muBtn: document.getElementById("mu-btn"),
  playBtn: document.getElementById("play-btn"),
  autoplayOp: document.getElementById("autoplay-op"),
  hzInput: document.getElementById("hz-input"),
  statusText: document.getElementById("status-text"),
  playbackText: document.getElementById("playback-text"),
  stateText: document.getElementById("state-text"),
  codeText: document.getElementById("code-text"),
  consoleOutput: document.getElementById("console-output"),
};

const app = {
  current: null,
  info: null,
  isPlaying: false,
  timerId: null,
  history: [],
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

function pushHistory(payload) {
  const entry = `[${payload.state.join(", ")}] ${payload.code}  ${payload.phase_label}  ${payload.alignment}`;
  app.history.push(entry);
  if (app.history.length > 10) {
    app.history.shift();
  }
}

function renderConsole(payload) {
  if (!payload) {
    els.consoleOutput.textContent = "no payload";
    return;
  }

  pushHistory(payload);

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
    `recent         :`,
    ...app.history.map((entry) => `  ${entry}`),
  ];

  els.consoleOutput.textContent = lines.join("\n");
  els.stateText.textContent = `[${payload.state.join(", ")}]`;
  els.codeText.textContent = payload.code;
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
  renderConsole(app.current);
}

async function applyOp(op) {
  if (!app.current) return;

  const data = await fetchJson("/api/witness/apply", {
    method: "POST",
    body: JSON.stringify({
      state: app.current.state,
      op,
    }),
  });

  app.current = data.payload;
  renderConsole(app.current);
}

function stopPlayback(status = "paused") {
  if (app.timerId) {
    clearInterval(app.timerId);
    app.timerId = null;
  }
  app.isPlaying = false;
  setPlaybackText();
  setStatus(status);
}

function startPlayback() {
  stopPlayback();
  app.isPlaying = true;
  setPlaybackText();
  setStatus(`running ${els.autoplayOp.value} @ ${hzValue()} Hz`);

  const intervalMs = Math.max(20, Math.round(1000 / hzValue()));
  app.timerId = setInterval(async () => {
    try {
      await applyOp(els.autoplayOp.value);
    } catch (err) {
      console.error(err);
      stopPlayback("playback error");
    }
  }, intervalMs);
}

function togglePlayback() {
  if (app.isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function bindControls() {
  els.resetBtn.addEventListener("click", async () => {
    stopPlayback("reset");
    await loadState(0, 0);
    setStatus("reset to [0, 0]");
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
