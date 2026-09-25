# Lander R2 — desk companion lander & widget platform (demo)

**Live:** https://artemzh.github.io/Lander-R2/

## Ідея
Завдяки Claude Code будь-хто може додати свій віджет до такого пристрою за вечір: віджет — це одна
функція «намалюй екран із цих даних». Мета — не ще один гаджет, а **платформа віджетів і спільнота
навколо неї**, як у Flipper і Pebble. Пристрій — привід; продукт — каталог віджетів і сценаріїв подій.

## Що на сторінці
- **Дві версії:** Lander R2 (наш) з перемикачем дисплея **AMOLED 1.91″ 240×536 + touch / E-ink 2.66″ 152×296**,
  і **Прототип** — оригінальна скульптура Mohit Bhoite (TFT 1.9″, Photon 2), якою ми надихнулись.
- Процедурна 3D-модель (Three.js), збірка по кроках, список деталей ↔ підсвічування, піни, порівняння.
- **Екрани і сценарії:** 2D-антена з RGB-маяком (стан Claude Code: зелений працює, червоний чекає відповіді,
  помаранчевий простій) + емулятор екрана; каталог з 18 AMOLED-екранів (місія, мітинг, день, Dev/Claude,
  кімната, прогноз, повітря, фокус, задачі, факт дня, слово дня, курси, музика, місяць, посадка, паливний бак,
  обличчя, ніч) і 9 e-ink-екранів (у т.ч. записка й місячний календар); 27 сценаріїв подій із ▶ —
  мітинг за 5 хв, CI впав, Claude поставив питання, ранок, ніч, струс, зарядка тощо.
- Живі дані без ключів: Open-Meteo (погода, прогноз 7 днів, AQI), Wikipedia «On this day», курси валют.
  Решта (календар, GitHub, Claude-стан, сенсори) — симуляція з позначкою demo.
- UK / EN.

## Idea (EN)
With Claude Code anyone can add a widget to a device like this in an evening — a widget is one
`draw(data)` function. The goal is a widget platform and a community, the Flipper/Pebble way.
The page is a demo: two versions (Lander R2 with an AMOLED/E-ink switch, and Bhoite's prototype),
a procedural 3D model, a screen catalog and 27 event scenarios driving the screen and the RGB beacon.

## Запуск
Статичний сайт, без збірки: `python3 -m http.server` і відкрити `index.html`.

## Credits
Original sculpture, build guide and photos — [Mohit Bhoite, Lander R2](https://bhoite.com/sculptures/lander-r2).
Unofficial educational demo. Firmware is described only, not included.
