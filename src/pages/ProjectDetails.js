import projectsData from "../data/projects.json";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMeta } from "../utils/seo.js";
import "../styles/xabi-cacao.css";

gsap.registerPlugin(ScrollTrigger);

/* ─── XABI CACAO: Vite glob imports ─────────────────────────────────────
   Empty folders → empty objects → empty arrays. No build errors.
   When images are placed in the folders (01.jpg, 02.jpg …), Vite picks
   them up automatically — no code changes needed.
───────────────────────────────────────────────────────────────────────── */
const _rawV = import.meta.glob(
  "../assets/img/projects/xabi-cacao/vertical/*.jpg",
  { eager: true, import: "default" }
);
const _rawH = import.meta.glob(
  "../assets/img/projects/xabi-cacao/horizontal/*.jpg",
  { eager: true, import: "default" }
);
const xabiVertical   = Object.entries(_rawV).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
const xabiHorizontal = Object.entries(_rawH).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);

/* ─── XABI CACAO: HTML renderer ─────────────────────────────────────── */
function renderXabiLayout(project) {
  const hasCover = Boolean(project.coverImage);

  return `
    <main class="xabi-page">

      <!-- ① HEADER: title, year, tags, services -->
      <div class="xabi-header">
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
      </div>

      <!-- ② CASE STUDY: scrolling text (left) + sticky crossfade (right) -->
      <div class="xabi-study">

        <div class="xabi-study__text">
          <div class="project-detail__divider"></div>

          <!-- Intro — index 0, paired with the cover image on desktop -->
          <div class="xabi-section" data-xabi-section="0">
            <p class="project-detail__lead">${project.description}</p>
            <!-- Phase 2: case study body text goes here -->
          </div>

          <!-- One trigger section per vertical image (indices 1…N) -->
          ${xabiVertical.map((_, i) => `
            <div class="xabi-section" data-xabi-section="${i + 1}">
              <!-- Phase 2: text for image ${i + 1} -->
            </div>
          `).join("")}
        </div>

        <!-- Desktop-only sticky column (hidden on mobile via CSS) -->
        <div class="xabi-study__sticky">
          <div class="xabi-cover" id="xabiCover">
            ${hasCover ? `
              <img class="xabi-cover__img"
                   src="${project.coverImage}"
                   alt="${project.title}"
                   loading="eager">` : ""}
            ${xabiVertical.map((src, i) => `
              <img class="xabi-cover__img"
                   src="${src}"
                   alt="${project.title} — image ${i + 1}"
                   loading="lazy">`).join("")}
          </div>
        </div>

      </div>

      <!-- ③ MOBILE ONLY: vertical crossfade scroll block
           Hidden on desktop (CSS). Sits between text and horizontal strip,
           giving mobile users the same crossfade experience as desktop. -->
      <div class="xabi-mobile-gallery js-xabi-mobile-gallery">
        <div class="xabi-mobile-gallery__sticky">
          ${hasCover && xabiVertical.length === 0 ? `
            <img class="xabi-mobile-gallery__img"
                 src="${project.coverImage}"
                 alt="${project.title}"
                 loading="eager">` : ""}
          ${xabiVertical.map((src, i) => `
            <img class="xabi-mobile-gallery__img"
                 src="${src}"
                 alt="${project.title} — image ${i + 1}"
                 loading="${i === 0 ? "eager" : "lazy"}">`).join("")}
        </div>
      </div>

      <!-- ④ HORIZONTAL STRIP
           Desktop: GSAP ScrollTrigger pin + horizontal scrub.
           Mobile:  CSS scroll-snap + dot indicators. -->
      <section class="xabi-horizontal js-xabi-horizontal">
        <div class="xabi-horizontal__track js-xabi-track">
          ${xabiHorizontal.map((src, i) => `
            <div class="xabi-horizontal__slide">
              <img src="${src}"
                   alt="${project.title} — horizontal ${i + 1}"
                   loading="lazy">
            </div>`).join("")}
          ${xabiHorizontal.length === 0 ? `
            <p class="xabi-horizontal__empty">— Horizontal photos coming soon —</p>
          ` : ""}
        </div>
        ${xabiHorizontal.length > 1 ? `
          <div class="xabi-horizontal__dots js-xabi-dots" aria-hidden="true">
            ${xabiHorizontal.map((_, i) => `
              <span class="xabi-horizontal__dot${i === 0 ? " is-active" : ""}"
                    data-index="${i}"></span>`).join("")}
          </div>
        ` : ""}
      </section>

      <!-- ⑤ FOOTER -->
      <div class="project-detail__footer xabi-footer">
        <a class="btn btn--pill" data-flip-back href="/">← Back</a>
      </div>

    </main>
  `;
}

