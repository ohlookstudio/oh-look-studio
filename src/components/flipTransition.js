import { navigate } from "../router/router.js";
import { PageTransition } from "./PageTransition.js";

const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

/* ── Forward: project card → detail ───────────────────────────── */
function handleForwardFlip(e, a) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target === "_blank") return;

  let url;
  try { url = new URL(a.href); } catch { return; }
  if (url.origin !== location.origin) return;

  e.preventDefault();
  e.stopPropagation();

  if (reduceMotion) {
    navigate(url.pathname);
    return;
  }

  const img = a.querySelector(".hf-card__img");
  if (!img) {
    navigate(url.pathname);
    return;
  }

  window.__flipOrigin = {
    rect: img.getBoundingClientRect(),
    src:  img.src,
  };

  PageTransition.skip();
  navigate(url.pathname);
}

/* ── Reverse: detail back button → home ───────────────────────── */
function handleReverseFlip(e, back) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  let url;
  try { url = new URL(back.href); } catch { return; }
  if (url.origin !== location.origin) return;

  e.preventDefault();
  e.stopPropagation();

  if (reduceMotion) {
    navigate(url.pathname);
    return;
  }

  const coverImg = document.querySelector(".project-detail__cover-img");
  const slug = window.location.pathname.split("/projects/")[1];

  if (!coverImg || !slug) {
    navigate(url.pathname);
    return;
  }

  window.__flipReturn = {
    rect: coverImg.getBoundingClientRect(),
    src:  coverImg.src,
    slug,
  };

  PageTransition.skip();
  navigate(url.pathname);
}

/* ── Single capture-phase listener ────────────────────────────── */
function onAnyClick(e) {
  const projectLink = e.target.closest("a[data-project-link]");
  if (projectLink) { handleForwardFlip(e, projectLink); return; }

  const backLink = e.target.closest("[data-flip-back]");
  if (backLink) handleReverseFlip(e, backLink);
}

export function initFlipTransitions() {
  document.addEventListener("click", onAnyClick, true);
}
