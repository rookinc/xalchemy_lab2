import {
  signedLabelFor,
  nextState,
  previousState,
  getFrame,
} from '/assets/pump_console_core.js';

export function footerTextFor(state, frame) {
  const datasetId = frame.datasetId ?? state.datasetId;
  const kind = frame.datasetMeta?.kind ?? 'unknown';

  if (datasetId === 'local_patch_v0') {
    return 'Structure first, operation second. Current data source is a seeded local chamber patch of AT4val[60,6]; global orbit claims remain deferred until full 60-vertex adjacency is loaded.';
  }

  if (datasetId === 'full_graph_placeholder') {
    return 'Structure first, operation second. Current data source is the full AT4val[60,6] graph; ring1 shell, ring2 remainder, and outer-pair quotient structure are available, while chamberized diads and motion remain deferred.';
  }

  return `Structure first, operation second. Current data source is ${datasetId}; dataset kind=${kind}.`;
}

export function scopeLabelFor(frame) {
  const kind = frame.datasetMeta?.kind ?? 'unknown';
  if (kind === 'seeded-local-patch') return 'local-patch';
  if (kind === 'full-graph') return 'full-graph';
  if (kind === 'full-graph-placeholder') return 'placeholder';
  return kind;
}

export function displayModeLabel(state, frame) {
  const isFullGraph = frame.datasetMeta?.kind === 'full-graph';
  if (isFullGraph) return 'full graph survey';
  return state.discoveryMode === 'seeded'
    ? 'seeded local witness'
    : 'structure-only discovery';
}

export function syncModeControl(state, els, frame) {
  const seededOption = els.modeSelect.querySelector('option[value="seeded"]');
  const structureOption = els.modeSelect.querySelector('option[value="structure"]');
  const isFullGraph = frame.datasetMeta?.kind === 'full-graph';

  if (isFullGraph) {
    seededOption.textContent = 'full graph survey';
    structureOption.textContent = 'full graph survey';
    els.modeSelect.value = 'seeded';
    els.modeSelect.disabled = true;
    els.modeSelect.title = 'Discovery mode is inactive while the full graph survey dataset is selected';
    return;
  }

  seededOption.textContent = 'seeded local witness';
  structureOption.textContent = 'structure-only discovery';
  els.modeSelect.disabled = false;
  els.modeSelect.title = '';
  els.modeSelect.value = state.discoveryMode;
}

export async function render(state, els) {
  const frame = await getFrame(state);
  const prev = previousState(state.hostMode, state.activeSlot, state.phaseSign);
  const next = nextState(state.hostMode, state.activeSlot, state.phaseSign);
  const isFullGraph = frame.datasetMeta?.kind === 'full-graph';
  const hasNeighborhoodStructure =
    Boolean(frame.coupler) &&
    (((frame.shell || []).length > 0) || ((frame.neighborhood?.ring1 || []).length > 0));
  const hasMotion = (frame.operationalChannels || []).length > 0;
  const neighborhoodShell = isFullGraph ? (frame.neighborhood?.ring1 || []) : [];

  els.hostMode.textContent = String(state.hostMode);
  els.modeKey.textContent = frame.portKey ?? '(none)';
  els.modeName.textContent = frame.portName ?? '(none)';
  els.activeSlot.textContent = String(state.activeSlot);
  els.slotKey.textContent = frame.slotKey ?? '(none)';
  els.slotName.textContent = frame.slotName ?? '(none)';
  els.phaseKey.textContent = frame.phaseKey ?? '(none)';
  els.phaseName.textContent = frame.phaseName ?? '(none)';
  els.coarseState.textContent = signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign);
  els.previousState.textContent = signedLabelFor(prev.hostMode, prev.activeSlot, prev.phaseSign);
  els.nextState.textContent = signedLabelFor(next.hostMode, next.activeSlot, next.phaseSign);
  els.cyclePos.textContent = `${state.stepCount % 12} / 12`;
  els.coupler.textContent = frame.coupler ?? '(none)';
  els.shell.textContent = hasMotion
    ? frame.shell.join(', ')
    : (isFullGraph && neighborhoodShell.length
        ? neighborhoodShell.join(', ')
        : ((frame.shell || []).length
            ? frame.shell.join(', ')
            : '(no structure loaded)'));

  els.channels.innerHTML = (frame.channelMeta || []).length
    ? (frame.channelMeta || [])
        .map(item => `${item.channelKey}=(${item.pair[0]},${item.pair[1]})`)
        .join('<br>')
    : '(none)';

  els.diads.innerHTML = (frame.operationalChannels || []).length
    ? (frame.operationalChannels || [])
        .map(item => `${item.slotKey}=(${item.pair[0]},${item.pair[1]}) — ${item.slotName} [${item.channelKey}]`)
        .join('<br>')
    : '(none)';

  els.candidates.innerHTML = (frame.shellDebug || []).length
    ? (frame.shellDebug || []).slice(0, 3)
        .map((item, idx) =>
          `#${idx} shell={${(item.shellBase || []).join(',')}}<br>` +
          `match=${JSON.stringify(item.matching || [])}<br>` +
          `r2=${JSON.stringify(item.shellRing2Degrees || [])}<br>` +
          `m=${item.matchingScore} t=${item.transportScore} score=${item.totalScore}`
        )
        .join('<br><br>')
    : (isFullGraph
        ? `ring1=${JSON.stringify(frame.neighborhood?.ring1 || [])}<br>` +
          `ring2=${JSON.stringify(frame.neighborhood?.ring2 || [])}`
        : '(none)');

  els.datasetScope.textContent = scopeLabelFor(frame);
  els.structureState.textContent = hasNeighborhoodStructure ? 'loaded' : 'empty';
  els.motionState.textContent = hasMotion ? 'enabled' : 'blocked';
  els.datasetSelect.value = state.datasetId;
  els.lastAction.textContent = `${state.lastAction} [${state.datasetId} | ${displayModeLabel(state, frame)}]`;

  syncModeControl(state, els, frame);

  els.stepBtn.disabled = !hasMotion;
  els.traceBtn.disabled = !hasMotion;
  els.cycleBtn.disabled = !hasMotion;

  els.stepBtn.title = hasMotion ? '' : 'No chamber motion loaded for current dataset';
  els.traceBtn.title = hasMotion ? '' : 'No chamber motion loaded for current dataset';
  els.cycleBtn.title = hasMotion ? '' : 'No chamber motion loaded for current dataset';

  els.footerNote.textContent = footerTextFor(state, frame);

  return frame;
}
