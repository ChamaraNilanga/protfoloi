import * as THREE from "three";

export const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
export const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

export const FONT = '"Geist", -apple-system, "Segoe UI", sans-serif';
export const SERIF = '"Instrument Serif", "Times New Roman", serif';

export const C = {
  blue: "#4d7cff",
  cyan: "#6fd8ff",
  red: "#ff4d5e",
  coral: "#ff8a66",
  violet: "#9b7bff",
  warm: "#ffd9a8",
  white: "#f4f6ff",
};

// uniforms shared by every custom shader
export const U = {
  uTime: { value: 0 },
  uFogNear: { value: 20 },
  uFogFar: { value: 400 },
  uPixelRatio: { value: 1 },
};

export const FADE = /* glsl */ `
  uniform float uFogNear; uniform float uFogFar;
  float fogFade(float depth) { return 1.0 - smoothstep(uFogNear, uFogFar, depth); }
`;

export const NOISE = /* glsl */ `
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 6; i++) { v += a * noise(p); p = p * 2.02 + 0.17; a *= 0.5; } return v; }
`;

export function canvasTexture(w, h, draw) {
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

export function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// glass pill label in the page's own visual language
export function label(text, { sub = null, height = 0.46, glow = 1.1 } = {}) {
  const size = 44;
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `500 ${size}px ${FONT}`;
  const tw = probe.measureText(text).width;
  let w = tw;
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

// flat text plane (signage)
export function textPlane(text, { size = 120, color = "#ffffff", font = FONT, weight = 500, height = 1, glow = 1.6, bg = null, pad = 0.4 } = {}) {
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `${weight} ${size}px ${font}`;
  const W = Math.ceil(probe.measureText(text).width + size * pad * 2);
  const H = Math.ceil(size * 1.5);
  const { tex } = canvasTexture(W, H, (ctx) => {
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, size * pad, H / 2 + size * 0.05);
  });
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: !bg, toneMapped: false, depthWrite: !!bg });
  mat.color.setScalar(glow);
  const m = new THREE.Mesh(new THREE.PlaneGeometry((height * W) / H, height), mat);
  return m;
}

export function fresnelMaterial(color, { power = 2.5, strength = 1.5, side = THREE.FrontSide, inner = 0 } = {}) {
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

export function glowPoints(positions, colors, sizes, { intensity = 1.2, twinkle = 0.35 } = {}) {
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
        vTw = 1.0 - uTwinkle + uTwinkle * sin(uTime * 1.7 + position.x * 13.0 + position.z * 7.0);
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

// soft additive disc for fake light pools and glows
export function glowDisc(color, radius, intensity = 1) {
  const { tex } = canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: hdr(color, intensity), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  return new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
}
