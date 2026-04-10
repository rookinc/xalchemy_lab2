<?php
$page_title = 'The Thalean Graph AT4val[60,6]';
$page_description = 'Public proof page for the Thalean quotient-core theorem.';
$page_css = ['assets/thalean_graph.css'];
include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="app proof-app">
  <section id="overview" class="panel intro-hero">
    <div class="panel-inner intro-hero-grid">
          <div class="card intro-card">
        <h1>Dodecahedral Transport, Sector Geometry on L(Petersen), and the Identity MMᵀ = A³ + 2A² + 2I</h1>
        <p class="muted">
          The paper begins with a local question: if you move through the flag structure of the combinatorial
          dodecahedron by a small transport rule, what exact structure survives on the quotient core?
          The answer is unexpectedly rigid. The construction produces a quotient tower
          G60 → G30 → G15, with G15 ≅ L(Petersen), and on that core it induces a 15 × 30
          sector-edge incidence matrix M whose Gram matrix satisfies the exact identity
          Q = MMᵀ = A³ + 2A² + 2I.
        </p>
        <p class="muted">
          That identity is the mathematical center of the paper. The three-angle spherical realization
          and the Z₂-valued cocycle matter, but they travel alongside the main incidence theorem;
          they are consequences and companion structure, not the headline instead of it.
        </p>
        <p class="muted">
          The 60-vertex transport graph G60 is identified with <strong>AT4val[60,6]</strong>.
          It also sits against a broader geometric backdrop: the related graph
          <strong>AT4val[60,0]</strong> appears in connection with the tetravalent tessellation
          picture in hyperbolic space. That wider setting is part of the story around the graph
          family, but this page stays focused on the finite quotient-core theorem proved here.
        </p>
        <p class="muted">
          This page exists to make that core claim inspectable. The paper is the primary statement.
          The dashboard below is supporting machinery: proof status, checked claims, and access to the finite artifacts.
        </p>

        <p class="eyebrow">Read first</p>
        <p class="muted">
          Start here. This is the preprint that defines the construction, states the theorem,
          and explains the quotient-core result in full.
        </p>
        <div class="paper-actions">
          <a class="paper-button" href="https://zenodo.org/records/19043356" target="_blank" rel="noopener">
            Download the preprint
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

  <section id="proof-status" class="panel hero-panel">
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
      </div>
    </div>
  </section>

  <section id="theorem-snapshot" class="panel">
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

  <section id="verified-claims" class="panel">
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

  <section id="artifacts" class="panel">
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
          <h3>Audit the verifier</h3>
          <ul class="artifact-list link-list">
            <li><a href="audit/checkers/check_shape.py" target="_blank" rel="noopener">check_shape.py</a></li>
            <li><a href="audit/checkers/check_binary.py" target="_blank" rel="noopener">check_binary.py</a></li>
            <li><a href="audit/checkers/check_row_col_sums.py" target="_blank" rel="noopener">check_row_col_sums.py</a></li>
            <li><a href="audit/checkers/check_gram.py" target="_blank" rel="noopener">check_gram.py</a></li>
            <li><a href="audit/checkers/check_graph.py" target="_blank" rel="noopener">check_graph.py</a></li>
            <li><a href="audit/checkers/check_overlap_profile.py" target="_blank" rel="noopener">check_overlap_profile.py</a></li>
            <li><a href="audit/checkers/check_distance_profile.py" target="_blank" rel="noopener">check_distance_profile.py</a></li>
            <li><a href="audit/checkers/check_polynomial_identity.py" target="_blank" rel="noopener">check_polynomial_identity.py</a></li>
            <li><a href="audit/checkers/check_three_angle_geometry.py" target="_blank" rel="noopener">check_three_angle_geometry.py</a></li>
            <li><a href="audit/checkers/check_overlap9_matrices.py" target="_blank" rel="noopener">check_overlap9_matrices.py</a></li>
            <li><a href="audit/checkers/check_cocycle_data.py" target="_blank" rel="noopener">check_cocycle_data.py</a></li>
            <li><a href="audit/checkers/check_cocycle_min_support.py" target="_blank" rel="noopener">check_cocycle_min_support.py</a></li>
            <li><a href="audit/checkers/check_cocycle_holonomy.py" target="_blank" rel="noopener">check_cocycle_holonomy.py</a></li>
            <li><a href="audit/checkers/run_all.py" target="_blank" rel="noopener">run_all.py</a></li>
          </ul>
        </div>

      </div>
    </div>
  </section>

</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
<script src="assets/thalean_graph.js?v=20260410-final"></script>
