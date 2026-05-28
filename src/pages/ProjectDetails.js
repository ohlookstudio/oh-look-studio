import projectsData from "../data/projects.json";

export async function ProjectDetails({ slug } = {}) {
  const projects = projectsData.projects || [];
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return `
      <section class="page page--dark">
        <div class="page-inner">
          <h1 class="h1">Project not found</h1>
          <p><a data-link href="/">← Back to Home</a></p>
        </div>
      </section>
    `;
  }

  return `
    <section class="page page--dark">
      <div class="page-inner">
        <p class="eyebrow">${project.year ?? ""}</p>
        <h1 class="h1">${project.title}</h1>
        <p class="lead">${project.description ?? ""}</p>

        <div class="meta-row">
          ${project.tags?.length ? `<div><strong>Tags</strong><br/>${project.tags.join(" · ")}</div>` : ""}
          ${project.services?.length ? `<div><strong>Services</strong><br/>${project.services.join(" · ")}</div>` : ""}
        </div>

        <div class="divider"></div>

        <p>
          Aquí va tu scroll narrativo del case study (texturas, layout editorial, motion…).
        </p>

        <p style="margin-top:24px;"><a data-link href="/">← Back to Home</a></p>
      </div>
    </section>
  `;
}
