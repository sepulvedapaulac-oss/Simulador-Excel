/* ==========================================================================
   Motor de lecciones TLS · PEMP — navegación, SCORM 1.2, narración, video
   e interacciones. Las lecciones solo declaran contenido con atributos
   data-c="tipo" y data-key="clave"; este archivo hace el resto.
   ========================================================================== */
(() => {
'use strict';
const CFG = window.LESSON || {};
const AUDIO = window.AUDIO || {};
const ADUR = window.ADUR || {};
const IMGS = window.IMGS || {};
const NARR = readJSON('narr-data') || {};
const PASS = CFG.pass || 80;
const LS_KEY = 'tls_' + (CFG.id || 'leccion');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const LET = 'ABCDEFGH';

function readJSON(id, root = document) {
  const s = typeof id === 'string' ? root.getElementById ? root.getElementById(id) : null : id;
  if (!s) return null;
  try { return JSON.parse(s.textContent); } catch (e) { console.error('JSON inválido en', id, e); return null; }
}

/* ---------- Imágenes ---------- */
$$('img[data-img]').forEach(i => { if (IMGS[i.dataset.img]) i.src = IMGS[i.dataset.img]; });

/* ---------- Estado ---------- */
const state = { cur: 0, done: {}, first: {}, score: null, best: null, fin: false, tr: null };
const screens = $$('.screen');
let api = null, apiOn = false;

function findAPI(w) {
  let n = 0;
  while (w && n < 15) {
    try { if (w.API) return w.API; } catch (e) {}
    try { if (w.parent && w.parent !== w) w = w.parent; else break; } catch (e) { break; }
    n++;
  }
  try { if (window.opener && window.opener !== window) return findAPI(window.opener); } catch (e) {}
  return null;
}
function lms(fn, a, b) {
  if (!api || typeof api[fn] !== 'function') return null;
  try { return b === undefined ? api[fn](a) : api[fn](a, b); } catch (e) { return null; }
}
function load() {
  if (/[?&]reset=1/.test(location.search)) { try { localStorage.removeItem(LS_KEY); } catch (e) {} }
  api = findAPI(window);
  let raw = null;
  if (api) {
    apiOn = String(lms('LMSInitialize', '')) === 'true';
    if (apiOn) {
      const st = lms('LMSGetValue', 'cmi.core.lesson_status');
      if (!st || st === 'not attempted') lms('LMSSetValue', 'cmi.core.lesson_status', 'incomplete');
      raw = lms('LMSGetValue', 'cmi.suspend_data');
      lms('LMSSetValue', 'cmi.core.score.min', '0');
      lms('LMSSetValue', 'cmi.core.score.max', '100');
    }
  }
  if (!apiOn) { try { raw = localStorage.getItem(LS_KEY); } catch (e) {} }
  if (raw) {
    try {
      const s = JSON.parse(raw);
      Object.assign(state, { cur: s.c || 0, done: s.d || {}, first: s.f || {}, score: s.s ?? null, best: s.b ?? null, fin: !!s.z, tr: s.t || null });
    } catch (e) {}
  }
  if (apiOn) {
    const loc = parseInt(lms('LMSGetValue', 'cmi.core.lesson_location'), 10);
    if (Number.isInteger(loc) && loc >= 0 && loc < screens.length) state.cur = loc;
  }
}
function save() {
  const data = JSON.stringify({ c: state.cur, d: state.done, f: state.first, s: state.score, b: state.best, z: state.fin ? 1 : 0, t: state.tr });
  if (apiOn) {
    lms('LMSSetValue', 'cmi.core.lesson_location', String(state.cur));
    lms('LMSSetValue', 'cmi.suspend_data', data.slice(0, 4000));
    if (state.best != null) lms('LMSSetValue', 'cmi.core.score.raw', String(state.best));
    lms('LMSSetValue', 'cmi.core.exit', state.fin ? '' : 'suspend');
    lms('LMSCommit', '');
  } else {
    try { localStorage.setItem(LS_KEY, data); } catch (e) {}
  }
}
function finishLMS() {
  if (!apiOn) return;
  lms('LMSSetValue', 'cmi.core.score.raw', String(state.best ?? 0));
  lms('LMSSetValue', 'cmi.core.lesson_status', 'passed');
  lms('LMSSetValue', 'cmi.core.exit', '');
  lms('LMSCommit', '');
}
window.addEventListener('pagehide', () => { if (apiOn) { save(); lms('LMSFinish', ''); apiOn = false; } });

/* ---------- Registro de avance ---------- */
function done(key) {
  if (!key || state.done[key]) return;
  state.done[key] = 1;
  save(); refresh();
}
function first(key, ok) { if (key && state.first[key] === undefined) { state.first[key] = ok ? 1 : 0; save(); } }

/* ---------- Pantallas, ruta y navegación ---------- */
const gates = screens.map(s => (s.dataset.gate || '').split(/\s+/).filter(Boolean));
const satisfied = i => gates[i].every(k => state.done[k]);
const reachable = i => state.fin || i === 0 || screens.slice(0, i).every((_, j) => satisfied(j));

const routeList = $('#route-list');
screens.forEach((s, i) => {
  const li = el('li');
  const b = el('button', null, `<span class="n"><span>${i + 1}</span></span><span>${s.dataset.title}</span>`);
  b.type = 'button';
  b.addEventListener('click', () => { if (reachable(i)) { go(i); document.body.classList.remove('route-open'); } });
  li.append(b); routeList.append(li);
});
$('#menu-btn').addEventListener('click', () => document.body.classList.toggle('route-open'));
$('#scrim').addEventListener('click', () => document.body.classList.remove('route-open'));

/* Cromo común de cada pantalla: narración y navegación inferior */
screens.forEach((s, i) => {
  const head = $('.scr-head', s) || s.firstElementChild;
  const id = s.dataset.id;
  if (AUDIO[id] || NARR[id]) {
    const bar = el('div', 'narr', `<button class="narr-btn" type="button"><span class="ic">▶</span><span class="t">Escuchar a Ninoska</span></button><div class="narr-track"><i></i></div><small>Narración de la pantalla</small>`);
    head.after(bar);
    $('.narr-btn', bar).addEventListener('click', () => narr.toggle(id));
  }
  const nav = el('nav', 'scr-nav');
  nav.setAttribute('aria-label', 'Navegación de la pantalla');
  const prev = el('button', 'btn ghost', '← Anterior'); prev.type = 'button';
  const msg = el('div', 'gate-msg'); msg.setAttribute('aria-live', 'polite');
  const next = el('button', 'btn', i === screens.length - 2 ? 'Ver resultados →' : 'Continuar →'); next.type = 'button';
  prev.addEventListener('click', () => go(i - 1));
  next.addEventListener('click', () => { if (satisfied(i)) go(i + 1); });
  if (i === 0) prev.style.visibility = 'hidden';
  if (i === screens.length - 1) next.style.display = 'none';
  nav.append(prev, msg, next);
  const src = $('.sources', s);
  if (src) src.before(nav); else s.append(nav);
  s._next = next; s._msg = msg;
});

function refresh() {
  const lis = $$('li', routeList);
  let doneCount = 0;
  screens.forEach((s, i) => {
    if (satisfied(i) && gates[i].length) doneCount++;
    const li = lis[i];
    li.className = '';
    if (i === state.cur) li.classList.add('current');
    if (satisfied(i) && (gates[i].length || i < state.cur || state.fin)) li.classList.add('done');
    if (!reachable(i)) li.classList.add('locked');
    $('button', li).disabled = !reachable(i);
    if (s._next.disabled && satisfied(i) && i === state.cur) { s._next.classList.remove('ready'); void s._next.offsetWidth; s._next.classList.add('ready'); }
    s._next.disabled = !satisfied(i);
    s._msg.className = 'gate-msg' + (satisfied(i) ? ' ok' : '');
    s._msg.textContent = satisfied(i)
      ? (i === screens.length - 1 ? '' : '✓ Pantalla completada')
      : (s.dataset.need || 'Completa la actividad de esta pantalla para continuar');
  });
  const gated = gates.filter(g => g.length).length;
  const pct = state.fin ? 100 : Math.round(doneCount / Math.max(1, gated) * 100);
  $('#pct').textContent = pct + '%';
  $('#bar').style.width = pct + '%';
  const foot = $('#route-foot');
  foot.innerHTML = state.fin
    ? '<strong>Lección completada.</strong> Navegación libre para repasar.'
    : `Avance: <strong>${pct}%</strong><br>Las pantallas se desbloquean al completar su actividad.` + (state.best != null ? `<br>Mejor puntaje: <strong>${state.best}%</strong>` : '');
}

function go(i) {
  i = Math.max(0, Math.min(screens.length - 1, i));
  if (!reachable(i)) return;
  narr.stop();
  screens.forEach((s, j) => s.classList.toggle('active', j === i));
  state.cur = i; save(); refresh();
  window.scrollTo({ top: 0, behavior: 'auto' });
  const h = $('h1,h2', screens[i]);
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  const s = screens[i];
  s.dispatchEvent(new CustomEvent('enter'));
  if (narr.auto && (AUDIO[s.dataset.id] || NARR[s.dataset.id])) setTimeout(() => narr.play(s.dataset.id), 350);
}

/* ---------- Narración ---------- */
const narr = {
  auto: true, a: new Audio(), key: null, synth: null,
  btn(key) { const s = screens.find(x => x.dataset.id === key); return s ? $('.narr', s) : null; },
  ui(key, playing, p) {
    const bar = this.btn(key); if (!bar) return;
    $('.narr-btn', bar).classList.toggle('playing', playing);
    $('.ic', bar).textContent = playing ? '❚❚' : '▶';
    $('.t', bar).textContent = playing ? 'Pausar narración' : 'Escuchar a Ninoska';
    if (p != null) $('.narr-track i', bar).style.width = (p * 100) + '%';
  },
  play(key) {
    this.stop(); this.key = key;
    if (AUDIO[key]) {
      this.a.src = AUDIO[key]; this.a.currentTime = 0;
      this.a.play().then(() => this.ui(key, true)).catch(() => this.ui(key, false));
    } else if (NARR[key] && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(NARR[key]); u.lang = 'es-CL'; u.rate = 1;
      u.onend = () => { this.ui(key, false, 1); this.synth = null; };
      this.synth = u; speechSynthesis.speak(u); this.ui(key, true);
    }
  },
  stop() {
    if (this.key) this.ui(this.key, false);
    this.a.pause();
    if (this.synth) { speechSynthesis.cancel(); this.synth = null; }
  },
  toggle(key) {
    if (this.key === key && ((AUDIO[key] && !this.a.paused) || this.synth)) { this.stop(); return; }
    if (this.key === key && AUDIO[key] && this.a.currentTime > 0 && !this.a.ended) { this.a.play(); this.ui(key, true); return; }
    this.play(key);
  }
};
narr.a.addEventListener('timeupdate', () => { if (narr.key && narr.a.duration) narr.ui(narr.key, !narr.a.paused, narr.a.currentTime / narr.a.duration); });
narr.a.addEventListener('ended', () => narr.key && narr.ui(narr.key, false, 1));
try { const v = localStorage.getItem('tls_autonarr'); if (v != null) narr.auto = v === '1'; } catch (e) {}
const autoBox = $('#auto-narr');
autoBox.checked = narr.auto;
autoBox.addEventListener('change', () => { narr.auto = autoBox.checked; try { localStorage.setItem('tls_autonarr', narr.auto ? '1' : '0'); } catch (e) {} if (!narr.auto) narr.stop(); });

/* ---------- Utilidades de interacción ---------- */
function fbBox(root, after) { let f = $(':scope > .fb', root); if (!f) { f = el('div', 'fb'); f.setAttribute('role', 'status'); f.setAttribute('aria-live', 'polite'); (after || root).append(f); } return f; }
function say(f, kind, html) { f.className = 'fb show ' + kind; f.innerHTML = html; }
function letters(opts) { opts.forEach((o, i) => { if (!$('.l', o)) o.prepend(el('span', 'l', LET[i])); o.type = 'button'; }); }
function shuffleNot(arr) { // permutación determinista que nunca deja el orden original
  if (arr.length < 2) return arr.slice();
  const out = arr.slice(); const n = out.length;
  for (let i = 0; i < n; i++) { const j = (i * 7 + 3) % n; [out[i], out[j]] = [out[j], out[i]]; }
  if (out.every((x, i) => x === arr[i])) out.push(out.shift());
  return out;
}
const C = {};

/* Decisión con consecuencias (Inicio y decisiones sueltas) */
C.decision = (root, key) => {
  const opts = $$('.opt', root); letters(opts);
  const f = fbBox(root);
  opts.forEach(o => o.addEventListener('click', () => {
    const ok = o.hasAttribute('data-ok');
    first(key, ok);
    opts.forEach(x => x.classList.remove('ko'));
    o.classList.add(ok ? 'ok' : 'ko');
    say(f, ok ? 'good' : 'bad', `<strong>${ok ? 'Buena decisión.' : 'Consecuencia:'}</strong> ${o.dataset.fb || ''}${ok ? '' : '<br><em>Vuelve a decidir.</em>'}`);
    if (ok) { opts.forEach(x => x.disabled = true); done(key); }
  }));
  if (state.done[key]) { const o = opts.find(x => x.hasAttribute('data-ok')); o.classList.add('ok'); opts.forEach(x => x.disabled = true); say(f, 'good', `<strong>Buena decisión.</strong> ${o.dataset.fb || ''}`); }
};

/* Video propio narrado, con subtítulos y capítulos */
C.video = (root, key) => {
  const scenes = readJSON('video-data') || [];
  const player = el('div', 'vplayer');
  const stage = el('div', 'vstage');
  const sub = el('div', 'vsub'); sub.setAttribute('aria-live', 'off');
  const big = el('button', 'vbig', '<span>▶</span>'); big.type = 'button'; big.setAttribute('aria-label', 'Reproducir video');
  const nodes = scenes.map((sc, i) => {
    const n = el('div', 'vscene', `<img alt="" ${IMGS[sc.img] ? `src="${IMGS[sc.img]}"` : ''}><div class="shade"></div><div class="vtxt"><div class="vk">${i + 1} · ${sc.k || ''}</div><h3>${sc.t}</h3><ul>${(sc.pts || []).map(p => `<li>${p}</li>`).join('')}</ul></div>`);
    stage.append(n); return n;
  });
  stage.append(sub, big);
  const ctrl = el('div', 'vctrl', `<button type="button" data-a="play" aria-label="Reproducir">▶</button><button type="button" data-a="prev" aria-label="Escena anterior">⏮</button><button type="button" data-a="next" aria-label="Escena siguiente">⏭</button><div class="vprog" title="Progreso del video"><i></i></div><span class="vtime">0:00 / 0:00</span><button type="button" data-a="cc" aria-pressed="true" aria-label="Subtítulos">CC</button>`);
  player.append(stage, ctrl);
  const chaps = el('div', 'chapters');
  scenes.forEach((sc, i) => { const b = el('button', 'chap', `<span class="cn">${i + 1}</span><span>${sc.t}</span>`); b.type = 'button'; b.addEventListener('click', () => { seek(i); play(); }); chaps.append(b); });
  const note = el('p', 'how', 'Mira los capítulos del video. Cada capítulo queda marcado ✓ cuando lo ves casi completo; puedes saltar entre ellos.');
  const count = el('p', 'vcount'); count.setAttribute('aria-live', 'polite');
  const unmute = el('button', 'vunmute', '🔊 Activar sonido'); unmute.type = 'button'; unmute.hidden = true;
  stage.append(unmute);
  const wrap = el('div', 'vwrap'); const side = el('div', 'vside'); side.append(count, chaps); wrap.append(player, side);
  root.append(wrap); void note;

  const durs = scenes.map((sc, i) => ADUR['v' + (i + 1)] || Math.max(8, (sc.txt || '').length / 14));
  const total = durs.reduce((a, b) => a + b, 0);
  const cues = scenes.map((sc, i) => {
    const parts = (sc.txt || '').split(/(?<=[.!?…:;])\s+/).filter(Boolean);
    const len = parts.reduce((a, p) => a + p.length, 0) || 1; let acc = 0;
    return parts.map(p => { const c = { t0: acc / len * durs[i], text: p }; acc += p.length; return c; });
  });
  // Capítulos vistos: se guardan en el avance para que no se pierdan al salir y volver.
  const seen = new Set(scenes.map((_, i) => i).filter(i => state.done[key] || state.done[key + '_c' + i]));
  const audio = new Audio(); audio.preload = 'auto';
  let cur = 0, t = 0, playing = false, timer = null, last = 0, cc = true, silent = false, loaded = '', ign = false;
  const stopAudio = () => { if (!audio.paused) { ign = true; audio.pause(); } };
  const hasAudio = i => !!AUDIO['v' + (i + 1)];

  function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function markSeen(i) {
    if (seen.has(i)) return;
    seen.add(i); state.done[key + '_c' + i] = 1; save();
    if (seen.size === scenes.length) done(key);
  }
  function render() {
    nodes.forEach((n, i) => n.classList.toggle('on', i === cur));
    const pts = $$('li', nodes[cur]);
    pts.forEach((li, j) => li.classList.toggle('in', t >= durs[cur] * (j + 1) / (pts.length + 1.5) || seen.has(cur) && !playing));
    const cue = cues[cur].filter(c => c.t0 <= t + 0.05).pop();
    sub.textContent = cc && cue ? cue.text : '';
    const before = durs.slice(0, cur).reduce((a, b) => a + b, 0);
    $('.vprog i', ctrl).style.width = Math.min(100, (before + t) / total * 100) + '%';
    $('.vtime', ctrl).textContent = fmt(before + t) + ' / ' + fmt(total);
    $$('.chap', chaps).forEach((c, i) => { c.classList.toggle('seen', seen.has(i)); c.classList.toggle('cur', i === cur); });
    $('[data-a=play]', ctrl).textContent = playing ? '❚❚' : '▶';
    big.hidden = playing;
    unmute.hidden = !(playing && silent && hasAudio(cur));
    const left = scenes.length - seen.size;
    count.className = 'vcount' + (left ? '' : ' ok');
    count.textContent = left ? `Capítulos vistos: ${seen.size} de ${scenes.length}. Te faltan: ${scenes.map((_, i) => i).filter(i => !seen.has(i)).map(i => i + 1).join(', ')}.` : `✓ Viste los ${scenes.length} capítulos. Ya puedes continuar.`;
  }
  function loadScene() {
    const k = 'v' + (cur + 1);
    if (hasAudio(cur) && loaded !== k) { audio.src = AUDIO[k]; loaded = k; }
    if (hasAudio(cur)) { try { audio.currentTime = t; } catch (e) {} }
  }
  function tryAudio() {
    if (!hasAudio(cur)) return;
    audio.play().then(() => { silent = false; render(); }).catch(() => { silent = true; last = performance.now(); render(); });
  }
  function sceneEnd() {
    markSeen(cur);
    if (cur < scenes.length - 1) { cur++; t = 0; restartImg(); loadScene(); if (playing) tryAudio(); render(); }
    else { pause(); t = durs[cur]; render(); }
  }
  function tick(ts) {
    if (!playing) return;
    const useAudio = hasAudio(cur) && !silent && !audio.paused;
    if (useAudio) { t = audio.currentTime; last = ts; }
    else { t += Math.min(0.25, (ts - last) / 1000); last = ts; if (t >= durs[cur]) { sceneEnd(); } }
    if (t >= durs[cur] * 0.9) markSeen(cur);
    render();
    timer = requestAnimationFrame(tick);
  }
  function restartImg() { const im = nodes[cur].querySelector('img'); im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; }
  function play() {
    narr.stop(); playing = true; last = performance.now();
    if (cur === scenes.length - 1 && t >= durs[cur] - 0.3) { cur = 0; t = 0; restartImg(); }
    loadScene(); tryAudio();
    cancelAnimationFrame(timer); timer = requestAnimationFrame(tick); render();
  }
  function pause() { playing = false; stopAudio(); cancelAnimationFrame(timer); render(); }
  function seek(i) { stopAudio(); cur = i; t = 0; restartImg(); loadScene(); render(); }
  audio.addEventListener('ended', () => { if (playing && !silent) sceneEnd(); });
  // Si el navegador detiene el audio por su cuenta, el video sigue en silencio con subtítulos.
  audio.addEventListener('pause', () => { if (ign) { ign = false; return; } if (playing && !audio.ended && !silent) { silent = true; last = performance.now(); render(); } });
  unmute.addEventListener('click', () => { loadScene(); audio.play().then(() => { silent = false; render(); }).catch(() => {}); });
  big.addEventListener('click', play);
  ctrl.addEventListener('click', e => {
    const a = e.target.closest('button')?.dataset.a; if (!a) return;
    if (a === 'play') playing ? pause() : play();
    if (a === 'prev') { const p = playing; seek(Math.max(0, cur - 1)); if (p) play(); }
    if (a === 'next') { const p = playing; seek(Math.min(scenes.length - 1, cur + 1)); if (p) play(); }
    if (a === 'cc') { cc = !cc; e.target.setAttribute('aria-pressed', cc); render(); }
  });
  $('.vprog', ctrl).addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect(); let x = (e.clientX - r.left) / r.width * total;
    let i = 0; while (i < durs.length - 1 && x > durs[i]) { x -= durs[i]; i++; }
    const p = playing; stopAudio(); cur = i; t = Math.max(0, Math.min(x, durs[i] - .2)); restartImg(); loadScene(); if (p) play(); else render();
  });
  root.closest('.screen').addEventListener('leave', pause);
  root.closest('.screen').addEventListener('enter', () => { if (narr.auto && !seen.size) play(); });
  render();
};

