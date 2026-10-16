// Prueba un simulador: abre, resuelve N casos con la función de prueba de cada simulador (window.SIM.solve si existe; si no, respuestas vacías→incorrectas), captura.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const f=process.argv[2],out=process.argv[3]||'.';const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [w,h,tag] of [[1366,900,'d'],[390,844,'m']]){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(f));await p.screenshot({path:`${out}/${tag}_0intro.png`,fullPage:true});
 await p.click('[data-start]');
 for(let i=0;i<4;i++){
  const solved=await p.evaluate(i=>{if(window.SIM.solve&&i!==1){window.SIM.solve(window.__caso,document.querySelector('#simCase'));return true}
   document.querySelectorAll('#simCase input').forEach(x=>{if(x.type==='radio'||x.type==='checkbox'){if(!document.querySelector('#simCase input:checked'))x.checked=true}else x.value='1'});document.querySelectorAll('#simCase select').forEach(s=>s.selectedIndex=1);return false},i);
  if(i===0)await p.screenshot({path:`${out}/${tag}_case.png`,fullPage:true});
  await p.click('#simCheck');await p.screenshot({path:`${out}/${tag}_sol${i}.png`,fullPage:true});
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth);if(ov>w)console.log(tag,'HSCROLL',ov);
  await p.click('#simNext')}
 console.log(tag,await p.$eval('#simCount',e=>e.textContent),'errors',errs);
 await p.click('.tab[data-pane=pCalc]');await p.screenshot({path:`${out}/${tag}_calc.png`,fullPage:true});await p.close()}
await b.close()})();
