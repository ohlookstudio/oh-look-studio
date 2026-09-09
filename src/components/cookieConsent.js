import { initAnalyticsConsent, setAnalyticsConsent } from "../analytics.js";

const STORAGE_KEY = "ohlook_cookie_consent";
const CONSENT_VERSION = 1;

const defaultConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function readConsent() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version !== CONSENT_VERSION) return null;
    return { ...defaultConsent, ...saved.categories, necessary: true };
  } catch {
    return null;
  }
}

function saveConsent(categories) {
  const consent = { ...defaultConsent, ...categories, necessary: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: CONSENT_VERSION,
    categories: consent,
    updatedAt: new Date().toISOString(),
  }));
  setAnalyticsConsent(consent.analytics);
  return consent;
}

function consentMarkup() {
  return `
    <section id="cookieConsent" aria-label="Cookie preferences" hidden>
      <div id="cookieConsentBanner" role="region" aria-labelledby="cookieConsentTitle">
        <div>
          <p id="cookieConsentKicker">BEFORE YOU LØØK AROUND</p>
          <h2 id="cookieConsentTitle">Can we look too? 👀</h2>
          <p>We use a little analytics to see how people move around here — what catches your eye, what gets a second look. Nothing sneaky. <a href="/privacy" data-link>Privacy details</a></p>
        </div>
        <div id="cookieConsentActions">
          <button class="nav__link" type="button" data-consent-action="reject">Not today</button>
          <button class="nav__link" type="button" data-consent-action="preferences">Preferences</button>
          <button class="nav__link" type="button" data-consent-action="accept">Sure, have a løøk</button>
        </div>
      </div>

      <div id="cookiePreferences" role="dialog" aria-modal="true" aria-labelledby="cookiePreferencesTitle" hidden>
        <div id="cookiePreferencesBackdrop" data-consent-action="close"></div>
        <div id="cookiePreferencesPanel" tabindex="-1">
          <p id="cookiePreferencesKicker">Your choice</p>
          <h2 id="cookiePreferencesTitle">Cookie preferences</h2>
          <p id="cookiePreferencesIntro">Choose which optional technologies may run. You can return here from the footer at any time.</p>

          <div id="cookieCategories">
            <label>
              <span><strong>Necessary</strong><small>Stores your consent choice and keeps the site working.</small></span>
              <input type="checkbox" checked disabled aria-label="Necessary cookies, always active">
            </label>
            <label>
              <span><strong>Analytics</strong><small>Google Analytics 4, used to understand visits and improve the site.</small></span>
              <input id="analyticsConsent" type="checkbox">
            </label>
            <label>
              <span><strong>Marketing</strong><small>Reserved for future marketing tools. No marketing tool is installed.</small></span>
              <input type="checkbox" disabled aria-label="Marketing cookies, not currently in use">
            </label>
          </div>

          <div id="cookiePreferencesActions">
            <button class="nav__link" type="button" data-consent-action="reject">Reject optional</button>
            <button class="nav__link" type="button" data-consent-action="save">Save preferences</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initCookieConsent() {
  initAnalyticsConsent();

  document.body.insertAdjacentHTML("beforeend", consentMarkup());
  const root = document.getElementById("cookieConsent");
  const banner = document.getElementById("cookieConsentBanner");
  const dialog = document.getElementById("cookiePreferences");
  const panel = document.getElementById("cookiePreferencesPanel");
  const analyticsInput = document.getElementById("analyticsConsent");
  let consent = readConsent();
  let returnFocus = null;

  const hideAll = () => {
    root.hidden = true;
    banner.hidden = true;
    dialog.hidden = true;
    document.body.classList.remove("is-cookie-preferences-open");
  };

  const openPreferences = (trigger) => {
    returnFocus = trigger || document.activeElement;
    analyticsInput.checked = Boolean(consent?.analytics);
    root.hidden = false;
    banner.hidden = true;
    dialog.hidden = false;
    document.body.classList.add("is-cookie-preferences-open");
    requestAnimationFrame(() => panel.focus());
  };

  const closePreferences = () => {
    dialog.hidden = true;
    document.body.classList.remove("is-cookie-preferences-open");
    if (consent) root.hidden = true;
    else banner.hidden = false;
    returnFocus?.focus?.();
  };

  const applyChoice = (categories) => {
    consent = saveConsent(categories);
    hideAll();
    returnFocus?.focus?.();
  };

  root.addEventListener("click", (event) => {
    const control = event.target.closest("[data-consent-action]");
    if (!control) return;

    const action = control.dataset.consentAction;
    if (action === "accept") applyChoice({ analytics: true, marketing: false });
    if (action === "reject") applyChoice(defaultConsent);
    if (action === "preferences") openPreferences(control);
    if (action === "save") applyChoice({ analytics: analyticsInput.checked, marketing: false });
    if (action === "close") closePreferences();
  });

  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-cookie-preferences]");
    if (control) openPreferences(control);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.hidden) closePreferences();
  });

  if (consent) {
    setAnalyticsConsent(consent.analytics);
  } else {
    root.hidden = false;
    banner.hidden = false;
  }
}
