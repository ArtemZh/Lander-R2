// Дані трьох версій (тексти двомовні: {uk, en})
export const VERSIONS = ['original', 'touch', 'ink'];

export const STEPS = {
  chassis: { uk: ['Шасі', 'Внутрішня рамка з латунного дроту 20 AWG — скелет, до якого кріпиться все інше.'], en: ['Chassis', 'Inner frame of 20 AWG brass wire — the skeleton everything else attaches to.'] },
  board: {
    original: { uk: ['Плата Photon 2', 'Particle Photon 2 ставиться всередину рамки, USB-C дивиться вниз.'], en: ['Photon 2 board', 'Particle Photon 2 sits inside the frame, USB-C facing down.'] },
    touch: { uk: ['Плата ESP32-S3', 'ESP32-S3 Feather з 8 MB PSRAM — вистачає на буфер кадру AMOLED.'], en: ['ESP32-S3 board', 'ESP32-S3 Feather with 8 MB PSRAM — enough for an AMOLED frame buffer.'] },
    ink: { uk: ['Плата ESP32-C6', 'ESP32-C6 Feather — низьке споживання в deep sleep.'], en: ['ESP32-C6 board', 'ESP32-C6 Feather — low deep-sleep current.'] },
  },
  display: {
    original: { uk: ['Дисплей', 'TFT 1.9″ 170×320 ST7789 припаюється прямо до дротяних шин.'], en: ['Display', '1.9″ 170×320 ST7789 TFT is soldered straight onto the wire bus.'] },
    touch: { uk: ['Дисплей', 'AMOLED 1.91″ 240×536 (RM67162, QSPI) з ємнісним тачем FT3168 — сторінки гортаються свайпом.'], en: ['Display', '1.91″ 240×536 AMOLED (RM67162, QSPI) with FT3168 capacitive touch — swipe between pages.'] },
    ink: { uk: ['Дисплей', 'E-ink 2.66″ 152×296 (SSD1680), активна зона 30×59 мм — рівно в каркас, тримає картинку без живлення.'], en: ['Display', '2.66″ 152×296 e-ink (SSD1680), 30×59 mm active area — fits the frame exactly, keeps the image without power.'] },
  },
  shell: { uk: ['Шкаралупа', 'Зовнішня прямокутна клітка ≈30×32×60 мм замикає корпус.'], en: ['Shell', 'Outer rectangular cage ≈30×32×60 mm closes the body.'] },
  audio: {
    original: { uk: ['Мікрофон і бузер', 'PDM-мікрофон (синя плата) збоку, п’єзобузер з іншого боку.'], en: ['Mic & buzzer', 'PDM mic (blue board) on one side, piezo buzzer on the other.'] },
    touch: { uk: ['Сенсори і звук', 'PDM-мікрофон, IMU LSM6DSOX (гіроскоп+акселерометр), BME280 (температура/вологість/тиск), датчик світла VEML7700 і мініспікер 15 мм через MAX98357A.'], en: ['Sensors & audio', 'PDM mic, LSM6DSOX IMU (gyro+accel), BME280 (temp/humidity/pressure), VEML7700 light sensor and a 15 mm mini speaker via MAX98357A.'] },
    ink: { uk: ['Без звуку', 'У e-ink версії немає ні бузера, ні мікрофона — крок пропускається.'], en: ['No audio', 'The e-ink build has no buzzer or mic — this step is skipped.'] },
  },
  pack: {
    original: { uk: ['Рюкзак і батарея', 'Клітка-рюкзак ззаду тримає батарею 14250 (300 мАг) і вимикач.'], en: ['Backpack & battery', 'Rear cage holds the 14250 cell (300 mAh) and the power switch.'] },
    touch: { uk: ['Рюкзак і батарея', 'Та сама «бочка», але 16340 (Ø16×34, 800 мАг) — ~6 год; клітка трохи ширша.'], en: ['Backpack & battery', 'Same “barrel” but a 16340 (Ø16×34, 800 mAh) — ~6 h; the cage is slightly wider.'] },
    ink: { uk: ['Рюкзак і батарея', 'Клітка-рюкзак ззаду тримає батарею 14250 і вимикач — на тижні роботи.'], en: ['Backpack & battery', 'Rear cage holds the 14250 cell and the switch — weeks of runtime.'] },
  },
  antenna: { uk: ['Антена', 'Дротяна антена 60 мм з RGB LED на кінці — показує стан Claude Code: зелений — працює, червоний — чекає відповіді, помаранчевий — простій.'], en: ['Antenna', '60 mm wire antenna with an RGB LED on top — shows Claude Code state: green working, red waiting for an answer, orange idle.'] },
  legs: { uk: ['Ноги', 'Чотири ноги — подвійні стійки з поперечками й розкосами.'], en: ['Legs', 'Four legs — double struts with cross-bars and braces.'] },
  pads: { uk: ['Посадкові диски', 'Диски Ø14 мм на кінцях ніг — як у справжнього посадкового модуля.'], en: ['Landing pads', 'Ø14 mm pads on the feet — just like a real lander.'] },
};

