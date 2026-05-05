<?php
$page_title = 'Labs — Aletheos.ai';
$page_description = 'Aletheos Labs contains experimental viewers, witness lenses, and exploratory renderers for making Thalean Graph Theory easier to inspect.';
$page_css = ['assets/index.css', 'assets/labs_page.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell labs-page">
  <section class="hero labs-hero">
    <p class="eyebrow">Labs</p>

    <div class="hero-grid">
      <div class="hero-copy">
        <h1 class="hero-title">Explore the ideas visually.</h1>
        <p class="hero-text">
          Aletheos Labs turns difficult ideas into interactive experiments. These
          tools are built for seeing patterns, movement, structure, and change —
          not just reading about them.
        </p>
        <p class="hero-text hero-text--secondary">
          You do not need a technical background to begin. The goal is to make
          complex systems easier to inspect, question, and understand one layer
          at a time.
        </p>
        <div class="hero-actions lab-action-grid" aria-label="Lab actions">
          <a class="lab-action-card lab-action-card--primary" href="/labs/informative_action/">
            <span class="card-label">Quotient lab</span>
            <strong>Informative Action</strong>
            <span>
              Watch how action moves through a simple visual system and leaves a
              trace that can be inspected.
            </span>
          </a>

          <a class="lab-action-card" href="/labs/constructor/lab.html">
            <span class="card-label">Constructor</span>
            <strong>Wave Form Constructor</strong>
            <span>
              Explore a live visual model of the Thalean graph as it grows,
              shifts, and forms structure in the browser.
            </span>
          </a>
        </div>
      </div>

      <aside class="hero-emblem" aria-label="Aletheos lab themes">
        <div class="orbital-mark">
          <span class="orbital-mark__ring orbital-mark__ring--outer"></span>
          <span class="orbital-mark__ring orbital-mark__ring--middle"></span>
          <span class="orbital-mark__ring orbital-mark__ring--inner"></span>
          <span class="orbital-mark__point orbital-mark__point--one"></span>
          <span class="orbital-mark__point orbital-mark__point--two"></span>
          <span class="orbital-mark__point orbital-mark__point--three"></span>
        </div>
        <p class="emblem-caption">model · render · inspect</p>
      </aside>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">What we are doing</p>
      <h2>The lab turns abstract accountability into visible structure.</h2>
      <p class="section-text">
        Aletheos is concerned with questions that many people can feel before
        they can formally describe: how do intelligent systems act, how do we
        know what happened, how do we preserve privacy without losing
        responsibility, and how do humans stay grounded as technology becomes
        harder to understand?
      </p>
    </div>

    <div class="principle-grid">
      <article class="principle-card">
        <span class="card-label">Trace</span>
        <h3>What happened?</h3>
        <p>
          We are exploring ways to represent actions as structured paths rather
          than isolated events, so that behavior can be inspected afterward.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Relation</span>
        <h3>What was connected?</h3>
        <p>
          Many accountability problems are not about one decision. They are about
          how people, tools, data, constraints, and institutions interact.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Witness</span>
        <h3>What remains visible?</h3>
        <p>
          The lab studies how evidence, structure, and observation can remain
          inspectable without pretending every system is simple.
        </p>
      </article>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Current lab routes</p>
      <h2>Experimental surfaces for the Aletheos graph stack.</h2>
      <p class="section-text">
        These pages are development viewers and public renderers. They help us
        inspect transport structure, witness behavior, and visual analogies
        without changing the canonical theorem object.
      </p>
    </div>

    <div class="card-grid lab-route-grid">
      <a class="index-card feature-card" href="/labs/informative_action/">
        <span class="card-label">Active lab</span>
        <h3>Collapse Witness Lens</h3>
        <p>
          An experimental visual lens for exploring collapse, rebound, bubble
          analogy, and witness behavior over the current transport data.
        </p>
      </a>

      <a class="index-card" href="the_thalean_graph_at4val_60_6.php">
        <span class="card-label">Public research</span>
        <h3>Thalean Graph Page</h3>
        <p>
          The theorem-facing public surface for the canonical artifact,
          verification records, and companion papers.
        </p>
      </a>

      <a class="index-card" href="/labs/constructor/lab.html">
        <span class="card-label">Development</span>
        <h3>Constructor Lab</h3>
        <p>
          A browser-side D4 / Thalean constructor viewer for inspecting the
          active graph construction surface without a Python runtime.
        </p>
      </a>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Why this matters</p>
      <h2>The goal is not prettier diagrams. The goal is better inspection.</h2>
      <p class="section-text">
        Modern systems increasingly make decisions through layers people cannot
        easily see. Aletheos Labs is where we test whether mathematical
        structure, visual rendering, and public audit surfaces can help ordinary
        users, researchers, builders, and institutions ask better questions.
      </p>
    </div>

    <div class="principle-grid">
      <article class="principle-card">
        <span class="card-label">AI accountability</span>
        <h3>Agents need traces.</h3>
        <p>
          As AI systems move from conversation into action, we need ways to
          inspect what they did, which constraints shaped them, and where
          responsibility belongs.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Private computation</span>
        <h3>Privacy needs structure.</h3>
        <p>
          Privacy-preserving financial technology should protect sensitive
          information without making accountability impossible.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Human trust</span>
        <h3>People need orientation.</h3>
        <p>
          Families, children, workers, builders, and institutions are adapting
          to intelligent tools faster than our old mental models can keep up.
        </p>
      </article>
    </div>
  </section>


  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Current lens</p>
      <h2>Where the Collapse Witness Lens sits.</h2>
      <p class="section-text">
        The Collapse Witness Lens operates at the G15/G30 quotient-visible layer
        of the Thalean graph. It does not render the full G60 thalion directly.
        Instead, it uses G15 as the readable shadow, G30 as the incidence response,
        and a six-station witness as an exploratory visual surface.
      </p>
    </div>

    <div class="principle-grid">
      <article class="principle-card">
        <span class="card-label">Full object</span>
        <h3>G60 thalion</h3>
        <p>AT4val[60,6], the full 60-state Thalean transport organism.</p>
      </article>

      <article class="principle-card">
        <span class="card-label">Quotient</span>
        <h3>G15 / G30</h3>
        <p>The compressed transport state and 30-column incidence response used by the renderer.</p>
      </article>

      <article class="principle-card">
        <span class="card-label">Lens</span>
        <h3>Six-station witness</h3>
        <p>A quotient-visible collapse/rebound witness rendered as a bubble analog.</p>
      </article>
    </div>
  </section>

  <section class="index-section scope-section">
    <div class="section-head">
      <p class="section-kicker">Lab status</p>
      <h2>Experimental, inspectable, unfinished.</h2>
      <p class="section-text">
        Lab pages are not final products and do not replace the canonical
        research artifacts. They are working surfaces: useful, provisional, and
        designed to make the research easier to question.
      </p>
    </div>
  </section>

</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
