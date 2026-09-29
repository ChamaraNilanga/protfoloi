import * as THREE from "three";
import { U, NOISE, V, C, hdr, glowPoints, fresnelMaterial, label } from "./helpers";

export const EARTH = { center: V(0, -8, -150), r: 22 };

function buildGalaxy(scene) {
  const N = 42000;
  const p = [];
  const c = [];
  const s = [];
  const inner = new THREE.Color("#ffd2a0");
  const outer = new THREE.Color("#5b73ff");
  const pink = new THREE.Color("#ff5d8f");
  const col = new THREE.Color();
  const R = 110;
  for (let i = 0; i < N; i++) {
    const r = Math.pow(Math.random(), 1.6) * R;
    const branch = ((i % 4) / 4) * Math.PI * 2;
    const spin = r * 0.045;
    const rnd = (k) => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * k * (0.3 + r / R);
    p.push(Math.cos(branch + spin) * r + rnd(14), rnd(4), Math.sin(branch + spin) * r + rnd(14));
    col.copy(inner).lerp(Math.random() > 0.85 ? pink : outer, Math.min(1, r / R * 1.3));
    c.push(col.r, col.g, col.b);
    s.push(0.6 + Math.random() * 2.2 * (1 - r / R) + 0.4);
  }
  const g = glowPoints(p, c, s, { intensity: 1.1, twinkle: 0.15 });
  g.position.set(-40, 20, -420);
  g.rotation.set(0.55, 0.3, 0.25);
  scene.add(g);
  const core = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 24), fresnelMaterial("#ffcf9e", { power: 1.2, strength: 0.5, inner: 0.9 }));
  core.position.copy(g.position);
  scene.add(core);
  return g;
}

