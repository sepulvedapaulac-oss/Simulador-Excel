// Recorrido "a la fuerza": en cada pantalla interactúa al azar (botones, selects, textos, hojas)
// hasta que se desbloquea "Siguiente". Sirve para lecciones con componentes propios.
// Uso: node tools/test/brute_lesson.js dist/moduloN/carpeta out_dir [mobile]
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const [dir, outDir, mode] = process.argv.slice(2);
  // STEPS=archivo.json opcional: {"selector presente en la pantalla": [["cell","F2","=..."],["click","#btn"],["drag"...]]}
  const STEPS = process.env.STEPS ? JSON.parse(require('fs').readFileSync(process.env.STEPS, 'utf8')) : {};
  const browser = await chromium.launch();
  const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(dir, 'index.html'));
  await page.waitForTimeout(400);
  const n = await page.$$eval('.slide', s => s.length);
  for (let i = 0; i < n; i++) {
    let tries = 0;
    for (const [sel, acts] of Object.entries(STEPS)) {
      if (!(await page.$('.slide.active ' + sel))) continue;
      for (const a of acts) {
        if (a[0] === 'cell') { await page.evaluate(([root, k]) => { const g = document.querySelector('.slide.active ' + root); const td = [...g.querySelectorAll('td')].find(t => t.dataset.k === k || t.dataset.cell === k || t.title === k); td && td.click(); }, [sel, a[1]]); await page.fill('.slide.active ' + sel + ' .hj-input', a[2]); await page.press('.slide.active ' + sel + ' .hj-input', 'Enter'); }
        if (a[0] === 'sel') await page.evaluate(([root, k]) => { document.querySelector('.slide.active ' + root + ' td[data-k="' + k + '"]').click(); }, [sel, a[1]]);
        if (a[0] === 'click') await page.click('.slide.active ' + a[1]);
        if (a[0] === 'eval') await page.evaluate(a[1]);
        await page.waitForTimeout(80);
      }
    }
    const blocked = () => page.evaluate(() => document.querySelector('#nextBtn').disabled);
    while (i < n - 1 && await blocked() && tries < 400) {
      tries++;
      await page.evaluate(() => {
        const sl = document.querySelector('.slide.active');
        const vis = el => el.offsetParent !== null && !el.disabled;
        // videos: saltar al final
        sl.querySelectorAll('[data-chapter],.chap,.vchap').forEach(c => vis(c) && Math.random() < .3 && c.click());
        // textos
        sl.querySelectorAll('textarea,input[type=text],input:not([type])').forEach(t => { if (vis(t) && !t.closest('.hoja') && !t.value) { t.value = 'Actúa como analista de remuneraciones. Te entrego una tabla con código y horas extra. Identifica diferencias; no inventes datos; si falta algo, pregúntame. Entrega una tabla.'; t.dispatchEvent(new Event('input', { bubbles: true })); } });
        sl.querySelectorAll('select').forEach(s => { if (vis(s) && s.options.length > 1) { s.selectedIndex = 1 + Math.floor(Math.random() * (s.options.length - 1)); s.dispatchEvent(new Event('change', { bubbles: true })); } });
        sl.querySelectorAll('input[type=checkbox]').forEach(c => { if (vis(c) && !c.checked) c.click(); });
        const btns = [...sl.querySelectorAll('button,[role=button],.hs,.flip,.tab,.acc-head,[data-o]')].filter(vis).filter(b => !b.matches('[data-goto],#prevBtn,.retry-all,#retryLab,[id^=retry]'));
        if (btns.length) btns[Math.floor(Math.random() * btns.length)].click();
      });
      await page.waitForTimeout(40);
    }
    // forzar fin de video si quedó bloqueado por reproducción
    if (i < n - 1 && await blocked()) await page.evaluate(() => { const v = document.querySelector('.slide.active video, .slide.active audio'); if (v) { v.currentTime = v.duration || 9999; v.dispatchEvent(new Event('ended')); } });
    const st = await page.evaluate(() => ({ t: document.querySelector('.slide.active').dataset.title, b: document.querySelector('#nextBtn').disabled, m: document.querySelector('#gateMsg').textContent }));
    await page.screenshot({ path: `${outDir}/${mode || 'pc'}_${String(i + 1).padStart(2, '0')}.png`, fullPage: true });
    console.log(`${i + 1}/${n} ${st.t} · ${i === n - 1 ? 'fin' : st.b ? 'BLOQUEADO ' + st.m : 'ok (' + tries + ' acciones)'}`);
    if (i < n - 1) { if (st.b) break; await page.click('#nextBtn'); await page.waitForTimeout(250); }
  }
  const sc = await page.evaluate(() => window.LESSON && window.LESSON.score ? window.LESSON.score() : null);
  if (sc !== null) console.log('Puntaje (score):', sc);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log('Desborde horizontal (px):', ov);
  console.log(errors.length ? 'ERRORES:\n' + [...new Set(errors)].join('\n') : 'Sin errores de JavaScript');
  await browser.close();
})();
