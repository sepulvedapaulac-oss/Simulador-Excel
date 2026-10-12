/* Laboratorio 3B · Indicadores por área en el simulador y diseño de un gráfico honesto */
(function(){
const A=[['Ventas',120,159800,3000,14000],['Operaciones',88,128900,5600,9800],['Planta',96,125700,8400,9200],['Bodega',62,64300,3200,4200],['Otras áreas',54,59180,1040,8200]];
const R=[2,3,4,5,6,7];let hoja=null,S=null,bestT=0,bestG=0;
const EXP={F:(b,c)=>c/b,G:(c,d)=>d/c*100,H:(c,e)=>e/c*100};
function build(){const data={},locked=[];const L=(k,v)=>{if(v!==undefined)data[k]=String(v);locked.push(k)};
  ['Área','Dotación','Costo','Horas extra','Bonos','Costo/persona','Peso HE %','Peso bonos %'].forEach((h,i)=>L('ABCDEFGH'[i]+'1',h));
  A.forEach((r,i)=>r.forEach((v,c)=>L('ABCDE'[c]+(i+2),v)));
  L('A7','TOTAL');['B','C','D','E'].forEach(c=>L(c+'7',`=SUMA(${c}2:${c}6)`));
  hoja=Hoja(document.getElementById('hoja1'),{cols:8,rows:7,data,locked,start:'F2'});
  ['A1','B1','C1','D1','E1','F1','G1','H1','A7'].forEach(k=>hoja.cells[k].classList.add('hdr'))}
function check(){const v=k=>hoja.value(k),f=k=>hoja.get(k),out=[];const near=(x,e)=>typeof x==='number'&&Math.abs(x-e)<=0.06;
  const col=(c,lab,fn,hint)=>{const ok=R.every(r=>f(c+r).startsWith('=')&&near(v(c+r),fn(r)));
    R.forEach(r=>{const td=hoja.cells[c+r],g=f(c+r).startsWith('=')&&near(v(c+r),fn(r));td.classList.toggle('ok',g);td.classList.toggle('bad',!g&&f(c+r)!=='')});
    out.push([ok,ok?`Columna ${c} (${lab}) correcta en las seis filas.`:R.some(r=>!f(c+r))?`Columna ${c} (${lab}): faltan filas. Escribe la fórmula en ${c}2 y rellena hasta la fila 7.`:hint])};
  col('F','costo por persona',r=>v('C'+r)/v('B'+r),'Columna F: divide el costo (C) por la dotación (B) y redondea a un decimal.');
  col('G','peso de las horas extra',r=>v('D'+r)/v('C'+r)*100,'Columna G: horas extra (D) / costo (C) × 100. ¿Multiplicaste por 100?');
  col('H','peso de los bonos',r=>v('E'+r)/v('C'+r)*100,'Columna H: bonos (E) / costo (C) × 100.');
  const ok=out.filter(o=>o[0]).length;bestT=Math.max(bestT,ok);S.first.l3b_t=Math.max(bestT,S.first.l3b_t||0);
  document.getElementById('checkOut').innerHTML=`<div class="checks2">${out.map(o=>`<div class="${o[0]?'ok':'no'}">${o[0]?'✓':'✕'} ${o[1]}</div>`).join('')}</div>${ok===3?'<div class="ok-row" style="margin-top:8px">✓ Indicadores listos. Planta tiene el mayor peso de horas extra (6,7 %); Bodega, el menor costo por persona.</div>':''}`;
  return ok===3}
const val=(c,r)=>{const x=hoja?hoja.value(c+r):NaN;return typeof x==='number'?x:NaN};
function chart(){const k=document.getElementById('gK').value,t=document.getElementById('gT').value,z=document.getElementById('gZ').checked,h=document.getElementById('gH').checked,s=document.getElementById('gS').checked,title=document.getElementById('gTitle').value.trim();
  const out=document.getElementById('gOut');if(!k||!t){out.innerHTML='<p class="hint" style="margin:6px">La vista previa aparece al elegir el indicador y el tipo de gráfico.</p>';return}
  const vals=A.map((a,i)=>[a[0],val(k,i+2)]);if(vals.some(x=>isNaN(x[1]))){out.innerHTML='<p class="hint" style="margin:6px">Primero completa la columna en la etapa 1.</p>';return}
  const W=480,H=280,p=44,mx=Math.max(...vals.map(x=>x[1])),mn=z?0:Math.min(...vals.map(x=>x[1]))*0.9,top=mx*1.1;const y=x=>H-p-(x-mn)/(top-mn)*(H-2*p-10);
  const imax=vals.findIndex(x=>x[1]===mx),col=(i)=>h?(i===imax?'#e0911b':'#159aa3'):['#ff7b42','#5ccf5a','#6c7cff','#ffc23d','#c46bd6'][i];
  let g='';
  if(t==='bar')g=vals.map(([n,x],i)=>`<rect x="${p+12+i*84}" y="${y(x)}" width="56" height="${H-p-y(x)}" fill="${col(i)}"/><text x="${p+40+i*84}" y="${y(x)-5}" font-size="12" text-anchor="middle" fill="#172431">${x.toLocaleString('es-CL',{maximumFractionDigits:1})}</text><text x="${p+40+i*84}" y="${H-p+16}" font-size="11" text-anchor="middle" fill="#172431">${n}</text>`).join('');
  else if(t==='line')g=`<polyline fill="none" stroke="#159aa3" stroke-width="3" points="${vals.map(([n,x],i)=>(p+40+i*84)+','+y(x)).join(' ')}"/>`+vals.map(([n,x],i)=>`<circle cx="${p+40+i*84}" cy="${y(x)}" r="5" fill="${col(i)}"/><text x="${p+40+i*84}" y="${H-p+16}" font-size="11" text-anchor="middle" fill="#172431">${n}</text>`).join('');
  else{const tot=vals.reduce((a,x)=>a+x[1],0),r=80,cx=150,cy=150,L=2*Math.PI*r;let off=0;g=vals.map(([n,x],i)=>{const d=x/tot*L;const sg=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col(i)}" stroke-width="34" stroke-dasharray="${d} ${L}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;off+=d;return sg}).join('')+vals.map(([n,x],i)=>`<rect x="290" y="${70+i*26}" width="12" height="12" fill="${col(i)}"/><text x="308" y="${81+i*26}" font-size="12" fill="#172431">${n}</text>`).join('')}
  const axis=t==='donut'?'':`<line x1="${p}" y1="${H-p}" x2="${W-10}" y2="${H-p}" stroke="#8aa0aa"/><text x="${p-6}" y="${H-p+4}" font-size="11" text-anchor="end" fill="#5f7180">${mn.toLocaleString('es-CL',{maximumFractionDigits:1})}</text>`;
  out.innerHTML=`<svg viewBox="0 0 ${W} ${H+(s?18:0)}" role="img" aria-label="Vista previa del gráfico"><text x="${W/2}" y="22" font-size="15" font-weight="800" text-anchor="middle" fill="#172431">${(title||'(sin título)').replace(/[<&]/g,'')}</text>${axis}${g}${s?`<text x="${W-8}" y="${H+12}" font-size="10.5" text-anchor="end" fill="#5f7180">Fuente: base de remuneraciones cuadrada, octubre 2026. Datos ficticios.</text>`:''}</svg>`}
function checkG(){const k=document.getElementById('gK').value,t=document.getElementById('gT').value,z=document.getElementById('gZ').checked,h=document.getElementById('gH').checked,s=document.getElementById('gS').checked,title=document.getElementById('gTitle').value.trim();
  const n=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const c=[[k==='G',k==='G'?'Indicador: peso de las horas extra, el que responde la pregunta.':'Indicador: la pregunta es dónde pesan más las horas extra; elige “Peso de las horas extra (%)”.'],
    [t==='bar',t==='bar'?'Tipo: barras, adecuado para comparar áreas.':'Tipo: para comparar áreas usa barras. Las líneas sugieren una secuencia y el anillo compara mal valores parecidos.'],
    [z,z?'Eje vertical desde cero: el gráfico no exagera diferencias.':'Eje: sin partir en cero, las diferencias se ven más grandes de lo que son.'],
    [h&&s,h&&s?'Color de acento y fuente con período incluidos.':!h?'Color: usa un solo color y destaca solo el área principal; los colores decorativos confunden.':'Fuente: incluye la fuente y el período para que se pueda verificar.'],
    [/planta/.test(n(title))&&title.split(/\s+/).length>=4,/planta/.test(n(title))&&title.split(/\s+/).length>=4?'Título con conclusión: nombra el área principal.':'Título: escribe la conclusión, por ejemplo “Planta tiene el mayor peso de horas extra (6,7 %)”.']];
  const ok=c.filter(x=>x[0]).length;bestG=Math.max(bestG,ok);S.first.l3b_g=Math.max(bestG,S.first.l3b_g||0);
  document.getElementById('gMsg').innerHTML=`<div class="checks2">${c.map(x=>`<div class="${x[0]?'ok':'no'}">${x[0]?'✓':'✕'} ${x[1]}</div>`).join('')}</div>${ok===5?'<div class="ok-row" style="margin-top:8px">✓ Gráfico listo para el tablero: honesto, claro y verificable.</div>':''}`;
  return ok===5}
const bT=()=>Math.max(bestT,(S&&S.first.l3b_t)||0),bG=()=>Math.max(bestG,(S&&S.first.l3b_g)||0);
Object.assign(window.LESSON,{
  score(){return Math.round(bT()/3*60+bG()/5*40)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);$('#labPct').textContent=sc+'%';$('#labDet').textContent=`${bT()}/3 · ${bG()}/5`;
    $('#labState').textContent=sc>=70?'Aprobado':'Pendiente';$('#labState').style.color=sc>=70?'var(--good)':'var(--bad)'},
  init(api){S=api.S;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    build();
    document.getElementById('fillBtn').addEventListener('click',()=>{const k=hoja.sel;if(!['F','G','H'].includes(k[0])||k.slice(1)!=='2'){document.getElementById('checkOut').innerHTML='<div class="alert-row">Selecciona primero F2, G2 o H2 (la celda con tu fórmula) y luego presiona “Rellenar hacia abajo”.</div>';return}hoja.fillDown(k,7)});
    document.getElementById('checkBtn').addEventListener('click',()=>{if(check())api.done('tabla')});
    ['gK','gT','gZ','gH','gS','gTitle'].forEach(id=>{const el=document.getElementById(id);el.addEventListener(el.type==='text'?'input':'change',chart)});
    document.getElementById('gCheck').addEventListener('click',()=>{chart();if(checkG())api.done('graf')})}
});
})();
