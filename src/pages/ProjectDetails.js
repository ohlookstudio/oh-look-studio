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

  const vtaMode    = window.__vtaActive;
  window.__vtaActive = null;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const supportsVT   = typeof document.startViewTransition === "function";

  const tweens = [];

  if (vtaMode === "forward" && supportsVT && !reduceMotion && coverImg) {
    // VTA handles the spatial animation — just make the cover visible and name it
    // so the browser's "after" snapshot captures the real image, not an opacity:0 ghost
    coverImg.style.opacity    = "";
    coverImg.style.visibility = "";
    coverImg.style.viewTransitionName = "project-cover";
  } else {
    // Fallback: GSAP fade (no VTA or reduced motion)
    if (coverImg) {
      const dur = reduceMotion ? 0.3 : 0.6;
      tweens.push(
        gsap.to(coverImg, { autoAlpha: 1, duration: dur, ease: "power2.out" })
      );
    }
  }

  // Left column entrance — always plays regardless of VTA
  if (left) {
    gsap.set(left, { opacity: 0, y: 14 });
    tweens.push(
      gsap.to(left, {
        opacity:  1,
        y:        0,
        duration: 0.52,
        delay:    0.18,
        ease:     "power2.out",
      })
    );
  }

  return () => {
    tweens.forEach((t) => t?.kill());
  };
};
