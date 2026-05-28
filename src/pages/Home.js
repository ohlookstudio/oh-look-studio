import { Hero, mountHero } from "../hero/hero.js";

export function Home() {
  return `
    <main class="home">

      ${Hero()}

      <!-- ---------------------------------------------------
           FEATURED PROJECTS
      --------------------------------------------------- -->
      <section class="home-featured" aria-label="Featured projects">
        <div class="home-featured__inner">

          <header class="home-featured__head">
            <p class="kicker">Featured</p>
            <h2 class="h2">Two perspectives, selected.</h2>
          </header>

          <div class="home-featured__list">

            <!-- Project 01 (nace izquierda) -->
            <article class="featured-project featured-project--left" data-featured-project>
              <a class="featured-project__link" href="/works/xabi-cacao" data-link aria-label="Open project: Xabi Cacao Tasting">
                <figure class="featured-project__media">
                  <!-- Placeholder: cambia src cuando tengas la imagen -->
                  <img
                    src="/assets/projects/xabi/cover.jpg"
                    alt="Xabi Cacao Tasting — cover"
                    loading="lazy"
                  />
                </figure>
              </a>

              <div class="featured-project__meta">
                <h3 class="h3">Xabi Cacao Tasting</h3>
                <p class="muted">Reframing taste through ritual and material.</p>
              </div>
            </article>

            <!-- Project 02 (nace derecha) -->
            <article class="featured-project featured-project--right" data-featured-project>
              <a class="featured-project__link" href="/works/norway-farm" data-link aria-label="Open project: Norway Farm Brand">
                <figure class="featured-project__media">
                  <img
                    src="/assets/projects/farm/cover.jpg"
                    alt="Norway Farm — cover"
                    loading="lazy"
                  />
                </figure>
              </a>

              <div class="featured-project__meta">
                <h3 class="h3">Norway Farm Brand</h3>
                <p class="muted">A quiet luxury story carved in nature.</p>
              </div>
            </article>

          </div>

          <!-- CTA -> Works (justo después de destacados) -->
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

          <a class="btn btn--pill" href="/studio" data-link aria-label="Enter Oh, studio">
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
