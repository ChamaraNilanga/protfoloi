import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { U, V } from "./helpers";
import { buildSky, SKIES } from "./sky";
import { buildSpace } from "./space";
import { buildCampus, CAMPUS } from "./campus";
import { buildOffices, officeZ, FRONT_X, STREET_X } from "./offices";
import { buildGallery, buildRooftop, frameZ, GALLERY, ROOFTOP } from "./finale";

// ---------- the route ----------
// Each keyframe: [position, look-at, place name]. Runs are continuous
// camera moves inside one location; between runs the camera cuts behind a
// fade. Content anchors (`data-kf`) pin keyframes to the page.

const K = [];
const RUNS = [];
const run = (sky, fade, frames) => {
  RUNS.push({ start: K.length, end: K.length + frames.length - 1, sky, fade });
  frames.forEach((f) => K.push(f));
};

run("space", null, [
  [V(0, 1, 16), V(0, 0.6, 0), "Deep space"],
  [V(0, 6, -88), V(0, -6, -150), "Approaching Earth"],
  [V(34, 8, -122), V(0, -8, -150), "Low Earth orbit"],
  [V(17, 1, -137), V(0, -8, -150), "Entering the atmosphere"],
]);
const cx = CAMPUS.x;
run("dusk", "#dcebff", [
  [V(cx + 14, 34, 50), V(cx, 2, -30), "Katubedda, Moratuwa"],
  [V(cx + 6.5, 2.4, 3), V(cx - 3, 5.5, -36), "University of Moratuwa"],
]);
const officeFrames = [[V(STREET_X + 3.5, 1.7, 14), V(STREET_X, 1.6, -20), "The street"]];
const OFFICE_PLACES = ["Intervest Software", "Hasthiya IT", "Onsys International"];
for (let i = 0; i < 3; i++) {
  const z = officeZ(i);
  const f = FRONT_X;
  const place = OFFICE_PLACES[i];
  officeFrames.push(
    [V(f + 6.5, 1.7, z + 7), V(f, 1.6, z), `Outside ${place}`],
    [V(f + 1.8, 1.65, z + 0.2), V(f - 10, 1.9, z - 0.5), place],
    [V(f - 3.5, 1.75, z + 1.5), V(f - 14, 2.3, z - 0.9), place],
    [V(f - 4, 1.7, z + 0.8), V(f - 3, 1.7, z + 12), place],
    [V(f - 1, 1.7, z), V(f + 10, 1.6, z - 1), place],
    [V(f + 4, 1.7, z - 2), V(f + 7, 1.6, z - 20), "The street"]
  );
}
run("evening", "#05060b", officeFrames);
const gx = GALLERY.x;
run("gallery", "#05060b", [
  [V(gx, 1.75, 3), V(gx, 1.9, -12), "Project gallery"],
  ...[0, 1, 2].map((k) => [V(gx, 1.8, frameZ(k) + 8), V(gx, 2.2, frameZ(k) - 6), "Project gallery"]),
]);
const rx = ROOFTOP.x;
run("night", "#05060b", [
  [V(rx, 1.7, 8), V(rx, 2.5, -40), "Rooftop"],
  [V(rx, 2.2, 4), V(rx, 1, -60), "Rooftop"],
]);

