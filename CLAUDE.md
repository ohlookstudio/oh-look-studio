# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (HMR)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

No test runner is configured.

## Architecture

This is a **vanilla JS SPA** (no framework) bundled with **Vite**. It has a custom client-side router and does not use React, Vue, or any component framework.

### Entry flow

```
index.html
  └─ src/main.js          (imports CSS, calls initApp)
       └─ src/app.js       (mounts Layout, header/menu, bgParticles, footerTextCanvas, router)
```

### Router (`src/router/`)

`router.js` is a hand-rolled hash-free client-side router. Key points:
- Links must have `data-link` attribute to be intercepted; the router listens to document-level click.
- Navigation: `PageTransition.out()` → `pushState` → `renderRoute()` → `PageTransition.in()`.
- Each route's `view` function returns an HTML string. If `view.init` exists it is called after the HTML is injected and must return a cleanup function (stored in `currentCleanup`, called on next navigation).
- Routes are defined in `routes.js`. Dynamic segments use `:param` syntax (e.g. `/projects/:slug`).
- The header is hidden on `/` and visible on all other routes via `is-hidden`/`is-visible` CSS classes.

### Pages (`src/pages/`)

Pure functions that return HTML strings. `ProjectDetails` reads slug from params and looks up `src/data/projects.json`. Pages are lazy-loaded by the router (`await found.route.view(params)`).

### Components (`src/components/`)

- `Layout.js` — renders the persistent shell: `#bgParticles` canvas, `<header>`, `#view` (swapped per route), `<footer>`.
- `PageTransition.js` — CSS-driven fade overlay; durations driven by `--pt-out-ms` / `--pt-in-ms` CSS vars.
- `footerTextCanvas.js` — canvas-rendered footer text (mounted once, persists across navigations).
- `menu.js` — mobile menu toggling.

### Hero & canvas effects (`src/hero/`)

- `bgParticles.js` — full-screen particle canvas (`#bgParticles`), mounted globally once, runs for the lifetime of the app. Particles spawn from hero (downward) and footer (upward), bi-directional. Respects `prefers-reduced-motion`.
- `hero.js` / `particles.js` / `scrollHeroCanvas.js` — hero-specific animations, mounted/cleaned up with the Home page.

### Styles (`src/styles/`)

- `token.css` — minimal colour tokens (imported by `global.css` implicitly via cascade).
- `global.css` — CSS custom properties for the whole design system (colours, typography, spacing, nav, page transitions). All design tokens live here as `:root` vars.
- `components.css` — component-level styles.
- `home.css` — Home-specific layout styles.

Design tokens of note:
- `--bg: #0B0B0B`, `--fg: #F3F3F3`, `--accent: #A0C6AF`, `--accent-alt: #CB6868`
- `--font-primary: "ohno-softie-variable"` (Adobe Fonts / Typekit), `--font-secondary: "Space Grotesk"` (Google Fonts)
- `--pt-out-ms` / `--pt-in-ms` control page transition duration

### Data (`src/data/projects.json`)

Single JSON file holding all project records. `ProjectDetails` and any project-listing page read from here.

## Design Philosophy
- Studio name: Oh, løøk! Studio
- Experimental style — multiple design techniques mixed intentionally
- Wabi-sabi: imperfection is part of the aesthetic, not a bug
- References: Pentagram, Toormix, Vasava, Gretel, Paula Scher
- Tone: editorial, experimental, never generic

## Pages Status
- Home: built ✅ (hero canvas particles + GSAP scroll + featured projects)
- Works: empty placeholder ⬜
- About/Studio: empty placeholder ⬜
- Project detail: basic structure ⬜
- Lab: empty placeholder ⬜
- Contact: empty placeholder ⬜

## Rules
- Always use existing tokens, never hardcode colors or fonts
- Ask before creating new CSS classes if similar ones already exist
- Every page should feel like a designed artifact, not a template
- Respect the existing router pattern: view returns HTML string, view.init returns cleanup function

### Utilities (`src/utils/`)

- `accessibility.js` — focus helpers, reduced-motion checks.
- `dom.js` — querySelector shorthands.
- `textPoints.js` — canvas text-to-points utility (used by hero canvas effects).
