import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMeta } from "../utils/seo.js";

gsap.registerPlugin(ScrollTrigger);

const images = [
  "/optimized/about/01.webp",
  "/optimized/about/02.webp",
  "/optimized/about/03.webp",
  "/optimized/about/04.webp",
  "/optimized/about/05.webp",
];

const ABOUT_ALTS = [
  "Seafront lamp post against the Mediterranean at dusk, Sitges",
  "Shadow of a person cast on a weathered metal door",
  "Stone alley in Talairan, Corbières, southern France",
  "Hand sketching with charcoal — the studio's process",
  "Mediterranean sea seen from a wrought-iron balcony, Sitges",
];

export async function About() {
  setMeta({
    title:       "About",
    description: "A studio built on paying attention. Brand identity and creative coding for products with origin, between the sea of Sitges and the stone of the Corbières.",
    url:         "/about",
  });

  return `
    <main class="project-detail about-page">

      <!-- MOBILE-ONLY: scroll crossfade intro (hidden on desktop via CSS) -->
      <div class="about-mobile-scroll js-about-mobile-scroll">
        <div class="about-mobile-scroll__sticky">
          ${images.map((img, i) => `
            <img class="about-mobile-scroll__img"
                 src="${img}"
                 alt="${ABOUT_ALTS[i] || `Studio photo ${i + 1}`}"
                 loading="${i === 0 ? 'eager' : 'lazy'}">`).join('')}
        </div>
      </div>

      <div class="project-detail__layout">

        <!-- LEFT — scrolling text -->
        <div class="project-detail__left">

          <div class="about-hero js-reveal">
            <p class="eyebrow">ABOUT</p>
            <h1 class="project-detail__display">Oh,<br>studio!</h1>
            <p class="about-prose">A way of løøking.</p>
          </div>

          <div class="project-detail__divider js-reveal"></div>

          <!-- SECTION 0: Narrative -->
          <div class="about-section about-section--narrative js-reveal" data-about-section="0">
            <p class="about-prose">
              Some places teach you to move.<br>
              Others teach you to stay still.
            </p>
            <p class="about-caption">
              I grew up surrounded by mountains, where distances were measured in valleys and seasons mattered more than schedules.
            </p>
            <p class="about-caption">
              Later came cities. Milan, Londres, Barcelona, Studios, agencies, deadlines, presentations and screens glowing late into the night.
            </p>
            <p class="about-caption">
              Useful lessons. Necessary lessons.
            </p>
            <p class="about-caption">
              But somewhere along the way I realised that the projects I remembered most weren't the ones born from speed.
            </p>
            <p class="about-caption">
              They were the ones born from observation.
            </p>
          </div>

          <!-- SECTION 1: Phrases -->
          <div class="about-section about-section--phrases js-reveal" data-about-section="1">
            <p class="about-phrase">A shadow crossing a wall.</p>
            <p class="about-phrase about-phrase--muted">An old door weathered by decades.</p>
            <p class="about-phrase">A conversation over dinner.</p>
            <p class="about-phrase about-phrase--muted">The way a landscape changes when you stop looking at it as a destination.</p>
          </div>

          <!-- SECTION 2: Sitges / Talairan -->
          <div class="about-section about-section--places js-reveal" data-about-section="2">
            <div class="about-place-wrap">
              <h2 class="about-place about-place--solid">Sitges</h2>
              <h2 class="about-place about-place--muted">& Talairan.</h2>
            </div>
            <p class="about-prose">
              The sea and the vineyards.<br>
              White walls and old stone.
            </p>
            <p class="about-caption">
              One constantly moving.<br>
              The other quietly waiting.
            </p>
          </div>

          <!-- SECTION 3: Manifesto Part 1 -->
          <div class="about-section about-section--manifesto js-reveal" data-about-section="3">
            <p class="about-prose">Oh, løøk! Studio exists somewhere in between.</p>
            <p class="about-caption">
              Not as a fixed location, but as a way of looking.<br>
              A collection of observations, influences, mistakes,<br>
              experiments, long walks, unfinished sketches,<br>
              conversations, books, meals and unexpected discoveries.
            </p>
          </div>

          <!-- SECTION 4: Manifesto Part 2 -->
          <div class="about-section about-section--manifesto js-reveal" data-about-section="4">
            <p class="about-prose">
              Because good design rarely begins with answers.<br>
              It begins with paying attention.
            </p>
            <p class="about-caption">
              And sometimes, all it takes is looking at something<br>
              from another perspective.
            </p>
          </div>

          <div class="project-detail__divider js-reveal"></div>

          <!-- SERVICES — Keep existing block -->
          <section class="studio-services js-reveal">
            <span class="project-detail__label">SERVICES</span>
            <div class="studio-service-list">
              <div class="studio-service-item">
                <span class="studio-service-num">01</span>
                <h3 class="studio-service-title">Brand identity systems</h3>
                <p class="studio-service-desc">From naming to visual language. Systems that hold.</p>
              </div>
              <div class="studio-service-item">
                <span class="studio-service-num">02</span>
                <h3 class="studio-service-title">Editorial &amp; layout</h3>
                <p class="studio-service-desc">Print thinking applied to screens.</p>
              </div>
              <div class="studio-service-item">
                <span class="studio-service-num">03</span>
                <h3 class="studio-service-title">Motion &amp; interaction</h3>
                <p class="studio-service-desc">When static isn't enough.</p>
              </div>
              <div class="studio-service-item">
                <span class="studio-service-num">04</span>
                <h3 class="studio-service-title">Web design &amp; creative development</h3>
                <p class="studio-service-desc">Design that ships. Code as material.</p>
              </div>
            </div>
          </section>

          <div class="project-detail__footer js-reveal">
            <a class="btn btn--pill" data-link href="/works">View Works</a>
          </div>

        </div>

        <!-- RIGHT — sticky crossfade (desktop only) -->
        <div class="project-detail__right">
          <div class="about-cover">
            ${images.map((img, i) => `
              <img class="about-cover__img"
                   src="${img}"
                   alt="${ABOUT_ALTS[i] || `Studio photo ${i + 1}`}"
                   loading="${i === 0 ? 'eager' : 'lazy'}">
            `).join('')}
          </div>
        </div>

      </div>
    </main>
  `;
}

