<?php
$page_title = 'Research — The Thalean Graph';
$page_description = 'Aletheos research page for the Thalean Graph AT4val[60,6], companion papers, canonical artifacts, and public research context.';
$page_css = ['assets/index.css', 'assets/research_page.css'];

include __DIR__ . '/includes/head.php';
include __DIR__ . '/includes/site_header.php';
?>

<main class="site-shell research-page">
  <section class="hero research-hero">
    <p class="eyebrow">Research</p>

    <div class="hero-grid">
      <div class="hero-copy">
        <h1 class="hero-title">The Thalean Graph.</h1>

        <p class="hero-text">
          This project started with a conversation with AI.
        </p>

        <p class="hero-text hero-text--secondary">
          At first, the question was not about graph theory. It was about time,
          memory, consciousness, and how difficult ideas can be explored without
          pretending they are already proven.
        </p>

        <p class="hero-text hero-text--secondary">
          Those questions led somewhere unexpected: toward a highly specific mathematical
          object. It is a graph, a collection of vertices and edges, that appears useful
          as a shared test object for ideas about spacetime, quantum structure,
          information, and intelligent systems.
        </p>

        <p class="hero-text hero-text--secondary">
          We have named the form <strong>The Thalean Graph</strong> after Thales of
          Miletus, a pre-Socratic philosopher associated with looking for order beneath
          appearances. The name points to the spirit of the work: begin with wonder and
          possibility, then ask what holds true.
        </p>

        <p class="hero-text hero-text--secondary">
          The form emerged from the research and has been mapped to the previously
          underived graph catalogued by the House of Graphs as Graph52002, and identified
          in the GraphSym census as AT4val[60,6].
        </p>

        <div class="hero-actions" aria-label="Research actions">
          <a class="button button--primary" href="#papers">Read the papers</a>
          <a class="button button--secondary" href="#artifacts">Browse artifacts</a>
        </div>
      </div>

      <aside class="hero-emblem" aria-label="Thalean research themes">
        <div class="orbital-mark">
          <span class="orbital-mark__ring orbital-mark__ring--outer"></span>
          <span class="orbital-mark__ring orbital-mark__ring--middle"></span>
          <span class="orbital-mark__ring orbital-mark__ring--inner"></span>
          <span class="orbital-mark__point orbital-mark__point--one"></span>
          <span class="orbital-mark__point orbital-mark__point--two"></span>
          <span class="orbital-mark__point orbital-mark__point--three"></span>
        </div>
        <p class="emblem-caption">G60 · G30 · G15</p>
      </aside>
    </div>
  </section>

  <section id="overview" class="index-section research-overview">
    <div class="section-head">
      <p class="section-kicker">Overview</p>
      <h2>What the graph discovered.</h2>
      <p class="section-text">
        The central discovery is that a finite transport construction on the flag
        structure of the combinatorial dodecahedron produces a layered object:
        a 60-state graph, a 30-state incidence response, and a 15-state quotient
        where the structure becomes legible.
      </p>
      <p class="section-text section-text--spaced">
        In that quotient-visible layer, the sector-edge incidence matrix
        <strong>M</strong> satisfies the exact relation
        <strong>Q = MMᵀ = A³ + 2A² + 2I</strong>. This gives the project a
        concrete audit point: the graph is not only visually suggestive, but
        algebraically constrained.
      </p>
    </div>

    <div class="prose-grid">
      <article class="principle-card">
        <span class="card-label">Discovery</span>
        <h3>Relation has structure</h3>
        <p>
          The graph gives a finite way to study how local transport, incidence,
          overlap, and observation can organize into a coherent object.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Witness</span>
        <h3>The object leaves traces</h3>
        <p>
          Its matrix identities, quotient layers, and verifier artifacts make the
          structure inspectable instead of merely asserted.
        </p>
      </article>

      <article class="principle-card">
        <span class="card-label">Aletheos</span>
        <h3>A path toward accountability</h3>
        <p>
          The long-term question is whether structures like this can help model
          traceable action in AI systems, privacy-preserving computation, and
          human-technology trust.
        </p>
      </article>
    </div>
  </section>

  <section class="index-section">
    <div class="section-head">
      <p class="section-kicker">Key relation</p>
      <h2>The current theorem-facing identity.</h2>
      <p class="section-text">
        The central finite witness uses a 15 × 30 sector-edge incidence matrix
        <strong>M</strong>. The associated quadratic form satisfies the exact
        identity <strong>Q = MMᵀ = A³ + 2A² + 2I</strong> on the relevant
        overlap graph. This page does not attempt to reproduce the proof inline;
        it points to the papers and artifacts where the structure can be
        inspected directly.
      </p>
    </div>

    <div class="card-grid">
      <article class="index-card feature-card">
        <span class="card-label">Matrix</span>
        <h3>Q = MMᵀ</h3>
        <p>
          The witness begins with a finite incidence matrix and its Gram-style
          quadratic shadow.
        </p>
      </article>

      <article class="index-card">
        <span class="card-label">Graph</span>
        <h3>A³ + 2A² + 2I</h3>
        <p>
          The same object is expressed through the adjacency structure of the
          overlap graph.
        </p>
      </article>

      <article class="index-card">
        <span class="card-label">Inspection</span>
        <h3>Public artifacts</h3>
        <p>
          JSON records and checker scripts remain available for readers who want
          to inspect the data directly.
        </p>
      </article>
    </div>
  </section>

  <section id="papers" class="index-section papers-section">
    <div class="section-head">
      <p class="section-kicker">Companion papers</p>
      <h2>Four documents around the research surface.</h2>
      <p class="section-text">
        These documents form the current paper trail around the Thalean Graph
        work. The first papers develop the quotient-core construction and chamber
        grammar. The witness note gathers the finite object into a unified
        theorem-facing surface. The CMB note is a separate exploratory benchmark
        program inspired by the broader template reservoir.
      </p>
    </div>

    <div class="card-grid paper-grid">
      <a class="index-card feature-card" href="https://zenodo.org/records/19043356" target="_blank" rel="noopener">
        <span class="card-label">March 2026</span>
        <h3>Dodecahedral Transport</h3>
        <p>
          Sector geometry on L(Petersen) and the identity
          MMᵀ = A³ + 2A² + 2I.
        </p>
        <p class="doi-line">DOI: 10.5281/zenodo.19043356</p>
      </a>

      <a class="index-card" href="https://zenodo.org/records/19520206" target="_blank" rel="noopener">
        <span class="card-label">April 2026</span>
        <h3>Chamber Grammar</h3>
        <p>
          The internal chamber grammar of the Thalean sector matrix.
        </p>
        <p class="doi-line">DOI: 10.5281/zenodo.19520206</p>
      </a>

      <a class="index-card" href="https://zenodo.org/records/19542052" target="_blank" rel="noopener">
        <span class="card-label">Witness note</span>
        <h3>Thalean Witness</h3>
        <p>
          A unified finite witness surface for the current theorem-facing object.
        </p>
        <p class="doi-line">DOI: 10.5281/zenodo.19542052</p>
      </a>

      <a class="index-card" href="https://doi.org/10.5281/zenodo.19561286" target="_blank" rel="noopener">
        <span class="card-label">CMB note</span>
        <h3>Structured Benchmark</h3>
        <p>
          An exploratory mixed structured template for a TE-dominated middle-band
          CMB benchmark.
        </p>
        <p class="doi-line">DOI: 10.5281/zenodo.19561286</p>
      </a>
    </div>
  </section>

  <section id="artifacts" class="index-section artifacts-section">
    <div class="section-head">
      <p class="section-kicker">Artifacts</p>
      <h2>Public data and checker links.</h2>
      <p class="section-text">
        These links are kept for transparency. They are not required for a first
        reading, but they allow the theorem object, matrix data, verification
        report, and checker scripts to remain publicly inspectable.
      </p>
    </div>

    <div class="artifacts-grid">
      <article class="index-card">
        <span class="card-label">JSON</span>
        <h3>Canonical theorem artifacts</h3>
        <ul class="artifact-list link-list">
          <li><a href="json/theorem_object.json" target="_blank" rel="noopener">theorem_object.json</a></li>
          <li><a href="json/metadata.json" target="_blank" rel="noopener">metadata.json</a></li>
          <li><a href="json/matrix_M.json" target="_blank" rel="noopener">matrix_M.json</a></li>
          <li><a href="json/gram_Q.json" target="_blank" rel="noopener">gram_Q.json</a></li>
        </ul>
      </article>

      <article class="index-card">
        <span class="card-label">Output</span>
        <h3>Generated proof outputs</h3>
        <ul class="artifact-list link-list">
          <li><a href="json/verify_report.json" target="_blank" rel="noopener">verify_report.json</a></li>
        </ul>
      </article>

      <article class="index-card">
        <span class="card-label">Transport</span>
        <h3>Cocycle artifacts</h3>
        <ul class="artifact-list link-list">
          <li><a href="json/transport_cocycle.json" target="_blank" rel="noopener">transport_cocycle.json</a></li>
        </ul>
      </article>

      <article class="index-card">
        <span class="card-label">Audit</span>
        <h3>Verifier scripts</h3>
        <ul class="artifact-list link-list compact-list">
          <li><a href="audit/checkers/check_shape.py" target="_blank" rel="noopener">check_shape.py</a></li>
          <li><a href="audit/checkers/check_binary.py" target="_blank" rel="noopener">check_binary.py</a></li>
          <li><a href="audit/checkers/check_row_col_sums.py" target="_blank" rel="noopener">check_row_col_sums.py</a></li>
          <li><a href="audit/checkers/check_gram.py" target="_blank" rel="noopener">check_gram.py</a></li>
          <li><a href="audit/checkers/check_graph.py" target="_blank" rel="noopener">check_graph.py</a></li>
          <li><a href="audit/checkers/check_overlap_profile.py" target="_blank" rel="noopener">check_overlap_profile.py</a></li>
          <li><a href="audit/checkers/check_distance_profile.py" target="_blank" rel="noopener">check_distance_profile.py</a></li>
          <li><a href="audit/checkers/check_polynomial_identity.py" target="_blank" rel="noopener">check_polynomial_identity.py</a></li>
          <li><a href="audit/checkers/check_three_angle_geometry.py" target="_blank" rel="noopener">check_three_angle_geometry.py</a></li>
          <li><a href="audit/checkers/check_overlap9_matrices.py" target="_blank" rel="noopener">check_overlap9_matrices.py</a></li>
          <li><a href="audit/checkers/check_cocycle_data.py" target="_blank" rel="noopener">check_cocycle_data.py</a></li>
          <li><a href="audit/checkers/check_cocycle_min_support.py" target="_blank" rel="noopener">check_cocycle_min_support.py</a></li>
          <li><a href="audit/checkers/check_cocycle_holonomy.py" target="_blank" rel="noopener">check_cocycle_holonomy.py</a></li>
          <li><a href="audit/checkers/run_all.py" target="_blank" rel="noopener">run_all.py</a></li>
        </ul>
      </article>
    </div>
  </section>

  <section class="index-section scope-section">
    <div class="section-head">
      <p class="section-kicker">Scope</p>
      <h2>Research context, not final doctrine.</h2>
      <p class="section-text">
        The Thalean Graph project is exploratory mathematical research. Aletheos
        presents it publicly because the broader goal is to make difficult ideas,
        assumptions, artifacts, and inspection paths visible rather than hidden
        behind private notes.
      </p>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/site_footer.php'; ?>
</body>
</html>
