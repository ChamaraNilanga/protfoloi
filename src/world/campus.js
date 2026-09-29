import * as THREE from "three";
import { V, C, hdr, textPlane, glowDisc, loadImage, SERIF } from "./helpers";
import { facultyBlock, palm, tree, bench, streetLamp, grassTex, paverTex, concreteTex, rand } from "./architecture";

export const CAMPUS = V(1000, 0, 0);

export function buildCampus(scene, crestSrc) {
  const g = new THREE.Group();
  g.position.copy(CAMPUS);

  // lawn, plaza and the approach path
  const grass = grassTex().clone();
  grass.needsUpdate = true;
  grass.repeat.set(40, 40);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: grass, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  g.add(ground);
  const pav = paverTex("#a39b8e").clone();
  pav.needsUpdate = true;
  pav.repeat.set(2, 16);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(6, 64), new THREE.MeshStandardMaterial({ map: pav, roughness: 0.85 }));
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, -2);
  path.receiveShadow = true;
  g.add(path);
  const pav2 = paverTex("#b1a898").clone();
  pav2.needsUpdate = true;
  pav2.repeat.set(12, 3);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(56, 12), new THREE.MeshStandardMaterial({ map: pav2, roughness: 0.85 }));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.025, -29);
  plaza.receiveShadow = true;
  g.add(plaza);

  // the faculty and two neighbouring blocks around the plaza
  const main = facultyBlock({ w: 40, d: 13, floors: 4 });
  main.position.set(0, 0, -42);
  g.add(main);
  const left = facultyBlock({ w: 28, d: 12, floors: 3 });
  left.position.set(-36, 0, -24);
  left.rotation.y = 0.75;
  g.add(left);
  const right = facultyBlock({ w: 26, d: 12, floors: 3 });
  right.position.set(36, 0, -28);
  right.rotation.y = -0.7;
  g.add(right);

  const h = main.userData.height;
  const name = textPlane("UNIVERSITY OF MORATUWA", { size: 110, color: "#3c3328", weight: 600, height: 0.62, glow: 1 });
  name.position.set(0, h + 0.02, -42 + 6.5 + 0.61);
  g.add(name);
  const faculty = textPlane("Faculty of Information Technology", { size: 90, color: "#fff4e6", font: SERIF, weight: 400, height: 0.75, glow: 1.3 });
  faculty.position.set(0, 3.35, -42 + 6.5 + 0.61);
  g.add(faculty);

  // the crest on a board-formed concrete monument
  const monument = new THREE.Group();
  monument.position.set(-8, 0, -16);
  monument.rotation.y = 0.35;
  const conc = concreteTex().clone();
  conc.needsUpdate = true;
  const stone = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.8, 0.9), new THREE.MeshStandardMaterial({ color: 0x8f877c, map: conc, roughness: 0.95 }));
  stone.position.y = 2.4;
  stone.castShadow = stone.receiveShadow = true;
  monument.add(stone);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 1.8), new THREE.MeshStandardMaterial({ color: 0x5f5a53, roughness: 0.9 }));
  plinth.position.y = 0.17;
  plinth.receiveShadow = true;
  monument.add(plinth);
  loadImage(crestSrc).then((img) => {
    if (!img) return;
    const t = new THREE.Texture(img);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    const crest = new THREE.Mesh(new THREE.PlaneGeometry(3.3, (3.3 * img.height) / img.width), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.4, metalness: 0.3, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.25 }));
    crest.position.set(0, 2.55, 0.46);
    monument.add(crest);
  });
  const up = glowDisc("#ffd29a", 3, 0.35);
  up.position.set(0, 2.4, 0.5);
  monument.add(up);
  g.add(monument);

  // hedges along the plaza
  const hedge = new THREE.MeshStandardMaterial({ color: 0x2f5424, roughness: 0.9 });
  for (const x of [-16, 16]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(18, 0.9, 1), hedge);
    b.position.set(x, 0.45, -23.4);
    b.castShadow = b.receiveShadow = true;
    g.add(b);
  }

  // palms along the path, shade trees on the lawns
  [
    [-5, 10, 10, 0.9],
    [5, 6, 11, -0.9],
    [-5, -2, 10.5, 1.1],
    [5, -8, 9.5, -0.8],
    [-24, -6, 11, 0.7],
    [26, -10, 10, -0.9],
    [-30, 8, 9, 0.8],
    [31, 4, 10, -0.7],
  ].forEach(([x, z, hh, l]) => {
    const p = palm(hh, l);
    p.position.set(x, 0, z);
    p.rotation.y = rand() * Math.PI * 2;
    g.add(p);
  });
  [
    [-14, 4],
    [14, 0],
    [-18, -12],
    [19, -16],
    [-42, 2],
    [44, -4],
    [-12, 18],
    [13, 20],
  ].forEach(([x, z]) => {
    const t = tree(1 + rand() * 0.4);
    t.position.set(x, 0, z);
    g.add(t);
  });
  for (const [x, z, r] of [
    [-4.2, 2, Math.PI / 2],
    [4.2, -6, -Math.PI / 2],
    [-10, -27, 0],
    [10, -27, 0],
  ]) {
    const b = bench();
    b.position.set(x, 0, z);
    b.rotation.y = r;
    g.add(b);
  }
  for (let i = 0; i < 5; i++) {
    for (const s of [-1, 1]) {
      const l = streetLamp("#ffd9a8");
      l.position.set(s * 3.6, 0, 16 - i * 9);
      l.rotation.y = s > 0 ? 0 : Math.PI;
      g.add(l);
    }
  }

  const sun = new THREE.DirectionalLight(0xffc48a, 3.2);
  sun.position.set(CAMPUS.x - 70, 32, CAMPUS.z + 10);
  sun.target.position.set(CAMPUS.x, 0, CAMPUS.z - 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 220 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const bounce = new THREE.PointLight(0xffb070, 40, 70);
  bounce.position.set(0, 6, -20);
  g.add(bounce);
  scene.add(g);
  void C;
  void hdr;
  return { lights: [sun] };
}
