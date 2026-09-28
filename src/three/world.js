import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

// Scroll-driven camera journey: laptop -> through the screen -> data tunnel ->
// CPU core (skills) -> circuit-board city (experience) -> server hall
// (projects) -> network globe (contact).
//
// Any element with a `data-kf="n"` attribute pins keyframe n to the moment that
// element is centred in the viewport, so the 3D path stays in sync with content.

// [camera position, look-at target]
const KEYFRAMES = [
  [[2.6, 2.3, 6.2], [-2.4, 0.9, -0.5]], // 0 hero: laptop on the desk
  [[0, 1.5, 3.2], [0, 1.1, -0.9]], // 1 approach the screen
  [[0, 1.12, -0.6], [0, 1.12, -6]], // 2 at the glass
  [[0, 1.2, -30], [0, 1.2, -45]], // 3 inside: data tunnel
  [[0.5, 1.0, -50], [0, 1.2, -64]], // 4 about
  [[5, 2.5, -70], [0, 0.6, -80]], // 5 CPU core
  [[-4.5, 4, -86], [0, 0.6, -80]], // 6 orbit the core
  [[0, 7, -98], [0, 1, -118]], // 7 circuit city overview
  [[2, 2.2, -110], [-3.5, 3, -116]], // 8 tower 1
  [[-2, 2.2, -124], [3.5, 3, -130]], // 9 tower 2
  [[2, 2.2, -138], [-3.5, 3, -144]], // 10 tower 3
  [[0, 2, -162], [0, 1.6, -175]], // 11 server hall
  [[0, 1.9, -180], [0, 0.8, -193]], // 12
  [[0, 1.9, -197], [0, 0.8, -210]], // 13
  [[0, 1.9, -214], [0, 0.8, -227]], // 14
  [[0, 5, -243], [-5, 1.5, -275]], // 15 globe reveal
  [[1, 1.5, -258], [-6.5, 1, -275]], // 16 contact
];

// accent drives the page UI, the rest grades the sky and fog per room
export const ROOMS = [
  { id: "home", path: "~/", from: 0, accent: "#ffb547", accent2: "#ff5d8f" },
  { id: "about", path: "~/about", from: 3, accent: "#4be3ff", accent2: "#5b7bff" },
  { id: "stack", path: "~/stack", from: 5, accent: "#ffa53a", accent2: "#ff4f6d" },
  { id: "experience", path: "~/experience", from: 7, accent: "#3cf2c2", accent2: "#ffb547" },
  { id: "projects", path: "~/projects", from: 11, accent: "#8b9bff", accent2: "#4be3ff" },
  { id: "contact", path: "~/contact", from: 15, accent: "#6affc9", accent2: "#ffb547" },
];

const SKIES = [
  { top: "#07051a", mid: "#2b0f33", bot: "#050409", neb: "#ff6a4d" },
  { top: "#010712", mid: "#052236", bot: "#01040a", neb: "#2aa8ff" },
  { top: "#0d0405", mid: "#3a1606", bot: "#050203", neb: "#ff5a36" },
  { top: "#010c0b", mid: "#06302a", bot: "#010504", neb: "#1fd6a0" },
  { top: "#04041a", mid: "#161a52", bot: "#020209", neb: "#7a5cff" },
  { top: "#010a10", mid: "#07302d", bot: "#010406", neb: "#3dffb5" },
].map((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, new THREE.Color(v)])));

const KF_ROOM = KEYFRAMES.map((_, i) => ROOMS.reduce((r, rm, ri) => (i >= rm.from ? ri : r), 0));

const FONT_MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const FONT_DISPLAY = '"Bricolage Grotesque", "IBM Plex Sans", system-ui, sans-serif';

// uniforms shared by every custom shader
const U = {
  uTime: { value: 0 },
  uFogNear: { value: 10 },
  uFogFar: { value: 36 },
  uPixelRatio: { value: 1 },
};

const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, ctx, canvas: c };
}

