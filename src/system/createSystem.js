import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// "Life of a request": the camera follows a stream of packets through a
// production system: client -> auth gateway -> service mesh -> team
// namespaces -> data layer -> Kubernetes cluster.
//
// Elements with `data-ch="n"` pin chapter n to the moment they are centred
// in the viewport. Chapter n sits on keyframe 2n; odd keyframes are the
// flights in between.

export const LAYERS = [
  { name: "Client", detail: "React · Flutter" },
  { name: "Auth gateway", detail: "Keycloak" },
  { name: "Service mesh", detail: "Spring Boot · Node.js" },
  { name: "Namespaces", detail: "One per team" },
  { name: "Data layer", detail: "PostgreSQL · MySQL · MinIO" },
  { name: "Cluster", detail: "Kubernetes" },
];

const KEYFRAMES = [
  [[0, 3.6, 13.5], [0.3, 3.9, -4]], // 0 hero: the client
  [[3.2, 2.9, -3], [0, 1.6, -20]],
  [[0, 2.2, -10], [0, 2.4, -26]], // 2 about: the gateway
  [[0.3, 1.8, -28], [0.5, 1.5, -40]],
  [[6.5, 3.4, -42], [0, 1.4, -52]], // 4 stack: service mesh
  [[-5, 4.6, -58], [0, 1.2, -60]],
  [[0, 8, -65], [0, 0.4, -81]], // 6 experience: namespaces
  [[5, 3.2, -93], [0, 1.2, -106]],
  [[-7.5, 3.2, -99], [0, 1.6, -108]], // 8 projects: data layer
  [[0, 4, -118], [0, 1, -136]],
  [[0, 11, -118], [0, -0.5, -138]], // 10 contact: the cluster
];

const C = {
  blue: "#4d7cff",
  cyan: "#6fd8ff",
  red: "#ff4d5e",
  coral: "#ff8a66",
  violet: "#9b7bff",
  white: "#f4f6ff",
};

const FONT = '"Geist", -apple-system, "Segoe UI", sans-serif';
const SERIF = '"Instrument Serif", "Times New Roman", serif';
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

const U = {
  uTime: { value: 0 },
  uFogNear: { value: 12 },
  uFogFar: { value: 48 },
  uPixelRatio: { value: 1 },
};

const FADE = /* glsl */ `
  uniform float uFogNear; uniform float uFogFar;
  float fogFade(float depth) { return 1.0 - smoothstep(uFogNear, uFogFar, depth); }
`;

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