/* Tarjetas que giran */
C.flip = (root, key) => {
  const cards = $$('.flip', root);
  cards.forEach(c => { c.type = 'button'; c.setAttribute('aria-pressed', 'false'); c.addEventListener('click', () => {
    c.classList.toggle('on'); c.classList.add('seen'); c.setAttribute('aria-pressed', c.classList.contains('on'));
    if (cards.every(x => x.classList.contains('seen'))) done(key);
  }); if (state.done[key]) c.classList.add('seen'); });
};

/* Pestañas */
C.tabs = (root, key) => {
  const tabs = $$('.tab', root), panels = $$('.tabpanel', root);
  const sel = i => {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach((p, j) => p.hidden = i !== j);
    tabs[i].classList.add('seen');
    if (tabs.every(t => t.classList.contains('seen'))) done(key);
  };
  tabs.forEach((t, i) => { t.type = 'button'; t.setAttribute('role', 'tab'); t.addEventListener('click', () => sel(i));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[n].focus(); sel(n); } }); });
  panels.forEach(p => p.setAttribute('role', 'tabpanel'));
  if (state.done[key]) tabs.forEach(t => t.classList.add('seen'));
  sel(0);
};

/* Clasificar arrastrando o tocando */
C.classify = (root, key) => {
  const pool = $('.pool', root), bins = $$('.bin', root), chips = $$('.chip', root);
  const f = fbBox(root);
  const total = chips.length;
  let sel = null;
  bins.forEach(b => { if (!$('header small', b)) $('header', b).append(el('small', null, '')); });
  const count = () => bins.forEach(b => { $('header small', b).textContent = $$('.chip', b).length || ''; });
  const name = b => $('header', b).firstChild.textContent.trim();
  function drop(chip, bin) {
    bins.forEach(b => b.classList.remove('ready', 'hover'));
    chip.classList.remove('sel'); sel = null;
    if (!bin) return;
    if (chip.dataset.bin === bin.dataset.bin) {
      chip.classList.add('ok'); chip.disabled = true; bin.append(chip); count(); pool.classList.toggle('empty', !$('.chip', pool));
      say(f, 'good', `<strong>Correcto: ${name(bin)}.</strong> ${chip.dataset.why || ''}`);
      if ($$('.chip.ok', root).length === total) { done(key); say(f, 'good', `<strong>¡Clasificación completa!</strong> ${root.dataset.end || ''}`); }
    } else {
      chip.classList.remove('shake'); void chip.offsetWidth; chip.classList.add('shake');
      say(f, 'bad', `<strong>No corresponde a «${name(bin)}».</strong> ${chip.dataset.hint || root.dataset.hint || 'Revisa la descripción e inténtalo de nuevo.'}`);
    }
  }
  chips.forEach(chip => {
    chip.type = 'button';
    let sx, sy, ghost = null, moved = false;
    chip.addEventListener('pointerdown', e => {
      if (chip.disabled) return;
      sx = e.clientX; sy = e.clientY; moved = false; chip.setPointerCapture(e.pointerId);
    });
    chip.addEventListener('pointermove', e => {
      if (sx == null || chip.disabled) return;
      if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
        moved = true; ghost = chip.cloneNode(true); ghost.classList.add('drag'); ghost.style.width = chip.offsetWidth + 'px'; document.body.append(ghost);
      }
      if (moved) {
        ghost.style.left = (e.clientX - 20) + 'px'; ghost.style.top = (e.clientY - 18) + 'px';
        const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.bin');
        bins.forEach(b => b.classList.toggle('hover', b === over));
      }
    });
    chip.addEventListener('pointerup', e => {
      if (sx == null) return; sx = null;
      if (moved) { ghost.remove(); ghost = null; const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.bin'); drop(chip, bins.includes(over) ? over : null); }
      else if (!chip.disabled) {
        if (sel === chip) { chip.classList.remove('sel'); sel = null; bins.forEach(b => b.classList.remove('ready')); return; }
        if (sel) sel.classList.remove('sel');
        sel = chip; chip.classList.add('sel'); bins.forEach(b => b.classList.add('ready'));
        say(f, 'info', `Elegiste: <strong>${chip.textContent}</strong>. Ahora toca la categoría donde corresponde.`);
      }
    });
    chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0 })); chip.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 0 })); } });
  });
  bins.forEach(b => { b.tabIndex = 0; b.setAttribute('role', 'button');
    b.addEventListener('click', e => { if (sel && !e.target.closest('.chip')) drop(sel, b); });
    b.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && sel) { e.preventDefault(); drop(sel, b); } }); });
  if (state.done[key]) { chips.forEach(c => { const b = bins.find(x => x.dataset.bin === c.dataset.bin); c.classList.add('ok'); c.disabled = true; b.append(c); }); count(); pool.classList.add('empty'); say(f, 'good', '<strong>Clasificación completa.</strong> ' + (root.dataset.end || '')); }
};

