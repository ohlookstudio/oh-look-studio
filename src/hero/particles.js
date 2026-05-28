import * as THREE from "three";

export class ParticleSystem {
  constructor({ canvas, textA, textB, pointSize = 1.2, fov = 45 }) {
    this.canvas = canvas;
    this.textA = textA;
    this.textB = textB;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      fov,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );
    this.camera.position.set(0, 0, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x0b0b0b, 1);

    this.resize = this.resize.bind(this);
    this.resize();
    window.addEventListener("resize", this.resize);

    const count = Math.max(textA.length, textB.length);
    this.count = count;

    const positions = new Float32Array(count * 3);
    const targetsA = new Float32Array(count * 3);
    const targetsB = new Float32Array(count * 3);

    const pad = (arr, n) => {
      const out = arr.slice();
      while (out.length < n) out.push(out[out.length % arr.length]);
      return out;
    };

    const A = pad(textA, count);
    const B = pad(textB, count);

    for (let i = 0; i < count; i++) {
      // esfera random
      const r = 2.0 * Math.random() + 0.2;
      const theta = Math.random() * Math.PI * 2.0;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      targetsA[i * 3 + 0] = A[i][0] * 3.2;
      targetsA[i * 3 + 1] = A[i][1] * 1.8;
      targetsA[i * 3 + 2] = 0.0;

      targetsB[i * 3 + 0] = B[i][0] * 3.0;
      targetsB[i * 3 + 1] = B[i][1] * 1.7;
      targetsB[i * 3 + 2] = 0.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("targetA", new THREE.BufferAttribute(targetsA, 3));
    geometry.setAttribute("targetB", new THREE.BufferAttribute(targetsB, 3));

    const vertex = /* glsl */ `
      attribute vec3 targetA;
      attribute vec3 targetB;
      uniform float uPhase;
      uniform float uSize;
      uniform float uTime;
      varying float vMix;

      float hash(float n){ return fract(sin(n)*43758.5453123); }
      float noise(vec3 x){
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f*f*(3.0-2.0*f);
        float n = p.x + p.y*57.0 + 113.0*p.z;
        float res = mix(mix(mix(hash(n+0.0), hash(n+1.0), f.x),
                            mix(hash(n+57.0), hash(n+58.0), f.x), f.y),
                        mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                            mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
        return res;
      }

      void main() {
        float t = clamp(uPhase, 0.0, 1.0);
        float m = clamp(uPhase - 1.0, 0.0, 1.0);

        vec3 pos = mix(position, targetA, t);
        pos = mix(pos, targetB, m);

        float n = (noise(vec3(pos*0.15 + uTime*0.05)) - 0.5) * 0.04;
        pos += normalize(vec3(0.0001, 0.0002, 0.0001)) * n;

        vMix = m;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = uSize * (120.0 / max(1.0, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `;

    const fragment = /* glsl */ `
      precision mediump float;
      varying float vMix;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = dot(uv, uv);
        if (d > 0.25) discard;

        vec3 coral = vec3(0.80, 0.41, 0.41);
        vec3 blue  = vec3(0.28, 0.50, 0.66);
        vec3 col = mix(coral, blue, vMix);

        float alpha = 0.72 * smoothstep(0.25, 0.0, d);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uPhase: { value: 0.0 },
        uSize: { value: pointSize },
        uTime: { value: 0.0 },
      },
    });

    this.points = new THREE.Points(geometry, this.material);
    this.scene.add(this.points);

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setPhase(v) {
    this.material.uniforms.uPhase.value = v;
  }

  resize() {
    const w = Math.max(this.canvas.clientWidth, 1);
    const h = Math.max(this.canvas.clientHeight, 1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  dispose() {
    window.removeEventListener("resize", this.resize);
    this.points.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
