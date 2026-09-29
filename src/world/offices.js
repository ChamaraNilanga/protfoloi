import * as THREE from "three";
import { V, C, hdr, canvasTexture, textPlane, glowDisc, loadImage, FONT } from "./helpers";
import { curtainTower, metalMat, concreteTex, asphaltTex, paverTex, streetLamp, planter, bench, bollard, rand } from "./architecture";

// An evening street with one office per role. Each office has a glass front,
// sliding doors, a logo wall at the back and a glass partition on the right.
export const STREET_X = 2000;
export const FRONT_X = STREET_X - 6; // facade line, doors face +x
export const officeZ = (i) => -20 - i * 34;

const ROOM = { depth: 14, half: 7, h: 4.6 };
const ACCENTS = [C.cyan, C.violet, C.coral];

function codeTexture(accent) {
  return canvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = "#0b0e18";
    ctx.fillRect(0, 0, w, h);
    const lines = 14;
    for (let i = 0; i < lines; i++) {
      const indent = [0, 1, 2, 2, 1, 2, 3, 3, 2, 1, 0, 1, 2, 1][i] * 26;
      let x = 20 + indent;
      const parts = 1 + (i % 3);
      for (let k = 0; k < parts; k++) {
        const len = 30 + ((i * 37 + k * 53) % 110);
        ctx.fillStyle = k === 0 ? accent : k === 1 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)";
        ctx.fillRect(x, 20 + i * 21, len, 9);
        x += len + 12;
      }
    }
  }).tex;
}

