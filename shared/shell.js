(function () {
  const path = window.location.pathname;

  function isActive(prefixes) {
    return prefixes.some(prefix => path === prefix || path.startsWith(prefix));
  }

  function navLink(label, href, active, extraClass = "") {
    return `<a class="nav-link${active ? " active" : ""}${extraClass ? " " + extraClass : ""}" href="${href}">${label}</a>`;
  }

  function headerHtml() {
    return `
      <header class="site-header">
        <div class="site-header-inner">
          <a class="brand-block" href="/">
            <div class="brand-title">CoRI / Aletheos</div>
            <div class="brand-subtitle">Recursive inquiry and graph-native knowledge</div>
          </a>

          <nav class="main-nav" aria-label="Primary">
            ${navLink("Overview", "/", isActive(["/", "/overview/"]))}
            ${navLink("Concepts", "/concepts/", isActive(["/concepts/"]))}
            ${navLink("Structures", "/structures/", isActive(["/structures/"]))}
            ${navLink("Notes", "/notes/", isActive(["/notes/"]))}
            ${navLink("Lab", "/lab/", isActive(["/lab/", "/graph_viewer/"]))}
          </nav>

          <nav class="utility-nav" aria-label="Utility">
            ${navLink("Search", "/concepts/", false, "utility-link")}
            ${navLink("Workspace", "/lab/", false, "utility-link")}
          </nav>
        </div>
      </header>
    `;
  }

  function footerHtml() {
    return `
      <footer class="site-footer">
        <div class="site-footer-inner">
          <div>Center of Recursive Inquiry / Aletheos working environment</div>
          <div>Status: active development</div>
        </div>
      </footer>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const shell = document.querySelector("[data-site-shell]");
    if (!shell) return;

    shell.classList.add("site-shell");

    const headerMount = document.querySelector("[data-site-header]");
    const footerMount = document.querySelector("[data-site-footer]");

    if (headerMount) headerMount.innerHTML = headerHtml();
    if (footerMount) footerMount.innerHTML = footerHtml();
  });
})();
