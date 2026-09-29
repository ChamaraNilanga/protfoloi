import * as THREE from "three";
import { canvasTexture } from "./helpers";

// Building kit: materials, curtain-wall towers, a tropical-modernist faculty
// block, trees and street furniture. Everything is procedural; realism comes
// from shadows, sky reflections in the glass, and lit interiors behind it.

let seed = 12345;
export const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const cache = {};
const once = (key, make) => cache[key] ?? (cache[key] = make());

// ---------- textures ----------

export const concreteTex = () =>
  once("concrete", () => {
    const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#d9d3c8";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 14000; i++) {
        const v = 180 + rand() * 60;
        ctx.fillStyle = `rgba(${v},${v - 6},${v - 14},0.18)`;
        ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2);
      }
      // rain streaks
      for (let i = 0; i < 40; i++) {
        const x = rand() * w;
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(90,85,78,0.12)");
        g.addColorStop(1, "rgba(90,85,78,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 2 + rand() * 5, h * (0.3 + rand() * 0.7));
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });

// office interiors seen through glass: one cell per bay and floor
export const interiorTex = (warm = true) =>
  once(`interior${warm}`, () => {
    const B = 8;
    const F = 8;
    const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
      const bw = w / B;
      const fh = h / F;
      for (let f = 0; f < F; f++) {
        for (let b = 0; b < B; b++) {
          const x = b * bw;
          const y = f * fh;
          const lit = rand();
          if (lit > 0.42) {
            const g = ctx.createLinearGradient(0, y, 0, y + fh);
            const c = warm ? (rand() > 0.3 ? [255, 226, 180] : [205, 225, 255]) : rand() > 0.35 ? [205, 225, 255] : [255, 226, 180];
            const k = 0.55 + rand() * 0.45;
            g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${k})`);
            g.addColorStop(0.7, `rgba(${c[0] * 0.6},${c[1] * 0.6},${c[2] * 0.6},${k * 0.8})`);
            g.addColorStop(1, `rgba(20,20,24,1)`);
            ctx.fillStyle = g;
            ctx.fillRect(x, y, bw, fh);
            // ceiling light strip and desk silhouettes
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fillRect(x + bw * 0.15, y + 3, bw * 0.7, 3);
            ctx.fillStyle = "rgba(10,10,14,0.85)";
            for (let d = 0; d < 2; d++) ctx.fillRect(x + bw * (0.1 + d * 0.45), y + fh * 0.62, bw * 0.35, fh * 0.12);
            if (rand() > 0.6) ctx.fillRect(x + bw * (0.2 + rand() * 0.5), y + fh * 0.4, bw * 0.08, fh * 0.35);
          } else {
            ctx.fillStyle = `rgb(${10 + rand() * 10},${12 + rand() * 10},${18 + rand() * 12})`;
            ctx.fillRect(x, y, bw, fh);
          }
        }
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });

export const asphaltTex = () =>
  once("asphalt", () => {
    const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#222327";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 30000; i++) {
        const v = 20 + rand() * 50;
        ctx.fillStyle = `rgba(${v},${v},${v + 4},0.5)`;
        ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5);
      }
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.beginPath();
        ctx.ellipse(rand() * w, rand() * h, 20 + rand() * 60, 10 + rand() * 30, rand() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });

export const paverTex = (base = "#8d8a84") =>
  once(`paver${base}`, () => {
    const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#55524d";
      ctx.fillRect(0, 0, w, h);
      const s = 64;
      for (let y = 0; y < h; y += s / 2) {
        const off = (y / (s / 2)) % 2 ? s / 2 : 0;
        for (let x = -s; x < w; x += s) {
          const c = new THREE.Color(base).offsetHSL(0, 0, (rand() - 0.5) * 0.08);
          ctx.fillStyle = `#${c.getHexString()}`;
          ctx.fillRect(x + off + 1.5, y + 1.5, s - 3, s / 2 - 3);
        }
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });

export const grassTex = () =>
  once("grass", () => {
    const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#3f5c2b";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 26000; i++) {
        ctx.fillStyle = `rgba(${45 + rand() * 60},${75 + rand() * 70},${25 + rand() * 30},0.55)`;
        ctx.fillRect(rand() * w, rand() * h, 1.5, 3 + rand() * 3);
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${rand() > 0.5 ? "90,110,50" : "40,60,30"},0.18)`;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, 20 + rand() * 60, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });

// ---------- materials ----------

export const glassMat = (tint = "#7f93b0", opacity = 0.6) =>
  new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tint),
    metalness: 0.9,
    roughness: 0.06,
    envMapIntensity: 1.3,
    transparent: true,
    opacity,
    depthWrite: false,
  });

export const metalMat = (color = 0x2a2f38) => new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.35 });

const unit = new THREE.BoxGeometry(1, 1, 1);
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();

function instances(material, list) {
  const im = new THREE.InstancedMesh(unit, material, list.length);
  list.forEach(([x, y, z, sx, sy, sz], i) => {
    m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sx, sy, sz));
    im.setMatrixAt(i, m4);
  });
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

// ---------- curtain-wall tower ----------

export function curtainTower({ w, d, h, floorH = 3.6, bay = 1.6, tint = "#7f93b0", warm = true, crown = null, frame = 0x2a2f38 }) {
  const g = new THREE.Group();
  const floors = Math.max(1, Math.round(h / floorH));
  h = floors * floorH;

  const inner = interiorTex(warm).clone();
  inner.needsUpdate = true;
  inner.repeat.set(Math.max(1, Math.round(w / bay)) / 8, floors / 8);
  inner.offset.set(rand(), rand());
  const core = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.6, h, d - 0.6),
    new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.9, emissive: 0xffffff, emissiveMap: inner, emissiveIntensity: 0.9 })
  );
  core.position.y = h / 2;
  g.add(core);

  const skin = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat(tint));
  skin.position.y = h / 2;
  skin.renderOrder = 2;
  g.add(skin);

  // mullions on all four faces
  const mull = [];
  const bx = Math.max(2, Math.round(w / bay));
  const bz = Math.max(2, Math.round(d / bay));
  for (let i = 0; i <= bx; i++) {
    const x = -w / 2 + (i * w) / bx;
    mull.push([x, h / 2, d / 2 + 0.05, 0.07, h, 0.14], [x, h / 2, -d / 2 - 0.05, 0.07, h, 0.14]);
  }
  for (let i = 0; i <= bz; i++) {
    const z = -d / 2 + (i * d) / bz;
    mull.push([w / 2 + 0.05, h / 2, z, 0.14, h, 0.07], [-w / 2 - 0.05, h / 2, z, 0.14, h, 0.07]);
  }
  // spandrel bands at every floor
  for (let f = 0; f <= floors; f++) {
    const y = f * floorH;
    mull.push([0, y, d / 2 + 0.06, w + 0.14, 0.42, 0.16], [0, y, -d / 2 - 0.06, w + 0.14, 0.42, 0.16], [w / 2 + 0.06, y, 0, 0.16, 0.42, d + 0.14], [-w / 2 - 0.06, y, 0, 0.16, 0.42, d + 0.14]);
  }
  g.add(instances(metalMat(frame), mull));

  // roof: parapet, plant and a lift overrun
  const roof = [
    [0, h + 0.45, 0, w + 0.3, 0.9, d + 0.3],
    [w * 0.15, h + 1.4, -d * 0.1, w * 0.35, 1.9, d * 0.35],
    [-w * 0.25, h + 0.9, d * 0.2, 1.4, 0.9, 1.4],
    [-w * 0.05, h + 0.9, d * 0.25, 1.4, 0.9, 1.4],
  ];
  g.add(instances(new THREE.MeshStandardMaterial({ color: 0x3b3e45, roughness: 0.8 }), roof));
  if (crown) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w + 0.34, 0.08, d + 0.34), new THREE.MeshBasicMaterial({ color: new THREE.Color(crown).multiplyScalar(2.2), toneMapped: false }));
    c.position.y = h + 0.92;
    g.add(c);
  }
  core.castShadow = true;
  core.receiveShadow = true;
  g.userData.height = h;
  return g;
}

// ---------- tropical-modernist faculty building ----------

export function facultyBlock({ w = 40, d = 13, floors = 4, floorH = 3.8 }) {
  const g = new THREE.Group();
  const conc = concreteTex().clone();
  conc.needsUpdate = true;
  conc.repeat.set(w / 10, 2);
  const concrete = new THREE.MeshStandardMaterial({ color: 0xf1ece3, map: conc, roughness: 0.92 });
  const h = floors * floorH;

  // recessed glazing with lit rooms behind
  const inner = interiorTex(true).clone();
  inner.needsUpdate = true;
  inner.repeat.set(w / 1.8 / 8, floors / 8);
  const core = new THREE.Mesh(new THREE.BoxGeometry(w - 2, h - floorH, d - 2), new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.9, emissive: 0xffffff, emissiveMap: inner, emissiveIntensity: 0.55 }));
  core.position.y = floorH + (h - floorH) / 2;
  g.add(core);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 1.6, h - floorH, d - 1.6), glassMat("#8aa0b8", 0.5));
  glass.position.copy(core.position);
  glass.renderOrder = 2;
  g.add(glass);

  const solid = [];
  // projecting floor slabs and a deep roof slab
  for (let f = 1; f <= floors; f++) solid.push([0, f * floorH, 0, w + 1.2, f === floors ? 0.7 : 0.38, d + 1.2]);
  // columns: open ground floor (pilotis) and structure above
  for (let i = 0; i <= 8; i++) {
    const x = -w / 2 + 0.6 + (i * (w - 1.2)) / 8;
    for (const z of [d / 2 - 0.2, -d / 2 + 0.2]) solid.push([x, h / 2, z, 0.55, h, 0.55]);
  }
  // stair tower with slit windows
  solid.push([w / 2 + 2.4, (h + 2) / 2, 0, 4.2, h + 2, 6]);
  // solid ground-floor walls around the lobby
  solid.push([-w / 4 - 3, floorH / 2, -d / 2 + 1.4, w / 2 - 6, floorH, 0.3], [w / 4 + 3, floorH / 2, -d / 2 + 1.4, w / 2 - 6, floorH, 0.3]);
  const concreteMesh = instances(concrete, solid);
  g.add(concreteMesh);

  // vertical sun-shading fins on the upper floors
  const fins = [];
  for (let f = 1; f < floors; f++) {
    for (let x = -w / 2 + 0.8; x < w / 2 - 0.6; x += 1.1) fins.push([x, f * floorH + floorH / 2, d / 2 + 0.35, 0.12, floorH - 0.4, 0.75]);
  }
  g.add(instances(new THREE.MeshStandardMaterial({ color: 0xc9b89c, roughness: 0.7 }), fins));

  // glass lobby on the ground floor
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(12, floorH - 0.4, 0.12), glassMat("#b8c8d8", 0.35));
  lobby.position.set(0, (floorH - 0.4) / 2, d / 2 - 1.2);
  g.add(lobby);
  const lobbyGlow = new THREE.Mesh(new THREE.PlaneGeometry(12, floorH - 0.4), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd9a8").multiplyScalar(0.8), toneMapped: false }));
  lobbyGlow.position.set(0, (floorH - 0.4) / 2, d / 2 - 2.6);
  g.add(lobbyGlow);

  // raised roof canopy on slender posts
  const canopy = [[0, h + 2.6, 0, w * 0.7, 0.25, d * 0.8]];
  for (const x of [-w * 0.33, 0, w * 0.33]) for (const z of [-d * 0.35, d * 0.35]) canopy.push([x, h + 1.3, z, 0.18, 2.6, 0.18]);
  g.add(instances(concrete, canopy));

  core.castShadow = true;
  g.userData.height = h;
  return g;
}

// ---------- vegetation ----------

const frondTex = () =>
  once("frond", () => {
    const { tex } = canvasTexture(128, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "#5b6b2c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      for (let y = 10; y < h - 6; y += 9) {
        const len = (w / 2 - 4) * Math.sin((y / h) * Math.PI) + 8;
        const shade = 60 + rand() * 40;
        ctx.strokeStyle = `rgb(${shade * 0.55},${shade + 30},${shade * 0.4})`;
        ctx.lineWidth = 4;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(w / 2, y);
          ctx.quadraticCurveTo(w / 2 + s * len * 0.6, y + 6, w / 2 + s * len, y + 18);
          ctx.stroke();
        }
      }
    });
    return tex;
  });

export function palm(height = 10, lean = 0.8) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push(new THREE.Vector3(Math.sin(t * 1.3) * lean, t * height, 0));
  }
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: 1 }));
  trunk.castShadow = true;
  g.add(trunk);
  const top = pts[pts.length - 1];
  const leaf = new THREE.PlaneGeometry(1.3, 4.2, 1, 10);
  const pos = leaf.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) + 2.1;
    pos.setZ(i, -Math.pow(y / 4.2, 1.8) * 2.2);
    pos.setY(i, y);
  }
  leaf.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: frondTex(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 });
  for (let k = 0; k < 14; k++) {
    const f = new THREE.Mesh(leaf, mat);
    f.position.copy(top);
    f.rotation.set(-0.35 - (k % 3) * 0.35, (k / 14) * Math.PI * 2 + rand() * 0.3, 0, "YXZ");
    f.castShadow = true;
    g.add(f);
  }
  return g;
}

const leafMats = [0x2f5a24, 0x3b6a2a, 0x28491f, 0x4a7430].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true }));

export function tree(scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.26 * scale, 3.2 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 1 }));
  trunk.position.y = 1.6 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  const blobs = 7;
  for (let i = 0; i < blobs; i++) {
    const geo = new THREE.IcosahedronGeometry((0.9 + rand() * 0.8) * scale, 1);
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const n = 0.82 + rand() * 0.3;
      p.setXYZ(k, p.getX(k) * n, p.getY(k) * n, p.getZ(k) * n);
    }
    geo.computeVertexNormals();
    const b = new THREE.Mesh(geo, leafMats[i % leafMats.length]);
    const a = (i / blobs) * Math.PI * 2;
    b.position.set(Math.cos(a) * 0.9 * scale * rand(), (3.4 + rand() * 1.6) * scale, Math.sin(a) * 0.9 * scale * rand());
    b.castShadow = true;
    g.add(b);
  }
  return g;
}

// ---------- street furniture ----------

export function bench() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a5a3e, roughness: 0.7 });
  const iron = metalMat(0x1c1e22);
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.1), wood);
    slat.position.set(0, 0.45, -0.2 + i * 0.13);
    g.add(slat);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.05), wood);
  back.position.set(0, 0.72, -0.28);
  back.rotation.x = -0.15;
  g.add(back);
  for (const x of [-0.8, 0.8]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.5), iron);
    leg.position.set(x, 0.22, -0.05);
    g.add(leg);
  }
  g.traverse((o) => (o.castShadow = true));
  return g;
}

export function streetLamp(color = "#ffe2b8") {
  const g = new THREE.Group();
  const iron = metalMat(0x24262b);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 6, 10), iron);
  pole.position.y = 3;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 6, 16, Math.PI / 2), iron);
  arm.position.set(-0.6, 6, 0);
  g.add(arm);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.26), iron);
  head.position.set(-0.75, 6.55, 0);
  g.add(head);
  const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(4), toneMapped: false }));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(-0.75, 6.48, 0);
  g.add(lens);
  pole.castShadow = true;
  return g;
}

export function planter(withTree = true) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x6d6a64, roughness: 0.9 }));
  box.position.y = 0.3;
  box.castShadow = box.receiveShadow = true;
  g.add(box);
  if (withTree) {
    const t = tree(0.7);
    t.position.y = 0.5;
    g.add(t);
  }
  return g;
}

export function bollard() {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.9, 12), metalMat(0x2a2c31));
  b.position.y = 0.45;
  b.castShadow = true;
  return b;
}

export const shadowAll = (obj) =>
  obj.traverse((o) => {
    if (o.isMesh && !o.material.transparent) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
