// Схема з'єднань і блок-діаграма Lander R2 — генеруються як SVG з тих самих даних, що й таблиця пінів.
// Піни Feather — за PrettyPins Adafruit (ESP32-S3 Feather #5477, ESP32-C6 Feather #5933); призначення GPIO — наше, орієнтовне.
const NET = { pwr: '#EA5212', gnd: '#121826', qspi: '#2563eb', spi: '#2563eb', i2c: '#16a34a', i2s: '#7c3aed', pdm: '#d97706', gpio: '#6b7280' };

// Плата: [мітка, GPIO] у порядку зверху вниз, ліва і права сторони
const MCU = {
  touch: { name: 'ESP32-S3 Feather', sub: 'Adafruit #5477 · 8 MB PSRAM · Wi-Fi/BLE',
    left: [['3V3', ''], ['GND', ''], ['SDA', '3'], ['SCL', '4'], ['SCK', '36'], ['MOSI', '35'], ['MISO', '37'], ['D10', '10'], ['D12', '12'], ['D13', '13'], ['D9', '9'], ['D5', '5'], ['D6', '6'], ['A3', '15'], ['A2', '16'], ['A1', '17'], ['A4', '14'], ['A5', '8']],
    right: [['BAT', ''], ['USB', 'C'], ['A0', '18'], ['RX', '38'], ['TX', '39'], ['D11', '11']] },
  ink: { name: 'ESP32-C6 Feather', sub: 'Adafruit #5933 · Wi-Fi 6 / BLE · deep sleep',
    left: [['3V3', ''], ['GND', ''], ['SCK', '21'], ['MOSI', '22'], ['D10', '10'], ['D9', '9'], ['D6', '14'], ['D5', '8'], ['D11', '11']],
    right: [['BAT', ''], ['USB', 'C'], ['A0', '1'], ['A1', '4'], ['A2', '6']] },
};
// Периферія: { id, назва, підпис, сторона, піни: [[пін модуля, пін плати, мережа]] }
const PERIPH = {
  touch: [
    { id: 'disp', name: 'AMOLED 1.91″ 240×536', sub: 'RM67162 · QSPI', side: 'L', pins: [['VCC', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SCLK', 'SCK', 'qspi'], ['SIO0', 'MOSI', 'qspi'], ['SIO1', 'MISO', 'qspi'], ['CS', 'D10', 'qspi'], ['SIO2', 'D12', 'qspi'], ['SIO3', 'D13', 'qspi'], ['RST', 'D9', 'gpio']] },
    { id: 'tp', name: 'Touch FT3168', sub: 'I²C 0x38', side: 'L', pins: [['SDA', 'SDA', 'i2c'], ['SCL', 'SCL', 'i2c'], ['INT', 'D5', 'gpio'], ['RST', 'D6', 'gpio']] },
    { id: 'amp', name: 'MAX98357A + спікер 15 мм', sub: 'I²S · 3 W', side: 'L', pins: [['VIN', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['BCLK', 'A3', 'i2s'], ['LRC', 'A2', 'i2s'], ['DIN', 'A1', 'i2s']] },
    { id: 'mic', name: 'PDM-мікрофон', sub: 'MP34DT05', side: 'L', pins: [['3V', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['CLK', 'A4', 'pdm'], ['DAT', 'A5', 'pdm']] },
    { id: 'imu', name: 'IMU LSM6DSOX', sub: 'I²C 0x6A · гіро + акселерометр', side: 'R', pins: [['VIN', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SDA', 'SDA', 'i2c'], ['SCL', 'SCL', 'i2c'], ['INT1', 'A0', 'gpio']] },
    { id: 'bme', name: 'BME280', sub: 'I²C 0x76 · T / RH / P', side: 'R', pins: [['VIN', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SDA', 'SDA', 'i2c'], ['SCL', 'SCL', 'i2c']] },
    { id: 'veml', name: 'VEML7700', sub: 'I²C 0x10 · lux', side: 'R', pins: [['VIN', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SDA', 'SDA', 'i2c'], ['SCL', 'SCL', 'i2c']] },
    { id: 'led', name: 'RGB LED 0805', sub: '3× 220 Ω на платі', side: 'R', pins: [['R', 'RX', 'gpio'], ['G', 'TX', 'gpio'], ['B', 'D11', 'gpio'], ['K', 'GND', 'gnd']] },
    { id: 'bat', name: '16340 · 800 мАг', sub: 'з платою захисту · клеми', side: 'R', pins: [['+', 'BAT', 'pwr'], ['−', 'GND', 'gnd']] },
    { id: 'usb', name: 'USB-C на «спині»', sub: 'шлейф до плати', side: 'R', pins: [['USB', 'USB', 'gpio']] },
  ],
  ink: [
    { id: 'disp', name: 'E-ink 2.66″ 152×296', sub: 'SSD1680 · SPI', side: 'L', pins: [['VCC', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SCK', 'SCK', 'spi'], ['DIN', 'MOSI', 'spi'], ['CS', 'D10', 'spi'], ['DC', 'D9', 'gpio'], ['RST', 'D6', 'gpio'], ['BUSY', 'D5', 'gpio']] },
    { id: 'btn', name: 'Кнопка', sub: 'оновити / наступний екран', side: 'L', pins: [['SW', 'D11', 'gpio'], ['GND', 'GND', 'gnd']] },
    { id: 'led', name: 'RGB LED 0805', sub: '3× 220 Ω на платі', side: 'R', pins: [['R', 'A0', 'gpio'], ['G', 'A1', 'gpio'], ['B', 'A2', 'gpio'], ['K', 'GND', 'gnd']] },
    { id: 'bat', name: '16340 · 800 мАг', sub: 'з платою захисту · клеми', side: 'R', pins: [['+', 'BAT', 'pwr'], ['−', 'GND', 'gnd']] },
    { id: 'usb', name: 'USB-C на «спині»', sub: 'шлейф до плати', side: 'R', pins: [['USB', 'USB', 'gpio']] },
  ],
};
const EN = { 'MAX98357A + спікер 15 мм': 'MAX98357A + 15 mm speaker', 'PDM-мікрофон': 'PDM microphone', 'гіро + акселерометр': 'gyro + accel', '3× 220 Ω на платі': '3× 220 Ω on the board', 'з платою захисту · клеми': 'protected · spring clips', 'USB-C на «спині»': 'USB-C on the back', 'шлейф до плати': 'pigtail to the board', 'Кнопка': 'Button', 'оновити / наступний екран': 'refresh / next screen', '16340 · 800 мАг': '16340 · 800 mAh' };
const tr = (s, lang) => (lang === 'en' ? EN[s] ?? s : s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Таблиця пінів для розділу «Піни» — з тих самих даних
export function pinRows(kind) {
  const rows = [];
  for (const p of PERIPH[kind] || []) for (const [mp, bp] of p.pins) {
    const gp = [...MCU[kind].left, ...MCU[kind].right].find(x => x[0] === bp)?.[1];
    rows.push([p.name, mp, gp ? `${bp} (GPIO${gp})` : bp]);
  }
  return rows;
}

export function schematicSVG(kind, lang = 'uk') {
  const mcu = MCU[kind], per = PERIPH[kind]; if (!mcu) return '';
  const W = 960, PH = 16, mx = 380, mw = 200, my = 70, mh = 24 + Math.max(mcu.left.length, mcu.right.length) * PH + 12;
  const pinY = (side, name) => { const arr = side === 'L' ? mcu.left : mcu.right; const i = arr.findIndex(p => p[0] === name); return i < 0 ? null : my + 24 + i * PH + PH / 2; };
  let out = '', y = { L: 70, R: 70 };
  const boxes = [];
  for (const p of per) {
    const h = 26 + p.pins.length * PH + 6, x = p.side === 'L' ? 30 : W - 30 - 230, bw = 230;
    boxes.push({ ...p, x, y: y[p.side], h, bw });
    y[p.side] += h + 14;
  }
  const H = Math.max(y.L, y.R, my + mh) + 60;
  const lines = [], labels = [];
  // з'єднання. Живлення і I²C — шинами (вертикальні рейки з кожного боку плати), решта — окремими лініями з «коліном»
  const BUS = { L: { '3V3': mx - 44, 'GND': mx - 56, 'SDA': mx - 68, 'SCL': mx - 80 }, R: { '3V3': mx + mw + 44, 'GND': mx + mw + 56, 'SDA': mx + mw + 68, 'SCL': mx + mw + 80 } };
  const busUsed = { L: {}, R: {} };
  let jog = 0;
  const isBus = bp => ['3V3', 'GND', 'SDA', 'SCL'].includes(bp);
  for (const b of boxes) b.pins.forEach(([mp, bp, net], i) => {
    const py = b.y + 26 + i * PH + PH / 2;
    const fromX = b.side === 'L' ? b.x + b.bw : b.x;
    if (isBus(bp)) {
      const rx = BUS[b.side][bp]; const u = busUsed[b.side]; u[bp] = u[bp] ? { min: Math.min(u[bp].min, py), max: Math.max(u[bp].max, py) } : { min: py, max: py };
      lines.push(`<path d="M${fromX},${py} H${rx}" fill="none" stroke="${NET[net]}" stroke-width="1.4" opacity="${net === 'gnd' ? 0.6 : 0.9}"/><circle cx="${rx}" cy="${py}" r="2" fill="${NET[net]}"/>`);
      return;
    }
    const side = mcu.left.some(p => p[0] === bp) ? 'L' : 'R';
    const ty = pinY(side, bp); if (ty == null) return;
    const toX = side === 'L' ? mx : mx + mw;
    const k = (jog++ % 7);
    let d;
    if (b.side === side) { const midX = side === 'L' ? mx - 100 - k * 9 : mx + mw + 100 + k * 9; d = `M${fromX},${py} H${midX} V${ty} H${toX}`; }
    else { const by = my + mh + 16 + k * 6; const m1 = b.side === 'L' ? mx - 100 - k * 9 : mx + mw + 100 + k * 9; const m2 = side === 'L' ? mx - 100 - k * 9 : mx + mw + 100 + k * 9; d = `M${fromX},${py} H${m1} V${by} H${m2} V${ty} H${toX}`; }
    lines.push(`<path d="${d}" fill="none" stroke="${NET[net]}" stroke-width="${net === 'pwr' ? 1.8 : 1.2}" opacity="0.9"/>`);
  });
  // рейки шин: від піна плати до крайнього підключення
  for (const sd of ['L', 'R']) for (const bp of Object.keys(busUsed[sd])) {
    const rx = BUS[sd][bp], u = busUsed[sd][bp], net = bp === 'GND' ? 'gnd' : bp === '3V3' ? 'pwr' : 'i2c';
    const ty = pinY('L', bp), toX = mx;
    const top = Math.min(u.min, ty), bot = Math.max(u.max, ty);
    lines.push(`<path d="M${rx},${top} V${bot}" fill="none" stroke="${NET[net]}" stroke-width="2" opacity="${net === 'gnd' ? 0.6 : 0.9}"/>`);
    // до піна плати: ліва рейка — прямо; права — обхід над платою
    if (sd === 'L') lines.push(`<path d="M${rx},${ty} H${toX}" fill="none" stroke="${NET[net]}" stroke-width="2" opacity="${net === 'gnd' ? 0.6 : 0.9}"/>`);
    else { const oy = my - 8 - ({ '3V3': 0, 'GND': 6, 'SDA': 12, 'SCL': 18 }[bp]); lines.push(`<path d="M${rx},${Math.min(top, oy)} V${oy} H${BUS.L[bp]} V${ty} H${toX}" fill="none" stroke="${NET[net]}" stroke-width="2" opacity="${net === 'gnd' ? 0.6 : 0.9}"/>`); if (top > oy) lines.push(`<path d="M${rx},${oy} V${top}" fill="none" stroke="${NET[net]}" stroke-width="2" opacity="${net === 'gnd' ? 0.6 : 0.9}"/>`); }
    lines.push(`<text x="${rx + (sd === 'L' ? -4 : 4)}" y="${bot + 12}" font-size="8.5" fill="${NET[net]}" text-anchor="${sd === 'L' ? 'end' : 'start'}" font-family="Roboto Mono, monospace">${bp}</text>`);
  }
  // модулі
  for (const b of boxes) {
    out += `<g><rect x="${b.x}" y="${b.y}" width="${b.bw}" height="${b.h}" rx="10" fill="#fff" stroke="#E0E0E4"/>
      <text x="${b.x + 10}" y="${b.y + 15}" font-size="12" font-weight="600" fill="#121826">${esc(tr(b.name, lang))}</text>
      <text x="${b.x + 10}" y="${b.y + 26 - 3}" font-size="9.5" fill="#82828C">${esc(tr(b.sub, lang))}</text>`;
    b.pins.forEach(([mp, bp, net], i) => {
      const py = b.y + 26 + i * PH + PH / 2, px = b.side === 'L' ? b.x + b.bw - 8 : b.x + 8, anchor = b.side === 'L' ? 'end' : 'start';
      out += `<circle cx="${b.side === 'L' ? b.x + b.bw : b.x}" cy="${py}" r="2.2" fill="${NET[net]}"/><text x="${px}" y="${py + 3.5}" font-size="10" text-anchor="${anchor}" fill="#3A3A42" font-family="Roboto Mono, monospace">${esc(mp)}</text>`;
    });
    out += '</g>';
  }
  // плата
  out += `<g><rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="12" fill="#121826"/>
    <text x="${mx + mw / 2}" y="${my + 14}" font-size="12" font-weight="600" fill="#fff" text-anchor="middle">${esc(mcu.name)}</text>
    <text x="${mx + mw / 2}" y="${my + mh - 4}" font-size="8.5" fill="rgba(255,255,255,.55)" text-anchor="middle">${esc(mcu.sub)}</text>`;
  mcu.left.forEach(([n, g], i) => { const py = my + 24 + i * PH + PH / 2; out += `<rect x="${mx - 3}" y="${py - 4}" width="6" height="8" fill="#c9a227"/><text x="${mx + 10}" y="${py + 3.5}" font-size="10" fill="#fff" font-family="Roboto Mono, monospace">${n}</text><text x="${mx + 52}" y="${py + 3.5}" font-size="8.5" fill="rgba(255,255,255,.5)" font-family="Roboto Mono, monospace">${g ? 'GPIO' + g : ''}</text>`; });
  mcu.right.forEach(([n, g], i) => { const py = my + 24 + i * PH + PH / 2; out += `<rect x="${mx + mw - 3}" y="${py - 4}" width="6" height="8" fill="#c9a227"/><text x="${mx + mw - 10}" y="${py + 3.5}" font-size="10" fill="#fff" text-anchor="end" font-family="Roboto Mono, monospace">${n}</text><text x="${mx + mw - 52}" y="${py + 3.5}" font-size="8.5" fill="rgba(255,255,255,.5)" text-anchor="end" font-family="Roboto Mono, monospace">${g ? (g === 'C' ? '' : 'GPIO' + g) : ''}</text>`; });
  out += '</g>';
  // легенда
  const leg = Object.entries({ pwr: '3V3 / BAT', gnd: 'GND', qspi: kind === 'ink' ? 'SPI' : 'QSPI', i2c: 'I²C', i2s: 'I²S', pdm: 'PDM', gpio: 'GPIO' }).filter(([k]) => kind !== 'ink' || !['i2c', 'i2s', 'pdm'].includes(k));
  let lx = 30; const ly = H - 22;
  for (const [k, name] of leg) { out += `<line x1="${lx}" y1="${ly}" x2="${lx + 18}" y2="${ly}" stroke="${NET[k]}" stroke-width="2"/><text x="${lx + 24}" y="${ly + 3.5}" font-size="10" fill="#5A5A63">${name}</text>`; lx += 24 + name.length * 6.5 + 18; }
  out += `<text x="${W - 30}" y="${ly + 3.5}" font-size="9.5" fill="#82828C" text-anchor="end">${lang === 'uk' ? 'GPIO — орієнтовно; каркас = GND' : 'GPIO assignment is indicative; the frame is GND'}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="font-family:Inter,system-ui,sans-serif;background:#F5F5F7;border-radius:12px">${lines.join('')}${out}</svg>`;
}

// Блок-діаграма: пристрій ↔ хаб на ноуті ↔ джерела
export function blockSVG(kind, lang = 'uk') {
  const uk = lang === 'uk', W = 960, H = 400;
  const box = (x, y, w, h, title, sub, dark = false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${dark ? '#121826' : '#fff'}" stroke="${dark ? 'none' : '#E0E0E4'}"/><text x="${x + w / 2}" y="${y + 22}" font-size="${title.length > 18 ? 10.5 : 12.5}" font-weight="600" fill="${dark ? '#fff' : '#121826'}" text-anchor="middle">${esc(title)}</text><text x="${x + w / 2}" y="${y + 38}" font-size="10" fill="${dark ? 'rgba(255,255,255,.6)' : '#82828C'}" text-anchor="middle">${esc(sub)}</text>`;
  const arrow = (x1, y1, x2, y2, label, col = '#6b7280') => `<path d="M${x1},${y1} L${x2},${y2}" stroke="${col}" stroke-width="1.6" fill="none" marker-end="url(#a)"/>` + (label ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" font-size="9.5" fill="#5A5A63" text-anchor="middle">${esc(label)}</text>` : '');
  let o = `<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6b7280"/></marker></defs>`;
  // джерела → хаб → пристрій
  const src = uk ? [['Google Calendar', 'мітинги'], ['GitHub', 'PR · CI · коміти'], ['Claude Code hooks', 'стан · ліміти'], ['Open-Meteo', 'погода · AQI'], ['Wikipedia · курси', 'факт дня · валюти']] : [['Google Calendar', 'meetings'], ['GitHub', 'PR · CI · commits'], ['Claude Code hooks', 'state · limits'], ['Open-Meteo', 'weather · AQI'], ['Wikipedia · rates', 'fact · currencies']];
  src.forEach(([t, s], i) => { o += box(30, 30 + i * 68, 180, 52, t, s); o += arrow(210, 56 + i * 68, 270, 150 + (i - 2) * 6, ''); });
  o += box(270, 110, 210, 80, uk ? 'lander-hub на ноуті' : 'lander-hub on the laptop', uk ? 'один JSON ≤ 8 КБ · SSE-події' : 'one JSON ≤ 8 KB · SSE events', true);
  o += arrow(480, 150, 560, 150, '', '#2563eb'); o += `<text x="520" y="138" font-size="9" fill="#2563eb" text-anchor="middle">Wi-Fi</text><text x="520" y="166" font-size="8.5" fill="#5A5A63" text-anchor="middle">/state.json · /events</text>`;
  o += box(560, 100, 180, 100, MCU[kind].name, uk ? 'екрани · карусель · події' : 'screens · carousel · events', true);
  const per = kind === 'ink'
    ? (uk ? [['E-ink 2.66″', 'SPI'], ['RGB LED', '3× GPIO'], ['Кнопка', 'GPIO'], ['16340 + USB-C', 'BAT']] : [['E-ink 2.66″', 'SPI'], ['RGB LED', '3× GPIO'], ['Button', 'GPIO'], ['16340 + USB-C', 'BAT']])
    : (uk ? [['AMOLED + touch', 'QSPI · I²C'], ['RGB LED', '3× GPIO'], ['IMU · BME280 · VEML7700', 'I²C'], ['Мікрофон · спікер', 'PDM · I²S'], ['16340 + USB-C', 'BAT']] : [['AMOLED + touch', 'QSPI · I²C'], ['RGB LED', '3× GPIO'], ['IMU · BME280 · VEML7700', 'I²C'], ['Mic · speaker', 'PDM · I²S'], ['16340 + USB-C', 'BAT']]);
  per.forEach(([t, s], i) => { o += box(770, 30 + i * 68, 170, 52, t, s); o += arrow(740, 150 + (i - 2) * 6, 770, 56 + i * 68, ''); });
  o += `<text x="30" y="${H - 40}" font-size="10.5" fill="#5A5A63">${uk ? 'Токени лишаються на ноуті; пристрій не зберігає секретів. Ноут закрився → «offline · N хв тому», кеш, час і погода — напряму.' : 'Tokens stay on the laptop; the device stores no secrets. Laptop closed → “offline · N min ago”, cache, time and weather fetched directly.'}</text>`;
  o += `<text x="30" y="${H - 22}" font-size="10.5" fill="#5A5A63">${uk ? 'Прошивка: тонка, однакова для AMOLED і e-ink — лише «намалюй екран із JSON».' : 'Firmware: thin, identical for AMOLED and e-ink — just “draw a screen from JSON”.'}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="font-family:Inter,system-ui,sans-serif;background:#F5F5F7;border-radius:12px">${o}</svg>`;
}
