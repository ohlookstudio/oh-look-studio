// src/hero/bgParticles.js
export function mountBgParticles() {
  const canvas = document.getElementById("bgParticles");
  if (!canvas) return () => {};

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduce) return () => {}; // accesibilidad: sin animación

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};

  // --- tunables (feel) ---
  const DPR_CAP = 2;

  // Densidad base (partículas por pixel)
  const BASE_DENSITY = 0.00007;

  // Qué rápido “alcanza” el target (llenado)
  const SPAWN_RATE = 0.9;

  // Movimiento
  const SPEED_MIN = 0.12;
  const SPEED_MAX = 0.55;
  const DRIFT = 0.18;

  // Vida
  const TWINKLE = 0.35; // 0..1
  const SIZE_MIN = 0.7;
  const SIZE_MAX = 2.2;

  // ✅ Doble spawn (hero/top baja + footer sube)
  const TOP_SPAWN_MIX = 0.50; // 0..1 porcentaje que nace arriba (en steady state)

  // ✅ Boost inicial para “llenar” rápido
  const FILL_BOOST = 2.2;
  const BOOST_SECS = 1.2;

  // ✅ NUEVO: durante el boost, forzamos más nacimientos desde abajo
  const BOOST_TOP_MIX = 0.18; // arriba durante boost (más bajo = más desde footer al inicio)

  // Color: blanco sutil
  const COLOR = "rgba(243,243,243,";

  let w = 0,
    h = 0,
    dpr = 1;
  let raf = 0;
  let particles = [];
  let lastT = 0;
  let bornAt = performance.now();

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.round(w * h * BASE_DENSITY);
    if (particles.length > target) particles.length = target;
  }

  // Fuente inferior (footer): suben
  function footerSpawnY() {
    const footer = document.querySelector(".site-footer");
    if (!footer) {
      // ✅ si no hay footer aún, nace justo debajo del viewport (se ve enseguida)
      return h + rand(6, 26);
    }

    const rect = footer.getBoundingClientRect();
    const y = rect.top + rect.height * 0.75;

    // ✅ Si el footer está cerca/visible, nace “desde el footer real”
    if (y > -200 && y < h + 300) return y;

    // ✅ Si no, nace justo debajo del viewport (para que se vea subir ya)
    return h + rand(6, 26);
  }

  // Fuente superior (hero/top): bajan
  function heroSpawnY() {
    const hero = document.querySelector("#hero, .hero");
    if (!hero) return -rand(6, 26);

    const rect = hero.getBoundingClientRect();
    const y = rect.top + rect.height * 0.25;

    // Si el hero está “por ahí” (aunque no visible), nace cerca; si no, offscreen arriba
    return y < h + 200 ? y : -rand(6, 26);
  }

  /**
   * dir: -1 => sube (nace abajo/footer)
   * dir: +1 => baja (nace arriba/hero)
   */
  function spawnOne(dir) {
    const fromTop = dir === 1;
    const y0 = fromTop ? heroSpawnY() : footerSpawnY();

    particles.push({
      x: rand(0, w),
      y: y0 + rand(-18, 18),
      vx: rand(-DRIFT, DRIFT),
      vy: rand(SPEED_MIN, SPEED_MAX),
      dir,
      r: rand(SIZE_MIN, SIZE_MAX),
      a: rand(0.10, 0.55),
      phase: rand(0, Math.PI * 2),
      tw: rand(0.6, 1.4),
    });
  }

  function retune(p) {
    p.vy = rand(SPEED_MIN, SPEED_MAX);
    p.vx = rand(-DRIFT, DRIFT);
    p.r = rand(SIZE_MIN, SIZE_MAX);
    p.a = rand(0.10, 0.55);
    p.phase = rand(0, Math.PI * 2);
    p.tw = rand(0.6, 1.4);
  }

  function ensurePopulation(dt) {
    const target = Math.round(w * h * BASE_DENSITY);
    const births = Math.max(0, target - particles.length);

    const elapsed = (performance.now() - bornAt) / 1000;
    const isBoost = elapsed < BOOST_SECS;
    const boost = isBoost ? FILL_BOOST : 1;

    const n = Math.min(births, Math.ceil((dt * 60) * SPAWN_RATE * boost));

    // ✅ durante boost: más desde abajo (footer) para que “nazca desde footer” de verdad
    const mix = isBoost ? BOOST_TOP_MIX : TOP_SPAWN_MIX;

    for (let i = 0; i < n; i++) {
      const fromTop = Math.random() < mix;
      spawnOne(fromTop ? 1 : -1);
    }
  }

  function draw(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;

    ensurePopulation(dt);

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // movimiento (según dirección)
      p.y += p.dir * p.vy * (dt * 60);
      p.x += p.vx * (dt * 60);

      // wrap X
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      // twinkle sutil
      const tw = 1 + Math.sin((t / 1000) * p.tw + p.phase) * 0.5 * TWINKLE;
      const alpha = Math.max(0, Math.min(1, p.a * tw));

      // wrap vertical según dirección
      if (p.dir === -1 && p.y < -40) {
        // sube -> renace abajo
        p.y = footerSpawnY() + rand(10, 40);
        p.x = rand(0, w);
        retune(p);
      } else if (p.dir === 1 && p.y > h + 40) {
        // baja -> renace arriba
        p.y = heroSpawnY() + rand(-40, -10);
        p.x = rand(0, w);
        retune(p);
      }

      // draw
      ctx.beginPath();
      ctx.fillStyle = `${COLOR}${alpha.toFixed(3)})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  const onResize = () => resize();

  resize();
  window.addEventListener("resize", onResize);

  raf = requestAnimationFrame((t) => {
    lastT = t;
    draw(t);
  });

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    particles = [];
    ctx.clearRect(0, 0, w, h);
  };
}