function label(text, { size = 48, color = "#e9e6df", font = FONT_MONO, weight = 500, pill = null, height = 0.5, glow = 1 } = {}) {
  const pad = size * 0.6;
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `${weight} ${size}px ${font}`;
  const w = Math.ceil(probe.measureText(text).width + pad * 2);
  const h = Math.ceil(size * 1.8);
  const { tex } = canvasTexture(w, h, (ctx) => {
    if (pill) {
      ctx.fillStyle = "rgba(8,10,18,0.82)";
      ctx.strokeStyle = pill;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(2, 2, w - 4, h - 4, h / 2 - 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, pad, h / 2 + 2);
  });
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  mat.color.setScalar(glow);
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set((height * w) / h, height, 1);
  return sprite;
}

// ---------- shaders ----------

const FADE = /* glsl */ `
  uniform float uFogNear; uniform float uFogFar;
  float fogFade(float depth) { return 1.0 - smoothstep(uFogNear, uFogFar, depth); }
`;

// glowing lines with pulses running along them (aT = distance along the path)
function pulseLineMaterial(color, { speed = 0.35, base = 0.18, gain = 3.2, width = 0.06 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uColor: { value: new THREE.Color(color) }, uSpeed: { value: speed }, uBase: { value: base }, uGain: { value: gain }, uWidth: { value: width } },
    vertexShader: /* glsl */ `
      attribute float aT; attribute float aSeed;
      varying float vT; varying float vSeed; varying float vDepth;
      void main() {
        vT = aT; vSeed = aSeed;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uSpeed, uBase, uGain, uWidth;
      varying float vT; varying float vSeed; varying float vDepth;
      ${FADE}
      void main() {
        float p = fract(vT - uTime * uSpeed + vSeed);
        float pulse = smoothstep(0.0, uWidth, p) * (1.0 - smoothstep(uWidth, uWidth * 3.0, p));
        gl_FragColor = vec4(uColor * (uBase + pulse * uGain) * fogFade(vDepth), 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

// turn polylines into one LineSegments with a distance attribute for pulses
function pulseLines(polylines, material, scale = 0.08) {
  const pos = [];
  const t = [];
  const seed = [];
  polylines.forEach((pts) => {
    let acc = 0;
    const s = Math.random();
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = a.distanceTo(b);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      t.push(acc * scale, (acc + len) * scale);
      seed.push(s, s);
      acc += len;
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aT", new THREE.Float32BufferAttribute(t, 1));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  return new THREE.LineSegments(geo, material);
}

// soft round additive points
function glowPoints(positions, colors, sizes, { intensity = 1.4, twinkle = 1 } = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...U, uIntensity: { value: intensity }, uTwinkle: { value: twinkle } },
    vertexShader: /* glsl */ `
      attribute float aSize; uniform float uPixelRatio, uTime, uTwinkle;
      varying vec3 vColor; varying float vDepth; varying float vTw;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        vTw = 1.0 - uTwinkle * 0.5 * (0.5 + 0.5 * sin(uTime * 2.0 + position.x * 13.0 + position.z * 7.0));
        gl_PointSize = aSize * uPixelRatio * (80.0 / max(0.1, -mv.z));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      varying vec3 vColor; varying float vDepth; varying float vTw;
      ${FADE}
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= a;
        gl_FragColor = vec4(vColor * a * uIntensity * vTw * fogFade(vDepth), 1.0);
      }`,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

function fresnelMaterial(color, { power = 2.5, strength = 1.6, side = THREE.FrontSide, inner = 0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uColor: { value: new THREE.Color(color) }, uPower: { value: power }, uStrength: { value: strength }, uInner: { value: inner } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vP = position;
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower, uStrength, uInner, uTime;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        float bands = 0.75 + 0.25 * sin(vP.y * 9.0 - uTime * 3.0);
        gl_FragColor = vec4(uColor * (f * uStrength * bands + uInner), 1.0);
      }`,
    side,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

function buildSky(scene) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: U.uTime,
      uTop: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uBot: { value: new THREE.Color() },
      uNeb: { value: new THREE.Color() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uMid, uBot, uNeb; uniform float uTime;
      varying vec3 vDir;
      float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uMid, uTop, smoothstep(0.0, 0.75, h));
        col = mix(col, uBot, smoothstep(0.0, -0.45, h));
        float n = fbm(d * 2.2 + vec3(uTime * 0.008, 0.0, uTime * 0.004));
        float neb = smoothstep(0.48, 0.95, n) * (1.0 - abs(h) * 0.6);
        col += uNeb * neb * 0.55;
        col += uNeb * pow(max(0.0, 1.0 - abs(h) * 3.0), 3.0) * 0.12;
        vec3 sp = d * 220.0;
        vec3 id = floor(sp);
        float s = hash(id);
        float star = step(0.9965, s) * smoothstep(0.4, 0.0, length(fract(sp) - 0.5));
        col += vec3(0.85, 0.9, 1.0) * star * (0.6 + 0.4 * sin(uTime * 3.0 + s * 50.0)) * smoothstep(-0.2, 0.3, h);
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 48, 32), mat);
  sky.renderOrder = -1;
  scene.add(sky);
  return sky;
}

// mirror floor under a translucent tinted grid
function mirrorFloor(scene, { w, h, pos, tint = "#ffb547", dim = 0.8 }) {
  const mirror = new Reflector(new THREE.PlaneGeometry(w, h), {
    textureWidth: Math.floor(window.innerWidth * 0.5),
    textureHeight: Math.floor(window.innerHeight * 0.5),
    color: 0x9aa0aa,
    clipBias: 0.003,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.set(pos[0], pos[1], pos[2]);
  scene.add(mirror);
  const { tex } = canvasTexture(256, 256, (ctx, cw, ch) => {
    ctx.fillStyle = `rgba(6,6,14,${dim})`;
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = tint;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cw, ch);
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.moveTo(cw / 2, 0);
    ctx.lineTo(cw / 2, ch);
    ctx.moveTo(0, ch / 2);
    ctx.lineTo(cw, ch / 2);
    ctx.stroke();
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w / 2, h / 2);
  const overlay = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  overlay.rotation.x = -Math.PI / 2;
  overlay.position.set(pos[0], pos[1] + 0.005, pos[2]);
  scene.add(overlay);
  return mirror;
}

// chrome tube sculpture along a path
function tube(points, radius, mat, sharp = true) {
  let curve;
  if (sharp) {
    curve = new THREE.CurvePath();
    for (let i = 0; i < points.length - 1; i++) curve.add(new THREE.LineCurve3(points[i], points[i + 1]));
  } else {
    curve = new THREE.CatmullRomCurve3(points);
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, sharp ? 64 : 96, radius, 20, false), mat));
  const cap = new THREE.SphereGeometry(radius, 20, 12);
  [points[0], points[points.length - 1]].forEach((p) => {
    const c = new THREE.Mesh(cap, mat);
    c.position.copy(p);
    g.add(c);
  });
  if (sharp) {
    points.slice(1, -1).forEach((p) => {
      const c = new THREE.Mesh(cap, mat);
      c.position.copy(p);
      g.add(c);
    });
  }
  return g;
}

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

// ---------- rooms ----------

