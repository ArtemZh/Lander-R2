// Емулятор екрана Lander R2 — усе малюється кодом, без фотографій.
// original: TFT 170×320; touch: AMOLED 240×536 (макет 170×380 у масштабі 1.41) + жести, 4 сторінки, сенсори;
// ink: e-ink 152×296, чорне на білому, часткові/повні оновлення з «миготінням».
const ORANGE = '#f5a623', DARK = '#0a0c11', PAPER = '#f4f4ef', INK = '#111';
export const STATE_COLORS = { working: '#22c55e', question: '#ef4444', idle: '#f5a623' };
const STATE_TEXT = { working: { uk: 'працює', en: 'working' }, question: { uk: 'чекає відповіді', en: 'needs answer' }, idle: { uk: 'простій', en: 'idle' } };

// ---------- семисегментні цифри ----------
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function digit(ctx, x, y, w, h, d, color) {
  const t = Math.max(2, w * 0.18), hh = h / 2;
  const segs = {
    a: [x + t, y, w - 2 * t, t], d: [x + t, y + h - t, w - 2 * t, t], g: [x + t, y + hh - t / 2, w - 2 * t, t],
    f: [x, y + t, t, hh - t * 1.5], b: [x + w - t, y + t, t, hh - t * 1.5],
    e: [x, y + hh + t / 2, t, hh - t * 1.5], c: [x + w - t, y + hh + t / 2, t, hh - t * 1.5],
  };
  ctx.fillStyle = color;
  for (const s of SEG[d] || '') ctx.fillRect(...segs[s]);
}
function sevenSeg(ctx, str, x, y, w, h, color, shadow, colonOn = true) {
  let cx = x;
  for (const ch of str) {
    if (ch === ':') {
      const d = Math.max(3, w * 0.14);
      if (shadow) { ctx.fillStyle = shadow; ctx.fillRect(cx + 1, y + h * 0.28, d, d); ctx.fillRect(cx + 1, y + h * 0.66, d, d); }
      if (colonOn) { ctx.fillStyle = color; ctx.fillRect(cx + 1, y + h * 0.28, d, d); ctx.fillRect(cx + 1, y + h * 0.66, d, d); }
      cx += d + 4; continue;
    }
    if (shadow) digit(ctx, cx, y, w, h, 8, shadow);
    digit(ctx, cx, y, w, h, +ch, color);
    cx += w + 4;
  }
}

export function moonPhase(date = new Date()) {
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date - ref) / 86400000;
  return ((days % 29.53) + 29.53) % 29.53 / 29.53;
}
function drawMoon(ctx, cx, cy, r, phase, light = '#eee', dark = '#222') {
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light;
  const k = Math.cos(phase * 2 * Math.PI), waxing = phase < 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !waxing);
  ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing);
  ctx.fill();
}
function plate(ctx, x, y, w, h, color, cut = 8) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + w - cut, y); ctx.lineTo(x + w, y + cut); ctx.lineTo(x + w, y + h); ctx.lineTo(x + cut, y + h); ctx.lineTo(x, y + h - cut); ctx.closePath(); ctx.fill();
}
function sunIcon(ctx, x, y, r, t, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + t * 0.3;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2)); ctx.lineTo(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5)); ctx.stroke();
  }
}
function cloudIcon(ctx, x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.arc(x, y, s * 0.55, Math.PI, 0); ctx.arc(x + s * 0.55, y + s * 0.1, s * 0.45, Math.PI, 0);
  ctx.arc(x - s * 0.5, y + s * 0.15, s * 0.4, Math.PI, 0); ctx.rect(x - s * 0.9, y + s * 0.15, s * 1.9, s * 0.35); ctx.fill();
}
function horizonIcon(ctx, x, y, up, color, t, s = 1) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5 * s;
  ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.lineTo(x + 14 * s, y); ctx.stroke();
  const bob = Math.sin(t * 1.5) * 1.2;
  ctx.beginPath(); ctx.arc(x, y + bob, 6 * s, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y - 13 * s + bob); ctx.lineTo(x, y - 9 * s + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 3 * s, y - (up ? 10 : 12) * s + bob); ctx.lineTo(x, y - (up ? 13 : 9) * s + bob); ctx.lineTo(x + 3 * s, y - (up ? 10 : 12) * s + bob); ctx.stroke();
}
function stripes(ctx, x, y, n, t, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) { const p = ((t * 12 + i * 6) % (n * 6)); ctx.beginPath(); ctx.moveTo(x + p, y); ctx.lineTo(x + p + 4, y); ctx.lineTo(x + p, y + 8); ctx.lineTo(x + p - 4, y + 8); ctx.fill(); }
}
function battery(ctx, x, y, level, color, charging, t, s = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 16 * s, 8 * s); ctx.fillStyle = color; ctx.fillRect(x + 17 * s, y + 2 * s, 2 * s, 5 * s);
  const bars = charging ? Math.floor((t * 2) % 5) : Math.round(level * 4);
  for (let i = 0; i < bars; i++) ctx.fillRect(x + (2 + i * 3.5) * s, y + 2 * s, 2.5 * s, 5 * s);
}
function bar(ctx, x, y, w, h, v, color, bg = '#2a2f3a') {
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, v)), h);
}

