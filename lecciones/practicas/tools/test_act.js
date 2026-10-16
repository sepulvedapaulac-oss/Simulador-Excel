// Prueba una actividad: responde todo (aleatorio o correcto), mira resultado; capturas desktop y móvil.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const f=process.argv[2],out=process.argv[3]||'.';const b=await chromium.launch({args:["--disable-gpu"],executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [w,h,tag] of [[1366,900,'d'],[390,844,'m']]){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+path.resolve(f));await p.screenshot({path:`${out}/${tag}_0intro.png`,fullPage:true,timeout:90000});
 await p.click('[data-start]');
 const n=await p.$$eval('.etask',x=>x.length);
 for(let i=0;i<n;i++){
  await p.evaluate(i=>{const t=document.querySelectorAll('.etask')[i],tp=t.dataset.auto;
   if(tp==='mc')t.querySelector('.opt[data-ok] input').click();
   if(tp==='multi')t.querySelectorAll('.opt[data-ok] input').forEach(x=>x.click());
   if(tp==='hot')t.querySelectorAll('.hs[data-ok]').forEach(x=>x.click());
   if(tp==='match')t.querySelectorAll('select').forEach((s,k)=>{s.value=k%3===0?[...s.options].find(o=>o.value&&o.value!==s.dataset.ans).value:s.dataset.ans});
   if(tp==='num')t.querySelectorAll('input[data-ans]').forEach(x=>x.value=x.dataset.ans);
  },i);
  if(i===0)await p.screenshot({path:`${out}/${tag}_1task_pre.png`,fullPage:true,timeout:90000});
  await p.click(`.etask.on [data-respond]`);
  await p.screenshot({path:`${out}/${tag}_t${i+1}.png`,fullPage:true,timeout:90000});
  // desbordes
  const ov=await p.evaluate(()=>[...document.querySelectorAll('.etask.on *')].filter(e=>e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX==='visible'&&e.clientWidth>0&&!e.closest('.tablewrap')).map(e=>e.className||e.tagName).slice(0,5));
  if(ov.length)console.log(tag,'overflow t'+(i+1),ov);
  await p.click(`.etask.on [data-next]`);
 }
 await p.screenshot({path:`${out}/${tag}_result.png`,fullPage:true,timeout:90000});
 console.log(tag,'score',await p.$eval('.score',e=>e.textContent),'errors',errs);
 const docW=await p.evaluate(()=>document.documentElement.scrollWidth);if(docW>w)console.log(tag,'PAGE HSCROLL',docW);
 await p.close()}
await b.close()})();
