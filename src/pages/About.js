import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMeta } from "../utils/seo.js";

gsap.registerPlugin(ScrollTrigger);

export async function About() {
  setMeta({ title: "Oh, studio!", url: "/about" });

  return `
    <main class="studio-page">

      <!-- ① HERO -->
      <section class="studio-hero">
        <p class="studio-eyebrow">ABOUT</p>
        <h1 class="studio-title">Oh,<br>studio!</h1>
        <p class="studio-tagline">A way of løøking.</p>
      </section>

      <!-- ② NARRATIVE — prose left, staggered phrases right -->
      <section class="studio-narrative">
        <div class="studio-narrative__left">
          <p class="studio-prose">Some places teach you to move.<br>
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
            <img src="/src/assets/img/projects/studio-talairan.jpg"
                 alt="Talairan"
                 loading="lazy">
          </div>
        </div>
        <div class="studio-narrative__right">
          <p class="studio-flash studio-flash--lg js-phrase">A shadow<br>crossing a wall.</p>
          <p class="studio-flash studio-flash--md js-phrase">An old door<br>weathered by<br>decades.</p>
          <p class="studio-flash studio-flash--lg js-phrase">A conversation<br>over dinner.</p>
          <p class="studio-flash studio-flash--sm js-phrase">The way a landscape changes<br>when you stop looking at it<br>as a destination.</p>
        </div>
      </section>

      <!-- ③ CONVERGENCE — Sitges & Talairan -->
      <section class="studio-convergence">
        <h2 class="studio-place studio-place--sitges js-conv-a">Sitges</h2>
        <h2 class="studio-place studio-place--talairan js-conv-b">&amp; Talairan.</h2>
        <div class="studio-photo studio-photo--sitges js-reveal">
          <img src="/src/assets/img/projects/studio-sitges.jpg"
               alt="Sitges"
               loading="lazy">
        </div>
        <p class="studio-place-text js-fade">The sea and the vineyards.<br>
White walls and old stone.<br>
One constantly moving.<br>
The other quietly waiting.</p>
      </section>

      <!-- ④ MANIFESTO -->
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

      <!-- ⑤ SERVICES — accordion -->
      <section class="snp-services">
        <span class="snp-eyebrow">SERVICES</span>
        <div class="snp-svc-list">

          <div class="snp-svc js-svc">
            <hr class="snp-svc__line snp-svc__line--first">
            <div class="snp-svc__body">
              <span class="snp-svc__num">01</span>
              <div class="snp-svc__main">
                <span class="snp-svc__title">Brand identity systems</span>
                <p class="snp-svc__desc">From naming to visual language.<br>Systems that hold.</p>
              </div>
            </div>
          </div>

          <div class="snp-svc js-svc">
            <hr class="snp-svc__line">
            <div class="snp-svc__body">
              <span class="snp-svc__num">02</span>
              <div class="snp-svc__main">
                <span class="snp-svc__title">Editorial &amp; layout</span>
                <p class="snp-svc__desc">Print thinking applied to screens.</p>
              </div>
            </div>
          </div>

          <div class="snp-svc js-svc">
            <hr class="snp-svc__line">
            <div class="snp-svc__body">
              <span class="snp-svc__num">03</span>
              <div class="snp-svc__main">
                <span class="snp-svc__title">Motion &amp; interaction</span>
                <p class="snp-svc__desc">When static isn't enough.</p>
              </div>
            </div>
          </div>

          <div class="snp-svc js-svc">
            <hr class="snp-svc__line">
            <div class="snp-svc__body">
              <span class="snp-svc__num">04</span>
              <div class="snp-svc__main">
                <span class="snp-svc__title">Web design &amp; creative development</span>
                <p class="snp-svc__desc">Design that ships. Code as material.</p>
              </div>
            </div>
          </div>

          <hr class="snp-svc__line">
        </div>
      </section>

    </main>
  `;
}

