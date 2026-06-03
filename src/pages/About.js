import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMeta } from "../utils/seo.js";

// Import the 5 images for the crossfade
import imgSitges   from "../assets/img/projects/studio-sitges.jpg";
import imgTalairan from "../assets/img/projects/studio-talairan.jpg";
import imgCafe     from "../assets/img/projects/studio-cafe.jpg";
import imgShadow   from "../assets/img/projects/studio-shadow.jpg";
import imgSketch   from "../assets/img/projects/studio-sketch.jpg";

gsap.registerPlugin(ScrollTrigger);

export async function About() {
  setMeta({
    title: "Oh, studio!",
    description: "A way of løøking. Oh, løøk! Studio exists somewhere in between.",
    url: "/about"
  });

  const images = [imgSitges, imgTalairan, imgCafe, imgShadow, imgSketch];

  return `
    <main class="project-detail about-page">
      <div class="project-detail__layout">

        <!-- LEFT — scrolling text -->
        <div class="project-detail__left">

          <div class="about-hero">
            <p class="eyebrow">ABOUT</p>
            <h1 class="project-detail__display">Oh,<br>studio!</h1>
            <p class="project-detail__lead">A way of løøking.</p>
          </div>

          <div class="project-detail__divider"></div>

          <!-- SECTION 0: Narrative -->
          <div class="about-section" data-about-section="0">
            <p class="project-detail__lead">
              Some places teach you to move.<br>
              Others teach you to stay still.
            </p>
            <p class="muted">
              I grew up surrounded by mountains, where distances were measured in valleys and seasons mattered more than schedules.
            </p>
            <p class="muted">
              Later came cities. Milan, Londres, Barcelona, Studios, agencies, deadlines, presentations and screens glowing late into the night.
            </p>
            <p class="muted">
              Useful lessons. Necessary lessons.
            </p>
            <p class="muted">
              But somewhere along the way I realised that the projects I remembered most weren't the ones born from speed.
            </p>
            <p class="muted">
              They were the ones born from observation.
            </p>
          </div>

          <!-- SECTION 1: Phrases -->
          <div class="about-section" data-about-section="1">
            <p class="project-detail__display" style="font-size: clamp(32px, 4vw, 56px);">A shadow crossing a wall.</p>
            <p class="muted">An old door weathered by decades.</p>
            <p class="project-detail__display" style="font-size: clamp(32px, 4vw, 56px);">A conversation over dinner.</p>
            <p class="muted">The way a landscape changes when you stop looking at it as a destination.</p>
          </div>

          <!-- SECTION 2: Sitges / Talairan -->
          <div class="about-section" data-about-section="2">
            <h2 class="project-detail__display">Sitges<br>& Talairan.</h2>
            <p class="project-detail__lead">
              The sea and the vineyards.<br>
              White walls and old stone.
            </p>
            <p class="muted">
              One constantly moving.<br>
              The other quietly waiting.
            </p>
          </div>

          <!-- SECTION 3: Manifesto Part 1 -->
          <div class="about-section" data-about-section="3">
            <p class="project-detail__lead">Oh, løøk! Studio exists somewhere in between.</p>
            <p class="muted">
              Not as a fixed location, but as a way of looking.<br>
              A collection of observations, influences, mistakes,<br>
              experiments, long walks, unfinished sketches,<br>
              conversations, books, meals and unexpected discoveries.
            </p>
          </div>

          <!-- SECTION 4: Manifesto Part 2 -->
          <div class="about-section" data-about-section="4">
            <p class="project-detail__lead">
              Because good design rarely begins with answers.<br>
              It begins with paying attention.
            </p>
            <p class="muted">
              And sometimes, all it takes is looking at something<br>
              from another perspective.
            </p>
          </div>

          <div class="project-detail__divider"></div>

          <!-- SERVICES — Keep existing block -->
          <section class="studio-services">
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

          <div class="project-detail__footer">
            <a class="btn btn--pill" data-link href="/works">View Works</a>
          </div>

        </div>

        <!-- RIGHT — sticky crossfade -->
        <div class="project-detail__right">
          <div class="about-cover">
            ${images.map((img, i) => `
              <img class="about-cover__img"
                   src="${img}"
                   alt="Studio view ${i + 1}"
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
  const tweens = [];
  const triggers = [];
  const cleanups = [];

  // Entrance animation for left column (mirror ProjectDetails)
  const left = document.querySelector(".project-detail__left");
  if (left) {
    gsap.set(left, { opacity: 0, y: 14 });
    tweens.push(
      gsap.to(left, {
        opacity: 1,
        y: 0,
        duration: 0.52,
        delay: 0.18,
        ease: "power2.out",
      })
    );
  }

  // Crossfade logic
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
    // If reduced motion, just show the first image and stop
    gsap.set(images[0], { opacity: 1 });
  }

  // Services accordion logic (Keep existing)
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

  // Refresh ScrollTrigger to account for dynamic content
  ScrollTrigger.refresh();

  return () => {
    tweens.forEach((t) => t?.kill());
    triggers.forEach((st) => st?.kill());
    cleanups.forEach((fn) => fn());
  };
};
