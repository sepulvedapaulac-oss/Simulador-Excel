/* ==========================================================================
   Evaluaciones de módulo · Parte 2 — caso aplicado con rúbrica (SCORM 1.2)
   Cada criterio de la rúbrica se evalúa con una tarea del caso. La tarea se
   entrega una sola vez; la corrección y el nivel alcanzado se muestran al
   final. Las respuestas escritas quedan registradas para el tutor.
   ========================================================================== */
(() => {
'use strict';
const CFG = window.EVAL || {};
const IMGS = window.IMGS || {};
const PASS = CFG.pass || 70;
const LS_KEY = 'tls_ev_' + (CFG.id || 'eval');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function readJSON(id) { const s = document.getElementById(id); if (!s) return null; try { return JSON.parse(s.textContent); } catch (e) { console.error('JSON inválido en', id, e); return null; } }

/* Niveles de la rúbrica: proporción del puntaje del criterio y umbral de logro de la tarea */
const LEVELS = [
  { n: 'No logrado', f: 0, cls: 'l0' },
  { n: 'En desarrollo', f: 0.4, cls: 'l1' },
  { n: 'Suficiente', f: 0.7, cls: 'l2' },
  { n: 'Logrado', f: 1, cls: 'l3' }
];
const levelOf = acc => acc >= 0.85 ? 3 : acc >= 0.6 ? 2 : acc >= 0.35 ? 1 : 0;
const RUB = readJSON('rubric-data') || [];
const ptsOf = (c, acc) => Math.round(c.pts * LEVELS[levelOf(acc)].f);

$$('img[data-img]').forEach(i => { if (IMGS[i.dataset.img]) i.src = IMGS[i.dataset.img]; });

/* ---------- Estado y SCORM ---------- */
const state = { cur: 0, g: {}, a: {}, acc: {}, docs: [], fin: false, best: null, att: 1, ix: 0, passed: false };
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
const clean = (s, n = 250) => String(s || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

function load() {
  if (/[?&]reset=1/.test(location.search)) { try { localStorage.removeItem(LS_KEY); } catch (e) {} }
  api = findAPI(window);
  let raw = null;
  if (api) {
    apiOn = String(lms('LMSInitialize', '')) === 'true';
    if (apiOn) {
      const st = lms('LMSGetValue', 'cmi.core.lesson_status');
      if (!st || st === 'not attempted') lms('LMSSetValue', 'cmi.core.lesson_status', 'incomplete');
      if (st === 'passed') state.passed = true;
      raw = lms('LMSGetValue', 'cmi.suspend_data');
      lms('LMSSetValue', 'cmi.core.score.min', '0');
      lms('LMSSetValue', 'cmi.core.score.max', '100');
    }
  }
  if (!apiOn) { try { raw = localStorage.getItem(LS_KEY); } catch (e) {} }
  if (raw) {
    try {
      const s = JSON.parse(raw);
      Object.assign(state, { cur: s.c || 0, g: s.g || {}, a: s.a || {}, acc: s.q || {}, docs: s.d || [], fin: !!s.z, best: s.b ?? null, att: s.n || 1, ix: s.x || 0 });
      if (s.p) state.passed = true;
    } catch (e) {}
  }
  if (apiOn) {
    const n = parseInt(lms('LMSGetValue', 'cmi.interactions._count'), 10);
    if (Number.isInteger(n) && n > state.ix) state.ix = n;
  }
}
function save() {
  const pack = trim => JSON.stringify({ c: state.cur, g: state.g, d: state.docs, z: state.fin ? 1 : 0, b: state.best, n: state.att, x: state.ix, p: state.passed ? 1 : 0, q: state.acc,
    a: trim ? Object.fromEntries(Object.entries(state.a).map(([k, v]) => [k, { ...v, t: (v.t || []).map(t => t.slice(0, trim)) }])) : state.a });
  let data = pack(0);
  if (data.length > 4000) data = pack(220);
  if (apiOn) {
    lms('LMSSetValue', 'cmi.core.lesson_location', String(state.cur));
    lms('LMSSetValue', 'cmi.suspend_data', data.slice(0, 4096));
    lms('LMSSetValue', 'cmi.core.exit', state.fin ? '' : 'suspend');
    lms('LMSCommit', '');
  } else {
    try { localStorage.setItem(LS_KEY, data); } catch (e) {}
  }
}
function interaction(id, type, resp, result, weight) {
  if (!apiOn) return;
  const p = 'cmi.interactions.' + state.ix + '.';
  lms('LMSSetValue', p + 'id', clean(id, 60).replace(/[^\x21-\x7E]/g, '_'));
  lms('LMSSetValue', p + 'type', type);
  if (weight != null) lms('LMSSetValue', p + 'weighting', String(weight));
  lms('LMSSetValue', p + 'student_response', clean(resp, 250));
  lms('LMSSetValue', p + 'result', String(result));
  state.ix++;
}
window.addEventListener('pagehide', () => { if (apiOn) { save(); lms('LMSFinish', ''); apiOn = false; } });

/* ---------- Componentes de tarea ---------- */
// Permutación determinista distinta del orden original y de su inverso
function shuffled(n, seed) {
  const idx = [...Array(n).keys()];
  let s = seed || 7;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < 20; k++) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const fixed = idx.filter((v, i) => v === i).length;
    if (fixed <= Math.floor(n / 3) && idx.some((v, i) => v !== n - 1 - i)) break;
  }
  return idx;
}
const seg = (labels, onPick) => {
  const w = el('div', 'seg');
  labels.forEach((t, i) => {
    const b = el('button', null, esc(t)); b.type = 'button'; b.dataset.i = i;
    b.addEventListener('click', () => { if (b.disabled) return; $$('button', w).forEach(x => x.classList.toggle('on', x === b)); onPick(i); });
    w.append(b);
  });
  w.pick = i => $$('button', w).forEach((x, j) => x.classList.toggle('on', j === i));
  w.lock = () => $$('button', w).forEach(x => { x.disabled = true; });
  return w;
};

const COMP = {};

/* Completar un registro con listas desplegables */
COMP.form = (root, onChange) => {
  const rows = $$('.frow', root);
  const sels = rows.map(r => {
    const s = $('select', r);
    const ph = el('option', null, 'Selecciona…'); ph.value = ''; s.prepend(ph); s.value = '';
    s.addEventListener('change', onChange);
    const why = r.dataset.why; if (why) r.append(el('div', 'why', esc(why)));
    r.append(el('div', 'sol', 'Respuesta esperada: ' + esc(s.dataset.ok)));
    return s;
  });
  return {
    complete: () => sels.every(s => s.value !== ''),
    need: () => `Completa los ${sels.filter(s => !s.value).length} campos pendientes.`,
    value: () => sels.map(s => s.value),
    set: v => sels.forEach((s, i) => { if (v && v[i] != null) s.value = v[i]; }),
    score: () => sels.filter(s => s.value === s.dataset.ok).length / sels.length,
    lock: () => sels.forEach(s => { s.disabled = true; }),
    review: () => rows.forEach((r, i) => r.classList.add(sels[i].value === sels[i].dataset.ok ? 'ok' : 'ko')),
    summary: () => sels.map((s, i) => (s.value === s.dataset.ok ? '✓' : '✗') + clean(s.value, 30)).join(' | ')
  };
};

/* Marcar en un documento los fragmentos que son evidencia */
COMP.evidence = (root, onChange) => {
  const items = $$('.ev', root).map((p, i) => {
    const w = el('div', 'ev-wrap');
    const b = el('button', 'ev', `<span class="n">${i + 1}</span><span class="t">${p.innerHTML}</span>`);
    b.type = 'button'; b.dataset.ok = p.hasAttribute('data-ok') ? '1' : '';
    b.addEventListener('click', () => { if (b.disabled) return; b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); onChange(); });
    w.append(b);
    if (p.dataset.why) w.append(el('div', 'why', esc(p.dataset.why)));
    p.replaceWith(w);
    return b;
  });
  const nOk = items.filter(b => b.dataset.ok).length;
  const tp = () => items.filter(b => b.dataset.ok && b.classList.contains('on')).length;
  const fp = () => items.filter(b => !b.dataset.ok && b.classList.contains('on')).length;
  return {
    complete: () => items.some(b => b.classList.contains('on')),
    need: () => 'Marca al menos un fragmento del documento.',
    value: () => items.map((b, i) => b.classList.contains('on') ? i : -1).filter(i => i >= 0),
    set: v => (v || []).forEach(i => items[i] && items[i].classList.add('on')),
    score: () => Math.max(0, tp() - fp()) / nOk,
    lock: () => items.forEach(b => { b.disabled = true; }),
    review: () => items.forEach(b => {
      const on = b.classList.contains('on');
      b.classList.add(b.dataset.ok ? (on ? 'hit' : 'miss') : (on ? 'wrong' : 'neutral'));
      const why = b.parentNode.querySelector('.why');
      if (why && !b.dataset.ok && !on) why.remove();
    }),
    summary: () => `Marcó ${items.filter(b => b.classList.contains('on')).length}: ${tp()} correctas y ${fp()} sin relación (de ${nOk} esperadas)`
  };
};

