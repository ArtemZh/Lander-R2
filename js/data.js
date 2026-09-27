// Дані трьох версій (тексти двомовні: {uk, en})
export const VERSIONS = ['r2', 'original'];

export const STEPS = {
  chassis: { uk: ['Шасі', 'Внутрішня рамка з латунного дроту 20 AWG — скелет, до якого кріпиться все інше.'], en: ['Chassis', 'Inner frame of 20 AWG brass wire — the skeleton everything else attaches to.'] },
  board: {
    original: { uk: ['Плата Photon 2', 'Particle Photon 2 ставиться всередину рамки, USB-C дивиться вниз.'], en: ['Photon 2 board', 'Particle Photon 2 sits inside the frame, USB-C facing down.'] },
    touch: { uk: ['Плата Waveshare ESP32-S3-Touch-AMOLED-1.91', 'Одна плата замість трьох: ESP32-S3R8 (8 MB PSRAM, 16 MB flash), AMOLED з тачем, IMU QMI8658, слот TF, зарядка батареї і USB-C — усе на 24.5×57.5 мм. Стає у передню грань каркаса екраном назовні, компонентами всередину.'], en: ['Waveshare ESP32-S3-Touch-AMOLED-1.91 board', 'One board instead of three: ESP32-S3R8 (8 MB PSRAM, 16 MB flash), AMOLED with touch, QMI8658 IMU, TF slot, battery charger and USB-C — all on 24.5×57.5 mm. Sits in the front face, screen out, components in.'] },
    ink: { uk: ['Плата ESP32-C6', 'ESP32-C6 Feather — низьке споживання в deep sleep.'], en: ['ESP32-C6 board', 'ESP32-C6 Feather — low deep-sleep current.'] },
  },
  display: {
    original: { uk: ['Дисплей', 'TFT 1.9″ 170×320 ST7789 припаюється прямо до дротяних шин.'], en: ['Display', '1.9″ 170×320 ST7789 TFT is soldered straight onto the wire bus.'] },
    touch: { uk: ['Екран під нахилом', 'AMOLED 1.91″ 240×536 (RM67162, ~330 dpi) з ємнісним тачем FT3168 — уже на платі, активна зона 19.8×44.2 мм. Форма v1 — вертикально врівень із передньою гранню; v2 — разом із передньою гранню під нахилом 12°. Скло на 1.5 мм уперед від дроту, а перекладини на передній грані немає — ніщо не перекриває тач.'], en: ['Tilted screen', '1.91″ 240×536 AMOLED (RM67162, ~330 dpi) with FT3168 capacitive touch — already on the board, 19.8×44.2 mm active area. Form v1 — vertical, flush with the front face; v2 — tilted 12° with the front face. Glass 1.5 mm proud of the wire and no rail across the front — nothing covers the touchscreen.'] },
    ink: { uk: ['Дисплей під нахилом', 'E-ink 2.66″ 152×296 (SSD1680), активна зона 30×59 мм — рівно в каркас; v1 вертикально, v2 під нахилом 12°; тримає картинку без живлення.'], en: ['Tilted display', '2.66″ 152×296 e-ink (SSD1680), 30×59 mm active area — fits the frame; v1 vertical, v2 tilted 12°; keeps the image without power.'] },
  },
  shell: {
    original: { uk: ['Шкаралупа', 'Зовнішня прямокутна клітка ≈30×32×60 мм замикає корпус.'], en: ['Shell', 'Outer rectangular cage ≈30×32×60 mm closes the body.'] },
    touch: { uk: ['Шкаралупа', 'Форма v1 — прямокутна клітка 30×32×60 мм, екран вертикальний. Форма v2 — трапеція: задня грань вертикальна, передня нахилена на 12° разом з екраном (верх на ≈13 мм вужчий). В обох середня перекладина йде лише по боках і ззаду — передня грань вільна для тачу.'], en: ['Shell', 'Form v1 — a 30×32×60 mm rectangular cage, vertical screen. Form v2 — a trapezoid: vertical back, front face tilted 12° with the screen (≈13 mm narrower at the top). In both, the middle rail runs only along the sides and back — the front stays clear for touch.'] },
    ink: { uk: ['Шкаралупа', 'v1 — прямокутник з дужками; v2 — трапеція, передня грань нахилена на 12° разом з e-ink.'], en: ['Shell', 'v1 — rectangle with brackets; v2 — trapezoid, front face tilted 12° with the e-ink.'] },
  },
  audio: {
    original: { uk: ['Мікрофон і бузер', 'PDM-мікрофон (синя плата) збоку, п’єзобузер з іншого боку.'], en: ['Mic & buzzer', 'PDM mic (blue board) on one side, piezo buzzer on the other.'] },
    touch: { uk: ['Сенсорна капсула', 'IMU QMI8658 уже на платі. Решта — у маленькій дротяній капсулі ззаду: BME280 на дні отвором униз, подалі від тепла чипа (інакше +2–3 °C); спікер 15 мм дивиться назад — капсула працює як резонатор, поруч MAX98357A; PDM-мікрофон на боковій стінці. Зовні лишається лише VEML7700 зверху — дивиться в стелю.'], en: ['Sensor capsule', 'The QMI8658 IMU is on the board. The rest lives in a small wire capsule at the back: BME280 on the floor facing down, away from the chip heat (else +2–3 °C); the 15 mm speaker faces back — the capsule acts as a resonator, MAX98357A next to it; the PDM mic on a side wall. Only the VEML7700 stays outside, on top, facing the ceiling.'] },
    ink: { uk: ['Без звуку', 'У e-ink версії немає ні бузера, ні мікрофона — крок пропускається.'], en: ['No audio', 'The e-ink build has no buzzer or mic — this step is skipped.'] },
  },
  pack: {
    original: { uk: ['Рюкзак і батарея', 'Клітка-рюкзак ззаду тримає батарею 14250 (300 мАг) і вимикач.'], en: ['Backpack & battery', 'Rear cage holds the 14250 cell (300 mAh) and the power switch.'] },
    touch: { uk: ['Батарея всередині, капсула, USB-C', 'Модуль екрана тонкий, тому 16340 з платою захисту стоїть усередині корпусу, вертикально за екраном між рамками шасі — центр мас нижче, лендер стійкіший. Тримається двома латунними клемами, припаяними до шасі; клеми — на роз’єм BAT плати (зарядка вбудована). Ззаду — сенсорна капсула з USB-C на спині; вимикач збоку під палець.'], en: ['Battery inside, capsule, USB-C', 'The screen module is thin, so the protected 16340 stands inside the body, vertically behind the screen between the chassis frames — lower centre of mass, steadier lander. Held by two brass clips soldered to the chassis; the clips go to the board’s BAT header (charger on-board). At the back — the sensor capsule with USB-C; side switch under the thumb.'] },
    ink: { uk: ['Батарея всередині, USB-C', '16340 усередині корпусу за екраном на латунних клемах; для e-ink її вистачає на місяці. Рюкзака немає — USB-C на задній грані, вимикач збоку.'], en: ['Battery inside, USB-C', '16340 inside the body behind the screen on brass clips; for e-ink it lasts months. No backpack — USB-C on the back face, side switch.'] },
  },
  antenna: {
    original: { uk: ['Антена', 'Дротяна антена 60 мм з LED на кінці і резисторами на самій антені.'], en: ['Antenna', '60 mm wire antenna with the LED on top and resistors on the antenna itself.'] },
    touch: { uk: ['Антена-маяк', 'Чистий дріт 60 мм, резистори — на платі. RGB LED показує стан Claude Code: зелений — працює, червоний — чекає відповіді, помаранчевий — простій; синій — мітинг/фокус.'], en: ['Beacon antenna', 'Clean 60 mm wire, resistors on the board. The RGB LED shows Claude Code state: green working, red waiting, orange idle; blue — meeting/focus.'] },
    ink: { uk: ['Антена-маяк', 'Чистий дріт 60 мм, резистори на платі. RGB LED показує стан Claude Code й мітинги.'], en: ['Beacon antenna', 'Clean 60 mm wire, resistors on the board. The RGB LED shows Claude Code state and meetings.'] },
  },
  legs: {
    original: { uk: ['Ноги', 'Чотири ноги — подвійні стійки з поперечками й розкосами, паяні прямо до шкаралупи.'], en: ['Legs', 'Four legs — double struts with cross-bars and braces, soldered straight to the shell.'] },
    touch: { uk: ['Ноги-модулі', 'Кожна нога — окремий модуль на трьох штирях, що входять у трубочки-гнізда на шкаралупі: зняв — поправив — вставив. Драбина з трьома поперечками і розкос, замкнутий у трикутник, — мінімум вигинів, максимум жорсткості.'], en: ['Modular legs', 'Each leg is a module on three pins that slide into tube sockets on the shell: pull — straighten — push back. A ladder with three rungs and a brace closing a triangle — few bends, maximum stiffness.'] },
    ink: { uk: ['Ноги-модулі', 'Ті самі ноги-модулі на штирях із трикутним розкосом.'], en: ['Modular legs', 'The same pinned leg modules with a triangular brace.'] },
  },
  pads: {
    original: { uk: ['Посадкові диски', 'Плоскі диски Ø14 мм, паяються останніми, щоб не хиталось.'], en: ['Landing pads', 'Flat Ø14 mm discs, soldered last so nothing wobbles.'] },
    touch: { uk: ['Посадкові диски', 'Диски Ø14 мм з відбортовкою 0.5 мм — точка пайки не на площині, стоїть без хитання.'], en: ['Landing pads', 'Ø14 mm discs with a 0.5 mm rim — the solder point is off the plane, no wobble.'] },
    ink: { uk: ['Посадкові диски', 'Диски Ø14 мм з відбортовкою 0.5 мм.'], en: ['Landing pads', 'Ø14 mm discs with a 0.5 mm rim.'] },
  },
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
    ['board', 'Waveshare ESP32-S3-Touch-AMOLED-1.91 (ESP32-S3R8, 16 MB flash, 8 MB PSRAM, IMU QMI8658, TF, зарядка)', 'Waveshare ESP32-S3-Touch-AMOLED-1.91 (ESP32-S3R8, 16 MB flash, 8 MB PSRAM, QMI8658 IMU, TF, charger)', 1],
    ['display', 'AMOLED 1.91″ 240×536 + тач FT3168 — на платі', '1.91″ 240×536 AMOLED + FT3168 touch — on the board', '—'],
    ['audio', 'PDM-мікрофон, BME280, VEML7700, MAX98357A + спікер 15 мм', 'PDM mic, BME280, VEML7700, MAX98357A + 15 mm speaker', 5],
    ['pack', 'Батарея 16340 (800 мАг) усередині + вимикач', '16340 cell (800 mAh) inside + switch', 2],
    ['antenna', 'RGB LED 0805 + 3× 220 Ω', 'RGB LED 0805 + 3× 220 Ω', 1],
    ['chassis', 'Латунний дріт 20 AWG', 'Brass wire 20 AWG', '~3 м'],
    ['shell', 'Латунний дріт — шкаралупа', 'Brass wire — shell', '—'],
    ['legs', 'Латунний дріт — ноги', 'Brass wire — legs', 4],
    ['pads', 'Латунні диски Ø14 мм', 'Brass discs Ø14 mm', 4],
  ],
  ink: [
    ['board', 'ESP32-C6 Feather', 'ESP32-C6 Feather', 1],
    ['display', 'E-ink 2.66″ 152×296 (SSD1680)', '2.66″ 152×296 e-ink (SSD1680)', 1],
    ['pack', 'Батарея 16340 (800 мАг) усередині + вимикач', '16340 cell (800 mAh) inside + switch', 2],
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
};

