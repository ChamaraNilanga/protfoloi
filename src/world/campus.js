import * as THREE from "three";
import { V, canvasTexture, glowDisc, loadImage } from "./helpers";
import { instances, rand } from "./architecture";

// The University of Moratuwa courtyard: long four-storey blocks facing a lawn,
// terracotta columns, yellow slab edges and brackets, open corridors with pale
// railings, louvred ground floors, and tall rain trees under an overcast sky.
export const CAMPUS = V(1000, 0, 0);

const FLOOR_H = 3.3;
const BAY = 3.6;
const CORRIDOR = 2.6;
const DEPTH = 11;
const COL = {
  terracotta: 0x9a5646,
  yellow: 0xc9b15a,
  cream: 0xe4d8a6,
  rail: 0xd8cc8e,
  slab: 0xd9d0b4,
};

// back wall of the corridor: one bay, one floor per tile
const corridorWallTex = () => {
  const { tex } = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#e1d29a";
    ctx.fillRect(0, 0, w, h);
    // grime toward the floor
    const g = ctx.createLinearGradient(0, h * 0.6, 0, h);
    g.addColorStop(0, "rgba(90,80,50,0)");
    g.addColorStop(1, "rgba(90,80,50,0.25)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // louvred timber door
    ctx.fillStyle = "#5e4a33";
    ctx.fillRect(w * 0.08, h * 0.22, w * 0.28, h * 0.72);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    for (let y = h * 0.26; y < h * 0.9; y += 7) {
      ctx.beginPath();
      ctx.moveTo(w * 0.1, y);
      ctx.lineTo(w * 0.34, y);
      ctx.stroke();
    }
    // barred window
    ctx.fillStyle = "#34342f";
    ctx.fillRect(w * 0.5, h * 0.32, w * 0.4, h * 0.36);
    ctx.fillStyle = "#e8dcaa";
    for (let x = w * 0.5; x < w * 0.9; x += 12) ctx.fillRect(x, h * 0.32, 3, h * 0.36);
    ctx.fillRect(w * 0.5, h * 0.49, w * 0.4, 3);
    // vent blocks above
    ctx.fillStyle = "#b9aa74";
    for (let x = w * 0.5; x < w * 0.9; x += 14) ctx.fillRect(x, h * 0.12, 9, 12);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// ground-floor louvre screens
const louvreTex = () => {
  const { tex } = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#e6dcb0";
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 10) {
      ctx.fillStyle = "rgba(120,105,60,0.45)";
      ctx.fillRect(x, 0, 3, h);
    }
    ctx.fillStyle = "rgba(60,55,40,0.5)";
    ctx.fillRect(0, h * 0.92, w, h * 0.08);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// one long block; local +x faces the courtyard, it runs along z
function block(length, floors) {
  const g = new THREE.Group();
  const H = floors * FLOOR_H;
  const bays = Math.round(length / BAY);
  length = bays * BAY;

  const wallTex = corridorWallTex();
  wallTex.repeat.set(bays, floors);
  const plain = new THREE.MeshStandardMaterial({ color: COL.cream, roughness: 0.95 });
  const mass = new THREE.Mesh(new THREE.BoxGeometry(DEPTH - CORRIDOR, H, length), [
    new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 }),
    plain,
    plain,
    plain,
    plain,
    plain,
  ]);
  mass.position.set(-CORRIDOR - (DEPTH - CORRIDOR) / 2, H / 2, 0);
  mass.castShadow = mass.receiveShadow = true;
  g.add(mass);

  const slabs = [];
  const fascia = [];
  const brackets = [];
  const columns = [];
  const rails = [];
  const balusters = [];
  for (let f = 1; f <= floors; f++) {
    const y = f * FLOOR_H;
    slabs.push([-CORRIDOR / 2 + 0.2, y, 0, CORRIDOR + 0.4, 0.22, length + 0.6]);
    fascia.push([0.32, y - 0.05, 0, 0.26, 0.5, length + 0.8]);
  }
  for (let i = 0; i <= bays; i++) {
    const z = -length / 2 + i * BAY;
    columns.push([0, (H + 0.9) / 2, z, 0.55, H + 0.9, 0.55]);
    for (let f = 1; f <= floors; f++) brackets.push([0.12, f * FLOOR_H - 0.42, z, 0.8, 0.42, 0.75]);
  }
  // railings on the upper corridors
  for (let f = 1; f < floors; f++) {
    const y = f * FLOOR_H;
    rails.push([0.1, y + 1.0, 0, 0.1, 0.1, length], [0.1, y + 0.2, 0, 0.12, 0.16, length]);
    for (let z = -length / 2; z < length / 2; z += 0.16) balusters.push([0.1, y + 0.6, z, 0.035, 0.8, 0.035]);
  }
  // roof parapet
  slabs.push([-DEPTH / 2 + 0.3, H + 0.45, 0, DEPTH + 0.6, 0.9, length + 0.6]);

  g.add(instances(new THREE.MeshStandardMaterial({ color: COL.slab, roughness: 0.9 }), slabs));
  g.add(instances(new THREE.MeshStandardMaterial({ color: COL.yellow, roughness: 0.75 }), fascia));
  g.add(instances(new THREE.MeshStandardMaterial({ color: COL.yellow, roughness: 0.75 }), brackets));
  g.add(instances(new THREE.MeshStandardMaterial({ color: COL.terracotta, roughness: 0.85 }), columns));
  g.add(instances(new THREE.MeshStandardMaterial({ color: COL.rail, roughness: 0.8 }), rails));
  const bal = instances(new THREE.MeshStandardMaterial({ color: COL.rail, roughness: 0.8 }), balusters);
  bal.castShadow = false;
  g.add(bal);

  // louvred screens on the ground floor, set back from the columns
  const lt = louvreTex();
  lt.repeat.set(bays * 2, 1);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(length, FLOOR_H - 0.3), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.9 }));
  screen.rotation.y = Math.PI / 2;
  screen.position.set(-0.9, (FLOOR_H - 0.3) / 2, 0);
  screen.receiveShadow = true;
  g.add(screen);
  return g;
}