function buildEarth(scene) {
  const g = new THREE.Group();
  g.position.copy(EARTH.center);
  const sunDir = V(-0.8, 0.35, 0.5).normalize();
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uSun: { value: sunDir } },
    vertexShader: /* glsl */ `
      varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main() {
        vP = position; vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun; uniform float uTime;
      varying vec3 vP; varying vec3 vN; varying vec3 vV;
      ${NOISE}
      void main() {
        vec3 n = normalize(vP);
        float h = fbm(n * 2.1 + fbm(n * 4.0) * 0.35);
        float land = smoothstep(0.515, 0.535, h);
        vec3 ocean = mix(vec3(0.01, 0.05, 0.16), vec3(0.03, 0.14, 0.32), smoothstep(0.35, 0.52, h));
        vec3 ground = mix(vec3(0.10, 0.20, 0.07), vec3(0.34, 0.28, 0.16), smoothstep(0.55, 0.7, h));
        vec3 col = mix(ocean, ground, land);
        col = mix(col, vec3(0.9), smoothstep(0.78, 0.9, abs(n.y)));
        float day = dot(normalize(vN), uSun);
        float lit = smoothstep(-0.15, 0.35, day);
        col *= 0.05 + lit * 1.2;
        // city lights on the night side
        float cities = step(0.72, noise(n * 90.0)) * land * smoothstep(0.1, -0.2, day);
        col += vec3(1.0, 0.72, 0.4) * cities * 1.6;
        // specular glint on the ocean
        vec3 hv = normalize(uSun + normalize(vV));
        col += vec3(1.0, 0.9, 0.8) * pow(max(dot(normalize(vN), hv), 0.0), 60.0) * (1.0 - land) * 0.6 * lit;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH.r, 128, 96), mat);
  g.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH.r * 1.012, 128, 96),
    new THREE.ShaderMaterial({
      uniforms: { uTime: U.uTime, uSun: { value: sunDir } },
      vertexShader: /* glsl */ `varying vec3 vP; varying vec3 vN; void main() { vP = position; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSun; uniform float uTime; varying vec3 vP; varying vec3 vN;
        ${NOISE}
        void main() {
          vec3 n = normalize(vP);
          float c = smoothstep(0.5, 0.8, fbm(n * 3.2 + vec3(uTime * 0.01, 0.0, 0.0)));
          float lit = smoothstep(-0.2, 0.4, dot(normalize(vN), uSun));
          gl_FragColor = vec4(vec3(1.0) * (0.08 + lit), c * 0.85);
        }`,
      transparent: true,
      depthWrite: false,
    })
  );
  g.add(clouds);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(EARTH.r * 1.08, 96, 64), fresnelMaterial("#5aa8ff", { power: 3.2, strength: 2.2, side: THREE.BackSide })));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(EARTH.r * 1.015, 96, 64), fresnelMaterial("#6fb8ff", { power: 4, strength: 0.9 })));
  scene.add(g);
  return { g, earth, clouds };
}

function buildSatellites(scene, skills) {
  const g = new THREE.Group();
  g.position.copy(EARTH.center);
  const body = new THREE.MeshPhysicalMaterial({ color: 0xc9ccd6, metalness: 1, roughness: 0.25, clearcoat: 1 });
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a2a6a, metalness: 0.6, roughness: 0.3, emissive: new THREE.Color(C.blue), emissiveIntensity: 0.35 });
  const orbits = [
    { r: 29, tilt: 0.35, speed: 0.05 },
    { r: 33, tilt: -0.25, speed: -0.04 },
    { r: 37, tilt: 0.12, speed: 0.03 },
  ];
  const spins = [];
  orbits.forEach((o, oi) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(o.tilt, oi * 0.9, o.tilt * 0.5);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(o.r, 0.03, 6, 256), new THREE.MeshBasicMaterial({ color: hdr(oi === 1 ? C.coral : C.cyan, 1.1), transparent: true, opacity: 0.6, toneMapped: false }));
    ring.rotation.x = Math.PI / 2;
    pivot.add(ring);
    const spin = new THREE.Group();
    pivot.add(spin);
    const mine = skills.filter((_, i) => i % orbits.length === oi);
    mine.forEach((name, i) => {
      const a = (i / mine.length) * Math.PI * 2;
      const sat = new THREE.Group();
      sat.position.set(Math.cos(a) * o.r, 0, Math.sin(a) * o.r);
      sat.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.3), body));
      const panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 0.9), panelMat);
      sat.add(panel);
      const dish = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 24, 1, true), body);
      dish.position.set(0, 0.6, 0);
      sat.add(dish);
      const blink = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: hdr(C.red, 6), toneMapped: false }));
      blink.position.set(1.7, 0, 0);
      sat.add(blink);
      const tag = label(name, { height: 1.1 });
      tag.position.set(0, 1.7, 0);
      sat.add(tag);
      sat.lookAt(0, 0, 0);
      spin.add(sat);
    });
    spins.push({ spin, speed: o.speed });
    g.add(pivot);
  });
  scene.add(g);
  return (t) => spins.forEach((s) => (s.spin.rotation.y = t * s.speed));
}

function buildStars(scene) {
  const p = [];
  const c = [];
  const s = [];
  const col = new THREE.Color();
  for (let i = 0; i < 2500; i++) {
    p.push((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 90, 30 - Math.random() * 200);
    col.set(Math.random() > 0.8 ? C.coral : Math.random() > 0.5 ? C.cyan : C.white);
    c.push(col.r, col.g, col.b);
    s.push(0.15 + Math.random() * 0.5);
  }
  scene.add(glowPoints(p, c, s, { intensity: 0.8 }));
}

export function buildSpace(scene, skills) {
  const galaxy = buildGalaxy(scene);
  const earth = buildEarth(scene);
  const satTick = buildSatellites(scene, skills);
  buildStars(scene);
  return (t) => {
    galaxy.rotation.y = 0.3 + t * 0.01;
    earth.earth.rotation.y = t * 0.02;
    earth.clouds.rotation.y = t * 0.026;
    satTick(t);
  };
}
