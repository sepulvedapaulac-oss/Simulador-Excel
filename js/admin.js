/* =========================================================================
 * Panel docente: lista de resultados con nombre, apellido, correo y nivel
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.SIM_CONFIG;
  const Store = window.SimStore;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const LEVEL_CLASS = { Inicial: 'p-inicial', 'Básico': 'p-basico', Intermedio: 'p-intermedio', Avanzado: 'p-avanzado' };
  const recShort = (r) => r.cursoRecomendado || (/básico/i.test(r.recomendacion || '') ? 'Básico' : /intermedio/i.test(r.recomendacion || '') ? 'Intermedio' : /avanzado/i.test(r.recomendacion || '') ? 'Avanzado' : '');
  const LEVEL_NAMES = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };

  let rows = [];
  let key = sessionStorage.getItem('simxl_admin_key') || '';
  let sortK = 'fechaInicio';
  let sortDir = -1;

  $('.org').textContent = C.ORG_NAME ? ' · ' + C.ORG_NAME : '';

  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d)) return String(s);
    return d.toLocaleDateString('es-CL') + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  async function load() {
    $('#login-err').textContent = '';
    try {
      const r = await Store.list(key);
      if (!r.ok) {
        $('#login-err').textContent = r.error === 'Clave incorrecta' ? 'Clave incorrecta.' : 'No se pudieron cargar los resultados: ' + r.error;
        sessionStorage.removeItem('simxl_admin_key');
        $('#login').hidden = false;
        $('#results').hidden = true;
        return;
      }
      rows = r.rows.map((x) => ({ ...x, basico: num(x.basico), intermedio: num(x.intermedio), avanzado: num(x.avanzado), duracionMin: num(x.duracionMin) }));
      if (r.remote) sessionStorage.setItem('simxl_admin_key', key);
      $('#login').hidden = !r.remote ? false : true;
      $('#results').hidden = false;
      $('#note').innerHTML = r.remote
        ? 'Los datos se obtienen de la hoja de cálculo de Google configurada. También puede revisarlos directamente en esa planilla.'
        : '';
      draw();
    } catch (e) {
      $('#login-err').textContent = 'No se pudo conectar con Google Apps Script. Revise la URL en js/config.js y que la app web esté publicada con acceso para "Cualquier usuario". (' + e.message + ')';
      $('#login').hidden = false;
    }
  }
  const num = (v) => (v === '' || v == null ? '' : Number(v));

  function filtered() {
    const q = $('#q').value.trim().toLowerCase();
    const lv = $('#f-level').value;
    return rows.filter((r) => {
      if (q && !(String(r.nombre) + ' ' + r.apellido + ' ' + r.correo).toLowerCase().includes(q)) return false;
      if (lv === '__curso') return String(r.estado).startsWith('En curso');
      if (lv && !String(recShort(r)).startsWith(lv)) return false;
      return true;
    }).sort((a, b) => {
      const x = a[sortK]; const y = b[sortK];
      if (x === y) return 0;
      if (x === '' || x == null) return 1;
      if (y === '' || y == null) return -1;
      return (x > y ? 1 : -1) * sortDir;
    });
  }

  function draw() {
    const list = filtered();
    $('#count').textContent = '(' + list.length + ' de ' + rows.length + ')';
    const fin = rows.filter((r) => r.estado === 'Finalizado');
    const by = (n) => fin.filter((r) => String(recShort(r)).startsWith(n)).length;
    $('#stats').innerHTML = '<div><b>' + rows.length + '</b>evaluaciones</div><div><b>' + fin.length + '</b>finalizadas</div>' +
      [['Básico', 'curso Básico'], ['Intermedio', 'curso Intermedio'], ['Avanzado', 'curso Avanzado'], ['Ninguno', 'dominan el avanzado']].map(([n, l]) => '<div><b>' + by(n) + '</b>' + l + '</div>').join('');
    $('#rows').innerHTML = list.map((r) => {
      const enCurso = String(r.estado).startsWith('En curso');
      const rs = recShort(r);
      const pill = enCurso ? '<span class="pill p-curso">En curso</span>' : '<span class="pill ' + (LEVEL_CLASS[rs] || 'p-inicial') + '">' + esc(rs || '—') + '</span>';
      const pc = (v) => (v === '' ? '—' : v + '%');
      return '<tr><td>' + esc(fmtDate(r.fechaInicio)) + '</td><td>' + esc(r.nombre) + '</td><td>' + esc(r.apellido) + '</td><td><a href="mailto:' + esc(r.correo) + '">' + esc(r.correo) + '</a></td><td>' + pill + '</td><td>' + esc(enCurso ? '' : r.nivel) + '</td><td class="num">' + pc(r.basico) + '</td><td class="num">' + pc(r.intermedio) + '</td><td class="num">' + pc(r.avanzado) + '</td><td class="num">' + esc(r.duracionMin) + '</td><td>' + esc(r.estado) + '</td><td><button class="btn" type="button" data-id="' + esc(r.id) + '">Detalle</button></td></tr>';
    }).join('') || '<tr><td colspan="12" class="small">No hay resultados todavía.</td></tr>';
    for (const b of document.querySelectorAll('#rows button')) b.onclick = () => detail(rows.find((r) => r.id === b.dataset.id));
  }

  function detail(r) {
    let d = {};
    try { d = typeof r.detalle === 'string' ? JSON.parse(r.detalle || '{}') : r.detalle || {}; } catch (e) { d = {}; }
    let html = '<div class="det"><h2>' + esc(r.nombre + ' ' + r.apellido) + '</h2><p class="small">' + esc(r.correo) + ' · ' + esc(r.id) + '<br>Inicio: ' + esc(fmtDate(r.fechaInicio)) + (r.fechaTermino ? ' · Término: ' + esc(fmtDate(r.fechaTermino)) : '') + '</p>' +
      '<p><b>Curso recomendado:</b> ' + esc(r.recomendacion || '—') + '<br><b>Nivel identificado:</b> ' + esc(r.nivel) + '</p>';
    for (const [lv, info] of Object.entries(d)) {
      html += '<h3>Nivel ' + esc(LEVEL_NAMES[lv] || lv) + ': ' + info.pct + '% · ' + esc(info.dominio || '') + ' · ' + info.tiempoMin + ' min</h3><table>';
      for (const t of info.tareas) {
        html += '<tr><td><b>' + esc(t.titulo) + '</b>' + (t.omitida ? ' <span class="small">(marcó "No sé hacerlo")</span>' : '') + '<div class="small">' + esc(t.modulo) + '</div><div class="crit">' + t.criterios.map(([l, v]) => '<span class="' + (v === 1 ? 'okc' : 'noc') + '">' + (v === 1 ? '✓' : '✗') + ' ' + esc(l) + '</span>').join('') + '</div></td><td class="num"><b>' + t.puntaje + '%</b></td></tr>';
      }
      html += '</table>';
    }
    html += '</div>';
    const m = $('#app-modal');
    m.hidden = false;
    m.innerHTML = '<div class="box big">' + html + '<div class="row end"><button class="btn pri" type="button">Cerrar</button></div></div>';
    m.querySelector('.row button').onclick = () => { m.hidden = true; };
    m.onclick = (e) => { if (e.target === m) m.hidden = true; };
  }

  function csv() {
    const cols = [['fechaInicio', 'Fecha inicio'], ['fechaTermino', 'Fecha término'], ['nombre', 'Nombre'], ['apellido', 'Apellido'], ['correo', 'Correo'], ['cursoRecomendado', 'Curso recomendado'], ['nivel', 'Nivel identificado'], ['recomendacion', 'Recomendación'], ['basico', '% Básico'], ['intermedio', '% Intermedio'], ['avanzado', '% Avanzado'], ['duracionMin', 'Duración (min)'], ['estado', 'Estado'], ['id', 'ID']];
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [cols.map((c) => q(c[1])).join(';')].concat(filtered().map((r) => cols.map(([k]) => q(k.startsWith('fecha') ? fmtDate(r[k]) : r[k])).join(';')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resultados-simulador-excel.csv';
    a.click();
  }

  $('#q').oninput = draw;
  $('#f-level').onchange = draw;
  $('#reload').onclick = load;
  $('#csv').onclick = csv;
  for (const th of document.querySelectorAll('th[data-k]')) th.onclick = () => { const k = th.dataset.k; if (sortK === k) sortDir = -sortDir; else { sortK = k; sortDir = 1; } draw(); };

  if (Store.remote) {
    $('#mode-text').textContent = 'Ingrese la clave del panel (la misma que definió en el archivo Code.gs de Google Apps Script).';
    $('#login-form').hidden = false;
    $('#login-form').addEventListener('submit', (e) => { e.preventDefault(); key = e.target.key.value; load(); });
    if (key) load();
  } else {
    $('#mode-text').innerHTML = '<div class="demo">⚠️ <b>Modo demostración.</b> Aún no se configuró Google Sheets (APPS_SCRIPT_URL en <code>js/config.js</code>), por lo que solo se ven las evaluaciones realizadas <b>en este mismo navegador</b>. Siga el README para recibir los resultados de todos los alumnos.</div>';
    load();
  }
})();
