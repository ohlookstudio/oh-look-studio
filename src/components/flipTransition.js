import { navigate } from "../router/router.js";
import { PageTransition } from "./PageTransition.js";

const reduceMotion =
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const supportsVT = typeof document.startViewTransition === "function";

/* ── Forward: project card → detail ─────────────────────────────────────── */
function handleForwardFlip(e, a) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target === "_blank") return;

  let url;
  try {
    url = new URL(a.href);
  } catch {
    return;
  }

  if (url.origin !== location.origin) return;

  e.preventDefault();
  e.stopPropagation();

  window.__projectReferrer = location.pathname;
  window.__flipScrollY = window.scrollY;

  const img = a.querySelector("img");

  if (!supportsVT || reduceMotion || !img) {
    navigate(url.pathname);
    return;
  }

  img.style.viewTransitionName = "project-cover";
  window.__vtaActive = "forward";
  PageTransition.skip();

  const vt = document.startViewTransition(async () => {
    await navigate(url.pathname);

    const cover = document.querySelector(".project-detail__cover-img");
    if (cover) {
      cover.style.viewTransitionName = "project-cover";
    }
  });

  vt.finished
    .then(() => {
      img.style.viewTransitionName = "";

      const cover = document.querySelector(".project-detail__cover-img");
      if (cover) cover.style.viewTransitionName = "";

      window.__vtaActive = null;
    })
    .catch(() => {
      img.style.viewTransitionName = "";
      window.__vtaActive = null;
    });
}

/* ── Reverse: detail back → home / works ─────────────────────────────────── */
function handleReverseFlip(e, back) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  let url;
  try {
    url = new URL(back.href);
  } catch {
    return;
  }

  if (url.origin !== location.origin) return;

  e.preventDefault();
  e.stopPropagation();

  const referrer = window.__projectReferrer || "/";
  const targetPath = referrer === "/" || referrer === "/works" ? referrer : "/";
  const slug = window.location.pathname.split("/projects/")[1];

  window.__projectReferrer = null;

  if (!supportsVT || reduceMotion || targetPath === "/works") {
    navigate(targetPath);
    return;
  }

  const coverImg = document.querySelector(".project-detail__cover-img");

  if (!coverImg || !slug) {
    navigate(targetPath);
    return;
  }

  coverImg.style.viewTransitionName = "project-cover";
  window.__flipReturnSlug = slug;
  window.__vtaActive = "backward";
  PageTransition.skip();

  const vt = document.startViewTransition(async () => {
    await navigate(targetPath);

    const card = document.querySelector(`a[href="/projects/${slug}"] img`);
    if (card) {
      card.style.viewTransitionName = "project-cover";
    }
  });

  vt.finished
    .then(() => {
      coverImg.style.viewTransitionName = "";

      const card = document.querySelector(`a[href="/projects/${slug}"] img`);
      if (card) card.style.viewTransitionName = "";

      window.__flipReturnSlug = null;
      window.__vtaActive = null;
    })
    .catch(() => {
      coverImg.style.viewTransitionName = "";
      window.__flipReturnSlug = null;
      window.__vtaActive = null;
    });
}

/* ── Single capture-phase listener ──────────────────────────────────────── */
function onAnyClick(e) {
  const projectLink = e.target.closest("a[data-project-link]");
  if (projectLink) {
    handleForwardFlip(e, projectLink);
    return;
  }

  const backLink = e.target.closest("[data-flip-back]");
  if (backLink) {
    handleReverseFlip(e, backLink);
  }
}

export function initFlipTransitions() {
  document.addEventListener("click", onAnyClick, true);

  return () => {
    document.removeEventListener("click", onAnyClick, true);
  };
}