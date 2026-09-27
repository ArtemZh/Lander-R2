// Дані трьох версій (тексти двомовні: {uk, en})
export const VERSIONS = ['r2', 'original'];

export const STEPS = {
  chassis: { uk: ['Шасі', 'Внутрішня рамка з латунного дроту 20 AWG — скелет, до якого кріпиться все інше.'], en: ['Chassis', 'Inner frame of 20 AWG brass wire — the skeleton everything else attaches to.'] },
  board: {
    original: { uk: ['Плата Photon 2', 'Particle Photon 2 ставиться всередину рамки, USB-C дивиться вниз.'], en: ['Photon 2 board', 'Particle Photon 2 sits inside the frame, USB-C facing down.'] },
    touch: { uk: ['Плата ESP32-S3', 'ESP32-S3 Feather з 8 MB PSRAM — вистачає на буфер кадру AMOLED.'], en: ['ESP32-S3 board', 'ESP32-S3 Feather with 8 MB PSRAM — enough for an AMOLED frame buffer.'] },
    ink: { uk: ['Плата ESP32-C6', 'ESP32-C6 Feather — низьке споживання в deep sleep.'], en: ['ESP32-C6 board', 'ESP32-C6 Feather — low deep-sleep current.'] },
  },
  display: {
    original: { uk: ['Дисплей', 'TFT 1.9″ 170×320 ST7789 припаюється прямо до дротяних шин.'], en: ['Display', '1.9″ 170×320 ST7789 TFT is soldered straight onto the wire bus.'] },
    touch: { uk: ['Дисплей під нахилом', 'AMOLED 1.91″ 240×536 (RM67162, QSPI) з ємнісним тачем FT3168. Стоїть під нахилом 12° назад на двох дужках — читається з робочого місця, без бліків; винесений на 1.5 мм уперед від дроту, щоб палець не впирався в рамку.'], en: ['Tilted display', '1.91″ 240×536 AMOLED (RM67162, QSPI) with FT3168 capacitive touch. Tilted 12° back on two brackets — readable from the desk, no glare; 1.5 mm proud of the wire so the finger clears the frame.'] },
    ink: { uk: ['Дисплей під нахилом', 'E-ink 2.66″ 152×296 (SSD1680), активна зона 30×59 мм — рівно в каркас, під нахилом 12° назад; тримає картинку без живлення.'], en: ['Tilted display', '2.66″ 152×296 e-ink (SSD1680), 30×59 mm active area — fits the frame, tilted 12° back; keeps the image without power.'] },
  },
  tilt: {
    original: { uk: ['Нахил дисплея', 'У прототипі дисплей стоїть вертикально — цей крок пропускається.'], en: ['Display tilt', 'The prototype keeps the display vertical — this step is skipped.'] },
    touch: { uk: ['Дужки нахилу (форма v1)', 'Як це працює: нижнє ребро плати дисплея лягає у дві петельки на передній нижній перекладині — це вісь, як у дверей. Верх відводимо назад на 12° і фіксуємо двома Z-подібними дужками: один кінець припаяний до передньої верхньої перекладини шкаралупи, другий — до верхніх кутів плати дисплея. Виходить жорсткий трикутник «перекладина — дужка — дисплей», нічого не рухається і не хитається. У формі v2 дужки не потрібні — нахил задає сам каркас.'], en: ['Tilt brackets (form v1)', 'How it works: the bottom edge of the display board rests in two small loops on the front bottom rail — that is the hinge line, like a door. The top is pushed back 12° and fixed by two Z-shaped brackets: one end soldered to the front top rail of the shell, the other to the top corners of the display board. The result is a rigid triangle “rail — bracket — display”; nothing moves or wobbles. Form v2 needs no brackets — the frame itself sets the tilt.'] },
    ink: { uk: ['Дужки нахилу (форма v1)', 'Та сама схема: нижнє ребро в петельках на нижній перекладині, верх — на двох Z-дужках до верхньої перекладини. У формі v2 не потрібні.'], en: ['Tilt brackets (form v1)', 'Same scheme: bottom edge in loops on the lower rail, top on two Z-brackets to the upper rail. Not needed in form v2.'] },
  },
  shell: {
    original: { uk: ['Шкаралупа', 'Зовнішня прямокутна клітка ≈30×32×60 мм замикає корпус.'], en: ['Shell', 'Outer rectangular cage ≈30×32×60 mm closes the body.'] },
    touch: { uk: ['Шкаралупа', 'Форма v1 — прямокутна клітка 30×32×60 мм, дисплей нахилений усередині на дужках. Форма v2 — трапеція: задня грань вертикальна, передня нахилена на 12° разом з екраном (верх на ≈13 мм вужчий), дисплей лягає у передню грань без дужок.'], en: ['Shell', 'Form v1 — a 30×32×60 mm rectangular cage with the display tilted inside on brackets. Form v2 — a trapezoid: vertical back, front face tilted 12° with the screen (≈13 mm narrower at the top), the display sits flush in the front face with no brackets.'] },
    ink: { uk: ['Шкаралупа', 'v1 — прямокутник з дужками; v2 — трапеція, передня грань нахилена на 12° разом з e-ink.'], en: ['Shell', 'v1 — rectangle with brackets; v2 — trapezoid, front face tilted 12° with the e-ink.'] },
  },
  audio: {
    original: { uk: ['Мікрофон і бузер', 'PDM-мікрофон (синя плата) збоку, п’єзобузер з іншого боку.'], en: ['Mic & buzzer', 'PDM mic (blue board) on one side, piezo buzzer on the other.'] },
    touch: { uk: ['Сенсори в тілі', 'Мікрофон PDM — збоку; IMU LSM6DSOX — за платою по центру мас; BME280 — низ рюкзака отвором униз, подалі від чипа (інакше +2–3 °C); VEML7700 — зверху шкаралупи, дивиться в стелю; спікер 15 мм + MAX98357A — правий борт.'], en: ['Sensors in the body', 'PDM mic on the side; LSM6DSOX IMU behind the board at the centre of mass; BME280 at the bottom of the backpack facing down, away from the chip (else +2–3 °C); VEML7700 on top of the shell facing the ceiling; 15 mm speaker + MAX98357A on the right side.'] },
    ink: { uk: ['Без звуку', 'У e-ink версії немає ні бузера, ні мікрофона — крок пропускається.'], en: ['No audio', 'The e-ink build has no buzzer or mic — this step is skipped.'] },
  },
  pack: {
    original: { uk: ['Рюкзак і батарея', 'Клітка-рюкзак ззаду тримає батарею 14250 (300 мАг) і вимикач.'], en: ['Backpack & battery', 'Rear cage holds the 14250 cell (300 mAh) and the power switch.'] },
    touch: { uk: ['Рюкзак, знімна батарея, USB-C', '16340 з платою захисту стоїть вертикально у вузькому рюкзаку в габариті корпусу і тримається двома пружними латунними клемами — міняється без паяльника. Вимикач збоку під палець, USB-C виведено на «спину».'], en: ['Backpack, removable cell, USB-C', 'A protected 16340 stands vertically in a narrow backpack within the body outline, held by two brass spring clips — swap without a soldering iron. Side switch under the thumb, USB-C routed to the back.'] },
    ink: { uk: ['Рюкзак, знімна батарея, USB-C', 'Той самий рюкзак із пружними клемами; для e-ink вистачає 16340 на місяці. Вимикач збоку, USB-C на «спині».'], en: ['Backpack, removable cell, USB-C', 'Same backpack with spring clips; for e-ink a 16340 lasts months. Side switch, USB-C on the back.'] },
  },
  antenna: {
    original: { uk: ['Антена', 'Дротяна антена 60 мм з LED на кінці і резисторами на самій антені.'], en: ['Antenna', '60 mm wire antenna with the LED on top and resistors on the antenna itself.'] },
    touch: { uk: ['Антена-маяк', 'Чистий дріт 60 мм, три тонкі провідники R/G/B, резистори — на платі. RGB LED показує стан Claude Code: зелений — працює, червоний — чекає відповіді, помаранчевий — простій; синій — мітинг/фокус.'], en: ['Beacon antenna', 'Clean 60 mm wire, three thin R/G/B leads, resistors on the board. The RGB LED shows Claude Code state: green working, red waiting, orange idle; blue — meeting/focus.'] },
    ink: { uk: ['Антена-маяк', 'Чистий дріт 60 мм, резистори на платі. RGB LED показує стан Claude Code й мітинги.'], en: ['Beacon antenna', 'Clean 60 mm wire, resistors on the board. The RGB LED shows Claude Code state and meetings.'] },
  },
  legs: {
    original: { uk: ['Ноги', 'Чотири ноги — подвійні стійки з поперечками й розкосами, паяні прямо до шкаралупи.'], en: ['Legs', 'Four legs — double struts with cross-bars and braces, soldered straight to the shell.'] },
    touch: { uk: ['Ноги-модулі', 'Кожна нога — окремий модуль на трьох штирях, що входять у трубочки-гнізда на шкаралупі: зняв — поправив — вставив. Розкос замкнутий у трикутник — жорсткість у 2–3 рази вища.'], en: ['Modular legs', 'Each leg is a module on three pins that slide into tube sockets on the shell: pull — straighten — push back. The brace closes a triangle — 2–3× stiffer.'] },
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
  ['Екран', 'Screen', 'AMOLED 1.91″ 240×536 + touch (~300 dpi)', 'E-ink 2.66″ 152×296 (~128 dpi)', 'TFT 1.9″ 170×320 (~190 dpi)'],
  ['Контролер', 'Controller', 'ESP32-S3 Feather', 'ESP32-C6 Feather', 'Particle Photon 2'],
  ['RAM / Flash', 'RAM / Flash', '512 KB + 8 MB PSRAM / 8 MB', '512 KB / 4 MB', '3 MB / 2 MB'],
  ['Сенсори', 'Sensors', { uk: 'мікрофон, IMU, BME280, світло', en: 'mic, IMU, BME280, light' }, '—', { uk: 'PDM-мікрофон', en: 'PDM mic' }],
  ['Батарея', 'Battery', { uk: '16340 · 800 мАг · знімна', en: '16340 · 800 mAh · removable' }, { uk: '16340 · 800 мАг · знімна', en: '16340 · 800 mAh · removable' }, '14250 · 300 мАг'],
  ['Споживання', 'Power draw', '~130 мА', { uk: '~15 мкА сон, ~30 мА оновл.', en: '~15 µA sleep, ~30 mA refresh' }, '~80 мА'],
  ['Від батареї (оцінка)', 'Battery life (est.)', { uk: '~6 год', en: '~6 h' }, { uk: '~2–3 місяці', en: '~2–3 months' }, { uk: '~3 год', en: '~3 h' }],
  ['Ввід', 'Input', { uk: 'тач, свайп, стук, нахил', en: 'touch, swipe, tap, tilt' }, { uk: 'кнопка', en: 'button' }, { uk: 'мікрофон (хлопок)', en: 'microphone (clap)' }],
  ['Плюси', 'Pros', { uk: 'інтерактив, контраст', en: 'interactive, contrast' }, { uk: 'автономність, читабельність', en: 'battery life, readability' }, { uk: 'як в оригіналі, яскраво', en: 'faithful, vivid' }],
  ['Мінуси', 'Cons', { uk: 'складніший драйвер', en: 'harder driver' }, { uk: 'повільно, ч/б', en: 'slow, B/W' }, { uk: 'мало живе від батареї', en: 'short battery life' }],
];

