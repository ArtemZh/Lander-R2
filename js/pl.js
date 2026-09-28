// Польські тексти: доливаються в структури data.js і screen.js при старті (applyPL).
// Екран самого пристрою й схеми для PL показуються англійською.
import { STEPS, PARTS, DIFFS, COMPARE } from './data.js?v=13';
import { SCREENS, SCENARIOS, STORIES, HIDDEN_SCREENS } from './screen.js?v=21';

const STEPS_PL = {
  chassis: ['Podwozie', 'Wewnętrzna rama z mosiężnego drutu 20 AWG — szkielet, do którego mocuje się całą resztę.'],
  board: {
    original: ['Płytka Photon 2', 'Particle Photon 2 wchodzi do środka ramy, USB-C skierowane w dół.'],
    touch: ['Płytka Waveshare ESP32-S3-Touch-AMOLED-1.91', 'Jedna płytka zamiast trzech: ESP32-S3R8 (8 MB PSRAM, 16 MB flash), AMOLED z dotykiem, IMU QMI8658, slot TF, ładowarka i USB-C — wszystko na 24,5×57,5 mm. Siedzi w przedniej ścianie ramy: ekran na zewnątrz, elementy do środka.'],
    ink: ['Płytka ESP32-C6', 'ESP32-C6 Feather — niski pobór prądu w deep sleep.'],
  },
  display: {
    original: ['Wyświetlacz', 'TFT 1,9″ 170×320 ST7789 lutowany bezpośrednio do drucianych szyn.'],
    touch: ['Pochylony ekran', 'AMOLED 1,91″ 240×536 (RM67162, ~330 dpi) z pojemnościowym dotykiem FT3168 — już na płytce, obszar aktywny 19,8×44,2 mm. Forma v1 — pionowo, równo z przednią ścianą; v2 — pochylony o 12° razem z przednią ścianą. Szkło wystaje 1,5 mm przed drut, a z przodu nie ma poprzeczki — nic nie zasłania dotyku.'],
    ink: ['Pochylony wyświetlacz', 'E-ink 2,66″ 152×296 (SSD1680), obszar aktywny 30×59 mm — mieści się w ramie; v1 pionowo, v2 pod kątem 12°; trzyma obraz bez zasilania.'],
  },
  shell: {
    original: ['Skorupa', 'Zewnętrzna prostokątna klatka ≈30×32×60 mm zamyka korpus.'],
    touch: ['Skorupa', 'Forma v1 — prostokątna klatka 30×32×60 mm, ekran pionowy. Forma v2 — trapez: tylna ściana pionowa, przednia pochylona o 12° razem z ekranem (u góry ≈13 mm węższa). W obu środkowa poprzeczka biegnie tylko po bokach i z tyłu — przód jest wolny dla dotyku.'],
    ink: ['Skorupa', 'v1 — prostokąt z pałąkami; v2 — trapez, przednia ściana pochylona o 12° razem z e-inkiem.'],
  },
  audio: {
    original: ['Mikrofon i buzzer', 'Mikrofon PDM (niebieska płytka) z jednej strony, buzzer piezo z drugiej.'],
    touch: ['Kapsuła czujników', 'IMU QMI8658 jest na płytce. Reszta mieszka w małej drucianej kapsule z tyłu: BME280 na dnie otworem w dół, z dala od ciepła układu (inaczej +2–3 °C); głośnik 15 mm skierowany do tyłu — kapsuła działa jak rezonator, obok MAX98357A; mikrofon PDM na bocznej ściance. Na zewnątrz zostaje tylko VEML7700 na górze — patrzy w sufit.'],
    ink: ['Bez dźwięku', 'Wersja e-ink nie ma ani buzzera, ani mikrofonu — ten krok jest pomijany.'],
  },
  pack: {
    original: ['Plecak i bateria', 'Tylna klatka-plecak trzyma ogniwo 14250 (300 mAh) i wyłącznik.'],
    touch: ['Bateria w środku, kapsuła, USB-C', 'Moduł ekranu jest cienki, więc 16340 z zabezpieczeniem stoi w środku korpusu, pionowo za ekranem między ramami podwozia — niższy środek ciężkości, stabilniejszy lądownik. Trzymają ją dwie mosiężne klemy przylutowane do podwozia; klemy idą do złącza BAT płytki (ładowarka na pokładzie). Z tyłu — kapsuła czujników z USB-C; wyłącznik z boku pod kciukiem.'],
    ink: ['Bateria w środku, USB-C', '16340 w korpusie za ekranem na mosiężnych klemach; przy e-inku wystarcza na miesiące. Bez plecaka — USB-C na tylnej ścianie, wyłącznik z boku.'],
  },
  antenna: {
    original: ['Antena', 'Druciana antena 60 mm z diodą na końcu i rezystorami na samej antenie.'],
    touch: ['Antena-latarnia', 'Czysty drut 60 mm, rezystory na płytce. Dioda RGB pokazuje stan Claude Code: zielony — pracuje, czerwony — czeka na odpowiedź, pomarańczowy — bezczynny; niebieski — spotkanie/skupienie.'],
    ink: ['Antena-latarnia', 'Czysty drut 60 mm, rezystory na płytce. Dioda RGB pokazuje stan Claude Code i spotkania.'],
  },
  legs: {
    original: ['Nogi', 'Cztery nogi — podwójne słupki z poprzeczkami i zastrzałami, przylutowane wprost do skorupy.'],
    touch: ['Nogi', 'Cztery nogi przylutowane do krawędzi skorupy: drabinka z trzema szczeblami i zastrzał od krawędzi korpusu do połowy nogi — zamknięty trójkąt. Mało zgięć i drobnych części; w trapezie przednie nogi mocują się do pochylonej ściany.'],
    ink: ['Nogi', 'Te same lutowane nogi z trójkątnym zastrzałem.'],
  },
  pads: {
    original: ['Stopy lądownika', 'Płaskie krążki Ø14 mm, lutowane na końcu, żeby nic się nie chwiało.'],
    touch: ['Stopy lądownika', 'Krążki Ø14 mm z rantem 0,5 mm — punkt lutowania jest poza płaszczyzną, stoi bez chwiania.'],
    ink: ['Stopy lądownika', 'Krążki Ø14 mm z rantem 0,5 mm.'],
  },
};

