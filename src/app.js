import { Layout } from "./components/Layout.js";
import { mountRouter } from "./router/router.js";
import { initMobileMenu } from "./components/menu.js";
import { mountBgParticles } from "./hero/bgParticles.js";
import { mountFooterTextCanvas } from "./components/footerTextCanvas.js";
import { initProjectTransitions } from "./components/ProjectTransition.js";

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

  // ✅ WebGL project-link transitions (capture phase, antes que el router)
  initProjectTransitions();

  // ✅ router (usa rootEl)
  mountRouter({ rootEl: app });
}
