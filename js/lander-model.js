// Процедурна модель Lander R2 (одиниця — мм, вісь Y — вгору)
import * as THREE from 'three';

export const STEP_IDS = ['chassis', 'board', 'display', 'shell', 'audio', 'pack', 'antenna', 'legs', 'pads'];

const WIRE_R = 0.4;
const wireMat = () => new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.9, roughness: 0.3 });

// Трубка по ламаній (прямі відрізки)
function wire(points, closed = false, r = WIRE_R) {
  const pts = points.map(p => new THREE.Vector3(...p));
  if (closed) pts.push(pts[0].clone());
  const path = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  return new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(8, (pts.length - 1) * 6), r, 6, false), wireMat());
}

function box(w, h, d, color, opts = {}) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.6, metalness: opts.metalness ?? 0.1 }));
}

// Прямокутна клітка W×H×D з центром у (0, y0 + H/2, 0)
function cage(w, h, d, y0) {
  const g = new THREE.Group();
  const x = w / 2, z = d / 2, y1 = y0 + h;
  g.add(wire([[-x, y0, -z], [x, y0, -z], [x, y0, z], [-x, y0, z]], true));
  g.add(wire([[-x, y1, -z], [x, y1, -z], [x, y1, z], [-x, y1, z]], true));
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) g.add(wire([[sx * x, y0, sz * z], [sx * x, y1, sz * z]]));
  return g;
}

const BODY_Y = 35, BODY_H = 60, BODY_W = 30, BODY_D = 32;