function buildHero(scene, name) {
  const g = new THREE.Group();
  const alu = new THREE.MeshPhysicalMaterial({ color: 0x5b6170, metalness: 1, roughness: 0.22, clearcoat: 0.4, clearcoatRoughness: 0.2 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.3, roughness: 0.45 });

  const base = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.12, 2.2, 4, 0.05), alu);
  base.position.y = 0.06;
  g.add(base);

  const keys = new THREE.InstancedMesh(new RoundedBoxGeometry(0.17, 0.03, 0.17, 2, 0.02), dark, 13 * 4);
  const m = new THREE.Matrix4();
  let n = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      m.makeTranslation(-1.26 + c * 0.21, 0.13, -0.75 + r * 0.21);
      keys.setMatrixAt(n++, m);
    }
  }
  g.add(keys);
  const pad = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.01, 0.55, 2, 0.004), new THREE.MeshStandardMaterial({ color: 0x3a3f4a, metalness: 0.8, roughness: 0.3 }));
  pad.position.set(0, 0.125, 0.55);
  g.add(pad);
  // underglow along the front lip
  const lip = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: hdr("#ffb547", 4) }));
  lip.position.set(0, 0.02, 1.1);
  g.add(lip);

  const hinge = new THREE.Group();
  hinge.position.set(0, 0.12, -1.05);
  hinge.rotation.x = -0.12;
  const lid = new THREE.Mesh(new RoundedBoxGeometry(3.2, 2.0, 0.08, 4, 0.04), alu);
  lid.position.y = 1.0;
  hinge.add(lid);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(3.12, 1.94), new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.15, metalness: 0.5 }));
  bezel.position.set(0, 1.0, 0.042);
  hinge.add(bezel);

  const { tex } = canvasTexture(1280, 800, (ctx, w, h) => {
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#0d0b1f");
    grd.addColorStop(1, "#1a0d22");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.8, h * 0.2, 10, w * 0.8, h * 0.2, w * 0.6);
    glow.addColorStop(0, "rgba(255,93,143,0.35)");
    glow.addColorStop(1, "rgba(255,93,143,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(0, 0, w, 44);
    ["#ff6b5a", "#ffb547", "#5fd18b"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(28 + i * 28, 22, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = `500 24px ${FONT_MONO}`;
    ctx.fillStyle = "#8a93a6";
    ctx.fillText("chamara@portfolio: ~", w / 2 - 130, 30);
    const lines = [
      ["#8a93a6", "$ whoami"],
      ["#ffffff", name.toLowerCase().replace(/\s+/g, "_")],
      ["#8a93a6", "$ cat role.txt"],
      ["#ffb547", "Software Engineer · Full Stack"],
      ["#8a93a6", "$ ls stack/"],
      ["#4be3ff", "spring-boot  react  node  kubernetes"],
      ["#4be3ff", "postgresql  flutter  keycloak  minio"],
      ["#8a93a6", "$ cd ./inside"],
    ];
    ctx.font = `500 38px ${FONT_MONO}`;
    lines.forEach(([c, t], i) => {
      ctx.fillStyle = c;
      ctx.fillText(t, 60, 130 + i * 72);
    });
    ctx.fillStyle = "#ffb547";
    ctx.fillRect(330, 130 + 7 * 72 - 30, 20, 38);
  });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.875), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  display.material.color.setScalar(0.95);
  display.position.set(0, 1.0, 0.046);
  hinge.add(display);
  g.add(hinge);

  // ceramic mug
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.5, 40), new THREE.MeshPhysicalMaterial({ color: 0xf2efe9, roughness: 0.35, clearcoat: 1 }));
  mug.position.set(2.3, 0.25, 0.3);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 12, 24, Math.PI), mug.material);
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.22, 0, 0);
  mug.add(handle);
  g.add(mug);

  const screenLight = new THREE.PointLight(0xff7aa8, 4, 7);
  screenLight.position.set(0, 1.2, 0.6);
  g.add(screenLight);
  const rim = new THREE.PointLight(0xffb547, 12, 12);
  rim.position.set(-2, 2.5, -3);
  g.add(rim);
  scene.add(g);

  // the portal the camera is about to go through
  const portal = new THREE.Group();
  portal.position.set(0, 1.35, -3.6);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.03, 16, 240), new THREE.MeshBasicMaterial({ color: hdr("#ffb547", 3), toneMapped: false }));
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.012, 8, 240), new THREE.MeshBasicMaterial({ color: hdr("#ff5d8f", 3), toneMapped: false }));
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.16, 0.02), new THREE.MeshBasicMaterial({ color: hdr("#ffb547", 2), toneMapped: false }), 72);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    m.compose(V(Math.cos(a) * 3.62, Math.sin(a) * 3.62, 0), new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), a - Math.PI / 2), V(1, i % 6 ? 1 : 2.4, 1));
    ticks.setMatrixAt(i, m);
  }
  portal.add(ring, ring2, ticks);
  scene.add(portal);

  // iridescent chrome glyphs floating around the desk
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.12,
    iridescence: 1,
    iridescenceIOR: 1.9,
    iridescenceThicknessRange: [180, 820],
    clearcoat: 1,
  });
  const tag = new THREE.Group();
  tag.add(tube([V(-0.55, 0.45), V(-1.05, 0), V(-0.55, -0.45)], 0.07, chrome));
  tag.add(tube([V(-0.2, -0.55), V(0.2, 0.55)], 0.07, chrome));
  tag.add(tube([V(0.55, 0.45), V(1.05, 0), V(0.55, -0.45)], 0.07, chrome));
  tag.position.set(2.9, 2.7, -2.2);
  tag.rotation.set(0.1, -0.5, 0.1);
  const brace = (s) => tube([V(0.2 * s, 0.7), V(0, 0.6), V(0, 0.12), V(-0.18 * s, 0), V(0, -0.12), V(0, -0.6), V(0.2 * s, -0.7)], 0.065, chrome, false);
  const braces = new THREE.Group();
  const l = brace(1);
  l.position.x = -0.45;
  const r = brace(-1);
  r.position.x = 0.45;
  braces.add(l, r);
  braces.position.set(-1.6, 2.9, -2.8);
  braces.rotation.set(0, 0.5, -0.15);
  const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), chrome);
  gem.position.set(3.6, 0.9, 0.9);
  scene.add(tag, braces, gem);

  const floor = mirrorFloor(scene, { w: 60, h: 40, pos: [0, -0.001, -4], tint: "#ffb547", dim: 0.84 });
  return { floor, floaters: [tag, braces, gem], portal };
}

