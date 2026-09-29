import * as THREE from "three";
import { NOISE, V, hdr, label } from "./helpers";
import dayUrl from "./textures/earth-day.jpg";
import lightsUrl from "./textures/earth-lights.jpg";
import waterUrl from "./textures/earth-water.jpg";

// A photographic Earth for the About section: NASA Blue Marble on the day
// side, Black Marble city lights on the night side, a warm terminator, ocean
// glint, drifting clouds, and a thin atmospheric limb computed per ray.
// Imagery: NASA Visible Earth (public domain), via the three-globe package.

export const EARTH = { center: V(0, -8, -150), r: 22 };

// About-section camera: low over the planet, horizon high in the frame
const c = EARTH.center;
export const ABOUT_VIEW = {
  pos: V(c.x, c.y + 21.1, c.z + 26.5),
  look: V(c.x, c.y + 20.05, c.z + 16.5),
};

// sun from the left and slightly behind: day on the left, night on the right
const SUN = V(-0.9, 0.15, -0.35).normalize();

// Sri Lanka, turned to sit just past the terminator in that view
const HOME = { lat: 7.9, lon: 80.7 };

const loader = new THREE.TextureLoader();
const load = (url, srgb) => {
  const t = loader.load(url);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// three's SphereGeometry maps u=0 to longitude -180 on the -x axis
const local = (lat, lon, r = 1) => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const th = ((90 - lat) / 180) * Math.PI;
  return V(-Math.cos(phi) * Math.sin(th) * r, Math.cos(th) * r, Math.sin(phi) * Math.sin(th) * r);
};

