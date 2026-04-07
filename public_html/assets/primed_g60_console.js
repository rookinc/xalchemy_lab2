const TOTAL_STEPS = 60;

const presets = {
  bare: Array(TOTAL_STEPS).fill('P'),
  unstable: (() => {
    const arr = Array(TOTAL_STEPS).fill('P');
    arr[10] = 'C';
    arr[22] = 'A';
    arr[41] = 'C';
    return arr;
  })(),
  locked: (() => {
    const arr = Array(TOTAL_STEPS).fill('P');
    arr[10] = 'C';
    arr[22] = 'A';
    return arr;
  })(),
  manual: Array(TOTAL_STEPS).fill('P')
};

const app = {
  step: 0,
  sector: [0, 0],
  lock: 0,
  events: presets.locked.slice(),
  logs: [],
  history: [],
  firstPrimedStep: null,
  lockActivationStep: null
};

const refs = {
  presetSelect: document.getElementById('presetSelect'),
  loadPresetBtn: document.getElementById('loadPresetBtn'),
  eventPBtn: document.getElementById('eventPBtn'),
  eventCBtn: document.getElementById('eventCBtn'),
  eventABtn: document.getElementById('eventABtn'),
  stepBtn: document.getElementById('stepBtn'),
  run15Btn: document.getElementById('run15Btn'),
  run30Btn: document.getElementById('run30Btn'),
  run60Btn: document.getElementById('run60Btn'),
  runAllBtn: document.getElementById('runAllBtn'),
  resetBtn: document.getElementById('resetBtn'),
  tickStrip: document.getElementById('tickStrip'),
  ringSvg: document.getElementById('ringSvg'),
  consoleLog: document.getElementById('consoleLog'),
  stepValue: document.getElementById('stepValue'),
  signValue: document.getElementById('signValue'),
  identityValue: document.getElementById('identityValue'),
  depthValue: document.getElementById('depthValue'),
  nextEventValue: document.getElementById('nextEventValue'),
  sectorValue: document.getElementById('sectorValue'),
  lockValue: document.getElementById('lockValue'),
  statusValue: document.getElementById('statusValue'),
  statePill: document.getElementById('statePill'),
  bareG60Value: document.getElementById('bareG60Value'),
  primedG60Value: document.getElementById('primedG60Value'),
  lockedG60Value: document.getElementById('lockedG60Value'),
  retainedClosureValue: document.getElementById('retainedClosureValue'),
  firstPrimedValue: document.getElementById('firstPrimedValue'),
  lockActivationValue: document.getElementById('lockActivationValue'),
  mPreview: document.getElementById('mPreview'),
  qPreview: document.getElementById('qPreview'),
  basisPreview: document.getElementById('basisPreview'),
  tailPreview: document.getElementById('tailPreview'),
  trajectoryTable: document.getElementById('trajectoryTable')
};

function sectorKey([f, h]) {
  return `${f}${h}`;
}

function signFor(step) {
  return (Math.floor(step / 15) % 2 === 0) ? '+' : '-';
}

function depthLabel(step) {
  if (step === 0) return 'origin';
  if (step % 60 === 0) return 'G60';
  if (step % 30 === 0) return 'G30';
  if (step % 15 === 0) return 'G15';
  return 'interior';
}

function stateName(sector, lock) {
  const key = sectorKey(sector);
  if (key === '00') return 'NATIVE';
  if (key === '10') return 'FRAME-DISPLACED';
  if (key === '01') return 'SHEET-DISPLACED';
  if (key === '11' && lock) return 'LOCKED';
  if (key === '11') return 'PRIMED';
  return 'UNKNOWN';
}

function stateClass(sector, lock) {
  const key = sectorKey(sector);
  if (key === '00') return 'state-native';
  if (key === '10') return 'state-frame';
  if (key === '01') return 'state-sheet';
  if (key === '11' && lock) return 'state-locked';
  return 'state-primed';
}

function statusText(sector, lock) {
  const key = sectorKey(sector);
  if (key === '00') return 'native closure';
  if (key === '10') return 'frame displacement';
  if (key === '01') return 'sheet displacement';
  if (key === '11' && lock) return 'locked informed closure';
  return 'primed informed closure';
}

