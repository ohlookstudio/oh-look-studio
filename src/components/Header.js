// src/components/Header.js
import { SOCIAL } from '../data/social.js';

export function Header() {
  return `
    <header id="siteHeader" class="site-header is-hidden">
      <a class="brand" data-link href="/" aria-label="Oh, løøk! Home">
        <img class="brand__logo" src="/images/OhLook_MainLogo_White.svg" alt="Oh, løøk! Studio" />
      </a>

      <nav class="nav nav--desktop" aria-label="Primary navigation">
        <a class="nav__link" data-link href="/">Oh, look!</a>
        <a class="nav__link" data-link href="/about">Oh, studio!</a>
        <a class="nav__link" data-link href="/works">Oh, works!</a>
        <a class="nav__link" data-link href="/lab">Oh, lab!</a>
        <a class="nav__link" data-link href="/contact">Oh, hello!</a>
      </nav>

      <button
        class="nav-toggle"
        id="navToggle"
        type="button"
        aria-label="Open menu"
        aria-controls="mobileNav"
        aria-expanded="false"
      >
        <span class="nav-toggle__icon" aria-hidden="true"></span>
      </button>

      <div class="mobile-nav" id="mobileNav" aria-hidden="true">
        <div class="mobile-nav__overlay" data-close></div>

        <aside class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1">
          <button class="mobile-nav__close" type="button" aria-label="Close menu" data-close></button>

          <canvas class="menu-canvas" id="menuCanvas" aria-hidden="true"></canvas>

          <div class="mobile-nav__content">
            <div class="mobile-nav__brand" aria-hidden="true">
              <img
                class="mobile-nav__brand-logo"
                src="/images/OhLook_MainLogo_White.svg"
                alt=""
              />
              <div class="mobile-nav__kicker">OH, MENU!</div>
            </div>

            <nav class="mobile-nav__links" aria-label="Mobile navigation">
              <a class="nav__link nav__link--mobile" data-link href="/">Oh, look!</a>
              <a class="nav__link nav__link--mobile" data-link href="/about">Oh, studio!</a>
              <a class="nav__link nav__link--mobile" data-link href="/works">Oh, works!</a>
              <a class="nav__link nav__link--mobile" data-link href="/lab">Oh, lab!</a>
              <a class="nav__link nav__link--mobile" data-link href="/contact">Oh, hallo!</a>
            </nav>

            <div class="mobile-nav__social" aria-label="Social links">
              <a class="social-link" href="${SOCIAL.instagram}" target="_blank" rel="noopener noreferrer">IG</a>
              <a class="social-link" href="${SOCIAL.linkedin}" target="_blank" rel="noopener noreferrer">IN</a>
              <a class="social-link" href="${SOCIAL.behance}" target="_blank" rel="noopener noreferrer">BE</a>
            </div>
          </div>
        </aside>
      </div>
    </header>
  `;
}