export const PARTS = {
  original: [
    ['board', 'Particle Photon 2', 'Particle Photon 2', 1],
    ['display', 'TFT 1.9″ 170×320 ST7789 (Adafruit)', 'TFT 1.9″ 170×320 ST7789 (Adafruit)', 1],
    ['audio', 'PDM-мікрофон + п’єзобузер', 'PDM mic + piezo buzzer', 2],
    ['pack', 'Батарея LiFePO4/Li-ion 14250 + вимикач', '14250 cell + slide switch', 2],
    ['antenna', 'RGB LED 0805 + 3× резистор 220 Ω', 'RGB LED 0805 + 3× 220 Ω resistors', 1],
    ['chassis', 'Латунний дріт 20 AWG (≈0.8 мм)', 'Brass wire 20 AWG (≈0.8 mm)', '~3 м'],
    ['shell', 'Латунний дріт 20 AWG — шкаралупа', 'Brass wire 20 AWG — shell', '—'],
    ['legs', 'Латунний дріт — ноги', 'Brass wire — legs', 4],
    ['pads', 'Латунні диски Ø14 мм', 'Brass discs Ø14 mm', 4],
  ],
  touch: [
    ['board', 'ESP32-S3 Feather (8 MB PSRAM)', 'ESP32-S3 Feather (8 MB PSRAM)', 1],
    ['display', 'AMOLED 1.91″ 240×536 + тач (RM67162 / FT3168)', '1.91″ 240×536 AMOLED + touch (RM67162 / FT3168)', 1],
    ['audio', 'PDM-мікрофон, IMU LSM6DSOX, BME280, VEML7700, MAX98357A + спікер 15 мм', 'PDM mic, LSM6DSOX IMU, BME280, VEML7700, MAX98357A + 15 mm speaker', 6],
    ['pack', 'Батарея 16340 (800 мАг) + вимикач', '16340 cell (800 mAh) + switch', 2],
    ['antenna', 'RGB LED 0805 + 3× 220 Ω', 'RGB LED 0805 + 3× 220 Ω', 1],
    ['chassis', 'Латунний дріт 20 AWG', 'Brass wire 20 AWG', '~3 м'],
    ['shell', 'Латунний дріт — шкаралупа', 'Brass wire — shell', '—'],
    ['legs', 'Латунний дріт — ноги', 'Brass wire — legs', 4],
    ['pads', 'Латунні диски Ø14 мм', 'Brass discs Ø14 mm', 4],
  ],
  ink: [
    ['board', 'ESP32-C6 Feather', 'ESP32-C6 Feather', 1],
    ['display', 'E-ink 2.66″ 152×296 (SSD1680)', '2.66″ 152×296 e-ink (SSD1680)', 1],
    ['pack', 'Батарея 14250 + вимикач', '14250 cell + switch', 2],
    ['antenna', 'RGB LED 0805 + 3× 220 Ω', 'RGB LED 0805 + 3× 220 Ω', 1],
    ['chassis', 'Латунний дріт 20 AWG', 'Brass wire 20 AWG', '~3 м'],
    ['shell', 'Латунний дріт — шкаралупа', 'Brass wire — shell', '—'],
    ['legs', 'Латунний дріт — ноги', 'Brass wire — legs', 4],
    ['pads', 'Латунні диски Ø14 мм', 'Brass discs Ø14 mm', 4],
  ],
};

