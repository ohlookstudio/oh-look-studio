import projectsData from "../data/projects.json";
import gsap from "gsap";

// mountProjectShader intentionally disconnected — kept in src/hero/projectShader.js

export async function ProjectDetails({ slug } = {}) {
  const projects = projectsData.projects || [];
  const project  = projects.find((p) => p.slug === slug);

  if (!project) {
    return `
      <main class="page page--dark">
        <div class="page-inner">
          <h1 class="h1">Project not found</h1>
          <p><a class="nav__link" data-link href="/works">← Back to works</a></p>
        </div>
      </main>
    `;
  }

  return `
    <main class="project-detail">
      <div class="project-detail__layout">

        <!-- LEFT — scrolling title + body -->
        <div class="project-detail__left">

          <div class="project-detail__title-block">
            <a class="project-detail__back" data-flip-back href="/">← Back</a>
            <h1 class="project-detail__display">${project.title}</h1>

            <div class="project-detail__meta-row">
              <span class="project-detail__year kicker">${project.year ?? ""}</span>
              ${project.tags?.length
                ? `<span class="project-detail__tags kicker">${project.tags.join(" · ")}</span>`
                : ""}
            </div>

            ${project.services?.length ? `
              <div class="project-detail__services">
                <span class="project-detail__label">Services</span>
                <p class="muted">${project.services.join(" · ")}</p>
              </div>
            ` : ""}
          </div>

          <div class="project-detail__divider"></div>

          <div class="project-detail__body">
            <p class="project-detail__lead">${project.description ?? ""}</p>

            <p class="muted">
              Case study coming soon — this is where the scroll narrative
              lives: textures, editorial layout, motion references, the full story.
            </p>
          </div>

          <div class="project-detail__footer">
            <a class="btn btn--pill" data-flip-back href="/">← Back</a>
          </div>

        </div>

        <!-- RIGHT — sticky cover -->
        <div class="project-detail__right">
          <div class="project-detail__cover" id="projectCover">
            ${project.coverImage
              ? `<img class="project-detail__cover-img"
                      src="${project.coverImage}"
                      alt="${project.title}"
                      loading="eager"
                      style="opacity:0;visibility:hidden">`
              : ''}
          </div>
        </div>

      </div>
    </main>
  `;
}

ProjectDetails.init = function ({ slug } = {}) {
  const coverImg = document.querySelector(".project-detail__cover-img");
  const left     = document.querySelector(".project-detail__left");

  const flipOrigin  = window.__flipOrigin;
  window.__flipOrigin = null;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const tweens = [];
  let flipClone = null;

  if (flipOrigin && !reduceMotion && coverImg) {
    const { rect: first, src } = flipOrigin;

    // ── Create fixed clone at "First" position ───────────────────────────────
    flipClone = document.createElement("img");
    flipClone.src = src;
    flipClone.setAttribute("aria-hidden", "true");
    Object.assign(flipClone.style, {
      position:       "fixed",
      top:            `${first.top}px`,
      left:           `${first.left}px`,
      width:          `${first.width}px`,
      height:         `${first.height}px`,
      objectFit:      "cover",
      objectPosition: "center",
      zIndex:         "9998",
      pointerEvents:  "none",
      margin:         "0",
      display:        "block",
      willChange:     "transform",
    });
    document.body.appendChild(flipClone);

    // ── "Last" position (forces synchronous layout) ──────────────────────────
    const last = coverImg.getBoundingClientRect();

    const dx     = last.left - first.left;
    const dy     = last.top  - first.top;
    const scaleX = last.width  / first.width;
    const scaleY = last.height / first.height;

    // ── Animate clone: First → Last; reveal real img on complete ────────────
    const t1 = gsap.to(flipClone, {
      x:             dx,
      y:             dy,
      scaleX,
      scaleY,
      transformOrigin: "top left",
      duration:      0.72,
      ease:          "power2.inOut",
      onComplete() {
        if (flipClone?.parentNode) flipClone.remove();
        flipClone = null;
        // autoAlpha: opacity 0→1 + visibility hidden→visible
        gsap.to(coverImg, { autoAlpha: 1, duration: 0.22, ease: "power1.in" });
      },
    });
    tweens.push(t1);

    // ── Fade-in left column with slight delay ────────────────────────────────
    if (left) {
      gsap.set(left, { opacity: 0, y: 14 });
      const t2 = gsap.to(left, {
        opacity:  1,
        y:        0,
        duration: 0.52,
        delay:    0.18,
        ease:     "power2.out",
      });
      tweens.push(t2);
    }
  } else {
    // Fallback: reveal image via autoAlpha (PageTransition handles page veil)
    if (coverImg) {
      tweens.push(
        gsap.to(coverImg, { autoAlpha: 1, duration: 0.6, ease: "power2.out" })
      );
    }
  }

  return () => {
    tweens.forEach((t) => t?.kill());
    if (flipClone?.parentNode) flipClone.remove();
  };
};
