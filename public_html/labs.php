<?php
$page_title = 'Labs — Aletheos.ai';
$page_description = 'Experimental rendering stages and visual lenses for Aletheos.ai.';
$page_css = ['assets/index.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="hero">
    <p class="eyebrow">Experimental rendering stages</p>
    <h1 class="hero-title">Labs</h1>
    <p class="hero-text">
      Development viewers, witness lenses, and exploratory renderers. These pages help inspect transport structure without changing the theorem object.
    </p>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Current stages</p>
      <h2>Available lab routes</h2>
      <p class="section-text">
        Public and development renderers for the current Aletheos graph stack.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card feature-card" href="the_thalean_graph_at4val_60_6.php">
        <span class="card-label">Public</span>
        <h3>Thalean Graph Page</h3>
        <p>The current public renderer and presentation for the canonical artifact.</p>
      </a>

      <a class="index-card" href="../graph_viewer/index.html">
        <span class="card-label">Dev</span>
        <h3>Graph Viewer</h3>
        <p>Raw graph-viewer stage outside public_html. This link works when serving from the repository root.</p>
      </a>

      <a class="index-card" href="#">
        <span class="card-label">Planned</span>
        <h3>Collapse Witness Lens</h3>
        <p>Future G15 collapse/rebound visual lens over the canonical transport data.</p>
      </a>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