function eventAt(step) {
  return app.events[step % TOTAL_STEPS] || 'P';
}

function pushLog(msg) {
  const stamp = new Date().toLocaleTimeString([], { hour12: false });
  app.logs.push(`[${stamp}] ${msg}`);
  if (app.logs.length > 160) app.logs = app.logs.slice(-160);
}

function recordHistory(eventUsed, prevSector, prevLock) {
  app.history.push({
    step: app.step,
    event: eventUsed,
    sector: [...app.sector],
    lock: app.lock,
    prevSector: [...prevSector],
    prevLock
  });
  if (app.history.length > 120) app.history = app.history.slice(-120);
}

function applyEventToSector(sector, event) {
  const [f, h] = sector;
  if (event === 'C') return [(f + 1) % 2, h];
  if (event === 'A') return [f, (h + 1) % 2];
  return [f, h];
}

function formatSector(sector) {
  return `(${sector[0]},${sector[1]})`;
}

function stepMachine() {
  const event = eventAt(app.step);
  const prevSector = [...app.sector];
  const prevLock = app.lock;
  const nextSector = applyEventToSector(app.sector, event);

  let nextLock = 0;
  const primedNow = (nextSector[0] === 1 && nextSector[1] === 1);

  if (primedNow && prevLock === 1) {
    nextLock = 1;
  } else if (sectorKey(app.sector) === '11' && event === 'P') {
    nextLock = 1;
  } else {
    nextLock = 0;
  }

  app.sector = nextSector;
  app.lock = nextLock;
  app.step += 1;

  if (sectorKey(app.sector) === '11' && app.firstPrimedStep === null) {
    app.firstPrimedStep = app.step;
    pushLog(`PRIMED first reached at step ${app.step}.`);
    pushLog(`DOCTRINE step ${app.step}: primed diagonal reached; informed closure is now available.`);
  }

  if (app.lock === 1 && app.lockActivationStep === null) {
    app.lockActivationStep = app.step;
    pushLog(`LOCK activated at step ${app.step}.`);
    pushLog(`DOCTRINE step ${app.step}: preserving dwell has stabilized the primed diagonal.`);
  }

  recordHistory(event, prevSector, prevLock);
  pushLog(`STEP n=${app.step} event=${event} sign=${signFor((app.step - 1) % TOTAL_STEPS)} χ=${formatSector(app.sector)} state=${stateName(app.sector, app.lock)}`);

  if (app.step % 15 === 0 && app.step % 30 !== 0) {
    pushLog(`DOCTRINE step ${app.step}: G15 reached under ${stateName(app.sector, app.lock)}; sign depth without full identity closure.`);
  }

  if (app.step % 30 === 0 && app.step % 60 !== 0) {
    const sectorMsg = sectorKey(app.sector) === '11'
      ? 'identity depth reached while informed closure is present'
      : 'identity depth reached without primed diagonal lock';
    pushLog(`DOCTRINE step ${app.step}: G30 reached; ${sectorMsg}.`);
  }

  if (app.step > 0 && app.step % 60 === 0) {
    let outcome = 'bare G60 only';
    if (sectorKey(app.sector) === '11' && app.lock === 1) {
      outcome = 'locked G60 achieved';
    } else if (sectorKey(app.sector) === '11') {
      outcome = 'primed G60 achieved without lock';
    }
    pushLog(`DOCTRINE step ${app.step}: G60 reached; ${outcome}.`);
  }

  render();
}

function loadPreset(name) {
  app.events = presets[name].slice();
  resetMachine(false);
  pushLog(`PRESET loaded: ${name}`);
  render();
}

function resetMachine(withLog = true) {
  app.step = 0;
  app.sector = [0, 0];
  app.lock = 0;
  app.history = [];
  app.firstPrimedStep = null;
  app.lockActivationStep = null;
  if (withLog) pushLog('RESET machine to origin.');
  render();
}

function setCurrentEvent(symbol) {
  app.events[app.step % TOTAL_STEPS] = symbol;
  pushLog(`EVENT set at slot ${app.step % TOTAL_STEPS}: ${symbol}`);
  render();
}

function runUntil(target) {
  while (app.step < target) stepMachine();
}

