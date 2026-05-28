// src/router/router.js
import { routes } from "./routes.js";
import { PageTransition } from "../components/PageTransition.js";
import { Layout } from "../components/Layout.js";

let currentCleanup = null;
let currentPathname = null;

/* ---------------------------------------------------
   Motion helpers (breathe + flicker)
--------------------------------------------------- */
let activeLinkEl = null;
let flickerTimer = null;

const mediaReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const prefersReducedMotion = !!mediaReduce?.matches;

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function updateBreatheVar() {
  if (prefersReducedMotion) return;

  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  const p = clamp01(window.scrollY / max);
  const breathe = Math.sin(p * Math.PI);

  doc.style.setProperty("--pill-breathe", breathe.toFixed(3));
}

let scrollRaf = null;
function onScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    updateBreatheVar();
  });
}

function clearFlicker() {
  if (flickerTimer) clearTimeout(flickerTimer);
  flickerTimer = null;
  if (activeLinkEl) activeLinkEl.classList.remove("is-flicker");
}

function scheduleFlicker() {
  clearFlicker();
  if (prefersReducedMotion) return;

  activeLinkEl = document.querySelector(
    '.nav--desktop .nav__link[data-link][aria-current="page"]'
  );
  if (!activeLinkEl) return;

  const delay = 12000 + Math.random() * 13000;

  flickerTimer = setTimeout(() => {
    if (!activeLinkEl || activeLinkEl.getAttribute("aria-current") !== "page") {
      scheduleFlicker();
      return;
    }

    activeLinkEl.classList.add("is-flicker");
    setTimeout(() => activeLinkEl?.classList.remove("is-flicker"), 90);

    setTimeout(() => {
      if (!activeLinkEl) return;
      activeLinkEl.classList.add("is-flicker");
      setTimeout(() => activeLinkEl?.classList.remove("is-flicker"), 70);
    }, 160);

    scheduleFlicker();
  }, delay);
}

function refreshActiveEffects() {
  scheduleFlicker();
  updateBreatheVar();
}

/* ---------------------------------------------------
   Router helpers
--------------------------------------------------- */
function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function pathToRegex(path) {
  const pattern = path.replace(/\//g, "\\/").replace(/:\w+/g, "([^/]+)");
  return new RegExp(`^${pattern}$`);
}

function getParams(match, route) {
  const keys = (route.path.match(/:(\w+)/g) || []).map((k) => k.slice(1));
  const values = match.slice(1);
  return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
}

function findRoute(pathname) {
  for (const route of routes) {
    const match = pathname.match(pathToRegex(route.path));
    if (match) return { route, params: getParams(match, route) };
  }
  return null;
}

function setActiveNav(pathname) {
  const cleanPath = normalizePath(pathname);
  const links = document.querySelectorAll("a[data-link]");

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

function onLinkClick(e) {
  const a = e.target.closest("a[data-link]");
  if (!a) return;

  // permitir nueva pestaña / modificadores
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target === "_blank") return;

  const url = new URL(a.href);
  if (url.origin !== window.location.origin) return;

  e.preventDefault();
  navigate(url.pathname);
}

/* ---------------------------------------------------
   Scroll control
--------------------------------------------------- */
function forceScrollTop() {
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

function raf2(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

/* ---------------------------------------------------
   Layout mount (Header + #view + Footer persist)
--------------------------------------------------- */
function ensureLayoutMounted(rootEl) {
  if (!rootEl) throw new Error("rootEl is required");
  if (document.getElementById("view")) return;

  rootEl.innerHTML = Layout();
}

/* ---------------------------------------------------
   Navigation
--------------------------------------------------- */
export async function navigate(path) {
  const next = normalizePath(path);
  const current = normalizePath(window.location.pathname);
  if (next === current) return;

  await PageTransition.out();

  try {
    forceScrollTop();
    window.history.pushState({}, "", next);

    await renderRoute();

    window.dispatchEvent(
      new CustomEvent("ohlook:navigated", { detail: { path: next } })
    );
  } catch (err) {
    console.warn("[router] navigate error:", err);
    PageTransition.reset();
    throw err;
  } finally {
    await PageTransition.in();
  }
}

export function mountRouter({ rootEl }) {
  if (!rootEl) throw new Error("rootEl is required");

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  // ✅ Monta Layout una sola vez (si no está montado ya)
  ensureLayoutMounted(rootEl);

  document.addEventListener("click", onLinkClick);
  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("popstate", async () => {
    await PageTransition.out();

    try {
      forceScrollTop();
      await renderRoute();

      window.dispatchEvent(
        new CustomEvent("ohlook:navigated", {
          detail: { path: normalizePath(window.location.pathname) },
        })
      );
    } catch (err) {
      console.warn("[router] popstate error:", err);
      PageTransition.reset();
      throw err;
    } finally {
      await PageTransition.in();
    }
  });

  renderRoute();
  updateBreatheVar();
}

/* ---------------------------------------------------
   Render
--------------------------------------------------- */
async function renderRoute() {
  const viewEl = document.getElementById("view");
  const headerEl = document.getElementById("siteHeader");
  if (!viewEl) return;

  const pathname = normalizePath(window.location.pathname);
  const found = findRoute(pathname);

  if (currentPathname !== null && pathname !== currentPathname) {
    forceScrollTop();
  }
  currentPathname = pathname;

  // cleanup de la vista anterior (hero, gsap, etc.)
  if (typeof currentCleanup === "function") {
    try { currentCleanup(); }
    catch (err) { console.warn("[router] cleanup error:", err); }
    finally { currentCleanup = null; }
  }

  // header show/hide según ruta
  if (headerEl) {
    if (pathname === "/") {
      headerEl.classList.add("is-hidden");
      headerEl.classList.remove("is-visible");
    } else {
      headerEl.classList.remove("is-hidden");
      headerEl.classList.add("is-visible");
    }
  }

  if (!found) {
    viewEl.innerHTML = `
      <section class="page section section--tall">
        <h2>404</h2>
        <p>Esta página no existe.</p>
        <p><a class="nav__link" data-link href="/">Volver a Home</a></p>
      </section>
    `;
    raf2(() => {
      setActiveNav(pathname);
      refreshActiveEffects();
      updateBreatheVar();
    });
    return;
  }

  const html = await found.route.view(found.params);
  viewEl.innerHTML = html;

  // init de la vista (debe devolver cleanup)
  if (found.route.view.init) {
    const maybeCleanup = found.route.view.init(found.params);
    if (typeof maybeCleanup === "function") currentCleanup = maybeCleanup;
  }

  raf2(() => {
    setActiveNav(pathname);
    refreshActiveEffects();
    updateBreatheVar();
  });
}
