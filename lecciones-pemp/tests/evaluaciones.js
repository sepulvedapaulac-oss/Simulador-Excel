// Prueba las evaluaciones de módulo · Parte 2: recorrido completo en el LMS simulado,
// nota por rúbrica, registro SCORM (estado, nota, interacciones), reanudación,
// corrección al final, nuevo intento y diseño en escritorio y celular.
// Uso: node tests/evaluaciones.js <carpeta_capturas>
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || 'shots_eval');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8767;
const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); r.end(d); } });
}).listen(PORT);

const problems = [];
const fail = m => { problems.push(m); console.log('  ✗ ' + m); };
const levelPts = acc => acc >= 0.85 ? 20 : acc >= 0.6 ? 14 : acc >= 0.35 ? 8 : 0;
const TEXT = 'Detengo el equipo, lo dejo fuera de servicio y señalizado, comunico a Andrés los hechos y la condición final, y espero la evaluación.';

async function overflow(fr, tag) {
  const o = await fr.evaluate(() => {
    const w = document.documentElement.clientWidth, bad = [];
    if (document.documentElement.scrollWidth > w + 1) bad.push('scroll horizontal ' + document.documentElement.scrollWidth);
    document.querySelectorAll('.screen.active *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > w + 1 && !el.closest('.rubric-wrap')) bad.push((el.className || el.tagName) + ' ' + Math.round(r.right));
    });
    return bad.slice(0, 3);
  });
  o.forEach(b => fail(`${tag}: ${b}`));
}
async function nextVisible(fr, tag) {
  const ok = await fr.evaluate(() => {
    const b = document.querySelector('.screen.active .scr-nav .btn:not(.ghost)');
    const r = b.getBoundingClientRect();
    return r.bottom <= innerHeight + 1 && r.top >= 0;
  });
  if (!ok) fail(`${tag}: el botón Continuar no está a la vista`);
}

// Resuelve la tarea de la pantalla activa; con «error» introduce un error conocido y devuelve la proporción esperada
async function solve(fr, error) {
  const type = await fr.$eval('.screen.active .task', t => t.dataset.type);
  const T = '.screen.active .task ';
  let acc = 1;
  if (type === 'form') {
    const rows = await fr.$$eval(T + '.frow select', l => l.map(s => ({ ok: s.dataset.ok, opts: [...s.options].map(o => o.value).filter(Boolean) })));
    for (let i = 0; i < rows.length; i++) {
      const v = error && i === 0 ? rows[i].opts.find(o => o !== rows[i].ok) : rows[i].ok;
      await fr.selectOption(`${T}.frow:nth-child(${i + 1}) select`, v);
    }
    if (error) acc = (rows.length - 1) / rows.length;
  } else if (type === 'evidence') {
    const oks = await fr.$$eval(T + '.ev', l => l.map(b => !!b.dataset.ok));
    let skipped = false;
    for (let i = 0; i < oks.length; i++) {
      if (!oks[i]) continue;
      if (error && !skipped) { skipped = true; continue; }
      await (await fr.$$(T + '.ev'))[i].click();
    }
    const n = oks.filter(Boolean).length;
    if (error) acc = (n - 1) / n;
  } else if (type === 'classify') {
    const oks = await fr.$$eval(T + '.ci', l => l.map(c => +c.dataset.ok));
    for (let i = 0; i < oks.length; i++) {
      const k = error && i === 0 ? (oks[i] + 1) % 2 : oks[i];
      await fr.click(`${T}.ci:nth-child(${i + 1}) .seg button[data-i="${k}"]`);
    }
    if (error) acc = (oks.length - 1) / oks.length;
  } else if (type === 'order') {
    const n = await fr.$$eval(T + '.ord li', l => l.length);
    for (let i = 0; i < n; i++) {
      let ks = await fr.$$eval(T + '.ord li', l => l.map(x => +x.dataset.k));
      let j = ks.indexOf(i);
      while (j > i) { await fr.click(`${T}.ord li:nth-child(${j + 1}) .mv button:first-child`); j--; }
    }
    if (error) { await fr.click(`${T}.ord li:nth-child(2) .mv button:first-child`); const P = n * (n - 1) / 2; acc = Math.max(0, ((P - 1) / P - 0.5) / 0.5); }
  } else if (type === 'matrix') {
    const rows = await fr.$$eval(T + 'tbody tr', l => l.map(tr => tr.dataset.ok.split(' ')));
    for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[r].length; c++) {
      const sel = `${T}tbody tr:nth-child(${r + 1}) td:nth-of-type(${c + 1}) .cell`;
      await fr.click(sel); if (rows[r][c] === '0') await fr.click(sel);
    }
    const ok = await fr.$eval(T + '.mx-choice', d => +d.dataset.ok);
    await fr.click(`${T}.mx-choice .seg button[data-i="${error ? (ok + 1) % 3 : ok}"]`);
    if (error) acc = 0.7;
  } else if (type === 'verdict') {
    const ok = await fr.$eval(T, t => +t.dataset.ok);
    await fr.click(`${T}.block .seg button[data-i="${error ? (ok + 1) % 3 : ok}"]`);
    const sups = await fr.$$eval(T + '.sup', l => l.map(b => !!b.dataset.ok));
    for (let i = 0; i < sups.length; i++) if (sups[i]) await fr.click(`${T}.sup-list .sup:nth-child(${i + 1})`);
    if (error) acc = 0.5;
  }
  for (const ta of await fr.$$(T + '.otext textarea')) await ta.fill(TEXT);
  return acc;
}
async function deliver(fr) {
  const center = () => fr.evaluate(() => document.querySelector('.screen.active .deliver').scrollIntoView({ block: 'center' }));
  await center(); await fr.click('.screen.active .deliver .btn');
  await fr.waitForTimeout(400); await center(); await fr.click('.screen.active .deliver .btn');
}