/* Mito o realidad (todas las tarjetas a la vista) */
C.tf = (root, key) => {
  const cards = $$('.tf-card', root);
  const A = root.dataset.a || 'Mito', B = root.dataset.b || 'Realidad';
  cards.forEach(c => {
    const bt = el('div', 'tf-btns', `<button type="button" data-v="a">${A}</button><button type="button" data-v="b">${B}</button>`);
    const f = el('div', 'fb'); c.append(bt, f);
    $$('button', bt).forEach(b => b.addEventListener('click', () => {
      const ok = b.dataset.v === c.dataset.ans;
      $$('button', bt).forEach(x => x.classList.remove('ko'));
      b.classList.add(ok ? 'ok' : 'ko');
      say(f, ok ? 'good' : 'bad', (ok ? '<strong>Correcto.</strong> ' : `<strong>No: es ${c.dataset.ans === 'a' ? A.toLowerCase() : B.toLowerCase()}.</strong> `) + (ok ? c.dataset.why : 'Vuelve a intentarlo.'));
      if (ok) { $$('button', bt).forEach(x => x.disabled = true); c.dataset.ok = 1; }
      if (cards.every(x => x.dataset.ok)) done(key);
    }));
    if (state.done[key]) { const b = $(`[data-v="${c.dataset.ans}"]`, bt); b.classList.add('ok'); $$('button', bt).forEach(x => x.disabled = true); c.dataset.ok = 1; say(f, 'good', '<strong>Correcto.</strong> ' + c.dataset.why); }
  });
};