// glass pill label, the same language as the page UI
function label(text, { sub = null, height = 0.46, glow = 1.15 } = {}) {
  const size = 44;
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `500 ${size}px ${FONT}`;
  let w = probe.measureText(text).width;
  if (sub) {
    probe.font = `italic 400 ${size * 0.9}px ${SERIF}`;
    w += probe.measureText(sub).width + size * 0.5;
  }
  const pad = size * 0.62;
  const W = Math.ceil(w + pad * 2);
  const H = Math.ceil(size * 1.9);
  const { tex } = canvasTexture(W, H, (ctx) => {
    ctx.fillStyle = "rgba(10,8,14,0.62)";
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(1, 1, W - 2, H - 2, 18);
    ctx.fill();
    ctx.stroke();
    ctx.textBaseline = "middle";
    ctx.font = `500 ${size}px ${FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, pad, H / 2 + 2);
    if (sub) {
      ctx.font = `500 ${size}px ${FONT}`;
      const tw = ctx.measureText(text).width;
      ctx.font = `italic 400 ${size * 0.9}px ${SERIF}`;
      ctx.fillStyle = "rgba(255,255,255,0.62)";
      ctx.fillText(sub, pad + tw + size * 0.5, H / 2 + 3);
    }
  });
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  mat.color.setScalar(glow);
  const s = new THREE.Sprite(mat);
  s.scale.set((height * W) / H, height, 1);
  return s;
}

function pulseLineMaterial(color, { speed = 0.35, base = 0.2, gain = 3.2, width = 0.06 } = {}) {
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

function glowPoints(positions, colors, sizes, { intensity = 1.2 } = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...U, uIntensity: { value: intensity } },
    vertexShader: /* glsl */ `
      attribute float aSize; uniform float uPixelRatio, uTime;
      varying vec3 vColor; varying float vDepth; varying float vTw;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        vTw = 0.65 + 0.35 * sin(uTime * 1.7 + position.x * 13.0 + position.z * 7.0);
        gl_PointSize = aSize * uPixelRatio * (80.0 / max(0.1, -mv.z));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      varying vec3 vColor; varying float vDepth; varying float vTw;
      ${FADE}
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d); a *= a;
        gl_FragColor = vec4(vColor * a * uIntensity * vTw * fogFade(vDepth), 1.0);
      }`,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

function fresnelMaterial(color, { power = 2.5, strength = 1.5, side = THREE.FrontSide, inner = 0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uColor: { value: new THREE.Color(color) }, uPower: { value: power }, uStrength: { value: strength }, uInner: { value: inner } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vDepth;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower, uStrength, uInner;
      varying vec3 vN; varying vec3 vV; varying float vDepth;
      ${FADE}
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        gl_FragColor = vec4(uColor * (f * uStrength + uInner) * fogFade(vDepth), 1.0);
      }`,
    side,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

// deep blue / red nebula, the backdrop for the whole system
function buildSky(scene) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uShift: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uShift;
      varying vec3 vDir;
      float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 6; i++) { v += a * noise(p); p = p * 2.02 + 0.17; a *= 0.5; } return v; }
      void main() {
        vec3 d = normalize(vDir);
        vec3 col = mix(vec3(0.031, 0.039, 0.098), vec3(0.012, 0.014, 0.04), smoothstep(-0.2, 0.8, d.y));
        vec3 q = d * 1.6 + vec3(uTime * 0.006, 0.0, uShift);
        float n1 = fbm(q + fbm(q * 1.3) * 0.9);
        float n2 = fbm(q * 1.9 + vec3(4.2, 1.3, 2.7));
        vec3 blue = vec3(0.16, 0.26, 0.85);
        vec3 red = vec3(0.85, 0.16, 0.22);
        col += blue * smoothstep(0.45, 0.95, n1) * 0.55;
        col += red * smoothstep(0.55, 0.98, n2) * 0.45 * smoothstep(-0.3, 0.4, d.y + 0.2);
        col += vec3(1.0, 0.75, 0.8) * pow(smoothstep(0.7, 1.0, n1 * n2 * 1.6), 3.0) * 0.25;
        vec3 sp = d * 240.0; vec3 id = floor(sp); float s = hash(id);
        col += vec3(0.9, 0.93, 1.0) * step(0.9968, s) * smoothstep(0.42, 0.0, length(fract(sp) - 0.5)) * (0.55 + 0.45 * sin(uTime * 2.3 + s * 60.0));
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

// ---------- stations ----------

function screenTexture(w, h, paint) {
  return canvasTexture(w, h, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0b0e22");
    g.addColorStop(1, "#150b1c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    paint(ctx, w, h);
  }).tex;
}

function buildClient(scene, name) {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0c0f1c, metalness: 0.3, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.92 });

  // a browser window running this very portfolio
  const win = new THREE.Group();
  win.position.set(0, 1.55, 0);
  win.add(new THREE.Mesh(new RoundedBoxGeometry(4.4, 2.8, 0.08, 4, 0.06), glass));
  const tex = screenTexture(1320, 800, (ctx, w, h) => {
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, 0, w, 64);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(34 + i * 30, 32, 9, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 260, 16, 520, 32, 10);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `400 20px ${FONT}`;
    ctx.fillText("chamara.dev", w / 2 - 55, 39);
    const glow = ctx.createRadialGradient(w * 0.75, h * 0.35, 20, w * 0.75, h * 0.35, 520);
    glow.addColorStop(0, "rgba(77,124,255,0.45)");
    glow.addColorStop(0.5, "rgba(255,77,94,0.18)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 64, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText(name.split(" ")[0], 70, 130);
    ctx.font = `400 84px ${FONT}`;
    ctx.fillText("Software engineer", 70, 300);
    ctx.fillText("building systems", 70, 390);
    ctx.fillText("that", 70, 480);
    ctx.font = `italic 400 92px ${SERIF}`;
    ctx.fillText("scale", 250, 482);
    ctx.fillStyle = "#e9e9e9";
    ctx.beginPath();
    ctx.roundRect(70, 560, 220, 60, 14);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(310, 560, 220, 60, 14);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.roundRect(820, 190, 420, 440, 36);
    ctx.fill();
    for (let i = 0; i < 18; i++) {
      const bh = 40 + ((i * 37) % 170);
      ctx.fillStyle = `rgba(255,255,255,${0.35 + (i / 18) * 0.65})`;
      ctx.fillRect(850 + i * 20, 590 - bh, 14, bh);
    }
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.24, 2.64), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  screen.material.color.setScalar(0.95);
  screen.position.z = 0.045;
  win.add(screen);
  const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(4.4, 2.8)), new THREE.LineBasicMaterial({ color: hdr(C.cyan, 1.4), toneMapped: false }));
  rim.position.z = 0.05;
  win.add(rim);
  g.add(win);

  // a phone running a Flutter app
  const phone = new THREE.Group();
  phone.position.set(3.1, 1.0, 1.6);
  phone.rotation.set(0.05, -0.45, 0.06);
  phone.add(new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.85, 0.07, 4, 0.12), glass));
  const ptex = screenTexture(360, 740, (ctx, w) => {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText("Study", 30, 90);
    ctx.font = `italic 400 34px ${SERIF}`;
    ctx.fillText("materials", 30, 130);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 + i * 0.03})`;
      ctx.beginPath();
      ctx.roundRect(30, 170 + i * 130, w - 60, 110, 20);
      ctx.fill();
      ctx.fillStyle = i % 2 ? "#ff8a66" : "#6fd8ff";
      ctx.beginPath();
      ctx.roundRect(48, 190 + i * 130, 70, 70, 16);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(136, 204 + i * 130, 150, 14);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(136, 232 + i * 130, 110, 10);
    }
  });
  const pscreen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.72), new THREE.MeshBasicMaterial({ map: ptex, toneMapped: false }));
  pscreen.position.z = 0.04;
  phone.add(pscreen);
  g.add(phone);

  const tag = label("Client", { sub: "React · Flutter" });
  tag.position.set(-1.4, 3.35, 0);
  g.add(tag);

  const light = new THREE.PointLight(0x6f8cff, 14, 12);
  light.position.set(0, 2, 2);
  g.add(light);
  scene.add(g);
  return { win, phone };
}

function buildGateway(scene) {
  const g = new THREE.Group();
  g.position.set(0, 1.6, -26);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4, 0.05, 16, 256), new THREE.MeshBasicMaterial({ color: hdr(C.white, 1.7), toneMapped: false }));
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.35, 0.015, 8, 256), new THREE.MeshBasicMaterial({ color: hdr(C.red, 2.4), toneMapped: false }));
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.012, 8, 256), new THREE.MeshBasicMaterial({ color: hdr(C.blue, 2.4), toneMapped: false }));
  g.add(ring, ring2, ring3);
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.22, 0.025), new THREE.MeshBasicMaterial({ color: hdr(C.white, 1.6), toneMapped: false }), 96);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    m.compose(V(Math.cos(a) * 4.7, Math.sin(a) * 4.7, 0), new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), a - Math.PI / 2), V(1, i % 8 ? 1 : 2.2, 1));
    ticks.setMatrixAt(i, m);
  }
  g.add(ticks);

  // the auth membrane every request passes through
  const membrane = new THREE.Mesh(
    new THREE.CircleGeometry(3.7, 96),
    new THREE.ShaderMaterial({
      uniforms: { ...U },
      vertexShader: "varying vec2 vUv; varying float vDepth; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }",
      fragmentShader: /* glsl */ `
        uniform float uTime; varying vec2 vUv; varying float vDepth;
        ${FADE}
        void main() {
          vec2 p = vUv - 0.5; float r = length(p) * 2.0;
          vec2 h = p * 26.0; h.x *= 1.1547; h.y += mod(floor(h.x), 2.0) * 0.5;
          vec2 f = abs(fract(h) - 0.5);
          float hex = smoothstep(0.46, 0.5, max(f.x * 1.5 + f.y, f.y * 2.0));
          float wave = smoothstep(0.08, 0.0, abs(r - fract(uTime * 0.25)));
          vec3 col = vec3(0.35, 0.5, 1.0) * (hex * 0.1 + wave * 0.35) + vec3(1.0, 0.35, 0.45) * pow(r, 6.0) * 0.4;
          gl_FragColor = vec4(col * fogFade(vDepth), 1.0);
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  g.add(membrane);

  const tag = label("Auth gateway", { sub: "Keycloak" });
  tag.position.set(0, 5.4, 0);
  g.add(tag);
  scene.add(g);
  return g;
}

