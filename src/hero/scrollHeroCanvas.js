// src/components/scrollHeroCanvas.js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initScrollHero({ hero, canvas, copy }) {
  console.log("[Hero] initScrollHero called", { hero, canvas, copy });

  if (!hero || !canvas) return () => {};

  const ctx = canvas.getContext("2d", { alpha: false });

  // -------------------------
  // Visual
  // -------------------------
  const COLOR_BG = "#0B0B0B";
  const COLOR_DOT = "#ffffffff";

  const WORD_TEXT = "Oh, løøk!";
  const CLAIM_TEXT = "Another perspective,\nunlocked.";

  // Tipografías (ajusta si tu logo usa otra)
  const WORD_FONT = `"ohno-softie-variable", system-ui, -apple-system, "Segoe UI", Roboto, Inter, Arial, sans-serif`;
  const EYES_FONT = WORD_FONT;

  // --- Responsive config (desktop vs mobile) ---
  const WORD_MARGIN = 0.10;
  const WORD_TRACKING_EM = 3.5 / 100; // (reservado por si luego aplicamos tracking “real” en canvas)

  // ✅ Menos bold
  const EYES_FONT_WEIGHT = 600; // prueba 450/500/600
  const WORD_FONT_WEIGHT = 600; // prueba 450/500/600

  // Ojos (ø)
  const EYES_TEXT = "ø";

  // ⬇️ ahora son "let" porque los recalculamos en resize()
  let WORD_WEIGHT = 0.75;
  let EYES_WEIGHT = 0.62;
  let EYES_GAP = 0.14;

  // Puntos
  const POINT_STEP = 3;
  const MAX_PTS = 5200;

  // Partículas
  const R_MIN = 0.55,
    R_MAX = 1.15;

  // Vida
  const LIFE_AMP_MIN = 2.2;
  const LIFE_AMP_MAX = 6.5;
  const LIFE_SPD_MIN = 0.25;
  const LIFE_SPD_MAX = 0.9;

  // Twinkle
  const TWINKLE_BASE = 0.65;
  const TWINKLE_RANGE = 0.45;

  const USE_LIGHTER = true;
  const GLOW_BLUR = 0;

  // Campo global sutil
  const FIELD_X_AMP = 12;
  const FIELD_Y_AMP = 8;
  const FIELD_X_SPD = 0.25;
  const FIELD_Y_SPD = 0.21;

  // Starfield
  const STARS_COUNT = 3000;
  const STARS_MIN_R = 0.35;
  const STARS_MAX_R = 2.4;
  const STARS_TWINKLE = 0.30;
  let stars = [];

  // Mouse
  const mediaReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = !!mediaReduce?.matches;

  const MOUSE_RADIUS = 110;
  const MOUSE_FORCE = 0.55;

  let mouseX = -9999,
    mouseY = -9999,
    mouseInside = false;

  function onMouseMove(e) {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseInside =
      mouseX >= 0 &&
      mouseX <= rect.width &&
      mouseY >= 0 &&
      mouseY <= rect.height;
  }
  function onMouseLeave() {
    mouseInside = false;
    mouseX = -9999;
    mouseY = -9999;
  }

  // Header
  const getHeader = () => document.getElementById("siteHeader");
  const showHeader = () => {
    const h = getHeader();
    if (!h) return;
    h.classList.remove("is-hidden");
    h.classList.add("is-visible");
  };
  const hideHeader = () => {
    const h = getHeader();
    if (!h) return;
    h.classList.remove("is-visible");
    h.classList.add("is-hidden");
  };
  hideHeader();

  // -------------------------
  // DOM refs (Claim + Lines + Hint)
  // -------------------------
  const hint = hero.querySelector(".scroll-hint");
  const linesWrap = hero.querySelector(".hero-lines");
  const l1 = hero.querySelector(".line-1");
  const l2 = hero.querySelector(".line-2");
  const l3 = hero.querySelector(".line-3");

  // Claim DOM (✅ empieza oculto, solo entra por timeline)
  if (copy) {
    copy.textContent = CLAIM_TEXT;
    copy.style.whiteSpace = "pre-line";
    gsap.set(copy, {
      autoAlpha: 0,
      y: 10,
      filter: "blur(0px)",
      pointerEvents: "none",
    });
  }

  // Lines initial state (✅ ocultas al inicio)
  if (linesWrap && l1 && l2 && l3) {
    gsap.set(linesWrap, { autoAlpha: 0 });
    gsap.set([l1, l2, l3], { opacity: 0.28, filter: "blur(0.6px)", y: 8 });
  }

  // helper foco
  const setActive = (activeEl) => {
    if (!l1 || !l2 || !l3) return;
    [l1, l2, l3].forEach((el) => {
      const isActive = el === activeEl;
      gsap.to(el, {
        opacity: isActive ? 1 : 0.28,
        filter: isActive ? "blur(0px)" : "blur(0.6px)",
        y: isActive ? 0 : 6,
        duration: 0.22,
        overwrite: true,
      });
      el.classList?.toggle("is-active", isActive);
    });
  };

  // ✅ reset a “todas suaves”
  const setAllSoft = () => {
    if (!l1 || !l2 || !l3) return;

    // base suave para las 3
    [l1, l2, l3].forEach((el) => {
      gsap.to(el, {
        opacity: 0.55,
        filter: "blur(0.2px)",
        y: 0,
        duration: 0.22,
        overwrite: true,
      });
      el.classList?.remove("is-active");
    });

    // micro “fade back” (como perder electricidad) solo en la última
    gsap.fromTo(
      l3,
      { opacity: 0.62 },
      { opacity: 0.55, duration: 0.18, ease: "power2.out", overwrite: true }
    );

    // mini “flicker” aún más micro
    gsap.fromTo(
      l3,
      { opacity: 0.55 },
      {
        opacity: 0.58,
        duration: 0.05,
        yoyo: true,
        repeat: 1,
        ease: "none",
        delay: 0.02,
        overwrite: true,
      }
    );
  };

  // -------------------------
  // State
  // -------------------------
  let w = 0,
    h = 0,
    dpr = 1;
  let particles = [];
  let eyesPts = [];
  let wordPts = [];
  let phase = 0; // 0..3  ✅ (eyes->word->scatter)
  let zoom = 1;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // -------------------------
  // Helpers
  // -------------------------
  let started = false;
  async function waitForHeroSize(maxMs = 2500) {
    const t0 = performance.now();
    while (performance.now() - t0 < maxMs) {
      const cw = Math.floor(hero.clientWidth);
      const ch = Math.floor(hero.clientHeight);
      if (cw > 10 && ch > 10) return true;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return false;
  }

  // -------------------------
  // Resize / build
  // -------------------------
  let resizeRaf = null;

  function buildStars() {
    stars = new Array(STARS_COUNT).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: STARS_MIN_R + Math.random() * (STARS_MAX_R - STARS_MIN_R),
      tw: Math.random() * Math.PI * 2,
      sp: 0.18 + Math.random() * 0.75,
      a: 0.05 + Math.random() * 0.16,
      dx: (Math.random() - 0.5) * 0.12,
      dy: (Math.random() - 0.5) * 0.12,
    }));
  }

  function resize() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);

    resizeRaf = requestAnimationFrame(() => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(hero.clientWidth);
      h = Math.floor(hero.clientHeight);
      if (w <= 0 || h <= 0) return;

      // ✅ Mobile tuning (ajusta valores aquí)
      const isMobile = w <= 860;

      // Ojos más grandes en móvil (prueba 0.74–0.82)
      EYES_WEIGHT = isMobile ? 0.78 : 0.62;

      // Separación (si los ves muy separados baja a 0.13–0.14)
      EYES_GAP = isMobile ? 0.15 : 0.14;

      // Palabra más presente en móvil (prueba 0.84–0.92)
      WORD_WEIGHT = isMobile ? 0.88 : 0.75;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildStars();

      eyesPts = buildEyesFromText();
      wordPts = buildWordPoints();

      console.log("[Hero] pts", { eyes: eyesPts.length, word: wordPts.length, w, h });

      normalizeCounts2();
      initParticles(); // ✅ crea scatter

      ScrollTrigger.refresh();
    });
  }

  // -------------------------
  // Shapes
  // -------------------------
  function buildEyesFromText() {
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");

    octx.fillStyle = "#000";
    octx.fillRect(0, 0, w, h);

    const usableW = w * (1 - WORD_MARGIN * 2);
    const gapPx = usableW * EYES_GAP;

    let fontSize = 10;
    let totalWidth = 0;

    do {
      fontSize += 4;
      octx.font = `${EYES_FONT_WEIGHT} ${fontSize}px ${EYES_FONT}`;
      const mw = octx.measureText(EYES_TEXT).width;
      totalWidth = mw * 2 + gapPx;
    } while (totalWidth < usableW * EYES_WEIGHT && fontSize < h * 0.78);

    octx.font = `${EYES_FONT_WEIGHT} ${fontSize}px ${EYES_FONT}`;
    octx.textBaseline = "middle";
    octx.textAlign = "center";
    octx.fillStyle = "#fff";

    const mw = octx.measureText(EYES_TEXT).width;
    const total = mw * 2 + gapPx;

    const leftX = (w - total) / 2 + mw / 2;
    const rightX = leftX + mw + gapPx;
    const y = h / 2;

    const stamp = document.createElement("canvas");
    const sw = Math.ceil(mw + fontSize * 0.6);
    const sh = Math.ceil(fontSize * 1.4);
    stamp.width = sw;
    stamp.height = sh;
    const sctx = stamp.getContext("2d");

    sctx.fillStyle = "#000";
    sctx.fillRect(0, 0, sw, sh);

    sctx.font = `${EYES_FONT_WEIGHT} ${fontSize}px ${EYES_FONT}`;
    sctx.textBaseline = "middle";
    sctx.textAlign = "center";
    sctx.fillStyle = "#fff";
    sctx.fillText(EYES_TEXT, sw / 2, sh / 2);

    // ojo izq espejado
    octx.save();
    octx.translate(leftX, y);
    octx.scale(-1, 1);
    octx.drawImage(stamp, -sw / 2, -sh / 2);
    octx.restore();

    // ojo der normal
    octx.drawImage(stamp, rightX - sw / 2, y - sh / 2);

    return samplePointsFromCanvas(octx);
  }

  function buildWordPoints() {
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");

    const usableW = w * (1 - WORD_MARGIN * 2);

    let fontSize = 10;
    do {
      fontSize += 4;
      octx.font = `${WORD_FONT_WEIGHT} ${fontSize}px ${WORD_FONT}`;
    } while (octx.measureText(WORD_TEXT).width < usableW * WORD_WEIGHT && fontSize < h * 0.7);

    octx.fillStyle = "#000";
    octx.fillRect(0, 0, w, h);

    octx.font = `${WORD_FONT_WEIGHT} ${fontSize}px ${WORD_FONT}`;
    octx.textBaseline = "middle";
    octx.textAlign = "center";
    octx.fillStyle = "#fff";
    octx.fillText(WORD_TEXT, w / 2, h / 2);

    return samplePointsFromCanvas(octx);
  }

  // sample por luminancia (R)
  function samplePointsFromCanvas(octx) {
    const data = octx.getImageData(0, 0, w, h).data;
    const pts = [];

    for (let y = 0; y < h; y += POINT_STEP) {
      for (let x = 0; x < w; x += POINT_STEP) {
        const i = (y * w + x) * 4;
        const r = data[i];
        if (r > 200) pts.push({ x, y });
      }
    }

    // shuffle
    for (let i = pts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }

    return pts.length > MAX_PTS ? pts.slice(0, MAX_PTS) : pts;
  }

  function normalizeCounts2() {
    const n = Math.min(eyesPts.length, wordPts.length);
    eyesPts = eyesPts.slice(0, n);
    wordPts = wordPts.slice(0, n);
  }

  // ✅ crea sx/sy (scatter)
  function initParticles() {
    const count = eyesPts.length;
    const cx = w / 2;
    const cy = h / 2;

    const minR = Math.max(w, h) * 0.18;
    const maxR = Math.max(w, h) * 0.75;

    particles = new Array(count).fill(0).map((_, i) => {
      const e = eyesPts[i];
      const w0 = wordPts[i];

      const ang = Math.random() * Math.PI * 2;
      const rad = minR + Math.random() * (maxR - minR);
      const sx = cx + Math.cos(ang) * rad;
      const sy = cy + Math.sin(ang) * rad;

      return {
        x: e.x,
        y: e.y,
        ex: e.x,
        ey: e.y,
        wx: w0.x,
        wy: w0.y,

        sx,
        sy, // ✅ dispersión

        r: R_MIN + Math.random() * (R_MAX - R_MIN),

        seed: Math.random() * 1000,
        tw: Math.random() * Math.PI * 2,
        amp: LIFE_AMP_MIN + Math.random() * (LIFE_AMP_MAX - LIFE_AMP_MIN),
        spd: LIFE_SPD_MIN + Math.random() * (LIFE_SPD_MAX - LIFE_SPD_MIN),

        ox: 0,
        oy: 0,
      };
    });
  }

  // -------------------------
  // Render
  // -------------------------
  let rafId = null;

  function drawStars(t) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255,255,255,1)";

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      s.x += s.dx;
      s.y += s.dy;
      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      if (s.y < -10) s.y = h + 10;
      if (s.y > h + 10) s.y = -10;

      const tw = 0.6 + 0.4 * Math.sin(t * s.sp + s.tw);
      const a = s.a + STARS_TWINKLE * 0.12 * tw;

      ctx.globalAlpha = a;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    ctx.restore();
  }

  function render() {
    const t = performance.now() * 0.001;

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, w, h);

    drawStars(t);

    if (USE_LIGHTER) ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = COLOR_DOT;
    ctx.shadowBlur = GLOW_BLUR;
    ctx.shadowColor = COLOR_DOT;

    // ✅ 0..3 (eyes->word->scatter)
    const p = clamp(phase, 0, 3);

    // etapa 1: eyes -> word (0..1)
    const tWord = easeOut(clamp(p, 0, 1));

    // etapa 2: word -> scatter (2..3)
    const tScatter = easeOut(clamp(p - 2, 0, 1));

    // ✅ Cuando la palabra ya casi está formada, reducimos drift/twinkle
    // para que el contorno se lea "premium" (sobre todo en móvil).
    const hold = clamp((tWord - 0.85) / 0.15, 0, 1); // 0→1 al final del morph
    const driftScaleBase = lerp(1, 0.25, hold); // 1 → 0.25 (más nítido)
    const driftScale = lerp(driftScaleBase, 1.15, tScatter); // vuelve a vida en scatter
    const twinkleScale = lerp(1, 0.55, hold); // menos parpadeo al “leer” la palabra

    const cx0 = w / 2;
    const cy0 = h / 2;

    // ✅ “corriente” un poco más fuerte durante la dispersión
    const scatterBoost = 1 + 1.25 * tScatter;
    const fieldX = Math.sin(t * FIELD_X_SPD) * FIELD_X_AMP * scatterBoost;
    const fieldY = Math.cos(t * FIELD_Y_SPD) * FIELD_Y_AMP * scatterBoost;

    for (let i = 0; i < particles.length; i++) {
      const pt = particles[i];

      // primero llegamos al word...
      const wx = lerp(pt.ex, pt.wx, tWord);
      const wy = lerp(pt.ey, pt.wy, tWord);

      // ...y luego dispersión
      const tx = lerp(wx, pt.sx, tScatter);
      const ty = lerp(wy, pt.sy, tScatter);

      const k = 0.18 + 0.28 * (p / 3);
      pt.x = lerp(pt.x, tx, k);
      pt.y = lerp(pt.y, ty, k);

      const driftX = Math.sin(t * pt.spd + pt.seed) * pt.amp * driftScale;
      const driftY = Math.cos(t * pt.spd + pt.seed * 1.3) * pt.amp * driftScale;

      if (!prefersReducedMotion && mouseInside) {
        const px = pt.x + driftX + fieldX + pt.ox;
        const py = pt.y + driftY + fieldY + pt.oy;
        const dxm = px - mouseX;
        const dym = py - mouseY;
        const d2 = dxm * dxm + dym * dym;
        const r2 = MOUSE_RADIUS * MOUSE_RADIUS;

        if (d2 < r2) {
          const d = Math.max(0.001, Math.sqrt(d2));
          const fall = 1 - d / MOUSE_RADIUS;
          const s = fall * fall * MOUSE_FORCE * 18;
          pt.ox += (dxm / d) * s;
          pt.oy += (dym / d) * s;
        }
      }

      pt.ox *= 0.86;
      pt.oy *= 0.86;

      const twk = 0.6 + 0.4 * Math.sin(t * 1.2 + pt.tw);
      const rr = pt.r * (0.92 + 0.18 * twk);
      ctx.globalAlpha = TWINKLE_BASE + (TWINKLE_RANGE * twinkleScale) * twk;

      const dx = pt.x + driftX + fieldX + pt.ox - cx0;
      const dy = pt.y + driftY + fieldY + pt.oy - cy0;
      const zx = cx0 + dx * zoom;
      const zy = cy0 + dy * zoom;

      const size = rr * 1.7;
      ctx.fillRect(zx - size * 0.5, zy - size * 0.5, size, size);
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    rafId = requestAnimationFrame(render);
  }

  // -------------------------
  // ScrollTrigger (ONE timeline)
  // -------------------------
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: () => "+=" + window.innerHeight * 2.1,
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,

      onUpdate: (self) => {
        phase = self.progress * 3; // ✅ antes 2
        zoom = 1 + 0.10 * self.progress;
      },

      onLeave: () => {
        showHeader();
      },
      onEnterBack: () => {
        hideHeader();
      },
    },
  });

  // -------------------------
  // UI choreography (no solape + drop perfecto)
  // -------------------------
  if (hint) {
    tl.to(hint, { autoAlpha: 0, duration: 0.06, ease: "none" }, 0.05);
  }

  // Claim IN (cuando ya está “word”)
  if (copy) {
    tl.to(
      copy,
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.08,
        ease: "none",
      },
      0.56
    );

    // Claim OUT (antes, para no solapar)
    tl.to(
      copy,
      {
        autoAlpha: 0,
        y: 10,
        filter: "blur(8px)",
        duration: 0.06,
        ease: "none",
      },
      0.66
    );
  }

  // Lines IN (cuando empieza la dispersión)
  if (linesWrap) {
    tl.fromTo(
      linesWrap,
      { autoAlpha: 0, y: 10, filter: "blur(10px)" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.08, ease: "none" },
      0.74
    );
  }

  // Focus 1 -> 2 -> 3
  if (l1 && l2 && l3) {
    tl.add(() => setActive(l1), 0.76);
    tl.add(() => setActive(l2), 0.84);
    tl.add(() => setActive(l3), 0.92);

    // ✅ Reset final + micro “fade back”
    tl.add(() => setAllSoft(), 0.98);
  }

  // Canvas dissolve: fade the hero canvas out during the last 18% of scroll
  // so bgParticles beneath blends in seamlessly instead of snapping in.
  tl.to(canvas, { opacity: 0, duration: 0.30, ease: 'power2.in' }, 0.70);

  // -------------------------
  // Sync UI on refresh
  // -------------------------
  const syncUI = () => {
    const st = tl.scrollTrigger;
    if (!st) return;
    if (st.progress >= 1) showHeader();
    else hideHeader();
  };
  ScrollTrigger.addEventListener("refresh", syncUI);

  // -------------------------
  // Init
  // -------------------------
  const start = async () => {
    if (started) return;
    started = true;

    try {
      await document.fonts?.ready;
    } catch (_) {}
    await waitForHeroSize(2500);

    if (hint) gsap.set(hint, { autoAlpha: 0.4 });

    resize();
    render();

    window.addEventListener("resize", resize);
    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      hero.addEventListener("mouseleave", onMouseLeave, { passive: true });
    }
    syncUI();
  };

  start();

  // Cleanup
  return function cleanup() {
    window.removeEventListener("resize", resize);
    if (!prefersReducedMotion) {
      window.removeEventListener("mousemove", onMouseMove);
      hero.removeEventListener("mouseleave", onMouseLeave);
    }
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    if (rafId) cancelAnimationFrame(rafId);
    ScrollTrigger.removeEventListener("refresh", syncUI);
    tl.kill();
    gsap.set(canvas, { clearProps: "opacity" });
    ScrollTrigger.getAll().forEach((st) => {
      if (st?.vars?.trigger === hero) st.kill();
    });
  };
}