/* Mazo de señales: una tarjeta a la vez */
C.deck = (root, key) => {
  const items = $$('.dk', root).map(d => ({ text: d.innerHTML, ans: d.dataset.ans, why: d.dataset.why }));
  $$('.dk', root).forEach(d => d.remove());
  const A = root.dataset.a, B = root.dataset.b;
  const wrap = el('div', 'deck');
  const count = el('div', 'deck-count');
  const card = el('div', 'deck-card');
  const btns = el('div', 'deck-btns', `<button type="button" class="l">✓ ${A}</button><button type="button" class="r">⚠ ${B}</button>`);
  const f = el('div', 'fb'); f.setAttribute('aria-live', 'polite');
  const nx = el('button', 'btn teal', 'Siguiente señal →'); nx.type = 'button'; nx.style.display = 'none'; nx.style.marginTop = '10px';
  const sum = el('div', 'deck-done');
  wrap.append(count, card, btns, f, nx); root.append(wrap, sum);
  let i = 0;
  const show = () => {
    count.textContent = `Señal ${i + 1} de ${items.length}`;
    card.className = 'deck-card'; card.innerHTML = `<div class="sig">Señal observada</div>${items[i].text}`;
    f.className = 'fb'; nx.style.display = 'none'; btns.style.display = '';
  };
  const summary = () => {
    wrap.style.display = 'none';
    sum.innerHTML = `<div><h4>✓ ${A}</h4><ul>${items.filter(x => x.ans === 'a').map(x => `<li>${x.text}</li>`).join('')}</ul></div><div><h4>⚠ ${B}</h4><ul>${items.filter(x => x.ans === 'b').map(x => `<li>${x.text}</li>`).join('')}</ul></div>`;
    const again = el('button', 'btn ghost', 'Repetir el mazo'); again.type = 'button'; again.style.marginTop = '12px';
    again.addEventListener('click', () => { i = 0; sum.innerHTML = ''; wrap.style.display = ''; show(); });
    sum.append(again);
  };
  $$('button', btns).forEach(b => b.addEventListener('click', () => {
    const v = b.classList.contains('l') ? 'a' : 'b'; const it = items[i];
    if (v === it.ans) {
      card.classList.add(v === 'a' ? 'out-l' : 'out-r'); btns.style.display = 'none';
      say(f, 'good', `<strong>Correcto: ${v === 'a' ? A : B}.</strong> ${it.why}`);
      nx.style.display = ''; nx.textContent = i < items.length - 1 ? 'Siguiente señal →' : 'Ver resumen →';
      nx.focus();
    } else {
      card.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 300 });
      say(f, 'bad', `<strong>Revisa la señal.</strong> ${root.dataset.hint || ''}`);
    }
  }));
  nx.addEventListener('click', () => { i++; if (i < items.length) show(); else { done(key); summary(); } });
  if (state.done[key]) summary(); else show();
};

