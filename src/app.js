import { Layout } from "./components/Layout.js";
import { mountRouter } from "./router/router.js";
import { initMobileMenu } from "./components/menu.js";
import { mountBgParticles } from "./hero/bgParticles.js";
import { mountFooterTextCanvas } from "./components/footerTextCanvas.js";

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

  // ✅ router (tu versión nueva usa rootEl)
  mountRouter({ rootEl: app });
}
