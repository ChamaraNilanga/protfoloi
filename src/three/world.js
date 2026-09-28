import * as THREE from "three";

// Scroll-driven camera journey: laptop -> through the screen -> code tunnel ->
// CPU core (skills) -> circuit-board city (experience) -> server corridor
// (projects) -> network globe (contact).
//
// Any element with a `data-kf="n"` attribute pins keyframe n to the moment that
// element is centred in the viewport, so the 3D path stays in sync with content.

const COLORS = {
  bg: 0x0a0d13,
  amber: 0xffb547,
  cyan: 0x62d5e8,
  steel: 0x1b2230,
  board: 0x0d1a1c,
};

// [camera position, look-at target]
const KEYFRAMES = [
  [[2.6, 2.3, 6.2], [-2.4, 0.7, -0.5]], // 0 hero: laptop on the desk
  [[0, 1.5, 3.2], [0, 1.1, -0.9]], // 1 approach the screen
  [[0, 1.12, -0.6], [0, 1.12, -6]], // 2 at the glass
  [[0, 1.2, -30], [0, 1.2, -45]], // 3 inside: code tunnel
  [[0.5, 1.0, -50], [0, 1.2, -64]], // 4 about
  [[5, 2.5, -70], [0, 0.3, -80]], // 5 CPU core
  [[-4.5, 4, -86], [0, 0.3, -80]], // 6 orbit the core
  [[0, 7, -98], [0, 1, -118]], // 7 circuit city overview
  [[2, 2.2, -110], [-3.5, 3, -116]], // 8 tower 1
  [[-2, 2.2, -124], [3.5, 3, -130]], // 9 tower 2
  [[2, 2.2, -138], [-3.5, 3, -144]], // 10 tower 3
  [[0, 2, -162], [0, 1.6, -175]], // 11 server corridor
  [[0, 1.9, -180], [0, 0.8, -193]], // 12
  [[0, 1.9, -197], [0, 0.8, -210]], // 13
  [[0, 1.9, -214], [0, 0.8, -227]], // 14
  [[0, 5, -243], [-5, 1.5, -275]], // 15 globe reveal
  [[1, 1.5, -258], [-6.5, 1, -275]], // 16 contact
];

export const ROOMS = [
  { id: "home", path: "~/", from: 0 },
  { id: "about", path: "~/about", from: 3 },
  { id: "stack", path: "~/stack", from: 5 },
  { id: "experience", path: "~/experience", from: 7 },
  { id: "projects", path: "~/projects", from: 11 },
  { id: "contact", path: "~/contact", from: 15 },
];

const FONT_MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const FONT_DISPLAY = '"Bricolage Grotesque", "IBM Plex Sans", system-ui, sans-serif';

function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, ctx, canvas: c };
}

function label(text, { size = 48, color = "#e9e6df", font = FONT_MONO, weight = 500, bg = null, height = 0.5 } = {}) {
  const pad = size * 0.5;
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `${weight} ${size}px ${font}`;
  const w = Math.ceil(probe.measureText(text).width + pad * 2);
  const h = Math.ceil(size * 1.6);
  const { tex } = canvasTexture(w, h, (ctx) => {
    if (bg) {
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(1, 1, w - 2, h - 2, 10);
      ctx.fill();
    }
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, pad, h / 2 + 2);
  });
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set((height * w) / h, height, 1);
  return sprite;
}