function buildTunnel(scene) {
  const g = new THREE.Group();
  const RINGS = 24;
  const PER = 18;
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 1.05, 0.05), new THREE.MeshBasicMaterial({ toneMapped: false }), RINGS * PER);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const base = [];
  for (let i = 0; i < RINGS; i++) {
    for (let k = 0; k < PER; k++) {
      const a = (k / PER) * Math.PI * 2 + i * 0.05;
      q.setFromAxisAngle(V(0, 0, 1), a);
      m.compose(V(Math.cos(a) * 4.2, 1.2 + Math.sin(a) * 4.2, -32 - i * 1.35), q, V(1, 1, 1));
      bars.setMatrixAt(i * PER + k, m);
      base.push({ z: i, c: new THREE.Color(k % 6 === 0 ? "#ffb547" : i % 2 ? "#4be3ff" : "#5b7bff") });
    }
  }
  g.add(bars);

  // warp streaks
  const COUNT = 700;
  const pos = new Float32Array(COUNT * 6);
  const col = new Float32Array(COUNT * 6);
  const streaks = [];
  for (let i = 0; i < COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 2.8;
    const s = { x: Math.cos(a) * r, y: 1.2 + Math.sin(a) * r, z: -30 - Math.random() * 34, len: 0.4 + Math.random() * 1.6, v: 4 + Math.random() * 10 };
    streaks.push(s);
    const c = new THREE.Color(Math.random() > 0.8 ? "#ffb547" : "#4be3ff").multiplyScalar(1.4);
    col.set([c.r, c.g, c.b, 0, 0, 0], i * 6);
  }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  sgeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const warp = new THREE.LineSegments(sgeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  g.add(warp);

  const snippets = [
    "@RestController",
    "const engineer = new Chamara();",
    "kubectl apply -f deploy.yaml",
    "SELECT * FROM projects;",
    "git push origin main",
    "useEffect(() => ship(), [])",
    "docker compose up -d",
    "app.listen(8080)",
    "public class Portfolio {}",
    "flutter run --release",
    "npm run build",
    "@Transactional",
  ];
  snippets.forEach((s, i) => {
    const sp = label(s, { size: 40, color: i % 3 === 0 ? "#ffb547" : "#8fefff", height: 0.34, glow: 1.6 });
    const a = i * 2.4;
    sp.position.set(Math.cos(a) * 2.7, 1.2 + Math.sin(a) * 2.5, -34 - i * 2.8);
    g.add(sp);
  });
  scene.add(g);

  const color = new THREE.Color();
  return (t, dt) => {
    for (let i = 0; i < base.length; i++) {
      const wave = Math.pow(0.5 + 0.5 * Math.sin(base[i].z * 0.55 - t * 3.2), 6);
      bars.setColorAt(i, color.copy(base[i].c).multiplyScalar(0.35 + wave * 2.6));
    }
    bars.instanceColor.needsUpdate = true;
    for (let i = 0; i < COUNT; i++) {
      const s = streaks[i];
      s.z += s.v * dt;
      if (s.z > -30) s.z -= 34;
      pos.set([s.x, s.y, s.z, s.x, s.y, s.z - s.len], i * 6);
    }
    sgeo.attributes.position.needsUpdate = true;
  };
}

function buildCore(scene, skills) {
  const g = new THREE.Group();
  g.position.set(0, 0, -80);

  // holographic base plate
  const { tex: plateTex } = canvasTexture(1024, 1024, (ctx, w) => {
    const c = w / 2;
    for (let r = 60; r < c; r += 38) {
      ctx.strokeStyle = r % 3 ? "rgba(255,165,58,0.35)" : "rgba(255,79,109,0.5)";
      ctx.lineWidth = r % 5 ? 2 : 5;
      ctx.setLineDash(r % 2 ? [] : [14, 18]);
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      ctx.strokeStyle = "rgba(255,165,58,0.25)";
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * 180, c + Math.sin(a) * 180);
      ctx.lineTo(c + Math.cos(a) * (i % 4 ? 460 : 500), c + Math.sin(a) * (i % 4 ? 460 : 500));
      ctx.stroke();
    }
  });
  const plate = new THREE.Mesh(
    new THREE.CircleGeometry(9, 96),
    new THREE.MeshBasicMaterial({ map: plateTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, color: hdr("#ffffff", 1.6) })
  );
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = -0.6;
  g.add(plate);

  const chip = new THREE.Mesh(new RoundedBoxGeometry(3, 0.4, 3, 4, 0.08), new THREE.MeshPhysicalMaterial({ color: 0x15161c, metalness: 0.9, roughness: 0.25, clearcoat: 1 }));
  g.add(chip);
  const { tex } = canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#120a04";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffa53a";
    ctx.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
      const y = 80 + i * 34;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(160 + (i % 5) * 30, y);
      ctx.lineTo(200 + (i % 5) * 30, y + 30);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, w - 80, h - 80);
    ctx.fillStyle = "#ffb547";
    ctx.font = `800 190px ${FONT_DISPLAY}`;
    ctx.fillText("CK-24", 250, 530);
    ctx.font = `500 58px ${FONT_MONO}`;
    ctx.fillText("FULL STACK CORE", 256, 640);
    ctx.fillStyle = "#a36a2a";
    ctx.fillText("LK · SINCE 2022", 256, 730);
  });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: hdr("#ffffff", 1.3) }));
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.205;
  g.add(top);

  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.06, 0.4), new THREE.MeshStandardMaterial({ color: 0xe0b060, metalness: 1, roughness: 0.2 }), 48);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let n = 0;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 12; i++) {
      const t = -1.3 + i * (2.6 / 11);
      const p = [V(t, 0, 1.7), V(t, 0, -1.7), V(1.7, 0, t), V(-1.7, 0, t)][side];
      q.setFromAxisAngle(V(0, 1, 0), side < 2 ? 0 : Math.PI / 2);
      m.compose(p, q, V(1, 1, 1));
      pins.setMatrixAt(n++, m);
    }
  }
  g.add(pins);

  // energy core hovering over the die
  const orb = new THREE.Group();
  orb.position.y = 1.9;
  orb.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 32), new THREE.MeshBasicMaterial({ color: hdr("#ffd28a", 5), toneMapped: false })));
  orb.add(new THREE.Mesh(new THREE.SphereGeometry(0.85, 64, 48), fresnelMaterial("#ff7a2e", { power: 2, strength: 2.4 })));
  orb.add(new THREE.Mesh(new THREE.SphereGeometry(1.25, 64, 48), fresnelMaterial("#ff4f6d", { power: 3.5, strength: 1.2, side: THREE.BackSide })));
  g.add(orb);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.4, 1.6, 32, 1, true),
    fresnelMaterial("#ffb547", { power: 1.2, strength: 0.6, inner: 0.25 })
  );
  beam.position.y = 1.0;
  g.add(beam);
  const light = new THREE.PointLight(0xff9a3a, 40, 16);
  light.position.set(0, 2, 0);
  g.add(light);

  const orbits = [];
  [
    { r: 4, tilt: 0.25, c: "#ffa53a" },
    { r: 5.6, tilt: -0.35, c: "#ff4f6d" },
  ].forEach(({ r, tilt, c }, ri) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = tilt;
    const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 0.014, 8, 200), new THREE.MeshBasicMaterial({ color: hdr(c, 3), toneMapped: false }));
    torus.rotation.x = Math.PI / 2;
    pivot.add(torus);
    const spin = new THREE.Group();
    pivot.add(spin);
    const mine = skills.filter((_, i) => i % 2 === ri);
    mine.forEach((s, i) => {
      const sp = label(s, { size: 44, color: "#fff4e6", pill: c, height: 0.42, glow: 1.3 });
      const a = (i / mine.length) * Math.PI * 2;
      sp.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      spin.add(sp);
    });
    orbits.push({ spin, speed: ri ? -0.12 : 0.18 });
    g.add(pivot);
  });

  // debris belt
  const P = 1400;
  const pp = [];
  const pc = [];
  const ps = [];
  for (let i = 0; i < P; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 6.5 + Math.random() * 3;
    pp.push(Math.cos(a) * r, (Math.random() - 0.5) * 0.6, Math.sin(a) * r);
    const c = new THREE.Color(Math.random() > 0.5 ? "#ffa53a" : "#ff4f6d");
    pc.push(c.r, c.g, c.b);
    ps.push(0.4 + Math.random() * 1.2);
  }
  const belt = glowPoints(pp, pc, ps, { intensity: 1.2 });
  belt.rotation.x = 0.12;
  g.add(belt);
  scene.add(g);

  return (t) => {
    orbits.forEach((o) => (o.spin.rotation.y = t * o.speed));
    orb.position.y = 1.9 + Math.sin(t * 1.4) * 0.12;
    orb.rotation.y = t * 0.4;
    belt.rotation.y = t * 0.05;
    plate.rotation.z = t * 0.03;
  };
}

