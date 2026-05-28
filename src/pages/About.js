export async function About() {
  return `
    <section class="page page--dark">
      <div class="page-inner">
        <h1 class="h1">About</h1>
        <p class="lead">
          Oh, løøk! Studio is an editorial approach to branding: sharp systems, warm details, and motion as a language.
        </p>

        <div class="cols">
          <div>
            <h2 class="h2">What I do</h2>
            <ul class="list">
              <li>Brand identity systems</li>
              <li>Editorial & layout</li>
              <li>Motion & interaction (GSAP / WebGL)</li>
              <li>Web design & creative development</li>
            </ul>
          </div>
          <div>
            <h2 class="h2">The tone</h2>
            <p>
              Nordic clarity with a pop twist. Elegant, slightly ironic, always crafted.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}
