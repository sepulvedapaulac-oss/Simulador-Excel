// Recorre una lección completa en Chromium: resuelve actividades, verifica compuertas y toma capturas.
// Uso: node tools/test/run_lesson.js dist/modulo1/leccion-1-1 out_dir [mobile]
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const [dir, outDir, mode] = process.argv.slice(2);
  const browser = await chromium.launch();
  const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(dir, 'index.html'));
  await page.waitForTimeout(400);
  const nSlides = await page.$$eval('.slide', s => s.length);
  const shot = async n => page.screenshot({ path: `${outDir}/${mode || 'pc'}_${String(n).padStart(2, '0')}.png`, fullPage: true });
  const active = '.slide.active';
  for (let i = 0; i < nSlides; i++) {
    const gates = await page.$eval(active, s => s.dataset.gate || '');
    // Resolver actividades presentes en la pantalla activa
    await page.evaluate(async () => {
      const sl = document.querySelector('.slide.active');
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const click = el => el && el.click();
      // abrir elementos (correo, apps)
      for (const o of sl.querySelectorAll('[data-open] [data-o]')) { click(o); await wait(50); }
      // tarjetas, hotspots, pestañas, acordeón, revelar
      for (const c of sl.querySelectorAll('[data-flip] .flip')) click(c);
      for (const h of sl.querySelectorAll('[data-hotspot] .hs')) click(h);
      for (const t of sl.querySelectorAll('[data-tabs] .tab')) click(t);
      for (const a of sl.querySelectorAll('[data-acc] .acc-head')) click(a);
      for (const r of sl.querySelectorAll('[data-reveal] tbody tr td:first-child')) click(r);
      // clasificar: probar un error y luego aciertos
      const sortRoot = sl.querySelector('[data-sort]');
      if (sortRoot) {
        const cfg = window.LESSON.sorts[sortRoot.dataset.sort];
        let first = true;
        for (const card of [...sortRoot.querySelectorAll('.pool .cardx')]) {
          const it = cfg.items[+card.dataset.i];
          if (first) { const wrong = cfg.bins.find(b => b.id !== it.bin); card.click(); sortRoot.querySelector(`.bin[data-b="${wrong.id}"]`).click(); first = false; }
          card.click(); sortRoot.querySelector(`.bin[data-b="${it.bin}"]`).click();
        }
      }
      // parejas
      const pr = sl.querySelector('[data-pairs]');
      if (pr) { const cfg = window.LESSON.pairs[pr.dataset.pairs]; cfg.items.forEach((_, i) => { pr.querySelector(`.pl[data-i="${i}"]`).click(); pr.querySelector(`.pr[data-i="${i}"]`).click(); }); }
      await wait(100);
    });
    // decisiones: primero una incorrecta y reintento, luego correcta (en secuencia por fases)
    for (let guard = 0; guard < 6; guard++) {
      const box = await page.$(`${active} [data-choice]:not(.solved)`);
      if (!box) break;
      const visible = await box.evaluate(b => !b.closest('[hidden]'));
      if (!visible) break;
      const correct = await box.evaluate(b => b.dataset.correct);
      const wrong = await box.evaluate(b => [...b.querySelectorAll('.opt')].map(o => o.dataset.opt).find(o => o !== b.dataset.correct));
      await box.evaluate((b, w) => b.querySelector(`.opt[data-opt="${w}"]`).click(), wrong);
      await page.waitForTimeout(80);
      const retry = await page.$(`${active} [data-choice]:not(.solved) + .fb .retry`);
      if (retry) await retry.evaluate(r => r.click());
      await box.evaluate((b, c) => { b.querySelector(`.opt[data-opt="${c}"]`).click(); b.classList.add('solved'); }, correct);
      await page.waitForTimeout(120);
    }
    // video: saltar por todos los capítulos
    if (gates.includes('video')) {
      const n = await page.$$eval('.chap', c => c.length);
      for (let k = 0; k < n; k++) { await page.$$eval('.chap', (c, k) => c[k].click(), k); await page.waitForTimeout(60); }
      await page.waitForTimeout(200);
    }
    // comprobación: responder todas (una mala para probar feedback)
    if (gates.includes('quiz')) {
      const Q = await page.evaluate(() => window.LESSON.quiz);
      for (let k = 0; k < Q.length; k++) {
        const pick = k === 0 ? (Q[k].c + 1) % Q[k].o.length : Q[k].c;
        await page.$eval(`#qcard .opt[data-i="${pick}"]`, b => b.click());
        if (k === 0) await shot(i + 0.5);
        await page.$eval('#qNext', b => b.click());
      }
    }
    // constructor
    if (await page.$(`${active} [data-builder]`)) {
      await page.evaluate(() => {
        const sl = document.querySelector('.slide.active');
        sl.querySelectorAll('[data-builder] select').forEach(s => { s.value = s.options.length > 1 ? '1' : ''; s.dispatchEvent(new Event('input', { bubbles: true })); });
        sl.querySelectorAll('[data-builder] textarea').forEach(t => { t.value = 'Prueba automática'; t.dispatchEvent(new Event('input', { bubbles: true })); });
        sl.querySelector('[data-builder] .mk').click();
        const mb = sl.querySelector('[data-builder] .model-btn'); if (mb) mb.click();
      });
      await page.waitForTimeout(100);
    }
    // checklist sí/no
    await page.evaluate(() => { const sl = document.querySelector('.slide.active'); sl.querySelectorAll('.yn-item .yn button:first-child').forEach(b => b.click()); const m = sl.querySelector('#modelBtn'); if (m && !m.disabled) m.click(); });
    await page.waitForTimeout(150);
    await shot(i + 1);
    const state = await page.evaluate(() => ({ next: document.querySelector('#nextBtn').disabled, msg: document.querySelector('#gateMsg').textContent, title: document.querySelector('.slide.active').dataset.title }));
    console.log(`${i + 1}/${nSlides} ${state.title} · siguiente ${state.next ? 'BLOQUEADO' : 'ok'} ${state.msg}`);
    if (i < nSlides - 1) { if (state.next) break; await page.click('#nextBtn'); await page.waitForTimeout(250); }
  }
  // desbordes horizontales
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log('Desborde horizontal (px):', overflow);
  console.log(errors.length ? 'ERRORES:\n' + errors.join('\n') : 'Sin errores de JavaScript');
  await browser.close();
})();
