import projectsData from "../data/projects.json";

export function Works() {
  const projects = projectsData.projects || [];

  return `
    <main class="works-page">
      <header class="works-header">
        <div class="works-header__inner">
          <p class="kicker">Archive</p>
          <h1 class="works-display">Oh, works!</h1>
          <p class="works-subtitle muted">
            Selected perspectives — each one a distinct point of view.
          </p>
        </div>
      </header>

      <div class="works-grid">
        ${projects.map((p, i) => `
          <article class="works-card ${i % 2 === 0 ? "works-card--a" : "works-card--b"}">
            <a class="works-card__link" href="/projects/${p.slug}" data-link data-project-link
               aria-label="Open project: ${p.title}">
              <div class="works-card__cover">
                <span class="works-card__num kicker">${String(i + 1).padStart(2, "0")}</span>
              </div>
            </a>
            <div class="works-card__meta">
              <div class="works-card__tags kicker">${p.tags?.join(" · ") ?? ""}</div>
              <h2 class="works-card__title">
                <a href="/projects/${p.slug}" data-link>${p.title}</a>
              </h2>
              <p class="muted">${p.description ?? ""}</p>
              <a class="works-card__cta" href="/projects/${p.slug}" data-link>
                View project →
              </a>
            </div>
          </article>
        `).join("")}
      </div>
    </main>
  `;
}
