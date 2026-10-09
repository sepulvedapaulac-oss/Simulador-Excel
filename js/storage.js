/* =========================================================================
 * Almacenamiento de resultados
 * - Con APPS_SCRIPT_URL: envía a Google Sheets (vía Google Apps Script)
 * - Siempre: copia local en el navegador (respaldo / modo demostración)
 * ========================================================================= */
(function (global) {
  'use strict';
  const LOCAL_KEY = 'simxl_results_v1';
  const QUEUE_KEY = 'simxl_queue_v1';
  const cfg = () => global.SIM_CONFIG || {};

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

  async function post(record) {
    const url = cfg().APPS_SCRIPT_URL;
    if (!url) return false;
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'save', record }),
    });
    return true;
  }

  const Store = {
    get remote() { return !!cfg().APPS_SCRIPT_URL; },

    /** Guarda (crea o actualiza por id) un resultado */
    async save(record) {
      const map = readLocal();
      map[record.id] = record;
      writeLocal(map);
      if (!this.remote) return { ok: true, remote: false };
      try {
        await post(record);
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
      const q = readQueue();
      const rest = [];
      for (const r of q) {
        try { await post(r); } catch (e) { rest.push(r); }
      }
      writeQueue(rest);
    },

    /** Lista resultados (panel docente) */
    async list(key) {
      if (!this.remote) return { ok: true, remote: false, rows: Object.values(readLocal()) };
      const url = cfg().APPS_SCRIPT_URL + (cfg().APPS_SCRIPT_URL.includes('?') ? '&' : '?') + 'action=list&key=' + encodeURIComponent(key || '');
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json();
      if (!data.ok) return { ok: false, remote: true, error: data.error || 'Error desconocido' };
      return { ok: true, remote: true, rows: data.rows || [] };
    },

    localRows() { return Object.values(readLocal()); },
    clearLocal() { writeLocal({}); },
  };

  global.SimStore = Store;
})(window);