// tall rain tree: slender trunk, a few long limbs, airy leaf clusters up high
const leafTex = (() => {
  let t = null;
  return () => {
    if (t) return t;
    t = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const a = rand() * Math.PI * 2;
        const r = Math.pow(rand(), 0.6) * w * 0.46;
        const x = w / 2 + Math.cos(a) * r;
        const y = h / 2 + Math.sin(a) * r * 0.75;
        const shade = 70 + rand() * 90;
        ctx.fillStyle = `rgba(${shade * 0.6 + 25},${shade + 20},${shade * 0.3 + 12},${0.75 + rand() * 0.25})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 3 + rand() * 4, 1.5 + rand() * 2, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }).tex;
    return t;
  };
})();

function rainTree(height) {
  const g = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x4a3b2e, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ map: leafTex(), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.9, transparent: false });
  const trunkPts = [];
  const lean = (rand() - 0.5) * 1.6;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    trunkPts.push(V(Math.sin(t * 2.1) * lean * t, t * height * 0.62, Math.sin(t * 1.4) * lean * 0.4 * t));
  }
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trunkPts), 24, height * 0.018, 8), bark);
  trunk.castShadow = true;
  g.add(trunk);
  const top = trunkPts[trunkPts.length - 1];
  const limbs = 4 + Math.floor(rand() * 3);
  for (let k = 0; k < limbs; k++) {
    const a = (k / limbs) * Math.PI * 2 + rand();
    const reach = height * (0.18 + rand() * 0.16);
    const end = top.clone().add(V(Math.cos(a) * reach, height * (0.22 + rand() * 0.18), Math.sin(a) * reach));
    const mid = top.clone().lerp(end, 0.5).add(V(0, height * 0.04, 0));
    const limb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([top.clone().add(V(0, -1, 0)), mid, end]), 12, height * 0.008, 6), bark);
    limb.castShadow = true;
    g.add(limb);
    // leaf clusters: crossed quads around each limb end
    for (let c = 0; c < 5; c++) {
      const s = 3 + rand() * 3.5;
      const q = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 0.8), leafMat);
      q.position.copy(end).add(V((rand() - 0.5) * 3, (rand() - 0.3) * 2, (rand() - 0.5) * 3));
      q.rotation.set((rand() - 0.5) * 0.6, rand() * Math.PI, (rand() - 0.5) * 0.4);
      g.add(q);
    }
  }
  return g;
}

export function buildCampus(scene, crestSrc) {
  const g = new THREE.Group();
  g.position.copy(CAMPUS);
  const W = 30; // courtyard width between the column lines
  const L = 72;

  // lawn with fallen yellow flowers and worn patches
  const { tex: grass } = canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#6c8a3a";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60000; i++) {
      ctx.fillStyle = `rgba(${70 + rand() * 60},${110 + rand() * 60},${30 + rand() * 30},0.5)`;
      ctx.fillRect(rand() * w, rand() * h, 1.5, 3);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = "rgba(120,100,60,0.22)";
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * h, 20 + rand() * 70, 10 + rand() * 40, rand() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = rand() > 0.3 ? "rgba(230,200,70,0.85)" : "rgba(200,170,60,0.7)";
      ctx.fillRect(rand() * w, rand() * h, 2, 2);
    }
  });
  grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(4, 8);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(W - 6, L), new THREE.MeshStandardMaterial({ map: grass, roughness: 1 }));
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(0, 0.02, -L / 2 + 16);
  lawn.receiveShadow = true;
  g.add(lawn);
  const concrete = new THREE.MeshStandardMaterial({ color: 0xa9a59a, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), concrete);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  g.add(ground);

  // the two long blocks and one across the far end
  const left = block(L, 4);
  left.position.set(-W / 2, 0, -L / 2 + 16);
  g.add(left);
  const right = block(L, 4);
  right.rotation.y = Math.PI;
  right.position.set(W / 2, 0, -L / 2 + 16);
  g.add(right);
  const end = block(W + 22, 4);
  end.rotation.y = -Math.PI / 2;
  end.position.set(0, 0, -L + 16 - 2);
  g.add(end);

  // rain trees across the lawn
  [
    [-11, 8, 21],
    [11, 5, 19],
    [-8, -7, 23],
    [8, -15, 20],
    [-10, -27, 18],
    [5, -34, 22],
    [-5, -47, 19],
    [10, -44, 17],
  ].forEach(([x, z, h]) => {
    const t = rainTree(h);
    t.position.set(x, 0, z);
    t.rotation.y = rand() * Math.PI * 2;
    g.add(t);
  });

  // the crest on a low stone plinth by the path
  const monument = new THREE.Group();
  monument.position.set(-6.5, 0, 1);
  monument.rotation.y = 0.35;
  const stone = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 0.6), new THREE.MeshStandardMaterial({ color: 0x7c7266, roughness: 0.95 }));
  stone.position.y = 1.7;
  stone.castShadow = stone.receiveShadow = true;
  monument.add(stone);
  loadImage(crestSrc).then((img) => {
    if (!img) return;
    const t = new THREE.Texture(img);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    const crest = new THREE.Mesh(new THREE.PlaneGeometry(2.4, (2.4 * img.height) / img.width), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.2 }));
    crest.position.set(0, 1.85, 0.31);
    monument.add(crest);
  });
  const up = glowDisc("#fff2d6", 2, 0.15);
  up.position.set(0, 1.8, 0.35);
  monument.add(up);
  g.add(monument);

  // overcast daylight: bright soft sky fill, a weak high sun for soft shadows
  const sky = new THREE.HemisphereLight(0xf1f3f4, 0x5d5a45, 1.9);
  sky.position.set(CAMPUS.x, 50, CAMPUS.z);
  const sun = new THREE.DirectionalLight(0xfff4e2, 1.1);
  sun.position.set(CAMPUS.x - 30, 60, CAMPUS.z + 20);
  sun.target.position.set(CAMPUS.x, 0, CAMPUS.z - 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 6;
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 200 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  scene.add(sky, sun, sun.target);
  scene.add(g);
  return { lights: [sun, sky] };
}
