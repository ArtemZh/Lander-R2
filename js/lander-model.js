// Процедурна модель Lander R2 (одиниця — мм, вісь Y — вгору, дисплей дивиться на +Z)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const STEP_IDS = ['chassis', 'board', 'display', 'shell', 'audio', 'pack', 'antenna', 'legs', 'pads'];

const WIRE_R = 0.4;                 // 20 AWG ≈ 0.8 мм
const BRASS = 0xc9a227, SOLDER = 0xd9d9d9, GOLD = 0xe0b040;
const brassMat = () => new THREE.MeshStandardMaterial({ color: BRASS, metalness: 1, roughness: 0.28 });
const solderMat = () => new THREE.MeshStandardMaterial({ color: SOLDER, metalness: 1, roughness: 0.35 });
const goldMat = () => new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.3 });
const plastic = (color, roughness = 0.55) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
const metal = (color, roughness = 0.3) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.9 });

const V = (p) => (p instanceof THREE.Vector3 ? p : new THREE.Vector3(...p));

// ---------- дріт зі скругленими згинами ----------
function wirePath(points, closed = false, bend = 1.4) {
  let pts = points.map(V);
  if (closed) { const mid = pts[0].clone().lerp(pts[1], 0.5); pts = [mid, ...pts.slice(1), pts[0], mid]; }
  const path = new THREE.CurvePath();
  let cur = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i], prev = pts[i - 1], next = pts[i + 1];
    const b = Math.min(bend, prev.distanceTo(p) / 2 - 0.01, p.distanceTo(next) / 2 - 0.01);
    const a = p.clone().add(prev.clone().sub(p).setLength(b));
    const c = p.clone().add(next.clone().sub(p).setLength(b));
    path.add(new THREE.LineCurve3(cur, a));
    path.add(new THREE.QuadraticBezierCurve3(a, p, c));
    cur = c;
  }
  path.add(new THREE.LineCurve3(cur, pts[pts.length - 1]));
  return path;
}
function wire(points, closed = false, r = WIRE_R, bend = 1.4) {
  const path = wirePath(points, closed, bend);
  return new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(12, points.length * 10), r, 8, false), brassMat());
}
// Пайка — срібляста крапля у вузлі
function joint(p, r = 0.75) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), solderMat());
  m.position.copy(V(p));
  return m;
}
function box(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof mat === 'number' ? plastic(mat) : mat);
}
function cyl(r, h, mat, seg = 24, rt = r) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, r, h, seg), typeof mat === 'number' ? plastic(mat) : mat);
}
function at(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

// Прямокутна клітка W×H×D від y0, з паяними вузлами по кутах
function cage(w, h, d, y0, opts = {}) {
  const g = new THREE.Group();
  const x = w / 2, z = d / 2, y1 = y0 + h;
  g.add(wire([[-x, y0, -z], [x, y0, -z], [x, y0, z], [-x, y0, z]], true));
  g.add(wire([[-x, y1, -z], [x, y1, -z], [x, y1, z], [-x, y1, z]], true));
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    g.add(wire([[sx * x, y0 - 0.3, sz * z], [sx * x, y1 + 0.3, sz * z]]));
    g.add(joint([sx * x, y0, sz * z])); g.add(joint([sx * x, y1, sz * z]));
  }
  for (const yy of opts.rings || []) g.add(wire([[-x, yy, -z], [x, yy, -z], [x, yy, z], [-x, yy, z]], true));
  return g;
}

