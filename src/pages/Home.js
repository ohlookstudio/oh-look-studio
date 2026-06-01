import { Hero, mountHero } from "../hero/hero.js";
import { mountFeaturedScroll } from "../animations/featuredScroll.js";

export function Home() {
  return `
    <main class="home">

      ${Hero()}

      <!-- ---------------------------------------------------
           FEATURED PROJECTS — pinned horizontal scroll
      --------------------------------------------------- -->
      <section class="home-featured" id="homeFeatured" aria-label="Featured projects">

        <span class="hf-ghost hf-ghost--l1" aria-hidden="true">Løøk closer.</span>
        <span class="hf-ghost hf-ghost--l2" aria-hidden="true">Some perspectives, still evolving</span>

        <div class="hf-track" id="featuredTrack">

          <!-- Project 01 — Pål's Gård (lower) -->
          <article class="hf-card hf-card--1">
            <a class="hf-card__link"
               href="/projects/pals-gard"
               data-link
               data-project-link
               aria-label="Open project: Pål's Gård">
              <div class="hf-card__img-wrap fp-item__frame">
                <img class="hf-card__img"
                     src="/src/assets/img/projects/pals-gard-cover.jpg"
                     alt="Pål's Gård"
                     loading="lazy">
              </div>
              <div class="hf-card__label">
                <h3 class="hf-card__title">Pål's Gård</h3>
                <div class="hf-card__cta">
                  <span class="hf-card__see-more">See more</span>
                  <div class="hf-card__line"></div>
                </div>
              </div>
            </a>
          </article>

          <!-- Project 02 — Braun (upper) -->
          <article class="hf-card hf-card--2">
            <a class="hf-card__link"
               href="/projects/braun-milan"
               data-link
               data-project-link
               aria-label="Open project: Braun – Milan Design Week">
              <div class="hf-card__img-wrap fp-item__frame">
                <img class="hf-card__img"
                     src="/src/assets/img/projects/braun-milan-cover.jpg"
                     alt="Braun – Milan Design Week"
                     loading="lazy">
              </div>
              <div class="hf-card__label">
                <h3 class="hf-card__title">Braun</h3>
                <div class="hf-card__cta">
                  <span class="hf-card__see-more">See more</span>
                  <div class="hf-card__line"></div>
                </div>
              </div>
            </a>
          </article>

          <!-- Project 03 — Staccio (lower) -->
          <article class="hf-card hf-card--3">
            <a class="hf-card__link"
               href="/projects/staccio"
               data-link
               data-project-link
               aria-label="Open project: Staccio">
              <div class="hf-card__img-wrap fp-item__frame">
                <img class="hf-card__img"
                     src="/src/assets/img/projects/staccio-cover.jpg"
                     alt="Staccio"
                     loading="lazy">
              </div>
              <div class="hf-card__label">
                <h3 class="hf-card__title">Staccio</h3>
                <div class="hf-card__cta">
                  <span class="hf-card__see-more">See more</span>
                  <div class="hf-card__line"></div>
                </div>
              </div>
            </a>
          </article>

          <!-- Project 04 — Xabi Cacao Tasting (upper, 2-line title) -->
          <article class="hf-card hf-card--4">
            <a class="hf-card__link"
               href="/projects/xabi-cacao"
               data-link
               data-project-link
               aria-label="Open project: Xabi Cacao Tasting">
              <div class="hf-card__img-wrap fp-item__frame">
                <img class="hf-card__img"
                     src="/src/assets/img/projects/xabi-cacao-cover.jpg"
                     alt="Xabi Cacao Tasting"
                     loading="lazy">
              </div>
              <div class="hf-card__label">
                <h3 class="hf-card__title">Xabi Cacao<br>Tasting</h3>
                <div class="hf-card__cta">
                  <span class="hf-card__see-more">See more</span>
                  <div class="hf-card__line"></div>
                </div>
              </div>
            </a>
          </article>

        </div>
      </section>

    </main>
  `;
}

export function afterRenderHome() {
  const cleanupHero = mountHero();
  const cleanupFeatured = mountFeaturedScroll();
  return () => {
    if (typeof cleanupHero === "function") cleanupHero();
    if (typeof cleanupFeatured === "function") cleanupFeatured();
  };
}
