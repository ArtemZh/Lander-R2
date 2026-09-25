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
const tzTime = (tz, d) => d.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const CITIES = [['ЛЬВІВ', 'Europe/Kyiv', 'LVIV'], ['ВАРШАВА', 'Europe/Warsaw', 'WARSAW'], ['ГДИНЯ', 'Europe/Warsaw', 'GDYNIA']];
const F = (px, b = '') => `${b} ${px}px "Share Tech Mono", monospace`;
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);

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
  try {
    const r = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`);
    const j = await r.json(); const e = j.selected?.[0];
    if (e) { fact.text = { uk: `${e.year} — ${e.text}`, en: `${e.year} — ${e.text}` }; fact.year = e.year; fact.live = true; }
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
// Календар (демо): мітинг через N хв від "зараз"
export const cal = { next: { title: 'Sync: Lander R2 widgets', inMin: 42, dur: 30, who: ['AZ', 'MB', 'CC'], link: 'meet.google.com/xyz' },
  day: [[9, 9.5, 'Standup'], [11, 12, 'Design review'], [13.5, 14, 'Lunch walk'], [15, 15.5, 'Sync: Lander R2'], [17, 18, 'Focus block']] };
export const tasks = { list: [['Каталог екранів v2', 'Screen catalog v2', false], ['Спікер: гільза-резонатор', 'Speaker: brass resonator', false], ['README: архітектура', 'README: architecture', true]] };
export const music = { title: 'Weightless', artist: 'Marconi Union', pos: 143, len: 480, playing: true };
export const focus = { running: false, total: 25 * 60, left: 25 * 60, sessions: 3, breakMode: false };
export const words = [['серендипність', 'serendipity', 'щасливий випадок під час пошуку іншого'], ['flâneur', 'фланер', 'той, хто неквапно гуляє містом, спостерігаючи']];

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
  ['mission', { uk: 'Місія', en: 'Mission' }, { uk: 'Головний екран: час, дата, друге місто, схід/захід, фаза місяця, батарея і стан Claude. Все інше — навколо нього.', en: 'Home screen: time, date, second city, sunrise/sunset, moon phase, battery and Claude state. Everything else orbits it.' }, 'ti'],
  ['meeting', { uk: 'Наступний мітинг', en: 'Next meeting' }, { uk: 'Велике число хвилин до зустрічі, назва, тривалість, хто буде. За 5 хв LED синій блимає, за 1 хв — швидше; стук по столу = «іду».', en: 'Big minutes-to-meeting number, title, duration, attendees. LED blinks blue 5 min before, faster at 1 min; knock the desk = “on my way”.' }, 'ti'],
  ['day', { uk: 'День', en: 'Day' }, { uk: 'Стрічка 8:00–20:00 з блоками зустрічей, курсор «зараз», вільні вікна підсвічені. Ідеально для e-ink — змінюється рідко.', en: 'Timeline 8:00–20:00 with meeting blocks, a “now” cursor, free slots highlighted. Perfect for e-ink — changes rarely.' }, 'ti'],
  ['dev', { uk: 'Dev / Claude Code', en: 'Dev / Claude Code' }, { uk: 'Стан агента, ліміти 5 год і тижня, поточна сесія, останні PR зі статусом CI, коміти за день.', en: 'Agent state, 5-hour and weekly limits, current session, recent PRs with CI status, commits today.' }, 'ti'],
  ['room', { uk: 'Кімната', en: 'Room' }, { uk: 'BME280: температура, вологість, тиск; VEML7700: освітленість; індекс комфорту і графік за 24 год.', en: 'BME280: temperature, humidity, pressure; VEML7700: light; comfort index and 24 h chart.' }, 't'],
  ['forecast', { uk: 'Прогноз 7 днів', en: '7-day forecast' }, { uk: 'Іконка, max/min, ймовірність опадів, вітер на кожен день + барометричний тренд на сьогодні (Open-Meteo, наживо).', en: 'Icon, max/min, precipitation chance, wind per day + today’s barometric trend (Open-Meteo, live).' }, 'ti'],
  ['air', { uk: 'Повітря', en: 'Air' }, { uk: 'AQI, PM2.5/PM10, UV і головне питання: чи відкривати вікно — порівняння вулиці з кімнатою.', en: 'AQI, PM2.5/PM10, UV and the key question: open the window? — outdoors vs. indoors.' }, 't'],
  ['focus', { uk: 'Фокус', en: 'Focus' }, { uk: 'Pomodoro 25/5 з кільцем прогресу й лічильником сесій. Поки триває — LED синій «не турбувати».', en: 'Pomodoro 25/5 with a progress ring and session counter. While running the LED is blue “do not disturb”.' }, 't'],
  ['tasks', { uk: 'Задачі', en: 'Tasks' }, { uk: 'Топ-3 на сьогодні, чекбокс тапом. Виконана — зелений спалах; усі три — «день зроблено».', en: 'Top 3 for today, tap to check. Done — green flash; all three — “day done”.' }, 't'],
  ['fact', { uk: 'Факт дня', en: 'Fact of the day' }, { uk: 'Wikipedia «On this day» — що сталося цього дня. Без ключів, оновлюється раз на добу.', en: 'Wikipedia “On this day” — what happened today in history. No keys, refreshed daily.' }, 'ti'],
  ['word', { uk: 'Слово дня', en: 'Word of the day' }, { uk: 'Слово, переклад, приклад. Тап — озвучити через спікер.', en: 'A word, its translation, an example. Tap to hear it on the speaker.' }, 't'],
  ['rates', { uk: 'Курси', en: 'Rates' }, { uk: 'Три обрані пари з денною зміною і спарклайном за 7 днів.', en: 'Three chosen pairs with daily change and a 7-day sparkline.' }, 't'],
  ['music', { uk: 'Музика', en: 'Music' }, { uk: 'Що грає зараз, прогрес, тап — пауза. AMOLED: чорний фон = вимкнені пікселі.', en: 'Now playing, progress, tap to pause. AMOLED: black background = pixels off.' }, 't'],
  ['moon', { uk: 'Місяць і небо', en: 'Moon & sky' }, { uk: 'Велика фаза місяця, наступний повний, видимі планети, проліт МКС над Києвом.', en: 'Big moon phase, next full moon, visible planets, ISS pass over Kyiv.' }, 'ti'],
  ['landing', { uk: 'Посадка', en: 'Landing' }, { uk: 'Штучний горизонт з IMU, кут нахилу, «висота» з тиску, вібрація. На десктопі нахил — курсор над екраном.', en: 'IMU artificial horizon, tilt angle, pressure “altitude”, vibration. On desktop tilt = cursor over the screen.' }, 't'],
  ['tank', { uk: 'Паливний бак', en: 'Fuel tank' }, { uk: 'Симулятор рідини: рівень = заряд батареї, гравітація від IMU, струс → сплеск, тап → крапля. Пружинна поверхня, ~60 вузлів.', en: 'Liquid simulator: level = battery, gravity from the IMU, shake → splash, tap → drop. Spring-mesh surface, ~60 nodes.' }, 't'],
  ['face', { uk: 'Обличчя', en: 'Face' }, { uk: 'Коли нічого не відбувається — очі дивляться в бік звуку чи нахилу, блимають. Хлопок — підморгує.', en: 'When idle — eyes follow sound or tilt, blink. Clap — it winks.' }, 't'],
  ['night', { uk: 'Нічний', en: 'Night' }, { uk: 'Темно > 2 хв — тьмяний час, LED вимкнений. E-ink просто лишає останню картинку.', en: 'Dark > 2 min — dim clock, LED off. E-ink just keeps the last image.' }, 'ti'],
  ['note', { uk: 'Записка', en: 'Note' }, { uk: 'Тільки e-ink: повідомлення, що лишається на екрані навіть без живлення — «пішов на каву, буду о 14:10».', en: 'E-ink only: a message that stays on screen even without power — “out for coffee, back at 14:10”.' }, 'i'],
  ['mooncal', { uk: 'Місячний календар', en: 'Moon calendar' }, { uk: 'Тільки e-ink: сітка місяця з фазою на кожен день, змінюється раз на добу — те, для чого e-ink і створений.', en: 'E-ink only: a month grid with the phase for each day, changes once a day — what e-ink was made for.' }, 'i'],
];
// ---------- сценарії: id, назва, опис, дисплеї, тривалість мс, start(scr) ----------
export const SCENARIOS = [
  ['claude-working', { uk: 'Claude працює', en: 'Claude working' }, { uk: 'Агент виконує задачу: LED зелений «дихає», на Dev-екрані біжить таймер сесії.', en: 'Agent is working: LED breathes green, session timer runs on the Dev screen.' }, 'ti', 6000, s => { claude.state = 'working'; ledFromClaude(); s.show('dev'); }],
  ['claude-question', { uk: 'Claude поставив питання', en: 'Claude asks a question' }, { uk: 'LED червоний блимає 2 Гц + короткий «пінг»; Dev-екран виходить наперед. На e-ink — часткове оновлення рядка стану.', en: 'LED blinks red at 2 Hz + short ping; Dev screen comes forward. On e-ink — partial refresh of the status line.' }, 'ti', 6000, s => { claude.state = 'question'; ledFromClaude(); s.show('dev'); s.toast({ uk: 'Claude: «Пушити зараз чи після рев’ю?»', en: 'Claude: “Push now or after review?”' }, RED); }],
  ['claude-idle', { uk: 'Claude простоює', en: 'Claude idle' }, { uk: 'Понад 10 хв без задач: LED помаранчевий, екран повертається на «Місію».', en: 'Idle > 10 min: LED orange, screen returns to Mission.' }, 'ti', 5000, s => { claude.state = 'idle'; ledFromClaude(); s.show('mission'); }],
  ['limit-90', { uk: 'Ліміт 5 год > 90 %', en: '5h limit > 90 %' }, { uk: 'Смуга ліміту червоніє, LED жовтий подвійний блим кожні 30 с.', en: 'Limit bar turns red, LED gives a yellow double blink every 30 s.' }, 'ti', 6000, s => { claude.used5h = 0.93; led.set('#facc15', 'double', 0.5); s.show('dev'); }],
  ['pr-merged', { uk: 'PR змержено / CI ок', en: 'PR merged / CI green' }, { uk: '2 с зелена «конфеті»-анімація і мелодія.', en: '2 s of green confetti and a chime.' }, 't', 4000, s => { claude.prs[0][1] = 'merged'; led.set(GREEN, 'strobe', 4, 2000); s.show('dev'); s.confetti(GREEN); }],
  ['ci-failed', { uk: 'CI впав', en: 'CI failed' }, { uk: 'Червона смуга зверху екрана, поки не глянеш — тап знімає.', en: 'Red bar at the top until you look — tap clears it.' }, 'ti', 6000, s => { claude.prs[0][2] = 'fail'; led.set(RED, 'solid'); s.show('dev'); s.banner({ uk: 'CI ✗ lander-r2 · build #128', en: 'CI ✗ lander-r2 · build #128' }, RED); }],
  ['meeting-5', { uk: 'Мітинг за 5 хв', en: 'Meeting in 5 min' }, { uk: 'LED синій 1 Гц, екран «Наступний мітинг» наперед; за 1 хв — 3 Гц; на початку — тон і QR.', en: 'LED blue at 1 Hz, Next meeting screen comes forward; 3 Hz at 1 min; chime and QR at start.' }, 'ti', 8000, s => { cal.next.inMin = 5; led.set(BLUE, 'blink', 1); s.show('meeting'); s.timeline([[4000, () => { cal.next.inMin = 1; led.set(BLUE, 'blink', 3); }], [7000, () => { cal.next.inMin = 0; led.set(BLUE, 'solid'); s.toast({ uk: '🔔 Sync: Lander R2 — почалось', en: '🔔 Sync: Lander R2 — starting' }, BLUE); }]]); }],
  ['on-air', { uk: 'Мітинг триває', en: 'Meeting in progress' }, { uk: 'LED рівний синій «on air», мікрофон чує голос → на екрані «в ефірі», Dev-екран ховається.', en: 'Steady blue “on air” LED, mic hears voice → “on air” on screen, Dev screen hidden.' }, 't', 6000, s => { cal.next.inMin = -12; led.set(BLUE, 'solid'); s.show('meeting'); }],
  ['knock', { uk: 'Стук по столу', en: 'Knock on the desk' }, { uk: 'IMU ловить удар → наступний екран. Подвійний стук — назад на «Місію».', en: 'IMU detects a tap → next screen. Double knock — back to Mission.' }, 't', 3000, s => { s.flash(ORANGE); sensors.mic = 0.9; setTimeout(() => s.next(), 300); }],
  ['morning', { uk: 'Ранок', en: 'Morning' }, { uk: 'Світло + перший рух: «Доброго ранку» — погода, перший мітинг, факт дня, слово дня.', en: 'Light + first motion: “Good morning” — weather, first meeting, fact and word of the day.' }, 'ti', 9000, s => { led.set('#ffd34d', 'breathe', 0.4); s.show('morning'); s.timeline([[3500, () => s.show('forecast')], [6000, () => s.show('fact')]]); }],
  ['free-slot', { uk: 'Вільне вікно ≥ 45 хв', en: 'Free slot ≥ 45 min' }, { uk: 'Пропозиція «фокус-сесія?» → тап запускає Pomodoro, LED синій.', en: 'Suggests “focus session?” → tap starts Pomodoro, LED blue.' }, 't', 7000, s => { s.show('focus'); s.toast({ uk: 'Вільно до 15:00 — фокус-сесія?', en: 'Free until 15:00 — focus session?' }, BLUE); s.timeline([[2500, () => { focus.running = true; focus.left = 25 * 60; led.set(BLUE, 'solid'); }]]); }],
  ['focus-done', { uk: 'Pomodoro закінчився', en: 'Pomodoro finished' }, { uk: 'Спікер, LED синій → зелений, 5 хв перерви з великим таймером.', en: 'Chime, LED blue → green, 5-minute break with a big timer.' }, 't', 6000, s => { focus.running = true; focus.left = 3; s.show('focus'); s.timeline([[1200, () => { focus.left = 0; focus.breakMode = true; focus.sessions++; focus.left = 300; led.set(GREEN, 'solid'); s.confetti(GREEN); }]]); }],
  ['task-done', { uk: 'Задачу виконано', en: 'Task done' }, { uk: 'Тап по чекбоксу: конфеті й тон. Усі три — «день зроблено».', en: 'Tap the checkbox: confetti and a tone. All three — “day done”.' }, 't', 6000, s => { s.show('tasks'); s.timeline([[1500, () => { tasks.list[0][2] = true; s.confetti(GREEN); }], [3500, () => { tasks.list[1][2] = true; s.confetti(GREEN); led.set(GREEN, 'strobe', 3, 2000); }]]); }],
  ['night', { uk: 'Темно 2 хв', en: 'Dark for 2 min' }, { uk: 'VEML7700 бачить темряву → нічний екран, яскравість мінімальна, LED вимкнений. Світло ввімкнули → boot «доброго ранку».', en: 'VEML7700 sees darkness → night screen, minimum brightness, LED off. Lights on → “good morning” boot.' }, 'ti', 7000, s => { sensors.lux = 2; led.set('#000', 'off'); s.show('night'); s.timeline([[5000, () => { sensors.lux = 300; s.show('morning'); led.set('#ffd34d', 'breathe', 0.5); }]]); }],
  ['tilt', { uk: 'Нахил > 20°', en: 'Tilt > 20°' }, { uk: 'IMU: показати «Посадку» з горизонтом; > 30° — «вирівняй посадку», рідина в баку переливається.', en: 'IMU: show Landing with the horizon; > 30° — “level the lander”, tank liquid spills.' }, 't', 7000, s => { s.show('landing'); s.animTilt(28, 6); s.timeline([[3500, () => s.show('tank')]]); }],
  ['shake', { uk: 'Струс', en: 'Shake' }, { uk: 'Червона тривога «перевір ноги», LED червоний 3 с, у баку — сплеск і бризки.', en: 'Red alert “check the legs”, LED red 3 s, splash and spray in the tank.' }, 't', 5000, s => { s.show('tank'); s.shake(); led.set(RED, 'strobe', 5, 3000); s.banner({ uk: '⚠ СТРУС · ПЕРЕВІР НОГИ', en: '⚠ SHAKE · CHECK LEGS' }, RED); }],
  ['face-down', { uk: 'Догори дном', en: 'Face down' }, { uk: 'IMU: пристрій перевернули → сон, екран чорний, тьмяний годинник.', en: 'IMU: device flipped → sleep, black screen, dim clock.' }, 't', 5000, s => { led.set('#000', 'off'); s.show('sleep'); }],
  ['charging', { uk: 'Підключили зарядку', en: 'Charger connected' }, { uk: 'У баку — бульбашки, рівень росте, рідина синя; батарея в шапці «заряджається».', en: 'Bubbles in the tank, level rises, liquid turns blue; header battery shows charging.' }, 't', 7000, s => { sensors.charging = true; s.show('tank'); led.set(BLUE, 'breathe', 0.5); }],
  ['battery-low', { uk: 'Батарея < 15 %', en: 'Battery < 15 %' }, { uk: 'Іконка червона, LED вимикається для економії; e-ink переходить на оновлення раз на 30 хв.', en: 'Red icon, LED turns off to save power; e-ink switches to 30-min refresh.' }, 'ti', 5000, s => { sensors.battery = 0.12; led.set('#000', 'off'); s.show('mission'); s.toast({ uk: 'Батарея 12 % — LED вимкнено', en: 'Battery 12 % — LED off' }, RED); }],
  ['wifi-lost', { uk: 'Wi-Fi зник', en: 'Wi-Fi lost' }, { uk: '«offline · 5 хв тому» на всіх екранах, дані з кешу; час і погода — напряму.', en: '“offline · 5 min ago” on every screen, cached data; time and weather fetched directly.' }, 'ti', 5000, s => { sensors.wifi = false; s.show('mission'); led.set(ORANGE, 'solid'); }],
  ['guest', { uk: 'Гість поруч', en: 'Guest nearby' }, { uk: 'Мікрофон чує чужий голос > 30 с → показати «Місію» з великим часом, сховати Dev (приватність).', en: 'Mic hears another voice > 30 s → show Mission with a big clock, hide Dev (privacy).' }, 't', 5000, s => { s.show('dev'); s.timeline([[1500, () => { sensors.mic = 0.8; s.show('mission'); s.toast({ uk: 'Гість · Dev-екран приховано', en: 'Guest · Dev screen hidden' }, ORANGE); }]]); }],
  ['clap', { uk: 'Хлопок', en: 'Clap' }, { uk: 'Мікрофон: хлопок → обличчя підморгує; у баку — сплеск.', en: 'Mic: clap → the face winks; splash in the tank.' }, 't', 4000, s => { s.show('face'); s.wink(); sensors.mic = 1; }],
  ['rocket', { uk: 'Запуск ракети за 10 хв', en: 'Rocket launch in 10 min' }, { uk: 'Екран «Місяць і небо» з відліком у стилі «місія», LED помаранчевий; T-0 → «старт».', en: 'Moon & sky screen with a mission-style countdown, LED orange; T-0 → “liftoff”.' }, 'ti', 8000, s => { s.launchT = performance.now() + 6000; s.show('moon'); led.set(ORANGE, 'breathe', 1); s.timeline([[6000, () => { led.set('#ffd34d', 'strobe', 6, 2000); s.confetti('#ffd34d'); s.toast({ uk: 'T-0 · СТАРТ', en: 'T-0 · LIFTOFF' }, ORANGE); }]]); }],
  ['eod', { uk: 'Кінець робочого дня', en: 'End of workday' }, { uk: 'Останній мітинг минув + 18:00 → підсумок: мітингів, комітів, PR, фокус-сесій; LED теплий.', en: 'Last meeting passed + 18:00 → summary: meetings, commits, PRs, focus sessions; warm LED.' }, 'ti', 7000, s => { led.set('#ffb86b', 'breathe', 0.3); s.show('eod'); }],
  ['ink-partial', { uk: 'Часткове оновлення', en: 'Partial refresh' }, { uk: 'Тільки e-ink: змінилась хвилина → блимає лише зона годинника, решта картинки не торкається.', en: 'E-ink only: minute changed → only the clock area flickers, the rest untouched.' }, 'i', 4000, s => { s.show('mission'); s.inkPartial = performance.now(); }],
  ['ink-full', { uk: 'Повне оновлення', en: 'Full refresh' }, { uk: 'Тільки e-ink: 3 інверсії по 130 мс, щоб прибрати «привиди», потім новий кадр.', en: 'E-ink only: 3 inversions of 130 ms to clear ghosting, then a fresh frame.' }, 'i', 3000, s => { s.fullRefresh(); }],
  ['power-off', { uk: 'Вимкнули живлення', en: 'Power off' }, { uk: 'Тільки e-ink: картинка лишається — записка на екрані читається без батареї.', en: 'E-ink only: the image stays — the note is readable without a battery.' }, 'i', 6000, s => { s.show('note'); led.set('#000', 'off'); s.timeline([[2500, () => { s.powerOff = true; }]]); }],
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
    this.scenario = null; this.timers = [];
    this.onDraw = null; this.onScreen = null;
    this.tank = this.makeTank();
    this.setupPointer();
    ledFromClaude();
    const loop = () => { this.frame(); requestAnimationFrame(loop); };
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
    this.stopScenario(); this.snapshot();
    this.scenario = { id, t0: performance.now(), dur: sc[4] };
    sc[5](this);
    this.timers.push(setTimeout(() => this.stopScenario(true), sc[4]));
  }
  timeline(steps) { for (const [ms, fn] of steps) this.timers.push(setTimeout(fn, ms)); }
  snapshot() { this.snap = { claude: JSON.parse(JSON.stringify(claude)), cal: JSON.parse(JSON.stringify(cal)), tasks: JSON.parse(JSON.stringify(tasks)), focus: { ...focus }, sensors: { ...sensors }, screen: this.screen }; }
  stopScenario(restore = false) {
    this.timers.forEach(clearTimeout); this.timers = [];
    if (restore && this.snap) {
      Object.assign(claude, this.snap.claude); Object.assign(cal, this.snap.cal); tasks.list = this.snap.tasks.list; Object.assign(focus, this.snap.focus);
      Object.assign(sensors, { battery: this.snap.sensors.battery, charging: false, wifi: true, lux: 300 });
      this.powerOff = false; this.bannerT = null; ledFromClaude(); this.show(this.snap.screen);
    }
    this.scenario = null; this.inkImage = null;
  }
  toast(text, color) { this.toasts.push({ text, color, t: performance.now() }); this.inkImage = null; }
  banner(text, color) { this.bannerT = { text, color }; this.inkImage = null; }
  flash(color) { this.flashT = performance.now(); this.flashC = color; }
  confetti(color) { for (let i = 0; i < 60; i++) this.parts.push({ x: rnd(0, 170), y: rnd(-40, 0), vx: rnd(-20, 20), vy: rnd(20, 80), c: i % 3 ? color : '#fff', t: performance.now(), life: rnd(1200, 2200) }); }
  wink() { this.winkT = performance.now(); }
  shake() { this.shakeT = performance.now(); const tk = this.tank; for (let i = 0; i < tk.n; i++) tk.v[i] += Math.sin(i * 0.6) * 30 + rnd(-10, 10); for (let i = 0; i < 25; i++) tk.drops.push({ x: rnd(20, 150), y: tk.level(), vx: rnd(-40, 40), vy: rnd(-90, -30), t: performance.now() }); }
  animTilt(roll, pitch) { sensors.tRoll = roll; sensors.tPitch = pitch; this.timers.push(setTimeout(() => { sensors.tRoll = 0; sensors.tPitch = 0; }, 6000)); }
  fullRefresh() { this.inkFlash = performance.now(); }
  // ---------- вказівник ----------
  setupPointer() {
    const c = this.canvas;
    const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width / this.S, (e.clientY - r.top) * c.height / r.height / this.S]; };
    c.addEventListener('pointermove', e => { if (this.version === 'touch' && !sensors.real && !this.scenario) { const [x, y] = pos(e); sensors.tRoll = (x / 170 - 0.5) * 50; sensors.tPitch = (y / 380 - 0.5) * 30; } });
    c.addEventListener('pointerleave', () => { if (!sensors.real && !this.scenario) { sensors.tRoll = 0; sensors.tPitch = 0; } });
    c.addEventListener('pointerdown', e => { if (this.version !== 'touch') return; this.tap(pos(e)); });
  }
  tap([x, y]) {
    this.ripples.push({ x, y, t: performance.now() });
    const s = this.screen;
    if (this.bannerT) { this.bannerT = null; return; }
    if (s === 'tasks') { const i = Math.floor((y - 40) / 52); if (i >= 0 && i < 3) { tasks.list[i][2] = !tasks.list[i][2]; if (tasks.list[i][2]) this.confetti(GREEN); } }
    else if (s === 'focus') { if (!focus.running) { focus.running = true; focus.left = focus.total; led.set(BLUE, 'solid'); } else { focus.running = false; ledFromClaude(); } }
    else if (s === 'music') music.playing = !music.playing;
    else if (s === 'tank') { const tk = this.tank; const i = Math.round(x / 170 * (tk.n - 1)); tk.v[i] -= 120; tk.drops.push({ x, y: y - 40, vx: 0, vy: 60, t: performance.now(), drop: true }); }
    else if (s === 'mission') { if (y > 190 && y < 225) this.settings.city = (this.settings.city + 1) % CITIES.length; }
    else if (s === 'face') this.wink();
    else if (s === 'meeting') { if (cal.next.inMin <= 5 && cal.next.inMin > 0) { led.set(GREEN, 'solid', 1, 1500); this.toast({ uk: '✓ іду', en: '✓ on my way' }, GREEN); } }
  }
  // ---------- симуляція ----------
  tick(now, t) {
    const dt = 1 / 60;
    if (!this.scenario) { claude.resetMin = 134 - Math.floor(t / 60) % 134; claude.sessionMin = 47 + Math.floor(t / 60); }
    sensors.roll = lerp(sensors.roll, sensors.tRoll, 0.08); sensors.pitch = lerp(sensors.pitch, sensors.tPitch, 0.08);
    sensors.mic = lerp(sensors.mic, 0.08 + Math.random() * 0.2, 0.15);
    sensors.temp = weather.temp + 2.3 + Math.sin(t * 0.05) * 0.2; sensors.hum = weather.hum - 8 + Math.sin(t * 0.07);
    sensors.pressure = sensors.pBase + Math.sin(t / 90) * 1.5; sensors.trend = Math.cos(t / 90);
    sensors.alt = Math.round(44330 * (1 - Math.pow(sensors.pressure / 1013.25, 0.1903)));
    if (sensors.charging) sensors.battery = Math.min(1, sensors.battery + dt * 0.03);
    if (focus.running && focus.left > 0) { focus.left -= dt; if (focus.left <= 0) { focus.left = 0; focus.running = false; } }
    if (music.playing) music.pos = (music.pos + dt) % music.len;
    if (led.until && performance.now() > led.until) { led.until = 0; ledFromClaude(); }
    this.stepTank(dt, t);
  }
  frame() {
    const now = new Date(), t = (performance.now() - this.t0) / 1000;
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
    if (this.bannerT) { c.fillStyle = this.bannerT.color; c.fillRect(0, 0, W, 16); c.fillStyle = '#fff'; c.font = F(9, 'bold'); c.textAlign = 'center'; c.fillText(this.bannerT.text[this.lang], W / 2, 11); }
    this.toasts = this.toasts.filter(x => tn - x.t < 3500);
    this.toasts.forEach((x, i) => { const a = Math.min(1, (tn - x.t) / 250, (3500 - (tn - x.t)) / 400); c.globalAlpha = a; c.fillStyle = '#1c2130'; c.fillRect(8, H - 52 - i * 26, W - 16, 22); c.fillStyle = x.color; c.fillRect(8, H - 52 - i * 26, 3, 22); c.fillStyle = '#fff'; c.font = F(8); c.textAlign = 'left'; c.fillText(x.text[this.lang], 16, H - 38 - i * 26); c.globalAlpha = 1; });
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
  claudeWidget(c, x, y, w, t) {
    const uk = this.lang === 'uk', col = STATE_COLORS[claude.state], v = led.value(t);
    tile(c, x, y, w, 50, col);
    c.globalAlpha = 0.4 + 0.6 * v; c.fillStyle = col; c.beginPath(); c.arc(x + 12, y + 11, 3.5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.fillText('CLAUDE CODE', x + 20, y + 9);
    c.fillStyle = col; c.font = F(8); c.fillText(STATE_TEXT[claude.state][uk ? 'uk' : 'en'], x + 20, y + 18);
    const r = `${Math.floor(claude.resetMin / 60)}h${pad(claude.resetMin % 60)}`;
    c.fillStyle = '#aab'; c.font = F(7); c.fillText(uk ? `ліміт 5 год · скид ${r}` : `5h limit · reset ${r}`, x + 8, y + 30); bar(c, x + 8, y + 33, w - 16, 4, claude.used5h, claude.used5h > 0.9 ? RED : col);
    c.fillText(uk ? 'ліміт тижня' : 'weekly limit', x + 8, y + 44); bar(c, x + 8, y + 47, w - 16, 3, claude.usedWeek, '#7aa2f7');
    c.textAlign = 'right'; c.fillText(`${Math.round(claude.used5h * 100)}%`, x + w - 6, y + 30); c.fillText(`${Math.round(claude.usedWeek * 100)}%`, x + w - 6, y + 44);
  }
  // --- екрани ---
  scr_mission(c, now, t, H) {
    const W = 170, uk = this.lang === 'uk', loc = uk ? 'uk-UA' : 'en-GB', hh = now.getHours();
    frame(c, W, H); this.header(c, now, t);
    c.textAlign = 'right'; c.fillStyle = '#aab'; c.font = F(10); c.fillText(now.toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' }), W - 10, 40);
    plate(c, 6, 46, 118, 52, ORANGE, 10);
    sevenSeg(c, `${pad(hh)}:${pad(now.getMinutes())}`, 12, 51, 22, 42, '#111', 'rgba(0,0,0,.13)', now.getMilliseconds() < 500);
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(15, 'bold'); c.fillText(`${weather.temp}°`, 148, 88);
    wxIcon(c, weather.code, 148, 62, 16, t, hh >= 6 && hh < 20);
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(14, 'italic bold'); c.fillText(uk ? 'КИЇВ' : 'KYIV', 10, 122);
    c.fillStyle = '#aab'; c.font = F(8); c.textAlign = 'right'; c.fillText(`${uk ? 'в кімнаті' : 'indoor'} ${sensors.temp.toFixed(1)}°  ·  ${Math.round(sensors.lux)} lx`, W - 10, 122);
    c.strokeStyle = '#2a2f3a'; c.beginPath(); c.moveTo(8, 128); c.lineTo(W - 8, 128); c.stroke();
    horizonIcon(c, 44, 152, true, '#ffd34d', t); horizonIcon(c, 126, 152, false, ORANGE, t + 1);
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = F(11); c.fillText(weather.sunrise, 44, 172); c.fillText(weather.sunset, 126, 172);
    const [cityUk, tz, cityEn] = CITIES[this.settings.city];
    c.textAlign = 'left'; c.fillStyle = ORANGE; c.font = F(12, 'italic bold'); c.fillText(uk ? cityUk : cityEn, 10, 208);
    plate(c, 92, 192, 72, 26, ORANGE, 8); c.textAlign = 'center'; c.fillStyle = '#111'; c.font = F(17, 'bold'); c.fillText(tzTime(tz, now), 128, 211);
    c.strokeStyle = '#2a2f3a'; c.beginPath(); c.moveTo(8, 226); c.lineTo(W - 8, 226); c.stroke();
    // наступний мітинг — компактно
    tile(c, 8, 234, W - 16, 30, BLUE);
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(9, 'bold'); c.fillText(cal.next.title, 16, 247);
    c.fillStyle = '#aab'; c.font = F(8); c.fillText(cal.next.inMin > 0 ? (uk ? `через ${cal.next.inMin} хв · ${cal.next.dur} хв` : `in ${cal.next.inMin} min · ${cal.next.dur} min`) : (uk ? 'триває' : 'in progress'), 16, 259);
    this.claudeWidget(c, 8, 272, W - 16, t);
    // вологість · місяць · вітер
    const gy = 350;
    c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'center';
    c.fillText(`HUM ${weather.hum}%`, 40, gy + 16); c.fillText(`WIND ${weather.wind}`, 130, gy + 16);
    bar(c, 16, gy + 20, 48, 3, weather.hum / 100, ORANGE); bar(c, 106, gy + 20, 48, 3, weather.wind / 60, ORANGE);
    drawMoon(c, 85, gy + 10, 9, moonPhase(now));
  }
  scr_meeting(c, now, t, H) {
    const uk = this.lang === 'uk', m = cal.next, W = 170;
    frame(c, W, H); title(c, uk ? 'НАСТУПНИЙ МІТИНГ' : 'NEXT MEETING');
    if (m.inMin > 0) {
      c.textAlign = 'center'; c.fillStyle = m.inMin <= 5 ? BLUE : '#fff'; c.font = F(64, 'bold'); c.fillText(String(m.inMin), 85, 110);
      c.fillStyle = '#889'; c.font = F(10); c.fillText(uk ? 'хвилин' : 'minutes', 85, 128);
    } else {
      c.textAlign = 'center'; c.fillStyle = BLUE; c.font = F(22, 'bold'); c.fillText(uk ? 'В ЕФІРІ' : 'ON AIR', 85, 100);
      c.fillStyle = '#889'; c.font = F(9); c.fillText(uk ? `${-m.inMin} хв тому · мікрофон: голос` : `${-m.inMin} min ago · mic: voice`, 85, 118);
      c.fillStyle = BLUE; c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4); c.beginPath(); c.arc(85, 60, 6, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    }
    tile(c, 10, 140, W - 20, 70, BLUE);
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(12, 'bold'); wrap(c, m.title, 18, 158, W - 36, 14, 2);
    c.fillStyle = '#aab'; c.font = F(8); c.fillText(`${m.dur} ${uk ? 'хв' : 'min'} · ${m.link}`, 18, 186);
    m.who.forEach((w, i) => { c.fillStyle = ['#7aa2f7', ORANGE, GREEN][i]; c.beginPath(); c.arc(26 + i * 20, 200, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.font = F(6, 'bold'); c.textAlign = 'center'; c.fillText(w, 26 + i * 20, 202); });
    // QR-заглушка
    c.fillStyle = '#fff'; c.fillRect(110, 222, 50, 50); c.fillStyle = '#000';
    for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) if ((i * 7 + j * 13 + i * j) % 3 === 0) c.fillRect(113 + i * 3.7, 225 + j * 3.7, 3.2, 3.2);
    c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; wrap(c, uk ? 'Скануй, щоб приєднатись з телефону. Стук по столу = «іду», LED гасне.' : 'Scan to join from the phone. Knock the desk = “on my way”, LED goes off.', 10, 232, 92, 10);
    this.dayStrip(c, 10, 300, W - 20, 50, now);
  }
  dayStrip(c, x, y, w, h, now) {
    const uk = this.lang === 'uk', h0 = 8, h1 = 20, cur = now.getHours() + now.getMinutes() / 60;
    c.fillStyle = '#151923'; c.fillRect(x, y, w, h);
    for (let hh = h0; hh <= h1; hh += 2) { const xx = x + (hh - h0) / (h1 - h0) * w; c.fillStyle = '#2a2f3a'; c.fillRect(xx, y, 1, h); c.fillStyle = '#667'; c.font = F(6); c.textAlign = 'center'; c.fillText(hh, xx, y + h - 3); }
    for (const [a, b, name] of cal.day) { const xa = x + (a - h0) / (h1 - h0) * w, xb = x + (b - h0) / (h1 - h0) * w; c.fillStyle = b < cur ? '#3a3f4a' : BLUE; c.fillRect(xa, y + 6, Math.max(2, xb - xa - 1), h - 20); }
    const xc = x + Math.min(1, Math.max(0, (cur - h0) / (h1 - h0))) * w; c.fillStyle = ORANGE; c.fillRect(xc - 0.5, y, 1.5, h);
    c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'сьогодні' : 'today', x + 3, y + 5 + 3);
  }
  scr_day(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, cur = now.getHours() + now.getMinutes() / 60;
    frame(c, W, H); title(c, uk ? 'ДЕНЬ' : 'DAY');
    const y0 = 34, hpx = 26;
    for (let hh = 8; hh <= 20; hh++) { const y = y0 + (hh - 8) * hpx; c.fillStyle = '#2a2f3a'; c.fillRect(30, y, W - 40, 1); c.fillStyle = '#667'; c.font = F(7); c.textAlign = 'right'; c.fillText(pad(hh), 26, y + 3); }
    for (const [a, b, name] of cal.day) { const y = y0 + (a - 8) * hpx, h = (b - a) * hpx; const past = b < cur; c.fillStyle = past ? '#20242e' : '#1c2a44'; c.fillRect(32, y + 1, W - 44, h - 2); c.fillStyle = past ? '#556' : BLUE; c.fillRect(32, y + 1, 2, h - 2); c.fillStyle = past ? '#889' : '#fff'; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(name, 38, y + 11); }
    if (cur >= 8 && cur <= 20) { const y = y0 + (cur - 8) * hpx; c.fillStyle = ORANGE; c.fillRect(28, y, W - 36, 1.5); c.beginPath(); c.arc(28, y, 3, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'вільно: 12:00–13:30, 15:30–17:00' : 'free: 12:00–13:30, 15:30–17:00', 10, H - 14);
  }
  scr_dev(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, 'DEV · CLAUDE CODE');
    this.claudeWidget(c, 8, 30, W - 16, t);
    tile(c, 8, 86, W - 16, 30, '#7aa2f7');
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.fillText(claude.session, 16, 98);
    c.fillStyle = '#aab'; c.font = F(7); c.fillText(`${uk ? 'сесія' : 'session'} ${Math.floor(claude.sessionMin / 60)}h ${pad(claude.sessionMin % 60)}m · ${claude.commits} ${uk ? 'комітів сьогодні' : 'commits today'}`, 16, 109);
    c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'останні PR' : 'recent PRs', 10, 132);
    claude.prs.forEach(([name, st, ci], i) => {
      const y = 138 + i * 28; tile(c, 8, y, W - 16, 24, st === 'merged' ? '#a371f7' : ci === 'fail' ? RED : GREEN);
      c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(name, 16, y + 10);
      c.fillStyle = st === 'merged' ? '#a371f7' : '#7aa2f7'; c.font = F(7); c.fillText(st, 16, y + 20);
      c.textAlign = 'right'; c.fillStyle = ci === 'ok' ? GREEN : RED; c.font = F(9, 'bold'); c.fillText(ci === 'ok' ? 'CI ✓' : 'CI ✗', W - 16, y + 16);
    });
    // графік комітів за тиждень
    c.fillStyle = '#889'; c.font = F(8); c.textAlign = 'left'; c.fillText(uk ? 'коміти за тиждень' : 'commits this week', 10, 238);
    const wk = [3, 8, 5, 11, 7, 2, claude.commits];
    wk.forEach((v, i) => { c.fillStyle = i === 6 ? ORANGE : '#3a3f4a'; c.fillRect(12 + i * 22, 300 - v * 4, 16, v * 4); c.fillStyle = '#667'; c.font = F(6); c.textAlign = 'center'; c.fillText('ПВСЧПСН'[i], 20 + i * 22, 310); });
    c.fillStyle = '#556'; c.font = F(7); c.textAlign = 'left'; wrap(c, uk ? 'Джерело: hooks Claude Code → локальний хаб на ноуті → SSE на пристрій, < 1 с.' : 'Source: Claude Code hooks → local hub on the laptop → SSE to the device, < 1 s.', 10, 330, W - 20, 10);
  }
  scr_room(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'КІМНАТА' : 'ROOM');
    const comfort = Math.max(0, 100 - Math.abs(sensors.temp - 22) * 8 - Math.abs(sensors.hum - 45) * 1.2);
    const tiles = [[`${sensors.temp.toFixed(1)}°C`, uk ? 'температура' : 'temperature', ORANGE], [`${Math.round(sensors.hum)}%`, uk ? 'вологість' : 'humidity', '#7aa2f7'], [`${sensors.pressure.toFixed(0)} hPa`, `${uk ? 'тиск' : 'pressure'} ${sensors.trend > 0.2 ? '↑' : sensors.trend < -0.2 ? '↓' : '→'}`, '#a371f7'], [`${Math.round(sensors.lux)} lx`, uk ? 'освітленість' : 'light', '#ffd34d']];
    tiles.forEach(([v, l, col], i) => { const x = 10 + (i % 2) * 78, y = 32 + Math.floor(i / 2) * 50; tile(c, x, y, 72, 44, col); c.fillStyle = '#fff'; c.font = F(15, 'bold'); c.textAlign = 'left'; c.fillText(v, x + 8, y + 20); c.fillStyle = '#889'; c.font = F(7); c.fillText(l, x + 8, y + 35); });
    // комфорт
    c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'індекс комфорту' : 'comfort index', 10, 146);
    bar(c, 10, 150, W - 20, 8, comfort / 100, comfort > 70 ? GREEN : comfort > 40 ? ORANGE : RED);
    c.fillStyle = '#fff'; c.font = F(9, 'bold'); c.textAlign = 'right'; c.fillText(`${Math.round(comfort)}`, W - 10, 146);
    const hint = sensors.hum < 30 ? (uk ? 'сухо — увімкни зволожувач' : 'dry — turn on the humidifier') : sensors.trend < -0.3 ? (uk ? 'тиск падає — можливий головний біль, дощ' : 'pressure falling — headache risk, rain') : sensors.lux < 10 && now.getHours() > 8 && now.getHours() < 18 ? (uk ? 'темно вдень — відкрий штори' : 'dark by day — open the curtains') : (uk ? 'усе в нормі' : 'all good');
    c.fillStyle = '#aab'; c.font = F(8); c.textAlign = 'left'; c.fillText(hint, 10, 172);
    // 24 год графік температури в кімнаті (симуляція навколо поточної)
    c.fillStyle = '#889'; c.fillText(uk ? 'кімната, 24 год' : 'room, 24 h', 10, 192);
    const gx = 10, gy = 198, gw = W - 20, gh = 60; c.fillStyle = '#151923'; c.fillRect(gx, gy, gw, gh);
    c.strokeStyle = ORANGE; c.lineWidth = 1.5; c.beginPath();
    for (let i = 0; i <= 48; i++) { const v = sensors.temp - 1.5 + Math.sin(i / 48 * Math.PI * 2 - 1.5) * 1.5; const x = gx + i / 48 * gw, y = gy + gh / 2 - (v - sensors.temp) * 12; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.strokeStyle = '#7aa2f7'; c.beginPath();
    for (let i = 0; i <= 48; i++) { const v = sensors.hum + Math.cos(i / 48 * Math.PI * 2) * 5; const x = gx + i / 48 * gw, y = gy + gh - (v - 30) / 50 * gh; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.fillStyle = '#556'; c.font = F(7); c.fillText(uk ? 'BME280 — низ рюкзака, подалі від чипа; VEML7700 — зверху, дивиться в стелю' : 'BME280 — bottom of the backpack, away from the chip; VEML7700 — on top, facing the ceiling', 10, 272);
    wrap(c, uk ? 'Сценарії: сухо → зволожувач; тиск падає → дощ; темно вдень → штори.' : 'Scenarios: dry → humidifier; pressure falling → rain; dark by day → curtains.', 10, 284, W - 20, 10);
  }
  scr_forecast(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, loc = uk ? 'uk-UA' : 'en-GB';
    frame(c, W, H); title(c, uk ? 'ПРОГНОЗ · 7 ДНІВ' : 'FORECAST · 7 DAYS');
    weather.daily.slice(0, 7).forEach((d, i) => {
      const y = 32 + i * 38; tile(c, 8, y, W - 16, 34, i === 0 ? ORANGE : '#2a2f3a');
      c.fillStyle = i === 0 ? '#fff' : '#aab'; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(d.date.toLocaleDateString(loc, { weekday: 'short' }).toUpperCase(), 16, y + 13);
      c.fillStyle = '#667'; c.font = F(7); c.fillText(d.date.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), 16, y + 25);
      wxIcon(c, d.code, 66, y + 17, 14, t);
      c.fillStyle = '#fff'; c.font = F(11, 'bold'); c.textAlign = 'right'; c.fillText(`${d.max}°`, 120, y + 15); c.fillStyle = '#889'; c.font = F(8); c.fillText(`${d.min}°`, 120, y + 27);
      c.fillStyle = d.pop > 50 ? '#7aa2f7' : '#667'; c.font = F(7); c.fillText(`${d.pop}%`, 150, y + 13); c.fillStyle = '#667'; c.fillText(`${d.wind} km/h`, 158, y + 26);
    });
    const fc = sensors.trend > 0.2 ? (uk ? 'тиск росте → прояснення' : 'pressure rising → clearing') : sensors.trend < -0.2 ? (uk ? 'тиск падає → дощ можливий' : 'pressure falling → rain likely') : (uk ? 'тиск стабільний' : 'pressure steady');
    tile(c, 8, 302, W - 16, 30, '#7aa2f7'); c.fillStyle = '#fff'; c.font = F(10, 'bold'); c.textAlign = 'left'; c.fillText(`${sensors.pressure.toFixed(1)} hPa`, 16, 315); c.fillStyle = '#aab'; c.font = F(7); c.fillText(fc, 16, 326);
    c.fillStyle = '#556'; c.font = F(7); c.fillText(weather.live ? 'open-meteo · live' : 'open-meteo · static', 10, 348);
    if (weather.code >= 51 && weather.code < 70) this.rainOnGlass(c, t, W, H);
  }
  rainOnGlass(c, t, W, H) { c.fillStyle = 'rgba(120,170,255,0.35)'; for (let i = 0; i < 30; i++) { const x = (i * 53) % W, y = ((t * (20 + i % 5 * 8)) + i * 37) % H; c.beginPath(); c.ellipse(x, y, 1.5, 3, 0, 0, Math.PI * 2); c.fill(); } }
  scr_air(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, a = weather.aq;
    frame(c, W, H); title(c, uk ? 'ПОВІТРЯ' : 'AIR');
    const col = a.aqi <= 20 ? GREEN : a.aqi <= 40 ? '#a3e635' : a.aqi <= 60 ? ORANGE : RED;
    c.lineWidth = 8; c.strokeStyle = '#2a2f3a'; c.beginPath(); c.arc(85, 80, 38, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
    c.strokeStyle = col; c.beginPath(); c.arc(85, 80, 38, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * Math.min(1, a.aqi / 100))); c.stroke();
    c.fillStyle = '#fff'; c.font = F(24, 'bold'); c.textAlign = 'center'; c.fillText(a.aqi, 85, 88); c.fillStyle = '#889'; c.font = F(8); c.fillText('AQI (EU)', 85, 102);
    const tiles = [[`${a.pm25}`, 'PM2.5 µg/m³'], [`${a.pm10}`, 'PM10 µg/m³'], [`${a.uv}`, 'UV'], [`${weather.temp}°`, uk ? 'на вулиці' : 'outdoors']];
    tiles.forEach(([v, l], i) => { const x = 10 + (i % 2) * 78, y = 130 + Math.floor(i / 2) * 44; tile(c, x, y, 72, 38, col); c.fillStyle = '#fff'; c.font = F(13, 'bold'); c.textAlign = 'left'; c.fillText(v, x + 8, y + 18); c.fillStyle = '#889'; c.font = F(7); c.fillText(l, x + 8, y + 30); });
    const open = a.aqi <= 40 && Math.abs(weather.temp - 22) < 8;
    tile(c, 8, 224, W - 16, 60, open ? GREEN : RED);
    c.fillStyle = '#fff'; c.font = F(14, 'bold'); c.textAlign = 'left'; c.fillText(open ? (uk ? 'ВІДКРИЙ ВІКНО' : 'OPEN THE WINDOW') : (uk ? 'ВІКНО ЗАКРИТИ' : 'KEEP IT CLOSED'), 16, 246);
    c.fillStyle = '#aab'; c.font = F(8); wrap(c, uk ? `Вулиця: ${weather.temp}°, AQI ${a.aqi}. Кімната: ${sensors.temp.toFixed(0)}°, ${Math.round(sensors.hum)}%.` : `Outdoors: ${weather.temp}°, AQI ${a.aqi}. Room: ${sensors.temp.toFixed(0)}°, ${Math.round(sensors.hum)}%.`, 16, 262, W - 36, 10);
    c.fillStyle = '#556'; c.font = F(7); c.fillText(a.live ? 'open-meteo air quality · live' : 'static', 10, 300);
  }
  scr_focus(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'ФОКУС' : 'FOCUS');
    const total = focus.breakMode ? 300 : focus.total, p = 1 - focus.left / total, col = focus.breakMode ? GREEN : BLUE;
    c.lineWidth = 10; c.strokeStyle = '#2a2f3a'; c.beginPath(); c.arc(85, 120, 60, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = col; c.beginPath(); c.arc(85, 120, 60, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke();
    const m = Math.floor(focus.left / 60), s = Math.floor(focus.left % 60);
    c.fillStyle = '#fff'; c.font = F(30, 'bold'); c.textAlign = 'center'; c.fillText(`${pad(m)}:${pad(s)}`, 85, 130);
    c.fillStyle = '#889'; c.font = F(8); c.fillText(focus.breakMode ? (uk ? 'перерва' : 'break') : focus.running ? (uk ? 'фокус · не турбувати' : 'focus · do not disturb') : (uk ? 'тап — старт' : 'tap to start'), 85, 148);
    c.fillStyle = '#889'; c.textAlign = 'left'; c.fillText(uk ? 'сесії сьогодні' : 'sessions today', 10, 210);
    for (let i = 0; i < 8; i++) { c.fillStyle = i < focus.sessions ? col : '#2a2f3a'; c.fillRect(10 + i * 19, 216, 15, 8); }
    c.fillStyle = '#556'; c.font = F(7); wrap(c, uk ? 'Поки триває сесія — LED синій «on air», Dev-екран і повідомлення приховані. Кінець — спікер, 5 хв перерви.' : 'While a session runs the LED is blue “on air”, Dev and notifications hidden. End — chime, 5-minute break.', 10, 240, W - 20, 10);
  }
  scr_tasks(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'ЗАДАЧІ · СЬОГОДНІ' : 'TASKS · TODAY');
    tasks.list.forEach(([tu, te, done], i) => {
      const y = 40 + i * 52; tile(c, 8, y, W - 16, 44, done ? GREEN : '#2a2f3a');
      c.strokeStyle = done ? GREEN : '#667'; c.lineWidth = 1.5; c.strokeRect(18.5, y + 14.5, 14, 14);
      if (done) { c.strokeStyle = GREEN; c.beginPath(); c.moveTo(21, y + 22); c.lineTo(25, y + 26); c.lineTo(31, y + 17); c.stroke(); }
      c.fillStyle = done ? '#889' : '#fff'; c.font = F(9, done ? '' : 'bold'); c.textAlign = 'left'; wrap(c, uk ? tu : te, 40, y + 20, W - 60, 11, 2);
      if (done) { c.strokeStyle = '#889'; c.beginPath(); c.moveTo(40, y + 17); c.lineTo(40 + Math.min(W - 60, c.measureText(uk ? tu : te).width), y + 17); c.stroke(); }
    });
    const n = tasks.list.filter(x => x[2]).length;
    c.fillStyle = n === 3 ? GREEN : '#889'; c.font = F(n === 3 ? 12 : 8, 'bold'); c.textAlign = 'center'; c.fillText(n === 3 ? (uk ? 'ДЕНЬ ЗРОБЛЕНО ✓' : 'DAY DONE ✓') : `${n}/3`, 85, 220);
    c.fillStyle = '#556'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'Todoist / GitHub Issues · тап по чекбоксу' : 'Todoist / GitHub Issues · tap the checkbox', 10, 240);
  }
  scr_fact(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, loc = uk ? 'uk-UA' : 'en-GB';
    frame(c, W, H); title(c, uk ? 'ЦЬОГО ДНЯ' : 'ON THIS DAY');
    c.fillStyle = '#889'; c.font = F(8); c.fillText(now.toLocaleDateString(loc, { day: 'numeric', month: 'long' }), 10, 36);
    c.fillStyle = ORANGE; c.font = F(36, 'bold'); c.fillText(String(fact.year), 10, 76);
    c.fillStyle = '#fff'; c.font = F(9); wrap(c, fact.text[uk ? 'uk' : 'en'].replace(/^\d+ — /, ''), 10, 96, W - 20, 12, 12);
    c.fillStyle = '#556'; c.font = F(7); c.fillText(fact.live ? 'wikipedia · on this day · live' : 'wikipedia · static', 10, H - 30);
    c.fillText(uk ? 'тап — ще один факт' : 'tap — another fact', 10, H - 20);
  }
  scr_word(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, w = words[now.getDate() % words.length];
    frame(c, W, H); title(c, uk ? 'СЛОВО ДНЯ' : 'WORD OF THE DAY');
    c.fillStyle = '#fff'; c.font = F(18, 'bold'); c.fillText(w[0], 10, 70); c.fillStyle = ORANGE; c.font = F(12); c.fillText(w[1], 10, 90);
    c.fillStyle = '#aab'; c.font = F(9); wrap(c, w[2], 10, 112, W - 20, 12);
    c.fillStyle = BLUE; c.beginPath(); c.arc(30, 170, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(25, 165); c.lineTo(25, 175); c.lineTo(35, 170); c.fill();
    c.fillStyle = '#889'; c.font = F(8); c.fillText(uk ? 'озвучити через спікер' : 'play on the speaker', 52, 173);
    for (let i = 0; i < 12; i++) { const h = 3 + Math.abs(Math.sin(t * 6 + i)) * 10; c.fillStyle = '#3a3f4a'; c.fillRect(52 + i * 6, 190 - h / 2, 3, h); }
  }
  scr_rates(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    frame(c, W, H); title(c, uk ? 'КУРСИ' : 'RATES');
    rates.list.forEach(([name, v, ch], i) => {
      const y = 34 + i * 70; tile(c, 8, y, W - 16, 62, ch >= 0 ? GREEN : RED);
      c.fillStyle = '#889'; c.font = F(8); c.textAlign = 'left'; c.fillText(name, 16, y + 14);
      c.fillStyle = '#fff'; c.font = F(16, 'bold'); c.fillText(v >= 1000 ? v.toLocaleString('en-US') : v, 16, y + 34);
      c.fillStyle = ch >= 0 ? GREEN : RED; c.font = F(9, 'bold'); c.textAlign = 'right'; c.fillText(`${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch)}%`, W - 16, y + 14);
      c.strokeStyle = ch >= 0 ? GREEN : RED; c.lineWidth = 1.5; c.beginPath();
      for (let k = 0; k < 14; k++) { const x = 90 + k * 5, yy = y + 46 - Math.sin(k * 0.9 + i) * 6 - k * ch * 0.6; k ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke();
    });
    c.fillStyle = '#556'; c.font = F(7); c.textAlign = 'left'; c.fillText(rates.live ? 'open.er-api.com · live' : 'static', 10, 258);
    wrap(c, uk ? 'Зміна > 2 % за день → рамка картки світиться 10 с.' : 'Change > 2 % per day → the card border glows for 10 s.', 10, 272, W - 20, 10);
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
    c.fillStyle = '#556'; c.font = F(7); c.textAlign = 'left'; c.fillText('spotify · demo', 10, H - 20);
  }
  scr_moon(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, ph = moonPhase(now);
    frame(c, W, H); title(c, uk ? 'МІСЯЦЬ І НЕБО' : 'MOON & SKY');
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * Math.abs(Math.sin(t + i))})`; c.fillRect((i * 37) % W, 30 + (i * 53) % 130, 1, 1); }
    drawMoon(c, 85, 95, 44, ph, '#e8e8f0', '#1c1c26');
    const names = uk ? ['новий', 'молодий', 'перша чверть', 'зростає', 'повний', 'спадає', 'остання чверть', 'старий'] : ['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'last quarter', 'waning crescent'];
    c.fillStyle = '#fff'; c.font = F(10, 'bold'); c.textAlign = 'center'; c.fillText(names[Math.round(ph * 8) % 8], 85, 156);
    c.fillStyle = '#889'; c.font = F(8); c.fillText(`${Math.round(ph * 100)}% · ${uk ? 'повний через' : 'full in'} ${Math.round(((0.5 - ph + 1) % 1) * 29.53)} ${uk ? 'дн' : 'd'}`, 85, 170);
    const rows = uk ? [['МКС над Києвом', '21:14 → 21:20, 62°'], ['видимі', 'Юпітер, Сатурн'], ['Kp-індекс', '3 · сяйва не буде']] : [['ISS over Kyiv', '21:14 → 21:20, 62°'], ['visible', 'Jupiter, Saturn'], ['Kp index', '3 · no aurora']];
    rows.forEach(([k, v], i) => { const y = 186 + i * 26; tile(c, 8, y, W - 16, 22, '#7aa2f7'); c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(k, 16, y + 9); c.fillStyle = '#fff'; c.font = F(8, 'bold'); c.fillText(v, 16, y + 19); });
    if (this.launchT) {
      const left = Math.max(0, (this.launchT - performance.now()) / 1000);
      tile(c, 8, 268, W - 16, 60, ORANGE); c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'наступний запуск · Falcon 9 · Starlink' : 'next launch · Falcon 9 · Starlink', 16, 280);
      c.fillStyle = left > 0 ? ORANGE : GREEN; c.font = F(22, 'bold'); c.fillText(left > 0 ? `T-${pad(Math.floor(left / 60))}:${pad(Math.floor(left % 60))}` : (uk ? 'СТАРТ' : 'LIFTOFF'), 16, 310);
      c.fillStyle = '#fff'; c.font = F(16); c.textAlign = 'right'; c.fillText('🚀', W - 16, 310 - (left > 0 ? 0 : Math.min(40, (performance.now() - this.launchT) / 30)));
    } else { tile(c, 8, 268, W - 16, 30, '#556'); c.fillStyle = '#889'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'наступний запуск · Falcon 9 · через 2 дн 04:12' : 'next launch · Falcon 9 · in 2 d 04:12', 16, 280); c.fillStyle = '#556'; c.fillText('launch library 2 · demo', 16, 292); }
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
    c.strokeStyle = '#667'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  }
  scr_landing(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, tilt = Math.hypot(sensors.roll, sensors.pitch);
    frame(c, W, H); title(c, uk ? 'ПОСАДКА' : 'LANDING');
    this.horizon(c, 85, 110, 64);
    c.fillStyle = tilt > 30 ? RED : tilt > 20 ? ORANGE : '#fff'; c.font = F(14, 'bold'); c.textAlign = 'center'; c.fillText(`${tilt.toFixed(0)}°`, 85, 198);
    c.fillStyle = '#889'; c.font = F(8); c.fillText(tilt > 30 ? (uk ? 'ВИРІВНЯЙ ПОСАДКУ' : 'LEVEL THE LANDER') : (uk ? `roll ${sensors.roll.toFixed(0)}° · pitch ${sensors.pitch.toFixed(0)}°` : `roll ${sensors.roll.toFixed(0)}° · pitch ${sensors.pitch.toFixed(0)}°`), 85, 212);
    const tiles = [[`${sensors.alt} m`, uk ? 'висота (тиск)' : 'altitude (pressure)'], [`${(sensors.mic * 2).toFixed(2)} g`, uk ? 'вібрація' : 'vibration'], ['4/4', uk ? 'ноги на ґрунті' : 'legs down'], [`${sensors.pressure.toFixed(0)} hPa`, uk ? 'тиск' : 'pressure']];
    tiles.forEach(([v, l], i) => { const x = 10 + (i % 2) * 78, y = 226 + Math.floor(i / 2) * 44; tile(c, x, y, 72, 38, '#7aa2f7'); c.fillStyle = '#fff'; c.font = F(12, 'bold'); c.textAlign = 'left'; c.fillText(v, x + 8, y + 18); c.fillStyle = '#889'; c.font = F(7); c.fillText(l, x + 8, y + 30); });
    c.fillStyle = '#556'; c.font = F(7); c.fillText(uk ? 'LSM6DSOX · десктоп: курсор над екраном = нахил' : 'LSM6DSOX · desktop: cursor over screen = tilt', 10, 330);
  }
  // --- бак: пружинна поверхня ---
  makeTank() { const n = 60; return { n, h: new Float32Array(n), v: new Float32Array(n), drops: [], bubbles: [], level: () => 300 - sensors.battery * 200 }; }
  stepTank(dt, t) {
    const tk = this.tank, k = 0.02, damp = 0.965, spread = 0.22, dtc = Math.min(dt, 1 / 30);
    const g = Math.sin(sensors.roll * Math.PI / 180) * 6;
    for (let i = 0; i < tk.n; i++) { const target = g * (i / tk.n - 0.5) * 40; tk.v[i] += (target - tk.h[i]) * k * 60 * dtc; tk.v[i] *= damp; }
    for (let pass = 0; pass < 4; pass++) for (let i = 0; i < tk.n; i++) { if (i > 0) tk.v[i] += (tk.h[i - 1] - tk.h[i]) * spread; if (i < tk.n - 1) tk.v[i] += (tk.h[i + 1] - tk.h[i]) * spread; }
    for (let i = 0; i < tk.n; i++) { tk.h[i] += tk.v[i] * dtc * 60 * 0.12; tk.h[i] = Math.max(-60, Math.min(60, tk.h[i])); }
    if (!this.scenario && Math.random() < 0.02) tk.v[Math.floor(Math.random() * tk.n)] += rnd(-2, 2);
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
    for (let i = 0; i <= 4; i++) { const y = 100 + i * 50; c.fillStyle = '#3a3f4a'; c.fillRect(W - 22, y, 8, 1); c.fillStyle = '#667'; c.font = F(6); c.textAlign = 'right'; c.fillText(`${100 - i * 25}`, W - 24, y + 2); }
    c.strokeStyle = '#3a3f4a'; c.lineWidth = 2; c.strokeRect(12, 50, W - 24, 290);
    c.fillStyle = '#fff'; c.font = F(22, 'bold'); c.textAlign = 'center'; c.fillText(`${Math.round(sensors.battery * 100)}%`, 85, 80);
    c.fillStyle = '#aab'; c.font = F(7); c.fillText(sensors.charging ? (uk ? 'заряджається · USB-C' : 'charging · USB-C') : `16340 · ${(3.3 + sensors.battery * 0.9).toFixed(2)} V · ~${Math.round(sensors.battery * 6)} ${uk ? 'год' : 'h'}`, 85, 92);
    c.fillStyle = '#556'; c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'нахил — IMU · тап — крапля · струс — сплеск' : 'tilt — IMU · tap — drop · shake — splash', 12, H - 22);
  }
  scr_face(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, tn = performance.now();
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    const look = { x: sensors.roll / 45 * 10 + (sensors.mic > 0.5 ? 8 : 0), y: sensors.pitch / 45 * 6 };
    const blink = Math.sin(t * 0.7) > 0.985 ? 0.1 : 1, wink = this.winkT && tn - this.winkT < 500;
    [[52, 150], [118, 150]].forEach(([x, y], i) => {
      const open = wink && i === 1 ? 0.08 : blink;
      c.fillStyle = ORANGE; c.beginPath(); c.ellipse(x, y, 24, 30 * open, 0, 0, Math.PI * 2); c.fill();
      if (open > 0.3) { c.fillStyle = '#000'; c.beginPath(); c.ellipse(x + look.x, y + look.y, 9, 12, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + look.x + 3, y + look.y - 4, 2.5, 0, Math.PI * 2); c.fill(); }
    });
    // рот
    c.strokeStyle = ORANGE; c.lineWidth = 3; c.beginPath(); const smile = wink ? 14 : 6 + Math.sin(t) * 2; c.moveTo(60, 215); c.quadraticCurveTo(85, 215 + smile, 110, 215); c.stroke();
    c.fillStyle = '#556'; c.font = F(7); c.textAlign = 'center'; c.fillText(uk ? 'очі дивляться на звук і нахил · хлопок — підморгує' : 'eyes follow sound and tilt · clap — wink', 85, H - 20);
  }
  scr_night(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 30, H / 2 - 22, 22, 44, '#4a4033', null, now.getMilliseconds() < 500);
    c.fillStyle = '#333'; c.font = F(8); c.textAlign = 'center'; c.fillText(uk ? `ніч · ${Math.round(sensors.lux)} lx · LED вимкнено` : `night · ${Math.round(sensors.lux)} lx · LED off`, 85, H / 2 + 40);
    drawMoon(c, 85, H / 2 - 60, 10, moonPhase(now), '#3a3a44', '#111');
  }
  scr_sleep(c, now, t, H) {
    c.fillStyle = '#000'; c.fillRect(0, 0, 170, H); c.fillStyle = '#2a2a2a'; c.font = F(9); c.textAlign = 'center';
    c.fillText(this.lang === 'uk' ? 'догори дном · сон' : 'face down · sleep', 85, H / 2 - 20);
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 40, H / 2, 18, 30, '#222', null);
  }
  scr_morning(c, now, t, H) {
    const uk = this.lang === 'uk', W = 170, loc = uk ? 'uk-UA' : 'en-GB';
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1a0a'); g.addColorStop(1, DARK); c.fillStyle = g; c.fillRect(0, 0, W, H);
    sunIcon(c, 85, 70, 22, t, '#ffd34d');
    c.fillStyle = '#fff'; c.font = F(16, 'bold'); c.textAlign = 'center'; c.fillText(uk ? 'ДОБРОГО РАНКУ' : 'GOOD MORNING', 85, 120);
    c.fillStyle = '#aab'; c.font = F(9); c.fillText(now.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' }), 85, 136);
    const rows = [[uk ? 'погода' : 'weather', `${weather.temp}° · ${weather.daily[0]?.max}°/${weather.daily[0]?.min}° · ${weather.daily[0]?.pop}% ${uk ? 'дощ' : 'rain'}`], [uk ? 'перший мітинг' : 'first meeting', `09:00 Standup`], [uk ? 'задач' : 'tasks', `3 · ${uk ? 'перша' : 'first'}: ${tasks.list[0][uk ? 0 : 1]}`], [uk ? 'слово дня' : 'word of the day', words[0][0]]];
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
    const key = `${this.screen}|${this.lang}|${claude.state}|${cal.next.inMin}|${sensors.battery.toFixed(2)}|${sensors.wifi}|${this.launchT ? 1 : 0}|${this.bannerT ? 1 : 0}`;
    if (!this.inkImage || key !== this.inkKey) {
      if (this.inkImage && this.inkKey.split('|')[0] !== this.screen) { this.inkFlash = tn; this.inkKey = key; return; }
      this.inkImage = document.createElement('canvas'); this.inkImage.width = W; this.inkImage.height = H;
      this.drawInk(this.inkImage.getContext('2d'), now, t); this.inkMinute = minute; this.inkKey = key;
    }
    if (minute !== this.inkMinute) { this.inkMinute = minute; this.inkPartial = tn; this.drawInk(this.inkImage.getContext('2d'), now, t); }
    c.drawImage(this.inkImage, 0, 0);
    if (this.inkPartial) { const s = (tn - this.inkPartial) / 110; if (s < 4) { c.fillStyle = Math.floor(s) % 2 ? INK : PAPER; c.fillRect(6, 62, 140, 56); } else this.inkPartial = 0; }
    if (this.powerOff) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, 0, W, H); c.fillStyle = INK; c.fillRect(0, H - 18, W, 18); c.fillStyle = PAPER; c.font = F(8, 'bold'); c.textAlign = 'center'; c.fillText(this.lang === 'uk' ? 'ЖИВЛЕННЯ ВИМКНЕНО · КАРТИНКА ЛИШИЛАСЬ' : 'POWER OFF · IMAGE STAYS', W / 2, H - 6); }
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
    if (this.bannerT) { c.fillStyle = INK; c.fillRect(0, 0, W, 16); c.fillStyle = PAPER; c.font = F(9, 'bold'); c.textAlign = 'center'; c.fillText(this.bannerT.text[this.lang], W / 2, 12); }
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
    c.fillText(cal.next.inMin > 0 ? (uk ? `${cal.next.inMin} хв · ${cal.next.title}` : `${cal.next.inMin} min · ${cal.next.title}`).slice(0, 22) : cal.next.title.slice(0, 22), 13, 215);
    c.fillStyle = INK; c.textAlign = 'left'; c.font = F(9); c.fillText('HUM', 8, 240); c.strokeRect(34.5, 231.5, 56, 10); c.fillRect(36, 233, 53 * weather.hum / 100, 7); c.fillText(`${weather.hum}%`, 96, 240);
    c.fillText('WIND', 8, 258); c.font = F(13, 'bold'); c.fillText(`${weather.wind}`, 38, 259); c.font = F(9); c.fillText('km/h', 60, 258);
    drawMoon(c, W - 20, 250, 11, moonPhase(now), INK, PAPER); c.beginPath(); c.arc(W - 20, 250, 11, 0, Math.PI * 2); c.stroke();
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
    this.inkHead(c, now, W); const cur = now.getHours() + now.getMinutes() / 60, y0 = 56, hpx = 18;
    c.fillStyle = INK; c.font = F(10, 'bold'); c.textAlign = 'left'; c.fillText(uk ? 'ДЕНЬ' : 'DAY', 8, y0 - 6);
    for (let hh = 8; hh <= 20; hh++) { const y = y0 + (hh - 8) * hpx; c.fillStyle = INK; c.fillRect(28, y, W - 36, 0.7); c.font = F(7); c.textAlign = 'right'; c.fillText(pad(hh), 24, y + 3); }
    for (const [a, b, name] of cal.day) { const y = y0 + (a - 8) * hpx, h = (b - a) * hpx, past = b < cur; c.fillStyle = INK; if (past) { c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(30.5, y + 1.5, W - 40, h - 3); } else c.fillRect(30, y + 1, W - 39, h - 2); c.fillStyle = past ? INK : PAPER; c.font = F(8, 'bold'); c.textAlign = 'left'; c.fillText(name, 34, y + 10); }
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
    c.font = F(8); c.fillText(`${claude.commits} ${uk ? 'комітів сьогодні' : 'commits today'} · ${claude.session}`.slice(0, 34), 8, 240);
    const wk = [3, 8, 5, 11, 7, 2, claude.commits]; wk.forEach((v, i) => { c.fillRect(10 + i * 19, 284 - v * 3, 13, v * 3); });
  }
  ink_forecast(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const loc = uk ? 'uk-UA' : 'en-GB';
    weather.daily.slice(0, 7).forEach((d, i) => {
      const y = 56 + i * 32; c.fillStyle = INK; c.font = F(9, 'bold'); c.textAlign = 'left'; c.fillText(d.date.toLocaleDateString(loc, { weekday: 'short' }).toUpperCase(), 8, y + 12);
      c.font = F(7); c.fillText(d.date.toLocaleDateString(loc, { day: '2-digit', month: 'short' }), 8, y + 22);
      const ic = d.code <= 1 ? '☀' : d.code <= 3 ? '⛅' : d.code >= 71 && d.code <= 77 ? '❄' : d.code >= 95 ? '⛈' : '☂'; c.font = '14px sans-serif'; c.textAlign = 'center'; c.fillText(ic, 62, y + 18);
      c.font = F(12, 'bold'); c.textAlign = 'right'; c.fillText(`${d.max}°`, 104, y + 13); c.font = F(8); c.fillText(`${d.min}°`, 104, y + 24);
      c.font = F(8); c.fillText(`${d.pop}%`, 130, y + 13); c.fillText(`${d.wind}`, 144, y + 24);
      c.fillRect(8, y + 28, W - 16, 0.6);
    });
    c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'дощ % · вітер km/h · open-meteo' : 'rain % · wind km/h · open-meteo', 8, 290);
  }
  ink_fact(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const loc = uk ? 'uk-UA' : 'en-GB';
    c.fillStyle = INK; c.font = F(9); c.textAlign = 'left'; c.fillText((uk ? 'цього дня · ' : 'on this day · ') + now.toLocaleDateString(loc, { day: 'numeric', month: 'long' }), 8, 62);
    c.font = F(40, 'bold'); c.fillText(String(fact.year), 8, 104);
    c.font = F(10); wrap(c, fact.text[uk ? 'uk' : 'en'].replace(/^\d+ — /, ''), 8, 126, W - 16, 13, 11);
    c.font = F(7); c.fillText('wikipedia · on this day', 8, 290);
  }
  ink_moon(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const ph = moonPhase(now);
    drawMoon(c, W / 2, 110, 46, ph, INK, PAPER); c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.arc(W / 2, 110, 46, 0, Math.PI * 2); c.stroke();
    const names = uk ? ['новий', 'молодий', 'перша чверть', 'зростає', 'повний', 'спадає', 'остання чверть', 'старий'] : ['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'last quarter', 'waning crescent'];
    c.fillStyle = INK; c.font = F(12, 'bold'); c.textAlign = 'center'; c.fillText(names[Math.round(ph * 8) % 8], W / 2, 176);
    c.font = F(9); c.fillText(`${Math.round(ph * 100)}% · ${uk ? 'повний через' : 'full in'} ${Math.round(((0.5 - ph + 1) % 1) * 29.53)} ${uk ? 'дн' : 'd'}`, W / 2, 192);
    const rows = uk ? [['МКС', '21:14 → 21:20 · 62°'], ['видимі', 'Юпітер, Сатурн'], ['Kp', '3 · сяйва не буде']] : [['ISS', '21:14 → 21:20 · 62°'], ['visible', 'Jupiter, Saturn'], ['Kp', '3 · no aurora']];
    rows.forEach(([k, v], i) => { const y = 214 + i * 20; c.textAlign = 'left'; c.font = F(8); c.fillText(k, 8, y); c.textAlign = 'right'; c.font = F(9, 'bold'); c.fillText(v, W - 8, y); });
    if (this.launchT) { const left = Math.max(0, (this.launchT - performance.now()) / 1000); c.fillStyle = INK; c.fillRect(8, 272, W - 16, 18); c.fillStyle = PAPER; c.font = F(10, 'bold'); c.textAlign = 'center'; c.fillText(left > 0 ? `T-${pad(Math.floor(left / 60))}:${pad(Math.floor(left % 60))} · Falcon 9` : (uk ? 'СТАРТ' : 'LIFTOFF'), W / 2, 285); }
  }
  ink_night(c, now, t, W, H, uk) {
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H); c.fillStyle = INK; drawMoon(c, W / 2, 90, 30, moonPhase(now), INK, PAPER); c.beginPath(); c.arc(W / 2, 90, 30, 0, Math.PI * 2); c.stroke();
    sevenSeg(c, `${pad(now.getHours())}:${pad(now.getMinutes())}`, 20, 150, 24, 40, INK, null);
    c.font = F(9); c.textAlign = 'center'; c.fillText(uk ? 'ніч · екран не оновлюється' : 'night · no refresh', W / 2, 220); c.fillText(uk ? 'картинка тримається без живлення' : 'image holds without power', W / 2, 234);
  }
  ink_note(c, now, t, W, H, uk) {
    this.inkHead(c, now, W);
    c.fillStyle = INK; c.font = F(9); c.textAlign = 'left'; c.fillText(uk ? 'ЗАПИСКА' : 'NOTE', 8, 62);
    c.strokeStyle = INK; c.lineWidth = 1; for (let y = 90; y < 250; y += 22) { c.beginPath(); c.moveTo(10, y); c.lineTo(W - 10, y); c.stroke(); }
    c.font = 'italic 15px Georgia, serif';
    const lines = uk ? ['Пішов на каву ☕', 'буду о 14:10.', '', 'Якщо CI впаде —', 'не чіпай, я гляну.', '', '— A.'] : ['Out for coffee ☕', 'back at 14:10.', '', 'If CI fails —', 'leave it, I’ll check.', '', '— A.'];
    lines.forEach((l, i) => c.fillText(l, 14, 84 + i * 22));
    c.font = F(7); c.fillText(uk ? 'надіслано з телефону · тримається без живлення' : 'sent from the phone · holds without power', 8, 290);
  }
  ink_mooncal(c, now, t, W, H, uk) {
    this.inkHead(c, now, W); const loc = uk ? 'uk-UA' : 'en-GB';
    c.fillStyle = INK; c.font = F(10, 'bold'); c.textAlign = 'center'; c.fillText(now.toLocaleDateString(loc, { month: 'long', year: 'numeric' }).toUpperCase(), W / 2, 62);
    const first = new Date(now.getFullYear(), now.getMonth(), 1), days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
    const cw = (W - 16) / 7; c.font = F(7); (uk ? 'ПВСЧПСН' : 'MTWTFSS').split('').forEach((d, i) => c.fillText(d, 8 + cw * (i + 0.5), 76));
    for (let d = 1; d <= days; d++) {
      const i = off + d - 1, x = 8 + cw * (i % 7 + 0.5), y = 92 + Math.floor(i / 7) * 30;
      const ph = moonPhase(new Date(now.getFullYear(), now.getMonth(), d, 12));
      drawMoon(c, x, y + 4, 7, ph, INK, PAPER); c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.arc(x, y + 4, 7, 0, Math.PI * 2); c.stroke();
      c.fillStyle = INK; c.font = F(6, d === now.getDate() ? 'bold' : ''); c.fillText(String(d), x, y + 18);
      if (d === now.getDate()) { c.strokeRect(x - cw / 2 + 1, y - 6, cw - 2, 27); }
    }
    c.font = F(7); c.textAlign = 'left'; c.fillText(uk ? 'оновлюється раз на добу о 00:05' : 'refreshes once a day at 00:05', 8, 290);
  }
}