// Текстура шовкографії для плати
function silkTexture(w, h, base, lines, opts = {}) {
  const s = 12, c = document.createElement('canvas'); c.width = w * s; c.height = h * s;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, c.width, c.height);
  // доріжки
  x.strokeStyle = opts.trace || 'rgba(255,255,255,0.08)'; x.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    x.beginPath(); const y0 = Math.random() * c.height, x0 = Math.random() * c.width;
    x.moveTo(x0, y0); x.lineTo(x0 + (Math.random() - 0.5) * 200, y0); x.lineTo(x0 + (Math.random() - 0.5) * 200, y0 + (Math.random() - 0.5) * 300); x.stroke();
  }
  x.fillStyle = '#f2f2f2'; x.textAlign = 'center';
  for (const [t, ty, size, bold] of lines) {
    x.font = `${bold ? 'bold ' : ''}${size * s}px Helvetica, Arial, sans-serif`;
    x.fillText(t, c.width / 2, ty * s);
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}
// Плата: коробка з шовкографією на лицьовому боці (+Z), контактні кільця по краях
function pcb(w, h, base, lines, holes = { pitch: 2.54, left: 0, right: 0, margin: 1.4, yOff: 0 }) {
  const g = new THREE.Group();
  const side = new THREE.MeshStandardMaterial({ color: base, roughness: 0.6 });
  const face = new THREE.MeshStandardMaterial({ map: silkTexture(w, h, '#' + base.toString(16).padStart(6, '0'), lines), roughness: 0.55 });
  const back = new THREE.MeshStandardMaterial({ map: silkTexture(w, h, '#' + base.toString(16).padStart(6, '0'), []), roughness: 0.55 });
  g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.6), [side, side, side, side, face, back]));
  const ring = new THREE.TorusGeometry(0.75, 0.22, 6, 14);
  const addHoles = (n, x) => {
    for (let i = 0; i < n; i++) {
      const y = (i - (n - 1) / 2) * holes.pitch + (holes.yOff || 0);
      for (const z of [0.85, -0.85]) { const r = new THREE.Mesh(ring, goldMat()); r.position.set(x, y, z); g.add(r); }
    }
  };
  addHoles(holes.left, -w / 2 + holes.margin); addHoles(holes.right, w / 2 - holes.margin);
  return g;
}
// Ряд штирів 2.54 мм (для дисплея)
function pinRow(n, x0, y, z, dir = 'x') {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const p = cyl(0.32, 9, goldMat(), 8);
    const off = (i - (n - 1) / 2) * 2.54;
    if (dir === 'x') p.position.set(x0 + off, y, z); else p.position.set(x0, y, z + off);
    g.add(p);
    const blk = box(2.4, 2.5, 2.4, 0x111111); blk.position.copy(p.position); blk.position.y += 1.5; g.add(blk);
  }
  return g;
}
// Свічення LED — спрайт з радіальним градієнтом
function glow(color, size) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1);
  s.userData.keepEmissive = true;
  return s;
}
function led0805(color, hex) {
  const g = new THREE.Group();
  const body = box(2, 0.8, 1.25, new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 2.5, roughness: 0.3 }));
  body.userData.keepEmissive = true; g.add(body);
  for (const sx of [-1, 1]) g.add(at(box(0.5, 0.9, 1.3, solderMat()), sx * 1.05, 0, 0));
  const gl = glow(color, 9); g.add(gl);
  const pl = new THREE.PointLight(hex, 25, 45, 2); g.add(pl);
  g.userData.led = { body, glow: gl, light: pl };
  return g;
}
// Колір RGB LED на антені (стан Claude Code)
export function setLedColor(root, hex, v = 1) {
  const l = root?.userData.led; if (!l) return;
  l.body.material.color.set(hex); l.body.material.emissive.set(hex); l.body.material.emissiveIntensity = 0.3 + 2.5 * v;
  l.glow.material.color.set(hex); l.glow.material.opacity = 0.15 + 0.85 * v; l.light.color.set(hex); l.light.intensity = 40 * v;
}
// Резистор 220 Ω з кольоровими смужками
function resistor() {
  const g = new THREE.Group();
  g.add(cyl(0.95, 3.6, plastic(0xd8c39a, 0.5)));
  const bands = [0xff2020, 0xff2020, 0x8b4513, 0xd4a017];
  bands.forEach((c, i) => g.add(at(cyl(1.0, 0.45, plastic(c, 0.5)), 0, 1.2 - i * 0.8, 0)));
  g.add(cyl(0.25, 8, solderMat(), 8));
  return g;
}

const BODY_Y = 35, BODY_H = 60, BODY_W = 30, BODY_D = 32;