/* Clasificar situaciones en categorías */
COMP.classify = (root, onChange) => {
  const cats = (root.dataset.cats || '').split('|');
  const picks = [];
  const rows = $$('.ci', root).map((r, i) => {
    const txt = el('div', 'txt', r.innerHTML); r.innerHTML = ''; r.append(txt);
    const s = seg(cats, k => { picks[i] = k; onChange(); }); r.append(s);
    r.append(el('div', 'sol', 'Corresponde: ' + esc(cats[+r.dataset.ok])));
    if (r.dataset.why) r.append(el('div', 'why', esc(r.dataset.why)));
    picks[i] = -1; r._seg = s;
    return r;
  });
  return {
    complete: () => picks.every(p => p >= 0),
    need: () => `Clasifica las ${picks.filter(p => p < 0).length} situaciones pendientes.`,
    value: () => picks.slice(),
    set: v => (v || []).forEach((k, i) => { if (k >= 0 && rows[i]) { picks[i] = k; rows[i]._seg.pick(k); } }),
    score: () => rows.filter((r, i) => picks[i] === +r.dataset.ok).length / rows.length,
    lock: () => rows.forEach(r => r._seg.lock()),
    review: () => rows.forEach((r, i) => r.classList.add(picks[i] === +r.dataset.ok ? 'ok' : 'ko')),
    summary: () => rows.map((r, i) => (picks[i] === +r.dataset.ok ? '✓' : '✗') + (cats[picks[i]] || '-')).join(' | ')
  };
};

