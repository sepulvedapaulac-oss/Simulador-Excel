// Recorrido automático (escritorio y celular): resuelve cada pantalla, falla y reintenta la comprobación, verifica SCORM, reanudación y desbordes.
const {chromium}=require('playwright');const path=require('path');
const file=path.resolve(process.argv[2]),out=process.argv[3]||'.';const tag=path.basename(path.dirname(file));
const mock=`window.API={_d:{},LMSInitialize(){return 'true'},LMSFinish(){return 'true'},LMSGetValue(k){return this._d[k]||''},LMSSetValue(k,v){this._d[k]=v;return 'true'},LMSCommit(){return 'true'},LMSGetLastError(){return '0'},LMSGetErrorString(){return ''},LMSGetDiagnostic(){return ''}};`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--autoplay-policy=no-user-gesture-required']});const errs=[];
for(const vp of [{w:1366,h:820,n:'desk'},{w:390,h:844,n:'mob'}]){
 const p=await b.newPage({viewport:{width:vp.w,height:vp.h}});p.on('pageerror',e=>errs.push(vp.n+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/play\(\)|NotSupported|NotAllowed/.test(m.text()))errs.push(vp.n+' console: '+m.text())});
 await p.addInitScript(mock);await p.goto('file://'+file);await p.waitForTimeout(300);
 const N=await p.$$eval('.slide',s=>s.length);
 for(let i=0;i<N;i++){
  const act=await p.$eval('.slide.active',e=>[...document.querySelectorAll('.slide')].indexOf(e));if(act!==i)throw new Error('pantalla activa '+act+' esperada '+i);
  if(i>0&&i<N-1){const dis=await p.$eval('#nextBtn',e=>e.disabled);if(!dis)errs.push(vp.n+' pantalla '+(i+1)+': no estaba bloqueada')}
  await p.screenshot({path:`${out}/${tag}_${vp.n}_${String(i+1).padStart(2,'0')}a.png`});
  await p.evaluate(async()=>{const S=document.querySelector('.slide.active'),w=t=>new Promise(r=>setTimeout(r,t)),q=(s,r=S)=>[...r.querySelectorAll(s)];
   q('[data-ri]').forEach(x=>x.click());await w(30);
   for(const box of q('[data-choice]')){const ph=box.closest('.phase');if(ph&&ph.hidden)await w(50);
     const bad=box.querySelector(`.opt:not([data-opt="${box.dataset.correct}"])`);if(bad){bad.click();await w(20);const r=box.nextElementSibling.querySelector('.retry');if(r)r.click()}
     box.querySelector(`[data-opt="${box.dataset.correct}"]`).click();await w(30)}
   q('.chap').forEach(c=>c.click());
   q('.hs,.flip,.acc-head,.tab,.evnode').forEach(x=>x.click());
   for(const c of q('.classify')){const cards=q('.cardx',c);cards.forEach((cd,k)=>{if(k===0){cd.click();q('.bin',c).find(x=>x.dataset.cat!==cd.dataset.cat).click()}cd.click();q('.bin',c).find(x=>x.dataset.cat===cd.dataset.cat).click()})}
   for(const t of q('.toggles')){q('.sw',t).slice(0,2).forEach(s=>s.click());document.getElementById(t.dataset.btn).click()}
   for(const o of q('.order-box')){o.querySelector('.ocheck').click();for(let k=0;k<20;k++){const li=q('.order li',o);const j=li.findIndex((x,n)=>n>0&&+x.dataset.p<+li[n-1].dataset.p);if(j<0)break;li[j].querySelector('.up').click()}o.querySelector('.ocheck').click()}
   for(const p of q('.pairs')){q('.pl',p).forEach((l,k)=>{l.click();if(k===0){const wr=q('.pr',p).find(r=>r.dataset.k!==l.dataset.k&&!r.classList.contains('done'));if(wr)wr.click()}q('.pr',p).find(r=>r.dataset.k===l.dataset.k).click()})}
   for(const c of q('.cloze-box')){q('select',c).forEach(s=>s.value=[...s.options].find(o=>o.value&&o.value!==s.dataset.ans).value);c.querySelector('.ccheck').click();q('select',c).forEach(s=>s.value=s.dataset.ans);c.querySelector('.ccheck').click()}
   if(S.querySelector('#tf')){for(let k=0;k<L.TF.length;k++){S.querySelector(`#tf .tf-btns button[data-a="${L.TF[k][1]}"]`).click();await w(10);S.querySelector('#tfNext').click();await w(10)}}
   for(const sm of q('.simbox')){q('tr[data-ans]',sm).forEach(r=>{const s=r.querySelector('select');s.value=[...s.options].find(o=>o.value&&o.value!==r.dataset.ans).value});sm.querySelector('.scheck').click();q('tr[data-ans]',sm).forEach(r=>r.querySelector('select').value=r.dataset.ans);sm.querySelector('.scheck').click()}
   if(S.querySelector('#qcard')){for(const ok of [false,true]){for(let k=0;k<L.Q.length;k++){const os=q('#qcard .opt');(ok?os[L.Q[k].c]:os.find((o,n)=>n!==L.Q[k].c)).click();await w(10);S.querySelector('#qNext').click();await w(10)}
     if(!ok){window.__fail=S.querySelector('#qcard').textContent;S.querySelector('#qRetry').click();await w(10)}}}
   if(S.querySelector('#ynList')){q('.yn-item').forEach((it,k)=>it.querySelector(`button[data-a="${L.YN[k][1]}"]`).click());S.querySelector('#modelBtn').click()}
  });
  await p.waitForTimeout(250);
  const ov=await p.evaluate(()=>{const S=document.querySelector('.slide.active'),r=[];if(document.documentElement.scrollWidth>innerWidth+1)r.push('scroll horizontal '+document.documentElement.scrollWidth);
   S.querySelectorAll('h1,h2,h3,p,button,span,li,b,strong,small,td').forEach(e=>{if(e.closest('.flip,.stage,.hs-stage'))return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.overflow!=='visible')return;if(e.scrollWidth>e.clientWidth+2&&e.clientWidth>0)r.push(e.tagName+': '+e.textContent.slice(0,40))});
   S.querySelectorAll('.face').forEach(f=>{if(f.scrollHeight>f.clientHeight+2)r.push('tarjeta: '+f.textContent.slice(0,30))});return r});
  if(ov.length)errs.push(vp.n+' pantalla '+(i+1)+': '+ov.join(' | '));
  await p.screenshot({path:`${out}/${tag}_${vp.n}_${String(i+1).padStart(2,'0')}b.png`,fullPage:true});
  if(i<N-1){if(await p.$eval('#nextBtn',e=>e.disabled))errs.push(vp.n+' pantalla '+(i+1)+': no se desbloqueó · '+await p.$eval('#gateMsg',e=>e.textContent));await p.click('#nextBtn');await p.waitForTimeout(150)}
 }
 const d=await p.evaluate(()=>window.API._d),fail=await p.evaluate(()=>window.__fail||'');
 console.log(vp.n,'| intento fallido:',fail.replace(/\s+/g,' ').slice(0,45),'| status:',d['cmi.core.lesson_status'],'| score:',d['cmi.core.score.raw'],'| loc:',d['cmi.core.lesson_location']);
 const p2=await b.newPage();await p2.addInitScript(mock+`window.API._d=${JSON.stringify(d)};`);await p2.goto('file://'+file);await p2.waitForTimeout(200);
 console.log(vp.n,'| reanuda en',await p2.$eval('.slide.active',e=>[...document.querySelectorAll('.slide')].indexOf(e)+1),'| temas libres:',await p2.$$eval('.topic-link:not(:disabled)',x=>x.length),'| reporte:',await p2.$eval('#fPct',e=>e.textContent),await p2.$eval('#fEsc',e=>e.textContent));await p2.close();await p.close()}
// audio: comprobar que los mp3 cargan
const p3=await b.newPage();await p3.goto('file://'+file);const au=await p3.evaluate(async()=>{const r=[];for(const [k,u] of Object.entries(L.aud)){r.push(await new Promise(res=>{const a=new Audio(u);a.onloadedmetadata=()=>res(a.duration>1);a.onerror=()=>res(false)}))}return r.filter(Boolean).length+'/'+r.length});console.log('audios que cargan:',au);
console.log(errs.length?'ERRORES:\n'+errs.join('\n'):'Sin errores');await b.close()})();
