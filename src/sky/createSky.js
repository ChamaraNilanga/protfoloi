import * as THREE from "three";

// A raymarched cloudscape the camera flies through as the page scrolls.
// Each chapter has its own sky; between chapters the camera passes through a
// ring of light, and the sky inside the ring is already the next chapter's.
//
// Elements with `data-ch="n"` pin chapter n to the moment they are centred
// in the viewport.

const CH = 22; // world units between chapters

const hex = (h) => new THREE.Color(h);

export const CHAPTERS = [
  // dreamcore dusk
  { top: "#2b1f63", hor: "#f2b6d0", sun: "#ffd9b0", lit: "#fff1f4", shade: "#6d5aa6", glow: "#ffb3d9", stars: 0.15, sunDir: [0.35, 0.18, -1] },
  // golden hour
  { top: "#2f4f93", hor: "#ffcf96", sun: "#fff0c8", lit: "#fff6e6", shade: "#8f7896", glow: "#ffd48a", stars: 0.0, sunDir: [-0.5, 0.12, -1] },
  // blue hour
  { top: "#070f38", hor: "#4a78d6", sun: "#cfe0ff", lit: "#c7d6ff", shade: "#1c2a66", glow: "#8fb4ff", stars: 0.7, sunDir: [0.2, 0.25, -1] },
  // nebula night
  { top: "#05020f", hor: "#3a1650", sun: "#ff8fd8", lit: "#f3b9ff", shade: "#1a0b35", glow: "#ff6fcf", stars: 1.0, sunDir: [-0.3, 0.35, -1] },
  // aurora
  { top: "#021018", hor: "#0f5a5a", sun: "#b9fff0", lit: "#c9fff2", shade: "#0b2f3a", glow: "#5cffd2", stars: 0.9, sunDir: [0.4, 0.3, -1] },
  // sunrise
  { top: "#1b2a64", hor: "#ffb58f", sun: "#fff2d6", lit: "#fff4ec", shade: "#7a6394", glow: "#ffc59e", stars: 0.1, sunDir: [0.0, 0.1, -1] },
].map((c) => ({
  ...c,
  top: hex(c.top),
  hor: hex(c.hor),
  sun: hex(c.sun),
  lit: hex(c.lit),
  shade: hex(c.shade),
  glow: hex(c.glow),
  sunDir: new THREE.Vector3(...c.sunDir).normalize(),
}));

