import * as THREE from "three";
import { loadImage, glowDisc, hdr, C } from "./helpers";

// A 2.5D portrait: the cutout photo is displaced by a depth map sculpted from
// its own silhouette (body volume + head ellipsoid + nose), then lit with rim
// light. The head turns on a neck pivot to follow the cursor; the body turns
// less.
//
// Landmarks are fractions of the source image (my2.png, 789x827).
const HEAD = { x: 0.432, y: 0.235, rx: 0.12, ry: 0.16 };
const NOSE = { x: 0.432, y: 0.27 };
const NECK_Y = 0.385;

function buildDepth(img) {
  const W = 256;
  const H = Math.round((W * img.height) / img.width);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  // body volume: a blurred silhouette gives a soft dome
  ctx.filter = "blur(14px)";
  ctx.drawImage(img, 0, 0, W, H);
  ctx.filter = "none";
  const blurred = ctx.getImageData(0, 0, W, H).data;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const sharp = ctx.getImageData(0, 0, W, H).data;

  const data = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const u = x / W;
      const v = y / H;
      const a = sharp[i + 3] / 255;
      let d = Math.pow(blurred[i + 3] / 255, 0.8) * 0.45;
      // head ellipsoid
      const hx = (u - HEAD.x) / HEAD.rx;
      const hy = (v - HEAD.y) / HEAD.ry;
      const hr = hx * hx + hy * hy;
      if (hr < 1) d += Math.sqrt(1 - hr) * 0.5;
      // nose and brow
      const nx = (u - NOSE.x) / 0.022;
      const ny = (v - NOSE.y) / 0.035;
      d += Math.exp(-(nx * nx + ny * ny)) * 0.12;
      // head weight: 1 on the head, fading out across the neck
      const w = Math.min(1, Math.max(0, (NECK_Y + 0.04 - v) / 0.08));
      // rows are stored bottom-up to match the plane's uv
      const o = ((H - 1 - y) * W + x) * 4;
      data[o] = Math.min(255, d * a * 255);
      data[o + 1] = Math.min(255, w * 255);
      data[o + 2] = 0;
      data[o + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function buildPortrait(scene, src) {
  const group = new THREE.Group();
  const uniforms = {
    map: { value: null },
    uDepth: { value: null },
    uLook: { value: new THREE.Vector2() },
    uDepthScale: { value: 0.7 },
    uPivot: { value: new THREE.Vector3() },
    uTime: { value: 0 },
    uReveal: { value: 0 },
  };
  const width = 3.3;
  let mesh = null;

  // halo behind the head
  const halo = glowDisc(C.blue, 2.4, 0.7);
  const halo2 = glowDisc(C.coral, 1.6, 0.35);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.012, 8, 200), new THREE.MeshBasicMaterial({ color: hdr(C.white, 1.8), toneMapped: false }));
  group.add(halo, halo2, ring);

  loadImage(src).then((img) => {
    if (!img) return;
    const height = (width * img.height) / img.width;
    const map = new THREE.Texture(img);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    map.needsUpdate = true;
    uniforms.map.value = map;
    uniforms.uDepth.value = buildDepth(img);
    uniforms.uPivot.value.set((HEAD.x - 0.5) * width, (0.5 - NECK_Y) * height, 0);
    const headY = (0.5 - HEAD.y) * height;
    halo.position.set((HEAD.x - 0.5) * width, headY - 0.1, -0.3);
    halo2.position.set((HEAD.x - 0.5) * width + 0.6, headY - 0.6, -0.55);
    ring.position.set((HEAD.x - 0.5) * width, headY - 0.05, -0.2);

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        uniform sampler2D uDepth; uniform vec2 uLook; uniform float uDepthScale; uniform vec3 uPivot;
        varying vec2 vUv; varying float vW;
        mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
        mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
        void main() {
          vUv = uv;
          vec4 d = texture2D(uDepth, uv);
          vec3 p = position + vec3(0.0, 0.0, d.r * uDepthScale);
          float w = d.g; vW = w;
          vec3 q = p - uPivot;
          q = rotY(uLook.x * 0.3 * w) * rotX(-uLook.y * 0.14 * w) * q;
          p = uPivot + q;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map; uniform sampler2D uDepth; uniform vec2 uLook; uniform float uTime, uReveal;
        varying vec2 vUv; varying float vW;
        void main() {
          vec4 t = texture2D(map, vUv);
          if (t.a < 0.5) discard;
          vec2 e = vec2(1.0 / 256.0, 1.0 / 268.0);
          float dx = texture2D(uDepth, vUv + vec2(e.x, 0.0)).r - texture2D(uDepth, vUv - vec2(e.x, 0.0)).r;
          float dy = texture2D(uDepth, vUv + vec2(0.0, e.y)).r - texture2D(uDepth, vUv - vec2(0.0, e.y)).r;
          vec3 n = normalize(vec3(-dx * 6.0 - uLook.x * 0.3 * vW, -dy * 6.0 + uLook.y * 0.2 * vW, 1.0));
          vec3 col = t.rgb;
          // key light from the upper left, cool rim on the left, warm rim on the right
          float key = clamp(dot(n, normalize(vec3(-0.4, 0.5, 0.8))), 0.0, 1.0);
          col *= 0.78 + key * 0.32;
          float rim = pow(1.0 - n.z, 1.6);
          col += vec3(0.30, 0.45, 1.0) * rim * smoothstep(0.0, -0.3, n.x) * 0.9;
          col += vec3(1.0, 0.45, 0.35) * rim * smoothstep(0.0, 0.3, n.x) * 0.7;
          // a faint scan line as the portrait materialises
          float line = smoothstep(0.012, 0.0, abs(vUv.y - (1.0 - uReveal)));
          col += vec3(0.5, 0.8, 1.0) * line * 2.0 * step(uReveal, 0.999);
          if (vUv.y < 1.0 - uReveal) discard;
          gl_FragColor = vec4(min(col * 0.86, vec3(0.9)), 1.0);
        }`,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 160, 168), mat);
    group.add(mesh);
  });
  scene.add(group);

  const look = new THREE.Vector2();
  return {
    group,
    tick(t, dt, pointer) {
      uniforms.uTime.value = t;
      uniforms.uReveal.value = Math.min(1, uniforms.uReveal.value + dt * 0.55);
      look.set(pointer.x * 2, -pointer.y * 2).clampScalar(-1, 1);
      uniforms.uLook.value.lerp(look, 0.08);
      group.rotation.y = uniforms.uLook.value.x * 0.12;
      group.rotation.x = -uniforms.uLook.value.y * 0.04;
      ring.rotation.z = t * 0.2;
      group.position.y = group.userData.baseY + Math.sin(t * 0.9) * 0.04;
    },
  };
}
