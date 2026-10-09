const { chromium } = require('playwright');
const SHOT = process.env.SHOTS || '/tmp';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.stack));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('http://localhost:8765/index.html');
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.fill('input[name=nombre]', 'Experta'); await page.fill('input[name=apellido]', 'Excel');
  await page.fill('input[name=correo]', 'experta@x.cl'); await page.check('input[name=acepto]');
  await page.click('button[type=submit]'); await page.click('#go-level');
  const td = (a) => { const m = /([A-Z]+)(\d+)/.exec(a); return `td[data-r="${+m[2] - 1}"][data-c="${m[1].charCodeAt(0) - 65}"]`; };
  const log = (...x) => console.log(...x);
  // Ctrl+1 formato de celdas en B5
  await page.click('.tl[data-i="4"]');
  await page.click(td('A1')); await page.click(td('D1'), { modifiers: ['Shift'] });
  await page.keyboard.press('Control+1');
  await page.check('.xl-form .row:has-text("Negrita") input');
  await page.selectOption('.xl-form .row:has-text("Alineación") select', 'center');
  await page.selectOption('.xl-form .row:has-text("Relleno") select', '#ffff00');
  await page.screenshot({ path: SHOT + '/30-formato-celdas.png' });
  await page.click('.xl-dfoot .pri');
  log('Ctrl+1 estilo A1:', JSON.stringify(await page.evaluate(() => __sim.ui.wb.cell(__sim.ui.sh.name, 'A1').style)));
  // "No sé hacerlo" en la actividad 6
  await page.click('.tl[data-i="5"]'); await page.click('#btn-skip');
  log('Tras "No sé hacerlo" actividad actual:', await page.evaluate(() => __sim.S.taskIdx), 'clase:', await page.getAttribute('.tl[data-i="5"]', 'class'));
  // saltar a avanzado
  await page.evaluate(() => { __sim.finishLevel(); });
  await page.click('#go-next'); await page.click('#go-level');
  await page.evaluate(() => { __sim.finishLevel(); });
  await page.click('#go-next'); await page.click('#go-level');
  // A8: escribir VBA a mano con Alt+F11
  await page.click('.tl[data-i="7"]');
  await page.click(td('A1'));
  await page.keyboard.press('Alt+F11');
  await page.fill('.xl-vba textarea', 'Sub FormatoEncabezado()\n    Selection.Font.Bold = True\n    Selection.Interior.ColorIndex = 6\n    Selection.HorizontalAlignment = xlCenter\nEnd Sub\n');
  await page.screenshot({ path: SHOT + '/31-vba-editor.png' });
  await page.click('.xl-dfoot button:has-text("Guardar")');
  log('Estado compilación:', await page.textContent('.vstatus'));
  await page.click('.xl-dfoot .pri');
  await page.click(td('A10')); await page.click(td('E10'), { modifiers: ['Shift'] });
  await page.keyboard.press('Alt+F8');
  await page.click('.xl-scen .btns button:has-text("Ejecutar")');
  log('A10 estilo:', JSON.stringify(await page.evaluate(() => __sim.ui.wb.cell('Reporte', 'C10').style)));
  // Grabadora con referencias relativas en otra macro
  await page.click(td('A1'));
  await page.click('.xl-rtab:has-text("Programador")');
  await page.click('.xl-rbtn[data-cmd=relRefs]');
  await page.click('.xl-rbtn[data-cmd=recordMacro]');
  await page.fill('.xl-form input >> nth=0', 'Rel'); await page.click('.xl-dfoot .pri');
  await page.click(td('B2')); await page.keyboard.type('Hola'); await page.keyboard.press('Enter');
  await page.click('.xl-rtab:has-text("Inicio")'); await page.click('.xl-rbtn[data-cmd=bold]');
  await page.click('.xl-status .rec');
  log('Código grabado:\n' + await page.evaluate(() => __sim.ui.wb.vba.split('Sub Rel')[1]));
  // A11: corregir código existente con el editor
  await page.click('.tl[data-i="8"]');
  await page.click('.xl-rtab:has-text("Programador")'); await page.click('.xl-rbtn[data-cmd=vba]');
  const code = await page.inputValue('.xl-vba textarea');
  await page.fill('.xl-vba textarea', code.replace('B2:B10', 'B2:B11').replace('celda.Font.Bold = True', 'celda.Font.Bold = True\n            celda.Font.Color = vbRed'));
  await page.click('.xl-vba textarea'); await page.keyboard.press('Control+Home'); await page.keyboard.press('ArrowDown');
  await page.keyboard.press('F5');
  await page.screenshot({ path: SHOT + '/32-a11.png' });
  // error de ejecución
  await page.keyboard.press('Alt+F11');
  await page.fill('.xl-vba textarea', 'Sub Mala()\n    Range("A1").Fnt.Bold = True\nEnd Sub\n');
  await page.keyboard.press('F5');
  log('Alerta error VBA:', (await page.textContent('.xl-modal .xl-alert')).slice(0, 120));
  await page.screenshot({ path: SHOT + '/33-vba-error.png' });
  await page.click('.xl-modal .pri');
  // restaurar A11 correcto y finalizar
  await page.evaluate(() => { const t = XLTasks.levels[2].tasks[8]; });
  await page.evaluate(() => __sim.finishLevel());
  const adv = await page.evaluate(() => __sim.S.levels.avanzado.tasks.map((t) => t.id + ':' + Math.round(t.score * 100)).join(' '));
  log('Avanzado:', adv);
  await page.screenshot({ path: SHOT + '/34-final.png', fullPage: true });
  log('Registro:', JSON.stringify(await page.evaluate(() => { const r = JSON.parse(localStorage.getItem('simxl_results_v1')); const x = Object.values(r)[0]; return { nivel: x.nivel, curso: x.cursoRecomendado, rec: x.recomendacion, b: x.basico }; })));
  await page.goto('http://localhost:8765/admin.html');
  await page.screenshot({ path: SHOT + '/35-admin.png', fullPage: true });
  console.log('Errores:', errors);
  await browser.close();
})();
