/* =========================================================================
 * Intérprete de VBA (subconjunto) para las macros del simulador
 * Soporta: Sub/End Sub, Dim, Set, With, For/Next, For Each, If/ElseIf/Else,
 * Do/Loop, Exit, Call, MsgBox, Range/Cells/Selection/ActiveCell/Sheets,
 * Value/Formula, Font, Interior, Borders, HorizontalAlignment, NumberFormat,
 * Offset/Resize, Copy, ClearContents, WorksheetFunction, funciones VBA comunes.
 * ========================================================================= */
(function (global) {
  'use strict';
  const F = global.XLF;

  class VBAError extends Error {
    constructor(msg, line, code) { super(msg); this.line = line; this.code = code || 1004; }
  }

  /* ----------------------------- Constantes ----------------------------- */
  const CONSTS = {
    VBRED: 255, VBGREEN: 65280, VBBLUE: 16711680, VBYELLOW: 65535, VBWHITE: 16777215, VBBLACK: 0, VBCYAN: 16776960, VBMAGENTA: 16711935,
    XLCENTER: -4108, XLLEFT: -4131, XLRIGHT: -4152, XLGENERAL: 1, XLCONTINUOUS: 1, XLNONE: -4142, XLSOLID: 1, XLAUTOMATIC: -4105,
    XLUNDERLINESTYLESINGLE: 2, XLUNDERLINESTYLENONE: -4142, XLTHIN: 2, XLMEDIUM: -4138, XLTHICK: 4,
    XLUP: -4162, XLDOWN: -4121, XLTOLEFT: -4159, XLTORIGHT: -4161,
    XLEDGELEFT: 7, XLEDGETOP: 8, XLEDGEBOTTOM: 9, XLEDGERIGHT: 10, XLINSIDEVERTICAL: 11, XLINSIDEHORIZONTAL: 12,
    VBCRLF: '\r\n', VBNEWLINE: '\n', VBTAB: '\t', VBOKONLY: 0, VBINFORMATION: 64, VBEXCLAMATION: 48, VBCRITICAL: 16,
    TRUE: true, FALSE: false, NOTHING: null, EMPTY: null,
  };
  const COLOR_INDEX = [null, '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080'];
  const bgrToHex = (n) => { n = Number(n) || 0; const r = n & 255; const g = (n >> 8) & 255; const b = (n >> 16) & 255; return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join(''); };
  const hexToBgr = (h) => { if (!h) return 16777215; const n = parseInt(h.slice(1), 16); return ((n >> 16) & 255) + (((n >> 8) & 255) << 8) + ((n & 255) << 16); };

  /* ----------------------------- Léxico ----------------------------- */
  function lex(src, line) {
    const t = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if (ch === "'") break;
      if (ch === '"') {
        let j = i + 1; let s = '';
        while (j < src.length) { if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; } s += src[j++]; }
        if (j >= src.length) throw new VBAError('Error de compilación: falta la comilla de cierre.', line);
        t.push({ k: 'str', v: s }); i = j + 1; continue;
      }
      let m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      if (m && !(ch === '.' && t.length && ['id', ')'].includes(t[t.length - 1].k))) { t.push({ k: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      m = /^&H([0-9A-Fa-f]+)&?/.exec(src.slice(i));
      if (m) { t.push({ k: 'num', v: parseInt(m[1], 16) }); i += m[0].length; continue; }
      m = /^[A-Za-zÀ-ÿÑñ_][A-Za-zÀ-ÿÑñ0-9_]*/.exec(src.slice(i));
      if (m) { t.push({ k: 'id', v: m[0], u: F.normName(m[0]) }); i += m[0].length; continue; }
      const two = src.substr(i, 2);
      if ([':=', '<=', '>=', '<>'].includes(two)) { t.push({ k: 'op', v: two }); i += 2; continue; }
      if ('=<>+-*/\\^&(),.:'.includes(ch)) { t.push({ k: ch === '(' || ch === ')' ? ch : 'op', v: ch }); i++; continue; }
      if (ch === '#' || ch === '!' || ch === '$' || ch === '%') { i++; continue; }
      throw new VBAError('Error de compilación: carácter no válido "' + ch + '".', line);
    }
    return t;
  }

  /* ----------------------------- Parser ----------------------------- */
  class P {
    constructor(toks, line) { this.t = toks; this.p = 0; this.line = line; }
    peek(o = 0) { return this.t[this.p + o]; }
    eof() { return this.p >= this.t.length; }
    isId(u, o = 0) { const k = this.peek(o); return k && k.k === 'id' && k.u === u; }
    isOp(v, o = 0) { const k = this.peek(o); return k && (k.k === 'op' || k.k === '(' || k.k === ')') && k.v === v; }
    next() { return this.t[this.p++]; }
    expectOp(v) { if (!this.isOp(v)) throw new VBAError('Error de compilación: se esperaba "' + v + '".', this.line); this.p++; }
    expr() { return this.or(); }
    or() { let a = this.and(); while (this.isId('OR') || this.isId('XOR')) { const op = this.next().u; a = { t: 'bin', op, a, b: this.and() }; } return a; }
    and() { let a = this.not(); while (this.isId('AND')) { this.p++; a = { t: 'bin', op: 'AND', a, b: this.not() }; } return a; }
    not() { if (this.isId('NOT')) { this.p++; return { t: 'un', op: 'NOT', a: this.not() }; } return this.cmp(); }
    cmp() {
      let a = this.cat();
      while (['=', '<>', '<', '>', '<=', '>='].some((o) => this.isOp(o)) || this.isId('LIKE') || this.isId('IS')) { const k = this.next(); a = { t: 'bin', op: k.k === 'id' ? k.u : k.v, a, b: this.cat() }; }
      return a;
    }
    cat() { let a = this.add(); while (this.isOp('&')) { this.p++; a = { t: 'bin', op: '&', a, b: this.add() }; } return a; }
    add() { let a = this.mod(); while (this.isOp('+') || this.isOp('-')) { const op = this.next().v; a = { t: 'bin', op, a, b: this.mod() }; } return a; }
    mod() { let a = this.idiv(); while (this.isId('MOD')) { this.p++; a = { t: 'bin', op: 'MOD', a, b: this.idiv() }; } return a; }
    idiv() { let a = this.mul(); while (this.isOp('\\')) { this.p++; a = { t: 'bin', op: '\\', a, b: this.mul() }; } return a; }
    mul() { let a = this.neg(); while (this.isOp('*') || this.isOp('/')) { const op = this.next().v; a = { t: 'bin', op, a, b: this.neg() }; } return a; }
    neg() { if (this.isOp('-')) { this.p++; return { t: 'un', op: '-', a: this.neg() }; } if (this.isOp('+')) { this.p++; return this.neg(); } return this.pow(); }
    pow() { let a = this.postfix(); while (this.isOp('^')) { this.p++; a = { t: 'bin', op: '^', a, b: this.postfix() }; } return a; }
    args() {
      const out = [];
      if (this.isOp(')')) { this.p++; return out; }
      for (;;) {
        if (this.peek() && this.peek().k === 'id' && this.isOp(':=', 1)) { const name = this.next().u; this.p++; out.push({ named: name, e: this.expr() }); } else if (this.isOp(',') || this.isOp(')')) out.push({ e: null }); else out.push({ e: this.expr() });
        if (this.isOp(',')) { this.p++; continue; }
        this.expectOp(')');
        return out;
      }
    }
    postfix() {
      let node;
      const k = this.peek();
      if (!k) throw new VBAError('Error de compilación: expresión incompleta.', this.line);
      if (k.k === 'num') { this.p++; node = { t: 'lit', v: k.v }; } else if (k.k === 'str') { this.p++; node = { t: 'lit', v: k.v }; } else if (k.k === '(') { this.p++; node = { t: 'paren', a: this.expr() }; this.expectOp(')'); } else if (this.isOp('.')) { this.p++; const id = this.next(); if (!id || id.k !== 'id') throw new VBAError('Error de compilación: se esperaba un nombre después de ".".', this.line); node = { t: 'with', name: id.u, raw: id.v }; } else if (k.k === 'id') { this.p++; node = { t: 'id', name: k.u, raw: k.v }; } else throw new VBAError('Error de compilación: símbolo inesperado "' + k.v + '".', this.line);
      for (;;) {
        if (this.peek() && this.peek().k === '(') { this.p++; node = { t: 'call', obj: node, args: this.args() }; continue; }
        if (this.isOp('.')) { this.p++; const id = this.next(); if (!id || id.k !== 'id') throw new VBAError('Error de compilación: se esperaba un nombre después de ".".', this.line); node = { t: 'mem', obj: node, name: id.u, raw: id.v }; continue; }
        break;
      }
      return node;
    }
  }

  function splitLines(code) {
    const raw = String(code || '').replace(/\r/g, '').split('\n');
    const out = [];
    let buf = ''; let start = 0;
    raw.forEach((l, i) => {
      if (!buf) start = i + 1;
      if (/\s_\s*$/.test(l)) { buf += l.replace(/\s_\s*$/, ' '); return; }
      buf += l;
      out.push({ text: buf, line: start });
      buf = '';
    });
    if (buf) out.push({ text: buf, line: start });
    return out;
  }
  const stripComment = (s) => {
    let inS = false;
    for (let i = 0; i < s.length; i++) { if (s[i] === '"') inS = !inS; else if (s[i] === "'" && !inS) return s.slice(0, i); }
    return s;
  };

  /** Divide el módulo en procedimientos */
  function parseModule(code) {
    const lines = splitLines(code);
    const subs = {};
    let cur = null;
    for (const ln of lines) {
      const s = stripComment(ln.text).trim();
      if (!s) continue;
      const m = /^(?:(?:Public|Private)\s+)?Sub\s+([A-Za-zÀ-ÿÑñ_][A-Za-zÀ-ÿÑñ0-9_]*)\s*\(\s*\)\s*$/i.exec(s);
      if (m) {
        if (cur) throw new VBAError('Error de compilación: se esperaba End Sub antes de "Sub ' + m[1] + '".', ln.line);
        cur = { name: m[1], line: ln.line, lines: [] };
        continue;
      }
      if (/^End\s+Sub$/i.test(s)) {
        if (!cur) throw new VBAError('Error de compilación: End Sub sin Sub.', ln.line);
        cur.body = parseBlock(cur.lines, 0, [], cur.name).body;
        subs[F.normName(cur.name)] = cur;
        cur = null;
        continue;
      }
      if (cur) { for (const part of splitColon(s)) cur.lines.push({ text: part, line: ln.line }); } else if (!/^(Option|Dim|Public|Private|Const)\b/i.test(s)) throw new VBAError('Error de compilación: instrucción fuera de un procedimiento (Sub).', ln.line);
    }
    if (cur) throw new VBAError('Error de compilación: falta End Sub en "' + cur.name + '".', cur.line);
    return subs;
  }
  function splitColon(s) {
    const out = []; let inS = false; let depth = 0; let last = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '"') inS = !inS;
      else if (!inS && c === '(') depth++;
      else if (!inS && c === ')') depth--;
      else if (!inS && depth === 0 && c === ':' && s[i + 1] !== '=') { out.push(s.slice(last, i).trim()); last = i + 1; }
    }
    out.push(s.slice(last).trim());
    return out.filter(Boolean);
  }

  function parseBlock(lines, i, terms, subName) {
    const body = [];
    while (i < lines.length) {
      const { text, line } = lines[i];
      const u = text.toUpperCase().replace(/\s+/g, ' ');
      if (terms.some((t) => u === t || u.startsWith(t + ' ') || (t === 'LOOP' && u.startsWith('LOOP')))) return { body, i, term: u, line };
      i++;
      const toks = lex(text, line);
      if (!toks.length) continue;
      const p = new P(toks, line);
      const k0 = toks[0].k === 'id' ? toks[0].u : null;
      if (k0 === 'DIM' || k0 === 'OPTION' || k0 === 'REDIM' || k0 === 'STATIC') continue;
      if (k0 === 'ON' && /ON ERROR/.test(u)) { body.push({ t: 'onerror', resume: /RESUME NEXT/.test(u), line }); continue; }
      if (k0 === 'WITH') { p.p = 1; const obj = p.expr(); const r = parseBlock(lines, i, ['END WITH'], subName); if (!r.term) throw new VBAError('Error de compilación: falta End With.', line); i = r.i + 1; body.push({ t: 'with', obj, body: r.body, line }); continue; }
      if (k0 === 'FOR' && toks[1] && toks[1].k === 'id' && toks[1].u === 'EACH') {
        const v = toks[2]; if (!v || v.k !== 'id' || !(toks[3] && toks[3].k === 'id' && toks[3].u === 'IN')) throw new VBAError('Error de compilación: sintaxis de For Each no válida.', line);
        p.p = 4; const coll = p.expr();
        const r = parseBlock(lines, i, ['NEXT'], subName); if (!r.term) throw new VBAError('Error de compilación: For sin Next.', line); i = r.i + 1;
        body.push({ t: 'foreach', v: v.u, coll, body: r.body, line }); continue;
      }
      if (k0 === 'FOR') {
        const v = toks[1]; if (!v || v.k !== 'id' || !p.isOp('=', 2)) throw new VBAError('Error de compilación: sintaxis de For no válida (For i = 1 To 10).', line);
        p.p = 3; const from = p.expr();
        if (!p.isId('TO')) throw new VBAError('Error de compilación: se esperaba To.', line);
        p.p++; const to = p.expr(); let step = null;
        if (p.isId('STEP')) { p.p++; step = p.expr(); }
        const r = parseBlock(lines, i, ['NEXT'], subName); if (!r.term) throw new VBAError('Error de compilación: For sin Next.', line); i = r.i + 1;
        body.push({ t: 'for', v: v.u, from, to, step, body: r.body, line }); continue;
      }
      if (k0 === 'DO') {
        let pre = null;
        if (p.isId('WHILE', 1) || p.isId('UNTIL', 1)) { const kind = toks[1].u; p.p = 2; pre = { kind, e: p.expr() }; }
        const r = parseBlock(lines, i, ['LOOP'], subName); if (!r.term) throw new VBAError('Error de compilación: Do sin Loop.', line); i = r.i + 1;
        let post = null;
        const lt = lex(lines[r.i].text, r.line);
        if (lt.length > 1) { const pp = new P(lt, r.line); const kind = lt[1].u; pp.p = 2; post = { kind, e: pp.expr() }; }
        body.push({ t: 'do', pre, post, body: r.body, line }); continue;
      }
      if (k0 === 'WHILE') { p.p = 1; const e = p.expr(); const r = parseBlock(lines, i, ['WEND'], subName); if (!r.term) throw new VBAError('Error de compilación: While sin Wend.', line); i = r.i + 1; body.push({ t: 'do', pre: { kind: 'WHILE', e }, body: r.body, line }); continue; }
      if (k0 === 'IF') {
        const thenIdx = toks.findIndex((x) => x.k === 'id' && x.u === 'THEN');
        if (thenIdx < 0) throw new VBAError('Error de compilación: se esperaba Then.', line);
        const cp = new P(toks.slice(1, thenIdx), line);
        const cond = cp.expr();
        if (thenIdx < toks.length - 1) {
          // If de una línea
          const rest = text.slice(text.toUpperCase().indexOf('THEN') + 4);
          const elseM = /\bElse\b/i.exec(rest);
          const thenPart = elseM ? rest.slice(0, elseM.index) : rest;
          const elsePart = elseM ? rest.slice(elseM.index + 4) : null;
          const tb = parseBlock(splitColon(thenPart).map((x) => ({ text: x, line })), 0, [], subName).body;
          const eb = elsePart ? parseBlock(splitColon(elsePart).map((x) => ({ text: x, line })), 0, [], subName).body : [];
          body.push({ t: 'if', branches: [{ cond, body: tb }], els: eb, line });
          continue;
        }
        const branches = [];
        let els = null;
        let c = cond;
        for (;;) {
          const r = parseBlock(lines, i, ['ELSEIF', 'ELSE', 'END IF', 'ENDIF'], subName);
          if (!r.term) throw new VBAError('Error de compilación: bloque If sin End If.', line);
          i = r.i + 1;
          if (c === 'ELSE') els = r.body; else branches.push({ cond: c, body: r.body });
          if (r.term.startsWith('ELSEIF')) {
            const lt = lex(lines[r.i].text, r.line);
            const ti = lt.findIndex((x) => x.k === 'id' && x.u === 'THEN');
            c = new P(lt.slice(1, ti < 0 ? lt.length : ti), r.line).expr();
            continue;
          }
          if (r.term === 'ELSE') { c = 'ELSE'; continue; }
          break;
        }
        body.push({ t: 'if', branches, els: els || [], line });
        continue;
      }
      if (k0 === 'EXIT') { body.push({ t: 'exit', what: toks[1] ? toks[1].u : 'SUB', line }); continue; }
      if (k0 === 'END' && toks.length === 1) { body.push({ t: 'exit', what: 'SUB', line }); continue; }
      if (['NEXT', 'LOOP', 'WEND', 'END', 'ELSE', 'ELSEIF'].includes(k0)) throw new VBAError('Error de compilación: "' + toks[0].v + (toks[1] ? ' ' + toks[1].v : '') + '" sin bloque de inicio.', line);
      if (k0 === 'CALL') { p.p = 1; const e = p.expr(); body.push({ t: 'expr', e, args: [], line }); continue; }
      if (k0 === 'SET' || k0 === 'LET') p.p = 1;
      if (k0 === 'CONST') { p.p = 1; }
      // asignación o llamada
      const lhs = p.expr();
      if (lhs.t === 'bin' && lhs.op === '=') { body.push({ t: 'assign', lhs: lhs.a, e: lhs.b, line }); if (!p.eof()) throw new VBAError('Error de compilación: fin de instrucción esperado.', line); continue; }
      const args = [];
      while (!p.eof()) {
        if (p.peek().k === 'id' && p.isOp(':=', 1)) { const name = p.next().u; p.p++; args.push({ named: name, e: p.expr() }); } else args.push({ e: p.expr() });
        if (p.isOp(',')) p.p++; else if (!p.eof()) throw new VBAError('Error de compilación: se esperaba "," entre argumentos.', line);
      }
      body.push({ t: 'expr', e: lhs, args, line });
    }
    return { body, i, term: null };
  }

  /* ----------------------------- Ejecución ----------------------------- */
  class ExitSignal { constructor(what) { this.what = what; } }

  function makeRange(sheet, r1, c1, r2, c2) { return { t: 'range', sheet, r1: Math.min(r1, r2), c1: Math.min(c1, c2), r2: Math.max(r1, r2), c2: Math.max(c1, c2) }; }

  function fmtFromNumberFormat(nf) {
    const s = String(nf || '');
    if (/^general$/i.test(s) || s === '') return { fmt: null, dec: null };
    if (s === '@') return { fmt: 'text', dec: null };
    if (/[dmy]/i.test(s) && /[/\-]/.test(s)) return { fmt: 'date', dec: null };
    const dec = (/[.,](0+)/.exec(s) || ['', ''])[1].length;
    if (/%/.test(s)) return { fmt: 'percent', dec };
    if (/\$|€/.test(s)) return { fmt: 'currency', dec };
    return { fmt: 'number', dec };
  }

  function run(wb, code, name, state, opts = {}) {
    const subs = parseModule(code);
    const msgs = [];
    const st = {
      sheet: state.sheet || wb.sheets[wb.active].name,
      sel: state.sel ? { ...state.sel } : { r1: 0, c1: 0, r2: 0, c2: 0 },
      act: state.act ? { ...state.act } : { r: 0, c: 0 },
    };
    let steps = 0;
    const maxSteps = opts.maxSteps || 200000;
    const shOf = (n) => { const s = wb.sheet(n); if (!s) throw new VBAError('Error \'9\' en tiempo de ejecución: subíndice fuera del intervalo (no existe la hoja "' + n + '").', curLine, 9); return s; };
    let curLine = 0;
    const R = (msg) => new VBAError('Error \'1004\' en tiempo de ejecución: ' + msg, curLine);

    const sub = subs[F.normName(name)];
    if (!sub) throw new VBAError('No se encuentra la macro "' + name + '".', 0);

    function cellVal(rg) {
      const v = wb.getValue(rg.sheet, rg.r1, rg.c1);
      if (F.isErr(v)) return v.code;
      return v;
    }
    function toNum(v) {
      if (typeof v === 'number') return v;
      if (typeof v === 'boolean') return v ? -1 : 0;
      if (v == null || v === '') return 0;
      if (v && v.t === 'range') return toNum(cellVal(v));
      const n = F.parseNumberText(String(v).replace(',', '.')) ?? parseFloat(String(v));
      if (isNaN(n)) throw new VBAError('Error \'13\' en tiempo de ejecución: no coinciden los tipos.', curLine, 13);
      return n;
    }
    const prim = (v) => (v && v.t === 'range' ? cellVal(v) : v);
    const toStr = (v) => { v = prim(v); if (v == null) return ''; if (typeof v === 'boolean') return v ? 'Verdadero' : 'Falso'; if (typeof v === 'number') return String(Number(v.toPrecision(15))); return String(v); };
    const toBool = (v) => { v = prim(v); if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; if (v == null || v === '') return false; const u = F.normName(v); if (u === 'TRUE' || u === 'VERDADERO') return true; if (u === 'FALSE' || u === 'FALSO') return false; return toNum(v) !== 0; };
    function compare(a, b) {
      a = prim(a); b = prim(b);
      if (a == null) a = typeof b === 'string' ? '' : 0;
      if (b == null) b = typeof a === 'string' ? '' : 0;
      if (typeof a === 'number' || typeof b === 'number') {
        const x = typeof a === 'number' ? a : F.parseNumberText(String(a));
        const y = typeof b === 'number' ? b : F.parseNumberText(String(b));
        if (x != null && y != null) return x === y ? 0 : x < y ? -1 : 1;
      }
      const x = String(a); const y = String(b);
      return x === y ? 0 : x < y ? -1 : 1;
    }

    function setValue(rg, v, asFormula) {
      v = prim(v);
      const sh = shOf(rg.sheet);
      let input;
      if (v == null || v === '') input = '';
      else if (typeof v === 'number' || typeof v === 'boolean') input = v;
      else input = String(v);
      if (asFormula === 'en' && typeof input === 'string' && input[0] === '=') input = input.replace(/,/g, ';');
      for (let r = rg.r1; r <= Math.min(rg.r2, sh.rows + 200); r++) for (let c = rg.c1; c <= rg.c2; c++) {
        if (rg.r1 !== rg.r2 || rg.c1 !== rg.c2 || true) {
          const val = typeof input === 'string' && input[0] === '=' && (r !== rg.r1 || c !== rg.c1) ? F.shiftFormula(input, r - rg.r1, c - rg.c1) : input;
          wb.setInput(sh, r, c, val);
        }
      }
    }
    const style = (rg, patch) => wb.applyStyle(shOf(rg.sheet), rg, patch);
    const firstStyle = (rg) => { const c = wb.cell(rg.sheet, F.addr(rg.r1, rg.c1)); return (c && c.style) || {}; };

    function rangeFromArgs(base, args, sheetName) {
      const a = args.map((x) => (x.e ? ev(x.e) : null));
      if (a.length === 1) {
        if (a[0] && a[0].t === 'range') return a[0];
        const s = toStr(a[0]);
        const nm = wb.nameRange(s);
        if (nm) return makeRange(nm.sheet, nm.r1, nm.c1, nm.r2, nm.c2);
        const rg = F.parseRange(s);
        if (!rg) throw R('El método Range falló: referencia "' + s + '" no válida.');
        if (base) return makeRange(base.sheet, base.r1 + rg.r1, base.c1 + rg.c1, base.r1 + Math.min(rg.r2, 1048575), base.c1 + rg.c2);
        return makeRange(rg.sheet ? shOf(rg.sheet).name : sheetName, rg.r1, rg.c1, Math.min(rg.r2, shOf(rg.sheet || sheetName).rows - 1), rg.c2);
      }
      if (a.length === 2) {
        const x = a[0] && a[0].t === 'range' ? a[0] : rangeFromArgs(null, [{ e: { t: 'lit', v: toStr(a[0]) } }], sheetName);
        const y = a[1] && a[1].t === 'range' ? a[1] : rangeFromArgs(null, [{ e: { t: 'lit', v: toStr(a[1]) } }], sheetName);
        return makeRange(x.sheet, Math.min(x.r1, y.r1), Math.min(x.c1, y.c1), Math.max(x.r2, y.r2), Math.max(x.c2, y.c2));
      }
      throw R('número de argumentos no válido para Range.');
    }
    function colArg(v) { v = prim(v); if (typeof v === 'number') return v - 1; return F.colToNum(String(v).replace(/\$/g, '')); }
    function cellsFrom(base, args, sheetName) {
      const sh = shOf(base ? base.sheet : sheetName);
      if (!args.length) return makeRange(sh.name, 0, 0, sh.rows - 1, sh.cols - 1);
      const r = toNum(ev(args[0].e)) - 1;
      const c = args[1] ? colArg(ev(args[1].e)) : 0;
      if (r < 0 || c < 0) throw R('el índice de Cells no es válido.');
      return base ? makeRange(base.sheet, base.r1 + r, base.c1 + c, base.r1 + r, base.c1 + c) : makeRange(sh.name, r, c, r, c);
    }
    function colsFrom(base, args, sheetName, rows) {
      const sh = shOf(base ? base.sheet : sheetName);
      if (!args.length) return base ? base : makeRange(sh.name, 0, 0, sh.rows - 1, sh.cols - 1);
      const v = prim(ev(args[0].e));
      if (rows) { const parts = String(v).split(':').map((x) => parseInt(x, 10) - 1); return makeRange(sh.name, parts[0], 0, parts[1] ?? parts[0], sh.cols - 1); }
      const parts = String(v).split(':');
      const a = typeof v === 'number' ? v - 1 : F.colToNum(parts[0]);
      const b = typeof v === 'number' ? a : F.colToNum(parts[1] || parts[0]);
      return makeRange(sh.name, 0, a, sh.rows - 1, b);
    }
    function wsf(fname, args) {
      const f = F.FUNCS[F.normName(({ SUM: 'SUMA', AVERAGE: 'PROMEDIO', COUNT: 'CONTAR', COUNTA: 'CONTARA', COUNTIF: 'CONTAR.SI', SUMIF: 'SUMAR.SI', VLOOKUP: 'BUSCARV', MATCH: 'COINCIDIR', INDEX: 'INDICE', ROUND: 'REDONDEAR' })[fname] || fname)];
      if (!f || f.lazy) throw new VBAError('Error \'438\': el objeto no admite esta propiedad o método (WorksheetFunction.' + fname + ').', curLine, 438);
      const ctx = wb.ctxFor(shOf(st.sheet), 0, 0);
      const vals = args.map((x) => { const v = ev(x.e); return v && v.t === 'range' ? new F.RangeRef(v.sheet, v.r1, v.c1, v.r2, v.c2) : v; });
      let res;
      try { res = f.fn(vals, ctx); } catch (e) { if (F.isErr(e)) throw R('No se puede obtener la propiedad ' + fname + ' de la clase WorksheetFunction.'); throw e; }
      if (res instanceof F.RangeRef) res = wb.getValue(res.sheet, res.r1, res.c1);
      if (F.isErr(res)) throw R('No se puede obtener la propiedad ' + fname + ' de la clase WorksheetFunction.');
      return res;
    }

    const VBAFN = {
      RGB: (a) => (toNum(a[0]) & 255) + ((toNum(a[1]) & 255) << 8) + ((toNum(a[2]) & 255) << 16),
      UCASE: (a) => toStr(a[0]).toUpperCase(), LCASE: (a) => toStr(a[0]).toLowerCase(), LEN: (a) => toStr(a[0]).length,
      LEFT: (a) => toStr(a[0]).slice(0, toNum(a[1])), RIGHT: (a) => { const n = toNum(a[1]); return n ? toStr(a[0]).slice(-n) : ''; },
      MID: (a) => toStr(a[0]).substr(toNum(a[1]) - 1, a[2] == null ? undefined : toNum(a[2])),
      TRIM: (a) => toStr(a[0]).trim(), CSTR: (a) => toStr(a[0]), CINT: (a) => Math.round(toNum(a[0])), CLNG: (a) => Math.round(toNum(a[0])),
      CDBL: (a) => toNum(a[0]), CSNG: (a) => toNum(a[0]), INT: (a) => Math.floor(toNum(a[0])), FIX: (a) => Math.trunc(toNum(a[0])), ABS: (a) => Math.abs(toNum(a[0])),
      ROUND: (a) => F.roundTo(toNum(a[0]), a[1] == null ? 0 : toNum(a[1])), VAL: (a) => parseFloat(toStr(a[0])) || 0, SQR: (a) => Math.sqrt(toNum(a[0])),
      ISEMPTY: (a) => { const v = prim(a[0]); return v == null || v === ''; }, ISNUMERIC: (a) => { const v = prim(a[0]); return typeof v === 'number' || (v != null && v !== '' && !isNaN(Number(String(v).replace(',', '.')))); },
      INSTR: (a) => (a.length >= 3 ? toStr(a[1]).indexOf(toStr(a[2]), toNum(a[0]) - 1) + 1 : toStr(a[0]).indexOf(toStr(a[1])) + 1),
      REPLACE: (a) => toStr(a[0]).split(toStr(a[1])).join(toStr(a[2])),
      NOW: () => F.todaySerial(), DATE: () => F.todaySerial(), FORMAT: (a) => toStr(a[0]), CBOOL: (a) => toBool(a[0]),
      MSGBOX: (a) => { msgs.push(toStr(a[0])); return 1; }, INPUTBOX: () => '',
    };

    const vars = Object.create(null);
    const withStack = [];

    function member(obj, name, args, raw) {
      obj = obj && obj.t === 'collection' ? obj : obj;
      if (obj == null) throw new VBAError('Error \'91\' en tiempo de ejecución: variable de objeto no establecida.', curLine, 91);
      if (obj.t === 'range') {
        switch (name) {
          case 'VALUE': case 'VALUE2': case 'TEXT': return args ? cellVal(obj) : cellVal(obj);
          case 'FORMULA': case 'FORMULALOCAL': { const c = wb.cell(obj.sheet, F.addr(obj.r1, obj.c1)); return c && c.input != null ? c.input : ''; }
          case 'OFFSET': { const a = (args || []).map((x) => (x.e ? toNum(ev(x.e)) : 0)); const r = obj.r1 + (a[0] || 0); const c = obj.c1 + (a[1] || 0); if (r < 0 || c < 0) throw R('Offset fuera de la hoja.'); return makeRange(obj.sheet, r, c, r + obj.r2 - obj.r1, c + obj.c2 - obj.c1); }
          case 'RESIZE': { const a = (args || []).map((x) => (x.e ? toNum(ev(x.e)) : null)); return makeRange(obj.sheet, obj.r1, obj.c1, obj.r1 + (a[0] ?? obj.r2 - obj.r1 + 1) - 1, obj.c1 + (a[1] ?? obj.c2 - obj.c1 + 1) - 1); }
          case 'RANGE': return rangeFromArgs(obj, args || [], obj.sheet);
          case 'CELLS': return cellsFrom(obj, args || [], obj.sheet);
          case 'ROW': return obj.r1 + 1;
          case 'COLUMN': return obj.c1 + 1;
          case 'COUNT': return (obj.r2 - obj.r1 + 1) * (obj.c2 - obj.c1 + 1);
          case 'ROWS': return args && args.length ? makeRange(obj.sheet, obj.r1 + toNum(ev(args[0].e)) - 1, obj.c1, obj.r1 + toNum(ev(args[0].e)) - 1, obj.c2) : { t: 'collection', of: obj, kind: 'rows' };
          case 'COLUMNS': return args && args.length ? makeRange(obj.sheet, obj.r1, obj.c1 + toNum(ev(args[0].e)) - 1, obj.r2, obj.c1 + toNum(ev(args[0].e)) - 1) : { t: 'collection', of: obj, kind: 'cols' };
          case 'ADDRESS': return F.rangeToStr(obj, true);
          case 'ENTIREROW': return makeRange(obj.sheet, obj.r1, 0, obj.r2, shOf(obj.sheet).cols - 1);
          case 'ENTIRECOLUMN': return makeRange(obj.sheet, 0, obj.c1, shOf(obj.sheet).rows - 1, obj.c2);
          case 'CURRENTREGION': { const rg = wb.currentRegion(obj.sheet, obj.r1, obj.c1); return makeRange(obj.sheet, rg.r1, rg.c1, rg.r2, rg.c2); }
          case 'END': {
            const dir = args && args[0] ? toNum(ev(args[0].e)) : CONSTS.XLDOWN;
            const sh = shOf(obj.sheet);
            const filled = (r, c) => { const x = sh.cells[F.addr(r, c)]; return !!(x && x.input != null && x.input !== ''); };
            const d = { [CONSTS.XLDOWN]: [1, 0], [CONSTS.XLUP]: [-1, 0], [CONSTS.XLTORIGHT]: [0, 1], [CONSTS.XLTOLEFT]: [0, -1] }[dir] || [1, 0];
            let r = obj.r1; let c = obj.c1;
            const inb = (rr, cc) => rr >= 0 && cc >= 0 && rr < Math.max(sh.rows, 200) && cc < Math.max(sh.cols, 50);
            if (filled(r, c) && inb(r + d[0], c + d[1]) && filled(r + d[0], c + d[1])) { while (inb(r + d[0], c + d[1]) && filled(r + d[0], c + d[1])) { r += d[0]; c += d[1]; } } else { r += d[0]; c += d[1]; while (inb(r, c) && !filled(r, c)) { r += d[0]; c += d[1]; } if (!inb(r, c)) { r -= d[0]; c -= d[1]; } }
            return makeRange(obj.sheet, r, c, r, c);
          }
          case 'FONT': return { t: 'font', rg: obj };
          case 'INTERIOR': return { t: 'interior', rg: obj };
          case 'BORDERS': return { t: 'borders', rg: obj };
          case 'HORIZONTALALIGNMENT': { const a = firstStyle(obj).align; return a === 'center' ? CONSTS.XLCENTER : a === 'right' ? CONSTS.XLRIGHT : a === 'left' ? CONSTS.XLLEFT : CONSTS.XLGENERAL; }
          case 'NUMBERFORMAT': return firstStyle(obj).fmt || 'General';
          case 'COLUMNWIDTH': return Math.round(((shOf(obj.sheet).colW[obj.c1] || 96) - 5) / 7);
          case 'WORKSHEET': case 'PARENT': return { t: 'sheet', name: obj.sheet };
          case 'SELECT': case 'ACTIVATE': {
            const i = wb.sheets.findIndex((s) => s.name === obj.sheet);
            if (i !== wb.active && name === 'SELECT' && obj.sheet !== st.sheet) throw R('El método Select de la clase Range falló (active primero la hoja).');
            st.sheet = obj.sheet;
            if (name === 'SELECT') st.sel = { r1: obj.r1, c1: obj.c1, r2: obj.r2, c2: obj.c2 };
            st.act = { r: obj.r1, c: obj.c1 };
            if (name === 'ACTIVATE' && !(st.act.r >= st.sel.r1 && st.act.r <= st.sel.r2 && st.act.c >= st.sel.c1 && st.act.c <= st.sel.c2)) st.sel = { r1: obj.r1, c1: obj.c1, r2: obj.r1, c2: obj.c1 };
            return null;
          }
          case 'CLEARCONTENTS': wb.clearRange(shOf(obj.sheet), obj, 'contents'); return null;
          case 'CLEAR': wb.clearRange(shOf(obj.sheet), obj, 'all'); return null;
          case 'CLEARFORMATS': wb.clearRange(shOf(obj.sheet), obj, 'formats'); return null;
          case 'COPY': {
            const dest = (args || []).find((x) => x.named === 'DESTINATION') || (args || [])[0];
            const clip = wb.copyRange(shOf(obj.sheet), obj);
            if (dest && dest.e) { const d = ev(dest.e); wb.pasteClip(shOf(d.sheet), clip, d.r1, d.c1, false); } else st.clip = clip;
            return null;
          }
          case 'PASTESPECIAL': case 'PASTE': if (st.clip) wb.pasteClip(shOf(obj.sheet), st.clip, obj.r1, obj.c1, false); return null;
          case 'AUTOFIT': case 'MERGE': case 'UNMERGE': case 'WRAPTEXT': return null;
          case 'INSERT': wb.insertRows(shOf(obj.sheet), obj.r1, obj.r2 - obj.r1 + 1); return null;
          case 'DELETE': wb.deleteRows(shOf(obj.sheet), obj.r1, obj.r2 - obj.r1 + 1); return null;
          case 'SORT': return null;
          default: break;
        }
      } else if (obj.t === 'font') {
        const s = firstStyle(obj.rg);
        switch (name) {
          case 'BOLD': return !!s.bold;
          case 'ITALIC': return !!s.italic;
          case 'UNDERLINE': return s.underline ? CONSTS.XLUNDERLINESTYLESINGLE : CONSTS.XLUNDERLINESTYLENONE;
          case 'COLOR': return s.color ? hexToBgr(s.color) : 0;
          case 'COLORINDEX': return 1;
          case 'SIZE': return 11;
          case 'NAME': return 'Calibri';
          default: break;
        }
      } else if (obj.t === 'interior') {
        const s = firstStyle(obj.rg);
        switch (name) {
          case 'COLOR': return s.fill ? hexToBgr(s.fill) : 16777215;
          case 'COLORINDEX': return s.fill ? Math.max(1, COLOR_INDEX.indexOf(s.fill)) : CONSTS.XLNONE;
          case 'PATTERN': return s.fill ? CONSTS.XLSOLID : CONSTS.XLNONE;
          default: return 0;
        }
      } else if (obj.t === 'borders') {
        if (args) return obj;
        if (name === 'LINESTYLE') return firstStyle(obj.rg).border ? CONSTS.XLCONTINUOUS : CONSTS.XLNONE;
        return 0;
      } else if (obj.t === 'sheet') {
        switch (name) {
          case 'RANGE': return rangeFromArgs(null, args || [], obj.name);
          case 'CELLS': return cellsFrom(null, args || [], obj.name);
          case 'COLUMNS': return colsFrom(null, args || [], obj.name, false);
          case 'ROWS': return colsFrom(null, args || [], obj.name, true);
          case 'NAME': return obj.name;
          case 'USEDRANGE': { const sh = shOf(obj.name); const ps = Object.keys(sh.cells).map(F.parseAddr); return makeRange(sh.name, 0, 0, Math.max(0, ...ps.map((p) => p.r)), Math.max(0, ...ps.map((p) => p.c))); }
          case 'SELECT': case 'ACTIVATE': st.sheet = shOf(obj.name).name; st.sel = { r1: 0, c1: 0, r2: 0, c2: 0 }; st.act = { r: 0, c: 0 }; return null;
          case 'CALCULATE': case 'PROTECT': case 'UNPROTECT': return null;
          default: break;
        }
      } else if (obj.t === 'sheets') {
        if (name === 'COUNT') return wb.sheets.length;
        if (name === 'ADD') { const i = wb.addSheet(); st.sheet = wb.sheets[i].name; return { t: 'sheet', name: wb.sheets[i].name }; }
      } else if (obj.t === 'book') {
        if (name === 'SHEETS' || name === 'WORKSHEETS') return args && args.length ? sheetArg(ev(args[0].e)) : { t: 'sheets' };
        if (name === 'SAVE' || name === 'CLOSE') return null;
        if (name === 'NAME') return 'Libro1.xlsm';
      } else if (obj.t === 'app') {
        if (name === 'WORKSHEETFUNCTION') return { t: 'wsf' };
        if (['SCREENUPDATING', 'DISPLAYALERTS', 'CALCULATION', 'ENABLEEVENTS', 'STATUSBAR', 'CUTCOPYMODE'].includes(name)) return true;
        if (name === 'CALCULATE') return null;
        if (name === 'ACTIVESHEET') return { t: 'sheet', name: st.sheet };
        if (name === 'SELECTION') return makeRange(st.sheet, st.sel.r1, st.sel.c1, st.sel.r2, st.sel.c2);
        if (name === 'ACTIVECELL') return makeRange(st.sheet, st.act.r, st.act.c, st.act.r, st.act.c);
        if (name === 'WORKSHEETS' || name === 'SHEETS') return args && args.length ? sheetArg(ev(args[0].e)) : { t: 'sheets' };
      } else if (obj.t === 'wsf') {
        return wsf(name, args || []);
      } else if (obj.t === 'collection') {
        if (name === 'COUNT') return obj.kind === 'rows' ? obj.of.r2 - obj.of.r1 + 1 : obj.of.c2 - obj.of.c1 + 1;
      }
      throw new VBAError('Error \'438\' en tiempo de ejecución: el objeto no admite esta propiedad o método (' + (raw || name) + ').', curLine, 438);
    }

    function sheetArg(v) {
      v = prim(v);
      if (typeof v === 'number') { const s = wb.sheets[v - 1]; if (!s) throw new VBAError('Error \'9\' en tiempo de ejecución: subíndice fuera del intervalo.', curLine, 9); return { t: 'sheet', name: s.name }; }
      return { t: 'sheet', name: shOf(String(v)).name };
    }

    function ident(name, args, raw) {
      if (name in vars && !args) return vars[name];
      if (name in vars && args) { const v = vars[name]; return v && v.t ? member(v, '__DEFAULT__', args) : v; }
      switch (name) {
        case 'RANGE': return rangeFromArgs(null, args || [], st.sheet);
        case 'CELLS': return cellsFrom(null, args || [], st.sheet);
        case 'COLUMNS': return colsFrom(null, args || [], st.sheet, false);
        case 'ROWS': return colsFrom(null, args || [], st.sheet, true);
        case 'SELECTION': return makeRange(st.sheet, st.sel.r1, st.sel.c1, st.sel.r2, st.sel.c2);
        case 'ACTIVECELL': return makeRange(st.sheet, st.act.r, st.act.c, st.act.r, st.act.c);
        case 'ACTIVESHEET': return { t: 'sheet', name: st.sheet };
        case 'WORKSHEETS': case 'SHEETS': return args && args.length ? sheetArg(ev(args[0].e)) : { t: 'sheets' };
        case 'THISWORKBOOK': case 'ACTIVEWORKBOOK': return { t: 'book' };
        case 'APPLICATION': return { t: 'app' };
        case 'WORKSHEETFUNCTION': return { t: 'wsf' };
        default: break;
      }
      if (VBAFN[name]) return VBAFN[name]((args || []).map((x) => (x.e ? ev(x.e) : null)));
      if (name in CONSTS) return CONSTS[name];
      if (subs[name]) { callSub(subs[name]); return null; }
      if (args) throw new VBAError('Error de compilación: no se ha definido Sub o Function "' + raw + '".', curLine);
      return null; // variable no declarada = Empty
    }

    function ev(n) {
      switch (n.t) {
        case 'lit': return n.v;
        case 'paren': return ev(n.a);
        case 'id': return ident(n.name, null, n.raw);
        case 'with': { if (!withStack.length) throw new VBAError('Error de compilación: referencia "." no válida fuera de un bloque With.', curLine); return member(withStack[withStack.length - 1], n.name, null, n.raw); }
        case 'call': {
          if (n.obj.t === 'id') return ident(n.obj.name, n.args, n.obj.raw);
          if (n.obj.t === 'with') { if (!withStack.length) throw new VBAError('Error de compilación: referencia "." no válida fuera de With.', curLine); return member(withStack[withStack.length - 1], n.obj.name, n.args, n.obj.raw); }
          if (n.obj.t === 'mem') return member(ev(n.obj.obj), n.obj.name, n.args, n.obj.raw);
          const o = ev(n.obj);
          return member(o, '__DEFAULT__', n.args);
        }
        case 'mem': return member(ev(n.obj), n.name, null, n.raw);
        case 'un': return n.op === 'NOT' ? !toBool(ev(n.a)) : -toNum(ev(n.a));
        case 'bin': {
          const op = n.op;
          if (op === 'AND') return toBool(ev(n.a)) && toBool(ev(n.b));
          if (op === 'OR') return toBool(ev(n.a)) || toBool(ev(n.b));
          if (op === 'XOR') return toBool(ev(n.a)) !== toBool(ev(n.b));
          const a = ev(n.a); const b = ev(n.b);
          switch (op) {
            case '+': { const pa = prim(a); const pb = prim(b); if (typeof pa === 'string' && typeof pb === 'string') return pa + pb; return toNum(pa) + toNum(pb); }
            case '-': return toNum(a) - toNum(b);
            case '*': return toNum(a) * toNum(b);
            case '/': { const d = toNum(b); if (d === 0) throw new VBAError('Error \'11\' en tiempo de ejecución: división por cero.', curLine, 11); return toNum(a) / d; }
            case '\\': return Math.trunc(toNum(a) / toNum(b));
            case 'MOD': return toNum(a) % toNum(b);
            case '^': return Math.pow(toNum(a), toNum(b));
            case '&': return toStr(a) + toStr(b);
            case '=': return compare(a, b) === 0;
            case '<>': return compare(a, b) !== 0;
            case '<': return compare(a, b) < 0;
            case '>': return compare(a, b) > 0;
            case '<=': return compare(a, b) <= 0;
            case '>=': return compare(a, b) >= 0;
            case 'LIKE': { const re = new RegExp('^' + toStr(b).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.').replace(/#/g, '\\d') + '$'); return re.test(toStr(a)); }
            case 'IS': return a === b || (a && b && JSON.stringify(a) === JSON.stringify(b));
            default: throw new VBAError('Operador no admitido: ' + op, curLine);
          }
        }
        default: throw new VBAError('Expresión no válida.', curLine);
      }
    }

    function assign(lhs, valNode) {
      const v = ev(valNode);
      if (lhs.t === 'id') { vars[lhs.name] = v; return; }
      let obj; let name; let args = null;
      if (lhs.t === 'mem') { obj = ev(lhs.obj); name = lhs.name; } else if (lhs.t === 'with') { obj = withStack[withStack.length - 1]; name = lhs.name; } else if (lhs.t === 'call' && (lhs.obj.t === 'mem' || lhs.obj.t === 'with')) { obj = lhs.obj.t === 'mem' ? ev(lhs.obj.obj) : withStack[withStack.length - 1]; name = lhs.obj.name; args = lhs.args; obj = member(obj, name, args); name = 'VALUE'; } else if (lhs.t === 'call') { obj = ev(lhs); name = 'VALUE'; } else throw new VBAError('Error de compilación: asignación no válida.', curLine);
      if (obj == null) throw new VBAError('Error \'91\' en tiempo de ejecución: variable de objeto no establecida.', curLine, 91);
      if (obj.t === 'range') {
        switch (name) {
          case 'VALUE': case 'VALUE2': return setValue(obj, v);
          case 'FORMULA': return setValue(obj, v, 'en');
          case 'FORMULALOCAL': case 'FORMULAR1C1': case 'FORMULAR1C1LOCAL': return setValue(obj, v);
          case 'HORIZONTALALIGNMENT': { const n = toNum(v); return style(obj, { align: n === CONSTS.XLCENTER ? 'center' : n === CONSTS.XLRIGHT ? 'right' : n === CONSTS.XLLEFT ? 'left' : null }); }
          case 'NUMBERFORMAT': case 'NUMBERFORMATLOCAL': return style(obj, fmtFromNumberFormat(toStr(v)));
          case 'COLUMNWIDTH': { const sh = shOf(obj.sheet); for (let c = obj.c1; c <= obj.c2; c++) sh.colW[c] = Math.round(toNum(v) * 7 + 5); return null; }
          case 'ROWHEIGHT': case 'VERTICALALIGNMENT': case 'WRAPTEXT': case 'NAME': return null;
          default: break;
        }
      } else if (obj.t === 'font') {
        switch (name) {
          case 'BOLD': return style(obj.rg, { bold: toBool(v) });
          case 'ITALIC': return style(obj.rg, { italic: toBool(v) });
          case 'UNDERLINE': { const n = prim(v); return style(obj.rg, { underline: n === true || (typeof n === 'number' && n !== CONSTS.XLUNDERLINESTYLENONE && n !== 0) }); }
          case 'COLOR': return style(obj.rg, { color: bgrToHex(toNum(v)) });
          case 'COLORINDEX': { const n = toNum(v); return style(obj.rg, { color: n === CONSTS.XLAUTOMATIC ? null : COLOR_INDEX[n] || null }); }
          case 'SIZE': case 'NAME': case 'STRIKETHROUGH': return null;
          default: break;
        }
      } else if (obj.t === 'interior') {
        switch (name) {
          case 'COLOR': return style(obj.rg, { fill: bgrToHex(toNum(v)) });
          case 'COLORINDEX': { const n = toNum(v); return style(obj.rg, { fill: n === CONSTS.XLNONE ? null : COLOR_INDEX[n] || null }); }
          case 'PATTERN': return toNum(v) === CONSTS.XLNONE ? style(obj.rg, { fill: null }) : null;
          case 'THEMECOLOR': case 'TINTANDSHADE': case 'PATTERNCOLORINDEX': return null;
          default: break;
        }
      } else if (obj.t === 'borders') {
        if (name === 'LINESTYLE') return style(obj.rg, { border: toNum(v) !== CONSTS.XLNONE });
        if (name === 'WEIGHT' || name === 'COLOR' || name === 'COLORINDEX') return null;
      } else if (obj.t === 'sheet') {
        if (name === 'NAME') { const i = wb.sheets.findIndex((s) => s.name === obj.name); const err = wb.renameSheet(i, toStr(v)); if (err) throw R(err); if (st.sheet === obj.name) st.sheet = toStr(v); return null; }
      } else if (obj.t === 'app') return null;
      throw new VBAError('Error \'438\' en tiempo de ejecución: el objeto no admite esta propiedad (' + name + ').', curLine, 438);
    }

    let onErrorNext = false;
    function exec(body) {
      for (const s of body) {
        if (++steps > maxSteps) throw new VBAError('La macro se detuvo: demasiadas instrucciones (¿un bucle infinito?).', s.line);
        curLine = s.line;
        try {
          switch (s.t) {
            case 'assign': assign(s.lhs, s.e); break;
            case 'expr': {
              const e = s.e;
              if (e.t === 'id' && F.normName(e.name) === 'MSGBOX') { msgs.push(toStr(s.args[0] ? ev(s.args[0].e) : '')); break; }
              if (e.t === 'mem' || (e.t === 'with')) {
                const obj = e.t === 'mem' ? ev(e.obj) : withStack[withStack.length - 1];
                member(obj, e.name, s.args.length ? s.args : null, e.raw);
              } else if (e.t === 'id' && subs[e.name] && !s.args.length) callSub(subs[e.name]);
              else ev(e);
              break;
            }
            case 'with': { const o = ev(s.obj); withStack.push(o); try { exec(s.body); } finally { withStack.pop(); } break; }
            case 'for': {
              const from = toNum(ev(s.from)); const to = toNum(ev(s.to)); const step = s.step ? toNum(ev(s.step)) : 1;
              if (step === 0) throw new VBAError('Step no puede ser 0.', s.line);
              try { for (let i = from; step > 0 ? i <= to : i >= to; i += step) { vars[s.v] = i; exec(s.body); i = toNum(vars[s.v]); } } catch (x) { if (!(x instanceof ExitSignal && x.what === 'FOR')) throw x; }
              break;
            }
            case 'foreach': {
              const c = ev(s.coll);
              if (!c || c.t !== 'range') throw new VBAError('For Each solo admite rangos de celdas.', s.line);
              try { for (let r = c.r1; r <= c.r2; r++) for (let cc = c.c1; cc <= c.c2; cc++) { vars[s.v] = makeRange(c.sheet, r, cc, r, cc); exec(s.body); } } catch (x) { if (!(x instanceof ExitSignal && x.what === 'FOR')) throw x; }
              break;
            }
            case 'do': {
              try {
                for (;;) {
                  if (s.pre) { const v = toBool(ev(s.pre.e)); if (s.pre.kind === 'WHILE' ? !v : v) break; }
                  exec(s.body);
                  if (s.post) { const v = toBool(ev(s.post.e)); if (s.post.kind === 'WHILE' ? !v : v) break; }
                  if (++steps > maxSteps) throw new VBAError('La macro se detuvo: demasiadas instrucciones (¿un bucle infinito?).', s.line);
                }
              } catch (x) { if (!(x instanceof ExitSignal && x.what === 'DO')) throw x; }
              break;
            }
            case 'if': {
              let done = false;
              for (const b of s.branches) { if (toBool(ev(b.cond))) { exec(b.body); done = true; break; } }
              if (!done) exec(s.els);
              break;
            }
            case 'exit': throw new ExitSignal(s.what);
            case 'onerror': onErrorNext = s.resume; break;
            default: break;
          }
        } catch (e) {
          if (e instanceof ExitSignal) throw e;
          if (onErrorNext && e instanceof VBAError) continue;
          throw e;
        }
      }
    }
    const callStack = [];
    function callSub(sb) {
      if (callStack.length > 20) throw new VBAError('Error \'28\': espacio de pila insuficiente.', curLine, 28);
      callStack.push(sb.name);
      try { exec(sb.body); } catch (x) { if (!(x instanceof ExitSignal && x.what === 'SUB')) throw x; } finally { callStack.pop(); }
    }

    callSub(sub);
    wb.invalidate();
    return { sheet: st.sheet, sel: st.sel, act: st.act, msgs };
  }

  function listSubs(code) {
    try { return Object.values(parseModule(code)).map((s) => s.name); } catch (e) {
      const out = [];
      const re = /^\s*(?:(?:Public|Private)\s+)?Sub\s+([A-Za-zÀ-ÿÑñ_][A-Za-zÀ-ÿÑñ0-9_]*)\s*\(/gim;
      let m;
      while ((m = re.exec(code || ''))) out.push(m[1]);
      return out;
    }
  }
  function check(code) {
    try { parseModule(code); return null; } catch (e) { return e; }
  }
  function removeSub(code, name) {
    const re = new RegExp('(^|\\n)\\s*(?:(?:Public|Private)\\s+)?Sub\\s+' + name + '\\s*\\(\\s*\\)[\\s\\S]*?\\n\\s*End\\s+Sub[^\\n]*', 'i');
    return String(code || '').replace(re, '').replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');
  }
  function upsertSub(code, name, subCode) {
    const without = removeSub(code, name).trim();
    return (without ? without + '\n\n' : '') + subCode.trim() + '\n';
  }

  /* ----------------------------- Grabadora ----------------------------- */
  const vbaStr = (s) => '"' + String(s).replace(/"/g, '""') + '"';
  const rgbOf = (hex) => { const n = parseInt(hex.slice(1), 16); return 'RGB(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ')'; };
  function patchToLines(p) {
    const L = [];
    if ('bold' in p) L.push('Selection.Font.Bold = ' + (p.bold ? 'True' : 'False'));
    if ('italic' in p) L.push('Selection.Font.Italic = ' + (p.italic ? 'True' : 'False'));
    if ('underline' in p) L.push('Selection.Font.Underline = ' + (p.underline ? 'xlUnderlineStyleSingle' : 'xlUnderlineStyleNone'));
    if ('fill' in p) { if (p.fill) L.push('With Selection.Interior', '    .Pattern = xlSolid', '    .Color = ' + rgbOf(p.fill), 'End With'); else L.push('Selection.Interior.Pattern = xlNone'); }
    if ('color' in p) L.push(p.color ? 'Selection.Font.Color = ' + rgbOf(p.color) : 'Selection.Font.ColorIndex = xlAutomatic');
    if ('align' in p) L.push('Selection.HorizontalAlignment = ' + ({ left: 'xlLeft', center: 'xlCenter', right: 'xlRight' }[p.align] || 'xlGeneral'));
    if ('fmt' in p) {
      const d = p.dec != null ? p.dec : null;
      const z = (n) => (n ? '.' + '0'.repeat(n) : '');
      const nf = { number: '#,##0' + z(d ?? 2), currency: '$ #,##0' + z(d ?? 0), percent: '0' + z(d ?? 0) + '%', date: 'dd-mm-yyyy', text: '@' }[p.fmt] || 'General';
      L.push('Selection.NumberFormat = ' + vbaStr(nf));
    }
    if ('border' in p) L.push('Selection.Borders.LineStyle = ' + (p.border ? 'xlContinuous' : 'xlNone'));
    return L;
  }

  global.XLVBA = { run, parseModule, listSubs, check, removeSub, upsertSub, patchToLines, vbaStr, VBAError };
})(typeof window !== 'undefined' ? window : globalThis);