function buildMesh(scene, skills) {
  const g = new THREE.Group();
  g.position.set(0, 1.4, -52);
  const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x0d1024, metalness: 0.6, roughness: 0.2, clearcoat: 1 });
  const nodes = [];
  const count = skills.length;
  for (let i = 0; i < count; i++) {
    // golden-angle spiral so nodes spread around the stream
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    const p = V(Math.cos(th) * r * 6.2, y * 2.6, Math.sin(th) * r * 5.2);
    const node = new THREE.Group();
    node.position.copy(p);
    const hot = i < 3;
    node.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), coreMat));
    node.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: hdr(hot ? C.coral : C.cyan, 3.2), toneMapped: false })));
    node.add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 24), fresnelMaterial(hot ? C.red : C.blue, { power: 2.2, strength: 1.5 })));
    const tag = label(skills[i], { height: 0.36 });
    tag.position.set(0, 0.72, 0);
    node.add(tag);
    g.add(node);
    nodes.push(node);
  }
  // service-to-service calls
  const links = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: a.position.distanceTo(b.position) }))
      .filter((x) => x.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2);
    near.forEach(({ j }) => {
      if (j > i) {
        const b = nodes[j].position;
        const mid = a.position.clone().add(b).multiplyScalar(0.5).multiplyScalar(0.8);
        links.push(new THREE.QuadraticBezierCurve3(a.position.clone(), mid, b.clone()).getPoints(24));
      }
    });
    // every service also talks to the main stream at the centre
    if (i % 2 === 0) links.push(new THREE.QuadraticBezierCurve3(a.position.clone(), a.position.clone().multiplyScalar(0.3).add(V(0, 0.6, 0)), V(0, 0, 0)).getPoints(24));
  });
  g.add(pulseLines(links, pulseLineMaterial(C.cyan, { speed: 0.5, base: 0.16, gain: 3 }), 0.25));

  const tag = label("Service mesh", { sub: "Spring Boot · Node.js" });
  tag.position.set(0, 4.3, 0);
  g.add(tag);
  const light = new THREE.PointLight(0x4d7cff, 18, 16);
  g.add(light);
  scene.add(g);
  return (t) => {
    g.rotation.y = Math.sin(t * 0.08) * 0.25;
    nodes.forEach((n, i) => (n.children[1].rotation.y = t * (0.6 + i * 0.05)));
  };
}

