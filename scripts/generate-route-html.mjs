import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_NAME = "Oh, løøk! Studio";
const BASE_URL = "https://ohlook.studio";
const DEFAULT_DESCRIPTION =
  "Independent branding studio for terroir products — wine, food, origin. Brand identity, art direction & creative coding. Between Sitges and the Corbières.";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const templatePath = path.join(distDir, "index.html");
const projectsPath = path.join(rootDir, "src/data/projects.json");

const [template, projectsSource] = await Promise.all([
  readFile(templatePath, "utf8"),
  readFile(projectsPath, "utf8"),
]);

const { projects = [] } = JSON.parse(projectsSource);

const staticRoutes = [
  {
    route: "/",
    title: "Oh, løøk! Studio — Brand identity for products with roots",
    description: DEFAULT_DESCRIPTION,
  },
  {
    route: "/about",
    title: `About — ${SITE_NAME}`,
    description:
      "A studio built on paying attention. Brand identity and creative coding for products with origin, between the sea of Sitges and the stone of the Corbières.",
  },
  {
    route: "/works",
    title: `Work — ${SITE_NAME}`,
    description:
      "Selected branding, art direction and digital projects. Identities for products with roots — wine, cacao, design.",
  },
  {
    route: "/contact",
    title: `Oh, hello! — ${SITE_NAME}`,
    description:
      "Let's build something that feels alive. Connecting Sitges and Talairan.",
  },
  {
    route: "/privacy",
    title: `Privacy — ${SITE_NAME}`,
    description:
      "Privacy information for Oh, løøk! Studio and how personal data is handled.",
  },
  {
    route: "/lab",
    title: `Oh, lab! — ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
  },
];

const projectRoutes = projects.map((project) => ({
  route: `/projects/${project.slug}`,
  title: `${project.seoTitle || project.title} — ${SITE_NAME}`,
  description: project.seoDescription || project.description || DEFAULT_DESCRIPTION,
  image: absoluteUrl(project.coverImage),
}));

const routes = [...staticRoutes, ...projectRoutes];
const expectedRoutes = new Set([
  "/",
  "/about",
  "/works",
  "/contact",
  "/privacy",
  "/lab",
  "/projects/xabi-cacao",
  "/projects/braun-milan",
  "/projects/pals-gard",
  "/projects/staccio",
]);

if (
  routes.length !== expectedRoutes.size ||
  routes.some(({ route }) => !expectedRoutes.delete(route)) ||
  expectedRoutes.size
) {
  throw new Error("Route metadata does not match the expected production routes.");
}

for (const metadata of routes) {
  const html = renderMetadata(template, metadata);
  const outputPath = routeOutputPath(metadata.route);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
  console.log(`✓ Generated ${path.relative(rootDir, outputPath)} for ${metadata.route}`);
}

const notFoundHtml = renderNotFound(template);
await writeFile(path.join(distDir, "404.html"), notFoundHtml);
console.log("✓ Generated dist/404.html");

function absoluteUrl(value) {
  if (!value) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function routeOutputPath(route) {
  if (route === "/") return templatePath;
  return path.join(distDir, `${route.slice(1)}.html`);
}

function renderMetadata(source, metadata) {
  const canonical = metadata.route === "/" ? `${BASE_URL}/` : `${BASE_URL}${metadata.route}`;
  const image = metadata.image || DEFAULT_IMAGE;

  let html = source;
  html = replaceExactlyOnce(html, /<title>[^<]*<\/title>/g, `<title>${escapeHtml(metadata.title)}</title>`, "title");
  html = replaceExactlyOnce(html, /<meta name="description" content="[^"]*">/g, `<meta name="description" content="${escapeAttribute(metadata.description)}">`, "description");
  html = replaceExactlyOnce(html, /<link rel="canonical" href="[^"]*">/g, `<link rel="canonical" href="${canonical}">`, "canonical");
  html = replaceExactlyOnce(html, /<meta property="og:title" content="[^"]*">/g, `<meta property="og:title" content="${escapeAttribute(metadata.title)}">`, "og:title");
  html = replaceExactlyOnce(html, /<meta property="og:description" content="[^"]*">/g, `<meta property="og:description" content="${escapeAttribute(metadata.description)}">`, "og:description");
  html = replaceExactlyOnce(html, /<meta property="og:url" content="[^"]*">/g, `<meta property="og:url" content="${canonical}">`, "og:url");
  html = replaceExactlyOnce(html, /<meta property="og:image" content="[^"]*">/g, `<meta property="og:image" content="${escapeAttribute(image)}">`, "og:image");
  html = replaceExactlyOnce(html, /<meta name="twitter:title" content="[^"]*">/g, `<meta name="twitter:title" content="${escapeAttribute(metadata.title)}">`, "twitter:title");
  html = replaceExactlyOnce(html, /<meta name="twitter:description" content="[^"]*">/g, `<meta name="twitter:description" content="${escapeAttribute(metadata.description)}">`, "twitter:description");
  html = replaceExactlyOnce(html, /<meta name="twitter:image" content="[^"]*">/g, `<meta name="twitter:image" content="${escapeAttribute(image)}">`, "twitter:image");

  if (metadata.image) {
    html = html.replace(/^\s*<meta property="og:image:(?:width|height)"[^>]*>\s*$/gm, "");
  }

  return html;
}

function renderNotFound(source) {
  let html = renderMetadata(source, {
    route: "/404.html",
    title: `Page not found — ${SITE_NAME}`,
    description: "The requested page could not be found.",
  });

  html = replaceExactlyOnce(html, /^\s*<link rel="canonical" href="[^"]*">\s*$/gm, "", "404 canonical");
  html = replaceExactlyOnce(html, /<\/head>/g, `  <meta name="robots" content="noindex, follow">\n  </head>`, "404 robots");
  return html;
}

function replaceExactlyOnce(source, pattern, replacement, label) {
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label} tag, found ${matches.length}.`);
  }
  return source.replace(pattern, replacement);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
