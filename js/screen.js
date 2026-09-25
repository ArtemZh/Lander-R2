// Емулятор екрана Lander R2: BMP-фон, семисегментний час, погода, місяць
const ORANGE = '#f5a623';

// Простий парсер 24-бітного BMP (знизу вгору, рядки вирівняні до 4 байт)
export async function loadBmp(url) {
  const buf = await (await fetch(url)).arrayBuffer();
  const dv = new DataView(buf);
  const off = dv.getUint32(10, true), w = dv.getInt32(18, true), hRaw = dv.getInt32(22, true);
  const bpp = dv.getUint16(28, true);
  if (bpp !== 24) throw new Error('BMP: only 24-bit supported');
  const h = Math.abs(hRaw), stride = Math.ceil((w * 3) / 4) * 4;
  const img = new ImageData(w, h);
  for (let y = 0; y < h; y++) {
    const row = off + (hRaw > 0 ? h - 1 - y : y) * stride;
    for (let x = 0; x < w; x++) {
      const s = row + x * 3, d = (y * w + x) * 4;
      img.data[d] = dv.getUint8(s + 2); img.data[d + 1] = dv.getUint8(s + 1); img.data[d + 2] = dv.getUint8(s); img.data[d + 3] = 255;
    }
  }
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').putImageData(img, 0, 0);
  return c;
}

// Сегменти: a b c d e f g
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
function sevenSeg(ctx, str, x, y, w, h, color, shadow) {
  let cx = x;
  for (const ch of str) {
    if (ch === ':') {
      ctx.fillStyle = color;
      ctx.fillRect(cx + 1, y + h * 0.28, 3, 3); ctx.fillRect(cx + 1, y + h * 0.66, 3, 3);
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
  const k = Math.cos(phase * 2 * Math.PI); // 1 → новий, -1 → повний
  const waxing = phase < 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !waxing);
  ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing);
  ctx.fill();
}

const pad = n => String(n).padStart(2, '0');
const tzTime = (tz, d) => d.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });

export const weather = { temp: 18, hum: 62, wind: 11, sunrise: '06:48', sunset: '18:52', live: false };
export async function loadWeather() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.45&longitude=30.52&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=sunrise,sunset&timezone=auto');
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    Object.assign(weather, {
      temp: Math.round(j.current.temperature_2m), hum: Math.round(j.current.relative_humidity_2m),
      wind: Math.round(j.current.wind_speed_10m),
      sunrise: j.daily.sunrise[0].slice(11, 16), sunset: j.daily.sunset[0].slice(11, 16), live: true,
    });
  } catch (e) { console.info('Open-Meteo недоступний, статичні дані', e.message); }
}