function buildNamespaces(scene, experiences) {
  const g = new THREE.Group();
  const spots = [
    [4, -72, C.blue],
    [-4, -80, C.violet],
    [4, -88, C.red],
  ];
  // oldest first along the stream
  const ordered = [...experiences].reverse();
  const podsAll = [];
  ordered.slice(0, 3).forEach((exp, i) => {
    const [x, z, color] = spots[i];
    const ns = new THREE.Group();
    ns.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.18, 6), new THREE.MeshPhysicalMaterial({ color: 0x0b0d1c, metalness: 0.7, roughness: 0.25, clearcoat: 1 }));
    ns.add(base);
    const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(3.02, 3.02, 0.2, 6)), new THREE.LineBasicMaterial({ color: hdr(color, 2.6), toneMapped: false }));
    ns.add(rim);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(3.4, 6), new THREE.MeshBasicMaterial({ color: hdr(color, 0.45), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.1;
    ns.add(glow);
    // pods: more pods the longer the tenure
    const n = 4 + i * 3;
    const pods = new THREE.InstancedMesh(new RoundedBoxGeometry(0.5, 0.5, 0.5, 2, 0.08), new THREE.MeshStandardMaterial({ color: 0x151a33, metalness: 0.5, roughness: 0.3, emissive: new THREE.Color(color), emissiveIntensity: 0.9 }), n);
    const m = new THREE.Matrix4();
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const r = k % 2 ? 1.1 : 1.9;
      m.makeTranslation(Math.cos(a) * r, 0.4, Math.sin(a) * r);
      pods.setMatrixAt(k, m);
    }
    ns.add(pods);
    podsAll.push(pods);
    const tag = label(exp.company, { sub: exp.time });
    tag.position.set(0, 2.0, 0);
    ns.add(tag);
    const pl = new THREE.PointLight(color, 10, 8);
    pl.position.y = 1.5;
    ns.add(pl);
    g.add(ns);
  });
  scene.add(g);
  return (t) => {
    podsAll.forEach((p, i) => {
      p.position.y = Math.sin(t * 1.2 + i) * 0.06;
      p.rotation.y = t * 0.15 * (i % 2 ? -1 : 1);
    });
  };
}