const pad = n => String(n).padStart(2, '0');
const tzTime = (tz, d) => d.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const CITIES = [['MUMBAI', 'Asia/Kolkata'], ['TOKYO', 'Asia/Tokyo'], ['LONDON', 'Europe/London'], ['NEW YORK', 'America/New_York']];
const F = (px, b = '') => `${b} ${px}px "Share Tech Mono", monospace`;
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- дані ----------
export const weather = { temp: 18, hum: 62, wind: 11, sunrise: '06:48', sunset: '18:52', live: false, hourly: [] };
export async function loadWeather() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.45&longitude=30.52&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto&forecast_days=1');
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    Object.assign(weather, {
      temp: Math.round(j.current.temperature_2m), hum: Math.round(j.current.relative_humidity_2m),
      wind: Math.round(j.current.wind_speed_10m), pressure: j.current.surface_pressure,
      sunrise: j.daily.sunrise[0].slice(11, 16), sunset: j.daily.sunset[0].slice(11, 16), live: true,
      hourly: j.hourly.temperature_2m.map(Math.round),
    });
    sensors.pBase = weather.pressure || 1013;
  } catch (e) { console.info('Open-Meteo недоступний, статичні дані', e.message); }
}
// Стан Claude Code для віджета й RGB LED (у демо — симуляція; auto — перемикається саме)
export const claude = { state: 'working', used5h: 0.62, usedWeek: 0.31, resetMin: 134, auto: true, since: performance.now() };
// Сенсори Touch-версії (симуляція; на телефоні нахил береться з DeviceOrientation, на десктопі — з курсора над екраном)
export const sensors = { roll: 0, pitch: 0, tRoll: 0, tPitch: 0, pBase: 1013, lux: 300, mic: 0.1, knock: 0, sleep: 0, shake: 0, night: 0, real: false };
if (window.DeviceOrientationEvent) addEventListener('deviceorientation', e => {
  if (e.beta == null) return; sensors.real = true;
  sensors.tRoll = Math.max(-45, Math.min(45, e.gamma || 0)); sensors.tPitch = Math.max(-45, Math.min(45, (e.beta || 0) - 45));
});