function office(scene, exp, i) {
  const z0 = officeZ(i);
  const accent = ACCENTS[i % ACCENTS.length];
  const g = new THREE.Group();
  g.position.set(FRONT_X, 0, z0); // local +x is the street, -x goes into the room
  // the tower above the ground-floor office: curtain wall, lit floors, roof plant
  const tower = curtainTower({ w: ROOM.depth + 2, d: ROOM.half * 2 + 2, h: 16 + i * 7, tint: ["#7d93b3", "#8a8fb8", "#94a3b8"][i], warm: i !== 1, crown: accent });
  tower.position.set(-ROOM.depth / 2 - 1, ROOM.h + 0.25, 0);
  g.add(tower);

  // glass entrance canopy with a lit soffit
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 7), metalMat(0x1d2027));
  canopy.position.set(1.2, 3.6, 0);
  canopy.castShadow = true;
  g.add(canopy);
  const soffit = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 6.8), new THREE.MeshBasicMaterial({ color: hdr("#fff1dc", 1.2), toneMapped: false }));
  soffit.rotation.x = Math.PI / 2;
  soffit.position.set(1.2, 3.5, 0);
  g.add(soffit);
  for (const z of [-3.3, 3.3]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), metalMat(0x1d2027));
    rod.position.set(2.2, 4.2, z);
    rod.rotation.z = 0.9;
    g.add(rod);
  }

  // ground-floor walls
  const cladTex = concreteTex().clone();
  cladTex.needsUpdate = true;
  cladTex.repeat.set(3, 1);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x5d5a57, map: cladTex, roughness: 0.75 });
  const interior = new THREE.MeshStandardMaterial({ color: 0xb9b4ac, roughness: 0.9 });
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(ROOM.depth + 2, ROOM.h, 0.3), wallMat);
    side.position.set(-ROOM.depth / 2 - 1, ROOM.h / 2, s * (ROOM.half + 0.85));
    side.castShadow = side.receiveShadow = true;
    g.add(side);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM.h), interior);
    inner.position.set(-ROOM.depth / 2, ROOM.h / 2, s * ROOM.half);
    inner.rotation.y = s > 0 ? Math.PI : 0;
    g.add(inner);
  }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.half * 2, ROOM.h), new THREE.MeshStandardMaterial({ color: 0x1c1f28, roughness: 0.7 }));
  back.position.set(-ROOM.depth, ROOM.h / 2, 0);
  back.rotation.y = Math.PI / 2;
  g.add(back);

  // floor and ceiling
  const { tex: wood } = canvasTexture(512, 512, (ctx, w, h) => {
    for (let y = 0; y < h; y += 32) {
      ctx.fillStyle = `hsl(28, ${30 + Math.random() * 10}%, ${34 + Math.random() * 8}%)`;
      ctx.fillRect(0, y, w, 32);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, y, w, 2);
      ctx.fillRect(Math.random() * w, y, 2, 32);
    }
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM.half * 2), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.35, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(-ROOM.depth / 2, 0.01, 0);
  g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM.half * 2), new THREE.MeshStandardMaterial({ color: 0x9a978f, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(-ROOM.depth / 2, ROOM.h, 0);
  g.add(ceil);
  for (let k = 0; k < 3; k++) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 9), new THREE.MeshBasicMaterial({ color: hdr("#fff6ea", 1.05), toneMapped: false }));
    panel.rotation.x = Math.PI / 2;
    panel.position.set(-3 - k * 4, ROOM.h - 0.02, 0);
    g.add(panel);
  }

  // glass storefront with a door opening in the middle
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x9fb4d6, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.18, clearcoat: 1, depthWrite: false });
  const frame = new THREE.MeshStandardMaterial({ color: 0x0e1016, metalness: 0.8, roughness: 0.3 });
  const DOOR = 1.4;
  for (const s of [-1, 1]) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.half + 0.85 - DOOR, ROOM.h), glass);
    pane.rotation.y = Math.PI / 2;
    pane.position.set(0, ROOM.h / 2, s * (DOOR + (ROOM.half + 0.85 - DOOR) / 2));
    g.add(pane);
    const mull = new THREE.Mesh(new THREE.BoxGeometry(0.14, ROOM.h, 0.14), frame);
    mull.position.set(0, ROOM.h / 2, s * DOOR);
    g.add(mull);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, ROOM.half * 2 + 1.7), frame);
  lintel.position.set(0, 3.15, 0);
  g.add(lintel);
  const doorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, DOOR * 2), new THREE.MeshBasicMaterial({ color: hdr(accent, 4), toneMapped: false }));
  doorGlow.position.set(0.12, 3.0, 0);
  g.add(doorGlow);
  const doors = [-1, 1].map((s) => {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.95, DOOR), new THREE.MeshPhysicalMaterial({ color: 0xbfd0ea, roughness: 0.05, transparent: true, opacity: 0.3, clearcoat: 1, depthWrite: false }));
    d.position.set(0.05, 1.5, s * DOOR * 0.5);
    d.userData.side = s;
    g.add(d);
    return d;
  });
  const mat = glowDisc(accent, 1.6, 0.5);
  mat.rotation.x = -Math.PI / 2;
  mat.position.set(1.2, 0.03, 0);
  g.add(mat);

  // company sign on the facade
  const sign = textPlane(exp.company, { size: 120, weight: 500, height: 0.95, glow: 2 });
  sign.rotation.y = Math.PI / 2;
  sign.scale.setScalar(0.62);
  sign.position.set(2.42, 3.62, 0);
  g.add(sign);

  // logo wall
  const wallGroup = new THREE.Group();
  wallGroup.position.set(-ROOM.depth + 0.05, 2.3, 0);
  wallGroup.rotation.y = Math.PI / 2;
  const halo = glowDisc(accent, 3.2, 0.55);
  halo.position.z = -0.01;
  wallGroup.add(halo);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ color: 0x777777, toneMapped: false }));
  plate.position.y = 0.35;
  wallGroup.add(plate);
  loadImage(exp.img).then((img) => {
    if (!img) return;
    const t = new THREE.Texture(img);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    plate.material = new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
    plate.material.color.setScalar(0.78);
  });
  const wname = textPlane(exp.company, { size: 110, weight: 500, height: 0.42, glow: 1.4 });
  wname.position.set(0, -1.35, 0.01);
  wallGroup.add(wname);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.half * 2 - 1, 0.03), new THREE.MeshBasicMaterial({ color: hdr(accent, 3), toneMapped: false }));
  strip.position.y = -2.1;
  wallGroup.add(strip);
  g.add(wallGroup);

  // frosted glass partition on the right, where the role card sits
  const part = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.6, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide }));
  part.position.set(-7, 1.7, -4.3);
  g.add(part);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(8, 3.2)), new THREE.LineBasicMaterial({ color: hdr(accent, 2), toneMapped: false }));
  edge.position.copy(part.position);
  g.add(edge);
  const etched = textPlane(exp.time, { size: 90, font: FONT, height: 0.32, glow: 0.9, color: "rgba(255,255,255,0.8)" });
  etched.position.set(-3.6, 3.05, -4.28);
  g.add(etched);

  // desks with monitors
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xf1ede6, roughness: 0.5 });
  const code = codeTexture(accent);
  for (const dx of [-4, -8.5]) {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.2), deskMat);
    desk.position.set(dx, 0.76, 4.3);
    g.add(desk);
    for (const lx of [-1.2, 1.2]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.76, 1.1), frame);
      leg.position.set(dx + lx, 0.38, 4.3);
      g.add(leg);
    }
    const mon = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.78, 0.05), frame);
    mon.position.set(dx, 1.35, 4.7);
    g.add(mon);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 0.7), new THREE.MeshBasicMaterial({ map: code, toneMapped: false }));
    scr.position.set(dx, 1.35, 4.67);
    scr.rotation.y = Math.PI;
    g.add(scr);
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.6), new THREE.MeshStandardMaterial({ color: 0x23262f, roughness: 0.6 }));
    chair.position.set(dx, 0.45, 3.3);
    g.add(chair);
  }
  // plant in the corner
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.7, 20), new THREE.MeshStandardMaterial({ color: 0xd8d2c8, roughness: 0.7 }));
  pot.position.set(-12.8, 0.35, 5.8);
  g.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e6b3a, roughness: 0.7 });
  for (let k = 0; k < 7; k++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.2, 12, 10), leafMat);
    leaf.position.set(-12.8 + (Math.random() - 0.5) * 0.6, 1.0 + Math.random() * 0.8, 5.8 + (Math.random() - 0.5) * 0.6);
    g.add(leaf);
  }

  const light = new THREE.PointLight(0xfff0dc, 8, 16);
  light.position.set(-6, 3.8, 0);
  g.add(light);
  scene.add(g);

  return { doors, door: V(FRONT_X, 1.5, z0), light };
}

