<?php
$page_title = 'CoRI Lab';
$page_description = 'Public entry point for current G60 developments and selected archived artifacts.';
$page_css = ['/assets/index.css'];
include __DIR__ . '/includes/head.php';
?>

<main class="site-shell">
  <header class="hero">
    <p class="eyebrow">Center of Recursive Inquiry</p>
    <h1 class="hero-title">G60 is the active front.</h1>
    <p class="hero-text">
      This public surface is divided into two parts: the active chamber above,
      where current developments are published first, and an archive below,
      where earlier artifacts will be curated over time.
    </p>
  </header>

  <section class="index-section current-section" aria-labelledby="current-heading">
    <div class="section-head">
      <p class="section-kicker">Current developments</p>
      <h2 id="current-heading">Live chamber</h2>
      <p class="section-text">
        The current public face of the work. This chamber holds the active G60
        presentation and its immediate supporting artifacts.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card feature-card" href="/g60_console.php">
        <span class="card-label">Primary</span>
        <h3>Primed G60 Console</h3>
        <p>Console-first public chamber for the current G60 surface.</p>
      </a>

      <a class="index-card" href="/json/theorem_object.json">
        <span class="card-label">Object</span>
        <h3>Theorem Object</h3>
        <p>Structured theorem-facing object for the present release.</p>
      </a>

      <a class="index-card" href="/json/verify_report.json">
        <span class="card-label">Verification</span>
        <h3>Verify Report</h3>
        <p>Public verification artifact for current release confidence.</p>
      </a>

      <a class="index-card" href="/json/metadata.json">
        <span class="card-label">Metadata</span>
        <h3>Release Metadata</h3>
        <p>Metadata describing the active public artifact set.</p>
      </a>

      <a class="index-card" href="/json/matrix_M.json">
        <span class="card-label">Matrix</span>
        <h3>Matrix M</h3>
        <p>Public matrix artifact associated with the current chamber.</p>
      </a>

      <a class="index-card" href="/json/gram_Q.json">
        <span class="card-label">Lens</span>
        <h3>Gram Q</h3>
        <p>Lens-visible structural artifact for inspection and reference.</p>
      </a>

      <a class="index-card" href="/json/transport_cocycle.json">
        <span class="card-label">Transport</span>
        <h3>Transport Cocycle</h3>
        <p>Transport-facing artifact included in the current public release.</p>
      </a>
    </div>
  </section>

  <section class="index-section archive-section" aria-labelledby="archive-heading">
    <div class="section-head">
      <p class="section-kicker">Archive</p>
      <h2 id="archive-heading">Archive index</h2>
      <p class="section-text">
        Earlier artifacts are being reviewed and curated before public
        reintroduction. This section will become the public archive surface for
        selected historical consoles, witness pages, render experiments, and
        supporting notes.
      </p>
    </div>

    <div class="archive-placeholder">
      <p>Archive links are not yet published in this layer.</p>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
