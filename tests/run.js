const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('http://localhost:8765/index.html');
  await page.addScriptTag({ path: __dirname + '/solutions.js' });
  const res = await page.evaluate(() => {
    const out = [];
    for (const L of XLTasks.levels) for (const t of L.tasks) {
      const empty = XLTasks.grade(t, null).score;
      let state;
      const sol = __solutions[t.id];
      if (t.type === 'quiz') state = { answers: sol.answers };
      else {
        const host = document.createElement('div'); host.style.height = '500px'; document.body.appendChild(host);
        const ui = new XLSheetUI(host, {});
        const wb = new XLWorkbook(t.setup()); ui.setWorkbook(wb);
        sol(ui, ui.wb); ui.wb.invalidate(); ui.render();
        state = { wb: ui.wb.toJSON() };
        host.remove();
      }
      const g = XLTasks.grade(t, state);
      out.push({ id: t.id, empty: Math.round(empty * 100), solved: Math.round(g.score * 100), fails: g.items.filter((x) => !(x.f != null ? x.f === 1 : x.ok)).map((x) => x.label) });
    }
    return out;
  });
  for (const r of res) console.log(r.id.padEnd(4), 'vacío:', String(r.empty).padStart(3) + '%', ' resuelto:', String(r.solved).padStart(3) + '%', r.fails.length ? ' FALLA: ' + r.fails.join(' | ') : '');
  console.log('Errores:', errors);
  await browser.close();
})();