export const DIFFS = {
  original: { uk: ['Оригінальна збірка Mohit Bhoite.', 'Кольоровий TFT, PDM-мікрофон, бузер.', 'Живлення від 14250 — години, не дні.'], en: ['Mohit Bhoite’s original build.', 'Colour TFT, PDM mic, buzzer.', '14250 cell lasts hours, not days.'] },
  touch: { uk: ['Одна плата Waveshare: ESP32-S3 + AMOLED 240×536 (~330 dpi) з тачем + IMU + зарядка — мінімум пайки.', 'IMU: стук — перегорнути, нахил — горизонт, догори дном — сон; BME280 — локальна погода й барометр; VEML7700 — автояскравість.', 'Мікрофон + мініспікер I2S; знімна 16340 на ~6 год.'], en: ['One Waveshare board: ESP32-S3 + 240×536 AMOLED (~330 dpi) with touch + IMU + charger — minimal soldering.', 'IMU: tap to flip pages, tilt for a horizon, face-down to sleep; BME280 for local weather and barometer; VEML7700 for auto-brightness.', 'Mic + I2S mini speaker; removable 16340 for ~6 h.'] },
  ink: { uk: ['E-ink 2.66″ 152×296 — рівно в каркас, читабельний.', 'Deep sleep, оновлення раз на 10 хв; місяці від 16340.', 'Без бузера й мікрофона.'], en: ['2.66″ 152×296 e-ink — fits the frame, readable.', 'Deep sleep, refresh every 10 min; months on a 16340.', 'No buzzer or mic.'] },
};

