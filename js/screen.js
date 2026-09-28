// Емулятор екрана Lander R2 — усе малюється кодом, без фотографій.
// touch: AMOLED 240×536 (макет 170×380 у масштабі 1.41), каталог екранів + сценарії;
// ink: e-ink 152×296, чорне на білому, часткові/повні оновлення з «миготінням».
const ORANGE = '#f5a623', DARK = '#0a0c11', PAPER = '#f4f4ef', INK = '#111', BLUE = '#3b82f6', GREEN = '#22c55e', RED = '#ef4444';
export const STATE_COLORS = { working: GREEN, question: RED, idle: ORANGE };
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
  const days = (date - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
  return ((days % 29.53) + 29.53) % 29.53 / 29.53;
}
function drawMoon(ctx, cx, cy, r, phase, light = '#eee', dark = '#222') {
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light;
  const k = Math.cos(phase * 2 * Math.PI), waxing = phase < 0.5;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !waxing);
  ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing); ctx.fill();
}
function plate(ctx, x, y, w, h, color, cut = 8) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + w - cut, y); ctx.lineTo(x + w, y + cut); ctx.lineTo(x + w, y + h); ctx.lineTo(x + cut, y + h); ctx.lineTo(x, y + h - cut); ctx.closePath(); ctx.fill();
}
function sunIcon(ctx, x, y, r, t, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 0.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2)); ctx.lineTo(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5)); ctx.stroke(); }
}
function cloudIcon(ctx, x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.arc(x, y, s * 0.55, Math.PI, 0); ctx.arc(x + s * 0.55, y + s * 0.1, s * 0.45, Math.PI, 0);
  ctx.arc(x - s * 0.5, y + s * 0.15, s * 0.4, Math.PI, 0); ctx.rect(x - s * 0.9, y + s * 0.15, s * 1.9, s * 0.35); ctx.fill();
}
function rainIcon(ctx, x, y, s, color, t) {
  cloudIcon(ctx, x, y, s, color); ctx.strokeStyle = BLUE; ctx.lineWidth = 1.2;
  for (let i = -1; i <= 1; i++) { const dy = ((t * 20 + i * 4) % 8); ctx.beginPath(); ctx.moveTo(x + i * s * 0.4, y + s * 0.6 + dy); ctx.lineTo(x + i * s * 0.4 - 1, y + s * 0.6 + dy + 3); ctx.stroke(); }
}
function wxIcon(ctx, code, x, y, s, t, day = true) {
  if (code <= 1) day ? sunIcon(ctx, x, y, s * 0.5, t, '#ffd34d') : drawMoon(ctx, x, y, s * 0.5, moonPhase(), '#e8e8f0', '#2a2a36');
  else if (code <= 3) { if (day) sunIcon(ctx, x + s * 0.3, y - s * 0.3, s * 0.35, t, '#ffd34d'); cloudIcon(ctx, x, y + s * 0.1, s * 0.8, '#c9ced8'); }
  else if (code >= 71 && code <= 77) { cloudIcon(ctx, x, y, s * 0.8, '#c9ced8'); ctx.fillStyle = '#fff'; for (let i = -1; i <= 1; i++) ctx.fillRect(x + i * s * 0.35, y + s * 0.55 + ((t * 10 + i * 3) % 6), 1.5, 1.5); }
  else if (code >= 95) { cloudIcon(ctx, x, y, s * 0.8, '#8a8f9a'); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.moveTo(x + 1, y + s * 0.3); ctx.lineTo(x - 2, y + s * 0.7); ctx.lineTo(x + 1, y + s * 0.65); ctx.lineTo(x - 1, y + s); ctx.lineTo(x + 3, y + s * 0.55); ctx.lineTo(x, y + s * 0.6); ctx.fill(); }
  else rainIcon(ctx, x, y, s * 0.8, '#8a8f9a', t);
}
function inkWx(c, code, x, y) { // ч/б іконки погоди для e-ink
  c.fillStyle = INK; c.strokeStyle = INK; c.lineWidth = 1.2;
  if (code <= 1) { c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); c.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); c.stroke(); } return; }
  c.fillStyle = PAPER; c.beginPath(); c.arc(x - 3, y, 4, Math.PI, 0); c.arc(x + 2, y - 1, 5, Math.PI, 0); c.rect(x - 7, y, 14, 3); c.fill(); c.stroke();
  c.fillStyle = INK;
  if (code <= 3) return;
  if (code >= 71 && code <= 77) { for (let i = -1; i <= 1; i++) c.fillRect(x + i * 4, y + 6, 1.5, 1.5); return; }
  if (code >= 95) { c.beginPath(); c.moveTo(x, y + 3); c.lineTo(x - 2, y + 8); c.lineTo(x + 1, y + 7); c.lineTo(x - 1, y + 11); c.stroke(); return; }
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * 4, y + 5); c.lineTo(x + i * 4 - 1, y + 9); c.stroke(); }
}
function horizonIcon(ctx, x, y, up, color, t, s = 1) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5 * s;
  ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.lineTo(x + 14 * s, y); ctx.stroke();
  const bob = Math.sin(t * 1.5) * 1.2;
  ctx.beginPath(); ctx.arc(x, y + bob, 6 * s, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y - 13 * s + bob); ctx.lineTo(x, y - 9 * s + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 3 * s, y - (up ? 10 : 12) * s + bob); ctx.lineTo(x, y - (up ? 13 : 9) * s + bob); ctx.lineTo(x + 3 * s, y - (up ? 10 : 12) * s + bob); ctx.stroke();
}
function battery(ctx, x, y, level, color, charging, t, s = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 16 * s, 8 * s); ctx.fillStyle = color; ctx.fillRect(x + 17 * s, y + 2 * s, 2 * s, 5 * s);
  const bars = charging ? Math.floor((t * 2) % 5) : Math.round(level * 4);
  for (let i = 0; i < bars; i++) ctx.fillRect(x + (2 + i * 3.5) * s, y + 2 * s, 2.5 * s, 5 * s);
}
function bar(ctx, x, y, w, h, v, color, bg = '#2a2f3a') { ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, v)), h); }
function tile(ctx, x, y, w, h, accent = ORANGE) { ctx.fillStyle = '#151923'; ctx.fillRect(x, y, w, h); ctx.fillStyle = accent; ctx.fillRect(x, y, 2, h); }
function title(ctx, text, y = 22) { ctx.textAlign = 'left'; ctx.fillStyle = ORANGE; ctx.font = F(13, 'bold'); ctx.fillText(text, 10, y); }
function frame(ctx, W, H) {
  ctx.strokeStyle = '#2a2f3a'; ctx.lineWidth = 1; ctx.strokeRect(3.5, 3.5, W - 7, H - 7);
  ctx.strokeStyle = ORANGE; ctx.lineWidth = 2;
  for (const [x, y, sx, sy] of [[4, 4, 1, 1], [W - 4, 4, -1, 1], [4, H - 4, 1, -1], [W - 4, H - 4, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + 10 * sy); ctx.lineTo(x, y); ctx.lineTo(x + 10 * sx, y); ctx.stroke(); }
}
function wrap(ctx, text, x, y, maxW, lh, maxLines = 99) {
  const words = text.split(' '); let line = '', n = 0;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y + n * lh); line = w; n++; if (n >= maxLines) return n; } else line = test;
  }
  if (line) { ctx.fillText(line, x, y + n * lh); n++; }
  return n;
}
const pad = n => String(n).padStart(2, '0');
// «Зараз» у Києві як Date з київськими getHours()/getMinutes() (незалежно від пояса браузера)
export const kyivNow = (d = new Date()) => new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Kyiv' }));
// різниця поясу tz відносно Києва, год
const tzDiff = tz => { const d = new Date(); return (new Date(d.toLocaleString('en-US', { timeZone: tz })) - kyivNow(d)) / 36e5; };
const hm = h => `${pad(Math.floor(h))}:${pad(Math.round((h % 1) * 60))}`;
const parseHM = s => { const [a, b] = s.split(':').map(Number); return a + b / 60; };
const tzTime = (tz, d) => d.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const F = (px, b = '') => `${b} ${Math.max(px, 8)}px "Share Tech Mono", monospace`;
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- Clawd — піксельний персонаж Claude Code ----------
// Настрій = що робить головний агент: working · question · happy · sad · sleep · think · idle
export const CLAWD = '#d97757';
// спрайт з логотипа в терміналі Claude Code:  ▐▛███▜▌ / ▝▜█████▛▘ / ▘▘ ▝▝  → сітка напівблоків 18×5 (клітинка u × 2u)
const CLAWD_CELLS = (() => {
  const on = new Set(), add = (x, y) => on.add(`${x},${y}`);
  add(3, 0); add(3, 1); add(4, 0); add(5, 0); add(4, 1); for (let x = 6; x <= 11; x++) { add(x, 0); add(x, 1); }
  add(12, 0); add(13, 0); add(13, 1); add(14, 0); add(14, 1);
  add(2, 2); add(3, 2); add(3, 3); for (let x = 4; x <= 13; x++) { add(x, 2); add(x, 3); } add(14, 2); add(15, 2); add(14, 3);
  return [...on].map(k => k.split(',').map(Number));
})();
const CLAWD_ARMS = [[1, 2], [16, 2]], CLAWD_LEGS = [[4, 4], [6, 4], [11, 4], [13, 4]], CLAWD_EYES = [[5, 1], [12, 1]];
export function drawClawd(c, cx, by, u, mood, t, look = { x: 0, y: 0 }, bg = '#000') {
  const W = 18 * u, H = 10 * u, sy = 2 * u;
  let bob = Math.sin(t * 2) * u * 0.25, tilt = 0, squash = 1, armsUp = false;
  if (mood === 'working') bob = -Math.abs(Math.sin(t * 6)) * u * 0.6;
  if (mood === 'happy') { bob = -Math.abs(Math.sin(t * 5)) * u * 3; armsUp = true; }
  if (mood === 'question') tilt = Math.sin(t * 3) * 0.08 - 0.08;
  if (mood === 'sad') { bob = u * 0.4; squash = 0.9; }
  if (mood === 'sleep') { bob = 0; squash = 0.94 + Math.sin(t * 1.2) * 0.03; }
  if (mood === 'think') tilt = 0.06;
  c.fillStyle = 'rgba(217,119,87,.16)'; c.beginPath(); c.ellipse(cx, by + u * 0.4, W * 0.36 * (1 + bob / (u * 12)), u * 0.7, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(cx, by + bob); c.rotate(tilt); c.scale(1, squash);
  const x0 = -W / 2, y0 = -H, cell = (x, y, col = CLAWD) => { c.fillStyle = col; c.fillRect(x0 + x * u - 0.3, y0 + y * sy - 0.3, u + 1, sy + 1); };
  CLAWD_CELLS.forEach(([x, y]) => cell(x, y));
  CLAWD_ARMS.forEach(([x, y]) => cell(x, armsUp ? y - 1 : y));
  // ноги: у «працює» перебирають по черзі
  CLAWD_LEGS.forEach(([x, y], i) => { const lift = mood === 'working' && (Math.floor(t * 8) + i) % 2 ? -sy * 0.35 : 0; c.fillStyle = CLAWD; c.fillRect(x0 + x * u, y0 + y * sy + lift, u + 0.5, sy * 0.8); });
  // очі (порожні клітинки спрайта); погляд зсуває їх у межах голови
  const lx = Math.max(-1, Math.min(1, look.x)) * u * 0.6, ly = Math.max(-1, Math.min(1, look.y)) * u * 0.4;
  const blink = mood !== 'sleep' && Math.sin(t * 0.9) > 0.985;
  CLAWD_EYES.forEach(([x, y]) => {
    const ex = x0 + x * u, ey = y0 + y * sy;
    c.fillStyle = CLAWD; c.fillRect(ex - 0.3, ey - 0.3, u + 1, sy + 1); // «закрити» стару дірку тілом
    c.fillStyle = bg;
    if (mood === 'happy') { c.fillRect(ex, ey + sy * 0.45, u * 0.34, sy * 0.25); c.fillRect(ex + u * 0.33, ey + sy * 0.2, u * 0.34, sy * 0.25); c.fillRect(ex + u * 0.66, ey + sy * 0.45, u * 0.34, sy * 0.25); }
    else if (mood === 'sleep' || blink) c.fillRect(ex - u * 0.1, ey + sy * 0.7, u * 1.2, sy * 0.18);
    else if (mood === 'sad') c.fillRect(ex, ey + sy * 0.45, u, sy * 0.55);
    else if (mood === 'question') c.fillRect(ex - u * 0.15, ey - sy * 0.15, u * 1.3, sy * 1.15);
    else if (mood === 'think') c.fillRect(ex + u * 0.3, ey - sy * 0.1, u * 0.7, sy * 0.7);
    else c.fillRect(ex + lx, ey + ly, u, sy);
  });
  if (mood === 'sad') { c.fillStyle = '#7aa2f7'; const d = (t * 0.8) % 1; c.globalAlpha = 1 - d; c.fillRect(x0 + 5 * u, y0 + 2 * sy + d * sy * 1.5, u * 0.5, sy * 0.35); c.globalAlpha = 1; }
  c.restore();
  const top = by + bob - H - u;
  c.textAlign = 'center';
  if (mood === 'working') for (let i = 0; i < 3; i++) { c.fillStyle = CLAWD; c.globalAlpha = (Math.floor(t * 3) % 3) === i ? 1 : 0.25; c.fillRect(cx - u * 2.5 + i * u * 2.5 - u * 0.5, top - u, u, u); }
  c.globalAlpha = 1;
  if (mood === 'question') { c.fillStyle = '#ef4444'; c.font = `bold ${Math.round(u * 5)}px "Share Tech Mono", monospace`; c.fillText('?', cx + W * 0.42, top - Math.abs(Math.sin(t * 4)) * u); }
  if (mood === 'sleep') { c.fillStyle = '#8a92a6'; for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; c.globalAlpha = 1 - p; c.font = `${Math.round(u * (2 + p * 2))}px "Share Tech Mono", monospace`; c.fillText('z', cx + W * 0.3 + p * u * 4, top - p * u * 5); } c.globalAlpha = 1; }
  if (mood === 'think') { c.fillStyle = '#aab'; [[0.6, 0.5], [1.8, 0.8], [3.4, 1.2]].forEach(([dx, r], i) => { c.globalAlpha = (Math.floor(t * 2) % 3) >= i ? 1 : 0.3; c.beginPath(); c.arc(cx + W * 0.3 + dx * u, top - dx * u * 0.9, r * u, 0, Math.PI * 2); c.fill(); }); c.globalAlpha = 1; }
  if (mood === 'happy') for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.05; c.fillStyle = ['#ffd34d', '#22c55e', '#7aa2f7'][i % 3]; c.fillRect(cx + Math.cos(a) * W * 0.62, top + u * 2 + Math.sin(a * 1.3) * u * 3, u * 0.7, u * 0.7); }
}
// настрій Clawd з поточного стану агента (+ короткі реакції на події)
export function clawdMood(scr, night) {
  const tn = performance.now();
  if (scr?.mood && tn < scr.mood.until) return scr.mood.m;
  if (claude.state === 'question') return 'question';
  if (claude.state === 'working') return 'working';
  return night ? 'sleep' : 'think';
}
const MOOD_TEXT = { working: { uk: 'працює', en: 'working' }, question: { uk: 'чекає відповіді', en: 'needs an answer' }, happy: { uk: 'радіє · PR змержено', en: 'happy · PR merged' }, sad: { uk: 'засмучений · CI впав', en: 'sad · CI failed' }, sleep: { uk: 'спить · простій', en: 'sleeping · idle' }, think: { uk: 'думає · простій', en: 'thinking · idle' }, idle: { uk: 'простій', en: 'idle' } };

// ---------- дані ----------
export const weather = { temp: 18, hum: 62, wind: 11, pressure: 1013, sunrise: '06:48', sunset: '18:52', live: false, hourly: [], code: 2,
  daily: [], aq: { aqi: 32, pm25: 8, pm10: 14, uv: 3, live: false } };
