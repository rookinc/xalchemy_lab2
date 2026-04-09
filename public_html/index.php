<?php
$page_title = 'CoRI';
$page_description = 'Public entry point for current G60 developments and selected archived artifacts.';
$page_css = ['assets/index.css'];
include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Current developments</p>
      <h2>Live chamber</h2>
      <p class="section-text">
        The current public face of the work. This chamber holds the active G60
        presentation and its immediate supporting artifacts.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card feature-card" href="g60_console.php">
        <span class="card-label">Primary</span>
        <h3>G60 Console</h3>
        <p>Console-first public chamber for the current G60 surface.</p>
      </a>
    </div>
  </section>

  <section class="index-section archive-section">
    <div class="section-head">
      <p class="section-kicker">Archive</p>
      <h2>Archive index</h2>
      <p class="section-text">
        Earlier artifacts are being reviewed and curated before public reintroduction.
        This section will become the public archive surface for selected historical
        consoles, witness pages, render experiments, and supporting notes.
      </p>
    </div>

    <div class="archive-placeholder">
      <p>Archive links are not yet published in this layer.</p>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
