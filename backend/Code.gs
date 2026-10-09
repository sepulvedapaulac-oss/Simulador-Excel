/**
 * Backend del Simulador de Nivel Excel (Google Apps Script + Google Sheets)
 *
 * 1. Cree una hoja de cálculo en Google Drive.
 * 2. Menú Extensiones > Apps Script. Borre el contenido y pegue este archivo.
 * 3. Cambie ADMIN_KEY por una clave propia (la usará en el Panel docente).
 * 4. Implementar > Nueva implementación > Tipo: Aplicación web
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario
 * 5. Copie la URL de la aplicación web y péguela en js/config.js (APPS_SCRIPT_URL).
 */

const ADMIN_KEY = 'CAMBIE-ESTA-CLAVE';
const SHEET_NAME = 'Resultados';
const COLUMNS = [
  ['id', 'ID evaluación'],
  ['fechaInicio', 'Fecha inicio'],
  ['fechaTermino', 'Fecha término'],
  ['nombre', 'Nombre'],
  ['apellido', 'Apellido'],
  ['correo', 'Correo'],
  ['estado', 'Estado'],
  ['nivel', 'Nivel alcanzado'],
  ['recomendacion', 'Recomendación'],
  ['basico', '% Básico'],
  ['intermedio', '% Intermedio'],
  ['avanzado', '% Avanzado'],
  ['duracionMin', 'Duración (min)'],
  ['detalle', 'Detalle (JSON)'],
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS.map((c) => c[1])]).setFontWeight('bold').setBackground('#d9ead3');
    sh.setFrozenRows(1);
    sh.setColumnWidth(14, 120);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  let s = v == null ? '' : String(v);
  // evita que un texto se interprete como fórmula en la planilla
  if (/^[=+\-@]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = "'" + s;
  return s.slice(0, max || 500);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action !== 'save' || !body.record || !body.record.id) return json_({ ok: false, error: 'Solicitud no válida' });
    const r = body.record;
    if (!/^EV-[A-Z0-9-]{4,40}$/.test(String(r.id))) return json_({ ok: false, error: 'ID no válido' });
    const sh = getSheet_();
    const row = COLUMNS.map(([k]) => {
      const v = r[k];
      if (['basico', 'intermedio', 'avanzado', 'duracionMin'].indexOf(k) >= 0) return v === '' || v == null || isNaN(Number(v)) ? '' : Number(v);
      return clean_(v, k === 'detalle' ? 45000 : 500);
    });
    const last = sh.getLastRow();
    let target = -1;
    if (last > 1) {
      const ids = sh.getRange(2, 1, last - 1, 1).getValues();
      for (let i = ids.length - 1; i >= 0; i--) if (ids[i][0] === r.id) { target = i + 2; break; }
    }
    if (target > 0) sh.getRange(target, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== 'list') return json_({ ok: true, service: 'Simulador Excel', message: 'Backend activo' });
  if (p.key !== ADMIN_KEY) return json_({ ok: false, error: 'Clave incorrecta' });
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, rows: [] });
  const values = sh.getRange(2, 1, last - 1, COLUMNS.length).getValues();
  const rows = values.map((v) => {
    const o = {};
    COLUMNS.forEach(([k], i) => {
      let x = v[i];
      if (x instanceof Date) x = x.toISOString();
      if (typeof x === 'string' && x[0] === "'") x = x.slice(1);
      o[k] = x;
    });
    return o;
  });
  return json_({ ok: true, rows });
}