function buildCity(scene, experiences) {
  const g = new THREE.Group();
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const { tex: boardTex } = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#04110f";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(60,242,194,0.10)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      let x = rand() * w;
      let y = rand() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 3; s++) {
        if (s % 2) x += (rand() - 0.5) * 200;
        else y += (rand() - 0.5) * 200;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(60,242,194,0.18)";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  boardTex.wrapS = boardTex.wrapT = THREE.RepeatWrapping;
  boardTex.repeat.set(5, 9);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(40, 72), new THREE.MeshStandardMaterial({ map: boardTex, color: 0xffffff, metalness: 0.7, roughness: 0.35 }));
  board.rotation.x = -Math.PI / 2;
  board.position.set(0, 0, -125);
  g.add(board);

  // traces with pulses running through them
  const make = (count, xr) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      let x = (rand() - 0.5) * xr;
      let z = -90 - rand() * 66;
      const pts = [V(x, 0.03, z)];
      for (let s = 0; s < 5; s++) {
        if (s % 2 === 0) z -= 2 + rand() * 7;
        else {
          const dx = (rand() - 0.5) * 8;
          pts.push(V(x + dx * 0.5, 0.03, z - Math.abs(dx) * 0.5));
          x += dx;
          z -= Math.abs(dx) * 0.5;
        }
        pts.push(V(x, 0.03, z));
      }
      out.push(pts);
    }
    return out;
  };
  g.add(pulseLines(make(80, 36), pulseLineMaterial("#3cf2c2", { speed: 0.4, base: 0.22 })));
  g.add(pulseLines(make(45, 36), pulseLineMaterial("#ffb547", { speed: 0.3, base: 0.18 })));

  const blocks = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: 0x0f1a1c, metalness: 0.8, roughness: 0.3, clearcoat: 1 }), 110);
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.02, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), 110);
  const m = new THREE.Matrix4();
  const col = new THREE.Color();
  for (let i = 0; i < 110; i++) {
    let x = -18 + rand() * 36;
    if (Math.abs(x) < 6) x += Math.sign(x || 1) * 6;
    const h = 0.3 + rand() * 1.8;
    const sx = 0.6 + rand() * 1.4;
    const sz = 0.6 + rand() * 1.4;
    const z = -90 - rand() * 66;
    m.compose(V(x, h / 2, z), new THREE.Quaternion(), V(sx, h, sz));
    blocks.setMatrixAt(i, m);
    m.compose(V(x, h + 0.01, z), new THREE.Quaternion(), V(sx * 0.9, 1, sz * 0.9));
    caps.setMatrixAt(i, m);
    caps.setColorAt(i, col.set(rand() > 0.7 ? "#ffb547" : "#3cf2c2").multiplyScalar(rand() > 0.5 ? 2.2 : 0.4));
  }
  g.add(blocks, caps);

  const towerPos = [
    [-3.5, -116],
    [3.5, -130],
    [-3.5, -144],
  ];
  const beacons = [];
  experiences.slice(0, 3).forEach((exp, i) => {
    const [x, z] = towerPos[i];
    const hgt = 6.5 - i * 0.9;
    const accent = i === 0 ? "#ffb547" : "#3cf2c2";
    const { tex } = canvasTexture(256, 512, (ctx, w, h) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      for (let yy = 10; yy < h - 10; yy += 22) {
        for (let xx = 12; xx < w - 12; xx += 26) {
          const on = rand();
          ctx.fillStyle = on > 0.5 ? accent : on > 0.35 ? "#e9fbff" : "#000";
          ctx.globalAlpha = on > 0.35 ? 0.4 + rand() * 0.6 : 1;
          ctx.fillRect(xx, yy, 16, 11);
        }
      }
    });
    const tower = new THREE.Mesh(
      new RoundedBoxGeometry(2, hgt, 2, 3, 0.06),
      new THREE.MeshPhysicalMaterial({ color: 0x0c1418, metalness: 0.9, roughness: 0.15, clearcoat: 1, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 2.2 })
    );
    tower.position.set(x, hgt / 2, z);
    g.add(tower);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.04, hgt, 2.04)), new THREE.MeshBasicMaterial({ color: hdr(accent, 3), toneMapped: false }));
    edges.position.copy(tower.position);
    g.add(edges);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 1, roughness: 0.3 }));
    spire.position.set(x, hgt + 0.7, z);
    g.add(spire);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: hdr("#ff4f6d", 6), toneMapped: false }));
    beacon.position.set(x, hgt + 1.45, z);
    g.add(beacon);
    beacons.push(beacon);
    const pool = new THREE.PointLight(accent, 14, 7);
    pool.position.set(x + (x < 0 ? 1.6 : -1.6), 0.6, z);
    g.add(pool);
    const title = label(exp.company, { size: 46, weight: 700, font: FONT_DISPLAY, color: "#ffffff", pill: accent, height: 0.52, glow: 1.2 });
    title.position.set(x, hgt + 2.3, z);
    g.add(title);
    const time = label(exp.time, { size: 36, color: accent, height: 0.3, glow: 1.6 });
    time.position.set(x, hgt + 1.85, z);
    g.add(time);
  });

  // sparks drifting up from the board
  const S = 500;
  const sp = [];
  const sc = [];
  const ss = [];
  for (let i = 0; i < S; i++) {
    sp.push((rand() - 0.5) * 34, rand() * 8, -90 - rand() * 66);
    col.set(rand() > 0.7 ? "#ffb547" : "#3cf2c2");
    sc.push(col.r, col.g, col.b);
    ss.push(0.3 + rand() * 0.8);
  }
  const sparks = glowPoints(sp, sc, ss, { intensity: 1.6 });
  g.add(sparks);
  scene.add(g);

  const arr = sparks.geometry.attributes.position.array;
  return (t, dt) => {
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += dt * 0.4;
      if (arr[i] > 8) arr[i] = 0;
    }
    sparks.geometry.attributes.position.needsUpdate = true;
    beacons.forEach((b, i) => (b.visible = Math.sin(t * 3 + i * 2) > -0.2));
  };
}

