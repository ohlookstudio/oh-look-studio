// src/pages/Privacy.js
import { setMeta } from "../utils/seo.js";

export default function Privacy() {
  setMeta({
    title: "Privacy",
    description: "Privacy information for Oh, løøk! Studio and how personal data is handled.",
    url: "/privacy",
  });

  return `
    <main class="page section section--tall" aria-label="Privacy">
      <p class="kicker">Privacy</p>
      <h2>Privacy Policy</h2>

      <p>
        This site uses necessary browser storage to remember your cookie choice. With your consent,
        it also uses Google Analytics 4 to understand visits and improve the site. Google Analytics
        is not loaded until you allow analytics cookies.
      </p>

      <p>
        If you contact me via email, I’ll only use your message to reply and keep the conversation going.
        I won’t share your data with third parties.
      </p>

      <p>
        You can accept, reject, or later withdraw analytics consent. No marketing technology is
        currently active, and this site does not sell personal data.
      </p>

      <p><button class="nav__link" type="button" data-cookie-preferences>Change cookie preferences</button></p>

      <p style="margin-top: 22px;">
        <a class="nav__link" data-link href="/">Back to Home</a>
      </p>
    </main>
  `;
}