// keyframe indices the page anchors to
export const KF = {
  hero: 0,
  about: 1,
  stack: 2,
  landing: 4,
  education: 5,
  street: 6,
  roles: [9, 15, 21],
  projects: RUNS[3].start,
  pairs: [RUNS[3].start + 1, RUNS[3].start + 2, RUNS[3].start + 3],
  contact: RUNS[4].start,
  form: RUNS[4].start + 1,
};

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVel: { value: 0 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime, uVel; varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5; float r = length(d);
      float ca = 0.0012 + uVel * 0.008;
      vec3 col = vec3(texture2D(tDiffuse, vUv - d * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + d * ca).b);
      col *= mix(1.0, smoothstep(0.9, 0.2, r), 0.45);
      col += (hash(vUv * 1000.0 + fract(uTime) * 100.0) - 0.5) * 0.03;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function createWorld(canvas, data, { onPlace, onFade, onReady } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  let dpr = Math.min(window.devicePixelRatio, window.innerWidth < 800 ? 1.25 : 1.75);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const desktop = window.innerWidth >= 900;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 200, 2000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.4;
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 1000);
  const hemi = new THREE.HemisphereLight(0x9fb2ff, 0x201418, 0.55);
  scene.add(hemi);

  const sky = buildSky(scene);
  const spaceTick = buildSpace(scene, data.skills);
  const campus = buildCampus(scene, data.crest);
  const offices = buildOffices(scene, data.experiences);
  buildGallery(scene, data.projects);
  buildRooftop(scene);
  const runLights = [[], campus.lights, offices.lights, [], []];

  // glass reflects the sky it stands under: one prefiltered sky per location
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(sky.sky.geometry, sky.sky.material));
  const envCache = {};
  const envFor = (ri) => {
    const name = RUNS[ri].sky;
    if (name === "space" || name === "gallery") return envTex;
    if (!envCache[name]) {
      sky.set(SKIES[name], SKIES[name], 0, scene.fog);
      envCache[name] = pmrem.fromScene(envScene, 0.02, 0.1, 1000).texture;
    }
    return envCache[name];
  };

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // ambient occlusion grounds the architecture; outdoors on desktop only
  const gtao = new GTAOPass(scene, camera, 512, 512);
  gtao.updateGtaoMaterial({ radius: 0.8, distanceExponent: 1.4, thickness: 1.2, scale: 1.2, samples: 12 });
  gtao.blendIntensity = 0.9;
  gtao.enabled = false;
  composer.addPass(gtao);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.45, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);

  const curves = RUNS.map((r) => {
    const frames = K.slice(r.start, r.end + 1);
    const pts = frames.length > 1 ? frames : [frames[0], frames[0]];
    return {
      pos: new THREE.CatmullRomCurve3(pts.map((f) => f[0].clone()), false, "centripetal"),
      look: new THREE.CatmullRomCurve3(pts.map((f) => f[1].clone()), false, "centripetal"),
    };
  });
  const runOf = (k) => RUNS.findIndex((r) => k >= r.start && k <= r.end);
  const last = K.length - 1;
  const evalRun = (ri, k, pos, look) => {
    const r = RUNS[ri];
    const u = r.end === r.start ? 0 : (k - r.start) / (r.end - r.start);
    curves[ri].pos.getPoint(Math.min(Math.max(u, 0), 1), pos);
    curves[ri].look.getPoint(Math.min(Math.max(u, 0), 1), look);
  };

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
  const target = () => {
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
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    U.uPixelRatio.value = dpr;
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 64 : 50;
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

  let k = target();
  let place = "";
  let raf = 0;
  let slow = 0;
  let first = true;
  let time = 0;
  let activeRun = -1;
  const clock = new THREE.Clock();
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const dir = new THREE.Vector3();

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
    k += (tgt - k) * (1 - Math.exp(-Math.min(dt, 0.05) * (reduceMotion ? 20 : 3.4)));
    if (Math.abs(tgt - k) < 1e-4) k = tgt;
    const kc = Math.min(Math.max(k, 0), last);
    const i = Math.min(Math.floor(kc), last - 1);
    const f = kc - i;
    let ri = runOf(i);
    let fade = 0;
    let fadeColor = null;
    const cut = runOf(i + 1) !== ri;
    if (cut) {
      fadeColor = RUNS[runOf(i + 1)].fade;
      // push into the fade, then emerge in the next location
      if (f < 0.5) {
        evalRun(ri, i, pos, look);
        dir.subVectors(look, pos).normalize().multiplyScalar(f * 6);
      } else {
        ri = runOf(i + 1);
        evalRun(ri, i + 1, pos, look);
        dir.subVectors(look, pos).normalize().multiplyScalar(-(1 - f) * 6);
      }
      pos.add(dir);
      look.add(dir);
      fade = Math.pow(Math.max(0, 1 - Math.abs(f - 0.5) * 2.6), 0.5);
    } else {
      evalRun(ri, kc, pos, look);
    }
    onFade?.(fade, fadeColor);

    if (ri !== activeRun) {
      activeRun = ri;
      runLights.forEach((ls, j) => ls.forEach((l) => (l.visible = j === ri)));
      const s = SKIES[RUNS[ri].sky];
      sky.set(s, s, 0, scene.fog);
      hemi.intensity = [0.35, 0.6, 0.3, 0.2, 0.5][ri];
      bloom.threshold = ri === 2 || ri === 3 ? 0.95 : 0.82;
      gtao.enabled = desktop && (ri === 1 || ri === 2);
      scene.environment = envFor(ri);
    }

    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    camera.position.copy(pos);
    if (!reduceMotion) {
      const amt = ri === 2 || ri === 3 ? 0.18 : 0.6;
      camera.position.x += pointer.sx * amt;
      camera.position.y -= pointer.sy * amt * 0.6;
    }
    camera.lookAt(look);
    sky.sky.position.copy(camera.position);

    grade.uniforms.uTime.value = time;
    grade.uniforms.uVel.value = Math.min(Math.abs(tgt - k), 0.8) / 0.8;

    const p = K[Math.round(kc)][2];
    if (p !== place) {
      place = p;
      onPlace?.(p);
    }

    if (ri === 0) {
      spaceTick(time);
    }
    if (ri === 2) offices.tick(camera);

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
      Object.values(envCache).forEach((t) => t.dispose());
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
