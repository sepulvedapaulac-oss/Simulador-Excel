/* Lección 3.2 · Calculadora de variación con deslizadores (efectos que suman la variación) */
(function(){
const SEP={dot:412,prom:1100000,he:18000000,bon:26800000};
const OCT={dot:420,prom:1122000,he:21240000,bon:45400000};
const M=n=>'$'+(n/1e6).toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1})+' M';
const fmt={dot:v=>v+' personas',prom:v=>'$'+v.toLocaleString('es-CL'),he:v=>M(v),bon:v=>M(v)};
const tot=x=>x.dot*x.prom+x.he+x.bon;
Object.assign(window.LESSON,{init(api){const root=document.getElementById('calcRoot');if(!root)return;
  const v={...SEP};const sls=[...root.querySelectorAll('.sl')];
  sls.forEach(s=>{const k=s.dataset.k,inp=s.querySelector('input');inp.value=SEP[k];inp.addEventListener('input',()=>{v[k]=+inp.value;draw()})});
  let finished=false;
  function draw(){
    sls.forEach(s=>{const k=s.dataset.k;s.querySelector('output').textContent=fmt[k](v[k]);s.classList.toggle('hit',v[k]===OCT[k])});
    const t=tot(v),t0=tot(SEP),d=t-t0;
    document.getElementById('kTot').textContent=M(t);
    document.getElementById('kVar').textContent=(d>=0?'+':'')+M(d).replace('$-','−$')+' ('+(d/t0*100).toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1})+' %)';
    document.getElementById('kPer').textContent='$'+Math.round(t/v.dot).toLocaleString('es-CL');
    const E=[['Dotación',(v.dot-SEP.dot)*SEP.prom],['Reajuste',v.dot*(v.prom-SEP.prom)],['Horas extra',v.he-SEP.he],['Bonos',v.bon-SEP.bon]];
    const mx=Math.max(1,...E.map(e=>Math.abs(e[1])));
    document.getElementById('effs').innerHTML='<b style="font-size:.86rem">Efectos sobre la variación</b>'+E.map(([n,x])=>`<div class="row"><span>${n}</span><span class="bar"><span class="${x<0?'neg':''}" style="width:${Math.abs(x)/mx*100}%"></span></span><span class="v">${x<0?'−':'+'}${M(Math.abs(x))}</span></div>`).join('')+
      `<div class="row" style="border-top:1px dashed var(--line);padding-top:6px"><b>Suma</b><span></span><span class="v">${M(E.reduce((a,e)=>a+e[1],0))}</span></div>`;
    const hits=Object.keys(OCT).filter(k=>v[k]===OCT[k]).length;
    const msg=document.getElementById('calcMsg');
    if(hits===4){msg.innerHTML='<div class="ok-row">✓ ¡Octubre reproducido! Variación de $39,9 M (+8,0 %). El efecto más grande son los <b>bonos</b> (+$18,6 M), no el reajuste (+$9,2 M). Y el costo por persona <b>subió</b> de $1.208.738 a $1.280.667.</div>';
      if(!finished){finished=true;api.S.first.calc=true;api.done('calc')}}
    else msg.innerHTML=`<p class="hint" style="margin:0">Valores de octubre alcanzados: <b>${hits} de 4</b>. Fíjate cómo la suma de los efectos siempre coincide con la variación total.</p>`}
  draw()}});
})();