const PARTS_PL = {
  original: ['Particle Photon 2', 'TFT 1,9″ 170×320 ST7789 (Adafruit)', 'Mikrofon PDM + buzzer piezo', 'Ogniwo 14250 + wyłącznik suwakowy', 'Dioda RGB 0805 + 3× rezystor 220 Ω', 'Drut mosiężny 20 AWG (≈0,8 mm)', 'Drut mosiężny 20 AWG — skorupa', 'Drut mosiężny — nogi', 'Krążki mosiężne Ø14 mm'],
  touch: ['Waveshare ESP32-S3-Touch-AMOLED-1.91 (ESP32-S3R8, 16 MB flash, 8 MB PSRAM, IMU QMI8658, TF, ładowarka)', 'AMOLED 1,91″ 240×536 + dotyk FT3168 — na płytce', 'Mikrofon PDM, BME280, VEML7700, MAX98357A + głośnik 15 mm', 'Ogniwo 16340 (800 mAh) w środku + wyłącznik', 'Dioda RGB 0805 + 3× 220 Ω', 'Drut mosiężny 20 AWG', 'Drut mosiężny — skorupa', 'Drut mosiężny — nogi', 'Krążki mosiężne Ø14 mm'],
  ink: ['ESP32-C6 Feather', 'E-ink 2,66″ 152×296 (SSD1680)', 'Ogniwo 16340 (800 mAh) w środku + wyłącznik', 'Dioda RGB 0805 + 3× 220 Ω', 'Drut mosiężny 20 AWG', 'Drut mosiężny — skorupa', 'Drut mosiężny — nogi', 'Krążki mosiężne Ø14 mm'],
};

const DIFFS_PL = {
  original: ['Oryginalna konstrukcja Mohita Bhoite.', 'Kolorowy TFT, mikrofon PDM, buzzer.', 'Ogniwo 14250 wystarcza na godziny, nie dni.'],
  touch: ['Jedna płytka Waveshare: ESP32-S3 + AMOLED 240×536 (~330 dpi) z dotykiem + IMU + ładowarka — minimum lutowania.', 'IMU: stuknięcie — następna strona, pochylenie — horyzont, do góry dnem — uśpienie; BME280 — lokalna pogoda i barometr; VEML7700 — automatyczna jasność.', 'Mikrofon + mini głośnik I2S; wymienna 16340 na ~6 h.'],
  ink: ['E-ink 2,66″ 152×296 — mieści się w ramie, czytelny.', 'Deep sleep, odświeżanie co 10 min; miesiące na 16340.', 'Bez buzzera i mikrofonu.'],
};

