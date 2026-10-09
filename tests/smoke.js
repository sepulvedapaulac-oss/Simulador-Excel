const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.stack));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', (d) => d.accept());
  await page.goto('http://localhost:8765/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.fill('input[name=nombre]', 'Juan'); await page.fill('input[name=apellido]', 'Soto');
  await page.fill('input[name=correo]', 'juan@x.cl'); await page.check('input[name=acepto]');
  await page.click('button[type=submit]'); await page.click('#go-level');
  await page.click('td[data-r="2"][data-c="1"]');
  const tabs = await page.locator('.xl-rtab').allTextContents();
  let n = 0;
  for (const t of tabs) {
    await page.click(`.xl-rtab:text-is("${t}")`);
    const cmds = await page.locator('.xl-rbtn').evaluateAll((els) => els.map((e) => e.dataset.cmd));
    for (const c of cmds) {
      if (['protect'].includes(c)) continue;
      await page.click(`.xl-rbtn[data-cmd="${c}"] >> nth=0`).catch((e) => errors.push('click ' + c + ': ' + e.message.split('\n')[0]));
      n++;
      await page.waitForTimeout(50);
      for (let k = 0; k < 4; k++) {
        if (await page.locator('.xl-modal').count()) await page.keyboard.press('Escape');
        if (await page.locator('.xl-popup').count()) await page.mouse.click(5, 300);
        if (await page.locator('.xl-editor:not(.idle)').count()) await page.keyboard.press('Escape');
      }
      if (await page.locator('.xl-modal').count()) { await page.click('.xl-modal .xl-dhead .x').catch(() => {}); }
    }
  }
  console.log('Comandos probados:', n);
  // deshacer / rehacer
  await page.click('td[data-r="5"][data-c="0"]'); await page.keyboard.type('Hola'); await page.keyboard.press('Enter');
  await page.keyboard.press('Control+z');
  const afterUndo = await page.evaluate(() => __sim.ui.wb.value(__sim.ui.sh.name, 'A6'));
  await page.keyboard.press('Control+y');
  const afterRedo = await page.evaluate(() => __sim.ui.wb.value(__sim.ui.sh.name, 'A6'));
  console.log('Deshacer/rehacer:', afterUndo, afterRedo);
  // persistencia
  await page.click('#btn-next');
  await page.click('td[data-r="1"][data-c="3"]'); await page.keyboard.type('=B2*C2'); await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  await page.reload();
  const resumed = await page.evaluate(() => ({ task: __sim.S.taskIdx, d2: __sim.ui.wb.value(__sim.ui.sh.name, 'D2') }));
  console.log('Tras recargar:', JSON.stringify(resumed));
  console.log('Errores:', errors);
  await browser.close();
})();
