import projectsData from "../data/projects.json";
import { mountProjectShader } from "../hero/projectShader.js";

export async function ProjectDetails({ slug } = {}) {
  const projects = projectsData.projects || [];
  const project  = projects.find((p) => p.slug === slug);

  if (!project) {
    return `
      <main class="page page--dark">
        <div class="page-inner">
          <h1 class="h1">Project not found</h1>
          <p><a class="nav__link" data-link href="/works">← Back to works</a></p>
        </div>
      </main>
    `;
  }

  return `
    <main class="project-detail">
      <div class="project-detail__layout">

        <!-- LEFT — scrolling title + body -->
        <div class="project-detail__left">

          <div class="project-detail__title-block">
            <a class="project-detail__back" data-link href="/works">← Works</a>
            <h1 class="project-detail__display">${project.title}</h1>

            <div class="project-detail__meta-row">
              <span class="project-detail__year kicker">${project.year ?? ""}</span>
              ${project.tags?.length
                ? `<span class="project-detail__tags kicker">${project.tags.join(" · ")}</span>`
                : ""}
            </div>

            ${project.services?.length ? `
              <div class="project-detail__services">
                <span class="project-detail__label">Services</span>
                <p class="muted">${project.services.join(" · ")}</p>
              </div>
            ` : ""}
          </div>

          <div class="project-detail__divider"></div>

          <div class="project-detail__body">
            <p class="project-detail__lead">${project.description ?? ""}</p>

            <p class="muted">
              Case study coming soon — this is where the scroll narrative
              lives: textures, editorial layout, motion references, the full story.
            </p>
          </div>

          <div class="project-detail__footer">
            <a class="btn btn--pill" data-link href="/works">← Back to works</a>
          </div>

        </div>

        <!-- RIGHT — sticky cover with WebGL shader -->
        <div class="project-detail__right">
          <div class="project-detail__cover" id="projectCover">
            ${project.coverImage
              ? `<img class="project-detail__cover-img"
                      src="${project.coverImage}"
                      alt="${project.title}"
                      loading="eager">`
              : ''}
          </div>
        </div>

      </div>
    </main>
  `;
}

ProjectDetails.init = function ({ slug } = {}) {
  const projects = projectsData.projects || [];
  const project  = projects.find((p) => p.slug === slug);

  const cover = document.getElementById("projectCover");
  if (!cover || !project) return () => {};

  return mountProjectShader(cover, project.coverImage ?? null);
};
