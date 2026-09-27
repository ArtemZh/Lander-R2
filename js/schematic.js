// Схема з'єднань і блок-діаграма Lander R2 — генеруються як SVG з тих самих даних, що й таблиця пінів.
// Touch: Waveshare ESP32-S3-Touch-AMOLED-1.91 — GPIO дисплея/тача/IMU за офіційними таблицями Waveshare (Display Control, Touch Control, розпіновка гребінки).
// Ink: ESP32-C6 Feather #5933 — за pins_arduino.h Adafruit/Espressif. Призначення зовнішніх модулів — наше, орієнтовне.
const NET = { pwr: '#EA5212', gnd: '#121826', qspi: '#2563eb', spi: '#2563eb', i2c: '#16a34a', i2s: '#7c3aed', pdm: '#d97706', gpio: '#6b7280' };

// Плата: [мітка, GPIO] у порядку зверху вниз, ліва і права сторони
const MCU = {
  // Waveshare ESP32-S3-Touch-AMOLED-1.91: дисплей, тач і IMU уже на платі (права колонка — внутрішні лінії, за таблицями Waveshare);
  // зовнішні модулі — на вільні GPIO гребінки (ліва колонка). GP1 = BAT_ADC, GP0 = Boot — не беремо.
  touch: { name: 'ESP32-S3-Touch-AMOLED-1.91', sub: 'Waveshare · ESP32-S3R8 · 16 MB flash · 8 MB PSRAM',
    left: [['3V3', ''], ['GND', ''], ['SDA', '40'], ['SCL', '39'], ['GP12', '12'], ['GP13', '13'], ['GP14', '14'], ['GP15', '15'], ['GP21', '21'], ['GP2', '2'], ['GP3', '3'], ['GP4', '4'], ['BAT', ''], ['USB', 'C']],
    right: [['QSPI_SCK', '47'], ['QSPI_CS', '6'], ['QSPI_D0', '18'], ['QSPI_D1', '7'], ['QSPI_D2', '48'], ['QSPI_D3', '5'], ['TP_INT', '41'], ['RESET', '17'], ['TE', '16'], ['IMU_INT1', '45'], ['IMU_INT2', '46'], ['SD_CS', '9']] },
  ink: { name: 'ESP32-C6 Feather', sub: 'Adafruit #5933 · Wi-Fi 6 / BLE · deep sleep',
    // C6 Feather не має D5–D13: цифрові піни підписані номером IO (IO0, IO5–IO9, IO12, IO15). IO9 = Boot + NeoPixel, IO15 = LED/strap — не беремо.
    left: [['3V3', ''], ['GND', ''], ['SCK', '21'], ['MOSI', '22'], ['IO7', '7'], ['IO8', '8'], ['IO0', '0'], ['A3', '5'], ['A2', '6']],
    right: [['BAT', ''], ['USB', 'C'], ['A0', '1'], ['A1', '4'], ['A4', '3']] },
};
// Периферія: { id, назва, підпис, сторона, піни: [[пін модуля, пін плати, мережа]] }
const PERIPH = {
  touch: [
    { id: 'disp', name: 'AMOLED 1.91″ 240×536 (на платі)', sub: 'RM67162 · QSPI · внутрішні лінії', side: 'R', pins: [['QSPI_SCK', 'QSPI_SCK', 'qspi'], ['QSPI_CS', 'QSPI_CS', 'qspi'], ['QSPI_D0', 'QSPI_D0', 'qspi'], ['QSPI_D1', 'QSPI_D1', 'qspi'], ['QSPI_D2', 'QSPI_D2', 'qspi'], ['QSPI_D3', 'QSPI_D3', 'qspi'], ['RESET', 'RESET', 'gpio'], ['TE', 'TE', 'gpio']] },
    { id: 'tp', name: 'Тач FT3168 (на платі)', sub: 'I²C · внутрішні лінії', side: 'R', pins: [['TP_SDA', 'SDA', 'i2c'], ['TP_SCL', 'SCL', 'i2c'], ['TP_INT', 'TP_INT', 'gpio']] },
    { id: 'imu', name: 'IMU QMI8658 (на платі)', sub: 'I²C · гіро + акселерометр', side: 'R', pins: [['SDA', 'SDA', 'i2c'], ['SCL', 'SCL', 'i2c'], ['INT1', 'IMU_INT1', 'gpio'], ['INT2', 'IMU_INT2', 'gpio']] },
    { id: 'sd', name: 'Слот TF (на платі)', sub: 'SPI · фон/аудіо-кліпи', side: 'R', pins: [['SD_CS', 'SD_CS', 'spi']] },
    { id: 'amp', name: 'MAX98357A + спікер 15 мм', sub: 'I²S · 3 W', side: 'L', pins: [['VIN', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['BCLK', 'GP12', 'i2s'], ['LRC', 'GP13', 'i2s'], ['DIN', 'GP14', 'i2s']] },
    { id: 'mic', name: 'PDM-мікрофон', sub: 'MP34DT05', side: 'L', pins: [['3V', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SEL', 'GND', 'gnd'], ['CLK', 'GP15', 'pdm'], ['DAT', 'GP21', 'pdm']] },
    { id: 'bme', name: 'BME280', sub: 'I²C 0x77 (Adafruit) · T / RH / P', side: 'L', pins: [['VIN', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SDA', 'SDA', 'i2c'], ['SCL', 'SCL', 'i2c']] },
    { id: 'veml', name: 'VEML7700', sub: 'I²C 0x10 · lux', side: 'L', pins: [['VIN', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['SDA', 'SDA', 'i2c'], ['SCL', 'SCL', 'i2c']] },
    { id: 'led', name: 'RGB LED 0805', sub: '3× 220 Ω на платі', side: 'L', pins: [['R', 'GP2', 'gpio'], ['G', 'GP3', 'gpio'], ['B', 'GP4', 'gpio'], ['K', 'GND', 'gnd']] },
    { id: 'bat', name: '16340 · 800 мАг', sub: 'з платою захисту · клеми → роз’єм BAT', side: 'L', pins: [['+', 'BAT', 'pwr'], ['−', 'GND', 'gnd']] },
    { id: 'usb', name: 'USB-C на «спині»', sub: 'шлейф до USB-C плати', side: 'L', pins: [['USB', 'USB', 'gpio']] },
  ],
  ink: [
    { id: 'disp', name: 'E-ink 2.66″ 152×296', sub: 'SSD1680 · SPI', side: 'L', pins: [['VCC', '3V3', 'pwr'], ['GND', 'GND', 'gnd'], ['CLK', 'SCK', 'spi'], ['DIN', 'MOSI', 'spi'], ['CS', 'IO7', 'spi'], ['DC', 'IO8', 'gpio'], ['RST', 'IO0', 'gpio'], ['BUSY', 'A3', 'gpio']] },
    { id: 'btn', name: 'Кнопка', sub: 'оновити / наступний екран', side: 'L', pins: [['SW', 'A2', 'gpio'], ['GND', 'GND', 'gnd']] },
    { id: 'led', name: 'RGB LED 0805', sub: '3× 220 Ω на платі', side: 'R', pins: [['R', 'A0', 'gpio'], ['G', 'A1', 'gpio'], ['B', 'A4', 'gpio'], ['K', 'GND', 'gnd']] },
    { id: 'bat', name: '16340 · 800 мАг', sub: 'з платою захисту · клеми', side: 'R', pins: [['+', 'BAT', 'pwr'], ['−', 'GND', 'gnd']] },
    { id: 'usb', name: 'USB-C на «спині»', sub: 'шлейф до плати', side: 'R', pins: [['USB', 'USB', 'gpio']] },
  ],
};
const EN = { 'AMOLED 1.91″ 240×536 (на платі)': 'AMOLED 1.91″ 240×536 (on-board)', 'RM67162 · QSPI · внутрішні лінії': 'RM67162 · QSPI · internal lines', 'Тач FT3168 (на платі)': 'Touch FT3168 (on-board)', 'I²C · внутрішні лінії': 'I²C · internal lines', 'IMU QMI8658 (на платі)': 'IMU QMI8658 (on-board)', 'I²C · гіро + акселерометр': 'I²C · gyro + accel', 'Слот TF (на платі)': 'TF slot (on-board)', 'SPI · фон/аудіо-кліпи': 'SPI · backgrounds/audio clips', 'з платою захисту · клеми → роз’єм BAT': 'protected · clips → BAT header', 'шлейф до USB-C плати': 'pigtail to the board USB-C', 'MAX98357A + спікер 15 мм': 'MAX98357A + 15 mm speaker', 'PDM-мікрофон': 'PDM microphone', 'гіро + акселерометр': 'gyro + accel', '3× 220 Ω на платі': '3× 220 Ω on the board', 'з платою захисту · клеми': 'protected · spring clips', 'USB-C на «спині»': 'USB-C on the back', 'шлейф до плати': 'pigtail to the board', 'Кнопка': 'Button', 'оновити / наступний екран': 'refresh / next screen', '16340 · 800 мАг': '16340 · 800 mAh' };
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

// Розводка «мітками мереж»: замість довгих ліній через усю схему кожен пін модуля має кольорову мітку з піном плати
// (як net label у KiCad) — без перетинів ліній і тексту. Пади плати пофарбовані за мережею і підписані, куди йдуть.
export function schematicSVG(kind, lang = 'uk') {
  const mcu = MCU[kind], per = PERIPH[kind]; if (!mcu) return '';
  const W = 960, PH = 18, BW = 270, mx = 345, mw = 270, my = 40;
  const gpioOf = bp => [...mcu.left, ...mcu.right].find(x => x[0] === bp)?.[1];
  const tag = (x, y, text, net, anchor) => {
    const w = text.length * 6.1 + 10, x0 = anchor === 'end' ? x - w : x;
    return `<rect x="${x0}" y="${y - 7}" width="${w}" height="14" rx="7" fill="${NET[net]}" opacity="${net === 'gnd' ? 0.85 : 1}"/><text x="${x0 + w / 2}" y="${y + 3.5}" font-size="9.5" fill="#fff" text-anchor="middle" font-family="Roboto Mono, monospace">${esc(text)}</text>`;
  };
  // хто підключений до кожного піна плати
  const users = {};
  for (const p of per) for (const [mp, bp, net] of p.pins) (users[bp] ||= { net, who: [] }).who.push(p.id);
  let out = '', y = { L: my, R: my };
  for (const p of per) {
    const h = 34 + p.pins.length * PH + 6, x = p.side === 'L' ? 20 : W - 20 - BW, by = y[p.side];
    y[p.side] += h + 12;
    out += `<g><rect x="${x}" y="${by}" width="${BW}" height="${h}" rx="10" fill="#fff" stroke="#E0E0E4"/>
      <text x="${x + 12}" y="${by + 17}" font-size="12" font-weight="600" fill="#121826">${esc(tr(p.name, lang))}</text>
      <text x="${x + 12}" y="${by + 30}" font-size="9.5" fill="#82828C">${esc(tr(p.sub, lang))}</text>`;
    p.pins.forEach(([mp, bp, net], i) => {
      const py = by + 34 + i * PH + PH / 2, g = gpioOf(bp);
      const label = g && g !== 'C' && bp !== 'IO' + g ? `${bp} · IO${g}` : bp;
      out += `<circle cx="${x + 14}" cy="${py}" r="2.6" fill="${NET[net]}"/><text x="${x + 22}" y="${py + 3.5}" font-size="10" fill="#3A3A42" font-family="Roboto Mono, monospace">${esc(mp)}</text>`;
      out += `<line x1="${x + 70}" y1="${py}" x2="${x + BW - 14 - (label.length * 6.1 + 10)}" y2="${py}" stroke="${NET[net]}" stroke-width="1.2" stroke-dasharray="2 3" opacity=".6"/>`;
      out += tag(x + BW - 12, py, label, net, 'end');
    });
    out += '</g>';
  }
  // плата
  const rows = Math.max(mcu.left.length, mcu.right.length), mh = 44 + rows * PH + 26;
  out += `<g><rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="12" fill="#121826"/>
    <text x="${mx + mw / 2}" y="${my + 20}" font-size="13" font-weight="600" fill="#fff" text-anchor="middle">${esc(mcu.name)}</text>
    <text x="${mx + mw / 2}" y="${my + mh - 10}" font-size="9" fill="rgba(255,255,255,.55)" text-anchor="middle">${esc(mcu.sub)}</text>`;
  const pad = (side, [n, g], i) => {
    const py = my + 44 + i * PH + PH / 2, u = users[n], col = u ? NET[u.net] : '#4B5563', L = side === 'L';
    const px = L ? mx : mx + mw;
    out += `<rect x="${px - 4}" y="${py - 5}" width="8" height="10" rx="1.5" fill="${u ? col : '#c9a227'}" stroke="#121826" stroke-width="1"/>`;
    out += `<text x="${L ? mx + 12 : mx + mw - 12}" y="${py + 3.5}" font-size="10" font-weight="600" fill="${u ? '#fff' : 'rgba(255,255,255,.45)'}" text-anchor="${L ? 'start' : 'end'}" font-family="Roboto Mono, monospace">${esc(n)}</text>`;
    const off = Math.max(58, n.length * 6.4 + 20);
    if (g && g !== 'C') out += `<text x="${L ? mx + off : mx + mw - off}" y="${py + 3.5}" font-size="8.5" fill="rgba(255,255,255,.5)" text-anchor="${L ? 'start' : 'end'}" font-family="Roboto Mono, monospace">IO${g}</text>`;
  };
  mcu.left.forEach((p, i) => pad('L', p, i));
  mcu.right.forEach((p, i) => pad('R', p, i));
  out += '</g>';
  const H = Math.max(y.L, y.R, my + mh + 12) + 44;
  // легенда
  const leg = Object.entries({ pwr: '3V3 / BAT', gnd: 'GND', qspi: kind === 'ink' ? 'SPI' : 'QSPI', i2c: 'I²C', i2s: 'I²S', pdm: 'PDM', gpio: 'GPIO' }).filter(([k]) => kind !== 'ink' || !['i2c', 'i2s', 'pdm'].includes(k));
  let lx = 20; const ly = H - 22;
  for (const [k, name] of leg) { out += `<rect x="${lx}" y="${ly - 5}" width="18" height="10" rx="5" fill="${NET[k]}"/><text x="${lx + 24}" y="${ly + 3.5}" font-size="10" fill="#5A5A63">${name}</text>`; lx += 24 + name.length * 6.5 + 16; }
  out += `<text x="${W - 20}" y="${ly + 3.5}" font-size="9.5" fill="#82828C" text-anchor="end">${lang === 'uk' ? 'Мітка = пін плати · IO = GPIO · призначення орієнтовне; каркас = GND' : 'Tag = board pin · IO = GPIO · assignment is indicative; the frame is GND'}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="font-family:Inter,system-ui,sans-serif;background:#F5F5F7;border-radius:12px">${out}</svg>`;
}

// Блок-діаграма: пристрій ↔ хаб на ноуті ↔ джерела
export function blockSVG(kind, lang = 'uk') {
  const uk = lang === 'uk', W = 960, H = 440;
  const box = (x, y, w, h, title, sub, dark = false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${dark ? '#121826' : '#fff'}" stroke="${dark ? 'none' : '#E0E0E4'}"/><text x="${x + w / 2}" y="${y + 22}" font-size="${Math.min(12.5, (w - 18) / (title.length * 0.64)).toFixed(1)}" font-weight="600" fill="${dark ? '#fff' : '#121826'}" text-anchor="middle">${esc(title)}</text><text x="${x + w / 2}" y="${y + 38}" font-size="10" fill="${dark ? 'rgba(255,255,255,.6)' : '#82828C'}" text-anchor="middle">${esc(sub)}</text>`;
  const arrow = (x1, y1, x2, y2, label, col = '#6b7280') => `<path d="M${x1},${y1} L${x2},${y2}" stroke="${col}" stroke-width="1.6" fill="none" marker-end="url(#a)"/>` + (label ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" font-size="9.5" fill="#5A5A63" text-anchor="middle">${esc(label)}</text>` : '');
  let o = `<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6b7280"/></marker></defs>`;
  // джерела → хаб → пристрій
  const src = uk ? [['Google Calendar', 'мітинги'], ['GitHub', 'PR · CI · коміти'], ['Claude Code hooks', 'стан · ліміти'], ['Open-Meteo', 'погода · AQI'], ['Wikipedia · курси', 'факт дня · валюти']] : [['Google Calendar', 'meetings'], ['GitHub', 'PR · CI · commits'], ['Claude Code hooks', 'state · limits'], ['Open-Meteo', 'weather · AQI'], ['Wikipedia · rates', 'fact · currencies']];
  src.forEach(([t, s], i) => { o += box(30, 30 + i * 68, 180, 52, t, s); o += arrow(210, 56 + i * 68, 270, 150 + (i - 2) * 6, ''); });
  o += box(270, 110, 190, 80, uk ? 'lander-hub на ноуті' : 'lander-hub on the laptop', uk ? 'один JSON ≤ 8 КБ · SSE-події' : 'one JSON ≤ 8 KB · SSE events', true);
  o += arrow(460, 150, 590, 150, '', '#2563eb'); o += `<text x="525" y="138" font-size="9" fill="#2563eb" text-anchor="middle">Wi-Fi</text><text x="525" y="166" font-size="8.5" fill="#5A5A63" text-anchor="middle">/state.json · /events</text>`;
  o += box(590, 110, 160, 80, MCU[kind].name, uk ? 'екрани · карусель · події' : 'screens · carousel · events', true);
  const per = kind === 'ink'
    ? (uk ? [['E-ink 2.66″', 'SPI'], ['RGB LED', '3× GPIO'], ['Кнопка', 'GPIO'], ['16340 + USB-C', 'BAT']] : [['E-ink 2.66″', 'SPI'], ['RGB LED', '3× GPIO'], ['Button', 'GPIO'], ['16340 + USB-C', 'BAT']])
    : (uk ? [['AMOLED + тач + IMU', 'на платі'], ['RGB LED', '3× GPIO'], ['BME280 · VEML7700', 'I²C'], ['Мікрофон · спікер', 'PDM · I²S'], ['16340 + USB-C', 'BAT']] : [['AMOLED + touch + IMU', 'on-board'], ['RGB LED', '3× GPIO'], ['BME280 · VEML7700', 'I²C'], ['Mic · speaker', 'PDM · I²S'], ['16340 + USB-C', 'BAT']]);
  per.forEach(([t, s], i) => { o += box(790, 30 + i * 68, 150, 52, t, s); o += arrow(750, 150 + (i - 2) * 6, 790, 56 + i * 68, ''); });
  o += `<text x="30" y="${H - 40}" font-size="10.5" fill="#5A5A63">${uk ? 'Токени лишаються на ноуті; пристрій не зберігає секретів. Ноут закрився → «offline · N хв тому», кеш, час і погода — напряму.' : 'Tokens stay on the laptop; the device stores no secrets. Laptop closed → “offline · N min ago”, cache, time and weather fetched directly.'}</text>`;
  o += `<text x="30" y="${H - 22}" font-size="10.5" fill="#5A5A63">${uk ? 'Прошивка: тонка, однакова для AMOLED і e-ink — лише «намалюй екран із JSON».' : 'Firmware: thin, identical for AMOLED and e-ink — just “draw a screen from JSON”.'}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="font-family:Inter,system-ui,sans-serif;background:#F5F5F7;border-radius:12px">${o}</svg>`;
}

// Джерела документації по компонентах: [компонент, для яких kind, URL офіційної сторінки, URL другого джерела, статус перевірки]
export const SOURCES = [
  ['ESP32-S3-Touch-AMOLED-1.91 (Waveshare) — плата + AMOLED + тач + IMU', 'touch', 'https://www.waveshare.com/wiki/ESP32-S3-Touch-AMOLED-1.91', 'https://www.waveshare.com/esp32-s3-touch-amoled-1.91.htm', 'ok'],
  ['ESP32-C6 Feather (Adafruit #5933)', 'ink', 'https://learn.adafruit.com/adafruit-esp32-c6-feather/pinouts', 'https://github.com/espressif/arduino-esp32/blob/master/variants/adafruit_feather_esp32c6/pins_arduino.h', 'ok'],
  ['E-ink 2.66″ 152×296 · SSD1680', 'ink', 'https://www.waveshare.com/wiki/2.66inch_e-Paper_Module', 'https://www.waveshare.com/2.66inch-e-paper-module.htm', 'partial'],
  ['MAX98357A I²S amp', 'touch', 'https://learn.adafruit.com/adafruit-max98357-i2s-class-d-mono-amp/pinouts', 'https://www.analog.com/en/products/max98357a.html', 'memory'],
  ['BME280 · T / RH / P', 'touch', 'https://learn.adafruit.com/adafruit-bme280-humidity-barometric-pressure-temperature-sensor-breakout/pinouts', 'https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/', 'memory'],
  ['VEML7700 lux', 'touch', 'https://learn.adafruit.com/adafruit-veml7700/pinouts', 'https://www.vishay.com/en/product/84286/', 'memory'],
  ['PDM-мікрофон MP34DT05', 'touch', 'https://learn.adafruit.com/adafruit-pdm-microphone-breakout/pinouts', 'https://www.st.com/en/mems-and-sensors/mp34dt05-a.html', 'memory'],
  ['16340 Li-ion з захистом · клеми', 'touch,ink', 'https://learn.adafruit.com/li-ion-and-lipoly-batteries/protection-circuitry', '', 'memory'],
];