export function buildEarth(scene) {
  const R = EARTH.r;
  const g = new THREE.Group();
  g.position.copy(EARTH.center);

  const shared = {
    uSun: { value: SUN.clone() },
    uCenter: { value: EARTH.center.clone() },
    uR: { value: R },
    uTime: { value: 0 },
  };

  const earthMat = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uDay: { value: load(dayUrl, true) },
      uLights: { value: load(lightsUrl) },
      uWater: { value: load(waterUrl) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vWP;
      void main() {
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWP = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uDay, uLights, uWater; uniform vec3 uSun;
      varying vec2 vUv; varying vec3 vN; varying vec3 vWP;
      void main() {
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vWP);
        float ndl = dot(n, uSun);
        vec3 day = texture2D(uDay, vUv).rgb;
        float water = texture2D(uWater, vUv).r;
        // the mask is stored dim; stretch it back to full range
        float lights = clamp(texture2D(uLights, vUv).r * 3.4, 0.0, 1.0);

        vec3 col = day * (0.012 + 1.5 * max(ndl, 0.0));
        // warm band along the terminator
        float tw = smoothstep(-0.16, 0.0, ndl) * (1.0 - smoothstep(0.0, 0.22, ndl));
        col += vec3(1.0, 0.42, 0.18) * tw * 0.1;
        // sun glint on the oceans
        vec3 h = normalize(uSun + v);
        col += vec3(1.0, 0.86, 0.7) * pow(max(dot(n, h), 0.0), 70.0) * water * 1.1 * smoothstep(-0.05, 0.2, ndl);
        // city lights on the night side
        float night = 1.0 - smoothstep(-0.22, 0.06, ndl);
        col += vec3(1.0, 0.66, 0.3) * pow(lights, 1.3) * 4.5 * night;
        // scattering haze toward the limb
        float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        col = mix(col, vec3(0.32, 0.56, 1.0) * (0.12 + 0.9 * max(ndl + 0.15, 0.0)), fres * 0.65 * smoothstep(-0.35, 0.15, ndl));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 120), earthMat);
  g.add(earth);

  // clouds: domain-warped noise, bright by day, dark (but still blocking the
  // city lights) by night, rosy along the terminator
  const cloudMat = new THREE.ShaderMaterial({
    uniforms: { ...shared },
    vertexShader: /* glsl */ `
      varying vec3 vP; varying vec3 vN;
      void main() { vP = position; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun; uniform float uTime;
      varying vec3 vP; varying vec3 vN;
      ${NOISE}
      void main() {
        vec3 p = normalize(vP);
        vec3 q = p * 2.4 + vec3(uTime * 0.004, 0.0, 0.0);
        vec3 w = vec3(fbm(q + 1.7), fbm(q + 9.2), fbm(q + 4.4));
        float d = fbm(q * 1.6 + w * 1.8);
        // bands: fewer clouds in the subtropics
        float lat = abs(p.y);
        float cover = smoothstep(0.52, 0.72, d) * (0.65 + 0.35 * smoothstep(0.15, 0.45, lat));
        float ndl = dot(normalize(vN), uSun);
        float lit = smoothstep(-0.12, 0.35, ndl);
        float tw = smoothstep(-0.18, 0.0, ndl) * (1.0 - smoothstep(0.0, 0.25, ndl));
        vec3 col = vec3(0.012, 0.014, 0.022) + vec3(1.0) * lit * 1.05 + vec3(1.0, 0.55, 0.45) * tw * 0.5;
        gl_FragColor = vec4(col, cover * 0.9);
      }`,
    transparent: true,
    depthWrite: false,
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.006, 160, 120), cloudMat);
  g.add(clouds);

  // thin atmospheric limb: glow from the ray's closest approach to the planet
  const atmoMat = new THREE.ShaderMaterial({
    uniforms: { ...shared },
    vertexShader: /* glsl */ `
      varying vec3 vWP;
      void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun, uCenter; uniform float uR;
      varying vec3 vWP;
      void main() {
        vec3 rd = normalize(vWP - cameraPosition);
        vec3 oc = uCenter - cameraPosition;
        float t = dot(oc, rd);
        vec3 p = cameraPosition + rd * t;
        float hgt = length(p - uCenter) - uR;
        float H = uR * 0.012;
        float glow = hgt > 0.0 ? exp(-hgt / H) : exp(hgt / (H * 0.35)) * 0.6;
        float sunF = smoothstep(-0.35, 0.4, dot(normalize(p - uCenter), uSun));
        vec3 col = mix(vec3(0.18, 0.4, 1.0), vec3(0.62, 0.82, 1.0), exp(-max(hgt, 0.0) / (H * 0.4)));
        gl_FragColor = vec4(col * glow * (0.08 + 1.6 * sunF), 1.0);
      }`,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 160, 120), atmoMat));

  // turn the planet so Sri Lanka faces the About camera, just into the night
  // aim at the surface point seen in the lower right of the About view
  const ray = new THREE.Ray(ABOUT_VIEW.pos.clone(), V(0.2, -0.47, -1).normalize());
  const hit = ray.intersectSphere(new THREE.Sphere(EARTH.center, R), new THREE.Vector3());
  const target = (hit ?? ABOUT_VIEW.pos).clone().sub(EARTH.center).normalize();
  const home = local(HOME.lat, HOME.lon);
  const spin = new THREE.Quaternion().setFromUnitVectors(home, target);
  earth.quaternion.copy(spin);
  clouds.quaternion.copy(spin);

  // a small beacon on home
  const beacon = new THREE.Group();
  beacon.position.copy(local(HOME.lat, HOME.lon, R * 1.002).applyQuaternion(spin));
  beacon.lookAt(beacon.position.clone().multiplyScalar(2));
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), new THREE.MeshBasicMaterial({ color: hdr("#ffd9a0", 5), toneMapped: false }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 48), new THREE.MeshBasicMaterial({ color: hdr("#ffd9a0", 3), transparent: true, toneMapped: false, depthWrite: false }));
  beacon.add(dot, ring);
  const tag = label("Sri Lanka", { sub: "home", height: 0.55 });
  tag.position.set(0, 0, 0.9);
  beacon.add(tag);
  g.add(beacon);

  scene.add(g);
  return {
    group: g,
    tick(t) {
      shared.uTime.value = t;
      clouds.rotateOnAxis(V(0, 1, 0), 0.00004);
      const s = 1 + ((t * 0.6) % 1) * 3;
      ring.scale.set(s, s, s);
      ring.material.opacity = 1 - ((t * 0.6) % 1);
    },
  };
}