function buildLaptop(scene, name) {
  const g = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0x2a3140, metalness: 0.7, roughness: 0.35 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.2), shell);
  base.position.y = 0.06;
  g.add(base);

  // keyboard
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x141922, roughness: 0.8 });
  const keyGeo = new THREE.BoxGeometry(0.17, 0.03, 0.17);
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, 13 * 4);
  const m = new THREE.Matrix4();
  let n = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      m.makeTranslation(-1.26 + c * 0.21, 0.13, -0.75 + r * 0.21);
      keys.setMatrixAt(n++, m);
    }
  }
  g.add(keys);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.01, 0.55), keyMat);
  pad.position.set(0, 0.125, 0.55);
  g.add(pad);

  // screen, hinged at the back edge
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.12, -1.05);
  hinge.rotation.x = -0.12;
  const lid = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 0.08), shell);
  lid.position.y = 1.0;
  hinge.add(lid);

  const { tex } = canvasTexture(1024, 640, (ctx, w, h) => {
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#0c1420");
    grd.addColorStop(1, "#101a1e");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1a2433";
    ctx.fillRect(0, 0, w, 34);
    ["#ff6b5a", "#ffb547", "#5fd18b"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(22 + i * 22, 17, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = `500 20px ${FONT_MONO}`;
    ctx.fillStyle = "#8a93a6";
    ctx.fillText("portfolio — zsh", w / 2 - 80, 23);
    const lines = [
      ["#8a93a6", "$ whoami"],
      ["#e9e6df", name.toLowerCase().replace(/\s+/g, "_")],
      ["#8a93a6", "$ cat role.txt"],
      ["#ffb547", "Software Engineer · Full Stack"],
      ["#8a93a6", "$ ls stack/"],
      ["#62d5e8", "spring-boot  react  node  kubernetes"],
      ["#62d5e8", "postgresql  flutter  keycloak  minio"],
      ["#8a93a6", "$ cd ./inside"],
    ];
    ctx.font = `500 30px ${FONT_MONO}`;
    lines.forEach(([c, t], i) => {
      ctx.fillStyle = c;
      ctx.fillText(t, 48, 100 + i * 56);
    });
    ctx.fillStyle = "#ffb547";
    ctx.fillRect(48 + 30 * 0, 100 + 8 * 56 - 24, 16, 30);
  });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.84), new THREE.MeshBasicMaterial({ map: tex }));
  display.position.set(0, 1.0, 0.045);
  hinge.add(display);
  g.add(hinge);

  // mug
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.2, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: 0xffb547, roughness: 0.5 })
  );
  mug.position.set(2.3, 0.25, 0.2);
  g.add(mug);

  // desk slab
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.2, 5),
    new THREE.MeshStandardMaterial({ color: 0x161b25, roughness: 0.9 })
  );
  desk.position.y = -0.1;
  g.add(desk);

  const glow = new THREE.PointLight(COLORS.cyan, 6, 8);
  glow.position.set(0, 1.4, 0.5);
  g.add(glow);

  scene.add(g);
  const grid = new THREE.GridHelper(60, 60, 0x243044, 0x161d2a);
  grid.position.y = -0.2;
  scene.add(grid);
  return g;
}

function buildTunnel(scene) {
  const g = new THREE.Group();
  const ringGeo = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 9 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 4, Math.sin(a) * 4, 0);
    })
  );
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.LineBasicMaterial({
      color: i % 5 === 0 ? COLORS.amber : COLORS.cyan,
      transparent: true,
      opacity: i % 5 === 0 ? 0.9 : 0.35,
    });
    const ring = new THREE.Line(ringGeo, mat);
    ring.position.set(0, 1.2, -32 - i * 1.4);
    ring.rotation.z = i * 0.06;
    g.add(ring);
  }
  // long rails
  const railMat = new THREE.LineBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.25 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pts = [new THREE.Vector3(Math.cos(a) * 4, 1.2 + Math.sin(a) * 4, -30), new THREE.Vector3(Math.cos(a) * 4, 1.2 + Math.sin(a) * 4, -68)];
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), railMat));
  }
  const snippets = [
    "@RestController",
    "const engineer = new Chamara();",
    "kubectl apply -f deploy.yaml",
    "SELECT * FROM projects;",
    "git push origin main",
    "useEffect(() => ship(), [])",
    "docker compose up -d",
    "app.listen(8080)",
    "public class Portfolio {}",
    "flutter run --release",
    "npm run build",
    "@Transactional",
  ];
  snippets.forEach((s, i) => {
    const sp = label(s, { size: 40, color: i % 3 === 0 ? "#ffb547" : "#62d5e8", height: 0.34 });
    const a = i * 2.4;
    sp.position.set(Math.cos(a) * 2.6, 1.2 + Math.sin(a) * 2.4, -34 - i * 2.8);
    sp.material.opacity = 0.75;
    g.add(sp);
  });
  scene.add(g);
  return g;
}