/* Ordenar pasos */
COMP.order = (root, onChange, seed) => {
  const list = $('ol', root);
  const src = $$('li', list).map(li => ({ html: li.innerHTML, why: li.dataset.why || '' }));
  let ord = shuffled(src.length, seed);
  list.className = 'ord'; list.innerHTML = '';
  let locked = false;
  // Cada paso es un nodo fijo: al mover se reubica en la lista (sin redibujar) y conserva el foco
  const nodes = src.map((it, k) => {
    const li = el('li', null, `<span class="pos"></span><span class="txt">${it.html}<span class="sol">Va en la posición ${k + 1}</span></span>`);
    const mv = el('span', 'mv');
    const up = el('button', null, '▲'); up.type = 'button'; up.setAttribute('aria-label', 'Subir');
    const dn = el('button', null, '▼'); dn.type = 'button'; dn.setAttribute('aria-label', 'Bajar');
    const move = (d, btn) => {
      const pos = ord.indexOf(k), to = pos + d;
      if (locked || to < 0 || to >= ord.length) return;
      [ord[pos], ord[to]] = [ord[to], ord[pos]];
      render();
      (btn.disabled ? (d < 0 ? dn : up) : btn).focus({ preventScroll: true });
      onChange();
    };
    up.addEventListener('click', () => move(-1, up));
    dn.addEventListener('click', () => move(1, dn));
    mv.append(up, dn); li.append(mv);
    li.dataset.k = k; li._up = up; li._dn = dn;
    return li;
  });
  function render() {
    ord.forEach((k, pos) => {
      const li = nodes[k];
      if (list.children[pos] !== li) list.insertBefore(li, list.children[pos] || null);
      li.querySelector('.pos').textContent = pos + 1;
      li._up.disabled = locked || pos === 0;
      li._dn.disabled = locked || pos === ord.length - 1;
    });
  }
  render();
  // Concordancia por pares, reescalada para que un orden al azar valga cero
  const conc = () => {
    let ok = 0, tot = 0;
    for (let i = 0; i < ord.length; i++) for (let j = i + 1; j < ord.length; j++) { tot++; if (ord[i] < ord[j]) ok++; }
    return Math.max(0, (ok / tot - 0.5) / 0.5);
  };
  return {
    complete: () => true,
    need: () => '',
    value: () => ord.slice(),
    set: v => { if (Array.isArray(v) && v.length === ord.length) { ord = v.slice(); render(); } },
    score: conc,
    lock: () => { locked = true; render(); },
    review: () => $$('li', list).forEach((li, pos) => li.classList.add(+li.dataset.k === pos ? 'ok' : 'ko')),
    summary: () => 'Orden: ' + ord.map(k => k + 1).join('-')
  };
};

