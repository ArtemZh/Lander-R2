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
    touch: { uk: ['Дисплей', 'AMOLED 1.9″ з ємнісним тачем — сторінки гортаються свайпом.'], en: ['Display', '1.9″ AMOLED with capacitive touch — swipe between pages.'] },
    ink: { uk: ['Дисплей', 'E-ink 2.13″ 122×250 — тримає картинку без живлення.'], en: ['Display', '2.13″ 122×250 e-ink — keeps the image without power.'] },
  },
  shell: { uk: ['Шкаралупа', 'Зовнішня прямокутна клітка ≈30×32×60 мм замикає корпус.'], en: ['Shell', 'Outer rectangular cage ≈30×32×60 mm closes the body.'] },
  audio: {
    original: { uk: ['Мікрофон і бузер', 'PDM-мікрофон (синя плата) збоку, п’єзобузер з іншого боку.'], en: ['Mic & buzzer', 'PDM mic (blue board) on one side, piezo buzzer on the other.'] },
    touch: { uk: ['Мініспікер', 'Замість бузера — мініспікер через I2S; мікрофона немає.'], en: ['Mini speaker', 'An I2S mini speaker replaces the buzzer; no microphone.'] },
    ink: { uk: ['Без звуку', 'У e-ink версії немає ні бузера, ні мікрофона — крок пропускається.'], en: ['No audio', 'The e-ink build has no buzzer or mic — this step is skipped.'] },
  },
  pack: { uk: ['Рюкзак і батарея', 'Клітка-рюкзак ззаду тримає батарею 14250 і вимикач.'], en: ['Backpack & battery', 'Rear cage holds the 14250 cell and the power switch.'] },
  antenna: { uk: ['Антена', 'Дротяна антена 60 мм з червоним LED на кінці.'], en: ['Antenna', '60 mm wire antenna with a red LED on top.'] },
  legs: { uk: ['Ноги', 'Чотири ноги — подвійні стійки з поперечками й розкосами.'], en: ['Legs', 'Four legs — double struts with cross-bars and braces.'] },
  pads: { uk: ['Посадкові диски', 'Диски Ø14 мм на кінцях ніг — як у справжнього посадкового модуля.'], en: ['Landing pads', 'Ø14 mm pads on the feet — just like a real lander.'] },
};

export const PARTS = {
  original: [
    ['board', 'Particle Photon 2', 'Particle Photon 2', 1],
    ['display', 'TFT 1.9″ 170×320 ST7789 (Adafruit)', 'TFT 1.9″ 170×320 ST7789 (Adafruit)', 1],
    ['audio', 'PDM-мікрофон + п’єзобузер', 'PDM mic + piezo buzzer', 2],
    ['pack', 'Батарея LiFePO4/Li-ion 14250 + вимикач', '14250 cell + slide switch', 2],
    ['antenna', 'Червоний LED 3 мм + резистор 220 Ω', 'Red 3 mm LED + 220 Ω resistor', 1],
    ['chassis', 'Латунний дріт 20 AWG (≈0.8 мм)', 'Brass wire 20 AWG (≈0.8 mm)', '~3 м'],
    ['shell', 'Латунний дріт 20 AWG — шкаралупа', 'Brass wire 20 AWG — shell', '—'],
    ['legs', 'Латунний дріт — ноги', 'Brass wire — legs', 4],
    ['pads', 'Латунні диски Ø14 мм', 'Brass discs Ø14 mm', 4],
  ],
  touch: [
    ['board', 'ESP32-S3 Feather (8 MB PSRAM)', 'ESP32-S3 Feather (8 MB PSRAM)', 1],
    ['display', 'AMOLED 1.9″ з ємнісним тачем', '1.9″ AMOLED, capacitive touch', 1],
    ['audio', 'Мініспікер + підсилювач I2S (MAX98357A)', 'Mini speaker + I2S amp (MAX98357A)', 1],
    ['pack', 'Батарея 14250 + вимикач', '14250 cell + switch', 2],
    ['antenna', 'Червоний LED + 220 Ω', 'Red LED + 220 Ω', 1],
    ['chassis', 'Латунний дріт 20 AWG', 'Brass wire 20 AWG', '~3 м'],
    ['shell', 'Латунний дріт — шкаралупа', 'Brass wire — shell', '—'],
    ['legs', 'Латунний дріт — ноги', 'Brass wire — legs', 4],
    ['pads', 'Латунні диски Ø14 мм', 'Brass discs Ø14 mm', 4],
  ],
  ink: [
    ['board', 'ESP32-C6 Feather', 'ESP32-C6 Feather', 1],
    ['display', 'E-ink 2.13″ 122×250 (SSD1680)', '2.13″ 122×250 e-ink (SSD1680)', 1],
    ['pack', 'Батарея 14250 + вимикач', '14250 cell + switch', 2],
    ['antenna', 'Червоний LED + 220 Ω (блимає при оновленні)', 'Red LED + 220 Ω (blinks on refresh)', 1],
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
    ['LED red (220 Ω)', 'A', 'RX'], ['LED green (220 Ω)', 'A', 'D0'],
  ],
  touch: [
    ['AMOLED (QSPI)', 'GND / VCC', 'GND / 3V3'], ['AMOLED (QSPI)', 'CLK', 'GPIO36'], ['AMOLED (QSPI)', 'D0–D3', 'GPIO35, 37, 38, 39'],
    ['AMOLED (QSPI)', 'CS', 'GPIO10'], ['AMOLED (QSPI)', 'RST', 'GPIO9'],
    ['Touch (I2C)', 'SDA / SCL', 'GPIO3 / GPIO4'], ['Touch (I2C)', 'INT', 'GPIO5'],
    ['I2S amp', 'BCLK', 'GPIO12'], ['I2S amp', 'LRC', 'GPIO11'], ['I2S amp', 'DIN', 'GPIO13'],
    ['Battery', '+', 'BAT (via switch)'], ['Battery', '−', 'GND'],
    ['LED red (220 Ω)', 'A', 'GPIO14'],
  ],
  ink: [
    ['E-ink (SPI)', 'GND / VCC', 'GND / 3V3'], ['E-ink (SPI)', 'SCK', 'SCK (GPIO21)'], ['E-ink (SPI)', 'MOSI', 'MOSI (GPIO22)'],
    ['E-ink (SPI)', 'CS', 'GPIO5'], ['E-ink (SPI)', 'DC', 'GPIO6'], ['E-ink (SPI)', 'RST', 'GPIO7'], ['E-ink (SPI)', 'BUSY', 'GPIO8'],
    ['Battery', '+', 'BAT (via switch)'], ['Battery', '−', 'GND'],
    ['LED red (220 Ω)', 'A', 'GPIO15'],
  ],
};

