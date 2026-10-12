/* Lección 3.3 · Selector de gráficos con vista previa en SVG */
(function(){
const TYPES=['bar','line','donut','scatter'],NAMES={bar:'Barras',line:'Líneas',donut:'Anillo',scatter:'Dispersión'};
const C='#159aa3',C2='#2bc2b1',A='#e0911b',INK='currentColor';
const ICON={bar:'<svg viewBox="0 0 60 40"><rect x="6" y="18" width="10" height="18" fill="#159aa3"/><rect x="22" y="8" width="10" height="28" fill="#159aa3"/><rect x="38" y="24" width="10" height="12" fill="#159aa3"/></svg>',
 line:'<svg viewBox="0 0 60 40"><polyline points="4,30 16,24 28,26 40,14 56,8" fill="none" stroke="#159aa3" stroke-width="3"/></svg>',
 donut:'<svg viewBox="0 0 60 40"><circle cx="30" cy="20" r="14" fill="none" stroke="#159aa3" stroke-width="8" stroke-dasharray="60 88"/><circle cx="30" cy="20" r="14" fill="none" stroke="#e0911b" stroke-width="8" stroke-dasharray="20 88" stroke-dashoffset="-60"/></svg>',
 scatter:'<svg viewBox="0 0 60 40"><g fill="#159aa3"><circle cx="10" cy="30" r="3"/><circle cx="20" cy="26" r="3"/><circle cx="30" cy="20" r="3"/><circle cx="42" cy="16" r="3"/><circle cx="52" cy="9" r="3"/></g></svg>'};
const MONTHS=['N','D','E','F','M','A','M','J','J','A','S','O'],COST=[471,476,478,480,482,485,487,489,492,495,498,538];
const AREAS=[['Planta',520],['Operaciones',450],['Ventas',360],['Bodega',320]];
const COMP=[['Sueldo base',471.2],['Horas extra',21.2],['Bonos',45.4]];
const SC=[['Planta',96,5.4],['Operaciones',88,5.1],['Ventas',120,3.0],['Bodega',62,5.2],['Finanzas',54,1.1]];
const Q=[
 {q:'¿Cómo evolucionó el costo mensual desde noviembre de 2025 hasta octubre de 2026?',c:'line',
  fb:{line:'Correcto: las líneas muestran la tendencia en el tiempo y hacen visible el salto de octubre.',bar:'Las barras sirven para comparar categorías; con 12 meses la tendencia se lee mejor en líneas.',donut:'El anillo muestra partes de un total en un momento, no la evolución.',scatter:'La dispersión relaciona dos variables; aquí hay una sola variable en el tiempo.'}},
 {q:'¿Qué área concentra más horas extra en octubre?',c:'bar',
  fb:{bar:'Correcto: las barras con el eje en cero comparan categorías de un vistazo.',line:'Las líneas sugieren continuidad entre áreas, que no existe.',donut:'Con áreas de tamaño parecido, los ángulos del anillo son difíciles de comparar.',scatter:'No hay una segunda variable que relacionar.'}},
 {q:'¿Cómo se compone el costo de octubre entre sueldo base, horas extra y bonos?',c:'donut',
  fb:{donut:'Correcto: con pocas categorías, el anillo muestra la parte de cada componente en el total. Una barra apilada también serviría.',bar:'Las barras comparan montos, pero no muestran tan claro que son partes de un mismo total.',line:'No hay evolución en el tiempo en esta pregunta.',scatter:'No relaciona dos variables.'}},
 {q:'¿Las áreas con más personas tienen más horas extra por persona?',c:'scatter',
  fb:{scatter:'Correcto: la dispersión muestra la relación entre dos variables. Aquí no hay relación clara: Ventas es la más grande y tiene pocas horas extra por persona.',bar:'Con barras verías una variable a la vez; la relación entre ambas no se aprecia.',line:'Las líneas implican orden temporal, que no existe entre áreas.',donut:'El anillo no puede mostrar dos variables.'}}];
function prev(t){const W=300,H=170,p=28;
  if(t==='line'){const mn=460,mx=545,x=i=>p+i*(W-2*p)/11,y=v=>H-p-(v-mn)/(mx-mn)*(H-2*p);
    return `<svg viewBox="0 0 ${W} ${H}"><polyline fill="none" stroke="${C}" stroke-width="3" points="${COST.map((v,i)=>x(i)+','+y(v)).join(' ')}"/>${COST.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="${i===11?5:3}" fill="${i===11?A:C}"/>`).join('')}${MONTHS.map((m,i)=>`<text x="${x(i)}" y="${H-8}" font-size="10" text-anchor="middle" fill="${INK}">${m}</text>`).join('')}<text x="${p}" y="16" font-size="11" fill="${INK}">Costo mensual ($ M)</text></svg>`}
  if(t==='bar'){const mx=560,bw=46,y=v=>(H-p)-v/mx*(H-2*p);
    return `<svg viewBox="0 0 ${W} ${H}"><line x1="${p}" y1="${H-p}" x2="${W-8}" y2="${H-p}" stroke="${INK}" opacity=".4"/>${AREAS.map(([n,v],i)=>`<rect x="${p+10+i*64}" y="${y(v)}" width="${bw}" height="${(H-p)-y(v)}" fill="${i===0?A:C}"/><text x="${p+10+i*64+bw/2}" y="${y(v)-4}" font-size="10" text-anchor="middle" fill="${INK}">${v}</text><text x="${p+10+i*64+bw/2}" y="${H-12}" font-size="9.5" text-anchor="middle" fill="${INK}">${n}</text>`).join('')}<text x="${p}" y="14" font-size="11" fill="${INK}">Horas extra por área (eje desde 0)</text></svg>`}
  if(t==='donut'){const tot=COMP.reduce((a,c)=>a+c[1],0),r=52,cx=90,cy=92,L=2*Math.PI*r;let off=0;const col=[C,A,C2];
    return `<svg viewBox="0 0 ${W} ${H}">${COMP.map(([n,v],i)=>{const d=v/tot*L;const s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col[i]}" stroke-width="22" stroke-dasharray="${d} ${L}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;off+=d;return s}).join('')}${COMP.map(([n,v],i)=>`<rect x="170" y="${56+i*24}" width="12" height="12" fill="${col[i]}"/><text x="188" y="${66+i*24}" font-size="11" fill="${INK}">${n} ${Math.round(v/tot*100)} %</text>`).join('')}<text x="10" y="16" font-size="11" fill="${INK}">Composición del costo de octubre</text></svg>`}
  const x=v=>p+(v-40)/(130-40)*(W-2*p),y=v=>H-p-(v/6)*(H-2*p);
  return `<svg viewBox="0 0 ${W} ${H}"><line x1="${p}" y1="${H-p}" x2="${W-8}" y2="${H-p}" stroke="${INK}" opacity=".4"/><line x1="${p}" y1="${p-6}" x2="${p}" y2="${H-p}" stroke="${INK}" opacity=".4"/>${SC.map(([n,a,b])=>`<circle cx="${x(a)}" cy="${y(b)}" r="6" fill="${C}"/><text x="${x(a)+8}" y="${y(b)+4}" font-size="9.5" fill="${INK}">${n}</text>`).join('')}<text x="${W-8}" y="${H-8}" font-size="10" text-anchor="end" fill="${INK}">Dotación</text><text x="${p+4}" y="16" font-size="10" fill="${INK}">Horas extra por persona</text></svg>`}
Object.assign(window.LESSON,{init(api){const list=document.getElementById('chList');if(!list)return;let ok=0;
  list.innerHTML=Q.map((q,i)=>`<div class="chq" data-i="${i}"><h4>${i+1}. ${q.q}</h4><div class="chopts">${TYPES.map(t=>`<button class="chopt" type="button" data-t="${t}">${ICON[t]}<span>${NAMES[t]}</span></button>`).join('')}</div><div class="chres"></div></div>`).join('');
  list.querySelectorAll('.chq').forEach(box=>{const i=+box.dataset.i,q=Q[i];
    box.querySelectorAll('.chopt').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.t,good=t===q.c,key='graf'+i;
      if(!(key in api.S.first))api.S.first[key]=good;
      box.querySelectorAll('.chopt').forEach(x=>x.classList.remove('bad'));b.classList.add(good?'good':'bad');
      box.querySelector('.chres').innerHTML=`<div class="chprev">${prev(t)}<div class="feedback ${good?'good':'bad'}">${good?'<strong>✓ Buen gráfico.</strong> ':'<strong>Mira la vista previa.</strong> '}<span class="fb-body">${q.fb[t]}</span></div></div>`;
      if(good&&!box.classList.contains('ok')){box.classList.add('ok');box.querySelectorAll('.chopt').forEach(x=>x.disabled=true);ok++;
        document.querySelector('#chRoot .tick').textContent=`${ok} / ${Q.length}`;
        if(ok===Q.length){document.querySelector('#chRoot .task').classList.add('ok');api.done('graf')}}}))})}});
})();