/* Matriz de alternativas: marcar compatible / no compatible y elegir */
COMP.matrix = (root, onChange) => {
  const cols = (root.dataset.cols || '').split('|');
  const tbl = $('table', root);
  const wrap = el('div', 'mx-wrap'); tbl.before(wrap); wrap.append(tbl); tbl.className = 'mx';
  const head = el('thead'); const hr = el('tr', null, '<th>Condición</th>' + cols.map(c => `<th>${esc(c)}</th>`).join('')); head.append(hr); tbl.prepend(head);
  const rows = $$('tbody tr', tbl).map(tr => {
    const ok = tr.dataset.ok.split(/\s+/).map(Number);
    const th = $('th', tr); if (tr.dataset.why) th.append(el('div', 'why', esc(tr.dataset.why)));
    const cells = ok.map((_, j) => {
      const td = el('td'); td.dataset.col = cols[j]; const b = el('button', 'cell', 'Revisar'); b.type = 'button'; b.dataset.v = '';
      b.setAttribute('aria-label', cols[j] + ': sin marcar');
      b.addEventListener('click', () => {
        if (b.disabled) return;
        b.dataset.v = b.dataset.v === '' ? '1' : b.dataset.v === '1' ? '0' : '1';
        b.textContent = b.dataset.v === '1' ? '✓ Cumple' : '✗ No cumple';
        b.setAttribute('aria-label', cols[j] + ': ' + b.textContent);
        onChange();
      });
      td.append(b); tr.append(td); return b;
    });
    return { ok, cells };
  });
  const chBox = $('.mx-choice', root);
  let ch = -1;
  const s = seg(cols, i => { ch = i; onChange(); });
  chBox.append(s);
  const cellsAll = rows.flatMap(r => r.cells.map((b, j) => ({ b, ok: r.ok[j] })));
  const showV = (b, v) => { b.dataset.v = v; b.textContent = v === '1' ? '✓ Cumple' : v === '0' ? '✗ No cumple' : 'Revisar'; };
  return {
    complete: () => cellsAll.every(c => c.b.dataset.v !== '') && ch >= 0,
    need: () => { const p = cellsAll.filter(c => c.b.dataset.v === '').length; return p ? `Revisa las ${p} celdas pendientes.` : 'Elige la alternativa final.'; },
    value: () => ({ m: cellsAll.map(c => c.b.dataset.v).join(''), c: ch }),
    set: v => { if (!v) return; [...(v.m || '')].forEach((x, i) => cellsAll[i] && showV(cellsAll[i].b, x)); if (v.c >= 0) { ch = v.c; s.pick(ch); } },
    score: () => 0.7 * cellsAll.filter(c => c.b.dataset.v === String(c.ok)).length / cellsAll.length + 0.3 * (ch === +chBox.dataset.ok ? 1 : 0),
    lock: () => { cellsAll.forEach(c => { c.b.disabled = true; }); s.lock(); },
    review: () => {
      cellsAll.forEach(c => c.b.classList.add(c.b.dataset.v === String(c.ok) ? 'ok' : 'ko'));
      chBox.classList.add(ch === +chBox.dataset.ok ? 'ok' : 'ko');
      if (chBox.dataset.why) chBox.append(el('div', 'why', esc(chBox.dataset.why)));
    },
    summary: () => `Celdas ${cellsAll.filter(c => c.b.dataset.v === String(c.ok)).length}/${cellsAll.length}; elige ${cols[ch] || '-'}`
  };
};

