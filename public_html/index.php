<?php
$page_title = 'Aletheos.ai';
$page_description = 'Aletheos.ai public index for Thalean graph artifacts, verification records, papers, and experimental rendering stages.';
$page_css = ['assets/index.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="hero">
    <p class="eyebrow">Center of Recursive Inquiry</p>
    <h1 class="hero-title">Aletheos.ai</h1>
    <p class="hero-text">
      Public index for Thalean graph artifacts, verification records, papers, and experimental rendering stages.
    </p>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Canonical object</p>
      <h2>Thalean graph</h2>
      <p class="section-text">
        The current public theorem object and graph presentation.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card feature-card" href="the_thalean_graph_at4val_60_6.php">
        <span class="card-label">Open</span>
        <h3>AT4val[60,6] / Thalean Graph</h3>
        <p>Canonical public presentation of the current Thalean graph artifact.</p>
      </a>

      <a class="index-card" href="json/verify_report.json">
        <span class="card-label">JSON</span>
        <h3>Verification Report</h3>
        <p>Machine-readable verification output for the public artifact set.</p>
      </a>

      <a class="index-card" href="json/theorem_object.json">
        <span class="card-label">JSON</span>
        <h3>Theorem Object</h3>
        <p>Canonical theorem object data used by the public graph page.</p>
      </a>
    </div>
  </section>

  <section class="index-section archive-section">
    <div class="section-head">
      <p class="section-kicker">Rendering stages</p>
      <h2>Labs</h2>
      <p class="section-text">
        Experimental viewers and visual lenses. These are development stages, not independent theorem objects.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card" href="labs.php">
        <span class="card-label">Hub</span>
        <h3>Labs index</h3>
        <p>Landing page for fresh renderers, witness lenses, and graph-viewer experiments.</p>
      </a>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
