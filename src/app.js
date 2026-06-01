import { Layout } from "./components/Layout.js";
import { mountRouter } from "./router/router.js";
import { initMobileMenu } from "./components/menu.js";
import { mountBgParticles } from "./hero/bgParticles.js";
import { mountFooterTextCanvas } from "./components/footerTextCanvas.js";
import { initFlipTransitions } from "./components/flipTransition.js";
// initProjectTransitions (WebGL) intentionally disconnected — kept in ProjectTransition.js

export function initApp() {
  const app = document.getElementById("app");
  if (!app) return;

  // ✅ Monta Layout una sola vez
  app.innerHTML = Layout();

  // ✅ header/menu
  initMobileMenu();

  // ✅ background particles global
  mountBgParticles();

  // ✅ footer pure-canvas text (una sola vez)
  mountFooterTextCanvas();

  // ✅ FLIP project-link transitions (capture phase, antes que el router)
  initFlipTransitions();

  // ✅ router (usa rootEl)
  mountRouter({ rootEl: app });
}
