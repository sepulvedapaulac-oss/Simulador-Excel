// Comprueba que el video reproduzca la narración real, avance el tiempo, cambie subtítulos y pase de escena.
const path = require('path');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
(async () => {
  const file = 'file://' + path.resolve(process.argv[2]);
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.goto(file + '?reset=1');
  await p.evaluate(() => { localStorage.setItem('tls_autonarr', '0'); window.__lesson.state.fin = true; window.__lesson.go(1); });
  if (await p.$eval('.screen.active .vbig', b => !b.hidden)) await p.click('.screen.active .vbig');
  const subs = new Set();
  for (let i = 0; i < 14; i++) { await p.waitForTimeout(1000); subs.add(await p.$eval('.screen.active .vsub', s => s.textContent)); }
  const t = await p.$eval('.screen.active .vtime', s => s.textContent);
  const ch = await p.$eval('.screen.active .chap.cur .cn', s => s.textContent);
  const pts = await p.$$eval('.screen.active .vscene.on li.in', l => l.length);
  console.log(JSON.stringify({ tiempo: t, capitulo: ch, subtitulos_distintos: subs.size, puntos_visibles: pts }));
  await b.close();
})();