// [модуль, пін модуля, пін плати]; '—' = не підключати
export const PINS = {
  original: [
    ['Display', 'GND', 'GND'], ['Display', 'VCC', '3V3'], ['Display', 'SCK', 'SCK'], ['Display', 'MOSI', 'MOSI'],
    ['Display', 'RST', 'D4'], ['Display', 'DC', 'D5'], ['Display', 'TCS', 'D3'], ['Display', 'SDCS', 'D6'], ['Display', 'Lite / MISO', '—'],
    ['PDM Mic', 'VIN', '3V3'], ['PDM Mic', 'GND', 'GND'], ['PDM Mic', 'DATA', 'A1'], ['PDM Mic', 'CLK', 'A0'], ['PDM Mic', 'SEL', '—'],
    ['Buzzer', '+', 'D1'], ['Buzzer', '−', 'GND'],
    ['Battery', '+', 'Li+ (via switch)'], ['Battery', '−', 'GND'],
    ['RGB LED (3×220 Ω)', 'R / G / B', 'RX / D0 / D2'],
  ],
  touch: [
    ['AMOLED (QSPI)', 'GND / VCC', 'GND / 3V3'], ['AMOLED (QSPI)', 'CLK', 'GPIO36'], ['AMOLED (QSPI)', 'D0–D3', 'GPIO35, 37, 38, 39'],
    ['AMOLED (QSPI)', 'CS', 'GPIO10'], ['AMOLED (QSPI)', 'RST', 'GPIO9'],
    ['Touch (I2C)', 'SDA / SCL', 'GPIO3 / GPIO4'], ['Touch (I2C)', 'INT', 'GPIO5'],
    ['I2S amp MAX98357A', 'BCLK / LRC / DIN', 'GPIO12 / GPIO11 / GPIO13'],
    ['PDM Mic', 'CLK / DATA', 'GPIO41 / GPIO42'],
    ['IMU LSM6DSOX (I2C)', 'SDA / SCL / INT1', 'GPIO3 / GPIO4 / GPIO6'],
    ['BME280 (I2C)', 'SDA / SCL', 'GPIO3 / GPIO4'],
    ['VEML7700 (I2C)', 'SDA / SCL', 'GPIO3 / GPIO4'],
    ['Battery', '+', 'BAT (via switch)'], ['Battery', '−', 'GND'],
    ['RGB LED (3×220 Ω)', 'R / G / B', 'GPIO14 / GPIO15 / GPIO16'],
  ],
  ink: [
    ['E-ink (SPI)', 'GND / VCC', 'GND / 3V3'], ['E-ink (SPI)', 'SCK', 'SCK (GPIO21)'], ['E-ink (SPI)', 'MOSI', 'MOSI (GPIO22)'],
    ['E-ink (SPI)', 'CS', 'GPIO5'], ['E-ink (SPI)', 'DC', 'GPIO6'], ['E-ink (SPI)', 'RST', 'GPIO7'], ['E-ink (SPI)', 'BUSY', 'GPIO8'],
    ['Battery', '+', 'BAT (via switch)'], ['Battery', '−', 'GND'],
    ['RGB LED (3×220 Ω)', 'R / G / B', 'GPIO15 / GPIO16 / GPIO17'],
  ],
};