function holoMaterial(tex, color) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, map: { value: tex }, uColor: { value: new THREE.Color(color) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vDepth;
      void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map; uniform vec3 uColor; uniform float uTime;
      varying vec2 vUv; varying float vDepth;
      ${FADE}
      void main() {
        vec3 tex = texture2D(map, vUv).rgb;
        float scan = 0.88 + 0.12 * sin(vUv.y * 520.0 - uTime * 6.0);
        float sweep = smoothstep(0.0, 0.04, fract(vUv.y * 0.6 - uTime * 0.18)) * (1.0 - smoothstep(0.04, 0.1, fract(vUv.y * 0.6 - uTime * 0.18)));
        vec2 e = abs(vUv * 2.0 - 1.0);
        float edge = max(smoothstep(0.985, 1.0, e.x), smoothstep(0.975, 1.0, e.y));
        float corner = step(0.9, e.x) * step(0.86, e.y);
        vec3 col = tex * scan * 0.8 + uColor * (edge * 2.2 + corner * 1.5 + sweep * 0.18);
        gl_FragColor = vec4(col * fogFade(vDepth), 1.0);
      }`,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function buildHall(scene, projects) {
  const g = new THREE.Group();
  const floor = mirrorFloor(scene, { w: 16, h: 84, pos: [0, -0.4, -200], tint: "#8b9bff", dim: 0.86 });

  const rackMat = new THREE.MeshPhysicalMaterial({ color: 0x0d0f18, metalness: 0.85, roughness: 0.3, clearcoat: 0.6 });
  const racks = new THREE.InstancedMesh(new RoundedBoxGeometry(1.4, 5, 2.2, 3, 0.05), rackMat, 26);
  const strips = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 4.8, 0.03), new THREE.MeshBasicMaterial({ color: hdr("#8b9bff", 3), toneMapped: false }), 26);
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.05, 0.12), new THREE.MeshBasicMaterial({ toneMapped: false }), 26 * 20);
  const m = new THREE.Matrix4();
  const color = new THREE.Color();
  let li = 0;
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1;
    const z = -164 - Math.floor(i / 2) * 5.5;
    m.makeTranslation(side * 5.6, 2.1, z);
    racks.setMatrixAt(i, m);
    m.makeTranslation(side * 4.88, 2.1, z + 1.08);
    strips.setMatrixAt(i, m);
    for (let k = 0; k < 20; k++) {
      m.makeTranslation(side * 4.89, 0.2 + (k % 10) * 0.42, z - 0.5 + Math.floor(k / 10) * 0.9);
      leds.setMatrixAt(li, m);
      leds.setColorAt(li++, color.set(Math.random() > 0.3 ? "#4be3ff" : "#8b9bff").multiplyScalar(3));
    }
  }
  g.add(racks, strips, leds);

  // ceiling light rails
  [-1.8, 1.8].forEach((x) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 76), new THREE.MeshBasicMaterial({ color: hdr("#c9d0ff", 0.7), toneMapped: false }));
    rail.position.set(x, 4.7, -200);
    g.add(rail);
  });
  const hallLight = new THREE.PointLight(0x8b9bff, 7, 30);
  hallLight.position.set(0, 4, -196);
  g.add(hallLight);

  projects.forEach((p, i) => {
    const accent = i % 2 ? "#4be3ff" : "#8b9bff";
    const { tex, ctx, canvas } = canvasTexture(1024, 640, () => {});
    const paint = (img) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070914";
      ctx.fillRect(0, 0, w, h);
      if (img) {
        const ih = 400;
        const s = Math.max(w / img.width, ih / img.height);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, ih);
        ctx.clip();
        ctx.drawImage(img, (w - img.width * s) / 2, (ih - img.height * s) / 2, img.width * s, img.height * s);
        const fade = ctx.createLinearGradient(0, ih * 0.5, 0, ih);
        fade.addColorStop(0, "rgba(7,9,20,0)");
        fade.addColorStop(1, "rgba(7,9,20,1)");
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, w, ih);
        ctx.restore();
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 80px ${FONT_DISPLAY}`;
      ctx.fillText(p.title, 44, 490);
      ctx.fillStyle = accent;
      ctx.font = `500 30px ${FONT_MONO}`;
      ctx.fillText(p.tech, 46, 570);
      tex.needsUpdate = true;
    };
    paint(null);
    if (p.img) {
      const img = new Image();
      img.onload = () => paint(img);
      img.src = p.img;
    }
    const side = i % 2 ? 1 : -1;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.125), holoMaterial(tex, hdr(accent, 1)));
    panel.position.set(side * 2.7, 1.7, -176 - i * 8.2);
    panel.rotation.y = -side * 0.55;
    g.add(panel);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.05), new THREE.MeshBasicMaterial({ color: hdr(accent, 4), toneMapped: false }));
    glow.position.set(0, -1.25, 0);
    panel.add(glow);
  });
  scene.add(g);

  return {
    floor,
    tick(t) {
      if (Math.floor(t * 8) !== Math.floor((t - 0.016) * 8)) {
        for (let k = 0; k < 6; k++) {
          const i = Math.floor(Math.random() * leds.count);
          leds.setColorAt(i, color.set(Math.random() > 0.5 ? "#4be3ff" : Math.random() > 0.4 ? "#8b9bff" : "#101320").multiplyScalar(3));
        }
        leds.instanceColor.needsUpdate = true;
      }
    },
  };
}

