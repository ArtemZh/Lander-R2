// Емулятор екрана Lander R2 — усе малюється кодом, без фотографій.
// original: TFT 170×320, анімований; touch: те саме + жести, сторінки, налаштування;
// ink: e-ink 122×250, чорне на білому, часткові/повні оновлення з «миготінням».
const ORANGE = '#f5a623', DARK = '#0a0c11', PAPER = '#f4f4ef', INK = '#111';

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
      if (shadow) { ctx.fillStyle = shadow; ctx.fillRect(cx + 1, y + h * 0.28, 3, 3); ctx.fillRect(cx + 1, y + h * 0.66, 3, 3); }
      if (colonOn) { ctx.fillStyle = color; ctx.fillRect(cx + 1, y + h * 0.28, 3, 3); ctx.fillRect(cx + 1, y + h * 0.66, 3, 3); }
      cx += 7; continue;
    }
    if (shadow) digit(ctx, cx, y, w, h, 8, shadow);
    digit(ctx, cx, y, w, h, +ch, color);
    cx += w + 4;
  }
}

export function moonPhase(date = new Date()) {
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date - ref) / 86400000;
  return ((days % 29.53) + 29.53) % 29.53 / 29.53; // 0 — новий, 0.5 — повний
}
function drawMoon(ctx, cx, cy, r, phase, light = '#eee', dark = '#222') {
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light;
  const k = Math.cos(phase * 2 * Math.PI);
  const waxing = phase < 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !waxing);
  ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing);
  ctx.fill();
}
// Скошена плашка, як на оригінальному фоні
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
function horizonIcon(ctx, x, y, up, color, t) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.stroke();
  const bob = Math.sin(t * 1.5) * 1.2;
  ctx.beginPath(); ctx.arc(x, y + bob, 6, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y - 13 + bob); ctx.lineTo(x, y - 9 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 3, y - (up ? 10 : 12) + bob); ctx.lineTo(x, y - (up ? 13 : 9) + bob); ctx.lineTo(x + 3, y - (up ? 10 : 12) + bob); ctx.stroke();
}
function stripes(ctx, x, y, n, t, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) { const p = ((t * 12 + i * 6) % (n * 6)); ctx.beginPath(); ctx.moveTo(x + p, y); ctx.lineTo(x + p + 4, y); ctx.lineTo(x + p, y + 8); ctx.lineTo(x + p - 4, y + 8); ctx.fill(); }
}
function battery(ctx, x, y, level, color, charging, t) {
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 16, 8); ctx.fillStyle = color; ctx.fillRect(x + 17, y + 2, 2, 5);
  const bars = charging ? Math.floor((t * 2) % 5) : Math.round(level * 4);
  for (let i = 0; i < bars; i++) ctx.fillRect(x + 2 + i * 3.5, y + 2, 2.5, 5);
}

const pad = n => String(n).padStart(2, '0');
const tzTime = (tz, d) => d.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const CITIES = [['MUMBAI', 'Asia/Kolkata'], ['TOKYO', 'Asia/Tokyo'], ['LONDON', 'Europe/London'], ['NEW YORK', 'America/New_York']];
const F = (px, b = '') => `${b} ${px}px "Share Tech Mono", monospace`;

export const weather = { temp: 18, hum: 62, wind: 11, sunrise: '06:48', sunset: '18:52', live: false, hourly: [] };
export async function loadWeather() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.45&longitude=30.52&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto&forecast_days=1');
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    Object.assign(weather, {
      temp: Math.round(j.current.temperature_2m), hum: Math.round(j.current.relative_humidity_2m),
      wind: Math.round(j.current.wind_speed_10m),
      sunrise: j.daily.sunrise[0].slice(11, 16), sunset: j.daily.sunset[0].slice(11, 16), live: true,
      hourly: j.hourly.temperature_2m.map(Math.round),
    });
  } catch (e) { console.info('Open-Meteo недоступний, статичні дані', e.message); }
}

