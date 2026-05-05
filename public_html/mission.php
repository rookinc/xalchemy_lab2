<?php
$page_title = 'Mission — Aletheos.ai';
$page_description = 'Aletheos explores how artificial intelligence can be integrated into human life without losing what makes us human.';
$page_css = ['assets/index.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="hero">
    <p class="eyebrow">Mission</p>

    <div class="hero-grid">
      <div class="hero-copy">
        <h1 class="hero-title">Making intelligence more human.</h1>

        <p class="hero-text">
          The mission of Aletheos is to explore how artificial intelligence can
          be integrated into human life without losing what makes us human.
        </p>

        <p class="hero-text hero-text--secondary">
          This is not only a software problem. It is a human problem. AI is
          changing how people think, learn, work, create, remember, decide, and
          relate to one another. As these systems become more capable, we need
          better ways to understand the relationship forming between human beings
          and intelligent machines.
        </p>
      </div>

      <aside class="hero-emblem" aria-label="Aletheos mission themes">
        <div class="orbital-mark">
          <span class="orbital-mark__ring orbital-mark__ring--outer"></span>
          <span class="orbital-mark__ring orbital-mark__ring--middle"></span>
          <span class="orbital-mark__ring orbital-mark__ring--inner"></span>
          <span class="orbital-mark__point orbital-mark__point--one"></span>
          <span class="orbital-mark__point orbital-mark__point--two"></span>
          <span class="orbital-mark__point orbital-mark__point--three"></span>
        </div>
        <p class="emblem-caption">human · machine · meaning</p>
      </aside>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">The question</p>
      <h2>How do we grow with AI without becoming less human?</h2>
      <p class="section-text">
        The goal is not to resist the future or blindly accelerate into it. The
        goal is to help build a future where intelligence becomes more powerful
        without making human life less human.
      </p>
    </div>

    <div class="principle-grid">
      <article class="principle-card">
        <span class="card-label">Artificial Intelligence</span>
        <h3>What is AI becoming?</h3>
        <p>
          We need to understand what these systems can do, how they influence
          the world, and how their actions can remain inspectable.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Human Consciousness</span>
        <h3>What makes us human?</h3>
        <p>
          We need to better understand agency, memory, trust, creativity,
          responsibility, meaning, and the lived experience of being human.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Information Exchange</span>
        <h3>What happens between us?</h3>
        <p>
          We need to study what happens when humans and AI exchange information,
          influence each other, and begin to shape shared decisions.
        </p>
      </article>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Invitation</p>
      <h2>This work is open to careful readers, builders, and collaborators.</h2>
      <p class="section-text">
        Aletheos is still forming. If these questions matter to you — as a
        researcher, builder, parent, educator, artist, founder, or citizen — you
        are invited to follow the work, question it, and help shape the
        conversation.
      </p>
      <div class="hero-actions">
        <a class="button button--primary" href="/about_cori.php">Learn about CoRI</a>
      </div>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