// ---------- плати контролера ----------
function controllerBoard(version) {
  const g = new THREE.Group();
  const W = 23, H = 51;
  if (version === 'original') {
    g.add(pcb(W, H, 0x1c3f8f, [['PARTICLE', 8, 2.2, true], ['Photon 2', 12.5, 2.6, true], ['ANT', 3.5, 1.3], ['RST', 38, 1.2], ['MODE', 45, 1.2]], { pitch: 2.54, left: 12, right: 16, margin: 1.4, yOff: -3 }));
    // RF-модуль з металевим екраном
    g.add(at(box(13, 11, 2.2, metal(0xb8bcc2, 0.35)), 0, 8, 1.9));
    // керамічна антена
    g.add(at(box(6, 2, 1.2, plastic(0xf0e8d8, 0.4)), 4, 22.5, 1.4));
    // кнопки RESET / MODE
    for (const y of [-14, -21]) { g.add(at(box(3.5, 3.5, 1.6, metal(0xcfd3d8)), 0, y, 1.6)); g.add(at(cyl(0.9, 1, plastic(0x222222), 12), 0, y, 2.6)); }
    // USB-C
    g.add(at(box(8.9, 3.2, 7.3, metal(0xc8ccd0, 0.3)), 0, -H / 2 + 1.6, 3.2));
    // роз'єм Li-Po (JST-PH)
    g.add(at(box(6, 4.5, 3.5, plastic(0xf5f2e8, 0.6)), -6, -H / 2 + 2.5, 2.8));
    // дрібні компоненти
    for (const [x, y, w, h] of [[-7, -4, 3, 3], [6, -3, 2.5, 4], [7, 14, 2, 2], [-8, 14, 2.2, 2.2], [3, -8, 1.5, 3]])
      g.add(at(box(w, h, 0.9, plastic(0x2a2a2a, 0.4)), x, y, 1.25));
    // зелений LED D0 (0805)
    const gl = led0805('rgba(60,255,90,0.9)', 0x33ff55); gl.position.set(8.5, -9, 1.3); gl.userData.led.light.intensity = 6; g.add(gl);
  } else {
    const isS3 = version === 'touch';
    if (isS3) {
      // Waveshare ESP32-S3-Touch-AMOLED-1.91: 24.5×57.5 мм, дисплей на лицьовому боці, компоненти й гребінки 2×20 — на тильному
      const g2 = new THREE.Group();
      g2.add(pcb(24.5, 57.5, 0x0d0d0d, [['ESP32-S3-Touch-AMOLED-1.91', 6, 1.2, true], ['Waveshare', 9, 1.1]], { pitch: 2.54, left: 20, right: 20, margin: 1.5, yOff: 2 }));
      g2.add(at(box(9, 9, 1.2, metal(0xb8bcc2, 0.35)), 0, 6, 1.7));            // ESP32-S3R8
      g2.add(at(box(11, 9, 1.8, metal(0xc4c8cc, 0.3)), 0, 18, 2.0));            // слот TF
      g2.add(at(box(5, 5, 1, plastic(0x2a2a2a, 0.4)), -6, -6, 1.5));           // W25Q128
      g2.add(at(box(3.5, 3, 1, plastic(0x2a2a2a, 0.4)), 6, -4, 1.4));          // QMI8658 (умовно)
      g2.add(at(box(6, 4.5, 3.5, plastic(0xf5f2e8, 0.6)), 0, -12, 2.8));       // роз'єм BAT
      g2.add(at(box(8.9, 3.2, 7.3, metal(0xc8ccd0, 0.3)), 0, -57.5 / 2 + 1.6, 3.2)); // USB-C
      for (const x of [-9.5, 9.5]) { g2.add(at(box(3.5, 3, 1.6, metal(0xcfd3d8)), x, -24, 1.6)); }  // BOOT / RESET
      g2.add(at(box(6, 2, 1.2, plastic(0xf0e8d8, 0.4)), 8, 26, 1.4));           // керамічна антена
      const gl = led0805('rgba(60,255,90,0.9)', 0x33ff55); gl.position.set(-8, -20, 1.3); gl.userData.led.light.intensity = 4; g2.add(gl);
      g.add(g2); return g;
    }
    g.add(pcb(W, H, 0x101010, [['ESP32-C6', 11, 2.4, true], ['Feather', 14.5, 1.8], ['Wi-Fi 6 / BLE', 40, 1.2]], { pitch: 2.54, left: 12, right: 16, margin: 1.4, yOff: -3 }));
    // великий модуль з екраном + PCB-антена
    g.add(at(box(15.5, 17.5, 2.6, metal(0xc4c8cc, 0.3)), 0, 6, 2.1));
    g.add(at(box(15.5, 5, 0.3, new THREE.MeshStandardMaterial({ color: 0x0c1a10, roughness: 0.4 })), 0, 22, 1.0));
    for (const y of [-14, -21]) { g.add(at(box(3.5, 3.5, 1.6, metal(0xcfd3d8)), 0, y, 1.6)); g.add(at(cyl(0.9, 1, plastic(0x222222), 12), 0, y, 2.6)); }
    g.add(at(box(8.9, 3.2, 7.3, metal(0xc8ccd0, 0.3)), 0, -H / 2 + 1.6, 3.2));
    g.add(at(box(6, 4.5, 3.5, plastic(0xf5f2e8, 0.6)), -6, -H / 2 + 2.5, 2.8));
    g.add(at(box(4, 4, 1, plastic(0x2a2a2a, 0.4)), 7, -6, 1.3));
    g.add(at(box(2.2, 2.2, 1.6, plastic(0xf8f8f8, 0.3)), -7, -8, 1.6)); // NeoPixel
    const gl = led0805('rgba(60,255,90,0.9)', 0x33ff55); gl.position.set(8.5, -12, 1.3); gl.userData.led.light.intensity = 6; g.add(gl);
  }
  return g;
}

// ---------- дисплеї ----------
function displayModule(version, screenTex) {
  const g = new THREE.Group();
  if (version === 'ink') {
    // E-ink 2.13": скляна панель з білою рамкою, жовтий шлейф, чорна плата-драйвер за нею
    g.add(pcb(30, 56, 0x101010, [['E-INK 2.66" 152x296', 53, 1.4, true], ['SSD1680', 55.3, 1.1]], { pitch: 2.54, left: 0, right: 0 }));
    const panel = box(30, 59, 0.9, plastic(0xe9e9e4, 0.35)); panel.position.set(0, 1, 1.3); g.add(panel);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(28, 54.5), new THREE.MeshBasicMaterial({ map: screenTex, color: screenTex ? 0xffffff : 0xdddddd }));
    scr.position.set(0, 1.5, 1.8); scr.userData.isScreen = true; g.add(scr);
    const flex = box(16, 6, 0.25, plastic(0xe6b422, 0.5)); flex.position.set(0, -28, 0.5); flex.rotation.x = 0.35; g.add(flex);
    g.add(at(box(20, 2.5, 3, plastic(0xf2f2ec, 0.6)), 0, -27.5, -2.2)); // FPC-конектор ззаду
  } else {
    const isTouch = version === 'touch';
    if (!isTouch) {
      g.add(pcb(32, 52, 0x0a1e3c, [['adafruit', 3, 2, true], ['1.9" 320x170 IPS TFT', 49, 1.3], ['ST7789', 51, 1.1]], { pitch: 2.54, left: 0, right: 0 }));
      g.add(pinRow(11, 0, -28, 0)); // піни знизу
    }
    // скляна панель
    // скло: у Waveshare — ≈22×47 (активна зона 19.8×44.2 + тонка рамка) на платі 24.5×57.5; у прототипу — 27×48 з зоною 24×45
    const glass = box(isTouch ? 22 : 27, isTouch ? 47 : 48, 1.2, new THREE.MeshPhysicalMaterial({ color: 0x050608, roughness: 0.15, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 }));
    glass.position.set(0, isTouch ? 4.29 : 1, 1.4); g.add(glass);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(isTouch ? 19.8 : 24, isTouch ? 44.22 : 45), new THREE.MeshBasicMaterial({ map: screenTex, color: screenTex ? 0xffffff : 0x000000 }));
    scr.position.set(0, isTouch ? 4.29 : 1, 2.05); scr.userData.isScreen = true; g.add(scr); // Waveshare: активна зона 2.35 мм від верхнього краю плати
    if (isTouch) { const cover = new THREE.Mesh(new THREE.PlaneGeometry(22, 47), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.95, roughness: 0.05, thickness: 0.3, transparent: true, opacity: 0.35 })); cover.position.set(0, 4.29, 2.1); g.add(cover); }
    if (!isTouch) {
      const flex = box(16, 5, 0.25, plastic(0xa7643a, 0.5)); flex.position.set(0, 26.2, 1.0); flex.rotation.x = 0.5; g.add(flex); // шлейф FPC
      g.add(at(box(14, 15, 2, metal(0xc0c4c8, 0.35)), 0, 14, -1.8)); // microSD ззаду
      g.add(at(box(12, 2, 1, plastic(0x111111)), 0, 22.5, -1.3));
      for (const [x, y] of [[-10, -12], [8, -14], [-6, -20]]) g.add(at(box(2.2, 2.2, 0.9, plastic(0x2a2a2a, 0.4)), x, y, -1.25));
    }
  }
  return g;
}

