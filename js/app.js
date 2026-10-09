/* =========================================================================
 * Flujo del alumno: registro → niveles → resultado
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.SIM_CONFIG;
  const T = window.XLTasks;
  const Store = window.SimStore;
  const SKEY = 'simxl_session_v1';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  let S = null;
  let ui = null;
  let timerId = null;
  let saveT = null;

  /* ----------------------------- Sesión ----------------------------- */
  function persist() {
    try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ }
  }
  function persistSoon() { clearTimeout(saveT); saveT = setTimeout(persist, 300); }
  function loadSession() {
    try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; }
  }
  const uid = () => 'EV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const level = () => T.levels[S.levelIdx];
  const task = () => level().tasks[S.taskIdx];

  function show(id) {
    for (const v of document.querySelectorAll('.view')) v.hidden = v.id !== id;
    document.body.classList.toggle('working', id === 'view-work');
  }

  /* ----------------------------- Resultado ----------------------------- */
  function finalLevel() {
    let reached = -1;
    T.levels.forEach((l, i) => { const r = S.levels[l.id]; if (r && r.passed) reached = i; });
    if (!C.ADAPTIVE) {
      // nivel = el más alto aprobado de forma consecutiva desde básico
      reached = -1;
      for (let i = 0; i < T.levels.length; i++) { const r = S.levels[T.levels[i].id]; if (r && r.passed) reached = i; else break; }
    }
    return reached;
  }
  function levelName(idx) { return idx < 0 ? 'Inicial' : T.levels[idx].name; }
  function recommendation(idx) {
    if (idx < 0) return 'Curso ' + T.levels[0].course;
    if (idx >= T.levels.length - 1) return 'Domina los contenidos del nivel avanzado. Puede profundizar en análisis de datos y automatización (VBA).';
    return 'Curso ' + T.levels[idx + 1].course;
  }
  function buildRecord() {
    const L = S.levels;
    const fl = finalLevel();
    const pct = (id) => (L[id] ? Math.round(L[id].pct) : '');
    const end = S.finishedAt ? new Date(S.finishedAt) : new Date();
    const detalle = {};
    for (const l of T.levels) {
      const r = L[l.id];
      if (!r) continue;
      detalle[l.id] = { pct: Math.round(r.pct), aprobado: r.passed, tiempoMin: Math.round(r.timeSec / 6) / 10, tareas: r.tasks.map((t) => ({ id: t.id, titulo: t.title, modulo: t.module, puntaje: Math.round(t.score * 100), criterios: t.items.map((x) => [x.label, x.f != null ? Math.round(x.f * 100) / 100 : x.ok ? 1 : 0]) })) };
    }
    return {
      id: S.id,
      fechaInicio: S.startedAt,
      fechaTermino: S.finished ? S.finishedAt : '',
      nombre: S.student.nombre,
      apellido: S.student.apellido,
      correo: S.student.correo,
      estado: S.finished ? 'Finalizado' : 'En curso (' + level().name + ')',
      nivel: S.finished ? levelName(fl) : (fl >= 0 ? levelName(fl) + ' (parcial)' : 'En evaluación'),
      recomendacion: S.finished ? recommendation(fl) : '',
      basico: pct('basico'),
      intermedio: pct('intermedio'),
      avanzado: pct('avanzado'),
      duracionMin: Math.round((end - new Date(S.startedAt)) / 6000) / 10,
      detalle: JSON.stringify(detalle),
    };
  }
  async function sync() {
    const r = await Store.save(buildRecord());
    S.syncOk = r.ok;
    persist();
    return r;
  }

  /* ----------------------------- Registro ----------------------------- */
  function initStart() {
    $('.org').textContent = C.ORG_NAME ? ' · ' + C.ORG_NAME : '';
    for (const e of document.querySelectorAll('.pass-pct')) e.textContent = C.PASS_PERCENT + '% o más';
    const prev = loadSession();
    if (prev && prev.student) {
      const box = $('#resume');
      box.hidden = false;
      box.innerHTML = prev.finished
        ? 'Hay una evaluación finalizada de <b>' + esc(prev.student.nombre + ' ' + prev.student.apellido) + '</b> en este navegador. <div class="row"><button class="btn" type="button" id="see-prev">Ver resultado</button><button class="btn" type="button" id="new-eval">Nueva evaluación</button></div>'
        : 'Tienes una evaluación en curso de <b>' + esc(prev.student.nombre + ' ' + prev.student.apellido) + '</b> (nivel ' + esc(T.levels[prev.levelIdx].name) + '). <div class="row"><button class="btn pri" type="button" id="resume-btn">Continuar evaluación</button><button class="btn" type="button" id="new-eval">Empezar de nuevo</button></div>';
      const r = $('#resume-btn');
      if (r) r.onclick = () => { S = prev; route(); };
      const sp = $('#see-prev');
      if (sp) sp.onclick = () => { S = prev; route(); };
      $('#new-eval').onclick = () => {
        const reset = () => { try { localStorage.removeItem(SKEY); } catch (e) { /* sin almacenamiento */ } box.hidden = true; };
        if (prev.finished) reset(); else appConfirm('Se perderá el avance de la evaluación en curso. ¿Desea continuar?', reset);
      };
    }
    $('#form-start').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const nombre = f.nombre.value.trim();
      const apellido = f.apellido.value.trim();
      const correo = f.correo.value.trim().toLowerCase();
      const err = $('#start-err');
      if (nombre.length < 2) { err.textContent = 'Ingresa tu nombre.'; f.nombre.focus(); return; }
      if (apellido.length < 2) { err.textContent = 'Ingresa tu apellido.'; f.apellido.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) { err.textContent = 'Ingresa un correo electrónico válido.'; f.correo.focus(); return; }
      if (!f.acepto.checked) { err.textContent = 'Debes aceptar el registro de resultados para continuar.'; return; }
      err.textContent = '';
      S = { id: uid(), student: { nombre, apellido, correo }, startedAt: new Date().toISOString(), levelIdx: 0, taskIdx: 0, phase: 'intro', states: {}, levels: {}, finished: false };
      persist();
      sync();
      route();
    });
  }

  function route() {
    $('#who').innerHTML = S ? '<span>' + esc(S.student.nombre + ' ' + S.student.apellido) + '</span><small>' + esc(S.student.correo) + '</small>' : '';
    if (S.finished) return renderEnd();
    if (S.phase === 'intro') return renderLevelIntro();
    if (S.phase === 'levelResult') return renderLevelResult();
    return startWork();
  }

  /* ----------------------------- Nivel ----------------------------- */
  function renderLevelIntro() {
    stopTimer();
    const L = level();
    const mins = C.TIME_LIMITS[L.id] || 0;
    const modules = L.tasks.map((t) => t.title);
    $('#level-card').innerHTML =
      '<div class="lv-badge lv-' + L.id + '">Nivel ' + (S.levelIdx + 1) + ' de ' + T.levels.length + '</div>' +
      '<h1>' + esc(L.name) + '</h1>' +
      '<p class="lead">Basado en el temario del curso <b>' + esc(L.course) + '</b>.</p>' +
      '<div class="facts"><div><b>' + L.tasks.length + '</b><span>actividades</span></div><div><b>' + (mins ? mins + ' min' : 'Sin límite') + '</b><span>tiempo máximo</span></div><div><b>' + C.PASS_PERCENT + '%</b><span>para aprobar</span></div></div>' +
      '<h3>Contenidos que se evalúan</h3><ul class="topics">' + modules.map((m) => '<li>' + esc(m) + '</li>').join('') + '</ul>' +
      '<p class="small">Puedes moverte libremente entre las actividades del nivel. Cuando termines, presiona <b>Finalizar nivel</b>. ' + (mins ? 'Si se acaba el tiempo, el nivel se entrega automáticamente.' : '') + '</p>' +
      '<button class="btn pri big" id="go-level" type="button">Comenzar nivel ' + esc(L.name) + '</button>';
    show('view-level');
    $('#go-level').onclick = () => {
      S.phase = 'work';
      S.taskIdx = 0;
      S.levelStartedAt = Date.now();
      persist();
      startWork();
    };
  }

  function renderLevelResult() {
    stopTimer();
    const L = level();
    const r = S.levels[L.id];
    const next = T.levels[S.levelIdx + 1];
    const passed = r.passed;
    let html = '<div class="lv-badge lv-' + L.id + '">Nivel ' + esc(L.name) + ' completado</div>' +
      '<h1>' + (passed ? '¡Aprobaste el nivel ' + esc(L.name) + '!' : 'Nivel ' + esc(L.name) + ' finalizado') + '</h1>' +
      '<div class="big-pct ' + (passed ? 'ok' : 'no') + '">' + Math.round(r.pct) + '%</div>';
    if (next) {
      html += '<p class="lead">' + (passed ? 'Puedes continuar con el nivel <b>' + esc(next.name) + '</b>.' : 'Puedes continuar con el nivel ' + esc(next.name) + '.') + '</p>' +
        '<div class="row center"><button class="btn pri big" id="go-next" type="button">Continuar al nivel ' + esc(next.name) + '</button><button class="btn" id="stop-here" type="button">Terminar la evaluación aquí</button></div>';
    }
    $('#level-card').innerHTML = html;
    show('view-level');
    const gn = $('#go-next');
    if (gn) gn.onclick = () => { S.levelIdx++; S.taskIdx = 0; S.phase = 'intro'; persist(); renderLevelIntro(); };
    const sh = $('#stop-here');
    if (sh) sh.onclick = () => appConfirm('¿Seguro que deseas terminar la evaluación ahora?', finishAll);
  }

  /* ----------------------------- Trabajo ----------------------------- */
  function startWork() {
    show('view-work');
    if (!ui) {
      ui = new window.XLSheetUI($('#sheet-host'), {
        onChange: (wb) => {
          const t = task();
          if (!t || t.type === 'quiz') return;
          S.states[t.id] = { wb: wb.toJSON(), touched: true };
          persistSoon();
          renderTaskList();
        },
      });
    }
    $('#btn-prev').onclick = () => openTask(S.taskIdx - 1);
    $('#btn-next').onclick = () => openTask(S.taskIdx + 1);
    $('#btn-finish').onclick = confirmFinishLevel;
    openTask(S.taskIdx);
    startTimer();
  }

  function saveCurrent() {
    const t = task();
    if (!t || !ui || !ui.wb || t.type === 'quiz') return;
    if (ui.editing && !ui.commitEdit(true)) ui.cancelEdit();
    if (S.states[t.id] && S.states[t.id].touched) S.states[t.id].wb = ui.wb.toJSON();
  }

  function renderTaskList() {
    const L = level();
    $('#work-level').innerHTML = '<span class="lv-dot lv-' + L.id + '"></span>Nivel ' + esc(L.name) + ' <small>Actividad ' + (S.taskIdx + 1) + ' de ' + L.tasks.length + '</small>';
    $('#task-list').innerHTML = L.tasks.map((t, i) => {
      const st = S.states[t.id];
      const done = st && (st.touched || (st.answers && st.answers.some((a) => a != null && a !== '')));
      return '<button type="button" class="tl' + (i === S.taskIdx ? ' on' : '') + (done ? ' done' : '') + '" data-i="' + i + '" title="' + esc(t.title) + '">' + (i + 1) + '</button>';
    }).join('');
    for (const b of document.querySelectorAll('#task-list .tl')) b.onclick = () => openTask(+b.dataset.i);
  }

  function openTask(i) {
    const L = level();
    if (i < 0 || i >= L.tasks.length) return;
    saveCurrent();
    S.taskIdx = i;
    persist();
    const t = task();
    renderTaskList();
    $('#task-panel').innerHTML =
      '<div class="t-mod">' + esc(t.module) + '</div>' +
      '<h2>' + (i + 1) + '. ' + esc(t.title) + '</h2>' +
      '<p>' + t.intro + '</p>' +
      (t.steps ? '<ol class="t-steps">' + t.steps.map((s) => '<li>' + s + '</li>').join('') + '</ol>' : '') +
      (t.hint ? '<details class="hint"><summary>💡 Ver ayuda</summary><p>' + esc(t.hint) + '</p></details>' : '') +
      (t.type === 'quiz' ? '' : '<button class="btn small-btn" id="btn-reset" type="button">↺ Reiniciar esta actividad</button>');
    $('#btn-prev').disabled = i === 0;
    $('#btn-next').disabled = i === L.tasks.length - 1;
    const rb = $('#btn-reset');
    if (rb) rb.onclick = () => appConfirm('Se borrarán los cambios realizados en esta actividad. ¿Continuar?', () => { delete S.states[t.id]; persist(); openTask(S.taskIdx); });
    if (t.type === 'quiz') {
      $('#sheet-host').hidden = true;
      $('#quiz-host').hidden = false;
      renderQuiz(t);
    } else {
      $('#quiz-host').hidden = true;
      $('#sheet-host').hidden = false;
      const st = S.states[t.id];
      ui.setWorkbook(new window.XLWorkbook(st && st.wb ? st.wb : t.setup()));
    }
  }

  function renderQuiz(t) {
    const st = S.states[t.id] || { answers: [] };
    const host = $('#quiz-host');
    host.innerHTML = '<div class="quiz">' + t.questions.map((q, i) => {
      let inner = '';
      if (q.kind === 'mc') inner = q.options.map((o, k) => '<label class="opt"><input type="radio" name="q' + i + '" value="' + k + '"' + (String(st.answers[i]) === String(k) ? ' checked' : '') + '> ' + esc(o) + '</label>').join('');
      else inner = '<input class="qtext" data-i="' + i + '" placeholder="' + (q.kind === 'formula' ? 'Escribe la fórmula, comenzando con =' : 'Escribe tu respuesta') + '" value="' + esc(st.answers[i] ?? '') + '">';
      return '<div class="q"><div class="qn">Pregunta ' + (i + 1) + '</div><p>' + esc(q.q) + '</p>' + inner + '</div>';
    }).join('') + '<p class="small">Tus respuestas se guardan automáticamente.</p></div>';
    const update = () => {
      const answers = t.questions.map((q, i) => {
        if (q.kind === 'mc') { const r = host.querySelector('input[name=q' + i + ']:checked'); return r ? Number(r.value) : null; }
        return host.querySelector('.qtext[data-i="' + i + '"]').value;
      });
      S.states[t.id] = { answers };
      persistSoon();
      renderTaskList();
    };
    host.querySelectorAll('input').forEach((x) => { x.addEventListener('change', update); x.addEventListener('input', update); });
  }

  /* ----------------------------- Tiempo ----------------------------- */
  function startTimer() {
    stopTimer();
    const mins = C.TIME_LIMITS[level().id] || 0;
    const el = $('#timer');
    el.hidden = false;
    const tick = () => {
      const used = (Date.now() - S.levelStartedAt) / 1000;
      if (!mins) { el.textContent = '⏱ ' + fmtTime(used); return; }
      const left = mins * 60 - used;
      el.textContent = '⏱ ' + fmtTime(Math.max(0, left));
      el.classList.toggle('low', left < 120);
      if (left <= 0) { stopTimer(); appAlert('Se acabó el tiempo del nivel ' + level().name + '. Tus respuestas se entregaron automáticamente.'); finishLevel(); }
    };
    tick();
    timerId = setInterval(tick, 1000);
  }
  function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; $('#timer').hidden = true; }
  function fmtTime(sec) { sec = Math.round(sec); const m = Math.floor(sec / 60); const s = sec % 60; return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }

  /* ----------------------------- Entrega ----------------------------- */
  function confirmFinishLevel() {
    const L = level();
    const pending = L.tasks.filter((t) => !S.states[t.id]).length;
    appConfirm('¿Finalizar el nivel ' + L.name + '?' + (pending ? '\n\nTienes ' + pending + ' actividad(es) sin abrir o sin cambios.' : '') + '\n\nNo podrás volver a modificar este nivel.', finishLevel);
  }

  function finishLevel() {
    saveCurrent();
    const L = level();
    const tasks = L.tasks.map((t) => {
      const g = T.grade(t, S.states[t.id]);
      return { id: t.id, title: t.title, module: t.module, score: g.score, items: g.items };
    });
    const pct = (tasks.reduce((s, x) => s + x.score, 0) / tasks.length) * 100;
    S.levels[L.id] = { pct, passed: pct >= C.PASS_PERCENT, tasks, timeSec: Math.round((Date.now() - S.levelStartedAt) / 1000), finishedAt: new Date().toISOString() };
    const next = T.levels[S.levelIdx + 1];
    const continues = next && (S.levels[L.id].passed || !C.ADAPTIVE);
    persist();
    if (!continues) { finishAll(); return; }
    S.phase = 'levelResult';
    persist();
    sync();
    renderLevelResult();
  }

  function finishAll() {
    stopTimer();
    S.finished = true;
    S.finishedAt = new Date().toISOString();
    persist();
    renderEnd();
    sync().then(() => renderSyncState());
  }

  function renderSyncState() {
    const el = $('#sync-state');
    if (!el) return;
    if (!Store.remote) el.innerHTML = '<span class="warnc">Modo demostración: el resultado quedó guardado solo en este navegador.</span>';
    else el.innerHTML = S.syncOk ? '<span class="okc">✓ Resultado enviado al equipo docente.</span>' : '<span class="warnc">No se pudo enviar el resultado. Revisa tu conexión: se reintentará automáticamente.</span> <button class="btn" type="button" id="retry">Reintentar</button>';
    const rt = $('#retry');
    if (rt) rt.onclick = () => sync().then(renderSyncState);
  }

  function renderEnd() {
    stopTimer();
    show('view-end');
    const fl = finalLevel();
    const lvls = T.levels.map((l) => {
      const r = S.levels[l.id];
      return '<div class="lvrow"><span class="lv-dot lv-' + l.id + '"></span><b>' + esc(l.name) + '</b>' +
        (r ? '<div class="bar"><i style="width:' + Math.round(r.pct) + '%"></i></div><span class="pc">' + Math.round(r.pct) + '%</span><span class="tag ' + (r.passed ? 'ok' : 'no') + '">' + (r.passed ? 'Aprobado' : 'No aprobado') + '</span>' : '<div class="bar"></div><span class="pc">—</span><span class="tag">No rendido</span>') + '</div>';
    }).join('');
    let detail = '';
    if (C.SHOW_DETAIL_TO_STUDENT) {
      detail = '<details class="detail"><summary>Ver detalle por actividad</summary>' + T.levels.filter((l) => S.levels[l.id]).map((l) => '<h4>Nivel ' + esc(l.name) + '</h4><table>' + S.levels[l.id].tasks.map((t) => '<tr><td>' + esc(t.title) + '<div class="crit">' + t.items.map((x) => '<span class="' + ((x.f != null ? x.f === 1 : x.ok) ? 'okc' : 'noc') + '">' + ((x.f != null ? x.f === 1 : x.ok) ? '✓' : '✗') + ' ' + esc(x.label) + '</span>').join('') + '</div></td><td class="num">' + Math.round(t.score * 100) + '%</td></tr>').join('') + '</table>').join('') + '</details>';
    }
    $('#end-card').innerHTML =
      '<p class="small">Evaluación ' + esc(S.id) + ' · ' + esc(new Date(S.finishedAt || Date.now()).toLocaleString('es-CL')) + '</p>' +
      '<h1>Resultado de ' + esc(S.student.nombre + ' ' + S.student.apellido) + '</h1>' +
      '<div class="final-level lv-' + (fl >= 0 ? T.levels[fl].id : 'inicial') + '"><span>Nivel alcanzado</span><b>' + esc(levelName(fl)) + '</b></div>' +
      '<p class="lead"><b>Recomendación:</b> ' + esc(recommendation(fl)) + '</p>' +
      '<div class="lvls">' + lvls + '</div>' + detail +
      '<p id="sync-state" class="sync"></p>' +
      '<div class="row center noprint"><button class="btn" type="button" id="print">🖨 Imprimir / guardar comprobante (PDF)</button><button class="btn" type="button" id="new">Nueva evaluación</button></div>';
    renderSyncState();
    $('#print').onclick = () => { document.querySelectorAll('#end-card details').forEach((d) => { d.open = true; }); window.print(); };
    $('#new').onclick = () => appConfirm('Se cerrará este resultado en este navegador (ya quedó registrado). ¿Comenzar una nueva evaluación?', () => { try { localStorage.removeItem(SKEY); } catch (e) { /* sin almacenamiento */ } location.reload(); });
  }

  /* ----------------------------- Diálogos ----------------------------- */
  function appAlert(msg) {
    const m = $('#app-modal');
    m.hidden = false;
    m.innerHTML = '<div class="box"><p>' + esc(msg).replace(/\n/g, '<br>') + '</p><div class="row end"><button class="btn pri" type="button">Aceptar</button></div></div>';
    m.querySelector('button').onclick = () => { m.hidden = true; };
  }
  function appConfirm(msg, onYes) {
    const m = $('#app-modal');
    m.hidden = false;
    m.innerHTML = '<div class="box"><p>' + esc(msg).replace(/\n/g, '<br>') + '</p><div class="row end"><button class="btn" type="button" data-v="0">Cancelar</button><button class="btn pri" type="button" data-v="1">Aceptar</button></div></div>';
    for (const b of m.querySelectorAll('button')) b.onclick = () => { m.hidden = true; if (b.dataset.v === '1') onYes(); };
  }

  window.addEventListener('beforeunload', () => { if (S && !S.finished) { saveCurrent(); persist(); } });

  initStart();
  Store.flush();
  // Si hay una sesión activa, la retomamos directamente
  const prev = loadSession();
  if (prev && prev.student && !prev.finished && prev.phase === 'work') { S = prev; route(); }

  // API para pruebas automatizadas
  window.__sim = { get S() { return S; }, get ui() { return ui; }, finishLevel, openTask };
})();