About.init = function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  const tweens = [];
  const triggers = [];
  const cleanups = [];

  // 1. Entrance animations (Editorial appearance)
  const revealEls = document.querySelectorAll(".js-reveal");
  if (!reduce) {
    revealEls.forEach((el) => {
      const t = gsap.from(el, {
        opacity: 0,
        y: 24,
        filter: "blur(6px)",
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      });
      tweens.push(t);
    });
  } else {
    gsap.set(revealEls, { opacity: 1, y: 0, filter: "none" });
  }

  // 2. Desktop crossfade — right sticky column driven by text sections
  if (!isMobile) {
    const sections = document.querySelectorAll(".about-section[data-about-section]");
    const images = document.querySelectorAll(".about-cover__img");

    if (sections.length && images.length && !reduce) {
      sections.forEach((section, idx) => {
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => updateImage(idx),
          onEnterBack: () => updateImage(idx),
        });
        triggers.push(st);
      });

      function updateImage(index) {
        images.forEach((img, i) => {
          tweens.push(
            gsap.to(img, {
              opacity: i === index ? 1 : 0,
              duration: 0.8,
              ease: "power2.inOut",
              overwrite: true
            })
          );
        });
      }
    } else if (reduce && images.length) {
      gsap.set(images[0], { opacity: 1 });
    }
  }

  // 3. Mobile crossfade — scroll block at top of page
  if (isMobile && !reduce) {
    const mobileScroll = document.querySelector(".js-about-mobile-scroll");
    const mobileImgs = [...document.querySelectorAll(".about-mobile-scroll__img")];

    if (mobileScroll && mobileImgs.length > 1) {
      const n = mobileImgs.length;
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 78;
      let currentIdx = 0;

      const st = ScrollTrigger.create({
        trigger: mobileScroll,
        start: `top top+=${headerH}`,
        end: "bottom bottom",
        onUpdate: (self) => {
          const idx = Math.min(Math.floor(self.progress * n), n - 1);
          if (idx !== currentIdx) {
            currentIdx = idx;
            mobileImgs.forEach((img, j) => {
              tweens.push(
                gsap.to(img, { opacity: j === idx ? 1 : 0, duration: 0.7, ease: "power2.inOut", overwrite: true })
              );
            });
          }
        }
      });
      triggers.push(st);
    }
  }

  // 5. Services accordion logic (Keep existing)
  const supportsHover = window.matchMedia("(hover: hover)").matches;
  if (supportsHover) {
    const items = document.querySelectorAll(".studio-service-item");
    const list = document.querySelector(".studio-service-list");

    const resetAll = () => {
      items.forEach((item) => {
        item.style.opacity = "1";
        const d = item.querySelector(".studio-service-desc");
        if (d) d.style.opacity = "0";
      });
    };

    items.forEach((item) => {
      const desc = item.querySelector(".studio-service-desc");
      const onEnter = () => {
        items.forEach((i) => { i.style.opacity = "0.25"; });
        item.style.opacity = "1";
        if (desc) desc.style.opacity = "0.45";
      };
      item.addEventListener("mouseenter", onEnter);
      cleanups.push(() => item.removeEventListener("mouseenter", onEnter));
    });

    if (list) {
      list.addEventListener("mouseleave", resetAll);
      cleanups.push(() => list.removeEventListener("mouseleave", resetAll));
    }
  }

  ScrollTrigger.refresh();

  return () => {
    tweens.forEach((t) => t?.kill());
    triggers.forEach((st) => st?.kill());
    cleanups.forEach((fn) => fn());
  };
};
