// Recorrido automático: resuelve cada pantalla, falla y reintenta la comprobación, verifica SCORM y desbordes.
// uso: node test_lesson.js archivo.html carpeta_capturas
const {chromium}=require('playwright');const path=require('path');
const file=path.resolve(process.argv[2]),out=process.argv[3]||'.';
const mock=`window.API={_d:{},LMSInitialize(){return 'true'},LMSFinish(){return 'true'},LMSGetValue(k){return this._d[k]||''},LMSSetValue(k,v){this._d[k]=v;return 'true'},LMSCommit(){return 'true'},LMSGetLastError(){return '0'},LMSGetErrorString(){return ''},LMSGetDiagnostic(){return ''}};`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const errs=[];
for(const vp of [{w:1366,h:800,n:'desk'},{w:390,h:844,n:'mob'}]){
 const p=await b.newPage({viewport:{width:vp.w,height:vp.h}});p.on('pageerror',e=>errs.push(vp.n+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(vp.n+' console: '+m.text())});
 await p.addInitScript(mock);await p.goto('file://'+file);
 const N=await p.$$eval('.screen',s=>s.length);
 for(let i=0;i<N;i++){
  const s=`.screen:nth-of-type(${i+1})`;const act=await p.$eval('.screen.active',e=>[...document.querySelectorAll('.screen')].indexOf(e));
  if(act!==i)throw new Error('se esperaba pantalla '+i+' activa, está '+act);
  const nextDisabledBefore=await p.$eval('#nextBtn',e=>e.disabled);
  // resolver
  await p.evaluate(async()=>{const S=document.querySelector('.screen.active'),w=t=>new Promise(r=>setTimeout(r,t));
   for(const st of S.querySelectorAll('.branch .bstep')){const bad=st.querySelector('.opt:not([data-ok])');if(bad)bad.click();st.querySelector('.opt[data-ok]').click();const n=st.querySelector('.bnext');if(n&&n.style.display!=='none')n.click()}
   S.querySelectorAll('.chapters button').forEach(b=>b.click());S.querySelectorAll('.hs').forEach(b=>b.click());S.querySelectorAll('.cards .flip').forEach(b=>b.click());
   S.querySelectorAll('.classify').forEach(c=>{const its=[...c.querySelectorAll('.citem')];its.forEach((it,k)=>{if(k===0){const wrong=[...c.querySelectorAll('.cbin')].find(x=>x.dataset.cat!==it.dataset.cat);it.click();wrong.click()}it.click();[...c.querySelectorAll('.cbin')].find(x=>x.dataset.cat===it.dataset.cat).click()})});
   S.querySelectorAll('.srow').forEach((r,k)=>r.querySelectorAll('button')[k%3].click());
   S.querySelectorAll('.order').forEach(o=>{o.querySelector('.ocheck').click();for(let pass=0;pass<10;pass++){const li=[...o.querySelectorAll('.olist li')];for(let k=1;k<li.length;k++){if(+li[k].dataset.p<+li[k-1].dataset.p){li[k].querySelector('.up').click();break}}}o.querySelector('.ocheck').click()});
   S.querySelectorAll('.acc .ah, .tab, .tlb').forEach(b=>b.click());
   for(const g of S.querySelectorAll('.match,.sim,.fill')){const rows=g.querySelectorAll('[data-ans]');rows.forEach(r=>{const sel=r.tagName==='SELECT'?r:r.querySelector('select');const opt=[...sel.options].find(o=>o.value&&o.value!==(r.dataset.ans));if(opt)sel.value=opt.value});(g.querySelector('.mcheck,.scheck,.fcheck')||g.parentNode.querySelector('.mcheck,.scheck,.fcheck')).click();
    rows.forEach(r=>{const sel=r.tagName==='SELECT'?r:r.querySelector('select');sel.value=r.dataset.ans});(g.querySelector('.mcheck,.scheck,.fcheck')||g.parentNode.querySelector('.mcheck,.scheck,.fcheck')).click()}
   const qz=S.querySelector('.quiz');if(qz){qz.querySelectorAll('.q').forEach(q=>q.querySelector('.opt:not([data-ok])').click());await w(50);window.__failMsg=qz.querySelector('.result').textContent;qz.querySelector('.qretry').click();qz.querySelectorAll('.q').forEach(q=>q.querySelector('.opt[data-ok]').click())}
   S.querySelectorAll('.tr textarea').forEach(t=>{t.value='Texto de prueba suficientemente largo para validar.';t.dispatchEvent(new Event('input'))});
  });
  await p.waitForTimeout(250);
  // desbordes
  const ov=await p.evaluate(()=>{const S=document.querySelector('.screen.active'),r=[];if(document.documentElement.scrollWidth>window.innerWidth+1)r.push('scroll horizontal '+document.documentElement.scrollWidth);
   S.querySelectorAll('*').forEach(e=>{if(e.closest('.flip,.vscene,.vtext,.hotspot'))return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.overflow!=='visible')return;if(e.scrollWidth>e.clientWidth+2&&e.clientWidth>0&&['P','H1','H2','H3','BUTTON','SPAN','LABEL','LI','B'].includes(e.tagName))r.push(e.tagName+': '+e.textContent.slice(0,40))});
   S.querySelectorAll('.face').forEach(f=>{if(f.scrollHeight>f.clientHeight+2)r.push('tarjeta desborda: '+f.textContent.slice(0,40))});return r});
  if(ov.length)errs.push(vp.n+' pantalla '+(i+1)+': '+ov.join(' | '));
  await p.screenshot({path:`${out}/${path.basename(file,'.html')}_${vp.n}_${String(i+1).padStart(2,'0')}.png`,fullPage:vp.n==='desk'});
  if(i<N-1){const dis=await p.$eval('#nextBtn',e=>e.disabled);if(dis)errs.push(vp.n+' pantalla '+(i+1)+': no se desbloqueó');if(i>0&&!nextDisabledBefore&&i!==N-1)errs.push(vp.n+' pantalla '+(i+1)+': no estaba bloqueada al llegar');await p.click('#nextBtn');await p.waitForTimeout(150)}
 }
 const fail=await p.evaluate(()=>window.__failMsg);const d=await p.evaluate(()=>window.API._d);
 console.log(vp.n,'| fallo:',(fail||'').slice(0,40),'| status:',d['cmi.core.lesson_status'],'| score:',d['cmi.core.score.raw'],'| loc:',d['cmi.core.lesson_location'],'| suspend:',(d['cmi.suspend_data']||'').length,'chars');
 // reanudación
 const p2=await b.newPage();await p2.addInitScript(mock+`window.API._d=${JSON.stringify(d)};`);await p2.goto('file://'+file);
 console.log(vp.n,'| reanuda en pantalla',await p2.$eval('.screen.active',e=>[...document.querySelectorAll('.screen')].indexOf(e)+1),'| rutas libres:',await p2.$$eval('#routeList button:not(:disabled)',x=>x.length));await p2.close();await p.close()}
console.log(errs.length?'ERRORES:\n'+errs.join('\n'):'Sin errores');await b.close()})();