function simulateFromCurrentPreset() {
  let sector = [0, 0];
  let lock = 0;
  const out = [];

  for (let i = 0; i < TOTAL_STEPS; i += 1) {
    const event = app.events[i];
    const nextSector = applyEventToSector(sector, event);

    let nextLock = 0;
    if (sectorKey(nextSector) === '11' && lock === 1) {
      nextLock = 1;
    } else if (sectorKey(sector) === '11' && event === 'P') {
      nextLock = 1;
    }

    const key = sectorKey(nextSector);
    let tickClass = '';
    if (i === 14 || i === 44) tickClass += ' g15';
    if (i === 29) tickClass += ' g30';
    if (i === 59) tickClass += ' g60';
    if (key === '00') tickClass += ' native';
    if (key === '10') tickClass += ' frame';
    if (key === '01') tickClass += ' sheet';
    if (key === '11' && nextLock === 0) tickClass += ' primed';
    if (key === '11' && nextLock === 1) tickClass += ' locked';

    out.push({
      index: i,
      event,
      sector: nextSector,
      lock: nextLock,
      name: stateName(nextSector, nextLock),
      tickClass: tickClass.trim()
    });

    sector = nextSector;
    lock = nextLock;
  }

  return out;
}

function buildTickStrip() {
  refs.tickStrip.innerHTML = '';
  const sim = simulateFromCurrentPreset();

  for (let i = 0; i < TOTAL_STEPS; i += 1) {
    const tick = document.createElement('div');
    const item = sim[i];
    tick.className = `tick ${item.tickClass}`;
    if ((app.step % TOTAL_STEPS) === i && app.step !== 60) tick.classList.add('current');
    tick.title = `n=${i} event=${item.event} χ=${formatSector(item.sector)} state=${item.name}`;
    refs.tickStrip.appendChild(tick);
  }
}