function holoMaterial(tex, color) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, map: { value: tex }, uColor: { value: new THREE.Color(color) } },
    vertexShader: "varying vec2 vUv; varying float vDepth; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }",
    fragmentShader: /* glsl */ `
      uniform sampler2D map; uniform vec3 uColor; uniform float uTime;
      varying vec2 vUv; varying float vDepth;
      ${FADE}
      void main() {
        vec3 tex = texture2D(map, vUv).rgb;
        float scan = 0.93 + 0.07 * sin(vUv.y * 480.0 - uTime * 5.0);
        vec2 e = abs(vUv * 2.0 - 1.0);
        float edge = max(smoothstep(0.985, 1.0, e.x), smoothstep(0.975, 1.0, e.y));
        gl_FragColor = vec4((tex * scan * 0.85 + uColor * edge * 1.6) * fogFade(vDepth), 1.0);
      }`,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function buildData(scene, projects) {
  const g = new THREE.Group();
  g.position.set(0, 0, -108);
  // a database: stacked platters with glowing seams
  const platter = new THREE.MeshPhysicalMaterial({ color: 0x0d1024, metalness: 0.8, roughness: 0.2, clearcoat: 1 });
  for (let i = 0; i < 4; i++) {
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.55, 64), platter);
    disk.position.y = 0.35 + i * 0.72;
    g.add(disk);
    const seam = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.02, 8, 128), new THREE.MeshBasicMaterial({ color: hdr(i % 2 ? C.cyan : C.coral, 3), toneMapped: false }));
    seam.rotation.x = Math.PI / 2;
    seam.position.y = 0.66 + i * 0.72;
    g.add(seam);
  }
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 3.4, 64, 1, true), fresnelMaterial(C.blue, { power: 2, strength: 0.9 })).translateY(1.5));
  const tag = label("Data layer", { sub: "PostgreSQL · MySQL · MinIO" });
  tag.position.set(0, 4.1, 0);
  g.add(tag);

  // projects orbit the data they were built on
  const orbit = new THREE.Group();
  orbit.position.y = 1.6;
  projects.forEach((p, i) => {
    const { tex, ctx, canvas } = canvasTexture(900, 600, () => {});
    const paint = (img) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#0b0d1c";
      ctx.fillRect(0, 0, w, h);
      if (img) {
        const s = Math.max(w / img.width, h / img.height);
        ctx.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
      }
      const fade = ctx.createLinearGradient(0, h * 0.45, 0, h);
      fade.addColorStop(0, "rgba(8,10,25,0)");
      fade.addColorStop(1, "rgba(8,10,25,0.95)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = `500 64px ${FONT}`;
      ctx.fillText(p.title, 40, h - 70);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `italic 400 34px ${SERIF}`;
      ctx.fillText(p.tech, 42, h - 26);
      tex.needsUpdate = true;
    };
    paint(null);
    if (p.img) {
      const img = new Image();
      img.onload = () => paint(img);
      img.src = p.img;
    }
    const a = (i / projects.length) * Math.PI * 2;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), holoMaterial(tex, hdr(i % 2 ? C.cyan : C.coral, 1)));
    panel.position.set(Math.cos(a) * 6, Math.sin(a * 2) * 0.4, Math.sin(a) * 6);
    panel.lookAt(0, panel.position.y, 0);
    panel.rotateY(Math.PI);
    orbit.add(panel);
  });
  g.add(orbit);
  const light = new THREE.PointLight(0xff8a66, 12, 14);
  light.position.set(0, 3, 0);
  g.add(light);
  scene.add(g);
  return (t) => {
    orbit.rotation.y = t * 0.07;
  };
}

