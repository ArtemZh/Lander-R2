import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildLander, Viewer, STEP_IDS, setLedColor } from './lander-model.js?v=6';
import { Screen, loadWeather, loadExtras, weather, SCREENS, SCENARIOS } from './screen.js?v=14';
import { VERSIONS, STEPS, PARTS, PINS, DIFFS, COMPARE, GALLERY } from './data.js?v=5';

const $ = s => document.querySelector(s);
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

const state = { lang: store.get('lang') === 'en' ? 'en' : 'uk', version: 'r2', display: store.get('display') === 'ink' ? 'ink' : 'touch', step: 1, dict: {}, sel: null };
// ключ даних: Lander R2 має два дисплеї (touch/ink), прототип — один
const key = () => (state.version === 'r2' ? state.display : 'original');
const tr = o => (o && typeof o === 'object' ? o[state.lang] : o);
const T = k => state.dict[k] ?? k;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// --- Екран-емулятор (спільний канвас: і сторінка, і текстура 3D) ---
const screenCanvas = $('#screenCanvas');
const screen = new Screen(screenCanvas); window.landerScreen = screen;

// --- 3D ---
let highlight = null;
const setHl = id => {
  highlight = id;
  partsV.setHighlight(id);
  document.querySelectorAll('#partsTbl tr[data-id]').forEach(tr => tr.classList.toggle('hl', tr.dataset.id === id));
};
const heroV = new Viewer($('#heroCanvas'), OrbitControls, { autoRotate: true });
heroV.controls.enableZoom = false;
const buildV = new Viewer($('#buildCanvas'), OrbitControls);
const partsV = new Viewer($('#partsCanvas'), OrbitControls, { onPick: id => setHl(id) });
const viewers = [heroV, buildV, partsV];
// рендеримо лише видимі канваси
const vio = new IntersectionObserver(es => es.forEach(e => {
  const v = viewers.find(v => v.canvas === e.target); if (v) v.active = e.isIntersecting;
}));
viewers.forEach(v => vio.observe(v.canvas));

function rebuildModels() {
  for (const v of viewers) v.setModel(buildLander(key(), screenCanvas));
}
// Антена з RGB-маяком (2D), синхронна з LED-контролером емулятора
const ant = $('#antennaCanvas'), actx = ant.getContext('2d');
function drawAntenna(v, color) {
  const W = ant.width, H = ant.height; actx.clearRect(0, 0, W, H);
  actx.strokeStyle = '#c9a227'; actx.lineWidth = 3; actx.lineCap = 'round';
  actx.beginPath(); actx.moveTo(W / 2, H); actx.lineTo(W / 2, 22); actx.stroke();
  actx.fillStyle = '#d9d9d9'; actx.beginPath(); actx.arc(W / 2, H - 2, 4, 0, Math.PI * 2); actx.fill();
  const g = actx.createRadialGradient(W / 2, 18, 0, W / 2, 18, 40 * (0.3 + v));
  g.addColorStop(0, color); g.addColorStop(0.25, color + 'aa'); g.addColorStop(1, color + '00');
  actx.globalAlpha = 0.25 + 0.75 * v; actx.fillStyle = g; actx.beginPath(); actx.arc(W / 2, 18, 40, 0, Math.PI * 2); actx.fill(); actx.globalAlpha = 1;
  actx.fillStyle = '#222'; actx.fillRect(W / 2 - 4, 15, 8, 5);
  actx.fillStyle = v > 0.1 ? color : '#333'; actx.fillRect(W / 2 - 2.5, 16, 5, 3);
}
// кадр емулятора → антена завжди, текстура 3D — 12 разів/с і лише видимим глядачам
let lastTex = 0;
screen.onDraw = (v, color) => {
  drawAntenna(v, color);
  const tn = performance.now(); if (tn - lastTex < 80) return; lastTex = tn;
  for (const vw of viewers) { if (!vw.active || !vw.model) continue; const tx = vw.model.userData.screenTex; if (tx) tx.needsUpdate = true; setLedColor(vw.model, color, v); }
};

