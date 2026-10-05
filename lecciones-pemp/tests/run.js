// Pruebas de una lección construida:
//  1) diseño: errores JS, desbordes y textos fuera de su caja en escritorio y celular (con capturas)
//  2) recorrido completo dentro de un LMS SCORM 1.2 simulado: bloqueo de navegación, errores
//     y reintentos, comprobación reprobada y luego aprobada, finalización, nota y reanudación.
// Uso: node tests/run.js dist/Leccion.html [carpeta_capturas]
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const file = path.resolve(process.argv[2]);
const shots = process.argv[3] || path.join(ROOT, 'tests', 'shots', path.basename(file, '.html'));
fs.mkdirSync(shots, { recursive: true });
const fails = [];
const check = (c, m) => { if (!c) { fails.push(m); console.log('  ✗ ' + m); } };

const server = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
  fs.createReadStream(p).pipe(r);
});

async function layout(browser, name, vp) {
  const ctx = await browser.newContext({ viewport: vp, colorScheme: name === 'oscuro' ? 'dark' : 'light' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(`http://localhost:${PORT}/${path.relative(ROOT, file)}?reset=1`);
  await page.evaluate(() => { localStorage.setItem('tls_autonarr', '0'); window.__lesson.state.fin = true; });
  const n = await page.evaluate(() => window.__lesson.screens.length);
  for (let i = 0; i < n; i++) {
    await page.evaluate(i => window.__lesson.go(i), i);
    // abrir contenidos ocultos para revisar que caben
    await page.evaluate(() => {
      const s = document.querySelector('.screen.active');
      s.querySelectorAll('.flip').forEach(f => f.classList.add('on'));
      s.querySelectorAll('.acc-i').forEach(a => a.classList.add('open'));
      s.querySelectorAll('.tl-item').forEach(a => a.classList.add('open'));
    });
    await page.waitForTimeout(650);
    const probs = await page.evaluate(() => {
      const out = [];
      if (document.documentElement.scrollWidth > innerWidth + 1) out.push('scroll horizontal de página (' + document.documentElement.scrollWidth + 'px)');
      const s = document.querySelector('.screen.active');
      s.querySelectorAll('*').forEach(e => {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.tablist,.chat-log,.vstage')) return;
        const r = e.getBoundingClientRect();
        if (r.width && r.right > innerWidth + 1 && !e.closest('.flip')) out.push('se sale a la derecha: ' + e.className + ' «' + (e.textContent || '').trim().slice(0, 40) + '»');
        if ((cs.overflow === 'hidden' || cs.overflowY === 'hidden') && e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0 && !e.matches('.photo,.hs-stage,.vstage,.vscene,.narr-track,.vprog,.qdots,.scn,.tabs,.chat,.acc-i,.flip .in,.score-ring,.sort li'))
          out.push('texto cortado: ' + e.className + ' «' + (e.textContent || '').trim().slice(0, 50) + '»');
        if (e.matches('button:not(.pt),.chip,.opt,.mi,.tab') && e.scrollWidth > e.clientWidth + 2 && cs.overflowX !== 'auto') out.push('texto más ancho que su botón: «' + e.textContent.trim().slice(0, 40) + '»');
      });
      return [...new Set(out)];
    });
    probs.forEach(p => check(false, `[${name}] pantalla ${i + 1}: ${p}`));
    await page.screenshot({ path: path.join(shots, `${name}_${String(i + 1).padStart(2, '0')}.png`), fullPage: true });
  }
  errs.forEach(e => check(false, `[${name}] error JS: ${e}`));
  await ctx.close();
}

async function walk(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  const url = `http://localhost:${PORT}/tests/lms_mock.html?clear=1&src=/${path.relative(ROOT, file)}`;
  await page.goto(url);
  let fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  for (let k = 0; !fr && k < 20; k++) { await page.waitForTimeout(100); fr = page.frame({ url: u => u.pathname.startsWith('/dist/') }); }
  await fr.waitForFunction(() => window.__lesson);
  await fr.evaluate(() => localStorage.setItem('tls_autonarr', '0'));
  const n = await fr.evaluate(() => window.__lesson.screens.length);
  const act = '.screen.active ';
  const W = ms => page.waitForTimeout(ms);
  const nextDisabled = () => fr.$eval(act + '.scr-nav .btn:last-child', b => b.disabled);

  check(await fr.$eval('#route-list li:nth-child(3) button', b => b.disabled), 'la ruta debería estar bloqueada al inicio');
  for (let i = 0; i < n - 1; i++) {
    const kinds = await fr.$$eval(act + '[data-c]', a => a.map(x => x.dataset.c));
    const gated = await fr.evaluate(i => window.__lesson.screens[i].dataset.gate, i);
    if (gated && !gated.includes('pass')) check(await nextDisabled(), `pantalla ${i + 1}: «Continuar» debería estar bloqueado antes de la actividad`);
    for (const k of kinds) {
      const R = act + `[data-c=${k}] `;
      if (k === 'decision') {
        const wrong = await fr.$$(R + '.opt:not([data-ok])'); await wrong[0].click(); await W(80);
        check(await fr.$eval(R + '.fb', f => f.classList.contains('bad')), `pantalla ${i + 1}: decisión incorrecta sin consecuencia`);
        await fr.click(R + '.opt[data-ok]');
      } else if (k === 'video') {
        if (await fr.$eval(R + '.vbig', b => !b.hidden)) await fr.click(R + '.vbig'); await W(1500);
        check((await fr.$eval(R + '.vsub', s => s.textContent)).length > 3, `pantalla ${i + 1}: el video no muestra subtítulos`);
        const chaps = await fr.$$(R + '.chap'); await chaps[chaps.length - 1].click(); await W(300);
        check(await fr.$eval(R + '.chap.cur', c => c.textContent).then(t => t.length > 0), 'capítulos del video no responden');
        if (await fr.$eval(R + '[data-a=play]', b => b.textContent !== '▶')) await fr.click(R + '[data-a=play]');
        await fr.evaluate(() => window.__lesson.done('video'));
      } else if (k === 'flip') { for (const c of await fr.$$(R + '.flip')) { await c.click(); await W(60); } }
      else if (k === 'tabs') { for (const t of await fr.$$(R + '.tab')) { await t.click(); await W(60); } }
      else if (k === 'acc') { for (const t of await fr.$$(R + '.acc-i > button')) { await t.click(); await W(60); } }
      else if (k === 'hotspot') { for (const t of await fr.$$(R + '.pt')) { await t.click(); await W(60); } }
      else if (k === 'steps') { while (await fr.$(R + '.tl-item:not(.open) .btn:not([hidden])')) { await fr.click(R + '.tl-item:not(.open) .btn:not([hidden])'); await W(60); } }
      else if (k === 'classify') {
        // primero un arrastre a la categoría equivocada, luego todo por toque
        const chip = await fr.$(R + '.pool .chip'); const bin = await chip.getAttribute('data-bin');
        const wrongBin = await fr.$(R + `.bin:not([data-bin="${bin}"])`);
        const a = await chip.boundingBox(), b = await wrongBin.boundingBox();
        await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
        await page.mouse.move(a.x + 40, a.y + 30, { steps: 4 }); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await page.mouse.up(); await W(100);
        check(await fr.$eval(R + '.fb', f => f.classList.contains('bad')), `pantalla ${i + 1}: arrastre a categoría equivocada sin aviso`);
        // arrastre correcto del mismo
        const c2 = await fr.$(R + '.pool .chip'); const bin2 = await c2.getAttribute('data-bin'); const ok = await fr.$(R + `.bin[data-bin="${bin2}"]`);
        const a2 = await c2.boundingBox(), b2 = await ok.boundingBox();
        await page.mouse.move(a2.x + a2.width / 2, a2.y + a2.height / 2); await page.mouse.down();
        await page.mouse.move(a2.x + 40, a2.y + 30, { steps: 4 }); await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height - 20, { steps: 8 }); await page.mouse.up(); await W(100);
        check(await fr.$$eval(R + '.bin .chip.ok', x => x.length) === 1, `pantalla ${i + 1}: arrastre correcto no se registró`);
        while (await fr.$(R + '.pool .chip')) { const c = await fr.$(R + '.pool .chip'); const bb = await c.getAttribute('data-bin'); await c.click(); await fr.click(R + `.bin[data-bin="${bb}"] header`); await W(40); }
      } else if (k === 'tf') {
        for (const c of await fr.$$(R + '.tf-card')) { const ans = await c.getAttribute('data-ans'); await (await c.$(`button[data-v="${ans === 'a' ? 'b' : 'a'}"]`)).click(); await (await c.$(`button[data-v="${ans}"]`)).click(); }
      } else if (k === 'deck') {
        const tot = await fr.$$eval(act + '.deck-card', x => x.length);
        for (let j = 0; j < 30 && await fr.$(R + '.deck-card') && await fr.$eval(R + '.deck', d => d.style.display !== 'none'); j++) {
          const ans = await fr.evaluate(() => null); void ans; void tot;
          // probar la incorrecta y luego la correcta
          await fr.click(R + '.deck-btns .r'); await W(50);
          if (await fr.$eval(R + '.deck-btns', b => b.style.display === 'none')) { await fr.click(R + '.deck .btn'); await W(50); continue; }
          await fr.click(R + '.deck-btns .l'); await W(50); await fr.click(R + '.deck .btn'); await W(50);
        }
      } else if (k === 'match') {
        const L = await fr.$$(R + '.col:first-child .mi');
        for (const l of L) { const id = await l.getAttribute('data-i'); const wrong = await fr.$(R + `.col:last-child .mi:not(.ok):not([data-i="${id}"])`); if (wrong) { await l.click(); await wrong.click(); await W(40); } await l.click(); await fr.click(R + `.col:last-child .mi[data-i="${id}"]`); await W(40); }
      } else if (k === 'fill') {
        const sels = await fr.$$(R + 'select');
        await fr.click(R + '> .btn'); await W(50);
        for (const s of sels) { const ok = await s.getAttribute('data-ok'); await s.selectOption(ok); }
        await fr.click(R + '> .btn');
      } else if (k === 'sort') {
        await fr.click(act + '[data-c=sort] + div .btn'); await W(50);
        for (let pass = 0; pass < 12; pass++) {
          const order = await fr.$$eval(R + 'li', l => l.map(x => +x.dataset.i));
          const j = order.findIndex((v, idx) => v !== idx); if (j < 0) break;
          const target = order.indexOf(j);
          for (let m = target; m > j; m--) { await fr.click(R + `li:nth-child(${m + 1}) [data-d="-1"]`); }
        }
        await fr.click(act + '[data-c=sort] + div .btn');
      } else if (k === 'chat') {
        for (let j = 0; j < 40; j++) {
          await W(900);
          if (await fr.evaluate(() => !!window.__lesson.state.done[document.querySelector('.screen.active [data-c=chat]').dataset.key])) break;
          const opts = await fr.$$(R + '.chat-opts button:not([disabled])'); if (!opts.length) continue;
          const okIdx = await fr.evaluate(() => { const r = document.querySelector('.screen.active [data-c=chat]'); const s = JSON.parse(r.querySelector('script').textContent); const shown = r.querySelectorAll('.chat-opts button'); const step = s.find(x => x.ask && x.ask.length === shown.length && x.ask.every((o, i) => o.t === shown[i].textContent)); return step ? step.ask.findIndex(o => o.ok) : -1; });
          if (okIdx < 0) continue;
          const wrongI = okIdx === 0 ? 1 : 0; const all = await fr.$$(R + '.chat-opts button');
          if (all[wrongI] && !(await all[wrongI].isDisabled())) { await all[wrongI].click(); await W(80); }
          await all[okIdx].click();
        }
      } else if (k === 'scenario') {
        const steps = await fr.$$eval(R + '.step', s => s.length);
        for (let j = 0; j < steps; j++) {
          const S = R + `.step:nth-of-type(${j + 1}) `;
          const st = (await fr.$$(R + '.step'))[j];
          const w = await st.$('.opt:not([data-ok])'); await w.click(); await W(40);
          await (await st.$('.opt[data-ok]')).click(); await W(40);
          await (await st.$('.cont')).click(); await W(60); void S;
        }
      } else if (k === 'quiz') {
        // primer intento: 2 errores → reprobado
        const qs = await fr.$$(R + '.q');
        for (let j = 0; j < qs.length; j++) { const q = qs[j]; await (await q.$(j < 2 ? '.opt:not([data-ok])' : '.opt[data-ok]')).click(); await (await q.$('.btn')).click(); await W(40); }
        check((await fr.$eval(R + '.qres h3', h => h.textContent)).includes('Aún no'), 'la comprobación con 60% debería reprobar');
        check(await nextDisabled(), 'con 60% no se debería poder continuar');
        check(await fr.$$eval(R + '.qres .review button', b => b.length) > 0, 'al reprobar deberían sugerirse pantallas para repasar');
        const letters = await fr.$$eval(R + '.q', qs => qs.map(q => 'ABCD'[[...q.querySelectorAll('.opt')].findIndex(o => o.hasAttribute('data-ok'))]));
        check(new Set(letters).size >= 3, 'las respuestas correctas deberían variar de letra: ' + letters.join(''));
        await fr.click(R + '.qres .btn');
        for (const q of qs) { await (await q.$('.opt[data-ok]')).click(); await (await q.$('.btn')).click(); await W(40); }
        check((await fr.$eval(R + '.qres h3', h => h.textContent)).includes('Aprobaste'), 'con 100% debería aprobar');
      } else if (k === 'transfer') {
        for (const t of await fr.$$(R + 'textarea')) await t.fill('Tarea real de prueba: revisar luminaria de acceso con trayectoria vertical sobre piso firme y nivelado.');
        for (const fs of await fr.$$(R + 'fieldset[data-req]')) await (await fs.$('input')).check();
        await fr.click(R + '[data-act=plan]'); await W(80);
        check(await fr.$eval(R + '.plan', p => p.classList.contains('on')), 'el plan de transferencia no se generó');
      }
    }
    await W(80);
    check(!(await nextDisabled()), `pantalla ${i + 1}: «Continuar» sigue bloqueado tras completar la actividad (${kinds.join(',')})`);
    await page.screenshot({ path: path.join(shots, `recorrido_${String(i + 1).padStart(2, '0')}.png`) });
    await fr.click(act + '.scr-nav .btn:last-child'); await W(120);
  }
  await W(300);
  const db = await page.evaluate(() => window.__db);
  check(db['cmi.core.lesson_status'] === 'passed', 'estado SCORM esperado «passed», recibido ' + db['cmi.core.lesson_status']);
  check(db['cmi.core.score.raw'] === '100', 'nota SCORM esperada 100, recibida ' + db['cmi.core.score.raw']);
  check(await fr.$eval('.screen.active .fin-hero', e => !!e).catch(() => false), 'la finalización no se mostró');
  check(!(await fr.$eval('#route-list li:nth-child(3) button', b => b.disabled)), 'tras finalizar la navegación debería ser libre');
  await page.screenshot({ path: path.join(shots, 'recorrido_final.png'), fullPage: true });
  // reanudación
  await page.goto(url.replace('clear=1&', ''));
  fr = null; for (let k = 0; !fr && k < 20; k++) { await page.waitForTimeout(100); fr = page.frame({ url: u => u.pathname.startsWith('/dist/') }); }
  await fr.waitForFunction(() => window.__lesson);
  const st = await fr.evaluate(() => ({ cur: window.__lesson.state.cur, fin: window.__lesson.state.fin, n: window.__lesson.screens.length }));
  check(st.fin && st.cur === st.n - 1, 'la reanudación no recuperó el estado final: ' + JSON.stringify(st));
  errs.forEach(e => check(false, 'error JS en recorrido: ' + e));
  await ctx.close();
}

let PORT;
(async () => {
  await new Promise(r => server.listen(0, r)); PORT = server.address().port;
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  console.log('▶ ' + path.basename(file));
  if (!process.argv.includes('--solo-recorrido')) {
    await layout(browser, 'escritorio', { width: 1366, height: 820 });
    await layout(browser, 'celular', { width: 390, height: 844 });
    await layout(browser, 'oscuro', { width: 1280, height: 820 });
  }
  await walk(browser);
  await browser.close(); server.close();
  console.log(fails.length ? `✗ ${fails.length} problemas` : '✓ sin problemas');
  console.log('capturas en ' + shots);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
