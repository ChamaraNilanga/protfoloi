import * as THREE from "three";
import { U, NOISE } from "./helpers";

// One camera-following dome, graded per location.
export const SKIES = {
  space: { top: "#02030b", hor: "#0b0d26", bot: "#020309", sun: "#000000", neb: "#5a3cff", neb2: "#ff3d6e", sunDir: [0, 0.2, -1], stars: 1, milky: 1, clouds: 0, fogNear: 200, fogFar: 2000 },
  dusk: { top: "#233f86", hor: "#ffb07a", bot: "#3b2a2e", sun: "#ffd29a", neb: "#ff9a6a", neb2: "#ff7aa0", sunDir: [-0.35, 0.07, -1], stars: 0, milky: 0, clouds: 1, fogNear: 40, fogFar: 220 },
  evening: { top: "#0b1438", hor: "#7c6bc4", bot: "#1b1626", sun: "#ff9ab0", neb: "#9a7bff", neb2: "#ff7a9a", sunDir: [0.4, 0.04, -1], stars: 0.35, milky: 0, clouds: 0.6, fogNear: 30, fogFar: 160 },
  gallery: { top: "#050509", hor: "#0b0b12", bot: "#050509", sun: "#000000", neb: "#000000", neb2: "#000000", sunDir: [0, 0.2, -1], stars: 0, milky: 0, clouds: 0, fogNear: 30, fogFar: 90 },
  night: { top: "#02030c", hor: "#1a1a3c", bot: "#1a1020", sun: "#000000", neb: "#4d6bff", neb2: "#ff4d8a", sunDir: [0, 0.2, -1], stars: 1, milky: 1, clouds: 0, fogNear: 120, fogFar: 700 },
};

for (const k in SKIES) {
  const s = SKIES[k];
  SKIES[k] = {
    ...s,
    top: new THREE.Color(s.top),
    hor: new THREE.Color(s.hor),
    bot: new THREE.Color(s.bot),
    sun: new THREE.Color(s.sun),
    neb: new THREE.Color(s.neb),
    neb2: new THREE.Color(s.neb2),
    sunDir: new THREE.Vector3(...s.sunDir).normalize(),
  };
}

export function buildSky(scene) {
  const uniforms = {
    uTime: U.uTime,
    uTop: { value: new THREE.Color() },
    uHor: { value: new THREE.Color() },
    uBot: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uNeb: { value: new THREE.Color() },
    uNeb2: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 0.2, -1) },
    uStars: { value: 1 },
    uMilky: { value: 1 },
    uClouds: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHor, uBot, uSun, uNeb, uNeb2, uSunDir;
      uniform float uStars, uMilky, uClouds, uTime;
      varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHor, uTop, pow(smoothstep(0.0, 1.0, h), 0.55));
        col = mix(col, uBot, smoothstep(0.0, -0.35, h));

        float s = max(dot(d, uSunDir), 0.0);
        col += uSun * (pow(s, 5.0) * 0.4 + pow(s, 60.0) * 0.6 + pow(s, 1200.0) * 4.0);

        // milky way: a tilted band of dust and light
        vec3 bandN = normalize(vec3(0.35, 1.0, 0.25));
        float bd = dot(d, bandN);
        float band = exp(-bd * bd * 14.0);
        float n1 = fbm(d * 3.0 + fbm(d * 2.0) * 0.8);
        float n2 = fbm(d * 5.5 + vec3(3.1, 1.7, 2.3));
        col += (uNeb * smoothstep(0.35, 0.9, n1) * 0.55 + uNeb2 * smoothstep(0.55, 0.95, n2) * 0.4) * (0.25 + band) * uMilky;
        col += vec3(1.0, 0.92, 0.85) * band * smoothstep(0.4, 0.8, n1) * 0.25 * uMilky;
        col *= 1.0 - band * smoothstep(0.55, 0.75, n2) * 0.5 * uMilky;

        vec3 sp = d * 280.0; vec3 id = floor(sp); float r = hash(id);
        float star = step(0.9965 - band * 0.004 * uMilky, r) * smoothstep(0.45, 0.0, length(fract(sp) - 0.5));
        col += vec3(0.9, 0.93, 1.0) * star * uStars * (0.6 + 0.4 * sin(uTime * 2.3 + r * 60.0)) * smoothstep(-0.05, 0.25, h);

        // soft dusk clouds above the horizon
        if (uClouds > 0.0 && h > -0.02) {
          vec2 cp = d.xz / (h + 0.18) * 1.4 + vec2(uTime * 0.01, 0.0);
          float c = smoothstep(0.5, 0.85, fbm(vec3(cp, 0.0)));
          vec3 lit = mix(uHor * 1.1, uSun * 1.2, pow(s, 3.0));
          col = mix(col, lit, c * uClouds * 0.7 * smoothstep(0.0, 0.08, h) * (1.0 - smoothstep(0.4, 0.8, h)));
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 64, 40), mat);
  sky.renderOrder = -1;
  scene.add(sky);

  const set = (a, b, f, fog) => {
    uniforms.uTop.value.copy(a.top).lerp(b.top, f);
    uniforms.uHor.value.copy(a.hor).lerp(b.hor, f);
    uniforms.uBot.value.copy(a.bot).lerp(b.bot, f);
    uniforms.uSun.value.copy(a.sun).lerp(b.sun, f);
    uniforms.uNeb.value.copy(a.neb).lerp(b.neb, f);
    uniforms.uNeb2.value.copy(a.neb2).lerp(b.neb2, f);
    uniforms.uSunDir.value.copy(a.sunDir).lerp(b.sunDir, f).normalize();
    uniforms.uStars.value = THREE.MathUtils.lerp(a.stars, b.stars, f);
    uniforms.uMilky.value = THREE.MathUtils.lerp(a.milky, b.milky, f);
    uniforms.uClouds.value = THREE.MathUtils.lerp(a.clouds, b.clouds, f);
    fog.color.copy(uniforms.uHor.value).multiplyScalar(0.8);
    fog.near = U.uFogNear.value = THREE.MathUtils.lerp(a.fogNear, b.fogNear, f);
    fog.far = U.uFogFar.value = THREE.MathUtils.lerp(a.fogFar, b.fogFar, f);
  };
  return { sky, set };
}
