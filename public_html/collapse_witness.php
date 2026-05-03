<?php
$page_title = 'Collapse Witness Lens — Aletheos.ai';
$page_description = 'Exploratory G15 collapse/rebound witness lens over the canonical Thalean transport data.';
$page_css = ['assets/index.css', 'assets/collapse_witness.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="hero">
    <p class="eyebrow">Experimental rendering stage</p>
    <h1 class="hero-title">Collapse Witness Lens</h1>
    <p class="hero-text">
      A six-station collapse/rebound visual lens over the canonical G15 transport data.
      This page is exploratory: it does not change the theorem object and does not claim a physical derivation.
    </p>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Renderer</p>
      <h2>G15 collapse/rebound witness</h2>
      <p class="section-text">
        One scalar disturbance is evolved across the G15 transport graph, lifted through the 30-column incidence structure,
        and quotiented into a six-station witness silhouette.
      </p>
    </div>

    <div class="collapse-controls" aria-label="Collapse witness controls">
      <button id="cw-play" class="cw-button" type="button">Pause</button>
      <button id="cw-reset" class="cw-button" type="button">Reset</button>

      <label class="cw-control">
        Speed
        <input id="cw-speed" type="range" min="0.1" max="3" step="0.1" value="1">
      </label>

      <label class="cw-control">
        Forcing
        <input id="cw-force" type="range" min="0" max="7" step="0.1" value="3.5">
      </label>

      <label class="cw-control">
        Damping
        <input id="cw-damping" type="range" min="0" max="0.2" step="0.005" value="0.045">
      </label>
    </div>

    <div class="cw-howto">
      <h3>How to read this lens</h3>
      <p>
        The left panel is the 15-row transport graph. The middle panel is the lifted 30-column incidence response
        computed from <code>Mᵀu</code>. The right panel is the six-station witness quotient:
        <strong>A</strong> crown, <strong>D/E</strong> shoulders, <strong>C/B</strong> throat, and <strong>F</strong> rebound pole.
      </p>
    </div>

    <div class="cw-readout-grid">
      <div class="cw-readout">
        <span class="cw-readout__label">Phase</span>
        <strong id="cw-phase">loading</strong>
      </div>
      <div class="cw-readout">
        <span class="cw-readout__label">Time</span>
        <strong id="cw-time">0.00</strong>
      </div>
      <div class="cw-readout">
        <span class="cw-readout__label">Max |u|</span>
        <strong id="cw-maxu">0.000</strong>
      </div>
      <div class="cw-readout">
        <span class="cw-readout__label">Stations</span>
        <strong id="cw-stations">A D E C B F</strong>
      </div>
    </div>

    <div id="cw-status" class="cw-status">Loading collapse witness data…</div>

    <div class="collapse-grid">
      <section class="collapse-panel">
        <h3>G15 transport graph</h3>
        <svg id="g15-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="G15 transport graph animation"></svg>
      </section>

      <section class="collapse-panel">
        <h3>30-column incidence response</h3>
        <svg id="incidence-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Thirty column incidence response"></svg>
      </section>

      <section class="collapse-panel">
        <h3>Six-station witness</h3>
        <svg id="witness-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Six station collapse witness"></svg>
      </section>
    </div>
  </section>

  <section class="index-section archive-section">
    <div class="section-head">
      <p class="section-kicker">Data contracts</p>
      <h2>Inputs</h2>
    </div>

    <div class="card-grid">
      <a class="index-card" href="json/theorem_object.json">
        <span class="card-label">Canonical</span>
        <h3>Theorem Object</h3>
        <p>G15 transport theorem data: M, Q, distance matrix, and Petersen edge indexing.</p>
      </a>

      <a class="index-card" href="json/bubble_witness_lens.json">
        <span class="card-label">Lens</span>
        <h3>Bubble Witness Lens</h3>
        <p>Six-station quotient labels and anti-drift rules.</p>
      </a>

      <a class="index-card" href="json/collapse_params.json">
        <span class="card-label">Params</span>
        <h3>Collapse Parameters</h3>
        <p>Exploratory graph-wave defaults for the collapse/rebound animation.</p>
      </a>
    </div>
  </section>
</main>

<script src="assets/collapse_witness.js"></script>
<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
