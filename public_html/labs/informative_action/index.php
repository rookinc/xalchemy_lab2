<?php
$page_title = 'Informative Action — Aletheos.ai';
$page_description = 'An interactive visual lab for seeing how action moves through a simple system and leaves an inspectable trace.';
$page_css = ['/assets/index.css', '/assets/collapse_witness.css'];

include __DIR__ . '/../../includes/head.php';
include __DIR__ . '/../../includes/site_header.php';
?>

<main class="site-shell collapse-tool-page">
  <section class="tool-header">
    <div>
      <p class="eyebrow">Quotient Lab</p>
      <h1>Informative Action</h1>
      <p>
        Watch how action moves through a simple visual system and leaves a trace
        that can be inspected.
      </p>
    </div>

    <div class="tool-header__actions">
      <a class="button button--secondary" href="/labs.php">Back to Labs</a>
      <a class="button button--secondary" href="/the_thalean_graph_at4val_60_6.php">Research Page</a>
    </div>
  </section>

  <section class="tool-panel controls-panel" aria-label="Informative action controls">
    <div class="tool-panel__head">
      <div>
        <p class="section-kicker">Controls</p>
        <h2>Explore the motion</h2>
      </div>
      <div id="cw-status" class="cw-status">Loading visual model…</div>
    </div>

    <div class="collapse-controls">
      <button id="cw-play" class="cw-button" type="button">Pause</button>
      <button id="cw-reset" class="cw-button" type="button">Reset</button>

      <div class="phase-stepper" aria-label="Phase stepper">
        <button type="button" id="phase-prev" class="button-secondary">◀ Previous step</button>
        <button type="button" id="phase-live" class="button-secondary">Resume live</button>
        <button type="button" id="phase-next" class="button-secondary">Next step ▶</button>
      </div>

      <label class="cw-control">
        Speed
        <input id="cw-speed" type="range" min="0.1" max="3" step="0.1" value="1">
      </label>

      <label class="cw-control">
        Push
        <input id="cw-force" type="range" min="0" max="7" step="0.1" value="3.5">
      </label>

      <label class="cw-control">
        Smoothing
        <input id="cw-damping" type="range" min="0" max="0.2" step="0.005" value="0.045">
      </label>

      <fieldset class="cw-mode-toggle" aria-label="View mode">
        <legend>View</legend>
        <label>
          <input type="radio" name="cw-mode" value="raw" id="cw-mode-raw">
          Structure only
        </label>
        <label>
          <input type="radio" name="cw-mode" value="overlay" id="cw-mode-overlay" checked>
          Action overlay
        </label>
      </fieldset>

      <button id="cw-export-svg" class="cw-button" type="button">Export SVG</button>
      <button id="cw-copy-state" class="cw-button" type="button">Copy JSON</button>
    </div>
  </section>

  <section class="collapse-grid collapse-grid--tool" aria-label="Informative action visual panels">
    <section class="collapse-panel">
      <div class="collapse-panel__head">
        <h2>Starting structure</h2>
        <span>pattern</span>
      </div>
      <svg id="g15-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Starting structure animation"></svg>
    </section>

    <section class="collapse-panel">
      <div class="collapse-panel__head">
        <h2>Response pattern</h2>
        <span>effect</span>
      </div>
      <svg id="incidence-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Response pattern"></svg>
    </section>

    <section class="collapse-panel collapse-panel--featured">
      <div class="collapse-panel__head">
        <h2>Visible trace</h2>
        <span>witness</span>
      </div>
      <svg id="witness-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Visible action trace"></svg>
    </section>

    <section class="collapse-panel collapse-panel--bubble">
      <div class="collapse-panel__head">
        <h2>Bubble view</h2>
        <span>analogy</span>
      </div>
      <svg id="bubble-panel" class="collapse-svg" viewBox="0 0 420 320" role="img" aria-label="Smooth bubble analogy"></svg>
    </section>
  </section>

  <section class="cw-readout-grid" aria-label="Current visual readout">
    <div class="cw-readout">
      <span class="cw-readout__label">Step</span>
      <strong id="cw-phase">loading</strong>
    </div>
    <div class="cw-readout">
      <span class="cw-readout__label">Time</span>
      <strong id="cw-time">0.00</strong>
    </div>
    <div class="cw-readout">
      <span class="cw-readout__label">Peak motion</span>
      <strong id="cw-maxu">0.000</strong>
    </div>
    <div class="cw-readout">
      <span class="cw-readout__label">Stations</span>
      <strong id="cw-stations">A D E C B F</strong>
    </div>
    <div class="cw-readout">
      <span class="cw-readout__label">View mode</span>
      <strong id="cw-mode-readout">action overlay</strong>
    </div>
  </section>

  <section class="tool-panel tool-notes">
    <details class="cw-details" open>
      <summary>What am I looking at?</summary>
      <div class="cw-detail-grid">
        <div class="cw-howto">
          <h3>Plain-language map</h3>
          <p>
            This lab shows a small system as it changes. One panel shows the
            starting structure, another shows how the structure responds, and a
            third compresses that motion into a visible trace. The bubble view is
            an analogy that makes the same change easier to see.
          </p>
        </div>

        <div class="cw-morphology-note">
          <h3>Status</h3>
          <p>
            This is an exploratory inspection tool. It is not a final proof and
            it does not claim that the picture is a physical object. It is a way
            to see how action can leave structure behind.
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

<?php include __DIR__ . '/../../includes/site_footer.php'; ?>
<script src="/assets/collapse_witness.js?v=20260504-functional"></script>
</body>
</html>
