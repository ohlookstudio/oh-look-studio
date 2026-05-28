import { Hero, mountHero } from "../hero/hero.js";

export function Home() {
  return `
    <main class="home">

      ${Hero()}

      <!-- ---------------------------------------------------
           FEATURED PROJECTS — physically overlapping composition
      --------------------------------------------------- -->
      <section class="home-featured" aria-label="Featured projects">
        <div class="home-featured__inner">

          <header class="home-featured__head">
            <p class="kicker">Featured</p>
            <h2 class="h2">Two perspectives, selected.</h2>
          </header>

          <!-- Stack: two images physically overlapping via CSS Grid + negative margin -->
          <div class="home-featured__stack">

            <!-- Project 01 — large, anchored top-left, text overlaid at bottom -->
            <article class="fp-item fp-item--1" data-featured-project>
              <a class="fp-item__link"
                 href="/projects/norway-farm"
                 data-link
                 data-project-link
                 aria-label="Open project: Norway Farm Brand">
                <div class="fp-item__frame">
                  <!-- placeholder: #1a1a1a — swap for <img src="/src/assets/img/norway-placeholder.jpg"> -->
                  <div class="fp-item__meta">
                    <p class="fp-item__index kicker">01</p>
                    <h3 class="fp-item__title">Norway Farm Brand</h3>
                    <p class="fp-item__desc">A quiet luxury story carved in nature.</p>
                    <span class="fp-item__cta">View project →</span>
                  </div>
                </div>
              </a>
            </article>

            <!-- Project 02 — smaller, offset right+down, overlaps project 1 -->
            <!-- Text floats ABOVE the frame in negative space -->
            <article class="fp-item fp-item--2" data-featured-project>
              <a class="fp-item__link"
                 href="/projects/braun-milan"
                 data-link
                 data-project-link
                 aria-label="Open project: Braun – Milan Design Week">
                <div class="fp-item__floatmeta">
                  <p class="fp-item__index kicker">02</p>
                  <h3 class="fp-item__title">Braun – Milan Design Week</h3>
                  <p class="fp-item__desc">Motion as material, restraint as expression.</p>
                  <span class="fp-item__cta">View project →</span>
                </div>
                <div class="fp-item__frame">
                  <!-- placeholder: #111111 — swap for <img src="/src/assets/img/braun-placeholder.jpg"> -->
                </div>
              </a>
            </article>

          </div>

          <!-- CTA -> Works -->
          <div class="home-cta home-cta--works">
            <p class="home-cta__text muted">Want the full archive of perspectives?</p>
            <a class="btn btn--pill" href="/works" data-link aria-label="Go to Oh, works">
              → Oh, works!
            </a>
          </div>

        </div>
      </section>

      <!-- ---------------------------------------------------
           FINAL CTA -> Studio (About)
      --------------------------------------------------- -->
      <section class="home-studio" aria-label="Studio call to action">
        <div class="home-studio__inner">
          <p class="kicker">Studio</p>
          <h2 class="h2">Behind the perspective</h2>
          <p class="muted">
            Not a manifesto. Just the method, the taste, and the reasons.
          </p>
          <a class="btn btn--pill" href="/about" data-link aria-label="Enter Oh, studio">
            → Enter Oh, studio!
          </a>
        </div>
      </section>

    </main>
  `;
}

export function afterRenderHome() {
  const cleanup = mountHero();
  return () => {
    if (typeof cleanup === "function") cleanup();
  };
}