function buildGlobe(scene) {
  const g = new THREE.Group();
  g.position.set(0, 1, -275);
  const R = 6;
  g.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.99, 64, 48), new THREE.MeshBasicMaterial({ color: 0x020608 })));

  // fibonacci dot sphere
  const N = 5200;
  const pp = [];
  const pc = [];
  const ps = [];
  const c1 = new THREE.Color("#3dffb5");
  const c2 = new THREE.Color("#2aa8ff");
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.39996323;
    pp.push(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
    c.copy(c1).lerp(c2, (y + 1) / 2);
    pc.push(c.r, c.g, c.b);
    ps.push(0.35);
  }
  g.add(glowPoints(pp, pc, ps, { intensity: 1.1, twinkle: 0.4 }));
  // atmosphere
  g.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.18, 64, 48), fresnelMaterial("#3dffb5", { power: 4, strength: 1.6, side: THREE.BackSide })));

  const toVec = (lat, lon, r = R) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const th = ((lon + 180) * Math.PI) / 180;
    return V(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  };
  // Colombo, and the places a request might come from
  const home = toVec(6.93, 79.85);
  const cities = [
    [51.5, -0.12],
    [40.7, -74],
    [35.7, 139.7],
    [1.35, 103.8],
    [-33.9, 151.2],
    [25.2, 55.3],
    [52.5, 13.4],
    [37.8, -122.4],
    [19.1, 72.9],
  ].map(([a, b]) => toVec(a, b));
  const arcs = cities.map((to) => {
    const mid = to.clone().add(home).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.45);
    return new THREE.QuadraticBezierCurve3(home, mid, to).getPoints(64);
  });
  g.add(pulseLines(arcs, pulseLineMaterial("#ffb547", { speed: 0.5, base: 0.25, gain: 4, width: 0.05 }), 0.12));
  const dot = new THREE.SphereGeometry(0.07, 12, 12);
  cities.forEach((p) => {
    const d = new THREE.Mesh(dot, new THREE.MeshBasicMaterial({ color: hdr("#3dffb5", 4), toneMapped: false }));
    d.position.copy(p);
    g.add(d);
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: hdr("#ffb547", 6), toneMapped: false }));
  beacon.position.copy(home);
  g.add(beacon);
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.28, 48), new THREE.MeshBasicMaterial({ color: hdr("#ffb547", 4), transparent: true, side: THREE.DoubleSide, toneMapped: false }));
  pulse.position.copy(home.clone().multiplyScalar(1.01));
  pulse.lookAt(home.clone().multiplyScalar(2));
  g.add(pulse);

  // tilted data ring
  const ringPts = [];
  const ringCol = [];
  const ringSz = [];
  for (let i = 0; i < 1600; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = R * (1.55 + Math.random() * 0.35);
    ringPts.push(Math.cos(a) * r, (Math.random() - 0.5) * 0.15, Math.sin(a) * r);
    c.set(Math.random() > 0.8 ? "#ffb547" : "#3dffb5");
    ringCol.push(c.r, c.g, c.b);
    ringSz.push(0.3 + Math.random() * 0.6);
  }
  const ring = glowPoints(ringPts, ringCol, ringSz, { intensity: 1.3 });
  const ringPivot = new THREE.Group();
  ringPivot.rotation.set(0.35, 0, 0.25);
  ringPivot.add(ring);

  const baseY = -Math.atan2(home.x, home.z);
  g.rotation.set(0.15, baseY, 0);
  scene.add(g);
  const holder = new THREE.Group();
  holder.position.copy(g.position);
  holder.add(ringPivot);
  scene.add(holder);

  return (t) => {
    g.rotation.y = baseY + Math.sin(t * 0.15) * 0.35;
    ring.rotation.y = t * 0.06;
    const s = 1 + ((t * 0.8) % 1) * 2.5;
    pulse.scale.set(s, s, s);
    pulse.material.opacity = 1 - ((t * 0.8) % 1);
  };
}