function buildCore(scene, skills) {
  const g = new THREE.Group();
  g.position.set(0, 0, -80);
  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.4, 3),
    new THREE.MeshStandardMaterial({ color: 0x1a1f29, metalness: 0.6, roughness: 0.4 })
  );
  g.add(chip);
  const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#20170a";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffb547";
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, w - 48, h - 48);
    ctx.fillStyle = "#ffb547";
    ctx.font = `800 96px ${FONT_DISPLAY}`;
    ctx.fillText("CK-24", 70, 250);
    ctx.font = `500 34px ${FONT_MONO}`;
    ctx.fillText("FULL STACK CORE", 72, 320);
    ctx.fillStyle = "#8a6a2c";
    ctx.fillText("LK · 2020—", 72, 380);
  });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: tex }));
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.21;
  g.add(top);

  const pinMat = new THREE.MeshStandardMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.3 });
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.06, 0.4), pinMat, 48);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let n = 0;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 12; i++) {
      const t = -1.3 + i * (2.6 / 11);
      const pos = [new THREE.Vector3(t, 0, 1.7), new THREE.Vector3(t, 0, -1.7), new THREE.Vector3(1.7, 0, t), new THREE.Vector3(-1.7, 0, t)][side];
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), side < 2 ? 0 : Math.PI / 2);
      m.compose(pos, q, new THREE.Vector3(1, 1, 1));
      pins.setMatrixAt(n++, m);
    }
  }
  g.add(pins);

  const light = new THREE.PointLight(COLORS.amber, 12, 14);
  light.position.set(0, 2, 0);
  g.add(light);

  const orbits = [];
  const rings = [
    { r: 4, tilt: 0.25 },
    { r: 5.6, tilt: -0.35 },
  ];
  rings.forEach(({ r, tilt }, ri) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = tilt;
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 6, 128),
      new THREE.MeshBasicMaterial({ color: ri ? COLORS.cyan : COLORS.amber, transparent: true, opacity: 0.5 })
    );
    torus.rotation.x = Math.PI / 2;
    pivot.add(torus);
    const spin = new THREE.Group();
    pivot.add(spin);
    const mine = skills.filter((_, i) => i % 2 === ri);
    mine.forEach((s, i) => {
      const sp = label(s, { size: 44, color: "#e9e6df", bg: "rgba(12,16,24,0.85)", height: 0.42 });
      const a = (i / mine.length) * Math.PI * 2;
      sp.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      spin.add(sp);
    });
    orbits.push({ spin, speed: ri ? -0.12 : 0.18 });
    g.add(pivot);
  });
  scene.add(g);
  return orbits;
}

function buildCity(scene, experiences) {
  const g = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 70),
    new THREE.MeshStandardMaterial({ color: COLORS.board, roughness: 0.9 })
  );
  board.rotation.x = -Math.PI / 2;
  board.position.set(0, 0, -125);
  g.add(board);

  // circuit traces
  const traceMats = [
    new THREE.LineBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.6 }),
    new THREE.LineBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.4 }),
  ];
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    let x = -18 + rand() * 36;
    let z = -92 - rand() * 64;
    const pts = [new THREE.Vector3(x, 0.02, z)];
    for (let s = 0; s < 4; s++) {
      if (s % 2 === 0) z -= 2 + rand() * 6;
      else x += (rand() - 0.5) * 8;
      pts.push(new THREE.Vector3(x, 0.02, z));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), traceMats[i % 2]));
  }

  // low component "buildings"
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x1c2533, metalness: 0.4, roughness: 0.6 });
  const blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), blockMat, 90);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 90; i++) {
    let x = -18 + rand() * 36;
    if (Math.abs(x) < 6) x += Math.sign(x || 1) * 6;
    const h = 0.3 + rand() * 1.6;
    m.compose(
      new THREE.Vector3(x, h / 2, -92 - rand() * 64),
      new THREE.Quaternion(),
      new THREE.Vector3(0.6 + rand() * 1.4, h, 0.6 + rand() * 1.4)
    );
    blocks.setMatrixAt(i, m);
  }
  g.add(blocks);

  // one tower per role
  const towerPos = [
    [-3.5, -116],
    [3.5, -130],
    [-3.5, -144],
  ];
  experiences.slice(0, 3).forEach((exp, i) => {
    const [x, z] = towerPos[i];
    const hgt = 6 - i;
    const { tex } = canvasTexture(128, 256, (ctx, w, h) => {
      ctx.fillStyle = "#121925";
      ctx.fillRect(0, 0, w, h);
      for (let yy = 8; yy < h - 8; yy += 16) {
        for (let xx = 8; xx < w - 8; xx += 20) {
          ctx.fillStyle = rand() > 0.45 ? (i === 0 ? "#ffb547" : "#62d5e8") : "#1d2636";
          ctx.fillRect(xx, yy, 12, 8);
        }
      }
    });
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(2, hgt, 2),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    tower.position.set(x, hgt / 2, z);
    g.add(tower);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 2.2), new THREE.MeshBasicMaterial({ color: i === 0 ? COLORS.amber : COLORS.cyan }));
    cap.position.set(x, hgt + 0.05, z);
    g.add(cap);
    const title = label(exp.company, { size: 46, weight: 700, font: FONT_DISPLAY, color: "#e9e6df", bg: "rgba(12,16,24,0.85)", height: 0.5 });
    title.position.set(x, hgt + 1.0, z);
    g.add(title);
    const time = label(exp.time, { size: 36, color: i === 0 ? "#ffb547" : "#62d5e8", height: 0.3 });
    time.position.set(x, hgt + 0.45, z);
    g.add(time);
  });
  scene.add(g);
  return traceMats;
}

