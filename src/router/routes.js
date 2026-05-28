// src/router/routes.js
import { Home, afterRenderHome } from "../pages/Home.js";
import { About } from "../pages/About.js";
import { Contact } from "../pages/Contact.js";
import { Works } from "../pages/Works.js";
import { Lab } from "../pages/Lab.js";
import { ProjectDetails } from "../pages/ProjectDetails.js";
import Privacy from "../pages/Privacy.js"; // ✅ default import

Home.init = afterRenderHome;

export const routes = [
  { path: "/", view: Home },
  { path: "/about", view: About },
  { path: "/works", view: Works },
  { path: "/lab", view: Lab },
  { path: "/contact", view: Contact },
  { path: "/projects/:slug", view: ProjectDetails },
  { path: "/privacy", view: Privacy }, // ✅ NEW
];
