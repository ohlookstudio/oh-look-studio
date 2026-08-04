import projectsData from "../data/projects.json";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMeta } from "../utils/seo.js";
import "../styles/xabi-cacao.css";
import "../styles/braun-milan.css";

gsap.registerPlugin(ScrollTrigger);

/* ─── XABI CACAO: Vite glob imports ─────────────────────────────────────
   Six globs (jpg/webm/mp4 × vertical/horizontal) merged into ordered
   slide arrays by buildSlides(). No code changes needed when adding files.
───────────────────────────────────────────────────────────────────────── */
const _vJpgs  = import.meta.glob("../assets/img/projects/xabi-cacao/vertical/*.jpg",    { eager: true, import: "default" });
const _vWebms = import.meta.glob("../assets/img/projects/xabi-cacao/vertical/*.webm",   { eager: true, import: "default" });
const _vMp4s  = import.meta.glob("../assets/img/projects/xabi-cacao/vertical/*.mp4",    { eager: true, import: "default" });
const _hJpgs  = import.meta.glob("../assets/img/projects/xabi-cacao/horizontal/*.jpg",  { eager: true, import: "default" });
const _hWebms = import.meta.glob("../assets/img/projects/xabi-cacao/horizontal/*.webm", { eager: true, import: "default" });
const _hMp4s  = import.meta.glob("../assets/img/projects/xabi-cacao/horizontal/*.mp4",  { eager: true, import: "default" });

function buildSlides(jpgs, webms, mp4s) {
  const prefixOf = k => k.match(/\/(\d+)\./)?.[1];
  const prefixes = [...new Set([
    ...Object.keys(jpgs), ...Object.keys(webms), ...Object.keys(mp4s),
  ].map(prefixOf).filter(Boolean))].sort();
  return prefixes.map(prefix => {
    const webmKey = Object.keys(webms).find(k => prefixOf(k) === prefix);
    const mp4Key  = Object.keys(mp4s).find(k => prefixOf(k) === prefix);
    const jpgKey  = Object.keys(jpgs).find(k => prefixOf(k) === prefix);
    if (webmKey || mp4Key) return { type: "video", webm: webms[webmKey], mp4: mp4s[mp4Key] };
    return { type: "img", src: jpgs[jpgKey] };
  });
}

function renderSlide(slide, cls, alt, eager = false) {
  const ca = cls ? ` class="${cls}"` : "";
  if (slide.type === "video") {
    return `<video${ca} autoplay loop muted playsinline>
              ${slide.webm ? `<source src="${slide.webm}" type="video/webm">` : ""}
              ${slide.mp4  ? `<source src="${slide.mp4}"  type="video/mp4">` : ""}
            </video>`;
  }
  return `<img${ca} src="${slide.src}" alt="${alt}" loading="${eager ? "eager" : "lazy"}">`;
}

const xabiVertical   = buildSlides(_vJpgs, _vWebms, _vMp4s);
const xabiHorizontal = buildSlides(_hJpgs, _hWebms, _hMp4s);

/* ─── BRAUN MILAN: Vite glob imports ────────────────────────────────── */
const _bvJpgs  = import.meta.glob("../assets/img/projects/braun-milan/vertical/*.jpg",    { eager: true, import: "default" });
const _bvWebms = import.meta.glob("../assets/img/projects/braun-milan/vertical/*.webm",   { eager: true, import: "default" });
const _bvMp4s  = import.meta.glob("../assets/img/projects/braun-milan/vertical/*.mp4",    { eager: true, import: "default" });
const _bhJpgs  = import.meta.glob("../assets/img/projects/braun-milan/horizontal/*.jpg",  { eager: true, import: "default" });
const _bhWebms = import.meta.glob("../assets/img/projects/braun-milan/horizontal/*.webm", { eager: true, import: "default" });
const _bhMp4s  = import.meta.glob("../assets/img/projects/braun-milan/horizontal/*.mp4",  { eager: true, import: "default" });

