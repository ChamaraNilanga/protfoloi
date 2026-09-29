import * as THREE from "three";
import { V } from "./helpers";
import photoUrl from "./textures/uom-courtyard.jpg";

// The University of Moratuwa courtyard as a photograph with depth.
// The photo is projected onto a surface sculpted to the courtyard's
// perspective (walls receding to the vanishing point, the lawn falling away
// to the far block). From the rest camera it looks exactly like the photo;
// as the camera moves, near columns and lawn shift more than the far block.
export const CAMPUS = V(1000, 0, 0);
export const PHOTO_DIST = 24;

// where the courtyard's lines meet in the photo (uv, v up)
const VANISH = { u: 0.5, v: 0.19 };

export function buildCampus(scene) {
  const g = new THREE.Group();
  g.position.copy(CAMPUS);

  const map = new THREE.TextureLoader().load(photoUrl);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const uniforms = {
    map: { value: map },
    uSize: { value: new THREE.Vector2(40, 22.5) },
    uDist: { value: PHOTO_DIST },
    uVanish: { value: new THREE.Vector2(VANISH.u, VANISH.v) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform vec2 uSize, uVanish; uniform float uDist;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        // disparity: near walls at the sides, near lawn at the bottom, far block in the middle
        float wall = 2.6 * max(0.0, abs(uv.x - uVanish.x) - 0.12);
        float lawn = 5.0 * max(0.0, uVanish.y - uv.y);
        float disp = clamp(max(0.08, max(wall, lawn)), 0.0, 1.0);
        // slide each point along its ray from the rest camera, so the photo
        // is unchanged from there but has real depth everywhere else
        vec3 p = vec3(position.xy * uSize, 0.0);
        vec3 cam = vec3(0.0, 0.0, uDist);
        p = cam + (p - cam) * (1.0 - disp * 0.58);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map; varying vec2 vUv;
      void main() { gl_FragColor = texture2D(map, vUv); }`,
    toneMapped: false,
  });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 240, 136), mat);
  photo.position.set(0, 0, -PHOTO_DIST);
  photo.frustumCulled = false;
  g.add(photo);

  // yellow rain-tree flowers drifting down in front of the lens
  const N = 90;
  const petalMat = new THREE.MeshBasicMaterial({ color: 0xe8c64a, side: THREE.DoubleSide, toneMapped: false, transparent: true, opacity: 0.9 });
  const petals = new THREE.InstancedMesh(new THREE.CircleGeometry(0.035, 6), petalMat, N);
  const seeds = Array.from({ length: N }, () => ({
    x: (Math.random() - 0.5) * 16,
    y: Math.random() * 10,
    z: -3 - Math.random() * 14,
    s: 0.25 + Math.random() * 0.35,
    ph: Math.random() * Math.PI * 2,
  }));
  g.add(petals);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);

  scene.add(g);
  const api = {
    lights: [],
    // cover the view at any aspect, with room for the camera to move
    fit(camera) {
      const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * PHOTO_DIST;
      const h = viewH * Math.max(1.14, (1.14 * camera.aspect) / (16 / 9));
      uniforms.uSize.value.set((h * 16) / 9, h);
    },
    tick(t) {
      seeds.forEach((s, i) => {
        const y = 7 - ((s.y + t * s.s) % 10);
        pos.set(s.x + Math.sin(t * 0.8 + s.ph) * 0.4, y, s.z);
        e.set(t * 1.3 + s.ph, t * 0.9 + s.ph, 0);
        q.setFromEuler(e);
        m.compose(pos, q, one);
        petals.setMatrixAt(i, m);
      });
      petals.instanceMatrix.needsUpdate = true;
    },
  };
  api.tick(0);
  return api;
}
