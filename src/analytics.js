const MEASUREMENT_ID = "G-VC20TZJ5QY";
const GA_SCRIPT_ID = "google-analytics-script";

let analyticsGranted = false;
let analyticsConfigured = false;
let consentInitialized = false;

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
}

function setGoogleConsent(status) {
  ensureGtag();
  window.gtag("consent", consentInitialized ? "update" : "default", {
    analytics_storage: status,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
  consentInitialized = true;
}

function loadGoogleAnalytics() {
  if (document.getElementById(GA_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
  analyticsConfigured = true;
}

function deleteAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  const hostname = window.location.hostname;
  const domains = ["", hostname, `.${hostname}`];

  names.forEach((name) => {
    domains.forEach((domain) => {
      const domainPart = domain ? `;domain=${domain}` : "";
      document.cookie = `${name}=;Max-Age=0;path=/${domainPart};SameSite=Lax`;
    });
  });
}

export function initAnalyticsConsent() {
  setGoogleConsent("denied");
}

export function setAnalyticsConsent(granted) {
  const wasGranted = analyticsGranted;
  analyticsGranted = Boolean(granted);
  setGoogleConsent(analyticsGranted ? "granted" : "denied");

  if (analyticsGranted) {
    if (!analyticsConfigured) {
      loadGoogleAnalytics();
    } else if (!wasGranted) {
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  } else if (wasGranted) {
    deleteAnalyticsCookies();
  }
}
