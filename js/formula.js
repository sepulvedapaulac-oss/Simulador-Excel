/* =========================================================================
 * Motor de fórmulas del simulador (sintaxis de Excel en español)
 * - Separador de argumentos ";" (también acepta ",")
 * - Decimales con coma o punto
 * - Funciones en español (y sus equivalentes en inglés)
 * ========================================================================= */
(function (global) {
  'use strict';

  class XErr {
    constructor(code) { this.code = code; }
    toString() { return this.code; }
  }
  const E = {
    DIV0: new XErr('#¡DIV/0!'),
    VALUE: new XErr('#¡VALOR!'),
    REF: new XErr('#¡REF!'),
    NA: new XErr('#N/A'),
    NAME: new XErr('#¿NOMBRE?'),
    NUM: new XErr('#¡NUM!'),
  };
  const isErr = (v) => v instanceof XErr;

  /* ---------------------------- Direcciones ---------------------------- */
  function colToNum(s) {
    let n = 0;
    for (const ch of s.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
  }
  function numToCol(n) {
    let s = '';
    n += 1;
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }
  const addr = (r, c) => numToCol(c) + (r + 1);
  function parseAddr(a) {
    const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(String(a).trim());
    if (!m) return null;
    return { r: parseInt(m[2], 10) - 1, c: colToNum(m[1]) };
  }
  function quoteSheet(name) {
    return /^[A-Za-zÀ-ÿÑñ_][A-Za-zÀ-ÿÑñ0-9_.]*$/.test(name) && !/^[A-Za-z]{1,3}\d+$/.test(name)
      ? name
      : "'" + name.replace(/'/g, "''") + "'";
  }
  /** "A1:B5", "Hoja!A1", "'Mi hoja'!$A$1:$B$3", "A:A" */
  function parseRange(s) {
    if (s == null) return null;
    s = String(s).trim().replace(/^=/, '');
    let sheet = null;
    const bang = s.lastIndexOf('!');
    if (bang >= 0) {
      sheet = s.slice(0, bang);
      s = s.slice(bang + 1);
      if (sheet.startsWith("'") && sheet.endsWith("'")) sheet = sheet.slice(1, -1).replace(/''/g, "'");
    }
    const parts = s.split(':');
    if (parts.length === 1) {
      const a = parseAddr(parts[0]);
      return a ? { sheet, r1: a.r, c1: a.c, r2: a.r, c2: a.c } : null;
    }
    if (parts.length === 2) {
      const a = parseAddr(parts[0]);
      const b = parseAddr(parts[1]);
      if (a && b) {
        return { sheet, r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) };
      }
      const ca = /^\$?([A-Za-z]{1,3})$/.exec(parts[0]);
      const cb = /^\$?([A-Za-z]{1,3})$/.exec(parts[1]);
      if (ca && cb) {
        const x = colToNum(ca[1]);
        const y = colToNum(cb[1]);
        return { sheet, r1: 0, c1: Math.min(x, y), r2: 1048575, c2: Math.max(x, y) };
      }
    }
    return null;
  }
  function rangeToStr(rg, abs) {
    const d = abs ? '$' : '';
    const a = d + numToCol(rg.c1) + d + (rg.r1 + 1);
    const b = d + numToCol(rg.c2) + d + (rg.r2 + 1);
    const core = rg.r1 === rg.r2 && rg.c1 === rg.c2 ? a : a + ':' + b;
    return rg.sheet ? quoteSheet(rg.sheet) + '!' + core : core;
  }

  const normName = (s) => String(s).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ---------------------------- Números / texto ------------------------ */
  /** Convierte texto ingresado por el usuario en número (formato es-CL o punto decimal). */
  function parseNumberText(s) {
    if (typeof s !== 'string') return null;
    let t = s.trim();
    if (t === '') return null;
    let neg = false;
    if (/^-/.test(t)) { neg = true; t = t.slice(1).trim(); }
    let v = null;
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) v = parseFloat(t.replace(/\./g, '').replace(',', '.'));
    else if (/^\d+,\d+$/.test(t) || /^,\d+$/.test(t)) v = parseFloat(t.replace(',', '.'));
    else if (/^\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t) || /^\.\d+$/.test(t)) v = parseFloat(t);
    if (v == null || isNaN(v)) return null;
    return neg ? -v : v;
  }

  function formatGeneral(n) {
    if (!isFinite(n)) return E.NUM.code;
    if (n === 0) return '0';
    const abs = Math.abs(n);
    let s;
    if (abs >= 1e11 || abs < 1e-9) s = n.toExponential(5).replace(/\.?0+e/, 'e').toUpperCase();
    else s = String(Number(n.toPrecision(11)));
    return s.replace('.', ',');
  }

  /* ---------------------------- Fechas -------------------------------- */
  const MS_DAY = 86400000;
  function dateToSerial(y, m, d) { return Date.UTC(y, m - 1, d) / MS_DAY + 25569; }
  function serialToDate(s) { return new Date(Math.round((s - 25569) * MS_DAY)); }
  function todaySerial() {
    const now = new Date();
    return dateToSerial(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  function nowSerial() {
    const now = new Date();
    return todaySerial() + (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
  }

  /* ---------------------------- Tokenizador ---------------------------- */
  const IDENT_RE = /^[A-Za-zÀ-ÿÑñ_][A-Za-zÀ-ÿÑñ0-9_.]*/;
  const REF_RE = /^((?:'(?:[^']|'')+'|[A-Za-zÀ-ÿÑñ_][A-Za-zÀ-ÿÑñ0-9_.]*)!)?((\$?)([A-Za-z]{1,3})(\$?)(\d+)(?::(\$?)([A-Za-z]{1,3})(\$?)(\d+))?|(\$?)([A-Za-z]{1,3}):(\$?)([A-Za-z]{1,3}))(?![A-Za-zÀ-ÿÑñ0-9_(.!])/;

  function hasSemicolon(src) {
    let inStr = false;
    for (const ch of src) {
      if (ch === '"') inStr = !inStr;
      else if (ch === ';' && !inStr) return true;
    }
    return false;
  }

  function tokenize(src) {
    const toks = [];
    const n = src.length;
    const stack = [];
    let i = 0;
    while (i < n) {
      const ch = src[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
      const start = i;
      if (ch === '"') {
        let j = i + 1;
        let s = '';
        while (j < n) {
          if (src[j] === '"') {
            if (src[j + 1] === '"') { s += '"'; j += 2; continue; }
            break;
          }
          s += src[j++];
        }
        if (j >= n) throw new SyntaxError('Faltan comillas de cierre en un texto.');
        toks.push({ t: 'str', v: s, s: start, e: j + 1 });
        i = j + 1;
        continue;
      }
      const rest = src.slice(i);
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        // coma entre dígitos = decimal (formato es-CL); separador de argumentos ";" o ","
        const m = /^\d+,\d+([eE][+-]?\d+)?/.exec(rest) || /^(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?/.exec(rest);
        if (m) {
          toks.push({ t: 'num', v: parseFloat(m[0].replace(',', '.')), s: start, e: i + m[0].length });
          i += m[0].length;
          continue;
        }
      }
      if (ch === '$' || ch === "'" || /[A-Za-zÀ-ÿÑñ_]/.test(ch)) {
        const m = REF_RE.exec(rest);
        if (m) {
          let sheet = null;
          if (m[1]) {
            sheet = m[1].slice(0, -1);
            if (sheet.startsWith("'")) sheet = sheet.slice(1, -1).replace(/''/g, "'");
          }
          const tok = { t: 'ref', sheet, sheetRaw: m[1] || '', s: start, e: i + m[0].length };
          if (m[4]) {
            tok.a = { absC: !!m[3], c: colToNum(m[4]), absR: !!m[5], r: parseInt(m[6], 10) - 1 };
            if (m[8]) tok.b = { absC: !!m[7], c: colToNum(m[8]), absR: !!m[9], r: parseInt(m[10], 10) - 1 };
          } else {
            tok.colRange = true;
            tok.a = { absC: !!m[11], c: colToNum(m[12]), absR: false, r: 0 };
            tok.b = { absC: !!m[13], c: colToNum(m[14]), absR: false, r: 1048575 };
          }
          toks.push(tok);
          i += m[0].length;
          continue;
        }
        if (ch !== '$' && ch !== "'") {
          const mi = IDENT_RE.exec(rest);
          if (mi) {
            const word = mi[0];
            let j = i + word.length;
            while (src[j] === ' ') j++;
            const up = normName(word);
            if (src[j] === '(') toks.push({ t: 'func', v: word, s: start, e: i + word.length });
            else if (up === 'VERDADERO' || up === 'TRUE') toks.push({ t: 'bool', v: true, s: start, e: i + word.length });
            else if (up === 'FALSO' || up === 'FALSE') toks.push({ t: 'bool', v: false, s: start, e: i + word.length });
            else toks.push({ t: 'name', v: word, s: start, e: i + word.length });
            i += word.length;
            continue;
          }
        }
      }
      if (ch === '#') {
        const m = /^#(¡DIV\/0!|DIV\/0!|¡VALOR!|VALUE!|¡REF!|REF!|N\/A|¿NOMBRE\?|NAME\?|¡NUM!|NUM!)/i.exec(rest);
        if (m) {
          const code = m[0].toUpperCase();
          const map = { '#DIV/0!': E.DIV0, '#VALUE!': E.VALUE, '#REF!': E.REF, '#NAME?': E.NAME, '#NUM!': E.NUM };
          const err = map[code] || Object.values(E).find((x) => x.code === code) || E.NA;
          toks.push({ t: 'err', v: err, s: start, e: i + m[0].length });
          i += m[0].length;
          continue;
        }
      }
      const two = src.substr(i, 2);
      if (two === '<=' || two === '>=' || two === '<>') {
        toks.push({ t: 'op', v: two, s: start, e: i + 2 });
        i += 2;
        continue;
      }
      if ('+-*/^&=<>%'.includes(ch)) { toks.push({ t: 'op', v: ch, s: start, e: i + 1 }); i++; continue; }
      if (ch === '(') {
        const prev = toks[toks.length - 1];
        stack.push(prev && prev.t === 'func' ? 'f' : 'g');
        toks.push({ t: '(', s: start, e: i + 1 });
        i++;
        continue;
      }
      if (ch === ')') { stack.pop(); toks.push({ t: ')', s: start, e: i + 1 }); i++; continue; }
      if (ch === ';' || ch === ',') { toks.push({ t: 'sep', s: start, e: i + 1 }); i++; continue; }
      throw new SyntaxError('Carácter no válido en la fórmula: "' + ch + '"');
    }
    return toks;
  }

  /* ---------------------------- Parser --------------------------------- */
  function parse(src) {
    src = String(src).replace(/^=/, '');
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const isOp = (...ops) => peek() && peek().t === 'op' && ops.includes(peek().v);

    function primary() {
      const k = toks[p++];
      if (!k) throw new SyntaxError('La fórmula está incompleta.');
      switch (k.t) {
        case 'num': return { t: 'num', v: k.v };
        case 'str': return { t: 'str', v: k.v };
        case 'bool': return { t: 'bool', v: k.v };
        case 'err': return { t: 'err', v: k.v };
        case 'name': return { t: 'name', name: k.v };
        case 'ref':
          if (k.b) return { t: 'range', sheet: k.sheet, a: k.a, b: k.b };
          return { t: 'ref', sheet: k.sheet, a: k.a };
        case 'func': {
          const open = toks[p++];
          if (!open || open.t !== '(') throw new SyntaxError('Se esperaba "(" después de ' + k.v);
          const args = [];
          if (peek() && peek().t === ')') { p++; return { t: 'func', name: k.v, args }; }
          for (;;) {
            if (peek() && (peek().t === 'sep' || peek().t === ')')) args.push({ t: 'empty' });
            else args.push(expr());
            const nk = toks[p++];
            if (!nk) throw new SyntaxError('Falta cerrar un paréntesis en ' + k.v + '.');
            if (nk.t === ')') break;
            if (nk.t !== 'sep') throw new SyntaxError('Se esperaba ";" o ")" en ' + k.v + '.');
          }
          return { t: 'func', name: k.v, args };
        }
        case '(': {
          const e = expr();
          const c = toks[p++];
          if (!c || c.t !== ')') throw new SyntaxError('Falta cerrar un paréntesis.');
          return { t: 'paren', a: e };
        }
        case 'op':
          if (k.v === '-' || k.v === '+') { return { t: 'un', op: k.v, a: postfix() }; }
          break;
        default: break;
      }
      throw new SyntaxError('Hay un problema con esta fórmula (símbolo inesperado).');
    }
    function postfix() {
      let a = primary();
      while (isOp('%')) { p++; a = { t: 'pct', a }; }
      return a;
    }
    function unary() {
      if (isOp('-', '+')) { const op = toks[p++].v; return { t: 'un', op, a: unary() }; }
      return postfix();
    }
    function pow() {
      let a = unary();
      while (isOp('^')) { p++; a = { t: 'bin', op: '^', a, b: unary() }; }
      return a;
    }
    function mul() {
      let a = pow();
      while (isOp('*', '/')) { const op = toks[p++].v; a = { t: 'bin', op, a, b: pow() }; }
      return a;
    }
    function add() {
      let a = mul();
      while (isOp('+', '-')) { const op = toks[p++].v; a = { t: 'bin', op, a, b: mul() }; }
      return a;
    }
    function concat() {
      let a = add();
      while (isOp('&')) { p++; a = { t: 'bin', op: '&', a, b: add() }; }
      return a;
    }
    function compare() {
      let a = concat();
      while (isOp('=', '<>', '<', '>', '<=', '>=')) { const op = toks[p++].v; a = { t: 'bin', op, a, b: concat() }; }
      return a;
    }
    function expr() { return compare(); }

    if (toks.length === 0) throw new SyntaxError('La fórmula está vacía.');
    const ast = expr();
    if (p < toks.length) {
      const k = toks[p];
      if (k.t === ')') throw new SyntaxError('Hay un paréntesis de cierre de más.');
      throw new SyntaxError('Hay un problema con esta fórmula. ¿Falta un operador o un ";"?');
    }
    return ast;
  }

  /* ---------------------------- Coerciones ------------------------------ */
  function toNum(v) {
    if (typeof v === 'number') return v;
    if (v == null) return 0;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (isErr(v)) throw v;
    if (typeof v === 'string') {
      const n = parseNumberText(v);
      if (n == null) {
        const pct = /^(.*)%$/.exec(v.trim());
        if (pct) { const k = parseNumberText(pct[1]); if (k != null) return k / 100; }
        throw E.VALUE;
      }
      return n;
    }
    throw E.VALUE;
  }
  function toStr(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return formatGeneral(v);
    if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
    if (isErr(v)) throw v;
    return String(v);
  }
  function toBool(v) {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (v == null) return false;
    if (isErr(v)) throw v;
    const u = normName(String(v));
    if (u === 'VERDADERO' || u === 'TRUE') return true;
    if (u === 'FALSO' || u === 'FALSE') return false;
    throw E.VALUE;
  }
  function typeRank(v) {
    if (typeof v === 'number') return 1;
    if (typeof v === 'string') return 2;
    if (typeof v === 'boolean') return 3;
    return 0;
  }
  /** Compara como Excel: -1, 0, 1 */
  function cmp(a, b) {
    if (isErr(a)) throw a;
    if (isErr(b)) throw b;
    if (a == null) a = typeof b === 'string' ? '' : typeof b === 'boolean' ? false : 0;
    if (b == null) b = typeof a === 'string' ? '' : typeof a === 'boolean' ? false : 0;
    const ta = typeRank(a);
    const tb = typeRank(b);
    if (ta !== tb) return ta < tb ? -1 : 1;
    if (ta === 2) {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
      return x === y ? 0 : x.localeCompare(y, 'es') < 0 ? -1 : 1;
    }
    if (ta === 3) return a === b ? 0 : a ? 1 : -1;
    return a === b ? 0 : a < b ? -1 : 1;
  }

  /* ---------------------------- Evaluación ------------------------------ */
  class RangeRef {
    constructor(sheet, r1, c1, r2, c2) { Object.assign(this, { sheet, r1, c1, r2, c2 }); }
    get rows() { return this.r2 - this.r1 + 1; }
    get cols() { return this.c2 - this.c1 + 1; }
  }

  function rangeValues(rg, ctx) {
    const out = [];
    for (let r = rg.r1; r <= rg.r2; r++) {
      const row = [];
      for (let c = rg.c1; c <= rg.c2; c++) row.push(ctx.get(rg.sheet, r, c));
      out.push(row);
    }
    return out;
  }

  function scalar(v, ctx) {
    if (!(v instanceof RangeRef)) return v;
    if (v.rows === 1 && v.cols === 1) return ctx.get(v.sheet, v.r1, v.c1);
    // intersección implícita
    if (v.cols === 1 && ctx.row >= v.r1 && ctx.row <= v.r2 && v.sheet === ctx.sheet) return ctx.get(v.sheet, ctx.row, v.c1);
    if (v.rows === 1 && ctx.col >= v.c1 && ctx.col <= v.c2 && v.sheet === ctx.sheet) return ctx.get(v.sheet, v.r1, ctx.col);
    throw E.VALUE;
  }

  function ev(node, ctx) {
    switch (node.t) {
      case 'num': case 'str': case 'bool': return node.v;
      case 'err': throw node.v;
      case 'empty': return null;
      case 'paren': return ev(node.a, ctx);
      case 'ref': {
        const sheet = node.sheet ? ctx.resolveSheet(node.sheet) : ctx.sheet;
        if (!sheet) throw E.REF;
        return new RangeRef(sheet, node.a.r, node.a.c, node.a.r, node.a.c);
      }
      case 'range': {
        const sheet = node.sheet ? ctx.resolveSheet(node.sheet) : ctx.sheet;
        if (!sheet) throw E.REF;
        const maxR = ctx.rows(sheet) - 1;
        return new RangeRef(sheet, Math.min(node.a.r, node.b.r), Math.min(node.a.c, node.b.c),
          Math.min(Math.max(node.a.r, node.b.r), maxR), Math.max(node.a.c, node.b.c));
      }
      case 'name': {
        const rg = ctx.name(node.name);
        if (!rg) throw E.NAME;
        return new RangeRef(rg.sheet, rg.r1, rg.c1, rg.r2, rg.c2);
      }
      case 'un': {
        const v = toNum(scalar(ev(node.a, ctx), ctx));
        return node.op === '-' ? -v : v;
      }
      case 'pct': return toNum(scalar(ev(node.a, ctx), ctx)) / 100;
      case 'bin': {
        const a = scalar(ev(node.a, ctx), ctx);
        const b = scalar(ev(node.b, ctx), ctx);
        switch (node.op) {
          case '+': return toNum(a) + toNum(b);
          case '-': return toNum(a) - toNum(b);
          case '*': return toNum(a) * toNum(b);
          case '/': { const d = toNum(b); const x = toNum(a); if (d === 0) throw E.DIV0; return x / d; }
          case '^': { const r = Math.pow(toNum(a), toNum(b)); if (!isFinite(r) || isNaN(r)) throw E.NUM; return r; }
          case '&': return toStr(a) + toStr(b);
          case '=': return cmp(a, b) === 0;
          case '<>': return cmp(a, b) !== 0;
          case '<': return cmp(a, b) < 0;
          case '>': return cmp(a, b) > 0;
          case '<=': return cmp(a, b) <= 0;
          case '>=': return cmp(a, b) >= 0;
          default: throw E.VALUE;
        }
      }
      case 'func': {
        const f = FUNCS[normName(node.name)];
        if (!f) throw E.NAME;
        if (f.lazy) return f.fn(node.args, ctx);
        const args = node.args.map((a) => ev(a, ctx));
        return f.fn(args, ctx);
      }
      default: throw E.VALUE;
    }
  }

  function evaluate(ast, ctx) {
    try {
      let v = ev(ast, ctx);
      if (v instanceof RangeRef) v = scalar(v, ctx);
      if (typeof v === 'number' && !isFinite(v)) return E.NUM;
      return v;
    } catch (e) {
      if (isErr(e)) return e;
      throw e;
    }
  }

  /* ---------------------------- Funciones ------------------------------- */
  const FUNCS = {};
  function def(names, fn, lazy) { for (const n of names) FUNCS[normName(n)] = { fn, lazy: !!lazy }; }

  // Recorre valores de argumentos: rangos -> celdas (fromRange=true)
  function eachVal(args, ctx, cb) {
    for (const a of args) {
      if (a instanceof RangeRef) {
        for (let r = a.r1; r <= a.r2; r++) for (let c = a.c1; c <= a.c2; c++) cb(ctx.get(a.sheet, r, c), true);
      } else cb(a, false);
    }
  }
  function numbers(args, ctx) {
    const out = [];
    eachVal(args, ctx, (v, fromRange) => {
      if (isErr(v)) throw v;
      if (fromRange) { if (typeof v === 'number') out.push(v); } else if (v != null) out.push(toNum(v));
    });
    return out;
  }
  const argNum = (args, i, ctx, dflt) => {
    if (args[i] === undefined || args[i] === null) { if (dflt === undefined) throw E.VALUE; return dflt; }
    return toNum(scalar(args[i], ctx));
  };
  const argStr = (args, i, ctx) => toStr(scalar(args[i], ctx));
  const needRange = (a) => { if (!(a instanceof RangeRef)) throw E.VALUE; return a; };

  function roundTo(x, d) {
    const f = Math.pow(10, d);
    const v = Number((Math.abs(x) * f).toPrecision(15));
    return (Math.sign(x) * Math.round(v)) / f;
  }

  // Criterios (CONTAR.SI, SUMAR.SI, ...)
  function wildcardRe(s) {
    let re = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '~' && i + 1 < s.length) { re += s[++i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); continue; }
      if (ch === '*') re += '.*';
      else if (ch === '?') re += '.';
      else re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp('^' + re + '$', 'i');
  }
  function makeCriteria(crit) {
    if (isErr(crit)) throw crit;
    if (typeof crit === 'number') return (v) => typeof v === 'number' && v === crit;
    if (typeof crit === 'boolean') return (v) => v === crit;
    if (crit == null) return (v) => v == null || v === '';
    const s = String(crit);
    const m = /^(<=|>=|<>|<|>|=)?(.*)$/s.exec(s);
    const op = m[1] || '=';
    const rest = m[2];
    const n = parseNumberText(rest);
    if (n != null) {
      return (v) => {
        if (typeof v !== 'number') return op === '<>';
        switch (op) {
          case '=': return v === n;
          case '<>': return v !== n;
          case '<': return v < n;
          case '>': return v > n;
          case '<=': return v <= n;
          case '>=': return v >= n;
          default: return false;
        }
      };
    }
    if (op === '=' || op === '<>') {
      if (rest === '') return op === '=' ? (v) => v == null || v === '' : (v) => !(v == null || v === '');
      const re = /[*?]/.test(rest) ? wildcardRe(rest) : null;
      const low = rest.toLowerCase();
      const match = (v) => typeof v === 'string' && (re ? re.test(v) : v.toLowerCase() === low);
      return op === '=' ? match : (v) => !match(v);
    }
    return (v) => {
      if (typeof v !== 'string') return false;
      const c = v.toLowerCase().localeCompare(rest.toLowerCase(), 'es');
      return op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
    };
  }
  function cellsOf(rg, ctx) {
    const out = [];
    for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) out.push(ctx.get(rg.sheet, r, c));
    return out;
  }
  function multiCriteria(args, ctx, startIdx) {
    // devuelve vector de booleanos para pares (rango; criterio) desde startIdx
    let mask = null;
    for (let i = startIdx; i < args.length; i += 2) {
      const rg = needRange(args[i]);
      if (args[i + 1] === undefined) throw E.VALUE;
      const test = makeCriteria(scalar(args[i + 1], ctx));
      const vals = cellsOf(rg, ctx);
      if (mask && mask.length !== vals.length) throw E.VALUE;
      if (!mask) mask = vals.map(() => true);
      vals.forEach((v, k) => { if (!test(v)) mask[k] = false; });
    }
    return mask || [];
  }

  function lookupEq(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
      if (/[*?]/.test(b)) return wildcardRe(b).test(a);
      return a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
  }

  // --- Matemáticas y estadística
  def(['SUMA', 'SUM'], (a, ctx) => numbers(a, ctx).reduce((s, x) => s + x, 0));
  def(['PROMEDIO', 'AVERAGE'], (a, ctx) => { const n = numbers(a, ctx); if (!n.length) throw E.DIV0; return n.reduce((s, x) => s + x, 0) / n.length; });
  def(['MAX', 'MÁX', 'MAXIMO', 'MÁXIMO'], (a, ctx) => { const n = numbers(a, ctx); return n.length ? Math.max(...n) : 0; });
  def(['MIN', 'MÍN', 'MINIMO', 'MÍNIMO'], (a, ctx) => { const n = numbers(a, ctx); return n.length ? Math.min(...n) : 0; });
  def(['CONTAR', 'COUNT'], (a, ctx) => {
    let k = 0;
    eachVal(a, ctx, (v, fr) => { if (typeof v === 'number') k++; else if (!fr && v != null && !isErr(v) && typeof v !== 'boolean' && parseNumberText(String(v)) != null) k++; else if (!fr && typeof v === 'boolean') k++; });
    return k;
  });
  def(['CONTARA', 'COUNTA'], (a, ctx) => { let k = 0; eachVal(a, ctx, (v) => { if (v != null) k++; }); return k; });
  def(['CONTAR.BLANCO', 'COUNTBLANK'], (a, ctx) => { let k = 0; eachVal(a, ctx, (v) => { if (v == null || v === '') k++; }); return k; });
  def(['PRODUCTO', 'PRODUCT'], (a, ctx) => numbers(a, ctx).reduce((s, x) => s * x, 1));
  def(['ABS'], (a, ctx) => Math.abs(argNum(a, 0, ctx)));
  def(['ENTERO', 'INT'], (a, ctx) => Math.floor(argNum(a, 0, ctx)));
  def(['REDONDEAR', 'ROUND'], (a, ctx) => roundTo(argNum(a, 0, ctx), argNum(a, 1, ctx, 0)));
  def(['REDONDEAR.MAS', 'REDONDEAR.MÁS', 'ROUNDUP'], (a, ctx) => {
    const x = argNum(a, 0, ctx); const f = Math.pow(10, argNum(a, 1, ctx, 0));
    return (Math.sign(x) * Math.ceil(Number((Math.abs(x) * f).toPrecision(15)))) / f;
  });
  def(['REDONDEAR.MENOS', 'ROUNDDOWN'], (a, ctx) => {
    const x = argNum(a, 0, ctx); const f = Math.pow(10, argNum(a, 1, ctx, 0));
    return (Math.sign(x) * Math.floor(Number((Math.abs(x) * f).toPrecision(15)))) / f;
  });
  def(['TRUNCAR', 'TRUNC'], (a, ctx) => {
    const x = argNum(a, 0, ctx); const f = Math.pow(10, argNum(a, 1, ctx, 0));
    return Math.trunc(Number((x * f).toPrecision(15))) / f;
  });
  def(['RAIZ', 'RAÍZ', 'SQRT'], (a, ctx) => { const x = argNum(a, 0, ctx); if (x < 0) throw E.NUM; return Math.sqrt(x); });
  def(['POTENCIA', 'POWER'], (a, ctx) => Math.pow(argNum(a, 0, ctx), argNum(a, 1, ctx)));
  def(['RESIDUO', 'MOD'], (a, ctx) => { const n = argNum(a, 0, ctx); const d = argNum(a, 1, ctx); if (d === 0) throw E.DIV0; return n - d * Math.floor(n / d); });
  def(['PI'], () => Math.PI);
  def(['SUMAPRODUCTO', 'SUMPRODUCT'], (a, ctx) => {
    const arrs = a.map((x) => (x instanceof RangeRef ? cellsOf(x, ctx) : [scalar(x, ctx)]));
    const len = arrs[0].length;
    if (arrs.some((x) => x.length !== len)) throw E.VALUE;
    let s = 0;
    for (let i = 0; i < len; i++) {
      let p = 1;
      for (const ar of arrs) { const v = ar[i]; if (isErr(v)) throw v; p *= typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : 0; }
      s += p;
    }
    return s;
  });

  // --- Condicionales
  def(['CONTAR.SI', 'COUNTIF'], (a, ctx) => { const t = makeCriteria(scalar(a[1], ctx)); return cellsOf(needRange(a[0]), ctx).filter(t).length; });
  def(['SUMAR.SI', 'SUMIF'], (a, ctx) => {
    const rg = needRange(a[0]);
    const t = makeCriteria(scalar(a[1], ctx));
    const sr = a[2] instanceof RangeRef ? a[2] : rg;
    let s = 0;
    for (let r = 0; r < rg.rows; r++) for (let c = 0; c < rg.cols; c++) {
      if (t(ctx.get(rg.sheet, rg.r1 + r, rg.c1 + c))) { const v = ctx.get(sr.sheet, sr.r1 + r, sr.c1 + c); if (isErr(v)) throw v; if (typeof v === 'number') s += v; }
    }
    return s;
  });
  def(['PROMEDIO.SI', 'AVERAGEIF'], (a, ctx) => {
    const rg = needRange(a[0]);
    const t = makeCriteria(scalar(a[1], ctx));
    const sr = a[2] instanceof RangeRef ? a[2] : rg;
    let s = 0; let k = 0;
    for (let r = 0; r < rg.rows; r++) for (let c = 0; c < rg.cols; c++) {
      if (t(ctx.get(rg.sheet, rg.r1 + r, rg.c1 + c))) { const v = ctx.get(sr.sheet, sr.r1 + r, sr.c1 + c); if (typeof v === 'number') { s += v; k++; } }
    }
    if (!k) throw E.DIV0;
    return s / k;
  });
  def(['CONTAR.SI.CONJUNTO', 'COUNTIFS'], (a, ctx) => multiCriteria(a, ctx, 0).filter(Boolean).length);
  const aggIfs = (kind) => (a, ctx) => {
    const vals = cellsOf(needRange(a[0]), ctx);
    const mask = multiCriteria(a, ctx, 1);
    if (mask.length !== vals.length) throw E.VALUE;
    const sel = vals.filter((v, i) => mask[i] && typeof v === 'number');
    if (kind === 'sum') return sel.reduce((s, x) => s + x, 0);
    if (kind === 'avg') { if (!sel.length) throw E.DIV0; return sel.reduce((s, x) => s + x, 0) / sel.length; }
    if (kind === 'max') return sel.length ? Math.max(...sel) : 0;
    return sel.length ? Math.min(...sel) : 0;
  };
  def(['SUMAR.SI.CONJUNTO', 'SUMIFS'], aggIfs('sum'));
  def(['PROMEDIO.SI.CONJUNTO', 'AVERAGEIFS'], aggIfs('avg'));
  def(['MAX.SI.CONJUNTO', 'MAXIFS'], aggIfs('max'));
  def(['MIN.SI.CONJUNTO', 'MINIFS'], aggIfs('min'));

  // --- Lógicas
  def(['SI', 'IF'], (n, ctx) => {
    const cond = toBool(scalar(ev(n[0], ctx), ctx));
    if (cond) return n[1] && n[1].t !== 'empty' ? ev(n[1], ctx) : (n[1] ? 0 : true);
    if (n.length < 3) return false;
    return n[2].t === 'empty' ? 0 : ev(n[2], ctx);
  }, true);
  def(['SI.ERROR', 'IFERROR'], (n, ctx) => {
    try {
      const v = scalar(ev(n[0], ctx), ctx);
      if (isErr(v)) return n[1] ? ev(n[1], ctx) : '';
      return v;
    } catch (e) {
      if (!isErr(e)) throw e;
      return n[1] && n[1].t !== 'empty' ? ev(n[1], ctx) : '';
    }
  }, true);
  def(['SI.ND', 'IFNA'], (n, ctx) => {
    try { const v = scalar(ev(n[0], ctx), ctx); if (v === E.NA) return ev(n[1], ctx); return v; } catch (e) { if (e === E.NA) return ev(n[1], ctx); throw e; }
  }, true);
  const logicVals = (a, ctx) => {
    const out = [];
    eachVal(a, ctx, (v, fr) => { if (isErr(v)) throw v; if (fr) { if (typeof v === 'boolean' || typeof v === 'number') out.push(!!v); } else out.push(toBool(v)); });
    if (!out.length) throw E.VALUE;
    return out;
  };
  def(['Y', 'AND'], (a, ctx) => logicVals(a, ctx).every(Boolean));
  def(['O', 'OR'], (a, ctx) => logicVals(a, ctx).some(Boolean));
  def(['NO', 'NOT'], (a, ctx) => !toBool(scalar(a[0], ctx)));
  def(['VERDADERO', 'TRUE'], () => true);
  def(['FALSO', 'FALSE'], () => false);
  def(['ESERROR', 'ISERROR'], (n, ctx) => { try { return isErr(scalar(ev(n[0], ctx), ctx)); } catch (e) { if (isErr(e)) return true; throw e; } }, true);
  def(['ESNUMERO', 'ESNÚMERO', 'ISNUMBER'], (a, ctx) => typeof scalar(a[0], ctx) === 'number');
  def(['ESTEXTO', 'ISTEXT'], (a, ctx) => typeof scalar(a[0], ctx) === 'string');
  def(['ESBLANCO', 'ISBLANK'], (a, ctx) => scalar(a[0], ctx) == null);

  // --- Búsqueda y referencia
  def(['BUSCARV', 'VLOOKUP'], (a, ctx) => {
    const val = scalar(a[0], ctx);
    if (isErr(val)) throw val;
    const tb = needRange(a[1]);
    const col = Math.trunc(argNum(a, 2, ctx));
    const approx = a[3] === undefined || a[3] === null ? true : toBool(scalar(a[3], ctx));
    if (col < 1) throw E.VALUE;
    if (col > tb.cols) throw E.REF;
    let found = -1;
    for (let r = tb.r1; r <= tb.r2; r++) {
      const v = ctx.get(tb.sheet, r, tb.c1);
      if (approx) {
        if (v == null) continue;
        if (typeRank(v) !== typeRank(val)) continue;
        if (cmp(v, val) <= 0) found = r; else break;
      } else if (lookupEq(v, val)) { found = r; break; }
    }
    if (found < 0) throw E.NA;
    return ctx.get(tb.sheet, found, tb.c1 + col - 1);
  });
  def(['BUSCARH', 'HLOOKUP'], (a, ctx) => {
    const val = scalar(a[0], ctx);
    if (isErr(val)) throw val;
    const tb = needRange(a[1]);
    const row = Math.trunc(argNum(a, 2, ctx));
    const approx = a[3] === undefined || a[3] === null ? true : toBool(scalar(a[3], ctx));
    if (row < 1) throw E.VALUE;
    if (row > tb.rows) throw E.REF;
    let found = -1;
    for (let c = tb.c1; c <= tb.c2; c++) {
      const v = ctx.get(tb.sheet, tb.r1, c);
      if (approx) {
        if (v == null || typeRank(v) !== typeRank(val)) continue;
        if (cmp(v, val) <= 0) found = c; else break;
      } else if (lookupEq(v, val)) { found = c; break; }
    }
    if (found < 0) throw E.NA;
    return ctx.get(tb.sheet, tb.r1 + row - 1, found);
  });
  def(['COINCIDIR', 'MATCH'], (a, ctx) => {
    const val = scalar(a[0], ctx);
    if (isErr(val)) throw val;
    const rg = needRange(a[1]);
    const type = a[2] === undefined || a[2] === null ? 1 : toNum(scalar(a[2], ctx));
    const vals = cellsOf(rg, ctx);
    if (rg.rows > 1 && rg.cols > 1) throw E.NA;
    if (type === 0) {
      const i = vals.findIndex((v) => v != null && lookupEq(v, val));
      if (i < 0) throw E.NA;
      return i + 1;
    }
    let found = -1;
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i];
      if (v == null || typeRank(v) !== typeRank(val)) continue;
      const c = cmp(v, val);
      if (type > 0) { if (c <= 0) found = i; else break; } else if (c >= 0) found = i; else break;
    }
    if (found < 0) throw E.NA;
    return found + 1;
  });
  def(['INDICE', 'ÍNDICE', 'INDEX'], (a, ctx) => {
    const rg = needRange(a[0]);
    let r = a[1] === undefined || a[1] === null ? 0 : Math.trunc(toNum(scalar(a[1], ctx)));
    let c = a[2] === undefined || a[2] === null ? 0 : Math.trunc(toNum(scalar(a[2], ctx)));
    if (a[2] === undefined && rg.rows === 1) { c = r; r = 1; }
    if (rg.cols === 1 && c === 0) c = 1;
    if (rg.rows === 1 && r === 0) r = 1;
    if (r < 1 || c < 1) throw E.VALUE;
    if (r > rg.rows || c > rg.cols) throw E.REF;
    return ctx.get(rg.sheet, rg.r1 + r - 1, rg.c1 + c - 1);
  });
  def(['BUSCARX', 'XLOOKUP'], (n, ctx) => {
    const val = scalar(ev(n[0], ctx), ctx);
    const lr = needRange(ev(n[1], ctx));
    const rr = needRange(ev(n[2], ctx));
    const vals = cellsOf(lr, ctx);
    const i = vals.findIndex((v) => v != null && lookupEq(v, val));
    if (i < 0) {
      if (n[3] && n[3].t !== 'empty') return ev(n[3], ctx);
      throw E.NA;
    }
    if (lr.cols === 1) return ctx.get(rr.sheet, rr.r1 + i, rr.c1);
    return ctx.get(rr.sheet, rr.r1, rr.c1 + i);
  }, true);
  def(['ELEGIR', 'CHOOSE'], (a, ctx) => {
    const i = Math.trunc(argNum(a, 0, ctx));
    if (i < 1 || i >= a.length) throw E.VALUE;
    return scalar(a[i], ctx);
  });
  def(['FILA', 'ROW'], (a, ctx) => (a[0] instanceof RangeRef ? a[0].r1 + 1 : ctx.row + 1));
  def(['COLUMNA', 'COLUMN'], (a, ctx) => (a[0] instanceof RangeRef ? a[0].c1 + 1 : ctx.col + 1));

  // --- Texto
  def(['IZQUIERDA', 'LEFT'], (a, ctx) => { const n = argNum(a, 1, ctx, 1); if (n < 0) throw E.VALUE; return argStr(a, 0, ctx).slice(0, n); });
  def(['DERECHA', 'RIGHT'], (a, ctx) => { const n = argNum(a, 1, ctx, 1); if (n < 0) throw E.VALUE; const s = argStr(a, 0, ctx); return n === 0 ? '' : s.slice(-n); });
  def(['EXTRAER', 'MID'], (a, ctx) => { const st = argNum(a, 1, ctx); const n = argNum(a, 2, ctx); if (st < 1 || n < 0) throw E.VALUE; return argStr(a, 0, ctx).substr(st - 1, n); });
  def(['LARGO', 'LEN'], (a, ctx) => argStr(a, 0, ctx).length);
  def(['CONCATENAR', 'CONCATENATE'], (a, ctx) => a.map((x) => toStr(scalar(x, ctx))).join(''));
  def(['CONCAT'], (a, ctx) => { let s = ''; eachVal(a, ctx, (v) => { s += toStr(v); }); return s; });
  def(['UNIRCADENAS', 'TEXTJOIN'], (a, ctx) => {
    const sep = argStr(a, 0, ctx); const skip = toBool(scalar(a[1], ctx)); const parts = [];
    eachVal(a.slice(2), ctx, (v) => { const s = toStr(v); if (!(skip && s === '')) parts.push(s); });
    return parts.join(sep);
  });
  def(['NOMPROPIO', 'PROPER'], (a, ctx) => argStr(a, 0, ctx).toLowerCase().replace(/(^|[^A-Za-zÀ-ÿÑñ])([a-zà-ÿñ])/g, (m, p, l) => p + l.toUpperCase()));
  def(['MAYUSC', 'MAYÚSC', 'UPPER'], (a, ctx) => argStr(a, 0, ctx).toUpperCase());
  def(['MINUSC', 'MINÚSC', 'LOWER'], (a, ctx) => argStr(a, 0, ctx).toLowerCase());
  def(['ESPACIOS', 'TRIM'], (a, ctx) => argStr(a, 0, ctx).trim().replace(/ {2,}/g, ' '));
  def(['HALLAR', 'SEARCH'], (a, ctx) => {
    const st = argNum(a, 2, ctx, 1);
    const i = argStr(a, 1, ctx).toLowerCase().indexOf(argStr(a, 0, ctx).toLowerCase(), st - 1);
    if (i < 0) throw E.VALUE; return i + 1;
  });
  def(['ENCONTRAR', 'FIND'], (a, ctx) => {
    const st = argNum(a, 2, ctx, 1);
    const i = argStr(a, 1, ctx).indexOf(argStr(a, 0, ctx), st - 1);
    if (i < 0) throw E.VALUE; return i + 1;
  });
  def(['SUSTITUIR', 'SUBSTITUTE'], (a, ctx) => argStr(a, 0, ctx).split(argStr(a, 1, ctx)).join(argStr(a, 2, ctx)));
  def(['VALOR', 'VALUE'], (a, ctx) => toNum(argStr(a, 0, ctx)));
  def(['REPETIR', 'REPT'], (a, ctx) => argStr(a, 0, ctx).repeat(Math.max(0, argNum(a, 1, ctx))));
  def(['TEXTO', 'TEXT'], (a, ctx) => {
    const v = scalar(a[0], ctx); const f = argStr(a, 1, ctx).toLowerCase();
    if (typeof v !== 'number') return toStr(v);
    if (/d|m|a|y/.test(f) && /[\/-]/.test(f)) {
      const d = serialToDate(v);
      const dd = String(d.getUTCDate()).padStart(2, '0'); const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      return f.replace(/aaaa|yyyy/, d.getUTCFullYear()).replace(/dd/, dd).replace(/mm/, mm);
    }
    const dec = (/[.,](0+)/.exec(f) || ['', ''])[1].length;
    return fmtNumber(v, dec, /#|\./.test(f.split(/[.,]0/)[0]));
  });

  // --- Fecha y hora
  def(['HOY', 'TODAY'], () => todaySerial());
  def(['AHORA', 'NOW'], () => nowSerial());
  def(['DIA', 'DÍA', 'DAY'], (a, ctx) => serialToDate(argNum(a, 0, ctx)).getUTCDate());
  def(['MES', 'MONTH'], (a, ctx) => serialToDate(argNum(a, 0, ctx)).getUTCMonth() + 1);
  def(['AÑO', 'ANO', 'YEAR'], (a, ctx) => serialToDate(argNum(a, 0, ctx)).getUTCFullYear());
  def(['FECHA', 'DATE'], (a, ctx) => dateToSerial(argNum(a, 0, ctx), argNum(a, 1, ctx), argNum(a, 2, ctx)));
  def(['DIASEM', 'WEEKDAY'], (a, ctx) => {
    const d = serialToDate(argNum(a, 0, ctx)).getUTCDay(); const t = argNum(a, 1, ctx, 1);
    if (t === 2) return d === 0 ? 7 : d; if (t === 3) return d === 0 ? 6 : d - 1; return d + 1;
  });
  def(['DIAS', 'DÍAS', 'DAYS'], (a, ctx) => Math.trunc(argNum(a, 0, ctx)) - Math.trunc(argNum(a, 1, ctx)));
  def(['HORA', 'HOUR'], (a, ctx) => Math.floor((argNum(a, 0, ctx) % 1) * 24 + 1e-9));
  def(['MINUTO', 'MINUTE'], (a, ctx) => Math.floor(((argNum(a, 0, ctx) * 1440) % 60) + 1e-9));

  /* ---------------------------- Utilidades de fórmulas ------------------ */
  function fmtNumber(n, dec, thousands) {
    const r = roundTo(n, dec);
    const neg = r < 0;
    let [i, d] = Math.abs(r).toFixed(dec).split('.');
    if (thousands !== false) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + i + (d ? ',' + d : '');
  }

  function refText(part, colOnly) {
    if (colOnly) return (part.absC ? '$' : '') + numToCol(part.c);
    return (part.absC ? '$' : '') + numToCol(part.c) + (part.absR ? '$' : '') + (part.r + 1);
  }
  function rebuild(src, toks, mapRef) {
    let out = '';
    let last = 0;
    for (const t of toks) {
      if (t.t !== 'ref') continue;
      const rep = mapRef(t);
      if (rep == null) continue;
      out += src.slice(last, t.s) + rep;
      last = t.e;
    }
    return out + src.slice(last);
  }
  function tokText(t) {
    if (t.colRange) return t.sheetRaw + refText(t.a, true) + ':' + refText(t.b, true);
    return t.sheetRaw + refText(t.a) + (t.b ? ':' + refText(t.b) : '');
  }

  /** Desplaza referencias relativas (copiar / rellenar) */
  function shiftFormula(input, dr, dc) {
    if (typeof input !== 'string' || input[0] !== '=') return input;
    const src = input.slice(1);
    let toks;
    try { toks = tokenize(src); } catch (e) { return input; }
    const out = rebuild(src, toks, (t) => {
      const parts = [t.a, t.b].filter(Boolean).map((p) => ({ ...p }));
      for (const p of parts) {
        if (!p.absR && !t.colRange) p.r += dr;
        if (!p.absC) p.c += dc;
        if (p.r < 0 || p.c < 0) return '#¡REF!';
      }
      return tokText({ ...t, a: parts[0], b: parts[1] });
    });
    return '=' + out;
  }

  /** Ajusta referencias al insertar (delta>0) o eliminar (delta<0) filas/columnas. */
  function adjustStructure(input, formulaSheet, targetSheet, axis, index, delta) {
    if (typeof input !== 'string' || input[0] !== '=') return input;
    const src = input.slice(1);
    let toks;
    try { toks = tokenize(src); } catch (e) { return input; }
    const key = axis === 'row' ? 'r' : 'c';
    const same = (t) => (t.sheet ? t.sheet.toLowerCase() === targetSheet.toLowerCase() : formulaSheet.toLowerCase() === targetSheet.toLowerCase());
    let changed = false;
    const out = rebuild(src, toks, (t) => {
      if (!same(t)) return null;
      if (t.colRange && axis === 'row') return null;
      const a = { ...t.a };
      const b = t.b ? { ...t.b } : null;
      if (delta > 0) {
        if (a[key] >= index) a[key] += delta;
        if (b && b[key] >= index) b[key] += delta;
      } else {
        const n = -delta;
        const end = index + n - 1;
        const inDel = (v) => v >= index && v <= end;
        if (!b) {
          if (inDel(a[key])) { changed = true; return '#¡REF!'; }
          if (a[key] > end) a[key] -= n;
        } else {
          if (inDel(a[key]) && inDel(b[key])) { changed = true; return '#¡REF!'; }
          if (inDel(a[key])) a[key] = index; else if (a[key] > end) a[key] -= n;
          if (inDel(b[key])) b[key] = index - 1; else if (b[key] > end) b[key] -= n;
        }
      }
      changed = true;
      return tokText({ ...t, a, b });
    });
    return changed ? '=' + out : input;
  }

  /** Lista de referencias de una fórmula: [{sheet, r1,c1,r2,c2}] (nombres incluidos como {name}) */
  function refsOf(input) {
    if (typeof input !== 'string' || input[0] !== '=') return [];
    let toks;
    try { toks = tokenize(input.slice(1)); } catch (e) { return []; }
    const out = [];
    for (const t of toks) {
      if (t.t === 'ref') {
        const b = t.b || t.a;
        out.push({ sheet: t.sheet, r1: Math.min(t.a.r, b.r), c1: Math.min(t.a.c, b.c), r2: Math.max(t.a.r, b.r), c2: Math.max(t.a.c, b.c), absR: t.a.absR, absC: t.a.absC, text: tokText(t) });
      } else if (t.t === 'name') out.push({ name: t.v });
    }
    return out;
  }
  function functionsOf(input) {
    if (typeof input !== 'string' || input[0] !== '=') return [];
    try { return tokenize(input.slice(1)).filter((t) => t.t === 'func').map((t) => normName(t.v)); } catch (e) { return []; }
  }
  function canonicalFn(name) {
    const n = normName(name);
    // agrupa alias: devuelve el primer nombre registrado con la misma función
    const f = FUNCS[n];
    if (!f) return n;
    for (const k of Object.keys(FUNCS)) if (FUNCS[k] === f || FUNCS[k].fn === f.fn) return k;
    return n;
  }

  const FUNCTION_HELP = [
    ['Matemáticas', 'SUMA', 'SUMA(número1; [número2]; ...)', 'Suma todos los números de un rango.'],
    ['Estadísticas', 'PROMEDIO', 'PROMEDIO(número1; [número2]; ...)', 'Devuelve el promedio de los argumentos.'],
    ['Estadísticas', 'MAX', 'MAX(número1; [número2]; ...)', 'Devuelve el valor máximo.'],
    ['Estadísticas', 'MIN', 'MIN(número1; [número2]; ...)', 'Devuelve el valor mínimo.'],
    ['Estadísticas', 'CONTAR', 'CONTAR(valor1; [valor2]; ...)', 'Cuenta las celdas que contienen números.'],
    ['Estadísticas', 'CONTARA', 'CONTARA(valor1; [valor2]; ...)', 'Cuenta las celdas que no están vacías.'],
    ['Estadísticas', 'CONTAR.BLANCO', 'CONTAR.BLANCO(rango)', 'Cuenta las celdas vacías.'],
    ['Estadísticas', 'CONTAR.SI', 'CONTAR.SI(rango; criterio)', 'Cuenta las celdas que cumplen un criterio.'],
    ['Matemáticas', 'SUMAR.SI', 'SUMAR.SI(rango; criterio; [rango_suma])', 'Suma las celdas que cumplen un criterio.'],
    ['Estadísticas', 'PROMEDIO.SI', 'PROMEDIO.SI(rango; criterio; [rango_promedio])', 'Promedio de las celdas que cumplen un criterio.'],
    ['Estadísticas', 'CONTAR.SI.CONJUNTO', 'CONTAR.SI.CONJUNTO(rango1; criterio1; ...)', 'Cuenta celdas que cumplen varios criterios.'],
    ['Matemáticas', 'SUMAR.SI.CONJUNTO', 'SUMAR.SI.CONJUNTO(rango_suma; rango1; criterio1; ...)', 'Suma celdas que cumplen varios criterios.'],
    ['Estadísticas', 'PROMEDIO.SI.CONJUNTO', 'PROMEDIO.SI.CONJUNTO(rango_prom; rango1; criterio1; ...)', 'Promedio con varios criterios.'],
    ['Matemáticas', 'SUMAPRODUCTO', 'SUMAPRODUCTO(matriz1; [matriz2]; ...)', 'Suma de los productos de los rangos.'],
    ['Matemáticas', 'REDONDEAR', 'REDONDEAR(número; núm_decimales)', 'Redondea un número a los decimales indicados.'],
    ['Matemáticas', 'ENTERO', 'ENTERO(número)', 'Redondea hacia abajo hasta el entero más próximo.'],
    ['Matemáticas', 'TRUNCAR', 'TRUNCAR(número; [núm_decimales])', 'Quita la parte decimal sin redondear.'],
    ['Matemáticas', 'ABS', 'ABS(número)', 'Valor absoluto.'],
    ['Matemáticas', 'RESIDUO', 'RESIDUO(número; núm_divisor)', 'Resto de una división.'],
    ['Lógicas', 'SI', 'SI(prueba_lógica; [valor_si_verdadero]; [valor_si_falso])', 'Evalúa una condición y devuelve un valor u otro.'],
    ['Lógicas', 'Y', 'Y(valor_lógico1; [valor_lógico2]; ...)', 'VERDADERO si todos los argumentos son verdaderos.'],
    ['Lógicas', 'O', 'O(valor_lógico1; [valor_lógico2]; ...)', 'VERDADERO si algún argumento es verdadero.'],
    ['Lógicas', 'NO', 'NO(valor_lógico)', 'Invierte el valor lógico.'],
    ['Lógicas', 'SI.ERROR', 'SI.ERROR(valor; valor_si_error)', 'Devuelve otro valor si la expresión genera error.'],
    ['Búsqueda', 'BUSCARV', 'BUSCARV(valor_buscado; matriz; indicador_columnas; [rango])', 'Busca en la primera columna y devuelve un valor de la misma fila. Use FALSO para coincidencia exacta.'],
    ['Búsqueda', 'BUSCARH', 'BUSCARH(valor_buscado; matriz; indicador_filas; [rango])', 'Busca en la primera fila y devuelve un valor de la misma columna.'],
    ['Búsqueda', 'BUSCARX', 'BUSCARX(valor; matriz_buscada; matriz_devuelta; [si_no_se_encuentra])', 'Búsqueda moderna en cualquier dirección.'],
    ['Búsqueda', 'INDICE', 'INDICE(matriz; núm_fila; [núm_columna])', 'Devuelve el valor de una posición del rango.'],
    ['Búsqueda', 'COINCIDIR', 'COINCIDIR(valor_buscado; matriz; [tipo_coincidencia])', 'Devuelve la posición de un valor. Use 0 para coincidencia exacta.'],
    ['Búsqueda', 'ELEGIR', 'ELEGIR(núm_índice; valor1; [valor2]; ...)', 'Elige un valor de una lista.'],
    ['Texto', 'IZQUIERDA', 'IZQUIERDA(texto; [núm_caracteres])', 'Caracteres del inicio de un texto.'],
    ['Texto', 'DERECHA', 'DERECHA(texto; [núm_caracteres])', 'Caracteres del final de un texto.'],
    ['Texto', 'EXTRAER', 'EXTRAER(texto; posición_inicial; núm_caracteres)', 'Caracteres desde una posición.'],
    ['Texto', 'LARGO', 'LARGO(texto)', 'Número de caracteres de un texto.'],
    ['Texto', 'CONCATENAR', 'CONCATENAR(texto1; [texto2]; ...)', 'Une varios textos. También puede usar el operador &.'],
    ['Texto', 'NOMPROPIO', 'NOMPROPIO(texto)', 'Primera letra de cada palabra en mayúscula.'],
    ['Texto', 'MAYUSC', 'MAYUSC(texto)', 'Convierte el texto a mayúsculas.'],
    ['Texto', 'MINUSC', 'MINUSC(texto)', 'Convierte el texto a minúsculas.'],
    ['Texto', 'ESPACIOS', 'ESPACIOS(texto)', 'Quita espacios sobrantes.'],
    ['Texto', 'SUSTITUIR', 'SUSTITUIR(texto; texto_original; texto_nuevo)', 'Reemplaza texto.'],
    ['Fecha y hora', 'HOY', 'HOY()', 'Fecha actual.'],
    ['Fecha y hora', 'AHORA', 'AHORA()', 'Fecha y hora actuales.'],
    ['Fecha y hora', 'DIA', 'DIA(núm_de_serie)', 'Día del mes de una fecha.'],
    ['Fecha y hora', 'MES', 'MES(núm_de_serie)', 'Mes de una fecha (1 a 12).'],
    ['Fecha y hora', 'AÑO', 'AÑO(núm_de_serie)', 'Año de una fecha.'],
    ['Fecha y hora', 'FECHA', 'FECHA(año; mes; día)', 'Construye una fecha.'],
    ['Fecha y hora', 'DIASEM', 'DIASEM(núm_de_serie; [tipo])', 'Día de la semana.'],
  ];

  global.XLF = {
    XErr, E, isErr, colToNum, numToCol, addr, parseAddr, parseRange, rangeToStr, quoteSheet, normName,
    parseNumberText, formatGeneral, fmtNumber, dateToSerial, serialToDate, todaySerial,
    tokenize, parse, evaluate, RangeRef, shiftFormula, adjustStructure, refsOf, functionsOf, canonicalFn,
    toNum, toStr, cmp, makeCriteria, roundTo, FUNCS, FUNCTION_HELP,
  };
})(typeof window !== 'undefined' ? window : globalThis);
