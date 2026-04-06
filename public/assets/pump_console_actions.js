import {
  signedLabelFor,
  nextState,
  previousState,
  getFrame,
  tracePipeline,
} from '/assets/pump_console_core.js';

import { writeLine, writeFlow } from '/assets/pump_console_log.js';
import { render, displayModeLabel } from '/assets/pump_console_view.js';
import {
  resetStateValues,
  snapshotProbeState,
  restoreProbeState,
} from '/assets/pump_console_state.js';
import {
  formatRawChannels,
  formatOperationalChannels,
} from '/assets/pump_console_probe_utils.js';

export async function boot(state, els) {
  try {
    state.lastAction = 'boot';
    const frame = await getFrame(state);
    await render(state, els);

    const datasetKind = frame.datasetMeta?.kind ?? 'unknown';
    const hasMotion = (frame.operationalChannels || []).length > 0;

    writeLine(els, 'BOOT', `graph=${frame.graphKey} (dataset=${frame.datasetId ?? state.datasetId}; kind=${datasetKind}; mode=${displayModeLabel(state, frame)})`);
    writeLine(els, 'BOOT', `port=${frame.portKey ?? '(none)'} (${frame.portName ?? '(none)'})`);
    writeLine(els, 'BOOT', `phase=${frame.phaseKey ?? '(none)'} (${frame.phaseName ?? '(none)'})`);

    if (!(frame.shell || []).length) {
      writeLine(els, 'BOOT', `no chamber structure loaded for coupler=${frame.coupler ?? '(none)'}`, 'warn');
      writeLine(els, 'READY', 'dataset loaded but no local chamber is available in this mode', 'warn');
      return;
    }

    writeLine(els, 'BOOT', `shell={${frame.shell.join(', ')}} coupler=${frame.coupler}`);

    if (hasMotion) {
      writeLine(els, 'BOOT', `channels ${(frame.channelMeta || []).map(x => `${x.channelKey}=${x.pair.join('/')}`).join(' ')}`);
      writeLine(els, 'BOOT', `slots ${(frame.operationalChannels || []).map(x => `${x.slotKey}=${x.pair.join('/')}[${x.channelKey}]`).join(' ')}`);
      writeLine(els, 'READY', `local coarse state ${signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign)} with R(F)=(${state.hostMode}, ${state.activeSlot}, ${frame.phaseKey})`);
      return;
    }

    if (datasetKind === 'full-graph') {
      writeLine(els, 'READY', `structure ready: full graph loaded at ${signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign)}; local chamber motion remains deferred`, 'warn');
      return;
    }

    writeLine(els, 'READY', 'structure ready, but chamber motion is currently unavailable', 'warn');
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function stepPump(state, els, log = true) {
  try {
    const prevFrame = await getFrame(state);
    if ((prevFrame.operationalChannels || []).length === 0) {
      writeLine(els, 'STEP', 'blocked: no chamber motion loaded for current dataset', 'warn');
      return;
    }

    const prevLabel = signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign);

    const next = nextState(state.hostMode, state.activeSlot, state.phaseSign);
    state.hostMode = next.hostMode;
    state.activeSlot = next.activeSlot;
    state.phaseSign = next.phaseSign;
    state.stepCount += 1;
    state.lastAction = 'step';
    await render(state, els);

    const nextFrame = await getFrame(state);
    const nextLabel = signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign);

    if (log) {
      writeLine(els, 'STEP', `${prevLabel} -> ${nextLabel} via Π(k,i,σ)`);
      writeFlow(els, prevFrame, nextFrame);
      if (state.stepCount % 12 === 0) {
        writeLine(els, 'CLOSE', `12-step coarse closure reached at ${nextLabel}`);
      }
    }
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function traceStep(state, els) {
  try {
    state.lastAction = 'trace';
    await render(state, els);

    const frame = await getFrame(state);
    if ((frame.operationalChannels || []).length === 0) {
      writeLine(els, 'TRACE', 'blocked: no chamber motion loaded for current dataset', 'warn');
      return;
    }

    const trace = await tracePipeline(state);

    writeLine(els, 'ANCHOR', trace.anchor.note);
    writeLine(els, 'CLUSTER', trace.cluster.note);
    writeLine(els, 'ORDER', trace.order.note);
    writeLine(els, 'READOUT', trace.readout.note);
    writeLine(els, 'CHECK', trace.validation.note);

    state.hostMode = trace.pump.hostMode;
    state.activeSlot = trace.pump.activeSlot;
    state.phaseSign = trace.pump.phaseSign;
    state.stepCount += 1;
    state.lastAction = 'trace-step';
    await render(state, els);

    const nextFrame = await getFrame(state);
    writeLine(els, 'PUMP', trace.pump.note);
    writeFlow(els, trace.frame, nextFrame);

    if (state.stepCount % 12 === 0) {
      writeLine(els, 'CLOSE', `12-step coarse closure reached at ${signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign)}`);
    }
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function orbitSweep(state, els) {
  try {
    state.lastAction = 'signature-sweep';
    await render(state, els);

    const original = snapshotProbeState(state);
    const baseFrame = await getFrame(state);
    const snapshot = baseFrame.snapshot || {};
    const vertices = Object.keys(snapshot.adjacency || {}).sort();

    if (!vertices.length) {
      writeLine(els, 'ORBIT', `starting signature sweep on dataset=${state.datasetId} at port=P${state.hostMode} slot=${state.activeSlot} phase=${state.phaseSign > 0 ? '+' : '-'}`);
      writeLine(els, 'ORBIT', 'dataset contains no graph vertices; signature sweep deferred', 'warn');
      writeLine(els, 'ORBIT', 'canonical anchors 0');
      writeLine(els, 'ORBIT', 'signature classes 0');
      writeLine(els, 'ORBIT', 'signature sweep complete');
      return;
    }

    const buckets = new Map();
    let canonicalCount = 0;

    writeLine(els, 'ORBIT', `starting signature sweep on dataset=${state.datasetId} at port=P${state.hostMode} slot=${state.activeSlot} phase=${state.phaseSign > 0 ? '+' : '-'}`);
    writeLine(els, 'ORBIT', `vertex count ${vertices.length}`);

    for (const anchorVertexOverride of vertices) {
      const frame = await getFrame({
        hostMode: original.hostMode,
        activeSlot: original.activeSlot,
        phaseSign: original.phaseSign,
        datasetId: state.datasetId,
        discoveryMode: state.discoveryMode,
        anchorVertexOverride
      });

      const canonical = Boolean(frame.isCanonicalLocalMachine);
      if (!canonical) continue;

      canonicalCount += 1;

      const shellBase = [...(frame.shellBase || [])].sort();
      const ordered = (frame.orderedRawDiads || [])
        .map(pair => [...pair].sort())
        .sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
      const signature = JSON.stringify({ shellBase, ordered });

      if (!buckets.has(signature)) {
        buckets.set(signature, {
          shellBase,
          ordered,
          anchors: [],
          bestScore: null
        });
      }

      const bucket = buckets.get(signature);
      bucket.anchors.push(anchorVertexOverride);

      const total = (frame.shellDebug || [])[0]?.totalScore ?? null;
      if (bucket.bestScore === null || (total !== null && total > bucket.bestScore)) {
        bucket.bestScore = total;
      }

      writeLine(
        els,
        'ORBIT',
        `${anchorVertexOverride} canonical=yes shellBase={${shellBase.join(', ')}} ordered=${JSON.stringify(ordered)} score=${total ?? 'n/a'}`
      );
    }

    writeLine(els, 'ORBIT', `canonical anchors ${canonicalCount}`);
    writeLine(els, 'ORBIT', `signature classes ${buckets.size}`);

    let idx = 0;
    for (const bucket of buckets.values()) {
      writeLine(
        els,
        'ORBIT',
        `class #${idx} shellBase={${bucket.shellBase.join(', ')}} ordered=${JSON.stringify(bucket.ordered)} anchors=[${bucket.anchors.join(', ')}] best=${bucket.bestScore ?? 'n/a'}`
      );
      idx += 1;
    }

    restoreProbeState(state, original);
    state.lastAction = 'signature-sweep';
    await render(state, els);

    writeLine(els, 'ORBIT', 'signature sweep complete');
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function anchorSweep(state, els) {
  try {
    state.lastAction = 'anchor-sweep';
    await render(state, els);

    const original = snapshotProbeState(state);
    const baseFrame = await getFrame(state);
    const snapshot = baseFrame.snapshot || {};
    const anchors = Object.keys(snapshot.adjacency || {}).sort();

    if (!anchors.length) {
      writeLine(els, 'ASWEEP', `starting anchor sweep at port=P${state.hostMode} slot=${state.activeSlot} phase=${state.phaseSign > 0 ? '+' : '-'}`);
      writeLine(els, 'ASWEEP', 'dataset contains no graph vertices; anchor sweep not applicable', 'warn');
      writeLine(els, 'ASWEEP', 'anchor sweep complete');
      return;
    }

    writeLine(els, 'ASWEEP', `starting anchor sweep at port=P${state.hostMode} slot=${state.activeSlot} phase=${state.phaseSign > 0 ? '+' : '-'}`);

    for (const anchorVertexOverride of anchors) {
      const probe = {
        hostMode: original.hostMode,
        activeSlot: original.activeSlot,
        phaseSign: original.phaseSign,
        datasetId: state.datasetId,
        discoveryMode: state.discoveryMode,
        anchorVertexOverride
      };

      const frame = await getFrame(probe);
      const rawChannels = formatRawChannels(frame);
      const operational = formatOperationalChannels(frame);

      writeLine(els, 'ASWEEP', `${anchorVertexOverride} shellBase={${(frame.shellBase || []).join(', ')}} displayed={${(frame.shell || []).join(', ')}}`);
      writeLine(els, 'ASWEEP', `${anchorVertexOverride} raw=${JSON.stringify(frame.rawDiads || [])}`);
      writeLine(els, 'ASWEEP', `${anchorVertexOverride} channels ${rawChannels || '(none)'}`);
      writeLine(els, 'ASWEEP', `${anchorVertexOverride} slots ${operational || '(none)'}`);
      writeLine(els, 'ASWEEP', `${anchorVertexOverride} scores m=${frame.matchingScore} t=${frame.transportScore} total=${(frame.shellDebug || [])[0]?.totalScore ?? 'n/a'}`);
      writeLine(els, 'ASWEEP', `${anchorVertexOverride} ring1=${frame.neighborhood?.ring1Count ?? 'n/a'} ring2=${frame.neighborhood?.ring2Count ?? 'n/a'} shellSource=${frame.shellSource} canonical=${frame.isCanonicalLocalMachine ? 'yes' : 'no'}`);
    }

    restoreProbeState(state, original);
    state.lastAction = 'anchor-sweep';
    await render(state, els);

    writeLine(els, 'ASWEEP', 'anchor sweep complete');
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function frameSweep(state, els) {
  try {
    state.lastAction = 'frame-sweep';
    await render(state, els);

    const original = snapshotProbeState(state);
    writeLine(els, 'SWEEP', `starting frame sweep at slot=${state.activeSlot} phase=${state.phaseSign > 0 ? '+' : '-'}`);

    for (let hostMode = 0; hostMode < 4; hostMode += 1) {
      const probe = {
        hostMode,
        activeSlot: original.activeSlot,
        phaseSign: original.phaseSign,
        datasetId: state.datasetId,
        discoveryMode: state.discoveryMode
      };

      const frame = await getFrame(probe);
      const rawChannels = formatRawChannels(frame);
      const operational = formatOperationalChannels(frame);

      if (!(frame.shell || []).length) {
        writeLine(els, 'SWEEP', `P${hostMode} no local chamber structure`);
        writeLine(els, 'SWEEP', `P${hostMode} raw=[] ordered=[]`);
        writeLine(els, 'SWEEP', `P${hostMode} channels (none)`);
        writeLine(els, 'SWEEP', `P${hostMode} slots (none)`);
        writeLine(els, 'SWEEP', `P${hostMode} scores m=n/a t=n/a total=n/a`);
        continue;
      }

      writeLine(els, 'SWEEP', `P${hostMode} shellBase={${(frame.shellBase || []).join(', ')}} displayed={${(frame.shell || []).join(', ')}}`);
      writeLine(els, 'SWEEP', `P${hostMode} raw=${JSON.stringify(frame.rawDiads || [])} ordered=${JSON.stringify(frame.orderedRawDiads || [])}`);
      writeLine(els, 'SWEEP', `P${hostMode} channels ${rawChannels || '(none)'}`);
      writeLine(els, 'SWEEP', `P${hostMode} slots ${operational || '(none)'}`);
      writeLine(els, 'SWEEP', `P${hostMode} scores m=${frame.matchingScore} t=${frame.transportScore} total=${(frame.shellDebug || [])[0]?.totalScore ?? 'n/a'}`);
    }

    restoreProbeState(state, original);
    state.lastAction = 'frame-sweep';
    await render(state, els);

    writeLine(els, 'SWEEP', 'frame sweep complete');
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function deriveTrace(state, els) {
  try {
    state.lastAction = 'derive';
    await render(state, els);
    const frame = await getFrame(state);
    const compareSeeded = await getFrame({ ...state, discoveryMode: 'seeded' });
    const compareStructure = await getFrame({ ...state, discoveryMode: 'structure' });

    writeLine(els, 'DERIVE', `compare seeded shellBase={${(compareSeeded.shellBase || []).join(', ')}} channels=${JSON.stringify(compareSeeded.channelMeta || [])}`);
    writeLine(els, 'DERIVE', `compare structure shellBase={${(compareStructure.shellBase || []).join(', ')}} channels=${JSON.stringify(compareStructure.channelMeta || [])}`);

    if (!(frame.shell || []).length) {
      writeLine(els, 'DERIVE', `dataset=${frame.datasetId ?? state.datasetId} kind=${frame.datasetMeta?.kind ?? 'unknown'} contains no local chamber structure`, 'warn');
      writeLine(els, 'DERIVE', `ring1=[${(frame.neighborhood?.ring1 || []).join(', ')}] count=${frame.neighborhood?.ring1Count ?? 0}`);
      writeLine(els, 'DERIVE', `ring2=[${(frame.neighborhood?.ring2 || []).join(', ')}] count=${frame.neighborhood?.ring2Count ?? 0}`);
      writeLine(els, 'DERIVE', `shellBase={} shellSource=${frame.shellSource ?? 'none'}`, 'warn');
      writeLine(els, 'DERIVE', 'rawDiads=[]');
      writeLine(els, 'DERIVE', 'orderedRawDiads=[]');
      writeLine(els, 'DERIVE', 'channels=[]');
      writeLine(els, 'DERIVE', 'operational=[]');
      writeLine(els, 'DERIVE', `matchingScore=n/a diadSource=${frame.diadSource ?? 'none'}`);
      writeLine(els, 'DERIVE', `orderingSource=${frame.orderingSource ?? 'none'}`);
      return;
    }

    writeLine(els, 'DERIVE', `ring1=[${(frame.neighborhood?.ring1 || []).join(', ')}] count=${frame.neighborhood?.ring1Count ?? 0}`);
    writeLine(els, 'DERIVE', `ring2=[${(frame.neighborhood?.ring2 || []).join(', ')}] count=${frame.neighborhood?.ring2Count ?? 0}`);
    writeLine(els, 'DERIVE', `shellBase={${(frame.shellBase || []).join(', ')}} shellSource=${frame.shellSource}`);
    writeLine(els, 'DERIVE', `shellRing2Degrees=[${(frame.shellRing2Degrees || []).join(', ')}] boundaryVariance=${frame.boundaryVariance} boundaryUniformityScore=${frame.boundaryUniformityScore}`);
    writeLine(els, 'DERIVE', `nonShell=[${(frame.nonShell || []).join(', ')}]`);
    writeLine(els, 'DERIVE', `rawDiads=${JSON.stringify(frame.rawDiads || [])}`);
    writeLine(els, 'DERIVE', `orderedRawDiads=${JSON.stringify(frame.orderedRawDiads || [])}`);
    writeLine(els, 'DERIVE', `channels=${JSON.stringify(frame.channelMeta || [])}`);
    writeLine(els, 'DERIVE', `operational=${JSON.stringify(frame.operationalChannels || [])}`);
    writeLine(els, 'DERIVE', `matchingScore=${frame.matchingScore} diadSource=${frame.diadSource}`);
    writeLine(els, 'DERIVE', `orderingSource=${frame.orderingSource}`);

    (frame.orderingDebug || []).forEach((item, idx) => {
      writeLine(els, 'ORDERDBG', `rank=${idx} channel=${item.channelKey} pair=${JSON.stringify(item.pair)} signature=${JSON.stringify(item.signature)} spread=${item.spread} sigLen=${item.sigLen}`);
    });

    (frame.shellDebug || []).forEach((item, idx) => {
      writeLine(els, 'SHELLDBG', `rank=${idx} shell=${JSON.stringify(item.shellBase)} nonShell=${JSON.stringify(item.nonShell)} matching=${JSON.stringify(item.matching)}`);
      writeLine(els, 'SHELLDBG', `rank=${idx} ring2deg=${JSON.stringify(item.shellRing2Degrees)} var=${item.boundaryVariance} bonus=${item.boundaryUniformityScore} matchingScore=${item.matchingScore} totalScore=${item.totalScore}`);
    });
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function resetConsoleState(state, els) {
  resetStateValues(state);
  await render(state, els);
  writeLine(els, 'RESET', 'returned to seed state Q00+');
}

export async function dumpState(state, els) {
  try {
    state.lastAction = 'dump';
    const frame = await getFrame(state);
    await render(state, els);

    const prev = previousState(state.hostMode, state.activeSlot, state.phaseSign);
    const next = nextState(state.hostMode, state.activeSlot, state.phaseSign);

    const payload = {
      graph: frame.graphKey,
      adapterSource: frame.source,
      datasetId: frame.datasetId ?? state.datasetId,
      datasetKind: frame.datasetMeta?.kind ?? 'unknown',
      datasetNotes: frame.datasetMeta?.notes ?? null,
      discoveryMode: state.discoveryMode,
      portKey: frame.portKey,
      portName: frame.portName,
      hostPort: state.hostMode,
      activeSlot: state.activeSlot,
      slotKey: frame.slotKey,
      slotName: frame.slotName,
      phaseKey: frame.phaseKey,
      phaseName: frame.phaseName,
      coarseState: signedLabelFor(state.hostMode, state.activeSlot, state.phaseSign),
      previousState: signedLabelFor(prev.hostMode, prev.activeSlot, prev.phaseSign),
      nextState: signedLabelFor(next.hostMode, next.activeSlot, next.phaseSign),
      cyclePos: state.stepCount % 12,
      coupler: frame.coupler,
      shell: frame.shell,
      shellBase: frame.shellBase,
      shellSource: frame.shellSource,
      diads: frame.diads,
      rawDiads: frame.rawDiads,
      orderedRawDiads: frame.orderedRawDiads,
      channelMeta: frame.channelMeta,
      operationalChannels: frame.operationalChannels,
      diadSource: frame.diadSource,
      orderingSource: frame.orderingSource,
      orderingDebug: frame.orderingDebug,
      matchingScore: frame.matchingScore,
      validation: frame.validation,
      stepCount: state.stepCount,
      portNext: [1, 2, 3, 0],
      slotNext: [1, 2, 0],
      phaseRule: '+ -> -, - -> +',
    };

    writeLine(els, 'DUMP', JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}

export async function clearConsole(state, els) {
  els.console.innerHTML = '';
  state.lastAction = 'clear';
  await render(state, els);
  writeLine(els, 'CLEAR', 'console cleared; scaffold remains active', 'warn');
}

export async function runCycle(state, els) {
  try {
    state.lastAction = 'cycle';
    await render(state, els);

    const frame = await getFrame(state);
    if ((frame.operationalChannels || []).length === 0) {
      writeLine(els, 'RUN', 'blocked: no chamber motion loaded for current dataset', 'warn');
      return;
    }

    writeLine(els, 'RUN', 'starting 12-step coarse cycle');

    for (let i = 0; i < 12; i += 1) {
      await stepPump(state, els, true);
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    writeLine(els, 'RUN', 'cycle complete');
  } catch (err) {
    console.error(err);
    writeLine(els, 'ERROR', `${err.name}: ${err.message}`, 'warn');
    writeLine(els, 'ERROR', err.stack || 'no stack', 'warn');
  }
}