export function buildLander(version, screenCanvas) {
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

  // 1. Шасі — внутрішня рамка
  const chassis = add('chassis', [0, -60, 0]);
  chassis.add(cage(24, 56, 26, BODY_Y + 2));
  chassis.add(wire([[-12, BODY_Y + 30, -13], [12, BODY_Y + 30, -13]]));

  // 2. Плата контролера
  const board = add('board', [-70, 0, 0]);
  const pcbColor = version === 'original' ? 0x1b2f6b : 0x111111;
  const pcb = box(23, 51, 1.6, pcbColor);
  pcb.position.set(0, BODY_Y + 30, -4);
  board.add(pcb);
  const usb = box(9, 3.2, 7, 0xb0b0b0, { metalness: 0.8, roughness: 0.3 });
  usb.position.set(0, BODY_Y + 30 - 25.5 + 1.5, -4);
  board.add(usb);
  for (const [cx, cy, s] of [[0, 8, 10], [-6, -8, 4], [6, -10, 5]]) {
    const chip = box(s, s, 1.2, 0x222222);
    chip.position.set(cx, BODY_Y + 30 + cy, -2.6);
    board.add(chip);
  }

  // 3. Дисплей
  const display = add('display', [0, 0, 70]);
  const dispPcb = box(30, 50, 1.5, version === 'ink' ? 0xdddddd : 0x0d1a3a);
  dispPcb.position.set(0, BODY_Y + 30, 14);
  display.add(dispPcb);
  let screenTex = null;
  if (screenCanvas) {
    screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    if (version === 'ink') { screenTex.center.set(0.5, 0.5); screenTex.rotation = Math.PI / 2; }
  }
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(24, 45),
    new THREE.MeshBasicMaterial({ map: screenTex, color: screenTex ? 0xffffff : 0x000000 }));
  scr.position.set(0, BODY_Y + 30, 14.8);
  scr.userData.isScreen = true;
  display.add(scr);

  // 4. Зовнішня шкаралупа
  const shell = add('shell', [0, 80, 0]);
  shell.add(cage(BODY_W, BODY_H, BODY_D, BODY_Y));
  shell.add(wire([[-15, BODY_Y + 20, 16], [15, BODY_Y + 20, 16]]));

  // 5. Мікрофон / бузер / спікер
  const audio = add('audio', [50, 0, 0]);
  if (version === 'original') {
    const mic = box(1.2, 15, 12, 0x1f4fb0);
    mic.position.set(15.8, BODY_Y + 40, 0);
    audio.add(mic);
  }
  if (version !== 'ink') {
    const bz = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 6, 24),
      new THREE.MeshStandardMaterial({ color: version === 'touch' ? 0x333333 : 0x111111, roughness: 0.5 }));
    bz.rotation.z = Math.PI / 2;
    bz.position.set(-18, BODY_Y + 15, 0);
    audio.add(bz);
  }

  // 6. Рюкзак + батарея 14250 + вимикач
  const pack = add('pack', [0, 0, -70]);
  const packCage = cage(22, 30, 18, BODY_Y + 15);
  packCage.position.z = -BODY_D / 2 - 9;
  pack.add(packCage);
  const bat = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 25, 24),
    new THREE.MeshStandardMaterial({ color: 0x3a8fd0, roughness: 0.4, metalness: 0.3 }));
  bat.position.set(0, BODY_Y + 30, -BODY_D / 2 - 9);
  pack.add(bat);
  const sw = box(8, 4, 4, 0x222222);
  sw.position.set(0, BODY_Y + 47, -BODY_D / 2 - 9);
  pack.add(sw);

  // 7. Антена з червоним LED
  const antenna = add('antenna', [0, 70, 0]);
  const top = BODY_Y + BODY_H;
  antenna.add(wire([[8, top, -8], [8, top + 60, -8]]));
  const led = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff0000, emissiveIntensity: 2 }));
  led.position.set(8, top + 61, -8);
  led.userData.keepEmissive = true;
  antenna.add(led);
  const pl = new THREE.PointLight(0xff3020, 30, 60, 2);
  pl.position.copy(led.position);
  antenna.add(pl);

  // 8. Чотири ноги: подвійна стійка + поперечки
  const legs = add('legs', [0, -40, 0]);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const a = new THREE.Vector3(sx * 15, BODY_Y + 8, sz * 16);
    const b = new THREE.Vector3(sx * 45, 0.8, sz * 45);
    const side = new THREE.Vector3(-sz, 0, sx).normalize().multiplyScalar(1.6);
    const a1 = a.clone().add(side), a2 = a.clone().sub(side), b1 = b.clone().add(side), b2 = b.clone().sub(side);
    legs.add(wire([a1.toArray(), b1.toArray()]));
    legs.add(wire([a2.toArray(), b2.toArray()]));
    // трикутні розкоси до низу корпусу
    const c = new THREE.Vector3(sx * 15, BODY_Y, sz * 16);
    const m = a.clone().lerp(b, 0.45);
    legs.add(wire([c.toArray(), m.toArray()]));
    for (const k of [0.25, 0.5, 0.75]) {
      legs.add(wire([a1.clone().lerp(b1, k).toArray(), a2.clone().lerp(b2, k).toArray()], false, 0.3));
    }
  }

  // 9. Посадкові диски Ø14
  const pads = add('pads', [0, -25, 0]);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.5, 32), wireMat());
    d.position.set(sx * 45, 0.25, sz * 45);
    pads.add(d);
  }

  // Кожній групі — власні матеріали, щоб підсвічувати окремо
  root.traverse(o => {
    if (o.isMesh && !o.userData.isScreen) o.material = o.material.clone();
  });
  root.userData.screenTex = screenTex;
  return root;
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Глядач: сцена, камера, контроли, анімація збірки, підсвічування
export class Viewer {
  constructor(canvas, OrbitControls, { autoRotate = false, onPick = null } = {}) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 1, 2000);
    this.camera.position.set(170, 150, 220);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 55, 0);
    this.controls.enableDamping = true;
    this.controls.autoRotate = autoRotate;
    this.controls.autoRotateSpeed = 0.8;
    this.controls.enableZoom = true;
    this.controls.minDistance = 120;
    this.controls.maxDistance = 600;

    this.scene.add(new THREE.HemisphereLight(0xfff4e0, 0x202030, 1.2));
    const d1 = new THREE.DirectionalLight(0xffffff, 2); d1.position.set(100, 200, 150); this.scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xf5a623, 0.8); d2.position.set(-150, 80, -100); this.scene.add(d2);

    // м'яка кругла тінь — градієнтна площина
    const sc = document.createElement('canvas'); sc.width = sc.height = 128;
    const sctx = sc.getContext('2d');
    const gr = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = gr; sctx.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(170, 170),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    this.scene.add(shadow);

    this.step = 9;
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
      this.model.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    }
    this.model = model;
    this.scene.add(model);
    for (const g of model.children) g.userData.t = STEP_IDS.indexOf(g.name) < this.step ? 1 : 0;
    this.setHighlight(this.highlight);
  }

  setStep(n) { this.step = n; }

  setHighlight(id) {
    this.highlight = id;
    if (!this.model) return;
    for (const g of this.model.children) {
      const on = g.name === id;
      g.traverse(o => {
        if (o.isMesh && !o.userData.isScreen && !o.userData.keepEmissive && o.material.emissive) {
          o.material.emissive.set(on ? 0xf5a623 : 0x000000);
          o.material.emissiveIntensity = on ? 0.6 : 0;
        }
      });
    }
  }

  pick(e) {
    const r = this.canvas.getBoundingClientRect();
    const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(p, this.camera);
    const hit = this.raycaster.intersectObject(this.model, true).find(h => h.object.visible);
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
