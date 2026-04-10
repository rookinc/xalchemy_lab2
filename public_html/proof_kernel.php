<?php
$page_title = 'Thalean Proof Kernel';
$page_description = 'Public proof page for the Thalean quotient-core theorem.';
$page_css = ['assets/proof_kernel.css'];
include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="app proof-app">
  <section class="panel header">
    <div class="title-wrap">
      <h1>Thalean Proof Kernel</h1>
      <p class="subtitle">
        A local transport rule on the dodecahedron collapses, on a canonical 15-vertex core, to an exact cubic incidence law.
      </p>
    </div>
    <div class="badge-row">
      <span class="badge">G60 → G30 → G15</span>
      <span class="badge">G15 ≅ L(Petersen)</span>
      <span class="badge">M: 15×30 binary incidence matrix</span>
      <span class="badge">Q = MMᵀ = A³ + 2A² + 2I</span>
      <span class="badge">three-angle geometry</span>
      <span class="badge">cocycle companion invariant</span>
    </div>
  </section>

  <section class="panel intro-hero">
    <div class="panel-inner intro-hero-grid">
      <div class="card intro-card">
        <p class="eyebrow">What this work is</p>
        <h2>A paper about one exact thing</h2>
        <p class="muted">
          The paper starts with a local question: if you move through the flag structure of the combinatorial
          dodecahedron by a small transport rule, what exact structure survives on the quotient core?
          The answer is unexpectedly rigid. The construction produces a quotient tower
          G60 → G30 → G15, with G15 ≅ L(Petersen), and on that core it induces a 15 × 30
          sector-edge incidence matrix M whose Gram matrix satisfies the exact identity
          Q = MMᵀ = A³ + 2A² + 2I.
        </p>
        <p class="muted">
          That identity is the mathematical center of the paper. The three-angle spherical realization
          and the Z₂-valued cocycle are important, but they travel alongside the main incidence theorem;
          they are not the headline instead of it.
        </p>
        <p class="muted">
          This page exists to make that core claim inspectable. The paper is the primary statement.
          The dashboard below is supporting machinery: proof status, checked claims, and access to the finite artifacts.
        </p>
      </div>

      <div class="card paper-card">
        <p class="eyebrow">Read first</p>
        <h2>The paper</h2>
        <p class="muted">
          Start here. This is the preprint that defines the construction, states the theorem, and explains the quotient-core result in full.
        </p>
        <div class="paper-actions">
          <a class="paper-button" href="archive/papers/Dodecahedral_Transport__Sector_Geometry_on_L_Petersen.pdf" target="_blank" rel="noopener">
            Open the preprint
          </a>
        </div>
        <div class="paper-meta">
          <div><strong>Title:</strong> Dodecahedral Transport, Sector Geometry on L(Petersen), and the Identity MMᵀ = A³ + 2A² + 2I</div>
          <div><strong>DOI:</strong> 10.5281/zenodo.19043356</div>
          <div><strong>Status:</strong> March 2026 preprint</div>
        </div>
      </div>
    </div>
  </section>

  <section class="panel hero-panel">
    <div class="panel-inner hero-grid">
      <div class="card hero-card">
        <h2>Proof status</h2>
        <div class="proof-status-row">
          <div id="overallPill" class="status-pill status-loading">Loading</div>
          <div class="muted" id="statusSummary">
            Reading verification artifacts…
          </div>
        </div>
        <div class="kv">
          <div>Canonical object</div><div id="canonicalObject">theorem/theorem_object.json</div>
          <div>Witness provenance</div><div id="witnessStatus">loading…</div>
          <div>Cocycle layer</div><div id="cocycleStatus">loading…</div>
          <div>Generated report</div><div id="reportTimestamp">loading…</div>
        </div>
      </div>

      <div class="card hero-card">
        <h2>What this page verifies</h2>
        <p class="muted">
          The public proof layer begins at the canonical quotient-core witness. It checks the
          incidence matrix M, the overlap matrix Q, the cubic identity, the induced three-angle geometry,
          and the cocycle companion layer.
        </p>
        <div class="legend">
          <span>witness</span>
          <span>graph</span>
          <span>algebra</span>
          <span>geometry</span>
          <span>cocycle</span>
        </div>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panel-inner">
      <div class="section-head">
        <h2>Verified claims</h2>
        <div class="count-row">
          <span class="count-pill" id="countWitness">witness: —</span>
          <span class="count-pill" id="countGraph">graph: —</span>
          <span class="count-pill" id="countAlgebra">algebra: —</span>
          <span class="count-pill" id="countGeometry">geometry: —</span>
          <span class="count-pill" id="countCocycle">cocycle: —</span>
        </div>
      </div>
      <div class="claims-grid">
        <div class="card">
          <h3>Witness</h3>
          <ul id="claimsWitness" class="claim-list"></ul>
        </div>
        <div class="card">
          <h3>Graph</h3>
          <ul id="claimsGraph" class="claim-list"></ul>
        </div>
        <div class="card">
          <h3>Algebra</h3>
          <ul id="claimsAlgebra" class="claim-list"></ul>
        </div>
        <div class="card">
          <h3>Geometry</h3>
          <ul id="claimsGeometry" class="claim-list"></ul>
        </div>
        <div class="card">
          <h3>Cocycle</h3>
          <ul id="claimsCocycle" class="claim-list"></ul>
        </div>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panel-inner">
      <h2>Artifact browser</h2>
      <div class="artifacts-grid">
        <div class="card">
          <h3>Canonical theorem artifacts</h3>
          <ul class="artifact-list link-list">
            <li><a href="json/theorem_object.json" target="_blank" rel="noopener">theorem_object.json</a></li>
            <li><a href="json/metadata.json" target="_blank" rel="noopener">metadata.json</a></li>
            <li><a href="json/matrix_M.json" target="_blank" rel="noopener">matrix_M.json</a></li>
            <li><a href="json/gram_Q.json" target="_blank" rel="noopener">gram_Q.json</a></li>
          </ul>
        </div>

        <div class="card">
          <h3>Generated proof outputs</h3>
          <ul class="artifact-list link-list">
            <li><a href="json/verify_report.json" target="_blank" rel="noopener">verify_report.json</a></li>
            <li id="reportPassLine" class="muted">verification report summary loading…</li>
          </ul>
        </div>

        <div class="card">
          <h3>Cocycle and transport artifacts</h3>
          <ul class="artifact-list link-list">
            <li><a href="json/transport_cocycle.json" target="_blank" rel="noopener">transport_cocycle.json</a></li>
            <li id="cocycleArtifactLine" class="muted">companion invariant status loading…</li>
          </ul>
        </div>

        <div class="card">
          <h3>Current public boundary</h3>
          <ul class="artifact-list">
            <li>The paper is the main statement.</li>
            <li>This page verifies the quotient-core theorem from a canonical witness.</li>
            <li>The original historical CP-SAT generator output was not recovered.</li>
            <li>The full dodecahedral-to-G60 construction remains an upstream frontier.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panel-inner">
      <h2>Core theorem snapshot</h2>
      <div class="snapshot-grid">
        <div class="card">
          <h3>Witness summary</h3>
          <div class="kv">
            <div>M shape</div><div id="mShape">loading…</div>
            <div>Q shape</div><div id="qShape">loading…</div>
            <div>Row sums</div><div id="rowSums">loading…</div>
            <div>Column sums</div><div id="colSums">loading…</div>
            <div>Overlap spectrum</div><div id="overlapSpectrum">loading…</div>
          </div>
        </div>

        <div class="card">
          <h3>Core identities</h3>
          <div class="formula-stack">
            <div class="formula">Q = MMᵀ</div>
            <div class="formula">Q = A³ + 2A² + 2I</div>
            <div class="formula">off-diagonal overlaps = {4, 5, 9}</div>
            <div class="formula">three-angle geometry = {37/112, −23/112, −38/112}</div>
          </div>
        </div>

        <div class="card">
          <h3>Cocycle snapshot</h3>
          <div class="kv">
            <div>Parallel edges</div><div id="parallelCount">loading…</div>
            <div>Crossed edges</div><div id="crossedCount">loading…</div>
            <div>Minimal support</div><div id="minimalSupport">loading…</div>
            <div>Distinct minima</div><div id="distinctMinima">loading…</div>
            <div>Odd-holonomy witnesses</div><div id="oddCycleCount">loading…</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="panel console">
    <div class="panel-inner">
      <h2>Legacy exploration note</h2>
      <p class="muted">
        The older chamber-state simulator has been demoted from center stage. It remains useful as
        an interpretive or pedagogical layer, but it does not define theorem truth.
      </p>
      <div class="console-log" id="consoleLog">
Proof-first orientation active.
The paper is the primary statement.
The dashboard below exists to expose the checked finite core.
      </div>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
<script src="assets/proof_kernel.js?v=20260410f"></script>
