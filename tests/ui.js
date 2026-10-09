const { chromium } = require('playwright');
const SHOT = process.env.SHOTS || '/tmp';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.stack));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', (d) => d.accept());
  await page.goto('http://localhost:8765/index.html');
  await page.screenshot({ path: SHOT + '/01-inicio.png' });
  await page.fill('input[name=nombre]', 'María');
  await page.fill('input[name=apellido]', 'Pérez');
  await page.fill('input[name=correo]', 'maria.perez@ejemplo.cl');
  await page.check('input[name=acepto]');
  await page.click('button[type=submit]');
  await page.screenshot({ path: SHOT + '/02-nivel.png' });
  await page.click('#go-level');
  const td = (a) => { const m = /([A-Z]+)(\d+)/.exec(a); const c = m[1].charCodeAt(0) - 65; return `td[data-r="${+m[2] - 1}"][data-c="${c}"]`; };
  const val = (a, sheet) => page.evaluate(([a, sheet]) => { const u = __sim.ui; const v = u.wb.value(sheet || u.sh.name, a); return v && v.code ? v.code : v; }, [a, sheet]);
  const inp = (a) => page.evaluate((a) => { const c = __sim.ui.wb.cell(__sim.ui.sh.name, a); return c ? c.input : null; }, a);
  const log = (...x) => console.log(...x);

  // ---- B1: escritura con teclado
  await page.click(td('A5'));
  await page.keyboard.type('Teclado'); await page.keyboard.press('Tab');
  await page.keyboard.type('15'); await page.keyboard.press('Tab');
  await page.keyboard.type('12990'); await page.keyboard.press('Enter');
  await page.click(td('B3')); await page.keyboard.type('10'); await page.keyboard.press('Enter');
  log('B1:', await val('A5'), await val('B5'), await val('C5'), await val('B3'));
  await page.screenshot({ path: SHOT + '/03-b1.png' });

  // ---- B2: fórmula escrita, relleno arrastrando, modo apuntar
  await page.click('#btn-next');
  await page.click(td('D2')); await page.keyboard.type('=b2*c2'); await page.keyboard.press('Enter');
  await page.click(td('D2'));
  const h = await page.locator('.xl-handle').boundingBox();
  const d6 = await page.locator(td('D6')).boundingBox();
  await page.mouse.move(h.x + 3, h.y + 3); await page.mouse.down();
  await page.mouse.move(d6.x + 20, d6.y + 10, { steps: 5 }); await page.mouse.up();
  log('B2 fill D6:', await inp('D6'), await val('D6'));
  await page.click(td('D7')); await page.keyboard.type('=SUMA(');
  const d2 = await page.locator(td('D2')).boundingBox();
  await page.mouse.move(d2.x + 10, d2.y + 10); await page.mouse.down();
  await page.mouse.move(d6.x + 10, d6.y + 10, { steps: 4 }); await page.mouse.up();
  await page.keyboard.type(')'); await page.keyboard.press('Enter');
  log('B2 D7:', await inp('D7'), await val('D7'));
  // error de sintaxis
  await page.click(td('E2')); await page.keyboard.type('=SUMA(A1;B1))'); await page.keyboard.press('Enter');
  log('Alerta sintaxis visible:', await page.locator('.xl-modal').count());
  await page.screenshot({ path: SHOT + '/04-sintaxis.png' });
  await page.click('.xl-modal .pri'); await page.keyboard.press('Escape');

  // ---- B3: F4 para absoluta
  await page.click('#btn-next');
  await page.click(td('C2')); await page.keyboard.type('=B2*F1'); await page.keyboard.press('F4'); await page.keyboard.press('Enter');
  log('B3 C2:', await inp('C2'), await val('C2'));

  // ---- B5: formato vía cinta
  await page.click('.tl[data-i="4"]');
  const a1 = await page.locator(td('A1')).boundingBox(); const dd1 = await page.locator(td('D1')).boundingBox();
  await page.mouse.move(a1.x + 5, a1.y + 5); await page.mouse.down(); await page.mouse.move(dd1.x + 5, dd1.y + 5, { steps: 3 }); await page.mouse.up();
  await page.click('.xl-rbtn[data-cmd=bold]');
  await page.click('.xl-rbtn[data-cmd=alignC]');
  await page.click('.xl-rbtn[data-cmd=fill]'); await page.click('.xl-colors .grid button >> nth=5');
  await page.screenshot({ path: SHOT + '/05-formato.png' });
  log('B5 A1 style:', JSON.stringify(await page.evaluate(() => __sim.ui.wb.cell(__sim.ui.sh.name, 'B1').style)));

  // ---- B6: formato condicional por diálogo
  await page.click('.tl[data-i="5"]');
  await page.click(td('B2')); await page.click(td('B13'), { modifiers: ['Shift'] });
  await page.click('.xl-rbtn[data-cmd=cf]');
  await page.fill('.xl-form input >> nth=1', '5000000');
  await page.screenshot({ path: SHOT + '/06-cf-dialog.png' });
  await page.click('.xl-dfoot .pri');
  log('B6 cf:', JSON.stringify(await page.evaluate(() => __sim.ui.sh.cf)));
  await page.screenshot({ path: SHOT + '/07-cf.png' });

  // ---- B7: renombrar hoja por doble clic, nueva hoja, insertar columna, inmovilizar
  await page.click('.tl[data-i="6"]');
  await page.dblclick('.xl-stab >> nth=0');
  await page.fill('.xl-stab-edit', 'Clientes'); await page.keyboard.press('Enter');
  await page.click(td('B2'));
  await page.click('.xl-rbtn[data-cmd=insertCol]');
  await page.click(td('B1')); await page.keyboard.type('RUT'); await page.keyboard.press('Enter');
  await page.click('.xl-rtab:has-text("Vista")'); await page.click('.xl-rbtn[data-cmd=freezeRow]');
  await page.click('.xl-sadd');
  await page.dblclick('.xl-stab >> nth=1'); await page.fill('.xl-stab-edit', 'Pedidos'); await page.keyboard.press('Enter');
  log('B7 hojas:', await page.evaluate(() => __sim.ui.wb.sheets.map((s) => s.name).join(',')));

  // ---- B9 ordenar Z→A desde Datos
  await page.click('.tl[data-i="8"]');
  await page.click(td('C3'));
  await page.click('.xl-rtab:has-text("Datos")'); await page.click('.xl-rbtn[data-cmd=sortDesc]');
  log('B9 primero:', await val('A2'), await val('C2'));

  // ---- B10 filtro con ventana emergente
  await page.click('.tl[data-i="9"]');
  await page.click(td('A3'));
  await page.click('.xl-rbtn[data-cmd=filter] >> nth=0');
  await page.click('.fbtn[data-fc="1"]');
  await page.click('.xl-fpop .all input');
  await page.click('.xl-fpop label:has-text("Ventas") input');
  await page.screenshot({ path: SHOT + '/08-filtro.png' });
  await page.click('.xl-fpop .btns .pri');
  await page.screenshot({ path: SHOT + '/09-filtrado.png' });

  // ---- B8 buscar y reemplazar (atajo Ctrl+L)
  await page.click('.tl[data-i="7"]');
  await page.click(td('A1'));
  await page.keyboard.press('Control+l');
  await page.fill('.xl-form input >> nth=0', 'Stgo'); await page.fill('.xl-form input >> nth=1', 'Santiago');
  await page.click('.xl-dfoot button:has-text("Reemplazar todos")');
  log('B8 msg:', await page.textContent('.xl-form .err'));
  await page.click('.xl-dfoot .pri');

  // ---- Quiz
  await page.click('.tl[data-i="10"]');
  await page.fill('.qtext[data-i="0"]', 'D12');
  await page.check('input[name=q1][value="1"]');
  await page.screenshot({ path: SHOT + '/10-quiz.png' });

  // ---- Finalizar nivel
  await page.click('#btn-finish');
  await page.click('#app-modal .pri');
  await page.screenshot({ path: SHOT + '/11-resultado-nivel.png' });
  const lv = await page.evaluate(() => __sim.S.levels.basico);
  log('Básico %:', Math.round(lv.pct), lv.tasks.map((t) => t.id + ':' + Math.round(t.score * 100)).join(' '));
  const goNext = await page.locator('#go-next').count();
  log('¿Continúa?', goNext);
  if (goNext) {
    await page.click('#go-next'); await page.click('#go-level');
    // I1: nombre via cuadro de nombres
    await page.click(td('B2')); await page.click(td('B9'), { modifiers: ['Shift'] });
    await page.fill('.xl-namebox', 'Ventas'); await page.keyboard.press('Enter');
    await page.click(td('E2')); await page.keyboard.type('=SUMA(Ventas)'); await page.keyboard.press('Enter');
    log('I1 E2:', await val('E2'), JSON.stringify(await page.evaluate(() => __sim.ui.wb.names)));
    // I8 chart via dialog
    await page.click('.tl[data-i="7"]');
    await page.click(td('A2'));
    await page.click('.xl-rtab:has-text("Insertar")'); await page.click('.xl-rbtn[data-cmd=chart]');
    await page.fill('.xl-form input >> nth=1', 'Ventas primer semestre');
    await page.click('.xl-dfoot .pri');
    await page.screenshot({ path: SHOT + '/12-grafico.png' });
    // I9 pivot via dialog
    await page.click('.tl[data-i="8"]');
    await page.click(td('A2'));
    await page.click('.xl-rtab:has-text("Insertar")'); await page.click('.xl-rbtn[data-cmd=pivot]');
    await page.screenshot({ path: SHOT + '/13-pivot-dialog.png' });
    await page.click('.xl-dfoot .pri');
    await page.screenshot({ path: SHOT + '/14-pivot.png' });
    log('I9 pivots:', await page.evaluate(() => __sim.ui.wb.sheets.map((s) => s.name + ':' + s.pivots.length).join(',')));
    // I11 validation via dialog
    await page.click('.tl[data-i="10"]');
    await page.click(td('C2')); await page.click(td('C11'), { modifiers: ['Shift'] });
    await page.click('.xl-rtab:has-text("Datos")'); await page.click('.xl-rbtn[data-cmd=dataValidation]');
    await page.selectOption('.xl-form select >> nth=0', 'list');
    await page.fill('.xl-form .row:has-text("Origen") input', 'Sí;No');
    await page.click('.xl-dfoot .pri');
    await page.click(td('C2'));
    await page.click('.xl-dvbtn'); await page.click('.xl-menu button:has-text("Sí")');
    log('I11 C2:', await val('C2'));
    await page.click(td('C3')); await page.keyboard.type('Quizás'); await page.keyboard.press('Enter');
    log('I11 alerta validación:', await page.locator('.xl-modal').count());
    await page.screenshot({ path: SHOT + '/15-validacion.png' });
    await page.click('.xl-modal .pri'); await page.keyboard.press('Escape');
    // jump: finish intermediate with solutions via API for remaining to reach advanced
    await page.addScriptTag({ path: __dirname + '/solutions.js' });
    await page.evaluate(() => {
      const L = XLTasks.levels[1];
      L.tasks.forEach((t, i) => {
        __sim.openTask(i);
        const sol = __solutions[t.id];
        if (t.type === 'quiz') __sim.S.states[t.id] = { answers: sol.answers };
        else { sol(__sim.ui, __sim.ui.wb); __sim.ui.wb.invalidate(); __sim.ui.render(); __sim.S.states[t.id] = { wb: __sim.ui.wb.toJSON(), touched: true }; }
      });
      __sim.finishLevel();
    });
    log('Intermedio %:', Math.round(await page.evaluate(() => __sim.S.levels.intermedio.pct)));
    await page.click('#go-next'); await page.click('#go-level');
    // A4 escenarios via UI
    await page.click('.tl[data-i="3"]');
    await page.click('.xl-rtab:has-text("Datos")'); await page.click('.xl-rbtn[data-cmd=scenarios]');
    for (const [n, p, u] of [['Optimista', '15000', '1200'], ['Pesimista', '10000', '700']]) {
      await page.click('.xl-scen .btns button:has-text("Agregar")');
      await page.fill('.xl-modal:visible .xl-form input >> nth=0', n);
      await page.fill('.xl-modal:visible .xl-form input >> nth=1', 'B1:B2');
      await page.click('.xl-modal:visible .xl-dfoot .pri');
      await page.fill('.xl-modal:visible .xl-form input >> nth=0', p);
      await page.fill('.xl-modal:visible .xl-form input >> nth=1', u);
      await page.click('.xl-modal:visible .xl-dfoot .pri');
    }
    await page.click('.xl-scen .lst .it >> nth=0');
    await page.screenshot({ path: SHOT + '/16-escenarios.png' });
    await page.click('.xl-scen .btns button:has-text("Mostrar")');
    await page.click('.xl-modal:visible .xl-dfoot .pri');
    log('A4 B1,B2,B6:', await val('B1'), await val('B2'), await val('B6'));
    // A8 macro via UI
    await page.click('.tl[data-i="7"]');
    await page.click(td('A1')); await page.click(td('E1'), { modifiers: ['Shift'] });
    await page.click('.xl-rtab:has-text("Programador")'); await page.click('.xl-rbtn[data-cmd=recordMacro]');
    await page.fill('.xl-form input >> nth=0', 'FormatoEncabezado'); await page.click('.xl-dfoot .pri');
    await page.click('.xl-rtab:has-text("Inicio")');
    await page.click('.xl-rbtn[data-cmd=bold]'); await page.click('.xl-rbtn[data-cmd=alignC]');
    await page.click('.xl-rbtn[data-cmd=fill]'); await page.click('.xl-colors .grid button >> nth=4');
    await page.click('.xl-status .rec');
    await page.click(td('A10')); await page.click(td('E10'), { modifiers: ['Shift'] });
    await page.click('.xl-rtab:has-text("Programador")'); await page.click('.xl-rbtn[data-cmd=macros]');
    await page.click('.xl-scen .btns button:has-text("Ejecutar")');
    await page.click('.xl-rbtn[data-cmd=vba]');
    await page.screenshot({ path: SHOT + '/17-vba.png' });
    await page.click('.xl-dfoot .pri');
    // A7 controls via UI
    await page.click('.tl[data-i="6"]');
    await page.click(td('G2'));
    await page.click('.xl-rbtn[data-cmd=ctlCombo]');
    await page.fill('.xl-form input >> nth=0', '$A$2:$A$6'); await page.fill('.xl-form input >> nth=1', '$E$2'); await page.click('.xl-dfoot .pri');
    await page.selectOption('.xl-control select', '3');
    await page.click(td('E3')); await page.keyboard.type('=INDICE(B2:B6;E2)'); await page.keyboard.press('Enter');
    log('A7 E2,E3:', await val('E2'), await val('E3'));
    await page.screenshot({ path: SHOT + '/18-controles.png' });
    // A6 advanced filter via UI
    await page.click('.tl[data-i="5"]');
    const typeAt = async (a, t) => { await page.click(td(a)); await page.keyboard.type(t); await page.keyboard.press('Enter'); };
    await typeAt('G1', 'Región'); await typeAt('H1', 'Producto'); await typeAt('I1', 'Monto');
    await typeAt('G2', 'Norte'); await typeAt('I2', '>500000'); await typeAt('G3', 'Sur'); await typeAt('H3', 'Tablet');
    await page.click(td('A2'));
    await page.click('.xl-rtab:has-text("Datos")'); await page.click('.xl-rbtn[data-cmd=advFilter]');
    await page.fill('.xl-form .row:has-text("criterios") input[type=text]', 'G1:I3');
    await page.fill('.xl-form .row:has-text("Copiar a") input[type=text]', 'G6');
    await page.click('.xl-dfoot .pri');
    await page.screenshot({ path: SHOT + '/19-filtro-avanzado.png' });
    // Finish advanced
    await page.click('#btn-finish'); await page.click('#app-modal .pri');
    const adv = await page.evaluate(() => __sim.S.levels.avanzado);
    log('Avanzado %:', Math.round(adv.pct), adv.tasks.map((t) => t.id + ':' + Math.round(t.score * 100)).join(' '));
    await page.screenshot({ path: SHOT + '/20-final.png', fullPage: true });
  }
  // admin
  await page.goto('http://localhost:8765/admin.html');
  await page.screenshot({ path: SHOT + '/21-admin.png', fullPage: true });
  log('admin rows:', await page.locator('#rows tr').count());
  await page.click('#rows button >> nth=0');
  await page.screenshot({ path: SHOT + '/22-admin-detalle.png' });
  console.log('Errores:', errors);
  await browser.close();
})();