export class Screen {
  constructor(canvas, bg) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.bg = bg;
    this.page = 0; this.version = 'original'; this.lang = 'uk';
    let x0 = null;
    canvas.addEventListener('pointerdown', e => { x0 = e.clientX; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointerup', e => {
      if (x0 !== null && this.version === 'touch' && Math.abs(e.clientX - x0) > 25) { this.page = 1 - this.page; this.draw(); }
      x0 = null;
    });
  }
  setVersion(v) {
    this.version = v; this.page = 0;
    const [w, h] = v === 'ink' ? [250, 122] : [170, 320];
    this.canvas.width = w; this.canvas.height = h;
    this.draw();
  }
  draw(now = new Date()) {
    if (this.version === 'ink') return this.drawInk(now);
    if (this.page === 1) return this.drawSettings();
    const c = this.ctx, W = 170;
    if (this.bg) c.drawImage(this.bg, 0, 0); else { c.fillStyle = '#000'; c.fillRect(0, 0, 170, 320); }
    const loc = this.lang === 'uk' ? 'uk-UA' : 'en-GB';
    const F = (px, b = '') => `${b} ${px}px "Share Tech Mono", monospace`;
    // День тижня й дата — у верхніх «лініях» фону
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(12, 'bold');
    c.fillText(now.toLocaleDateString(loc, { weekday: 'long' }).toUpperCase(), 6, 12);
    c.textAlign = 'right'; c.fillStyle = '#ccc'; c.font = F(10);
    c.fillText(now.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), 166, 32);
    // Час на помаранчевій плашці: «тінь 88:88» + чорні цифри
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 9, 48, 22, 44, '#111', 'rgba(0,0,0,.13)');
    // Температура праворуч від плашки
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(15, 'bold');
    c.fillText(`${weather.temp}°`, 148, 76);
    // Місто 1 замість напису з фону
    c.fillStyle = '#000'; c.fillRect(2, 116, 112, 20);
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(14, 'italic bold');
    c.fillText(this.lang === 'uk' ? 'КИЇВ' : 'KYIV', 8, 132);
    // Схід / захід під іконками
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(11);
    c.fillText(weather.sunrise, 42, 178); c.fillText(weather.sunset, 128, 178);
    // Місто 2 — час на помаранчевій плашці
    c.fillStyle = '#111'; c.font = F(18, 'bold');
    c.fillText(tzTime('Asia/Kolkata', now), 122, 210);
    // Вологість — дуга
    const hx = 42, hy = 268, r = 22;
    c.lineWidth = 5; c.strokeStyle = '#333';
    c.beginPath(); c.arc(hx, hy, r, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
    c.strokeStyle = ORANGE;
    c.beginPath(); c.arc(hx, hy, r, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * weather.hum / 100)); c.stroke();
    c.fillStyle = '#fff'; c.font = F(11); c.fillText(`${weather.hum}%`, hx, hy + 4);
    // Вітер — кругла шкала
    const wx = 128, wy = 268;
    c.lineWidth = 1.5; c.strokeStyle = '#666'; c.beginPath(); c.arc(wx, wy, r, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      c.beginPath(); c.moveTo(wx + Math.cos(a) * (r - 4), wy + Math.sin(a) * (r - 4)); c.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); c.stroke();
    }
    const wa = -Math.PI / 2 + Math.min(weather.wind, 60) / 60 * Math.PI * 2;
    c.strokeStyle = ORANGE; c.lineWidth = 3;
    c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(wa) * (r - 5), wy + Math.sin(wa) * (r - 5)); c.stroke();
    c.fillStyle = '#fff'; c.font = F(10); c.fillText(`${weather.wind}`, wx, wy + 14);
    // Місяць
    drawMoon(c, 85, 262, 9, moonPhase(now));
  }
  drawSettings() {
    const c = this.ctx;
    c.fillStyle = '#0b0b0b'; c.fillRect(0, 0, 170, 320);
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = 'bold 14px "Share Tech Mono", monospace';
    c.fillText(this.lang === 'uk' ? 'НАЛАШТУВАННЯ' : 'SETTINGS', 12, 28);
    const items = this.lang === 'uk'
      ? ['Яскравість  ▮▮▮▮▯', 'Місто 1     Київ', 'Місто 2     Мумбаї', 'Звук        увімк', 'Wi-Fi       ●', 'Оновлення   10 хв']
      : ['Brightness  ▮▮▮▮▯', 'City 1      Kyiv', 'City 2      Mumbai', 'Sound       on', 'Wi-Fi       ●', 'Refresh     10 min'];
    c.font = '11px "Share Tech Mono", monospace';
    items.forEach((s, i) => {
      c.fillStyle = '#1c1c1c'; c.fillRect(8, 44 + i * 36, 154, 30);
      c.fillStyle = '#ddd'; c.fillText(s, 14, 63 + i * 36);
    });
    c.fillStyle = '#777'; c.textAlign = 'center'; c.fillText('‹ swipe ›', 85, 305);
  }
  drawInk(now) {
    const c = this.ctx;
    c.fillStyle = '#fff'; c.fillRect(0, 0, 250, 122);
    c.fillStyle = '#000'; c.textAlign = 'left';
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 8, 12, 26, 44, '#000', null);
    const loc = this.lang === 'uk' ? 'uk-UA' : 'en-GB';
    c.font = 'bold 13px "Share Tech Mono", monospace';
    c.fillText(now.toLocaleDateString(loc, { weekday: 'short', day: '2-digit', month: 'short' }), 10, 80);
    c.font = '11px "Share Tech Mono", monospace';
    c.fillText(`${this.lang === 'uk' ? 'Київ' : 'Kyiv'} ${weather.temp}°C  ${weather.hum}%  ${weather.wind} km/h`, 10, 98);
    c.fillText(`↑${weather.sunrise} ↓${weather.sunset}  Mumbai ${tzTime('Asia/Kolkata', now)}`, 10, 114);
    c.fillRect(168, 8, 2, 70);
    drawMoon(c, 210, 42, 26, moonPhase(now), '#fff', '#000');
    c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.arc(210, 42, 26, 0, Math.PI * 2); c.stroke();
  }
}
