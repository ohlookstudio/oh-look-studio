import { setMeta } from "../utils/seo.js";

export async function About() {
  setMeta({ title: "Oh, studio!", url: "/studio" });
  return `
    <main class="studio-page">

      <div class="studio-header">
        <div class="studio-header__inner">
          <p class="kicker">About</p>
          <h1 class="studio-display">Oh,<br>studio!</h1>
          <p class="studio-tagline">
            An experimental approach to branding:<br>
            sharp systems, warm details, motion as a language.
          </p>
        </div>
      </div>

      <div class="studio-divider"></div>

      <div class="studio-content">
        <div class="studio-grid">

          <div class="studio-col">
            <section class="studio-section">
              <h2 class="studio-label">Philosophy</h2>
              <p class="studio-body">
                Wabi-sabi: imperfection is part of the aesthetic, not a bug.
                We mix multiple design techniques intentionally — because
                restraint without tension isn't craftsmanship, it's just tidiness.
              </p>
              <p class="studio-body">
                The studio name, Oh, løøk! — is a moment of genuine surprise.
                That's the emotion we design toward: not mere beauty, but the
                small shock of something made with real intention.
              </p>
              <p class="studio-body">
                References shape taste, not templates. Pentagram's systems
                thinking. Toormix's editorial warmth. Vasava's irreverence.
                Gretel's motion intelligence. Paula Scher's typographic courage.
                We carry these forward without copying them.
              </p>
            </section>
          </div>

          <div class="studio-col">
            <section class="studio-section">
              <h2 class="studio-label">Services</h2>
              <ul class="studio-list">
                <li>Brand identity systems</li>
                <li>Editorial &amp; layout</li>
                <li>Motion &amp; interaction</li>
                <li>Web design &amp; creative development</li>
              </ul>
            </section>

            <section class="studio-section">
              <h2 class="studio-label">References</h2>
              <p class="studio-refs">
                Pentagram · Toormix · Vasava · Gretel · Paula Scher
              </p>
            </section>

            <section class="studio-section">
              <h2 class="studio-label">Based in</h2>
              <p class="studio-refs">Barcelona / Remote</p>
            </section>
          </div>

        </div>
      </div>

      <div class="studio-cta-row">
        <a class="btn btn--pill" href="/contact" data-link>→ Oh, hello!</a>
      </div>

    </main>
  `;
}
