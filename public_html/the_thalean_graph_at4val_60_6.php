<?php
$page_title = 'Research — The Thalean Graph';
$page_description = 'Aletheos research page for the Thalean Graph AT4val[60,6], theorem artifacts, verification records, and public audit surface.';
$page_css = ['assets/index.css', 'assets/thalean_graph.css', 'assets/research_page.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell research-page">
  <section class="hero research-hero">
    <p class="eyebrow">Research</p>

    <div class="hero-grid">
      <div class="hero-copy">
        <h1 class="hero-title">The Thalean Graph.</h1>
        <p class="hero-text">
          A finite research object for studying relation, observation, structure,
          and traceable action.
        </p>
        <p class="hero-text hero-text--secondary">
          The current public witness is identified with <strong>AT4val[60,6]</strong>.
          It gathers theorem artifacts, verification records, companion papers,
          and experimental rendering stages into one inspectable surface.
        </p>

        <div class="hero-actions" aria-label="Research actions">
          <a class="button button--primary" href="#proof-status">View proof status</a>
          <a class="button button--secondary" href="#artifacts">Browse artifacts</a>
        </div>
      </div>

      <aside class="hero-emblem" aria-label="Thalean research themes">
        <div class="orbital-mark">
          <span class="orbital-mark__ring orbital-mark__ring--outer"></span>
          <span class="orbital-mark__ring orbital-mark__ring--middle"></span>
          <span class="orbital-mark__ring orbital-mark__ring--inner"></span>
          <span class="orbital-mark__point orbital-mark__point--one"></span>
          <span class="orbital-mark__point orbital-mark__point--two"></span>
          <span class="orbital-mark__point orbital-mark__point--three"></span>
        </div>
        <p class="emblem-caption">G60 · G30 · G15</p>
      </aside>
    </div>
  </section>

  <section id="overview" class="index-section research-overview">
    <div class="section-head">
      <p class="section-kicker">Overview</p>
      <h2>A theorem-facing public surface.</h2>
      <p class="section-text">
        This page presents a finite witness assembled from companion results.
        Starting from a local transport rule on the flag structure of the
        combinatorial dodecahedron, one obtains a quotient tower
        <strong>G60 → G30 → G15</strong>, with <strong>G15 ≅ L(Petersen)</strong>,
        together with a 15 × 30 sector-edge incidence matrix
        <strong>M</strong> satisfying the exact quadratic law
        <strong>Q = MMᵀ = A³ + 2A² + 2I</strong>.
      </p>
    </div>

    <div class="prose-grid">
      <article class="principle-card">
        <span class="card-label">Algebraic witness</span>
        <h3>Exact quadratic law</h3>
        <p>
          The matrix identity gives one side of the witness: a finite,
          inspectable algebraic relation carried by the public artifacts.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Internal grammar</span>
        <h3>Chamber structure</h3>
        <p>
          The same matrix decomposes into a rigid chamber grammar with canonical
          block and row classes.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Finite surface</span>
        <h3>Public audit</h3>
        <p>
          The page gathers theorem data, verifier outputs, cocycle records, and
          linked checkers into one theorem-facing surface.
        </p>
      </article>
    </div>
  </section>

  <section class="index-section papers-section">
    <div class="section-head">
      <p class="section-kicker">Companion papers</p>
      <h2>Four documents around the theorem surface.</h2>
      <p class="section-text">
        The March 2026 paper establishes the quotient-core theorem and quadratic
        identity. The April 2026 paper develops the chamber grammar. The witness
        note gathers the finite object into one unified theorem-facing surface.
        The CMB note is a separate exploratory benchmark program inspired by the
        broader template reservoir.
      </p>
    </div>

    <div class="card-grid paper-grid">
      <a class="index-card feature-card" href="https://zenodo.org/records/19043356" target="_blank" rel="noopener">
        <span class="card-label">March 2026</span>
        <h3>Dodecahedral Transport</h3>
        <p>DOI: 10.5281/zenodo.19043356</p>
      </a>

      <a class="index-card" href="https://zenodo.org/records/19520206" target="_blank" rel="noopener">
        <span class="card-label">April 2026</span>
        <h3>Chamber Grammar</h3>
        <p>DOI: 10.5281/zenodo.19520206</p>
      </a>

      <a class="index-card" href="https://zenodo.org/records/19542052" target="_blank" rel="noopener">
        <span class="card-label">Witness note</span>
        <h3>Thalean Witness</h3>
        <p>DOI: 10.5281/zenodo.19542052</p>
      </a>

      <a class="index-card" href="https://doi.org/10.5281/zenodo.19561286" target="_blank" rel="noopener">
        <span class="card-label">CMB note</span>
        <h3>Structured Benchmark</h3>
        <p>DOI: 10.5281/zenodo.19561286</p>
      </a>
    </div>
  </section>

  <section id="proof-status" class="index-section proof-status-section">
    <div class="section-head">
      <p class="section-kicker">Proof status</p>
      <h2>Verification artifacts.</h2>
      <p class="section-text" id="statusSummary">
        Reading verification artifacts…
      </p>
    </div>

    <div class="status-layout">
      <div id="overallPill" class="status-pill status-loading">Loading</div>

      <div class="kv research-kv">
        <div>Canonical object</div><div id="canonicalObject">theorem/theorem_object.json</div>
        <div>Witness provenance</div><div id="witnessStatus">loading…</div>
        <div>Cocycle layer</div><div id="cocycleStatus">loading…</div>
        <div>Generated report</div><div id="reportTimestamp">loading…</div>
      </div>
    </div>
  </section>

  <section id="theorem-snapshot" class="index-section theorem-snapshot-section">
    <div class="section-head">
      <p class="section-kicker">Snapshot</p>
      <h2>Core theorem structure.</h2>
      <p class="section-text">
        The current witness is presented through matrix shape, identities,
        overlap geometry, and cocycle data.
      </p>
    </div>

    <div class="card-grid snapshot-grid">
      <article class="index-card">
        <span class="card-label">Witness</span>
        <h3>Summary</h3>
        <div class="kv research-kv">
          <div>M shape</div><div id="mShape">loading…</div>
          <div>Q shape</div><div id="qShape">loading…</div>
          <div>Row sums</div><div id="rowSums">loading…</div>
          <div>Column sums</div><div id="colSums">loading…</div>
          <div>Overlap spectrum</div><div id="overlapSpectrum">loading…</div>
        </div>
      </article>

      <article class="index-card feature-card">
        <span class="card-label">Identities</span>
        <h3>Core laws</h3>
        <div class="formula-stack">
          <div class="formula">Q = MMᵀ</div>
          <div class="formula">Q = A³ + 2A² + 2I</div>
          <div class="formula">off-diagonal overlaps = {4, 5, 9}</div>
          <div class="formula">three-angle geometry = {37/112, −23/112, −38/112}</div>
        </div>
      </article>

      <article class="index-card">
        <span class="card-label">Cocycle</span>
        <h3>Transport layer</h3>
        <div class="kv research-kv">
          <div>Parallel edges</div><div id="parallelCount">loading…</div>
          <div>Crossed edges</div><div id="crossedCount">loading…</div>
          <div>Minimal support</div><div id="minimalSupport">loading…</div>
          <div>Distinct minima</div><div id="distinctMinima">loading…</div>
          <div>Odd-holonomy witnesses</div><div id="oddCycleCount">loading…</div>
        </div>
      </article>
    </div>
  </section>

  <section id="verified-claims" class="index-section verified-claims-section">
    <div class="section-head">
      <p class="section-kicker">Verified claims</p>
      <h2>Machine-readable claim groups.</h2>
      <p class="section-text">
        These lists are populated from the verification artifacts used by the
        public theorem surface.
      </p>
    </div>

    <div class="count-row">
      <span class="count-pill" id="countWitness">witness: —</span>
      <span class="count-pill" id="countGraph">graph: —</span>
      <span class="count-pill" id="countAlgebra">algebra: —</span>
      <span class="count-pill" id="countGeometry">geometry: —</span>
      <span class="count-pill" id="countCocycle">cocycle: —</span>
    </div>

    <div class="claims-grid">
      <article class="index-card">
        <span class="card-label">Claims</span>
        <h3>Witness</h3>
        <ul id="claimsWitness" class="claim-list"></ul>
      </article>

      <article class="index-card">
        <span class="card-label">Claims</span>
        <h3>Graph</h3>
        <ul id="claimsGraph" class="claim-list"></ul>
      </article>

      <article class="index-card">
        <span class="card-label">Claims</span>
        <h3>Algebra</h3>
        <ul id="claimsAlgebra" class="claim-list"></ul>
      </article>

      <article class="index-card">
        <span class="card-label">Claims</span>
        <h3>Geometry</h3>
        <ul id="claimsGeometry" class="claim-list"></ul>
      </article>

      <article class="index-card">
        <span class="card-label">Claims</span>
        <h3>Cocycle</h3>
        <ul id="claimsCocycle" class="claim-list"></ul>
      </article>
    </div>
  </section>

  <section id="artifacts" class="index-section artifacts-section">
    <div class="section-head">
      <p class="section-kicker">Artifact browser</p>
      <h2>Canonical data and verifier code.</h2>
      <p class="section-text">
        Public JSON artifacts and checker scripts for inspecting the theorem
        surface directly.
      </p>
    </div>

    <div class="artifacts-grid">
      <article class="index-card">
        <span class="card-label">JSON</span>
        <h3>Canonical theorem artifacts</h3>
        <ul class="artifact-list link-list">
          <li><a href="json/theorem_object.json" target="_blank" rel="noopener">theorem_object.json</a></li>
          <li><a href="json/metadata.json" target="_blank" rel="noopener">metadata.json</a></li>
          <li><a href="json/matrix_M.json" target="_blank" rel="noopener">matrix_M.json</a></li>
          <li><a href="json/gram_Q.json" target="_blank" rel="noopener">gram_Q.json</a></li>
        </ul>
      </article>

      <article class="index-card">
        <span class="card-label">Output</span>
        <h3>Generated proof outputs</h3>
        <ul class="artifact-list link-list">
          <li><a href="json/verify_report.json" target="_blank" rel="noopener">verify_report.json</a></li>
          <li id="reportPassLine" class="muted">verification report summary loading…</li>
        </ul>
      </article>

      <article class="index-card">
        <span class="card-label">Transport</span>
        <h3>Cocycle artifacts</h3>
        <ul class="artifact-list link-list">
          <li><a href="json/transport_cocycle.json" target="_blank" rel="noopener">transport_cocycle.json</a></li>
          <li id="cocycleArtifactLine" class="muted">companion invariant status loading…</li>
        </ul>
      </article>

      <article class="index-card">
        <span class="card-label">Audit</span>
        <h3>Verifier scripts</h3>
        <ul class="artifact-list link-list compact-list">
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
      </article>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
<script src="assets/thalean_graph.js?v=20260410-final"></script>
</body>
</html>
