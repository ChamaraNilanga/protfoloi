import * as THREE from "three";
import { V, C, hdr, canvasTexture, textPlane, glowDisc, loadImage, glowPoints } from "./helpers";

export const GALLERY = V(3000, 0, 0);
export const ROOFTOP = V(4000, 0, 0);
export const frameZ = (k) => -10 - k * 9;

export function buildGallery(scene, projects) {
  const g = new THREE.Group();
  g.position.copy(GALLERY);
  const W = 12;
  const H = 6.5;
  const L = 44;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 0.18, metalness: 0.5 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -L / 2 + 4;
  g.add(floor);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1c1c24, roughness: 0.9 });
  for (const s of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(L, H), wallMat);
    wall.rotation.y = -s * Math.PI / 2;
    wall.position.set(s * W / 2, H / 2, -L / 2 + 4);
    g.add(wall);
  }
  const end = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
  end.position.set(0, H / 2, -L + 4);
  g.add(end);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ color: 0x0c0c10 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, -L / 2 + 4);
  g.add(ceil);
  const endTitle = textPlane("Selected work", { size: 120, weight: 400, height: 0.9, glow: 1.3 });
  endTitle.position.set(0, 3.4, -L + 4.02);
  g.add(endTitle);

  // track of light down the middle of the ceiling
  const track = new THREE.Mesh(new THREE.PlaneGeometry(0.12, L - 4), new THREE.MeshBasicMaterial({ color: hdr("#ffffff", 0.6), toneMapped: false }));
  track.rotation.x = Math.PI / 2;
  track.position.set(0, H - 0.01, -L / 2 + 4);
  g.add(track);

  projects.forEach((p, i) => {
    const s = i % 2 ? 1 : -1;
    const k = Math.floor(i / 2);
    const z = frameZ(k);
    const fr = new THREE.Group();
    fr.position.set(s * (W / 2 - 0.06), 2.6, z);
    fr.rotation.y = -s * Math.PI / 2;
    const border = new THREE.Mesh(new THREE.BoxGeometry(4.3, 2.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.6, roughness: 0.3 }));
    fr.add(border);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), new THREE.MeshBasicMaterial({ color: 0x222222, toneMapped: false }));
    art.position.z = 0.06;
    fr.add(art);
    loadImage(p.img).then((img) => {
      if (!img) return;
      const { tex } = canvasTexture(1000, 650, (ctx, w, h) => {
        const sc = Math.max(w / img.width, h / img.height);
        ctx.drawImage(img, (w - img.width * sc) / 2, (h - img.height * sc) / 2, img.width * sc, img.height * sc);
      });
      art.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
      art.material.color.setScalar(0.95);
    });
    const plaque = textPlane(p.title, { size: 100, weight: 500, height: 0.32, glow: 1.2 });
    plaque.position.set(-1.35, -1.85, 0.06);
    fr.add(plaque);
    // spotlight: a soft cone and a pool on the wall
    const pool = glowDisc("#fff1dc", 3, 0.16);
    pool.position.set(0, 0.6, 0.02);
    fr.add(pool);
    g.add(fr);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 3.4, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: hdr("#fff1dc", 0.035), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
    );
    cone.position.set(s * (W / 2 - 1.3), H - 1.7, z);
    cone.rotation.z = s * 0.45;
    g.add(cone);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.3, 12), new THREE.MeshBasicMaterial({ color: hdr("#fff1dc", 3), toneMapped: false }));
    lamp.position.set(s * (W / 2 - 2), H - 0.2, z);
    g.add(lamp);
  });
  const light = new THREE.PointLight(0xfff1dc, 14, 40);
  light.position.set(0, 5, -16);
  g.add(light);
  scene.add(g);
}

export function buildRooftop(scene) {
  const g = new THREE.Group();
  g.position.copy(ROOFTOP);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 22), new THREE.MeshStandardMaterial({ color: 0x22232b, roughness: 0.7 }));
  deck.position.set(0, -0.2, -3);
  g.add(deck);
  // wooden decking strip and benches
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.6 });
  const strip = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 6), wood);
  strip.position.set(0, 0.03, -6);
  g.add(strip);
  for (const x of [-4, 4]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.7), wood);
    bench.position.set(x, 0.45, -7);
    g.add(bench);
  }
  // glass railing at the edge
  const rail = new THREE.Mesh(new THREE.PlaneGeometry(30, 1.1), new THREE.MeshPhysicalMaterial({ color: 0xaac0ff, transparent: true, opacity: 0.12, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide }));
  rail.position.set(0, 0.55, -13.9);
  g.add(rail);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(30, 0.05, 0.08), new THREE.MeshBasicMaterial({ color: hdr(C.cyan, 1.6), toneMapped: false }));
  cap.position.set(0, 1.12, -13.9);
  g.add(cap);
  // string lights
  const bulbs = [];
  const bc = [];
  const bs = [];
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      bulbs.push(-14 + t * 28, 3.4 - Math.sin(t * Math.PI) * 0.8, -2 - k * 4);
      bc.push(1, 0.82, 0.55);
      bs.push(1.3);
    }
  }
  g.add(glowPoints(bulbs, bc, bs, { intensity: 2.2, twinkle: 0.1 }));

  // the city below
  let seed = 9;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const { tex } = canvasTexture(128, 256, (ctx, w, h) => {
    ctx.fillStyle = "#07080d";
    ctx.fillRect(0, 0, w, h);
    for (let y = 4; y < h; y += 10) {
      for (let x = 4; x < w; x += 9) {
        if (rand() > 0.55) {
          ctx.fillStyle = rand() > 0.3 ? "#ffd49a" : "#9fc4ff";
          ctx.globalAlpha = 0.5 + rand() * 0.5;
          ctx.fillRect(x, y, 5, 5);
        }
      }
    }
  });
  const cityMat = new THREE.MeshStandardMaterial({ color: 0x0b0c12, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.2, map: tex });
  const COUNT = 220;
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityMat, COUNT);
  const m = new THREE.Matrix4();
  for (let i = 0; i < COUNT; i++) {
    const a = rand() * Math.PI - Math.PI;
    const r = 30 + rand() * 170;
    const h = 8 + rand() * 40 * (1 - r / 220);
    const w = 5 + rand() * 9;
    m.compose(V(Math.cos(a) * r, -60 + h / 2, -20 + Math.sin(a) * r), new THREE.Quaternion(), V(w, h, w));
    city.setMatrixAt(i, m);
  }
  g.add(city);
  const glow = glowDisc("#ff9a6a", 160, 0.25);
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(0, -58, -80);
  g.add(glow);
  const light = new THREE.PointLight(0xffd6a0, 16, 20);
  light.position.set(0, 3, -4);
  g.add(light);
  scene.add(g);
}
