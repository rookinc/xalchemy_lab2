<?php
$page_title = 'Audit — Aletheos.ai';
$page_description = 'Verification records, theorem data, and checker routes for Aletheos.ai.';
$page_css = ['assets/index.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="hero">
    <p class="eyebrow">Verification and anti-drift</p>
    <h1 class="hero-title">Audit</h1>
    <p class="hero-text">
      Machine-readable data contracts, verification records, and local checker commands for the current Aletheos public artifact set.
    </p>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Primary records</p>
      <h2>Artifact contracts</h2>
      <p class="section-text">
        These files are the public data layer used by the theorem page and experimental rendering stages.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card feature-card" href="json/theorem_object.json">
        <span class="card-label">Canonical</span>
        <h3>Theorem Object</h3>
        <p>G15 transport theorem data: M, Q, distance matrix, Petersen edge indexing, and invariant summaries.</p>
      </a>

      <a class="index-card" href="json/verify_report.json">
        <span class="card-label">Report</span>
        <h3>Verification Report</h3>
        <p>Public machine-readable verification record for the exported artifact set.</p>
      </a>

      <a class="index-card" href="json/metadata.json">
        <span class="card-label">Metadata</span>
        <h3>Transport Metadata</h3>
        <p>Canonical transport summary, row/column weights, overlap profile, and polynomial identity notes.</p>
      </a>

      <a class="index-card" href="json/transport_cocycle.json">
        <span class="card-label">Cocycle</span>
        <h3>Transport Cocycle</h3>
        <p>Anti-drift transition law for carrying walk descriptions across regions and lenses.</p>
      </a>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Experimental lens audit</p>
      <h2>Collapse Witness Lens</h2>
      <p class="section-text">
        The collapse witness is an exploratory lens. Its audit verifies that station labels, phase order,
        and theorem-object boundaries remain explicit.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card feature-card" href="collapse_witness.php">
        <span class="card-label">Live</span>
        <h3>Collapse Witness Renderer</h3>
        <p>G15 graph wave, Mᵀu incidence response, and six-station collapse/rebound witness.</p>
      </a>

      <a class="index-card" href="json/bubble_witness_lens.json">
        <span class="card-label">Lens</span>
        <h3>Bubble Witness Lens Contract</h3>
        <p>Station quotient, phase sequence, and anti-drift rules for the collapse witness renderer.</p>
      </a>

      <a class="index-card" href="json/collapse_params.json">
        <span class="card-label">Params</span>
        <h3>Collapse Parameters</h3>
        <p>Exploratory graph-wave defaults and render parameters for the live witness stage.</p>
      </a>
    </div>
  </section>

  <section class="index-section archive-section">
    <div class="section-head">
      <p class="section-kicker">Local checks</p>
      <h2>Checker commands</h2>
      <p class="section-text">
        Run these from the repository root during local development.
      </p>
    </div>

    <div class="archive-placeholder">
      <pre><code>python public_html/audit/checkers/check_bubble_witness_lens.py
python public_html/audit/checkers/run_all.py</code></pre>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
