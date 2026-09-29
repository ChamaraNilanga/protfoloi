import * as THREE from "three";
import { V, C, hdr, canvasTexture, textPlane, glowDisc, loadImage, SERIF } from "./helpers";

export const CAMPUS = V(1000, 0, 0);

function palm(height, lean, mat, leafMat) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push(V(Math.sin(t * 1.2) * lean, t * height, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.16, 8), mat));
  const top = pts[pts.length - 1];
  // fronds: long drooping leaves
  const leaf = new THREE.PlaneGeometry(0.7, 3.4, 1, 8);
  const pos = leaf.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) + 1.7;
    pos.setZ(i, -Math.pow(y / 3.4, 2) * 1.6);
    pos.setX(i, pos.getX(i) * Math.sin((y / 3.4) * Math.PI) * 1.2);
    pos.setY(i, y);
  }
  leaf.computeVertexNormals();
  for (let k = 0; k < 9; k++) {
    const f = new THREE.Mesh(leaf, leafMat);
    f.position.copy(top);
    f.rotation.set(-0.9 - (k % 2) * 0.3, (k / 9) * Math.PI * 2, 0, "YXZ");
    g.add(f);
  }
  return g;
}

export function buildCampus(scene, crestSrc) {
  const g = new THREE.Group();
  g.position.copy(CAMPUS);

  // lawn and paths
  const { tex: grass } = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#3d5a2a";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(${40 + Math.random() * 60},${70 + Math.random() * 70},${25 + Math.random() * 30},0.5)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 3);
    }
  });
  grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(30, 30);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: grass, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), new THREE.MeshStandardMaterial({ color: 0xb8a58c, roughness: 0.9 }));
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, -4);
  g.add(path);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), path.material);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.02, -30);
  g.add(plaza);

  // faculty building: warm lit window bands at golden hour
  const { tex: facade } = canvasTexture(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#e9e1d4";
    ctx.fillRect(0, 0, w, h);
    for (let f = 0; f < 4; f++) {
      const y = 40 + f * 118;
      ctx.fillStyle = "#2a2622";
      ctx.fillRect(0, y, w, 64);
      for (let x = 10; x < w; x += 42) {
        const on = Math.random();
        ctx.fillStyle = on > 0.35 ? `rgba(255,${190 + Math.random() * 40},${120 + Math.random() * 50},${0.6 + Math.random() * 0.4})` : "#3a3632";
        ctx.fillRect(x, y + 6, 34, 52);
      }
    }
  });
  const bodyMat = new THREE.MeshStandardMaterial({ map: facade, roughness: 0.7, emissive: 0xffffff, emissiveMap: facade, emissiveIntensity: 0.18 });
  const main = new THREE.Mesh(new THREE.BoxGeometry(34, 16, 12), [
    new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xcfc6b6, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xcfc6b6, roughness: 0.8 }),
    bodyMat,
    bodyMat,
  ]);
  main.position.set(0, 8, -42);
  g.add(main);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(12, 11, 22), new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8 }));
  wing.position.set(-22, 5.5, -36);
  g.add(wing);
  const wing2 = wing.clone();
  wing2.position.set(22, 5.5, -36);
  g.add(wing2);
  // glass entrance with a canopy
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 0.2), new THREE.MeshPhysicalMaterial({ color: 0x223040, metalness: 0.2, roughness: 0.05, clearcoat: 1, emissive: new THREE.Color("#ffc890"), emissiveIntensity: 0.35 }));
  lobby.position.set(0, 2.25, -35.9);
  g.add(lobby);
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 5), new THREE.MeshStandardMaterial({ color: 0xf2ede4, roughness: 0.6 }));
  canopy.position.set(0, 4.8, -34);
  g.add(canopy);
  for (const x of [-6.5, 6.5]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.8, 16), canopy.material);
    col.position.set(x, 2.4, -31.8);
    g.add(col);
  }
  const name = textPlane("UNIVERSITY OF MORATUWA", { size: 110, color: "#fff1dc", weight: 600, height: 1.2, glow: 1.5 });
  name.position.set(0, 13.2, -35.95);
  g.add(name);
  const faculty = textPlane("Faculty of Information Technology", { size: 90, color: "#fff4e6", font: SERIF, weight: 400, height: 0.9, glow: 1.4 });
  faculty.position.set(0, 5.6, -31.45);
  g.add(faculty);

  // the crest on a stone monument in front of the building
  const monument = new THREE.Group();
  monument.position.set(-7.5, 0, -18);
  monument.rotation.y = 0.35;
  const stone = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.6, 0.8), new THREE.MeshStandardMaterial({ color: 0x5b5249, roughness: 0.9 }));
  stone.position.y = 2.3;
  monument.add(stone);
  loadImage(crestSrc).then((img) => {
    if (!img) return;
    const t = new THREE.Texture(img);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    const crest = new THREE.Mesh(new THREE.PlaneGeometry(3.3, (3.3 * img.height) / img.width), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
    crest.material.color.setScalar(1.1);
    crest.position.set(0, 2.45, 0.41);
    monument.add(crest);
  });
  const up = glowDisc("#ffd29a", 3, 0.5);
  up.position.set(0, 2.4, 0.5);
  monument.add(up);
  g.add(monument);

  // palms and lamps along the path
  const trunk = new THREE.MeshStandardMaterial({ color: 0x6b5238, roughness: 1 });
  const leaves = new THREE.MeshStandardMaterial({ color: 0x2f5a24, roughness: 0.8, side: THREE.DoubleSide });
  [
    [-9, 6, 9, 0.8],
    [9, 4, 10, -0.9],
    [-12, -10, 11, 1.1],
    [12, -12, 9.5, -0.7],
    [-18, -24, 10, 0.6],
    [18, -22, 11, -1],
    [-28, -6, 9, 0.9],
    [28, -8, 10, -0.8],
  ].forEach(([x, z, h, l]) => {
    const p = palm(h, l, trunk, leaves);
    p.position.set(x, 0, z);
    p.rotation.y = Math.random() * Math.PI;
    g.add(p);
  });
  for (let i = 0; i < 5; i++) {
    for (const x of [-4, 4]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
      pole.position.set(x, 1.7, 14 - i * 9);
      g.add(pole);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: hdr(C.warm, 4), toneMapped: false }));
      bulb.position.set(x, 3.5, 14 - i * 9);
      g.add(bulb);
    }
  }

  const sun = new THREE.DirectionalLight(0xffc48a, 2.2);
  sun.position.set(CAMPUS.x - 60, 25, CAMPUS.z - 120);
  sun.target.position.copy(CAMPUS);
  scene.add(sun, sun.target);
  const fill = new THREE.PointLight(0xffb070, 60, 60);
  fill.position.set(0, 8, -20);
  g.add(fill);
  scene.add(g);
  return { lights: [sun] };
}
