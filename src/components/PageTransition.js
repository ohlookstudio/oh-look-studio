// src/components/PageTransition.js

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function raf() {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

function ensureOverlay() {
  let el = document.getElementById("pageTransition");
  if (el) return el;

  el = document.createElement("div");
  el.id = "pageTransition";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<div class="pt__veil"></div>`;
  document.body.appendChild(el);
  return el;
}

function setTransitioning(on) {
  document.body.classList.toggle("is-transitioning", !!on);
}

/* ---------------------------------------------------
   Read CSS vars (supports ms / s)
--------------------------------------------------- */
function parseTimeToMs(v, fallbackMs) {
  if (!v) return fallbackMs;
  const s = String(v).trim();

  // "420ms"
  if (s.endsWith("ms")) {
    const n = parseFloat(s.slice(0, -2));
    return Number.isFinite(n) ? n : fallbackMs;
  }

  // "0.46s"
  if (s.endsWith("s")) {
    const n = parseFloat(s.slice(0, -1));
    return Number.isFinite(n) ? n * 1000 : fallbackMs;
  }

  // "420"
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallbackMs;
}

function getTransitionDurations() {
  const styles = getComputedStyle(document.documentElement);
  const outVar = styles.getPropertyValue("--pt-out-ms");
  const inVar = styles.getPropertyValue("--pt-in-ms");

  const outMs = parseTimeToMs(outVar, 280);
  const inMs = parseTimeToMs(inVar, 320);

  return {
    outMs: Math.max(0, Math.round(outMs)),
    inMs: Math.max(0, Math.round(inMs)),
  };
}

/* ---------------------------------------------------
   SAFETY
--------------------------------------------------- */
let safetyTimer = null;
function armSafetyReset(ms = 1400) {
  clearSafetyReset();
  safetyTimer = setTimeout(() => {
    PageTransition.reset();
  }, ms);
}
function clearSafetyReset() {
  if (safetyTimer) clearTimeout(safetyTimer);
  safetyTimer = null;
}

let running = false;

export const PageTransition = {
  async out() {
    if (running) return;

    running = true;

    const { outMs, inMs } = getTransitionDurations();

    // safety = duración total + margen
    armSafetyReset(outMs + inMs + 900);

    const overlay = ensureOverlay();

    overlay.classList.remove("is-in");
    overlay.classList.add("is-active", "is-out");

    setTransitioning(true);

    await raf();
    // pequeño margen para asegurar que el CSS pinta incluso en Safari
    await sleep(outMs + 20);
  },

  async in() {
    const overlay = ensureOverlay();

    const { inMs } = getTransitionDurations();

    try {
      overlay.classList.remove("is-out");
      overlay.classList.add("is-active", "is-in");

      await raf();
      await sleep(inMs + 20);
    } finally {
      overlay.classList.remove("is-active", "is-in", "is-out");
      setTransitioning(false);

      clearSafetyReset();
      running = false;
    }
  },

  reset() {
    const overlay = document.getElementById("pageTransition");
    if (overlay) overlay.classList.remove("is-active", "is-in", "is-out");
    setTransitioning(false);

    clearSafetyReset();
    running = false;
  },

  _debugState() {
    const overlay = document.getElementById("pageTransition");
    const { outMs, inMs } = getTransitionDurations();

    return {
      transitioning: document.body.classList.contains("is-transitioning"),
      cssVars: { outMs, inMs },
      overlay: overlay
        ? {
            isActive: overlay.classList.contains("is-active"),
            isOut: overlay.classList.contains("is-out"),
            isIn: overlay.classList.contains("is-in"),
          }
        : null,
      running,
    };
  },
};

if (import.meta?.env?.DEV) {
  window.PageTransition = PageTransition;
}