About.init = function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kills = [];

  /* ── scroll animations
     Pattern: gsap.from() inside onEnter — never pre-hide with gsap.set().
     If a ScrollTrigger never fires (Safari bug), elements stay visible.
     Wrapped in try/catch so any GSAP failure never blocks content.
  ── */
  try {
    /* hero entrance — fires immediately, no ScrollTrigger needed */
    if (!reduceMotion) {
      const heroEls = [
        document.querySelector(".studio-eyebrow"),
        document.querySelector(".studio-title"),
        document.querySelector(".studio-tagline"),
      ].filter(Boolean);

      if (heroEls.length) {
        const t = gsap.from(heroEls, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.1,
          clearProps: "all",
        });
        kills.push(() => t.kill());
      }
    }

    /* right column phrases */
    document.querySelectorAll(".js-phrase").forEach((el) => {
      if (!reduceMotion) {
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          once: true,
          onEnter: () =>
            gsap.from(el, { opacity: 0, y: 30, duration: 0.7, ease: "power2.out", clearProps: "all" }),
        });
        kills.push(() => st.kill());
      }
    });

    /* image reveals: clip-path wipe from top */
    document.querySelectorAll(".js-reveal").forEach((wrap) => {
      if (!reduceMotion) {
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
      }
    });

    /* convergence: words slide in from opposite sides */
    const convA = document.querySelector(".js-conv-a");
    const convB = document.querySelector(".js-conv-b");
    if (!reduceMotion && convA && convB) {
      const st = ScrollTrigger.create({
        trigger: document.querySelector(".studio-convergence"),
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.from(convA, { opacity: 0, x: -100, duration: 0.9, ease: "power2.out", clearProps: "all" });
          gsap.from(convB, { opacity: 0, x: 100, duration: 0.9, ease: "power2.out", delay: 0.06, clearProps: "all" });
        },
      });
      kills.push(() => st.kill());
    }

    /* generic fade+translateY blocks */
    document.querySelectorAll(".js-fade").forEach((el) => {
      if (!reduceMotion) {
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          once: true,
          onEnter: () =>
            gsap.from(el, { opacity: 0, y: 24, duration: 0.7, ease: "power2.out", clearProps: "all" }),
        });
        kills.push(() => st.kill());
      }
    });

  } catch (_) {
    /* If GSAP fails for any reason, ensure content is visible */
  }

  /* ── services accordion (hover device only) ── */
  const isHoverDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const svcRows = document.querySelectorAll(".js-svc");

  svcRows.forEach((row) => {
    const desc = row.querySelector(".snp-svc__desc");

    if (isHoverDevice) {
      gsap.set(desc, { height: 0, opacity: 0, overflow: "hidden", marginTop: 0 });
    }

    if (!isHoverDevice) return;

    let tl = null;

    const enter = () => {
      svcRows.forEach((r) => {
        if (r !== row) gsap.to(r, { opacity: 0.25, duration: 0.3, ease: "power2.out" });
      });
      if (tl) tl.kill();
      if (reduceMotion) {
        gsap.set(desc, { height: "auto", opacity: 1, marginTop: 14 });
      } else {
        tl = gsap.timeline()
          .to(desc, { height: "auto", marginTop: 14, duration: 0.35, ease: "power2.out" })
          .to(desc, { opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.2");
      }
    };

    const leave = () => {
      svcRows.forEach((r) =>
        gsap.to(r, { opacity: 1, duration: 0.3, ease: "power2.out" })
      );
      if (tl) tl.kill();
      if (reduceMotion) {
        gsap.set(desc, { height: 0, opacity: 0, marginTop: 0 });
      } else {
        tl = gsap.timeline()
          .to(desc, { opacity: 0, duration: 0.2, ease: "power2.in" })
          .to(desc, { height: 0, marginTop: 0, duration: 0.25, ease: "power2.in" }, "-=0.1");
      }
    };

    row.addEventListener("mouseenter", enter);
    row.addEventListener("mouseleave", leave);
    kills.push(() => {
      row.removeEventListener("mouseenter", enter);
      row.removeEventListener("mouseleave", leave);
      if (tl) tl.kill();
    });
  });

  return () => kills.forEach((fn) => fn());
};
