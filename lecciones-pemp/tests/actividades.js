// Prueba las actividades prácticas: recorrido completo en el LMS simulado, nota SCORM,
// reintento y diseño (desbordes) en escritorio y celular.
// Uso: node tests/actividades.js <carpeta_capturas>
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || 'shots_act');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8766;
const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); r.end(d); } });
}).listen(PORT);

const problems = [];
const fail = m => { problems.push(m); console.log('  ✗ ' + m); };

async function overflow(fr, tag) {
  const o = await fr.evaluate(() => {
    const w = document.documentElement.clientWidth, bad = [];
    if (document.documentElement.scrollWidth > w + 1) bad.push('scroll horizontal ' + document.documentElement.scrollWidth);
    document.querySelectorAll('.screen.active *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > w + 1 && getComputedStyle(el).position !== 'absolute' && !el.closest('.matrix-wrap')) bad.push((el.className || el.tagName) + ' ' + Math.round(r.right));
    });
    return bad.slice(0, 3);
  });
  o.forEach(b => fail(`${tag}: ${b}`));
}

async function navVisible(fr, sel, tag) {
  const ok = await fr.evaluate(s => {
    const b = [...document.querySelectorAll(s)].find(x => x.offsetParent);
    if (!b) return 'sin botón';
    const r = b.getBoundingClientRect();
    return r.bottom <= innerHeight + 1 && r.top >= 0 ? 'ok' : 'fuera de vista ' + Math.round(r.top) + '/' + innerHeight;
  }, sel);
  if (ok !== 'ok') fail(`${tag}: botón de avance ${ok}`);
}

async function desafio(page, vp) {
  const tag = 'desafío ' + vp;
  const fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  let shot = 0;
  const snap = async () => { await overflow(fr, tag + ' p' + (shot + 1)); await page.screenshot({ path: `${OUT}/desafio_${vp}_${String(++shot).padStart(2, '0')}.png` }); };
  await snap(); await navVisible(fr, '#nextBtn', tag); await fr.click('#nextBtn');
  await snap(); await fr.click('#nextBtn');
  const sc = await fr.evaluate(() => [...document.querySelectorAll('[data-screen]')].length);
  const answers = { A: 'tijera', B: 'articulado', C: 'telescopico', D: 'insuficiente' };
  for (const k of ['A', 'B', 'C', 'D']) {
    await fr.click(`label[for="family-${k}-${answers[k]}"]`);
    // la familia no debe mostrar corrección antes de verificar
    const pre = await fr.evaluate(k => document.querySelector(`input[name="family-${k}"]`).closest('section').querySelector('[data-role="family-feedback"]').classList.contains('show'), k);
    if (pre) fail(`${tag} ${k}: muestra la corrección de la familia antes de verificar`);
    await fr.click(`label[for="just-${k}-j1"]`);
    await fr.click(`label[for="risk-${k}-r1"]`);
    await fr.click(`label[for="risk-${k}-r2"]`);
    await fr.evaluate(k => document.querySelector(`input[name="family-${k}"]`).closest('section').querySelector('[data-role="check-btn"]').click(), k);
    await snap(); await navVisible(fr, '#nextBtn', tag);
    await fr.click('#nextBtn');
  }
  await snap(); await fr.click('#nextBtn');
  await snap();
  await fr.click('#finishBtn');
  await page.waitForTimeout(200);
  const db = await page.evaluate(() => window.__db);
  if (db['cmi.core.lesson_status'] !== 'completed' || db['cmi.core.score.raw'] !== '100') fail(`${tag}: SCORM ${db['cmi.core.lesson_status']} ${db['cmi.core.score.raw']}`);
  else console.log(`  ✓ ${tag}: completed, nota ${db['cmi.core.score.raw']} (${sc} pantallas)`);
}