const braunVertical   = buildSlides(_bvJpgs, _bvWebms, _bvMp4s);
const braunHorizontal = buildSlides(_bhJpgs, _bhWebms, _bhMp4s);

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

          <!-- Section 0 — cover: hero lead + intro paragraph -->
          <div class="xabi-section" data-xabi-section="0">
            <p class="xabi-lead">An identity for the ritual of origin.</p>
            <p class="xabi-prose">Chocolate is usually sold as indulgence. Xabi sells something rarer: origin. A tasting experience built around single-origin cacao, grown by named producers across Latin America, and the ritual of learning to read it — the way one learns to read a wine.</p>
          </div>

          <!-- Section 1 — vertical 01: body -->
          <div class="xabi-section" data-xabi-section="1">
            <p class="xabi-prose">The challenge wasn't to make chocolate look luxurious. It was to make origin feel alive, curious, generous — not solemn. Most fine-cacao branding leans dark, exclusive, almost intimidating. We went the other way: colour, energy, play. A visual language that opens the door instead of guarding it.</p>
          </div>

          <!-- Section 2 — vertical 02: editorial pull -->
          <div class="xabi-section" data-xabi-section="2">
            <p class="xabi-pull">Xabi sells something rarer: origin.</p>
          </div>

          <!-- Section 3 — vertical 03: body -->
          <div class="xabi-section" data-xabi-section="3">
            <p class="xabi-prose">The "X" mark breaks like a bar of chocolate — a small, honest gesture that carries the whole system. Around it, a palette as varied as the cacao origins themselves, and a structure built for tasting: each variety, each note, each terroir given its own voice.</p>
          </div>

          <!-- Section 4 — vertical 04: editorial pull + closing -->
          <div class="xabi-section" data-xabi-section="4">
            <p class="xabi-pull">Because the point was never the chocolate.</p>
            <p class="xabi-prose">It was teaching people to taste where it comes from.</p>
            <span class="project-detail__label">Role</span>
            <p class="xabi-prose">Brand identity, art direction, photography and set design — including custom-built photographic scenes. A tasting brand designed to educate a curious palate.</p>
          </div>
        </div>

        <!-- Desktop-only sticky column (hidden on mobile via CSS) -->
        <div class="xabi-study__sticky">
          <div class="xabi-cover" id="xabiCover">
            ${hasCover ? `
              <img class="xabi-cover__slide"
                   src="${project.coverImage}"
                   alt="${project.title}"
                   loading="eager">` : ""}
            ${xabiVertical.map((slide, i) =>
              renderSlide(slide, "xabi-cover__slide", `${project.title} — ${i + 1}`)
            ).join("")}
          </div>
        </div>

      </div>

      <!-- ③ MOBILE ONLY: vertical crossfade scroll block
           Hidden on desktop (CSS). Sits between text and horizontal strip,
           giving mobile users the same crossfade experience as desktop. -->
      <div class="xabi-mobile-gallery js-xabi-mobile-gallery">
        <div class="xabi-mobile-gallery__sticky">
          ${hasCover && xabiVertical.length === 0 ? `
            <img class="xabi-mobile-gallery__slide"
                 src="${project.coverImage}"
                 alt="${project.title}"
                 loading="eager">` : ""}
          ${xabiVertical.map((slide, i) =>
            renderSlide(slide, "xabi-mobile-gallery__slide", `${project.title} — ${i + 1}`, i === 0)
          ).join("")}
        </div>
      </div>

      <!-- ④ HORIZONTAL STRIP
           Desktop: GSAP ScrollTrigger pin + horizontal scrub.
           Mobile:  CSS scroll-snap + dot indicators. -->
      <section class="xabi-horizontal js-xabi-horizontal">
        <div class="xabi-horizontal__track js-xabi-track">
          ${xabiHorizontal.map((slide, i) => `
            <div class="xabi-horizontal__slide">
              ${renderSlide(slide, "", `${project.title} — horizontal ${i + 1}`)}
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
  if (!isMobile) {
    const sections = document.querySelectorAll(".xabi-section[data-xabi-section]");
    const slides   = document.querySelectorAll(".xabi-cover__slide");

    if (sections.length && slides.length > 1 && !reduce) {
      function updateCover(index) {
        slides.forEach((el, i) => {
          tweens.push(
            gsap.to(el, {
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
    } else if (slides.length === 1 && !reduce) {
      tweens.push(gsap.to(slides[0], { opacity: 1, duration: 0.6, ease: "power2.out" }));
    }
  }

  // ── Mobile: vertical crossfade scroll block ──────────────────────────
  if (isMobile && !reduce) {
    const mobileScroll = document.querySelector(".js-xabi-mobile-gallery");
    const mobileSlides = [...document.querySelectorAll(".xabi-mobile-gallery__slide")];

    if (mobileScroll && mobileSlides.length > 1) {
      const n       = mobileSlides.length;
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h")
      ) || 78;

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
              mobileSlides.forEach((el, j) => {
                tweens.push(
                  gsap.to(el, {
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

/* ─── BRAUN MILAN: HTML renderer ────────────────────────────────────── */
function renderBraunLayout(project) {
  const hasCover = Boolean(project.coverImage);

  return `
    <main class="braun-page">

      <!-- ① HEADER -->
      <div class="braun-header">
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
      <div class="braun-study">

        <div class="braun-study__text">
          <div class="project-detail__divider"></div>

          <!-- Section 0 — hero lead + manifesto -->
          <div class="braun-section" data-braun-section="0">
            <p class="braun-lead">less, but better, applied to the screen.</p>
            <p class="braun-pull">Some projects are jobs. This one is a manifesto.</p>
          </div>

          <!-- Section 1 — Rams / the principle -->
          <div class="braun-section" data-braun-section="1">
            <p class="braun-prose">Dieter Rams designed for Braun for four decades under a single idea: <em>Weniger, aber besser</em> — less, but better. Good design is as little design as possible. It is honest, long-lasting, unobtrusive. Those ten principles are not a style. They are a way of deciding.</p>
          </div>

          <!-- Section 2 — manifesto pull + concept -->
          <div class="braun-section" data-braun-section="2">
            <p class="braun-pull">Less,<br>but better.</p>
            <p class="braun-prose">This is a digital experience for Braun at Milan Design Week that takes Rams at his word — and applies his discipline not to a product, but to a screen. Radical restraint. Nothing decorative. Every element earning its place. Clarity as the only ornament.</p>
          </div>

          <!-- Section 3 — the result -->
          <div class="braun-section" data-braun-section="3">
            <p class="braun-prose">The result is quiet on purpose. Black, white, space, geometry, one considered interaction at a time. A web presence that doesn't perform — it functions, and trusts the visitor to notice the difference.</p>
          </div>

          <!-- Section 4 — studio philosophy + role -->
          <div class="braun-section" data-braun-section="4">
            <p class="braun-prose">This project is where the philosophy behind my studio became explicit. Everything I design now — for wine, for food, for brands with roots — runs on the same rule Rams gave Braun. Less, but better.</p>
            <span class="project-detail__label">Role</span>
            <p class="braun-prose">Concept, art direction, web design and interaction. A digital experience built on ten principles that never expire.</p>
          </div>
        </div>

        <!-- Desktop-only sticky column -->
        <div class="braun-study__sticky">
          <div class="braun-cover" id="braunCover">
            ${hasCover ? `
              <img class="braun-cover__slide"
                   src="${project.coverImage}"
                   alt="${project.title}"
                   loading="eager">` : ""}
            ${braunVertical.map((slide, i) =>
              renderSlide(slide, "braun-cover__slide", `${project.title} — ${i + 1}`)
            ).join("")}
          </div>
        </div>

      </div>

      <!-- ③ MOBILE ONLY: vertical crossfade scroll block -->
      <div class="braun-mobile-gallery js-braun-mobile-gallery">
        <div class="braun-mobile-gallery__sticky">
          ${hasCover && braunVertical.length === 0 ? `
            <img class="braun-mobile-gallery__slide"
                 src="${project.coverImage}"
                 alt="${project.title}"
                 loading="eager">` : ""}
          ${braunVertical.map((slide, i) =>
            renderSlide(slide, "braun-mobile-gallery__slide", `${project.title} — ${i + 1}`, i === 0)
          ).join("")}
        </div>
      </div>

      <!-- ④ HORIZONTAL STRIP -->
      <section class="braun-horizontal js-braun-horizontal">
        <div class="braun-horizontal__track js-braun-track">
          ${braunHorizontal.map((slide, i) => `
            <div class="braun-horizontal__slide">
              ${renderSlide(slide, "", `${project.title} — horizontal ${i + 1}`)}
            </div>`).join("")}
          ${braunHorizontal.length === 0 ? `
            <p class="braun-horizontal__empty">— Horizontal content coming soon —</p>
          ` : ""}
        </div>
        ${braunHorizontal.length > 1 ? `
          <div class="braun-horizontal__dots js-braun-dots" aria-hidden="true">
            ${braunHorizontal.map((_, i) => `
              <span class="braun-horizontal__dot${i === 0 ? " is-active" : ""}"
                    data-index="${i}"></span>`).join("")}
          </div>
        ` : ""}
      </section>

      <!-- ⑤ FOOTER -->
      <div class="project-detail__footer braun-footer">
        <a class="btn btn--pill" data-flip-back href="/">← Back</a>
      </div>

    </main>
  `;
}

/* ─── BRAUN MILAN: Init (GSAP + ScrollTrigger) ──────────────────────── */
function initBraunMilan() {
  const reduce   = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  const tweens   = [];
  const triggers = [];
  const cleanups = [];

  const header = document.querySelector(".braun-header");
  if (header && !reduce) {
    gsap.set(header, { opacity: 0, y: 14 });
    tweens.push(gsap.to(header, { opacity: 1, y: 0, duration: 0.52, delay: 0.18, ease: "power2.out" }));
  }

  // ── Desktop: scroll-driven crossfade ────────────────────────────────
  if (!isMobile) {
    const sections = document.querySelectorAll(".braun-section[data-braun-section]");
    const slides   = document.querySelectorAll(".braun-cover__slide");

    if (sections.length && slides.length > 1 && !reduce) {
      function updateCover(index) {
        slides.forEach((el, i) => {
          tweens.push(
            gsap.to(el, {
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
    } else if (slides.length === 1 && !reduce) {
      tweens.push(gsap.to(slides[0], { opacity: 1, duration: 0.6, ease: "power2.out" }));
    }
  }

  // ── Mobile: vertical crossfade scroll block ──────────────────────────
  if (isMobile && !reduce) {
    const mobileScroll = document.querySelector(".js-braun-mobile-gallery");
    const mobileSlides = [...document.querySelectorAll(".braun-mobile-gallery__slide")];

    if (mobileScroll && mobileSlides.length > 1) {
      const n       = mobileSlides.length;
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h")
      ) || 78;

      mobileScroll.style.height = `${n * 60}vh`;

      let currentIdx = 0;
      triggers.push(
        ScrollTrigger.create({
          trigger: mobileScroll,
          start:   `top top+=${headerH}`,
          end:     "bottom bottom",
          onUpdate(self) {
            const idx = Math.min(Math.floor(self.progress * n), n - 1);
            if (idx !== currentIdx) {
              currentIdx = idx;
              mobileSlides.forEach((el, j) => {
                tweens.push(
                  gsap.to(el, {
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
  const track  = document.querySelector(".js-braun-track");
  const slides = track ? [...track.querySelectorAll(".braun-horizontal__slide")] : [];

  if (slides.length > 0) {
    if (!isMobile && !reduce) {
      const section     = document.querySelector(".js-braun-horizontal");
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
      const dots = [...document.querySelectorAll(".braun-horizontal__dot")];
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

  // ── Braun at Milan Design Week: custom case study layout ──────────────
  if (project.slug === "braun-milan") {
    return renderBraunLayout(project);
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

  // ── Braun at Milan Design Week: custom init ───────────────────────────
  if (slug === "braun-milan") {
    return initBraunMilan();
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
    coverImg.style.opacity    = "";
    coverImg.style.visibility = "";
    coverImg.style.viewTransitionName = "project-cover";
  } else {
    if (coverImg) {
      const dur = reduceMotion ? 0.3 : 0.6;
      tweens.push(
        gsap.to(coverImg, { autoAlpha: 1, duration: dur, ease: "power2.out" })
      );
    }
  }

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
