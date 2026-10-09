/* =========================================================================
 * Interfaz tipo Excel: cinta de opciones, barra de fórmulas, cuadrícula,
 * pestañas de hojas, diálogos (formato condicional, validación, gráficos,
 * tablas dinámicas, filtros, escenarios, macros, controles, ...)
 * ========================================================================= */
(function (global) {
  'use strict';
  const F = global.XLF;
  const U = global.XLUtil;
  const Workbook = global.XLWorkbook;

  const ROW_H = 24;
  const HEAD_H = 24;
  const RH_W = 44;
  const DEF_W = 96;

  const COLORS = ['#000000', '#ffffff', '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0',
    '#f2f2f2', '#d9d9d9', '#fce4d6', '#fff2cc', '#e2efda', '#ddebf7', '#dce6f1', '#ededed'];
  const CF_FORMATS = {
    red: { label: 'Relleno rojo claro con texto rojo oscuro', fill: '#ffc7ce', color: '#9c0006' },
    yellow: { label: 'Relleno amarillo con texto amarillo oscuro', fill: '#ffeb9c', color: '#9c5700' },
    green: { label: 'Relleno verde con texto verde oscuro', fill: '#c6efce', color: '#006100' },
    redtext: { label: 'Texto rojo', fill: null, color: '#ff0000' },
    bold: { label: 'Negrita', fill: null, color: null, bold: true },
  };
  const CHART_COLORS = ['#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47', '#264478', '#9e480e'];

  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const norm = (rg) => ({ r1: Math.min(rg.r1, rg.r2), c1: Math.min(rg.c1, rg.c2), r2: Math.max(rg.r1, rg.r2), c2: Math.max(rg.c1, rg.c2) });

  /* ----------------------------- Cinta de opciones ----------------------------- */
  const RIBBON = [
    { id: 'archivo', label: 'Archivo', groups: [
      { label: 'Libro', items: [
        { cmd: 'save', icon: '💾', label: 'Guardar', big: true },
        { cmd: 'saveAs', icon: '📁', label: 'Guardar como', big: true },
        { cmd: 'printPreview', icon: '🖨️', label: 'Vista preliminar', big: true },
      ] },
    ] },
    { id: 'inicio', label: 'Inicio', groups: [
      { label: 'Portapapeles', items: [
        { cmd: 'paste', icon: '📋', label: 'Pegar', big: true },
        { cmd: 'cut', icon: '✂️', label: 'Cortar' },
        { cmd: 'copy', icon: '⧉', label: 'Copiar' },
      ] },
      { label: 'Fuente', items: [
        { cmd: 'bold', icon: '<b>N</b>', title: 'Negrita (Ctrl+B)', tog: 'bold' },
        { cmd: 'italic', icon: '<i>K</i>', title: 'Cursiva (Ctrl+I)', tog: 'italic' },
        { cmd: 'underline', icon: '<u>S</u>', title: 'Subrayado (Ctrl+U)', tog: 'underline' },
        { cmd: 'borders', icon: '▦', title: 'Bordes (todos)', tog: 'border' },
        { cmd: 'fill', icon: '🪣', title: 'Color de relleno', color: true },
        { cmd: 'fontColor', icon: '<span style="text-decoration:underline;text-decoration-color:#c00000;text-decoration-thickness:3px">A</span>', title: 'Color de fuente', color: true },
      ] },
      { label: 'Alineación', items: [
        { cmd: 'alignL', icon: '⯇≡', title: 'Alinear a la izquierda' },
        { cmd: 'alignC', icon: '≡', title: 'Centrar' },
        { cmd: 'alignR', icon: '≡⯈', title: 'Alinear a la derecha' },
      ] },
      { label: 'Número', items: [
        { cmd: 'fmt', select: [['general', 'General'], ['number', 'Número'], ['currency', 'Moneda'], ['percent', 'Porcentaje'], ['date', 'Fecha corta'], ['text', 'Texto']], title: 'Formato de número' },
        { cmd: 'currencyQuick', icon: '$', title: 'Formato de moneda' },
        { cmd: 'percentQuick', icon: '%', title: 'Estilo porcentual' },
        { cmd: 'decInc', icon: '←,0', title: 'Aumentar decimales' },
        { cmd: 'decDec', icon: ',0→', title: 'Disminuir decimales' },
      ] },
      { label: 'Estilos', items: [
        { cmd: 'cf', icon: '🎨', label: 'Formato condicional', big: true },
      ] },
      { label: 'Celdas', items: [
        { cmd: 'insertRow', icon: '⊞', label: 'Insertar filas' },
        { cmd: 'insertCol', icon: '⊞', label: 'Insertar columnas' },
        { cmd: 'deleteRow', icon: '⊟', label: 'Eliminar filas' },
        { cmd: 'deleteCol', icon: '⊟', label: 'Eliminar columnas' },
        { cmd: 'colWidth', icon: '↔', label: 'Ancho de columna' },
        { cmd: 'formatCells', icon: '▤', label: 'Formato de celdas (Ctrl+1)' },
      ] },
      { label: 'Edición', items: [
        { cmd: 'autosum', icon: 'Σ', label: 'Autosuma' },
        { cmd: 'sortAsc', icon: 'A↓Z', label: 'Ordenar A a Z' },
        { cmd: 'filter', icon: '⏷', label: 'Filtro' },
        { cmd: 'findReplace', icon: '🔍', label: 'Buscar y reemplazar' },
        { cmd: 'clearMenu', icon: '🧽', label: 'Borrar' },
      ] },
    ] },
    { id: 'insertar', label: 'Insertar', groups: [
      { label: 'Tablas', items: [{ cmd: 'pivot', icon: '▤', label: 'Tabla dinámica', big: true }] },
      { label: 'Gráficos', items: [{ cmd: 'chart', icon: '📊', label: 'Gráfico', big: true }] },
      { label: 'Comentarios', items: [{ cmd: 'newComment', icon: '💬', label: 'Comentario', big: true }] },
      { label: 'Hojas', items: [{ cmd: 'newSheet', icon: '➕', label: 'Nueva hoja', big: true }] },
    ] },
    { id: 'formulas', label: 'Fórmulas', groups: [
      { label: 'Biblioteca de funciones', items: [
        { cmd: 'insertFunction', icon: '<i>fx</i>', label: 'Insertar función', big: true },
        { cmd: 'autosum', icon: 'Σ', label: 'Autosuma', big: true },
      ] },
      { label: 'Nombres definidos', items: [
        { cmd: 'defineName', icon: '🏷️', label: 'Asignar nombre' },
        { cmd: 'nameManager', icon: '📇', label: 'Administrador de nombres' },
      ] },
      { label: 'Auditoría de fórmulas', items: [
        { cmd: 'tracePrec', icon: '⇢', label: 'Rastrear precedentes' },
        { cmd: 'traceDep', icon: '⇠', label: 'Rastrear dependientes' },
        { cmd: 'clearArrows', icon: '✕', label: 'Quitar flechas' },
        { cmd: 'showFormulas', icon: '<i>fx</i>', label: 'Mostrar fórmulas', tog: '_showFormulas' },
        { cmd: 'errorCheck', icon: '⚠️', label: 'Comprobación de errores' },
      ] },
    ] },
    { id: 'datos', label: 'Datos', groups: [
      { label: 'Ordenar y filtrar', items: [
        { cmd: 'sortAsc', icon: 'A↓Z', label: 'A→Z' },
        { cmd: 'sortDesc', icon: 'Z↓A', label: 'Z→A' },
        { cmd: 'sortCustom', icon: '⇅', label: 'Ordenar', big: true },
        { cmd: 'filter', icon: '⏷', label: 'Filtro', big: true, tog: '_filter' },
        { cmd: 'clearFilter', icon: '⊘', label: 'Borrar filtro' },
        { cmd: 'advFilter', icon: '⧩', label: 'Avanzadas' },
      ] },
      { label: 'Herramientas de datos', items: [
        { cmd: 'dataValidation', icon: '✔', label: 'Validación de datos', big: true },
        { cmd: 'consolidate', icon: '⊕', label: 'Consolidar', big: true },
      ] },
      { label: 'Previsión', items: [{ cmd: 'scenarios', icon: '❓', label: 'Análisis de hipótesis (Escenarios)', big: true }] },
      { label: 'Consultas', items: [{ cmd: 'refreshPivots', icon: '⟳', label: 'Actualizar todo', big: true }] },
    ] },
    { id: 'revisar', label: 'Revisar', groups: [
      { label: 'Comentarios', items: [
        { cmd: 'newComment', icon: '💬', label: 'Nuevo comentario', big: true },
        { cmd: 'deleteComment', icon: '🗑️', label: 'Eliminar comentario' },
      ] },
      { label: 'Proteger', items: [{ cmd: 'protect', icon: '🔒', label: 'Proteger hoja', big: true, tog: '_protected' }] },
    ] },
    { id: 'vista', label: 'Vista', groups: [
      { label: 'Ventana', items: [
        { cmd: 'freezePanes', icon: '❄️', label: 'Inmovilizar paneles' },
        { cmd: 'freezeRow', icon: '⬒', label: 'Inmovilizar fila superior' },
        { cmd: 'freezeCol', icon: '◧', label: 'Inmovilizar primera columna' },
        { cmd: 'unfreeze', icon: '☐', label: 'Movilizar paneles' },
      ] },
      { label: 'Mostrar', items: [{ cmd: 'showFormulas', icon: '<i>fx</i>', label: 'Mostrar fórmulas', tog: '_showFormulas' }] },
    ] },
    { id: 'programador', label: 'Programador', groups: [
      { label: 'Código', items: [
        { cmd: 'vba', icon: '⌨', label: 'Visual Basic (Alt+F11)', big: true },
        { cmd: 'macros', icon: '▶', label: 'Macros (Alt+F8)', big: true },
        { cmd: 'recordMacro', icon: '⏺', label: 'Grabar macro', big: true, tog: '_recording' },
        { cmd: 'relRefs', icon: '⇲', label: 'Usar referencias relativas', tog: '_rel' },
      ] },
      { label: 'Controles (Insertar)', items: [
        { cmd: 'ctlCombo', icon: '☰▾', label: 'Cuadro combinado' },
        { cmd: 'ctlCheck', icon: '☑', label: 'Casilla de verificación' },
        { cmd: 'ctlSpin', icon: '⇕', label: 'Control de número' },
      ] },
    ] },
  ];

  class SheetUI {
    constructor(root, opts = {}) {
      this.root = root;
      this.opts = opts;
      this.showFormulas = false;
      this.recording = null;
      this.traced = [];
      this.editing = null;
      this.refIns = null;
      this.clip = null;
      this.undo = [];
      this.redo = [];
      this.tab = 'inicio';
      this.build();
    }

    /* ======================= Configuración ======================= */
    setWorkbook(wb) {
      this.wb = wb;
      this.undo = [];
      this.redo = [];
      this.editing = null;
      this.traced = [];
      this.clip = null;
      this.recording = null;
      this.act = { r: 0, c: 0 };
      this.anchor = { r: 0, c: 0 };
      this.sel = { r1: 0, c1: 0, r2: 0, c2: 0 };
      this.render();
      this.focus();
    }
    get sh() { return this.wb.sheets[this.wb.active]; }

    build() {
      const R = this.root;
      R.innerHTML = '';
      R.classList.add('xl');
      this.ribbonTabs = el('div', 'xl-rtabs');
      this.ribbon = el('div', 'xl-ribbon');
      const fbar = el('div', 'xl-fbar');
      this.nameBox = el('input', 'xl-namebox');
      this.nameBox.setAttribute('aria-label', 'Cuadro de nombres');
      this.nameBox.title = 'Cuadro de nombres: escriba una celda para ir a ella o un nombre para asignarlo al rango seleccionado';
      const fx = el('span', 'xl-fx', '<i>fx</i>');
      fx.title = 'Insertar función';
      fx.onclick = () => this.cmd('insertFunction');
      this.fbar = el('input', 'xl-formula');
      this.fbar.setAttribute('aria-label', 'Barra de fórmulas');
      this.fbar.spellcheck = false;
      fbar.append(this.nameBox, fx, this.fbar);
      this.wrap = el('div', 'xl-gridwrap');
      this.table = el('table', 'xl-grid');
      this.selBox = el('div', 'xl-selbox');
      this.handle = el('div', 'xl-handle');
      this.handle.title = 'Controlador de relleno: arrastre para copiar o completar una serie';
      this.selBox.appendChild(this.handle);
      this.fillBox = el('div', 'xl-fillbox');
      this.ed = el('input', 'xl-editor idle');
      this.ed.spellcheck = false;
      this.ed.setAttribute('autocomplete', 'off');
      this.hint = el('div', 'xl-hint');
      this.suggest = el('div', 'xl-suggest');
      this.overlays = el('div', 'xl-overlays');
      this.wrap.append(this.table, this.overlays, this.selBox, this.fillBox, this.ed, this.hint, this.suggest);
      this.tabsBar = el('div', 'xl-tabs');
      this.status = el('div', 'xl-status');
      this.collapseBar = el('div', 'xl-collapse');
      R.append(this.ribbonTabs, this.ribbon, fbar, this.wrap, this.tabsBar, this.status, this.collapseBar);
      this.buildRibbon();
      this.bindEvents();
    }

    buildRibbon() {
      this.ribbonTabs.innerHTML = '';
      for (const t of RIBBON) {
        const b = el('button', 'xl-rtab' + (t.id === this.tab ? ' on' : ''), esc(t.label));
        b.type = 'button';
        b.onclick = () => { this.tab = t.id; this.buildRibbon(); this.focus(); };
        this.ribbonTabs.appendChild(b);
      }
      this.ribbon.innerHTML = '';
      const tab = RIBBON.find((t) => t.id === this.tab);
      this.togButtons = [];
      for (const g of tab.groups) {
        const ge = el('div', 'xl-group');
        const items = el('div', 'xl-items');
        for (const it of g.items) {
          if (it.select) {
            const s = el('select', 'xl-rsel');
            s.title = it.title || '';
            for (const [v, l] of it.select) { const o = el('option', null, esc(l)); o.value = v; s.appendChild(o); }
            s.onchange = () => { this.cmd(it.cmd, s.value); };
            this.fmtSelect = s;
            items.appendChild(s);
            continue;
          }
          const b = el('button', 'xl-rbtn' + (it.big ? ' big' : '') + (it.label ? '' : ' icon'));
          b.type = 'button';
          b.title = it.title || it.label || '';
          b.innerHTML = '<span class="ic">' + it.icon + '</span>' + (it.label ? '<span class="lb">' + esc(it.label) + '</span>' : '') + (it.color ? '<span class="dd">▾</span>' : '');
          b.dataset.cmd = it.cmd;
          b.onmousedown = (e) => e.preventDefault();
          b.onclick = (e) => {
            if (it.color) this.colorPopup(b, it.cmd);
            else if (it.cmd === 'clearMenu') this.clearMenu(b);
            else this.cmd(it.cmd);
            e.stopPropagation();
          };
          if (it.tog) { b.dataset.tog = it.tog; this.togButtons.push(b); }
          items.appendChild(b);
        }
        ge.append(items, el('div', 'xl-glabel', esc(g.label)));
        this.ribbon.appendChild(ge);
      }
      if (this.wb) this.updateRibbonState();
    }

    updateRibbonState() {
      if (!this.wb) return;
      const cell = this.sh.cells[F.addr(this.act.r, this.act.c)];
      const st = (cell && cell.style) || {};
      for (const b of this.togButtons || []) {
        const k = b.dataset.tog;
        let on;
        if (k === '_showFormulas') on = this.showFormulas;
        else if (k === '_filter') on = !!this.sh.filter;
        else if (k === '_protected') on = !!this.sh.protected;
        else if (k === '_recording') on = !!this.recording;
        else if (k === '_rel') on = !!this.relRefs;
        else on = !!st[k];
        b.classList.toggle('on', on);
        if (k === '_recording') b.querySelector('.lb').textContent = this.recording ? 'Detener grabación' : 'Grabar macro';
        if (k === '_protected') b.querySelector('.lb').textContent = this.sh.protected ? 'Desproteger hoja' : 'Proteger hoja';
      }
      if (this.fmtSelect && document.activeElement !== this.fmtSelect) this.fmtSelect.value = st.fmt || 'general';
    }

    /* ======================= Renderizado ======================= */
    colW(c) { return this.sh.colW[c] || DEF_W; }

    render() {
      if (!this.wb) return;
      this.renderGrid();
      this.renderTabs();
      this.renderOverlays();
      this.refreshSel();
      this.updateStatus();
    }

    renderGrid() {
      const sh = this.sh;
      const wb = this.wb;
      const fr = sh.freeze.r || 0;
      const fc = sh.freeze.c || 0;
      const lefts = [];
      let acc = RH_W;
      for (let c = 0; c < sh.cols; c++) { lefts.push(acc); acc += this.colW(c); }
      const f = sh.filter;
      let h = '<colgroup><col style="width:' + RH_W + 'px">';
      for (let c = 0; c < sh.cols; c++) h += '<col style="width:' + this.colW(c) + 'px">';
      h += '</colgroup><thead><tr><th class="corner" title="Seleccionar todo"></th>';
      for (let c = 0; c < sh.cols; c++) {
        const sticky = c < fc ? ' style="left:' + lefts[c] + 'px;z-index:6"' : '';
        h += '<th class="ch' + (c < fc ? ' fz' : '') + '" data-c="' + c + '"' + sticky + '>' + F.numToCol(c) + '<span class="rsz" data-c="' + c + '"></span></th>';
      }
      h += '</tr></thead><tbody>';
      const tracedSet = this.tracedSet();
      for (let r = 0; r < sh.rows; r++) {
        const hidden = wb.isRowHidden(sh, r);
        const topSt = r < fr ? 'top:' + (HEAD_H + r * ROW_H) + 'px;' : '';
        h += '<tr data-r="' + r + '"' + (hidden ? ' style="display:none"' : '') + '>';
        h += '<th class="rh' + (r < fr ? ' fzr' : '') + '" data-r="' + r + '" style="' + topSt + '">' + (r + 1) + '</th>';
        for (let c = 0; c < sh.cols; c++) {
          const a = F.addr(r, c);
          const cell = sh.cells[a];
          const st = (cell && cell.style) || {};
          let text = '';
          let cls = '';
          let style = '';
          let align = st.align;
          if (cell && cell.input != null) {
            if (this.showFormulas && typeof cell.input === 'string' && cell.input[0] === '=') { text = cell.input; align = align || 'left'; } else {
              const v = wb.getValue(sh.name, r, c);
              text = U.formatValue(v, st);
              if (!align) align = typeof v === 'number' ? 'right' : typeof v === 'boolean' || F.isErr(v) ? 'center' : 'left';
              if (F.isErr(v)) cls += ' err';
            }
          }
          const cf = wb.cfFormatFor(sh, r, c);
          const cfs = cf ? CF_FORMATS[cf] : null;
          if (st.bold || (cfs && cfs.bold)) style += 'font-weight:700;';
          if (st.italic) style += 'font-style:italic;';
          if (st.underline) style += 'text-decoration:underline;';
          if (cfs && cfs.color) style += 'color:' + cfs.color + ';'; else if (st.color) style += 'color:' + st.color + ';';
          if (cfs && cfs.fill) style += 'background:' + cfs.fill + ';'; else if (st.fill) style += 'background:' + st.fill + ';';
          if (align) style += 'text-align:' + align + ';';
          if (st.border) cls += ' bd';
          if (sh.comments[a]) cls += ' cm';
          if (tracedSet.has(a)) cls += ' ' + tracedSet.get(a);
          if (r < fr || c < fc) {
            cls += ' fz';
            style += 'position:sticky;' + (r < fr ? 'top:' + (HEAD_H + r * ROW_H) + 'px;' : '') + (c < fc ? 'left:' + lefts[c] + 'px;' : '') + 'z-index:' + (r < fr && c < fc ? 4 : 3) + ';';
            if (!st.fill && !(cfs && cfs.fill)) style += 'background:#fff;';
          }
          if (r === fr - 1 && fr) cls += ' fzb';
          if (c === fc - 1 && fc) cls += ' fzrt';
          let extra = '';
          if (f && r === f.r1 && c >= f.c1 && c <= f.c2) {
            const active = f.crit && f.crit[c];
            extra = '<button class="fbtn' + (active ? ' on' : '') + '" data-fc="' + c + '" title="Filtro">' + (active ? '⧩' : '▾') + '</button>';
            cls += ' hasf';
          }
          const tip = sh.comments[a] ? ' title="' + esc(sh.comments[a]) + '"' : '';
          h += '<td data-r="' + r + '" data-c="' + c + '" class="' + cls.trim() + '" style="' + style + '"' + tip + '><div class="v">' + esc(text) + '</div>' + extra + '</td>';
        }
        h += '</tr>';
      }
      h += '</tbody>';
      this.table.innerHTML = h;
      this.tds = [];
      for (const td of this.table.querySelectorAll('td[data-r]')) {
        const r = +td.dataset.r;
        (this.tds[r] = this.tds[r] || [])[+td.dataset.c] = td;
      }
      this.wrap.classList.toggle('protected', !!sh.protected);
    }

    tracedSet() {
      const m = new Map();
      for (const t of this.traced) {
        if (t.sheet && t.sheet.toLowerCase() !== this.sh.name.toLowerCase()) continue;
        for (let r = t.r1; r <= Math.min(t.r2, this.sh.rows - 1); r++) for (let c = t.c1; c <= t.c2; c++) m.set(F.addr(r, c), t.cls);
      }
      return m;
    }

    renderTabs() {
      const T = this.tabsBar;
      T.innerHTML = '';
      this.wb.sheets.forEach((s, i) => {
        const b = el('button', 'xl-stab' + (i === this.wb.active ? ' on' : ''), esc(s.name) + (s.protected ? ' 🔒' : ''));
        b.type = 'button';
        b.title = 'Doble clic para cambiar el nombre. Clic derecho para más opciones.';
        b.onmousedown = (e) => { if (this.editing && this.isFormulaEditing()) e.preventDefault(); };
        b.onclick = () => this.switchSheet(i);
        b.ondblclick = () => this.renameSheetInline(i, b);
        b.oncontextmenu = (e) => {
          e.preventDefault();
          this.menu(e.clientX, e.clientY, [
            ['Insertar hoja', () => this.cmd('newSheet')],
            ['Cambiar nombre', () => this.renameSheetInline(i, b)],
            ['Eliminar', () => this.mutate(() => { const err = this.wb.deleteSheet(i); if (err) this.alert(err); }, { allowProtected: true })],
            ['Mover a la izquierda', () => this.moveSheet(i, -1)],
            ['Mover a la derecha', () => this.moveSheet(i, 1)],
          ]);
        };
        T.appendChild(b);
      });
      const add = el('button', 'xl-sadd', '⊕');
      add.type = 'button';
      add.title = 'Nueva hoja';
      add.onclick = () => this.cmd('newSheet');
      T.appendChild(add);
    }

    moveSheet(i, d) {
      const j = i + d;
      if (j < 0 || j >= this.wb.sheets.length) return;
      this.mutate(() => {
        const s = this.wb.sheets.splice(i, 1)[0];
        this.wb.sheets.splice(j, 0, s);
        this.wb.active = j;
      }, { allowProtected: true });
    }

    renameSheetInline(i, btn) {
      const inp = el('input', 'xl-stab-edit');
      inp.value = this.wb.sheets[i].name;
      btn.replaceWith(inp);
      inp.focus();
      inp.select();
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        if (ok && inp.value.trim() !== this.wb.sheets[i].name) {
          const name = inp.value.trim();
          this.mutate(() => { const err = this.wb.renameSheet(i, name); if (err) this.alert(err); }, { allowProtected: true });
        } else this.renderTabs();
        this.focus();
      };
      inp.onkeydown = (e) => { if (e.key === 'Enter') finish(true); else if (e.key === 'Escape') finish(false); e.stopPropagation(); };
      inp.onblur = () => finish(true);
    }

    switchSheet(i) {
      if (i === this.wb.active) return;
      if (this.editing && this.isFormulaEditing()) {
        // modo apuntar a otra hoja mientras se edita una fórmula
        this.wb.active = i;
        this.editing.src = 'bar';
        this.act = { r: 0, c: 0 };
        this.sel = { r1: 0, c1: 0, r2: 0, c2: 0 };
        this.render();
        this.fbar.focus();
        return;
      }
      if (this.editing && !this.commitEdit()) return;
      this.wb.active = i;
      this.recLine('Sheets(' + global.XLVBA.vbaStr(this.wb.sheets[i].name) + ').Select');
      if (this.recording) { this.recording.curAct = { r: 0, c: 0 }; this.recording.lastSelKey = i + ':A1'; }
      this.act = { r: 0, c: 0 };
      this.anchor = { r: 0, c: 0 };
      this.sel = { r1: 0, c1: 0, r2: 0, c2: 0 };
      this.traced = [];
      this.render();
      this.wrap.scrollTop = 0;
      this.wrap.scrollLeft = 0;
      this.focus();
      this.changed();
    }

    cellRect(r, c) {
      const td = this.tds[r] && this.tds[r][c];
      if (!td) return null;
      const wr = this.wrap.getBoundingClientRect();
      const tr = td.getBoundingClientRect();
      return { left: tr.left - wr.left + this.wrap.scrollLeft, top: tr.top - wr.top + this.wrap.scrollTop, width: tr.width, height: tr.height };
    }

    refreshSel() {
      if (!this.tds) return;
      const s = this.sel;
      for (const td of this.table.querySelectorAll('td.insel, td.act')) td.classList.remove('insel', 'act');
      for (const th of this.table.querySelectorAll('th.hsel')) th.classList.remove('hsel');
      for (let r = s.r1; r <= Math.min(s.r2, this.sh.rows - 1); r++) {
        for (let c = s.c1; c <= Math.min(s.c2, this.sh.cols - 1); c++) {
          const td = this.tds[r] && this.tds[r][c];
          if (td) td.classList.add('insel');
        }
      }
      const atd = this.tds[this.act.r] && this.tds[this.act.r][this.act.c];
      if (atd) atd.classList.add('act');
      for (const th of this.table.querySelectorAll('th.ch')) { const c = +th.dataset.c; if (c >= s.c1 && c <= s.c2) th.classList.add('hsel'); }
      for (const th of this.table.querySelectorAll('th.rh')) { const r = +th.dataset.r; if (r >= s.r1 && r <= s.r2) th.classList.add('hsel'); }
      this.positionSelBox();
      this.positionEditor();
      this.updateNameBox();
      if (!this.editing) this.fbar.value = U.inputText(this.sh.cells[F.addr(this.act.r, this.act.c)]);
      this.updateRibbonState();
      this.updateDvButton();
      this.updateStatus();
      this.recSelect();
    }

    positionSelBox() {
      const s = this.sel;
      const a = this.cellRect(s.r1, s.c1);
      const b = this.cellRect(Math.min(s.r2, this.sh.rows - 1), Math.min(s.c2, this.sh.cols - 1));
      if (!a || !b) { this.selBox.style.display = 'none'; return; }
      this.selBox.style.display = 'block';
      Object.assign(this.selBox.style, { left: a.left - 1 + 'px', top: a.top - 1 + 'px', width: b.left + b.width - a.left + 1 + 'px', height: b.top + b.height - a.top + 1 + 'px' });
      this.handle.style.display = this.editing ? 'none' : 'block';
    }

    positionEditor() {
      const r = this.editing ? this.editing.r : this.act.r;
      const c = this.editing ? this.editing.c : this.act.c;
      const onOther = this.editing && this.editing.sheet !== this.wb.active;
      const rc = onOther ? null : this.cellRect(r, c);
      if (!rc) { this.ed.style.left = '-9999px'; return; }
      Object.assign(this.ed.style, { left: rc.left + 'px', top: rc.top + 'px', height: rc.height + 'px', minWidth: rc.width + 'px' });
      if (this.editing) {
        const w = Math.max(rc.width, Math.min(520, this.ed.value.length * 8 + 16));
        this.ed.style.width = w + 'px';
        this.hint.style.left = rc.left + 'px';
        this.hint.style.top = rc.top + rc.height + 2 + 'px';
        this.suggest.style.left = rc.left + 'px';
        this.suggest.style.top = rc.top + rc.height + 2 + 'px';
      } else this.ed.style.width = rc.width + 'px';
    }

    updateNameBox() {
      if (document.activeElement === this.nameBox) return;
      const s = this.sel;
      if (s.r1 === s.r2 && s.c1 === s.c2) {
        const nm = Object.values(this.wb.names).find((n) => n.sheet && n.sheet.toLowerCase() === this.sh.name.toLowerCase() && n.r1 === s.r1 && n.r2 === s.r2 && n.c1 === s.c1 && n.c2 === s.c2);
        this.nameBox.value = nm ? nm.name : F.addr(this.act.r, this.act.c);
      } else {
        const nm = Object.values(this.wb.names).find((n) => n.sheet && n.sheet.toLowerCase() === this.sh.name.toLowerCase() && n.r1 === s.r1 && n.r2 === s.r2 && n.c1 === s.c1 && n.c2 === s.c2);
        this.nameBox.value = nm ? nm.name : F.rangeToStr(s);
      }
    }

    updateStatus() {
      if (!this.wb) return;
      let mode = this.editing ? (this.editing.mode === 'enter' ? 'Introducir' : 'Modificar') : 'Listo';
      if (this.editing && this.isFormulaEditing()) mode = 'Apuntar';
      let html = '<span class="mode">' + mode + '</span>';
      if (this.recording) html += '<button class="rec" type="button" title="Detener grabación">⏹ Grabando macro «' + esc(this.recording.name) + '» — clic para detener</button>';
      if (this.sh.protected) html += '<span class="prot">🔒 Hoja protegida</span>';
      const s = this.sel;
      if (s.r1 !== s.r2 || s.c1 !== s.c2) {
        let sum = 0; let n = 0; let cnt = 0;
        for (let r = s.r1; r <= Math.min(s.r2, this.sh.rows - 1); r++) for (let c = s.c1; c <= Math.min(s.c2, this.sh.cols - 1); c++) {
          if (this.wb.isRowHidden(this.sh, r)) continue;
          const v = this.wb.getValue(this.sh.name, r, c);
          if (v != null && v !== '') cnt++;
          if (typeof v === 'number') { sum += v; n++; }
        }
        html += '<span class="sum">';
        if (n) html += 'Promedio: ' + esc(F.formatGeneral(F.roundTo(sum / n, 6))) + '&nbsp;&nbsp; ';
        html += 'Recuento: ' + cnt;
        if (n) html += '&nbsp;&nbsp; Suma: ' + esc(F.formatGeneral(F.roundTo(sum, 6)));
        html += '</span>';
      }
      this.status.innerHTML = html;
      const rec = this.status.querySelector('.rec');
      if (rec) rec.onclick = () => this.cmd('recordMacro');
    }

    updateDvButton() {
      if (this.dvBtn) { this.dvBtn.remove(); this.dvBtn = null; }
      if (this.editing) return;
      const rule = this.wb.dvFor(this.sh, this.act.r, this.act.c);
      if (!rule || rule.type !== 'list') return;
      const rc = this.cellRect(this.act.r, this.act.c);
      if (!rc) return;
      const b = el('button', 'xl-dvbtn', '▾');
      b.type = 'button';
      Object.assign(b.style, { left: rc.left + rc.width + 1 + 'px', top: rc.top + 'px', height: rc.height + 'px' });
      b.onmousedown = (e) => { e.preventDefault(); e.stopPropagation(); };
      b.onclick = (e) => {
        e.stopPropagation();
        const items = this.wb.dvListItems(this.sh, rule);
        const br = b.getBoundingClientRect();
        this.menu(br.left - rc.width, br.bottom, items.map((it) => [it, () => this.setCellInput(this.act.r, this.act.c, it)]));
      };
      this.wrap.appendChild(b);
      this.dvBtn = b;
    }

    /* ----------------------- Gráficos y controles ----------------------- */
    renderOverlays() {
      this.overlays.innerHTML = '';
      const sh = this.sh;
      sh.charts.forEach((ch, i) => this.overlays.appendChild(this.chartEl(ch, i)));
      sh.controls.forEach((ct, i) => this.overlays.appendChild(this.controlEl(ct, i)));
    }

    chartEl(ch, i) {
      const box = el('div', 'xl-chart');
      Object.assign(box.style, { left: ch.x + 'px', top: ch.y + 'px', width: (ch.w || 420) + 'px', height: (ch.h || 270) + 'px' });
      const bar = el('div', 'xl-chart-bar', '<span>Gráfico ' + (i + 1) + '</span><button type="button" class="ed" title="Modificar gráfico">✎</button><button type="button" class="rm" title="Eliminar gráfico">✕</button>');
      box.appendChild(bar);
      const body = el('div', 'xl-chart-body');
      body.innerHTML = this.chartSVG(ch, (ch.w || 420), (ch.h || 270) - 22);
      box.appendChild(body);
      bar.querySelector('.rm').onclick = (e) => { e.stopPropagation(); this.mutate(() => { this.sh.charts.splice(i, 1); }); };
      bar.querySelector('.ed').onclick = (e) => { e.stopPropagation(); this.chartDialog(ch, i); };
      this.makeDraggable(box, bar, (x, y) => this.mutate(() => { ch.x = x; ch.y = y; }, { allowProtected: true }));
      return box;
    }

    chartData(ch) {
      const sh = this.wb.sheet(ch.sheet) || this.sh;
      const vals = [];
      for (let r = ch.r1; r <= ch.r2; r++) {
        const row = [];
        for (let c = ch.c1; c <= ch.c2; c++) row.push(this.wb.getValue(sh.name, r, c));
        vals.push(row);
      }
      if (!vals.length) return { cats: [], series: [] };
      const firstRowText = vals[0].slice(1).every((v) => typeof v === 'string' || v == null) && vals[0].some((v) => typeof v === 'string');
      const firstColText = vals.slice(firstRowText ? 1 : 0).every((r) => typeof r[0] === 'string' || r[0] == null) && vals.length > 0 && vals[0].length > 1;
      const body = firstRowText ? vals.slice(1) : vals;
      const cats = firstColText ? body.map((r) => (r[0] == null ? '' : String(r[0]))) : body.map((r, i) => String(i + 1));
      const start = firstColText ? 1 : 0;
      const series = [];
      for (let c = start; c < vals[0].length; c++) {
        series.push({ name: firstRowText ? String(vals[0][c] ?? 'Serie ' + (c - start + 1)) : 'Serie ' + (c - start + 1), data: body.map((r) => (typeof r[c] === 'number' ? r[c] : 0)) });
      }
      return { cats, series };
    }

    chartSVG(ch, W, H) {
      const { cats, series } = this.chartData(ch);
      const title = ch.title || (series.length === 1 ? series[0].name : '');
      let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%" font-family="Calibri,Segoe UI,Arial" font-size="11">';
      s += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
      if (title) s += '<text x="' + W / 2 + '" y="20" text-anchor="middle" font-size="15" fill="#404040">' + esc(title) + '</text>';
      if (!series.length || !cats.length) return s + '<text x="20" y="60" fill="#888">Sin datos numéricos en el rango</text></svg>';
      const top = title ? 34 : 14;
      const legendH = series.length > 1 || ch.type === 'pie' ? 22 : 0;
      if (ch.type === 'pie') {
        const data = series[0].data.map((v) => Math.max(0, v));
        const tot = data.reduce((a, b) => a + b, 0) || 1;
        const cx = W / 2 - 60; const cy = top + (H - top - 10) / 2; const rad = Math.min(W / 2 - 80, (H - top - 20) / 2);
        let ang = -Math.PI / 2;
        data.forEach((v, i) => {
          const a2 = ang + (v / tot) * Math.PI * 2;
          const x1 = cx + rad * Math.cos(ang); const y1 = cy + rad * Math.sin(ang);
          const x2 = cx + rad * Math.cos(a2); const y2 = cy + rad * Math.sin(a2);
          const large = a2 - ang > Math.PI ? 1 : 0;
          const col = CHART_COLORS[i % CHART_COLORS.length];
          if (data.length === 1 || v / tot > 0.9999) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="' + col + '"/>';
          else s += '<path d="M' + cx + ',' + cy + ' L' + x1 + ',' + y1 + ' A' + rad + ',' + rad + ' 0 ' + large + ' 1 ' + x2 + ',' + y2 + ' Z" fill="' + col + '" stroke="#fff"/>';
          const mid = (ang + a2) / 2;
          if (v / tot > 0.04) s += '<text x="' + (cx + rad * 0.65 * Math.cos(mid)) + '" y="' + (cy + rad * 0.65 * Math.sin(mid) + 4) + '" text-anchor="middle" fill="#fff" font-size="11">' + Math.round((v / tot) * 100) + '%</text>';
          ang = a2;
        });
        cats.forEach((c, i) => {
          const y = top + 10 + i * 16;
          s += '<rect x="' + (W - 120) + '" y="' + (y - 9) + '" width="10" height="10" fill="' + CHART_COLORS[i % CHART_COLORS.length] + '"/><text x="' + (W - 105) + '" y="' + y + '" fill="#404040">' + esc(c.slice(0, 16)) + '</text>';
        });
        return s + '</svg>';
      }
      const all = series.flatMap((x) => x.data);
      let max = Math.max(0, ...all); let min = Math.min(0, ...all);
      if (max === min) max = min + 1;
      const step = niceStep((max - min) / 5);
      max = Math.ceil(max / step) * step; min = Math.floor(min / step) * step;
      const left = 58; const right = 12; const bottom = 26 + legendH;
      const pw = W - left - right; const ph = H - top - bottom;
      const horiz = ch.type === 'bar';
      const fmtAx = (v) => (Math.abs(v) >= 1e6 ? F.formatGeneral(v / 1e6) + ' M' : Math.abs(v) >= 1e3 ? F.fmtNumber(v, 0, true) : F.formatGeneral(F.roundTo(v, 2)));
      for (let v = min; v <= max + 1e-9; v += step) {
        if (horiz) {
          const x = left + ((v - min) / (max - min)) * pw;
          s += '<line x1="' + x + '" x2="' + x + '" y1="' + top + '" y2="' + (top + ph) + '" stroke="#e0e0e0"/><text x="' + x + '" y="' + (top + ph + 14) + '" text-anchor="middle" fill="#595959">' + fmtAx(v) + '</text>';
        } else {
          const y = top + ph - ((v - min) / (max - min)) * ph;
          s += '<line x1="' + left + '" x2="' + (left + pw) + '" y1="' + y + '" y2="' + y + '" stroke="#e0e0e0"/><text x="' + (left - 6) + '" y="' + (y + 4) + '" text-anchor="end" fill="#595959">' + fmtAx(v) + '</text>';
        }
      }
      const n = cats.length;
      const band = (horiz ? ph : pw) / n;
      const zero = horiz ? left + ((0 - min) / (max - min)) * pw : top + ph - ((0 - min) / (max - min)) * ph;
      if (ch.type === 'line') {
        series.forEach((se, k) => {
          const pts = se.data.map((v, i) => (left + band * (i + 0.5)) + ',' + (top + ph - ((v - min) / (max - min)) * ph));
          s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + CHART_COLORS[k % 8] + '" stroke-width="2.5"/>';
          pts.forEach((p) => { const [x, y] = p.split(','); s += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + CHART_COLORS[k % 8] + '"/>'; });
        });
      } else {
        const bw = (band * 0.7) / series.length;
        series.forEach((se, k) => se.data.forEach((v, i) => {
          const col = CHART_COLORS[k % 8];
          if (horiz) {
            const y = top + band * i + band * 0.15 + bw * k;
            const x = left + ((Math.min(v, 0) - min) / (max - min)) * pw;
            const w = (Math.abs(v) / (max - min)) * pw;
            s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + bw + '" fill="' + col + '"/>';
          } else {
            const x = left + band * i + band * 0.15 + bw * k;
            const y = top + ph - ((Math.max(v, 0) - min) / (max - min)) * ph;
            const hgt = (Math.abs(v) / (max - min)) * ph;
            s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + hgt + '" fill="' + col + '"/>';
          }
        }));
      }
      if (horiz) {
        s += '<line x1="' + zero + '" x2="' + zero + '" y1="' + top + '" y2="' + (top + ph) + '" stroke="#999"/>';
        cats.forEach((c, i) => { s += '<text x="' + (left - 6) + '" y="' + (top + band * (i + 0.5) + 4) + '" text-anchor="end" fill="#595959">' + esc(c.slice(0, 10)) + '</text>'; });
      } else {
        s += '<line x1="' + left + '" x2="' + (left + pw) + '" y1="' + zero + '" y2="' + zero + '" stroke="#999"/>';
        const every = Math.ceil(n / Math.max(1, Math.floor(pw / 46)));
        cats.forEach((c, i) => { if (i % every === 0) s += '<text x="' + (left + band * (i + 0.5)) + '" y="' + (top + ph + 15) + '" text-anchor="middle" fill="#595959">' + esc(c.slice(0, 9)) + '</text>'; });
      }
      if (legendH) {
        let x = left;
        series.forEach((se, k) => { s += '<rect x="' + x + '" y="' + (H - 14) + '" width="10" height="10" fill="' + CHART_COLORS[k % 8] + '"/><text x="' + (x + 14) + '" y="' + (H - 5) + '" fill="#404040">' + esc(se.name.slice(0, 18)) + '</text>'; x += 24 + Math.min(18, se.name.length) * 6; });
      }
      return s + '</svg>';
    }

    controlEl(ct, i) {
      const box = el('div', 'xl-control ' + ct.type);
      Object.assign(box.style, { left: ct.x + 'px', top: ct.y + 'px' });
      const linkVal = () => {
        const rg = F.parseRange(ct.link);
        if (!rg) return null;
        return this.wb.getValue(rg.sheet || this.sh.name, rg.r1, rg.c1);
      };
      const setLink = (v) => {
        const rg = F.parseRange(ct.link);
        if (!rg) { this.alert('El control no tiene una celda vinculada válida.'); return; }
        const sh = this.wb.sheet(rg.sheet || this.sh.name);
        this.mutate(() => { this.wb.setInput(sh, rg.r1, rg.c1, v); });
      };
      if (ct.type === 'combo') {
        const sel = el('select');
        const rg = F.parseRange(ct.range);
        const items = [];
        if (rg) for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) items.push(this.wb.display(rg.sheet || this.sh.name, r, c));
        const cur = linkVal();
        sel.appendChild(el('option', null, ''));
        items.forEach((it, k) => { const o = el('option', null, esc(it)); o.value = String(k + 1); if (cur === k + 1) o.selected = true; sel.appendChild(o); });
        sel.onchange = () => setLink(sel.value === '' ? '' : Number(sel.value));
        box.appendChild(sel);
      } else if (ct.type === 'check') {
        const lab = el('label');
        const cb = el('input');
        cb.type = 'checkbox';
        cb.checked = linkVal() === true;
        cb.onchange = () => setLink(cb.checked ? 'VERDADERO' : 'FALSO');
        lab.append(cb, document.createTextNode(' ' + (ct.label || 'Casilla')));
        box.appendChild(lab);
      } else if (ct.type === 'spin') {
        const up = el('button', null, '▲'); const dn = el('button', null, '▼');
        up.type = 'button'; dn.type = 'button';
        const step = Number(ct.step) || 1;
        const get = () => { const v = linkVal(); return typeof v === 'number' ? v : Number(ct.min) || 0; };
        up.onclick = () => setLink(Math.min(Number(ct.max), get() + step));
        dn.onclick = () => setLink(Math.max(Number(ct.min), get() - step));
        box.append(up, dn);
      }
      const grip = el('span', 'grip', '⠿');
      grip.title = 'Arrastrar. Clic derecho: formato de control';
      box.appendChild(grip);
      box.oncontextmenu = (e) => {
        e.preventDefault();
        this.menu(e.clientX, e.clientY, [
          ['Formato de control…', () => this.controlDialog(ct.type, ct, i)],
          ['Eliminar control', () => this.mutate(() => { this.sh.controls.splice(i, 1); })],
        ]);
      };
      this.makeDraggable(box, grip, (x, y) => this.mutate(() => { ct.x = x; ct.y = y; }, { allowProtected: true }));
      return box;
    }

    makeDraggable(box, handle, onDrop) {
      handle.onmousedown = (e) => {
        if (e.button !== 0 || e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        e.stopPropagation();
        const sx = e.clientX; const sy = e.clientY;
        const ox = parseFloat(box.style.left); const oy = parseFloat(box.style.top);
        const mv = (ev) => { box.style.left = Math.max(0, ox + ev.clientX - sx) + 'px'; box.style.top = Math.max(0, oy + ev.clientY - sy) + 'px'; };
        const up = () => {
          document.removeEventListener('mousemove', mv);
          document.removeEventListener('mouseup', up);
          const x = parseFloat(box.style.left); const y = parseFloat(box.style.top);
          if (x !== ox || y !== oy) onDrop(x, y);
        };
        document.addEventListener('mousemove', mv);
        document.addEventListener('mouseup', up);
      };
    }

    /* ======================= Mutaciones / historial ======================= */
    snapshot() { return JSON.stringify(this.wb.toJSON()); }
    mutate(fn, o = {}) {
      if (this.sh.protected && !o.allowProtected) {
        this.alert('La celda o el gráfico que intenta cambiar está en una hoja protegida. Para realizar un cambio, desproteja la hoja (Revisar > Desproteger hoja).');
        return false;
      }
      const snap = this.snapshot();
      const res = fn();
      if (res === false) return false;
      this.undo.push(snap);
      if (this.undo.length > 60) this.undo.shift();
      this.redo = [];
      this.wb.invalidate();
      this.clampSel();
      this.render();
      this.changed();
      return true;
    }
    doUndo() {
      if (!this.undo.length) return;
      this.redo.push(this.snapshot());
      this.wb.load(JSON.parse(this.undo.pop()));
      this.clampSel();
      this.render();
      this.changed();
    }
    doRedo() {
      if (!this.redo.length) return;
      this.undo.push(this.snapshot());
      this.wb.load(JSON.parse(this.redo.pop()));
      this.clampSel();
      this.render();
      this.changed();
    }
    clampSel() {
      const sh = this.sh;
      const cl = (v, m) => Math.max(0, Math.min(v, m - 1));
      this.act = { r: cl(this.act.r, sh.rows), c: cl(this.act.c, sh.cols) };
      this.sel = { r1: cl(this.sel.r1, sh.rows), c1: cl(this.sel.c1, sh.cols), r2: cl(this.sel.r2, sh.rows), c2: cl(this.sel.c2, sh.cols) };
    }
    changed() { if (this.opts.onChange) this.opts.onChange(this.wb); }

    focus() {
      if (this.modalOpen) return;
      if (this.editing && this.editing.src === 'bar') { this.fbar.focus(); return; }
      this.ed.focus({ preventScroll: true });
    }

    /* ======================= Selección ======================= */
    select(r, c, extend) {
      const sh = this.sh;
      r = Math.max(0, Math.min(r, sh.rows - 1));
      c = Math.max(0, Math.min(c, sh.cols - 1));
      if (extend) {
        this.sel = norm({ r1: this.anchor.r, c1: this.anchor.c, r2: r, c2: c });
        this.cursor = { r, c };
      } else {
        this.anchor = { r, c };
        this.act = { r, c };
        this.cursor = { r, c };
        this.sel = { r1: r, c1: c, r2: r, c2: c };
      }
      this.refreshSel();
      this.ensureVisible(extend ? this.cursor.r : r, extend ? this.cursor.c : c);
    }
    selectRange(rg, actR, actC) {
      this.sel = norm(rg);
      this.act = { r: actR ?? this.sel.r1, c: actC ?? this.sel.c1 };
      this.anchor = { ...this.act };
      this.cursor = { r: this.sel.r2, c: this.sel.c2 };
      this.refreshSel();
    }
    ensureVisible(r, c) {
      const rc = this.cellRect(r, c);
      if (!rc) return;
      const W = this.wrap;
      const fr = this.sh.freeze.r || 0; const fc = this.sh.freeze.c || 0;
      let topLimit = HEAD_H + fr * ROW_H;
      let leftLimit = RH_W;
      for (let k = 0; k < fc; k++) leftLimit += this.colW(k);
      if (r >= fr) {
        if (rc.top - W.scrollTop < topLimit) W.scrollTop = rc.top - topLimit;
        else if (rc.top + rc.height - W.scrollTop > W.clientHeight) W.scrollTop = rc.top + rc.height - W.clientHeight;
      }
      if (c >= fc) {
        if (rc.left - W.scrollLeft < leftLimit) W.scrollLeft = rc.left - leftLimit;
        else if (rc.left + rc.width - W.scrollLeft > W.clientWidth) W.scrollLeft = rc.left + rc.width - W.clientWidth;
      }
    }
    moveAct(dr, dc, extend) {
      const sh = this.sh;
      let base = extend ? { ...(this.cursor || this.act) } : { ...this.act };
      let r = base.r + dr;
      let c = base.c + dc;
      // saltar filas ocultas
      while (dr && r >= 0 && r < sh.rows && this.wb.isRowHidden(sh, r)) r += dr > 0 ? 1 : -1;
      r = Math.max(0, Math.min(r, sh.rows - 1));
      c = Math.max(0, Math.min(c, sh.cols - 1));
      this.select(r, c, extend);
    }
    jumpEdge(dr, dc, extend) {
      const sh = this.sh;
      const base = extend ? { ...(this.cursor || this.act) } : { ...this.act };
      const filled = (r, c) => { const x = sh.cells[F.addr(r, c)]; return !!(x && x.input != null && x.input !== ''); };
      let { r, c } = base;
      const inb = (rr, cc) => rr >= 0 && cc >= 0 && rr < sh.rows && cc < sh.cols;
      if (filled(r, c) && inb(r + dr, c + dc) && filled(r + dr, c + dc)) {
        while (inb(r + dr, c + dc) && filled(r + dr, c + dc)) { r += dr; c += dc; }
      } else {
        r += dr; c += dc;
        while (inb(r, c) && !filled(r, c)) { r += dr; c += dc; }
        if (!inb(r, c)) { r -= dr; c -= dc; }
      }
      this.select(r, c, extend);
    }

    /* ======================= Edición ======================= */
    isFormulaEditing() {
      if (!this.editing) return false;
      const v = (this.editing.src === 'bar' ? this.fbar : this.ed).value;
      return v.startsWith('=');
    }
    activeInput() { return this.editing && this.editing.src === 'bar' ? this.fbar : this.ed; }

    startEdit(mode, initial, src) {
      if (this.sh.protected) { this.alert('La celda que intenta cambiar está en una hoja protegida. Desprotéjala en Revisar > Desproteger hoja.'); this.ed.value = ''; return; }
      const cell = this.sh.cells[F.addr(this.act.r, this.act.c)];
      this.editing = { r: this.act.r, c: this.act.c, sheet: this.wb.active, mode, src: src || 'cell', orig: U.inputText(cell) };
      this.refIns = null;
      const val = initial != null ? initial : U.inputText(cell);
      this.ed.value = val;
      this.fbar.value = val;
      this.ed.classList.remove('idle');
      const st = (cell && cell.style) || {};
      this.ed.style.fontWeight = st.bold ? '700' : '';
      this.ed.style.textAlign = 'left';
      this.handle.style.display = 'none';
      if (this.dvBtn) { this.dvBtn.remove(); this.dvBtn = null; }
      this.positionEditor();
      const inp = this.activeInput();
      inp.focus({ preventScroll: true });
      const L = inp.value.length;
      inp.setSelectionRange(L, L);
      this.updateHint();
      this.updateStatus();
    }

    cancelEdit() {
      if (!this.editing) return;
      const back = this.editing.sheet;
      this.editing = null;
      this.refIns = null;
      this.ed.value = '';
      this.ed.classList.add('idle');
      this.hideHint();
      if (this.wb.active !== back) { this.wb.active = back; this.render(); }
      this.fbar.value = U.inputText(this.sh.cells[F.addr(this.act.r, this.act.c)]);
      this.refreshSel();
      this.focus();
    }

    normalizeFormula(v) {
      try {
        const src = v.slice(1);
        const toks = F.tokenize(src);
        let out = '';
        let last = 0;
        for (const t of toks) {
          let rep = null;
          const raw = src.slice(t.s, t.e);
          if (t.t === 'func') rep = raw.toUpperCase();
          else if (t.t === 'ref') { const i = raw.lastIndexOf('!'); rep = i >= 0 ? raw.slice(0, i + 1) + raw.slice(i + 1).toUpperCase() : raw.toUpperCase(); }
          else if (t.t === 'bool') rep = raw.toUpperCase();
          if (rep != null) { out += src.slice(last, t.s) + rep; last = t.e; }
        }
        out += src.slice(last);
        // cerrar paréntesis faltantes como Excel
        let depth = 0; let inStr = false;
        for (const ch of out) { if (ch === '"') inStr = !inStr; else if (!inStr && ch === '(') depth++; else if (!inStr && ch === ')') depth--; }
        if (depth > 0 && !inStr) out += ')'.repeat(depth);
        return '=' + out;
      } catch (e) { return v; }
    }

    /** Confirma la edición. Devuelve false si hubo error (validación / sintaxis). */
    commitEdit(silent) {
      if (!this.editing) return true;
      const E = this.editing;
      let v = this.activeInput().value;
      const sh = this.wb.sheets[E.sheet];
      if (v.startsWith('=') && v.length > 1) {
        v = this.normalizeFormula(v);
        try { F.parse(v); } catch (err) {
          if (silent) return false;
          this.alert('Hay un problema con esta fórmula.\n\n' + err.message + '\n\nRecuerde: los argumentos se separan con punto y coma (;). Ej.: =SUMA(A1;B1)');
          return false;
        }
      } else if (/^[+-]\s*[A-Za-z$]/.test(v)) {
        v = '=' + v;
      }
      const cell = sh.cells[F.addr(E.r, E.c)];
      if (cell && cell.style && cell.style.fmt === 'percent' && !v.startsWith('=')) {
        const n = F.parseNumberText(v);
        if (n != null) v = String(n / 100).replace('.', ',') + '%';
      }
      const err = this.wb.validateInput(sh, E.r, E.c, v);
      if (err) {
        if (!silent) this.alert(err, 'Microsoft Excel');
        return false;
      }
      const changed = v !== E.orig;
      this.editing = null;
      this.refIns = null;
      this.ed.value = '';
      this.ed.classList.add('idle');
      this.hideHint();
      if (this.wb.active !== E.sheet) { this.wb.active = E.sheet; this.act = { r: E.r, c: E.c }; this.sel = { r1: E.r, c1: E.c, r2: E.r, c2: E.c }; this.anchor = { ...this.act }; }
      if (changed) {
        this.recLine('ActiveCell.FormulaLocal = ' + global.XLVBA.vbaStr(v));
        this.mutate(() => { this.wb.setInput(sh, E.r, E.c, v === '' ? '' : v); }, { allowProtected: true });
      } else this.render();
      this.focus();
      return true;
    }

    setCellInput(r, c, v) {
      const err = this.wb.validateInput(this.sh, r, c, v);
      if (err) { this.alert(err); return; }
      this.mutate(() => this.wb.setInput(this.sh, r, c, v));
    }

    canInsertRef() {
      if (!this.editing) return false;
      const inp = this.activeInput();
      const v = inp.value;
      if (!v.startsWith('=')) return false;
      if (this.refIns) return true;
      const pos = inp.selectionStart ?? v.length;
      const before = v.slice(0, pos).replace(/\s+$/, '');
      return /[=+\-*/^(;,:<>&]$/.test(before);
    }

    insertRef(rg) {
      const inp = this.activeInput();
      const v = inp.value;
      const prefix = this.wb.active !== this.editing.sheet ? F.quoteSheet(this.sh.name) + '!' : '';
      const txt = prefix + F.rangeToStr(norm(rg));
      let start; let end;
      if (this.refIns) { start = this.refIns.start; end = this.refIns.end; } else { start = inp.selectionStart ?? v.length; end = inp.selectionEnd ?? start; }
      inp.value = v.slice(0, start) + txt + v.slice(end);
      this.refIns = { start, end: start + txt.length };
      inp.setSelectionRange(start + txt.length, start + txt.length);
      if (inp === this.ed) this.fbar.value = inp.value; else this.ed.value = inp.value;
      this.positionEditor();
      this.updateHint();
    }

    toggleAbsolute() {
      const inp = this.activeInput();
      const v = inp.value;
      const pos = inp.selectionStart;
      const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g;
      let m;
      while ((m = re.exec(v))) {
        const s = m.index; const e = s + m[0].length;
        if (pos >= s && pos <= e) {
          const prev = v[s - 1];
          if (prev && /[A-Za-z0-9_]/.test(prev)) continue;
          const st = (m[1] ? 1 : 0) * 2 + (m[3] ? 1 : 0);
          const next = { 0: [true, true], 3: [false, true], 1: [true, false], 2: [false, false] }[st];
          const rep = (next[0] ? '$' : '') + m[2].toUpperCase() + (next[1] ? '$' : '') + m[4];
          inp.value = v.slice(0, s) + rep + v.slice(e);
          inp.setSelectionRange(s + rep.length, s + rep.length);
          if (inp === this.ed) this.fbar.value = inp.value; else this.ed.value = inp.value;
          return;
        }
      }
    }

    updateHint() {
      const inp = this.activeInput();
      const v = inp.value;
      if (!this.editing || !v.startsWith('=')) { this.hideHint(); return; }
      const pos = inp.selectionStart ?? v.length;
      const before = v.slice(1, pos);
      // sugerencias de nombre de función
      const m = /([A-Za-zÀ-ÿÑñ.]+)$/.exec(before);
      this.suggest.innerHTML = '';
      this.suggest.style.display = 'none';
      this.suggestList = [];
      if (m && m[1].length >= 2 && !/[A-Za-z]\d/.test(m[1])) {
        const q = F.normName(m[1]);
        const list = F.FUNCTION_HELP.filter((f) => F.normName(f[1]).startsWith(q)).slice(0, 8);
        if (list.length && !(list.length === 1 && F.normName(list[0][1]) === q && before.endsWith('('))) {
          this.suggestList = list.map((f) => f[1]);
          this.suggestWord = m[1];
          for (const f of list) {
            const it = el('div', 'it', '<b>' + esc(f[1]) + '</b> <span>' + esc(f[3]) + '</span>');
            it.onmousedown = (e) => { e.preventDefault(); this.acceptSuggestion(f[1]); };
            this.suggest.appendChild(it);
          }
          this.suggest.style.display = 'block';
        }
      }
      // ayuda de sintaxis: función abierta más interna
      let depth = 0; let fn = null; let inStr = false;
      for (let i = before.length - 1; i >= 0; i--) {
        const ch = before[i];
        if (ch === '"') inStr = !inStr;
        if (inStr) continue;
        if (ch === ')') depth++;
        else if (ch === '(') {
          if (depth === 0) { const mm = /([A-Za-zÀ-ÿÑñ.]+)\s*$/.exec(before.slice(0, i)); fn = mm ? mm[1] : null; break; }
          depth--;
        }
      }
      const help = fn && F.FUNCTION_HELP.find((f) => F.normName(f[1]) === F.normName(fn));
      if (help && this.suggest.style.display !== 'block') { this.hint.textContent = help[2]; this.hint.style.display = 'block'; } else this.hint.style.display = 'none';
      this.positionEditor();
    }
    acceptSuggestion(name) {
      const inp = this.activeInput();
      const pos = inp.selectionStart;
      const v = inp.value;
      const start = pos - this.suggestWord.length;
      inp.value = v.slice(0, start) + name + '(' + v.slice(pos);
      const np = start + name.length + 1;
      inp.setSelectionRange(np, np);
      if (inp === this.ed) this.fbar.value = inp.value; else this.ed.value = inp.value;
      this.updateHint();
    }
    hideHint() { this.hint.style.display = 'none'; this.suggest.style.display = 'none'; this.suggestList = []; }

    /* ======================= Eventos ======================= */
    bindEvents() {
      const W = this.wrap;
      W.addEventListener('scroll', () => { this.positionSelBox(); this.positionEditor(); this.updateDvButton(); });
      W.addEventListener('mousedown', (e) => this.onMouseDown(e));
      W.addEventListener('dblclick', (e) => {
        const td = e.target.closest('td[data-r]');
        if (!td || e.target.closest('.fbtn')) return;
        if (this.editing) return;
        this.select(+td.dataset.r, +td.dataset.c);
        this.startEdit('edit');
      });
      W.addEventListener('contextmenu', (e) => {
        const td = e.target.closest('td[data-r]');
        if (!td) return;
        e.preventDefault();
        const r = +td.dataset.r; const c = +td.dataset.c;
        const s = this.sel;
        if (!(r >= s.r1 && r <= s.r2 && c >= s.c1 && c <= s.c2)) this.select(r, c);
        this.menu(e.clientX, e.clientY, [
          ['Cortar', () => this.cmd('cut')], ['Copiar', () => this.cmd('copy')], ['Pegar', () => this.cmd('paste')], null,
          ['Insertar fila', () => this.cmd('insertRow')], ['Insertar columna', () => this.cmd('insertCol')],
          ['Eliminar fila', () => this.cmd('deleteRow')], ['Eliminar columna', () => this.cmd('deleteCol')], null,
          ['Borrar contenido', () => this.cmd('clearContents')],
          ['Formato de celdas…', () => this.cmd('formatCells')],
          ['Ordenar de A a Z', () => this.cmd('sortAsc')], ['Ordenar de Z a A', () => this.cmd('sortDesc')], null,
          [this.sh.comments[F.addr(this.act.r, this.act.c)] ? 'Modificar comentario' : 'Insertar comentario', () => this.cmd('newComment')],
          ['Definir nombre…', () => this.cmd('defineName')],
        ]);
      });
      document.addEventListener('mousemove', (e) => this.onMouseMove(e));
      document.addEventListener('mouseup', (e) => this.onMouseUp(e));

      const ed = this.ed;
      ed.addEventListener('input', () => {
        if (!this.editing) {
          const v = ed.value;
          if (v === '') return;
          this.startEdit('enter', v);
          return;
        }
        this.refIns = null;
        this.fbar.value = ed.value;
        this.positionEditor();
        this.updateHint();
      });
      ed.addEventListener('keydown', (e) => this.onKey(e, 'cell'));
      ed.addEventListener('copy', (e) => { if (this.editing) return; e.preventDefault(); this.doCopy(false, e.clipboardData); });
      ed.addEventListener('cut', (e) => { if (this.editing) return; e.preventDefault(); this.doCopy(true, e.clipboardData); });
      ed.addEventListener('paste', (e) => {
        if (this.editing) return;
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        this.doPaste(text);
      });
      ed.addEventListener('blur', () => { if (this.editing && this.editing.mode === 'enter' && document.activeElement !== this.fbar && !this.modalOpen && !this.pointerDown) { /* mantener edición */ } });

      const fb = this.fbar;
      fb.addEventListener('focus', () => {
        if (!this.editing) { this.startEdit('edit', undefined, 'bar'); }
        else if (this.editing.src !== 'bar') { this.editing.src = 'bar'; }
      });
      fb.addEventListener('input', () => {
        this.refIns = null;
        if (this.editing) { this.ed.value = fb.value; this.positionEditor(); this.updateHint(); }
      });
      fb.addEventListener('keydown', (e) => this.onKey(e, 'bar'));

      const nb = this.nameBox;
      nb.addEventListener('focus', () => nb.select());
      nb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this.nameBoxGo(nb.value); }
        else if (e.key === 'Escape') { this.updateNameBox(); this.focus(); }
      });
      nb.addEventListener('blur', () => setTimeout(() => this.updateNameBox(), 0));

      document.addEventListener('mousedown', (e) => {
        if (this.popupEl && !this.popupEl.contains(e.target) && !e.target.closest('.fbtn,.xl-dvbtn')) this.closePopup();
      });
      window.addEventListener('resize', () => { this.positionSelBox(); this.positionEditor(); });
    }

    nameBoxGo(text) {
      const t = text.trim();
      if (!t) return;
      const rg = F.parseRange(t);
      if (rg) {
        if (rg.sheet) {
          const i = this.wb.sheets.findIndex((s) => s.name.toLowerCase() === rg.sheet.toLowerCase());
          if (i < 0) { this.alert('La referencia no es válida.'); return; }
          this.wb.active = i;
          this.render();
        }
        rg.r2 = Math.min(rg.r2, this.sh.rows - 1);
        this.selectRange(rg);
        this.ensureVisible(rg.r1, rg.c1);
        this.focus();
        return;
      }
      const nm = this.wb.nameRange(t);
      if (nm) {
        const i = this.wb.sheets.findIndex((s) => s.name.toLowerCase() === nm.sheet.toLowerCase());
        if (i >= 0 && i !== this.wb.active) { this.wb.active = i; this.render(); }
        this.selectRange(nm);
        this.focus();
        return;
      }
      const s = this.sel;
      this.mutate(() => {
        const err = this.wb.defineName(t, { sheet: this.sh.name, ...s });
        if (err) { this.alert(err); return false; }
        return true;
      }, { allowProtected: true });
      this.toast('Nombre «' + t + '» asignado a ' + F.rangeToStr(s));
      this.focus();
    }

    hitCell(e) {
      const t = document.elementFromPoint(e.clientX, e.clientY);
      if (!t || !this.wrap.contains(t)) return null;
      const td = t.closest('td[data-r]');
      if (td) return { r: +td.dataset.r, c: +td.dataset.c };
      const ch = t.closest('th.ch');
      if (ch) return { r: this.sel.r1, c: +ch.dataset.c, colHead: true };
      const rh = t.closest('th.rh');
      if (rh) return { r: +rh.dataset.r, c: this.sel.c1, rowHead: true };
      return null;
    }

    onMouseDown(e) {
      if (e.button !== 0) return;
      const t = e.target;
      if (t.closest('.xl-chart') || t.closest('.xl-control') || t.closest('.xl-dvbtn')) return;
      if (t === this.ed && this.editing) return;
      const fbtn = t.closest('.fbtn');
      if (fbtn) { e.preventDefault(); this.filterPopup(+fbtn.dataset.fc, fbtn); return; }
      if (t === this.handle) {
        e.preventDefault();
        if (this.sh.protected) { this.alert('La hoja está protegida.'); return; }
        this.filling = { src: { ...this.sel }, dst: { ...this.sel } };
        this.pointerDown = true;
        return;
      }
      const rsz = t.closest('.rsz');
      if (rsz) {
        e.preventDefault();
        const c = +rsz.dataset.c;
        this.resizing = { c, x: e.clientX, w: this.colW(c) };
        return;
      }
      const td = t.closest('td[data-r]');
      const ch = t.closest('th.ch');
      const rh = t.closest('th.rh');
      const corner = t.closest('th.corner');
      if (!td && !ch && !rh && !corner) return;
      e.preventDefault();
      this.closePopup();
      // modo apuntar (insertar referencia en la fórmula)
      if (td && this.editing && this.canInsertRef()) {
        const r = +td.dataset.r; const c = +td.dataset.c;
        this.refDrag = { r, c };
        this.insertRef({ r1: r, c1: c, r2: r, c2: c });
        this.pointerDown = true;
        this.activeInput().focus({ preventScroll: true });
        return;
      }
      if (this.editing && !this.commitEdit()) return;
      if (this.collapsed) { /* selección para cuadro de diálogo plegado */ }
      if (corner) { this.selectRange({ r1: 0, c1: 0, r2: this.sh.rows - 1, c2: this.sh.cols - 1 }, 0, 0); this.focus(); return; }
      if (ch) {
        const c = +ch.dataset.c;
        if (e.shiftKey) this.selectRange({ r1: 0, c1: this.anchor.c, r2: this.sh.rows - 1, c2: c }, 0, this.anchor.c);
        else { this.anchor = { r: 0, c }; this.selectRange({ r1: 0, c1: c, r2: this.sh.rows - 1, c2: c }, 0, c); }
        this.dragHead = 'col';
        this.pointerDown = true;
        this.focus();
        return;
      }
      if (rh) {
        const r = +rh.dataset.r;
        if (e.shiftKey) this.selectRange({ r1: this.anchor.r, c1: 0, r2: r, c2: this.sh.cols - 1 }, this.anchor.r, 0);
        else { this.anchor = { r, c: 0 }; this.selectRange({ r1: r, c1: 0, r2: r, c2: this.sh.cols - 1 }, r, 0); }
        this.dragHead = 'row';
        this.pointerDown = true;
        this.focus();
        return;
      }
      const r = +td.dataset.r; const c = +td.dataset.c;
      this.select(r, c, e.shiftKey);
      this.dragging = true;
      this.pointerDown = true;
      this.focus();
    }

    onMouseMove(e) {
      if (this.resizing) {
        const w = Math.max(24, this.resizing.w + e.clientX - this.resizing.x);
        this.sh.colW[this.resizing.c] = w;
        const cols = this.table.querySelectorAll('col');
        if (cols[this.resizing.c + 1]) cols[this.resizing.c + 1].style.width = w + 'px';
        this.positionSelBox();
        return;
      }
      if (!this.pointerDown) return;
      const h = this.hitCell(e);
      if (!h) return;
      if (this.refDrag) {
        this.insertRef({ r1: this.refDrag.r, c1: this.refDrag.c, r2: h.r, c2: h.c });
        return;
      }
      if (this.filling) {
        const s = this.filling.src;
        let dst;
        const dDown = h.r - s.r2; const dUp = s.r1 - h.r; const dRight = h.c - s.c2; const dLeft = s.c1 - h.c;
        const m = Math.max(dDown, dUp, dRight, dLeft);
        if (m <= 0) dst = { ...s };
        else if (m === dDown) dst = { ...s, r2: h.r };
        else if (m === dUp) dst = { ...s, r1: h.r };
        else if (m === dRight) dst = { ...s, c2: h.c };
        else dst = { ...s, c1: h.c };
        this.filling.dst = dst;
        const a = this.cellRect(dst.r1, dst.c1); const b = this.cellRect(dst.r2, dst.c2);
        if (a && b) Object.assign(this.fillBox.style, { display: 'block', left: a.left - 1 + 'px', top: a.top - 1 + 'px', width: b.left + b.width - a.left + 1 + 'px', height: b.top + b.height - a.top + 1 + 'px' });
        return;
      }
      if (this.dragHead === 'col') { this.selectRange({ r1: 0, c1: this.anchor.c, r2: this.sh.rows - 1, c2: h.c }, 0, this.anchor.c); return; }
      if (this.dragHead === 'row') { this.selectRange({ r1: this.anchor.r, c1: 0, r2: h.r, c2: this.sh.cols - 1 }, this.anchor.r, 0); return; }
      if (this.dragging) {
        const s = norm({ r1: this.anchor.r, c1: this.anchor.c, r2: h.r, c2: h.c });
        if (s.r1 !== this.sel.r1 || s.r2 !== this.sel.r2 || s.c1 !== this.sel.c1 || s.c2 !== this.sel.c2) { this.sel = s; this.cursor = { r: h.r, c: h.c }; this.refreshSel(); }
      }
    }

    onMouseUp() {
      if (this.resizing) {
        const { c, w } = this.resizing;
        const nw = this.sh.colW[c];
        this.sh.colW[c] = w;
        this.resizing = null;
        if (nw !== w) this.mutate(() => { this.sh.colW[c] = nw; }, { allowProtected: true });
        return;
      }
      if (!this.pointerDown) return;
      this.pointerDown = false;
      this.dragging = false;
      this.dragHead = null;
      if (this.refDrag) { this.refDrag = null; return; }
      if (this.filling) {
        const { src, dst } = this.filling;
        this.filling = null;
        this.fillBox.style.display = 'none';
        if (dst.r1 !== src.r1 || dst.r2 !== src.r2 || dst.c1 !== src.c1 || dst.c2 !== src.c2) {
          this.mutate(() => this.wb.fill(this.sh, src, dst));
          this.selectRange(dst, this.act.r, this.act.c);
        }
        this.focus();
      }
    }

    onKey(e, src) {
      if (this.modalOpen) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const k = e.key;
      if (this.editing) {
        if (this.suggestList && this.suggestList.length && (k === 'Tab')) { e.preventDefault(); this.acceptSuggestion(this.suggestList[0]); return; }
        if (k === 'Enter') { e.preventDefault(); if (this.commitEdit()) this.moveAct(e.shiftKey ? -1 : 1, 0); return; }
        if (k === 'Tab') { e.preventDefault(); if (this.commitEdit()) this.moveAct(0, e.shiftKey ? -1 : 1); return; }
        if (k === 'Escape') { e.preventDefault(); this.cancelEdit(); return; }
        if (k === 'F4') { e.preventDefault(); this.toggleAbsolute(); return; }
        if (this.editing.mode === 'enter' && src === 'cell' && !this.isFormulaEditing() && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) {
          e.preventDefault();
          if (this.commitEdit()) this.moveAct(k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0, k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0);
          return;
        }
        setTimeout(() => this.updateHint(), 0);
        return;
      }
      if (src === 'bar') return;
      const arrows = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (arrows[k]) {
        e.preventDefault();
        if (ctrl) this.jumpEdge(arrows[k][0], arrows[k][1], e.shiftKey);
        else this.moveAct(arrows[k][0], arrows[k][1], e.shiftKey);
        return;
      }
      if (k === 'Enter') { e.preventDefault(); this.moveAct(e.shiftKey ? -1 : 1, 0); return; }
      if (k === 'Tab') { e.preventDefault(); this.moveAct(0, e.shiftKey ? -1 : 1); return; }
      if (k === 'F2') { e.preventDefault(); this.startEdit('edit'); return; }
      if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); this.cmd('clearContents'); return; }
      if (k === 'Home') { e.preventDefault(); this.select(ctrl ? 0 : this.act.r, 0, e.shiftKey); return; }
      if (k === 'PageDown' || k === 'PageUp') { e.preventDefault(); this.moveAct(k === 'PageDown' ? 15 : -15, 0, e.shiftKey); return; }
      if (k === 'Escape') { this.clip = null; this.wrap.classList.remove('copying'); return; }
      if (e.altKey && (k === 'F11' || k === 'F8')) { e.preventDefault(); this.cmd(k === 'F11' ? 'vba' : 'macros'); return; }
      if (e.altKey && !ctrl && (k === '=' || e.code === 'Digit0' && e.shiftKey)) { e.preventDefault(); this.cmd('autosum'); return; }
      if (ctrl && e.shiftKey && (k === 'L' || k === 'l')) { e.preventDefault(); this.cmd('filter'); return; }
      if (ctrl && e.shiftKey && (k === '$' || e.code === 'Digit4')) { e.preventDefault(); this.cmd('currencyQuick'); return; }
      if (ctrl && e.shiftKey && (k === '%' || e.code === 'Digit5')) { e.preventDefault(); this.cmd('percentQuick'); return; }
      if (ctrl && (k === '1' || e.code === 'Digit1')) { e.preventDefault(); this.cmd('formatCells'); return; }
      if (ctrl) {
        const kk = k.toLowerCase();
        const map = { z: 'undo', y: 'redo', b: 'bold', n: 'bold', i: 'italic', k: 'italic', u: 'underline', s: 'save', d: 'fillDown', a: 'selectAll', f: 'findReplace', l: 'findReplace', h: 'findReplace' };
        if (kk === 'c' || kk === 'x' || kk === 'v') return; // eventos copy/cut/paste
        if (map[kk]) { e.preventDefault(); this.cmd(map[kk]); return; }
        if (k === 'F3') { e.preventDefault(); this.cmd('nameManager'); }
        return;
      }
      if (k === 'F3' && !ctrl) return;
    }

    /* ======================= Portapapeles ======================= */
    doCopy(cut, clipboardData) {
      const s = this.sel;
      const clip = this.wb.copyRange(this.sh, s);
      const lines = [];
      for (let r = s.r1; r <= s.r2; r++) {
        const row = [];
        for (let c = s.c1; c <= s.c2; c++) row.push(this.wb.display(this.sh, r, c));
        lines.push(row.join('\t'));
      }
      clip.text = lines.join('\n');
      clip.cut = cut;
      this.clip = clip;
      if (clipboardData) clipboardData.setData('text/plain', clip.text);
      else if (navigator.clipboard) navigator.clipboard.writeText(clip.text).catch(() => {});
      this.wrap.classList.add('copying');
      this.toast(cut ? 'Seleccione el destino y pegue (Ctrl+V)' : 'Copiado. Seleccione el destino y pegue (Ctrl+V)');
    }
    doPaste(text) {
      const { r, c } = this.act;
      const clip = this.clip;
      if (clip && (text == null || text.replace(/\r/g, '').trimEnd() === clip.text.trimEnd())) {
        const cut = clip.cut;
        this.mutate(() => this.wb.pasteClip(this.sh, clip, r, c, cut));
        if (cut) { this.clip = null; this.wrap.classList.remove('copying'); }
        this.selectRange({ r1: r, c1: c, r2: r + clip.rows.length - 1, c2: c + clip.rows[0].length - 1 }, r, c);
        return;
      }
      if (text == null) return;
      const rows = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
      this.mutate(() => { rows.forEach((row, i) => row.forEach((v, j) => this.wb.setInput(this.sh, r + i, c + j, v))); });
      this.selectRange({ r1: r, c1: c, r2: r + rows.length - 1, c2: c + Math.max(...rows.map((x) => x.length)) - 1 }, r, c);
    }

    /* ======================= Comandos ======================= */
    styleCmd(patch) {
      this.mutate(() => this.wb.applyStyle(this.sh, this.sel, patch));
      this.recLine(...global.XLVBA.patchToLines(patch));
    }
    curStyle() { const c = this.sh.cells[F.addr(this.act.r, this.act.c)]; return (c && c.style) || {}; }
    regionForData() {
      const s = this.sel;
      if (s.r1 !== s.r2 || s.c1 !== s.c2) return { ...s, r2: Math.min(s.r2, this.lastUsedRow()) };
      return this.wb.currentRegion(this.sh, this.act.r, this.act.c);
    }
    lastUsedRow() {
      let m = 0;
      for (const a of Object.keys(this.sh.cells)) { const p = F.parseAddr(a); if (this.sh.cells[a].input != null) m = Math.max(m, p.r); }
      return m;
    }

    async cmd(name, arg) {
      if (this.editing && !['insertFunction'].includes(name)) { if (!this.commitEdit()) return; }
      const sh = this.sh;
      const s = this.sel;
      switch (name) {
        case 'undo': this.doUndo(); break;
        case 'redo': this.doRedo(); break;
        case 'save': this.toast('Libro guardado correctamente.'); this.lastSave = Date.now(); break;
        case 'saveAs': {
          const v = await this.form('Guardar como', [
            { name: 'file', label: 'Nombre de archivo', value: 'Libro1' },
            { name: 'type', label: 'Tipo', type: 'select', options: [['xlsx', 'Libro de Excel (*.xlsx)'], ['xlsm', 'Libro de Excel habilitado para macros (*.xlsm)'], ['xls', 'Libro de Excel 97-2003 (*.xls)'], ['csv', 'CSV (delimitado por comas) (*.csv)'], ['pdf', 'PDF (*.pdf)']] },
          ], { ok: 'Guardar' });
          if (v) { this.wb.savedAs = v.file + '.' + v.type; this.toast('Guardado como ' + v.file + '.' + v.type); this.changed(); }
          break;
        }
        case 'printPreview': this.printPreview(); break;
        case 'bold': this.styleCmd({ bold: !this.curStyle().bold }); break;
        case 'italic': this.styleCmd({ italic: !this.curStyle().italic }); break;
        case 'underline': this.styleCmd({ underline: !this.curStyle().underline }); break;
        case 'borders': this.styleCmd({ border: !this.curStyle().border }); break;
        case 'fill': this.styleCmd({ fill: arg || null }); break;
        case 'fontColor': this.styleCmd({ color: arg || null }); break;
        case 'alignL': this.styleCmd({ align: 'left' }); break;
        case 'alignC': this.styleCmd({ align: 'center' }); break;
        case 'alignR': this.styleCmd({ align: 'right' }); break;
        case 'fmt': this.styleCmd({ fmt: arg === 'general' ? null : arg, dec: null }); this.focus(); break;
        case 'currencyQuick': this.styleCmd({ fmt: 'currency', dec: null }); break;
        case 'percentQuick': this.styleCmd({ fmt: 'percent', dec: null }); break;
        case 'decInc': this.mutate(() => this.wb.stepDecimals(sh, s, 1)); break;
        case 'decDec': this.mutate(() => this.wb.stepDecimals(sh, s, -1)); break;
        case 'clearContents':
          this.mutate(() => this.wb.clearRange(sh, s, 'contents'));
          this.recLine('Selection.ClearContents');
          break;
        case 'clearFormats': this.mutate(() => this.wb.clearRange(sh, s, 'formats')); break;
        case 'clearAll': this.mutate(() => this.wb.clearRange(sh, s, 'all')); break;
        case 'selectAll': this.selectRange({ r1: 0, c1: 0, r2: sh.rows - 1, c2: sh.cols - 1 }, 0, 0); break;
        case 'copy': this.doCopy(false); break;
        case 'cut': this.doCopy(true); break;
        case 'paste': if (this.clip) this.doPaste(null); else this.toast('Use Ctrl+V para pegar desde el portapapeles.'); break;
        case 'fillDown':
          if (s.r2 > s.r1) this.mutate(() => this.wb.fill(sh, { ...s, r2: s.r1 }, s));
          else if (s.r1 > 0) this.mutate(() => this.wb.fill(sh, { ...s, r1: s.r1 - 1, r2: s.r1 - 1 }, { ...s, r1: s.r1 - 1 }));
          break;
        case 'insertRow': this.mutate(() => this.wb.insertRows(sh, s.r1, s.r2 - s.r1 + 1 > 50 ? 1 : s.r2 - s.r1 + 1)); break;
        case 'insertCol': this.mutate(() => this.wb.insertCols(sh, s.c1, s.c2 - s.c1 + 1 > 20 ? 1 : s.c2 - s.c1 + 1)); break;
        case 'deleteRow': this.mutate(() => this.wb.deleteRows(sh, s.r1, s.r2 - s.r1 + 1)); break;
        case 'deleteCol': this.mutate(() => this.wb.deleteCols(sh, s.c1, s.c2 - s.c1 + 1)); break;
        case 'colWidth': {
          const v = await this.form('Ancho de columna', [{ name: 'w', label: 'Ancho de columna (píxeles)', type: 'number', value: this.colW(s.c1) }]);
          if (v && +v.w > 10) this.mutate(() => { for (let c = s.c1; c <= s.c2; c++) sh.colW[c] = +v.w; }, { allowProtected: true });
          break;
        }
        case 'autosum': this.autosum(); break;
        case 'sortAsc': case 'sortDesc': this.quickSort(name === 'sortDesc'); break;
        case 'sortCustom': this.sortDialog(); break;
        case 'filter':
          if (sh.filter) this.mutate(() => { sh.filter = null; }, { allowProtected: false });
          else {
            const rg = this.regionForData();
            if (rg.r1 === rg.r2 && rg.c1 === rg.c2 && !(sh.cells[F.addr(rg.r1, rg.c1)] || {}).input) { this.alert('Seleccione una celda dentro de los datos antes de aplicar el filtro.'); break; }
            this.mutate(() => { sh.filter = { r1: rg.r1, c1: rg.c1, r2: rg.r2, c2: rg.c2, crit: {} }; sh.advHidden = []; });
          }
          break;
        case 'clearFilter': this.mutate(() => { if (sh.filter) sh.filter.crit = {}; sh.advHidden = []; }); break;
        case 'advFilter': this.advFilterDialog(); break;
        case 'cf': this.cfDialog(); break;
        case 'findReplace': this.findDialog(); break;
        case 'chart': this.chartDialog(); break;
        case 'pivot': this.pivotDialog(); break;
        case 'refreshPivots': this.mutate(() => this.wb.refreshPivots(), { allowProtected: true }); this.toast('Tablas dinámicas actualizadas.'); break;
        case 'newComment': this.commentDialog(); break;
        case 'deleteComment': this.mutate(() => { delete sh.comments[F.addr(this.act.r, this.act.c)]; }); break;
        case 'newSheet': this.mutate(() => { const i = this.wb.addSheet(); this.wb.active = i; this.act = { r: 0, c: 0 }; this.sel = { r1: 0, c1: 0, r2: 0, c2: 0 }; }, { allowProtected: true }); break;
        case 'insertFunction': this.insertFunctionDialog(); break;
        case 'defineName': this.nameDialog(); break;
        case 'nameManager': this.nameManager(); break;
        case 'tracePrec': this.tracePrecedents(); break;
        case 'traceDep': this.traceDependents(); break;
        case 'clearArrows': this.traced = []; this.render(); break;
        case 'showFormulas': this.showFormulas = !this.showFormulas; this.render(); break;
        case 'errorCheck': this.errorCheck(); break;
        case 'dataValidation': this.dvDialog(); break;
        case 'consolidate': this.consolidateDialog(); break;
        case 'scenarios': this.scenarioManager(); break;
        case 'protect':
          if (sh.protected) { this.mutate(() => { sh.protected = false; }, { allowProtected: true }); this.toast('Hoja desprotegida.'); }
          else {
            const v = await this.form('Proteger hoja', [
              { type: 'info', text: 'Proteger la hoja y el contenido de celdas bloqueadas.' },
              { name: 'pw', label: 'Contraseña para desproteger la hoja (opcional)', type: 'password' },
            ]);
            if (v) { this.mutate(() => { sh.protected = true; }, { allowProtected: true }); this.toast('Hoja protegida.'); }
          }
          break;
        case 'freezePanes':
          if (this.act.r === 0 && this.act.c === 0) { this.alert('Seleccione la celda debajo y a la derecha de las filas y columnas que desea inmovilizar.'); break; }
          this.mutate(() => { sh.freeze = { r: this.act.r, c: this.act.c }; }, { allowProtected: true });
          break;
        case 'freezeRow': this.mutate(() => { sh.freeze = { r: 1, c: 0 }; }, { allowProtected: true }); break;
        case 'freezeCol': this.mutate(() => { sh.freeze = { r: 0, c: 1 }; }, { allowProtected: true }); break;
        case 'unfreeze': this.mutate(() => { sh.freeze = { r: 0, c: 0 }; }, { allowProtected: true }); break;
        case 'recordMacro': this.recordMacro(); break;
        case 'relRefs': this.relRefs = !this.relRefs; this.updateRibbonState(); this.toast(this.relRefs ? 'Grabación con referencias relativas activada.' : 'Grabación con referencias absolutas.'); break;
        case 'formatCells': this.formatCellsDialog(); break;
        case 'macros': this.macroDialog(); break;
        case 'vba': this.vbaDialog(); break;
        case 'ctlCombo': this.controlDialog('combo'); break;
        case 'ctlCheck': this.controlDialog('check'); break;
        case 'ctlSpin': this.controlDialog('spin'); break;
        default: break;
      }
      this.focus();
    }

    autosum() {
      const sh = this.sh;
      const { r, c } = this.act;
      const isNum = (rr, cc) => typeof this.wb.getValue(sh.name, rr, cc) === 'number';
      let r1 = r - 1;
      while (r1 >= 0 && !isNum(r1, c) && r1 > r - 2) r1--;
      if (r1 >= 0 && isNum(r1, c)) {
        let top = r1;
        while (top - 1 >= 0 && isNum(top - 1, c)) top--;
        this.startEdit('enter', '=SUMA(' + F.rangeToStr({ r1: top, c1: c, r2: r1, c2: c }) + ')');
        return;
      }
      let c1 = c - 1;
      if (c1 >= 0 && isNum(r, c1)) {
        let left = c1;
        while (left - 1 >= 0 && isNum(r, left - 1)) left--;
        this.startEdit('enter', '=SUMA(' + F.rangeToStr({ r1: r, c1: left, r2: r, c2: c1 }) + ')');
        return;
      }
      this.startEdit('enter', '=SUMA()');
      const inp = this.activeInput();
      inp.setSelectionRange(6, 6);
    }

    quickSort(desc) {
      const sh = this.sh;
      const rg = this.regionForData();
      const first = [];
      for (let c = rg.c1; c <= rg.c2; c++) first.push(this.wb.getValue(sh.name, rg.r1, c));
      const second = [];
      for (let c = rg.c1; c <= rg.c2; c++) second.push(this.wb.getValue(sh.name, rg.r1 + 1, c));
      const hasHeader = first.every((v) => typeof v === 'string') && second.some((v) => typeof v !== 'string');
      const hdr = hasHeader || (first.every((v) => typeof v === 'string') && rg.r2 > rg.r1);
      const col = Math.max(rg.c1, Math.min(this.act.c, rg.c2));
      this.mutate(() => this.wb.sortRange(sh, rg, [{ c: col, desc }], hdr));
      this.toast('Datos ordenados ' + (desc ? 'de mayor a menor (Z→A)' : 'de menor a mayor (A→Z)') + (hdr ? ' (con encabezados)' : ''));
    }

    printPreview() {
      const sh = this.sh;
      const used = Object.keys(sh.cells).map(F.parseAddr);
      const maxR = Math.max(0, ...used.map((p) => p.r));
      const maxC = Math.max(0, ...used.map((p) => p.c));
      let h = '<div class="xl-print"><table>';
      for (let r = 0; r <= maxR; r++) {
        if (this.wb.isRowHidden(sh, r)) continue;
        h += '<tr>';
        for (let c = 0; c <= maxC; c++) {
          const cell = sh.cells[F.addr(r, c)];
          const st = (cell && cell.style) || {};
          h += '<td style="' + (st.bold ? 'font-weight:700;' : '') + (st.fill ? 'background:' + st.fill + ';' : '') + '">' + esc(this.wb.display(sh, r, c)) + '</td>';
        }
        h += '</tr>';
      }
      h += '</table></div>';
      this.modal('Vista preliminar de impresión — ' + sh.name, el('div', null, h), [{ label: 'Cerrar', value: 'ok', primary: true }]);
      this.wb.printPreviewed = true;
      this.changed();
    }

    /* ======================= Popups / menús ======================= */
    closePopup() { if (this.popupEl) { this.popupEl.remove(); this.popupEl = null; } }
    popupAt(x, y, content) {
      this.closePopup();
      const p = el('div', 'xl-popup');
      p.appendChild(content);
      document.body.appendChild(p);
      const w = p.offsetWidth; const h = p.offsetHeight;
      p.style.left = Math.max(4, Math.min(x, window.innerWidth - w - 8)) + 'px';
      p.style.top = Math.max(4, Math.min(y, window.innerHeight - h - 8)) + 'px';
      this.popupEl = p;
      return p;
    }
    menu(x, y, items) {
      const m = el('div', 'xl-menu');
      for (const it of items) {
        if (!it) { m.appendChild(el('div', 'sep')); continue; }
        const b = el('button', null, esc(it[0]));
        b.type = 'button';
        b.onclick = () => { this.closePopup(); it[1](); };
        m.appendChild(b);
      }
      this.popupAt(x, y, m);
    }
    colorPopup(btn, cmd) {
      const box = el('div', 'xl-colors');
      const none = el('button', 'none', cmd === 'fill' ? 'Sin relleno' : 'Automático');
      none.type = 'button';
      none.onclick = () => { this.closePopup(); this.cmd(cmd, null); };
      box.appendChild(none);
      const grid = el('div', 'grid');
      for (const c of COLORS) {
        const b = el('button');
        b.type = 'button';
        b.style.background = c;
        b.title = c;
        b.onclick = () => { this.closePopup(); this.cmd(cmd, c); };
        grid.appendChild(b);
      }
      box.appendChild(grid);
      const r = btn.getBoundingClientRect();
      this.popupAt(r.left, r.bottom + 2, box);
    }
    clearMenu(btn) {
      const r = btn.getBoundingClientRect();
      this.menu(r.left, r.bottom + 2, [
        ['Borrar todo', () => this.cmd('clearAll')],
        ['Borrar formatos', () => this.cmd('clearFormats')],
        ['Borrar contenido', () => this.cmd('clearContents')],
        ['Borrar comentarios', () => this.cmd('deleteComment')],
        ['Borrar reglas de formato condicional', () => this.mutate(() => { const s = this.sel; this.sh.cf = this.sh.cf.filter((x) => !(x.r1 >= s.r1 && x.r2 <= s.r2 && x.c1 >= s.c1 && x.c2 <= s.c2)); })],
      ]);
    }

    filterPopup(c, btn) {
      const sh = this.sh;
      const f = sh.filter;
      if (!f) return;
      const vals = this.wb.uniqueColumnValues(sh, c);
      const crit = f.crit[c];
      const box = el('div', 'xl-fpop');
      const sortA = el('button', 'lnk', '↑ Ordenar de A a Z');
      const sortZ = el('button', 'lnk', '↓ Ordenar de Z a A');
      sortA.type = sortZ.type = 'button';
      const doSort = (desc) => { this.closePopup(); this.mutate(() => this.wb.sortRange(sh, f, [{ c, desc }], true)); };
      sortA.onclick = () => doSort(false);
      sortZ.onclick = () => doSort(true);
      box.append(sortA, sortZ, el('hr'));
      const cust = el('div', 'cust');
      cust.innerHTML = '<div class="t">Filtro personalizado</div><select class="op"><option value="">(ninguno)</option><option value="=">es igual a</option><option value="<>">no es igual a</option><option value=">">es mayor que</option><option value=">=">es mayor o igual a</option><option value="<">es menor que</option><option value="<=">es menor o igual a</option></select> <input class="val" placeholder="valor">';
      if (crit && crit.type === 'custom') { cust.querySelector('.op').value = crit.op; cust.querySelector('.val').value = crit.val; }
      box.appendChild(cust);
      const list = el('div', 'vals');
      const all = el('label', 'all');
      const allCb = el('input');
      allCb.type = 'checkbox';
      all.append(allCb, document.createTextNode(' (Seleccionar todo)'));
      list.appendChild(all);
      const cbs = [];
      for (const v of vals) {
        const lab = el('label');
        const cb = el('input');
        cb.type = 'checkbox';
        cb.value = v;
        cb.checked = !crit || crit.type !== 'values' || crit.values.includes(v);
        lab.append(cb, document.createTextNode(' ' + (v === '' ? '(Vacías)' : v)));
        list.appendChild(lab);
        cbs.push(cb);
      }
      allCb.checked = cbs.every((x) => x.checked);
      allCb.onchange = () => cbs.forEach((x) => { x.checked = allCb.checked; });
      cbs.forEach((x) => { x.onchange = () => { allCb.checked = cbs.every((y) => y.checked); }; });
      box.appendChild(list);
      const btns = el('div', 'btns');
      const ok = el('button', 'pri', 'Aceptar');
      const cancel = el('button', null, 'Cancelar');
      const clear = el('button', null, 'Borrar filtro');
      ok.type = cancel.type = clear.type = 'button';
      ok.onclick = () => {
        const op = cust.querySelector('.op').value;
        const val = cust.querySelector('.val').value;
        let nc = null;
        if (op && val !== '') nc = { type: 'custom', op, val };
        else if (!cbs.every((x) => x.checked)) nc = { type: 'values', values: cbs.filter((x) => x.checked).map((x) => x.value) };
        this.closePopup();
        this.mutate(() => { if (nc) f.crit[c] = nc; else delete f.crit[c]; });
      };
      cancel.onclick = () => this.closePopup();
      clear.onclick = () => { this.closePopup(); this.mutate(() => { delete f.crit[c]; }); };
      btns.append(clear, ok, cancel);
      box.appendChild(btns);
      const r = btn.getBoundingClientRect();
      this.popupAt(r.left - 180, r.bottom + 2, box);
    }

    /* ======================= Diálogos ======================= */
    modal(title, body, buttons, onButton, opts = {}) {
      const ov = el('div', 'xl-modal');
      const dlg = el('div', 'xl-dialog');
      if (opts.width) dlg.style.width = opts.width + 'px';
      const head = el('div', 'xl-dhead', '<span>' + esc(title) + '</span>');
      const x = el('button', 'x', '✕');
      x.type = 'button';
      head.appendChild(x);
      const bd = el('div', 'xl-dbody');
      bd.appendChild(body);
      const ft = el('div', 'xl-dfoot');
      dlg.append(head, bd, ft);
      ov.appendChild(dlg);
      document.body.appendChild(ov);
      this.modalOpen = true;
      const close = () => {
        ov.remove();
        this.modalOpen = document.querySelectorAll('.xl-modal').length > 0;
        if (!this.modalOpen) setTimeout(() => this.focus(), 0);
      };
      const handle = (v) => {
        const keep = onButton ? onButton(v, close) === false : false;
        if (!keep) close();
      };
      for (const b of buttons) {
        const be = el('button', b.primary ? 'pri' : '', esc(b.label));
        be.type = 'button';
        if (b.left) be.classList.add('left');
        be.onclick = () => handle(b.value);
        ft.appendChild(be);
      }
      x.onclick = () => handle('cancel');
      ov.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); handle('cancel'); }
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON' && !e.target.closest('.nokey')) {
          const pri = buttons.find((b) => b.primary);
          if (pri) { e.preventDefault(); handle(pri.value); }
        }
      });
      const first = bd.querySelector('input:not([type=checkbox]):not([type=radio]),select,textarea');
      setTimeout(() => { if (first) { first.focus(); if (first.select) first.select(); } }, 0);
      this.modalEl = ov;
      return { ov, dlg, body: bd, close };
    }

    alert(msg, title) {
      return new Promise((res) => {
        const b = el('div', 'xl-alert');
        b.innerHTML = '<span class="ic">⚠️</span><div>' + esc(msg).replace(/\n/g, '<br>') + '</div>';
        this.modal(title || 'Microsoft Excel', b, [{ label: 'Aceptar', value: 'ok', primary: true }], () => { res(); });
      });
    }

    toast(msg) {
      for (const old of this.root.querySelectorAll('.xl-toast')) old.remove();
      const t = el('div', 'xl-toast', esc(msg));
      this.root.appendChild(t);
      setTimeout(() => t.classList.add('out'), 2200);
      setTimeout(() => t.remove(), 2700);
    }

    /** Formulario genérico. fields: {name,label,type,value,options,help,show(values)} */
    form(title, fields, o = {}) {
      return new Promise((resolve) => {
        const body = el('div', 'xl-form');
        const inputs = {};
        const rows = [];
        for (const f of fields) {
          const row = el('div', 'row' + (f.type === 'checkbox' ? ' chk' : ''));
          if (f.type === 'info') { row.innerHTML = '<div class="info">' + f.text + '</div>'; body.appendChild(row); rows.push([f, row]); continue; }
          const id = 'f' + Math.random().toString(36).slice(2);
          let inp;
          if (f.type === 'select') {
            inp = el('select');
            for (const [v, l] of f.options) { const op = el('option', null, esc(l)); op.value = v; inp.appendChild(op); }
            if (f.value != null) inp.value = f.value;
          } else if (f.type === 'textarea') {
            inp = el('textarea');
            inp.rows = f.rows || 4;
            inp.value = f.value ?? '';
          } else if (f.type === 'radio') {
            inp = el('div', 'radios');
            for (const [v, l] of f.options) {
              const lab = el('label');
              const r = el('input');
              r.type = 'radio'; r.name = id; r.value = v;
              if (f.value === v) r.checked = true;
              lab.append(r, document.createTextNode(' ' + l));
              inp.appendChild(lab);
            }
          } else {
            inp = el('input');
            inp.type = f.type === 'number' ? 'text' : f.type === 'checkbox' ? 'checkbox' : f.type === 'password' ? 'password' : 'text';
            if (f.type === 'checkbox') inp.checked = !!f.value; else inp.value = f.value ?? '';
            if (f.placeholder) inp.placeholder = f.placeholder;
          }
          inp.id = id;
          inputs[f.name] = inp;
          if (f.type === 'checkbox') { const lab = el('label'); lab.append(inp, document.createTextNode(' ' + f.label)); row.appendChild(lab); } else {
            const lab = el('label', null, esc(f.label || ''));
            lab.htmlFor = id;
            row.appendChild(lab);
            const wrapI = el('div', 'inp');
            wrapI.appendChild(inp);
            if (f.type === 'range') {
              const pick = el('button', 'pick', '⇲');
              pick.type = 'button';
              pick.title = 'Contraer el diálogo y seleccionar el rango en la hoja';
              pick.onclick = () => this.collapsePick(inp, f.sheetPrefix !== false);
              wrapI.appendChild(pick);
            }
            row.appendChild(wrapI);
          }
          if (f.help) row.appendChild(el('div', 'help', f.help));
          body.appendChild(row);
          rows.push([f, row]);
        }
        const err = el('div', 'err');
        body.appendChild(err);
        const values = () => {
          const v = {};
          for (const f of fields) {
            const inp = inputs[f.name];
            if (!inp) continue;
            if (f.type === 'checkbox') v[f.name] = inp.checked;
            else if (f.type === 'radio') { const r = inp.querySelector('input:checked'); v[f.name] = r ? r.value : null; } else v[f.name] = inp.value;
          }
          return v;
        };
        const refresh = () => {
          const v = values();
          for (const [f, row] of rows) if (f.show) row.style.display = f.show(v) ? '' : 'none';
          if (o.onChange) o.onChange(v, inputs, body);
        };
        body.addEventListener('input', refresh);
        body.addEventListener('change', refresh);
        const buttons = [...(o.extra || []).map((x) => ({ label: x.label, value: 'x:' + x.label, left: true })), { label: o.ok || 'Aceptar', value: 'ok', primary: true }, { label: o.cancel || 'Cancelar', value: 'cancel' }];
        this.modal(title, body, buttons, (b) => {
          if (b === 'cancel') { resolve(null); return true; }
          const v = values();
          if (b.startsWith('x:')) {
            const x = (o.extra || []).find((e) => 'x:' + e.label === b);
            const msg = x.run(v, inputs, body);
            err.textContent = typeof msg === 'string' ? msg : '';
            return false;
          }
          const msg = o.validate ? o.validate(v) : null;
          if (msg) { err.textContent = msg; return false; }
          resolve(v);
          return true;
        }, { width: o.width });
        if (o.init) o.init(inputs, body);
        refresh();
      });
    }

    /** Pliega el diálogo para seleccionar un rango con el mouse. */
    collapsePick(input, withSheet) {
      const ov = input.closest('.xl-modal');
      ov.style.display = 'none';
      this.modalOpen = false;
      const originSheet = this.wb.active;
      const bar = this.collapseBar;
      bar.innerHTML = '';
      const txt = el('span', 'tx');
      const ok = el('button', 'pri', 'Aceptar');
      ok.type = 'button';
      bar.append(el('span', 'lbl', 'Seleccione el rango en la hoja:'), txt, ok);
      bar.style.display = 'flex';
      this.collapsed = true;
      const upd = () => {
        const pre = withSheet || this.wb.active !== originSheet ? F.quoteSheet(this.sh.name) + '!' : '';
        txt.textContent = pre + F.rangeToStr({ ...this.sel, r2: Math.min(this.sel.r2, this.sh.rows - 1) }, true);
      };
      upd();
      const iv = setInterval(upd, 120);
      const finish = () => {
        clearInterval(iv);
        upd();
        input.value = txt.textContent;
        bar.style.display = 'none';
        this.collapsed = false;
        ov.style.display = '';
        this.modalOpen = true;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        document.removeEventListener('keydown', key, true);
      };
      const key = (e) => { if (e.key === 'Enter' && this.collapsed) { e.preventDefault(); e.stopPropagation(); finish(); } };
      document.addEventListener('keydown', key, true);
      ok.onclick = finish;
      this.focus();
    }

    selStr(abs, withSheet) {
      const s = { ...this.sel, r2: Math.min(this.sel.r2, this.sh.rows - 1) };
      return (withSheet ? F.quoteSheet(this.sh.name) + '!' : '') + F.rangeToStr(s, abs);
    }
    regionStr(abs, withSheet) {
      const rg = this.regionForData();
      return (withSheet ? F.quoteSheet(this.sh.name) + '!' : '') + F.rangeToStr(rg, abs);
    }
    parseRangeIn(text, defSheet) {
      const rg = F.parseRange(text);
      if (!rg) {
        const nm = this.wb.nameRange(String(text).trim().replace(/^=/, ''));
        return nm || null;
      }
      const sh = this.wb.sheet(rg.sheet || defSheet || this.sh.name);
      if (!sh) return null;
      rg.sheet = sh.name;
      rg.r2 = Math.min(rg.r2, sh.rows - 1);
      return rg;
    }

    async cfDialog() {
      const v = await this.form('Formato condicional — Nueva regla', [
        { name: 'range', label: 'Se aplica a', type: 'range', value: this.selStr(true), sheetPrefix: false },
        { name: 'type', label: 'Dar formato a las celdas cuyo valor sea', type: 'select', options: [['gt', 'Mayor que'], ['lt', 'Menor que'], ['ge', 'Mayor o igual que'], ['le', 'Menor o igual que'], ['between', 'Entre'], ['eq', 'Es igual a'], ['text', 'Texto que contiene'], ['dup', 'Valores duplicados']] },
        { name: 'v1', label: 'Valor', show: (x) => x.type !== 'dup' },
        { name: 'v2', label: 'y', show: (x) => x.type === 'between' },
        { name: 'fmt', label: 'con', type: 'select', options: Object.entries(CF_FORMATS).map(([k, x]) => [k, x.label]) },
      ], {
        validate: (x) => {
          if (!this.parseRangeIn(x.range)) return 'El rango no es válido.';
          if (x.type !== 'dup' && x.v1.trim() === '') return 'Ingrese un valor.';
          if (x.type === 'between' && x.v2.trim() === '') return 'Ingrese el segundo valor.';
          return null;
        },
      });
      if (!v) return;
      const rg = this.parseRangeIn(v.range);
      this.mutate(() => { this.sh.cf.push({ r1: rg.r1, c1: rg.c1, r2: rg.r2, c2: rg.c2, type: v.type, v1: v.v1.trim(), v2: (v.v2 || '').trim(), fmt: v.fmt }); });
    }

    async dvDialog() {
      const cur = this.wb.dvFor(this.sh, this.act.r, this.act.c) || {};
      const v = await this.form('Validación de datos', [
        { name: 'type', label: 'Permitir', type: 'select', value: cur.type || 'any', options: [['any', 'Cualquier valor'], ['whole', 'Número entero'], ['decimal', 'Decimal'], ['list', 'Lista'], ['date', 'Fecha'], ['textlen', 'Longitud del texto']] },
        { name: 'op', label: 'Datos', type: 'select', value: cur.op || 'between', options: [['between', 'entre'], ['notbetween', 'no está entre'], ['eq', 'igual a'], ['ne', 'no igual a'], ['gt', 'mayor que'], ['lt', 'menor que'], ['ge', 'mayor o igual que'], ['le', 'menor o igual que']], show: (x) => !['any', 'list'].includes(x.type) },
        { name: 'min', label: 'Mínimo', value: cur.min || '', show: (x) => !['any', 'list'].includes(x.type) },
        { name: 'max', label: 'Máximo', value: cur.max || '', show: (x) => ['between', 'notbetween'].includes(x.op) && !['any', 'list'].includes(x.type) },
        { name: 'source', label: 'Origen', value: cur.source || '', help: 'Escriba los elementos separados por punto y coma (Ej.: Sí;No) o un rango (Ej.: =$F$2:$F$5).', show: (x) => x.type === 'list' },
        { name: 'msg', label: 'Mensaje de error (opcional)', value: cur.msg || '' },
      ], {
        extra: [{ label: 'Borrar todos', run: () => { const s = this.sel; this.mutate(() => { this.sh.dv = this.sh.dv.filter((d) => d.r2 < s.r1 || d.r1 > s.r2 || d.c2 < s.c1 || d.c1 > s.c2); }); return 'Se eliminaron las reglas de la selección.'; } }],
        validate: (x) => {
          if (x.type === 'list' && !x.source.trim()) return 'Debe especificar el origen de la lista.';
          if (!['any', 'list'].includes(x.type)) {
            if (x.min.trim() === '') return 'Debe especificar el valor ' + (['between', 'notbetween'].includes(x.op) ? 'mínimo.' : '.');
            if (['between', 'notbetween'].includes(x.op) && x.max.trim() === '') return 'Debe especificar el valor máximo.';
          }
          return null;
        },
      });
      if (!v) return;
      const s = this.sel;
      this.mutate(() => {
        this.sh.dv = this.sh.dv.filter((d) => !(d.r1 >= s.r1 && d.r2 <= s.r2 && d.c1 >= s.c1 && d.c2 <= s.c2));
        if (v.type !== 'any') this.sh.dv.push({ r1: s.r1, c1: s.c1, r2: Math.min(s.r2, this.sh.rows - 1), c2: s.c2, type: v.type, op: v.op, min: v.min.trim(), max: v.max.trim(), source: v.source.trim(), msg: v.msg.trim() });
      });
    }

    async nameDialog() {
      const v = await this.form('Nombre nuevo', [
        { name: 'name', label: 'Nombre', value: '' },
        { name: 'ref', label: 'Hace referencia a', type: 'range', value: '=' + this.selStr(true, true) },
      ], { validate: (x) => (!x.name.trim() ? 'Escriba un nombre.' : !this.parseRangeIn(x.ref) ? 'La referencia no es válida.' : null) });
      if (!v) return;
      const rg = this.parseRangeIn(v.ref);
      this.mutate(() => { const err = this.wb.defineName(v.name, rg); if (err) { this.alert(err); return false; } return true; }, { allowProtected: true });
    }

    nameManager() {
      const body = el('div', 'xl-list');
      const draw = () => {
        const names = Object.entries(this.wb.names);
        if (!names.length) { body.innerHTML = '<p class="muted">No hay nombres definidos. Use Fórmulas &gt; Asignar nombre o el cuadro de nombres.</p>'; return; }
        body.innerHTML = '<table><tr><th>Nombre</th><th>Hace referencia a</th><th></th></tr></table>';
        const t = body.querySelector('table');
        for (const [k, n] of names) {
          const tr = el('tr', null, '<td>' + esc(n.name) + '</td><td>=' + esc(F.rangeToStr({ ...n, sheet: n.sheet }, true)) + '</td>');
          const td = el('td');
          const del = el('button', null, 'Eliminar');
          del.type = 'button';
          del.onclick = () => { this.mutate(() => { delete this.wb.names[k]; }, { allowProtected: true }); draw(); };
          td.appendChild(del);
          tr.appendChild(td);
          t.appendChild(tr);
        }
      };
      draw();
      this.modal('Administrador de nombres', body, [{ label: 'Cerrar', value: 'ok', primary: true }], null, { width: 520 });
    }

    async commentDialog() {
      const a = F.addr(this.act.r, this.act.c);
      const v = await this.form('Comentario — ' + a, [{ name: 'text', label: 'Texto del comentario', type: 'textarea', value: this.sh.comments[a] || '' }]);
      if (!v) return;
      this.mutate(() => { if (v.text.trim()) this.sh.comments[a] = v.text.trim(); else delete this.sh.comments[a]; });
    }

    async sortDialog() {
      const sh = this.sh;
      const rg = this.regionForData();
      const heads = [];
      for (let c = rg.c1; c <= rg.c2; c++) heads.push([String(c), String(this.wb.getValue(sh.name, rg.r1, c) ?? '') || 'Columna ' + F.numToCol(c)]);
      const colOpts = (hdr) => heads.map(([c, h]) => [c, hdr ? h : 'Columna ' + F.numToCol(+c)]);
      const none = [['', '(ninguno)']];
      const v = await this.form('Ordenar — rango ' + F.rangeToStr(rg), [
        { name: 'hdr', label: 'Mis datos tienen encabezados', type: 'checkbox', value: true },
        { name: 'k1', label: 'Ordenar por', type: 'select', options: colOpts(true), value: String(Math.max(rg.c1, Math.min(this.act.c, rg.c2))) },
        { name: 'o1', label: 'Criterio de ordenación', type: 'select', options: [['asc', 'De menor a mayor / A a Z'], ['desc', 'De mayor a menor / Z a A']] },
        { name: 'k2', label: 'Luego por', type: 'select', options: none.concat(colOpts(true)), value: '' },
        { name: 'o2', label: 'Criterio', type: 'select', options: [['asc', 'De menor a mayor / A a Z'], ['desc', 'De mayor a menor / Z a A']], show: (x) => x.k2 !== '' },
        { name: 'k3', label: 'Luego por', type: 'select', options: none.concat(colOpts(true)), value: '', show: (x) => x.k2 !== '' },
        { name: 'o3', label: 'Criterio', type: 'select', options: [['asc', 'De menor a mayor / A a Z'], ['desc', 'De mayor a menor / Z a A']], show: (x) => x.k3 !== '' && x.k2 !== '' },
      ]);
      if (!v) return;
      const keys = [{ c: +v.k1, desc: v.o1 === 'desc' }];
      if (v.k2 !== '') keys.push({ c: +v.k2, desc: v.o2 === 'desc' });
      if (v.k2 !== '' && v.k3 !== '') keys.push({ c: +v.k3, desc: v.o3 === 'desc' });
      this.mutate(() => this.wb.sortRange(sh, rg, keys, v.hdr));
      this.selectRange(rg, this.act.r, this.act.c);
    }

    async advFilterDialog() {
      const v = await this.form('Filtro avanzado', [
        { name: 'action', label: 'Acción', type: 'radio', value: 'copy', options: [['inplace', 'Filtrar la lista sin moverla a otro lugar'], ['copy', 'Copiar a otro lugar']] },
        { name: 'list', label: 'Rango de la lista', type: 'range', value: this.regionStr(true), sheetPrefix: false },
        { name: 'crit', label: 'Rango de criterios', type: 'range', value: '', sheetPrefix: false },
        { name: 'dest', label: 'Copiar a', type: 'range', value: '', sheetPrefix: false, show: (x) => x.action === 'copy' },
      ], {
        validate: (x) => {
          if (!this.parseRangeIn(x.list)) return 'El rango de la lista no es válido.';
          if (!this.parseRangeIn(x.crit)) return 'El rango de criterios no es válido.';
          if (x.action === 'copy' && !this.parseRangeIn(x.dest)) return 'Indique una celda de destino válida en "Copiar a".';
          return null;
        },
      });
      if (!v) return;
      const list = this.parseRangeIn(v.list); const crit = this.parseRangeIn(v.crit);
      const dest = v.action === 'copy' ? this.parseRangeIn(v.dest) : null;
      this.mutate(() => {
        const err = this.wb.advancedFilter({ list, criteria: crit, copyTo: dest ? { sheet: dest.sheet, r: dest.r1, c: dest.c1 } : null });
        if (err) { this.alert(err); return false; }
        return true;
      });
    }

    async chartDialog(existing, idx) {
      const cur = existing || {};
      const v = await this.form(existing ? 'Modificar gráfico' : 'Insertar gráfico', [
        { name: 'type', label: 'Tipo de gráfico', type: 'select', value: cur.type || 'column', options: [['column', 'Columnas agrupadas'], ['bar', 'Barras agrupadas'], ['line', 'Líneas con marcadores'], ['pie', 'Circular']] },
        { name: 'range', label: 'Rango de datos', type: 'range', value: existing ? F.rangeToStr(cur, true) : this.regionStr(true), sheetPrefix: false },
        { name: 'title', label: 'Título del gráfico', value: cur.title || '' },
      ], { validate: (x) => (!this.parseRangeIn(x.range) ? 'El rango de datos no es válido.' : null) });
      if (!v) return;
      const rg = this.parseRangeIn(v.range);
      this.mutate(() => {
        if (existing) Object.assign(existing, { type: v.type, title: v.title.trim(), r1: rg.r1, c1: rg.c1, r2: rg.r2, c2: rg.c2 });
        else {
          const rc = this.cellRect(rg.r1, Math.min(rg.c2 + 1, this.sh.cols - 1));
          this.sh.charts.push({ type: v.type, title: v.title.trim(), r1: rg.r1, c1: rg.c1, r2: rg.r2, c2: rg.c2, x: rc ? rc.left + 20 : 300, y: rc ? rc.top : 40, w: 420, h: 270 });
        }
      });
    }

    async pivotDialog() {
      const srcDefault = this.regionStr(true, true);
      const headersOf = (txt) => {
        const rg = this.parseRangeIn(txt);
        if (!rg) return [];
        const out = [];
        for (let c = rg.c1; c <= rg.c2; c++) { const h = this.wb.getValue(rg.sheet, rg.r1, c); if (h != null && h !== '') out.push(String(h)); }
        return out;
      };
      let heads = headersOf(srcDefault);
      const opts = (list, withNone) => (withNone ? [['', '(ninguno)']] : []).concat(list.map((h) => [h, h]));
      const v = await this.form('Crear tabla dinámica', [
        { name: 'src', label: 'Tabla o rango', type: 'range', value: srcDefault },
        { name: 'rowField', label: 'Filas', type: 'select', options: opts(heads) },
        { name: 'colField', label: 'Columnas (opcional)', type: 'select', options: opts(heads, true), value: '' },
        { name: 'valField', label: 'Valores', type: 'select', options: opts(heads), value: heads[heads.length - 1] },
        { name: 'agg', label: 'Resumir valores por', type: 'select', options: [['sum', 'Suma'], ['count', 'Cuenta'], ['avg', 'Promedio'], ['max', 'Máx.'], ['min', 'Mín.']] },
        { name: 'where', label: 'Ubicación', type: 'radio', value: 'new', options: [['new', 'Nueva hoja de cálculo'], ['existing', 'Hoja de cálculo existente']] },
        { name: 'dest', label: 'Ubicación (celda)', type: 'range', value: '', show: (x) => x.where === 'existing' },
      ], {
        onChange: (x, inputs) => {
          const h = headersOf(x.src);
          if (h.join('|') !== heads.join('|')) {
            heads = h;
            for (const [k, none] of [['rowField', false], ['colField', true], ['valField', false]]) {
              const s = inputs[k];
              s.innerHTML = '';
              for (const [val, l] of opts(heads, none)) { const o = el('option', null, esc(l)); o.value = val; s.appendChild(o); }
            }
          }
        },
        validate: (x) => {
          if (!this.parseRangeIn(x.src)) return 'El rango de origen no es válido.';
          if (!x.rowField || !x.valField) return 'Seleccione los campos de filas y valores.';
          if (x.where === 'existing' && !this.parseRangeIn(x.dest)) return 'Indique una celda de destino válida.';
          return null;
        },
      });
      if (!v) return;
      const src = this.parseRangeIn(v.src);
      this.mutate(() => {
        let sheet; let r; let c;
        if (v.where === 'new') {
          const i = this.wb.addSheet();
          sheet = this.wb.sheets[i].name; r = 2; c = 0;
          this.wb.active = i;
          this.act = { r: 2, c: 0 }; this.sel = { r1: 2, c1: 0, r2: 2, c2: 0 };
        } else {
          const d = this.parseRangeIn(v.dest);
          sheet = d.sheet; r = d.r1; c = d.c1;
        }
        const err = this.wb.createPivot({ src, rowField: v.rowField, colField: v.colField, valField: v.valField, agg: v.agg, sheet, r, c });
        if (err) { this.alert(err); return false; }
        return true;
      }, { allowProtected: v.where === 'new' });
    }

    async consolidateDialog() {
      const refs = [];
      const destA = F.addr(this.act.r, this.act.c);
      const destSheet = this.sh.name;
      const v = await this.form('Consolidar — destino ' + destSheet + '!' + destA, [
        { name: 'fn', label: 'Función', type: 'select', options: [['sum', 'Suma'], ['avg', 'Promedio'], ['count', 'Cuenta'], ['max', 'Máx'], ['min', 'Mín']] },
        { name: 'ref', label: 'Referencia', type: 'range', value: '' },
        { type: 'info', text: '<b>Todas las referencias:</b><div class="refs muted">(ninguna)</div>' },
        { name: 'links', label: 'Crear vínculos con los datos de origen', type: 'checkbox', value: false },
      ], {
        extra: [{
          label: 'Agregar',
          run: (x, inputs, body) => {
            const rg = this.parseRangeIn(x.ref);
            if (!rg) return 'La referencia no es válida.';
            refs.push(rg);
            body.querySelector('.refs').innerHTML = refs.map((r) => esc(F.rangeToStr(r, true))).join('<br>');
            inputs.ref.value = '';
            return '';
          },
        }],
        validate: () => (!refs.length ? 'Agregue al menos una referencia con el botón "Agregar".' : null),
      });
      if (!v) return;
      this.mutate(() => {
        const err = this.wb.consolidate({ fn: v.fn, refs, dest: { sheet: destSheet, r: this.act.r, c: this.act.c }, links: v.links });
        if (err) { this.alert(err); return false; }
        return true;
      });
    }

    async findDialog() {
      let pos = -1;
      await this.form('Buscar y reemplazar', [
        { name: 'find', label: 'Buscar', value: '' },
        { name: 'repl', label: 'Reemplazar con', value: '' },
        { name: 'mc', label: 'Coincidir mayúsculas y minúsculas', type: 'checkbox' },
        { name: 'whole', label: 'Coincidir con el contenido de toda la celda', type: 'checkbox' },
      ], {
        ok: 'Cerrar',
        cancel: 'Cancelar',
        extra: [
          {
            label: 'Buscar siguiente',
            run: (x) => {
              const found = this.wb.findAll(this.sh, x.find, x.mc, x.whole);
              if (!found.length) return 'No se encontró lo que buscaba.';
              pos = (pos + 1) % found.length;
              this.select(found[pos].r, found[pos].c);
              return 'Coincidencia ' + (pos + 1) + ' de ' + found.length + ': ' + F.addr(found[pos].r, found[pos].c);
            },
          },
          {
            label: 'Reemplazar todos',
            run: (x) => {
              if (!x.find) return 'Escriba el texto a buscar.';
              let n = 0;
              this.mutate(() => { n = this.wb.replaceAll(this.sh, x.find, x.repl, x.mc, x.whole); });
              return n ? 'Listo. Se realizaron ' + n + ' reemplazos.' : 'No se encontró lo que buscaba.';
            },
          },
        ],
      });
    }

    insertFunctionDialog() {
      const body = el('div', 'xl-fnlist');
      const cats = ['Todas', ...Array.from(new Set(F.FUNCTION_HELP.map((f) => f[0])))];
      body.innerHTML = '<div class="top"><input class="q nokey" placeholder="Buscar una función"> <select class="cat">' + cats.map((c) => '<option>' + esc(c) + '</option>').join('') + '</select></div><div class="lst"></div><div class="desc"></div>';
      const lst = body.querySelector('.lst'); const desc = body.querySelector('.desc');
      let chosen = null;
      const draw = () => {
        const q = F.normName(body.querySelector('.q').value);
        const cat = body.querySelector('.cat').value;
        lst.innerHTML = '';
        for (const f of F.FUNCTION_HELP) {
          if (cat !== 'Todas' && f[0] !== cat) continue;
          if (q && !F.normName(f[1] + ' ' + f[3]).includes(q)) continue;
          const it = el('div', 'it' + (chosen === f ? ' on' : ''), esc(f[1]));
          it.onclick = () => { chosen = f; desc.innerHTML = '<b>' + esc(f[2]) + '</b><br>' + esc(f[3]); draw(); };
          it.ondblclick = () => { chosen = f; doIns(); m.close(); };
          lst.appendChild(it);
        }
      };
      const doIns = () => {
        if (!chosen) return;
        if (this.editing) {
          const inp = this.activeInput();
          const p = inp.selectionStart ?? inp.value.length;
          inp.value = inp.value.slice(0, p) + chosen[1] + '(' + inp.value.slice(p);
          this.fbar.value = this.ed.value = inp.value;
        } else this.startEdit('enter', '=' + chosen[1] + '(');
        setTimeout(() => { this.activeInput().focus(); this.updateHint(); }, 0);
      };
      body.querySelector('.q').oninput = draw;
      body.querySelector('.cat').onchange = draw;
      draw();
      const m = this.modal('Insertar función', body, [{ label: 'Aceptar', value: 'ok', primary: true }, { label: 'Cancelar', value: 'cancel' }], (b) => { if (b === 'ok') doIns(); }, { width: 520 });
    }

    tracePrecedents() {
      const cell = this.sh.cells[F.addr(this.act.r, this.act.c)];
      if (!cell || typeof cell.input !== 'string' || cell.input[0] !== '=') { this.alert('La celda activa no contiene una fórmula con referencias.'); return; }
      const refs = F.refsOf(cell.input);
      const list = [];
      for (const r of refs) {
        if (r.name) { const nm = this.wb.nameRange(r.name); if (nm) list.push({ ...nm, cls: 'tr-prec' }); continue; }
        list.push({ sheet: r.sheet || this.sh.name, r1: r.r1, c1: r.c1, r2: Math.min(r.r2, this.sh.rows - 1), c2: r.c2, cls: 'tr-prec' });
      }
      this.traced = list.concat([{ sheet: this.sh.name, r1: this.act.r, c1: this.act.c, r2: this.act.r, c2: this.act.c, cls: 'tr-self' }]);
      this.render();
      const other = list.filter((x) => x.sheet.toLowerCase() !== this.sh.name.toLowerCase());
      this.toast('Precedentes: ' + list.map((x) => (x.sheet.toLowerCase() !== this.sh.name.toLowerCase() ? x.sheet + '!' : '') + F.rangeToStr(x)).join(', ') + (other.length ? ' (incluye otras hojas)' : ''));
      this.wb.auditUsed = true;
      this.changed();
    }
    traceDependents() {
      const me = { r: this.act.r, c: this.act.c };
      const list = [];
      for (const s of this.wb.sheets) {
        for (const [a, cell] of Object.entries(s.cells)) {
          if (typeof cell.input !== 'string' || cell.input[0] !== '=') continue;
          const refs = F.refsOf(cell.input);
          const hit = refs.some((r) => {
            if (r.name) { const nm = this.wb.nameRange(r.name); return nm && nm.sheet.toLowerCase() === this.sh.name.toLowerCase() && U.inRg(nm, me.r, me.c); }
            const sn = (r.sheet || s.name).toLowerCase();
            return sn === this.sh.name.toLowerCase() && U.inRg(r, me.r, me.c);
          });
          if (hit) { const p = F.parseAddr(a); list.push({ sheet: s.name, r1: p.r, c1: p.c, r2: p.r, c2: p.c, cls: 'tr-dep' }); }
        }
      }
      if (!list.length) { this.alert('No hay fórmulas que hagan referencia a la celda activa.'); return; }
      this.traced = list.concat([{ sheet: this.sh.name, r1: me.r, c1: me.c, r2: me.r, c2: me.c, cls: 'tr-self' }]);
      this.render();
      this.wb.auditUsed = true;
      this.changed();
    }
    errorCheck() {
      const errs = [];
      for (const s of this.wb.sheets) for (const a of Object.keys(s.cells)) {
        const p = F.parseAddr(a);
        const v = this.wb.getValue(s.name, p.r, p.c);
        if (F.isErr(v)) errs.push({ sheet: s.name, a, p, v });
      }
      this.wb.auditUsed = true;
      if (!errs.length) { this.alert('Se completó la comprobación de errores de toda la hoja.\nNo se encontraron errores.'); return; }
      const body = el('div', 'xl-list');
      body.innerHTML = '<table><tr><th>Celda</th><th>Error</th><th>Fórmula</th><th></th></tr></table>';
      const t = body.querySelector('table');
      let m;
      for (const e of errs) {
        const tr = el('tr', null, '<td>' + esc(e.sheet + '!' + e.a) + '</td><td class="errc">' + esc(e.v.code) + '</td><td><code>' + esc(U.inputText(this.wb.sheet(e.sheet).cells[e.a])) + '</code></td>');
        const td = el('td');
        const go = el('button', null, 'Ir a');
        go.type = 'button';
        go.onclick = () => {
          m.close();
          const i = this.wb.sheets.findIndex((s) => s.name === e.sheet);
          this.wb.active = i;
          this.render();
          this.select(e.p.r, e.p.c);
        };
        td.appendChild(go);
        tr.appendChild(td);
        t.appendChild(tr);
      }
      const desc = { '#¡DIV/0!': 'División por cero', '#N/A': 'Valor no disponible (búsqueda sin resultado)', '#¡VALOR!': 'Tipo de dato incorrecto', '#¡REF!': 'Referencia no válida', '#¿NOMBRE?': 'Nombre o función no reconocida' };
      body.appendChild(el('p', 'muted', Array.from(new Set(errs.map((e) => e.v.code))).map((c) => '<b>' + esc(c) + '</b>: ' + esc(desc[c] || '')).join('<br>')));
      m = this.modal('Comprobación de errores', body, [{ label: 'Cerrar', value: 'ok', primary: true }], null, { width: 560 });
    }

    /* ----------------------- Escenarios ----------------------- */
    scenarioManager() {
      const body = el('div', 'xl-scen');
      let m;
      const draw = () => {
        const list = this.wb.scenarios;
        body.innerHTML = '<div class="cols"><div class="lst"></div><div class="btns"></div></div><div class="info muted"></div>';
        const lst = body.querySelector('.lst');
        if (!list.length) lst.innerHTML = '<p class="muted">No hay escenarios definidos. Elija Agregar para agregar escenarios.</p>';
        list.forEach((sc, i) => {
          const it = el('div', 'it' + (this.scenSel === i ? ' on' : ''), esc(sc.name));
          it.onclick = () => { this.scenSel = i; draw(); };
          it.ondblclick = () => { this.scenSel = i; show(); };
          lst.appendChild(it);
        });
        const sc = list[this.scenSel];
        if (sc) body.querySelector('.info').innerHTML = 'Celdas cambiantes: ' + esc(sc.cells.join(';')) + '<br>Valores: ' + esc(sc.values.join(' ; '));
        const btns = body.querySelector('.btns');
        const mk = (label, fn) => { const b = el('button', null, label); b.type = 'button'; b.onclick = fn; btns.appendChild(b); };
        mk('Agregar…', () => add());
        mk('Eliminar', () => { if (sc) { this.mutate(() => { this.wb.scenarios.splice(this.scenSel, 1); }); this.scenSel = 0; draw(); } });
        mk('Modificar…', () => { if (sc) add(sc); });
        mk('Resumen…', summary);
        mk('Mostrar', show);
      };
      const show = () => {
        const sc = this.wb.scenarios[this.scenSel];
        if (!sc) return;
        const i = this.wb.sheets.findIndex((s) => s.name.toLowerCase() === sc.sheet.toLowerCase());
        if (i >= 0) this.wb.active = i;
        this.mutate(() => { this.wb.showScenario(sc.name); });
        this.toast('Escenario «' + sc.name + '» mostrado.');
      };
      const add = async (existing) => {
        m.ov.style.display = 'none';
        const v = await this.form(existing ? 'Modificar escenario' : 'Agregar escenario', [
          { name: 'name', label: 'Nombre del escenario', value: existing ? existing.name : '' },
          { name: 'cells', label: 'Celdas cambiantes', type: 'range', value: existing ? existing.cells.join(';') : this.selStr(false), sheetPrefix: false, help: 'Rango contiguo (Ej.: B1:B2) o celdas separadas por ";" (Ej.: B1;B3).' },
        ], {
          validate: (x) => {
            if (!x.name.trim()) return 'Escriba un nombre.';
            if (!existing && this.wb.scenarios.some((s) => s.name.toLowerCase() === x.name.trim().toLowerCase())) return 'Ya existe un escenario con ese nombre.';
            if (!this.parseCellList(x.cells).length) return 'Las celdas cambiantes no son válidas.';
            return null;
          },
        });
        if (!v) { m.ov.style.display = ''; this.modalOpen = true; return; }
        const cells = this.parseCellList(v.cells);
        const fields = cells.map((a, k) => ({ name: 'v' + k, label: (k + 1) + ': ' + a, value: existing && existing.values[k] != null ? String(existing.values[k]) : U.inputText(this.sh.cells[a]) }));
        const vals = await this.form('Valores del escenario', [{ type: 'info', text: 'Introduzca valores para cada celda cambiante.' }, ...fields]);
        if (vals) {
          this.mutate(() => {
            const rec = { name: v.name.trim(), sheet: this.sh.name, cells, values: cells.map((a, k) => vals['v' + k]) };
            if (existing) Object.assign(existing, rec); else this.wb.scenarios.push(rec);
          }, { allowProtected: true });
          this.scenSel = this.wb.scenarios.length - 1;
        }
        m.ov.style.display = '';
        this.modalOpen = true;
        draw();
      };
      const summary = async () => {
        if (!this.wb.scenarios.length) return;
        m.ov.style.display = 'none';
        const v = await this.form('Resumen del escenario', [{ name: 'res', label: 'Celdas de resultado', type: 'range', value: '', sheetPrefix: false }]);
        m.ov.style.display = '';
        this.modalOpen = true;
        if (!v) return;
        const res = this.parseCellList(v.res);
        this.mutate(() => {
          const base = this.wb.sheet(this.wb.scenarios[0].sheet);
          const snapshot = {};
          const allCells = Array.from(new Set(this.wb.scenarios.flatMap((s) => s.cells)));
          allCells.forEach((a) => { snapshot[a] = base.cells[a] ? JSON.parse(JSON.stringify(base.cells[a])) : null; });
          const results = this.wb.scenarios.map((sc) => {
            sc.cells.forEach((a, k) => { const p = F.parseAddr(a); this.wb.setInput(base, p.r, p.c, sc.values[k]); });
            return { ch: sc.cells.map((a) => this.wb.value(base, a)), res: res.map((a) => this.wb.value(base, a)) };
          });
          allCells.forEach((a) => { if (snapshot[a]) base.cells[a] = snapshot[a]; else delete base.cells[a]; });
          this.wb.invalidate();
          const i = this.wb.addSheet('Resumen de escenario');
          const ns = this.wb.sheets[i];
          const put = (r, c, val, st) => { ns.cells[F.addr(r, c)] = { input: val }; if (st) ns.cells[F.addr(r, c)].style = st; };
          put(0, 0, 'Resumen de escenario', { bold: true });
          this.wb.scenarios.forEach((sc, k) => put(1, 2 + k, sc.name, { bold: true, fill: '#dce6f1' }));
          put(2, 0, 'Celdas cambiantes:', { bold: true });
          let row = 3;
          const cellsOrder = this.wb.scenarios[0].cells;
          cellsOrder.forEach((a, j) => { put(row, 1, a); results.forEach((rr, k) => put(row, 2 + k, rr.ch[j] ?? '')); row++; });
          put(row++, 0, 'Celdas de resultado:', { bold: true });
          res.forEach((a, j) => { put(row, 1, a); results.forEach((rr, k) => put(row, 2 + k, rr.res[j] ?? '')); row++; });
          ns.colW[0] = 150;
          this.wb.active = i;
        }, { allowProtected: true });
        m.close();
      };
      draw();
      m = this.modal('Administrador de escenarios', body, [{ label: 'Cerrar', value: 'ok', primary: true }], null, { width: 520 });
    }
    parseCellList(txt) {
      const out = [];
      for (const part of String(txt).split(/[;,]/)) {
        const rg = F.parseRange(part.trim());
        if (!rg) continue;
        for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) out.push(F.addr(r, c));
      }
      return out;
    }

    async formatCellsDialog() {
      const st = this.curStyle();
      const colorOpts = [['', '(sin cambio)'], ['none', 'Sin color / Automático'], ['#ffff00', 'Amarillo'], ['#ffc000', 'Naranjo'], ['#ff0000', 'Rojo'], ['#c00000', 'Rojo oscuro'], ['#92d050', 'Verde claro'], ['#00b050', 'Verde'], ['#00b0f0', 'Celeste'], ['#0070c0', 'Azul'], ['#7030a0', 'Morado'], ['#dce6f1', 'Azul pálido'], ['#e2efda', 'Verde pálido'], ['#d9d9d9', 'Gris'], ['#000000', 'Negro'], ['#ffffff', 'Blanco']];
      const v = await this.form('Formato de celdas', [
        { name: 'fmt', label: 'Número — Categoría', type: 'select', value: st.fmt || 'general', options: [['general', 'General'], ['number', 'Número'], ['currency', 'Moneda'], ['percent', 'Porcentaje'], ['date', 'Fecha'], ['text', 'Texto']] },
        { name: 'dec', label: 'Posiciones decimales', type: 'number', value: st.dec != null ? st.dec : '', placeholder: 'predeterminado', show: (x) => ['number', 'currency', 'percent', 'general'].includes(x.fmt) },
        { name: 'align', label: 'Alineación horizontal', type: 'select', value: st.align || '', options: [['', 'General'], ['left', 'Izquierda'], ['center', 'Centrar'], ['right', 'Derecha']] },
        { name: 'bold', label: 'Negrita', type: 'checkbox', value: !!st.bold },
        { name: 'italic', label: 'Cursiva', type: 'checkbox', value: !!st.italic },
        { name: 'underline', label: 'Subrayado', type: 'checkbox', value: !!st.underline },
        { name: 'color', label: 'Fuente — Color', type: 'select', value: '', options: colorOpts },
        { name: 'fill', label: 'Relleno — Color de fondo', type: 'select', value: '', options: colorOpts },
        { name: 'border', label: 'Bordes', type: 'select', value: st.border ? 'all' : 'none', options: [['none', 'Ninguno'], ['all', 'Todos los bordes']] },
      ], { validate: (x) => (x.dec !== '' && (isNaN(+x.dec) || +x.dec < 0 || +x.dec > 10) ? 'Las posiciones decimales deben estar entre 0 y 10.' : null) });
      if (!v) return;
      const patch = { fmt: v.fmt === 'general' ? null : v.fmt, dec: v.dec === '' ? null : +v.dec, align: v.align || null, bold: v.bold, italic: v.italic, underline: v.underline, border: v.border === 'all' };
      if (v.color) patch.color = v.color === 'none' ? null : v.color;
      if (v.fill) patch.fill = v.fill === 'none' ? null : v.fill;
      this.styleCmd(patch);
    }

    /* ----------------------- Macros (VBA) ----------------------- */
    recLine(...lines) { if (this.recording && !this.runningMacro) { this.recording.lines.push(...lines); this.recording.lastWasSelect = false; } }
    recSelect() {
      const R = this.recording;
      if (!R || this.runningMacro || this.editing) return;
      const s = this.sel;
      const key = this.wb.active + ':' + F.rangeToStr(s);
      if (R.lastSelKey === key) return;
      R.lastSelKey = key;
      let base;
      if (R.lastWasSelect) { R.lines.pop(); base = R.baseBeforeLast; } else base = R.curAct;
      R.baseBeforeLast = base;
      const size = F.rangeToStr({ r1: 0, c1: 0, r2: s.r2 - s.r1, c2: s.c2 - s.c1 });
      let line;
      if (R.relative) {
        const dr = s.r1 - base.r; const dc = s.c1 - base.c;
        line = 'ActiveCell.' + (dr || dc ? 'Offset(' + dr + ', ' + dc + ').' : '') + 'Range("' + size + '").Select';
      } else line = 'Range("' + F.rangeToStr(s) + '").Select';
      R.lines.push(line);
      R.lastWasSelect = true;
      R.curAct = { r: s.r1, c: s.c1 };
    }
    async recordMacro() {
      if (this.recording) {
        const rec = this.recording;
        this.recording = null;
        const body = rec.lines.map((l) => '    ' + l).join('\n');
        const code = 'Sub ' + rec.name + '()\n\'\n\' ' + rec.name + ' Macro\n' + (rec.desc ? "' " + rec.desc.replace(/\n/g, ' ') + '\n' : '') + "'\n" + (body ? body + '\n' : '') + 'End Sub';
        this.mutate(() => { this.wb.vba = global.XLVBA.upsertSub(this.wb.vba || '', rec.name, code); }, { allowProtected: true });
        this.toast('Macro «' + rec.name + '» grabada. Puede verla en Programador > Visual Basic.');
        return;
      }
      const existing = global.XLVBA.listSubs(this.wb.vba || '');
      const v = await this.form('Grabar macro', [
        { name: 'name', label: 'Nombre de la macro', value: 'Macro' + (existing.length + 1) },
        { name: 'store', label: 'Guardar macro en', type: 'select', options: [['this', 'Este libro']] },
        { name: 'desc', label: 'Descripción', type: 'textarea', rows: 2 },
        { type: 'info', text: this.relRefs ? 'Se grabará con <b>referencias relativas</b>.' : 'Se grabará con referencias absolutas. (Programador &gt; Usar referencias relativas para cambiarlo).' },
      ], { validate: (x) => (!/^[A-Za-zÀ-ÿÑñ][A-Za-zÀ-ÿÑñ0-9_]*$/.test(x.name.trim()) ? 'El nombre de la macro no es válido: debe comenzar con una letra y no puede contener espacios.' : null) });
      if (!v) return;
      this.recording = { name: v.name.trim(), lines: [], desc: v.desc.trim(), relative: !!this.relRefs, curAct: { ...this.act }, lastSelKey: this.wb.active + ':' + F.rangeToStr(this.sel), lastWasSelect: false };
      this.updateRibbonState();
      this.updateStatus();
      this.toast('Grabando… realice las acciones y luego presione "Detener grabación".');
    }
    async runMacro(name) {
      const before = this.snapshot();
      const selBefore = { ...this.sel };
      const sheetBefore = this.sh.name;
      let res = null; let err = null;
      this.runningMacro = true;
      try { res = global.XLVBA.run(this.wb, this.wb.vba || '', name, { sheet: this.sh.name, sel: { ...this.sel }, act: { ...this.act } }); } catch (e) { err = e; }
      this.runningMacro = false;
      this.undo.push(before);
      this.redo = [];
      if (res) {
        const i = this.wb.sheets.findIndex((s) => s.name === res.sheet);
        if (i >= 0) this.wb.active = i;
        this.sel = { ...res.sel };
        this.act = { ...res.act };
        this.anchor = { ...res.act };
        this.wb.macroRuns.push({ name, sheet: sheetBefore, range: F.rangeToStr(selBefore), at: Date.now() });
      }
      this.wb.invalidate();
      this.clampSel();
      this.render();
      this.changed();
      if (err) {
        await this.alert((err.line ? 'Línea ' + err.line + ': ' : '') + err.message + '\n\nAbra Programador > Visual Basic para revisar el código.', 'Microsoft Visual Basic para Aplicaciones');
        return false;
      }
      for (const msg of res.msgs) await this.alert(msg, 'Microsoft Excel');
      if (!res.msgs.length) this.toast('Macro «' + name + '» ejecutada.');
      return true;
    }
    macroDialog() {
      const body = el('div', 'xl-scen');
      let selIdx = 0;
      let m;
      const list = () => global.XLVBA.listSubs(this.wb.vba || '');
      const draw = () => {
        const subs = list();
        body.innerHTML = '<div class="row"><label>Nombre de la macro</label><input class="mname nokey" value="' + esc(subs[selIdx] || '') + '"></div><div class="cols"><div class="lst"></div><div class="btns"></div></div>';
        const lst = body.querySelector('.lst');
        if (!subs.length) lst.innerHTML = '<p class="muted">No hay macros en este libro. Use Programador &gt; Grabar macro, o escriba un nombre y presione Crear.</p>';
        subs.forEach((n, i) => {
          const it = el('div', 'it' + (i === selIdx ? ' on' : ''), esc(n));
          it.onclick = () => { selIdx = i; draw(); };
          it.ondblclick = () => { selIdx = i; run(); };
          lst.appendChild(it);
        });
        const btns = body.querySelector('.btns');
        const mk = (label, fn) => { const b = el('button', null, label); b.type = 'button'; b.onclick = fn; btns.appendChild(b); };
        mk('Ejecutar', run);
        mk('Modificar', () => { const n = list()[selIdx]; if (n) { m.close(); this.vbaDialog(n); } });
        mk('Crear', () => {
          const n = body.querySelector('.mname').value.trim();
          if (!/^[A-Za-zÀ-ÿÑñ][A-Za-zÀ-ÿÑñ0-9_]*$/.test(n)) { this.toast('Escriba un nombre válido (sin espacios) para la macro.'); return; }
          if (!list().some((x) => x.toLowerCase() === n.toLowerCase())) this.mutate(() => { this.wb.vba = global.XLVBA.upsertSub(this.wb.vba || '', n, 'Sub ' + n + '()\n\n    \nEnd Sub'); }, { allowProtected: true });
          m.close();
          this.vbaDialog(n);
        });
        mk('Eliminar', () => { const n = list()[selIdx]; if (n) { this.mutate(() => { this.wb.vba = global.XLVBA.removeSub(this.wb.vba || '', n); }, { allowProtected: true }); selIdx = 0; draw(); } });
      };
      const run = () => {
        const typed = body.querySelector('.mname').value.trim();
        const n = list().find((x) => x.toLowerCase() === typed.toLowerCase()) || list()[selIdx];
        if (!n) return;
        m.close();
        this.runMacro(n);
      };
      draw();
      m = this.modal('Macro', body, [{ label: 'Cancelar', value: 'cancel' }], null, { width: 480 });
    }
    vbaDialog(focusName) {
      const body = el('div', 'xl-vba');
      const subs = global.XLVBA.listSubs(this.wb.vba || '');
      body.innerHTML = '<div class="proj"><b>VBAProject (Libro1)</b><br>📁 Microsoft Excel Objetos<br>&nbsp;&nbsp;' + this.wb.sheets.map((s, i) => '📄 Hoja' + (i + 1) + ' (' + esc(s.name) + ')').join('<br>&nbsp;&nbsp;') + '<br>📁 Módulos<br>&nbsp;&nbsp;📄 Módulo1<div class="subs">' + (subs.length ? '<b>Procedimientos</b><br>' + subs.map((s) => esc(s)).join('<br>') : '') + '</div></div>' +
        '<div class="ed"><textarea class="code nokey" spellcheck="false" wrap="off"></textarea><div class="vstatus"></div>' +
        '<details class="vref"><summary>Referencia rápida de VBA</summary><pre>Range("A1").Value = 100          \' escribir un valor\nRange("B2").Formula = "=SUM(A1:A5)"\nSelection.Font.Bold = True\nSelection.Interior.Color = RGB(255, 255, 0)\nSelection.HorizontalAlignment = xlCenter\nRange("C2:C9").NumberFormat = "$ #,##0"\nCells(i, 2).Value              \' fila i, columna 2\nFor i = 2 To 10 ... Next i\nFor Each celda In Range("B2:B10") ... Next celda\nIf celda.Value > 100 Then ... ElseIf ... Else ... End If\nWith Selection.Font ... End With\nMsgBox "Listo"</pre></details></div>';
      const ta = body.querySelector('.code');
      const status = body.querySelector('.vstatus');
      ta.value = this.wb.vba && this.wb.vba.trim() ? this.wb.vba : "' Módulo1\n' Escriba aquí sus macros. Ejemplo:\n\nSub MiMacro()\n    Range(\"A1\").Value = \"Hola\"\nEnd Sub\n";
      const save = () => {
        const code = ta.value;
        if (code !== (this.wb.vba || '')) this.mutate(() => { this.wb.vba = code; }, { allowProtected: true });
        const e = global.XLVBA.check(code);
        status.textContent = e ? '⚠ ' + (e.line ? 'Línea ' + e.line + ': ' : '') + e.message : '✓ Sin errores de compilación. Módulo guardado.';
        status.className = 'vstatus ' + (e ? 'bad' : 'ok');
        return !e;
      };
      const subAtCaret = () => {
        const before = ta.value.slice(0, ta.selectionStart);
        const all = [...before.matchAll(/^\s*(?:(?:Public|Private)\s+)?Sub\s+([A-Za-zÀ-ÿÑñ_][A-Za-zÀ-ÿÑñ0-9_]*)/gim)];
        if (all.length) return all[all.length - 1][1];
        return global.XLVBA.listSubs(ta.value)[0];
      };
      const runIt = () => {
        if (!save()) return false;
        const n = subAtCaret();
        if (!n) { status.textContent = 'No hay ninguna macro (Sub) para ejecutar.'; status.className = 'vstatus bad'; return false; }
        dlg.close();
        this.runMacro(n);
        return true;
      };
      ta.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('    ', s, ta.selectionEnd, 'end'); }
        else if (e.key === 'F5') { e.preventDefault(); runIt(); }
        else if (e.key === 'Escape') { e.preventDefault(); save(); dlg.close(); }
        else if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
      });
      const dlg = this.modal('Microsoft Visual Basic para Aplicaciones - Libro1 - [Módulo1 (Código)]', body, [
        { label: '▶ Ejecutar macro (F5)', value: 'run', left: true },
        { label: 'Guardar', value: 'save' },
        { label: 'Cerrar', value: 'ok', primary: true },
      ], (b) => {
        if (b === 'run') { runIt(); return true; }
        if (b === 'save') { save(); return false; }
        save();
        return true;
      }, { width: 900 });
      setTimeout(() => {
        ta.focus();
        if (focusName) {
          const idx = ta.value.search(new RegExp('Sub\\s+' + focusName + '\\s*\\(', 'i'));
          if (idx >= 0) { const nl = ta.value.indexOf('\n', idx); ta.setSelectionRange(nl + 1, nl + 1); ta.scrollTop = Math.max(0, ta.value.slice(0, idx).split('\n').length * 17 - 40); }
        } else ta.setSelectionRange(0, 0);
      }, 10);
    }

    /* ----------------------- Controles de formulario ----------------------- */
    async controlDialog(type, existing, idx) {
      const cur = existing || {};
      const fields = [];
      if (type === 'combo') fields.push({ name: 'range', label: 'Rango de entrada', type: 'range', value: cur.range || '', sheetPrefix: false, help: 'Celdas que contienen los elementos de la lista (Ej.: $A$2:$A$6).' });
      if (type === 'check') fields.push({ name: 'label', label: 'Texto', value: cur.label || 'Casilla 1' });
      if (type === 'spin') {
        fields.push({ name: 'min', label: 'Valor mínimo', type: 'number', value: cur.min ?? 0 });
        fields.push({ name: 'max', label: 'Valor máximo', type: 'number', value: cur.max ?? 100 });
        fields.push({ name: 'step', label: 'Incremento', type: 'number', value: cur.step ?? 1 });
      }
      fields.push({ name: 'link', label: 'Vincular con la celda', type: 'range', value: cur.link || '', sheetPrefix: false });
      const title = { combo: 'Formato de control — Cuadro combinado', check: 'Formato de control — Casilla de verificación', spin: 'Formato de control — Control de número' }[type];
      const v = await this.form(title, fields, {
        validate: (x) => {
          if (type === 'combo' && !this.parseRangeIn(x.range)) return 'El rango de entrada no es válido.';
          if (!F.parseRange(x.link)) return 'Indique una celda vinculada válida (Ej.: $E$2).';
          if (type === 'spin' && (isNaN(+x.min) || isNaN(+x.max) || +x.min >= +x.max)) return 'Los valores mínimo y máximo no son válidos.';
          return null;
        },
      });
      if (!v) return;
      const link = v.link.trim().replace(/^=/, '');
      this.mutate(() => {
        const rec = { type, link: F.rangeToStr(F.parseRange(link)) };
        if (type === 'combo') rec.range = F.rangeToStr(F.parseRange(v.range));
        if (type === 'check') rec.label = v.label;
        if (type === 'spin') { rec.min = +v.min; rec.max = +v.max; rec.step = +v.step || 1; }
        if (existing) Object.assign(existing, rec);
        else {
          const rc = this.cellRect(this.act.r, this.act.c);
          rec.x = rc ? rc.left : 100;
          rec.y = rc ? rc.top : 100;
          this.sh.controls.push(rec);
        }
      });
    }
  }

  function niceStep(x) {
    if (x <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(x)));
    const m = x / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  }

  global.XLSheetUI = SheetUI;
  global.XL_CF_FORMATS = CF_FORMATS;
})(window);