// --- Екрани і сценарії ---
function renderScreensPanel() {
  const L = state.lang, d = screen.version[0];
  $('#screenTiles').innerHTML = SCREENS.filter(x => x[3].includes(d)).map(([id, name]) => `<button class="tile" data-scr="${id}"><span class="tile-ic">▣</span><b>${esc(name[L])}</b></button>`).join('');
  $('#scenTiles').innerHTML = SCENARIOS.filter(x => x[3].includes(d)).map(([id, name]) => `<button class="tile tile--play" data-scn="${id}"><span class="tile-ic">▶</span><b>${esc(name[L])}</b></button>`).join('');
  document.querySelectorAll('[data-scr]').forEach(b => b.onclick = () => { screen.stopScenario(true); screen.show(b.dataset.scr); select('scr', b.dataset.scr); });
  document.querySelectorAll('[data-scn]').forEach(b => b.onclick = () => { screen.run(b.dataset.scn); select('scn', b.dataset.scn); });
  document.querySelectorAll('[data-d]').forEach(b => b.classList.toggle('on', b.dataset.d === state.display));
  updateScrName();
}
function select(kind, id) {
  state.sel = { kind, id };
  const src = kind === 'scr' ? SCREENS : SCENARIOS, it = src.find(x => x[0] === id); if (!it) return;
  $('#scrDescTitle').textContent = (kind === 'scn' ? '▶ ' : '') + it[1][state.lang];
  $('#scrDescText').textContent = it[2][state.lang];
  document.querySelectorAll('.tile').forEach(t => t.classList.toggle('on', t.dataset.scr === id && kind === 'scr' || t.dataset.scn === id && kind === 'scn'));
}
function updateScrName() {
  const it = SCREENS.find(x => x[0] === screen.screen);
  $('#scrName').textContent = it ? it[1][state.lang] : screen.screen;
  if (!state.sel || state.sel.kind === 'scr') { if (it) select('scr', it[0]); }
}
screen.onScreen = () => { updateScrName(); if (!screen.scenario && state.sel?.kind === 'scn') { /* сценарій завершено — лишаємо опис */ } };
$('#prevScr').onclick = () => { screen.stopScenario(true); screen.next(-1); state.sel = null; updateScrName(); };
$('#nextScr').onclick = () => { screen.stopScenario(true); screen.next(1); state.sel = null; updateScrName(); };
document.querySelectorAll('[data-d]').forEach(b => b.onclick = () => setDisplay(b.dataset.d));
// e-ink: повне оновлення раз на 10 хв
setInterval(() => { if (screen.version === 'ink') screen.fullRefresh(); }, 600000);

