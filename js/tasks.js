/* =========================================================================
 * Banco de actividades por nivel (según temario de los cursos)
 * Cada actividad: setup() -> datos del libro, check(wb) -> criterios logrados
 * ========================================================================= */
(function (global) {
  'use strict';
  const F = global.XLF;
  const U = global.XLUtil;
  const W = global.XLWorkbook;

  /* ----------------------------- Utilidades ----------------------------- */
  const txt = (v) => (v == null ? '' : String(v)).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
  const near = (a, b, tol = 0.005) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= Math.max(tol, Math.abs(b) * 1e-9);
  const addrs = (rg) => {
    const r = F.parseRange(rg);
    const out = [];
    for (let i = r.r1; i <= r.r2; i++) for (let j = r.c1; j <= r.c2; j++) out.push(F.addr(i, j));
    return out;
  };
  const H = {
    v: (wb, sh, a) => wb.value(sh, a),
    inp: (wb, sh, a) => { const c = wb.cell(sh, a); return c && c.input != null ? c.input : null; },
    isF: (wb, sh, a) => { const i = H.inp(wb, sh, a); return typeof i === 'string' && i[0] === '='; },
    fns: (wb, sh, a) => F.functionsOf(H.inp(wb, sh, a)).map((n) => F.canonicalFn(n)),
    uses: (wb, sh, a, ...names) => { const f = H.fns(wb, sh, a); return names.some((n) => f.includes(F.canonicalFn(n))); },
    st: (wb, sh, a) => { const c = wb.cell(sh, a); return (c && c.style) || {}; },
    refsText: (wb, sh, a) => F.refsOf(H.inp(wb, sh, a)),
    sheetExists: (wb, n) => !!wb.sheet(n),
  };
  /** item de evaluación */
  const it = (label, ok, w = 1) => ({ label, ok: !!ok, w });
  const frac = (n, d) => (d ? n / d : 0);
  /** item proporcional: logra fracción */
  const part = (label, got, total, w = 1) => ({ label: label + ' (' + got + '/' + total + ')', ok: got === total, w, f: frac(got, total) });

  function rowsData(header, rows) { return [header, ...rows]; }
  function sumN(arr) { return arr.reduce((s, x) => s + (typeof x === 'number' ? x : 0), 0); }
  /** prueba dinámica: clona el libro, aplica cambios y evalúa */
  function whatIf(wb, changes, fn) {
    const c = wb.clone();
    for (const [sheet, a, v] of changes) { const p = F.parseAddr(a); c.setInput(sheet, p.r, p.c, v); }
    return fn(c);
  }

  /* =============================== BÁSICO =============================== */
  const B = [];

  B.push({
    id: 'B1', module: 'Módulos 1 a 3 · Entorno e ingreso de datos', title: 'Ingreso y corrección de datos',
    intro: 'Estás actualizando el inventario de una tienda. Practica el ingreso de información en la planilla.',
    steps: [
      'En la <b>fila 5</b> ingresa: Producto <b>Teclado</b>, Cantidad <b>15</b>, Precio <b>12990</b>.',
      'En la <b>fila 6</b> ingresa: Producto <b>Parlantes</b>, Cantidad <b>30</b>, Precio <b>15990</b>.',
      'Corrige la cantidad del <b>Monitor</b>: debe ser <b>10</b>.',
    ],
    hint: 'Haz clic en una celda, escribe y presiona Enter o Tab. Para corregir, selecciona la celda y escribe el nuevo valor.',
    setup: () => ({ sheets: [{ name: 'Inventario', widths: [140, 90, 90], data: rowsData(['Producto', 'Cantidad', 'Precio'], [['Mouse', 25, 8990], ['Monitor', 8, 129990], ['Impresora', 5, 89990]]), styles: { 'A1:C1': { bold: true } } }] }),
    check: (wb) => {
      const s = 'Inventario';
      return [
        it('Fila 5: Teclado, 15, 12990', txt(H.v(wb, s, 'A5')) === 'teclado' && H.v(wb, s, 'B5') === 15 && H.v(wb, s, 'C5') === 12990, 1.5),
        it('Fila 6: Parlantes, 30, 15990', txt(H.v(wb, s, 'A6')) === 'parlantes' && H.v(wb, s, 'B6') === 30 && H.v(wb, s, 'C6') === 15990, 1.5),
        it('Cantidad de Monitor corregida a 10', H.v(wb, s, 'B3') === 10 && txt(H.v(wb, s, 'A3')) === 'monitor'),
      ];
    },
  });

  const B2data = [['Cuaderno', 12, 1990], ['Lápiz', 50, 350], ['Mochila', 4, 24990], ['Regla', 20, 690], ['Carpeta', 15, 1290]];
  B.push({
    id: 'B2', module: 'Módulo 7 · Introducción a las fórmulas', title: 'Fórmulas y controlador de relleno',
    intro: 'Calcula el total de cada producto vendido usando fórmulas (no escribas los resultados a mano).',
    steps: [
      'En <b>D2</b> escribe una fórmula que multiplique la <b>Cantidad</b> por el <b>Precio unitario</b> (Ej.: <code>=B2*C2</code>).',
      'Copia la fórmula hasta <b>D6</b> usando el <b>controlador de relleno</b> (cuadrito verde de la esquina inferior derecha de la selección).',
      'En <b>D7</b> calcula la suma de todos los totales.',
    ],
    hint: 'Toda fórmula comienza con el signo =. Puedes hacer clic en las celdas mientras escribes la fórmula para insertar su referencia.',
    setup: () => ({ sheets: [{ name: 'Ventas', widths: [120, 80, 120, 100], data: rowsData(['Producto', 'Cantidad', 'Precio unitario', 'Total'], B2data).concat([[null, null, 'Total', null]]), styles: { 'A1:D1': { bold: true }, 'C7': { bold: true } } }] }),
    check: (wb) => {
      const s = 'Ventas';
      let ok = 0;
      B2data.forEach((r, i) => { const a = 'D' + (i + 2); if (H.isF(wb, s, a) && near(H.v(wb, s, a), r[1] * r[2])) ok++; });
      const total = B2data.reduce((t, r) => t + r[1] * r[2], 0);
      return [
        part('D2:D6 calculan Cantidad × Precio con fórmulas', ok, 5, 3),
        it('D7 suma los totales con una fórmula', H.isF(wb, s, 'D7') && near(H.v(wb, s, 'D7'), total)),
      ];
    },
  });

  const B3data = [['Andrea', 1850000], ['Bruno', 2320000], ['Camila', 1475000], ['Diego', 2980000], ['Elena', 2150000], ['Felipe', 1690000]];
  B.push({
    id: 'B3', module: 'Módulo 7 · Direccionamiento o referencia a celdas', title: 'Referencias absolutas',
    intro: 'La empresa paga una comisión sobre las ventas. La tasa está en la celda <b>F1</b>.',
    steps: [
      'En <b>C2</b> escribe una fórmula que multiplique la venta (B2) por la tasa de comisión de <b>F1</b>, usando una <b>referencia absoluta</b> para F1 (<code>$F$1</code>).',
      'Copia la fórmula hasta <b>C7</b>.',
      'Comprueba: si cambias la tasa en F1, todas las comisiones deben recalcularse.',
    ],
    hint: 'Mientras escribes la fórmula, presiona F4 sobre la referencia F1 para convertirla en $F$1.',
    setup: () => ({ sheets: [{ name: 'Comisiones', widths: [110, 110, 110, 30, 110, 70], data: rowsData(['Vendedor', 'Venta', 'Comisión', null, 'Tasa comisión', 0.05], B3data), styles: { 'A1:C1': { bold: true }, 'E1': { bold: true }, 'F1': { fmt: 'percent', fill: '#fff2cc' }, 'B2:C7': { fmt: 'currency' } } }] }),
    check: (wb) => {
      const s = 'Comisiones';
      const tasa = H.v(wb, s, 'F1');
      let okVal = 0; let okAbs = 0;
      B3data.forEach((r, i) => {
        const a = 'C' + (i + 2);
        if (H.isF(wb, s, a) && typeof tasa === 'number' && near(H.v(wb, s, a), r[1] * tasa, 0.5)) okVal++;
        if (H.refsText(wb, s, a).some((x) => x.r1 === 0 && x.c1 === 5 && x.absR)) okAbs++;
      });
      const dyn = whatIf(wb, [[s, 'F1', 0.08]], (c) => B3data.every((r, i) => near(c.value(s, 'C' + (i + 2)), r[1] * 0.08, 0.5)));
      return [
        part('C2:C7 calculan la comisión correctamente', okVal, 6, 2),
        part('Las fórmulas usan referencia absoluta a F1', okAbs, 6, 1),
        it('Al cambiar la tasa en F1 todo se recalcula', dyn, 1),
      ];
    },
  });

  const B4sales = [1250000, 980000, 1430000, 760000, 'sin dato', 1120000, 890000, 1610000, 1040000, 930000];
  const B4names = ['Ana', 'Benjamín', 'Carla', 'Daniel', 'Emilia', 'Francisco', 'Gabriela', 'Héctor', 'Isabel', 'Joaquín'];
  B.push({
    id: 'B4', module: 'Módulo 8 · Funciones básicas', title: 'SUMA, PROMEDIO, MAX, MIN, CONTAR y CONTARA',
    intro: 'Resume las ventas del equipo comercial usando funciones. Observa que una venta dice "sin dato".',
    steps: [
      '<b>E2</b>: total vendido con <code>SUMA</code>.',
      '<b>E3</b>: promedio de ventas con <code>PROMEDIO</code>.',
      '<b>E4</b>: venta más alta con <code>MAX</code>. &nbsp; <b>E5</b>: venta más baja con <code>MIN</code>.',
      '<b>E6</b>: cantidad de ventas numéricas registradas con <code>CONTAR</code> (columna B).',
      '<b>E7</b>: cantidad de vendedores con <code>CONTARA</code> (columna A).',
    ],
    hint: 'Ejemplo: =SUMA(B2:B11). En Excel en español los argumentos se separan con punto y coma (;).',
    setup: () => ({
      sheets: [{
        name: 'Resumen', widths: [110, 110, 30, 260, 120],
        data: [['Vendedor', 'Ventas ($)', null, 'Indicador', 'Resultado'], ...B4names.map((n, i) => {
          const labels = ['Total vendido', 'Promedio de ventas', 'Venta más alta', 'Venta más baja', 'N° de ventas registradas (números)', 'N° de vendedores'];
          return [n, B4sales[i], null, labels[i] || null, null];
        })],
        styles: { 'A1:B1': { bold: true }, 'D1:E1': { bold: true, fill: '#e2efda' }, 'B2:B11': { fmt: 'number', dec: 0 }, 'E2:E5': { fmt: 'number', dec: 0 } },
      }],
    }),
    check: (wb) => {
      const s = 'Resumen';
      const nums = B4sales.filter((x) => typeof x === 'number');
      const exp = [
        ['E2', 'SUMA', sumN(nums), 'Total con SUMA'],
        ['E3', 'PROMEDIO', sumN(nums) / nums.length, 'Promedio con PROMEDIO'],
        ['E4', 'MAX', Math.max(...nums), 'Máximo con MAX'],
        ['E5', 'MIN', Math.min(...nums), 'Mínimo con MIN'],
        ['E6', 'CONTAR', nums.length, 'Conteo de números con CONTAR'],
        ['E7', 'CONTARA', 10, 'Conteo de vendedores con CONTARA'],
      ];
      return exp.map(([a, fn, v, lab]) => it(lab + ' (' + a + ')', H.uses(wb, s, a, fn) && near(H.v(wb, s, a), v, 0.01)));
    },
  });

  const B5data = [['Silla', 'Muebles', 45990, 0.1], ['Escritorio', 'Muebles', 129990, 0.15], ['Lámpara', 'Iluminación', 19990, 0.05], ['Estante', 'Muebles', 59990, 0.2], ['Foco LED', 'Iluminación', 3990, 0]];
  B.push({
    id: 'B5', module: 'Módulos 3 y 4 · Formato de celdas', title: 'Formato de celdas',
    intro: 'Da formato profesional al catálogo de productos.',
    steps: [
      'Aplica <b>negrita</b>, un <b>color de relleno</b> y alineación <b>centrada</b> a los encabezados <b>A1:D1</b>.',
      'Aplica formato <b>Moneda</b> a los precios <b>C2:C6</b>.',
      'Aplica formato <b>Porcentaje</b> a los descuentos <b>D2:D6</b>.',
      'Aplica <b>bordes</b> a toda la tabla <b>A1:D6</b>.',
    ],
    hint: 'Usa la pestaña Inicio: grupos Fuente, Alineación y Número.',
    setup: () => ({ sheets: [{ name: 'Catálogo', widths: [120, 110, 100, 90], data: rowsData(['Producto', 'Categoría', 'Precio', 'Descuento'], B5data) }] }),
    check: (wb) => {
      const s = 'Catálogo';
      const hdr = addrs('A1:D1');
      const all = (cells, f) => cells.filter((a) => f(H.st(wb, s, a))).length;
      return [
        part('Encabezados en negrita', all(hdr, (x) => x.bold), 4),
        part('Encabezados con color de relleno', all(hdr, (x) => x.fill && x.fill !== '#ffffff'), 4),
        part('Encabezados centrados', all(hdr, (x) => x.align === 'center'), 4),
        part('Precios con formato Moneda', all(addrs('C2:C6'), (x) => x.fmt === 'currency'), 5),
        part('Descuentos con formato Porcentaje', all(addrs('D2:D6'), (x) => x.fmt === 'percent'), 5),
        part('Tabla con bordes', all(addrs('A1:D6'), (x) => x.border), 24),
      ];
    },
  });

  const B6sales = [4200000, 3850000, 5100000, 4700000, 6200000, 3600000, 5400000, 4950000, 5800000, 3900000, 6100000, 7200000];
  B.push({
    id: 'B6', module: 'Módulo 4 · Formato condicional sencillo', title: 'Formato condicional',
    intro: 'Destaca automáticamente los meses buenos y malos de ventas.',
    steps: [
      'Selecciona <b>B2:B13</b> y crea una regla de <b>formato condicional</b> que resalte los valores <b>mayores que 5.000.000</b> (relleno verde).',
      'Crea otra regla en <b>B2:B13</b> que resalte los valores <b>menores que 4.000.000</b> (relleno rojo).',
    ],
    hint: 'Inicio > Formato condicional. Escribe el valor sin puntos: 5000000.',
    setup: () => ({ sheets: [{ name: 'Ventas mensuales', widths: [110, 120], data: rowsData(['Mes', 'Ventas'], U.MONTHS.map((m, i) => [m[0].toUpperCase() + m.slice(1), B6sales[i]])), styles: { 'A1:B1': { bold: true }, 'B2:B13': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const sh = wb.sheet('Ventas mensuales');
      const covers = (r) => r.r1 <= 1 && r.r2 >= 12 && r.c1 <= 1 && r.c2 >= 1;
      const numEq = (v, n) => near(U.parseLiteral(v), n, 0.5);
      const gt = sh.cf.find((r) => covers(r) && ((r.type === 'gt' && numEq(r.v1, 5000000)) || (r.type === 'ge' && numEq(r.v1, 5000001))));
      const lt = sh.cf.find((r) => covers(r) && ((r.type === 'lt' && numEq(r.v1, 4000000)) || (r.type === 'le' && numEq(r.v1, 3999999))));
      return [
        it('Regla en B2:B13 para valores mayores que 5.000.000', gt, 1),
        it('Regla en B2:B13 para valores menores que 4.000.000', lt, 1),
      ];
    },
  });

  B.push({
    id: 'B7', module: 'Módulos 5 y 6 · Libros e inserción', title: 'Hojas, columnas y paneles',
    intro: 'Organiza el libro de clientes.',
    steps: [
      'Cambia el nombre de la hoja <b>Hoja1</b> por <b>Clientes</b> (doble clic en la pestaña).',
      'Inserta una hoja nueva y llámala <b>Pedidos</b>.',
      'En la hoja Clientes, inserta una <b>columna entre A y B</b> y escribe <b>RUT</b> en B1.',
      'En la hoja Clientes, <b>inmoviliza la fila superior</b> (Vista > Inmovilizar fila superior).',
    ],
    hint: 'Para insertar una columna, selecciona una celda de la columna B y usa Inicio > Insertar columnas (o clic derecho > Insertar columna).',
    setup: () => ({ sheets: [{ name: 'Hoja1', widths: [140, 110, 110], data: rowsData(['Nombre', 'Ciudad', 'Teléfono'], [['Ana Rojas', 'Santiago', '912345678'], ['Luis Pérez', 'Valparaíso', '987654321'], ['Marta Díaz', 'Concepción', '934567812'], ['Pedro Soto', 'Temuco', '956781234'], ['Rosa Vera', 'La Serena', '923456781']]), styles: { 'A1:C1': { bold: true } } }] }),
    check: (wb) => {
      const c = wb.sheet('Clientes');
      return [
        it('Hoja renombrada como "Clientes"', !!c && !wb.sheet('Hoja1')),
        it('Existe una hoja llamada "Pedidos"', !!wb.sheet('Pedidos')),
        it('Columna RUT insertada entre Nombre y Ciudad', !!c && txt(wb.value(c, 'B1')) === 'rut' && txt(wb.value(c, 'C1')) === 'ciudad' && txt(wb.value(c, 'C2')) === 'santiago' && txt(wb.value(c, 'A2')) === 'ana rojas'),
        it('Fila superior inmovilizada', !!c && c.freeze && c.freeze.r === 1),
      ];
    },
  });

  const B8data = [['Sucursal 1', 'Stgo', 3500000], ['Sucursal 2', 'Valpo', 2100000], ['Sucursal 3', 'Stgo', 4200000], ['Sucursal 4', 'Concepción', 1900000], ['Sucursal 5', 'Stgo', 2800000], ['Sucursal 6', 'Valpo', 1750000], ['Sucursal 7', 'Concepción', 2250000], ['Sucursal 8', 'Stgo', 3100000]];
  B.push({
    id: 'B8', module: 'Módulo 4 · Buscar y reemplazar, comentarios', title: 'Buscar, reemplazar y comentar',
    intro: 'Las ciudades fueron ingresadas con abreviaturas. Corrígelas de una sola vez.',
    steps: [
      'Usa <b>Buscar y reemplazar</b> para cambiar todas las apariciones de <b>Stgo</b> por <b>Santiago</b>.',
      'Reemplaza también <b>Valpo</b> por <b>Valparaíso</b>.',
      'Agrega un <b>comentario</b> en la celda <b>C1</b> que diga: <b>Montos en pesos</b>.',
    ],
    hint: 'Inicio > Buscar y reemplazar (o Ctrl+L). Para el comentario: Revisar > Nuevo comentario.',
    setup: () => ({ sheets: [{ name: 'Sucursales', widths: [110, 120, 110], data: rowsData(['Sucursal', 'Ciudad', 'Ventas'], B8data), styles: { 'A1:C1': { bold: true }, 'C2:C9': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Sucursales';
      const vals = addrs('B2:B9').map((a) => txt(H.v(wb, s, a)));
      const sh = wb.sheet(s);
      return [
        it('"Stgo" reemplazado por "Santiago" en todas las celdas', vals.filter((v) => v === 'santiago').length === 4 && !vals.some((v) => v.includes('stgo')), 1.5),
        it('"Valpo" reemplazado por "Valparaíso"', vals.filter((v) => v === 'valparaiso').length === 2, 1),
        it('Comentario "Montos en pesos" en C1', !!sh.comments.C1 && txt(sh.comments.C1).includes('pesos'), 1),
      ];
    },
  });

  const B9data = [['Carolina Muñoz', 'Finanzas', 1350000], ['Jorge Tapia', 'Ventas', 980000], ['Valentina Rojas', 'Operaciones', 1120000], ['Matías Fuentes', 'Ventas', 1540000], ['Daniela Castro', 'Finanzas', 890000], ['Sebastián Vega', 'Operaciones', 1720000], ['Paula Herrera', 'Ventas', 1260000], ['Tomás Silva', 'Finanzas', 1050000]];
  B.push({
    id: 'B9', module: 'Módulo 9 · Ordenamiento de datos', title: 'Ordenar una base de datos',
    intro: 'Ordena la nómina para revisar los sueldos más altos primero.',
    steps: ['Ordena la tabla completa por <b>Sueldo</b> de <b>mayor a menor</b>, manteniendo cada fila completa (nombre, área y sueldo juntos).'],
    hint: 'Selecciona una celda de la columna Sueldo y usa Datos > Z→A, o Datos > Ordenar.',
    setup: () => ({ sheets: [{ name: 'Personal', widths: [150, 110, 110], data: rowsData(['Nombre', 'Área', 'Sueldo'], B9data), styles: { 'A1:C1': { bold: true, fill: '#dce6f1' }, 'C2:C9': { fmt: 'currency' } } }] }),
    check: (wb) => {
      const s = 'Personal';
      const rows = [2, 3, 4, 5, 6, 7, 8, 9].map((r) => [H.v(wb, s, 'A' + r), H.v(wb, s, 'B' + r), H.v(wb, s, 'C' + r)]);
      const map = new Map(B9data.map((r) => [txt(r[0]), r]));
      const intact = rows.every((r) => { const o = map.get(txt(r[0])); return o && txt(o[1]) === txt(r[1]) && o[2] === r[2]; }) && new Set(rows.map((r) => txt(r[0]))).size === 8;
      const sorted = rows.every((r, i) => i === 0 || (typeof r[2] === 'number' && r[2] <= rows[i - 1][2]));
      return [
        it('Tabla ordenada por sueldo de mayor a menor', sorted && intact, 2),
        it('Cada fila mantiene sus datos (nombre-área-sueldo)', intact && sorted, 1),
        it('Encabezados se mantienen en la fila 1', sorted && txt(H.v(wb, s, 'A1')) === 'nombre' && txt(H.v(wb, s, 'C1')) === 'sueldo', 0.5),
      ];
    },
  });

  const B10data = [['Ignacio León', 'Ventas', 'Santiago'], ['María Paz Ortiz', 'Finanzas', 'Santiago'], ['Cristóbal Reyes', 'Ventas', 'Valparaíso'], ['Josefa Araya', 'Operaciones', 'Concepción'], ['Nicolás Bravo', 'Ventas', 'Santiago'], ['Antonia Garrido', 'Finanzas', 'Temuco'], ['Vicente Molina', 'Operaciones', 'Santiago'], ['Florencia Pino', 'Ventas', 'Concepción'], ['Martín Cáceres', 'Finanzas', 'Valparaíso'], ['Catalina Núñez', 'Operaciones', 'Temuco']];
  B.push({
    id: 'B10', module: 'Módulo 9 · Filtro automático', title: 'Filtro automático',
    intro: 'Necesitas ver solamente al personal del área de Ventas.',
    steps: ['Aplica un <b>filtro automático</b> a la tabla y muestra <b>solo</b> los registros del área <b>Ventas</b>.'],
    hint: 'Datos > Filtro. Luego usa la flecha del encabezado "Área" y deja marcada solo la opción Ventas.',
    setup: () => ({ sheets: [{ name: 'Personal', widths: [150, 110, 110], data: rowsData(['Nombre', 'Área', 'Ciudad'], B10data), styles: { 'A1:C1': { bold: true, fill: '#dce6f1' } } }] }),
    check: (wb) => {
      const sh = wb.sheet('Personal');
      let ok = true;
      for (let r = 1; r <= 10; r++) {
        const isV = txt(wb.getValue(sh.name, r, 1)) === 'ventas';
        if (wb.isRowHidden(sh, r) === isV) ok = false;
      }
      return [
        it('Filtro automático aplicado a la tabla', !!sh.filter && sh.filter.r1 === 0, 1),
        it('Solo se muestran los registros de Ventas', ok, 2),
      ];
    },
  });

  B.push({
    id: 'B11', type: 'quiz', module: 'Repaso de conceptos', title: 'Preguntas rápidas',
    intro: 'Responde las siguientes preguntas sobre el uso de Excel.',
    questions: [
      { q: '¿Cuál es la dirección de la celda ubicada en la columna D, fila 12?', kind: 'text', accept: ['d12'] },
      { q: '¿Qué comando usas para guardar un libro con otro nombre o en otra ubicación?', kind: 'mc', options: ['Guardar', 'Guardar como', 'Exportar a PDF', 'Cerrar libro'], answer: 1 },
      { q: 'Si en C1 tienes la fórmula =A1*B1 y la copias a C2, ¿qué fórmula queda en C2?', kind: 'text', accept: ['=a2*b2', 'a2*b2'] },
      { q: '¿Qué herramienta impide que otras personas modifiquen el contenido de una hoja?', kind: 'mc', options: ['Inmovilizar paneles', 'Ocultar hoja', 'Proteger hoja', 'Vista preliminar'], answer: 2 },
    ],
  });

  /* ============================= INTERMEDIO ============================= */
  const I = [];

  const I1data = [['Rodrigo', 2450000], ['Fernanda', 3120000], ['Ignacio', 1980000], ['Javiera', 2760000], ['Lucas', 3340000], ['Martina', 2210000], ['Benjamín', 2890000], ['Sofía', 3010000]];
  I.push({
    id: 'I1', module: 'Módulo 1 · Nombres de rango', title: 'Nombres de rango',
    intro: 'Usa nombres de rango para que tus fórmulas sean más claras.',
    steps: [
      'Asigna el nombre <b>Ventas</b> al rango <b>B2:B9</b>.',
      'En <b>E2</b> calcula el total usando el nombre: <code>=SUMA(Ventas)</code>.',
      'En <b>E3</b> calcula el promedio usando el nombre <b>Ventas</b>.',
    ],
    hint: 'Selecciona B2:B9, escribe Ventas en el Cuadro de nombres (a la izquierda de la barra de fórmulas) y presiona Enter. También: Fórmulas > Asignar nombre.',
    setup: () => ({ sheets: [{ name: 'Registro', widths: [110, 110, 30, 100, 120], data: [['Vendedor', 'Monto', null, 'Indicador', 'Resultado'], ...I1data.map((r, i) => [r[0], r[1], null, i === 0 ? 'Total' : i === 1 ? 'Promedio' : null, null])], styles: { 'A1:B1': { bold: true }, 'D1:E1': { bold: true }, 'B2:B9': { fmt: 'number', dec: 0 }, 'E2:E3': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const nm = wb.nameRange('Ventas');
      const okName = !!nm && nm.sheet.toLowerCase() === 'registro' && nm.r1 === 1 && nm.r2 === 8 && nm.c1 === 1 && nm.c2 === 1;
      const usesName = (a) => H.refsText(wb, 'Registro', a).some((x) => x.name && txt(x.name) === 'ventas');
      const tot = sumN(I1data.map((r) => r[1]));
      return [
        it('Nombre "Ventas" asignado a B2:B9', okName, 1.5),
        it('E2 calcula el total usando el nombre Ventas', usesName('E2') && near(H.v(wb, 'Registro', 'E2'), tot)),
        it('E3 calcula el promedio usando el nombre Ventas', usesName('E3') && near(H.v(wb, 'Registro', 'E3'), tot / 8)),
      ];
    },
  });

  const I2dates = [[2015, 3, 14], [2018, 11, 2], [2020, 7, 21], [2012, 1, 9], [2022, 9, 30], [2019, 5, 17]];
  const I2names = ['Andrés Lagos', 'Beatriz Mora', 'César Ibarra', 'Daniela Paz', 'Esteban Ruiz', 'Fabiola Cid'];
  I.push({
    id: 'I2', module: 'Módulo 2 · Funciones de fecha', title: 'DÍA, MES, AÑO y HOY',
    intro: 'Extrae información de las fechas de ingreso del personal.',
    steps: [
      'En <b>C2:C7</b> obtén el <b>día</b> de la fecha de ingreso con <code>DIA</code>.',
      'En <b>D2:D7</b> obtén el <b>mes</b> con <code>MES</code>, y en <b>E2:E7</b> el <b>año</b> con <code>AÑO</code>.',
      'En <b>H1</b> muestra la fecha actual con <code>HOY</code>.',
    ],
    hint: 'Ej.: =DIA(B2). Escribe la fórmula en la primera fila y cópiala hacia abajo.',
    setup: () => ({ sheets: [{ name: 'Personal', widths: [130, 120, 60, 60, 70, 30, 110, 110], data: [['Nombre', 'Fecha de ingreso', 'Día', 'Mes', 'Año', null, 'Fecha de hoy:', null], ...I2names.map((n, i) => [n, F.dateToSerial(...I2dates[i])])], styles: { 'A1:E1': { bold: true }, 'G1': { bold: true }, 'B2:B7': { fmt: 'date' } } }] }),
    check: (wb) => {
      const s = 'Personal';
      const col = (L, fn, k) => I2dates.filter((d, i) => H.uses(wb, s, L + (i + 2), fn) && H.v(wb, s, L + (i + 2)) === d[k]).length;
      const h = H.v(wb, s, 'H1');
      return [
        part('Día con DIA', col('C', 'DIA', 2), 6),
        part('Mes con MES', col('D', 'MES', 1), 6),
        part('Año con AÑO', col('E', 'AÑO', 0), 6),
        it('H1 muestra la fecha de hoy con HOY', H.uses(wb, s, 'H1', 'HOY', 'AHORA') && typeof h === 'number' && Math.floor(h) === F.todaySerial()),
      ];
    },
  });

  const I3data = [['maría josé gonzález', 'CL-STGO-0451'], ['juan pablo rojas', 'PE-LIMA-1290'], ['ana lucía fernández', 'AR-BSAS-0077'], ['pedro morales', 'CL-VALPO-3302'], ['camila andrea soto', 'CO-BOG-0918']];
  I.push({
    id: 'I3', module: 'Módulo 3 · Funciones de texto', title: 'Funciones de texto',
    intro: 'El sistema exportó los nombres en minúsculas y los códigos combinados. Ordena la información.',
    steps: [
      '<b>C</b>: nombre con mayúscula inicial usando <code>NOMPROPIO</code>.',
      '<b>D</b>: código de país (2 primeros caracteres del código) con <code>IZQUIERDA</code>.',
      '<b>E</b>: número de cliente (4 últimos caracteres) con <code>DERECHA</code>.',
      '<b>F</b>: cantidad de caracteres del código con <code>LARGO</code>.',
      '<b>G</b>: clave que una país, guion y número (Ej.: <b>CL-0451</b>) con <code>CONCATENAR</code> o el operador <code>&amp;</code>.',
    ],
    hint: 'Ej.: =IZQUIERDA(B2;2) · =D2&"-"&E2',
    setup: () => ({ sheets: [{ name: 'Clientes', widths: [170, 120, 170, 60, 90, 100, 90], data: rowsData(['Nombre (sistema)', 'Código', 'Nombre correcto', 'País', 'N° cliente', 'Largo código', 'Clave'], I3data), styles: { 'A1:G1': { bold: true, fill: '#e2efda' } } }] }),
    check: (wb) => {
      const s = 'Clientes';
      const proper = (x) => x.replace(/(^|\s)(\S)/g, (m, p, l) => p + l.toUpperCase());
      const cnt = (L, fn, f) => I3data.filter((d, i) => (fn ? H.isF(wb, s, L + (i + 2)) && H.uses(wb, s, L + (i + 2), ...fn) : H.isF(wb, s, L + (i + 2))) && f(H.v(wb, s, L + (i + 2)), d)).length;
      return [
        part('Nombres con NOMPROPIO', cnt('C', ['NOMPROPIO'], (v, d) => v === proper(d[0])), 5),
        part('País con IZQUIERDA', cnt('D', ['IZQUIERDA'], (v, d) => v === d[1].slice(0, 2)), 5),
        part('N° cliente con DERECHA', cnt('E', ['DERECHA'], (v, d) => String(v) === d[1].slice(-4)), 5),
        part('Largo del código con LARGO', cnt('F', ['LARGO'], (v, d) => v === d[1].length), 5),
        part('Clave país-número', cnt('G', null, (v, d) => v === d[1].slice(0, 2) + '-' + d[1].slice(-4)), 5),
      ];
    },
  });

  const I4data = [['M-01', 12.678], ['M-02', -3.45], ['M-03', 7.5], ['M-04', -8.919], ['M-05', 15.0049], ['M-06', 2.25]];
  I.push({
    id: 'I4', module: 'Módulo 4 · Funciones matemáticas', title: 'ENTERO, REDONDEAR y TRUNCAR',
    intro: 'Compara las distintas formas de quitar decimales.',
    steps: [
      '<b>C2:C7</b>: valor <b>redondeado a 1 decimal</b> con <code>REDONDEAR</code>.',
      '<b>D2:D7</b>: <b>parte entera</b> con <code>ENTERO</code>.',
      '<b>E2:E7</b>: valor <b>truncado a 1 decimal</b> con <code>TRUNCAR</code>.',
    ],
    hint: 'Ej.: =REDONDEAR(B2;1). Observa la diferencia entre ENTERO y TRUNCAR en los números negativos.',
    setup: () => ({ sheets: [{ name: 'Mediciones', widths: [90, 90, 120, 90, 120], data: rowsData(['Medición', 'Valor', 'Redondeado', 'Entero', 'Truncado'], I4data), styles: { 'A1:E1': { bold: true } } }] }),
    check: (wb) => {
      const s = 'Mediciones';
      const cnt = (L, fn, f) => I4data.filter((d, i) => H.uses(wb, s, L + (i + 2), fn) && near(H.v(wb, s, L + (i + 2)), f(d[1]), 1e-9)).length;
      return [
        part('REDONDEAR a 1 decimal', cnt('C', 'REDONDEAR', (x) => F.roundTo(x, 1)), 6),
        part('ENTERO', cnt('D', 'ENTERO', (x) => Math.floor(x)), 6),
        part('TRUNCAR a 1 decimal', cnt('E', 'TRUNCAR', (x) => Math.trunc(x * 10) / 10), 6),
      ];
    },
  });

  const I5prod = [['P-101', 'Notebook 14"', 549990], ['P-102', 'Mouse inalámbrico', 12990], ['P-103', 'Teclado mecánico', 45990], ['P-104', 'Monitor 24"', 139990], ['P-105', 'Audífonos', 29990], ['P-106', 'Webcam HD', 34990], ['P-107', 'Disco SSD 1TB', 79990], ['P-108', 'Impresora láser', 159990]];
  const I5ord = [['P-104', 2], ['P-101', 1], ['P-107', 3], ['P-102', 5], ['P-106', 2]];
  I.push({
    id: 'I5', module: 'Módulo 4 · Funciones de búsqueda', title: 'BUSCARV',
    intro: 'Completa el pedido buscando los datos en la hoja <b>Productos</b>.',
    steps: [
      'En la hoja <b>Pedido</b>, columna <b>B</b>: obtén el nombre del producto con <code>BUSCARV</code> (coincidencia exacta).',
      'Columna <b>C</b>: obtén el precio con <code>BUSCARV</code>.',
      'Columna <b>E</b>: calcula el subtotal (Precio × Cantidad).',
    ],
    hint: 'Ej.: =BUSCARV(A2;Productos!$A$2:$C$9;2;FALSO). Usa $ para que la tabla no se mueva al copiar.',
    setup: () => ({
      sheets: [
        { name: 'Pedido', widths: [80, 170, 100, 80, 110], data: rowsData(['Código', 'Producto', 'Precio', 'Cantidad', 'Subtotal'], I5ord.map((o) => [o[0], null, null, o[1], null])), styles: { 'A1:E1': { bold: true, fill: '#dce6f1' }, 'C2:C6': { fmt: 'currency' }, 'E2:E6': { fmt: 'currency' } } },
        { name: 'Productos', widths: [80, 170, 100], data: rowsData(['Código', 'Producto', 'Precio'], I5prod), styles: { 'A1:C1': { bold: true }, 'C2:C9': { fmt: 'currency' } } },
      ],
    }),
    check: (wb) => {
      const s = 'Pedido';
      const P = new Map(I5prod.map((p) => [p[0], p]));
      const lk = ['BUSCARV', 'BUSCARX', 'INDICE', 'BUSCARH'];
      const cB = I5ord.filter((o, i) => H.uses(wb, s, 'B' + (i + 2), ...lk) && H.v(wb, s, 'B' + (i + 2)) === P.get(o[0])[1]).length;
      const cC = I5ord.filter((o, i) => H.uses(wb, s, 'C' + (i + 2), ...lk) && H.v(wb, s, 'C' + (i + 2)) === P.get(o[0])[2]).length;
      const cE = I5ord.filter((o, i) => H.isF(wb, s, 'E' + (i + 2)) && near(H.v(wb, s, 'E' + (i + 2)), P.get(o[0])[2] * o[1])).length;
      return [part('Nombres obtenidos con BUSCARV', cB, 5, 1.5), part('Precios obtenidos con BUSCARV', cC, 5, 1.5), part('Subtotales calculados', cE, 5)];
    },
  });

  const I6data = [['Norte', 'Ana', 450000], ['Sur', 'Luis', 320000], ['Centro', 'Marta', 610000], ['Norte', 'Pedro', 280000], ['Centro', 'Rosa', 390000], ['Sur', 'Juan', 510000], ['Norte', 'Clara', 700000], ['Centro', 'Ana', 150000], ['Sur', 'Pedro', 420000], ['Norte', 'Luis', 330000], ['Centro', 'Clara', 560000], ['Sur', 'Rosa', 240000], ['Norte', 'Marta', 380000], ['Centro', 'Juan', 470000]];
  I.push({
    id: 'I6', module: 'Módulo 4 · Recuento condicional', title: 'CONTAR.SI y SUMAR.SI',
    intro: 'Resume las ventas por región.',
    steps: [
      'En <b>G2:G4</b> cuenta cuántas ventas tiene cada región con <code>CONTAR.SI</code>.',
      'En <b>H2:H4</b> suma el monto vendido por cada región con <code>SUMAR.SI</code>.',
    ],
    hint: 'Ej.: =CONTAR.SI($A$2:$A$15;F2) · =SUMAR.SI($A$2:$A$15;F2;$C$2:$C$15)',
    setup: () => ({ sheets: [{ name: 'Ventas', widths: [80, 90, 100, 30, 30, 90, 90, 120], data: [['Región', 'Vendedor', 'Monto', null, null, 'Región', 'N° ventas', 'Monto total'], ...I6data.map((r, i) => [...r, null, null, ['Norte', 'Centro', 'Sur'][i] || null])], styles: { 'A1:C1': { bold: true }, 'F1:H1': { bold: true, fill: '#e2efda' }, 'C2:C15': { fmt: 'number', dec: 0 }, 'H2:H4': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Ventas';
      const regs = ['Norte', 'Centro', 'Sur'];
      const cnt = regs.filter((rg, i) => H.uses(wb, s, 'G' + (i + 2), 'CONTAR.SI', 'CONTAR.SI.CONJUNTO') && H.v(wb, s, 'G' + (i + 2)) === I6data.filter((d) => d[0] === rg).length).length;
      const sm = regs.filter((rg, i) => H.uses(wb, s, 'H' + (i + 2), 'SUMAR.SI', 'SUMAR.SI.CONJUNTO') && near(H.v(wb, s, 'H' + (i + 2)), sumN(I6data.filter((d) => d[0] === rg).map((d) => d[2])))).length;
      return [part('Conteos por región con CONTAR.SI', cnt, 3), part('Montos por región con SUMAR.SI', sm, 3)];
    },
  });

  const I7data = [['Agustín', 6.5, 0.95], ['Bárbara', 3.8, 0.88], ['Cristián', 5.2, 0.92], ['Dominga', 6.1, 0.85], ['Emilio', 4.0, 0.7], ['Francisca', 6.8, 0.98], ['Gaspar', 2.9, 0.6], ['Helena', 6.0, 0.9]];
  I.push({
    id: 'I7', module: 'Módulo 4 · Funciones lógicas', title: 'SI, Y, O y SI anidado',
    intro: 'Evalúa el rendimiento de los alumnos de un curso.',
    steps: [
      '<b>D (Estado)</b>: "Aprobado" si la nota es mayor o igual a 4; si no, "Reprobado".',
      '<b>E (Categoría)</b>: "Destacado" si la nota es ≥ 6; "Suficiente" si es ≥ 4; si no, "Insuficiente" (SI anidado).',
      '<b>F (Beca)</b>: "Sí" si la nota es ≥ 6 <b>y</b> la asistencia es ≥ 90%; si no, "No".',
    ],
    hint: 'Ej.: =SI(B2>=4;"Aprobado";"Reprobado") · =SI(Y(B2>=6;C2>=90%);"Sí";"No")',
    setup: () => ({ sheets: [{ name: 'Notas', widths: [100, 60, 90, 100, 110, 60], data: rowsData(['Alumno', 'Nota', 'Asistencia', 'Estado', 'Categoría', 'Beca'], I7data), styles: { 'A1:F1': { bold: true, fill: '#dce6f1' }, 'C2:C9': { fmt: 'percent' }, 'B2:B9': { dec: 1 } } }] }),
    check: (wb) => {
      const s = 'Notas';
      const st = (n) => (n >= 4 ? 'aprobado' : 'reprobado');
      const cat = (n) => (n >= 6 ? 'destacado' : n >= 4 ? 'suficiente' : 'insuficiente');
      const bec = (n, a) => (n >= 6 && a >= 0.9 ? 'si' : 'no');
      const c = (L, f, fns) => I7data.filter((d, i) => H.uses(wb, s, L + (i + 2), ...fns) && txt(H.v(wb, s, L + (i + 2))) === f(d[1], d[2])).length;
      const nested = I7data.filter((d, i) => (H.inp(wb, s, 'E' + (i + 2)) || '').toUpperCase().split('SI(').length > 2).length;
      return [
        part('Estado con SI', c('D', st, ['SI']), 8),
        part('Categoría con SI anidado', c('E', cat, ['SI']), 8, 1.5),
        part('Beca con SI e Y', c('F', bec, ['Y', 'SI']), 8, 1.5),
        part('La categoría usa funciones SI anidadas', nested, 8, 0.5),
      ];
    },
  });

  I.push({
    id: 'I8', module: 'Módulos 5 y 6 · Gráficos', title: 'Creación de gráficos',
    intro: 'Representa visualmente las ventas.',
    steps: [
      'Crea un <b>gráfico de columnas</b> con los datos <b>A1:B7</b> y ponle el título <b>Ventas primer semestre</b>.',
      'Crea un <b>gráfico circular</b> con los datos de canales <b>D1:E4</b>.',
    ],
    hint: 'Selecciona los datos y usa Insertar > Gráfico.',
    setup: () => ({ sheets: [{ name: 'Ventas', widths: [90, 100, 30, 100, 100], data: [['Mes', 'Ventas', null, 'Canal', 'Ventas'], ['Enero', 4200000, null, 'Tienda', 12500000], ['Febrero', 3900000, null, 'Web', 8300000], ['Marzo', 5100000, null, 'Mayorista', 5600000], ['Abril', 4800000], ['Mayo', 5600000], ['Junio', 6100000]], styles: { 'A1:B1': { bold: true }, 'D1:E1': { bold: true }, 'B2:B7': { fmt: 'number', dec: 0 }, 'E2:E4': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const sh = wb.sheet('Ventas');
      const col = sh.charts.find((c) => (c.type === 'column' || c.type === 'bar') && c.c1 <= 1 && c.c2 >= 1 && c.c2 <= 2 && c.r1 <= 1 && c.r2 >= 6);
      const pie = sh.charts.find((c) => c.type === 'pie' && c.c2 >= 4 && c.c1 >= 3 && c.r1 <= 1 && c.r2 >= 3);
      return [
        it('Gráfico de columnas con los datos de ventas mensuales', !!col, 1.5),
        it('Título "Ventas primer semestre"', !!col && txt(col.title) === 'ventas primer semestre', 0.5),
        it('Gráfico circular con los datos de canales', !!pie, 1),
      ];
    },
  });

  const I9data = [['Norte', 'Notebook', 'Ana', 1250000], ['Sur', 'Tablet', 'Luis', 480000], ['Centro', 'Notebook', 'Marta', 1310000], ['Norte', 'Celular', 'Pedro', 390000], ['Sur', 'Notebook', 'Juan', 1180000], ['Centro', 'Tablet', 'Rosa', 520000], ['Norte', 'Tablet', 'Clara', 450000], ['Centro', 'Celular', 'Ana', 410000], ['Sur', 'Celular', 'Pedro', 370000], ['Norte', 'Notebook', 'Luis', 1290000], ['Centro', 'Notebook', 'Clara', 1220000], ['Sur', 'Tablet', 'Rosa', 505000], ['Norte', 'Celular', 'Marta', 405000], ['Centro', 'Tablet', 'Juan', 470000], ['Sur', 'Notebook', 'Ana', 1260000], ['Norte', 'Tablet', 'Rosa', 495000]];
  const pivotOk = (wb, rowF, valF, agg, colF) => {
    for (const s of wb.sheets) for (const p of s.pivots) {
      if (txt(p.rowField) === txt(rowF) && txt(p.valField) === txt(valF) && p.agg === agg && (colF === undefined || txt(p.colField) === txt(colF))) return p;
    }
    return null;
  };
  I.push({
    id: 'I9', module: 'Módulo 6 · Tablas dinámicas', title: 'Tabla dinámica',
    intro: 'Resume las ventas por región con una tabla dinámica.',
    steps: ['Crea una <b>tabla dinámica</b> con los datos de la hoja <b>Datos</b>: <b>Región</b> en filas y la <b>suma de Monto</b> en valores. Puede quedar en una hoja nueva.'],
    hint: 'Selecciona una celda de la tabla y usa Insertar > Tabla dinámica.',
    setup: () => ({ sheets: [{ name: 'Datos', widths: [80, 100, 90, 100], data: rowsData(['Región', 'Producto', 'Vendedor', 'Monto'], I9data), styles: { 'A1:D1': { bold: true }, 'D2:D17': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const p = pivotOk(wb, 'Región', 'Monto', 'sum');
      const any = wb.sheets.some((s) => s.pivots.length);
      let full = false;
      if (p) { const d = wb.pivotData(p); full = !!d && d.rows.length === 3 && near(d.total, sumN(I9data.map((x) => x[3]))) && p.src.r2 >= 16; }
      return [
        it('Se creó una tabla dinámica', any, 1),
        it('Región en filas y Suma de Monto en valores', !!p, 2),
        it('La tabla dinámica incluye todos los datos', full, 1),
      ];
    },
  });

  const I10data = [['Sur', 'Luis', 320000], ['Norte', 'Ana', 450000], ['Centro', 'Marta', 610000], ['Norte', 'Pedro', 700000], ['Sur', 'Juan', 510000], ['Centro', 'Rosa', 390000], ['Norte', 'Clara', 280000], ['Sur', 'Rosa', 240000], ['Centro', 'Juan', 470000], ['Norte', 'Luis', 330000], ['Sur', 'Pedro', 420000], ['Centro', 'Ana', 150000]];
  I.push({
    id: 'I10', module: 'Módulo 6 · Ordenamiento y filtros', title: 'Ordenamiento por varios niveles',
    intro: 'Organiza las ventas para el informe regional.',
    steps: ['Ordena la tabla por <b>Región</b> (A a Z) y, dentro de cada región, por <b>Monto</b> de <b>mayor a menor</b>.'],
    hint: 'Datos > Ordenar. Agrega un segundo nivel en "Luego por".',
    setup: () => ({ sheets: [{ name: 'Ventas', widths: [90, 100, 100], data: rowsData(['Región', 'Vendedor', 'Monto'], I10data), styles: { 'A1:C1': { bold: true, fill: '#dce6f1' }, 'C2:C13': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Ventas';
      const rows = []; for (let r = 2; r <= 13; r++) rows.push([H.v(wb, s, 'A' + r), H.v(wb, s, 'B' + r), H.v(wb, s, 'C' + r)]);
      const key = (r) => txt(r[0]) + '|' + txt(r[1]) + '|' + r[2];
      const intact = new Set(rows.map(key)).size === 12 && I10data.every((d) => rows.some((r) => key(r) === key(d)));
      let lvl1 = true; let lvl2 = true;
      for (let i = 1; i < rows.length; i++) {
        const a = txt(rows[i - 1][0]); const b = txt(rows[i][0]);
        if (a.localeCompare(b, 'es') > 0) lvl1 = false;
        if (a === b && rows[i][2] > rows[i - 1][2]) lvl2 = false;
      }
      return [it('Primer nivel: Región de A a Z', lvl1 && intact, 1.5), it('Segundo nivel: Monto de mayor a menor dentro de cada región', lvl1 && lvl2 && intact, 1.5)];
    },
  });

  I.push({
    id: 'I11', module: 'Módulos 7 y 8 · Validación de datos', title: 'Validación de datos',
    intro: 'Controla lo que se puede ingresar en el registro de notas.',
    steps: [
      'En <b>B2:B11</b> permite solo números <b>decimales entre 1 y 7</b>.',
      'En <b>C2:C11</b> crea una <b>lista</b> desplegable con las opciones <b>Sí</b> y <b>No</b>.',
      'Prueba la validación: ingresa la nota <b>6,5</b> en B2 y elige <b>Sí</b> en C2.',
    ],
    hint: 'Selecciona el rango y usa Datos > Validación de datos. En Origen escribe: Sí;No',
    setup: () => ({ sheets: [{ name: 'Registro', widths: [130, 70, 80], data: rowsData(['Alumno', 'Nota', 'Asistió'], ['Álvaro', 'Belén', 'Carlos', 'Diana', 'Ernesto', 'Fernanda', 'Gonzalo', 'Hilda', 'Iván', 'Julieta'].map((n) => [n])), styles: { 'A1:C1': { bold: true } } }] }),
    check: (wb) => {
      const sh = wb.sheet('Registro');
      const covers = (r, c) => r.r1 <= 1 && r.r2 >= 10 && r.c1 <= c && r.c2 >= c;
      const dvB = sh.dv.find((r) => covers(r, 1) && (r.type === 'decimal' || r.type === 'whole') && (r.op || 'between') === 'between' && near(U.parseLiteral(r.min), 1) && near(U.parseLiteral(r.max), 7));
      const dvC = sh.dv.find((r) => covers(r, 2) && r.type === 'list' && (() => { const items = wb.dvListItems(sh, r).map(txt).sort(); return items.length === 2 && items[0] === 'no' && items[1] === 'si'; })());
      return [
        it('Validación de nota (decimal entre 1 y 7) en B2:B11', !!dvB && dvB.type === 'decimal', 1.5),
        it('Lista Sí/No en C2:C11', !!dvC, 1.5),
        it('B2 = 6,5 y C2 = Sí', near(wb.value(sh, 'B2'), 6.5) && txt(wb.value(sh, 'C2')) === 'si', 1),
      ];
    },
  });

  const I12data = [['Notebook', 8450000, 15], ['Tablet', 3120000, 12], ['Celular', 5670000, 21], ['Monitor', 0, 0], ['Impresora', 1980000, 9], ['Audífonos', 890000, 34], ['Teclado', 640000, 16], ['Cámara', 2350000, 7]];
  I.push({
    id: 'I12', module: 'Módulos 7 y 8 · Auditoría de fórmulas', title: 'Auditoría y corrección de fórmulas',
    intro: 'Este informe tiene errores. Usa las herramientas de auditoría para encontrarlos y corregirlos.',
    steps: [
      'Revisa las fórmulas con <b>Fórmulas > Comprobación de errores</b> y <b>Rastrear precedentes</b>.',
      'La fórmula del total en <b>B10</b> no suma todas las ventas: corrígela para que sume <b>B2:B9</b>.',
      'Modifica las fórmulas de <b>D2:D9</b> para que, si hay un error, muestren <b>0</b> (usa <code>SI.ERROR</code>).',
    ],
    hint: 'Ej.: =SI.ERROR(B2/C2;0)',
    setup: () => ({ sheets: [{ name: 'Informe', widths: [100, 110, 80, 130], data: [['Producto', 'Ventas', 'Unidades', 'Precio promedio'], ...I12data.map((d, i) => [d[0], d[1], d[2], '=B' + (i + 2) + '/C' + (i + 2)]), ['Total', '=SUMA(B2:B8)', '=SUMA(C2:C9)']], styles: { 'A1:D1': { bold: true, fill: '#dce6f1' }, 'A10:C10': { bold: true }, 'B2:B10': { fmt: 'number', dec: 0 }, 'D2:D9': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Informe';
      const tot = sumN(I12data.map((d) => d[1]));
      const zeroRow = 'D5';
      const iferr = I12data.filter((d, i) => H.uses(wb, s, 'D' + (i + 2), 'SI.ERROR') && near(H.v(wb, s, 'D' + (i + 2)), d[2] ? d[1] / d[2] : 0, 0.5)).length;
      return [
        it('B10 corregido: suma todas las ventas', H.isF(wb, s, 'B10') && near(H.v(wb, s, 'B10'), tot), 1.5),
        it('D5 (sin unidades) muestra 0 usando SI.ERROR', H.uses(wb, s, zeroRow, 'SI.ERROR') && H.v(wb, s, zeroRow) === 0, 1.5),
        part('D2:D9 usan SI.ERROR y calculan bien el precio promedio', iferr, 8, 1),
      ];
    },
  });

  I.push({
    id: 'I13', type: 'quiz', module: 'Repaso de conceptos', title: 'Preguntas rápidas',
    intro: 'Responde las siguientes preguntas.',
    questions: [
      { q: '¿Qué tipo de gráfico es más adecuado para mostrar la participación de cada parte en un total?', kind: 'mc', options: ['Líneas', 'Circular', 'Dispersión', 'Columnas apiladas 3D'], answer: 1 },
      { q: '¿Qué valor se escribe en el 4° argumento de BUSCARV para obtener una coincidencia exacta?', kind: 'text', accept: ['falso', '0', 'false'] },
      { q: '¿Qué herramienta muestra solo las filas que cumplen criterios combinados (Y/O) y puede copiarlas a otro lugar?', kind: 'mc', options: ['Filtro automático', 'Filtro avanzado', 'Subtotales', 'Validación de datos'], answer: 1 },
      { q: 'Escribe la fórmula que cuenta cuántas celdas de A1:A20 contienen exactamente la palabra Norte.', kind: 'formula', accept: ['=CONTAR.SI(A1:A20;"NORTE")', '=COUNTIF(A1:A20;"NORTE")', '=CONTAR.SI.CONJUNTO(A1:A20;"NORTE")'] },
    ],
  });

  /* ============================== AVANZADO ============================== */
  const A = [];

  const A1data = [['Ana', 5200000, 5000000, 3], ['Bruno', 4800000, 5000000, 4], ['Carla', 6100000, 5500000, 1], ['Diego', 5500000, 5500000, 2], ['Elisa', 3900000, 4500000, 5], ['Fabián', 7200000, 6000000, 6], ['Gloria', 4600000, 4500000, 0], ['Hugo', 5000000, 5200000, 2]];
  A.push({
    id: 'A1', module: 'Módulos 1 y 2 · Anidación de funciones', title: 'Funciones anidadas (SI + Y)',
    intro: 'Calcula el bono de cada vendedor con <b>una sola fórmula</b> en E2, copiada hacia abajo.',
    steps: [
      'Si las <b>Ventas ≥ Meta</b> <b>y</b> la <b>Antigüedad ≥ 2</b> años: bono = <b>10%</b> de las ventas.',
      'Si solo se cumple <b>Ventas ≥ Meta</b>: bono = <b>5%</b> de las ventas.',
      'En cualquier otro caso: bono = <b>0</b>.',
    ],
    hint: 'Estructura: =SI(Y(...);...;SI(...;...;0))',
    setup: () => ({ sheets: [{ name: 'Bonos', widths: [90, 100, 100, 100, 100], data: rowsData(['Vendedor', 'Ventas', 'Meta', 'Antigüedad', 'Bono'], A1data), styles: { 'A1:E1': { bold: true, fill: '#dce6f1' }, 'B2:C9': { fmt: 'number', dec: 0 }, 'E2:E9': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Bonos';
      const bono = (v, m, a) => (v >= m && a >= 2 ? v * 0.1 : v >= m ? v * 0.05 : 0);
      const okv = A1data.filter((d, i) => H.isF(wb, s, 'E' + (i + 2)) && near(H.v(wb, s, 'E' + (i + 2)), bono(d[1], d[2], d[3]), 1)).length;
      const nest = A1data.filter((d, i) => H.uses(wb, s, 'E' + (i + 2), 'SI') && (H.uses(wb, s, 'E' + (i + 2), 'Y') || (H.inp(wb, s, 'E' + (i + 2)) || '').toUpperCase().split('SI(').length > 2)).length;
      const dyn = whatIf(wb, [[s, 'B2', 4000000], [s, 'D3', 1], [s, 'B3', 5100000]], (c) => near(c.value(s, 'E2'), 0, 1) && near(c.value(s, 'E3'), 5100000 * 0.05, 1));
      return [part('Bonos correctos', okv, 8, 2), part('Usa funciones anidadas (SI con Y)', nest, 8, 1), it('La fórmula responde a cambios en los datos', dyn, 1)];
    },
  });

  const A2prod = [['Notebook', 549990, 539990, 529990, 499990], ['Tablet', 249990, 239990, 229990, 219990], ['Monitor', 139990, 134990, 129990, 124990], ['Celular', 399990, 389990, 369990, 359990], ['Impresora', 159990, 154990, 149990, 144990], ['Audífonos', 29990, 27990, 26990, 24990]];
  A.push({
    id: 'A2', module: 'Módulos 1 y 2 · Búsqueda y anidación', title: 'Búsqueda bidireccional (INDICE + COINCIDIR)',
    intro: 'Construye un buscador de precios por producto y trimestre.',
    steps: [
      'En <b>H5</b> escribe una fórmula que devuelva el precio del producto indicado en <b>H2</b> para el trimestre indicado en <b>H3</b>.',
      'La fórmula debe actualizarse sola si cambias H2 o H3 (usa <code>INDICE</code> + <code>COINCIDIR</code>, o <code>BUSCARV</code> + <code>COINCIDIR</code>).',
      'Si el producto no existe, debe mostrar el texto <b>No encontrado</b> (usa <code>SI.ERROR</code>).',
    ],
    hint: '=SI.ERROR(INDICE(B2:E7;COINCIDIR(H2;A2:A7;0);COINCIDIR(H3;B1:E1;0));"No encontrado")',
    setup: () => ({ sheets: [{ name: 'Precios', widths: [100, 80, 80, 80, 80, 30, 100, 110], data: [['Producto', 'T1', 'T2', 'T3', 'T4', null, null, null], ...A2prod.map((p, i) => [...p, null, ['Producto:', 'Trimestre:', null, 'Precio:'][i] || null, ['Tablet', 'T3', null, null][i] || null])], styles: { 'A1:E1': { bold: true, fill: '#dce6f1' }, 'B2:E7': { fmt: 'number', dec: 0 }, 'G2:G5': { bold: true }, 'H2:H3': { fill: '#fff2cc' }, 'H5': { fill: '#e2efda', fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Precios';
      const price = (p, t) => { const row = A2prod.find((x) => x[0] === p); return row[{ T1: 1, T2: 2, T3: 3, T4: 4 }[t]]; };
      const cur = H.isF(wb, s, 'H5') && whatIf(wb, [[s, 'H2', 'Tablet'], [s, 'H3', 'T3']], (c) => c.value(s, 'H5') === price('Tablet', 'T3'));
      const d1 = whatIf(wb, [[s, 'H2', 'Monitor'], [s, 'H3', 'T1']], (c) => c.value(s, 'H5') === price('Monitor', 'T1'));
      const d2 = whatIf(wb, [[s, 'H2', 'Audífonos'], [s, 'H3', 'T4']], (c) => c.value(s, 'H5') === price('Audífonos', 'T4'));
      const d3 = whatIf(wb, [[s, 'H2', 'Consola'], [s, 'H3', 'T2']], (c) => txt(c.value(s, 'H5')) === 'no encontrado');
      return [
        it('H5 muestra el precio de Tablet en T3', cur, 1),
        it('Responde al cambiar producto y trimestre (Monitor, T1)', d1, 1),
        it('Responde al cambiar producto y trimestre (Audífonos, T4)', d2, 1),
        it('Muestra "No encontrado" si el producto no existe', d3, 1),
      ];
    },
  });

  const A3data = [['Norte', 'A', 'Ene', 420000], ['Sur', 'B', 'Ene', 310000], ['Centro', 'A', 'Ene', 280000], ['Norte', 'B', 'Feb', 510000], ['Sur', 'A', 'Feb', 290000], ['Centro', 'B', 'Feb', 450000], ['Norte', 'A', 'Mar', 380000], ['Sur', 'B', 'Mar', 470000], ['Centro', 'A', 'Mar', 330000], ['Norte', 'A', 'Abr', 610000], ['Sur', 'A', 'Abr', 350000], ['Centro', 'B', 'Abr', 260000], ['Norte', 'B', 'May', 290000], ['Sur', 'B', 'May', 240000], ['Centro', 'B', 'May', 520000], ['Norte', 'A', 'Jun', 455000], ['Sur', 'A', 'Jun', 315000], ['Centro', 'A', 'Jun', 410000]];
  A.push({
    id: 'A3', module: 'Módulos 1 y 2 · Funciones con varios criterios', title: 'SUMAR.SI.CONJUNTO y CONTAR.SI.CONJUNTO',
    intro: 'Responde las consultas de gerencia usando funciones con múltiples criterios.',
    steps: [
      '<b>H2</b>: monto total de la región <b>Norte</b> para el producto <b>A</b>.',
      '<b>H3</b>: cantidad de ventas de la región <b>Sur</b> con monto <b>mayor a 300.000</b>.',
      '<b>H4</b>: promedio de montos de la región <b>Centro</b> para el producto <b>B</b>.',
    ],
    hint: 'Ej.: =SUMAR.SI.CONJUNTO(D2:D19;A2:A19;"Norte";B2:B19;"A") · =CONTAR.SI.CONJUNTO(A2:A19;"Sur";D2:D19;">300000")',
    setup: () => ({ sheets: [{ name: 'Ventas', widths: [80, 80, 60, 100, 30, 30, 290, 110], data: [['Región', 'Producto', 'Mes', 'Monto', null, null, 'Consulta', 'Resultado'], ...A3data.map((d, i) => [...d, null, null, ['Monto Norte - Producto A', 'N° ventas Sur con monto > 300.000', 'Promedio Centro - Producto B'][i] || null])], styles: { 'A1:D1': { bold: true }, 'G1:H1': { bold: true, fill: '#e2efda' }, 'D2:D19': { fmt: 'number', dec: 0 }, 'H2': { fmt: 'number', dec: 0 }, 'H4': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Ventas';
      const e1 = sumN(A3data.filter((d) => d[0] === 'Norte' && d[1] === 'A').map((d) => d[3]));
      const e2 = A3data.filter((d) => d[0] === 'Sur' && d[3] > 300000).length;
      const c3 = A3data.filter((d) => d[0] === 'Centro' && d[1] === 'B').map((d) => d[3]);
      const e3 = sumN(c3) / c3.length;
      const multi = ['SUMAR.SI.CONJUNTO', 'CONTAR.SI.CONJUNTO', 'PROMEDIO.SI.CONJUNTO', 'SUMAPRODUCTO'];
      return [
        it('H2: monto Norte - Producto A', H.uses(wb, s, 'H2', ...multi) && near(H.v(wb, s, 'H2'), e1)),
        it('H3: ventas Sur sobre 300.000', H.uses(wb, s, 'H3', ...multi) && H.v(wb, s, 'H3') === e2),
        it('H4: promedio Centro - Producto B', H.uses(wb, s, 'H4', ...multi, 'PROMEDIO.SI') && near(H.v(wb, s, 'H4'), e3, 1)),
      ];
    },
  });

  A.push({
    id: 'A4', module: 'Módulo 3 · Manejo de escenarios', title: 'Administrador de escenarios',
    intro: 'Analiza cómo cambia la utilidad en distintos escenarios de precio y unidades vendidas.',
    steps: [
      'Usa <b>Datos > Análisis de hipótesis (Escenarios)</b> para crear el escenario <b>Optimista</b>: celdas cambiantes <b>B1:B2</b>, con Precio <b>15000</b> y Unidades <b>1200</b>.',
      'Crea el escenario <b>Pesimista</b> (B1:B2): Precio <b>10000</b> y Unidades <b>700</b>.',
      'Finalmente, <b>muestra</b> el escenario <b>Optimista</b>.',
    ],
    hint: 'En el Administrador de escenarios usa Agregar…, luego selecciona el escenario y presiona Mostrar.',
    setup: () => ({ sheets: [{ name: 'Modelo', widths: [170, 120], data: [['Precio unitario', 12000], ['Unidades vendidas', 900], ['Costo unitario', 7000], ['Costos fijos', 2500000], [], ['Utilidad', '=B1*B2-B3*B2-B4']], styles: { 'A1:A6': { bold: true }, 'B1:B2': { fill: '#fff2cc' }, 'B1': { fmt: 'currency' }, 'B3:B4': { fmt: 'currency' }, 'B6': { fmt: 'currency', bold: true } } }] }),
    check: (wb) => {
      const find = (n) => wb.scenarios.find((x) => txt(x.name) === txt(n));
      const okSc = (sc, p, u) => {
        if (!sc) return false;
        const m = {}; sc.cells.forEach((a, i) => { m[a.replace(/\$/g, '')] = U.parseLiteral(sc.values[i]); });
        return near(m.B1, p) && near(m.B2, u);
      };
      return [
        it('Escenario Optimista (15000 / 1200)', okSc(find('Optimista'), 15000, 1200), 1.5),
        it('Escenario Pesimista (10000 / 700)', okSc(find('Pesimista'), 10000, 700), 1.5),
        it('Se muestra el escenario Optimista en la hoja', near(wb.value('Modelo', 'B1'), 15000) && near(wb.value('Modelo', 'B2'), 1200) && H.isF(wb, 'Modelo', 'B6'), 1),
      ];
    },
  });

  const A5prod = ['Notebook', 'Tablet', 'Celular', 'Monitor', 'Impresora'];
  const A5vals = { Norte: [32, 18, 45, 12, 9], Centro: [41, 22, 52, 15, 11], Sur: [27, 14, 38, 10, 7] };
  A.push({
    id: 'A5', module: 'Módulo 4 · Consolidación de datos', title: 'Consolidar datos de varias hojas',
    intro: 'Cada sucursal registra sus unidades vendidas en su propia hoja. Consolida el total en la hoja <b>Consolidado</b>.',
    steps: [
      'En la hoja <b>Consolidado</b>, completa <b>B2:B6</b> con la suma de las unidades de las hojas <b>Norte</b>, <b>Centro</b> y <b>Sur</b>.',
      'Los totales deben quedar <b>vinculados</b>: si cambia un dato en una sucursal, el consolidado debe actualizarse.',
    ],
    hint: 'Opción 1: selecciona B2 en Consolidado y usa Datos > Consolidar (marca "Crear vínculos con los datos de origen"). Opción 2: fórmula =Norte!B2+Centro!B2+Sur!B2',
    setup: () => ({
      sheets: [
        { name: 'Consolidado', widths: [120, 110], data: rowsData(['Producto', 'Total unidades'], A5prod.map((p) => [p])), styles: { 'A1:B1': { bold: true, fill: '#e2efda' } } },
        ...['Norte', 'Centro', 'Sur'].map((n) => ({ name: n, widths: [120, 100], data: rowsData(['Producto', 'Unidades'], A5prod.map((p, i) => [p, A5vals[n][i]])), styles: { 'A1:B1': { bold: true } } })),
      ],
    }),
    check: (wb) => {
      const s = 'Consolidado';
      const ok = A5prod.filter((p, i) => H.v(wb, s, 'B' + (i + 2)) === A5vals.Norte[i] + A5vals.Centro[i] + A5vals.Sur[i]).length;
      const dyn = whatIf(wb, [['Norte', 'B2', 100], ['Sur', 'B6', 50]], (c) => c.value(s, 'B2') === 100 + A5vals.Centro[0] + A5vals.Sur[0] && c.value(s, 'B6') === A5vals.Norte[4] + A5vals.Centro[4] + 50);
      return [part('Totales consolidados correctos', ok, 5, 2), it('Consolidado vinculado a las hojas de origen', dyn, 1.5)];
    },
  });

  const A6data = [['Ana', 'Norte', 'Notebook', 620000], ['Luis', 'Sur', 'Tablet', 310000], ['Marta', 'Centro', 'Celular', 450000], ['Pedro', 'Norte', 'Tablet', 380000], ['Juan', 'Sur', 'Notebook', 710000], ['Rosa', 'Norte', 'Celular', 540000], ['Clara', 'Centro', 'Tablet', 290000], ['Diego', 'Sur', 'Tablet', 265000], ['Elena', 'Norte', 'Notebook', 495000], ['Fabián', 'Centro', 'Notebook', 830000], ['Gloria', 'Sur', 'Celular', 410000], ['Hugo', 'Norte', 'Tablet', 720000], ['Irene', 'Sur', 'Tablet', 345000], ['Jaime', 'Centro', 'Celular', 505000], ['Karen', 'Norte', 'Celular', 330000], ['Lorenzo', 'Sur', 'Notebook', 560000]];
  A.push({
    id: 'A6', module: 'Módulos 5 y 6 · Filtros avanzados', title: 'Filtro avanzado con criterios múltiples',
    intro: 'Extrae las ventas que cumplen condiciones combinadas.',
    steps: [
      'Arma un <b>rango de criterios</b> (por ejemplo en <b>G1:I3</b>, con los encabezados Región, Producto y Monto) para obtener las ventas que cumplan:',
      '(Región <b>Norte</b> <b>y</b> Monto <b>&gt; 500000</b>) <b>o</b> (Región <b>Sur</b> <b>y</b> Producto <b>Tablet</b>).',
      'Usa <b>Datos > Avanzadas</b> y <b>copia el resultado a partir de la celda G6</b>.',
    ],
    hint: 'Criterios en la misma fila = Y. Criterios en filas distintas = O. Ejemplo: G2: Norte · I2: >500000 · G3: Sur · H3: Tablet',
    setup: () => ({ sheets: [{ name: 'Ventas', widths: [90, 80, 90, 90, 30, 30, 90, 90, 90, 90], data: rowsData(['Vendedor', 'Región', 'Producto', 'Monto'], A6data), styles: { 'A1:D1': { bold: true, fill: '#dce6f1' }, 'D2:D17': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const s = 'Ventas';
      const exp = A6data.filter((d) => (d[1] === 'Norte' && d[3] > 500000) || (d[1] === 'Sur' && d[2] === 'Tablet'));
      const hdr = ['vendedor', 'región', 'producto', 'monto'].map(txt);
      const gotH = ['G6', 'H6', 'I6', 'J6'].map((a) => txt(H.v(wb, s, a)));
      const rows = [];
      for (let r = 7; r < 40; r++) {
        const a = H.v(wb, s, 'G' + r);
        if (a == null || a === '') break;
        rows.push([H.v(wb, s, 'G' + r), H.v(wb, s, 'H' + r), H.v(wb, s, 'I' + r), H.v(wb, s, 'J' + r)]);
      }
      const key = (r) => r.map((x) => (typeof x === 'number' ? x : txt(x))).join('|');
      const same = rows.length === exp.length && rows.every((r, i) => key(r) === key(exp[i]));
      const someRight = rows.filter((r) => exp.some((e) => key(e) === key(r))).length;
      return [
        it('Encabezados copiados a partir de G6', gotH.join('|') === hdr.join('|'), 0.5),
        it('Resultado exacto: ' + exp.length + ' registros que cumplen los criterios', same, 2.5),
        part('Registros correctos encontrados', Math.min(someRight, exp.length), exp.length, 1),
      ];
    },
  });

  const A7prod = [['Notebook', 549990], ['Monitor', 139990], ['Tablet', 249990], ['Celular', 399990], ['Impresora', 159990]];
  A.push({
    id: 'A7', module: 'Módulos 5 y 6 · Formularios con cuadros de controles', title: 'Cotizador con controles de formulario',
    intro: 'Crea un pequeño cotizador interactivo con controles de formulario.',
    steps: [
      'Usa <b>Programador > Cuadro combinado</b> para insertar una lista con el rango de entrada <b>A2:A6</b> y la celda vinculada <b>E2</b>. Luego elige <b>Tablet</b> en el control.',
      'En <b>E3</b> muestra el precio del producto elegido con <code>=INDICE(B2:B6;E2)</code>.',
      'Inserta un <b>Control de número</b> vinculado a <b>E4</b> (mínimo 1, máximo 10) y úsalo para dejar la cantidad en <b>3</b>.',
      'En <b>E5</b> calcula el total (precio × cantidad).',
    ],
    hint: 'Selecciona primero una celda vacía donde quieras ubicar el control (por ejemplo G2) y luego inserta el control.',
    setup: () => ({ sheets: [{ name: 'Cotizador', widths: [110, 100, 30, 190, 110], data: [['Producto', 'Precio', null, 'Cotización', null], ...A7prod.map((p, i) => [...p, null, ['Producto elegido (índice):', 'Precio:', 'Cantidad:', 'Total:'][i] || null])], styles: { 'A1:B1': { bold: true }, 'D1': { bold: true }, 'B2:B6': { fmt: 'currency' }, 'E3': { fmt: 'currency' }, 'E5': { fmt: 'currency', bold: true }, 'E2:E5': { fill: '#fff2cc' } } }] }),
    check: (wb) => {
      const sh = wb.sheet('Cotizador');
      const s = sh.name;
      const eqRg = (str, ref) => { const a = F.parseRange(str || ''); const b = F.parseRange(ref); return a && a.r1 === b.r1 && a.r2 === b.r2 && a.c1 === b.c1 && a.c2 === b.c2; };
      const combo = sh.controls.find((c) => c.type === 'combo' && eqRg(c.range, 'A2:A6') && eqRg(c.link, 'E2'));
      const spin = sh.controls.find((c) => c.type === 'spin' && eqRg(c.link, 'E4') && Number(c.min) === 1 && Number(c.max) === 10);
      const dynE3 = H.isF(wb, s, 'E3') && whatIf(wb, [[s, 'E2', 1]], (c) => c.value(s, 'E3') === A7prod[0][1]) && whatIf(wb, [[s, 'E2', 4]], (c) => c.value(s, 'E3') === A7prod[3][1]);
      const dynE5 = H.isF(wb, s, 'E5') && whatIf(wb, [[s, 'E2', 2], [s, 'E4', 5]], (c) => c.value(s, 'E5') === A7prod[1][1] * 5);
      return [
        it('Cuadro combinado con rango A2:A6 vinculado a E2', !!combo, 1),
        it('Tablet seleccionado (E2 = 3)', H.v(wb, s, 'E2') === 3, 0.5),
        it('E3 muestra el precio del producto elegido', dynE3, 1),
        it('Control de número vinculado a E4 (1 a 10)', !!spin, 1),
        it('Cantidad en 3', H.v(wb, s, 'E4') === 3, 0.5),
        it('E5 calcula el total', dynE5, 1),
      ];
    },
  });

  A.push({
    id: 'A8', module: 'Módulo 7 · Macros en Excel', title: 'Grabar y ejecutar una macro',
    intro: 'Automatiza el formato de los encabezados del reporte.',
    steps: [
      'Selecciona <b>A1:E1</b> y usa <b>Programador > Grabar macro</b> con el nombre <b>FormatoEncabezado</b>.',
      'Mientras graba, aplica <b>negrita</b>, un <b>color de relleno</b> y alineación <b>centrada</b>. Luego <b>detén la grabación</b>.',
      'Selecciona <b>A10:E10</b> y <b>ejecuta</b> la macro desde <b>Programador > Macros</b>.',
    ],
    hint: 'La macro graba las acciones de formato que realizas. Al ejecutarla, se aplican sobre la selección actual.',
    setup: () => ({ sheets: [{ name: 'Reporte', widths: [100, 100, 100, 100, 100], data: [['Mes', 'Ingresos', 'Gastos', 'Utilidad', 'Margen'], ['Enero', 5200000, 3900000, '=B2-C2', '=D2/B2'], ['Febrero', 4800000, 3700000, '=B3-C3', '=D3/B3'], ['Marzo', 6100000, 4200000, '=B4-C4', '=D4/B4'], [], [], [], [], ['Resumen trimestral'], ['Indicador', 'Mínimo', 'Máximo', 'Promedio', 'Total'], ['Ingresos', '=MIN(B2:B4)', '=MAX(B2:B4)', '=PROMEDIO(B2:B4)', '=SUMA(B2:B4)']], styles: { 'B2:D4': { fmt: 'number', dec: 0 }, 'E2:E4': { fmt: 'percent' }, 'B11:E11': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const mc = wb.macros.find((m) => txt(m.name) === 'formatoencabezado');
      const keys = mc ? mc.steps.filter((x) => x.op === 'style').reduce((o, x) => Object.assign(o, x.patch), {}) : {};
      const ran = wb.macroRuns.some((r) => txt(r.name) === 'formatoencabezado' && (() => { const rg = F.parseRange(r.range); return rg && rg.r1 <= 9 && rg.r2 >= 9 && rg.c1 === 0 && rg.c2 >= 4 && txt(r.sheet) === 'reporte'; })());
      const fmtd = addrs('A10:E10').every((a) => { const st = H.st(wb, 'Reporte', a); return st.bold && st.fill; });
      return [
        it('Macro "FormatoEncabezado" grabada', !!mc, 1),
        it('La macro aplica negrita, relleno y centrado', !!mc && keys.bold && keys.fill && keys.align === 'center', 1),
        it('La macro se ejecutó sobre A10:E10', ran, 1),
        it('A10:E10 quedó con el formato', fmtd, 0.5),
      ];
    },
  });

  A.push({
    id: 'A9', module: 'Módulos 1 y 2 · Repaso de tablas dinámicas', title: 'Tabla dinámica de doble entrada',
    intro: 'Analiza el promedio de venta por producto y región.',
    steps: ['Crea una <b>tabla dinámica</b> con <b>Producto</b> en filas, <b>Región</b> en columnas y el <b>Promedio de Monto</b> en valores.'],
    hint: 'Insertar > Tabla dinámica. En "Resumir valores por" elige Promedio.',
    setup: () => ({ sheets: [{ name: 'Datos', widths: [80, 100, 90, 100], data: rowsData(['Región', 'Producto', 'Vendedor', 'Monto'], I9data), styles: { 'A1:D1': { bold: true }, 'D2:D17': { fmt: 'number', dec: 0 } } }] }),
    check: (wb) => {
      const any = wb.sheets.some((s) => s.pivots.length);
      const p1 = pivotOk(wb, 'Producto', 'Monto', 'avg');
      const p2 = pivotOk(wb, 'Producto', 'Monto', 'avg', 'Región');
      return [it('Se creó una tabla dinámica', any, 0.5), it('Producto en filas con Promedio de Monto', !!p1, 1.5), it('Región en columnas', !!p2, 1)];
    },
  });

  A.push({
    id: 'A10', type: 'quiz', module: 'Repaso de conceptos', title: 'Preguntas rápidas',
    intro: 'Responde las siguientes preguntas.',
    questions: [
      { q: '¿Con qué extensión debes guardar un libro para conservar sus macros?', kind: 'text', accept: ['xlsm', '.xlsm'] },
      { q: '¿Qué hace la instrucción VBA  Range("A1").Value = 100 ?', kind: 'mc', options: ['Selecciona la celda A1', 'Escribe el valor 100 en la celda A1', 'Suma 100 al valor de A1', 'Cambia el ancho de la columna A a 100'], answer: 1 },
      { q: 'Si la fórmula =$B$2*C2 se copia una fila hacia abajo, ¿qué fórmula resulta?', kind: 'mc', options: ['=$B$3*C3', '=$B$2*C3', '=$B$2*C2', '=B3*C3'], answer: 1 },
      { q: '¿Qué herramienta permite guardar distintos conjuntos de valores de entrada y alternar entre ellos para comparar resultados?', kind: 'mc', options: ['Buscar objetivo', 'Administrador de escenarios', 'Consolidar', 'Tabla de datos'], answer: 1 },
    ],
  });

  /* ----------------------------- Cuestionarios ----------------------------- */
  function normFormula(s) {
    return String(s || '').trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '').replace(/,/g, ';').replace(/\$/g, '').replace(/^([^=])/, '=$1');
  }
  function checkQuiz(task, answers) {
    return task.questions.map((q, i) => {
      const a = answers ? answers[i] : null;
      let ok = false;
      if (q.kind === 'mc') ok = a != null && Number(a) === q.answer;
      else if (q.kind === 'formula') ok = q.accept.map(normFormula).includes(normFormula(a));
      else ok = q.accept.map(txt).includes(txt(a));
      return it('P' + (i + 1) + ': ' + q.q.slice(0, 70) + (q.q.length > 70 ? '…' : ''), ok, 1);
    });
  }

  /** Evalúa una actividad: devuelve {score (0..1), items} */
  function grade(task, state) {
    let items;
    try {
      if (task.type === 'quiz') items = checkQuiz(task, state && state.answers);
      else {
        const wb = state && state.wb ? new W(state.wb) : new W(task.setup());
        items = task.check(wb);
      }
    } catch (e) {
      console.error('Error al evaluar', task.id, e);
      items = [it('No se pudo evaluar la actividad', false, 1)];
    }
    const tw = items.reduce((s, x) => s + x.w, 0);
    const got = items.reduce((s, x) => s + x.w * (x.f != null ? x.f : x.ok ? 1 : 0), 0);
    return { score: tw ? got / tw : 0, items };
  }

  global.XLTasks = {
    levels: [
      { id: 'basico', name: 'Básico', course: 'Herramientas de Microsoft Excel nivel básico', tasks: B },
      { id: 'intermedio', name: 'Intermedio', course: 'Herramientas de Microsoft Excel nivel intermedio', tasks: I },
      { id: 'avanzado', name: 'Avanzado', course: 'Herramientas de Microsoft Excel nivel avanzado', tasks: A },
    ],
    grade,
  };
})(typeof window !== 'undefined' ? window : globalThis);
