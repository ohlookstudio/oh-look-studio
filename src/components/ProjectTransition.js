/**
 * ProjectTransition — WebGL liquid-distortion transition for project links.
 *
 * Intercepts clicks on [data-project-link] (capture phase, fires before router),
 * sweeps a noise-based radial wave from the click origin to cover the screen,
 * navigates, then fades the canvas out revealing the new page.
 *
 * Inspired by akella's webGLImageTransitions demo 6:
 * https://github.com/akella/webGLImageTransitions/blob/master/js/demo6.js
 */

import * as THREE from "three";
import gsap from "gsap";
import { navigate } from "../router/router.js";
import { PageTransition } from "./PageTransition.js";

/* ====================================================
   GLSL
==================================================== */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Demo-6-style: noise-based radial wave sweeping from click origin.
   Source colour → liquid distortion at wave front → dark background. */
const FRAG = /* glsl */ `
  precision mediump float;

  uniform float uProgress;  /* 0 = start, 1 = fully dark            */
  uniform vec2  uOrigin;    /* click origin in UV coords (y flipped) */
  uniform vec3  uColor;     /* source colour (matched to card bg)    */
  uniform float uAspect;    /* viewport w/h                          */

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3. - 2. * f);
    return mix(mix(hash(i),           hash(i + vec2(1., 0.)), u.x),
               mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0., a = .5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.; a *= .5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 ar = vec2(uAspect, 1.0);

    /* Screen-space distance from click origin */
    float dist = length((uv - uOrigin) * ar);

    /* Max distance from origin to farthest viewport corner */
    float maxD = max(
      max(length((vec2(0., 0.) - uOrigin) * ar), length((vec2(1., 0.) - uOrigin) * ar)),
      max(length((vec2(0., 1.) - uOrigin) * ar), length((vec2(1., 1.) - uOrigin) * ar))
    );

    /* Wave front travels from 0 → maxD as uProgress goes 0 → 1 */
    float waveDist = uProgress * (maxD + 0.08);
    float local    = waveDist - dist;          /* +ve = wave has passed */

    /* Coverage: pixels behind the wave front darken to --bg */
    float covered = smoothstep(-0.02, 0.18, local);

    /* Edge band: maximum distortion at wave front, zero elsewhere */
    float edge = smoothstep(-0.06, 0.0, local) * (1. - smoothstep(0.0, 0.40, local));

    /* FBM noise for liquid displacement */
    float n1 = fbm(uv * 4.2 + uProgress * 1.9);
    float n2 = fbm(uv * 3.6 - uProgress * 1.5 + 1.7);

    /* Displaced UV (used only for procedural noise on solid-colour source) */
    vec2 dispUv = uv + vec2(n1 - 0.5, n2 - 0.5) * edge * 0.22;

    /* Add grain texture to the source colour at the wave edge */
    float grain = fbm(dispUv * 8.0 + uProgress * 3.0);
    vec3 src = uColor + (grain - 0.5) * edge * 0.14;

    /* Chromatic-aberration-like colour split at wave front */
    src.r += edge * 0.06 * (fbm(dispUv * 5.0) - 0.5);
    src.b -= edge * 0.04 * (fbm(dispUv * 6.5 + 2.3) - 0.5);

    vec3 bg  = vec3(0.043);                    /* --bg: #0B0B0B */
    vec3 col = mix(src, bg, covered);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ====================================================
   WebGL feature detection
==================================================== */
function isWebGLAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/* ====================================================
   Extract background colour from the clicked element
==================================================== */
function getFrameColor(linkEl) {
  const frame = linkEl.querySelector(".fp-item__frame, .works-card__cover");
  if (!frame) return new THREE.Vector3(0.067, 0.067, 0.067);

  const bg = getComputedStyle(frame).backgroundColor;
  const m  = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return new THREE.Vector3(0.067, 0.067, 0.067);

  return new THREE.Vector3(+m[1] / 255, +m[2] / 255, +m[3] / 255);
}

/* ====================================================
   Build (or rebuild) the Three.js renderer + scene
==================================================== */
let _state = null;

function buildScene() {
  /* Teardown any previous instance */
  if (_state) {
    _state.renderer.dispose();
    if (_state.renderer.domElement.parentNode) {
      _state.renderer.domElement.parentNode.removeChild(_state.renderer.domElement);
    }
    _state = null;
  }

  const w = window.innerWidth;
  const h = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  /* Position canvas as a fixed full-screen overlay */
  const el = renderer.domElement;
  Object.assign(el.style, {
    position:      "fixed",
    inset:         "0",
    width:         "100%",
    height:        "100%",
    zIndex:        "19999",
    pointerEvents: "none",
    display:       "block",
  });
  document.body.appendChild(el);

  const scene    = new THREE.Scene();
  const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader:   VERT,
    fragmentShader: FRAG,
    uniforms: {
      uProgress: { value: 0 },
      uOrigin:   { value: new THREE.Vector2(0.5, 0.5) },
      uColor:    { value: new THREE.Vector3(0.067, 0.067, 0.067) },
      uAspect:   { value: w / h },
    },
  });

  scene.add(new THREE.Mesh(geometry, material));

  _state = { renderer, scene, camera, material, geometry };
  return _state;
}

/* ====================================================
   Run the full OUT → navigate → IN sequence
==================================================== */
async function runTransition(origin, color, targetPath) {
  const { renderer, scene, camera, material } = buildScene();
  const { uProgress, uOrigin, uColor, uAspect } = material.uniforms;

  uOrigin.value.set(origin.x, origin.y);
  uColor.value.copy(color);
  uAspect.value = window.innerWidth / window.innerHeight;
  uProgress.value = 0;

  /* First frame: show source colour immediately (no black flash) */
  renderer.render(scene, camera);

  /* OUT: wave sweeps from click origin (~800ms) */
  const proxy = { p: 0 };
  await new Promise((resolve) => {
    gsap.to(proxy, {
      p:        1,
      duration: 0.82,
      ease:     "power2.out",
      onUpdate() {
        uProgress.value = proxy.p;
        renderer.render(scene, camera);
      },
      onComplete: resolve,
    });
  });

  /* Tell the CSS page transition to stand down for this navigate */
  PageTransition.skip();

  /* Navigate — page renders behind the WebGL canvas */
  navigate(targetPath);

  /* Short pause so the new page has time to paint */
  await new Promise((r) => setTimeout(r, 110));

  /* IN: fade canvas out to reveal the new page */
  const el = renderer.domElement;
  el.style.transition = "opacity 0.60s cubic-bezier(0.4, 0, 0.2, 1)";
  el.style.opacity    = "0";

  setTimeout(() => {
    if (_state) {
      _state.material.dispose();
      _state.geometry.dispose();
      _state.renderer.dispose();
      if (el.parentNode) el.parentNode.removeChild(el);
      _state = null;
    }
  }, 680);
}

/* ====================================================
   Click handler (capture phase — fires before router)
==================================================== */
function onProjectClick(e) {
  const a = e.target.closest("a[data-project-link]");
  if (!a) return;

  /* Let browser shortcuts / right-click pass through */
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target === "_blank") return;

  let url;
  try { url = new URL(a.href); } catch { return; }
  if (url.origin !== location.origin) return;

  /* Own this event — prevents router's onLinkClick from also calling navigate */
  e.preventDefault();
  e.stopPropagation();

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (reduceMotion || !isWebGLAvailable()) {
    navigate(url.pathname);
    return;
  }

  /* UV origin: x is same direction, y is flipped (WebGL y=0 is bottom) */
  const origin = {
    x: e.clientX / window.innerWidth,
    y: 1 - e.clientY / window.innerHeight,
  };

  const color = getFrameColor(a);

  runTransition(origin, color, url.pathname);
}

/* ====================================================
   Public init — call once from app.js
==================================================== */
export function initProjectTransitions() {
  document.addEventListener("click", onProjectClick, true /* capture */);
}
