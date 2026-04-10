const refs = {
  overallPill: document.getElementById('overallPill'),
  statusSummary: document.getElementById('statusSummary'),
  canonicalObject: document.getElementById('canonicalObject'),
  witnessStatus: document.getElementById('witnessStatus'),
  cocycleStatus: document.getElementById('cocycleStatus'),
  reportTimestamp: document.getElementById('reportTimestamp'),
  reportPassLine: document.getElementById('reportPassLine'),
  cocycleArtifactLine: document.getElementById('cocycleArtifactLine'),

  claimsWitness: document.getElementById('claimsWitness'),
  claimsGraph: document.getElementById('claimsGraph'),
  claimsAlgebra: document.getElementById('claimsAlgebra'),
  claimsGeometry: document.getElementById('claimsGeometry'),
  claimsCocycle: document.getElementById('claimsCocycle'),

  mShape: document.getElementById('mShape'),
  qShape: document.getElementById('qShape'),
  rowSums: document.getElementById('rowSums'),
  colSums: document.getElementById('colSums'),
  overlapSpectrum: document.getElementById('overlapSpectrum'),

  parallelCount: document.getElementById('parallelCount'),
  crossedCount: document.getElementById('crossedCount'),
  minimalSupport: document.getElementById('minimalSupport'),
  distinctMinima: document.getElementById('distinctMinima'),
  oddCycleCount: document.getElementById('oddCycleCount')
};

const claimText = {
  T1: 'M is a 15×30 matrix.',
  'T1.binary': 'M is binary.',
  T2: 'Every row of M has sum 14.',
  T3: 'Every column of M has sum 7.',
  T4: 'Q = MMᵀ.',
  T5: 'The off-diagonal overlap spectrum is exactly {4:15, 5:60, 9:30}.',
  T6: 'The overlap-9 graph is connected, 4-regular, and has diameter 3.',
  T7: 'The overlap-9 graph has distance-count profile {0:15, 1:60, 2:120, 3:30}.',
  T8: 'The exported adjacency and distance matrices are symmetric with the expected regularity.',
  T9: 'Q = A³ + 2A² + 2I on the overlap-9 graph.',
  T10: 'The centered normalized row geometry is three-angular.',
  C1: 'The cocycle representative is fixed on the active G15 edge set.',
  C2: 'The cocycle has 10 parallel edges and 20 crossed edges.',
  C3: 'The cocycle has switching-minimal support size 6.',
  C4: 'The cocycle has odd-holonomy witnesses and is nontrivial.'
};

const groups = {
  witness: ['T1', 'T1.binary', 'T2', 'T3', 'T4'],
  graph: ['T5', 'T6', 'T7', 'T8'],
  algebra: ['T9'],
  geometry: ['T10'],
  cocycle: ['C1', 'C2', 'C3', 'C4']
};

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setOverallStatus(status) {
  refs.overallPill.textContent = status.toUpperCase();
  refs.overallPill.className = `status-pill ${status === 'pass' ? 'status-pass' : 'status-fail'}`;
  refs.statusSummary.textContent =
    status === 'pass'
      ? 'All active proof-kernel claims currently pass.'
      : 'One or more active proof-kernel claims are failing.';
}

function renderClaims(target, ids, summaryMap) {
  target.innerHTML = '';
  ids.forEach(id => {
    const li = document.createElement('li');
    const status = summaryMap.get(id) || 'missing';
    li.textContent = claimText[id] || id;
    li.className =
      status === 'pass'
        ? 'claim-pass'
        : status === 'fail'
          ? 'claim-fail'
          : 'claim-note';
    target.appendChild(li);
  });
}

function uniqueValues(arr) {
  return [...new Set(arr)];
}

function formatSpectrum(Q) {
  const counts = new Map();
  for (let i = 0; i < Q.length; i += 1) {
    for (let j = i + 1; j < Q.length; j += 1) {
      const v = Q[i][j];
      counts.set(v, (counts.get(v) || 0) + 1);
    }
  }
  return `{${[...counts.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(', ')}}`;
}

async function main() {
  try {
    const [report, theorem, metadata, cocycle] = await Promise.all([
      fetchJson('json/verify_report.json'),
      fetchJson('json/theorem_object.json'),
      fetchJson('json/metadata.json'),
      fetchJson('json/transport_cocycle.json').catch(() => null)
    ]);

    const summaryMap = new Map((report.summary || []).map(item => [item.claim_id, item.status]));
    const overall = (report.overall_status || 'fail').toLowerCase();

    setOverallStatus(overall);

    refs.reportTimestamp.textContent = report.generated_at_utc || 'not available';
    refs.canonicalObject.textContent = 'json/theorem_object.json';
    refs.reportPassLine.textContent = `overall report status: ${overall.toUpperCase()}`;

    const sourceStatus = metadata.source_artifact_status || theorem.source_artifact_status || 'not recorded';
    const sourceNote = metadata.source_artifact_note || theorem.source_artifact_note || 'not recorded';
    refs.witnessStatus.textContent = `${sourceStatus} — ${sourceNote}`;

    refs.cocycleStatus.textContent = overall === 'pass'
      ? 'verified companion invariant in active proof kernel'
      : 'companion invariant not fully passing';

    refs.cocycleArtifactLine.textContent = cocycle
      ? 'transport_cocycle.json is public; active cocycle proof state lives in the repo proof kernel.'
      : 'no public cocycle JSON loaded';

    const M = theorem.M || theorem.matrix_M;
    const Q = theorem.Q || theorem.gram_Q;

    refs.mShape.textContent = `${M.length} × ${M[0].length}`;
    refs.qShape.textContent = `${Q.length} × ${Q[0].length}`;
    refs.rowSums.textContent = uniqueValues(M.map(r => r.reduce((a, b) => a + b, 0))).join(', ');
    refs.colSums.textContent = uniqueValues(
      M[0].map((_, j) => M.reduce((s, row) => s + row[j], 0))
    ).join(', ');
    refs.overlapSpectrum.textContent = formatSpectrum(Q);

    renderClaims(refs.claimsWitness, groups.witness, summaryMap);
    renderClaims(refs.claimsGraph, groups.graph, summaryMap);
    renderClaims(refs.claimsAlgebra, groups.algebra, summaryMap);
    renderClaims(refs.claimsGeometry, groups.geometry, summaryMap);
    renderClaims(refs.claimsCocycle, groups.cocycle, summaryMap);

    const cocycleDataResult = report.results.find(r => r.checker === 'check_cocycle_data.py');
    if (cocycleDataResult?.result?.claims) {
      const c2 = cocycleDataResult.result.claims.find(c => c.claim_id === 'C2');
      if (c2?.details) {
        refs.parallelCount.textContent = c2.details.parallel_count;
        refs.crossedCount.textContent = c2.details.crossed_count;
      }
    }

    const minSupportResult = report.results.find(r => r.checker === 'check_cocycle_min_support.py');
    if (minSupportResult?.result?.details) {
      refs.minimalSupport.textContent = minSupportResult.result.details.minimal_support_size;
      refs.distinctMinima.textContent = minSupportResult.result.details.number_of_distinct_minimal_supports;
    }

    const holonomyResult = report.results.find(r => r.checker === 'check_cocycle_holonomy.py');
    if (holonomyResult?.result?.details) {
      refs.oddCycleCount.textContent = holonomyResult.result.details.odd_cycle_count;
    }
  } catch (err) {
    refs.overallPill.textContent = 'ERROR';
    refs.overallPill.className = 'status-pill status-fail';
    refs.statusSummary.textContent = err.message;
  }
}

main();