export class Screen {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.version = 'original'; this.lang = 'uk'; this.S = 1;
    this.t0 = performance.now(); this.boot = 0;
    this.page = 0; this.pages = 1; this.pageX = 0; this.slide = 0; this.slideDx = 0;
    this.settings = { bright: 0.85, autoBright: true, sound: true, city: 0, h24: true };
    this.ripples = []; this.sliderDrag = false; this.refreshing = 0; this.flip = 0;
    this.inkFlash = 0; this.inkPartial = 0; this.inkMinute = -1; this.inkImage = null;
    this.onDraw = null;
    this.setupPointer();
    const loop = () => { this.frame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  setVersion(v) {
    this.version = v; this.page = 0; this.pageX = 0; this.slide = 0;
    const [w, h, S, pages] = v === 'ink' ? [152, 296, 1, 1] : v === 'touch' ? [240, 536, 240 / 170, 4] : [170, 320, 1, 1];
    this.canvas.width = w; this.canvas.height = h; this.S = S; this.pages = pages;
    this.boot = performance.now(); this.inkImage = null;
    if (v === 'ink') this.fullRefresh();
  }
  draw() { this.inkImage = null; }
  setClaude(state) { claude.state = state; claude.auto = false; claude.since = performance.now(); this.inkImage = null; }
  // ---------- жести (touch), координати у віртуальних одиницях 170×380 ----------
  setupPointer() {
    const c = this.canvas;
    const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width / this.S, (e.clientY - r.top) * c.height / r.height / this.S]; };
    let start = null;
    c.addEventListener('pointermove', e => {
      if (this.version === 'touch' && !sensors.real) { const [x, y] = pos(e); sensors.tRoll = (x / 170 - 0.5) * 60; sensors.tPitch = (y / 380 - 0.5) * 40; }
      if (!start) return; const p = pos(e);
      if (Math.abs(p[0] - start.p[0]) > 4) start.moved = true;
      if (this.sliderDrag) this.dragSlider(p, false);
      else if (start.moved) this.pageX = (p[0] - start.p[0]);
    });
    c.addEventListener('pointerleave', () => { if (!sensors.real) { sensors.tRoll = 0; sensors.tPitch = 0; } });
    c.addEventListener('pointerdown', e => {
      if (this.version !== 'touch') return;
      start = { p: pos(e), moved: false }; c.setPointerCapture(e.pointerId);
      if (this.page === 3) this.dragSlider(start.p, true);
    });
    const up = e => {
      if (!start) return; const p = pos(e);
      if (this.sliderDrag) { this.sliderDrag = false; start = null; return; }
      const dx = p[0] - start.p[0];
      if (Math.abs(dx) > 30) this.goPage(this.page - Math.sign(dx), dx);
      else if (!start.moved) this.tap(p);
      this.pageX = 0; start = null;
    };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  }
  goPage(n, dragDx = 0) {
    const to = Math.max(0, Math.min(this.pages - 1, n));
    this.slideDx = to === this.page ? dragDx : (this.page - to) * 170 + dragDx;
    this.page = to; this.pageX = 0; this.slide = performance.now();
  }
  tap([x, y]) {
    this.ripples.push({ x, y, t: performance.now() });
    const st = this.settings;
    if (this.page === 0) {
      if (y > 300 && y < 352) { this.setClaude({ working: 'question', question: 'idle', idle: 'working' }[claude.state]); }
      else if (y > 230) this.goPage(1);
      else if (y > 40 && y < 110) st.h24 = !st.h24;
      else if (y > 190 && y < 225) st.city = (st.city + 1) % CITIES.length;
      else if (y > 352) this.goPage(2);
    } else if (this.page === 1) {
      if (y > 340) { this.refreshing = performance.now(); loadWeather().then(() => { this.refreshing = 0; }); }
    } else if (this.page === 2) {
      // сценарії: стук / догори дном / ніч / струс
      const i = Math.floor((y - 270) / 22);
      if (y > 270 && i >= 0 && i < 4) this.scenario(['knock', 'sleep', 'night', 'shake'][i]);
    } else {
      if (y > 92 && y < 122) st.autoBright = !st.autoBright;
      else if (y > 128 && y < 158) st.sound = !st.sound;
      else if (y > 164 && y < 194) st.city = (st.city + 1) % CITIES.length;
      else if (y > 200 && y < 230) st.h24 = !st.h24;
      else if (y > 236 && y < 266) this.setClaude({ working: 'question', question: 'idle', idle: 'working' }[claude.state]);
    }
  }
  scenario(name) {
    const tn = performance.now();
    if (name === 'knock') { sensors.knock = tn; this.flip = tn; setTimeout(() => this.goPage(this.page === 2 ? 0 : this.page + 1), 350); }
    if (name === 'sleep') sensors.sleep = tn;
    if (name === 'night') sensors.night = sensors.night ? 0 : tn;
    if (name === 'shake') sensors.shake = tn;
  }
  dragSlider([x, y], begin) {
    if (begin && !(y > 50 && y < 86)) return;
    this.sliderDrag = true; this.settings.bright = Math.max(0.15, Math.min(1, (x - 16) / 138)); this.settings.autoBright = false;
  }
  fullRefresh() { this.inkFlash = performance.now(); }

  // ---------- симуляція сенсорів і стану Claude ----------
  tick(now, t) {
    const tn = performance.now();
    if (claude.auto && tn - claude.since > 20000) { claude.state = { working: 'question', question: 'idle', idle: 'working' }[claude.state]; claude.since = tn; this.inkImage = null; }
    claude.used5h = 0.55 + Math.sin(t / 60) * 0.1 + (claude.state === 'working' ? (t % 20) / 400 : 0);
    claude.resetMin = 134 - Math.floor(t / 60) % 134;
    sensors.roll = lerp(sensors.roll, sensors.tRoll, 0.08); sensors.pitch = lerp(sensors.pitch, sensors.tPitch, 0.08);
    const hh = now.getHours() + now.getMinutes() / 60, day = hh > 6.5 && hh < 19.5;
    const luxT = sensors.night ? 4 : (day ? 320 + Math.sin(t * 0.2) * 40 : 12);
    sensors.lux = lerp(sensors.lux, luxT, 0.03);
    sensors.mic = lerp(sensors.mic, Math.max(0, 0.08 + Math.random() * 0.25 + (sensors.knock && tn - sensors.knock < 400 ? 0.7 : 0)), 0.3);
    sensors.temp = weather.temp + 2.3 + Math.sin(t * 0.05) * 0.2; sensors.hum = weather.hum - 8 + Math.sin(t * 0.07) * 1;
    sensors.pressure = sensors.pBase + Math.sin(t / 90) * 1.5; sensors.trend = Math.cos(t / 90);
    sensors.alt = Math.round(44330 * (1 - Math.pow(sensors.pressure / 1013.25, 0.1903)));
    if (sensors.sleep && tn - sensors.sleep > 3000) sensors.sleep = 0;
    if (sensors.shake && tn - sensors.shake > 2500) sensors.shake = 0;
  }

  frame() {
    const now = new Date(), t = (performance.now() - this.t0) / 1000;
    this.tick(now, t);
    if (this.version === 'ink') this.frameInk(now);
    else this.frameTft(now, t);
    this.onDraw?.();
  }
  // ---------- TFT / touch ----------
  frameTft(now, t) {
    const c = this.ctx, S = this.S, W = 170, H = this.canvas.height / S, since = (performance.now() - this.boot) / 1000;
    c.setTransform(S, 0, 0, S, 0, 0);
    if (since < 1.6) return this.drawBoot(c, since, H);
    const k = ease((since - 1.6) / 1.2);
    c.fillStyle = DARK; c.fillRect(0, 0, W, H);
    if (this.version === 'touch') {
      const tn = performance.now();
      if (sensors.sleep) { // догори дном → сон: тьмяний годинник
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.fillStyle = '#333'; c.font = F(10); c.textAlign = 'center';
        c.fillText(this.lang === 'uk' ? 'догори дном · сон' : 'face down · sleep', 85, H / 2 - 10);
        sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 34, H / 2, 20, 34, '#2a2a2a', null);
        return;
      }
      let dx = this.pageX;
      if (this.slide) { const s = (tn - this.slide) / 260; if (s < 1) dx = (1 - ease(s)) * this.slideDx; else this.slide = 0; }
      // паралакс від нахилу
      const px = sensors.roll * 0.05, py = sensors.pitch * 0.05;
      c.save(); c.translate(dx + px, py); this.drawPage(c, this.page, now, t, k, H); c.restore();
      if (dx !== 0) {
        const p = dx > 0 ? this.page - 1 : this.page + 1;
        if (p >= 0 && p < this.pages) { c.save(); c.translate(dx - Math.sign(dx) * W, 0); this.drawPage(c, p, now, t, 1, H); c.restore(); }
      }
      for (let i = 0; i < this.pages; i++) { c.fillStyle = i === this.page ? ORANGE : '#444'; c.beginPath(); c.arc(85 - (this.pages - 1) * 7 + i * 14, H - 6, 2, 0, Math.PI * 2); c.fill(); }
      this.ripples = this.ripples.filter(r => tn - r.t < 500);
      for (const r of this.ripples) { const q = (tn - r.t) / 500; c.strokeStyle = `rgba(245,166,35,${1 - q})`; c.lineWidth = 2; c.beginPath(); c.arc(r.x, r.y, 4 + q * 26, 0, Math.PI * 2); c.stroke(); }
      if (sensors.shake) { const q = (tn - sensors.shake) / 2500; c.fillStyle = `rgba(239,68,68,${0.35 * (1 - q) * (0.5 + 0.5 * Math.sin(tn / 80))})`; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.font = F(11, 'bold'); c.textAlign = 'center'; c.fillText(this.lang === 'uk' ? '⚠ СТРУС · ПЕРЕВІРТЕ НОГИ' : '⚠ SHAKE · CHECK LEGS', 85, 24); }
      if (this.flip && tn - this.flip < 350) { c.fillStyle = `rgba(245,166,35,${0.25 * (1 - (tn - this.flip) / 350)})`; c.fillRect(0, 0, W, H); }
      const br = this.settings.autoBright ? 0.25 + 0.75 * Math.min(1, sensors.lux / 250) : this.settings.bright;
      c.fillStyle = `rgba(0,0,0,${1 - br})`; c.fillRect(0, 0, W, H);
    } else {
      this.drawPage(c, 0, now, t, k, H);
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < this.canvas.height; y += 3) c.fillRect(0, y, this.canvas.width, 1);
  }
  drawBoot(c, s, H) {
    c.fillStyle = DARK; c.fillRect(0, 0, 170, H);
    const y0 = H / 2 - 20;
    c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.textAlign = 'center'; c.fillText('LANDER R2', 85, y0);
    c.fillStyle = '#888'; c.font = F(9); c.fillText(this.version === 'touch' ? 'ESP32-S3 // AMOLED 240x536' : 'PHOTON 2 // ST7789', 85, y0 + 16);
    c.strokeStyle = '#444'; c.strokeRect(35.5, y0 + 30.5, 100, 6);
    c.fillStyle = ORANGE; c.fillRect(37, y0 + 32, 97 * Math.min(1, s / 1.3), 3);
    const msgs = ['wifi ...', 'webhook ...', 'weather ok', this.version === 'touch' ? 'imu · bme280 · veml ok' : 'moon ok'];
    c.fillStyle = '#6a6'; c.textAlign = 'left';
    msgs.slice(0, Math.floor(s / 0.4)).forEach((m, i) => c.fillText('> ' + m, 36, y0 + 55 + i * 12));
  }
  drawPage(c, p, now, t, k, H) {
    if (p === 0) this.drawMain(c, now, t, k, H);
    else if (p === 1) this.drawDetails(c, now, t, H);
    else if (p === 2) this.drawSensors(c, now, t, H);
    else this.drawSettings(c, t, H);
  }
  // Віджет Claude Code: стан + ліміти
  drawClaude(c, x, y, w, compact, t) {
    const uk = this.lang === 'uk', col = STATE_COLORS[claude.state];
    const pulse = claude.state === 'working' ? 0.6 + 0.4 * Math.sin(t * 4) : claude.state === 'question' ? (Math.sin(t * 8) > 0 ? 1 : 0.3) : 0.8;
    c.fillStyle = '#12151c'; c.fillRect(x, y, w, compact ? 22 : 50);
    c.fillStyle = col; c.fillRect(x, y, 2, compact ? 22 : 50);
    c.globalAlpha = pulse; c.fillStyle = col; c.beginPath(); c.arc(x + 12, y + 11, 3.5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.fillText('CLAUDE CODE', x + 20, y + 9);
    c.fillStyle = col; c.font = F(8); c.fillText(STATE_TEXT[claude.state][uk ? 'uk' : 'en'], x + 20, y + 18);
    const r = `${Math.floor(claude.resetMin / 60)}h${pad(claude.resetMin % 60)}`;
    if (compact) {
      bar(c, x + 98, y + 7, 40, 5, claude.used5h, col);
      c.fillStyle = '#aab'; c.font = F(7); c.textAlign = 'right'; c.fillText(`5h ${Math.round(claude.used5h * 100)}% · ${r}`, x + w - 4, y + 19);
    } else {
      c.fillStyle = '#aab'; c.font = F(7); c.textAlign = 'left';
      c.fillText(uk ? `ліміт 5 год · скид ${r}` : `5h limit · reset ${r}`, x + 8, y + 30); bar(c, x + 8, y + 33, w - 16, 4, claude.used5h, col);
      c.fillText(uk ? 'ліміт тижня' : 'weekly limit', x + 8, y + 44); bar(c, x + 8, y + 47, w - 16, 3, claude.usedWeek, '#7aa2f7');
      c.textAlign = 'right'; c.fillText(`${Math.round(claude.used5h * 100)}%`, x + w - 6, y + 30); c.fillText(`${Math.round(claude.usedWeek * 100)}%`, x + w - 6, y + 44);
    }
  }
  drawMain(c, now, t, k, H) {
    const W = 170, loc = this.lang === 'uk' ? 'uk-UA' : 'en-GB', uk = this.lang === 'uk', touch = this.version === 'touch';
    const hh = now.getHours(), h12 = !this.settings.h24 && touch;
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 1; c.strokeRect(3.5, 3.5, W - 7, H - 7);
    c.strokeStyle = ORANGE; c.lineWidth = 2;
    for (const [x, y, sx, sy] of [[4, 4, 1, 1], [W - 4, 4, -1, 1], [4, H - 4, 1, -1], [W - 4, H - 4, -1, -1]]) { c.beginPath(); c.moveTo(x, y + 10 * sy); c.lineTo(x, y); c.lineTo(x + 10 * sx, y); c.stroke(); }
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(12, 'bold');
    c.fillText(now.toLocaleDateString(loc, { weekday: 'long' }).toUpperCase(), 10, 20);
    battery(c, 128, 10, 0.8, '#7fd67f', true, t);
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(8, 26); c.lineTo(W - 8, 26); c.stroke();
    c.textAlign = 'right'; c.fillStyle = '#aab'; c.font = F(10);
    c.fillText(now.toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' }), W - 10, 40);
    plate(c, 6, 46, 118, 52, ORANGE, 10);
    const hd = h12 ? ((hh + 11) % 12) + 1 : hh;
    sevenSeg(c, `${pad(hd)}:${pad(now.getMinutes())}`, 12, 51, 22, 42, '#111', 'rgba(0,0,0,.13)', now.getMilliseconds() < 500);
    if (h12) { c.textAlign = 'left'; c.fillStyle = '#111'; c.font = F(9, 'bold'); c.fillText(hh < 12 ? 'AM' : 'PM', 106, 94); }
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(15, 'bold'); c.fillText(`${weather.temp}°`, 148, 88);
    const day = hh >= 6 && hh < 20;
    if (day) sunIcon(c, 150, 58, 6, t, '#ffd34d'); else drawMoon(c, 150, 58, 7, moonPhase(now), '#e8e8f0', '#2a2a36');
    cloudIcon(c, 142 + Math.sin(t * 0.7) * 3, 68, 9, '#c9ced8');
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(14, 'italic bold'); c.fillText(uk ? 'КИЇВ' : 'KYIV', 10, 122);
    c.save(); c.beginPath(); c.rect(66, 112, touch ? 24 : 40, 10); c.clip(); stripes(c, 62, 113, 7, t, '#5a4a20'); c.restore();
    if (touch) { c.fillStyle = '#aab'; c.font = F(8); c.textAlign = 'right'; c.fillText(`${uk ? 'в кімнаті' : 'indoor'} ${sensors.temp.toFixed(1)}°`, W - 10, 122); }
    c.strokeStyle = '#2a2f3a'; c.beginPath(); c.moveTo(8, 128); c.lineTo(W - 8, 128); c.stroke();
    horizonIcon(c, 44, 152, true, '#ffd34d', t); horizonIcon(c, 126, 152, false, ORANGE, t + 1);
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(11); c.fillText(weather.sunrise, 44, 172); c.fillText(weather.sunset, 126, 172);
    const [cityName, tz] = CITIES[this.settings.city];
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(12, 'italic bold'); c.fillText(cityName, 10, 208);
    plate(c, 92, 192, 72, 26, ORANGE, 8);
    c.textAlign = 'center'; c.fillStyle = '#111'; c.font = F(17, 'bold'); c.fillText(tzTime(tz, now), 128, 211);
    c.strokeStyle = '#2a2f3a'; c.beginPath(); c.moveTo(8, 226); c.lineTo(W - 8, 226); c.stroke();
    // TFT: компактний віджет Claude між містом і шкалами; touch — великий унизу
    const gy = touch ? 268 : 284;
    if (!touch) this.drawClaude(c, 8, 232, W - 16, true, t);
    const hx = 42, r = 22, hum = weather.hum * k + Math.sin(t * 1.3) * 0.6;
    c.lineWidth = 5; c.strokeStyle = '#2a2f3a'; c.beginPath(); c.arc(hx, gy, r, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
    c.strokeStyle = ORANGE; c.beginPath(); c.arc(hx, gy, r, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * Math.max(0, hum) / 100)); c.stroke();
    c.fillStyle = '#fff'; c.font = F(11); c.textAlign = 'center'; c.fillText(`${Math.round(weather.hum * k)}%`, hx, gy + 4);
    c.fillStyle = '#889'; c.font = F(7); c.fillText('HUMIDITY', hx, gy + 30);
    const wx = 128;
    c.lineWidth = 1.5; c.strokeStyle = '#667'; c.beginPath(); c.arc(wx, gy, r, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(wx + Math.cos(a) * (r - 4), gy + Math.sin(a) * (r - 4)); c.lineTo(wx + Math.cos(a) * r, gy + Math.sin(a) * r); c.stroke(); }
    const wv = Math.min(weather.wind, 60) * k + Math.sin(t * 5) * 0.8 + Math.sin(t * 1.7) * 1.2, wa = -Math.PI / 2 + wv / 60 * Math.PI * 2;
    c.strokeStyle = ORANGE; c.lineWidth = 3; c.beginPath(); c.moveTo(wx, gy); c.lineTo(wx + Math.cos(wa) * (r - 5), gy + Math.sin(wa) * (r - 5)); c.stroke();
    c.fillStyle = ORANGE; c.beginPath(); c.arc(wx, gy, 2.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.font = F(10); c.fillText(`${Math.round(weather.wind * k)}`, wx, gy + 15);
    c.fillStyle = '#889'; c.font = F(7); c.fillText('WIND km/h', wx, gy + 30);
    drawMoon(c, 85, gy - 6, 9, moonPhase(now));
    if (touch) {
      this.drawClaude(c, 8, 302, W - 16, false, t);
      // рядок сенсорів: горизонт · барометр · світло · мікрофон
      this.miniHorizon(c, 22, 366, 10);
      c.textAlign = 'left'; c.fillStyle = '#aab'; c.font = F(7);
      c.fillText(`${sensors.pressure.toFixed(0)} hPa ${sensors.trend > 0.2 ? '↑' : sensors.trend < -0.2 ? '↓' : '→'}`, 40, 364);
      c.fillText(`${Math.round(sensors.lux)} lx`, 40, 373);
      c.fillText('MIC', 110, 364); for (let i = 0; i < 8; i++) { c.fillStyle = i / 8 < sensors.mic ? ORANGE : '#2a2f3a'; c.fillRect(128 + i * 4, 366 - i * 1.2, 3, 4 + i * 1.2); }
    }
  }
  miniHorizon(c, x, y, r) {
    c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
    c.translate(x, y); c.rotate(sensors.roll * Math.PI / 180);
    const off = sensors.pitch / 45 * r;
    c.fillStyle = '#2b5c8a'; c.fillRect(-r * 2, -r * 2, r * 4, r * 2 + off);
    c.fillStyle = '#7a4a1e'; c.fillRect(-r * 2, off, r * 4, r * 2);
    c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.moveTo(-r * 2, off); c.lineTo(r * 2, off); c.stroke();
    c.restore();
    c.strokeStyle = ORANGE; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - r * 0.6, y); c.lineTo(x - r * 0.2, y); c.moveTo(x + r * 0.2, y); c.lineTo(x + r * 0.6, y); c.stroke();
    c.strokeStyle = '#667'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  }
  drawDetails(c, now, t, H) {
    const uk = this.lang === 'uk';
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.fillText(uk ? 'ПОГОДА · КИЇВ' : 'WEATHER · KYIV', 10, 22);
    const tiles = [[`${weather.temp}°C`, uk ? 'температура' : 'temp'], [`${weather.hum}%`, uk ? 'вологість' : 'humidity'], [`${weather.wind}`, 'km/h'], [weather.sunrise, uk ? 'схід' : 'sunrise'], [weather.sunset, uk ? 'захід' : 'sunset'], [`${Math.round(moonPhase(now) * 100)}%`, uk ? 'місяць' : 'moon']];
    tiles.forEach(([v, l], i) => {
      const x = 10 + (i % 2) * 78, y = 34 + Math.floor(i / 2) * 46;
      c.fillStyle = '#151923'; c.fillRect(x, y, 72, 40); c.fillStyle = ORANGE; c.fillRect(x, y, 2, 40);
      c.fillStyle = '#fff'; c.font = F(15, 'bold'); c.fillText(v, x + 8, y + 20);
      c.fillStyle = '#889'; c.font = F(8); c.fillText(l, x + 8, y + 33);
    });
    const hs = weather.hourly.length ? weather.hourly : Array.from({ length: 24 }, (_, i) => weather.temp + Math.round(Math.sin(i / 24 * Math.PI * 2 - 2) * 4));
    const gx = 10, gy = 180, gw = 150, gh = 70, mn = Math.min(...hs) - 1, mx = Math.max(...hs) + 1;
    c.fillStyle = '#151923'; c.fillRect(gx, gy, gw, gh);
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 1; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(gx, gy + i * gh / 4 + 0.5); c.lineTo(gx + gw, gy + i * gh / 4 + 0.5); c.stroke(); }
    const grow = ease((performance.now() - (this.slide || this.boot)) / 900 + 0.2);
    c.save(); c.beginPath(); c.rect(gx, gy, gw * grow, gh); c.clip();
    c.strokeStyle = ORANGE; c.lineWidth = 2; c.beginPath();
    hs.forEach((v, i) => { const x = gx + i / (hs.length - 1) * gw, y = gy + gh - (v - mn) / (mx - mn) * gh; i ? c.lineTo(x, y) : c.moveTo(x, y); });
    c.stroke(); c.restore();
    const ci = Math.min(now.getHours(), hs.length - 1), cx = gx + ci / (hs.length - 1) * gw, cy = gy + gh - (hs[ci] - mn) / (mx - mn) * gh;
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 2.5 + Math.sin(t * 4) * 0.8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#889'; c.font = F(7); c.fillText('00', gx, gy + gh + 10); c.fillText('12', gx + gw / 2 - 6, gy + gh + 10); c.fillText('23', gx + gw - 10, gy + gh + 10);
    // барометричний прогноз
    const fc = sensors.trend > 0.2 ? (uk ? 'тиск росте → прояснення' : 'pressure rising → clearing') : sensors.trend < -0.2 ? (uk ? 'тиск падає → дощ можливий' : 'pressure falling → rain likely') : (uk ? 'тиск стабільний' : 'pressure steady');
    c.fillStyle = '#151923'; c.fillRect(10, 272, 150, 30); c.fillStyle = '#7aa2f7'; c.fillRect(10, 272, 2, 30);
    c.fillStyle = '#fff'; c.font = F(11, 'bold'); c.fillText(`${sensors.pressure.toFixed(1)} hPa`, 18, 285);
    c.fillStyle = '#aab'; c.font = F(7); c.fillText(fc, 18, 296);
    const busy = this.refreshing && performance.now() - this.refreshing < 1500;
    c.fillStyle = busy ? '#3a2d10' : ORANGE; c.fillRect(30, 344, 110, 22);
    c.fillStyle = busy ? ORANGE : '#111'; c.font = F(11, 'bold'); c.textAlign = 'center';
    c.fillText(busy ? '· · ·' : (uk ? 'ОНОВИТИ' : 'REFRESH'), 85, 359);
    c.fillStyle = '#556'; c.font = F(7); c.fillText(weather.live ? 'open-meteo · live' : 'static', 85, 336);
  }
  drawSensors(c, now, t, H) {
    const uk = this.lang === 'uk';
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.fillText(uk ? 'СЕНСОРИ' : 'SENSORS', 10, 22);
    // штучний горизонт (IMU)
    c.fillStyle = '#151923'; c.fillRect(10, 32, 72, 72);
    this.miniHorizon(c, 46, 68, 28);
    c.fillStyle = '#889'; c.font = F(7); c.fillText(`roll ${sensors.roll.toFixed(0)}°  pitch ${sensors.pitch.toFixed(0)}°`, 12, 100);
    // BME280
    const tiles = [[`${sensors.temp.toFixed(1)}°C`, 'BME280 · temp'], [`${Math.round(sensors.hum)}%`, 'BME280 · hum'], [`${sensors.pressure.toFixed(0)} hPa`, `BME280 · ${sensors.alt} m`], [`${Math.round(sensors.lux)} lx`, 'VEML7700']];
    tiles.forEach(([v, l], i) => {
      const x = 88, y = 32 + i * 18;
      c.fillStyle = '#fff'; c.font = F(10, 'bold'); c.textAlign = 'left'; c.fillText(v, x, y + 10);
      c.fillStyle = '#667'; c.font = F(6); c.textAlign = 'right'; c.fillText(l, 160, y + 10);
    });
    // мікрофон VU + графік
    c.textAlign = 'left'; c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'мікрофон PDM' : 'PDM mic', 10, 120);
    this.micHist = this.micHist || []; this.micHist.push(sensors.mic); if (this.micHist.length > 60) this.micHist.shift();
    c.fillStyle = '#151923'; c.fillRect(10, 124, 150, 30);
    this.micHist.forEach((v, i) => { c.fillStyle = v > 0.5 ? '#ef4444' : ORANGE; c.fillRect(12 + i * 2.45, 152 - v * 26, 1.8, v * 26); });
    // гіроскоп: трасування нахилу
    c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'гіроскоп LSM6DSOX' : 'LSM6DSOX gyro', 10, 170);
    c.fillStyle = '#151923'; c.fillRect(10, 174, 150, 44);
    for (let i = 0; i < 3; i++) { const v = [sensors.roll / 45, sensors.pitch / 45, Math.sin(t * 0.8) * 0.2][i]; c.fillStyle = '#667'; c.font = F(6); c.fillText('XYZ'[i], 14, 186 + i * 13); bar(c, 24, 181 + i * 13, 130, 6, 0.5 + v / 2, [ORANGE, '#7aa2f7', '#22c55e'][i]); c.fillStyle = '#2a2f3a'; c.fillRect(88, 180 + i * 13, 1, 8); }
    // сценарії
    c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'сценарії (тап):' : 'scenarios (tap):', 10, 236);
    const sc = uk ? ['стук → наступна сторінка', 'догори дном → сон', `ніч (${sensors.night ? 'увімк' : 'вимк'}) → автояскравість`, 'струс → тривога'] : ['knock → next page', 'face down → sleep', `night (${sensors.night ? 'on' : 'off'}) → auto-brightness`, 'shake → alert'];
    sc.forEach((s, i) => { const y = 270 + i * 22; c.fillStyle = '#151923'; c.fillRect(10, y, 150, 19); c.fillStyle = ORANGE; c.fillRect(10, y, 2, 19); c.fillStyle = '#ddd'; c.font = F(8); c.fillText(s, 18, y + 13); });
    c.fillStyle = '#556'; c.font = F(6); c.fillText(uk ? 'нахил: телефон — гіроскоп, десктоп — курсор над екраном' : 'tilt: phone — gyro, desktop — cursor over the screen', 10, 250);
    c.fillText(uk ? 'висота — з тиску BME280, автояскравість — з VEML7700' : 'altitude from BME280 pressure, auto-brightness from VEML7700', 10, 259);
  }
  drawSettings(c, t, H) {
    const uk = this.lang === 'uk', st = this.settings;
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.fillText(uk ? 'НАЛАШТУВАННЯ' : 'SETTINGS', 10, 22);
    c.fillStyle = '#889'; c.font = F(9); c.fillText(uk ? 'яскравість' : 'brightness', 16, 52);
    const br = st.autoBright ? 0.25 + 0.75 * Math.min(1, sensors.lux / 250) : st.bright;
    c.fillStyle = '#2a2f3a'; c.fillRect(16, 64, 138, 4); c.fillStyle = ORANGE; c.fillRect(16, 64, 138 * br, 4);
    c.beginPath(); c.arc(16 + 138 * br, 66, 6, 0, Math.PI * 2); c.fill();
    const rows = [[uk ? 'авто (VEML7700)' : 'auto (VEML7700)', st.autoBright, 92], [uk ? 'звук' : 'sound', st.sound, 128], [uk ? 'місто 2' : 'city 2', CITIES[st.city][0], 164], [uk ? 'формат часу' : 'time format', st.h24 ? '24h' : '12h', 200], ['LED', STATE_TEXT[claude.state][uk ? 'uk' : 'en'], 236]];
    for (const [label, val, y] of rows) {
      c.fillStyle = '#151923'; c.fillRect(10, y, 150, 30);
      c.fillStyle = '#ddd'; c.font = F(10); c.textAlign = 'left'; c.fillText(label, 18, y + 19);
      if (typeof val === 'boolean') {
        c.fillStyle = val ? ORANGE : '#444'; c.beginPath(); c.roundRect(122, y + 8, 28, 14, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(val ? 143 : 129, y + 15, 5, 0, Math.PI * 2); c.fill();
      } else { c.fillStyle = label.startsWith('LED') ? STATE_COLORS[claude.state] : ORANGE; c.textAlign = 'right'; c.fillText(val + ' ›', 150, y + 19); }
    }
    c.font = F(8); c.textAlign = 'left';
    const info = [['fw', 'r2-demo 2.0'], ['wifi', 'lander-net ●'], ['ip', '10.0.0.42'], ['uptime', `${Math.floor(t / 3600)}h ${pad(Math.floor(t / 60) % 60)}m ${pad(Math.floor(t) % 60)}s`], ['bat', '16340 · 3.92 V']];
    info.forEach(([k, v], i) => { c.fillStyle = '#667'; c.fillText(k, 16, 288 + i * 13); c.fillStyle = '#bbc'; c.fillText(v, 70, 288 + i * 13); });
  }
  // ---------- e-ink 152×296 ----------
  frameInk(now) {
    const c = this.ctx, W = 152, H = 296, tn = performance.now();
    c.setTransform(1, 0, 0, 1, 0, 0);
    const minute = now.getHours() * 60 + now.getMinutes();
    if (this.inkFlash) {
      const s = (tn - this.inkFlash) / 130;
      if (s < 6) { c.fillStyle = Math.floor(s) % 2 ? INK : PAPER; c.fillRect(0, 0, W, H); return; }
      this.inkFlash = 0; this.inkImage = null;
    }
    if (!this.inkImage) {
      this.inkImage = document.createElement('canvas'); this.inkImage.width = W; this.inkImage.height = H;
      this.drawInk(this.inkImage.getContext('2d'), now); this.inkMinute = minute;
    }
    if (minute !== this.inkMinute) { this.inkMinute = minute; this.inkPartial = tn; this.drawInk(this.inkImage.getContext('2d'), now); }
    c.drawImage(this.inkImage, 0, 0);
    if (this.inkPartial) {
      const s = (tn - this.inkPartial) / 110;
      if (s < 4) { c.fillStyle = Math.floor(s) % 2 ? INK : PAPER; c.fillRect(6, 62, 140, 56); }
      else this.inkPartial = 0;
    }
    c.fillStyle = 'rgba(0,0,0,0.035)'; for (let y = 0; y < H; y += 2) c.fillRect(0, y, W, 1);
  }
  drawInk(c, now) {
    const W = 152, uk = this.lang === 'uk', loc = uk ? 'uk-UA' : 'en-GB';
    c.fillStyle = PAPER; c.fillRect(0, 0, W, 296);
    c.fillStyle = INK; c.fillRect(0, 0, W, 26);
    c.fillStyle = PAPER; c.font = F(13, 'bold'); c.textAlign = 'left';
    c.fillText(now.toLocaleDateString(loc, { weekday: 'short' }).toUpperCase(), 8, 18);
    c.textAlign = 'right'; c.font = F(11); c.fillText(now.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), W - 8, 18);
    battery(c, 8, 34, 0.9, INK, false, 0, 1.2);
    c.textAlign = 'right'; c.fillStyle = INK; c.font = F(10); c.fillText('3.9V', W - 8, 44);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(6.5, 62.5, 139, 55);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 13, 68, 27, 44, INK, null);
    c.textAlign = 'left'; c.fillStyle = INK; c.font = F(15, 'bold'); c.fillText(uk ? 'КИЇВ' : 'KYIV', 8, 142);
    c.textAlign = 'right'; c.font = F(20, 'bold'); c.fillText(`${weather.temp}°`, W - 8, 144);
    c.lineWidth = 1; c.beginPath(); c.moveTo(8, 150); c.lineTo(W - 8, 150); c.stroke();
    horizonIcon(c, 38, 172, true, INK, 0, 1.2); horizonIcon(c, 114, 172, false, INK, 0, 1.2);
    c.textAlign = 'center'; c.fillStyle = INK; c.font = F(12); c.fillText(weather.sunrise, 38, 191); c.fillText(weather.sunset, 114, 191);
    c.fillStyle = INK; c.fillRect(8, 200, W - 16, 22);
    c.fillStyle = PAPER; c.textAlign = 'left'; c.font = F(11, 'bold'); c.fillText('MUMBAI', 13, 215);
    c.textAlign = 'right'; c.font = F(14, 'bold'); c.fillText(tzTime('Asia/Kolkata', now), W - 13, 216);
    c.fillStyle = INK; c.textAlign = 'left'; c.font = F(9); c.fillText('HUM', 8, 240);
    c.strokeRect(34.5, 231.5, 56, 10); c.fillRect(36, 233, 53 * weather.hum / 100, 7); c.fillText(`${weather.hum}%`, 96, 240);
    c.fillText('WIND', 8, 258); c.font = F(13, 'bold'); c.fillText(`${weather.wind}`, 38, 259); c.font = F(9); c.fillText('km/h', 60, 258);
    drawMoon(c, W - 20, 250, 11, moonPhase(now), INK, PAPER); c.beginPath(); c.arc(W - 20, 250, 11, 0, Math.PI * 2); c.stroke();
    // Claude Code: стан + ліміт (e-ink показує статично)
    c.fillStyle = INK; c.font = F(9, 'bold'); c.textAlign = 'left'; c.fillText('CLAUDE', 8, 277);
    c.beginPath(); c.arc(56, 273.5, 4, 0, Math.PI * 2); if (claude.state === 'working') c.fill(); else c.stroke();
    if (claude.state === 'question') { c.font = F(8, 'bold'); c.textAlign = 'center'; c.fillText('!', 56, 276.5); c.textAlign = 'left'; }
    c.font = F(9); c.fillText(STATE_TEXT[claude.state][uk ? 'uk' : 'en'], 64, 277);
    c.strokeRect(8.5, 282.5, 100, 7); c.fillRect(10, 284, 97 * claude.used5h, 4);
    c.font = F(8); c.fillText(`5h ${Math.round(claude.used5h * 100)}%`, 112, 289);
  }
}