/* ─── XABI CACAO: Init (GSAP + ScrollTrigger) ───────────────────────── */
function initXabiCacao() {
  const reduce   = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  const tweens   = [];
  const triggers = [];
  const cleanups = [];

  // Entrance: fade the header in
  const header = document.querySelector(".xabi-header");
  if (header && !reduce) {
    gsap.set(header, { opacity: 0, y: 14 });
    tweens.push(gsap.to(header, { opacity: 1, y: 0, duration: 0.52, delay: 0.18, ease: "power2.out" }));
  }

  // ── Desktop: scroll-driven crossfade (right sticky column) ──────────
  // Same mechanism as About.js: each .xabi-section crossing 50% viewport
  // triggers a GSAP opacity swap on the stacked images.
  if (!isMobile) {
    const sections = document.querySelectorAll(".xabi-section[data-xabi-section]");
    const images   = document.querySelectorAll(".xabi-cover__img");

    if (sections.length && images.length > 1 && !reduce) {
      function updateCover(index) {
        images.forEach((img, i) => {
          tweens.push(
            gsap.to(img, {
              opacity:   i === index ? 1 : 0,
              duration:  0.8,
              ease:      "power2.inOut",
              overwrite: true,
            })
          );
        });
      }

      sections.forEach((section, idx) => {
        triggers.push(
          ScrollTrigger.create({
            trigger:     section,
            start:       "top 50%",
            end:         "bottom 50%",
            onEnter:     () => updateCover(idx),
            onEnterBack: () => updateCover(idx),
          })
        );
      });
    } else if (images.length === 1 && !reduce) {
      // Only the cover image: just fade it in
      tweens.push(gsap.to(images[0], { opacity: 1, duration: 0.6, ease: "power2.out" }));
    }
  }

  // ── Mobile: vertical crossfade scroll block ──────────────────────────
  // Same mechanism as About.js mobile: a tall scroll block with a sticky
  // inner container; progress maps to image index.
  if (isMobile && !reduce) {
    const mobileScroll = document.querySelector(".js-xabi-mobile-gallery");
    const mobileImgs   = [...document.querySelectorAll(".xabi-mobile-gallery__img")];

    if (mobileScroll && mobileImgs.length > 1) {
      const n       = mobileImgs.length;
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h")
      ) || 78;

      // Height proportional to image count (60vh per image transition)
      mobileScroll.style.height = `${n * 60}vh`;

      let currentIdx = 0;
      triggers.push(
        ScrollTrigger.create({
          trigger: mobileScroll,
          start:   `top top+=${headerH}`,
          end:     "bottom bottom",
          onUpdate(self) {
            const idx     = Math.min(Math.floor(self.progress * n), n - 1);
            if (idx !== currentIdx) {
              currentIdx = idx;
              mobileImgs.forEach((img, j) => {
                tweens.push(
                  gsap.to(img, {
                    opacity:   j === idx ? 1 : 0,
                    duration:  0.7,
                    ease:      "power2.inOut",
                    overwrite: true,
                  })
                );
              });
            }
          },
        })
      );
    }
  }

  // ── Horizontal strip ─────────────────────────────────────────────────
  const track  = document.querySelector(".js-xabi-track");
  const slides = track ? [...track.querySelectorAll(".xabi-horizontal__slide")] : [];

  if (slides.length > 0) {
    if (!isMobile && !reduce) {
      // Desktop: pin the section, scrub horizontal translate with vertical scroll
      const section     = document.querySelector(".js-xabi-horizontal");
      const totalScroll = () => track.scrollWidth - window.innerWidth;

      triggers.push(
        ScrollTrigger.create({
          trigger:             section,
          start:               "top top",
          end:                 () => `+=${totalScroll()}`,
          pin:                 true,
          scrub:               1,
          anticipatePin:       1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            gsap.set(track, { x: -(self.progress * totalScroll()) });
          },
        })
      );
    } else if (isMobile && slides.length > 1) {
      // Mobile: update dot indicators on native scroll; dots trigger scroll on click
      const dots = [...document.querySelectorAll(".xabi-horizontal__dot")];
      const gap  = 12;

      if (dots.length && track) {
        const onScroll = () => {
          const slideW  = slides[0]?.offsetWidth || 1;
          const idx     = Math.round(track.scrollLeft / (slideW + gap));
          const clamped = Math.max(0, Math.min(idx, dots.length - 1));
          dots.forEach((d, i) => d.classList.toggle("is-active", i === clamped));
        };
        track.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => track.removeEventListener("scroll", onScroll));

        dots.forEach((dot, i) => {
          const onClick = () => {
            const slideW = slides[0]?.offsetWidth || 0;
            track.scrollTo({ left: i * (slideW + gap), behavior: "smooth" });
          };
          dot.addEventListener("click", onClick);
          cleanups.push(() => dot.removeEventListener("click", onClick));
        });
      }
    }
  }

  ScrollTrigger.refresh();

  return () => {
    tweens.forEach((t)  => t?.kill());
    triggers.forEach((st) => st?.kill());
    cleanups.forEach((fn) => fn());
  };
}