/* Unir conceptos */
C.match = (root, key) => {
  const pairs = $$('.pair', root).map((p, i) => ({ i, l: p.dataset.l, r: p.dataset.r }));
  $$('.pair', root).forEach(p => p.remove());
  const box = el('div', 'match');
  const L = el('div', 'col'), R = el('div', 'col');
  pairs.forEach(p => { const b = el('button', 'mi', `<span class="k">${LET[p.i]}</span><span>${p.l}</span>`); b.type = 'button'; b.dataset.i = p.i; b.dataset.s = 'l'; L.append(b); });
  shuffleNot(pairs).forEach(p => { const b = el('button', 'mi', `<span>${p.r}</span>`); b.type = 'button'; b.dataset.i = p.i; b.dataset.s = 'r'; R.append(b); });
  box.append(L, R); root.append(box);
  const f = fbBox(root);
  let pick = null;
  box.addEventListener('click', e => {
    const b = e.target.closest('.mi'); if (!b || b.classList.contains('ok')) return;
    if (!pick || pick.dataset.s === b.dataset.s) { if (pick) pick.classList.remove('sel'); pick = b; b.classList.add('sel'); say(f, 'info', 'Ahora elige su pareja en la otra columna.'); return; }
    const a = pick; pick = null; a.classList.remove('sel');
    if (a.dataset.i === b.dataset.i) {
      a.classList.add('ok'); b.classList.add('ok');
      const r = b.dataset.s === 'r' ? b : a; if (!$('.k', r)) r.prepend(el('span', 'k', LET[+r.dataset.i]));
      const why = $$('.mi', root).length && root.querySelectorAll('.mi.ok').length === pairs.length * 2;
      say(f, 'good', '<strong>Pareja correcta.</strong>' + (why ? ' ' + (root.dataset.end || '') : ''));
      if (why) done(key);
    } else {
      [a, b].forEach(x => { x.classList.remove('ko'); void x.offsetWidth; x.classList.add('ko'); setTimeout(() => x.classList.remove('ko'), 600); });
      say(f, 'bad', '<strong>Esa pareja no corresponde.</strong> ' + (root.dataset.hint || 'Lee de nuevo ambas columnas.'));
    }
  });
  if (state.done[key]) { $$('.mi', box).forEach(b => { b.classList.add('ok'); if (b.dataset.s === 'r') b.prepend(el('span', 'k', LET[+b.dataset.i])); }); const order = [...R.children].sort((x, y) => x.dataset.i - y.dataset.i); order.forEach(x => R.append(x)); }
};

