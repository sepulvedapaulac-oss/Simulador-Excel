// Recorrido perfecto con una API SCORM 1.2 simulada: verifica score.raw y lesson_status.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const f of process.argv.slice(2)){const p=await b.newPage();
 await p.addInitScript(()=>{const V={};window.API={LMSInitialize:()=>'true',LMSGetValue:k=>V[k]||'',LMSSetValue:(k,v)=>{V[k]=v;return 'true'},LMSCommit:()=>'true',LMSFinish:()=>'true',LMSGetLastError:()=>'0',LMSGetErrorString:()=>'',LMSGetDiagnostic:()=>'',_V:V}});
 await p.goto('file://'+path.resolve(f));await p.click('[data-start]');
 const sim=await p.evaluate(()=>window.ACT.tipo==='simulador');
 if(sim){for(let i=0;i<3;i++){await p.evaluate(()=>window.SIM.solve(window.__caso,document.querySelector('#simCase')));await p.click('#simCheck');await p.click('#simNext')}}
 else{const n=await p.$$eval('.etask',x=>x.length);for(let i=0;i<n;i++){await p.evaluate(i=>{const t=document.querySelectorAll('.etask')[i],tp=t.dataset.auto;
   if(tp==='mc')t.querySelector('.opt[data-ok] input').click();
   if(tp==='multi')t.querySelectorAll('.opt[data-ok] input').forEach(x=>x.click());
   if(tp==='hot')t.querySelectorAll('.hs[data-ok]').forEach(x=>x.click());
   if(tp==='match')t.querySelectorAll('select').forEach(s=>s.value=s.dataset.ans);
   if(tp==='num')t.querySelectorAll('input[data-ans]').forEach(x=>x.value=String(x.dataset.ans).replace('.',','));
   if(tp==='order'){const ol=t.querySelector('.ord');[...ol.children].sort((a,b)=>a.dataset.pos-b.dataset.pos).forEach(li=>ol.appendChild(li))}},i);
  await p.click('.etask.on [data-respond]');await p.click('.etask.on [data-next]')}}
 const V=await p.evaluate(()=>window.API._V);console.log(path.basename(path.dirname(f)),'raw',V['cmi.core.score.raw'],'status',V['cmi.core.lesson_status']);await p.close()}
await b.close()})();
