import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildLander, Viewer, STEP_IDS } from './lander-model.js';
import { Screen, loadBmp, loadWeather, weather } from './screen.js';
import { VERSIONS, STEPS, PARTS, PINS, DIFFS, COMPARE, GALLERY } from './data.js';

const $ = s => document.querySelector(s);
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

const state = { lang: store.get('lang') === 'en' ? 'en' : 'uk', version: 'original', step: 1, dict: {} };
const tr = o => (o && typeof o === 'object' ? o[state.lang] : o);
const T = k => state.dict[k] ?? k;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// --- Екран-емулятор (спільний канвас: і сторінка, і текстура 3D) ---
const screenCanvas = $('#screenCanvas');
const screen = new Screen(screenCanvas, null);
loadBmp('img/background04.bmp').then(bg => { screen.bg = bg; screen.draw(); }).catch(e => console.warn('BMP', e));

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
  for (const v of viewers) v.setModel(buildLander(state.version, screenCanvas));
}
setInterval(() => {
  if (state.version !== 'ink') screen.draw();
  for (const v of viewers) { const tx = v.model?.userData.screenTex; if (tx) tx.needsUpdate = true; }
}, 1000);
// e-ink: автоматичне оновлення раз на 10 хв
setInterval(() => { if (state.version === 'ink') inkRefresh(); }, 600000);

// --- Збірка по кроках ---
function stepText(id) {
  const s = STEPS[id];
  return tr(s[state.version] ?? s);
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
    PARTS[state.version].map(p => `<tr data-id="${p[0]}"><td>${esc(p[L])}</td><td>${esc(p[3])}</td></tr>`).join('');
  document.querySelectorAll('#partsTbl tr[data-id]').forEach(r => {
    r.onmouseenter = () => setHl(r.dataset.id);
    r.onclick = () => setHl(r.dataset.id);
  });
  $('#partsTbl').onmouseleave = () => setHl(null);
  $('#diffList').innerHTML = tr(DIFFS[state.version]).map(s => `<li>${esc(s)}</li>`).join('');
  setHl(highlight);
}
function renderPins() {
  $('#pinTbl').innerHTML = `<tr><th>${T('wiring.module')}</th><th>${T('wiring.pin')}</th><th>${T('wiring.board')}</th></tr>` +
    PINS[state.version].map(([m, p, b]) => `<tr><td>${esc(m)}</td><td>${esc(p)}</td><td>${b === '—' ? `<span class="nc">${T('wiring.nc')}</span>` : esc(b)}</td></tr>`).join('');
  $('#pinNote').hidden = state.version === 'original';
}
function renderCompare() {
  const L = state.lang === 'uk' ? 0 : 1;
  const head = `<tr><th>${T('versions.param')}</th>${VERSIONS.map(v => `<th class="${v === state.version ? 'cur' : ''}">${T('v.' + v)}</th>`).join('')}</tr>`;
  $('#cmpTbl').innerHTML = head + COMPARE.map(r => `<tr><th>${esc(r[L])}</th>${r.slice(2).map((c, i) =>
    `<td class="${VERSIONS[i] === state.version ? 'cur' : ''}">${esc(tr(c))}</td>`).join('')}</tr>`).join('');
}
function renderScreenSide() {
  $('#emuHint').textContent = state.version === 'touch' ? T('screen.touch') : state.version === 'ink' ? T('screen.ink') : '';
  $('#inkRefresh').hidden = state.version !== 'ink';
  $('#wxState').textContent = T(weather.live ? 'screen.live' : 'screen.static');
  screenCanvas.classList.toggle('ink', state.version === 'ink');
}
function inkRefresh() {
  let n = 0;
  const tick = () => {
    screenCanvas.classList.toggle('flash');
    if (++n < 6) setTimeout(tick, 120);
    else { screenCanvas.classList.remove('flash'); screen.draw(); viewers.forEach(v => { const tx = v.model?.userData.screenTex; if (tx) tx.needsUpdate = true; }); }
  };
  tick();
}
$('#inkRefresh').onclick = inkRefresh;

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
  screen.lang = l;
  if (state.version === 'ink') screen.draw();
  renderAll();
}
function setVersion(v, push = true) {
  if (!VERSIONS.includes(v)) v = 'original';
  state.version = v; store.set('version', v);
  if (push) history.replaceState(null, '', `#v=${v}`);
  document.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  screen.setVersion(v);
  rebuildModels();
  renderAll();
}
function renderAll() { renderSteps(); renderParts(); renderPins(); renderCompare(); renderScreenSide(); }

document.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => setVersion(b.dataset.v)));
document.querySelectorAll('#langSwitch button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
const hashV = () => (location.hash.match(/v=(\w+)/) || [])[1];
addEventListener('hashchange', () => { const v = hashV(); if (v && v !== state.version) setVersion(v, false); });

setVersion(hashV() || store.get('version') || 'original', !!hashV());
await setLang(state.lang);
loadWeather().then(() => { screen.draw(); renderScreenSide(); });
