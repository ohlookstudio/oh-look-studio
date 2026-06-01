// src/components/footerTextCanvas.js
export function mountFooterTextCanvas() {
  const canvas = document.getElementById("footerTextCanvas");
  const footer = document.querySelector(".site-footer");
  if (!canvas || !footer) return () => {};

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduce) return () => {};

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};

  // -------------------------
  // Tunables (look)
  // -------------------------
  const DPR_CAP = 2;

  const TEXT = "Let’s talk.";
  const FONT_FAMILY = `"Space Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, Inter, Arial, sans-serif`;
  const FONT_WEIGHT = 520;

  // 180px at 1440px frame → 12.5% of viewport width
  const FONT_RATIO = 180 / 1440;
  const MIN_FONT = 60;

  const Y_RATIO_DESKTOP = 0.52;
  const Y_RATIO_MOBILE = 0.47;

  const PARTICLES_MIN = 1800;
  const PARTICLES_MAX = 4200;

  const STEP_DESKTOP = 2;
  const STEP_MOBILE = 2;

  const DOT_SIZE = 1.25;
  const DOT_SIZE_HOVER = 1.45;
  const TWINKLE = 0.22;

  // ✅ a bit smaller radius on mobile to reduce “push” jitter
  const RADIUS_DESKTOP = 220;
  const RADIUS_MOBILE = 180;

  const EDGE_STRENGTH = 2.0;
  const RETURN_EASE = 0.065;
  const NOISE_SPEED = 0.0013;

  const GHOST_ALPHA = 0.12;
  const GHOST_ALPHA_HOVER = 0.06;
  const HALO_ALPHA = 0.16;
  const HALO_BLUR = 18;
  const GHOST_BLUR = 10;

  const TARGET_FPS = 60;
  const LOW_FPS = 30;
  const LOW_FPS_THRESHOLD = 38;

  // -------------------------
  // State
  // -------------------------
  let w = 0, h = 0, dpr = 1;
  let raf = 0;

  let points = [];
  let lastT = 0;

  let tx = -9999, ty = -9999;
  let mx = -9999, my = -9999;
  let hover = 0;
  let targetHover = 0;

  let sampleBuf = null, sctx = null;
  let ghostBuf = null, gctx = null;

  let fpsMode = TARGET_FPS;
  let accum = 0;
  let fpsCheckAcc = 0;
  let fpsFrames = 0;

  let innerRectCache = null;

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function isMobile() {
    const vw = window.innerWidth || 1200;
    return vw < 720;
  }

  function getStep() {
    return isMobile() ? STEP_MOBILE : STEP_DESKTOP;
  }

  function getRadius() {
    return isMobile() ? RADIUS_MOBILE : RADIUS_DESKTOP;
  }

  function getYRatio() {
    return isMobile() ? Y_RATIO_MOBILE : Y_RATIO_DESKTOP;
  }

  function getParticleTarget() {
    const vw = window.innerWidth || 1200;
    const t = clamp01((vw - 420) / 980);
    return Math.round(lerp(PARTICLES_MIN, PARTICLES_MAX, t));
  }

  function getDesiredFont() {
    const vw = window.innerWidth || 1440;
    return Math.max(MIN_FONT, Math.round(vw * FONT_RATIO));
  }

  function measureInnerRect() {
    const inner = footer.querySelector(".site-footer__inner");
    const r = inner?.getBoundingClientRect() || footer.getBoundingClientRect();
    innerRectCache = r;
    return r;
  }

  function fitFontSizeToWidth(fontSize) {
    const pad = isMobile() ? 12 : 16;
    const maxW = Math.max(1, w - pad);

    sctx.save();
    sctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
    const m = sctx.measureText(TEXT);
    sctx.restore();

    if (!m?.width) return fontSize;
    if (m.width <= maxW) return fontSize;

    const scale = maxW / m.width;
    return Math.max(MIN_FONT, Math.min(fontSize, Math.floor(fontSize * scale)));
  }

  function resize() {
    // ✅ use wrapper if present (consistent across browsers)
    const wrap = footer.querySelector(".site-footer__canvas");
    const r = wrap?.getBoundingClientRect() || measureInnerRect();

    dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
    w = Math.max(1, Math.floor(r.width));

    // ✅ read CSS height (Safari/Chrome consistency)
    const cssH = wrap ? parseFloat(getComputedStyle(wrap).height) : 260;
    h = Math.max(180, Math.round(cssH || 260));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sampleBuf = document.createElement("canvas");
    sampleBuf.width = w;
    sampleBuf.height = h;
    sctx = sampleBuf.getContext("2d", { willReadFrequently: true });

    ghostBuf = document.createElement("canvas");
    ghostBuf.width = w;
    ghostBuf.height = h;
    gctx = ghostBuf.getContext("2d");

    build();
  }

  function build() {
    if (!sctx || !gctx) return;

    const step = getStep();
    const pTarget = getParticleTarget();

    sctx.clearRect(0, 0, w, h);

    let fontSize = getDesiredFont();
    fontSize = fitFontSizeToWidth(fontSize);

    const x = 0;
    const y = h * getYRatio();

    // sample mask
    sctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
    sctx.textAlign = "left";
    sctx.textBaseline = "middle";
    sctx.fillStyle = "rgba(255,255,255,1)";
    sctx.fillText(TEXT, x, y);

    const img = sctx.getImageData(0, 0, w, h).data;

    points = [];
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        const a = img[(py * w + px) * 4 + 3];
        if (a > 10) {
          points.push({
            x: px,
            y: py,
            ox: px,
            oy: py,
            a: 0.50 + Math.random() * 0.50,
            n: Math.random() * 1000
          });
        }
      }
    }

    // downsample to target count
    if (points.length > pTarget) {
      const stride = Math.ceil(points.length / pTarget);
      points = points.filter((_, i) => i % stride === 0);
    }

    // ghost pre-render
    gctx.clearRect(0, 0, w, h);
    gctx.save();
    gctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
    gctx.textAlign = "left";
    gctx.textBaseline = "middle";

    gctx.globalCompositeOperation = "source-over";
    gctx.shadowColor = `rgba(0,0,0,${HALO_ALPHA})`;
    gctx.shadowBlur = HALO_BLUR;
    gctx.fillStyle = `rgba(0,0,0,1)`;
    gctx.fillText(TEXT, x, y);

    gctx.shadowColor = `rgba(243,243,243,0.45)`;
    gctx.shadowBlur = GHOST_BLUR;
    gctx.fillStyle = `rgba(243,243,243,1)`;
    gctx.fillText(TEXT, x, y);

    gctx.restore();
  }

  function updatePointer(e) {
    const wrap = footer.querySelector(".site-footer__canvas");
    const r = wrap?.getBoundingClientRect() || innerRectCache || measureInnerRect();

    tx = e.clientX - r.left;
    ty = e.clientY - r.top;

    const inside =
      e.clientX >= r.left && e.clientX <= r.right &&
      e.clientY >= r.top && e.clientY <= r.bottom;

    targetHover = inside ? 1 : 0;
  }

  function drawFrame(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;

    hover = lerp(hover, targetHover, 0.08);
    mx = lerp(mx, tx, 0.18);
    my = lerp(my, ty, 0.18);

    ctx.clearRect(0, 0, w, h);

    if (ghostBuf) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = (GHOST_ALPHA - (GHOST_ALPHA_HOVER * hover));
      ctx.drawImage(ghostBuf, 0, 0);
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const baseSize = DOT_SIZE + (DOT_SIZE_HOVER - DOT_SIZE) * hover;
    const R = getRadius();

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const k = clamp01(1 - dist / R) * hover;

      const ang = Math.atan2(dy, dx);
      const noise = Math.sin((t * NOISE_SPEED) + p.n) * 0.5 + 0.5;

      const push = k * EDGE_STRENGTH * (6 + 22 * noise);

      const tx2 = p.ox + Math.cos(ang) * push;
      const ty2 = p.oy + Math.sin(ang) * push;

      p.x = lerp(p.x, tx2, 0.16);
      p.y = lerp(p.y, ty2, 0.16);

      p.x = lerp(p.x, p.ox, RETURN_EASE * (1 - k));
      p.y = lerp(p.y, p.oy, RETURN_EASE * (1 - k));

      const tw = 1 + TWINKLE * Math.sin(t * 0.002 + p.n);
      const alpha = p.a * (0.42 + 0.58 * (1 - k * 0.65)) * (0.85 + 0.15 * tw);

      ctx.fillStyle = `rgba(243,243,243,${alpha})`;
      ctx.fillRect(p.x, p.y, baseSize * tw, baseSize * tw);
    }

    ctx.restore();
  }

  function tick(t) {
    const targetDt = 1000 / fpsMode;
    accum += (t - lastT) || targetDt;

    if (accum >= targetDt) {
      drawFrame(t);
      accum = 0;
    }

    fpsCheckAcc += (t - lastT) || 16;
    fpsFrames += 1;
    if (fpsCheckAcc > 900) {
      const fps = (fpsFrames * 1000) / fpsCheckAcc;
      fpsMode = fps < LOW_FPS_THRESHOLD ? LOW_FPS : TARGET_FPS;
      fpsCheckAcc = 0;
      fpsFrames = 0;
    }

    raf = requestAnimationFrame(tick);
  }

  const onMove = (e) => updatePointer(e);
  const onEnter = () => { targetHover = 1; };
  const onLeave = () => { targetHover = 0; };

  // ✅ ensure fonts loaded (Safari)
  const start = () => {
    resize();
    window.addEventListener("resize", resize);

    // Hover only when pointer exists (prevents weird iOS “sticky hover”)
    const canHover = window.matchMedia?.("(hover: hover)")?.matches;
    if (canHover) {
      footer.addEventListener("pointermove", onMove, { passive: true });
      footer.addEventListener("pointerenter", onEnter, { passive: true });
      footer.addEventListener("pointerleave", onLeave, { passive: true });
    }

    raf = requestAnimationFrame((t0) => {
      lastT = t0;
      raf = requestAnimationFrame(tick);
    });
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(start).catch(start);
  } else {
    start();
  }

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);

    footer.removeEventListener("pointermove", onMove);
    footer.removeEventListener("pointerenter", onEnter);
    footer.removeEventListener("pointerleave", onLeave);

    ctx.clearRect(0, 0, w, h);
    points = [];
    sampleBuf = null; sctx = null;
    ghostBuf = null; gctx = null;
  };
}
