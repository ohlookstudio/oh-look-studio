import projectsData from "../data/projects.json";
import { setMeta } from "../utils/seo.js";
import gsap from "gsap";

export function Works() {
  setMeta({
    title: "Oh, works!",
    description: "Selected perspectives — each one a distinct point of view.",
    url: "/works"
  });

  const projects = projectsData.projects || [];

  return `
    <main class="works-page">
      <header class="works-header">
        <div class="works-header__inner">
          <p class="eyebrow">WORKS</p>
          <h1 class="works-display">Oh, works!</h1>
          <p class="works-subtitle">
            Selected perspectives — each one a distinct point of view.
          </p>
        </div>
      </header>

      <div class="works-list">
        ${projects.map((p, i) => `
          <a class="works-row js-works-row"
             href="/projects/${p.slug}"
             data-link
             data-project-link
             data-index="${i}"
             data-slug="${p.slug}">
            
            <img class="works-row__mobile-img" src="${p.coverImage}" alt="${p.title}" loading="lazy">
            
            <span class="works-row__num">${String(i + 1).padStart(2, '0')}</span>
            <h2 class="works-row__title">${p.title}</h2>
            <div class="works-row__meta">
              <span class="works-row__tags">${p.tags.join(" · ")}</span>
              <span class="works-row__year">${p.year}</span>
            </div>
          </a>
        `).join('')}
      </div>

      <!-- Floating Image Container -->
      <div class="works-float js-works-float">
        <div class="works-float__inner">
          ${projects.map((p, i) => `
            <img class="works-float__img js-works-float-img" 
                 src="${p.coverImage}" 
                 data-index="${i}" 
                 alt="${p.title}">
          `).join('')}
        </div>
      </div>
    </main>
  `;
}

Works.init = function() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rows = document.querySelectorAll(".js-works-row");
  const float = document.querySelector(".js-works-float");
  const floatImgs = document.querySelectorAll(".js-works-float-img");
  
  if (!float || !rows.length || reduce) {
    // If reduced motion or missing elements, ensure rows are visible and clickable normally
    // Mobile layout is handled by CSS (hover: none)
    rows.forEach(row => {
      row.addEventListener("click", () => {
        window.__projectReferrer = '/works';
      });
    });
    return () => {};
  }

  const state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    lerp: 0.1,
    active: false,
    raf: null
  };

  const onMouseMove = (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  };

  const update = () => {
    state.currentX += (state.mouseX - state.currentX) * state.lerp;
    state.currentY += (state.mouseY - state.currentY) * state.lerp;

    // Offset by half dimensions (140, 190) to center on cursor
    gsap.set(float, {
      x: state.currentX - 140,
      y: state.currentY - 190
    });

    state.raf = requestAnimationFrame(update);
  };

  state.raf = requestAnimationFrame(update);
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  rows.forEach(row => {
    const idx = row.getAttribute("data-index");
    const activeImg = Array.from(floatImgs).find(img => img.getAttribute("data-index") === idx);

    row.addEventListener("mouseenter", () => {
      // Dim other rows
      rows.forEach(r => {
        if (r !== row) gsap.to(r, { opacity: 0.3, duration: 0.4, ease: "power2.out" });
      });

      // Show float container
      gsap.to(float, { autoAlpha: 1, duration: 0.3 });
      
      // Activate correct image
      floatImgs.forEach(img => {
        if (img === activeImg) {
          img.classList.add("is-active");
          gsap.fromTo(img, 
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out", overwrite: true }
          );
        } else {
          img.classList.remove("is-active");
          gsap.set(img, { opacity: 0, scale: 0.8 });
        }
      });
    });

    row.addEventListener("mouseleave", () => {
      // Reset rows
      rows.forEach(r => gsap.to(r, { opacity: 1, duration: 0.4, ease: "power2.out" }));
      
      // Hide float container
      gsap.to(float, { autoAlpha: 0, duration: 0.3 });
    });

    row.addEventListener("click", () => {
      window.__projectReferrer = '/works';
    });
  });

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    if (state.raf) cancelAnimationFrame(state.raf);
  };
};