function buildCluster(scene) {
  const g = new THREE.Group();
  g.position.set(0, -0.6, -136);
  const R = 9;
  const cells = [];
  const size = 0.9;
  for (let q = -R; q <= R; q++) {
    for (let r = -R; r <= R; r++) {
      const s = -q - r;
      if (Math.abs(s) > R) continue;
      const x = size * Math.sqrt(3) * (q + r / 2);
      const z = size * 1.5 * r;
      cells.push([x, z, Math.hypot(x, z)]);
    }
  }
  const hexes = new THREE.InstancedMesh(new THREE.CylinderGeometry(size * 0.92, size * 0.92, 0.2, 6), new THREE.MeshStandardMaterial({ color: 0x0c0f22, metalness: 0.6, roughness: 0.3 }), cells.length);
  const lids = new THREE.InstancedMesh(new THREE.CylinderGeometry(size * 0.8, size * 0.8, 0.02, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), cells.length);
  const m = new THREE.Matrix4();
  cells.forEach(([x, z], i) => {
    m.makeTranslation(x, 0, z);
    hexes.setMatrixAt(i, m);
    m.makeTranslation(x, 0.11, z);
    lids.setMatrixAt(i, m);
  });
  g.add(hexes, lids);

  // control plane
  const core = new THREE.Group();
  core.position.y = 2.2;
  core.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.1, iridescence: 1, iridescenceIOR: 1.8, clearcoat: 1 })));
  core.add(new THREE.Mesh(new THREE.SphereGeometry(1.4, 48, 32), fresnelMaterial(C.red, { power: 2.4, strength: 1.4 })));
  g.add(core);
  const helm = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.03, 8, 7), new THREE.MeshBasicMaterial({ color: hdr(C.white, 2.2), toneMapped: false }));
  helm.position.y = 2.2;
  g.add(helm);
  const tag = label("Cluster", { sub: "Kubernetes" });
  tag.position.set(0, 4.6, 0);
  g.add(tag);
  scene.add(g);

  const col = new THREE.Color();
  const cBlue = new THREE.Color(C.blue);
  const cRed = new THREE.Color(C.red);
  const tick = (t) => {
    cells.forEach(([, , d], i) => {
      const w = Math.pow(0.5 + 0.5 * Math.sin(d * 0.9 - t * 2.2), 8);
      col.copy(cBlue).lerp(cRed, 0.5 + 0.5 * Math.sin(d * 0.3 + t * 0.4)).multiplyScalar(0.18 + w * 1.5);
      lids.setColorAt(i, col);
    });
    lids.instanceColor.needsUpdate = true;
    core.rotation.y = t * 0.5;
    helm.rotation.z = t * 0.2;
    helm.rotation.x = Math.PI / 2;
  };
  tick(0);
  return tick;
}

// the request stream running through every layer
function buildStream(scene) {
  const curve = new THREE.CatmullRomCurve3(
    [
      V(0, 1.5, -0.3),
      V(0, 1.65, -13),
      V(0, 1.6, -26),
      V(0.4, 1.5, -38),
      V(0, 1.4, -52),
      V(-1.5, 1.1, -64),
      V(4, 0.9, -72),
      V(-4, 0.9, -80),
      V(4, 0.9, -88),
      V(1.5, 1.1, -98),
      V(0, 1.6, -108),
      V(0, 1.2, -122),
      V(0, 1.6, -136),
    ],
    false,
    "centripetal"
  );
  const LUT = curve.getSpacedPoints(3000);
  scene.add(pulseLines([LUT.filter((_, i) => i % 3 === 0)], pulseLineMaterial(C.cyan, { speed: 0.08, base: 0.25, gain: 2.2, width: 0.02 }), 0.02));

  const N = 220;
  const req = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: hdr(C.cyan, 5), toneMapped: false }), N);
  const res = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshBasicMaterial({ color: hdr(C.coral, 5), toneMapped: false }), N);
  const phase = Array.from({ length: N }, () => Math.random());
  const jitter = Array.from({ length: N }, () => V((Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.35, 0));
  scene.add(req, res);
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  return (t) => {
    for (let i = 0; i < N; i++) {
      const u = (phase[i] + t * 0.018) % 1;
      p.copy(LUT[Math.floor(u * (LUT.length - 1))]).add(jitter[i]);
      m.makeTranslation(p.x, p.y, p.z);
      req.setMatrixAt(i, m);
      const v = 1 - ((phase[i] * 0.7 + t * 0.014) % 1);
      p.copy(LUT[Math.floor(v * (LUT.length - 1))]).sub(jitter[i]).add(V(0.22, -0.12, 0));
      m.makeTranslation(p.x, p.y, p.z);
      res.setMatrixAt(i, m);
    }
    req.instanceMatrix.needsUpdate = true;
    res.instanceMatrix.needsUpdate = true;
  };
}

