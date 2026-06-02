const SITE_NAME = "Oh, løøk! Studio";
const BASE_URL  = "https://ohlook.studio";
const DEFAULT_DESC = "A graphic design studio based between Sitges & Talairan. Branding, identity and editorial design.";
const DEFAULT_IMAGE = "/og-image.jpg";

export function setMeta({ title, description, url, image } = {}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc  = description || DEFAULT_DESC;
  const img   = image || DEFAULT_IMAGE;
  const href  = url ? `${BASE_URL}${url}` : BASE_URL;

  document.title = fullTitle;

  setTag('meta[name="description"]',    "content", desc);
  setTag('link[rel="canonical"]',       "href",    href);
  setTag('meta[property="og:title"]',   "content", fullTitle);
  setTag('meta[property="og:description"]', "content", desc);
  setTag('meta[property="og:url"]',     "content", href);
  setTag('meta[property="og:image"]',   "content", img);
  setTag('meta[name="twitter:title"]',  "content", fullTitle);
  setTag('meta[name="twitter:description"]', "content", desc);
  setTag('meta[name="twitter:image"]',  "content", img);
}

function setTag(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}
