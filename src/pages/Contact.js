import { setMeta } from "../utils/seo.js";

export async function Contact() {
  setMeta({ title: "Oh, hello!", url: "/hello" });
  return `
    <main class="contact-page">

      <div class="contact-header">
        <div class="contact-header__inner">
          <p class="kicker">Hello</p>
          <h1 class="contact-display">
            Let's build something<br>that feels alive.
          </h1>
        </div>
      </div>

      <div class="contact-divider"></div>

      <div class="contact-body">
        <div class="contact-info">
          <a class="contact-email" href="mailto:hello@ohlook.studio">
            hello@ohlook.studio
          </a>
          <span class="contact-location muted">Barcelona / Remote</span>
        </div>

        <div class="contact-social">
          <a class="social-link" href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a class="social-link" href="https://linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a class="social-link" href="https://behance.net/" target="_blank" rel="noreferrer">Behance</a>
        </div>
      </div>

    </main>
  `;
}