export const DIFFS = {
  original: { uk: ['Оригінальна збірка Mohit Bhoite.', 'Кольоровий TFT, PDM-мікрофон, бузер.', 'Живлення від 14250 — години, не дні.'], en: ['Mohit Bhoite’s original build.', 'Colour TFT, PDM mic, buzzer.', '14250 cell lasts hours, not days.'] },
  touch: { uk: ['AMOLED 240×536 (~300 dpi), свайп сторінок і налаштування на екрані.', 'IMU: стук — перегорнути, нахил — горизонт, догори дном — сон; BME280 — локальна погода й барометр; VEML7700 — автояскравість.', 'Мікрофон + мініспікер I2S; батарея 16340 на ~6 год.'], en: ['240×536 AMOLED (~300 dpi), swipe pages and on-screen settings.', 'IMU: tap to flip pages, tilt for a horizon, face-down to sleep; BME280 for local weather and barometer; VEML7700 for auto-brightness.', 'Mic + I2S mini speaker; 16340 cell for ~6 h.'] },
  ink: { uk: ['E-ink 2.66″ 152×296 — рівно в каркас, читабельний.', 'Deep sleep, оновлення раз на 10 хв; тижні від 14250.', 'Без бузера й мікрофона.'], en: ['2.66″ 152×296 e-ink — fits the frame, readable.', 'Deep sleep, refresh every 10 min; weeks on a 14250.', 'No buzzer or mic.'] },
};

// Рядки порівняння: [мітка uk, мітка en, original, touch, ink] (значення — рядок або {uk,en})
export const COMPARE = [
  ['Екран', 'Screen', 'TFT 1.9″ 170×320 (~190 dpi)', 'AMOLED 1.91″ 240×536 + touch (~300 dpi)', 'E-ink 2.66″ 152×296 (~128 dpi)'],
  ['Контролер', 'Controller', 'Particle Photon 2', 'ESP32-S3 Feather', 'ESP32-C6 Feather'],
  ['RAM / Flash', 'RAM / Flash', '3 MB / 2 MB', '512 KB + 8 MB PSRAM / 8 MB', '512 KB / 4 MB'],
  ['Сенсори', 'Sensors', { uk: 'PDM-мікрофон', en: 'PDM mic' }, { uk: 'мікрофон, IMU, BME280, світло', en: 'mic, IMU, BME280, light' }, '—'],
  ['Батарея', 'Battery', '14250 · 300 мАг', '16340 · 800 мАг', '14250 · 300 мАг'],
  ['Споживання', 'Power draw', '~80 мА', '~130 мА', { uk: '~15 мкА сон, ~30 мА оновл.', en: '~15 µA sleep, ~30 mA refresh' }],
  ['Від батареї (оцінка)', 'Battery life (est.)', { uk: '~3 год', en: '~3 h' }, { uk: '~6 год', en: '~6 h' }, { uk: '~3–4 тижні', en: '~3–4 weeks' }],
  ['Ввід', 'Input', { uk: 'мікрофон (хлопок)', en: 'microphone (clap)' }, { uk: 'тач, свайп, стук, нахил', en: 'touch, swipe, tap, tilt' }, { uk: 'кнопка', en: 'button' }],
  ['Плюси', 'Pros', { uk: 'як в оригіналі, яскраво', en: 'faithful, vivid' }, { uk: 'інтерактив, контраст', en: 'interactive, contrast' }, { uk: 'автономність, читабельність', en: 'battery life, readability' }],
  ['Мінуси', 'Cons', { uk: 'мало живе від батареї', en: 'short battery life' }, { uk: 'складніший драйвер', en: 'harder driver' }, { uk: 'повільно, ч/б', en: 'slow, B/W' }],
];

export const GALLERY = ['IMG_1420', 'IMG_1423', 'IMG_1425', 'IMG_1427', 'IMG_1430', 'IMG_1431', 'IMG_1432', 'IMG_1433', 'IMG_1440', 'IMG_1482', 'IMG_1483', 'IMG_1485', 'IMG_1486']
  .map(n => `img/${n}.jpg`).concat(['img/lander-r2.gif']);
