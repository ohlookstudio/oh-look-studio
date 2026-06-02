import { Hero, mountHero } from "../hero/hero.js";
import { mountFeaturedScroll } from "../animations/featuredScroll.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  /* ── Consume return state ───────────────────────────────────────────────── */
  const savedScrollY  = window.__flipScrollY;
  window.__flipScrollY = null;

  const vtaMode    = window.__vtaActive;
  window.__vtaActive = null;
  const returnSlug = window.__flipReturnSlug;
  window.__flipReturnSlug = null;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const supportsVT   = typeof document.startViewTransition === "function";

  /* ── Mount hero + horizontal scroll ────────────────────────────────────── */
  const cleanupHero     = mountHero();
  const cleanupFeatured = mountFeaturedScroll();

  /* ── Restore horizontal scroll position ────────────────────────────────── */
  // Two rAFs: ours fires after forceScrollTop's rAF (which would scroll back to 0)
  if (savedScrollY != null) {
    window.scrollTo(0, savedScrollY);
    ScrollTrigger.refresh();
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollY);
      ScrollTrigger.refresh();
    });
  }

  /* ── VTA backward: mark the return card so the browser can morph back ───── */
  if (vtaMode === "backward" && returnSlug && supportsVT && !reduceMotion) {
    const cardLink = document.querySelector(`a[href="/projects/${returnSlug}"]`);
    const cardImg  = cardLink?.querySelector("img");
    if (cardImg) {
      cardImg.style.viewTransitionName = "project-cover";
    }
  }

  return () => {
    if (typeof cleanupHero     === "function") cleanupHero();
    if (typeof cleanupFeatured === "function") cleanupFeatured();
    // Clear any lingering view-transition-name on cleanup
    if (returnSlug) {
      const card = document.querySelector(`a[href="/projects/${returnSlug}"] img`);
      if (card) card.style.viewTransitionName = "";
    }
  };
}