async function run(page, file, vp) {
  const tag = file.replace('Evaluacion_', 'Ev ').replace('_Parte2_Caso_aplicado.html', '') + ' ' + vp;
  let fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  let shot = 0;
  const snap = async () => { await page.waitForTimeout(350); await overflow(fr, tag + ' p' + (shot + 1)); await page.screenshot({ path: `${OUT}/${file.slice(11, 13)}_${vp}_${String(++shot).padStart(2, '0')}.png` }); };
  const next = async () => { await nextVisible(fr, tag + ' p' + shot); await fr.click('.screen.active .scr-nav .btn:not(.ghost)'); };
  const error = vp === 'celular';
  await snap();
  if (!(await fr.$eval('.screen.active .scr-nav .btn:not(.ghost)', b => b.disabled))) fail(`${tag}: deja avanzar sin confirmar la lectura`);
  await fr.click('.ack'); await next();
  for (const d of await fr.$$('.screen.active .doc summary')) await d.click();
  await snap(); await next();
  let expected = 0;
  for (let k = 1; k <= 5; k++) {
    const blocked = await fr.$eval('.screen.active .scr-nav .btn:not(.ghost)', b => b.disabled);
    if (!blocked) fail(`${tag}: criterio ${k} deja avanzar sin entregar`);
    const acc = await solve(fr, error && k === 1);
    expected += levelPts(acc);
    await snap(); await deliver(fr);
    const locked = await fr.$eval('.screen.active .deliver', d => d.classList.contains('sent'));
    if (!locked) fail(`${tag}: criterio ${k} no quedó entregado`);
    if (k === 2 && vp === 'escritorio') {
      await page.reload(); await page.waitForTimeout(900);
      fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
      const st = await fr.evaluate(() => [document.querySelector('.screen.active').dataset.id, document.querySelector('.screen.active .deliver').classList.contains('sent')]);
      if (st[0] !== 'c2' || !st[1]) fail(`${tag}: al reanudar muestra ${st}`); else console.log(`  ✓ ${tag}: reanuda en el criterio 2 con la respuesta entregada`);
    }
    await next();
  }
  await snap();
  const db = await page.evaluate(() => window.__db);
  const status = expected >= 70 ? 'passed' : 'failed';
  const nInt = Object.keys(db).filter(k => /^cmi\.interactions\.\d+\.id$/.test(k)).length;
  if (db['cmi.core.score.raw'] !== String(expected) || db['cmi.core.lesson_status'] !== status) fail(`${tag}: SCORM ${db['cmi.core.lesson_status']} ${db['cmi.core.score.raw']} (esperado ${status} ${expected})`);
  else console.log(`  ✓ ${tag}: ${status}, nota ${expected}${error ? ' (un error en el criterio 1)' : ''} · ${nInt} interacciones registradas`);
  const shown = await fr.$eval('.res-hero .score-ring b', b => b.textContent);
  if (shown !== String(expected)) fail(`${tag}: la pantalla muestra ${shown}`);
  // revisión: la corrección aparece en la pantalla del criterio 1
  await fr.click('.res-table [data-go="c1"]');
  const rev = await fr.evaluate(() => document.querySelector('.screen.active .task').classList.contains('reviewing') && document.querySelectorAll('.screen.active .why').length > 0);
  if (!rev) fail(`${tag}: no muestra la corrección al revisar`);
  await snap();
  // nuevo intento: limpia las respuestas sin perder el mejor puntaje
  await fr.evaluate(() => document.querySelector('.route li:last-child button').click());
  await fr.click('[data-act="retry"]'); await fr.click('[data-act="retry"]');
  const r = await fr.evaluate(() => [document.querySelector('.screen.active').dataset.id, document.querySelectorAll('.deliver.sent').length]);
  const db2 = await page.evaluate(() => window.__db);
  if (r[0] !== 'c1' || r[1] !== 0 || db2['cmi.core.score.raw'] !== String(expected)) fail(`${tag}: nuevo intento ${r} nota ${db2['cmi.core.score.raw']}`);
  else console.log(`  ✓ ${tag}: nuevo intento limpio, conserva la nota ${expected}`);
}

(async () => {
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const files = fs.readdirSync(path.join(ROOT, 'dist')).filter(f => /^Evaluacion_M\d_Parte2_Caso_aplicado\.html$/.test(f)).sort();
  for (const [vp, size] of [['escritorio', { width: 1280, height: 800 }], ['celular', { width: 390, height: 760 }]]) {
    for (const file of files) {
      if (process.env.SOLO && !file.includes(process.env.SOLO)) continue;
      const ctx = await browser.newContext({ viewport: size, hasTouch: vp === 'celular', isMobile: vp === 'celular' });
      const page = await ctx.newPage();
      page.on('pageerror', e => fail(`${file} ${vp}: error JS ${e.message}`));
      await page.goto(`http://localhost:${PORT}/tests/lms_mock.html?src=/dist/${file}&clear=1`);
      await page.goto(`http://localhost:${PORT}/tests/lms_mock.html?src=/dist/${file}`);
      await page.waitForTimeout(800);
      try { await run(page, file, vp); } catch (e) { fail(`${file} ${vp}: ${e.message.split('\n').slice(0,6).join(' | ')}`); }
      await ctx.close();
    }
  }
  await browser.close(); server.close();
  console.log(problems.length ? `✗ ${problems.length} problemas` : '✓ sin problemas');
  process.exit(problems.length ? 1 : 0);
})();
