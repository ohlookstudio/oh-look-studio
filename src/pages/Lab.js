import { setMeta } from "../utils/seo.js";

export function Lab() {
  setMeta({ title: "Oh, lab!", url: "/lab" });
  return `
    <main class="lab-page">
      <div class="lab-inner">
        <p class="kicker">Experiments</p>
        <h1 class="lab-claim">Nothing here yet.<br>Keep løøking.</h1>
        <p class="lab-sub muted">Something is brewing in the background.</p>
      </div>
    </main>
  `;
}
