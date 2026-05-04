<?php
$page_title = 'Collapse Witness Lens — Aletheos.ai';
$page_description = 'Functional collapse/rebound witness renderer over the canonical Thalean transport data.';
$page_css = ['assets/index.css', 'assets/collapse_witness.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell collapse-tool-page">
  <section class="tool-header">
    <div>
      <p class="eyebrow">Lab tool</p>
      <h1>Collapse Witness Lens</h1>
      <p>
        A functional six-station collapse/rebound renderer over canonical G15 transport data.
      </p>
    </div>

    <div class="tool-header__actions">
      <a class="button button--secondary" href="labs.php">Back to Labs</a>
      <a class="button button--secondary" href="the_thalean_graph_at4val_60_6.php">Research Page</a>
    </div>
  </section>

  <section class="tool-panel controls-panel" aria-label="Collapse witness controls">
    <div class="tool-panel__head">
      <div>
        <p class="section-kicker">Controls</p>
        <h2>Renderer state</h2>
      </div>
      <div id="cw-status" class="cw-status">Loading collapse witness data…</div>
    </div>

    <div class="collapse-controls">
      <button id="cw-play" class="cw-button" type="button">Pause</button>
      <button id="cw-reset" class="cw-button" type="button">Reset</button>

      <div class="phase-stepper" aria-label="Overlay phase stepper">
        <button type="button" id="phase-prev" class="button-secondary">◀ Prev phase</button>
        <button type="button" id="phase-live" class="button-secondary">Resume live</button>
        <button type="button" id="phase-next" class="button-secondary">Next phase ▶</button>
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

      <button id="cw-export-svg" class="cw-button" type="button">Export SVG</button>
      <button id="cw-copy-state" class="cw-button" type="button">Copy JSON</button>
    </div>
  </section>

  <section class="collapse-grid collapse-grid--tool" aria-label="Collapse witness renderer panels">
    <section class="collapse-panel">
      <div class="collapse-panel__head">
        <h2>G15 transport graph</h2>
        <span>live state</span>
      </div>
      <svg id="g15-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="G15 transport graph animation"></svg>
    </section>

    <section class="collapse-panel">
      <div class="collapse-panel__head">
        <h2>30-column response</h2>
        <span>Mᵀu</span>
      </div>
      <svg id="incidence-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Thirty column incidence response"></svg>
    </section>

    <section class="collapse-panel collapse-panel--featured">
      <div class="collapse-panel__head">
        <h2>Six-station witness</h2>
        <span>A D E C B F</span>
      </div>
      <svg id="witness-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Six station collapse witness"></svg>
    </section>

    <section class="collapse-panel collapse-panel--bubble">
      <div class="collapse-panel__head">
        <h2>Bubble analog</h2>
        <span>visual lens</span>
      </div>
      <svg id="bubble-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Smooth bubble collapse analog"></svg>
    </section>
  </section>

  <section class="cw-readout-grid" aria-label="Current renderer readout">
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
  </section>

  <section class="tool-panel tool-notes">
    <details class="cw-details">
      <summary>What am I looking at?</summary>
      <div class="cw-detail-grid">
        <div class="cw-howto">
          <h3>Panel map</h3>
          <p>
            The first panel shows the 15-row transport graph. The second shows the lifted
            30-column incidence response computed from <code>Mᵀu</code>. The third compresses
            the state into a six-station witness. The fourth renders that witness as a smooth
            bubble/cavity analogy.
          </p>
        </div>

        <div class="cw-morphology-note">
          <h3>Status</h3>
          <p>
            This is an exploratory visual lens. It does not modify the theorem object and does
            not claim a physical derivation. It is a functional inspection surface for studying
            transport behavior.
          </p>
        </div>
      </div>
    </details>

    <details class="cw-details cw-details--provenance">
      <summary>Current state JSON</summary>
      <div class="cw-provenance">
        <pre><code id="cw-state-json">Waiting for renderer…</code></pre>
      </div>
    </details>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
<script src="assets/collapse_witness.js?v=20260504-functional"></script>
</body>
</html>