/* Veredicto con evidencias que lo respaldan */
COMP.verdict = (root, onChange) => {
  const opts = (root.dataset.opts || '').split('|');
  const okV = +root.dataset.ok;
  let v = -1;
  const b1 = el('div', 'block', `<h3>${esc(root.dataset.q || 'Tu decisión')}</h3>`);
  const s = seg(opts, i => { v = i; onChange(); }); b1.append(s);
  const b2 = el('div', 'block', `<h3>${esc(root.dataset.q2 || 'Evidencias del caso que respaldan tu decisión')}</h3><p class="how" style="margin-top:0">Marca solo las evidencias que justifican tu decisión. Las que no la respaldan restan.</p>`);
  const list = el('div', 'sup-list'); b2.append(list);
  const sups = $$('.sup', root).map(p => {
    const b = el('button', 'sup', p.innerHTML); b.type = 'button'; b.dataset.ok = p.hasAttribute('data-ok') ? '1' : '';
    b.addEventListener('click', () => { if (b.disabled) return; b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); onChange(); });
    p.remove(); list.append(b); return b;
  });
  const why = root.dataset.why;
  root.classList.add('vd'); root.prepend(b1, b2);
  const nOk = sups.filter(b => b.dataset.ok).length;
  const tp = () => sups.filter(b => b.dataset.ok && b.classList.contains('on')).length;
  const fp = () => sups.filter(b => !b.dataset.ok && b.classList.contains('on')).length;
  return {
    complete: () => v >= 0 && sups.some(b => b.classList.contains('on')),
    need: () => v < 0 ? 'Elige tu decisión.' : 'Marca al menos una evidencia que la respalde.',
    value: () => ({ v, s: sups.map((b, i) => b.classList.contains('on') ? i : -1).filter(i => i >= 0) }),
    set: x => { if (!x) return; if (x.v >= 0) { v = x.v; s.pick(v); } (x.s || []).forEach(i => sups[i] && sups[i].classList.add('on')); },
    score: () => 0.5 * (v === okV ? 1 : 0) + 0.5 * Math.max(0, tp() - fp()) / nOk,
    lock: () => { s.lock(); sups.forEach(b => { b.disabled = true; }); },
    review: () => {
      b1.classList.add(v === okV ? 'ok' : 'ko');
      b1.append(el('div', 'why', (v === okV ? 'Correcto. ' : 'Correspondía: ' + esc(opts[okV]) + '. ') + esc(why || '')));
      sups.forEach(b => { const on = b.classList.contains('on'); b.classList.add(b.dataset.ok ? (on ? 'hit' : 'miss') : (on ? 'wrong' : 'neutral')); });
    },
    summary: () => `Decide ${opts[v] || '-'}; evidencias ${tp()} correctas y ${fp()} sin relación (de ${nOk})`
  };
};

/* Respuesta escrita: obligatoria, no se califica automáticamente */
function openText(box, onChange) {
  const min = +box.dataset.min || 60;
  const model = $('.model', box);
  const lab = el('label', null, esc(box.dataset.label || 'Justifica tu respuesta'));
  const id = 'ot' + Math.random().toString(36).slice(2, 8); lab.htmlFor = id;
  const hint = el('div', 'hint', esc(box.dataset.hint || `Escribe al menos ${min} caracteres. Esta respuesta queda registrada para tu tutor.`));
  const ta = el('textarea'); ta.id = id; ta.maxLength = 500; ta.rows = 4;
  const cnt = el('div', 'count');
  const upd = () => { const n = ta.value.trim().length; cnt.textContent = n >= min ? `✓ ${n} caracteres` : `${n} / ${min} caracteres mínimos`; cnt.classList.toggle('ok', n >= min); };
  ta.addEventListener('input', () => { upd(); onChange(); });
  box.prepend(lab, hint); box.insertBefore(ta, model || null); box.insertBefore(cnt, model || null);
  if (model) model.innerHTML = '<strong>Elementos que una buena respuesta incluye:</strong> ' + model.innerHTML;
  upd();
  return {
    ok: () => ta.value.trim().length >= min,
    min, label: box.dataset.label || 'Respuesta escrita',
    get: () => ta.value.trim(),
    set: t => { ta.value = t || ''; upd(); },
    lock: () => { ta.readOnly = true; }
  };
}