export class Screen {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.version = 'original'; this.lang = 'uk';
    this.t0 = performance.now(); this.boot = 0;
    this.page = 0; this.pageX = 0; this.slide = 0; this.slideDx = 0;
    this.settings = { bright: 0.85, sound: true, city: 0, h24: true };
    this.ripples = []; this.sliderDrag = false; this.refreshing = 0;
    this.inkFlash = 0; this.inkPartial = 0; this.inkMinute = -1; this.inkImage = null; this.inkLang = null;
    this.onDraw = null;
    this.setupPointer();
    const loop = () => { this.frame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  setVersion(v) {
    this.version = v; this.page = 0; this.pageX = 0; this.slide = 0;
    const [w, h] = v === 'ink' ? [122, 250] : [170, 320];
    this.canvas.width = w; this.canvas.height = h;
    this.boot = performance.now(); this.inkImage = null;
    if (v === 'ink') this.fullRefresh();
  }
  draw() { this.inkImage = null; } // зміна мови/даних: e-ink перемалює кадр, TFT малює сам
  // ---------- жести (touch) ----------
  setupPointer() {
    const c = this.canvas;
    const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
    let start = null;
    c.addEventListener('pointerdown', e => {
      if (this.version !== 'touch') return;
      start = { p: pos(e), moved: false }; c.setPointerCapture(e.pointerId);
      if (this.page === 2) this.dragSlider(start.p, true);
    });
    c.addEventListener('pointermove', e => {
      if (!start) return; const p = pos(e);
      if (Math.abs(p[0] - start.p[0]) > 6) start.moved = true;
      if (this.sliderDrag) this.dragSlider(p, false);
      else if (start.moved) this.pageX = p[0] - start.p[0];
    });
    const up = e => {
      if (!start) return; const p = pos(e);
      if (this.sliderDrag) { this.sliderDrag = false; start = null; return; }
      const dx = p[0] - start.p[0];
      if (Math.abs(dx) > 40) this.goPage(this.page - Math.sign(dx), dx);
      else if (!start.moved) this.tap(p);
      this.pageX = 0; start = null;
    };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  }
  goPage(n, dragDx = 0) {
    const to = Math.max(0, Math.min(2, n));
    this.slideDx = to === this.page ? dragDx : (this.page - to) * 170 + dragDx;
    this.page = to; this.pageX = 0; this.slide = performance.now();
  }
  tap([x, y]) {
    this.ripples.push({ x, y, t: performance.now() });
    if (this.page === 0) {
      if (y > 230) this.goPage(1);
      else if (y > 40 && y < 110) this.settings.h24 = !this.settings.h24;
      else if (y > 190 && y < 225) this.settings.city = (this.settings.city + 1) % CITIES.length;
    } else if (this.page === 1) {
      if (y > 280) { this.refreshing = performance.now(); loadWeather().then(() => { this.refreshing = 0; }); }
    } else {
      if (y > 92 && y < 122) this.settings.sound = !this.settings.sound;
      else if (y > 128 && y < 158) this.settings.city = (this.settings.city + 1) % CITIES.length;
      else if (y > 164 && y < 194) this.settings.h24 = !this.settings.h24;
    }
  }
  dragSlider([x, y], begin) {
    if (begin && !(y > 50 && y < 86)) return;
    this.sliderDrag = true; this.settings.bright = Math.max(0.15, Math.min(1, (x - 16) / 138));
  }
  // ---------- e-ink ----------
  fullRefresh() { this.inkFlash = performance.now(); }

  frame() {
    const now = new Date(), t = (performance.now() - this.t0) / 1000;
    if (this.version === 'ink') this.frameInk(now);
    else this.frameTft(now, t);
    this.onDraw?.();
  }
  // ---------- TFT / touch ----------
  frameTft(now, t) {
    const c = this.ctx, W = 170, H = 320, since = (performance.now() - this.boot) / 1000;
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (since < 1.6) return this.drawBoot(c, since);
    const k = ease((since - 1.6) / 1.2);
    c.fillStyle = DARK; c.fillRect(0, 0, W, H);
    if (this.version === 'touch') {
      let dx = this.pageX;
      if (this.slide) { const s = (performance.now() - this.slide) / 260; if (s < 1) dx = (1 - ease(s)) * this.slideDx; else this.slide = 0; }
      c.save(); c.translate(dx, 0); this.drawPage(c, this.page, now, t, k); c.restore();
      if (dx !== 0) {
        const p = dx > 0 ? this.page - 1 : this.page + 1;
        if (p >= 0 && p <= 2) { c.save(); c.translate(dx - Math.sign(dx) * W, 0); this.drawPage(c, p, now, t, 1); c.restore(); }
      }
      for (let i = 0; i < 3; i++) { c.fillStyle = i === this.page ? ORANGE : '#444'; c.beginPath(); c.arc(70 + i * 15, 316, 2, 0, Math.PI * 2); c.fill(); }
      const tn = performance.now();
      this.ripples = this.ripples.filter(r => tn - r.t < 500);
      for (const r of this.ripples) { const q = (tn - r.t) / 500; c.strokeStyle = `rgba(245,166,35,${1 - q})`; c.lineWidth = 2; c.beginPath(); c.arc(r.x, r.y, 4 + q * 26, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = `rgba(0,0,0,${1 - this.settings.bright})`; c.fillRect(0, 0, W, H);
    } else {
      this.drawPage(c, 0, now, t, k);
    }
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < H; y += 3) c.fillRect(0, y, W, 1);
  }
  drawBoot(c, s) {
    c.fillStyle = DARK; c.fillRect(0, 0, 170, 320);
    c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.textAlign = 'center';
    c.fillText('LANDER R2', 85, 140);
    c.fillStyle = '#888'; c.font = F(9);
    c.fillText(this.version === 'touch' ? 'ESP32-S3 // AMOLED' : 'PHOTON 2 // ST7789', 85, 156);
    c.strokeStyle = '#444'; c.strokeRect(35.5, 170.5, 100, 6);
    c.fillStyle = ORANGE; c.fillRect(37, 172, 97 * Math.min(1, s / 1.3), 3);
    const msgs = ['wifi ...', 'webhook ...', 'weather ok', 'moon ok'];
    c.fillStyle = '#6a6'; c.textAlign = 'left';
    msgs.slice(0, Math.floor(s / 0.4)).forEach((m, i) => c.fillText('> ' + m, 36, 195 + i * 12));
  }
  drawPage(c, p, now, t, k) {
    if (p === 0) this.drawMain(c, now, t, k);
    else if (p === 1) this.drawDetails(c, now, t);
    else this.drawSettings(c, t);
  }
  drawMain(c, now, t, k) {
    const W = 170, loc = this.lang === 'uk' ? 'uk-UA' : 'en-GB', uk = this.lang === 'uk';
    const hh = now.getHours(), h12 = !this.settings.h24 && this.version === 'touch';
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 1; c.strokeRect(3.5, 3.5, W - 7, 313);
    c.strokeStyle = ORANGE; c.lineWidth = 2;
    for (const [x, y, sx, sy] of [[4, 4, 1, 1], [W - 4, 4, -1, 1], [4, 316, 1, -1], [W - 4, 316, -1, -1]]) { c.beginPath(); c.moveTo(x, y + 10 * sy); c.lineTo(x, y); c.lineTo(x + 10 * sx, y); c.stroke(); }
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
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(15, 'bold');
    c.fillText(`${weather.temp}°`, 148, 88);
    const day = hh >= 6 && hh < 20;
    if (day) sunIcon(c, 150, 58, 6, t, '#ffd34d'); else drawMoon(c, 150, 58, 7, moonPhase(now), '#e8e8f0', '#2a2a36');
    cloudIcon(c, 142 + Math.sin(t * 0.7) * 3, 68, 9, '#c9ced8');
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(14, 'italic bold');
    c.fillText(uk ? 'КИЇВ' : 'KYIV', 10, 122);
    c.save(); c.beginPath(); c.rect(70, 112, 40, 10); c.clip(); stripes(c, 66, 113, 7, t, '#5a4a20'); c.restore();
    c.strokeStyle = '#2a2f3a'; c.beginPath(); c.moveTo(8, 128); c.lineTo(W - 8, 128); c.stroke();
    horizonIcon(c, 44, 152, true, '#ffd34d', t); horizonIcon(c, 126, 152, false, ORANGE, t + 1);
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(11);
    c.fillText(weather.sunrise, 44, 172); c.fillText(weather.sunset, 126, 172);
    const [cityName, tz] = CITIES[this.settings.city];
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(12, 'italic bold'); c.fillText(cityName, 10, 208);
    plate(c, 92, 192, 72, 26, ORANGE, 8);
    c.textAlign = 'center'; c.fillStyle = '#111'; c.font = F(17, 'bold'); c.fillText(tzTime(tz, now), 128, 211);
    c.strokeStyle = '#2a2f3a'; c.beginPath(); c.moveTo(8, 226); c.lineTo(W - 8, 226); c.stroke();
    const hx = 42, hy = 268, r = 22, hum = weather.hum * k + Math.sin(t * 1.3) * 0.6;
    c.lineWidth = 5; c.strokeStyle = '#2a2f3a'; c.beginPath(); c.arc(hx, hy, r, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
    c.strokeStyle = ORANGE; c.beginPath(); c.arc(hx, hy, r, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * Math.max(0, hum) / 100)); c.stroke();
    c.fillStyle = '#fff'; c.font = F(11); c.textAlign = 'center'; c.fillText(`${Math.round(weather.hum * k)}%`, hx, hy + 4);
    c.fillStyle = '#889'; c.font = F(7); c.fillText('HUMIDITY', hx, hy + 30);
    const wx = 128, wy = 268;
    c.lineWidth = 1.5; c.strokeStyle = '#667'; c.beginPath(); c.arc(wx, wy, r, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(wx + Math.cos(a) * (r - 4), wy + Math.sin(a) * (r - 4)); c.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); c.stroke(); }
    const wv = Math.min(weather.wind, 60) * k + Math.sin(t * 5) * 0.8 + Math.sin(t * 1.7) * 1.2;
    const wa = -Math.PI / 2 + wv / 60 * Math.PI * 2;
    c.strokeStyle = ORANGE; c.lineWidth = 3; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(wa) * (r - 5), wy + Math.sin(wa) * (r - 5)); c.stroke();
    c.fillStyle = ORANGE; c.beginPath(); c.arc(wx, wy, 2.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.font = F(10); c.fillText(`${Math.round(weather.wind * k)}`, wx, wy + 15);
    c.fillStyle = '#889'; c.font = F(7); c.fillText('WIND km/h', wx, wy + 30);
    drawMoon(c, 85, 262, 9, moonPhase(now));
    if (this.version === 'touch') { c.fillStyle = '#556'; c.font = F(7); c.fillText(uk ? 'тап: шкали · місто · час' : 'tap: gauges · city · clock', 85, 309); }
  }
  drawDetails(c, now, t) {
    const uk = this.lang === 'uk';
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.fillText(uk ? 'ПОГОДА · КИЇВ' : 'WEATHER · KYIV', 10, 22);
    const tiles = [[`${weather.temp}°C`, uk ? 'температура' : 'temp'], [`${weather.hum}%`, uk ? 'вологість' : 'humidity'], [`${weather.wind}`, 'km/h'], [weather.sunrise, uk ? 'схід' : 'sunrise'], [weather.sunset, uk ? 'захід' : 'sunset'], [`${Math.round(moonPhase(now) * 100)}%`, uk ? 'місяць' : 'moon']];
    tiles.forEach(([v, l], i) => {
      const x = 10 + (i % 2) * 78, y = 34 + Math.floor(i / 2) * 46;
      c.fillStyle = '#151923'; c.fillRect(x, y, 72, 40);
      c.fillStyle = ORANGE; c.fillRect(x, y, 2, 40);
      c.fillStyle = '#fff'; c.font = F(15, 'bold'); c.fillText(v, x + 8, y + 20);
      c.fillStyle = '#889'; c.font = F(8); c.fillText(l, x + 8, y + 33);
    });
    const hs = weather.hourly.length ? weather.hourly : Array.from({ length: 24 }, (_, i) => weather.temp + Math.round(Math.sin(i / 24 * Math.PI * 2 - 2) * 4));
    const gx = 10, gy = 180, gw = 150, gh = 60, mn = Math.min(...hs) - 1, mx = Math.max(...hs) + 1;
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
    const busy = this.refreshing && performance.now() - this.refreshing < 1500;
    c.fillStyle = busy ? '#3a2d10' : ORANGE; c.fillRect(30, 284, 110, 22);
    c.fillStyle = busy ? ORANGE : '#111'; c.font = F(11, 'bold'); c.textAlign = 'center';
    c.fillText(busy ? '· · ·' : (uk ? 'ОНОВИТИ' : 'REFRESH'), 85, 299);
    c.fillStyle = '#556'; c.font = F(7); c.fillText(weather.live ? 'open-meteo · live' : 'static', 85, 278);
  }
  drawSettings(c, t) {
    const uk = this.lang === 'uk';
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.fillText(uk ? 'НАЛАШТУВАННЯ' : 'SETTINGS', 10, 22);
    c.fillStyle = '#889'; c.font = F(9); c.fillText(uk ? 'яскравість' : 'brightness', 16, 52);
    c.fillStyle = '#2a2f3a'; c.fillRect(16, 64, 138, 4);
    c.fillStyle = ORANGE; c.fillRect(16, 64, 138 * this.settings.bright, 4);
    c.beginPath(); c.arc(16 + 138 * this.settings.bright, 66, 6, 0, Math.PI * 2); c.fill();
    const rows = [[uk ? 'звук' : 'sound', this.settings.sound, 92], [uk ? 'місто 2' : 'city 2', CITIES[this.settings.city][0], 128], [uk ? 'формат часу' : 'time format', this.settings.h24 ? '24h' : '12h', 164]];
    for (const [label, val, y] of rows) {
      c.fillStyle = '#151923'; c.fillRect(10, y, 150, 30);
      c.fillStyle = '#ddd'; c.font = F(10); c.textAlign = 'left'; c.fillText(label, 18, y + 19);
      if (typeof val === 'boolean') {
        c.fillStyle = val ? ORANGE : '#444'; c.beginPath(); c.roundRect(122, y + 8, 28, 14, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(val ? 143 : 129, y + 15, 5, 0, Math.PI * 2); c.fill();
      } else { c.fillStyle = ORANGE; c.textAlign = 'right'; c.fillText(val + ' ›', 150, y + 19); }
    }
    c.font = F(8); c.textAlign = 'left';
    const info = [['fw', 'r2-demo 1.0'], ['wifi', 'lander-net ●'], ['ip', '10.0.0.42'], ['uptime', `${Math.floor(t / 3600)}h ${pad(Math.floor(t / 60) % 60)}m ${pad(Math.floor(t) % 60)}s`]];
    info.forEach(([k, v], i) => { c.fillStyle = '#667'; c.fillText(k, 16, 216 + i * 14); c.fillStyle = '#bbc'; c.fillText(v, 70, 216 + i * 14); });
  }
  // ---------- e-ink 122×250: чорне по білому, оновлення частинами ----------
  frameInk(now) {
    const c = this.ctx, W = 122, H = 250, tn = performance.now();
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
      if (s < 4) { c.fillStyle = Math.floor(s) % 2 ? INK : PAPER; c.fillRect(6, 58, 110, 46); }
      else this.inkPartial = 0;
    }
    c.fillStyle = 'rgba(0,0,0,0.035)'; for (let y = 0; y < H; y += 2) c.fillRect(0, y, W, 1);
  }
  drawInk(c, now) {
    const W = 122, H = 250, uk = this.lang === 'uk', loc = uk ? 'uk-UA' : 'en-GB';
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
    c.fillStyle = INK; c.fillRect(0, 0, W, 22);
    c.fillStyle = PAPER; c.font = F(11, 'bold'); c.textAlign = 'left';
    c.fillText(now.toLocaleDateString(loc, { weekday: 'short' }).toUpperCase(), 6, 15);
    c.textAlign = 'right'; c.font = F(9); c.fillText(now.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), W - 6, 15);
    battery(c, 6, 28, 0.9, INK, false, 0);
    c.textAlign = 'right'; c.fillStyle = INK; c.font = F(8); c.fillText('3.9V', W - 6, 36);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(6.5, 58.5, 109, 45);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 12, 63, 21, 36, INK, null);
    c.textAlign = 'left'; c.fillStyle = INK; c.font = F(12, 'bold'); c.fillText(uk ? 'КИЇВ' : 'KYIV', 6, 122);
    c.textAlign = 'right'; c.font = F(16, 'bold'); c.fillText(`${weather.temp}°`, W - 6, 124);
    c.lineWidth = 1; c.beginPath(); c.moveTo(6, 130); c.lineTo(W - 6, 130); c.stroke();
    horizonIcon(c, 30, 150, true, INK, 0); horizonIcon(c, 92, 150, false, INK, 0);
    c.textAlign = 'center'; c.fillStyle = INK; c.font = F(10); c.fillText(weather.sunrise, 30, 166); c.fillText(weather.sunset, 92, 166);
    c.fillStyle = INK; c.fillRect(6, 174, W - 12, 18);
    c.fillStyle = PAPER; c.textAlign = 'left'; c.font = F(9, 'bold'); c.fillText('MUMBAI', 10, 186);
    c.textAlign = 'right'; c.font = F(12, 'bold'); c.fillText(tzTime('Asia/Kolkata', now), W - 10, 187);
    c.fillStyle = INK; c.textAlign = 'left'; c.font = F(8); c.fillText('HUM', 6, 208);
    c.strokeStyle = INK; c.strokeRect(30.5, 200.5, 50, 8); c.fillRect(32, 202, 47 * weather.hum / 100, 5);
    c.fillText(`${weather.hum}%`, 84, 208);
    c.fillText('WIND', 6, 226); c.font = F(11, 'bold'); c.fillText(`${weather.wind}`, 30, 227); c.font = F(8); c.fillText('km/h', 48, 226);
    c.beginPath(); c.moveTo(78, 223); c.lineTo(90, 223); c.moveTo(86, 219); c.lineTo(90, 223); c.lineTo(86, 227); c.stroke();
    drawMoon(c, W - 16, 222, 9, moonPhase(now), INK, PAPER);
    c.beginPath(); c.arc(W - 16, 222, 9, 0, Math.PI * 2); c.stroke();
    c.font = F(7); c.textAlign = 'center'; c.fillStyle = INK;
    c.fillText((uk ? 'оновлено ' : 'updated ') + tzTime('Europe/Kyiv', now), W / 2, 244);
  }
}
