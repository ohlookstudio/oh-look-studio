import { initScrollHero } from "./scrollHeroCanvas.js";

export function Hero() {
  return `
    <section class="hero" id="hero">
      <canvas class="hero-canvas" id="heroCanvas"></canvas>

      <div class="hero-copy" id="heroCopy" aria-hidden="true"></div>

      <div class="hero-lines" aria-hidden="true">
        <div class="line line-1">Identity that moves</div>
        <div class="line line-2">Code as material</div>
        <div class="line line-3">Stories beyond the static</div>
      </div>

      <div class="scroll-hint">Scroll</div>
    </section>
  `;
}

let cleanup = null;

export function mountHero() {
  // Si ya había un hero montado, lo limpiamos
  if (typeof cleanup === "function") cleanup();
  cleanup = null;

  const hero = document.getElementById("hero");
  const canvas = document.getElementById("heroCanvas");
  const copy = document.getElementById("heroCopy");

  // Si no estamos en Home (no existe el hero), devolvemos cleanup vacío
  if (!hero || !canvas) {
    return () => {};
  }

  // initScrollHero devuelve un cleanup (en tu scrollHeroCanvas.js)
  cleanup = initScrollHero({ hero, canvas, copy });

  // ✅ CLAVE: devolverlo para que el router lo ejecute al salir de Home
  return () => {
    if (typeof cleanup === "function") cleanup();
    cleanup = null;
  };
}
