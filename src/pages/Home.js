import { Hero, mountHero } from "../hero/hero.js";
import { mountFeaturedScroll } from "../animations/featuredScroll.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  /* ── Read and consume return state ─────────────────────────────────────── */
  const flipReturn  = window.__flipReturn;
  window.__flipReturn = null;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  /* ── Mount hero + horizontal scroll ────────────────────────────────────── */
  const cleanupHero     = mountHero();
  const cleanupFeatured = mountFeaturedScroll();

  const tweens = [];
  let returnClone = null;

  /* ── Reverse FLIP (detail cover → home card) ────────────────────────────── */
  if (flipReturn && !reduceMotion) {
    const { rect: first, src, slug } = flipReturn;

    /* Scroll to #homeFeatured so the cards are in-viewport.
       forceScrollTop() in the router registered a rAF that will scroll back
       to 0, so we register our own rAF *after* it to re-apply our target.
       All rAFs fire in registration order before the first paint — the user
       never sees the intermediate scroll=0 state. */
    const section = document.getElementById("homeFeatured");
    let sectionTop = 0;
    if (section) {
      // At scrollY=0, getBoundingClientRect().top IS the distance to scroll
      sectionTop = section.getBoundingClientRect().top;
      window.scrollTo(0, sectionTop);
      ScrollTrigger.refresh(); // pin the section at new scroll position
    }

    /* Find the target card image by slug */
    const cardLink = document.querySelector(`a[href="/projects/${slug}"]`);
    const cardImg  = cardLink?.querySelector(".hf-card__img");
    const last     = cardImg?.getBoundingClientRect();

    if (last && last.width > 0 && last.height > 0) {
      /* Create clone at "First" (detail cover position) */
      returnClone = document.createElement("img");
      returnClone.src = src;
      returnClone.setAttribute("aria-hidden", "true");
      Object.assign(returnClone.style, {
        position:       "fixed",
        top:            `${first.top}px`,
        left:           `${first.left}px`,
        width:          `${first.width}px`,
        height:         `${first.height}px`,
        objectFit:      "cover",
        objectPosition: "center",
        zIndex:         "9998",
        pointerEvents:  "none",
        margin:         "0",
        display:        "block",
        willChange:     "transform",
      });
      document.body.appendChild(returnClone);

      /* Hide the real card image while clone animates */
      gsap.set(cardImg, { autoAlpha: 0 });

      /* Animate clone: First → Last (detail cover → card) */
      const dx     = last.left - first.left;
      const dy     = last.top  - first.top;
      const scaleX = last.width  / first.width;
      const scaleY = last.height / first.height;

      const t = gsap.to(returnClone, {
        x:             dx,
        y:             dy,
        scaleX,
        scaleY,
        transformOrigin: "top left",
        duration:      0.72,
        ease:          "power2.inOut",
        onComplete() {
          if (returnClone?.parentNode) returnClone.remove();
          returnClone = null;
          gsap.to(cardImg, { autoAlpha: 1, duration: 0.22, ease: "power1.in" });
        },
      });
      tweens.push(t);
    }

    /* Re-apply scroll after router's forceScrollTop rAF fires.
       rAFs execute in registration order before paint — registering here
       ensures ours fires last, locking the final scroll at sectionTop. */
    requestAnimationFrame(() => {
      window.scrollTo(0, sectionTop);
      ScrollTrigger.refresh();
    });
  }

  return () => {
    if (typeof cleanupHero     === "function") cleanupHero();
    if (typeof cleanupFeatured === "function") cleanupFeatured();
    tweens.forEach((t) => t?.kill());
    if (returnClone?.parentNode) returnClone.remove();
  };
}