export function buildLander(version, screenCanvas, form = 'v1') {
  const root = new THREE.Group();
  const add = (id, from) => {
    const g = new THREE.Group();
    g.name = id;
    g.userData.home = new THREE.Vector3();
    g.userData.from = new THREE.Vector3(...from);
    g.userData.t = 1;
    root.add(g);
    return g;
  };
  const top = BODY_Y + BODY_H;
  const r2 = version !== 'original';          // наша конструкція: сенсори в тілі, нахил дисплея, ноги-модулі
  const TRAP = r2 && form === 'v2';            // форма v2: каркас-трапеція повторює нахил екрана
  const TILT = TRAP ? -12 * Math.PI / 180 : 0; // v2 — екран нахилений на 12° назад; v1 — вертикальний
  const SH = BODY_H * Math.tan(-TILT);         // на скільки верх передньої грані відходить назад (≈12.8 мм)
  const fz = yy => (TRAP ? 16 - (yy - BODY_Y) / BODY_H * SH : 16); // z передньої грані на висоті yy

  // 1. Шасі — внутрішня рамка (дві драбини + поперечки), тримає плату й дисплей
  const chassis = add('chassis', [0, -60, 0]);
  {
    const x = 11.5, z0 = -9, y0 = BODY_Y + 3, y1 = top - 3, f = yy => fz(yy) - 7; // передня грань шасі — на 7 мм за передньою гранню шкаралупи
    for (const sx of [-1, 1]) {
      chassis.add(wire([[sx * x, y0, z0], [sx * x, y1, z0], [sx * x, y1, f(y1)], [sx * x, y0, f(y0)]], true));
      if (!r2) for (const yy of [y0 + 12, y0 + 27, y0 + 42]) chassis.add(wire([[sx * x, yy, z0], [sx * x, yy, f(yy)]], false, 0.32));
    }
    for (const [yy, zz] of [[y0, z0], [y1, z0], [y0, f(y0)], [y1, f(y1)]]) { chassis.add(wire([[-x, yy, zz], [x, yy, zz]])); chassis.add(joint([-x, yy, zz])); chassis.add(joint([x, yy, zz])); }
    // прототип: стійки до контактів плати; у R2 плата — модуль у передній грані, стійки не потрібні
    if (!r2) for (const sx of [-1, 1]) for (const yy of [y0 + 6, y0 + 20, y0 + 34]) chassis.add(wire([[sx * x, yy, z0], [sx * 10.2, yy, -5.5]], false, 0.3));
  }

  // 2. Плата контролера — стоїть вертикально, компонентами назад, USB униз
  const board = add('board', [-70, 0, 0]);
  const cb = controllerBoard(version);
  if (version === 'touch') {
    // Waveshare-модуль: сама плата і є дисплеєм — стоїть у передній грані під нахилом, компонентами всередину
    const bp = new THREE.Group(); bp.position.set(0, BODY_Y + 4, 14.5); bp.rotation.x = TILT;
    cb.rotation.y = Math.PI; cb.position.set(0, 26, -1.2); bp.add(cb); board.add(bp);
  } else { cb.rotation.y = Math.PI; cb.position.set(0, BODY_Y + 31, r2 ? 5 : -5.5); board.add(cb); }

  // 3. Дисплей — спереду, паралельно платі
  const display = add('display', [0, 0, 70]);
  let screenTex = null;
  if (screenCanvas) {
    screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
  }
  const dm = displayModule(version, screenTex);
  if (r2) {
    // v1 — вертикально врівень із передньою гранню; v2 — вісь по нижньому ребру, верх назад на 12°
    const pivot = new THREE.Group(); pivot.position.set(0, BODY_Y + 4, 14.5); pivot.rotation.x = TILT;
    dm.position.set(0, 26, 0); pivot.add(dm); display.add(pivot);
  } else { dm.position.set(0, BODY_Y + 30, 12); display.add(dm); }

  // 4. Зовнішня шкаралупа
  const shell = add('shell', [0, 80, 0]);
  if (!r2) shell.add(cage(BODY_W, BODY_H, BODY_D, BODY_Y, { rings: [BODY_Y + 20] }));
  else if (!TRAP) {
    // v1: прямокутник; середня перекладина лише на боках і ззаду — передня грань вільна для тач-скріну
    const x = 15, z = 16, zb = -16, ym = BODY_Y + 20;
    shell.add(cage(BODY_W, BODY_H, BODY_D, BODY_Y));
    shell.add(wire([[-x, ym, z], [-x, ym, zb], [x, ym, zb], [x, ym, z]]));
  } else {
    // трапеція: задня грань вертикальна, передня нахилена на 12° — верх на SH ближче до центру
    const x = 15, zb = -16, y0 = BODY_Y, y1 = top, f0 = fz(y0), f1 = fz(y1);
    shell.add(wire([[-x, y0, zb], [x, y0, zb], [x, y0, f0], [-x, y0, f0]], true));
    shell.add(wire([[-x, y1, zb], [x, y1, zb], [x, y1, f1], [-x, y1, f1]], true));
    for (const sx of [-1, 1]) { shell.add(wire([[sx * x, y0 - 0.3, zb], [sx * x, y1 + 0.3, zb]])); shell.add(wire([[sx * x, y0 - 0.3, f0], [sx * x, y1 + 0.3, f1]])); for (const [yy, zz] of [[y0, zb], [y1, zb], [y0, f0], [y1, f1]]) shell.add(joint([sx * x, yy, zz])); }
    const ym = y0 + 20; shell.add(wire([[-x, ym, fz(ym)], [-x, ym, zb], [x, ym, zb], [x, ym, fz(ym)]])); // без переднього відрізка
  }
  // діагональна стяжка на задній стінці — лише в прототипі
  if (!r2) shell.add(wire([[-15, BODY_Y + 20, -16], [15, BODY_Y + 40, -16]], false, 0.32));

  // 5. Мікрофон / бузер / спікер
  const audio = add('audio', [50, 0, 0]);
  if (version === 'original') {
    const mic = new THREE.Group();
    mic.add(pcb(12, 15, 0x1f4fb0, [['PDM', 5, 1.6, true], ['MIC', 7.5, 1.6, true]], { pitch: 2.54, left: 0, right: 5, margin: 1.3 }));
    mic.add(at(box(3.5, 3, 1.1, metal(0xa8acb0, 0.3)), -2, -2, 1.3));
    mic.add(at(cyl(0.5, 0.4, plastic(0x000000), 10), -2, -2, 1.9).rotateX(Math.PI / 2));
    mic.position.set(-23, BODY_Y + 27, 4); mic.rotation.y = -0.15;
    audio.add(mic);
    for (const yy of [-3, 3]) { audio.add(wire([[-15, BODY_Y + 27 + yy, 4], [-19.5, BODY_Y + 27 + yy, 4]], false, 0.3)); audio.add(joint([-15, BODY_Y + 27 + yy, 4], 0.6)); }
    const bz = new THREE.Group();
    bz.add(cyl(6, 6.2, plastic(0x0a0a0a, 0.45), 32));
    bz.add(at(cyl(1.2, 0.6, plastic(0x000000), 12), 0, 3.3, 0));
    bz.add(at(cyl(6.2, 0.6, plastic(0x151515, 0.6), 32), 0, -3, 0));
    for (const sx of [-1, 1]) bz.add(at(cyl(0.3, 5, solderMat(), 8), sx * 2.5, -5, 0));
    bz.rotation.z = Math.PI / 2; bz.position.set(21, BODY_Y + 22, 2);
    audio.add(bz);
    audio.add(wire([[15, BODY_Y + 20, 2], [18, BODY_Y + 20, 2]], false, 0.3));
    audio.add(wire([[15, BODY_Y + 24, 2], [18, BODY_Y + 24, 2]], false, 0.3));
  } else if (version === 'touch') {
    // Сенсорна капсула ззаду (замість рюкзака з батареєю): BME280 — на дні отвором униз, подалі від тепла чипа;
    // спікер 15 мм дивиться назад (капсула — резонатор), поруч MAX98357A; PDM-мікрофон — на боковій стінці.
    // Зовні лишається тільки VEML7700 зверху — дивиться в стелю.
    const cz = -BODY_D / 2 - 8, cy = BODY_Y + 8;
    const mod = (name, col, w = 10, h = 8) => { const m = new THREE.Group(); m.add(pcb(w, h, col, [[name, h / 2 + 1, 1.2, true]], { pitch: 2.54, left: 0, right: 0 })); m.add(at(box(2.4, 2.4, 1, metal(0xa8acb0, 0.3)), w / 2 - 3, -h / 2 + 2.5, 1.3)); return m; };
    const bme = mod('BME280', 0x6b1fb0, 10, 8); bme.position.set(0, cy + 1.5, cz); bme.rotation.x = Math.PI / 2; audio.add(bme);
    const sp = new THREE.Group();
    sp.add(cyl(7.5, 3.5, plastic(0x141414, 0.5), 32));
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, rr = 3 + (i % 2) * 2; sp.add(at(cyl(0.35, 0.3, plastic(0x000000), 6), Math.cos(a) * rr, 1.8, Math.sin(a) * rr)); }
    sp.add(at(cyl(3, 0.4, plastic(0x2a2a2a), 24), 0, 1.9, 0));
    sp.rotation.x = -Math.PI / 2; sp.position.set(0, cy + 16, cz - 5); audio.add(sp);
    const amp = pcb(10, 12, 0x1f4fb0, [['MAX', 5, 1.5, true], ['98357', 8, 1.5, true]], { pitch: 2.54, left: 0, right: 4, margin: 1.2 });
    amp.rotation.y = Math.PI / 2; amp.position.set(9.5, cy + 12, cz); audio.add(amp);
    const mic = mod('PDM MIC', 0x1f4fb0, 10, 12); mic.rotation.y = -Math.PI / 2; mic.position.set(-9.5, cy + 12, cz); audio.add(mic);
    const veml = mod('VEML7700', 0x1f4fb0, 10, 8); veml.position.set(6, top + 1.2, TRAP ? -4 : 6); veml.rotation.x = -Math.PI / 2; audio.add(veml);
  }

  // 6. Рюкзак-клітка + батарея 14250 (горизонтально) + вимикач
  const pack = add('pack', [0, 0, -70]);
  {
    const sw = new THREE.Group();
    sw.add(box(8.5, 3.6, 3.6, plastic(0x1a1a1a, 0.45)));
    sw.add(at(box(2, 2.2, 1.8, plastic(0x222222, 0.4)), 2.2, -2.6, 0));
    for (const x of [-2.5, 0, 2.5]) sw.add(at(cyl(0.28, 3.5, solderMat(), 8), x, 2.5, 0));
    const shellM = metal(0xd6d8da, 0.25);
    if (!r2) {
      // прототип: 14250 (Ø14×25) горизонтально у клітці-рюкзаку, вимикач знизу
      const br = 7, bl = 24, pz = -BODY_D / 2 - 10;
      const c = cage(bl + 5, br * 2 + 3, br * 2 + 3, BODY_Y + 27.5 - br - 1.5); c.position.z = pz; pack.add(c);
      for (const sx of [-1, 1]) for (const yy of [BODY_Y + 27.5 - br - 1.5, BODY_Y + 27.5 + br + 1.5]) pack.add(wire([[sx * 14.5, yy, -BODY_D / 2], [sx * (bl + 5) / 2, yy, pz - br - 1.5]]));
      const bat = new THREE.Group();
      bat.add(cyl(br, bl, shellM, 40)); bat.add(at(cyl(br * 0.4, 1.2, metal(0xe8e8e8, 0.3), 24), 0, bl / 2 + 0.5, 0));
      bat.add(cyl(br + 0.05, bl * 0.66, plastic(0x2b6cb0, 0.5), 40)); bat.add(at(cyl(br + 0.06, 1.2, plastic(0xffffff, 0.5), 40), 0, bl * 0.2, 0));
      bat.rotation.z = Math.PI / 2; bat.position.set(0, BODY_Y + 27.5, pz); pack.add(bat);
      pack.add(at(box(6, 1.5, 2, solderMat()), bl / 2 + 1, BODY_Y + 27.5, pz)); pack.add(at(box(6, 1.5, 2, solderMat()), -bl / 2 - 1, BODY_Y + 27.5, pz));
      sw.position.set(0, BODY_Y - 4, -12); sw.rotation.x = Math.PI; pack.add(sw);
      pack.add(wire([[-4, BODY_Y, -12], [-4, BODY_Y - 2.5, -12]], false, 0.3)); pack.add(wire([[4, BODY_Y, -12], [4, BODY_Y - 2.5, -12]], false, 0.3));
    } else {
      // R2: знімна 16340 з захистом (Ø16×34) — ВСЕРЕДИНІ корпусу, вертикально за модулем екрана, між рамками шасі;
      // тримається двома пружними латунними клемами, припаяними до шасі. Центр мас нижче й ближче до середини.
      const br = 8, bl = 34, bz = -8, y0 = BODY_Y + 14;
      const bat = new THREE.Group();
      bat.add(cyl(br, bl, shellM, 40)); bat.add(at(cyl(br * 0.4, 1.2, metal(0xe8e8e8, 0.3), 24), 0, bl / 2 + 0.5, 0));
      bat.add(cyl(br + 0.05, bl * 0.66, plastic(0x1f8f5a, 0.5), 40)); bat.add(at(cyl(br + 0.06, 1.2, plastic(0xffffff, 0.5), 40), 0, bl * 0.2, 0));
      bat.position.set(0, y0 + bl / 2, bz); pack.add(bat);
      for (const yy of [y0 - 0.6, y0 + bl + 1.45]) { // клеми: латунна смужка між рамками шасі; верхня лягає на «+», не перетинаючи його
        pack.add(at(box(23, 0.6, 6, brassMat()), 0, yy, bz));
        pack.add(joint([-11.5, yy, bz], 0.6)); pack.add(joint([11.5, yy, bz], 0.6));
      }
      // вимикач збоку (правий борт, під великий палець)
      sw.rotation.y = Math.PI / 2; sw.position.set(BODY_W / 2 + 2.2, BODY_Y + 8, -6); pack.add(sw);
      pack.add(wire([[15, BODY_Y + 6, -6], [17, BODY_Y + 6, -6]], false, 0.3)); pack.add(wire([[15, BODY_Y + 10, -6], [17, BODY_Y + 10, -6]], false, 0.3));
      if (version === 'touch') {
        // сенсорна капсула ззаду: мала клітка 22×26×14, чотири дроти до задньої грані
        const cz = -BODY_D / 2 - 8, cy = BODY_Y + 8;
        const c = cage(22, 26, 14, cy); c.position.z = cz; pack.add(c);
        for (const sx of [-1, 1]) for (const yy of [cy, cy + 26]) pack.add(wire([[sx * 11, yy, -BODY_D / 2], [sx * 11, yy, cz + 7]]));
        pack.add(at(box(9, 3.4, 6, metal(0xc8ccd0, 0.3)), 0, cy + 4, cz - 8)); // USB-C на спині капсули
      } else {
        pack.add(at(box(9, 3.4, 6, metal(0xc8ccd0, 0.3)), 0, BODY_Y + 6, -BODY_D / 2 - 2)); // USB-C на задній грані
      }
    }
  }

  // 7. Антена: дріт + резистор 220 Ω + червоний LED 0805
  const antenna = add('antenna', [0, 70, 0]);
  {
    const ax = -8, az = -8;
    antenna.add(wire([[ax, top - 1, az], [ax, top + 58, az]]));
    antenna.add(joint([ax, top, az]));
    if (!r2) { // прототип: резистори 220 Ω на антені
      [[2.2, 0], [1.6, 1.6], [0, 2.2]].forEach(([dx, dz], i) => {
        const r = resistor(); r.position.set(ax + dx, top + 10 + i * 6, az + dz); antenna.add(r);
        antenna.add(wire([[ax, top + 5 + i * 6, az], [ax + dx, top + 5 + i * 6, az + dz]], false, 0.25));
        antenna.add(wire([[ax, top + 15 + i * 6, az], [ax + dx, top + 15 + i * 6, az + dz]], false, 0.25));
      });
    } // R2: резистори на платі, антена — чистий дріт
    const led = led0805('rgba(60,255,90,0.95)', 0x22c55e);
    led.position.set(ax, top + 59, az); led.userData.led.light.intensity = 40; led.userData.led.glow.scale.set(14, 14, 1);
    antenna.add(led);
    root.userData.led = led.userData.led;
  }

  // 8. Чотири ноги: драбина з двох стійок + поперечки + трикутний розкос
  const legs = add('legs', [0, -40, 0]);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const a = new THREE.Vector3(sx * 15, BODY_Y + 2, sz * 16);
    const b = new THREE.Vector3(sx * 43, 1.2, sz * 43);
    const side = new THREE.Vector3(-sz, 0, sx).normalize().multiplyScalar(r2 ? 2.2 : 1.6);
    const a1 = a.clone().add(side), a2 = a.clone().sub(side);
    const b1 = b.clone().add(side.clone().multiplyScalar(0.5)), b2 = b.clone().sub(side.clone().multiplyScalar(0.5));
    const c = new THREE.Vector3(sx * 15, BODY_Y + 24, sz * 16);
    const m = a.clone().lerp(b, 0.5);
    if (!r2) {
      legs.add(wire([a1, b1, b2, a2], false, WIRE_R, 1.0));
      for (const k of [0.22, 0.44, 0.66, 0.85]) legs.add(wire([a1.clone().lerp(b1, k), a2.clone().lerp(b2, k)], false, 0.3));
      legs.add(wire([c, m]));
      legs.add(joint(c)); legs.add(joint(a1, 0.6)); legs.add(joint(a2, 0.6)); legs.add(joint(m, 0.7));
    } else {
      // R2: нога паяна до ребра шкаралупи (не розбірна). Точки кріплення беруться з реальної грані:
      // для передніх ніг у трапеції z = fz(y), тож нічого не висить у повітрі.
      const zOn = yy => (sz > 0 ? fz(yy) : -16);
      const aa = new THREE.Vector3(sx * 15, BODY_Y + 1, zOn(BODY_Y + 1));
      const cc = new THREE.Vector3(sx * 15, BODY_Y + 24, zOn(BODY_Y + 24));
      const sd = new THREE.Vector3(-sz, 0, sx).normalize().multiplyScalar(2.2);
      const p1 = aa.clone().add(sd), p2 = aa.clone().sub(sd);
      const q1 = b.clone().add(sd.clone().multiplyScalar(0.5)), q2 = b.clone().sub(sd.clone().multiplyScalar(0.5));
      const mm = aa.clone().lerp(b, 0.5);
      legs.add(wire([p1, q1, q2, p2], false, 0.4, 1.0));
      for (const k of [0.25, 0.5, 0.75]) legs.add(wire([p1.clone().lerp(q1, k), p2.clone().lerp(q2, k)], false, 0.3));
      legs.add(wire([cc, mm]));                       // розкос від ребра корпусу до середини ноги — трикутник
      legs.add(joint(p1, 0.7)); legs.add(joint(p2, 0.7)); legs.add(joint(cc, 0.7)); legs.add(joint(mm, 0.7));
    }
  }

  // 9. Посадкові диски Ø14 з паяним вузлом
  const pads = add('pads', [0, -25, 0]);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.5, 48), brassMat());
    d.position.set(sx * 43, 0.25, sz * 43);
    pads.add(d);
    if (r2) { const rim = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.45, 8, 48), brassMat()); rim.rotation.x = Math.PI / 2; rim.position.set(sx * 43, 0.7, sz * 43); pads.add(rim); }
    pads.add(joint([sx * 43, 0.9, sz * 43], 1.1));
  }

  // Кожній групі — власні матеріали, щоб підсвічувати окремо
  root.traverse(o => {
    if (o.isMesh && !o.userData.isScreen) o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone();
  });
  root.userData.screenTex = screenTex;
  return root;
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Глядач: сцена, камера, контроли, анімація збірки, підсвічування
export class Viewer {
  constructor(canvas, OrbitControls, { autoRotate = false, onPick = null, step = STEP_IDS.length, fitZoom = 1, fitLift = 0 } = {}) {
    this.fitZoom = fitZoom; this.fitLift = fitLift; // fitLift > 0 — модель вище в кадрі (під нею кнопки)
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.camera = new THREE.PerspectiveCamera(35, 1, 1, 2000);
    this.camera.position.set(160, 150, 210);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 68, 0);
    this.controls.enableDamping = true;
    this.controls.autoRotate = autoRotate;
    this.controls.autoRotateSpeed = 0.8;
    this.controls.enableZoom = true;
    this.controls.minDistance = 60;
    this.controls.maxDistance = 600;
    // сенсорні екрани: один палець гортає сторінку, два — обертають і масштабують модель
    if (matchMedia('(pointer: coarse)').matches) {
      this.controls.touches = { ONE: -1, TWO: THREE.TOUCH.DOLLY_ROTATE };
      canvas.style.touchAction = 'pan-y';
    }