// mountProjectShader intentionally disconnected — kept in src/hero/projectShader.js

export async function ProjectDetails({ slug } = {}) {
  const projects = projectsData.projects || [];
  const project  = projects.find((p) => p.slug === slug);

  if (!project) {
    setMeta({ title: "Project not found", url: `/projects/${slug}` });
    return `
      <main class="page page--dark">
        <div class="page-inner">
          <h1 class="h1">Project not found</h1>
          <p><a class="nav__link" data-link href="/works">← Back to works</a></p>
        </div>
      </main>
    `;
  }

  setMeta({
    title:       project.title,
    description: project.description,
    url:         `/projects/${project.slug}`,
    image:       project.coverImage,
  });

  // ── Xabi Cacao Tasting: custom case study layout ──────────────────────
  if (project.slug === "xabi-cacao") {
    return renderXabiLayout(project);
  }

  // ── All other projects: generic two-column layout (unchanged) ─────────
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

        </div>

        <!-- RIGHT — sticky cover (desktop) / portrait image (mobile) -->
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

        <!-- FOOTER — after image on mobile, bottom-of-left on desktop via grid -->
        <div class="project-detail__footer">
          <a class="btn btn--pill" data-flip-back href="/">← Back</a>
        </div>

      </div>
    </main>
  `;
}

ProjectDetails.init = function ({ slug } = {}) {
  // ── Xabi Cacao Tasting: custom init ───────────────────────────────────
  if (slug === "xabi-cacao") {
    return initXabiCacao();
  }

  // ── All other projects: generic init (unchanged) ──────────────────────
  const coverImg = document.querySelector(".project-detail__cover-img");
  const left     = document.querySelector(".project-detail__left");

  const vtaMode    = window.__vtaActive;
  window.__vtaActive = null;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const supportsVT   = typeof document.startViewTransition === "function";

  const tweens = [];

  if (vtaMode === "forward" && supportsVT && !reduceMotion && coverImg) {
    // VTA handles the spatial animation — make the cover visible for the "after" snapshot
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
