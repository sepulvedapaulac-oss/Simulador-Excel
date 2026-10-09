/* =========================================================================
 * Modelo de libro de trabajo: hojas, celdas, formatos y operaciones de datos
 * (ordenar, filtrar, tablas dinámicas, consolidar, escenarios, etc.)
 * ========================================================================= */
(function (global) {
  'use strict';
  const F = global.XLF;

  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  function normSheet(s) {
    return Object.assign({
      name: 'Hoja1', rows: 30, cols: 12, cells: {}, colW: {}, freeze: { r: 0, c: 0 }, filter: null, advHidden: [],
      cf: [], dv: [], charts: [], pivots: [], comments: {}, controls: [], protected: false,
    }, s);
  }

  function parseLiteral(input, style) {
    if (input == null) return null;
    if (typeof input === 'number' || typeof input === 'boolean') return input;
    const s = String(input);
    if (s === '') return null;
    if (s[0] === "'") return s.slice(1);
    if (style && style.fmt === 'text') return s;
    const t = s.trim();
    const n = F.parseNumberText(t);
    if (n != null) return n;
    const pct = /^(-?[\d.,]+)\s*%$/.exec(t);
    if (pct) { const k = F.parseNumberText(pct[1]); if (k != null) return k / 100; }
    const cur = /^(-?)\$\s*([\d.,]+)$/.exec(t);
    if (cur) { const k = F.parseNumberText(cur[2]); if (k != null) return cur[1] ? -k : k; }
    const d = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(t);
    if (d) {
      let y = +d[3]; if (y < 100) y += 2000;
      const dd = +d[1]; const mm = +d[2];
      if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return F.dateToSerial(y, mm, dd);
    }
    const u = F.normName(t);
    if (u === 'VERDADERO' || u === 'TRUE') return true;
    if (u === 'FALSO' || u === 'FALSE') return false;
    return s;
  }
  function autoFormatFor(input) {
    if (typeof input !== 'string') return null;
    const t = input.trim();
    if (/^=\s*(AHORA|NOW)\s*\(/i.test(t)) return 'datetime';
    if (/^=\s*(HOY|TODAY|FECHA|DATE)\s*\(/i.test(t)) return 'date';
    if (t[0] === '=') return null;
    if (/^-?[\d.,]+\s*%$/.test(t)) return 'percent';
    if (/^-?\$\s*[\d.,]+$/.test(t)) return 'currency';
    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(t)) return 'date';
    return null;
  }

  function dateStr(v, withTime) {
    const d = F.serialToDate(v);
    const s = String(d.getUTCDate()).padStart(2, '0') + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + d.getUTCFullYear();
    if (!withTime) return s;
    return s + ' ' + String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
  }

  function formatValue(v, style) {
    if (v == null) return '';
    if (F.isErr(v)) return v.code;
    if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
    if (typeof v === 'string') return v;
    const fmt = (style && style.fmt) || 'general';
    const dec = style && style.dec != null ? style.dec : null;
    switch (fmt) {
      case 'number': return F.fmtNumber(v, dec ?? 2, true);
      case 'currency': return (v < 0 ? '-' : '') + '$' + F.fmtNumber(Math.abs(v), dec ?? 0, true);
      case 'percent': return F.fmtNumber(v * 100, dec ?? 0, false) + '%';
      case 'date': return dateStr(v);
      case 'datetime': return dateStr(v, true);
      default:
        if (dec != null) return F.fmtNumber(v, dec, false);
        return F.formatGeneral(v);
    }
  }

  function inputText(cell) {
    if (!cell || cell.input == null) return '';
    const v = cell.input;
    if (typeof v === 'number') {
      const fmt = cell.style && cell.style.fmt;
      if (fmt === 'date') return dateStr(v).replace(/-/g, '/');
      if (fmt === 'percent') return F.formatGeneral(v * 100) + '%';
      return F.formatGeneral(v);
    }
    if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
    return String(v);
  }

  function sortCmp(a, b) {
    const ea = a == null || a === '';
    const eb = b == null || b === '';
    if (ea && eb) return 0;
    if (ea) return 1;
    if (eb) return -1;
    try { return F.cmp(a, b); } catch (e) { return 0; }
  }

  function adjRg(rg, key, idx, delta) {
    const k1 = key + '1'; const k2 = key + '2';
    const o = { ...rg };
    if (delta > 0) {
      if (o[k1] >= idx) o[k1] += delta;
      if (o[k2] >= idx) o[k2] += delta;
    } else {
      const n = -delta; const end = idx + n - 1;
      const inD = (v) => v >= idx && v <= end;
      if (inD(o[k1]) && inD(o[k2])) return null;
      if (inD(o[k1])) o[k1] = idx; else if (o[k1] > end) o[k1] -= n;
      if (inD(o[k2])) o[k2] = idx - 1; else if (o[k2] > end) o[k2] -= n;
    }
    return o;
  }
  function adjAddrStr(s, key, idx, delta) {
    const rg = F.parseRange(s);
    if (!rg) return s;
    const o = adjRg(rg, key, idx, delta);
    if (!o) return s;
    return F.rangeToStr({ ...o, sheet: rg.sheet });
  }

  const inRg = (rg, r, c) => r >= rg.r1 && r <= rg.r2 && c >= rg.c1 && c <= rg.c2;
  const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));

  class Workbook {
    constructor(data) { this.load(data || {}); }

    load(data) {
      const d = clone(data);
      this.sheets = (d.sheets && d.sheets.length ? d.sheets : [{ name: 'Hoja1' }]).map((s) => {
        const sh = normSheet(s);
        if (s.data) {
          s.data.forEach((row, r) => row.forEach((v, c) => {
            if (v !== null && v !== undefined && v !== '') sh.cells[F.addr(r, c)] = { input: v };
          }));
          sh.rows = Math.max(sh.rows, s.data.length + 5);
          delete sh.data;
        }
        if (s.widths) { s.widths.forEach((w, c) => { if (w) sh.colW[c] = w; }); delete sh.widths; }
        if (s.styles) {
          for (const [rgs, st] of Object.entries(s.styles)) {
            const rg = F.parseRange(rgs);
            for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) {
              const a = F.addr(r, c);
              sh.cells[a] = sh.cells[a] || {};
              sh.cells[a].style = Object.assign({}, sh.cells[a].style, st);
            }
          }
          delete sh.styles;
        }
        return sh;
      });
      this.names = d.names || {};
      this.vba = d.vba || '';
      if (!this.vba && d.macros && d.macros.length && global.XLVBA) {
        // migración del formato anterior (pasos de formato) a código VBA
        this.vba = d.macros.map((m) => 'Sub ' + m.name + '()\n' + m.steps.flatMap((x) => (x.op === 'clear' ? ['Selection.ClearContents'] : global.XLVBA.patchToLines(x.patch))).map((l) => '    ' + l).join('\n') + '\nEnd Sub').join('\n\n');
      }
      this.macroRuns = d.macroRuns || [];
      this.scenarios = d.scenarios || [];
      this.active = Math.min(d.active || 0, this.sheets.length - 1);
      this.astCache = new Map();
      this.invalidate();
    }
    toJSON() {
      return { sheets: this.sheets, names: this.names, vba: this.vba, macroRuns: this.macroRuns, scenarios: this.scenarios, active: this.active };
    }
    clone() { return new Workbook(this.toJSON()); }
    invalidate() { this.cache = new Map(); this.computing = new Set(); }

    sheet(name) {
      if (name == null) return this.sheets[this.active];
      if (typeof name === 'object') return name;
      const l = String(name).toLowerCase();
      return this.sheets.find((s) => s.name.toLowerCase() === l) || null;
    }
    get activeSheet() { return this.sheets[this.active]; }
    cell(sheet, a) { const sh = this.sheet(sheet); return sh ? sh.cells[String(a).replace(/\$/g, '').toUpperCase()] : undefined; }

    ast(inp) {
      if (this.astCache.has(inp)) return this.astCache.get(inp);
      let a = null;
      try { a = F.parse(inp); } catch (e) { a = null; }
      this.astCache.set(inp, a);
      return a;
    }
    ctxFor(sh, r, c) {
      return {
        sheet: sh.name, row: r, col: c,
        get: (s, rr, cc) => this.getValue(s, rr, cc),
        rows: (s) => { const x = this.sheet(s); return x ? x.rows : 0; },
        resolveSheet: (n) => { const x = this.sheet(n); return x ? x.name : null; },
        name: (n) => this.nameRange(n),
      };
    }
    nameRange(n) {
      const x = this.names[F.normName(n)];
      if (!x) return null;
      const sh = this.sheet(x.sheet);
      return sh ? { ...x, sheet: sh.name } : null;
    }
    getValue(sheetName, r, c) {
      const sh = this.sheet(sheetName);
      if (!sh) return F.E.REF;
      const key = sh.name + '\u0001' + r + '\u0001' + c;
      if (this.cache.has(key)) return this.cache.get(key);
      const cell = sh.cells[F.addr(r, c)];
      let v = null;
      if (cell && cell.input != null && cell.input !== '') {
        const inp = cell.input;
        if (typeof inp === 'string' && inp[0] === '=' && inp.length > 1) {
          if (this.computing.has(key)) return F.E.REF;
          this.computing.add(key);
          try {
            const ast = this.ast(inp);
            v = ast ? F.evaluate(ast, this.ctxFor(sh, r, c)) : F.E.NAME;
          } finally { this.computing.delete(key); }
        } else v = parseLiteral(inp, cell.style);
      }
      this.cache.set(key, v);
      return v;
    }
    /** valor por dirección: wb.value('Hoja1','B2') */
    value(sheet, a) {
      const sh = this.sheet(sheet);
      if (!sh) return undefined;
      const p = F.parseAddr(a);
      return this.getValue(sh.name, p.r, p.c);
    }
    display(sheet, r, c) {
      const sh = this.sheet(sheet);
      const cell = sh.cells[F.addr(r, c)];
      return formatValue(this.getValue(sh.name, r, c), cell && cell.style);
    }

    setInput(sheet, r, c, input) {
      const sh = this.sheet(sheet);
      const a = F.addr(r, c);
      let cell = sh.cells[a];
      if (input === '' || input == null) {
        if (cell) {
          delete cell.input;
          if (!cell.style || !Object.keys(cell.style).length) delete sh.cells[a];
        }
      } else {
        if (!cell) cell = sh.cells[a] = {};
        cell.input = input;
        const af = autoFormatFor(input);
        if (af && !(cell.style && cell.style.fmt && cell.style.fmt !== 'general')) {
          cell.style = Object.assign({}, cell.style, { fmt: af });
        }
        if (r >= sh.rows) sh.rows = r + 1;
        if (c >= sh.cols) sh.cols = c + 1;
      }
      this.invalidate();
    }

    eachCell(sheet, rg, fn) {
      const sh = this.sheet(sheet);
      for (let r = rg.r1; r <= Math.min(rg.r2, sh.rows - 1); r++) for (let c = rg.c1; c <= Math.min(rg.c2, sh.cols - 1); c++) fn(r, c, sh.cells[F.addr(r, c)]);
    }

    applyStyle(sheet, rg, patch) {
      const sh = this.sheet(sheet);
      this.eachCell(sh, rg, (r, c) => {
        const a = F.addr(r, c);
        const cell = sh.cells[a] || (sh.cells[a] = {});
        const st = Object.assign({}, cell.style, patch);
        for (const k of Object.keys(st)) if (st[k] == null || st[k] === false) delete st[k];
        cell.style = st;
        if (!Object.keys(st).length && cell.input == null) delete sh.cells[a];
      });
      this.invalidate();
    }

    stepDecimals(sheet, rg, delta) {
      const sh = this.sheet(sheet);
      this.eachCell(sh, rg, (r, c, cell) => {
        if (!cell) return;
        const v = this.getValue(sh.name, r, c);
        if (typeof v !== 'number') return;
        const st = cell.style || {};
        let cur = st.dec;
        if (cur == null) {
          if (st.fmt === 'number') cur = 2;
          else if (st.fmt === 'currency' || st.fmt === 'percent') cur = 0;
          else { const s = F.formatGeneral(v); cur = s.includes(',') ? s.split(',')[1].length : 0; }
        }
        cell.style = Object.assign({}, st, { dec: Math.max(0, Math.min(10, cur + delta)) });
      });
      this.invalidate();
    }

    clearRange(sheet, rg, what) {
      const sh = this.sheet(sheet);
      this.eachCell(sh, rg, (r, c, cell) => {
        if (!cell) return;
        const a = F.addr(r, c);
        if (what === 'all') { delete sh.cells[a]; delete sh.comments[a]; return; }
        if (what === 'formats') { delete cell.style; if (cell.input == null) delete sh.cells[a]; return; }
        delete cell.input;
        if (!cell.style || !Object.keys(cell.style).length) delete sh.cells[a];
      });
      this.invalidate();
    }

    /* --------------------- Estructura: filas / columnas --------------------- */
    shift(sheet, axis, idx, delta) {
      const sh = this.sheet(sheet);
      const key = axis === 'row' ? 'r' : 'c';
      const n = Math.abs(delta);
      const end = idx + n - 1;
      const move = (obj) => {
        const out = {};
        for (const [a, v] of Object.entries(obj)) {
          const p = F.parseAddr(a);
          let k = p[key];
          if (delta > 0) { if (k >= idx) k += delta; } else { if (k >= idx && k <= end) continue; if (k > end) k -= n; }
          p[key] = k;
          out[F.addr(p.r, p.c)] = v;
        }
        return out;
      };
      sh.cells = move(sh.cells);
      sh.comments = move(sh.comments);
      for (const s of this.sheets) {
        for (const cell of Object.values(s.cells)) {
          if (typeof cell.input === 'string' && cell.input[0] === '=') cell.input = F.adjustStructure(cell.input, s.name, sh.name, axis, idx, delta);
        }
      }
      for (const [k, nm] of Object.entries(this.names)) {
        if (String(nm.sheet).toLowerCase() !== sh.name.toLowerCase()) continue;
        const o = adjRg(nm, key, idx, delta);
        if (o) this.names[k] = o; else delete this.names[k];
      }
      const adjList = (list) => list.map((x) => { const o = adjRg(x, key, idx, delta); return o; }).filter(Boolean);
      sh.cf = adjList(sh.cf);
      sh.dv = adjList(sh.dv);
      sh.charts = sh.charts.map((ch) => { const o = adjRg(ch, key, idx, delta); return o || null; }).filter(Boolean);
      if (sh.filter) {
        const o = adjRg(sh.filter, key, idx, delta);
        if (o && axis === 'col') {
          const crit = {};
          for (const [c, v] of Object.entries(o.crit || {})) {
            let cc = +c;
            if (delta > 0) { if (cc >= idx) cc += delta; } else { if (cc >= idx && cc <= end) continue; if (cc > end) cc -= n; }
            crit[cc] = v;
          }
          o.crit = crit;
        }
        sh.filter = o;
      }
      for (const ct of sh.controls) {
        if (ct.range) ct.range = adjAddrStr(ct.range, key, idx, delta);
        if (ct.link) ct.link = adjAddrStr(ct.link, key, idx, delta);
      }
      if (axis === 'col') {
        const w = {};
        for (const [c, v] of Object.entries(sh.colW)) {
          let cc = +c;
          if (delta > 0) { if (cc >= idx) cc += delta; } else { if (cc >= idx && cc <= end) continue; if (cc > end) cc -= n; }
          w[cc] = v;
        }
        sh.colW = w;
        sh.cols = Math.max(1, sh.cols + delta);
      } else {
        sh.rows = Math.max(1, sh.rows + delta);
        sh.advHidden = [];
      }
      this.invalidate();
    }
    insertRows(sheet, idx, n = 1) { this.shift(sheet, 'row', idx, n); }
    deleteRows(sheet, idx, n = 1) { this.shift(sheet, 'row', idx, -n); }
    insertCols(sheet, idx, n = 1) { this.shift(sheet, 'col', idx, n); }
    deleteCols(sheet, idx, n = 1) { this.shift(sheet, 'col', idx, -n); }

    addSheet(name) {
      let base = name || 'Hoja' + (this.sheets.length + 1);
      let k = this.sheets.length + 1;
      while (this.sheet(base)) base = 'Hoja' + (++k);
      this.sheets.push(normSheet({ name: base }));
      this.invalidate();
      return this.sheets.length - 1;
    }
    renameSheet(idx, newName) {
      newName = String(newName).trim();
      if (!newName) return 'El nombre de la hoja no puede estar vacío.';
      if (/[\\/?*[\]:]/.test(newName)) return 'El nombre no puede contener los caracteres \\ / ? * [ ] :';
      if (newName.length > 31) return 'El nombre no puede tener más de 31 caracteres.';
      const other = this.sheet(newName);
      if (other && other !== this.sheets[idx]) return 'Ya existe una hoja con ese nombre.';
      const old = this.sheets[idx].name;
      // actualizar referencias en fórmulas
      const oldQ = new RegExp("(^|[^A-Za-zÀ-ÿÑñ0-9_.'])(" + old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "|'" + old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "''") + "')!", 'gi');
      for (const s of this.sheets) {
        for (const cell of Object.values(s.cells)) {
          if (typeof cell.input === 'string' && cell.input[0] === '=') cell.input = cell.input.replace(oldQ, (m, p) => p + F.quoteSheet(newName) + '!');
        }
      }
      for (const nm of Object.values(this.names)) if (String(nm.sheet).toLowerCase() === old.toLowerCase()) nm.sheet = newName;
      for (const sc of this.scenarios) if (String(sc.sheet).toLowerCase() === old.toLowerCase()) sc.sheet = newName;
      this.sheets[idx].name = newName;
      this.invalidate();
      return null;
    }
    deleteSheet(idx) {
      if (this.sheets.length <= 1) return 'Un libro debe contener al menos una hoja visible.';
      this.sheets.splice(idx, 1);
      this.active = Math.min(this.active, this.sheets.length - 1);
      this.invalidate();
      return null;
    }

    /* --------------------- Región actual --------------------- */
    currentRegion(sheet, r, c) {
      const sh = this.sheet(sheet);
      const filled = (rr, cc) => rr >= 0 && cc >= 0 && rr < sh.rows && cc < sh.cols && (() => { const x = sh.cells[F.addr(rr, cc)]; return x && x.input != null && x.input !== ''; })();
      let rg = { r1: r, c1: c, r2: r, c2: c };
      let changed = true;
      while (changed) {
        changed = false;
        const rowHas = (rr) => { for (let cc = rg.c1 - 1; cc <= rg.c2 + 1; cc++) if (filled(rr, cc)) return true; return false; };
        const colHas = (cc) => { for (let rr = rg.r1 - 1; rr <= rg.r2 + 1; rr++) if (filled(rr, cc)) return true; return false; };
        if (rg.r1 > 0 && rowHas(rg.r1 - 1)) { rg.r1--; changed = true; }
        if (rg.r2 < sh.rows - 1 && rowHas(rg.r2 + 1)) { rg.r2++; changed = true; }
        if (rg.c1 > 0 && colHas(rg.c1 - 1)) { rg.c1--; changed = true; }
        if (rg.c2 < sh.cols - 1 && colHas(rg.c2 + 1)) { rg.c2++; changed = true; }
      }
      return rg;
    }

    /* --------------------- Ordenar --------------------- */
    sortRange(sheet, rg, keys, hasHeader) {
      const sh = this.sheet(sheet);
      const r0 = hasHeader ? rg.r1 + 1 : rg.r1;
      const rows = [];
      for (let r = r0; r <= rg.r2; r++) {
        const cells = [];
        for (let c = rg.c1; c <= rg.c2; c++) cells.push(clone(sh.cells[F.addr(r, c)]));
        rows.push({ r, cells, vals: keys.map((k) => this.getValue(sh.name, r, k.c)) });
      }
      rows.sort((a, b) => {
        for (let i = 0; i < keys.length; i++) {
          const x = a.vals[i]; const y = b.vals[i];
          const ex = x == null || x === ''; const ey = y == null || y === '';
          if (ex || ey) { if (ex && ey) continue; return ex ? 1 : -1; }
          let c = sortCmp(x, y);
          if (keys[i].desc) c = -c;
          if (c) return c;
        }
        return a.r - b.r;
      });
      rows.forEach((row, i) => {
        const tr = r0 + i;
        row.cells.forEach((cell, k) => {
          const a = F.addr(tr, rg.c1 + k);
          if (!cell) { delete sh.cells[a]; return; }
          if (typeof cell.input === 'string' && cell.input[0] === '=') cell.input = F.shiftFormula(cell.input, tr - row.r, 0);
          sh.cells[a] = cell;
        });
      });
      this.invalidate();
    }

    /* --------------------- Autofiltro --------------------- */
    isRowHidden(sheet, r) {
      const sh = this.sheet(sheet);
      if (sh.advHidden && sh.advHidden.includes(r)) return true;
      const f = sh.filter;
      if (!f || r <= f.r1 || r > f.r2) return false;
      for (const [c, crit] of Object.entries(f.crit || {})) {
        if (!crit) continue;
        const v = this.getValue(sh.name, r, +c);
        const txt = this.display(sh, r, +c);
        if (crit.type === 'values') { if (!crit.values.includes(txt)) return true; }
        else if (crit.type === 'custom') {
          try {
            const tests = [F.makeCriteria(crit.op + crit.val)];
            if (crit.op2) tests.push(F.makeCriteria(crit.op2 + crit.val2));
            const ok = crit.join === 'or' ? tests.some((t) => t(v)) : tests.every((t) => t(v));
            if (!ok) return true;
          } catch (e) { return true; }
        }
      }
      return false;
    }
    visibleDataRows(sheet) {
      const sh = this.sheet(sheet);
      const out = [];
      for (let r = 0; r < sh.rows; r++) if (!this.isRowHidden(sh, r)) out.push(r);
      return out;
    }
    uniqueColumnValues(sheet, c) {
      const sh = this.sheet(sheet);
      const f = sh.filter;
      const set = new Set();
      for (let r = f.r1 + 1; r <= f.r2; r++) set.add(this.display(sh, r, c));
      return Array.from(set).sort((a, b) => {
        const na = F.parseNumberText(a.replace(/[$%]/g, '')); const nb = F.parseNumberText(b.replace(/[$%]/g, ''));
        if (na != null && nb != null) return na - nb;
        if (a === '') return 1; if (b === '') return -1;
        return a.localeCompare(b, 'es');
      });
    }

    /* --------------------- Filtro avanzado --------------------- */
    advancedFilter(opts) {
      const list = opts.list; const crit = opts.criteria;
      const ls = this.sheet(list.sheet); const cs = this.sheet(crit.sheet || list.sheet);
      if (!ls || !cs) return 'Referencia no válida.';
      const headers = [];
      for (let c = list.c1; c <= list.c2; c++) headers.push(String(this.getValue(ls.name, list.r1, c) ?? '').trim().toLowerCase());
      const critRows = [];
      for (let r = crit.r1 + 1; r <= crit.r2; r++) {
        const tests = [];
        for (let c = crit.c1; c <= crit.c2; c++) {
          const h = String(this.getValue(cs.name, crit.r1, c) ?? '').trim().toLowerCase();
          const raw = this.getValue(cs.name, r, c);
          if (raw == null || raw === '') continue;
          const idx = headers.indexOf(h);
          if (idx < 0) return 'El encabezado "' + h + '" del rango de criterios no existe en la lista.';
          let test;
          if (typeof raw === 'string' && !/^(<=|>=|<>|<|>|=)/.test(raw)) test = F.makeCriteria(raw + '*');
          else test = F.makeCriteria(raw);
          tests.push({ c: list.c1 + idx, test });
        }
        critRows.push(tests);
      }
      const matches = [];
      for (let r = list.r1 + 1; r <= list.r2; r++) {
        const ok = critRows.length === 0 || critRows.some((tests) => tests.every((t) => t.test(this.getValue(ls.name, r, t.c))));
        if (ok) matches.push(r);
      }
      if (opts.copyTo) {
        const ds = this.sheet(opts.copyTo.sheet || list.sheet);
        const rowsOut = [list.r1, ...matches];
        rowsOut.forEach((sr, i) => {
          for (let c = list.c1; c <= list.c2; c++) {
            const v = this.getValue(ls.name, sr, c);
            const src = ls.cells[F.addr(sr, c)];
            const a = F.addr(opts.copyTo.r + i, opts.copyTo.c + (c - list.c1));
            const cell = { input: v == null ? undefined : F.isErr(v) ? v.code : v };
            if (src && src.style) cell.style = clone(src.style);
            if (cell.input === undefined && !cell.style) delete ds.cells[a]; else ds.cells[a] = cell;
            if (opts.copyTo.r + i >= ds.rows) ds.rows = opts.copyTo.r + i + 1;
          }
        });
        ds.lastAdvancedFilter = { list: F.rangeToStr({ ...list, sheet: ls.name }), criteria: F.rangeToStr({ ...crit, sheet: cs.name }), copyTo: F.addr(opts.copyTo.r, opts.copyTo.c), count: matches.length };
      } else {
        ls.advHidden = [];
        for (let r = list.r1 + 1; r <= list.r2; r++) if (!matches.includes(r)) ls.advHidden.push(r);
      }
      this.invalidate();
      return null;
    }

    /* --------------------- Tablas dinámicas --------------------- */
    pivotData(p) {
      const ss = this.sheet(p.src.sheet);
      if (!ss) return null;
      const headers = [];
      for (let c = p.src.c1; c <= p.src.c2; c++) headers.push(String(this.getValue(ss.name, p.src.r1, c) ?? ''));
      const hi = (n) => headers.findIndex((h) => h.toLowerCase() === String(n).toLowerCase());
      const ri = hi(p.rowField); const vi = hi(p.valField); const ci = p.colField ? hi(p.colField) : -1;
      if (ri < 0 || vi < 0) return null;
      const groups = new Map(); const colKeys = new Map();
      for (let r = p.src.r1 + 1; r <= p.src.r2; r++) {
        const k = this.getValue(ss.name, r, p.src.c1 + ri);
        if (k == null || k === '') continue;
        const v = this.getValue(ss.name, r, p.src.c1 + vi);
        const ck = ci >= 0 ? this.getValue(ss.name, r, p.src.c1 + ci) : '__';
        const kk = typeof k === 'string' ? k.toLowerCase() : k;
        if (!groups.has(kk)) groups.set(kk, { key: k, cols: new Map(), all: [] });
        const g = groups.get(kk);
        const cks = typeof ck === 'string' ? ck.toLowerCase() : ck;
        if (!colKeys.has(cks)) colKeys.set(cks, ck);
        if (!g.cols.has(cks)) g.cols.set(cks, []);
        g.cols.get(cks).push(v);
        g.all.push(v);
      }
      const agg = (arr) => {
        const nums = arr.filter((x) => typeof x === 'number');
        switch (p.agg) {
          case 'count': return arr.filter((x) => x != null && x !== '').length;
          case 'avg': return nums.length ? nums.reduce((s, x) => s + x, 0) / nums.length : 0;
          case 'max': return nums.length ? Math.max(...nums) : 0;
          case 'min': return nums.length ? Math.min(...nums) : 0;
          default: return nums.reduce((s, x) => s + x, 0);
        }
      };
      const keys = Array.from(groups.values()).sort((a, b) => sortCmp(a.key, b.key));
      const cols = ci >= 0 ? Array.from(colKeys.entries()).sort((a, b) => sortCmp(a[1], b[1])) : null;
      const allVals = keys.flatMap((g) => g.all);
      return {
        headers,
        rows: keys.map((g) => ({ key: g.key, value: agg(g.all), cols: cols ? cols.map(([ck]) => agg(g.cols.get(ck) || [])) : null })),
        colHeaders: cols ? cols.map((x) => x[1]) : null,
        colTotals: cols ? cols.map(([ck]) => agg(keys.flatMap((g) => g.cols.get(ck) || []))) : null,
        total: agg(allVals),
      };
    }
    static aggLabel(agg) { return { sum: 'Suma', count: 'Cuenta', avg: 'Promedio', max: 'Máx.', min: 'Mín.' }[agg] || 'Suma'; }
    writePivot(p) {
      const ds = this.sheet(p.sheet);
      const data = this.pivotData(p);
      if (!data) return 'No se encontraron los campos de la tabla dinámica.';
      // limpiar área anterior
      if (p.lastRows) for (let r = p.r; r < p.r + p.lastRows; r++) for (let c = p.c; c < p.c + (p.lastCols || 2); c++) delete ds.cells[F.addr(r, c)];
      const put = (r, c, v, st) => { const a = F.addr(r, c); ds.cells[a] = { input: v }; if (st) ds.cells[a].style = st; };
      const head = { bold: true, fill: '#dce6f1' };
      const nf = p.agg === 'count' ? null : { fmt: 'number', dec: p.agg === 'avg' ? 2 : 0 };
      const tot = { bold: true, fill: '#dce6f1' };
      const vlabel = Workbook.aggLabel(p.agg) + ' de ' + p.valField;
      let ncols = 2;
      if (data.colHeaders) {
        put(p.r, p.c, vlabel, head);
        put(p.r, p.c + 1, 'Etiquetas de columna', head);
        put(p.r + 1, p.c, 'Etiquetas de fila', head);
        data.colHeaders.forEach((h, i) => put(p.r + 1, p.c + 1 + i, h, head));
        put(p.r + 1, p.c + 1 + data.colHeaders.length, 'Total general', head);
        data.rows.forEach((row, i) => {
          put(p.r + 2 + i, p.c, row.key);
          row.cols.forEach((v, k) => put(p.r + 2 + i, p.c + 1 + k, v, nf));
          put(p.r + 2 + i, p.c + 1 + row.cols.length, row.value, { bold: true, ...nf });
        });
        const tr = p.r + 2 + data.rows.length;
        put(tr, p.c, 'Total general', tot);
        data.colTotals.forEach((v, k) => put(tr, p.c + 1 + k, v, { ...tot, ...nf }));
        put(tr, p.c + 1 + data.colTotals.length, data.total, { ...tot, ...nf });
        p.lastRows = data.rows.length + 3;
        ncols = data.colHeaders.length + 2;
      } else {
        put(p.r, p.c, 'Etiquetas de fila', head);
        put(p.r, p.c + 1, vlabel, head);
        data.rows.forEach((row, i) => { put(p.r + 1 + i, p.c, row.key); put(p.r + 1 + i, p.c + 1, row.value, nf); });
        put(p.r + 1 + data.rows.length, p.c, 'Total general', tot);
        put(p.r + 1 + data.rows.length, p.c + 1, data.total, { ...tot, ...nf });
        p.lastRows = data.rows.length + 2;
      }
      p.lastCols = ncols;
      ds.rows = Math.max(ds.rows, p.r + p.lastRows + 1);
      ds.cols = Math.max(ds.cols, p.c + ncols);
      for (let k = 0; k < ncols; k++) if (!ds.colW[p.c + k] || ds.colW[p.c + k] < 130) ds.colW[p.c + k] = 130;
      this.invalidate();
      return null;
    }
    createPivot(p) {
      const ds = this.sheet(p.sheet);
      const piv = { id: 'pv' + Date.now().toString(36), src: p.src, rowField: p.rowField, colField: p.colField || '', valField: p.valField, agg: p.agg || 'sum', sheet: ds.name, r: p.r, c: p.c };
      const err = this.writePivot(piv);
      if (err) return err;
      ds.pivots.push(piv);
      return null;
    }
    refreshPivots() {
      for (const s of this.sheets) for (const p of s.pivots) { p.sheet = s.name; this.writePivot(p); }
    }

    /* --------------------- Consolidar --------------------- */
    consolidate(opts) {
      const refs = opts.refs;
      if (!refs.length) return 'Agregue al menos una referencia.';
      const rows = refs[0].r2 - refs[0].r1 + 1; const cols = refs[0].c2 - refs[0].c1 + 1;
      const ds = this.sheet(opts.dest.sheet);
      const fnName = { sum: 'SUMA', avg: 'PROMEDIO', count: 'CONTAR', max: 'MAX', min: 'MIN' }[opts.fn || 'sum'];
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        let input;
        if (opts.links) {
          input = '=' + fnName + '(' + refs.map((rg) => F.quoteSheet(rg.sheet) + '!' + F.addr(rg.r1 + i, rg.c1 + j)).join(';') + ')';
        } else {
          const vals = refs.map((rg) => this.getValue(rg.sheet, rg.r1 + i, rg.c1 + j)).filter((v) => typeof v === 'number');
          if (!vals.length) continue;
          if (fnName === 'SUMA') input = vals.reduce((s, x) => s + x, 0);
          else if (fnName === 'PROMEDIO') input = vals.reduce((s, x) => s + x, 0) / vals.length;
          else if (fnName === 'CONTAR') input = vals.length;
          else if (fnName === 'MAX') input = Math.max(...vals);
          else input = Math.min(...vals);
        }
        const a = F.addr(opts.dest.r + i, opts.dest.c + j);
        ds.cells[a] = Object.assign(ds.cells[a] || {}, { input });
      }
      ds.lastConsolidate = { fn: fnName, refs: refs.map((rg) => F.rangeToStr(rg)), dest: F.addr(opts.dest.r, opts.dest.c), links: !!opts.links };
      this.invalidate();
      return null;
    }

    /* --------------------- Formato condicional --------------------- */
    cfFormatFor(sheet, r, c) {
      const sh = this.sheet(sheet);
      let out = null;
      for (const rule of sh.cf) {
        if (!inRg(rule, r, c)) continue;
        const v = this.getValue(sh.name, r, c);
        if (v == null || v === '') continue;
        let ok = false;
        const n1 = parseLiteral(rule.v1); const n2 = parseLiteral(rule.v2);
        try {
          switch (rule.type) {
            case 'gt': ok = typeof v === 'number' && v > n1; break;
            case 'lt': ok = typeof v === 'number' && v < n1; break;
            case 'ge': ok = typeof v === 'number' && v >= n1; break;
            case 'le': ok = typeof v === 'number' && v <= n1; break;
            case 'between': ok = typeof v === 'number' && v >= Math.min(n1, n2) && v <= Math.max(n1, n2); break;
            case 'eq': ok = F.cmp(v, n1) === 0; break;
            case 'text': ok = String(v).toLowerCase().includes(String(rule.v1).toLowerCase()); break;
            case 'dup': {
              let k = 0;
              for (let rr = rule.r1; rr <= rule.r2; rr++) for (let cc = rule.c1; cc <= rule.c2; cc++) { const x = this.getValue(sh.name, rr, cc); if (x != null && F.cmp(x, v) === 0) k++; }
              ok = k > 1; break;
            }
            default: ok = false;
          }
        } catch (e) { ok = false; }
        if (ok) out = rule.fmt;
      }
      return out;
    }

    /* --------------------- Validación de datos --------------------- */
    dvFor(sheet, r, c) {
      const sh = this.sheet(sheet);
      let out = null;
      for (const rule of sh.dv) if (inRg(rule, r, c)) out = rule;
      return out;
    }
    dvListItems(sheet, rule) {
      const src = String(rule.source || '').trim();
      if (src.startsWith('=')) {
        const rg = F.parseRange(src.slice(1));
        if (rg) {
          const sname = rg.sheet || this.sheet(sheet).name;
          const out = [];
          for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) { const v = this.display(sname, r, c); if (v !== '') out.push(v); }
          return out;
        }
        const nm = this.nameRange(src.slice(1));
        if (nm) { const out = []; for (let r = nm.r1; r <= nm.r2; r++) for (let c = nm.c1; c <= nm.c2; c++) { const v = this.display(nm.sheet, r, c); if (v !== '') out.push(v); } return out; }
        return [];
      }
      return src.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    }
    validateInput(sheet, r, c, input) {
      const rule = this.dvFor(sheet, r, c);
      if (!rule || rule.type === 'any' || input === '' || input == null) return null;
      if (typeof input === 'string' && input[0] === '=') return null;
      const v = parseLiteral(input);
      const msg = rule.msg || 'Este valor no coincide con las restricciones de validación de datos definidas para esta celda.';
      const cmpOp = (x) => {
        const mn = parseLiteral(rule.min); const mx = parseLiteral(rule.max);
        switch (rule.op || 'between') {
          case 'between': return x >= mn && x <= mx;
          case 'notbetween': return x < mn || x > mx;
          case 'eq': return x === mn;
          case 'ne': return x !== mn;
          case 'gt': return x > mn;
          case 'lt': return x < mn;
          case 'ge': return x >= mn;
          case 'le': return x <= mn;
          default: return true;
        }
      };
      switch (rule.type) {
        case 'whole': return typeof v === 'number' && Number.isInteger(v) && cmpOp(v) ? null : msg;
        case 'decimal': case 'date': return typeof v === 'number' && cmpOp(v) ? null : msg;
        case 'textlen': return cmpOp(String(input).length) ? null : msg;
        case 'list': {
          const items = this.dvListItems(sheet, rule).map((x) => x.toLowerCase());
          return items.includes(String(input).trim().toLowerCase()) ? null : msg;
        }
        default: return null;
      }
    }

    /* --------------------- Nombres --------------------- */
    defineName(name, rg) {
      name = String(name).trim();
      if (!/^[A-Za-zÀ-ÿÑñ_\\][A-Za-zÀ-ÿÑñ0-9_.]*$/.test(name) || /^[A-Za-z]{1,3}\d+$/.test(name) || /^[RCrc]$/.test(name)) {
        return 'El nombre no es válido. Debe comenzar con una letra, no puede tener espacios ni parecer una referencia de celda.';
      }
      const key = F.normName(name);
      this.names[key] = { name, sheet: rg.sheet, r1: rg.r1, c1: rg.c1, r2: rg.r2, c2: rg.c2 };
      this.invalidate();
      return null;
    }

    /* --------------------- Buscar y reemplazar --------------------- */
    findAll(sheet, text, matchCase, whole) {
      const sh = this.sheet(sheet);
      const out = [];
      for (const [a, cell] of Object.entries(sh.cells)) {
        if (cell.input == null) continue;
        const p = F.parseAddr(a);
        const hay = typeof cell.input === 'string' && cell.input[0] === '=' ? cell.input : this.display(sh, p.r, p.c);
        const h = matchCase ? hay : hay.toLowerCase();
        const t = matchCase ? text : text.toLowerCase();
        if (whole ? h === t : h.includes(t)) out.push(p);
      }
      out.sort((x, y) => x.r - y.r || x.c - y.c);
      return out;
    }
    replaceAll(sheet, text, repl, matchCase, whole) {
      if (!text) return 0;
      const sh = this.sheet(sheet);
      let count = 0;
      const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');
      for (const cell of Object.values(sh.cells)) {
        if (cell.input == null) continue;
        const s = typeof cell.input === 'string' ? cell.input : inputText(cell);
        if (whole) {
          if ((matchCase ? s : s.toLowerCase()) === (matchCase ? text : text.toLowerCase())) { cell.input = repl; count++; }
          continue;
        }
        const m = s.match(re);
        if (m) { cell.input = s.replace(re, () => repl); count += m.length; }
      }
      this.invalidate();
      return count;
    }

    /* --------------------- Escenarios --------------------- */
    showScenario(name) {
      const sc = this.scenarios.find((s) => s.name.toLowerCase() === String(name).toLowerCase());
      if (!sc) return 'No existe el escenario.';
      const sh = this.sheet(sc.sheet);
      sc.cells.forEach((a, i) => { const p = F.parseAddr(a); this.setInput(sh, p.r, p.c, sc.values[i]); });
      this.lastScenarioShown = sc.name;
      return null;
    }

    /* --------------------- Rellenar --------------------- */
    fill(sheet, src, dst) {
      const sh = this.sheet(sheet);
      const vertical = dst.r1 !== src.r1 || dst.r2 !== src.r2;
      const seqFor = (cells) => {
        // detecta series
        const lits = cells.map((cl) => (cl && cl.input != null && !(typeof cl.input === 'string' && cl.input[0] === '=') ? parseLiteral(cl.input, cl.style) : undefined));
        if (lits.every((v) => typeof v === 'number')) {
          if (lits.length === 1) return null;
          const step = (lits[lits.length - 1] - lits[0]) / (lits.length - 1);
          return (k) => ({ input: Number((lits[0] + step * k).toPrecision(15)) });
        }
        if (lits.length && lits.every((v) => typeof v === 'string')) {
          const lower = lits.map((v) => v.toLowerCase());
          for (const list of [MONTHS, MONTHS_SHORT, DAYS]) {
            const idx = lower.map((v) => list.indexOf(v));
            if (idx.every((i) => i >= 0)) {
              const step = idx.length > 1 ? idx[1] - idx[0] : 1;
              const cap = lits[0][0] === lits[0][0].toUpperCase();
              return (k) => {
                let s = list[(((idx[0] + step * k) % list.length) + list.length) % list.length];
                if (cap) s = s[0].toUpperCase() + s.slice(1);
                return { input: s };
              };
            }
          }
          const m = lits.map((v) => /^(.*?)(\d+)$/.exec(v));
          if (m.every(Boolean) && m.every((x) => x[1] === m[0][1])) {
            const nums = m.map((x) => parseInt(x[2], 10));
            const step = nums.length > 1 ? (nums[nums.length - 1] - nums[0]) / (nums.length - 1) : 1;
            return (k) => ({ input: m[0][1] + (nums[0] + step * k) });
          }
        }
        return null;
      };
      const lines = vertical ? range(src.c1, src.c2) : range(src.r1, src.r2);
      for (const line of lines) {
        const srcIdx = vertical ? range(src.r1, src.r2) : range(src.c1, src.c2);
        const cells = srcIdx.map((k) => clone(sh.cells[vertical ? F.addr(k, line) : F.addr(line, k)]));
        const series = seqFor(cells);
        const dIdx = vertical ? range(dst.r1, dst.r2) : range(dst.c1, dst.c2);
        const s0 = srcIdx[0]; const len = srcIdx.length;
        for (const t of dIdx) {
          if (t >= srcIdx[0] && t <= srcIdx[len - 1]) continue;
          const k = t - s0;
          const si = ((k % len) + len) % len;
          const srcCell = cells[si];
          const a = vertical ? F.addr(t, line) : F.addr(line, t);
          let cell = srcCell ? clone(srcCell) : null;
          if (series && srcCell) cell = Object.assign(cell || {}, series(k));
          else if (cell && typeof cell.input === 'string' && cell.input[0] === '=') {
            const d = t - srcIdx[si];
            cell.input = vertical ? F.shiftFormula(cell.input, d, 0) : F.shiftFormula(cell.input, 0, d);
          }
          if (!cell) delete sh.cells[a]; else sh.cells[a] = cell;
        }
      }
      const r2 = Math.max(dst.r2, src.r2); const c2 = Math.max(dst.c2, src.c2);
      if (r2 >= sh.rows) sh.rows = r2 + 1;
      if (c2 >= sh.cols) sh.cols = c2 + 1;
      this.invalidate();
    }

    /* --------------------- Copiar / pegar --------------------- */
    copyRange(sheet, rg) {
      const sh = this.sheet(sheet);
      const rows = [];
      for (let r = rg.r1; r <= rg.r2; r++) {
        const row = [];
        for (let c = rg.c1; c <= rg.c2; c++) row.push(clone(sh.cells[F.addr(r, c)]) || null);
        rows.push(row);
      }
      return { sheet: sh.name, r1: rg.r1, c1: rg.c1, r2: rg.r2, c2: rg.c2, rows };
    }
    pasteClip(sheet, clip, r, c, cut) {
      const sh = this.sheet(sheet);
      if (cut) {
        const src = this.sheet(clip.sheet);
        if (src) for (let rr = clip.r1; rr <= clip.r2; rr++) for (let cc = clip.c1; cc <= clip.c2; cc++) delete src.cells[F.addr(rr, cc)];
      }
      clip.rows.forEach((row, i) => row.forEach((cell, j) => {
        const a = F.addr(r + i, c + j);
        if (!cell) { delete sh.cells[a]; return; }
        const nc = clone(cell);
        if (!cut && typeof nc.input === 'string' && nc.input[0] === '=') nc.input = F.shiftFormula(nc.input, r - clip.r1, c - clip.c1);
        sh.cells[a] = nc;
        if (r + i >= sh.rows) sh.rows = r + i + 1;
        if (c + j >= sh.cols) sh.cols = c + j + 1;
      }));
      this.invalidate();
    }
  }

  function range(a, b) { const out = []; for (let i = a; i <= b; i++) out.push(i); return out; }

  global.XLWorkbook = Workbook;
  global.XLUtil = { parseLiteral, formatValue, inputText, dateStr, sortCmp, inRg, clone, MONTHS };
})(typeof window !== 'undefined' ? window : globalThis);