    this.scene.add(new THREE.HemisphereLight(0xfff4e0, 0x202030, 0.6));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.6); d1.position.set(100, 200, 150); this.scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xf5a623, 0.7); d2.position.set(-150, 80, -100); this.scene.add(d2);

    // м'яка кругла тінь — градієнтна площина
    const sc = document.createElement('canvas'); sc.width = sc.height = 128;
    const sctx = sc.getContext('2d');
    const gr = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(18,27,54,0.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = gr; sctx.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(170, 170),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    this.scene.add(shadow);

    this.step = step; // вікно збірки стартує з кроку 1, інші — з повністю зібраної моделі
    this.highlight = null;
    this.active = true;
    this.onPick = onPick;
    this.raycaster = new THREE.Raycaster();
    let down = null;
    canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
    canvas.addEventListener('pointerup', e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || !this.onPick) return;
      this.onPick(this.pick(e));
    });
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.render());
  }

  setModel(model) {
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse(o => { if (o.isMesh || o.isSprite) { o.geometry?.dispose(); for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.dispose(); } });
    }
    this.model = model;
    this.scene.add(model);
    for (const g of model.children) g.userData.t = STEP_IDS.indexOf(g.name) < this.step ? 1 : 0;
    this.setHighlight(this.highlight);
    this.fit();
  }

  // Підібрати відстань камери, щоб уся модель (з антеною і ногами) влазила у вікно
  fit() {
    if (!this.model) return;
    const box = new THREE.Box3().setFromObject(this.model);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    const fovV = THREE.MathUtils.degToRad(this.camera.fov);
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * this.camera.aspect);
    const radius = Math.hypot(size.x, size.z) / 2;
    const dist = (Math.max(size.y / 2 / Math.tan(fovV / 2), radius / Math.tan(fovH / 2)) * 1.15 + radius) * this.fitZoom;
    center.y -= size.y * this.fitLift;
    this.controls.target.copy(center);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    if (!dir.length()) dir.set(0.6, 0.55, 0.8).normalize();
    this.camera.position.copy(center).addScaledVector(dir, dist);
    this.controls.minDistance = Math.min(this.controls.minDistance, dist * 0.4);
    this.controls.maxDistance = Math.max(this.controls.maxDistance, dist * 2);
    this.controls.update();
  }

  setStep(n) { this.step = n; }

  setHighlight(id) {
    this.highlight = id;
    if (!this.model) return;
    for (const g of this.model.children) {
      const on = g.name === id;
      g.traverse(o => {
        if (!o.isMesh || o.userData.isScreen || o.userData.keepEmissive) return;
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          if (!m.emissive) continue;
          m.emissive.set(on ? 0xf5a623 : 0x000000);
          m.emissiveIntensity = on ? 0.6 : 0;
        }
      });
    }
  }

  pick(e) {
    const r = this.canvas.getBoundingClientRect();
    const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(p, this.camera);
    const hit = this.raycaster.intersectObject(this.model, true).find(h => h.object.visible && !h.object.isSprite);
    let o = hit?.object;
    while (o && !STEP_IDS.includes(o.name)) o = o.parent;
    return o?.name ?? null;
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.fit();
  }

  render() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    if (!this.active || !this.model) return;
    for (const g of this.model.children) {
      const target = STEP_IDS.indexOf(g.name) < this.step ? 1 : 0;
      const u = g.userData;
      u.t += Math.sign(target - u.t) * Math.min(Math.abs(target - u.t), dt * 1.6);
      const k = ease(u.t);
      g.position.copy(u.home).addScaledVector(u.from, 1 - k);
      g.visible = u.t > 0.01;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
