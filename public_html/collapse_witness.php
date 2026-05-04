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

  <section class="index-section thalean-layer-stack">
    <div class="section-head">
      <p class="section-kicker">Thalean layer stack</p>
      <h2>Where this lens sits</h2>
      <p class="section-text">
        This renderer operates at the G15/G30 quotient-visible layer of the Thalean graph.
        It does not yet render the full G60 thalion directly.
      </p>
    </div>

    <div class="layer-stack-flow" aria-label="Thalean layer stack">
      <div class="layer-stack-card layer-stack-card--root">
        <span class="card-label">Full object</span>
        <h3>G60 thalion</h3>
        <p>AT4val[60,6], the full 60-state Thalean transport organism.</p>
      </div>

      <div class="layer-stack-arrow">→</div>

      <div class="layer-stack-card">
        <span class="card-label">Quotient</span>
        <h3>G15 transport state</h3>
        <p>The compressed row/sector register used by the live graph panel.</p>
      </div>

      <div class="layer-stack-arrow">→</div>

      <div class="layer-stack-card">
        <span class="card-label">Lift</span>
        <h3>G30 incidence response</h3>
        <p>The 30-column response computed from <code>Mᵀu</code>.</p>
      </div>

      <div class="layer-stack-arrow">→</div>

      <div class="layer-stack-card">
        <span class="card-label">Lens</span>
        <h3>Six-station witness</h3>
        <p>A quotient-visible collapse/rebound witness, rendered as a bubble analog.</p>
      </div>
    </div>

    <p class="layer-stack-note">
      In short: <strong>G15 is the readable shadow, G30 is the incidence response, and G60 is the full object casting the shadow.</strong>
    </p>
  </section>

  <section class="index-section renderer-priority-section">
    <div class="section-head renderer-head">
      <div>
        <p class="section-kicker">Renderer</p>
        <h2>G15 collapse/rebound witness</h2>
        <p class="section-text">
          One scalar disturbance evolves across the G15 transport graph, lifts through the 30-column incidence structure,
          and quotients into a six-station witness silhouette.
        </p>
      </div>
    </div>

    <div class="collapse-controls" aria-label="Collapse witness controls">
      <button id="cw-play" class="cw-button" type="button">Pause</button>
      <button id="cw-reset" class="cw-button" type="button">Reset</button>

      <div class="phase-stepper" aria-label="Overlay phase stepper">
        <button type="button" id="phase-prev" class="button-secondary">◀ Prev phase</button>
        <button type="button" id="phase-live" class="button-secondary">Resume live</button>
        <button type="button" id="phase-next" class="button-secondary">Next phase ▶</button>
        <span id="phase-step-indicator" class="phase-step-indicator">Live phase</span>
      </div>

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

      <fieldset class="cw-mode-toggle" aria-label="Witness render mode">
        <legend>Mode</legend>
        <label>
          <input type="radio" name="cw-mode" value="raw" id="cw-mode-raw">
          Raw G15
        </label>
        <label>
          <input type="radio" name="cw-mode" value="overlay" id="cw-mode-overlay" checked>
          Collapse overlay
        </label>
      </fieldset>

      <button id="cw-export-svg" class="cw-button" type="button">Export witness SVG</button>
      <button id="cw-copy-state" class="cw-button" type="button">Copy state JSON</button>
    </div>

    <div id="cw-status" class="cw-status">Loading collapse witness data…</div>

    <div class="collapse-grid collapse-grid--priority">
      <section class="collapse-panel">
        <h3>G15 transport graph</h3>
        <svg id="g15-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="G15 transport graph animation"></svg>
      </section>

      <section class="collapse-panel">
        <h3>30-column incidence response</h3>
        <svg id="incidence-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Thirty column incidence response"></svg>
      </section>

      <section class="collapse-panel collapse-panel--featured">
        <h3>Six-station witness</h3>
        <svg id="witness-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Six station collapse witness"></svg>
      </section>

      <section class="collapse-panel collapse-panel--bubble">
        <h3>Bubble analog</h3>
        <svg id="bubble-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Smooth bubble collapse analog"></svg>
      </section>
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
      <div class="cw-readout">
        <span class="cw-readout__label">View mode</span>
        <strong id="cw-mode-readout">collapse overlay</strong>
      </div>
    </div>

    <details class="cw-details">
      <summary>How to read this lens</summary>
      <div class="cw-detail-grid">
        <div class="cw-howto">
          <h3>Panel map</h3>
          <p>
            The left panel is the 15-row transport graph. The middle panel is the lifted 30-column incidence response
            computed from <code>Mᵀu</code>. The third panel is the six-station witness quotient:
            <strong>A</strong> crown, <strong>D/E</strong> shoulders, <strong>C/B</strong> throat, and <strong>F</strong> rebound pole. The fourth panel renders those stations as a smooth bubble/cavity analog.
          </p>
        </div>

        <div class="cw-morphology-note">
          <h3>Phase morphology overlay</h3>
          <p>
            The live G15 state always drives the color and station values. In raw mode, the witness follows only the live quotient.
            In overlay mode, a lightweight phase morphology shapes the silhouette through the intended collapse grammar:
            latent round, defect selection, cup fold, throat bridge, rebound jet, and relaxation.
          </p>
        </div>
      </div>
    </details>

    <details class="cw-details cw-details--provenance">
      <summary>Current state provenance</summary>
      <div class="cw-provenance">
        <pre><code id="cw-state-json">Waiting for renderer…</code></pre>
      </div>
    </details>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Collapse grammar</p>
      <h2>Phase legend</h2>
      <p class="section-text">
        The witness silhouette is shaped by a six-phase visual grammar. The graph state remains live;
        this table documents the visual interpretation layer.
      </p>
    </div>

    <div class="phase-legend">
      <article class="phase-card">
        <span class="card-label">01</span>
        <h3>Latent round</h3>
        <p>Near-symmetric cavity. The witness is broad, balanced, and minimally committed to an axis.</p>
      </article>

      <article class="phase-card">
        <span class="card-label">02</span>
        <h3>Defect selection</h3>
        <p>A distinguished crown/defect appears. The symmetry breaks and a preferred axis begins to form.</p>
      </article>

      <article class="phase-card">
        <span class="card-label">03</span>
        <h3>Cup fold</h3>
        <p>The shoulders lift and the lower stations begin moving inward. The boundary starts folding into itself.</p>
      </article>

      <article class="phase-card">
        <span class="card-label">04</span>
        <h3>Throat bridge</h3>
        <p>The C/B stations pinch toward one another. The witness reads as a temporary transport throat.</p>
      </article>

      <article class="phase-card">
        <span class="card-label">05</span>
        <h3>Rebound jet</h3>
        <p>The F station extends along the axis. The collapse returns energy as a rebound/jet-like feature.</p>
      </article>

      <article class="phase-card">
        <span class="card-label">06</span>
        <h3>Relaxation</h3>
        <p>The witness returns toward a rounded cavity while the live graph state continues to damp and propagate.</p>
      </article>
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
