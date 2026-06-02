import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMeta } from "../utils/seo.js";

gsap.registerPlugin(ScrollTrigger);

export async function About() {
  setMeta({ title: "Oh, studio!", url: "/about" });

  return `
    <main class="studio-page">

      <!-- Narrative: two-speed section -->
      <section class="studio-narrative">
        <div class="studio-narrative__left">
          <p class="studio-eyebrow">ABOUT</p>
          <h1 class="studio-title">Oh,<br>studio!</h1>
          <p class="studio-tagline">A way of løøking.</p>

          <p class="studio-prose js-fade">Some places teach you to move.<br>
Others teach you to stay still.<br>
<br>
I grew up surrounded by mountains, where distances were measured in valleys and seasons mattered more than schedules.<br>
<br>
Later came cities. Milan. Londres. Barcelona. Studios, agencies, deadlines, presentations and screens glowing late into the night.<br>
<br>
Useful lessons. Necessary lessons.<br>
<br>
But somewhere along the way I realised that the projects I remembered most weren't the ones born from speed.<br>
<br>
They were the ones born from observation.</p>

          <div class="studio-photo studio-photo--talairan js-reveal">
            <img src="/src/assets/img/projects/studio-talairan.jpg" alt="Talairan" loading="lazy">
          </div>
        </div>

        <div class="studio-narrative__right">
          <p class="studio-flash studio-flash--lg js-phrase">A shadow<br>crossing a wall.</p>
          <p class="studio-flash studio-flash--md js-phrase">An old door<br>weathered by decades.</p>
          <p class="studio-flash studio-flash--lg js-phrase">A conversation<br>over dinner.</p>
          <p class="studio-flash studio-flash--sm js-phrase">The way a landscape changes<br>when you stop looking at it<br>as a destination.</p>
        </div>
      </section>

      <!-- Convergence: Sitges + & Talairan. + image, same y=1744 -->
      <section class="studio-convergence">
        <div class="studio-conv-photo js-reveal">
          <img src="/src/assets/img/projects/studio-sitges.jpg" alt="Sitges" loading="lazy">
        </div>
        <h2 class="studio-conv-sitges js-conv-a">Sitges</h2>
        <h2 class="studio-conv-talairan js-conv-b">&amp; Talairan.</h2>
      </section>

      <p class="studio-conv-text js-fade">The sea and the vineyards.<br>
White walls and old stone.<br>
One constantly moving.<br>
The other quietly waiting.</p>

      <!-- Manifesto -->
      <section class="studio-manifesto">
        <h2 class="studio-manifesto__title js-fade">Oh, løøk! Studio exists somewhere in between.</h2>
        <p class="studio-manifesto__body js-fade">Not as a fixed location, but as a way of looking.<br>
A collection of observations, influences, mistakes,<br>
experiments, long walks, unfinished sketches,<br>
conversations, books, meals and unexpected discoveries.</p>
        <p class="studio-manifesto__highlight js-fade">Because good design rarely begins with answers.<br>
It begins with paying attention.</p>
        <p class="studio-manifesto__closing js-fade">And sometimes, all it takes is looking at something<br>
from another perspective.</p>
      </section>

      <!-- Services -->
      <section class="studio-services">
        <span class="studio-eyebrow">SERVICES</span>
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

    </main>
  `;
}

About.init = function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kills = [];
  let rafId;

  rafId = requestAnimationFrame(() => {
    try {
      if (!reduceMotion) {
        document.querySelectorAll(".js-phrase, .js-fade").forEach((el) => {
          if (!el) return;
          const st = ScrollTrigger.create({
            trigger: el,
            start: "top 82%",
            once: true,
            onEnter: () =>
              gsap.from(el, {
                opacity: 0,
                y: 24,
                duration: 0.7,
                ease: "power2.out",
                clearProps: "all",
              }),
          });
          kills.push(() => st.kill());
        });

        document.querySelectorAll(".js-reveal").forEach((wrap) => {
          if (!wrap) return;
          const st = ScrollTrigger.create({
            trigger: wrap,
            start: "top 85%",
            once: true,
            onEnter: () =>
              gsap.from(wrap, {
                clipPath: "inset(0 0 100% 0)",
                duration: 1.1,
                ease: "power3.inOut",
                clearProps: "clipPath",
              }),
          });
          kills.push(() => st.kill());
        });
      }

      // Services hover accordion
      const serviceItems = document.querySelectorAll(".studio-service-item");
      if (serviceItems.length) {
        serviceItems.forEach((item) => {
          const desc = item.querySelector(".studio-service-desc");
          item.addEventListener("mouseenter", () => {
            serviceItems.forEach((i) => { i.style.opacity = "0.25"; });
            item.style.opacity = "1";
            if (desc) desc.style.opacity = "0.45";
          });
          item.addEventListener("mouseleave", () => {
            serviceItems.forEach((i) => { i.style.opacity = "1"; });
            if (desc) desc.style.opacity = "0";
          });
        });
      }

      ScrollTrigger.refresh();
    } catch (err) {
      console.warn("[About] init error:", err);
    }
  });

  return () => {
    cancelAnimationFrame(rafId);
    kills.forEach((fn) => fn());
    ScrollTrigger.getAll().forEach((st) => st.kill());
  };
};
