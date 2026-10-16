const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(process.argv[2]);
const OUT = process.argv[3];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [name, vp] of [['desktop', { width: 1366, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, acceptDownloads: true });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('requestfailed', r => errs.push('reqfail: ' + r.url()));
    await page.goto(URL);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${name}_1_inicio.png`, fullPage: true });
    const imgOk = await page.evaluate(() => { const i = document.querySelector('.photo-frame img'); return i && i.complete && i.naturalWidth > 0; });
    await page.fill('#dgFirst', 'Ana');
    await page.fill('#dgLast', 'Pérez');
    await page.click('#dgStart');
    await page.waitForTimeout(400);
    const lv = [1, 2, 0, 3];
    for (let k = 0; k < 4; k++) await page.click(`#dgAuto button[data-k="${k}"][data-j="${lv[k]}"]`);
    await page.screenshot({ path: `${OUT}/${name}_2_auto.png`, fullPage: true });
    await page.click('#nextBtn');
    await page.waitForTimeout(400);
    const P = await page.evaluate(() => window.LESSON.dg.P.map(q => q.c));
    for (let i = 0; i < 20; i++) {
      const j = (i % 4 === 3) ? (P[i] + 1) % 4 : P[i];
      await page.click(`#dgQ .opt[data-j="${j}"]`);
      await page.waitForTimeout(350);
      if (i === 0) await page.screenshot({ path: `${OUT}/${name}_3_pregunta.png`, fullPage: true });
    }
    await page.click('#dgFin');
    await page.waitForTimeout(600);
    const onReport = await page.evaluate(() => !!document.querySelector('section.slide.active[data-report]'));
    await page.click('#dgPdf');
    await page.waitForTimeout(300);
    const pdfLen = await page.evaluate(() => window.__lastPdf ? window.__lastPdf.length : 0);
    await page.evaluate(() => { const d = document.querySelector('.dg-det'); if (d) d.open = true; });
    await page.screenshot({ path: `${OUT}/${name}_4_mapa.png`, fullPage: true });
    // Overflow check over every visible element
    const ov = await page.evaluate(() => {
      const out = []; const W = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > W + 1) out.push('page scrollWidth ' + document.documentElement.scrollWidth + ' > ' + W);
      document.querySelectorAll('body *').forEach(el => {
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect(); if (!r.width) return;
        if (el.closest('svg') && el.tagName !== 'svg') return;
        if (r.right > W + 1 && !el.closest('.tblwrap') && !el.closest('.topic-panel')) out.push('beyond viewport: ' + el.tagName + '.' + el.className + ' ' + Math.round(r.right));
        if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll' && el.clientWidth > 0 && !['svg','HTML','BODY'].includes(el.tagName))
          out.push('scroll overflow: ' + el.tagName + '.' + el.className + ' ' + el.scrollWidth + '>' + el.clientWidth + ' "' + (el.textContent || '').slice(0, 50) + '"');
      });
      // svg radar labels inside viewBox?
      document.querySelectorAll('.dg-radar svg text').forEach(t => {
        const s = t.ownerSVGElement.getBoundingClientRect(), r = t.getBoundingClientRect();
        if (getComputedStyle(t).display !== 'none' && (r.left < s.left - 1 || r.right > s.right + 1)) out.push('radar label clipped: ' + t.textContent);
      });
      return out;
    });
    const status = await page.evaluate(() => { try { return JSON.stringify(window.LESSON.score()) } catch (e) { return 'n/a' } });
    console.log(JSON.stringify({ name, imgOk, onReport, pdfLen, score: status, errs, ov: ov.slice(0, 30) }, null, 1));
    // also screenshot top of report viewport only
    await page.evaluate(() => window.scrollTo(0, 0));
    await ctx.close();
  }
  await browser.close();
})();