/* Caso ramificado de varios pasos */
C.scenario = (root, key) => {
  const steps = $$('.step', root), end = $('.scn-end', root);
  const head = el('div', 'scn-head', steps.map(() => '<i class="dot"></i>').join('') + '<span></span>');
  root.prepend(head);
  const dots = $$('.dot', head);
  let k = 0;
  const show = i => {
    steps.forEach((s, j) => s.classList.toggle('on', j === i));
    end.classList.toggle('on', i >= steps.length);
    dots.forEach((d, j) => { d.classList.toggle('on', j === i); });
    $('span', head).textContent = i < steps.length ? `Decisión ${i + 1} de ${steps.length}` : 'Caso resuelto';
    if (i >= steps.length) {
      const ok = steps.filter((_, j) => state.first[key + j]).length;
      const r = $('.scn-score', end) || el('p', 'scn-score tag'); r.textContent = `Acertaste ${ok} de ${steps.length} decisiones al primer intento`; end.prepend(r);
      const again = $('.again', end) || el('button', 'btn ghost again', 'Recorrer el caso otra vez');
      again.type = 'button'; again.onclick = () => { steps.forEach(s => { $$('.opt', s).forEach(o => { o.disabled = false; o.classList.remove('ok', 'ko'); }); const f = $('.fb', s); if (f) f.className = 'fb'; const c = $('.cont', s); if (c) c.remove(); }); show(0); };
      end.append(again);
    }
  };
  steps.forEach((s, i) => {
    const opts = $$('.opt', s); letters(opts);
    const f = fbBox(s);
    opts.forEach(o => o.addEventListener('click', () => {
      const ok = o.hasAttribute('data-ok'); first(key + i, ok);
      opts.forEach(x => x.classList.remove('ko')); o.classList.add(ok ? 'ok' : 'ko');
      say(f, ok ? 'good' : 'bad', `<strong>${ok ? 'Decisión segura.' : 'Consecuencia:'}</strong> ${o.dataset.fb}${ok ? '' : '<br><em>Vuelve a decidir.</em>'}`);
      dots[i].classList.toggle('ok', ok);
      if (ok) {
        opts.forEach(x => x.disabled = true);
        const c = el('button', 'btn teal cont', i < steps.length - 1 ? 'Siguiente decisión →' : 'Ver cierre del caso →'); c.type = 'button'; c.style.marginTop = '12px';
        c.addEventListener('click', () => { show(i + 1); if (i === steps.length - 1) done(key); });
        s.append(c);
      }
    }));
  });
  if (state.done[key]) { dots.forEach(d => d.classList.add('ok')); show(steps.length); } else show(0);
};

/* Comprobación de 5 preguntas, mínimo 80% */
C.quiz = (root, key) => {
  const qs = $$('.q', root);
  const head = el('div', 'qhead', `<strong class="qn"></strong><div class="qdots">${qs.map(() => '<i></i>').join('')}</div>`);
  const res = el('div', 'qres');
  root.prepend(head); root.append(res);
  const dots = $$('.qdots i', head);
  let ans = [];
  qs.forEach((q, i) => {
    const opts = $$('.opt', q); letters(opts);
    const f = fbBox(q);
    const nx = el('button', 'btn teal', i < qs.length - 1 ? 'Siguiente pregunta →' : 'Ver mi resultado →'); nx.type = 'button'; nx.style.cssText = 'margin-top:12px;display:none';
    q.append(nx);
    opts.forEach(o => o.addEventListener('click', () => {
      const ok = o.hasAttribute('data-ok'); ans[i] = ok;
      opts.forEach(x => { x.disabled = true; if (x.hasAttribute('data-ok')) x.classList.add('ok'); });
      if (!ok) o.classList.add('ko');
      dots[i].className = ok ? 'ok' : 'ko';
      say(f, ok ? 'good' : 'bad', `<strong>${ok ? 'Correcto.' : 'Incorrecto. La respuesta correcta es la ' + LET[opts.findIndex(x => x.hasAttribute('data-ok'))] + '.'}</strong> ${q.dataset.why || ''}`);
      nx.style.display = ''; nx.focus();
    }));
    nx.addEventListener('click', () => i < qs.length - 1 ? show(i + 1) : result());
  });
  function show(i) {
    qs.forEach((q, j) => q.classList.toggle('on', j === i)); res.classList.remove('on'); head.style.display = '';
    $('.qn', head).textContent = `Pregunta ${i + 1} de ${qs.length}`;
    dots.forEach((d, j) => d.classList.toggle('cur', j === i));
  }
  function ring(p) { return `<div class="score-ring" style="--p:${p};--c:${p >= PASS ? 'var(--green)' : 'var(--red)'}"><b>${p}%</b></div>`; }
  function result() {
    const p = Math.round(ans.filter(Boolean).length / qs.length * 100);
    state.score = p; state.best = Math.max(state.best ?? 0, p);
    qs.forEach(q => q.classList.remove('on')); head.style.display = 'none';
    const pass = p >= PASS;
    const wrong = qs.map((q, i) => ans[i] ? null : q.dataset.review).filter(Boolean);
    res.innerHTML = ring(p) + (pass
      ? `<h3>¡Aprobaste la comprobación!</h3><p>Respondiste correctamente ${ans.filter(Boolean).length} de ${qs.length} preguntas. El mínimo es ${PASS}%. Continúa con la actividad de transferencia.</p>`
      : `<h3>Aún no alcanzas el ${PASS}%</h3><p>Respondiste correctamente ${ans.filter(Boolean).length} de ${qs.length}. Repasa las pantallas sugeridas y vuelve a intentarlo.</p>`);
    if (!pass && wrong.length) {
      const rv = el('div', 'review');
      [...new Set(wrong)].forEach(id => { const i = screens.findIndex(s => s.dataset.id === id); if (i < 0) return; const b = el('button', null, 'Repasar: ' + screens[i].dataset.title); b.type = 'button'; b.addEventListener('click', () => go(i)); rv.append(b); });
      res.append(rv);
    }
    const again = el('button', pass ? 'btn ghost' : 'btn', pass ? 'Volver a responder' : 'Reintentar la comprobación'); again.type = 'button'; again.style.marginTop = '14px';
    again.addEventListener('click', reset); res.append(again);
    res.classList.add('on');
    if (pass) done(key);
    save(); refresh();
  }
  function reset() {
    ans = [];
    qs.forEach(q => { $$('.opt', q).forEach(o => { o.disabled = false; o.classList.remove('ok', 'ko'); }); $('.fb', q).className = 'fb'; $('.btn', q).style.display = 'none'; });
    dots.forEach(d => d.className = ''); show(0);
  }
  if (state.done[key]) { res.innerHTML = ring(state.best) + `<h3>Comprobación aprobada</h3><p>Tu mejor resultado es ${state.best}%.</p>`; const again = el('button', 'btn ghost', 'Volver a responder'); again.type = 'button'; again.addEventListener('click', reset); res.append(again); res.classList.add('on'); head.style.display = 'none'; }
  else show(0);
};

/* Puntos sobre imagen */
C.hotspot = (root, key) => {
  const pts = $$('.pt', root), out = $('.hs-out', root);
  const list = el('div', 'hs-list', pts.map(p => `<span>${p.dataset.title}</span>`).join(''));
  out.after(list);
  const cnt = el('p', 'tag', ''); list.after(cnt);
  const upd = () => { cnt.textContent = `${pts.filter(p => p.classList.contains('seen')).length} de ${pts.length} puntos revisados`; };
  pts.forEach((p, i) => { p.type = 'button'; p.textContent = i + 1; p.setAttribute('aria-label', 'Punto ' + (i + 1) + ': ' + p.dataset.title);
    p.addEventListener('click', () => {
      pts.forEach(x => x.classList.remove('cur')); p.classList.add('cur', 'seen');
      $$('span', list)[i].classList.add('seen');
      out.innerHTML = `${p.dataset.cat ? `<span class="cat">${p.dataset.cat}</span>` : ''}<h3>${i + 1}. ${p.dataset.title}</h3><p>${p.dataset.text}</p>${p.dataset.ask ? `<p><strong>Pregúntate:</strong> ${p.dataset.ask}</p>` : ''}`;
      upd(); if (pts.every(x => x.classList.contains('seen'))) done(key);
    }); if (state.done[key]) { p.classList.add('seen'); $$('span', list)[i].classList.add('seen'); } });
  upd();
};