// [etykieta, touch, ink, original] — null = bez zmian
const COMPARE_PL = [
  ['Ekran', null, null, null],
  ['Kontroler', 'Waveshare ESP32-S3-Touch-AMOLED-1.91 (płytka + ekran + IMU)', null, null],
  ['RAM / Flash', null, null, null],
  ['Czujniki', 'IMU na płytce, mikrofon, BME280, światło', null, 'mikrofon PDM'],
  ['Bateria', '16340 · 800 mAh · wymienna', '16340 · 800 mAh · wymienna', '14250 · 300 mAh'],
  ['Pobór prądu', '~130 mA', '~15 µA uśpienie, ~30 mA odśw.', '~80 mA'],
  ['Czas na baterii (szac.)', '~6 h', '~2–3 miesiące', '~3 h'],
  ['Sterowanie', 'dotyk, przesunięcie, stuknięcie, pochylenie', 'przycisk', 'mikrofon (klaśnięcie)'],
  ['Zalety', 'interaktywny, kontrast', 'autonomia, czytelność', 'wierny oryginałowi, żywe kolory'],
  ['Wady', 'trudniejszy sterownik', 'wolny, cz/b', 'krótko działa na baterii'],
];

const SCREENS_PL = {
  mission: ['Misja', 'Ekran główny — tylko to, co najważniejsze: czas (Kijów), data, pogoda teraz, następne wydarzenie z kalendarza, Clawd ze stanem agenta i limitami, pasek dnia.'],
  meeting: ['Następne spotkanie', 'Minuty do spotkania z kalendarza, tytuł, czas trwania, uczestnicy. 5 min przed dioda mruga na niebiesko, 1 min przed — szybciej; stuknięcie = „już idę”. W trakcie — „na antenie”, powiadomienia w kolejce.'],
  day: ['Dzień', 'Oś 8:00–20:00 ze spotkaniami, kursor „teraz”, wolne okna podświetlone na zielono i wypisane na dole. Idealne dla e-inku — zmienia się rzadko.'],
  dev: ['Dev / Claude Code', 'Stan agenta, limity 5-godzinny i tygodniowy, bieżąca sesja, ostatnie PR ze statusem CI, commity z dziś.'],
  room: ['Pokój', 'BME280: temperatura, wilgotność, ciśnienie; VEML7700: natężenie światła; indeks komfortu i wykres z 24 h.'],
  forecast: ['Prognoza na 7 dni', 'Ikona, max/min, szansa opadów, wiatr na każdy dzień + trend barometryczny na dziś (Open-Meteo, na żywo).'],
  air: ['Powietrze', 'AQI, PM2.5/PM10, UV i najważniejsze pytanie: otworzyć okno? — dwór kontra pokój.'],
  focus: ['Skupienie', 'Pomodoro 25/5 z pierścieniem postępu i licznikiem sesji. W trakcie dioda świeci na niebiesko „nie przeszkadzać”.'],
  tasks: ['Zadania', 'Top 3 na dziś, odhaczanie dotknięciem. Zrobione — zielony błysk; wszystkie trzy — „dzień zaliczony”.'],
  fact: ['Fakt dnia', 'Wikipedia „On this day” — pięć wydarzeń z tego dnia, dotknięcie — następne. Bez kluczy.'],
  word: ['Słowo dnia', 'Słowo, tłumaczenie, przykład. Dotknij — głośnik je wypowie.'],
  rates: ['Kursy', 'Trzy pary z dzienną zmianą i wykresikiem z 7 dni (open.er-api, na żywo).'],
  music: ['Muzyka', 'Co teraz gra, postęp, dotknięcie — pauza. AMOLED: czarne tło = wyłączone piksele.'],
  moon: ['Niebo', 'Łuk słońca od wschodu do zachodu z bieżącą pozycją i ile zostało światła; w nocy — gwiazdy i księżyc. Faza i oświetlenie księżyca, przelot ISS, następny start.'],
  landing: ['Lądowanie · gra', 'Minigra: posadź lądownik na zielonym lądowisku. Grawitacja Księżyca 1,62 m/s², paliwa na ~15 s. Przytrzymaj palec (lub ↑) — ciąg, pochyl telefon / kursor / ← → — w bok. Przyziemienie < 2 m/s.'],
  tank: ['Zbiornik paliwa', 'Poziom cieczy = naładowanie baterii. Symulator cieczy: grawitacja z IMU, potrząśnięcie → chlupnięcie, dotknięcie → kropla, ładowanie → bąbelki.'],
  face: ['Claude', 'Clawd, pikselowa postać Claude Code, odzwierciedla agenta: pracuje (biegające oczy, „…”), pyta („?”), cieszy się (PR zmergowany), smuci (CI padło), myśli lub śpi w bezczynności. Dotknięcie / klaśnięcie — wita się.'],
  night: ['Nocny', 'Ciemno > 2 min — przygaszony zegar, dioda gaśnie. E-ink po prostu zostawia ostatni obraz.'],
  note: ['Notatka', 'Tylko e-ink: wiadomość, która zostaje na ekranie nawet bez zasilania — „poszedłem na kawę, wracam o 14:10”.'],
  mooncal: ['Kalendarz księżycowy', 'Tylko e-ink: siatka miesiąca z fazą na każdy dzień, zmienia się raz na dobę — to, do czego e-ink został stworzony.'],
};

