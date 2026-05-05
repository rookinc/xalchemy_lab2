<?php
$page_title = 'Aletheos.ai — Accountable Intelligence Research';
$page_description = 'Aletheos.ai is a public research workshop exploring AI agent accountability, privacy-preserving fintech, human-technology trust, and Thalean Graph Theory.';
$page_css = ['assets/index.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="hero hero--observatory">
    <p class="eyebrow">Center of Recursive Inquiry</p>

    <div class="hero-grid">
      <div class="hero-copy">
        <h1 class="hero-title">Making intelligence accountable.</h1>
        <p class="hero-text">
          Aletheos is an open source research project conducted by the Center of Recursive Inquiry. We explore AI agent accountability,
          privacy-preserving financial technology, and the changing relationship
          between humans and intelligent systems.
        </p>
        <p class="hero-text hero-text--secondary">
          We approach these problems through Thalean Graph Theory: an experimental
          mathematical framework for studying relation, observation, structure,
          and traceable action.
        </p>

        <div class="hero-actions" aria-label="Primary actions">
          <a class="button button--primary" href="the_thalean_graph_at4val_60_6.php">Explore the research</a>
          <a class="button button--secondary" href="labs.php">Visit the labs</a>
        </div>
      </div>

      <aside class="hero-emblem" aria-label="Aletheos research themes">
        <div class="orbital-mark">
          <span class="orbital-mark__ring orbital-mark__ring--outer"></span>
          <span class="orbital-mark__ring orbital-mark__ring--middle"></span>
          <span class="orbital-mark__ring orbital-mark__ring--inner"></span>
          <span class="orbital-mark__point orbital-mark__point--one"></span>
          <span class="orbital-mark__point orbital-mark__point--two"></span>
          <span class="orbital-mark__point orbital-mark__point--three"></span>
        </div>
        <p class="emblem-caption">relation · observation · trace</p>
      </aside>
    </div>
  </section>

  <section class="index-section constructor-section">
    <a class="constructor-feature" href="/labs/constructor/lab.html" aria-label="Open the Thalean constructor lab tool">
      <div class="constructor-feature__copy">
        <p class="section-kicker">Lab tool</p>
        <h2>Explore the constructor.</h2>
        <p class="section-text">
          The constructor is an interactive lab surface for exploring Thalean structure
          visually. It provides a place to rotate, compare, and inspect transport
          forms, layered symmetry, and finite geometric witnesses.
        </p>
        <span class="constructor-feature__cta">Open the interactive lab tool →</span>
      </div>

      <figure class="constructor-feature__media">
        <img
          src="assets/thalean-constructor-preview.png"
          alt="A luminous Thalean constructor render showing layered geometric transport structure on a dark grid."
          loading="lazy"
        >
      </figure>
    </a>
  </section>

  <section class="index-section mission-section">
    <div class="section-head">
      <p class="section-kicker">The problem</p>
      <h2>Powerful systems need visible reasoning.</h2>
      <p class="section-text">
        AI systems are moving from conversation into action. Financial systems are
        becoming more automated, encrypted, and privacy-preserving. Human decisions
        are increasingly mediated by tools that operate faster than traditional
        oversight can follow. Children are growing up inside this shift,
        learning from and alongside systems that previous generations never had
        to understand.
      </p>
    </div>

    <div class="principle-grid">
      <article class="principle-card">
        <span class="card-label">AI agents</span>
        <h3>Accountable action</h3>
        <p>How can autonomous and semi-autonomous systems leave inspectable traces of their decisions?</p>
      </article>

      <article class="principle-card">
        <span class="card-label">Fintech</span>
        <h3>Private but auditable</h3>
        <p>How can encrypted financial computation preserve privacy without losing responsibility?</p>
      </article>

      <article class="principle-card">
        <span class="card-label">Human systems</span>
        <h3>Human trust</h3>
        <p>How do people, families, and institutions stay grounded as intelligent tools reshape learning, work, identity, and childhood?</p>
      </article>
    </div>
  </section>

  <section class="index-section approach-section">
    <div class="section-head">
      <p class="section-kicker">The approach</p>
      <h2>Thalean Graph Theory is the research path.</h2>
      <p class="section-text">
        Aletheos studies accountability as a structural problem. Instead of treating
        actions as isolated events, we ask how actions move through networks of
        relation, constraint, observation, and evidence.
      </p>
    </div>

    <div class="card-grid">
      <a class="index-card feature-card" href="the_thalean_graph_at4val_60_6.php">
        <span class="card-label">Research</span>
        <h3>The Thalean Graph</h3>
        <p>The current public presentation of the 60-state graph object and its technical notes.</p>
      </a>

      <a class="index-card" href="labs.php">
        <span class="card-label">Workshop</span>
        <h3>Labs</h3>
        <p>Experimental viewers, witness lenses, and rendering stages for exploring the structure.</p>
      </a>

      <a class="index-card" href="audit.php">
        <span class="card-label">Records</span>
        <h3>Audit</h3>
        <p>Verification outputs and machine-readable records for the public artifact set.</p>
      </a>
    </div>
  </section>

</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
