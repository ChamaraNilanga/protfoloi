import * as THREE from "three";
import { V, C, hdr, canvasTexture, textPlane, glowDisc, loadImage, FONT } from "./helpers";

// An evening street with one office per role. Each office has a glass front,
// sliding doors, a logo wall at the back and a glass partition on the right.
export const STREET_X = 2000;
export const FRONT_X = STREET_X - 6; // facade line, doors face +x
export const officeZ = (i) => -20 - i * 34;

const ROOM = { depth: 14, half: 7, h: 4.6 };
const ACCENTS = [C.cyan, C.violet, C.coral];

function windowTexture(seed, warm) {
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const { tex } = canvasTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = "#10131c";
    ctx.fillRect(0, 0, w, h);
    for (let y = 8; y < h - 8; y += 26) {
      for (let x = 8; x < w - 8; x += 22) {
        const on = rand();
        ctx.fillStyle = on > 0.45 ? (warm ? `rgba(255,${200 + rand() * 40},${140 + rand() * 60},${0.5 + rand() * 0.5})` : `rgba(${170 + rand() * 60},${200 + rand() * 40},255,${0.4 + rand() * 0.5})`) : "#1a1e2a";
        ctx.fillRect(x, y, 16, 18);
      }
    }
  });
  return tex;
}

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
  const floors = 3 + i;
  const height = ROOM.h + floors * 3.4;

  // upper floors
  const wt = windowTexture(11 + i * 7, i !== 1);
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping;
  wt.repeat.set(2, floors / 3);
  const shell = new THREE.MeshStandardMaterial({ color: 0x1a1d26, roughness: 0.6, metalness: 0.4, emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 0.9, map: wt });
  // starts just above the ceiling so its underside never shows through
  const upperH = height - ROOM.h - 0.25;
  const upper = new THREE.Mesh(new THREE.BoxGeometry(ROOM.depth + 2, upperH, ROOM.half * 2 + 2), shell);
  upper.position.set(-ROOM.depth / 2 - 1, ROOM.h + 0.25 + upperH / 2, 0);
  g.add(upper);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(ROOM.depth + 2.2, 0.12, ROOM.half * 2 + 2.2), new THREE.MeshBasicMaterial({ color: hdr(accent, 2.5), toneMapped: false }));
  crown.position.set(-ROOM.depth / 2 - 1, height, 0);
  g.add(crown);

  // ground-floor walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2d36, roughness: 0.8 });
  const interior = new THREE.MeshStandardMaterial({ color: 0xb9b4ac, roughness: 0.9 });
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(ROOM.depth + 2, ROOM.h, 0.3), wallMat);
    side.position.set(-ROOM.depth / 2 - 1, ROOM.h / 2, s * (ROOM.half + 0.85));
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
  sign.position.set(0.25, ROOM.h + 1.2, 0);
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
  const len = 160;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, len), new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.45, metalness: 0.2 }));
  road.rotation.x = -Math.PI / 2;
  road.position.set(STREET_X + 5, 0, -55);
  g.add(road);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, len), new THREE.MeshStandardMaterial({ color: 0x3a3c44, roughness: 0.8 }));
  walk.position.set(FRONT_X + 2, 0.06, -55);
  g.add(walk);
  const walk2 = walk.clone();
  walk2.position.set(STREET_X + 14, 0.06, -55);
  g.add(walk2);
  for (let k = 0; k < 20; k++) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.4), new THREE.MeshBasicMaterial({ color: 0xcfcfcf }));
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(STREET_X + 5, 0.01, 20 - k * 8);
    g.add(dash);
  }
  // street lamps with warm pools
  for (let k = 0; k < 9; k++) {
    const z = 12 - k * 17;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 5.5, 8), new THREE.MeshStandardMaterial({ color: 0x2a2c33, metalness: 0.6 }));
    pole.position.set(FRONT_X + 3.6, 2.75, z);
    g.add(pole);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.3), new THREE.MeshBasicMaterial({ color: hdr("#ffe2b8", 3.5), toneMapped: false }));
    head.position.set(FRONT_X + 3.2, 5.5, z);
    g.add(head);
    const pool = glowDisc("#ffcf94", 3.4, 0.35);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(FRONT_X + 3, 0.14, z);
    g.add(pool);
  }
  // the other side of the street and the skyline
  let seed = 3;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const wt = windowTexture(5, false);
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping;
  const skyline = new THREE.MeshStandardMaterial({ color: 0x151823, map: wt, emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 0.7, roughness: 0.6 });
  for (let k = 0; k < 26; k++) {
    const h = 10 + rand() * 30;
    const w = 8 + rand() * 8;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), skyline);
    const across = k % 2 === 0;
    b.position.set(across ? STREET_X + 22 + rand() * 10 : FRONT_X - 30 - rand() * 30, h / 2, 20 - (k >> 1) * 13 - rand() * 4);
    g.add(b);
  }
  scene.add(g);
}

export function buildOffices(scene, experiences) {
  street(scene);
  // chronological: first job first along the street
  const list = [...experiences].reverse().map((e, i) => office(scene, e, i));
  const moon = new THREE.DirectionalLight(0x9aaaff, 0.6);
  moon.position.set(STREET_X + 40, 50, -20);
  moon.target.position.set(STREET_X, 0, -60);
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
