/* =========================================================================
 * Almacenamiento de resultados
 * - BACKEND 'microsoft': Excel en OneDrive/SharePoint vía Power Automate
 * - BACKEND 'google'   : Google Sheets vía Google Apps Script
 * - Siempre: copia local en el navegador (respaldo / modo demostración)
 * ========================================================================= */
(function (global) {
  'use strict';
  const LOCAL_KEY = 'simxl_results_v1';
  const QUEUE_KEY = 'simxl_queue_v1';
  const cfg = () => global.SIM_CONFIG || {};

  /** Columnas de la tabla de resultados (mismo orden y nombres en Excel y Google Sheets) */
  const COLUMNS = [
    ['id', 'ID evaluación'], ['fechaInicio', 'Fecha inicio'], ['fechaTermino', 'Fecha término'],
    ['nombre', 'Nombre'], ['apellido', 'Apellido'], ['correo', 'Correo'], ['estado', 'Estado'],
    ['cursoRecomendado', 'Curso recomendado'], ['nivel', 'Nivel identificado'], ['recomendacion', 'Recomendación'],
    ['basico', '% Básico'], ['intermedio', '% Intermedio'], ['avanzado', '% Avanzado'],
    ['duracionMin', 'Duración (min)'], ['detalle', 'Detalle (JSON)'],
  ];

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeLocal(map) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(map)); } catch (e) { /* sin almacenamiento */ }
  }
  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch (e) { return []; }
  }
  function writeQueue(q) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) { /* sin almacenamiento */ }
  }

  function backend() {
    const c = cfg();
    const b = (c.BACKEND || '').toLowerCase();
    if (b === 'microsoft' && c.POWER_AUTOMATE_SAVE_URL) return 'microsoft';
    if (b === 'google' && c.APPS_SCRIPT_URL) return 'google';
    if (!b && c.APPS_SCRIPT_URL) return 'google';
    return null;
  }

  /** Registro con valores simples (texto/número) apto para una celda de Excel */
  function flat(record) {
    const o = {};
    for (const [k] of COLUMNS) {
      let v = record[k];
      if (v == null) v = '';
      if (k === 'detalle' && String(v).length > 30000) v = String(v).slice(0, 30000);
      o[k] = typeof v === 'number' ? v : String(v);
    }
    return o;
  }

  async function post(record) {
    const c = cfg();
    const b = backend();
    if (b === 'google') {
      await fetch(c.APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'save', record }),
      });
      return true;
    }
    if (b === 'microsoft') {
      const res = await fetch(c.POWER_AUTOMATE_SAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flat(record)),
      });
      if (!res.ok && res.status !== 202) throw new Error('Power Automate respondió ' + res.status);
      return true;
    }
    return false;
  }

  /** Convierte una fila (claves = encabezados de la tabla Excel) al formato del panel */
  function fromExcelRow(row) {
    const o = {};
    for (const [k, label] of COLUMNS) {
      let v = row[label];
      if (v === undefined) v = row[k];
      o[k] = v == null ? '' : v;
    }
    return o;
  }

  const Store = {
    COLUMNS,
    get remote() { return !!backend(); },
    get backend() { return backend(); },

    /** Guarda (crea o actualiza por id) un resultado */
    async save(record) {
      const map = readLocal();
      map[record.id] = record;
      writeLocal(map);
      if (!this.remote) return { ok: true, remote: false };
      try {
        await post(record);
        writeQueue(readQueue().filter((r) => r.id !== record.id));
        return { ok: true, remote: true };
      } catch (e) {
        const q = readQueue().filter((r) => r.id !== record.id);
        q.push(record);
        writeQueue(q);
        return { ok: false, remote: true, error: e.message };
      }
    },

    /** Reintenta envíos pendientes */
    async flush() {
      if (!this.remote) return;
      const rest = [];
      for (const r of readQueue()) {
        try { await post(r); } catch (e) { rest.push(r); }
      }
      writeQueue(rest);
    },

    /** ¿El panel puede leer los resultados desde el servidor? */
    get canList() {
      const b = backend();
      return b === 'google' || (b === 'microsoft' && !!cfg().POWER_AUTOMATE_LIST_URL);
    },

    /** Lista resultados (panel docente) */
    async list(key) {
      const c = cfg();
      const b = backend();
      if (b === 'google') {
        const url = c.APPS_SCRIPT_URL + (c.APPS_SCRIPT_URL.includes('?') ? '&' : '?') + 'action=list&key=' + encodeURIComponent(key || '');
        const res = await fetch(url, { method: 'GET' });
        const data = await res.json();
        if (!data.ok) return { ok: false, remote: true, error: data.error || 'Error desconocido' };
        return { ok: true, remote: true, rows: data.rows || [] };
      }
      if (b === 'microsoft' && c.POWER_AUTOMATE_LIST_URL) {
        const res = await fetch(c.POWER_AUTOMATE_LIST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key || '' }),
        });
        if (res.status === 401 || res.status === 403) return { ok: false, remote: true, error: 'Clave incorrecta' };
        if (!res.ok) return { ok: false, remote: true, error: 'Power Automate respondió ' + res.status };
        const data = await res.json();
        const rows = Array.isArray(data) ? data : data.value || data.rows || [];
        return { ok: true, remote: true, rows: rows.map(fromExcelRow).filter((r) => r.id) };
      }
      return { ok: true, remote: false, rows: Object.values(readLocal()) };
    },

    localRows() { return Object.values(readLocal()); },
    clearLocal() { writeLocal({}); },
  };

  global.SimStore = Store;
})(window);