/* ---------- Tareas: montaje, entrega y revisión ---------- */
const TYPES = { form: 'performance', evidence: 'performance', classify: 'performance', order: 'sequencing', matrix: 'performance', verdict: 'performance' };
const tasks = {};
const TEMPL = {};
function mountTask(root) {
  const id = root.dataset.task;
  if (!TEMPL[id]) TEMPL[id] = root.innerHTML; else root.innerHTML = TEMPL[id];
  root.classList.remove('reviewing');
  const crit = RUB.find(c => c.id === id) || { name: id, pts: 20 };
  const sec = root.closest('.screen');
  const onChange = () => sync();
  const comp = COMP[root.dataset.type](root, onChange, id.charCodeAt(id.length - 1) * 31 + id.length);
  const texts = $$('.otext', root).map(b => openText(b, onChange));
  const bar = el('div', 'deliver');
  const need = el('div', 'need');
  const btn = el('button', 'btn teal', 'Entregar respuesta'); btn.type = 'button';
  bar.append(need, btn); root.append(bar);
  let confirmT = null;
  function sync() {
    const sent = !!state.g[id];
    const missing = !comp.complete() ? comp.need() : (texts.find(t => !t.ok()) ? `Escribe al menos ${texts.find(t => !t.ok()).min} caracteres en tu respuesta escrita.` : '');
    btn.disabled = sent || !!missing;
    btn.style.display = sent ? 'none' : '';
    bar.classList.toggle('sent', sent);
    need.textContent = sent ? (state.fin ? `Entregada · nivel ${LEVELS[levelOf(state.acc[id] || 0)].n} (${ptsOf(crit, state.acc[id] || 0)} de ${crit.pts} puntos)` : '✓ Respuesta entregada. Verás la corrección y tu nivel en la rúbrica al final.')
      : (missing || 'Revisa tu respuesta: una vez entregada no se puede modificar.');
  }
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    if (!confirmT) {
      btn.textContent = 'Confirmar entrega';
      need.textContent = '¿Seguro? Después de entregar ya no podrás cambiar tu respuesta.';
      confirmT = setTimeout(() => { confirmT = null; btn.textContent = 'Entregar respuesta'; sync(); }, 5000);
      bar.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    clearTimeout(confirmT); confirmT = null;
    const acc = comp.score();
    state.a[id] = { v: comp.value(), t: texts.map(t => t.get()) };
    state.acc[id] = Math.round(acc * 1000) / 1000;
    state.g[id] = 1;
    comp.lock(); texts.forEach(t => t.lock());
    interaction(`${CFG.id}_${id}_i${state.att}`, TYPES[root.dataset.type] || 'performance', comp.summary(), ptsOf(crit, acc), crit.pts);
    texts.forEach((t, i) => interaction(`${CFG.id}_${id}_texto${i + 1}_i${state.att}`, 'fill-in', t.get(), 'neutral'));
    save(); sync(); refresh();
  });
  const saved = state.a[id];
  if (saved) { comp.set(saved.v); texts.forEach((t, i) => t.set((saved.t || [])[i])); }
  if (state.g[id]) { comp.lock(); texts.forEach(t => t.lock()); }
  if (state.fin && state.g[id]) { root.classList.add('reviewing'); comp.review(); }
  sync();
  tasks[id] = { root, comp, texts, crit, sec, sync };
}
const taskRoots = $$('.task[data-task]');

/* ---------- Pantallas, ruta y navegación ---------- */
const gates = screens.map(s => (s.dataset.gate || '').split(/\s+/).filter(Boolean));
const satisfied = i => gates[i].every(k => state.g[k]);
const allTasks = () => taskRoots.every(r => state.g[r.dataset.task]);
const reachable = i => state.fin || i === 0 || screens.slice(0, i).every((_, j) => satisfied(j));

const routeList = $('#route-list');
screens.forEach((s, i) => {
  const li = el('li');
  const b = el('button', null, `<span class="n"><span>${i + 1}</span></span><span>${esc(s.dataset.title)}</span>`);
  b.type = 'button';
  b.addEventListener('click', () => { if (reachable(i)) { go(i); document.body.classList.remove('route-open'); } });
  li.append(b); routeList.append(li);
});
$('#menu-btn').addEventListener('click', () => document.body.classList.toggle('route-open'));
$('#scrim').addEventListener('click', () => document.body.classList.remove('route-open'));