function buildCorridor(scene, projects) {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 80),
    new THREE.MeshStandardMaterial({ color: 0x0e121a, metalness: 0.8, roughness: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.4, -200);
  g.add(floor);

  // server racks + blinking LEDs
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x151b26, metalness: 0.5, roughness: 0.5 });
  const racks = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 5, 2.2), rackMat, 24);
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.05, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff }), 24 * 18);
  const m = new THREE.Matrix4();
  const color = new THREE.Color();
  let li = 0;
  for (let i = 0; i < 24; i++) {
    const side = i % 2 ? 1 : -1;
    const z = -166 - Math.floor(i / 2) * 5.5;
    m.makeTranslation(side * 5.6, 2.1, z);
    racks.setMatrixAt(i, m);
    for (let k = 0; k < 18; k++) {
      m.makeTranslation(side * 4.89, 0.2 + (k % 9) * 0.45, z - 0.5 + Math.floor(k / 9) * 0.9);
      leds.setMatrixAt(li, m);
      leds.setColorAt(li++, color.set(Math.random() > 0.3 ? COLORS.cyan : COLORS.amber));
    }
  }
  g.add(racks, leds);

  const panels = projects.map((p, i) => {
    const { tex, ctx, canvas } = canvasTexture(1024, 640, () => {});
    const paint = (img) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#0f1520";
      ctx.fillRect(0, 0, w, h);
      if (img) {
        const ih = 380;
        const s = Math.max(w / img.width, ih / img.height);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, ih);
        ctx.clip();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(img, (w - img.width * s) / 2, (ih - img.height * s) / 2, img.width * s, img.height * s);
        ctx.restore();
      } else {
        ctx.strokeStyle = "#1f2a3b";
        for (let y = 0; y < 380; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        ctx.fillStyle = i % 2 ? "#62d5e8" : "#ffb547";
        ctx.font = `800 170px ${FONT_DISPLAY}`;
        ctx.globalAlpha = 0.18;
        ctx.fillText(p.title.slice(0, 2).toUpperCase(), 40, 300);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = i % 2 ? "#62d5e8" : "#ffb547";
      ctx.fillRect(0, 380, w, 6);
      ctx.fillStyle = "#e9e6df";
      ctx.font = `800 72px ${FONT_DISPLAY}`;
      ctx.fillText(p.title, 40, 480);
      ctx.fillStyle = "#8a93a6";
      ctx.font = `500 30px ${FONT_MONO}`;
      ctx.fillText(p.tech, 42, 560);
      tex.needsUpdate = true;
    };
    paint(null);
    if (p.img) {
      const img = new Image();
      img.onload = () => paint(img);
      img.src = p.img;
    }
    const side = i % 2 ? 1 : -1;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.125), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    panel.position.set(side * 2.7, 1.7, -176 - i * 8.2);
    panel.rotation.y = -side * 0.55;
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.5, 2.22)),
      new THREE.LineBasicMaterial({ color: i % 2 ? COLORS.cyan : COLORS.amber })
    );
    panel.add(frame);
    g.add(panel);
    return panel;
  });
  scene.add(g);
  return { leds, panels };
}

