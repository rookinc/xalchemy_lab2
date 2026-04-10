<?php
$page_title = 'Thalean Proof Kernel';
$page_description = 'Machine-checked proof dashboard for the canonical G15 witness, polynomial identity, spherical geometry, and cocycle companion invariant.';
$page_css = ['assets/g60_console.css'];
include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="app proof-app">
  <section class="panel header">
    <div class="title-wrap">
      <h1>Thalean Proof Kernel</h1>
      <p class="subtitle">
        Machine-checked verification of the canonical 15×30 witness, the overlap law
        Q = MMᵀ, the polynomial identity Q = A³ + 2A² + 2I, the induced three-angle
        geometry, and the cocycle companion invariant.
      </p>
    </div>
    <div class="badge-row">
      <span class="badge">canonical witness: 15×30 binary M</span>
      <span class="badge">core graph: G15 ≅ L(Petersen)</span>
      <span class="badge">quadratic law: Q = MMᵀ</span>
      <span class="badge">cubic law: Q = A³ + 2A² + 2I</span>
      <span class="badge">geometry: three-angle</span>
      <span class="badge">cocycle: verified companion invariant</span>
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
        <h2>What is proved here</h2>
        <p class="muted">
          This page is proof-first. The central theorem lives on the quotient core G15, where the
          sector-incidence matrix M induces the overlap matrix Q and the cubic identity.
          The cocycle sits beside that quadratic geometry as a companion invariant.
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
      <h2>Verified claims</h2>
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
          <ul class="artifact-list">
            <li><a href="json/theorem_object.json" target="_blank" rel="noopener">theorem_object.json</a></li>
            <li><a href="json/metadata.json" target="_blank" rel="noopener">metadata.json</a></li>
            <li><a href="json/matrix_M.json" target="_blank" rel="noopener">matrix_M.json</a></li>
            <li><a href="json/gram_Q.json" target="_blank" rel="noopener">gram_Q.json</a></li>
          </ul>
        </div>

        <div class="card">
          <h3>Generated proof outputs</h3>
          <ul class="artifact-list">
            <li><a href="json/verify_report.json" target="_blank" rel="noopener">verify_report.json</a></li>
            <li id="reportPassLine" class="muted">verification report summary loading…</li>
          </ul>
        </div>

        <div class="card">
          <h3>Cocycle and transport artifacts</h3>
          <ul class="artifact-list">
            <li><a href="json/transport_cocycle.json" target="_blank" rel="noopener">transport_cocycle.json</a></li>
            <li id="cocycleArtifactLine" class="muted">companion invariant status loading…</li>
          </ul>
        </div>

        <div class="card">
          <h3>Current public boundary</h3>
          <ul class="artifact-list">
            <li>The public page verifies the quotient-core theorem from a canonical witness.</li>
            <li>The historical upstream CP-SAT generator output was not recovered.</li>
            <li>A truthful reconstructed exact witness is used in the active repo.</li>
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
        an interpretive or pedagogical layer, but it does not define theorem truth. The proof kernel
        above is the authoritative surface.
      </p>
      <div class="console-log" id="consoleLog">
Proof-first orientation active.
The current page is centered on the verified quotient-core theorem and companion cocycle layer.
Legacy G60 chamber doctrine is retained only as a secondary interpretive view.
      </div>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
<script src="assets/g60_console.js"></script>