/* Proceso paso a paso (se revela en orden) */
C.steps = (root, key) => {
  const items = $$('.tl-item', root);
  const btns = items.map((it, i) => {
    const h = $('.tl-body h3', it);
    const b = el('button', 'btn ghost', 'Ver este paso'); b.type = 'button'; b.style.cssText = 'margin-top:8px;padding:7px 12px;font-size:.85rem';
    h.after(b);
    b.addEventListener('click', () => { it.classList.add('open'); sync(); btns[i + 1]?.focus(); });
    return b;
  });
  function sync() {
    const open = items.filter(x => x.classList.contains('open')).length;
    items.forEach((x, j) => { const o = x.classList.contains('open'); x.classList.toggle('locked', j > open); btns[j].hidden = o; btns[j].disabled = j > open; });
    if (open === items.length) done(key);
  }
  if (state.done[key]) items.forEach(it => it.classList.add('open'));
  sync();
};

/* Acordeón */
C.acc = (root, key) => {
  const its = $$('.acc-i', root);
  its.forEach(it => { const b = $(':scope > button', it); b.type = 'button'; b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => { const o = it.classList.toggle('open'); b.setAttribute('aria-expanded', o); it.classList.add('seen'); if (its.every(x => x.classList.contains('seen'))) done(key); });
    if (state.done[key]) it.classList.add('seen'); });
};

/* Completar con listas desplegables */
C.fill = (root, key) => {
  const sels = $$('select', root);
  sels.forEach(s => { const opts = (s.dataset.opts || root.dataset.opts).split('|'); s.innerHTML = '<option value="">Elige…</option>' + opts.map(o => `<option>${o}</option>`).join(''); s.addEventListener('change', () => s.classList.remove('ok', 'ko')); });
  const b = el('button', 'btn', 'Comprobar respuestas'); b.type = 'button'; b.style.marginTop = '12px';
  root.append(b); const f = fbBox(root);
  b.addEventListener('click', () => {
    let bad = [];
    sels.forEach(s => { const ok = s.value === s.dataset.ok; s.classList.toggle('ok', ok); s.classList.toggle('ko', !ok); if (!ok) bad.push(s.closest('p').dataset.why); });
    if (!bad.length) { say(f, 'good', '<strong>¡Todo correcto!</strong> ' + (root.dataset.end || '')); sels.forEach(s => s.disabled = true); b.disabled = true; done(key); }
    else say(f, 'bad', `<strong>${sels.length - bad.length} de ${sels.length} correctas.</strong> Corrige las marcadas en rojo. Pistas:<ul>${bad.filter(Boolean).map(w => `<li>${w}</li>`).join('')}</ul>`);
  });
  if (state.done[key]) { sels.forEach(s => { s.value = s.dataset.ok; s.classList.add('ok'); s.disabled = true; }); b.disabled = true; say(f, 'good', '<strong>¡Todo correcto!</strong> ' + (root.dataset.end || '')); }
};