const palette = (p) => ({
  [`u${p}Top`]: { value: new THREE.Color() },
  [`u${p}Hor`]: { value: new THREE.Color() },
  [`u${p}Sun`]: { value: new THREE.Color() },
  [`u${p}Lit`]: { value: new THREE.Color() },
  [`u${p}Shade`]: { value: new THREE.Color() },
  [`u${p}Glow`]: { value: new THREE.Color() },
  [`u${p}Stars`]: { value: 0 },
  [`u${p}SunDir`]: { value: new THREE.Vector3() },
});

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime, uProg, uSteps, uPortalZ, uAspect;
  uniform vec2 uMouse;
  uniform vec3 uATop, uAHor, uASun, uALit, uAShade, uAGlow, uASunDir;
  uniform vec3 uBTop, uBHor, uBSun, uBLit, uBShade, uBGlow, uBSunDir;
  uniform float uAStars, uBStars;
  varying vec2 vUv;

  struct Pal { vec3 top, hor, sun, lit, shade, glow, sunDir; float stars; };
  Pal palA() { return Pal(uATop, uAHor, uASun, uALit, uAShade, uAGlow, uASunDir, uAStars); }
  Pal palB() { return Pal(uBTop, uBHor, uBSun, uBLit, uBShade, uBGlow, uBSunDir, uBStars); }
  Pal pick(bool next) { if (next) return palB(); return palA(); }

  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float f = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { f += a * noise(p); p = p * 2.03 + vec3(0.13, 0.07, 0.21); a *= 0.5; }
    return f;
  }

  vec2 path(float z) { return vec2(sin(z * 0.045) * 3.0, cos(z * 0.031) * 1.2); }

  float density(vec3 p) {
    vec2 c = path(p.z);
    vec3 q = p - vec3(c, 0.0);
    // a sea of cloud below, towers at the sides, open sky above
    float corridor = smoothstep(2.4, 6.5, length(q.xy * vec2(0.8, 1.5)));
    float height = smoothstep(7.0, -3.0, q.y);
    vec3 w = vec3(uTime * 0.05, 0.0, uTime * 0.12);
    float base = fbm(p * 0.16 + w);
    float detail = fbm(p * 0.55 + w * 1.7);
    float d = base * 1.3 + detail * 0.5 - 0.8;
    d += (corridor - 0.5) * 0.7 + (height - 0.5) * 0.75;
    return clamp(d * 2.6, 0.0, 1.0);
  }

  vec3 sky(vec3 rd, Pal P) {
    float h = rd.y;
    vec3 col = mix(P.hor, P.top, pow(clamp(h + 0.05, 0.0, 1.0), 0.55));
    col = mix(col, P.shade * 0.6, smoothstep(0.0, -0.4, h));
    float s = max(dot(rd, P.sunDir), 0.0);
    col += P.sun * (pow(s, 6.0) * 0.35 + pow(s, 64.0) * 0.6 + pow(s, 900.0) * 3.0);
    // stars + nebula for the night chapters
    vec3 sp = rd * 260.0; vec3 id = floor(sp);
    float st = step(0.9975, hash(id)) * smoothstep(0.45, 0.0, length(fract(sp) - 0.5));
    col += vec3(1.0) * st * P.stars * smoothstep(-0.05, 0.3, h) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(id) * 40.0));
    float neb = smoothstep(0.5, 0.95, fbm(rd * 2.4 + vec3(0.0, 0.0, uTime * 0.01)));
    col += P.glow * neb * P.stars * 0.35 * smoothstep(-0.1, 0.4, h);
    return col;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0);
    float z0 = -uProg * ${CH.toFixed(1)} + 3.0 + sin(uTime * 0.18) * 0.35;
    vec3 ro = vec3(path(z0), z0);
    ro.xy += uMouse * vec2(0.6, 0.35);
    ro.y += 0.4;
    vec3 ta = vec3(path(z0 - 7.0), z0 - 7.0) + vec3(uMouse * 0.4, 0.0) + vec3(0.0, 0.6, 0.0);
    vec3 fw = normalize(ta - ro);
    vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(rt, fw);
    vec3 rd = normalize(fw * 1.35 + uv.x * rt + uv.y * up);

    // the next portal: where (and if) this ray passes through its disc
    vec2 pc = path(uPortalZ) + vec2(0.0, 0.4);
    float tp = (uPortalZ - ro.z) / rd.z;
    vec3 hp = ro + rd * max(tp, 0.0);
    float pr = length(hp.xy - pc);
    bool through = tp > 0.0 && pr < 3.2;
    float ringGlow = tp > 0.0 ? exp(-abs(pr - 3.2) * 9.0) * 1.6 + exp(-abs(pr - 3.2) * 1.8) * 0.25 : 0.0;
    ringGlow /= 1.0 + max(tp, 0.0) * 0.04;

    Pal A = palA();
    Pal B = palB();

    vec4 acc = vec4(0.0);
    float t = 0.4 + hash(vec3(gl_FragCoord.xy, uTime)) * 0.3;
    bool crossed = false;
    for (int i = 0; i < 64; i++) {
      if (float(i) >= uSteps || acc.a > 0.97) break;
      float dt = 0.28 + t * 0.045;
      if (!crossed && tp > 0.0 && t + dt > tp) {
        crossed = true;
        acc.rgb += (1.0 - acc.a) * mix(A.glow, B.glow, 0.5) * ringGlow;
      }
      vec3 p = ro + rd * t;
      float d = density(p);
      if (d > 0.01) {
        bool nextWorld = crossed && through;
        Pal P = pick(nextWorld);
        float ld = density(p + P.sunDir * 0.9);
        float shadow = exp(-ld * 3.6);
        float phase = 0.6 + 0.8 * pow(max(dot(rd, P.sunDir), 0.0), 4.0);
        vec3 c = mix(P.shade, P.lit, shadow) * phase;
        c += P.sun * pow(1.0 - d, 6.0) * 0.25 * shadow;          // silver lining
        c = mix(c, P.hor, 1.0 - exp(-t * 0.02));                 // aerial haze
        float a = (1.0 - exp(-d * dt * 3.0));
        acc.rgb += (1.0 - acc.a) * a * c;
        acc.a += (1.0 - acc.a) * a;
      }
      t += dt;
    }
    if (!crossed) acc.rgb += (1.0 - acc.a) * mix(A.glow, B.glow, 0.5) * ringGlow;

    vec3 bg = sky(rd, pick(through));
    vec3 col = acc.rgb + (1.0 - acc.a) * bg;

    // grade: soft contrast, vignette, grain
    col = col / (1.0 + col * 0.25);
    col = pow(col, vec3(0.95));
    float v = length(vUv - 0.5);
    col *= 1.0 - smoothstep(0.35, 0.95, v) * 0.55;
    col += (hash(vec3(gl_FragCoord.xy, fract(uTime) * 91.0)) - 0.5) * 0.03;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createSky(canvas, { onChapter } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 800px)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  let scale = mobile ? 0.42 : 0.55;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uProg: { value: 0 },
    uSteps: { value: mobile ? 34 : 52 },
    uPortalZ: { value: 0 },
    uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2() },
    ...palette("A"),
    ...palette("B"),
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: fragment,
    depthTest: false,
    depthWrite: false,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const setPalette = (p, c) => {
    uniforms[`u${p}Top`].value.copy(c.top);
    uniforms[`u${p}Hor`].value.copy(c.hor);
    uniforms[`u${p}Sun`].value.copy(c.sun);
    uniforms[`u${p}Lit`].value.copy(c.lit);
    uniforms[`u${p}Shade`].value.copy(c.shade);
    uniforms[`u${p}Glow`].value.copy(c.glow);
    uniforms[`u${p}Stars`].value = c.stars;
    uniforms[`u${p}SunDir`].value.copy(c.sunDir);
  };

  let anchors = [];
  const measure = () => {
    const vh = window.innerHeight;
    anchors = [...document.querySelectorAll("[data-ch]")]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { ch: Number(el.dataset.ch), y: r.top + window.scrollY + r.height / 2 - vh / 2 };
      })
      .sort((a, b) => a.y - b.y);
  };
  const target = () => {
    const y = window.scrollY;
    if (!anchors.length) return 0;
    if (y <= anchors[0].y) return anchors[0].ch;
    for (let i = 1; i < anchors.length; i++) {
      const a = anchors[i - 1];
      const b = anchors[i];
      if (y <= b.y) return a.ch + ((y - a.y) / Math.max(1, b.y - a.y)) * (b.ch - a.ch);
    }
    return anchors[anchors.length - 1].ch;
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(scale);
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
    measure();
  };
  resize();
  window.addEventListener("resize", resize);
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);

  const mouse = new THREE.Vector2();
  const onMove = (e) => mouse.set(e.clientX / window.innerWidth - 0.5, 0.5 - e.clientY / window.innerHeight);
  window.addEventListener("pointermove", onMove);

  let prog = target();
  let chapter = -1;
  let raf = 0;
  let slow = 0;
  const clock = new THREE.Clock();
  const last = CHAPTERS.length - 1;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.1);
    // drop resolution if the GPU can't keep up
    slow = dt > 0.028 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 40 && scale > 0.3) {
      scale -= 0.08;
      uniforms.uSteps.value = Math.max(26, uniforms.uSteps.value - 8);
      slow = 0;
      resize();
    }
    if (!reduceMotion) uniforms.uTime.value += dt;
    const tgt = target();
    prog += (tgt - prog) * (1 - Math.exp(-Math.min(dt, 0.05) * (reduceMotion ? 20 : 3.2)));
    uniforms.uProg.value = prog;
    uniforms.uMouse.value.lerp(reduceMotion ? mouse.set(0, 0) : mouse, 0.04);

    // the camera is in chapter c until it passes the portal at c + 0.5
    const c = Math.min(Math.max(Math.floor(prog + 0.5), 0), last);
    setPalette("A", CHAPTERS[c]);
    setPalette("B", CHAPTERS[Math.min(c + 1, last)]);
    uniforms.uPortalZ.value = c < last ? -(c + 0.5) * CH + 3.0 : -1e4;
    if (c !== chapter) {
      chapter = c;
      onChapter?.(c);
    }
    renderer.render(scene, camera);
  };
  frame();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      mat.dispose();
      renderer.dispose();
    },
  };
}