async function lab(page, vp) {
  const tag = 'laboratorio ' + vp;
  const fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  let shot = 0;
  const snap = async () => { await overflow(fr, tag + ' p' + (shot + 1)); await page.screenshot({ path: `${OUT}/lab_${vp}_${String(++shot).padStart(2, '0')}.png` }); };
  const cont = async n => {  await navVisible(fr, `#btn-continuar-${n}`, tag + ' p' + n); await fr.click(`#btn-continuar-${n}`); };
  await snap();
  await fr.click('text=¡COMENZAR!');
  await snap(); await fr.click('#screen-2 .btn:not(.secondary)');
  // familias
  const esc = await fr.evaluate(() => ESCENAS.map(e => e.correcta));
  const lab = { tijera: 'Tijera', articulado: 'Brazo articulado', telescopico: 'Brazo telescópico' };
  const cards = await fr.$$('.scene-card');
  for (let i = 0; i < cards.length; i++) await (await cards[i].$(`button:has-text("${lab[esc[i]]}")`)).click();
  await snap(); await cont(3);
  // componentes: usar la lista de puntos bajo la imagen
  for (const s of [4, 5]) {
    const chips = await fr.$$(`#screen-${s} .hs-chip`);
    if (chips.length !== 7) fail(`${tag}: pantalla ${s} tiene ${chips.length} chips`);
    for (const c of chips) await c.click();
    await snap(); await cont(s);
  }
  // riesgos
  const ries = await fr.evaluate(() => Object.fromEntries(Object.entries(RIESGOS).map(([k, v]) => [k, v.decision])));
  const dl = { continuar: 'Continuar evaluando', corregir: 'Corregir antes', detener: 'Detener y reportar' };
  for (const [k, d] of Object.entries(ries)) {
    await fr.evaluate(k => document.querySelector(`#screen-6 .hotspot[data-hs="${k}"]`).scrollIntoView({ block: 'center' }), k);
    await fr.click(`#screen-6 .hotspot[data-hs="${k}"]`);
    await fr.click(`#riesgo-panel button:has-text("${dl[d]}")`);
  }
  await snap(); await cont(6);
  // responsabilidad
  const resp = await fr.evaluate(() => RESP_CASOS.map(c => c.correcta));
  const blocks = await fr.$$('#resp-cases .case-block');
  for (let i = 0; i < blocks.length; i++) await (await blocks[i].$(`button:text-is("${resp[i]}")`)).click();
  await snap(); await cont(7);
  // integrada
  await fr.click('#integrada-tareas button:text-is("Brazo articulado")');
  await fr.check('#integrada-tareas input[value="brazo"]');
  await fr.check('#integrada-tareas input[value="ctrl-plat"]');
  await fr.click('#integrada-tareas button:has-text("Confirmar componentes")');
  await fr.click('#integrada-tareas button:has-text("Pendiente del terreno")');
  await fr.click('#integrada-tareas button:has-text("Detener y obtener")');
  await snap(); await cont(8);
  await snap();
  let db = await page.evaluate(() => window.__db);
  if (db['cmi.core.lesson_status'] !== 'completed' || db['cmi.core.score.raw'] !== '100') fail(`${tag}: SCORM ${db['cmi.core.lesson_status']} ${db['cmi.core.score.raw']}`);
  else console.log(`  ✓ ${tag}: completed, nota ${db['cmi.core.score.raw']}`);
  // reintento sin recargar: vuelve al inicio con todo limpio y sigue registrando
  page.once('dialog', d => d.accept());
  await fr.click('text=↺ Reintentar laboratorio');
  const st = await fr.evaluate(() => [TLS_STATE.screenIndex, document.querySelectorAll('.hotspot.visited').length, document.getElementById('btn-continuar-3').disabled]);
  if (st[0] !== 1 || st[1] !== 0 || !st[2]) fail(`${tag}: reintento no reinicia (${st})`);
  else console.log(`  ✓ ${tag}: reintento limpio`);
}

async function desafio2(page, vp) {
  const tag = 'desafío M2 ' + vp;
  const fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  let shot = 0;
  const snap = async () => { await overflow(fr, tag + ' p' + (shot + 1)); await page.screenshot({ path: `${OUT}/m2desafio_${vp}_${String(++shot).padStart(2, '0')}.png` }); };
  const next = async () => { await navVisible(fr, '.screen.active [data-next]', tag + ' p' + (shot)); await fr.click('.screen.active [data-next]'); };
  await snap(); await fr.click('#btnStart');
  await snap(); await next();
  for (let i = 0; i < 5; i++) {
    for (const q of ['verdict', 'evidence', 'next']) await fr.click(`.screen.active [data-q="${q}"] [data-correct="1"]`);
    await snap(); await next();
  }
  await fr.click('#intOptions [data-correct="1"]');
  await snap(); await next();
  await snap();
  const db = await page.evaluate(() => window.__db);
  if (db['cmi.core.lesson_status'] !== 'completed' || db['cmi.core.score.raw'] !== '100') fail(`${tag}: SCORM ${db['cmi.core.lesson_status']} ${db['cmi.core.score.raw']}`);
  else console.log(`  ✓ ${tag}: completed al ver el resultado, nota ${db['cmi.core.score.raw']}`);
  await fr.click('.screen.active [data-next]'); await fr.click('#btnFinish');
}

