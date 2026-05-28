// src/components/Footer.js
export function Footer() {
  return `
    <footer class="site-footer" aria-label="Site footer">
      <div class="site-footer__inner">

        <!-- Canvas principal (visual) -->
        <div class="site-footer__canvas" aria-hidden="true">
          <canvas id="footerTextCanvas"></canvas>
        </div>

        <!-- CTA Block -->
        <div class="site-footer__ctaBlock">
          

          <div class="site-footer__ctaRow">
            <a class="nav__link nav__link--cta" href="/contact" data-link>Let’s talk.</a>
          </div>
        </div>

        <!-- Social -->
        <div class="site-footer__social" aria-label="Social links">
          <a class="social-link" href="#" aria-label="Instagram">IG</a>
          <a class="social-link" href="#" aria-label="LinkedIn">IN</a>
          <a class="social-link" href="#" aria-label="Behance">BE</a>
        </div>

        <!-- Meta -->
        <div class="site-footer__meta" aria-label="Legal">
          <span class="site-footer__metaText">© 2026 Oh, løøk! Studio</span>
          <span class="site-footer__metaDot" aria-hidden="true">·</span>
          <a class="site-footer__metaLink" href="/privacy" data-link>Privacy</a>
        </div>

      </div>
    </footer>
  `;
}