function buildDust(scene) {
  const count = 3200;
  const p = [];
  const c = [];
  const s = [];
  const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    p.push((Math.random() - 0.5) * 44, (Math.random() - 0.3) * 22, 12 - Math.random() * 300);
    col.setHSL(0.55 + Math.random() * 0.15, 0.6, 0.75);
    c.push(col.r, col.g, col.b);
    s.push(0.2 + Math.random() * 0.5);
  }
  scene.add(glowPoints(p, c, s, { intensity: 0.8 }));
}

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVel: { value: 0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime, uVel;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5;
      float r = length(d);
      float ca = 0.002 + uVel * 0.014;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv - d * ca).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv + d * ca).b;
      col *= mix(1.0, smoothstep(0.85, 0.2, r), 0.55);
      col += (hash(vUv * 1000.0 + fract(uTime) * 100.0) - 0.5) * 0.045;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function createWorld(canvas, data, { onRoom, onFlash, onProgress, onReady } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio, window.innerWidth < 800 ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  U.uPixelRatio.value = dpr;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, U.uFogNear.value, U.uFogFar.value);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.45;
  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 320);

  scene.add(new THREE.HemisphereLight(0x9fb4d6, 0x05040a, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 0.7);
  key.position.set(4, 8, 6);
  scene.add(key);

  const sky = buildSky(scene);
  const hero = buildHero(scene, data.name);
  const tunnelTick = buildTunnel(scene);
  const coreTick = buildCore(scene, data.skills);
  const cityTick = buildCity(scene, data.experiences);
  const hall = buildHall(scene, data.projects);
  const globeTick = buildGlobe(scene);
  buildDust(scene);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.62, 0.38, 0.8);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);

  const posCurve = new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => V(...k[0])), false, "centripetal");
  const lookCurve = new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => V(...k[1])), false, "centripetal");
  const last = KEYFRAMES.length - 1;

  // scrollY -> keyframe index, from the data-kf anchors
  let anchors = [];
  const measure = () => {
    const vh = window.innerHeight;
    anchors = [...document.querySelectorAll("[data-kf]")]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { kf: Number(el.dataset.kf), y: r.top + window.scrollY + r.height / 2 - vh / 2 };
      })
      .sort((a, b) => a.y - b.y);
  };
  const targetKf = () => {
    const y = window.scrollY;
    if (!anchors.length) return 0;
    if (y <= anchors[0].y) return anchors[0].kf;
    for (let i = 1; i < anchors.length; i++) {
      const a = anchors[i - 1];
      const b = anchors[i];
      if (y <= b.y) return a.kf + ((y - a.y) / Math.max(1, b.y - a.y)) * (b.kf - a.kf);
    }
    return anchors[anchors.length - 1].kf;
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 72 : 55;
    camera.updateProjectionMatrix();
    measure();
  };
  resize();
  window.addEventListener("resize", resize);
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMove = (e) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("pointermove", onMove);

  let kf = targetKf();
  let room = -1;
  let raf = 0;
  let first = true;
  const clock = new THREE.Clock();
  const look = new THREE.Vector3();
  const sk = { top: new THREE.Color(), mid: new THREE.Color(), bot: new THREE.Color(), neb: new THREE.Color() };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = reduceMotion ? 0 : clock.elapsedTime;
    U.uTime.value = t;
    const target = targetKf();
    kf += (target - kf) * (1 - Math.exp(-dt * (reduceMotion ? 20 : 4.5)));
    if (Math.abs(target - kf) < 1e-4) kf = target;

    const u = Math.min(Math.max(kf / last, 0), 1);
    camera.position.copy(posCurve.getPoint(u));
    look.copy(lookCurve.getPoint(u));
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    if (!reduceMotion) {
      camera.position.x += pointer.sx * 0.6;
      camera.position.y -= pointer.sy * 0.4;
    }
    camera.lookAt(look);
    sky.position.copy(camera.position);

    // colour grade: blend the sky of the room we're leaving into the next one
    const i0 = Math.min(Math.floor(kf), last);
    const i1 = Math.min(i0 + 1, last);
    const f = THREE.MathUtils.smootherstep(kf - i0, 0, 1);
    const a = SKIES[KF_ROOM[i0]];
    const b = SKIES[KF_ROOM[i1]];
    for (const k in sk) sk[k].copy(a[k]).lerp(b[k], f);
    sky.material.uniforms.uTop.value.copy(sk.top);
    sky.material.uniforms.uMid.value.copy(sk.mid);
    sky.material.uniforms.uBot.value.copy(sk.bot);
    sky.material.uniforms.uNeb.value.copy(sk.neb);
    scene.fog.color.copy(sk.mid).multiplyScalar(0.6);

    // open the fog up at the end so the whole globe reads
    const far = 36 + Math.max(0, kf - 14) * 14;
    scene.fog.far = U.uFogFar.value = far;

    hero.floor.visible = kf < 2.9;
    hall.floor.visible = kf > 10.3 && kf < 15.3;

    grade.uniforms.uTime.value = t;
    grade.uniforms.uVel.value = Math.min(Math.abs(target - kf), 1.5) / 1.5;

    // white-out while passing through the screen glass
    onFlash?.(Math.max(0, 1 - Math.abs(kf - 2.45) / 0.42));
    onProgress?.(kf / last, camera.position);

    let r = 0;
    ROOMS.forEach((rm, ri) => {
      if (kf >= rm.from - 0.5) r = ri;
    });
    if (r !== room) {
      room = r;
      onRoom?.(r);
    }

    hero.floaters.forEach((o, k) => {
      o.rotation.y += dt * (0.25 + k * 0.1);
      o.position.y += Math.sin(t * 1.2 + k * 2) * 0.002;
    });
    hero.portal.rotation.z = t * 0.05;
    if (kf < 4.5) tunnelTick(t, reduceMotion ? 0 : dt);
    if (kf > 3.5 && kf < 7.5) coreTick(t);
    if (kf > 6 && kf < 11.5) cityTick(t, reduceMotion ? 0 : dt);
    if (kf > 10 && kf < 15.5) hall.tick(t);
    if (kf > 13.5) globeTick(t);

    composer.render();
    if (first) {
      first = false;
      onReady?.();
    }
  };
  frame();

  return {
    measure,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      composer.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