export const fact = { text: { uk: '1969 — «Аполлон-11» здійснив першу посадку людей на Місяць. Модуль «Орел» сів у Морі Спокою.', en: '1969 — Apollo 11 made the first crewed Moon landing. The Eagle touched down in the Sea of Tranquility.' }, year: 1969, live: false };
export const rates = { list: [['USD/PLN', 3.62, +0.4], ['EUR/PLN', 4.27, -0.2], ['BTC', 64120, +2.1]], live: false };
export async function loadWeather() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.45&longitude=30.52&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto&forecast_days=7');
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    Object.assign(weather, {
      temp: Math.round(j.current.temperature_2m), hum: Math.round(j.current.relative_humidity_2m), wind: Math.round(j.current.wind_speed_10m),
      pressure: j.current.surface_pressure, code: j.current.weather_code,
      sunrise: j.daily.sunrise[0].slice(11, 16), sunset: j.daily.sunset[0].slice(11, 16), live: true, hourly: j.hourly.temperature_2m.slice(0, 24).map(Math.round),
      daily: j.daily.time.map((d, i) => ({ date: new Date(d), code: j.daily.weather_code[i], max: Math.round(j.daily.temperature_2m_max[i]), min: Math.round(j.daily.temperature_2m_min[i]), pop: j.daily.precipitation_probability_max[i] ?? 0, wind: Math.round(j.daily.wind_speed_10m_max[i]) })),
    });
    sensors.pBase = weather.pressure || 1013;
  } catch (e) { console.info('Open-Meteo недоступний, статичні дані', e.message); }
  try {
    const r = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=50.45&longitude=30.52&current=european_aqi,pm2_5,pm10,uv_index&timezone=auto');
    const j = await r.json();
    Object.assign(weather.aq, { aqi: Math.round(j.current.european_aqi), pm25: Math.round(j.current.pm2_5), pm10: Math.round(j.current.pm10), uv: Math.round(j.current.uv_index), live: true });
  } catch (e) { /* статичні */ }
}
export async function loadExtras() {
  const now = new Date();
  // «цього дня»: кілька подій; українська стрічка, якщо є, інакше англійська
  const clean = t => t.replace(/\s*\((pictured|зображено|на фото)[^)]*\)/gi, '').trim();
  const get = async lng => { const r = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/${lng}/onthisday/selected/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`); if (!r.ok) throw 0; return (await r.json()).selected || []; };
  try {
    const en = await get('en'); let uk = []; try { uk = await get('uk'); } catch (e) { /* немає укр. стрічки */ }
    const mk = arr => arr.slice(0, 5).map(e => ({ year: e.year, t: clean(e.text) }));
    fact.byLang = { en: mk(en), uk: uk.length ? mk(uk) : mk(en) };
    if (en.length) { fact.year = en[0].year; fact.text = { uk: `${fact.byLang.uk[0].year} — ${fact.byLang.uk[0].t}`, en: `${en[0].year} — ${fact.byLang.en[0].t}` }; fact.live = true; }
  } catch (e) { /* статичні */ }
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD'); const j = await r.json();
    rates.list[0] = ['USD/PLN', +j.rates.PLN.toFixed(2), rates.list[0][2]]; rates.list[1] = ['USD/UAH', +j.rates.UAH.toFixed(2), rates.list[1][2]]; rates.live = true;
  } catch (e) { /* статичні */ }
}
if (!weather.daily.length) { const t0 = new Date(); weather.daily = Array.from({ length: 7 }, (_, i) => ({ date: new Date(t0.getTime() + i * 864e5), code: [2, 1, 61, 3, 0, 80, 2][i], max: 19 + [0, 2, -3, 1, 4, -2, 0][i], min: 9 + [0, 1, -2, 0, 3, -1, 0][i], pop: [10, 5, 80, 20, 0, 70, 15][i], wind: [12, 9, 22, 14, 8, 25, 11][i] })); }

// Стан Claude Code (демо: симуляція)
export const claude = { state: 'working', used5h: 0.62, usedWeek: 0.31, resetMin: 134, session: 'lander-r2 · screens v2', sessionMin: 47, prs: [['#42 screens v2', 'open', 'ok'], ['#41 brandbook style', 'merged', 'ok'], ['#40 e-ink layout', 'merged', 'fail']], commits: 7 };
// Сенсори Touch-версії (симуляція; телефон — гіроскоп, десктоп — курсор над екраном)
export const sensors = { roll: 0, pitch: 0, tRoll: 0, tPitch: 0, pBase: 1013, lux: 300, mic: 0.1, temp: 20, hum: 50, pressure: 1013, trend: 0, alt: 120, real: false, battery: 0.78, charging: false, wifi: true };
if (window.DeviceOrientationEvent) addEventListener('deviceorientation', e => {
  if (e.beta == null) return; sensors.real = true;
  sensors.tRoll = Math.max(-45, Math.min(45, e.gamma || 0)); sensors.tPitch = Math.max(-45, Math.min(45, (e.beta || 0) - 45));
});
// Календар (демо): один розклад дня — «наступний мітинг» і вільні вікна рахуються з нього відносно (віртуального) часу
export const cal = { next: { title: 'Standup', inMin: 0, dur: 15, who: ['AZ', 'MB', 'CC'], link: 'meet.google.com/xyz', live: false },
  day: [[9, 9.25, 'Standup'], [11, 12, 'Design review'], [13.5, 14, 'Lunch walk'], [15, 15.5, 'Sync: Lander R2 widgets'], [17, 18, 'Focus block']] };
export function updateCal(now) {
  const cur = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const ev = cal.day.find(([a, b]) => b > cur);
  if (!ev) { Object.assign(cal.next, { title: '—', inMin: 9999, dur: 0, live: false, none: true }); return; }
  const [a, b, title] = ev;
  Object.assign(cal.next, { title, dur: Math.round((b - a) * 60), inMin: Math.ceil((a - cur) * 60), live: a <= cur, sinceMin: Math.floor((cur - a) * 60), none: false });
}
// вільні вікна між 9:00 і 19:00 від поточного часу, ≥ 30 хв
export function freeSlots(now) {
  const cur = now.getHours() + now.getMinutes() / 60; const out = []; let t0 = Math.max(9, cur);
  for (const [a, b] of cal.day) { if (b <= t0) continue; if (a - t0 >= 0.5) out.push([t0, a]); t0 = Math.max(t0, b); }
  if (19 - t0 >= 0.5) out.push([t0, 19]);
  return out;
}
export const tasks = { list: [['Каталог екранів v2', 'Screen catalog v2', false], ['Спікер: гільза-резонатор', 'Speaker: brass resonator', false], ['README: архітектура', 'README: architecture', true]] };
export const music = { title: 'Weightless', artist: 'Marconi Union', pos: 143, len: 480, playing: true };
export const focus = { running: false, total: 25 * 60, left: 25 * 60, sessions: 3, breakMode: false };
// [слово, переклад, значення uk, значення en, приклад uk, приклад en]
export const wordOfDay = now => words[now.getDate() % words.length];
export const words = [
  ['серендипність', 'serendipity', 'щасливий випадок під час пошуку іншого', 'a happy accident while looking for something else', 'Це була чиста серендипність — я шукав кабель, а знайшов ідею.', 'It was pure serendipity — I was looking for a cable and found an idea.'],
  ['flâneur', 'фланер', 'той, хто неквапно гуляє містом, спостерігаючи', 'someone who strolls the city at leisure, observing', 'Увечері він ставав фланером і годинами блукав Подолом.', 'In the evening he became a flâneur, wandering the old town for hours.'],
];

// ---------- LED-контролер (антена) ----------
export const led = { color: GREEN, mode: 'breathe', hz: 1, until: 0, prev: null,
  set(color, mode = 'solid', hz = 1, ms = 0) { this.color = color; this.mode = mode; this.hz = hz; this.until = ms ? performance.now() + ms : 0; },
  value(t) {
    const m = this.mode;
    if (m === 'off') return 0;
    if (m === 'breathe') return 0.55 + 0.45 * Math.sin(t * Math.PI * 2 * this.hz);
    if (m === 'blink') return Math.sin(t * Math.PI * 2 * this.hz) > 0 ? 1 : 0.08;
    if (m === 'strobe') return (t * this.hz * 2) % 2 < 0.3 ? 1 : 0.05;
    if (m === 'double') { const p = (t * this.hz) % 1; return p < 0.08 || (p > 0.16 && p < 0.24) ? 1 : 0.1; }
    return 1;
  } };
function ledFromClaude() { const c = STATE_COLORS[claude.state]; if (claude.state === 'working') led.set(c, 'breathe', 0.7); else if (claude.state === 'question') led.set(c, 'blink', 2); else led.set(c, 'solid'); }

// ---------- каталог екранів ----------
// id, назва, опис, які дисплеї
export const SCREENS = [
  ['mission', { uk: 'Місія', en: 'Mission' }, { uk: 'Головний екран — лише головне: час (Київ), дата, погода зараз, наступна подія з календаря, Clawd зі станом агента й лімітами, стрічка дня.', en: 'Home screen — just the essentials: time (Kyiv), date, weather now, next calendar event, Clawd with the agent state and limits, the day strip.' }, 'ti'],
  ['meeting', { uk: 'Наступний мітинг', en: 'Next meeting' }, { uk: 'Хвилини до зустрічі з розкладу, назва, тривалість, хто буде. За 5 хв LED синій блимає, за 1 хв — швидше; стук по столу = «іду». Під час — «в ефірі», повідомлення в черзі.', en: 'Minutes to the meeting from the calendar, title, duration, attendees. LED blinks blue 5 min before, faster at 1 min; knock = “on my way”. During — “on air”, notifications queued.' }, 'ti'],
  ['day', { uk: 'День', en: 'Day' }, { uk: 'Стрічка 8:00–20:00 з мітингами, курсор «зараз», вільні вікна підсвічені зеленим і виписані знизу. Ідеально для e-ink — змінюється рідко.', en: 'Timeline 8:00–20:00 with meetings, a “now” cursor, free slots highlighted in green and listed below. Perfect for e-ink — changes rarely.' }, 'ti'],
  ['dev', { uk: 'Dev / Claude Code', en: 'Dev / Claude Code' }, { uk: 'Стан агента, ліміти 5 год і тижня, поточна сесія, останні PR зі статусом CI, коміти за день.', en: 'Agent state, 5-hour and weekly limits, current session, recent PRs with CI status, commits today.' }, 'ti'],
  ['room', { uk: 'Кімната', en: 'Room' }, { uk: 'BME280: температура, вологість, тиск; VEML7700: освітленість; індекс комфорту і графік за 24 год.', en: 'BME280: temperature, humidity, pressure; VEML7700: light; comfort index and 24 h chart.' }, 't'],
  ['forecast', { uk: 'Прогноз 7 днів', en: '7-day forecast' }, { uk: 'Іконка, max/min, ймовірність опадів, вітер на кожен день + барометричний тренд на сьогодні (Open-Meteo, наживо).', en: 'Icon, max/min, precipitation chance, wind per day + today’s barometric trend (Open-Meteo, live).' }, 'ti'],
  ['air', { uk: 'Повітря', en: 'Air' }, { uk: 'AQI, PM2.5/PM10, UV і головне питання: чи відкривати вікно — порівняння вулиці з кімнатою.', en: 'AQI, PM2.5/PM10, UV and the key question: open the window? — outdoors vs. indoors.' }, 't'],
  ['focus', { uk: 'Фокус', en: 'Focus' }, { uk: 'Pomodoro 25/5 з кільцем прогресу й лічильником сесій. Поки триває — LED синій «не турбувати».', en: 'Pomodoro 25/5 with a progress ring and session counter. While running the LED is blue “do not disturb”.' }, 't'],
  ['tasks', { uk: 'Задачі', en: 'Tasks' }, { uk: 'Топ-3 на сьогодні, чекбокс тапом. Виконана — зелений спалах; усі три — «день зроблено».', en: 'Top 3 for today, tap to check. Done — green flash; all three — “day done”.' }, 't'],
  ['fact', { uk: 'Факт дня', en: 'Fact of the day' }, { uk: 'Wikipedia «On this day» — п’ять подій цього дня, тап — наступна. Українська стрічка, якщо є. Без ключів.', en: 'Wikipedia “On this day” — five events of the day, tap for the next. No keys.' }, 'ti'],
  ['word', { uk: 'Слово дня', en: 'Word of the day' }, { uk: 'Слово, переклад, приклад. Тап — озвучити через спікер.', en: 'A word, its translation, an example. Tap to hear it on the speaker.' }, 't'],
  ['rates', { uk: 'Курси', en: 'Rates' }, { uk: 'Три пари з денною зміною і спарклайном за 7 днів (open.er-api, наживо).', en: 'Three pairs with daily change and a 7-day sparkline (open.er-api, live).' }, 't'],
  ['music', { uk: 'Музика', en: 'Music' }, { uk: 'Що грає зараз, прогрес, тап — пауза. AMOLED: чорний фон = вимкнені пікселі.', en: 'Now playing, progress, tap to pause. AMOLED: black background = pixels off.' }, 't'],
  ['moon', { uk: 'Небо', en: 'Sky' }, { uk: 'Дуга сонця від сходу до заходу з поточним положенням і скільки світла лишилось; уночі — зорі й місяць. Фаза й освітленість місяця, проліт МКС, наступний запуск.', en: 'Sun arc from sunrise to sunset with its current position and daylight left; at night — stars and the moon. Moon phase and illumination, ISS pass, next launch.' }, 'ti'],
  ['landing', { uk: 'Посадка · гра', en: 'Landing · game' }, { uk: 'Міні-гра: посади лендер на зелений майданчик. Місячна гравітація 1.62 м/с², паливо ~15 с. Тримай палець (або ↑) — тяга, нахил телефона / курсор / ← → — вбік. Сідай < 2 м/с.', en: 'Mini-game: land on the green pad. Lunar gravity 1.62 m/s², ~15 s of fuel. Hold a finger (or ↑) for thrust, tilt the phone / move the cursor / ← → to steer. Touch down < 2 m/s.' }, 't'],
  ['tank', { uk: 'Паливний бак', en: 'Fuel tank' }, { uk: 'Рівень рідини = заряд батареї. Симулятор рідини: гравітація від IMU, струс → сплеск, тап → крапля, зарядка → бульбашки.', en: 'Liquid level = battery charge. Liquid simulator: gravity from the IMU, shake → splash, tap → drop, charging → bubbles.' }, 't'],
  ['face', { uk: 'Claude', en: 'Claude' }, { uk: 'Clawd — піксельний персонаж Claude Code — показує, що робить агент: працює (очі бігають, «…»), питає («?»), радіє (PR змержено), сумує (CI впав), думає або спить у простої. Тап / хлопок — вітається.', en: 'Clawd, the Claude Code pixel character, mirrors the agent: working (darting eyes, “…”), asking (“?”), happy (PR merged), sad (CI failed), thinking or asleep when idle. Tap / clap — it says hi.' }, 't'],
  ['night', { uk: 'Нічний', en: 'Night' }, { uk: 'Темно > 2 хв — тьмяний годинник, LED гасне. E-ink просто лишає останню картинку.', en: 'Dark > 2 min — dim clock, LED goes off. E-ink just keeps the last image.' }, 'ti'],
  ['note', { uk: 'Записка', en: 'Note' }, { uk: 'Тільки e-ink: повідомлення, що лишається на екрані навіть без живлення — «пішов на каву, буду о 14:10».', en: 'E-ink only: a message that stays on screen even without power — “out for coffee, back at 14:10”.' }, 'i'],
  ['mooncal', { uk: 'Місячний календар', en: 'Moon calendar' }, { uk: 'Тільки e-ink: сітка місяця з фазою на кожен день, змінюється раз на добу — те, для чого e-ink і створений.', en: 'E-ink only: a month grid with the phase for each day, changes once a day — what e-ink was made for.' }, 'i'],
];
// ---------- сценарії: id, назва, опис, дисплеї, тривалість мс, start(scr), [не відкочувати екран] ----------
export const SCENARIOS = [
  ['knock', { uk: 'Стук по столу', en: 'Knock on the desk' }, { uk: 'IMU ловить удар: на «Мітингу» за ≤ 5 хв — «іду», на інших екранах — наступний екран.', en: 'The IMU catches a tap: on Meeting within 5 min — “on my way”, elsewhere — next screen.' }, 't', 1500, s => { s.flash(ORANGE); sensors.mic = 0.9; setTimeout(() => s.knock(), 200); }, true],
  ['clap', { uk: 'Хлопок', en: 'Clap' }, { uk: 'Мікрофон: хлопок → Clawd вітається й підстрибує.', en: 'Mic: clap → Clawd says hi and hops.' }, 't', 4000, s => { s.show('face'); s.wink(); s.react('happy', 2500); sensors.mic = 1; }],
  ['shake', { uk: 'Струс', en: 'Shake' }, { uk: 'Тривога «перевір ноги»: LED червоний 3 с, у баку — сплеск і бризки.', en: '“Check the legs” alert: LED red for 3 s, splash and spray in the tank.' }, 't', 4500, s => { s.show('tank'); s.shake(); led.set(RED, 'strobe', 5, 3000); s.banner({ uk: '⚠ СТРУС · ПЕРЕВІР НОГИ', en: '⚠ SHAKE · CHECK LEGS' }, RED); s.timeline([[3200, () => { s.bannerT = null; }]]); }],
  ['rocket', { uk: 'Запуск ракети', en: 'Rocket launch' }, { uk: 'Сповіщення Launch Library: повноекранний LIVE — відлік T-10, запалення, старт, Max-Q, відділення ступеня, орбіта. LED у такт стадіям, потім повернення на попередній екран.', en: 'Launch Library alert: full-screen LIVE — T-10 countdown, ignition, liftoff, Max-Q, stage separation, orbit. LED follows the stages, then back to the previous screen.' }, 'ti', 21000, s => {
    s.launch = { t0: performance.now() }; s.show('launch'); led.set(ORANGE, 'breathe', 1);
    s.timeline([[7000, () => led.set('#ffd34d', 'strobe', 8)], [10000, () => led.set(ORANGE, 'solid')], [16000, () => led.set('#fff', 'blink', 4)], [19000, () => { led.set(GREEN, 'strobe', 4, 2000); s.confetti(GREEN); s.toast({ uk: 'Орбіта ✓ · Starlink 12-5 · 21 супутник', en: 'Orbit ✓ · Starlink 12-5 · 21 satellites' }, GREEN); }]]);
  }],
  ['claude-question', { uk: 'Claude поставив питання', en: 'Claude asks a question' }, { uk: 'LED червоний 2 Гц + «пінг»; Clawd з «?» на весь екран, питання — плашкою.', en: 'LED red at 2 Hz + ping; full-screen Clawd with a “?”, the question in a toast.' }, 'ti', 6000, s => { claude.state = 'question'; ledFromClaude(); s.show('face'); s.toast({ uk: 'Claude: «Пушити зараз чи після рев’ю?»', en: 'Claude: “Push now or after review?”' }, RED); }],
  ['ink-partial', { uk: 'Часткове оновлення', en: 'Partial refresh' }, { uk: 'Тільки e-ink: змінилась хвилина → блимає лише зона годинника.', en: 'E-ink only: minute changed → only the clock area flickers.' }, 'i', 4000, s => { s.show('mission'); s.timeline([[1200, () => { s.inkPartial = performance.now(); }]]); }],
  ['ink-full', { uk: 'Повне оновлення', en: 'Full refresh' }, { uk: 'Тільки e-ink: 3 інверсії по 130 мс проти «привидів».', en: 'E-ink only: 3 inversions of 130 ms against ghosting.' }, 'i', 3000, s => { s.fullRefresh(); }],
];
// екрани, яких нема в каталозі, але які показують історії
export const HIDDEN_SCREENS = { morning: { uk: 'Доброго ранку', en: 'Good morning' }, eod: { uk: 'Кінець дня', en: 'End of day' }, sleep: { uk: 'Сон', en: 'Sleep' }, launch: { uk: 'Запуск · LIVE', en: 'Launch · LIVE' } };
// ---------- історії: зв'язні сюжети з власним (віртуальним) часом: [id, назва, опис, дисплеї, тривалість, [[ms, підпис, fn]...]] ----------
const Q = (uk, en) => ({ uk, en });
export const STORIES = [
  ['morning', Q('Робочий ранок', 'Work morning'), Q('06:50 ніч → 07:30 світло і «доброго ранку» → прогноз → розклад → 08:55 наперед виходить Standup із синім маяком → 09:00 в ефірі → після — черга повідомлень.', '06:50 night → 07:30 lights and “good morning” → forecast → day plan → 08:55 Standup comes forward with a blue beacon → 09:00 on air → then queued notifications.'), 't', 34000, [
    [0, Q('06:50 · ніч: темно, LED вимкнений', '06:50 · night: dark, LED off'), s => { s.setClock('06:50'); sensors.lux = 2; led.set('#000', 'off'); s.show('night'); }],
    [3000, Q('07:30 · світло ввімкнули → «Доброго ранку»: погода, перший мітинг, задачі', '07:30 · lights on → “Good morning”: weather, first meeting, tasks'), s => { s.setClock('07:30'); sensors.lux = 300; led.set('#ffd34d', 'breathe', 0.4); s.show('morning'); }],
    [7000, Q('Прогноз на день', 'Forecast for the day'), s => s.show('forecast')],
    [10000, Q('08:20 · розклад: мітинги й вільні вікна', '08:20 · day plan: meetings and free slots'), s => { s.setClock('08:20'); s.show('day'); }],
    [14000, Q('08:55 · за 5 хв до Standup: розклад ховається, наперед — мітинг, LED синій 1 Гц', '08:55 · 5 min to Standup: the plan hides, the meeting comes forward, LED blue 1 Hz'), s => { s.setClock('08:55'); led.set(BLUE, 'blink', 1); s.show('meeting'); }],
    [19000, Q('08:59 · за 1 хв — блимає швидше', '08:59 · 1 min — faster blink'), s => { s.setClock('08:59'); led.set(BLUE, 'blink', 3); }],
    [22000, Q('09:00 · старт: тон, LED рівний «в ефірі»', '09:00 · start: chime, steady “on air” LED'), s => { s.setClock('09:00'); led.set(BLUE, 'solid'); s.toast(Q('🔔 Standup — почалось', '🔔 Standup — starting'), BLUE); }],
    [26000, Q('09:07 · Claude питає під час мітингу — у черзі, LED не смикається', '09:07 · Claude asks during the meeting — queued, LED stays calm'), s => { s.setClock('09:07'); claude.state = 'question'; s.toast(Q('Claude питає · у черзі до кінця мітингу', 'Claude asks · queued until the meeting ends'), '#889'); }],
    [30000, Q('09:16 · мітинг скінчився → «Місія» і черга: питання Claude, LED червоний', '09:16 · meeting over → Mission and the queue: Claude’s question, LED red'), s => { s.setClock('09:16'); ledFromClaude(); s.show('mission'); s.toast(Q('Claude: «Пушити зараз чи після рев’ю?»', 'Claude: “Push now or after review?”'), RED); }],
  ]],
  ['claude', Q('Сесія з Claude Code', 'A Claude Code session'), Q('Clawd показує, що робить агент: працює → питає → відповіли → PR змержено (радіє) → CI впав (сумує) → ліміт > 90 % → простій (думає).', 'Clawd mirrors the agent: working → asks → answered → PR merged (happy) → CI failed (sad) → limit > 90 % → idle (thinking).'), 'ti', 30000, [
    [0, Q('Claude почав задачу: LED зелений «дихає»', 'Claude starts: LED breathes green'), s => { claude.state = 'working'; ledFromClaude(); s.show('mission'); }],
    [3000, Q('Clawd працює: очі бігають, над головою «…»', 'Clawd at work: eyes darting, “…” overhead'), s => s.show('face')],
    [7000, Q('Питання: Clawd з «?», LED червоний 2 Гц', 'Question: Clawd with a “?”, LED red 2 Hz'), s => { claude.state = 'question'; ledFromClaude(); s.toast(Q('Claude: «Пушити зараз чи після рев’ю?»', 'Claude: “Push now or after review?”'), RED); }],
    [11000, Q('Відповіли — знову працює; Dev: сесія, ліміти, PR', 'Answered — working again; Dev: session, limits, PRs'), s => { claude.state = 'working'; ledFromClaude(); s.show('dev'); }],
    [15000, Q('PR #42 змержено: Clawd радіє, конфеті, зелений строб', 'PR #42 merged: Clawd is happy, confetti, green strobe'), s => { claude.prs[0][1] = 'merged'; led.set(GREEN, 'strobe', 4, 2500); s.react('happy', 3800); s.show('face'); s.confetti(GREEN); }],
    [19000, Q('CI нового PR #43 впав: Clawd сумує, червона смуга (тап — прибрати)', 'CI of the new PR #43 failed: Clawd is sad, red bar (tap to dismiss)'), s => { claude.prs.unshift(['#43 ci: node 22', 'open', 'fail']); led.set(RED, 'solid'); s.react('sad', 4000); s.banner(Q('CI ✗ #43 · build #128', 'CI ✗ #43 · build #128'), RED); }],
    [23000, Q('Ліміт 5 год > 90 %: смуга червона, LED жовтий подвійний', '5h limit > 90 %: red bar, yellow double blink'), s => { s.bannerT = null; claude.used5h = 0.93; led.set('#facc15', 'double', 0.5); s.show('dev'); }],
    [27000, Q('Простій: Clawd думає, LED помаранчевий', 'Idle: Clawd is thinking, LED orange'), s => { claude.state = 'idle'; ledFromClaude(); s.show('face'); }],
  ]],
  ['focus', Q('Фокус-блок', 'Focus block'), Q('12:05 розклад показує вільне вікно до 13:30 → пропозиція фокусу → Pomodoro, «не турбувати», повідомлення в черзі → перерва з конфеті → черга віддає питання Claude.', '12:05 the plan shows a free slot until 13:30 → focus suggestion → Pomodoro, do-not-disturb, notifications queued → break with confetti → the queue delivers Claude’s question.'), 't', 26000, [
    [0, Q('12:05 · розклад: вільно до 13:30', '12:05 · plan: free until 13:30'), s => { s.setClock('12:05'); s.show('day'); }],
    [3000, Q('Пропозиція: «фокус-сесія?»', 'Suggestion: “focus session?”'), s => { s.show('focus'); s.toast(Q('Вільно до 13:30 — фокус-сесія?', 'Free until 13:30 — focus session?'), BLUE); }],
    [6000, Q('Pomodoro пішов: LED синій рівний, повідомлення приховані', 'Pomodoro running: steady blue LED, notifications hidden'), s => { focus.running = true; focus.breakMode = false; focus.left = 25 * 60; led.set(BLUE, 'solid'); }],
    [10000, Q('Claude питає — у чергу, екран не смикається', 'Claude asks — queued, screen stays'), s => { claude.state = 'question'; s.toast(Q('1 повідомлення у черзі', '1 notification queued'), '#889'); }],
    [14000, Q('12:30 · …25 хвилин по тому', '12:30 · …25 minutes later'), s => { s.setClock('12:30'); focus.left = 3; }],
    [17500, Q('Перерва 5 хв: тон, конфеті, LED зелений', '5-minute break: chime, confetti, LED green'), s => { focus.left = 300; focus.breakMode = true; focus.running = true; focus.sessions++; led.set(GREEN, 'solid'); s.confetti(GREEN); }],
    [21000, Q('Черга: питання Claude, LED червоний, Clawd з «?»', 'Queue: Claude’s question, red LED, Clawd with a “?”'), s => { ledFromClaude(); s.show('face'); s.toast(Q('Claude: «Пушити зараз чи після рев’ю?»', 'Claude: “Push now or after review?”'), RED); }],
  ]],
  ['home', Q('Погода і дім', 'Weather & home'), Q('Прогноз → тиск падає, «дощ» і краплі на склі → кімната: сухо → «зволожувач» → повітря чисте → «відкрий вікно».', 'Forecast → pressure falling, “rain” and drops on the glass → room: dry → “humidifier” → clean air → “open the window”.'), 't', 22000, [
    [0, Q('Прогноз на 7 днів (Open-Meteo наживо)', '7-day forecast (Open-Meteo live)'), s => s.show('forecast')],
    [3500, Q('BME280: тиск падає → «дощ можливий», дощ на склі', 'BME280: pressure falling → “rain likely”, rain on the glass'), s => { s.trendOverride = -0.6; s.codeOverride = 61; s.toast(Q('тиск −3 hPa за 3 год', 'pressure −3 hPa in 3 h'), '#7aa2f7'); }],
    [8000, Q('Кімната: вологість 26 % → комфорт падає, «зволожувач»', 'Room: humidity 26 % → comfort drops, “humidifier”'), s => { s.humOverride = 26; s.show('room'); }],
    [13000, Q('Повітря: AQI низький, температура ок → «ВІДКРИЙ ВІКНО»', 'Air: low AQI, temperature ok → “OPEN THE WINDOW”'), s => { s.aqiOverride = 14; s.show('air'); }],
    [18000, Q('«Місія» з підказкою про вікно', 'Mission with the window hint'), s => { s.show('mission'); s.toast(Q('на вулиці краще, ніж у кімнаті — відкрий вікно', 'outdoors beats indoors — open the window'), GREEN); }],
  ]],
  ['physics', Q('Фізика: посадка, нахил, струс, сон', 'Physics: landing, tilt, shake, sleep'), Q('Автопілот садить лендер на майданчик у міні-грі → нахил 35°, бак переливається → струс, сплеск, тривога → догори дном → сон → повернули → boot.', 'Autopilot lands on the pad in the mini-game → 35° tilt, the tank spills → shake, splash, alert → face down → sleep → back up → boot.'), 't', 34000, [
    [0, Q('Посадка: автопілот тримає < 2 м/с і сідає на зелений майданчик', 'Landing: autopilot keeps < 2 m/s and sets down on the green pad'), s => { s.show('landing'); s.game.auto = true; s.resetGame(); const g = s.game; g.x = (g.pad[0] + g.pad[1]) / 2 - 12; g.alt = 55; g.vx = 1.5; }],
    [19000, Q('Нахил 35° → рідина переливається, тривога «ВИРІВНЯЙ»', 'Tilt 35° → liquid spills, “LEVEL IT” alert'), s => { s.game.auto = false; s.show('tank'); s.animTilt(35, 6); s.banner(Q('⚠ НАХИЛ 35° · ВИРІВНЯЙ', '⚠ TILT 35° · LEVEL IT'), ORANGE); }],
    [23000, Q('Струс: сплеск, бризки, тривога «перевір ноги»', 'Shake: splash, spray, “check the legs” alert'), s => { s.animTilt(0, 0); s.shake(); led.set(RED, 'strobe', 5, 3000); s.banner(Q('⚠ СТРУС · ПЕРЕВІР НОГИ', '⚠ SHAKE · CHECK LEGS'), RED); }],
    [27000, Q('Догори дном → сон, LED вимкнений', 'Face down → sleep, LED off'), s => { s.bannerT = null; led.set('#000', 'off'); s.show('sleep'); }],
    [31000, Q('Повернули → boot-заставка → «Місія»', 'Back up → boot splash → Mission'), s => { s.boot = performance.now(); ledFromClaude(); s.show('mission'); }],
  ]],
  ['night', Q('Вечір, ніч, живлення', 'Evening, night, power'), Q('18:00 підсумок дня → 22:40 темно, нічний екран → 23:30 батарея 12 % → зарядку підключили: бульбашки в баку → 07:30 ранок.', '18:00 day summary → 22:40 dark, night screen → 23:30 battery 12 % → charger in: bubbles in the tank → 07:30 morning.'), 't', 24000, [
    [0, Q('18:00 · останній мітинг минув → підсумок дня, LED теплий', '18:00 · last meeting over → day summary, warm LED'), s => { s.setClock('18:00'); led.set('#ffb86b', 'breathe', 0.3); s.show('eod'); }],
    [5000, Q('22:40 · темно 2 хв → нічний екран, LED вимкнений', '22:40 · dark for 2 min → night screen, LED off'), s => { s.setClock('22:40'); sensors.lux = 2; led.set('#000', 'off'); s.show('night'); }],
    [10000, Q('23:30 · батарея 12 % → іконка червона', '23:30 · battery 12 % → red icon'), s => { s.setClock('23:30'); sensors.battery = 0.12; s.show('mission'); s.toast(Q('Батарея 12 % — LED вимкнено', 'Battery 12 % — LED off'), RED); }],
    [14000, Q('Зарядку підключили: бак синіє, бульбашки, рівень росте', 'Charger in: tank turns blue, bubbles, level rises'), s => { sensors.charging = true; led.set(BLUE, 'breathe', 0.5); s.show('tank'); }],
    [20000, Q('07:30 · ранок: світло → «Доброго ранку»', '07:30 · morning: light → “Good morning”'), s => { s.setClock('07:30'); sensors.lux = 300; sensors.charging = false; sensors.battery = 0.78; led.set('#ffd34d', 'breathe', 0.4); s.show('morning'); }],
  ]],
  ['inkday', Q('День e-ink', 'An e-ink day'), Q('08:40 Місія → хвилина змінилась: часткове оновлення лише годинника → розклад → 08:55 повне оновлення на «Мітинг» → факт дня → записка → живлення вимкнули, картинка лишилась.', '08:40 Mission → minute changes: partial refresh of the clock only → day plan → 08:55 full refresh to Meeting → fact → note → power off, the image stays.'), 'i', 28000, [
    [0, Q('08:40 · Місія: чорне по білому, LED зелений', '08:40 · Mission: black on white, green LED'), s => { s.setClock('08:40'); claude.state = 'working'; ledFromClaude(); s.show('mission'); }],
    [4000, Q('08:41 · змінилась хвилина → блимає тільки зона годинника', '08:41 · minute changed → only the clock area flickers'), s => { s.setClock('08:41'); }],
    [8000, Q('Розклад дня — змінюється рідко, ідеально для e-ink', 'Day plan — rarely changes, perfect for e-ink'), s => s.show('day')],
    [13000, Q('08:55 · повне оновлення (3 інверсії) → «Мітинг», LED синій', '08:55 · full refresh (3 inversions) → Meeting, LED blue'), s => { s.setClock('08:55'); led.set(BLUE, 'blink', 1); s.show('meeting'); }],
    [18000, Q('Факт дня з Wikipedia', 'Fact of the day from Wikipedia'), s => { ledFromClaude(); s.show('fact'); }],
    [22000, Q('Записка з телефону', 'A note sent from the phone'), s => s.show('note')],
    [25000, Q('Живлення вимкнули — картинка лишилась', 'Power off — the image stays'), s => { led.set('#000', 'off'); s.powerOff = true; }],
  ]],
];

export class Screen {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.version = 'touch'; this.lang = 'uk'; this.S = 240 / 170;
    this.t0 = performance.now(); this.boot = 0;
    this.screen = 'mission'; this.list = []; this.slide = 0; this.slideDx = 0; this.slideFrom = null;
    this.settings = { bright: 1, autoBright: false, city: 0, h24: true };
    this.ripples = []; this.parts = []; this.toasts = []; this.bannerT = null; this.flashT = 0; this.winkT = 0; this.shakeT = 0; this.launchT = 0; this.powerOff = false;
    this.inkFlash = 0; this.inkPartial = 0; this.inkMinute = -1; this.inkImage = null; this.inkKey = '';
    this.scenario = null; this.story = null; this.timers = [];
    this.virt = null; this.mood = null; this.tiltTimer = null; this.launch = null; this.factIdx = 0;
    this.game = this.newGame();
    this.onDraw = null; this.onScreen = null;
    this.tank = this.makeTank();
    this.setupPointer();
    ledFromClaude();
    const loop = () => { try { this.frame(); } catch (e) { console.error('screen frame', e); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  setVersion(v) {
    this.version = v === 'ink' ? 'ink' : 'touch';
    const [w, h, S] = this.version === 'ink' ? [152, 296, 1] : [240, 536, 240 / 170];
    this.canvas.width = w; this.canvas.height = h; this.S = S;
    this.list = SCREENS.filter(s => s[3].includes(this.version[0])).map(s => s[0]);
    this.boot = performance.now(); this.inkImage = null; this.stopScenario(); this.screen = 'mission';
    if (this.version === 'ink') this.fullRefresh();
    this.onScreen?.(this.screen);
  }
  draw() { this.inkImage = null; }
  // ---------- годинник: київський час або віртуальний (для історій) ----------
  clock() {
    if (this.virt) return new Date(this.virt.base + (performance.now() - this.virt.t0) * this.virt.speed);
    return kyivNow();
  }
  setClock(hmStr, speed = 1) { const d = kyivNow(); const [h, m] = hmStr.split(':').map(Number); d.setHours(h, m, 0, 0); this.virt = { base: d.getTime(), t0: performance.now(), speed }; this.inkImage = null; }
  react(m, ms = 4000) { this.mood = { m, until: performance.now() + ms }; }
  setClaude(state) { claude.state = state; ledFromClaude(); this.inkImage = null; }
  // ---------- навігація ----------
  show(id, dir = 0) {
    if (id === this.screen) return;
    this.slideFrom = this.screen; this.slideDx = dir || (this.list.indexOf(id) > this.list.indexOf(this.screen) ? 1 : -1);
    this.screen = id; this.slide = performance.now(); this.inkImage = null; this.onScreen?.(id);
  }
  next(d = 1) { const i = this.list.indexOf(this.screen); const n = this.list[(i + d + this.list.length) % this.list.length]; this.show(n, d); }
  // ---------- сценарії ----------
  run(id) {
    const sc = SCENARIOS.find(s => s[0] === id); if (!sc) return;
    if (!this.scenario) this.snapshot(); else this.stopScenario();
    this.scenario = { id, t0: performance.now(), dur: sc[4] };
    sc[5](this);
    this.timers.push(setTimeout(() => this.stopScenario(!sc[6]), sc[4]));
  }
  timeline(steps) { for (const [ms, fn] of steps) this.timers.push(setTimeout(fn, ms)); }
  runStory(id, from = 0) {
    // from — з якого кроку почати: попередні кроки виконуються миттєво, щоб стан був узгоджений
    const st = STORIES.find(x => x[0] === id); if (!st) return;
    this.stopScenario(true); this.snapshot();
    const steps = st[5], off = steps[from]?.[0] ?? 0;
    this.story = { id, t0: performance.now() - off, dur: st[4], step: -1, caption: null, n: steps.length };
    steps.forEach(([ms, cap, fn], i) => {
      const go = () => { this.story.step = i; this.story.caption = cap; try { fn(this); } catch (e) { console.error(e); } this.onStory?.(); };
      if (i < from) { try { fn(this); } catch (e) { /* пропуск */ } this.toasts = []; this.parts = []; } else this.timers.push(setTimeout(go, ms - off));
    });
    this.timers.push(setTimeout(() => this.stopScenario(true), st[4] - off));
    this.onStory?.();
  }
  snapshot() { this.snap = { claude: JSON.parse(JSON.stringify(claude)), cal: JSON.parse(JSON.stringify(cal)), tasks: JSON.parse(JSON.stringify(tasks)), focus: { ...focus }, sensors: { ...sensors }, screen: this.screen }; }
  stopScenario(restore = false) {
    this.timers.forEach(clearTimeout); this.timers = [];
    if (restore && this.snap) {
      Object.assign(claude, this.snap.claude); Object.assign(cal, this.snap.cal); tasks.list = this.snap.tasks.list; Object.assign(focus, this.snap.focus);
      Object.assign(sensors, { battery: this.snap.sensors.battery, charging: false, wifi: true, lux: 300 });
      this.powerOff = false; this.bannerT = null; ledFromClaude(); this.show(this.snap.screen);
    }
    this.scenario = null; this.story = null; this.inkImage = null;
    this.virt = null; this.launch = null; this.toasts = []; this.mood = null; this.parts = [];
    if (this.tiltTimer) clearTimeout(this.tiltTimer); this.tiltTimer = null;
    if (!sensors.real) { sensors.tRoll = 0; sensors.tPitch = 0; }
    this.game.auto = false;
    this.trendOverride = null; this.humOverride = null; this.codeOverride = null; this.aqiOverride = null;
    this.onStory?.();
  }
  toast(text, color) { this.toasts.push({ text, color, t: performance.now() }); this.inkImage = null; }
  banner(text, color) { this.bannerT = { text, color }; this.inkImage = null; }
  flash(color) { this.flashT = performance.now(); this.flashC = color; }
  confetti(color) { for (let i = 0; i < 60; i++) this.parts.push({ x: rnd(0, 170), y: rnd(-40, 0), vx: rnd(-20, 20), vy: rnd(20, 80), c: i % 3 ? color : '#fff', t: performance.now(), life: rnd(1200, 2200) }); }
  wink() { this.winkT = performance.now(); }
  shake() { this.shakeT = performance.now(); const tk = this.tank; for (let i = 0; i < tk.n; i++) tk.v[i] += Math.sin(i * 0.6) * 30 + rnd(-10, 10); for (let i = 0; i < 25; i++) tk.drops.push({ x: rnd(20, 150), y: tk.level(), vx: rnd(-40, 40), vy: rnd(-90, -30), t: performance.now() }); }
  animTilt(roll, pitch, ms = 0) { if (this.tiltTimer) clearTimeout(this.tiltTimer); sensors.tRoll = roll; sensors.tPitch = pitch; this.tiltTimer = ms ? setTimeout(() => { sensors.tRoll = 0; sensors.tPitch = 0; }, ms) : null; }
  fullRefresh() { this.inkFlash = performance.now(); }
  // ---------- вказівник ----------
  setupPointer() {
    const c = this.canvas;
    const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width / this.S, (e.clientY - r.top) * c.height / r.height / this.S]; };
    c.addEventListener('pointermove', e => { if (this.version === 'touch' && !sensors.real && !this.scenario && !this.story) { const [x, y] = pos(e); sensors.tRoll = (x / 170 - 0.5) * 50; sensors.tPitch = (y / 380 - 0.5) * 30; } });
    c.addEventListener('pointerleave', () => { if (!sensors.real && !this.scenario && !this.story) { sensors.tRoll = 0; sensors.tPitch = 0; } });
    c.addEventListener('pointerdown', e => { if (this.version !== 'touch') return; this.hold = true; this.tap(pos(e)); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) c.addEventListener(ev, () => { this.hold = false; });
    c.addEventListener('pointerenter', () => { this.hover = true; }); c.addEventListener('pointerleave', () => { this.hover = false; });
    this.keys = {};
    addEventListener('keydown', e => { if (this.screen !== 'landing' || !this.hover) return; if (['ArrowUp', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) { e.preventDefault(); this.keys[e.key] = true; if (this.game.state !== 'fly') this.resetGame(); } });
    addEventListener('keyup', e => { this.keys[e.key] = false; });
  }
  // ---------- міні-гра «Посадка»: місячна гравітація 1.62 м/с², тяга до 3.2 м/с², паливо ~15 с ----------
  newGame() {
    const terr = Array.from({ length: 18 }, (_, i) => 6 + Math.sin(i * 1.7) * 4 + Math.sin(i * 0.6) * 5);
    const pi = 4 + Math.floor(Math.random() * 9); terr[pi] = terr[pi + 1] = terr[pi + 2] = Math.min(terr[pi], 8);
    return { state: 'ready', x: 10, alt: 95, vx: 4, vy: 0, ang: 0, fuel: 1, thrust: 0, terr, pad: [pi * 5, (pi + 2) * 5], auto: false, t: 0, msg: 0 };
  }
  resetGame() { const auto = this.game.auto; this.game = this.newGame(); this.game.state = 'fly'; this.game.auto = auto; }
  ground(x) { const g = this.game, i = Math.max(0, Math.min(16.999, x / 5)), k = i % 1, a = Math.floor(i); return g.terr[a] * (1 - k) + g.terr[a + 1] * k; }
  stepGame(dt) {
    const g = this.game; if (g.state !== 'fly') return;
    let target, burn;
    if (g.auto) { // автопілот: над майданчик, потім м'яко вниз
      const pc = (g.pad[0] + g.pad[1]) / 2, dx = pc - g.x, h = g.alt - this.ground(g.x);
      target = Math.max(-25, Math.min(25, dx * 1.5 - g.vx * 5));
      const want = -Math.max(0.9, Math.min(6, h * 0.22 + (Math.abs(dx) > 4 ? 1.5 : 0.6)));
      burn = g.vy < want || Math.abs(target - g.ang) < 8 && Math.abs(dx) > 4 && Math.random() < 0.3 ? 1 : 0;
    } else {
      target = this.keys.ArrowLeft ? -25 : this.keys.ArrowRight ? 25 : Math.max(-30, Math.min(30, sensors.roll));
      burn = this.hold || this.keys.ArrowUp || this.keys[' '] ? 1 : 0;
    }
    g.ang = lerp(g.ang, target, 0.06);
    g.thrust = burn && g.fuel > 0 ? 1 : 0;
    const a = g.thrust * 3.2, r = g.ang * Math.PI / 180;
    g.vx += Math.sin(r) * a * dt; g.vy += (Math.cos(r) * a - 1.62) * dt;
    g.fuel = Math.max(0, g.fuel - g.thrust * dt / 15);
    g.x = Math.max(1, Math.min(84, g.x + g.vx * dt)); g.alt += g.vy * dt; g.t += dt;
    const gr = this.ground(g.x);
    if (g.alt <= gr) {
      g.alt = gr; const onPad = g.x >= g.pad[0] + 1 && g.x <= g.pad[1] - 1, soft = g.vy > -2 && Math.abs(g.vx) < 1.5 && Math.abs(g.ang) < 10;
      g.state = onPad && soft ? 'landed' : 'crash'; g.msg = performance.now(); g.hit = { vy: g.vy, vx: g.vx, ang: g.ang, onPad };
      if (g.state === 'landed') { led.set(GREEN, 'strobe', 3, 2500); this.confetti(GREEN); this.react('happy', 3000); }
      else { led.set(RED, 'strobe', 6, 2000); this.shake(); }
    }
  }
  tap([x, y]) {
    this.ripples.push({ x, y, t: performance.now() });
    const s = this.screen;
    if (this.bannerT) { this.bannerT = null; return; }
    if (s === 'tasks') { const i = Math.floor((y - 40) / 66); if (i >= 0 && i < 3 && y - 40 - i * 66 < 58) { tasks.list[i][2] = !tasks.list[i][2]; if (tasks.list[i][2]) this.confetti(GREEN); } }
    else if (s === 'focus') { if (!focus.running) { focus.running = true; focus.left = focus.total; led.set(BLUE, 'solid'); } else { focus.running = false; ledFromClaude(); } }
    else if (s === 'music') music.playing = !music.playing;
    else if (s === 'tank') { const tk = this.tank; const i = Math.round(x / 170 * (tk.n - 1)); tk.v[i] -= 120; tk.drops.push({ x, y: y - 40, vx: 0, vy: 60, t: performance.now(), drop: true }); }
    else if (s === 'fact') { this.factIdx++; }
    else if (s === 'face') { this.wink(); this.react('happy', 1500); }
    else if (s === 'landing') { const g = this.game; if (g.state !== 'fly') this.resetGame(); }
    else if (s === 'meeting') this.knock();
  }
  // стук по столу: на «Мітингу» за ≤ 5 хв = «іду», деінде — наступний екран
  knock() {
    if (this.screen === 'meeting' && cal.next.inMin <= 5 && cal.next.inMin > 0) { led.set(GREEN, 'solid', 1, 1500); this.toast({ uk: '✓ іду · учасникам надіслано', en: '✓ on my way · attendees notified' }, GREEN); }
    else this.next();
  }
  // ---------- симуляція ----------
  tick(now, t) {
    const dt = 1 / 60;
    if (!this.scenario && !this.story) { claude.resetMin = 134 - Math.floor(t / 60) % 134; claude.sessionMin = 47 + Math.floor(t / 60); }
    sensors.roll = lerp(sensors.roll, sensors.tRoll, 0.08); sensors.pitch = lerp(sensors.pitch, sensors.tPitch, 0.08);
    sensors.mic = lerp(sensors.mic, 0.08 + Math.random() * 0.2, 0.15);
    sensors.temp = weather.temp + 2.3 + Math.sin(t * 0.05) * 0.2; sensors.hum = weather.hum - 8 + Math.sin(t * 0.07);
    sensors.pressure = sensors.pBase + Math.sin(t / 90) * 1.5; sensors.trend = this.trendOverride ?? Math.cos(t / 90);
    if (this.humOverride != null) sensors.hum = this.humOverride;
    sensors.alt = Math.round(44330 * (1 - Math.pow(sensors.pressure / 1013.25, 0.1903)));
    if (sensors.charging) sensors.battery = Math.min(1, sensors.battery + dt * 0.03);
    if (focus.running && focus.left > 0) { focus.left -= dt; if (focus.left <= 0) { focus.left = 0; focus.running = false; } }
    if (music.playing) music.pos = (music.pos + dt) % music.len;
    if (led.until && performance.now() > led.until) { led.until = 0; ledFromClaude(); }
    this.stepTank(dt, t);
    if (this.screen === 'landing') this.stepGame(dt);
  }
  frame() {
    const now = this.clock(), t = (performance.now() - this.t0) / 1000;
    updateCal(now);
    this.tick(now, t);
    if (this.version === 'ink') this.frameInk(now, t); else this.frameTft(now, t);
    this.onDraw?.(led.value(t), led.color);
  }
  // ---------- AMOLED ----------
  frameTft(now, t) {
    const c = this.ctx, S = this.S, W = 170, H = 380, since = (performance.now() - this.boot) / 1000, tn = performance.now();
    c.setTransform(S, 0, 0, S, 0, 0);
    if (since < 1.4) return this.drawBoot(c, since, H);
    c.fillStyle = DARK; c.fillRect(0, 0, W, H);
    let dx = 0;
    if (this.slide) { const s = (tn - this.slide) / 300; if (s < 1) dx = (1 - ease(s)) * -this.slideDx * W; else this.slide = 0; }
    const px = sensors.roll * 0.04, py = sensors.pitch * 0.04;
    c.save(); c.translate(dx + px, py); this.drawScreen(c, this.screen, now, t, H); c.restore();
    if (dx !== 0 && this.slideFrom) { c.save(); c.translate(dx + this.slideDx * W, 0); this.drawScreen(c, this.slideFrom, now, t, H); c.restore(); }
    // шапка стану: offline, батарея
    if (!sensors.wifi) { c.fillStyle = '#2a2f3a'; c.fillRect(W / 2 - 40, 2, 80, 10); c.fillStyle = '#ffb86b'; c.font = F(7); c.textAlign = 'center'; c.fillText(this.lang === 'uk' ? 'offline · 5 хв тому' : 'offline · 5 min ago', W / 2, 9.5); }
    // банер, тости, конфеті, ріпл, спалах
    if (this.bannerT) { c.fillStyle = this.bannerT.color; c.fillRect(0, 0, W, 22); c.fillStyle = '#fff'; c.font = F(10, 'bold'); c.textAlign = 'center'; c.fillText(this.bannerT.text[this.lang] ?? this.bannerT.text.en, W / 2, 15); }
    this.toasts = this.toasts.filter(x => tn - x.t < 3500);
    this.toasts.slice(-2).forEach((x, i, arr) => {
      const a = Math.min(1, (tn - x.t) / 250, (3500 - (tn - x.t)) / 400), y = H - 58 - (arr.length - 1 - i) * 36;
      c.globalAlpha = a; c.fillStyle = '#1c2130'; c.fillRect(8, y, W - 16, 32); c.fillStyle = x.color; c.fillRect(8, y, 3, 32);
      c.fillStyle = '#fff'; c.font = F(8); c.textAlign = 'left'; wrap(c, x.text[this.lang] ?? x.text.en, 16, y + 13, W - 30, 11, 2); c.globalAlpha = 1;
    });
    this.parts = this.parts.filter(p => tn - p.t < p.life);
    for (const p of this.parts) { const s = (tn - p.t) / 1000; c.fillStyle = p.c; c.globalAlpha = 1 - s / (p.life / 1000); c.fillRect(p.x + p.vx * s, p.y + p.vy * s + 60 * s * s, 3, 3); } c.globalAlpha = 1;
    this.ripples = this.ripples.filter(r => tn - r.t < 500);
    for (const r of this.ripples) { const q = (tn - r.t) / 500; c.strokeStyle = `rgba(245,166,35,${1 - q})`; c.lineWidth = 2; c.beginPath(); c.arc(r.x, r.y, 4 + q * 26, 0, Math.PI * 2); c.stroke(); }
    if (this.flashT && tn - this.flashT < 300) { c.fillStyle = this.flashC; c.globalAlpha = 0.3 * (1 - (tn - this.flashT) / 300); c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    if (this.shakeT && tn - this.shakeT < 2500) { const q = (tn - this.shakeT) / 2500; c.fillStyle = `rgba(239,68,68,${0.3 * (1 - q) * (0.5 + 0.5 * Math.sin(tn / 80))})`; c.fillRect(0, 0, W, H); }
    const br = this.screen === 'night' || this.screen === 'sleep' ? 0.35 : this.settings.bright;
    if (br < 1) { c.fillStyle = `rgba(0,0,0,${1 - br})`; c.fillRect(0, 0, W, H); }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < this.canvas.height; y += 3) c.fillRect(0, y, this.canvas.width, 1);
  }
  drawBoot(c, s, H) {
    c.fillStyle = DARK; c.fillRect(0, 0, 170, H);
    const y0 = H / 2 - 20;
    c.fillStyle = ORANGE; c.font = F(13, 'bold'); c.textAlign = 'center'; c.fillText('LANDER R2', 85, y0);
    c.fillStyle = '#888'; c.font = F(9); c.fillText('ESP32-S3 // AMOLED 240x536', 85, y0 + 16);
    c.strokeStyle = '#444'; c.strokeRect(35.5, y0 + 30.5, 100, 6); c.fillStyle = ORANGE; c.fillRect(37, y0 + 32, 97 * Math.min(1, s / 1.2), 3);
    const msgs = ['wifi ...', 'hub ...', 'weather ok', 'imu · bme280 · veml ok'];
    c.fillStyle = '#6a6'; c.textAlign = 'left'; msgs.slice(0, Math.floor(s / 0.35)).forEach((m, i) => c.fillText('> ' + m, 36, y0 + 55 + i * 12));
  }
  drawScreen(c, id, now, t, H) {
    const fn = this['scr_' + id]; if (fn) fn.call(this, c, now, t, H); else this.scr_mission(c, now, t, H);
  }
  header(c, now, t, W = 170) {
    const loc = this.lang === 'uk' ? 'uk-UA' : 'en-GB';
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(12, 'bold'); c.fillText(now.toLocaleDateString(loc, { weekday: 'long' }).toUpperCase(), 10, 20);
    battery(c, 128, 10, sensors.battery, sensors.battery < 0.15 ? RED : '#7fd67f', sensors.charging, t);
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(8, 26); c.lineTo(W - 8, 26); c.stroke();
  }
  claudeWidget(c, x, y, w, t, now) {
    // компактний віджет агента: маленький Clawd з настроєм + ліміти (колір смуги — від заповненості)
    const uk = this.lang === 'uk', hh = now ? now.getHours() : 12, mood = clawdMood(this, hh >= 23 || hh < 6), col = { question: RED, working: GREEN, happy: GREEN, sad: RED }[mood] || ORANGE;
    tile(c, x, y, w, 54, col);
    drawClawd(c, x + 22, y + 44, 1.8, mood, t, { x: 0, y: 0 }, '#151923');
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.fillText('CLAUDE CODE', x + 44, y + 11);
    c.fillStyle = col; c.font = F(8); c.fillText((MOOD_TEXT[mood] || MOOD_TEXT.idle)[uk ? 'uk' : 'en'], x + 44, y + 22);
    const r = `${Math.floor(claude.resetMin / 60)}h${pad(claude.resetMin % 60)}`, lim = u => (u > 0.9 ? RED : u > 0.7 ? ORANGE : GREEN);
    bar(c, x + 44, y + 29, w - 52, 4, claude.used5h, lim(claude.used5h)); bar(c, x + 44, y + 41, w - 52, 3, claude.usedWeek, '#7aa2f7');
    c.fillStyle = '#aab'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? `5 год ${Math.round(claude.used5h * 100)}% · скид ${r}` : `5h ${Math.round(claude.used5h * 100)}% · reset ${r}`, x + 44, y + 51);
  }
  // --- екрани ---
  scr_mission(c, now, t, H) {
    // головний екран — лише головне: час, дата, погода зараз, наступна подія, агент
    const W = 170, uk = this.lang === 'uk', loc = uk ? 'uk-UA' : 'en-GB', hh = now.getHours() + now.getMinutes() / 60;
    const day = hh >= parseHM(weather.sunrise) && hh < parseHM(weather.sunset);
    frame(c, W, H); this.header(c, now, t);
    c.textAlign = 'right'; c.fillStyle = '#aab'; c.font = F(10); c.fillText(now.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), W - 10, 40);
    plate(c, 6, 48, 158, 66, ORANGE, 10);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 16, 55, 28, 52, '#111', 'rgba(0,0,0,.13)', now.getMilliseconds() < 500);
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(13, 'italic bold'); c.fillText(uk ? 'КИЇВ' : 'KYIV', 10, 140);
    wxIcon(c, this.codeOverride ?? weather.code, 110, 132, 20, t, day);
    c.textAlign = 'right'; c.fillStyle = '#fff'; c.font = F(20, 'bold'); c.fillText(`${weather.temp}°`, W - 10, 142);
    c.fillStyle = '#8a92a6'; c.font = F(8); c.fillText(`${weather.daily[0]?.max ?? weather.temp}° / ${weather.daily[0]?.min ?? weather.temp}° · ${uk ? 'дощ' : 'rain'} ${weather.daily[0]?.pop ?? 0}%`, W - 10, 156);
    c.strokeStyle = '#2a2f3a'; c.beginPath(); c.moveTo(8, 166); c.lineTo(W - 8, 166); c.stroke();
    // наступна подія з календаря
    const m = cal.next; tile(c, 8, 174, W - 16, 42, m.live || m.inMin <= 5 ? BLUE : '#2a2f3a');
    c.textAlign = 'left'; c.fillStyle = '#889'; c.font = F(7); c.fillText(m.none ? (uk ? 'на сьогодні все' : 'nothing left today') : m.live ? (uk ? 'ЗАРАЗ' : 'NOW') : (uk ? 'ДАЛІ' : 'NEXT'), 16, 186);
    if (!m.none) { c.fillStyle = '#fff'; c.font = F(10, 'bold'); c.fillText(m.title.length > 22 ? m.title.slice(0, 21) + '…' : m.title, 16, 199);
      c.fillStyle = m.inMin <= 5 && !m.live ? BLUE : '#aab'; c.font = F(8); c.fillText(m.live ? (uk ? `триває ${m.sinceMin} хв з ${m.dur}` : `${m.sinceMin} of ${m.dur} min`) : (uk ? `через ${m.inMin} хв · ${m.dur} хв` : `in ${m.inMin} min · ${m.dur} min`), 16, 210); }
    this.claudeWidget(c, 8, 224, W - 16, t, now);
    this.dayStrip(c, 10, 292, W - 20, 50, now);
    // підказка: що ще є
    c.fillStyle = '#5a6070'; c.font = F(7); c.textAlign = 'center'; c.fillText(uk ? 'свайп / стук → інші екрани' : 'swipe / knock → more screens', W / 2, H - 14);
  }
  scr_meeting(c, now, t, H) {
    const uk = this.lang === 'uk', m = cal.next, W = 170;
    frame(c, W, H); title(c, uk ? 'НАСТУПНИЙ МІТИНГ' : 'NEXT MEETING');
    if (m.none) { c.fillStyle = '#889'; c.font = F(11); c.textAlign = 'center'; c.fillText(uk ? 'на сьогодні мітингів нема' : 'no more meetings today', 85, 100); this.dayStrip(c, 10, 300, W - 20, 50, now); return; }
    if (!m.live) {
      c.textAlign = 'center'; c.fillStyle = m.inMin <= 5 ? BLUE : '#fff'; c.font = F(m.inMin > 99 ? 40 : 64, 'bold'); c.fillText(m.inMin > 99 ? hm(m.inMin / 60) : String(m.inMin), 85, 110);
      c.fillStyle = '#889'; c.font = F(10); c.fillText(m.inMin > 99 ? (uk ? 'год до початку' : 'hours to start') : (uk ? 'хвилин' : 'minutes'), 85, 128);
    } else {
      c.textAlign = 'center'; c.fillStyle = BLUE; c.font = F(22, 'bold'); c.fillText(uk ? 'В ЕФІРІ' : 'ON AIR', 85, 100);
      c.fillStyle = '#889'; c.font = F(9); c.fillText(uk ? `триває ${m.sinceMin} хв з ${m.dur}` : `${m.sinceMin} of ${m.dur} min`, 85, 118);
      c.fillStyle = BLUE; c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4); c.beginPath(); c.arc(85, 60, 6, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    }
    tile(c, 10, 140, W - 20, 70, BLUE);
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(12, 'bold'); wrap(c, m.title, 18, 158, W - 36, 14, 2);
    c.fillStyle = '#aab'; c.font = F(8); c.fillText(`${m.dur} ${uk ? 'хв' : 'min'} · ${m.link}`, 18, 186);
    m.who.forEach((w, i) => { c.fillStyle = ['#7aa2f7', ORANGE, GREEN][i]; c.beginPath(); c.arc(27 + i * 22, 200, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.font = F(8, 'bold'); c.textAlign = 'center'; c.fillText(w, 27 + i * 22, 203); });
    if (!m.live) {
      c.fillStyle = '#fff'; c.fillRect(110, 222, 50, 50); c.fillStyle = '#000';
      for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) if ((i * 7 + j * 13 + i * j) % 3 === 0) c.fillRect(113 + i * 3.7, 225 + j * 3.7, 3.2, 3.2);
      c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; wrap(c, uk ? 'Скануй, щоб приєднатись з телефону. За ≤ 5 хв стук по столу = «іду».' : 'Scan to join from the phone. Within 5 min, knock the desk = “on my way”.', 10, 232, 92, 10);
    } else { c.fillStyle = '#889'; c.font = F(8); c.textAlign = 'left'; wrap(c, uk ? 'Повідомлення й питання Claude — у черзі до кінця мітингу.' : 'Notifications and Claude’s questions are queued until the meeting ends.', 10, 234, W - 20, 11, 3); }
    this.dayStrip(c, 10, 300, W - 20, 50, now);
  }
  dayStrip(c, x, y, w, h, now) {
    const uk = this.lang === 'uk', h0 = 8, h1 = 20, cur = now.getHours() + now.getMinutes() / 60;
    c.fillStyle = '#151923'; c.fillRect(x, y, w, h);
    for (let hh = h0; hh <= h1; hh += 2) { const xx = x + (hh - h0) / (h1 - h0) * w; c.fillStyle = '#2a2f3a'; c.fillRect(xx, y, 1, h); c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'center'; c.fillText(hh, xx, y + h - 3); }
    for (const [a, b] of cal.day) { const xa = x + (a - h0) / (h1 - h0) * w, xb = x + (b - h0) / (h1 - h0) * w; c.fillStyle = b <= cur ? '#3a3f4a' : BLUE; c.fillRect(xa, y + 12, Math.max(2, xb - xa - 1), h - 26); }
    const xc = x + Math.min(1, Math.max(0, (cur - h0) / (h1 - h0))) * w; c.fillStyle = ORANGE; c.fillRect(xc - 0.5, y, 1.5, h);
    c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'сьогодні' : 'today', x + 3, y + 8);
  }
  scr_day(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, cur = now.getHours() + now.getMinutes() / 60;
    frame(c, W, H); title(c, uk ? 'ДЕНЬ' : 'DAY');
    const y0 = 34, hpx = 24;
    // вільні вікна — підсвічені
    const free = freeSlots(now);
    for (const [a, b] of free) { const y = y0 + (a - 8) * hpx; c.fillStyle = 'rgba(34,197,94,.10)'; c.fillRect(32, y, W - 44, (b - a) * hpx); }
    for (let hh = 8; hh <= 20; hh++) { const y = y0 + (hh - 8) * hpx; c.fillStyle = '#2a2f3a'; c.fillRect(30, y, W - 40, 1); c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'right'; c.fillText(pad(hh), 26, y + 3); }
    for (const [a, b, name] of cal.day) { const y = y0 + (a - 8) * hpx, h = Math.max(12, (b - a) * hpx); const past = b <= cur; c.fillStyle = past ? '#20242e' : '#1c2a44'; c.fillRect(32, y + 1, W - 44, h - 2); c.fillStyle = past ? '#556' : BLUE; c.fillRect(32, y + 1, 2, h - 2); c.fillStyle = past ? '#889' : '#fff'; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(name, 38, y + Math.min(11, h - 3)); }
    if (cur >= 8 && cur <= 20) { const y = y0 + (cur - 8) * hpx; c.fillStyle = ORANGE; c.fillRect(28, y, W - 36, 1.5); c.beginPath(); c.arc(28, y, 3, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = GREEN; c.font = F(7); c.textAlign = 'left';
    c.fillText((uk ? 'вільно: ' : 'free: ') + (free.length ? free.slice(0, 2).map(([a, b]) => `${hm(a)}–${hm(b)}`).join(', ') : '—'), 10, H - 14);
  }
  scr_dev(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, loc = uk ? 'uk-UA' : 'en-GB';
    frame(c, W, H); title(c, 'DEV · CLAUDE CODE');
    this.claudeWidget(c, 8, 30, W - 16, t, now);
    tile(c, 8, 90, W - 16, 30, '#7aa2f7');
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.fillText(claude.session, 16, 102);
    c.fillStyle = '#aab'; c.font = F(8); c.fillText(`${uk ? 'сесія' : 'session'} ${Math.floor(claude.sessionMin / 60)}h ${pad(claude.sessionMin % 60)}m · ${claude.commits} ${uk ? 'комітів' : 'commits'}`, 16, 114);
    c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'останні PR' : 'recent PRs', 10, 132);
    claude.prs.slice(0, 3).forEach(([name, st, ci], i) => {
      const y = 138 + i * 28; tile(c, 8, y, W - 16, 24, st === 'merged' ? '#a371f7' : ci === 'fail' ? RED : GREEN);
      c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(name, 16, y + 10);
      c.fillStyle = st === 'merged' ? '#a371f7' : '#7aa2f7'; c.font = F(7); c.fillText(st, 16, y + 20);
      c.textAlign = 'right'; c.fillStyle = ci === 'ok' ? GREEN : RED; c.font = F(9, 'bold'); c.fillText(ci === 'ok' ? 'CI ✓' : 'CI ✗', W - 16, y + 16);
    });
    // коміти за останні 7 днів, сьогодні — праворуч
    c.fillStyle = '#889'; c.font = F(8); c.textAlign = 'left'; c.fillText(uk ? 'коміти за 7 днів' : 'commits, last 7 days', 10, 238);
    const wk = [3, 8, 5, 11, 7, 2, claude.commits];
    wk.forEach((v, i) => { const d = new Date(now.getTime() - (6 - i) * 864e5); c.fillStyle = i === 6 ? ORANGE : '#3a3f4a'; c.fillRect(12 + i * 22, 300 - v * 4, 16, v * 4); c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'center'; c.fillText(d.toLocaleDateString(loc, { weekday: 'narrow' }), 20 + i * 22, 310); });
    c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'left'; wrap(c, uk ? 'Джерело: hooks Claude Code → локальний хаб на ноуті → SSE на пристрій, < 1 с.' : 'Source: Claude Code hooks → local hub on the laptop → SSE to the device, < 1 s.', 10, 330, W - 20, 10);
  }
  scr_room(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'КІМНАТА' : 'ROOM');
    const comfort = Math.max(0, 100 - Math.abs(sensors.temp - 22) * 8 - Math.abs(sensors.hum - 45) * 1.2 - Math.max(0, 30 - sensors.hum) * 2.5);
    const tiles = [[`${sensors.temp.toFixed(1)}°C`, uk ? 'температура' : 'temperature', ORANGE], [`${Math.round(sensors.hum)}%`, uk ? 'вологість' : 'humidity', '#7aa2f7'], [`${sensors.pressure.toFixed(0)} hPa`, `${uk ? 'тиск' : 'pressure'} ${sensors.trend > 0.2 ? '↑' : sensors.trend < -0.2 ? '↓' : '→'}`, '#a371f7'], [`${Math.round(sensors.lux)} lx`, uk ? 'освітленість' : 'light', '#ffd34d']];
    tiles.forEach(([v, l, col], i) => { const x = 10 + (i % 2) * 78, y = 32 + Math.floor(i / 2) * 50; tile(c, x, y, 72, 44, col); c.fillStyle = '#fff'; c.font = F(15, 'bold'); c.textAlign = 'left'; c.fillText(v, x + 8, y + 20); c.fillStyle = '#889'; c.font = F(7); c.fillText(l, x + 8, y + 35); });
    // комфорт
    c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'індекс комфорту' : 'comfort index', 10, 146);
    bar(c, 10, 150, W - 20, 8, comfort / 100, comfort > 70 ? GREEN : comfort > 40 ? ORANGE : RED);
    c.fillStyle = '#fff'; c.font = F(9, 'bold'); c.textAlign = 'right'; c.fillText(`${Math.round(comfort)}`, W - 10, 146);
    const hint = sensors.hum < 30 ? (uk ? 'сухо — зволожувач' : 'dry — humidifier on') : sensors.trend < -0.3 ? (uk ? 'тиск падає — буде дощ' : 'pressure falling — rain') : sensors.lux < 10 && now.getHours() > 8 && now.getHours() < 18 ? (uk ? 'темно вдень — штори' : 'dark by day — curtains') : (uk ? 'усе в нормі' : 'all good');
    c.fillStyle = '#aab'; c.font = F(8); c.textAlign = 'left'; c.fillText(hint, 10, 172);
    // 24 год графік температури в кімнаті (симуляція навколо поточної)
    c.fillStyle = '#889'; c.fillText(uk ? 'кімната, 24 год' : 'room, 24 h', 10, 192);
    const gx = 10, gy = 198, gw = W - 20, gh = 60; c.fillStyle = '#151923'; c.fillRect(gx, gy, gw, gh);
    c.save(); c.beginPath(); c.rect(gx, gy, gw, gh); c.clip();
    c.strokeStyle = ORANGE; c.lineWidth = 1.5; c.beginPath();
    for (let i = 0; i <= 48; i++) { const v = sensors.temp - 1.5 + Math.sin(i / 48 * Math.PI * 2 - 1.5) * 1.5; const x = gx + i / 48 * gw, y = gy + gh / 2 - (v - sensors.temp) * 12; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.strokeStyle = '#7aa2f7'; c.beginPath();
    for (let i = 0; i <= 48; i++) { const v = sensors.hum + Math.cos(i / 48 * Math.PI * 2) * 5; const x = gx + i / 48 * gw, y = gy + gh - (v - 30) / 50 * gh; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
    c.fillStyle = '#8a92a6'; c.font = F(8); const n1 = wrap(c, uk ? 'BME280 — у капсулі ззаду, отвором униз, подалі від чипа; VEML7700 — зверху, дивиться в стелю.' : 'BME280 — in the rear capsule, facing down, away from the chip; VEML7700 — on top, facing the ceiling.', 10, 274, W - 20, 11, 3);
    wrap(c, uk ? 'Сценарії: сухо → зволожувач; тиск падає → дощ; темно вдень → штори.' : 'Scenarios: dry → humidifier; pressure falling → rain; dark by day → curtains.', 10, 274 + n1 * 11 + 6, W - 20, 11, 3);
  }
  scr_forecast(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, loc = uk ? 'uk-UA' : 'en-GB';
    frame(c, W, H); title(c, uk ? 'ПРОГНОЗ · 7 ДНІВ' : 'FORECAST · 7 DAYS');
    weather.daily.slice(0, 7).forEach((d, i) => {
      const y = 32 + i * 38; tile(c, 8, y, W - 16, 34, i === 0 ? ORANGE : '#2a2f3a');
      c.fillStyle = i === 0 ? '#fff' : '#aab'; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(d.date.toLocaleDateString(loc, { weekday: 'short' }).toUpperCase(), 16, y + 13);
      c.fillStyle = '#8a92a6'; c.font = F(7); c.fillText(d.date.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), 16, y + 25);
      wxIcon(c, d.code, 66, y + 17, 14, t);
      c.fillStyle = '#fff'; c.font = F(11, 'bold'); c.textAlign = 'right'; c.fillText(`${d.max}°`, 120, y + 15); c.fillStyle = '#889'; c.font = F(8); c.fillText(`${d.min}°`, 120, y + 27);
      c.fillStyle = d.pop > 50 ? '#7aa2f7' : '#8a92a6'; c.font = F(7); c.fillText(`${d.pop}%`, 150, y + 13); c.fillStyle = '#8a92a6'; c.fillText(`${d.wind} km/h`, 158, y + 26);
    });
    const fc = sensors.trend > 0.2 ? (uk ? 'тиск росте → прояснення' : 'pressure rising → clearing') : sensors.trend < -0.2 ? (uk ? 'тиск падає → дощ можливий' : 'pressure falling → rain likely') : (uk ? 'тиск стабільний' : 'pressure steady');
    tile(c, 8, 302, W - 16, 30, '#7aa2f7'); c.fillStyle = '#fff'; c.font = F(10, 'bold'); c.textAlign = 'left'; c.fillText(`${sensors.pressure.toFixed(1)} hPa`, 16, 315); c.fillStyle = '#aab'; c.font = F(7); c.fillText(fc, 16, 326);
    c.fillStyle = '#8a92a6'; c.font = F(7); c.fillText(weather.live ? 'open-meteo · live' : 'open-meteo · static', 10, 348);
    if ((this.codeOverride ?? weather.code) >= 51 && (this.codeOverride ?? weather.code) < 70) this.rainOnGlass(c, t, W, H);
  }
  rainOnGlass(c, t, W, H) { c.fillStyle = 'rgba(120,170,255,0.35)'; for (let i = 0; i < 30; i++) { const x = (i * 53) % W, y = ((t * (20 + i % 5 * 8)) + i * 37) % H; c.beginPath(); c.ellipse(x, y, 1.5, 3, 0, 0, Math.PI * 2); c.fill(); } }
  scr_air(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, a = this.aqiOverride != null ? { ...weather.aq, aqi: this.aqiOverride } : weather.aq;
    frame(c, W, H); title(c, uk ? 'ПОВІТРЯ' : 'AIR');
    const col = a.aqi <= 20 ? GREEN : a.aqi <= 40 ? '#a3e635' : a.aqi <= 60 ? ORANGE : RED;
    c.lineWidth = 8; c.strokeStyle = '#2a2f3a'; c.beginPath(); c.arc(85, 80, 38, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
    c.strokeStyle = col; c.beginPath(); c.arc(85, 80, 38, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * Math.min(1, a.aqi / 100))); c.stroke();
    c.fillStyle = '#fff'; c.font = F(24, 'bold'); c.textAlign = 'center'; c.fillText(a.aqi, 85, 88); c.fillStyle = '#889'; c.font = F(8); c.fillText('AQI (EU)', 85, 102);
    const tiles = [[`${a.pm25}`, 'PM2.5 µg/m³'], [`${a.pm10}`, 'PM10 µg/m³'], [`${a.uv}`, 'UV'], [`${weather.temp}°`, uk ? 'на вулиці' : 'outdoors']];
    tiles.forEach(([v, l], i) => { const x = 10 + (i % 2) * 78, y = 130 + Math.floor(i / 2) * 44; tile(c, x, y, 72, 38, col); c.fillStyle = '#fff'; c.font = F(13, 'bold'); c.textAlign = 'left'; c.fillText(v, x + 8, y + 18); c.fillStyle = '#889'; c.font = F(7); c.fillText(l, x + 8, y + 30); });
    const open = a.aqi <= 40 && Math.abs(weather.temp - 22) < 8;
    tile(c, 8, 232, W - 16, 96, open ? GREEN : RED);
    c.fillStyle = '#fff'; c.font = F(15, 'bold'); c.textAlign = 'left'; c.fillText(open ? (uk ? 'ВІДКРИЙ ВІКНО' : 'OPEN THE WINDOW') : (uk ? 'ВІКНО ЗАКРИТИ' : 'KEEP IT CLOSED'), 16, 256);
    c.fillStyle = '#aab'; c.font = F(9); wrap(c, uk ? `Вулиця: ${weather.temp}°, AQI ${a.aqi}. Кімната: ${sensors.temp.toFixed(0)}°, ${Math.round(sensors.hum)}%.` : `Outdoors: ${weather.temp}°, AQI ${a.aqi}. Room: ${sensors.temp.toFixed(0)}°, ${Math.round(sensors.hum)}%.`, 16, 276, W - 36, 13);
    c.fillStyle = '#aab'; c.font = F(9); wrap(c, open ? (uk ? 'Провітрювання 10 хв опустить CO₂ і температуру.' : 'Ten minutes of fresh air lowers CO₂ and temperature.') : (uk ? 'Зачекай, поки AQI впаде нижче 40.' : 'Wait until AQI drops below 40.'), 16, 300, W - 36, 12, 3);
    c.fillStyle = '#8a92a6'; c.font = F(8); c.fillText(a.live ? 'open-meteo air quality · live' : 'static', 10, H - 22);
  }
  scr_focus(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'ФОКУС' : 'FOCUS');
    const total = focus.breakMode ? 300 : focus.total, p = 1 - focus.left / total, col = focus.breakMode ? GREEN : BLUE;
    c.lineWidth = 12; c.strokeStyle = '#2a2f3a'; c.beginPath(); c.arc(85, 140, 66, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = col; c.beginPath(); c.arc(85, 140, 66, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke();
    const m = Math.floor(focus.left / 60), s = Math.floor(focus.left % 60);
    c.fillStyle = '#fff'; c.font = F(34, 'bold'); c.textAlign = 'center'; c.fillText(`${pad(m)}:${pad(s)}`, 85, 152);
    c.fillStyle = '#889'; c.font = F(9); c.fillText(focus.breakMode ? (uk ? 'перерва' : 'break') : focus.running ? (uk ? 'фокус · не турбувати' : 'focus · do not disturb') : (uk ? 'тап — старт' : 'tap to start'), 85, 172);
    c.fillStyle = '#889'; c.textAlign = 'left'; c.fillText(uk ? 'сесії сьогодні' : 'sessions today', 10, 242);
    for (let i = 0; i < 8; i++) { c.fillStyle = i < focus.sessions ? col : '#2a2f3a'; c.fillRect(10 + i * 19, 250, 15, 10); }
    c.fillStyle = '#8a92a6'; c.font = F(9); wrap(c, uk ? 'Поки триває сесія — LED синій «on air», Dev-екран і повідомлення приховані. Кінець — спікер, 5 хв перерви.' : 'While a session runs the LED is blue “on air”, Dev and notifications hidden. End — chime, 5-minute break.', 10, 282, W - 20, 12);
  }
  scr_tasks(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'ЗАДАЧІ · СЬОГОДНІ' : 'TASKS · TODAY');
    tasks.list.forEach(([tu, te, done], i) => {
      const y = 40 + i * 66; tile(c, 8, y, W - 16, 58, done ? GREEN : '#2a2f3a');
      c.strokeStyle = done ? GREEN : '#8a92a6'; c.lineWidth = 1.5; c.strokeRect(18.5, y + 21.5, 16, 16);
      if (done) { c.strokeStyle = GREEN; c.beginPath(); c.moveTo(21, y + 30); c.lineTo(26, y + 35); c.lineTo(33, y + 24); c.stroke(); }
      c.fillStyle = done ? '#889' : '#fff'; c.font = F(10, done ? '' : 'bold'); c.textAlign = 'left'; wrap(c, uk ? tu : te, 42, y + 25, W - 62, 13, 2);
      if (done) { c.strokeStyle = '#889'; c.beginPath(); c.moveTo(42, y + 21); c.lineTo(42 + Math.min(W - 62, c.measureText(uk ? tu : te).width), y + 21); c.stroke(); }
    });
    const n = tasks.list.filter(x => x[2]).length;
    c.fillStyle = n === 3 ? GREEN : '#889'; c.font = F(n === 3 ? 14 : 10, 'bold'); c.textAlign = 'center'; c.fillText(n === 3 ? (uk ? 'ДЕНЬ ЗРОБЛЕНО ✓' : 'DAY DONE ✓') : `${n}/3`, 85, 262);
    c.lineWidth = 6; c.strokeStyle = '#2a2f3a'; c.beginPath(); c.arc(85, 300, 22, 0, Math.PI * 2); c.stroke(); c.strokeStyle = GREEN; c.beginPath(); c.arc(85, 300, 22, -Math.PI / 2, -Math.PI / 2 + n / 3 * Math.PI * 2); c.stroke();
    c.fillStyle = '#8a92a6'; c.font = F(8); c.textAlign = 'left'; wrap(c, uk ? 'Todoist / GitHub Issues · тап по чекбоксу' : 'Todoist / GitHub Issues · tap the checkbox', 10, H - 24, W - 20, 11, 2);
  }
  scr_fact(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, loc = uk ? 'uk-UA' : 'en-GB', list = fact.byLang?.[uk ? 'uk' : 'en'] ?? [{ year: fact.year, t: fact.text[uk ? 'uk' : 'en'] }], f = list[this.factIdx % list.length];
    frame(c, W, H); title(c, uk ? 'ЦЬОГО ДНЯ' : 'ON THIS DAY');
    c.fillStyle = '#889'; c.font = F(8); c.fillText(now.toLocaleDateString(loc, { day: 'numeric', month: 'long' }), 10, 36);
    c.fillStyle = ORANGE; c.font = F(40, 'bold'); c.fillText(String(f.year), 10, 80);
    c.fillStyle = '#fff'; c.font = F(11); wrap(c, f.t.replace(/^\d+ — /, ''), 10, 104, W - 20, 15, 14);
    c.fillStyle = '#8a92a6'; c.font = F(7); c.fillText(fact.live ? `wikipedia · on this day · ${this.factIdx % list.length + 1}/${list.length}` : 'wikipedia · static', 10, H - 30);
    if (list.length > 1) c.fillText(uk ? 'тап — наступний факт' : 'tap — next fact', 10, H - 20);
  }
  scr_word(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, w = wordOfDay(now);
    frame(c, W, H); title(c, uk ? 'СЛОВО ДНЯ' : 'WORD OF THE DAY');
    c.textAlign = 'left';
    // довге слово зменшуємо, щоб влізло в ширину екрана
    let px = 22; c.font = F(px, 'bold'); while (px > 12 && c.measureText(w[0]).width > W - 20) { px--; c.font = F(px, 'bold'); }
    c.fillStyle = '#fff'; c.fillText(w[0], 10, 76); c.fillStyle = ORANGE; c.font = F(14); c.fillText(w[1], 10, 100);
    c.fillStyle = '#aab'; c.font = F(11); wrap(c, uk ? w[2] : w[3], 10, 126, W - 20, 15, 3);
    c.fillStyle = BLUE; c.beginPath(); c.arc(30, 210, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(24, 203); c.lineTo(24, 217); c.lineTo(37, 210); c.fill();
    c.fillStyle = '#889'; c.font = F(9); c.fillText(uk ? 'озвучити через спікер' : 'play on the speaker', 54, 214);
    for (let i = 0; i < 16; i++) { const h = 3 + Math.abs(Math.sin(t * 6 + i)) * 14; c.fillStyle = '#3a3f4a'; c.fillRect(54 + i * 6, 244 - h / 2, 3, h); }
    c.fillStyle = '#8a92a6'; c.font = F(9); wrap(c, (uk ? 'Приклад: «' : 'Example: “') + (uk ? w[4] : w[5]) + (uk ? '»' : '”'), 10, 280, W - 20, 13, 4);
  }
  scr_music(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H); frame(c, W, H); title(c, uk ? 'ЗАРАЗ ГРАЄ' : 'NOW PLAYING');
    // «обкладинка» — процедурна
    for (let i = 0; i < 6; i++) { c.fillStyle = `hsl(${(t * 8 + i * 40) % 360}, 60%, ${30 + i * 6}%)`; c.beginPath(); c.arc(85, 110, 60 - i * 9, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#000'; c.beginPath(); c.arc(85, 110, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.font = F(13, 'bold'); c.textAlign = 'center'; c.fillText(music.title, 85, 196); c.fillStyle = '#aab'; c.font = F(9); c.fillText(music.artist, 85, 210);
    bar(c, 20, 224, W - 40, 3, music.pos / music.len, GREEN, '#222');
    c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(`${Math.floor(music.pos / 60)}:${pad(Math.floor(music.pos % 60))}`, 20, 238); c.textAlign = 'right'; c.fillText(`${Math.floor(music.len / 60)}:${pad(music.len % 60)}`, W - 20, 238);
    c.fillStyle = '#fff'; if (music.playing) { c.fillRect(78, 256, 5, 16); c.fillRect(88, 256, 5, 16); } else { c.beginPath(); c.moveTo(78, 256); c.lineTo(78, 272); c.lineTo(94, 264); c.fill(); }
    for (let i = 0; i < 24; i++) { const h = music.playing ? 3 + Math.abs(Math.sin(t * 5 + i * 0.7)) * 16 : 3; c.fillStyle = GREEN; c.fillRect(14 + i * 6, 300 - h / 2, 3, h); }
    c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'left'; c.fillText('spotify · demo', 10, H - 20);
  }
  scr_moon(c, now, t, H) {
    // «Небо»: дуга сонця від сходу до заходу з поточним положенням, місяць, МКС, запуски
    const uk = this.lang === 'uk', W = 170, ph = moonPhase(now), hh = now.getHours() + now.getMinutes() / 60;
    const sr = parseHM(weather.sunrise), ss = parseHM(weather.sunset), day = hh >= sr && hh < ss;
    frame(c, W, H); title(c, uk ? 'НЕБО' : 'SKY');
    const cx = 85, cy = 118, R = 62;
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.arc(cx, cy, R, Math.PI, 0); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#2a2f3a'; c.fillRect(14, cy, W - 28, 1);
    if (day) { const k = (hh - sr) / (ss - sr), a = Math.PI + k * Math.PI; c.strokeStyle = '#ffd34d'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, Math.PI, a); c.stroke(); sunIcon(c, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 7, t, '#ffd34d'); }
    else { for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * Math.abs(Math.sin(t + i))})`; c.fillRect((i * 37) % W, 34 + (i * 53) % 80, 1, 1); } drawMoon(c, cx, cy - 34, 16, ph, '#e8e8f0', '#1c1c26'); }
    c.textAlign = 'left'; c.fillStyle = '#ffd34d'; c.font = F(11, 'bold'); c.fillText(weather.sunrise, 10, cy + 16); c.textAlign = 'right'; c.fillStyle = ORANGE; c.fillText(weather.sunset, W - 10, cy + 16);
    c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'схід' : 'sunrise', 10, cy + 26); c.textAlign = 'right'; c.fillText(uk ? 'захід' : 'sunset', W - 10, cy + 26);
    const dl = ss - sr; c.textAlign = 'center'; c.fillStyle = '#aab'; c.font = F(8); c.fillText(day ? (uk ? `світло ще ${hm(ss - hh)}` : `${hm(ss - hh)} of light left`) : (uk ? `світловий день ${hm(dl)}` : `daylight ${hm(dl)}`), cx, cy + 26);
    // місяць
    const lit = Math.round((1 - Math.cos(ph * 2 * Math.PI)) / 2 * 100);
    const names = uk ? ['новий', 'молодий', 'перша чверть', 'зростає', 'повний', 'спадає', 'остання чверть', 'старий'] : ['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'last quarter', 'waning crescent'];
    tile(c, 8, 158, W - 16, 44, '#c9ced8'); drawMoon(c, 30, 180, 13, ph, '#e8e8f0', '#1c1c26');
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(9, 'bold'); c.fillText(names[Math.round(ph * 8) % 8], 50, 176);
    c.fillStyle = '#889'; c.font = F(7); c.fillText(uk ? `освітлено ${lit}%` : `${lit}% lit`, 50, 188); c.fillText(uk ? `повня через ${Math.round(((0.5 - ph + 1) % 1) * 29.53)} дн` : `full in ${Math.round(((0.5 - ph + 1) % 1) * 29.53)} d`, 50, 197);
    const rows = uk ? [['МКС над Києвом', '21:14 → 21:20, 62°'], ['видимі планети', 'Юпітер, Сатурн'], ['наступний запуск', 'Falcon 9 · за 2 дн']] : [['ISS over Kyiv', '21:14 → 21:20, 62°'], ['visible planets', 'Jupiter, Saturn'], ['next launch', 'Falcon 9 · in 2 d']];
    rows.forEach(([k, v], i) => { const y = 210 + i * 28; tile(c, 8, y, W - 16, 24, '#7aa2f7'); c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(k, 16, y + 10); c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.fillText(v, 16, y + 20); });
    c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'left'; c.fillText(weather.live ? 'open-meteo · LL2 · demo' : 'demo', 10, H - 14);
  }
  horizon(c, x, y, r) {
    c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
    c.translate(x, y); c.rotate(sensors.roll * Math.PI / 180);
    const off = sensors.pitch / 45 * r;
    c.fillStyle = '#2b5c8a'; c.fillRect(-r * 2, -r * 2, r * 4, r * 2 + off); c.fillStyle = '#7a4a1e'; c.fillRect(-r * 2, off, r * 4, r * 2);
    c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.moveTo(-r * 2, off); c.lineTo(r * 2, off); c.stroke();
    for (let i = -2; i <= 2; i++) if (i) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(-r * 0.3, off + i * r * 0.25); c.lineTo(r * 0.3, off + i * r * 0.25); c.stroke(); }
    c.restore();
    c.strokeStyle = ORANGE; c.lineWidth = 2; c.beginPath(); c.moveTo(x - r * 0.6, y); c.lineTo(x - r * 0.2, y); c.moveTo(x + r * 0.2, y); c.lineTo(x + r * 0.6, y); c.stroke();
    c.strokeStyle = '#8a92a6'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  }
  scr_landing(c, now, t, H) {
    // міні-гра: посади лендер на майданчик. Тримай палець / ↑ — тяга, нахил телефона / курсор / ← → — вбік
    const uk = this.lang === 'uk', W = 170, g = this.game, K = 2, gy = 330; // 1 м = 2 px, «земля» y=330
    frame(c, W, H); title(c, uk ? 'ПОСАДКА · ГРА' : 'LANDING · GAME');
    for (let i = 0; i < 24; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + 0.5 * Math.abs(Math.sin(i * 7.3))})`; c.fillRect((i * 41) % W, 40 + (i * 29) % 150, 1, 1); }
    // рельєф і майданчик
    c.fillStyle = '#3a3a44'; c.beginPath(); c.moveTo(0, H);
    for (let i = 0; i <= 17; i++) c.lineTo(i * 5 * K, gy - g.terr[Math.min(17, i)] * K); c.lineTo(W, H); c.closePath(); c.fill();
    const pX0 = g.pad[0] * K, pX1 = g.pad[1] * K, pY = gy - g.terr[g.pad[0] / 5] * K;
    c.fillStyle = GREEN; c.fillRect(pX0 + 2, pY - 2, pX1 - pX0 - 4, 3); c.fillStyle = (Math.floor(t * 2) % 2) ? GREEN : '#0a4'; c.fillRect(pX0 + 2, pY - 6, 2, 4); c.fillRect(pX1 - 4, pY - 6, 2, 4);
    // лендер
    const lx = g.x * K, ly = gy - g.alt * K;
    c.save(); c.translate(lx, ly); c.rotate(g.ang * Math.PI / 180);
    if (g.thrust && g.state === 'fly') { c.fillStyle = ORANGE; c.beginPath(); c.moveTo(-3, -2); c.lineTo(3, -2); c.lineTo(0, 6 + Math.random() * 6); c.fill(); }
    c.strokeStyle = '#e0b060'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-5, -4); c.lineTo(-8, 0); c.moveTo(5, -4); c.lineTo(8, 0); c.stroke();
    c.fillStyle = g.state === 'crash' ? RED : '#d8dce4'; c.fillRect(-5, -14, 10, 10); c.fillStyle = '#e0b060'; c.fillRect(-4, -18, 8, 4);
    c.restore();
    // HUD
    const h = Math.max(0, g.alt - this.ground(g.x)), vyc = g.vy < -2 ? RED : g.vy < -1.2 ? ORANGE : GREEN;
    c.textAlign = 'left'; c.font = F(8); c.fillStyle = '#aab'; c.fillText(uk ? `висота ${h.toFixed(0)} м` : `alt ${h.toFixed(0)} m`, 10, 40);
    c.fillStyle = vyc; c.fillText(`↓ ${Math.max(0, -g.vy).toFixed(1)} ${uk ? 'м/с' : 'm/s'}`, 10, 52);
    c.fillStyle = Math.abs(g.vx) > 1.5 ? ORANGE : '#aab'; c.fillText(`→ ${g.vx.toFixed(1)} ${uk ? 'м/с' : 'm/s'}`, 10, 64);
    c.textAlign = 'right'; c.fillStyle = '#aab'; c.fillText(uk ? 'паливо' : 'fuel', W - 10, 40); bar(c, W - 60, 44, 50, 5, g.fuel, g.fuel < 0.2 ? RED : ORANGE);
    c.fillStyle = Math.abs(g.ang) > 10 ? ORANGE : '#aab'; c.textAlign = 'right'; c.fillText(`${g.ang.toFixed(0)}°`, W - 10, 64);
    if (g.state !== 'fly') {
      const ok = g.state === 'landed';
      c.fillStyle = 'rgba(10,12,17,.82)'; c.fillRect(12, 110, W - 24, 92); c.strokeStyle = g.state === 'ready' ? ORANGE : ok ? GREEN : RED; c.lineWidth = 1.5; c.strokeRect(12.5, 110.5, W - 25, 91);
      c.textAlign = 'center'; c.fillStyle = c.strokeStyle; c.font = F(14, 'bold');
      c.fillText(g.state === 'ready' ? (uk ? 'ПОСАДИ ЛЕНДЕР' : 'LAND IT') : ok ? (uk ? 'М’ЯКА ПОСАДКА ✓' : 'SOFT LANDING ✓') : (uk ? 'АВАРІЯ' : 'CRASH'), 85, 132);
      c.fillStyle = '#aab'; c.font = F(8);
      const lines = g.state === 'ready' ? (uk ? ['тримай палець — тяга', 'нахил / курсор — вбік', 'сідай < 2 м/с на зелене'] : ['hold finger — thrust', 'tilt / cursor — sideways', 'land < 2 m/s on green'])
        : ok ? [uk ? `швидкість ${(-g.hit.vy).toFixed(1)} м/с` : `speed ${(-g.hit.vy).toFixed(1)} m/s`, uk ? `паливо лишилось ${Math.round(g.fuel * 100)}%` : `fuel left ${Math.round(g.fuel * 100)}%`, uk ? 'тап — ще раз' : 'tap — again']
        : [!g.hit.onPad ? (uk ? 'повз майданчик' : 'missed the pad') : -g.hit.vy >= 2 ? (uk ? `надто швидко: ${(-g.hit.vy).toFixed(1)} м/с` : `too fast: ${(-g.hit.vy).toFixed(1)} m/s`) : (uk ? 'бічна швидкість / нахил' : 'sideways speed / tilt'), '', uk ? 'тап — ще раз' : 'tap — again'];
      lines.forEach((l, i) => c.fillText(l, 85, 152 + i * 13));
    }
    c.fillStyle = '#5a6070'; c.font = F(7); c.textAlign = 'center'; c.fillText(uk ? 'g 1.62 · тяга 3.2 м/с²' : 'g 1.62 · thrust 3.2 m/s²', 85, H - 12);
  }
  scr_rates(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'КУРСИ' : 'RATES');
    rates.list.forEach(([pair, v, ch], i) => {
      const y = 34 + i * 96, col = ch >= 0 ? GREEN : RED; tile(c, 8, y, W - 16, 88, col);
      c.textAlign = 'left'; c.fillStyle = '#aab'; c.font = F(9, 'bold'); c.fillText(pair, 16, y + 16);
      c.fillStyle = '#fff'; c.font = F(20, 'bold'); c.fillText(v >= 1000 ? Math.round(v).toLocaleString('en-US') : v.toFixed(2), 16, y + 40);
      c.textAlign = 'right'; c.fillStyle = col; c.font = F(10, 'bold'); c.fillText(`${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(1)}%`, W - 16, y + 16);
      // спарклайн за 7 днів (демо: детермінована крива, що закінчується поточним значенням)
      const pts = Array.from({ length: 7 }, (_, k) => v * (1 - ch / 100 * (6 - k) / 6 + Math.sin(k * 1.9 + i) * 0.006));
      const mn = Math.min(...pts), mx = Math.max(...pts), gx = 16, gw = W - 32, gy = y + 50, gh = 28;
      c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); pts.forEach((p, k) => { const x = gx + k / 6 * gw, yy = gy + gh - (p - mn) / (mx - mn || 1) * gh; k ? c.lineTo(x, yy) : c.moveTo(x, yy); }); c.stroke();
      c.fillStyle = col; c.beginPath(); c.arc(gx + gw, gy + gh - (pts[6] - mn) / (mx - mn || 1) * gh, 2.5, 0, Math.PI * 2); c.fill();
    });
    c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'left'; c.fillText(rates.live ? (uk ? 'open.er-api · наживо · 7 днів' : 'open.er-api · live · 7 days') : (uk ? 'демо · 7 днів' : 'demo · 7 days'), 10, H - 14);
  }
  // Запуск ракети: повноекранний режим LIVE LAUNCH — відлік T-10, стадії, телеметрія, LED у такт
  scr_launch(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, L = this.launch || { t0: performance.now() }, el = (performance.now() - L.t0) / 1000, T = el - 10; // T < 0 — відлік
    const STAGES = [[-10, uk ? 'ВІДЛІК' : 'COUNTDOWN'], [-3, uk ? 'ЗАПАЛЕННЯ' : 'IGNITION'], [0, uk ? 'СТАРТ' : 'LIFTOFF'], [3, 'MAX-Q'], [6, uk ? 'ВІДДІЛЕННЯ СТУПЕНЯ' : 'STAGE SEP'], [9, uk ? 'ОРБІТА ✓' : 'ORBIT ✓']];
    const st = [...STAGES].reverse().find(([a]) => T >= a) || STAGES[0];
    // політ прискорено: реальні точки Falcon 9 — Max-Q T+1:12, відділення T+2:30, орбіта T+8:30
    const P = [[0, 0, 0, 0], [3, 72, 12, 1700], [6, 150, 65, 8300], [9, 510, 200, 27000], [99, 510, 200, 27000]];
    const seg = P.findIndex((p, i) => T < P[i + 1]?.[0]), p0 = P[Math.max(0, seg)], p1 = P[Math.max(0, seg) + 1] || p0, q = T <= 0 ? 0 : Math.min(1, (T - p0[0]) / ((p1[0] - p0[0]) || 1));
    const mt = T <= 0 ? T : lerp(p0[1], p1[1], q), altKm = T <= 0 ? 0 : lerp(p0[2], p1[2], q), spd = T <= 0 ? 0 : lerp(p0[3], p1[3], q);
    const alt = T > 0 ? 0.5 * 18 * T * T : 0, k = Math.min(1, altKm / 60);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${Math.round(20 - 16 * k)},${Math.round(40 - 34 * k)},${Math.round(80 - 66 * k)})`); g.addColorStop(1, k < 0.5 ? '#1a1410' : '#05070c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 40 * k; i++) { c.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t + i))})`; c.fillRect((i * 37) % W, (i * 53) % H, 1, 1); }
    const ry = T <= 0 ? 300 : Math.max(170, 300 - alt * 1.4), shakeX = T > -3 && T < 4 ? (Math.random() - 0.5) * 1.6 : 0;
    if (T <= 1.5) { c.fillStyle = '#2a2a2a'; c.fillRect(0, 318, W, H - 318); c.fillStyle = '#555'; c.fillRect(96, 230, 6, 90); }
    const x = 85 + shakeX, sep = T >= 6;
    if (T > -3) {
      const fl = 18 + Math.random() * 10 + (T > 0 ? 10 : 0);
      c.fillStyle = '#ffd34d'; c.beginPath(); c.moveTo(x - 4, ry + 4); c.lineTo(x + 4, ry + 4); c.lineTo(x, ry + 4 + fl); c.fill();
      c.fillStyle = ORANGE; c.beginPath(); c.moveTo(x - 2.5, ry + 4); c.lineTo(x + 2.5, ry + 4); c.lineTo(x, ry + 4 + fl * 0.6); c.fill();
      if (T < 3) for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI, r = 10 + ((t * 30 + i * 7) % 26); c.fillStyle = `rgba(200,200,200,${0.35 - r / 100})`; c.beginPath(); c.arc(x + Math.cos(a) * r * 1.6, 320 - Math.sin(a) * r * 0.4, 5 + r * 0.2, 0, Math.PI * 2); c.fill(); }
    }
    c.fillStyle = '#e8e8ee'; c.fillRect(x - 4, ry - (sep ? 34 : 60), 8, sep ? 38 : 64);
    c.fillStyle = ORANGE; c.fillRect(x - 4, ry - (sep ? 20 : 30), 8, 3);
    c.fillStyle = '#e8e8ee'; c.beginPath(); c.moveTo(x - 4, ry - (sep ? 34 : 60)); c.lineTo(x, ry - (sep ? 44 : 70)); c.lineTo(x + 4, ry - (sep ? 34 : 60)); c.fill();
    if (!sep) { c.fillStyle = '#9aa'; c.beginPath(); c.moveTo(x - 4, ry); c.lineTo(x - 8, ry + 5); c.lineTo(x - 4, ry - 6); c.fill(); c.beginPath(); c.moveTo(x + 4, ry); c.lineTo(x + 8, ry + 5); c.lineTo(x + 4, ry - 6); c.fill(); }
    else if (T < 9) { c.fillStyle = 'rgba(232,232,238,.6)'; c.fillRect(x - 10 - (T - 6) * 6, ry + 20 + (T - 6) * 22, 7, 26); }
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, 0, W, 64);
    c.textAlign = 'left'; c.fillStyle = RED; c.font = F(8, 'bold'); c.fillText('● LIVE', 10, 14); c.fillStyle = '#aab'; c.font = F(8); c.fillText('Falcon 9 · Starlink 12-5', 48, 14);
    c.fillStyle = T < 0 ? ORANGE : '#fff'; c.font = F(26, 'bold'); c.fillText(`T${mt < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(mt) / 60))}:${pad(Math.floor(Math.abs(mt) % 60))}`, 10, 44);
    c.fillStyle = st[1].includes('✓') ? GREEN : ORANGE; c.font = F(9, 'bold'); c.fillText(st[1], 10, 58);
    if (T > 0) { const v = Math.round(spd); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, H - 40, W, 40); c.fillStyle = '#fff'; c.font = F(10, 'bold'); c.textAlign = 'left'; c.fillText(`${altKm.toFixed(altKm < 10 ? 1 : 0)} km`, 10, H - 22); c.textAlign = 'right'; c.fillText(`${v.toLocaleString('en-US')} km/h`, W - 10, H - 22); c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'висота' : 'altitude', 10, H - 10); c.textAlign = 'right'; c.fillText(uk ? 'швидкість' : 'speed', W - 10, H - 10); c.textAlign = 'center'; c.fillText(uk ? '×60' : '×60', 85, H - 10); }
    else { c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'center'; c.fillText(uk ? 'LL2 · сповіщення за 10 хв' : 'LL2 · alert 10 min before', 85, H - 12); }
  }
  // --- бак: пружинна поверхня ---
  makeTank() { const n = 60; return { n, h: new Float32Array(n), v: new Float32Array(n), drops: [], bubbles: [], level: () => 300 - sensors.battery * 200 }; }
  stepTank(dt, t) {
    const tk = this.tank, k = 0.02, damp = 0.965, spread = 0.22, dtc = Math.min(dt, 1 / 30);
    const g = Math.sin(sensors.roll * Math.PI / 180) * 6;
    for (let i = 0; i < tk.n; i++) { const target = g * (i / tk.n - 0.5) * 40; tk.v[i] += (target - tk.h[i]) * k * 60 * dtc; tk.v[i] *= damp; }
    for (let pass = 0; pass < 4; pass++) for (let i = 0; i < tk.n; i++) { if (i > 0) tk.v[i] += (tk.h[i - 1] - tk.h[i]) * spread; if (i < tk.n - 1) tk.v[i] += (tk.h[i + 1] - tk.h[i]) * spread; }
    for (let i = 0; i < tk.n; i++) { tk.h[i] += tk.v[i] * dtc * 60 * 0.12; tk.h[i] = Math.max(-60, Math.min(60, tk.h[i])); }
    if (!this.scenario && !this.story && Math.random() < 0.02) tk.v[Math.floor(Math.random() * tk.n)] += rnd(-2, 2);
    const tn = performance.now(); tk.drops = tk.drops.filter(d => tn - d.t < 1500);
    for (const d of tk.drops) { d.vy += 120 * dtc; d.x += d.vx * dtc; d.y += d.vy * dtc; if (d.y > tk.level() + tk.h[Math.max(0, Math.min(tk.n - 1, Math.round(d.x / 170 * (tk.n - 1))))] && d.vy > 0) { const i = Math.max(0, Math.min(tk.n - 1, Math.round(d.x / 170 * (tk.n - 1)))); tk.v[i] -= d.drop ? 40 : 15; d.t = 0; } }
    if (sensors.charging && Math.random() < 0.3) tk.bubbles.push({ x: rnd(20, 150), y: 330, r: rnd(1, 3), t: tn });
    tk.bubbles = tk.bubbles.filter(b => tn - b.t < 3000);
  }
  scr_tank(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, tk = this.tank, lvl = tk.level();
    frame(c, W, H); title(c, uk ? 'ПАЛИВНИЙ БАК' : 'FUEL TANK');
    const col = sensors.charging ? BLUE : sensors.battery < 0.15 ? RED : ORANGE;
    c.save(); c.beginPath(); c.rect(12, 50, W - 24, 290); c.clip();
    c.fillStyle = '#0d1117'; c.fillRect(12, 50, W - 24, 290);
    // рідина
    c.fillStyle = col; c.globalAlpha = 0.85; c.beginPath(); c.moveTo(12, 340);
    for (let i = 0; i < tk.n; i++) c.lineTo(12 + i / (tk.n - 1) * (W - 24), lvl + tk.h[i]); c.lineTo(W - 12, 340); c.closePath(); c.fill(); c.globalAlpha = 1;
    // блік від світла
    c.strokeStyle = `rgba(255,255,255,${0.15 + 0.5 * Math.min(1, sensors.lux / 400)})`; c.lineWidth = 2; c.beginPath();
    for (let i = 0; i < tk.n; i++) { const x = 12 + i / (tk.n - 1) * (W - 24), y = lvl + tk.h[i]; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.ellipse(60 + Math.sin(t * 0.5) * 20, lvl + 30, 25, 6, 0, 0, Math.PI * 2); c.fill();
    for (const b of tk.bubbles) { const s = (performance.now() - b.t) / 3000; c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.beginPath(); c.arc(b.x + Math.sin(s * 10) * 3, b.y - s * (b.y - lvl), b.r, 0, Math.PI * 2); c.stroke(); }
    for (const d of tk.drops) { c.fillStyle = col; c.beginPath(); c.arc(d.x, d.y, d.drop ? 3 : 1.5, 0, Math.PI * 2); c.fill(); }
    c.restore();
    // риски рівня
    for (let i = 0; i <= 4; i++) { const y = 100 + i * 50; c.fillStyle = '#3a3f4a'; c.fillRect(W - 22, y, 8, 1); c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'right'; c.fillText(`${100 - i * 25}`, W - 24, y + 2); }
    c.strokeStyle = '#3a3f4a'; c.lineWidth = 2; c.strokeRect(12, 50, W - 24, 290);
    c.fillStyle = '#fff'; c.font = F(22, 'bold'); c.textAlign = 'center'; c.fillText(`${Math.round(sensors.battery * 100)}%`, 85, 80);
    c.fillStyle = '#aab'; c.font = F(7); c.fillText(sensors.charging ? (uk ? 'заряджається · USB-C' : 'charging · USB-C') : `16340 · ${(3.3 + sensors.battery * 0.9).toFixed(2)} V · ~${Math.round(sensors.battery * 6)} ${uk ? 'год' : 'h'}`, 85, 92);
    c.fillStyle = '#8a92a6'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'паливо = батарея' : 'fuel = battery', 12, H - 26); c.fillText(uk ? 'нахил · тап — крапля' : 'tilt · tap — drop', 12, H - 16);
  }
  scr_face(c, now, t, H) {
    // Clawd на весь екран — дзеркало головного агента Claude Code
    const uk = this.lang === 'uk', W = 170, hh = now.getHours();
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    const mood = clawdMood(this, hh >= 23 || hh < 6);
    const look = { x: sensors.roll / 30 + (sensors.mic > 0.5 ? 0.8 : 0) + (mood === 'working' ? Math.sin(t * 3) : 0), y: sensors.pitch / 30 };
    drawClawd(c, W / 2, 212, 7.5, mood, t, look, '#000');
    c.fillStyle = CLAWD; c.font = F(11, 'bold'); c.textAlign = 'center'; c.fillText('CLAUDE CODE', W / 2, 40);
    const col = { question: RED, working: GREEN, happy: GREEN, sad: RED }[mood] || '#aab';
    c.fillStyle = col; c.font = F(10); c.fillText((MOOD_TEXT[mood] || MOOD_TEXT.idle)[uk ? 'uk' : 'en'], W / 2, 250);
    c.fillStyle = '#aab'; c.font = F(8); c.fillText(claude.session, W / 2, 268);
    bar(c, 30, 280, 110, 4, claude.used5h, claude.used5h > 0.9 ? RED : claude.used5h > 0.7 ? ORANGE : GREEN);
    c.fillStyle = '#8a92a6'; c.font = F(7); c.fillText(uk ? `ліміт 5 год · ${Math.round(claude.used5h * 100)}%` : `5h limit · ${Math.round(claude.used5h * 100)}%`, W / 2, 296);
    c.fillStyle = '#5a6070'; c.font = F(7); wrap(c, uk ? 'працює · питає · радіє · сумує · думає · спить' : 'working · asking · happy · sad · thinking · asleep', W / 2, H - 34, W - 20, 10, 2);
    c.fillText(uk ? 'тап / хлопок — привітатись' : 'tap / clap — say hi', W / 2, H - 14);
  }
  scr_night(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 30, H / 2 - 22, 22, 44, '#6a5a44', null, now.getMilliseconds() < 500);
    c.fillStyle = '#8a8076'; c.font = F(9); c.textAlign = 'center'; c.fillText(uk ? 'нічний режим · LED вимкнено' : 'night mode · LED off', 85, H / 2 + 40);
    drawMoon(c, 85, H / 2 - 60, 10, moonPhase(now), '#5a5a66', '#111');
  }
  scr_sleep(c, now, t, H) {
    c.fillStyle = '#000'; c.fillRect(0, 0, 170, H); c.fillStyle = '#6a6a6a'; c.font = F(9); c.textAlign = 'center';
    c.fillText(this.lang === 'uk' ? 'догори дном · сон' : 'face down · sleep', 85, H / 2 - 20);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 40, H / 2, 18, 30, '#4a4a4a', null);
  }
  scr_morning(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, loc = uk ? 'uk-UA' : 'en-GB';
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1a0a'); g.addColorStop(1, DARK); c.fillStyle = g; c.fillRect(0, 0, W, H);
    sunIcon(c, 85, 70, 22, t, '#ffd34d');
    c.fillStyle = '#fff'; c.font = F(16, 'bold'); c.textAlign = 'center'; c.fillText(uk ? 'ДОБРОГО РАНКУ' : 'GOOD MORNING', 85, 120);
    c.fillStyle = '#aab'; c.font = F(9); c.fillText(`${now.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' })} · ${pad(now.getHours())}:${pad(now.getMinutes())}`, 85, 136);
    const first = cal.day.find(([a]) => a > now.getHours() + now.getMinutes() / 60), open = tasks.list.filter(x => !x[2]);
    const w = wordOfDay(now);
    const rows = [[uk ? 'погода' : 'weather', `${weather.temp}° · ${weather.daily[0]?.max}°/${weather.daily[0]?.min}° · ${weather.daily[0]?.pop}% ${uk ? 'дощ' : 'rain'}`], [uk ? 'перший мітинг' : 'first meeting', first ? `${hm(first[0])} ${first[2]}` : '—'], [uk ? 'задачі' : 'tasks', open.length ? `${open.length} · ${open[0][uk ? 0 : 1]}` : (uk ? 'усе зроблено' : 'all done')], [uk ? 'слово дня' : 'word of the day', w[0]]];
    rows.forEach(([k, v], i) => { const y = 156 + i * 34; tile(c, 8, y, W - 16, 30, '#ffd34d'); c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(k, 16, y + 11); c.fillStyle = '#fff'; c.font = F(8, 'bold'); wrap(c, v, 16, y + 23, W - 36, 9, 1); });
  }
  scr_eod(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0f2a'); g.addColorStop(1, DARK); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = '#ffb86b'; c.font = F(16, 'bold'); c.textAlign = 'center'; c.fillText(uk ? 'ДЕНЬ ЗАВЕРШЕНО' : 'DAY COMPLETE', 85, 60);
    const rows = [[cal.day.length, uk ? 'мітингів' : 'meetings'], [claude.commits, uk ? 'комітів' : 'commits'], [2, uk ? 'PR змержено' : 'PRs merged'], [focus.sessions, uk ? 'фокус-сесій' : 'focus sessions'], [`${Math.round(claude.used5h * 100)}%`, uk ? 'ліміту Claude' : 'Claude limit used']];
    rows.forEach(([v, l], i) => { const y = 84 + i * 46; tile(c, 8, y, W - 16, 40, '#ffb86b'); c.fillStyle = '#fff'; c.font = F(18, 'bold'); c.textAlign = 'left'; c.fillText(String(v), 16, y + 26); c.fillStyle = '#aab'; c.font = F(8); c.fillText(l, 60, y + 24); });
    c.fillStyle = '#889'; c.font = F(8); c.textAlign = 'center'; c.fillText(uk ? 'до завтра · LED теплий' : 'see you tomorrow · warm LED', 85, 330);
  }
  // ---------- e-ink 152×296 ----------
  frameInk(now, t) {
    const c = this.ctx, W = 152, H = 296, tn = performance.now();
    c.setTransform(1, 0, 0, 1, 0, 0);
    const minute = now.getHours() * 60 + now.getMinutes();
    if (this.inkFlash) { const s = (tn - this.inkFlash) / 130; if (s < 6) { c.fillStyle = Math.floor(s) % 2 ? INK : PAPER; c.fillRect(0, 0, W, H); return; } this.inkFlash = 0; this.inkImage = null; }
    this.toasts = this.toasts.filter(x => tn - x.t < 3500);
    const key = `${this.screen}|${this.lang}|${claude.state}|${cal.next.inMin}|${sensors.battery.toFixed(2)}|${sensors.wifi}|${this.launch ? Math.floor((tn - this.launch.t0) / 1000) : 0}|${this.bannerT ? 1 : 0}|${this.toasts.length}|${this.factIdx}`;
    if (!this.inkImage || key !== this.inkKey) {
      if (this.inkImage && this.inkKey.split('|')[0] !== this.screen) { this.inkFlash = tn; this.inkKey = key; return; }
      this.inkImage = document.createElement('canvas'); this.inkImage.width = W; this.inkImage.height = H;
      this.drawInk(this.inkImage.getContext('2d'), now, t); this.inkMinute = minute; this.inkKey = key;
    }
    if (minute !== this.inkMinute) { this.inkMinute = minute; this.inkPartial = tn; this.drawInk(this.inkImage.getContext('2d'), now, t); }
    c.drawImage(this.inkImage, 0, 0);
    if (this.inkPartial) { const s = (tn - this.inkPartial) / 110; if (s < 4) { c.fillStyle = Math.floor(s) % 2 ? INK : PAPER; c.fillRect(6, 62, 140, 56); } else this.inkPartial = 0; }
    if (this.powerOff) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, 0, W, H); c.fillStyle = INK; c.fillRect(0, H - 28, W, 28); c.fillStyle = PAPER; c.font = F(8, 'bold'); c.textAlign = 'center'; const uk = this.lang === 'uk'; c.fillText(uk ? 'ЖИВЛЕННЯ ВИМКНЕНО' : 'POWER OFF', W / 2, H - 16); c.fillText(uk ? 'КАРТИНКА ЛИШИЛАСЬ' : 'THE IMAGE STAYS', W / 2, H - 6); }
    c.fillStyle = 'rgba(0,0,0,0.035)'; for (let y = 0; y < H; y += 2) c.fillRect(0, y, W, 1);
  }
  inkHead(c, now, W) {
    const uk = this.lang === 'uk', loc = uk ? 'uk-UA' : 'en-GB';
    c.fillStyle = INK; c.fillRect(0, 0, W, 26);
    c.fillStyle = PAPER; c.font = F(13, 'bold'); c.textAlign = 'left'; c.fillText(now.toLocaleDateString(loc, { weekday: 'short' }).toUpperCase(), 8, 18);
    c.textAlign = 'right'; c.font = F(11); c.fillText(now.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), W - 8, 18);
    battery(c, 8, 34, sensors.battery, INK, false, 0, 1.2);
    c.textAlign = 'right'; c.fillStyle = INK; c.font = F(10); c.fillText(sensors.wifi ? `${(3.3 + sensors.battery * 0.9).toFixed(1)}V` : (uk ? 'offline' : 'offline'), W - 8, 44);
  }
  drawInk(c, now, t) {
    const W = 152, H = 296, uk = this.lang === 'uk', id = this.screen;
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H); c.fillStyle = INK;
    const fn = this['ink_' + id]; if (fn) fn.call(this, c, now, t, W, H, uk); else this.ink_mission(c, now, t, W, H, uk);
    if (this.bannerT) { c.fillStyle = INK; c.fillRect(0, 0, W, 18); c.fillStyle = PAPER; c.font = F(9, 'bold'); c.textAlign = 'center'; c.fillText(this.bannerT.text[this.lang] ?? this.bannerT.text.en, W / 2, 13); }
    const tt = this.toasts[this.toasts.length - 1]; // тост на e-ink — рамкою внизу
    if (tt) { c.fillStyle = PAPER; c.fillRect(6, H - 46, W - 12, 38); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(7, H - 45, W - 14, 36); c.fillStyle = INK; c.font = F(8, 'bold'); c.textAlign = 'left'; wrap(c, tt.text[this.lang] ?? tt.text.en, 12, H - 32, W - 24, 11, 2); }
  }
  ink_mission(c, now, t, W, H, uk) {
    this.inkHead(c, now, W);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(6.5, 62.5, 139, 55);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 13, 68, 27, 44, INK, null);
    c.textAlign = 'left'; c.fillStyle = INK; c.font = F(15, 'bold'); c.fillText(uk ? 'КИЇВ' : 'KYIV', 8, 142);
    c.textAlign = 'right'; c.font = F(20, 'bold'); c.fillText(`${weather.temp}°`, W - 8, 144);
    c.lineWidth = 1; c.beginPath(); c.moveTo(8, 150); c.lineTo(W - 8, 150); c.stroke();
    horizonIcon(c, 38, 172, true, INK, 0, 1.2); horizonIcon(c, 114, 172, false, INK, 0, 1.2);
    c.textAlign = 'center'; c.fillStyle = INK; c.font = F(12); c.fillText(weather.sunrise, 38, 191); c.fillText(weather.sunset, 114, 191);
    c.fillStyle = INK; c.fillRect(8, 200, W - 16, 22); c.fillStyle = PAPER; c.textAlign = 'left'; c.font = F(10, 'bold');
    c.fillText(cal.next.inMin > 0 ? (uk ? `${cal.next.inMin} хв · ${cal.next.title}` : `${cal.next.inMin} min · ${cal.next.title}`).slice(0, 20) + '…' : cal.next.title.slice(0, 20) + '…', 13, 215);
    c.fillStyle = INK; c.textAlign = 'left'; c.font = F(9); c.fillText('HUM', 8, 240); c.strokeRect(34.5, 231.5, 56, 10); c.fillRect(36, 233, 53 * weather.hum / 100, 7); c.fillText(`${weather.hum}%`, 96, 240);
    c.fillText('WIND', 8, 258); c.font = F(13, 'bold'); c.fillText(`${weather.wind}`, 38, 259); c.font = F(9); c.fillText('km/h', 60, 258);
    drawMoon(c, W - 20, 250, 11, moonPhase(now), PAPER, INK); c.beginPath(); c.arc(W - 20, 250, 11, 0, Math.PI * 2); c.stroke(); c.fillStyle = INK;
    c.font = F(9, 'bold'); c.textAlign = 'left'; c.fillText('CLAUDE', 8, 277);
    c.beginPath(); c.arc(56, 273.5, 4, 0, Math.PI * 2); if (claude.state === 'working') c.fill(); else c.stroke();
    if (claude.state === 'question') { c.font = F(8, 'bold'); c.textAlign = 'center'; c.fillText('!', 56, 276.5); c.textAlign = 'left'; }
    c.font = F(9); c.fillText(STATE_TEXT[claude.state][uk ? 'uk' : 'en'], 64, 277);
    c.strokeRect(8.5, 282.5, 100, 7); c.fillRect(10, 284, 97 * claude.used5h, 4); c.font = F(8); c.fillText(`5h ${Math.round(claude.used5h * 100)}%`, 112, 289);
  }
  ink_meeting(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const m = cal.next;
    c.fillStyle = INK; c.textAlign = 'center'; c.font = F(64, 'bold'); c.fillText(m.inMin > 0 ? String(m.inMin) : (uk ? 'ЗАРАЗ' : 'NOW'), W / 2, 118);
    c.font = F(10); c.fillText(m.inMin > 0 ? (uk ? 'хвилин до' : 'minutes to') : (uk ? 'триває' : 'in progress'), W / 2, 134);
    c.font = F(12, 'bold'); c.textAlign = 'left'; wrap(c, m.title, 10, 158, W - 20, 14, 2);
    c.font = F(9); c.fillText(`${m.dur} ${uk ? 'хв' : 'min'} · ${m.who.join(', ')}`, 10, 190);
    c.fillStyle = INK; c.fillRect(W / 2 - 25, 202, 50, 50); c.fillStyle = PAPER; for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) if ((i * 7 + j * 13 + i * j) % 3) c.fillRect(W / 2 - 22 + i * 3.7, 205 + j * 3.7, 3.2, 3.2);
    c.fillStyle = INK; c.font = F(8); c.textAlign = 'center'; c.fillText(m.link, W / 2, 266); c.fillText(uk ? 'стук по столу = «іду»' : 'knock = “on my way”', W / 2, 282);
  }
  ink_day(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const cur = now.getHours() + now.getMinutes() / 60, y0 = 72, hpx = 16;
    c.fillStyle = INK; c.font = F(10, 'bold'); c.textAlign = 'left'; c.fillText(uk ? 'ДЕНЬ' : 'DAY', 8, y0 - 10);
    for (let hh = 8; hh <= 20; hh++) { const y = y0 + (hh - 8) * hpx; c.fillStyle = INK; c.fillRect(28, y, W - 36, 0.7); c.font = F(7); c.textAlign = 'right'; c.fillText(pad(hh), 24, y + 3); }
    for (const [a, b, name] of cal.day) { const y = y0 + (a - 8) * hpx, h = Math.max((b - a) * hpx, 12), past = b < cur; c.fillStyle = INK; if (past) { c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(30.5, y + 0.5, W - 40, h - 1); } else c.fillRect(30, y, W - 39, h); c.fillStyle = past ? INK : PAPER; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(name, 34, y + h / 2 + 3); }
    if (cur >= 8 && cur <= 20) { const y = y0 + (cur - 8) * hpx; c.fillStyle = INK; c.beginPath(); c.moveTo(20, y - 3); c.lineTo(26, y); c.lineTo(20, y + 3); c.fill(); }
  }
  ink_dev(c, now, t, W, H, uk) {
    this.inkHead(c, now, W);
    c.fillStyle = INK; c.font = F(10, 'bold'); c.textAlign = 'left'; c.fillText('CLAUDE CODE', 8, 62);
    c.beginPath(); c.arc(W - 16, 58, 5, 0, Math.PI * 2); if (claude.state === 'working') c.fill(); else c.stroke();
    c.font = F(10); c.fillText(STATE_TEXT[claude.state][uk ? 'uk' : 'en'], 8, 78);
    c.font = F(8); c.fillText(uk ? 'ліміт 5 год' : '5h limit', 8, 96); c.strokeRect(8.5, 100.5, W - 17, 9); c.fillRect(10, 102, (W - 20) * claude.used5h, 6); c.textAlign = 'right'; c.fillText(`${Math.round(claude.used5h * 100)}%`, W - 8, 96);
    c.textAlign = 'left'; c.fillText(uk ? 'ліміт тижня' : 'weekly', 8, 122); c.strokeRect(8.5, 126.5, W - 17, 9); c.fillRect(10, 128, (W - 20) * claude.usedWeek, 6); c.textAlign = 'right'; c.fillText(`${Math.round(claude.usedWeek * 100)}%`, W - 8, 122);
    c.textAlign = 'left'; c.font = F(9, 'bold'); c.fillText(uk ? 'PR' : 'PRs', 8, 152);
    claude.prs.forEach(([name, st, ci], i) => { const y = 166 + i * 22; c.font = F(8, 'bold'); c.fillText(name.slice(0, 20), 8, y); c.font = F(7); c.fillText(st, 8, y + 9); c.textAlign = 'right'; c.font = F(9, 'bold'); c.fillText(ci === 'ok' ? 'CI ✓' : 'CI ✗', W - 8, y + 4); c.textAlign = 'left'; });
    c.font = F(8); c.fillText(`${claude.commits} ${uk ? 'комітів сьогодні' : 'commits today'}`, 8, 240); c.fillText(claude.session.slice(0, 26), 8, 251);
    const wk = [3, 8, 5, 11, 7, 2, claude.commits]; wk.forEach((v, i) => { c.fillRect(10 + i * 19, 284 - v * 3, 13, v * 3); });
  }
  ink_forecast(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const loc = uk ? 'uk-UA' : 'en-GB';
    weather.daily.slice(0, 7).forEach((d, i) => {
      const y = 56 + i * 32; c.fillStyle = INK; c.font = F(9, 'bold'); c.textAlign = 'left'; c.fillText(d.date.toLocaleDateString(loc, { weekday: 'short' }).toUpperCase(), 8, y + 12);
      c.font = F(7); c.fillText(d.date.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), 8, y + 22);
      inkWx(c, d.code, 62, y + 14);
      c.font = F(12, 'bold'); c.textAlign = 'right'; c.fillText(`${d.max}°`, 104, y + 13); c.font = F(8); c.fillText(`${d.min}°`, 104, y + 24);
      c.font = F(8); c.fillText(`${d.pop}%`, 130, y + 13); c.fillText(`${d.wind}`, 144, y + 24);
      c.fillRect(8, y + 28, W - 16, 0.6);
    });
    c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'дощ % · вітер km/h · open-meteo' : 'rain % · wind km/h · open-meteo', 8, 290);
  }
  ink_fact(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const loc = uk ? 'uk-UA' : 'en-GB', list = fact.byLang?.[uk ? 'uk' : 'en'] ?? [{ year: fact.year, t: fact.text[uk ? 'uk' : 'en'] }], f = list[this.factIdx % list.length];
    c.fillStyle = INK; c.font = F(9); c.textAlign = 'left'; c.fillText((uk ? 'цього дня · ' : 'on this day · ') + now.toLocaleDateString(loc, { day: 'numeric', month: 'long' }), 8, 62);
    c.font = F(40, 'bold'); c.fillText(String(f.year), 8, 104);
    c.font = F(10); wrap(c, f.t.replace(/^\d+ — /, ''), 8, 126, W - 16, 13, 11);
    c.font = F(7); c.fillText('wikipedia · on this day', 8, 290);
  }
  ink_launch(c, now, t, W, H, uk) {
    const L = this.launch || { t0: performance.now() }, T = (performance.now() - L.t0) / 1000 - 10;
    c.fillStyle = INK; c.fillRect(0, 0, W, 26); c.fillStyle = PAPER; c.font = F(11, 'bold'); c.textAlign = 'left'; c.fillText('● LIVE · Falcon 9', 8, 17);
    c.fillStyle = INK; c.font = F(34, 'bold'); c.textAlign = 'center'; c.fillText(`T${T < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(T)))}`, W / 2, 100);
    c.font = F(12, 'bold'); c.fillText(T < -3 ? (uk ? 'ВІДЛІК' : 'COUNTDOWN') : T < 0 ? (uk ? 'ЗАПАЛЕННЯ' : 'IGNITION') : T < 9 ? (uk ? 'ПОЛІТ' : 'ASCENT') : (uk ? 'ОРБІТА ✓' : 'ORBIT ✓'), W / 2, 124);
    c.fillRect(W / 2 - 4, 150, 8, 60); c.beginPath(); c.moveTo(W / 2 - 4, 150); c.lineTo(W / 2, 138); c.lineTo(W / 2 + 4, 150); c.fill();
    c.font = F(8); c.fillText('Starlink 12-5 · LL2', W / 2, 240); c.fillText(uk ? 'e-ink: оновлення раз на секунду' : 'e-ink: one refresh per second', W / 2, 256);
  }
  ink_moon(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const ph = moonPhase(now);
    drawMoon(c, W / 2, 110, 46, ph, PAPER, INK); c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.arc(W / 2, 110, 46, 0, Math.PI * 2); c.stroke();
    const names = uk ? ['новий', 'молодий', 'перша чверть', 'зростає', 'повний', 'спадає', 'остання чверть', 'старий'] : ['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'last quarter', 'waning crescent'];
    c.fillStyle = INK; c.font = F(12, 'bold'); c.textAlign = 'center'; c.fillText(names[Math.round(ph * 8) % 8], W / 2, 176);
    c.font = F(9); c.fillText(`${Math.round(ph * 100)}% · ${uk ? 'повний через' : 'full in'} ${Math.round(((0.5 - ph + 1) % 1) * 29.53)} ${uk ? 'дн' : 'd'}`, W / 2, 192);
    const rows = uk ? [['МКС', '21:14 → 21:20 · 62°'], ['видимі', 'Юпітер, Сатурн'], ['Kp', '3 · сяйва не буде']] : [['ISS', '21:14 → 21:20 · 62°'], ['visible', 'Jupiter, Saturn'], ['Kp', '3 · no aurora']];
    rows.forEach(([k, v], i) => { const y = 214 + i * 20; c.textAlign = 'left'; c.font = F(8); c.fillText(k, 8, y); c.textAlign = 'right'; c.font = F(9, 'bold'); c.fillText(v, W - 8, y); });
  }
  ink_night(c, now, t, W, H, uk) {
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H); c.fillStyle = INK; drawMoon(c, W / 2, 90, 30, moonPhase(now), PAPER, INK); c.beginPath(); c.arc(W / 2, 90, 30, 0, Math.PI * 2); c.stroke();
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 20, 150, 24, 40, INK, null);
    c.font = F(9); c.textAlign = 'center'; c.fillText(uk ? 'ніч · без оновлень' : 'night · no refresh', W / 2, 220); c.fillText(uk ? 'картинка тримається' : 'the image holds', W / 2, 234); c.fillText(uk ? 'без живлення' : 'without power', W / 2, 248);
  }
  ink_note(c, now, t, W, H, uk) {
    this.inkHead(c, now, W);
    c.fillStyle = INK; c.font = F(9); c.textAlign = 'left'; c.fillText(uk ? 'ЗАПИСКА' : 'NOTE', 8, 62);
    c.strokeStyle = INK; c.lineWidth = 1; for (let y = 90; y < 250; y += 22) { c.beginPath(); c.moveTo(10, y); c.lineTo(W - 10, y); c.stroke(); }
    c.font = 'italic 15px Georgia, serif';
    const lines = uk ? ['Пішов на каву,', 'буду о 14:10.', '', 'Якщо CI впаде —', 'не чіпай, я гляну.', '', '— A.'] : ['Out for coffee,', 'back at 14:10.', '', 'If CI fails —', 'leave it, I’ll check.', '', '— A.'];
    lines.forEach((l, i) => c.fillText(l, 14, 84 + i * 22));
    c.font = F(8); c.fillText(uk ? 'з телефону · без живлення' : 'from the phone · no power needed', 8, 290);
  }
  ink_mooncal(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const loc = uk ? 'uk-UA' : 'en-GB';
    c.fillStyle = INK; c.font = F(10, 'bold'); c.textAlign = 'center'; c.fillText(now.toLocaleDateString(loc, { month: 'long', year: 'numeric' }).toUpperCase(), W / 2, 62);
    const first = new Date(now.getFullYear(), now.getMonth(), 1), days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
    const cw = (W - 16) / 7; c.font = F(7); (uk ? 'ПВСЧПСН' : 'MTWTFSS').split('').forEach((d, i) => c.fillText(d, 8 + cw * (i + 0.5), 76));
    for (let d = 1; d <= days; d++) {
      const i = off + d - 1, x = 8 + cw * (i % 7 + 0.5), y = 92 + Math.floor(i / 7) * 32;
      const ph = moonPhase(new Date(now.getFullYear(), now.getMonth(), d, 12));
      drawMoon(c, x, y + 4, 7, ph, PAPER, INK); c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.arc(x, y + 4, 7, 0, Math.PI * 2); c.stroke();
      c.fillStyle = INK; c.font = F(6, d === now.getDate() ? 'bold' : ''); c.fillText(String(d), x, y + 18);
      if (d === now.getDate()) { c.strokeRect(x - cw / 2 + 1, y - 6, cw - 2, 27); }
    }
    c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'оновлення раз на добу' : 'refreshed once a day', 8, 290);
  }
}