function buildGlobe(scene) {
  const g = new THREE.Group();
  g.position.set(0, 1, -275);
  const R = 6;
  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(R, 2)),
    new THREE.LineBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.35 })
  );
  g.add(wire);
  const core = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48), new THREE.MeshBasicMaterial({ color: 0x0c131c }));
  g.add(core);

  const toVec = (lat, lon, r = R) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const th = ((lon + 180) * Math.PI) / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  };
  // Colombo, and the places a request might come from
  const home = toVec(6.93, 79.85);
  const cities = [
    [51.5, -0.12],
    [40.7, -74],
    [35.7, 139.7],
    [1.35, 103.8],
    [-33.9, 151.2],
    [25.2, 55.3],
    [52.5, 13.4],
    [37.8, -122.4],
  ].map(([a, b]) => toVec(a, b));

  const dotGeo = new THREE.SphereGeometry(0.08, 10, 10);
  cities.forEach((c) => {
    const d = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: COLORS.cyan }));
    d.position.copy(c);
    g.add(d);
    const mid = c.clone().add(home).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.35);
    const curve = new THREE.QuadraticBezierCurve3(home, mid, c);
    g.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
      new THREE.LineBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.6 })
    ));
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: COLORS.amber }));
  beacon.position.copy(home);
  g.add(beacon);
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.28, 32), new THREE.MeshBasicMaterial({ color: COLORS.amber, transparent: true, side: THREE.DoubleSide }));
  pulse.position.copy(home.clone().multiplyScalar(1.01));
  pulse.lookAt(home.clone().multiplyScalar(2));
  g.add(pulse);
  // face Sri Lanka toward the camera
  const baseY = -Math.atan2(home.x, home.z);
  g.rotation.set(0.15, baseY, 0);
  scene.add(g);
  return { globe: g, pulse, baseY };
}

function buildDust(scene) {
  const count = 2600;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = (Math.random() - 0.3) * 20;
    pos[i * 3 + 2] = 12 - Math.random() * 300;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8fb7d9, size: 0.05, transparent: true, opacity: 0.7 }));
  scene.add(pts);
}

export function createWorld(canvas, data, { onRoom, onFlash, onProgress } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(COLORS.bg, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLORS.bg, 12, 36);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 200);

  scene.add(new THREE.HemisphereLight(0x9fb4d6, 0x0a0d13, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 8, 6);
  scene.add(key);

  buildLaptop(scene, data.name);
  buildTunnel(scene);
  const orbits = buildCore(scene, data.skills);
  const traces = buildCity(scene, data.experiences);
  const { leds } = buildCorridor(scene, data.projects);
  const { globe, pulse, baseY } = buildGlobe(scene);
  buildDust(scene);

  const posCurve = new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => new THREE.Vector3(...k[0])), false, "centripetal");
  const lookCurve = new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => new THREE.Vector3(...k[1])), false, "centripetal");
  const last = KEYFRAMES.length - 1;

  // scrollY -> keyframe index, from the data-kf anchors
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
  const targetKf = () => {
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
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 72 : 55;
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

  let kf = targetKf();
  let room = -1;
  let raf = 0;
  const clock = new THREE.Clock();
  const look = new THREE.Vector3();
  const color = new THREE.Color();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const target = targetKf();
    kf += (target - kf) * (1 - Math.exp(-dt * (reduceMotion ? 20 : 4.5)));
    if (Math.abs(target - kf) < 1e-4) kf = target;

    const u = Math.min(Math.max(kf / last, 0), 1);
    camera.position.copy(posCurve.getPoint(u));
    look.copy(lookCurve.getPoint(u));
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    if (!reduceMotion) {
      camera.position.x += pointer.sx * 0.6;
      camera.position.y -= pointer.sy * 0.4;
    }
    camera.lookAt(look);

    // white-out while passing through the screen glass
    // open the fog up at the end so the whole globe reads
    scene.fog.far = 36 + Math.max(0, kf - 14) * 14;
    onFlash?.(Math.max(0, 1 - Math.abs(kf - 2.45) / 0.55));
    onProgress?.(kf / last);

    let r = 0;
    ROOMS.forEach((rm, i) => {
      if (kf >= rm.from - 0.5) r = i;
    });
    if (r !== room) {
      room = r;
      onRoom?.(r);
    }

    if (!reduceMotion) {
      orbits.forEach((o) => (o.spin.rotation.y = t * o.speed));
      globe.rotation.y = baseY + Math.sin(t * 0.15) * 0.35;
      traces.forEach((m, i) => (m.opacity = 0.35 + 0.3 * Math.sin(t * 2 + i * 1.7)));
      if (Math.floor(t * 6) !== Math.floor((t - dt) * 6)) {
        const i = Math.floor(Math.random() * leds.count);
        leds.setColorAt(i, color.set(Math.random() > 0.5 ? COLORS.cyan : Math.random() > 0.5 ? COLORS.amber : 0x1d2636));
        leds.instanceColor.needsUpdate = true;
      }
      const s = 1 + ((t * 0.8) % 1) * 2.5;
      pulse.scale.set(s, s, s);
      pulse.material.opacity = 1 - ((t * 0.8) % 1);
    }
    renderer.render(scene, camera);
  };
  frame();

  return {
    measure,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      renderer.dispose();
    },
  };
}
