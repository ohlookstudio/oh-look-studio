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

        <!-- Ghost title: static backdrop, images scroll in front -->
        <span class="home-featured__ghost home-featured__ghost--l1" aria-hidden="true">Two perspectives,</span>
        <span class="home-featured__ghost home-featured__ghost--l2" aria-hidden="true">selected.</span>

        <!-- Track: translates horizontally on scroll -->
        <div class="home-featured__track" id="featuredTrack">

          <!-- Project 01 — large, caption below -->
          <article class="fp-item fp-item--1">
            <a class="fp-item__link"
               href="/projects/norway-farm"
               data-link
               data-project-link
               aria-label="Open project: Norway Farm Brand">
              <div class="fp-item__img-wrap">
                <img class="fp-item__img"
                     src="/src/assets/img/projects/norway-farm-cover.jpg"
                     alt="Norway Farm Brand"
                     loading="lazy">
              </div>
              <div class="fp-item__caption">
                <p class="fp-item__index kicker">01</p>
                <h3 class="fp-item__title">Norway Farm Brand</h3>
              </div>
            </a>
          </article>

          <!-- Project 02 — smaller, shifted up, caption above, overlaps P1 -->
          <article class="fp-item fp-item--2">
            <a class="fp-item__link"
               href="/projects/braun-milan"
               data-link
               data-project-link
               aria-label="Open project: Braun – Milan Design Week">
              <div class="fp-item__caption fp-item__caption--above">
                <p class="fp-item__index kicker">02</p>
                <h3 class="fp-item__title">Braun — Milan Design Week</h3>
              </div>
              <div class="fp-item__img-wrap">
                <img class="fp-item__img"
                     src="/src/assets/img/projects/braun-milan-cover.jpg"
                     alt="Braun – Milan Design Week"
                     loading="lazy">
              </div>
            </a>
          </article>

        </div>
      </section>

      <!-- ---------------------------------------------------
           CTA → Works
      --------------------------------------------------- -->
      <div class="home-cta home-cta--works">
        <h2 class="home-cta__title">Keep løøking.</h2>
        <p class="home-cta__sub">The full archive awaits.</p>
        <a class="btn btn--pill" href="/works" data-link aria-label="Go to Oh, works">
          → Oh, works!
        </a>
      </div>

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