async function lab2(page, vp) {
  const tag = 'laboratorio M2 ' + vp;
  let fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  let shot = 0;
  const snap = async () => { await overflow(fr, tag + ' p' + (shot + 1)); await page.screenshot({ path: `${OUT}/m2lab_${vp}_${String(++shot).padStart(2, '0')}.png` }); };
  const cont = async () => { await navVisible(fr, '#btnContinuar', tag + ' p' + shot); await fr.click('#btnContinuar'); };
  const EQ = { barandas: 'critico', ruedas: 'corregir' }, EN = { transito: 'controlable', electrica: 'critico' };
  const errar = vp === 'celular'; // en celular, el primer punto se responde mal para comprobar el puntaje al primer intento
  await snap(); await fr.click('#btnComenzar');
  await snap(); await fr.click('.opcion-ruta[data-ruta="A"]');
  for (const d of await fr.$$('.doc-card')) { await fr.click(`.doc-card[data-doc="${await d.getAttribute('data-doc')}"]`); }
  await snap(); await cont();
  const puntos = async (map, def) => {
    const ids = await fr.$$eval('.hs-item', l => l.map(x => x.dataset.hs));
    for (const id of ids) {
      await fr.click(`.hs-item[data-hs="${id}"]`);
      if (errar && id === 'general') await fr.click('[data-hsop="corregir"]');
      await fr.click(`[data-hsop="${map[id] || def}"]`);
      await fr.click('#btnCerrarModal');
    }
  };
  await puntos(EQ, 'ok'); await snap(); await cont();
  // reanudación: recargar el LMS y comprobar que vuelve a la misma pantalla
  if (vp === 'escritorio') {
    await page.reload(); await page.waitForTimeout(800);
    fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
    const t = await fr.textContent('h2.pantalla-titulo');
    if (!/Hallazgos visibles/.test(t)) fail(`${tag}: al reanudar muestra «${t}»`); else console.log(`  ✓ ${tag}: reanuda en la pantalla 5`);
  }
  for (const [id, v] of [['img1', 'corregir'], ['img2', 'detener'], ['img3', 'detener'], ['img4', 'continuar']]) await fr.click(`[data-img="${id}"][data-op="${v}"]`);
  await snap(); await cont();
  const orden = ['Confirmar área controlada', 'Reconocer los controles del modelo', 'Ejecutar la comprobación prevista', 'Observar respuesta, alarmas e indicadores', 'Detener ante una respuesta anormal o desconocida', 'Registrar el resultado'];
  for (let i = 0; i < orden.length; i++) {
    let cur = await fr.$$eval('.secuencia-item .txt', l => l.map(x => x.textContent));
    let j = cur.indexOf(orden[i]);
    while (j > i) { await fr.click(`[data-mover="up"][data-idx="${j}"]`); j--; }
  }
  await fr.click('#btnVerificarOrden');
  await fr.click('[data-decision="detener"]');
  await snap(); await cont();
  await puntos(EN, 'apta'); await snap(); await cont();
  const coord = await fr.$$eval('[data-coord][data-val="confirmado"]', l => l.map(x => x.dataset.coord));
  for (const c of coord) await fr.click(`[data-coord="${c}"][data-val="${c === 'emergencia' ? 'pendiente' : 'confirmado'}"]`);
  await snap(); await cont();
  await fr.click('[data-veredicto="detener"]');
  await snap(); await cont();
  await snap();
  const db = await page.evaluate(() => window.__db);
  const esperado = errar ? '98' : '100';
  if (db['cmi.core.lesson_status'] !== 'completed' || db['cmi.core.score.raw'] !== esperado) fail(`${tag}: SCORM ${db['cmi.core.lesson_status']} ${db['cmi.core.score.raw']} (esperado ${esperado})`);
  else console.log(`  ✓ ${tag}: completed al llegar al informe, nota ${db['cmi.core.score.raw']}${errar ? ' (un error al primer intento)' : ''}`);
  await cont(); await fr.click('#btnFinalizarLab');
}