// --- Збірка по кроках ---
function stepText(id) {
  const s = STEPS[id];
  return tr(s[key()] ?? s);
}
function renderSteps() {
  $('#steps').innerHTML = STEP_IDS.map((id, i) => {
    const [h, p] = stepText(id);
    return `<li data-i="${i + 1}"><div class="card"><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`;
  }).join('');
  document.querySelectorAll('#steps li').forEach(li => stepIO.observe(li));
  setStep(state.step, false);
}
function setStep(n, scroll) {
  state.step = Math.max(1, Math.min(9, n));
  buildV.setStep(state.step);
  $('#stepNum').textContent = `${state.step} / 9`;
  document.querySelectorAll('#steps li').forEach(li => li.classList.toggle('cur', +li.dataset.i === state.step));
  if (scroll) document.querySelector(`#steps li[data-i="${state.step}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
const stepIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStep(+e.target.dataset.i, false); }),
  { rootMargin: '-45% 0px -45% 0px' });
$('#prevStep').onclick = () => setStep(state.step - 1, true);
$('#nextStep').onclick = () => setStep(state.step + 1, true);

// --- Таблиці ---
function renderParts() {
  const L = state.lang === 'uk' ? 1 : 2;
  $('#partsTbl').innerHTML = `<tr><th>${T('parts.part')}</th><th>${T('parts.qty')}</th></tr>` +
    PARTS[key()].map(p => `<tr data-id="${p[0]}"><td>${esc(p[L])}</td><td>${esc(p[3])}</td></tr>`).join('');
  document.querySelectorAll('#partsTbl tr[data-id]').forEach(r => {
    r.onmouseenter = () => setHl(r.dataset.id);
    r.onclick = () => setHl(r.dataset.id);
  });
  $('#partsTbl').onmouseleave = () => setHl(null);
  $('#diffList').innerHTML = tr(DIFFS[key()]).map(s => `<li>${esc(s)}</li>`).join('');
  setHl(highlight);
}
function renderPins() {
  $('#pinTbl').innerHTML = `<tr><th>${T('wiring.module')}</th><th>${T('wiring.pin')}</th><th>${T('wiring.board')}</th></tr>` +
    PINS[key()].map(([m, p, b]) => `<tr><td>${esc(m)}</td><td>${esc(p)}</td><td>${b === '—' ? `<span class="nc">${T('wiring.nc')}</span>` : esc(b)}</td></tr>`).join('');
  $('#pinNote').hidden = key() === 'original';
}
function renderCompare() {
  const L = state.lang === 'uk' ? 0 : 1;
  const cols = ['touch', 'ink', 'original'];
  const head = `<tr><th>${T('versions.param')}</th>${cols.map(v => `<th class="${v === key() ? 'cur' : ''}">${T('col.' + v)}</th>`).join('')}</tr>`;
  $('#cmpTbl').innerHTML = head + COMPARE.map(r => `<tr><th>${esc(r[L])}</th>${r.slice(2).map((c, i) =>
    `<td class="${cols[i] === key() ? 'cur' : ''}">${esc(tr(c))}</td>`).join('')}</tr>`).join('');
}
function renderScreenSide() {
  $('#wxState').textContent = T(weather.live ? 'screen.live' : 'screen.static');
  screenCanvas.classList.toggle('ink', screen.version === 'ink');
  renderScreensPanel();
}

// --- Галерея + lightbox ---
$('#grid').innerHTML = GALLERY.map(src => `<img src="${src}" alt="Lander R2" loading="lazy">`).join('');
$('#grid').onclick = e => { if (e.target.tagName === 'IMG') { $('#lightbox img').src = e.target.src; $('#lightbox').hidden = false; } };
$('#lightbox').onclick = () => { $('#lightbox').hidden = true; };
addEventListener('keydown', e => { if (e.key === 'Escape') $('#lightbox').hidden = true; });

// --- Мова / версія ---
async function setLang(l) {
  state.lang = l; store.set('lang', l);
  try { state.dict = await (await fetch(`i18n/${l}.json`)).json(); } catch (e) { console.warn('i18n', e); }
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  document.querySelectorAll('#langSwitch button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  screen.lang = l; screen.draw();
  renderAll();
  if (state.sel) select(state.sel.kind, state.sel.id);
}
function setVersion(v, push = true) {
  if (v === 'touch' || v === 'ink') { state.display = v; v = 'r2'; }
  if (!VERSIONS.includes(v)) v = 'r2';
  state.version = v; store.set('version3', v);
  if (push) history.replaceState(null, '', `#v=${v}`);
  document.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  document.querySelectorAll('.only-r2').forEach(el => el.classList.toggle('hidden', v !== 'r2'));
  screen.setVersion(key() === 'ink' ? 'ink' : 'touch'); state.sel = null;
  rebuildModels();
  renderAll();
}
function setDisplay(d) {
  state.display = d === 'ink' ? 'ink' : 'touch'; store.set('display', state.display);
  if (state.version !== 'r2') return setVersion('r2');
  screen.setVersion(state.display); state.sel = null;
  rebuildModels();
  renderAll();
}
function renderAll() { renderSteps(); renderParts(); renderPins(); renderCompare(); renderScreenSide(); }

document.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => setVersion(b.dataset.v)));
document.querySelectorAll('#langSwitch button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
const hashV = () => (location.hash.match(/v=(\w+)/) || [])[1];
addEventListener('hashchange', () => { const v = hashV(); if (v && v !== state.version) setVersion(v, false); });

setVersion(hashV() || store.get('version3') || 'r2', !!hashV());
await setLang(state.lang);
loadWeather().then(() => { screen.draw(); renderScreenSide(); });
loadExtras().then(() => screen.draw());