const SCENARIOS_PL = {
  knock: ['Stuknięcie w biurko', 'IMU łapie uderzenie: na „Spotkaniu” ≤ 5 min przed — „już idę”, na innych ekranach — następny ekran.'],
  clap: ['Klaśnięcie', 'Mikrofon: klaśnięcie → Clawd się wita i podskakuje.'],
  shake: ['Potrząśnięcie', 'Alarm „sprawdź nogi”: dioda czerwona 3 s, w zbiorniku chlupnięcie i bryzgi.'],
  rocket: ['Start rakiety', 'Powiadomienie Launch Library: pełnoekranowe LIVE — odliczanie T-10, zapłon, start, Max-Q, rozdzielenie stopni, orbita. Dioda w rytm etapów, potem powrót do poprzedniego ekranu.'],
  'claude-question': ['Claude zadał pytanie', 'Dioda czerwona 2 Hz + „ping”; Clawd z „?” na cały ekran, pytanie w powiadomieniu.'],
  'ink-partial': ['Częściowe odświeżenie', 'Tylko e-ink: zmieniła się minuta → mruga tylko strefa zegara.'],
  'ink-full': ['Pełne odświeżenie', 'Tylko e-ink: 3 inwersje po 130 ms przeciw „duchom”.'],
};

const STORIES_PL = {
  morning: ['Poranek w pracy', '06:50 noc → 07:30 światło i „dzień dobry” → prognoza → plan dnia → 08:55 na przód wychodzi Standup z niebieską latarnią → 09:00 na antenie → potem kolejka powiadomień.', [
    '06:50 · noc: ciemno, dioda wyłączona', '07:30 · zapalono światło → „Dzień dobry”: pogoda, pierwsze spotkanie, zadania', 'Prognoza na dzień', '08:20 · plan dnia: spotkania i wolne okna',
    '08:55 · 5 min do Standupu: plan się chowa, na przód wychodzi spotkanie, dioda niebieska 1 Hz', '08:59 · 1 min — mruga szybciej', '09:00 · start: dźwięk, stała dioda „na antenie”',
    '09:07 · Claude pyta w trakcie spotkania — do kolejki, dioda spokojna', '09:16 · koniec spotkania → „Misja” i kolejka: pytanie Claude, dioda czerwona']],
  claude: ['Sesja z Claude Code', 'Clawd pokazuje, co robi agent: pracuje → pyta → odpowiedziano → PR zmergowany (cieszy się) → CI padło (smuci się) → limit > 90 % → bezczynność (myśli).', [
    'Claude zaczyna: dioda „oddycha” na zielono', 'Clawd pracuje: biegające oczy, „…” nad głową', 'Pytanie: Clawd z „?”, dioda czerwona 2 Hz', 'Odpowiedziano — znowu pracuje; Dev: sesja, limity, PR',
    'PR #42 zmergowany: Clawd się cieszy, konfetti, zielony stroboskop', 'CI nowego PR #43 padło: Clawd się smuci, czerwony pasek (dotknij, by zamknąć)', 'Limit 5 h > 90 %: czerwony pasek, żółte podwójne mrugnięcie', 'Bezczynność: Clawd myśli, dioda pomarańczowa']],
  focus: ['Blok skupienia', '12:05 plan pokazuje wolne okno do 13:30 → propozycja skupienia → Pomodoro, „nie przeszkadzać”, powiadomienia w kolejce → przerwa z konfetti → kolejka oddaje pytanie Claude.', [
    '12:05 · plan: wolne do 13:30', 'Propozycja: „sesja skupienia?”', 'Pomodoro ruszyło: stała niebieska dioda, powiadomienia ukryte', 'Claude pyta — do kolejki, ekran się nie zmienia',
    '12:30 · …25 minut później', 'Przerwa 5 min: dźwięk, konfetti, dioda zielona', 'Kolejka: pytanie Claude, dioda czerwona, Clawd z „?”']],
  home: ['Pogoda i dom', 'Prognoza → ciśnienie spada, „deszcz” i krople na szybie → pokój: sucho → „nawilżacz” → czyste powietrze → „otwórz okno”.', [
    'Prognoza na 7 dni (Open-Meteo na żywo)', 'BME280: ciśnienie spada → „możliwy deszcz”, deszcz na szybie', 'Pokój: wilgotność 26 % → komfort spada, „nawilżacz”',
    'Powietrze: niski AQI, temperatura ok → „OTWÓRZ OKNO”', '„Misja” z podpowiedzią o oknie']],
  physics: ['Fizyka: lądowanie, pochylenie, potrząśnięcie, sen', 'Autopilot sadza lądownik na lądowisku w minigrze → pochylenie 35°, zbiornik się przelewa → potrząśnięcie, chlupnięcie, alarm → do góry dnem → sen → odwrócono → boot.', [
    'Lądowanie: autopilot trzyma < 2 m/s i siada na zielonym lądowisku', 'Pochylenie 35° → ciecz się przelewa, alarm „WYRÓWNAJ”', 'Potrząśnięcie: chlupnięcie, bryzgi, alarm „sprawdź nogi”',
    'Do góry dnem → sen, dioda wyłączona', 'Odwrócono → ekran startowy → „Misja”']],
  night: ['Wieczór, noc, zasilanie', '18:00 podsumowanie dnia → 22:40 ciemno, ekran nocny → 23:30 bateria 12 % → podłączono ładowarkę: bąbelki w zbiorniku → 07:30 poranek.', [
    '18:00 · ostatnie spotkanie za nami → podsumowanie dnia, ciepła dioda', '22:40 · ciemno przez 2 min → ekran nocny, dioda wyłączona', '23:30 · bateria 12 % → czerwona ikona',
    'Ładowarka podłączona: zbiornik robi się niebieski, bąbelki, poziom rośnie', '07:30 · poranek: światło → „Dzień dobry”']],
  inkday: ['Dzień z e-inkiem', '08:40 Misja → zmieniła się minuta: częściowe odświeżenie tylko zegara → plan dnia → 08:55 pełne odświeżenie na „Spotkanie” → fakt dnia → notatka → zasilanie odcięte, obraz zostaje.', [
    '08:40 · Misja: czarne na białym, dioda zielona', '08:41 · zmieniła się minuta → mruga tylko strefa zegara', 'Plan dnia — zmienia się rzadko, idealny dla e-inku',
    '08:55 · pełne odświeżenie (3 inwersje) → „Spotkanie”, dioda niebieska', 'Fakt dnia z Wikipedii', 'Notatka wysłana z telefonu', 'Zasilanie odcięte — obraz zostaje']],
};