async function desafio3(page, vp) {
  const tag = 'desafío M3 ' + vp;
  const fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  let shot = 0;
  const snap = async () => { await overflow(fr, tag + ' p' + (shot + 1)); await page.screenshot({ path: `${OUT}/m3desafio_${vp}_${String(++shot).padStart(2, '0')}.png` }); };
  const next = async () => { await navVisible(fr, '#screenContent .sticky-next', tag + ' p' + shot); await fr.click('#screenContent .sticky-next:visible'); };
  const errar = vp === 'celular'; // en celular la primera decisión se responde mal: nota esperada 75
  const fotos = async () => fr.$$eval('#screenContent img', l => l.map(i => i.src.slice(-40)));
  const f1 = await fotos();
  await snap(); await fr.click('#btnStart');
  const f2 = await fotos();
  if (new Set([...f1, ...f2]).size !== 3) fail(`${tag}: las fotos de las pantallas 1 y 2 se repiten`);
  await fr.click('#btnReveal'); await snap(); await next();
  await fr.click(`#optionsWrap .option:has-text("${errar ? 'A. Continuar' : 'B. Detener'}")`);
  await snap(); await next();
  for (const t of ['Posición', 'Trayectoria', 'Estructura superior', 'Espacio disponible', 'Posibilidad de reposicionamiento', 'Condiciones del área']) await fr.click(`.check-item:has-text("${t}")`);
  await snap(); await next();
  await snap(); await next();
  await fr.click('#optionsWrap5 .option:has-text("B. Elegir")'); await snap(); await next();
  await fr.click('#tfFalse'); await snap(); await next();
  for (const c of await fr.$$('.step-card')) await c.click();
  await snap(); await next();
  await snap();
  const esperado = errar ? '75' : '100';
  const db = await page.evaluate(() => window.__db);
  if (db['cmi.core.lesson_status'] !== 'completed' || db['cmi.core.score.raw'] !== esperado) fail(`${tag}: SCORM ${db['cmi.core.lesson_status']} ${db['cmi.core.score.raw']} (esperado ${esperado})`);
  else console.log(`  ✓ ${tag}: completed al ver el resultado, nota ${db['cmi.core.score.raw']}${errar ? ' (un error)' : ''}`);
  await fr.click('#btnRestart');
  const f3 = await fotos();
  if (f3[0] !== f1[0]) fail(`${tag}: al reiniciar la portada muestra otra foto`);
  const st = (await page.evaluate(() => window.__db))['cmi.core.lesson_status'];
  if (st !== 'completed') fail(`${tag}: reiniciar dejó el estado en ${st}`); else console.log(`  ✓ ${tag}: reinicio limpio sin perder el completado`);
}

