// src/components/Footer.js
import { SOCIAL } from '../data/social.js';

export function Footer() {
  return `
    <footer class="site-footer" aria-label="Site footer">
      <div class="site-footer__inner">

        <div class="site-footer__body">

          <!-- Canvas: "Let's talk." en partículas (decorativo) -->
          <div class="site-footer__canvas" aria-hidden="true">
            <canvas id="footerTextCanvas"></canvas>
          </div>

          <!-- Bloque de contacto (derecha) -->
          <div class="site-footer__contact">
            <div class="site-footer__contactInfo">
              <p>Between Sitges & Talairan</p>
              <p>Working worldwide</p>
              <a href="mailto:hello@ohlook.studio">hello@ohlook.studio</a>
            </div>
            <div class="site-footer__socials">
              <a href="${SOCIAL.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="${SOCIAL.linkedin}"  target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="${SOCIAL.behance}"   target="_blank" rel="noopener noreferrer">Behance</a>
            </div>
          </div>

        </div>

        <hr class="site-footer__rule" aria-hidden="true">

        <div class="site-footer__bottom">
          <span class="site-footer__copyright">© 2026 Oh, løøk! Studio</span>
          <a class="site-footer__privacy" href="/privacy" data-link>Privacy</a>
        </div>

      </div>
    </footer>
  `;
}