let done = false;
export function applyPL() {
  if (done) return; done = true;
  for (const [id, v] of Object.entries(STEPS_PL)) {
    if (Array.isArray(v)) STEPS[id].pl = v;
    else for (const [k, t] of Object.entries(v)) if (STEPS[id][k]) STEPS[id][k].pl = t;
  }
  for (const [k, names] of Object.entries(PARTS_PL)) PARTS[k].forEach((row, i) => { row[4] = names[i] ?? row[2]; });
  for (const [k, list] of Object.entries(DIFFS_PL)) DIFFS[k].pl = list;
  COMPARE.forEach((row, i) => {
    const p = COMPARE_PL[i]; if (!p) return;
    row.pl = p[0];
    for (let j = 0; j < 3; j++) if (p[j + 1] != null) {
      const c = row[j + 2];
      row[j + 2] = typeof c === 'object' ? { ...c, pl: p[j + 1] } : { uk: c, en: c, pl: p[j + 1] };
    }
  });
  for (const list of [[SCREENS, SCREENS_PL], [SCENARIOS, SCENARIOS_PL]]) for (const it of list[0]) {
    const t = list[1][it[0]]; if (t) { it[1].pl = t[0]; it[2].pl = t[1]; }
  }
  Object.assign(HIDDEN_SCREENS.morning, { pl: 'Dzień dobry' }); Object.assign(HIDDEN_SCREENS.eod, { pl: 'Koniec dnia' }); Object.assign(HIDDEN_SCREENS.sleep, { pl: 'Sen' }); Object.assign(HIDDEN_SCREENS.launch, { pl: 'Start · LIVE' });
  for (const st of STORIES) {
    const t = STORIES_PL[st[0]]; if (!t) continue;
    st[1].pl = t[0]; st[2].pl = t[1];
    st[5].forEach((step, i) => { if (t[2][i]) step[1].pl = t[2][i]; });
  }
}
