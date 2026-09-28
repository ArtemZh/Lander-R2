# Lander R2 — desk companion lander & widget platform (demo)

**Live:** https://artemzh.github.io/Lander-R2/

## Ідея
Завдяки Claude Code будь-хто може додати свій віджет до такого пристрою за вечір: віджет — це одна
функція «намалюй екран із цих даних». Мета — не ще один гаджет, а **платформа віджетів і спільнота
навколо неї**, як у Flipper і Pebble. Пристрій — привід; продукт — каталог віджетів і сценаріїв подій.

## Що на сторінці
- **Дві версії:** Lander R2 (наш) і **Прототип** — скульптура Mohit Bhoite (TFT 1.9″, Photon 2), якою ми надихнулись.
- Lander R2 має перемикач дисплея:
  - **AMOLED** — плата Waveshare ESP32-S3-Touch-AMOLED-1.91 (ESP32-S3R8, 240×536 з тачем, IMU QMI8658, зарядка) + BME280, VEML7700, PDM-мікрофон, MAX98357A зі спікером;
  - **E-ink** — ESP32-C6 Feather + e-ink 2.66″ 152×296.
- Форма каркаса: **v1** — прямокутник із дужками нахилу, **v2** — трапеція, що повторює нахил екрана 12°.
- Процедурна 3D-модель (Three.js), збірка по 10 кроках, деталі ↔ підсвічування.
- **Піни:** схема з'єднань і блок-діаграма генеруються кодом; таблиця джерел документації з посиланнями й статусом перевірки.
- **Екрани і сценарії:** антена з RGB-маяком (стан Claude Code) + емулятор екрана; 20 AMOLED- і 10 e-ink-екранів; три колонки: ліворуч усі сценарії компактними кнопками, по центру пристрій, праворуч — що відбувається зараз.
  **7 історій** зі своїм (віртуальним) часом і єдиним календарем — стрічка кроків під пристроєм, клік — перейти до кроку.
  **Clawd** — піксельний персонаж Claude Code показує, що робить агент: працює, питає, радіє, сумує, думає, спить.
  **Посадка** — міні-гра з місячною фізикою (тяга, паливо, м'яка посадка < 2 м/с); **запуск ракети** — повноекранний LIVE від T-10 до орбіти.
- Живі дані без ключів: Open-Meteo (погода, прогноз, AQI), Wikipedia «On this day», курси валют; решта — демо-симуляція.
- **Рендери:** 9 кадрів Lander R2 (AMOLED, форма v1) на робочому столі — Blender / Cycles, екран у режимі годинника (`img/renders/`, WebP).
- На телефоні й планшеті: одним пальцем гортається сторінка, двома — обертається 3D-модель.
- UK / EN / PL.

## Idea (EN)
With Claude Code anyone can add a widget to a device like this in an evening — a widget is one
`draw(data)` function. The goal is a widget platform and a community, the Flipper/Pebble way.
The page is a demo: Lander R2 (Waveshare ESP32-S3 AMOLED touch board or ESP32-C6 + e-ink, rectangular or trapezoid frame)
and Bhoite's prototype; a procedural 3D model, generated wiring with sources, a screen catalog and 7 connected stories
driving the screen and the RGB beacon.

## Запуск
Статичний сайт, без збірки: `python3 -m http.server` і відкрити `index.html`.

## Credits
Prototype, photos and schematics — [Mohit Bhoite, Lander R2](https://bhoite.com/sculptures/lander-r2); shown only in the Prototype view.
Render scene 3D models: Magic Keyboard — jyun_studio (CC BY-NC 4.0), Magic Trackpad — EwanLejkowski (CC BY 4.0), Mac Studio — CGTrader (free); the lander is modelled from scratch. The `.blend` scene is not published.
Unofficial educational demo. Firmware is described only, not included.