function buildDust(scene) {
  const p = [];
  const c = [];
  const s = [];
  const col = new THREE.Color();
  for (let i = 0; i < 3000; i++) {
    p.push((Math.random() - 0.5) * 50, (Math.random() - 0.35) * 24, 14 - Math.random() * 170);
    col.set(Math.random() > 0.8 ? C.coral : Math.random() > 0.5 ? C.cyan : C.white);
    c.push(col.r, col.g, col.b);
    s.push(0.15 + Math.random() * 0.45);
  }
  scene.add(glowPoints(p, c, s, { intensity: 0.7 }));
}

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVel: { value: 0 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime, uVel; varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5; float r = length(d);
      float ca = 0.0015 + uVel * 0.01;
      vec3 col = vec3(texture2D(tDiffuse, vUv - d * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + d * ca).b);
      col *= mix(1.0, smoothstep(0.9, 0.2, r), 0.5);
      col += (hash(vUv * 1000.0 + fract(uTime) * 100.0) - 0.5) * 0.035;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function createSystem(canvas, data, { onChapter, onReady } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.innerWidth < 800;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  let dpr = Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  U.uPixelRatio.value = dpr;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x080a19, U.uFogNear.value, U.uFogFar.value);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.35;
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 320);
  scene.add(new THREE.HemisphereLight(0x8fa6ff, 0x1a0710, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 0.5);
  key.position.set(4, 8, 6);
  scene.add(key);

  const sky = buildSky(scene);
  const client = buildClient(scene, data.name);
  const gateway = buildGateway(scene);
  const meshTick = buildMesh(scene, data.skills);
  const nsTick = buildNamespaces(scene, data.experiences);
  const dataTick = buildData(scene, data.projects);
  const clusterTick = buildCluster(scene);
  const streamTick = buildStream(scene);
  buildDust(scene);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.45, 0.78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);

  const posCurve = new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => V(...k[0])), false, "centripetal");
  const lookCurve = new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => V(...k[1])), false, "centripetal");
  const last = KEYFRAMES.length - 1;

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
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 68 : 50;
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

  let ch = target();
  let chapter = -1;
  let raf = 0;
  let slow = 0;
  let first = true;
  let time = 0;
  const clock = new THREE.Clock();
  const look = new THREE.Vector3();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.1);
    slow = dt > 0.028 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 50 && dpr > 0.75) {
      dpr -= 0.25;
      slow = 0;
      resize();
    }
    if (!reduceMotion) time += dt;
    U.uTime.value = time;

    const tgt = target();
    ch += (tgt - ch) * (1 - Math.exp(-Math.min(dt, 0.05) * (reduceMotion ? 20 : 3.6)));
    if (Math.abs(tgt - ch) < 1e-4) ch = tgt;
    const u = Math.min(Math.max((ch * 2) / last, 0), 1);
    camera.position.copy(posCurve.getPoint(u));
    look.copy(lookCurve.getPoint(u));
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    if (!reduceMotion) {
      camera.position.x += pointer.sx * 0.7 + Math.sin(time * 0.3) * 0.08;
      camera.position.y -= pointer.sy * 0.45 - Math.sin(time * 0.4) * 0.05;
    }
    camera.lookAt(look);
    sky.position.copy(camera.position);
    sky.material.uniforms.uShift.value = ch * 0.12;
    const far = 48 + Math.max(0, ch - 4.2) * 40;
    scene.fog.far = U.uFogFar.value = far;

    grade.uniforms.uTime.value = time;
    grade.uniforms.uVel.value = Math.min(Math.abs(tgt - ch), 0.8) / 0.8;

    const c = Math.min(Math.round(ch), LAYERS.length - 1);
    if (c !== chapter) {
      chapter = c;
      onChapter?.(c);
    }

    client.win.position.y = 1.55 + Math.sin(time * 0.8) * 0.05;
    client.phone.position.y = 1.0 + Math.sin(time * 0.9 + 1) * 0.07;
    gateway.rotation.z = time * 0.04;
    streamTick(time);
    if (ch > 1.2 && ch < 3.2) meshTick(time);
    if (ch > 2.2 && ch < 4.2) nsTick(time);
    if (ch > 3.2) dataTick(time);
    if (ch > 3.8) clusterTick(time);

    composer.render();
    if (first) {
      first = false;
      onReady?.();
    }
  };
  frame();

  return {
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
