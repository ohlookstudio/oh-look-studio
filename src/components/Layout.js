import { Header } from "./Header.js";
import { Footer } from "./Footer.js";

export function Layout() {
  return `
    <canvas id="bgParticles" aria-hidden="true"></canvas>
    ${Header()}
    <div id="view" role="region" aria-label="Page content"></div>
    ${Footer()}
  `;
}