screens.forEach((s, i) => {
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
  const gated = gates.filter(g => g.length).length;
  let doneCount = 0;
  screens.forEach((s, i) => {
    if (satisfied(i) && gates[i].length) doneCount++;
    const li = lis[i];
    li.className = '';
    if (i === state.cur) li.classList.add('current');
    if (satisfied(i) && (gates[i].length || state.fin)) li.classList.add('done');
    if (!reachable(i)) li.classList.add('locked');
    $('button', li).disabled = !reachable(i);
    s._next.disabled = !satisfied(i);
    s._msg.className = 'gate-msg' + (satisfied(i) ? ' ok' : '');
    s._msg.textContent = satisfied(i) ? (i === screens.length - 1 ? '' : '✓ Listo') : (s.dataset.need || 'Entrega tu respuesta para continuar');
  });
  const pct = state.fin ? 100 : Math.round(doneCount / Math.max(1, gated) * 100);
  $('#pct').textContent = pct + '%';
  $('#bar').style.width = pct + '%';
  $('#route-foot').innerHTML = state.fin
    ? `<strong>Evaluación entregada.</strong> Puedes revisar la corrección de cada criterio.` + (state.best != null ? `<br>Mejor puntaje: <strong>${state.best} / 100</strong>` : '')
    : `Avance: <strong>${pct}%</strong><br>Cada respuesta se entrega una sola vez. La corrección aparece al final.` + (state.best != null ? `<br>Mejor puntaje anterior: <strong>${state.best} / 100</strong>` : '');
}

function go(i) {
  i = Math.max(0, Math.min(screens.length - 1, i));
  if (!reachable(i)) return;
  screens.forEach((s, j) => s.classList.toggle('active', j === i));
  state.cur = i;
  if (i === screens.length - 1 && allTasks() && !state.fin) finalize();
  save(); refresh();
  if (i === screens.length - 1) renderResults();
  window.scrollTo({ top: 0, behavior: 'instant' });
  const h = $('h1,h2', screens[i]);
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}

/* ---------- Pantalla de instrucciones: rúbrica y confirmación ---------- */
function rubricTable(hits) {
  const head = LEVELS.slice().reverse().map(l => `<th>${l.n}<small>${Math.round(l.f * 100)}% del puntaje</small></th>`).join('');
  const rows = RUB.map(c => {
    const lv = hits ? levelOf(hits[c.id] || 0) : -1;
    const cells = [3, 2, 1, 0].map(k => `<td class="${k === lv ? 'hit' : ''}">${esc(c.levels[k])}</td>`).join('');
    return `<tr><th>${esc(c.name)}<small>${c.pts} puntos · Lección ${esc(c.lesson)}</small></th>${cells}</tr>`;
  }).join('');
  return `<div class="rubric-wrap"><table class="rubric"><thead><tr><th>Criterio</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
$$('[data-c="rubric"]').forEach(d => { d.innerHTML = rubricTable(null); });
$$('[data-c="ack"]').forEach(d => {
  const lab = el('label', 'ack', `<input type="checkbox"><span>${esc(d.dataset.text || 'Leí las instrucciones y la rúbrica.')}</span>`);
  const box = $('input', lab);
  box.checked = !!state.g[d.dataset.key];
  box.addEventListener('change', () => { if (box.checked) state.g[d.dataset.key] = 1; else delete state.g[d.dataset.key]; save(); refresh(); });
  d.replaceWith(lab);
});
/* Documentos del caso: se deben abrir todos */
$$('[data-c="docs"]').forEach(box => {
  const docs = $$('details.doc', box);
  const key = box.dataset.key;
  const upd = () => { if (docs.every((d, i) => state.docs.includes(i))) { state.g[key] = 1; } save(); refresh(); };
  docs.forEach((d, i) => {
    if (state.docs.includes(i)) d.classList.add('seen');
    d.addEventListener('toggle', () => { if (d.open && !state.docs.includes(i)) { state.docs.push(i); d.classList.add('seen'); upd(); } });
  });
});

/* ---------- Cierre: puntaje, rúbrica y SCORM ---------- */
function total() { return RUB.reduce((s, c) => s + ptsOf(c, state.acc[c.id] || 0), 0); }
function finalize() {
  state.fin = true;
  const t = total();
  state.best = state.best == null ? t : Math.max(state.best, t);
  if (state.best >= PASS) state.passed = true;
  if (apiOn) {
    lms('LMSSetValue', 'cmi.core.score.raw', String(state.best));
    lms('LMSSetValue', 'cmi.core.lesson_status', state.passed ? 'passed' : 'failed');
    lms('LMSSetValue', 'cmi.core.exit', '');
  }
  taskRoots.forEach(r => mountTask(r));
}
function report() {
  const t = total();
  const lines = [CFG.title, CFG.course, '', `Intento ${state.att} · Puntaje: ${t} / 100 · ${t >= PASS ? 'Aprobada' : 'No aprobada'} (mínimo ${PASS})`, ''];
  RUB.forEach(c => {
    const acc = state.acc[c.id] || 0;
    lines.push(`${c.name}: ${LEVELS[levelOf(acc)].n} · ${ptsOf(c, acc)} de ${c.pts} puntos`);
    const tk = tasks[c.id];
    (state.a[c.id]?.t || []).forEach((tx, i) => lines.push(`  ${tk ? tk.texts[i].label : 'Respuesta escrita'}:`, '  ' + tx));
  });
  return lines.join('\n');
}
function renderResults() {
  const box = $('[data-c="results"]');
  if (!box) return;
  if (!state.fin) { box.innerHTML = '<p class="how">Entrega las respuestas de todos los criterios para ver tu resultado.</p>'; return; }
  const t = total();
  const ok = t >= PASS;
  const hits = state.acc;
  const rows = RUB.map(c => {
    const acc = state.acc[c.id] || 0, lv = levelOf(acc);
    return `<tr><th>${esc(c.name)}<br><button class="go" type="button" data-go="${c.id}">Ver corrección</button></th><td class="lv"><span class="lvl ${LEVELS[lv].cls}">${LEVELS[lv].n}</span><div style="font-size:.86rem;margin-top:6px">${esc(c.levels[lv])}</div></td><td class="pts">${ptsOf(c, acc)} / ${c.pts}</td></tr>`;
  }).join('');
  const written = RUB.flatMap(c => (state.a[c.id]?.t || []).map((tx, i) => `<div class="w"><b>${esc(tasks[c.id]?.texts[i]?.label || c.name)}</b><p>${esc(tx)}</p></div>`)).join('');
  box.innerHTML = `
    <div class="res-hero">
      <div class="score-ring" style="--p:${t};--c:${ok ? 'var(--green)' : 'var(--red)'}"><b>${t}</b></div>
      <div>
        <div class="eyebrow">${ok ? 'Evaluación aprobada' : 'Evaluación no aprobada'}</div>
        <h3 style="font-size:1.4rem;margin:.1em 0 .3em">${t} de 100 puntos · mínimo para aprobar: ${PASS}</h3>
        <p style="margin:0">${ok ? 'Tus decisiones en el caso cumplen el estándar de la rúbrica.' : 'Revisa la corrección de los criterios con nivel más bajo y vuelve a intentarlo.'}
        ${state.best != null && state.best !== t ? `<br><strong>Mejor puntaje registrado: ${state.best}.</strong>` : ''}</p>
      </div>
    </div>
    <table class="res-table"><thead><tr><th>Criterio</th><th>Nivel alcanzado</th><th style="text-align:right">Puntos</th></tr></thead><tbody>${rows}</tbody></table>
    <h3 style="margin-top:22px">Rúbrica con tu nivel marcado</h3>
    ${rubricTable(hits)}
    ${written ? `<h3 style="margin-top:22px">Tus respuestas escritas</h3><p class="res-note" style="margin-top:0">Quedan registradas en Moodle para tu tutor, que puede considerarlas al revisar tu evaluación.</p><div class="written">${written}</div>` : ''}
    <div class="res-actions">
      <button class="btn" type="button" data-act="dl">Descargar mi informe</button>
      <button class="btn ghost" type="button" data-act="print">Imprimir</button>
      <button class="btn ghost" type="button" data-act="retry">Nuevo intento</button>
    </div>
    <p class="res-note">Se registra en Moodle tu mejor puntaje. Un nuevo intento borra tus respuestas actuales y comienza otra vez desde el primer criterio.</p>`;
  $$('[data-go]', box).forEach(b => b.addEventListener('click', () => { const tk = tasks[b.dataset.go]; if (tk) go(screens.indexOf(tk.sec)); }));
  $('[data-act="dl"]', box).addEventListener('click', () => {
    const blob = new Blob([report()], { type: 'text/plain;charset=utf-8' });
    const a = el('a'); a.href = URL.createObjectURL(blob); a.download = (CFG.name || 'evaluacion') + '_informe.txt';
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  $('[data-act="print"]', box).addEventListener('click', () => window.print());
  const rb = $('[data-act="retry"]', box);
  let armed = null;
  rb.addEventListener('click', () => {
    if (!armed) { rb.textContent = 'Confirmar nuevo intento'; armed = setTimeout(() => { armed = null; rb.textContent = 'Nuevo intento'; }, 5000); return; }
    clearTimeout(armed);
    taskRoots.forEach(r => { delete state.g[r.dataset.task]; delete state.a[r.dataset.task]; delete state.acc[r.dataset.task]; });
    state.fin = false; state.att++;
    if (apiOn && !state.passed) lms('LMSSetValue', 'cmi.core.lesson_status', 'incomplete');
    taskRoots.forEach(r => mountTask(r));
    go(screens.indexOf(taskRoots[0].closest('.screen')));
  });
}

/* ---------- Inicio ---------- */
load();
taskRoots.forEach(r => mountTask(r));
if (state.cur >= screens.length || !reachable(state.cur)) state.cur = 0;
go(state.cur);
})();