/* Ordenar pasos */
C.sort = (root, key) => {
  const correct = $$('li', root).map((li, i) => { li.dataset.i = i; return li; });
  const items = shuffleNot(correct);
  items.forEach(li => { const t = li.innerHTML; li.innerHTML = `<span class="grip" aria-hidden="true">⠿</span><span class="pos"></span><span class="txt">${t}</span><span class="mv"><button type="button" data-d="-1" aria-label="Subir">↑</button><button type="button" data-d="1" aria-label="Bajar">↓</button></span>`; root.append(li); });
  const wrap = el('div'); root.after(wrap);
  const b = el('button', 'btn', 'Comprobar orden'); b.type = 'button'; b.style.marginTop = '12px'; wrap.append(b);
  const f = fbBox(wrap);
  const num = () => $$('li', root).forEach((li, i) => { $('.pos', li).textContent = i + 1; });
  const clear = () => $$('li', root).forEach(li => li.classList.remove('ok', 'ko'));
  root.addEventListener('click', e => { const m = e.target.closest('[data-d]'); if (!m || root.dataset.locked) return; const li = m.closest('li'); const d = +m.dataset.d;
    if (d < 0 && li.previousElementSibling) root.insertBefore(li, li.previousElementSibling); else if (d > 0 && li.nextElementSibling) root.insertBefore(li.nextElementSibling, li);
    clear(); num(); m.focus(); });
  let drag = null;
  root.addEventListener('pointerdown', e => { const g = e.target.closest('.grip'); if (!g || root.dataset.locked) return; drag = g.closest('li'); drag.classList.add('dragging'); root.setPointerCapture(e.pointerId); e.preventDefault(); });
  root.addEventListener('pointermove', e => { if (!drag) return; const sibs = $$('li', root).filter(x => x !== drag);
    const after = sibs.find(x => { const r = x.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    if (after) root.insertBefore(drag, after); else root.append(drag); });
  root.addEventListener('pointerup', () => { if (drag) { drag.classList.remove('dragging'); drag = null; clear(); num(); } });
  b.addEventListener('click', () => {
    const lis = $$('li', root); let ok = 0;
    lis.forEach((li, i) => { const g = +li.dataset.i === i; li.classList.toggle('ok', g); li.classList.toggle('ko', !g); if (g) ok++; });
    if (ok === lis.length) { root.dataset.locked = 1; $$('.mv button', root).forEach(x => x.disabled = true); b.disabled = true; say(f, 'good', '<strong>¡Orden correcto!</strong> ' + (root.dataset.end || '')); done(key); }
    else say(f, 'bad', `<strong>${ok} de ${lis.length} pasos en su lugar.</strong> ${root.dataset.hint || 'Mueve los pasos marcados en rojo y vuelve a comprobar.'}`);
  });
  num();
  if (state.done[key]) { correct.forEach(li => root.append(li)); num(); $$('li', root).forEach(li => li.classList.add('ok')); root.dataset.locked = 1; $$('.mv button', root).forEach(x => x.disabled = true); b.disabled = true; say(f, 'good', '<strong>¡Orden correcto!</strong> ' + (root.dataset.end || '')); }
};

/* Conversación simulada */
C.chat = (root, key) => {
  const script = readJSON($('script', root)) || [];
  const log = el('div', 'chat-log'); log.setAttribute('aria-live', 'polite');
  const opts = el('div', 'chat-opts');
  root.append(log, opts);
  let i = 0;
  const add = (cls, who, text) => { const m = el('div', 'msg ' + cls, (who ? `<small>${who}</small>` : '') + text); log.append(m); log.scrollTop = log.scrollHeight; };
  function step() {
    opts.innerHTML = '';
    if (i >= script.length) { add('sys', '', root.dataset.end || 'Conversación completada.'); done(key); const r = el('button', 'btn ghost', 'Repetir la conversación'); r.type = 'button'; r.addEventListener('click', () => { log.innerHTML = ''; i = 0; step(); }); opts.append(r); return; }
    const s = script[i];
    if (s.sys) { add('sys', '', s.sys); i++; setTimeout(step, 500); return; }
    if (s.say) { add('them', s.from, s.say); i++; setTimeout(step, 650); return; }
    if (s.ask) {
      const q = el('p', null, `<strong>${s.q || 'Elige tu respuesta:'}</strong>`); q.style.margin = '0'; opts.append(q);
      s.ask.forEach(o => { const b = el('button', null, o.t); b.type = 'button'; opts.append(b);
        b.addEventListener('click', () => {
          first(key + i, !!o.ok);
          if (o.ok) { add('me', s.me || 'Tú', o.t); if (o.fb) add('sys', '', '✓ ' + o.fb); i++; setTimeout(step, 550); }
          else { b.classList.add('ko'); b.disabled = true; add('sys ko', '', '✗ ' + o.fb); }
        }); });
    }
  }
  if (state.done[key]) { script.forEach(s => { if (s.say) add('them', s.from, s.say); else if (s.ask) add('me', s.me || 'Tú', s.ask.find(o => o.ok).t); }); add('sys', '', root.dataset.end || 'Conversación completada.'); const r = el('button', 'btn ghost', 'Repetir la conversación'); r.type = 'button'; r.addEventListener('click', () => { log.innerHTML = ''; i = 0; step(); }); opts.append(r); }
  else step();
};

/* Transferencia al propio trabajo */
C.transfer = (root, key) => {
  const form = $('form', root), btn = $('[data-act=plan]', root), plan = $('.plan', root);
  const lock = el('div', 'locked-note', 'Esta actividad se habilita cuando apruebas la comprobación con al menos ' + PASS + '%.');
  root.prepend(lock);
  $$('textarea', form).forEach(t => { const c = el('div', 'cnt'); t.after(c); const u = () => { c.textContent = `${t.value.trim().length} / mínimo ${t.minLength} caracteres`; }; t.addEventListener('input', u); u(); });
  form.addEventListener('submit', e => e.preventDefault());
  const valid = () => $$('fieldset', form).every(fs => { const t = $('textarea', fs); if (t) return t.value.trim().length >= t.minLength; return !fs.dataset.req || $$('input:checked', fs).length > 0; });
  const upd = () => { const p = !!state.done.pass; lock.style.display = p ? 'none' : ''; $$('input,textarea', form).forEach(x => x.disabled = !p); btn.disabled = !p || !valid(); };
  form.addEventListener('input', upd); form.addEventListener('change', upd);
  root.closest('.screen').addEventListener('enter', upd);
  function render(data) {
    plan.innerHTML = `<h3>${root.dataset.plan || 'Mi plan de aplicación'}</h3><ul>${data.map(d => `<li><strong>${d.l}:</strong> ${d.v}</li>`).join('')}</ul><p style="margin-top:12px;opacity:.9">Guarda o imprime este plan para conversarlo con tu responsable del trabajo.</p>`;
    const pr = el('button', 'btn ghost', 'Imprimir mi plan'); pr.type = 'button'; pr.addEventListener('click', () => window.print()); plan.append(pr);
    plan.classList.add('on');
  }
  btn.addEventListener('click', () => {
    if (!valid()) return;
    const data = $$('fieldset', form).map(fs => {
      const l = $('legend', fs).textContent.replace(/\s*\(.*\)\s*$/, '');
      const t = $('textarea', fs);
      const v = t ? t.value.trim().replace(/[<>]/g, '').slice(0, 280) : $$('input:checked', fs).map(i => i.closest('label').textContent.trim()).join('; ');
      return { l, v };
    });
    state.tr = data; render(data); done(key);
  });
  if (state.tr) render(state.tr);
  upd();
};

/* Finalización */
C.final = (root) => {
  const scr = root.closest('.screen');
  scr.addEventListener('enter', () => {
    if (!state.fin) { state.fin = true; finishLMS(); save(); refresh(); }
    const decs = $$('[data-c=decision],[data-c=scenario]').flatMap(d => {
      const k = d.dataset.key;
      if (d.dataset.c === 'decision') return [{ l: d.dataset.label || $('h3', d)?.textContent || k, ok: state.first[k] }];
      return $$('.step', d).map((s, i) => ({ l: s.dataset.label || ('Caso: decisión ' + (i + 1)), ok: state.first[k + i] }));
    });
    const okN = decs.filter(d => d.ok).length;
    const acts = screens.filter(s => s.dataset.gate && !/pass|transfer|inicio/.test(s.dataset.gate)).map(s => s.dataset.title);
    root.innerHTML = `
      <div class="fin-hero">
        <div class="score-ring" style="--p:${state.best ?? 0};--c:var(--yellow)"><b>${state.best ?? 0}%</b></div>
        <div><div class="eyebrow" style="color:#bff4f5">Lección completada</div><h2>¡Muy bien${CFG.persona ? ', terminaste junto a ' + CFG.persona : ''}!</h2>
        <p>Aprobaste la comprobación con <strong>${state.best ?? 0}%</strong> (mínimo ${PASS}%) y completaste tu plan de aplicación. Tu avance quedó registrado.</p></div>
      </div>
      <div class="fin-grid">
        <div class="panel"><h3>Decisiones al primer intento: ${okN} de ${decs.length}</h3><ul class="fin-list">${decs.map(d => `<li class="${d.ok ? 'ok' : 'ko'}">${d.l}</li>`).join('')}</ul></div>
        <div class="panel"><h3>Lo que recorriste</h3><ul class="fin-list">${acts.map(a => `<li class="ok">${a}</li>`).join('')}</ul></div>
        <div class="panel"><h3>Repasar</h3><p style="margin-top:0">La navegación ahora es libre. Vuelve a cualquier pantalla:</p><div class="review">${screens.slice(1, -1).map((s, i) => `<button type="button" data-go="${i + 1}">${s.dataset.title}</button>`).join('')}</div></div>
      </div>
      ${CFG.next ? `<div class="next-lesson"><span class="tag">Siguiente · ${CFG.next.code}</span><h3 style="margin-top:8px">${CFG.next.title}</h3><p style="margin:0">${CFG.next.text}</p></div>` : ''}`;
    $$('[data-go]', root).forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));
  });
};

/* ---------- Arranque ---------- */
load();
$$('[data-c]').forEach(r => { const f = C[r.dataset.c]; if (f) f(r, r.dataset.key); else console.warn('Interacción desconocida', r.dataset.c); });
let lastScreen = null;
screens.forEach(s => s.addEventListener('enter', () => { if (lastScreen && lastScreen !== s) lastScreen.dispatchEvent(new CustomEvent('leave')); lastScreen = s; }));
$$('[data-goto]').forEach(b => b.addEventListener('click', () => go(+b.dataset.goto)));
if (!reachable(state.cur)) state.cur = 0;
refresh();
screens.forEach((s, j) => s.classList.toggle('active', j === state.cur));
lastScreen = screens[state.cur];
if (state.cur === screens.length - 1) screens[state.cur].dispatchEvent(new CustomEvent('enter'));
window.__lesson = { state, go, done, screens };
})();