async function lab3(page, vp) {
  const tag = 'laboratorio M3 ' + vp;
  const fr = page.frame({ url: u => u.pathname.startsWith('/dist/') });
  let shot = 0;
  const snap = async () => { await overflow(fr, tag + ' p' + (shot + 1)); await page.screenshot({ path: `${OUT}/m3lab_${vp}_${String(++shot).padStart(2, '0')}.png` }); };
  const sig = async () => { await navVisible(fr, '#btnSiguiente', tag + ' p' + shot); await fr.click('#btnSiguiente'); };
  const bloqueado = async n => { if (!(await fr.$eval('#btnSiguiente', b => b.disabled))) fail(`${tag}: pantalla ${n} deja avanzar sin resolver la actividad`); };
  const errar = vp === 'celular'; // en celular se responde mal la pantalla 6: nota esperada 88
  await snap(); await fr.click('text=INICIAR LABORATORIO');
  await bloqueado(2);
  for (const c of await fr.$$('#escenarioCards .info-card')) await c.click();
  await snap(); await sig();
  await bloqueado(3);
  for (const t of ['Superficie de apoyo', 'Pendiente', 'Desnivel', 'Borde', 'Obstáculo superior', 'Tránsito', 'Delimitación del área']) await fr.click(`#p3-opciones .opcion-btn:text-is("${t}")`);
  await fr.click('#p3-verificar'); await snap(); await sig();
  await bloqueado(4);
  for (const it of await fr.$$('#p4-banco .item-clasificable')) {
    const z = await it.getAttribute('data-zona');
    await (await it.$(`.destinos button:has-text("${z === 'controlada' ? 'Condición controlada' : 'Requiere corrección'}")`)).click();
  }
  await snap(); await sig();
  await bloqueado(5);
  const orden = ['Revisar entorno', 'Posicionar equipo', 'Controlar área', 'Preparar plataforma', 'Ejecutar movimiento', 'Realizar tarea', 'Descender', 'Estacionar', 'Comunicar hallazgos'];
  for (let i = 0; i < orden.length; i++) {
    const cur = await fr.$$eval('#p5-lista li > span:nth-child(2)', l => l.map(x => x.textContent));
    let j = cur.indexOf(orden[i]);
    while (j > i) { await fr.click(`#p5-lista li:nth-child(${j + 1}) button:has-text("▲")`); j--; }
  }
  await fr.click('text=VERIFICAR SECUENCIA'); await snap(); await sig();
  await bloqueado(6);
  await fr.click(`#p6-opciones [data-op="${errar ? 'a' : 'b'}"]`); await snap(); await sig();
  await bloqueado(7);
  for (const card of await fr.$$('#p7-grid .seguro-card')) {
    const t = await card.$eval('.texto', e => e.textContent);
    const inseguro = /caja|barandas|Inclinar/.test(t);
    await (await card.$(`button:text-is("${inseguro ? 'NO SEGURO' : 'SEGURO'}")`)).click();
  }
  await snap(); await sig();
  await bloqueado(8);
  for (const t of ['Descenso controlado', 'Estacionamiento en la zona definida', 'Aislamiento o carga', 'Comunicación de hallazgos', 'Retiro de servicio']) await fr.click(`#p8-checklist .check-item:has-text("${t}")`);
  await fr.click('text=CONFIRMAR CIERRE'); await snap(); await sig();
  await snap();
  const esperado = errar ? '88' : '100';
  const db = await page.evaluate(() => window.__db);
  if (db['cmi.core.lesson_status'] !== 'completed' || db['cmi.core.score.raw'] !== esperado) fail(`${tag}: SCORM ${db['cmi.core.lesson_status']} ${db['cmi.core.score.raw']} (esperado ${esperado})`);
  else console.log(`  ✓ ${tag}: completed al ver el resultado, nota ${db['cmi.core.score.raw']}${errar ? ' (un error)' : ''}`);
  await sig(); await snap();
  await fr.click('text=VOLVER AL INICIO');
  const st = (await page.evaluate(() => window.__db))['cmi.core.lesson_status'];
  const limpio = await fr.evaluate(() => document.querySelectorAll('.info-card.visto, #p4-banco .item-clasificable').length);
  if (st !== 'completed' || limpio !== 8) fail(`${tag}: reinicio ${st} ${limpio}`); else console.log(`  ✓ ${tag}: reinicio limpio sin perder el completado`);
}

(async () => {
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  for (const [vp, size] of [['escritorio', { width: 1280, height: 800 }], ['celular', { width: 390, height: 760 }]]) {
    for (const [fn, file] of [[desafio, 'Actividad_M1_Desafio_Que_equipo_corresponde.html'], [lab, 'Actividad_M1_Laboratorio_Reconoce_la_PEMP.html'], [desafio2, 'Actividad_M2_Desafio_Autorizar_no_es_marcar_casillas.html'], [lab2, 'Actividad_M2_Laboratorio_Inspeccion_preoperacional.html'], [desafio3, 'Actividad_M3_Desafio_El_techo_esta_cerca.html'], [lab3, 'Actividad_M3_Laboratorio_Ruta_vertical_segura.html']]) {
      if (process.env.SOLO && !file.includes(process.env.SOLO)) continue;
      const ctx = await browser.newContext({ viewport: size, hasTouch: vp === 'celular', isMobile: vp === 'celular' });
      const page = await ctx.newPage();
      page.on('pageerror', e => fail(`${file} ${vp}: error JS ${e.message}`));
      await page.goto(`http://localhost:${PORT}/tests/lms_mock.html?src=/dist/${file}&clear=1`);
      await page.goto(`http://localhost:${PORT}/tests/lms_mock.html?src=/dist/${file}`);
      await page.waitForTimeout(800);
      try { await fn(page, vp); } catch (e) { fail(`${file} ${vp}: ${e.message.split('\n')[0]}`); }
      await ctx.close();
    }
  }
  await browser.close(); server.close();
  console.log(problems.length ? `✗ ${problems.length} problemas` : '✓ sin problemas');
  process.exit(problems.length ? 1 : 0);
})();