export const DIFFS = {
  original: { uk: ['Оригінальна збірка Mohit Bhoite.', 'Кольоровий TFT, PDM-мікрофон, бузер.', 'Живлення від 14250 — години, не дні.'], en: ['Mohit Bhoite’s original build.', 'Colour TFT, PDM mic, buzzer.', '14250 cell lasts hours, not days.'] },
  touch: { uk: ['Свайп сторінок і налаштування просто на екрані.', 'Без PDM-мікрофона.', 'Бузер → мініспікер I2S.'], en: ['Swipe pages and on-screen settings.', 'No PDM microphone.', 'Buzzer → I2S mini speaker.'] },
  ink: { uk: ['Deep sleep, оновлення раз на 10 хв.', 'Тижні від батареї 14250.', 'Без бузера й мікрофона, ч/б екран.'], en: ['Deep sleep, refresh every 10 min.', 'Weeks on a 14250 cell.', 'No buzzer or mic, B/W screen.'] },
};

// Рядки порівняння: [мітка uk, мітка en, original, touch, ink] (значення — рядок або {uk,en})
export const COMPARE = [
  ['Екран', 'Screen', 'TFT 1.9″ 170×320', 'AMOLED 1.9″ + touch', 'E-ink 2.13″ 122×250'],
  ['Контролер', 'Controller', 'Particle Photon 2', 'ESP32-S3 Feather', 'ESP32-C6 Feather'],
  ['RAM / Flash', 'RAM / Flash', '3 MB / 2 MB', '512 KB + 8 MB PSRAM / 8 MB', '512 KB / 4 MB'],
  ['Споживання', 'Power draw', '~80 мА', '~110 мА', { uk: '~15 мкА сон, ~30 мА оновл.', en: '~15 µA sleep, ~30 mA refresh' }],
  ['Від батареї (оцінка)', 'Battery life (est.)', { uk: '~3 год', en: '~3 h' }, { uk: '~2 год', en: '~2 h' }, { uk: '~3–4 тижні', en: '~3–4 weeks' }],
  ['Ввід', 'Input', { uk: 'мікрофон (хлопок)', en: 'microphone (clap)' }, { uk: 'тач, свайп', en: 'touch, swipe' }, { uk: 'кнопка', en: 'button' }],
  ['Ціна деталей (орієнт.)', 'Parts cost (approx.)', '~$55', '~$45', '~$35'],
  ['Плюси', 'Pros', { uk: 'як в оригіналі, яскраво', en: 'faithful, vivid' }, { uk: 'інтерактив, контраст', en: 'interactive, contrast' }, { uk: 'автономність, читабельність', en: 'battery life, readability' }],
  ['Мінуси', 'Cons', { uk: 'мало живе від батареї', en: 'short battery life' }, { uk: 'складніший драйвер', en: 'harder driver' }, { uk: 'повільно, ч/б', en: 'slow, B/W' }],
];

export const GALLERY = ['IMG_1420', 'IMG_1423', 'IMG_1425', 'IMG_1427', 'IMG_1430', 'IMG_1431', 'IMG_1432', 'IMG_1433', 'IMG_1440', 'IMG_1482', 'IMG_1483', 'IMG_1485', 'IMG_1486']
  .map(n => `img/${n}.jpg`).concat(['img/lander-r2.gif']);