// Рядки порівняння: [мітка uk, мітка en, original, touch, ink] (значення — рядок або {uk,en})
export const COMPARE = [
  ['Екран', 'Screen', 'AMOLED 1.91″ 240×536 + touch (~300 dpi)', 'E-ink 2.66″ 152×296 (~128 dpi)', 'TFT 1.9″ 170×320 (~190 dpi)'],
  ['Контролер', 'Controller', { uk: 'Waveshare ESP32-S3-Touch-AMOLED-1.91 (плата + екран + IMU)', en: 'Waveshare ESP32-S3-Touch-AMOLED-1.91 (board + screen + IMU)' }, 'ESP32-C6 Feather', 'Particle Photon 2'],
  ['RAM / Flash', 'RAM / Flash', '512 KB + 8 MB PSRAM / 16 MB', '512 KB / 4 MB', '3 MB / 2 MB'],
  ['Сенсори', 'Sensors', { uk: 'IMU на платі, мікрофон, BME280, світло', en: 'on-board IMU, mic, BME280, light' }, '—', { uk: 'PDM-мікрофон', en: 'PDM mic' }],
  ['Батарея', 'Battery', { uk: '16340 · 800 мАг · знімна', en: '16340 · 800 mAh · removable' }, { uk: '16340 · 800 мАг · знімна', en: '16340 · 800 mAh · removable' }, '14250 · 300 мАг'],
  ['Споживання', 'Power draw', '~130 мА', { uk: '~15 мкА сон, ~30 мА оновл.', en: '~15 µA sleep, ~30 mA refresh' }, '~80 мА'],
  ['Від батареї (оцінка)', 'Battery life (est.)', { uk: '~6 год', en: '~6 h' }, { uk: '~2–3 місяці', en: '~2–3 months' }, { uk: '~3 год', en: '~3 h' }],
  ['Ввід', 'Input', { uk: 'тач, свайп, стук, нахил', en: 'touch, swipe, tap, tilt' }, { uk: 'кнопка', en: 'button' }, { uk: 'мікрофон (хлопок)', en: 'microphone (clap)' }],
  ['Плюси', 'Pros', { uk: 'інтерактив, контраст', en: 'interactive, contrast' }, { uk: 'автономність, читабельність', en: 'battery life, readability' }, { uk: 'як в оригіналі, яскраво', en: 'faithful, vivid' }],
  ['Мінуси', 'Cons', { uk: 'складніший драйвер', en: 'harder driver' }, { uk: 'повільно, ч/б', en: 'slow, B/W' }, { uk: 'мало живе від батареї', en: 'short battery life' }],
];


export const GALLERY = ['IMG_1420', 'IMG_1423', 'IMG_1425', 'IMG_1427', 'IMG_1430', 'IMG_1431', 'IMG_1432', 'IMG_1433', 'IMG_1440', 'IMG_1482', 'IMG_1483', 'IMG_1485', 'IMG_1486']
  .map(n => `img/${n}.jpg`).concat(['img/lander-r2.gif']);
