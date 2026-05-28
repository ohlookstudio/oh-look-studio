// src/components/menu.js

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

let isOpen = false;
let lastFocused = null;

// Scroll lock
let savedScrollY = 0;
let savedPadRight = "";
let savedHtmlOverflow = "";
let savedBodyOverflow = "";
let useFixedLock = false;

// Canvas dust
let dustRAF = 0;
let dustCtx = null;
let dustCanvas = null;
let dustW = 0;
let dustH = 0;
let dustDPR = 1;
let dustParticles = [];
let lastT = 0;

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function syncMobileActiveLink() {
  const mobileNav = qs("#mobileNav");
  if (!mobileNav) return;

  const cleanPath = normalizePath(window.location.pathname);
  const links = mobileNav.querySelectorAll(".nav__link[data-link]");

  links.forEach((a) => {
    const href = normalizePath(a.getAttribute("href") || "");
    const isActive =
      href === cleanPath ||
      (href !== "/" && cleanPath.startsWith(href + "/")) ||
      (href !== "/" && cleanPath.startsWith(href));

    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function ensureMobileNavOnBody() {
  const mobileNav = qs("#mobileNav");
  if (!mobileNav) return null;

  if (mobileNav.parentElement !== document.body) {
    document.body.appendChild(mobileNav);
  }
  return mobileNav;
}

// Scroll lock
function lockScroll() {
  savedScrollY = window.scrollY || 0;

  const sbw = getScrollbarWidth();
  savedPadRight = document.body.style.paddingRight;
  if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

  useFixedLock = isIOS();

  savedHtmlOverflow = document.documentElement.style.overflow;
  savedBodyOverflow = document.body.style.overflow;

  if (useFixedLock) {
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  } else {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
}

function unlockScroll() {
  const top = document.body.style.top;

  document.documentElement.style.overflow = savedHtmlOverflow;
  document.body.style.overflow = savedBodyOverflow;

  if (useFixedLock) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
  }

  document.body.style.paddingRight = savedPadRight;

  const y = top ? Math.abs(parseInt(top, 10)) : savedScrollY;
  window.scrollTo(0, y);
}

// Focus trap
function getFocusableInside(root) {
  if (!root) return [];
  return qsa(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    root
  ).filter((el) => {
    const s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden";
  });
}

function trapTabKey(e, container) {
  if (e.key !== "Tab") return;

  const f = getFocusableInside(container);
  if (!f.length) return;

  const first = f[0];
  const last = f[f.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// Dust canvas
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setupDustCanvas() {
  dustCanvas = qs("#menuCanvas");
  if (!dustCanvas) return;

  dustCtx = dustCanvas.getContext("2d", { alpha: true });
  resizeDustCanvas();
  buildDustParticles();
}

function resizeDustCanvas() {
  if (!dustCanvas || !dustCtx) return;

  const panel = qs("#mobileNav .mobile-nav__panel");
  const rect = (panel || dustCanvas.parentElement).getBoundingClientRect();

  dustDPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  dustW = Math.floor(rect.width);
  dustH = Math.floor(rect.height);

  dustCanvas.width = dustW * dustDPR;
  dustCanvas.height = dustH * dustDPR;
  dustCanvas.style.width = `${dustW}px`;
  dustCanvas.style.height = `${dustH}px`;

  dustCtx.setTransform(dustDPR, 0, 0, dustDPR, 0, 0);
}

function buildDustParticles() {
  const area = dustW * dustH;
  const count = Math.round(Math.min(220, Math.max(90, area / 7000)));

  const palette = [
    "rgba(243,243,243,0.30)",
    "rgba(243,243,243,0.14)",
    "rgba(160,198,175,0.14)",
    "rgba(203,104,104,0.10)",
  ];

  dustParticles = Array.from({ length: count }).map(() => ({
    x: rand(-40, dustW + 40),
    y: rand(-40, dustH + 40),
    r: rand(0.6, 1.6),
    a: rand(0.25, 0.75),
    c: pick(palette),
    vx: rand(-0.08, 0.08),
    vy: rand(-0.12, 0.06),
    w: rand(0.6, 1.8),
    p: rand(0, Math.PI * 2),
  }));
}

function drawDust(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;

  if (!dustCtx) return;

  dustCtx.clearRect(0, 0, dustW, dustH);

  for (const p of dustParticles) {
    p.p += dt * p.w;
    p.x += (p.vx + Math.cos(p.p) * 0.03) * 60 * dt;
    p.y += (p.vy + Math.sin(p.p) * 0.03) * 60 * dt;

    if (p.x < -30) p.x = dustW + 30;
    if (p.x > dustW + 30) p.x = -30;
    if (p.y < -30) p.y = dustH + 30;
    if (p.y > dustH + 30) p.y = -30;

    const a = p.a * (0.8 + 0.2 * Math.sin(p.p));
    dustCtx.fillStyle = p.c.replace(/0\.\d+\)$/, `${a.toFixed(3)})`);

    dustCtx.beginPath();
    dustCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    dustCtx.fill();
  }

  dustRAF = requestAnimationFrame(drawDust);
}

function startDust() {
  stopDust();
  setupDustCanvas();
  lastT = performance.now();
  dustRAF = requestAnimationFrame(drawDust);
}

function stopDust() {
  if (dustRAF) cancelAnimationFrame(dustRAF);
  dustRAF = 0;
  dustCtx?.clearRect(0, 0, dustW, dustH);
}

// Menu open / close
function openMenu() {
  const toggleBtn = qs("#navToggle");
  const mobileNav = ensureMobileNavOnBody();
  const panel = qs("#mobileNav .mobile-nav__panel");

  if (!toggleBtn || !mobileNav || !panel || isOpen) return;

  isOpen = true;
  lastFocused = document.activeElement;

  lockScroll();

  document.body.classList.add("is-menu-open");
  mobileNav.setAttribute("aria-hidden", "false");
  toggleBtn.setAttribute("aria-expanded", "true");

  // ✅ siempre correcto al abrir
  syncMobileActiveLink();

  startDust();
  qs(".mobile-nav__links a", mobileNav)?.focus();
}

function closeMenu() {
  const toggleBtn = qs("#navToggle");
  const mobileNav = qs("#mobileNav");

  if (!toggleBtn || !mobileNav || !isOpen) return;

  isOpen = false;

  document.body.classList.remove("is-menu-open");
  mobileNav.setAttribute("aria-hidden", "true");
  toggleBtn.setAttribute("aria-expanded", "false");

  stopDust();
  unlockScroll();

  lastFocused?.focus?.();
}

function toggleMenu() {
  isOpen ? closeMenu() : openMenu();
}

// Init
export function initMobileMenu() {
  if (window.__OHLOOK_MENU_DESTROY__) {
    window.__OHLOOK_MENU_DESTROY__();
  }

  ensureMobileNavOnBody();
  setupDustCanvas();

  // ✅ initial sync
  syncMobileActiveLink();

  const onDocClick = (e) => {
    const toggle = e.target.closest("#navToggle");
    if (toggle) {
      e.preventDefault();
      toggleMenu();
      return;
    }

    if (!isOpen) return;

    if (e.target.closest("#mobileNav [data-close]")) {
      closeMenu();
      return;
    }

    // ✅ FIX CRÍTICO: navegación explícita desde el menú móvil (Safari-proof)
    const mobileLink = e.target.closest("#mobileNav a[data-link]");
    if (mobileLink) {
      e.preventDefault();

      const href = mobileLink.getAttribute("href") || "/";
      closeMenu();

      // Import dinámico para evitar imports circulares
      import("../router/router.js").then(({ navigate }) => navigate(href));
      return;
    }
  };

  const onKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") closeMenu();
    trapTabKey(e, qs("#mobileNav .mobile-nav__panel"));
  };

  const onResize = () => {
    if (!matchMedia("(max-width: 860px)").matches) closeMenu();
    if (isOpen) {
      resizeDustCanvas();
      buildDustParticles();
    }
  };

  // ✅ back/forward
  const onPopState = () => syncMobileActiveLink();

  // ✅ pushState navigation (si tu router emite este evento)
  const onNavigated = () => {
    syncMobileActiveLink();
    if (isOpen) {
      resizeDustCanvas();
      buildDustParticles();
    }
  };

  document.addEventListener("click", onDocClick, true);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
  window.addEventListener("popstate", onPopState);
  window.addEventListener("ohlook:navigated", onNavigated);

  window.__OHLOOK_MENU_DESTROY__ = () => {
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("popstate", onPopState);
    window.removeEventListener("ohlook:navigated", onNavigated);
    closeMenu();
  };
}
