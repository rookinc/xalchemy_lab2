<?php
$page_title = 'About CoRI — Aletheos.ai';
$page_description = 'CoRI is an independent research group exploring AI, human meaning, accountability, and the exchange of information between people and intelligent systems.';
$page_css = ['assets/index.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell">
  <section class="hero">
    <p class="eyebrow">About CoRI</p>

    <div class="hero-grid">
      <div class="hero-copy">
        <h1 class="hero-title">Err. Doubt. Endure. Discover.</h1>

        <p class="hero-text">
          We are entering a period where artificial intelligence will change how
          people learn, work, create, govern, remember, decide, and understand
          themselves.
        </p>

        <p class="hero-text hero-text--secondary">
          That change is happening faster than our institutions, laws, schools,
          families, and public language can adapt.
        </p>

        <p class="hero-text hero-text--secondary">
          The Center of Recursive Inquiry was created to examine the benefits
          and harms of this emerging relationship.
        </p>
      </div>

      <aside class="hero-emblem" aria-label="CoRI themes">
        <div class="orbital-mark">
          <span class="orbital-mark__ring orbital-mark__ring--outer"></span>
          <span class="orbital-mark__ring orbital-mark__ring--middle"></span>
          <span class="orbital-mark__ring orbital-mark__ring--inner"></span>
          <span class="orbital-mark__point orbital-mark__point--one"></span>
          <span class="orbital-mark__point orbital-mark__point--two"></span>
          <span class="orbital-mark__point orbital-mark__point--three"></span>
        </div>
        <p class="emblem-caption">err · doubt · endure · discover</p>
      </aside>
    </div>
  </section>



  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Contact</p>
      <h2>Reach the project.</h2>
      <p class="section-text">
        For questions, collaboration, media, or research correspondence:
      </p>
      <p class="section-text">
        <a href="mailto:scott@rook.ca">scott@rook.ca</a>
      </p>
    </div>
  </section>


  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">About the Founder</p>
      <h2>Scott Allen Cave</h2>
      <p class="section-text">
        Scott Allen Cave is an independent researcher, builder, and business
        owner based in Abbotsford, British Columbia.
      </p>
      <p class="section-text">
        He is the owner of Rook Services Inc., a mechatronics company focused on
        practical engineering, automation, precision tooling, and technical
        problem-solving.
      </p>
      <p class="section-text">
        Through Rook, Scott has developed TrimSetter, a mechatronics and
        manufacturing project for improving how parachute suspension lines are
        measured, marked, and prepared. Rook has also worked on projects for
        NASA / JPL, the University of Washington Applied Physics Department, and
        SONY Cinematics.
      </p>
      <p class="section-text">
        His broader work spans artificial intelligence, human meaning, visual
        reasoning, accountability, and the question of how society can adapt to
        powerful new tools without losing trust, agency, or humanity.
      </p>
      <p class="section-text">
        In 2025, Scott was among the top 0.1% of ChatGPT users, with more than
        197,000 messages exchanged. That unusual depth of interaction helped
        shape his focus on how humans and AI learn from, influence, and depend
        on each other.
      </p>
      <p class="section-text">
        He founded CoRI and Aletheos.ai to create a public place for this work to
        develop carefully.
      </p>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Public writing</p>
      <h2>Free Galileo</h2>
      <p class="section-text">
        Free Galileo is Scott Cave's Substack for essays, working notes, and
        public reflections on artificial intelligence, human meaning, technology,
        and the ideas behind Aletheos and CoRI.
      </p>
      <p class="section-text">
        Read it at <a href="https://scottcave.substack.com">scottcave.substack.com</a>.
      </p>
    </div>
  </section>

</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