function street(scene) {
  const g = new THREE.Group();
  const len = 180;
  const asphalt = asphaltTex().clone();
  asphalt.needsUpdate = true;
  asphalt.repeat.set(3, 36);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, len), new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.55, metalness: 0.15, envMapIntensity: 0.6 }));
  road.rotation.x = -Math.PI / 2;
  road.position.set(STREET_X + 5, 0, -60);
  road.receiveShadow = true;
  g.add(road);
  const pav = paverTex("#7c7a76").clone();
  pav.needsUpdate = true;
  pav.repeat.set(1, 40);
  const walkMat = new THREE.MeshStandardMaterial({ map: pav, roughness: 0.8 });
  for (const x of [FRONT_X + 2, STREET_X + 14]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, len), walkMat);
    walk.position.set(x, 0.075, -60);
    walk.receiveShadow = true;
    g.add(walk);
  }
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x9a9894, roughness: 0.8 });
  for (const x of [FRONT_X + 4.05, STREET_X + 11.95]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, len), curbMat);
    curb.position.set(x, 0.1, -60);
    curb.receiveShadow = true;
    g.add(curb);
  }
  const paint = new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.7 });
  for (let k = 0; k < 22; k++) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.4), paint);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(STREET_X + 5, 0.01, 24 - k * 8);
    g.add(dash);
  }
  // zebra crossings between the offices
  for (const z of [-3, -37, -71]) {
    for (let k = 0; k < 8; k++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3), paint);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(STREET_X - 1.2 + k * 1.4 + 0.7, 0.012, z);
      g.add(stripe);
    }
  }
  // lamps, trees, benches and bollards on the office side
  for (let k = 0; k < 10; k++) {
    const z = 16 - k * 17;
    const lamp = streetLamp();
    lamp.position.set(FRONT_X + 3.6, 0.15, z);
    g.add(lamp);
    const pool = glowDisc("#ffcf94", 3.6, 0.3);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(FRONT_X + 2.9, 0.16, z);
    g.add(pool);
    const lamp2 = streetLamp();
    lamp2.position.set(STREET_X + 12.4, 0.15, z - 8);
    lamp2.rotation.y = Math.PI;
    g.add(lamp2);
  }
  for (let k = 0; k < 4; k++) {
    const z = -3 - k * 34;
    const p = planter();
    p.position.set(FRONT_X + 2.4, 0.15, z + 8);
    g.add(p);
    const b = bench();
    b.position.set(FRONT_X + 2.6, 0.15, z + 11.5);
    b.rotation.y = -Math.PI / 2;
    g.add(b);
  }
  for (let i = 0; i < 3; i++) {
    for (const dz of [-2.6, -1.3, 1.3, 2.6]) {
      const b = bollard();
      b.position.set(FRONT_X + 3.7, 0.15, officeZ(i) + dz);
      g.add(b);
    }
  }
  // the skyline: towers across the street and behind the offices
  const tints = ["#7d93b3", "#8a96a8", "#6f86a8", "#9aa7b8", "#7b8fb0"];
  for (let k = 0; k < 18; k++) {
    const across = k % 2 === 0;
    const w = 10 + rand() * 8;
    const d = 10 + rand() * 8;
    const h = 22 + rand() * 50;
    const t = curtainTower({ w, d, h, tint: tints[k % tints.length], warm: rand() > 0.4 });
    const z = 18 - (k >> 1) * 17 - rand() * 4;
    t.position.set(across ? STREET_X + 22 + w / 2 + rand() * 6 : FRONT_X - 26 - w / 2 - rand() * 14, 0, z);
    g.add(t);
  }
  scene.add(g);
}

export function buildOffices(scene, experiences) {
  street(scene);
  // chronological: first job first along the street
  const list = [...experiences].reverse().map((e, i) => office(scene, e, i));
  const moon = new THREE.DirectionalLight(0xa8b4ff, 1.3);
  moon.position.set(STREET_X + 40, 50, -20);
  moon.target.position.set(STREET_X, 0, -60);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 260 });
  moon.shadow.bias = -0.0004;
  moon.shadow.normalBias = 0.04;
  scene.add(moon, moon.target);
  return {
    lights: [moon],
    tick(camera) {
      list.forEach((o) => {
        const d = camera.position.distanceTo(o.door);
        const open = THREE.MathUtils.clamp((6 - d) / 3, 0, 1);
        o.doors.forEach((door) => (door.position.z = door.userData.side * (0.7 + open * 1.25)));
      });
    },
  };
}