function buildRing() {
  const sim = simulateFromCurrentPreset();
  const cx = 260, cy = 178, r = 118;

  const pts = sim.map((item, i) => {
    const angle = (-90 + (360 * i / TOTAL_STEPS)) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      item,
      i
    };
  });

  const circles = pts.map(({ x, y, item, i }) => {
    const key = sectorKey(item.sector);
    let fill = '#243053';
    if (key === '10') fill = '#4b7aa6';
    if (key === '01') fill = '#8e7745';
    if (key === '11') fill = item.lock ? '#82d996' : '#5ca86c';
    const isCurrent = (app.step % TOTAL_STEPS) === i && app.step !== 60;
    const stroke = isCurrent ? '#7cc7ff' : '#2b3763';
    const strokeWidth = isCurrent ? 3 : 1.5;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
  }).join('');

  const markers = [
    { n: 15, label: 'G15', color: '#ffd27a' },
    { n: 30, label: 'G30', color: '#7cc7ff' },
    { n: 60, label: 'G60', color: '#82d996' }
  ].map(m => {
    const idx = (m.n === 60) ? 59 : m.n - 1;
    const p = pts[idx];
    return `<text x="${p.x}" y="${p.y - 16}" text-anchor="middle" font-size="11" fill="${m.color}" font-family="monospace">${m.label}</text>`;
  }).join('');

  refs.ringSvg.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r + 24}" fill="none" stroke="#243053" stroke-width="1.5" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2b3763" stroke-width="2" />
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="20" fill="#e8ecff">Z60 hidden orbit</text>
    ${circles}
    ${markers}
  `;
}

function computeTailBlock() {
  if (!app.history.length) {
    return {
      label: 'No recurrence yet. Terminal block not formed.',
      tail: 0,
      stateLabel: 'e_00'
    };
  }

  const hist = app.history;
  const lastKey = sectorKey(hist[hist.length - 1].sector);
  let tail = 0;

  for (let i = hist.length - 1; i >= 0; i -= 1) {
    if (sectorKey(hist[i].sector) === lastKey) tail += 1;
    else break;
  }

  const stateLabel = `e_${lastKey}`;
  return {
    label: `terminal ${tail}×${tail} coherence block on ${stateLabel}`,
    tail,
    stateLabel
  };
}

function buildPreviews() {
  const last = app.history.slice(-12);

  refs.mPreview.textContent = last.length
    ? last.map(h => `e_${h.sector[0]}${h.sector[1]}`).join('  ')
    : 'e_00';

  const lockedTail = computeTailBlock();
  refs.basisPreview.textContent = `e_${app.sector[0]}${app.sector[1]}`;
  refs.tailPreview.textContent = String(lockedTail.tail);
  refs.qPreview.textContent = lockedTail.label;

  refs.trajectoryTable.innerHTML = last.length
    ? last.slice().reverse().map(h => `
      <tr>
        <td>${h.step}</td>
        <td>${h.event}</td>
        <td>${formatSector(h.sector)}</td>
        <td>${stateName(h.sector, h.lock)}</td>
      </tr>
    `).join('')
    : `<tr><td>0</td><td>—</td><td>(0,0)</td><td>NATIVE</td></tr>`;
}

function updateInfo() {
  refs.stepValue.textContent = String(app.step);
  refs.signValue.textContent = signFor(app.step % TOTAL_STEPS);
  refs.identityValue.textContent = `${app.step % 30} mod 30`;
  refs.depthValue.textContent = depthLabel(app.step);
  refs.nextEventValue.textContent = eventAt(app.step);
  refs.sectorValue.textContent = formatSector(app.sector);
  refs.lockValue.textContent = String(app.lock);
  refs.statusValue.textContent = statusText(app.sector, app.lock);
  refs.statePill.textContent = stateName(app.sector, app.lock);
  refs.statePill.className = `state-pill ${stateClass(app.sector, app.lock)}`;

  const atBareG60 = app.step > 0 && app.step % 60 === 0;
  const atPrimedG60 = atBareG60 && sectorKey(app.sector) === '11';
  const atLockedG60 = atBareG60 && sectorKey(app.sector) === '11' && app.lock === 1;

  let retainedThroughClosure = false;
  if (atBareG60 && app.history.length) {
    retainedThroughClosure = app.history.every(h => h.step < (app.lockActivationStep ?? Infinity) || sectorKey(h.sector) === '11');
    if (app.lockActivationStep === null) retainedThroughClosure = false;
    if (app.lockActivationStep !== null) {
      retainedThroughClosure = app.history
        .filter(h => h.step >= app.lockActivationStep)
        .every(h => sectorKey(h.sector) === '11' && h.lock === 1);
    }
  }

  refs.bareG60Value.textContent = atBareG60 ? 'yes' : 'no';
  refs.primedG60Value.textContent = atPrimedG60 ? 'yes' : 'no';
  refs.lockedG60Value.textContent = atLockedG60 ? 'yes' : 'no';
  refs.retainedClosureValue.textContent = retainedThroughClosure ? 'yes' : 'no';
  refs.firstPrimedValue.textContent = app.firstPrimedStep ?? '—';
  refs.lockActivationValue.textContent = app.lockActivationStep ?? '—';
}

function renderConsole() {
  refs.consoleLog.textContent = app.logs.join('\n');
  refs.consoleLog.scrollTop = refs.consoleLog.scrollHeight;
}

function render() {
  buildTickStrip();
  buildRing();
  updateInfo();
  buildPreviews();
  renderConsole();
}

refs.loadPresetBtn.addEventListener('click', () => loadPreset(refs.presetSelect.value));
refs.eventPBtn.addEventListener('click', () => setCurrentEvent('P'));
refs.eventCBtn.addEventListener('click', () => setCurrentEvent('C'));
refs.eventABtn.addEventListener('click', () => setCurrentEvent('A'));
refs.stepBtn.addEventListener('click', () => stepMachine());
refs.run15Btn.addEventListener('click', () => runUntil(15));
refs.run30Btn.addEventListener('click', () => runUntil(30));
refs.run60Btn.addEventListener('click', () => runUntil(60));
refs.runAllBtn.addEventListener('click', () => runUntil(60));
refs.resetBtn.addEventListener('click', () => resetMachine(true));

pushLog('BOOT Primed G60 Console.');
pushLog('LOAD first-pass doctrine view: hidden cycle + chamber state + lens preview.');
refs.presetSelect.value = 'locked';
loadPreset('locked');
