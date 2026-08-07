import { Hero, mountHero } from "../hero/hero.js";
import { mountFeaturedScroll } from "../animations/featuredScroll.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMeta } from "../utils/seo.js";
import projectsData from "../data/projects.json";

// Edit this list to control which projects appear on the Home and in what order.
// Order here is independent of the Works page order (projects.json array).
const FEATURED_SLUGS = ["xabi-cacao", "braun-milan", "pals-gard", "staccio"];

export function Home() {
  setMeta({
    rawTitle:    "Oh, løøk! Studio — Brand identity for products with roots",
    description: "Independent branding studio for terroir products — wine, food, origin. Brand identity, art direction & creative coding. Between Sitges and the Corbières.",
    url:         "/",
  });
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

          ${FEATURED_SLUGS.map((slug, i) => {
            const p = projectsData.projects.find(proj => proj.slug === slug);
            if (!p) return "";
            const displayTitle = p.homeTitle ?? p.title;
            return `
          <article class="hf-card hf-card--${i + 1}">
            <a class="hf-card__link"
               href="/projects/${p.slug}"
               data-link
               data-project-link
               aria-label="Open project: ${p.title}">
              <div class="hf-card__img-wrap fp-item__frame">
                <img class="hf-card__img"
                     src="${p.coverImage}"
                     alt="${p.title}"
                     loading="lazy">
              </div>
              <div class="hf-card__label">
                <h3 class="hf-card__title">${displayTitle}</h3>
                <div class="hf-card__cta">
                  <span class="hf-card__see-more">See more</span>
                  <div class="hf-card__line"></div>
                </div>
              </div>
            </a>
          </article>`;
          }).join("")}

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
