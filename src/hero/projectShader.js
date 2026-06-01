import * as THREE from "three";
import gsap from "gsap";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;

  uniform sampler2D uTexture;
  uniform float     uProgress;
  uniform bool      uHasTexture;
  uniform vec2      uUvScale;   /* cover-mode UV scale — corrects aspect ratio */
  varying vec2      vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),               hash(i + vec2(1., 0.)), u.x),
      mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x),
      u.y
    );
  }

  void main() {
    /* Cover-mode UV: divide by scale so the image fills the plane
       without stretching (equivalent to object-fit: cover).
       uUvScale > 1 in a dimension = that axis is cropped. */
    vec2 uv = (vUv - 0.5) / uUvScale + 0.5;

    float s  = pow(max(0.0, 1.0 - uProgress), 2.2);

    float n1 = noise(uv * 4.5 + vec2(uProgress * 1.8, 0.0));
    float n2 = noise(uv * 8.5 - vec2(0.0, uProgress * 2.4));

    uv.x += (sin(uv.y * 7.5 + uProgress * 9.0) * 0.055 + (n1 - 0.5) * 0.07) * s;
    uv.y += (cos(uv.x * 5.8 + uProgress * 7.0) * 0.042 + (n2 - 0.5) * 0.05) * s;
    uv = clamp(uv, 0.001, 0.999);

    if (uHasTexture) {
      float ca = s * 0.014;
      float r  = texture2D(uTexture, uv + vec2(ca, 0.0)).r;
      float g  = texture2D(uTexture, uv).g;
      float b  = texture2D(uTexture, uv - vec2(ca, 0.0)).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    } else {
      /* placeholder: subtle animated dark with grain */
      float grain   = noise(uv * 85.0 + vec2(uProgress * 6.0)) * 0.045 * s;
      float base    = 0.072 + grain;
      float accent  = 0.04 * s;
      gl_FragColor  = vec4(base + accent * 0.25, base + accent * 0.35, base + accent * 0.10, 1.0);
    }
  }
`;

export function mountProjectShader(container, imageUrl) {
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduce || !container) return () => {};

  /* --------------------------------------------------
     Setup Three.js
  -------------------------------------------------- */
  const w = container.offsetWidth  || 600;
  const h = container.offsetHeight || 800;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  const el = renderer.domElement;
  el.classList.add("project-detail__canvas");
  container.appendChild(el);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene  = new THREE.Scene();
  const geo    = new THREE.PlaneGeometry(2, 2);

  const uniforms = {
    uTexture:    { value: null },
    uProgress:   { value: 0   },
    uHasTexture: { value: false },
    uUvScale:    { value: new THREE.Vector2(1.0, 1.0) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader:   VERT,
    fragmentShader: FRAG,
    uniforms,
  });

  scene.add(new THREE.Mesh(geo, material));

  let tween         = null;
  let loadedTexture = null;

  /* Compute cover-mode UV scale based on container vs image aspect ratio */
  function computeUvScale(imgW, imgH, cW, cH) {
    const imgAspect = imgW / imgH;
    const cAspect   = cW  / cH;
    if (cAspect > imgAspect) {
      /* Container wider → crop top/bottom */
      uniforms.uUvScale.value.set(1.0, cAspect / imgAspect);
    } else {
      /* Container taller → crop left/right */
      uniforms.uUvScale.value.set(imgAspect / cAspect, 1.0);
    }
  }

  /* Resize */
  function onResize() {
    const nw = container.offsetWidth;
    const nh = container.offsetHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    if (loadedTexture) {
      const img = loadedTexture.image;
      computeUvScale(img.naturalWidth || img.width, img.naturalHeight || img.height, nw, nh);
    }
  }
  window.addEventListener("resize", onResize);

  /* Animate */
  function runAnimation() {
    renderer.render(scene, camera); /* first frame immediately */

    const proxy = { p: 0 };
    tween = gsap.to(proxy, {
      p: 1,
      duration: 1.5,
      ease: "power2.out",
      onUpdate() {
        uniforms.uProgress.value = proxy.p;
        renderer.render(scene, camera);
      },
      onComplete() {
        /* Fade out canvas, then remove — the <img> beneath is revealed */
        el.style.transition = "opacity 0.5s ease";
        el.style.opacity    = "0";
        setTimeout(teardown, 560);
      },
    });
  }

  /* Start with or without texture */
  if (imageUrl) {
    new THREE.TextureLoader().load(
      imageUrl,
      (tex) => {
        loadedTexture = tex;
        const img = tex.image;
        computeUvScale(
          img.naturalWidth  || img.width,
          img.naturalHeight || img.height,
          w, h
        );
        uniforms.uTexture.value    = tex;
        uniforms.uHasTexture.value = true;
        runAnimation();
      },
      undefined,
      () => runAnimation()  /* 404 → run placeholder shader */
    );
  } else {
    runAnimation();
  }

  /* --------------------------------------------------
     Cleanup
  -------------------------------------------------- */
  function teardown() {
    window.removeEventListener("resize", onResize);
    if (tween) { tween.kill(); tween = null; }
    material.dispose();
    geo.dispose();
    if (loadedTexture) loadedTexture.dispose();
    if (el.parentNode) el.parentNode.removeChild(el);
    renderer.dispose();
  }

  return teardown;
}
