/* Laboratorio 2A · Fórmulas de control: probar y corregir fórmulas propuestas por una IA en el simulador de Excel */
(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=s=>String(s||'').replace(/\s/g,'').toUpperCase();
const isErr=v=>typeof v==='string'&&v.startsWith('#');
const txt=v=>String(v).trim().toUpperCase();
const rows=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
/* ---- Datos ficticios (montos ilustrativos) ---- */
// Nómina de octubre: código, área, sueldo base, horas extra, valor hora extra informado, bono informado
const NOM=[
 ['EMP-001','Ventas',820000,6,6833,60000],
 ['EMP-002','Operaciones',690000,14,5750,45000],
 ['EMP-003','Finanzas',1150000,0,9583,50000],
 ['EMP-004','Planta',650000,10,5500,40000],
 ['EMP-005','Bodega',640000,12,5333,38000],
 ['EMP-006','Ventas',910000,4,7583,65000],
 ['EMP-0O8','Operaciones',700000,8,5833,45000],   // letra O en vez de cero: no existe en el maestro
 ['EMP-009','Planta',660000,16,5500,40000],
 ['EMP-010','Bodega',655000,3,5458,35000],
 ['EMP-012','Finanzas',1050000,1,8750,50000],
 ['EMP-013','Ventas',780000,2,6500,60000],        // ingreso reciente: aún no está en el maestro
 ['EMP-014','Operaciones',720000,13,6000,45000]];
// Maestro de colaboradores: código, área, valor hora extra oficial
const MAE=[['EMP-001','Ventas',6833],['EMP-002','Operaciones',5750],['EMP-003','Finanzas',9583],['EMP-004','Planta',5417],
 ['EMP-005','Bodega',5333],['EMP-006','Ventas',7583],['EMP-007','Planta',5750],['EMP-008','Operaciones',5833],
 ['EMP-009','Planta',5500],['EMP-010','Bodega',5458],['EMP-012','Finanzas',8750],['EMP-014','Operaciones',6000]];
// Parámetros: bono de cierre por área
const PAR=[['Ventas',60000],['Operaciones',45000],['Finanzas',50000],['Planta',40000],['Bodega',38000]];
const MAEMAP=Object.fromEntries(MAE.map(m=>[m[0],m]));
const PARMAP=Object.fromEntries(PAR);
const ctrl=(area,he,bono)=>(he>12||bono!==PARMAP[area])?'REVISAR':'OK';
const EXP2=NOM.map(n=>ctrl(n[1],n[3],n[5]));
const MISSING=NOM.map((n,i)=>MAEMAP[n[0]]?null:i+2).filter(Boolean); // filas 8 y 12
const CASES=[['Caso 1','Ventas',12,60000],['Caso 2','Ventas',13,60000],['Caso 3','Planta',5,45000],['Caso 4','Finanzas',0,50000],['Caso 5','Bodega',8,'']];
const EXP4=CASES.map(c=>ctrl(c[1],c[2],c[3]===''?null:c[3]));
const CASEHINT=['la regla dice “más de 12”: ¿12 horas es más de 12?','13 horas supera el límite de 12.','el bono de Planta según parámetros es $40.000 y se informó $45.000.','sin horas extra y con el bono exacto de Finanzas ($50.000).','un bono vacío no es igual al bono de Bodega ($38.000).'];
/* Fórmulas de la IA (con sus errores) */
const IA={1:'=BUSCARX(A2;$F$2:$F$13;$H$2:$H$13)',2:'=SI(O(C2>12,D2<>BUSCARX(B2,G2:G6,H2:H6)),"REVISAR","OK")',3:'=SI(ESERROR(COINCIDIR(A2;$F$2:$F$13;0));"NO EXISTE";"OK")'};
const MAX={1:25,2:30,3:25,4:20};
const NAMES={1:'BUSCARX: valor hora desde el maestro',2:'SI: marcar casos a revisar',3:'COINCIDIR: códigos inexistentes',4:'Casos de prueba'};
const H={},best={1:0,2:0,3:0,4:0};let tries=0,S=null;

function sheet(n,cols,nrows,data,edit,start,fill,last,hdrs){const locked=[];
  for(let c=0;c<cols;c++)for(let r=1;r<=nrows;r++){const k=String.fromCharCode(65+c)+r;if(!edit.includes(k))locked.push(k)}
  const h=Hoja(document.getElementById('hoja'+n),{cols,rows:nrows,data,locked,start});
  hdrs.forEach(k=>h.cells[k].classList.add('hdr'));H[n]={h,fill,last,edit};return h}
function put(d,col,r0,vals){vals.forEach((v,i)=>d[col+(r0+i)]=String(v))}
function build(){
  /* Hoja 1 · BUSCARX */
  let d={A1:'Código',B1:'Área',C1:'Valor hora (nómina)',D1:'Valor hora (maestro)',E1:'Diferencia',F1:'Código',G1:'Área',H1:'Valor hora'};
  put(d,'A',2,NOM.map(n=>n[0]));put(d,'B',2,NOM.map(n=>n[1]));put(d,'C',2,NOM.map(n=>n[4]));
  put(d,'F',2,MAE.map(m=>m[0]));put(d,'G',2,MAE.map(m=>m[1]));put(d,'H',2,MAE.map(m=>m[2]));
  rows(2,13).forEach(r=>d['E'+r]=`=SI(D${r}="NO EXISTE";"—";C${r}-D${r})`);d.D2=IA[1];
  let h=sheet(1,8,13,d,rows(2,13).map(r=>'D'+r),'D2',['D'],13,['A1','B1','C1','D1','E1','F1','G1','H1']);h.fillDown('D2',13);
  /* Hoja 2 · SI */
  d={A1:'Código',B1:'Área',C1:'Horas extra',D1:'Bono informado',E1:'Control',G1:'Área',H1:'Bono de cierre',G8:'Parámetros',H8:'(ilustrativos)'};
  put(d,'A',2,NOM.map(n=>n[0]));put(d,'B',2,NOM.map(n=>n[1]));put(d,'C',2,NOM.map(n=>n[3]));put(d,'D',2,NOM.map(n=>n[5]));
  put(d,'G',2,PAR.map(p=>p[0]));put(d,'H',2,PAR.map(p=>p[1]));d.E2=IA[2];
  h=sheet(2,8,13,d,rows(2,13).map(r=>'E'+r),'E2',['E'],13,['A1','B1','C1','D1','E1','G1','H1']);h.fillDown('E2',13);
  /* Hoja 3 · COINCIDIR */
  d={A1:'Código (nómina)',B1:'Área',C1:'¿Existe en maestro?',E1:'Código (maestro)',F1:'Área (maestro)',B15:'Total NO EXISTE'};
  put(d,'A',2,NOM.map(n=>n[0]));put(d,'B',2,NOM.map(n=>n[1]));put(d,'E',2,MAE.map(m=>m[0]));put(d,'F',2,MAE.map(m=>m[1]));d.C2=IA[3];
  h=sheet(3,6,15,d,[...rows(2,13).map(r=>'C'+r),'C15'],'C2',['C'],13,['A1','B1','C1','E1','F1','B15']);h.fillDown('C2',13);
  /* Hoja 4 · Casos de prueba */
  d={A1:'Caso',B1:'Área',C1:'Horas extra',D1:'Bono informado',E1:'Esperado (tú)',F1:'Resultado fórmula',G1:'¿Coincide?',I1:'Área',J1:'Bono de cierre'};
  put(d,'A',2,CASES.map(c=>c[0]));put(d,'B',2,CASES.map(c=>c[1]));put(d,'C',2,CASES.map(c=>c[2]));CASES.forEach((c,i)=>{if(c[3]!=='')d['D'+(i+2)]=String(c[3])});
  put(d,'I',2,PAR.map(p=>p[0]));put(d,'J',2,PAR.map(p=>p[1]));
  rows(2,6).forEach(r=>d['G'+r]=`=SI.ERROR(SI(O(E${r}="";F${r}="");"—";SI(E${r}=F${r};"SÍ";"NO"));"ERROR")`);
  sheet(4,10,6,d,rows(2,6).flatMap(r=>['E'+r,'F'+r]),'E2',['F'],6,['A1','B1','C1','D1','E1','F1','G1','I1','J1']);
}
function mark(n,res){const h=H[n].h;Object.entries(res).forEach(([k,good])=>{h.cells[k].classList.toggle('ok',good);h.cells[k].classList.toggle('bad',!good)})}
function render(n,items,pts,extra){
  const max=MAX[n];const all=pts===max;
  document.getElementById('out'+n).innerHTML=`<div class="out"><strong>Revisión automática · ${pts} / ${max} puntos</strong> <span class="hint">(mejor resultado: ${Math.max(best[n],pts)} / ${max})</span>
    <div class="checks2">${items.map(o=>`<div class="${o[0]?'ok':'no'}">${o[0]?'✓':'✕'} ${o[1]}</div>`).join('')}</div>
    ${extra||''}${all?`<div class="ok-row">✓ ${['','¡Fórmula de BUSCARX probada y corregida!','¡Control de horas extra y bonos funcionando en las 12 filas!','¡Control de existencia listo para el reporte de cierre!','¡Tus casos de prueba confirman que la fórmula hace lo que dice la regla!'][n]}</div>`:'<p class="hint" style="margin:8px 0 0">Corrige y vuelve a revisar: se guarda tu mejor resultado.</p>'}</div>`}
function shownErr(vals){const e=vals.find(isErr);return e||''}

/* ---- Desafío 1 ---- */
function check1(){const h=H[1].h,v=k=>h.value(k),f2=h.get('D2');const R=rows(2,13);
  const allFx=R.every(r=>h.get('D'+r).startsWith('='));const vals=R.map(r=>v('D'+r));
  const exist=R.filter(r=>!MISSING.includes(r));
  const okExist=exist.every(r=>v('D'+r)===MAEMAP[NOM[r-2][0]][2]);
  const okMiss=MISSING.every(r=>!isErr(v('D'+r))&&txt(v('D'+r))==='NO EXISTE');
  const orig=nf(f2)===nf(IA[1]);const items=[];let pts=0;
  if(orig){items.push([false,'D2 todavía tiene la fórmula original de la IA. Observa qué muestra en las filas 8 (EMP-0O8) y 12 (EMP-013) y corrígela.'])}
  else{
    const c1=allFx&&/BUSCARX\(/i.test(f2)&&!vals.includes('#¿NOMBRE?');if(c1)pts+=5;
    items.push([c1,c1?'D2:D13 usan fórmulas con BUSCARX.':vals.includes('#¿NOMBRE?')?'Aparece #¿NOMBRE?: separa los argumentos con punto y coma (;).':!/BUSCARX\(/i.test(f2)?'D2 debe usar la función BUSCARX.':'Hay celdas de D2:D13 sin fórmula: selecciona D2 y presiona “Rellenar hacia abajo”.']);
    if(okExist)pts+=10;
    items.push([okExist,okExist?'Los 10 códigos que existen traen el valor hora correcto del maestro.':vals.includes('#¿NOMBRE?')?'Aparece #¿NOMBRE?: revisa que los argumentos estén separados con punto y coma (;) y que la función esté bien escrita.':'Algunos códigos existentes no traen el valor hora correcto: el rango de búsqueda debe ser $F$2:$F$13 (códigos) y el de resultado $H$2:$H$13 (valor hora), fijados con $.']);
    if(okMiss)pts+=10;
    const missVals=MISSING.map(r=>v('D'+r));
    items.push([okMiss,okMiss?'EMP-0O8 y EMP-013 muestran “NO EXISTE” en vez de un error.':missVals.some(x=>x==='#N/A')?'EMP-0O8 (fila 8) y EMP-013 (fila 12) siguen mostrando #N/A: no están en el maestro. Usa el cuarto argumento de BUSCARX (si_no_se_encuentra) con el texto "NO EXISTE" y rellena hacia abajo.':`Las filas 8 y 12 deben mostrar exactamente el texto NO EXISTE (ahora muestran: ${esc(MISSING.map(r=>h.display('D'+r)).join(' / '))}).`]);}
  const res={};R.forEach(r=>{const x=v('D'+r);res['D'+r]=MISSING.includes(r)?txt(x)==='NO EXISTE':x===MAEMAP[NOM[r-2][0]][2]});mark(1,res);
  const extra=pts===MAX[1]?'<div class="callout" style="margin-top:8px"><strong>Mira la columna E:</strong> EMP-004 tiene una diferencia de $83 entre el valor hora de la nómina y el del maestro. ¡Tu control ya encontró algo que revisar antes del cierre!</div>':'';
  return {pts,items,extra}}

/* ---- Desafío 2 ---- */
function check2(){const h=H[2].h,v=k=>h.value(k),f2=h.get('E2');const R=rows(2,13);
  const vals=R.map(r=>v('E'+r));const allFx=R.every(r=>h.get('E'+r).startsWith('='));
  const noName=!vals.includes('#¿NOMBRE?')&&!f2.includes(',');const errs=vals.some(isErr);
  const abs=/\$?G\$2:\$?G\$6/i.test(f2)&&/\$?H\$2:\$?H\$6/i.test(f2);
  const wrong=R.filter((r,i)=>txt(vals[i])!==EXP2[i]);const orig=nf(f2)===nf(IA[2]);const items=[];let pts=0;
  if(orig){items.push([false,'E2 todavía tiene la fórmula original de la IA: muestra #¿NOMBRE? en todas las filas. ¿Qué separador de argumentos usa Excel en español?'])}
  else{
    if(noName)pts+=6;items.push([noName,noName?'Separador correcto: los argumentos van con punto y coma (;).':'Aparece #¿NOMBRE?: la fórmula usa comas. En Excel en español la coma es decimal; separa los argumentos con punto y coma (;).']);
    if(abs)pts+=6;items.push([abs,abs?'La tabla de parámetros está fijada con $ ($G$2:$G$6 y $H$2:$H$6).':'El rango de parámetros no está fijado con $: al rellenar hacia abajo se desplaza (revisa la fórmula de E9 en la barra fx). Usa $G$2:$G$6 y $H$2:$H$6.']);
    const c3=allFx&&!errs;if(c3)pts+=6;items.push([c3,c3?'Las 12 filas tienen fórmula y ninguna muestra error.':!allFx?'Hay celdas de E2:E13 sin fórmula: selecciona E2 y presiona “Rellenar hacia abajo”.':`Todavía hay filas con error (${esc(shownErr(vals))}). Si es #N/A, la búsqueda no encuentra el área porque el rango se desplazó.`]);
    const c4=wrong.length===0;if(c4)pts+=12;items.push([c4,c4?'Los 12 resultados coinciden con la regla: 6 casos OK y 6 casos REVISAR.':`Resultados distintos a la regla en: ${wrong.map(r=>NOM[r-2][0]).join(', ')}. Recuerda: REVISAR si horas extra &gt; 12 <b>o</b> bono distinto al de su área; en otro caso, OK.`]);}
  const res={};R.forEach((r,i)=>res['E'+r]=txt(vals[i])===EXP2[i]);mark(2,res);
  return {pts,items}}

/* ---- Desafío 3 ---- */
function check3(){const h=H[3].h,v=k=>h.value(k),f2=h.get('C2');const R=rows(2,13);
  const vals=R.map(r=>v('C'+r));const allFx=R.every(r=>h.get('C'+r).startsWith('='));
  const exist=R.filter(r=>!MISSING.includes(r));
  const okExist=exist.every(r=>{const x=v('C'+r);return x!==''&&!isErr(x)&&txt(x)!=='NO EXISTE'});
  const okMiss=MISSING.every(r=>txt(v('C'+r))==='NO EXISTE');
  const tot=v('C15'),okTot=h.get('C15').startsWith('=')&&tot===2;
  const orig=nf(f2)===nf(IA[3]);const items=[];let pts=0;
  if(orig){items.push([false,'C2 todavía tiene la fórmula de la IA. Prueba con EMP-001: está en el maestro (fila 2), pero la fórmula dice NO EXISTE. ¿En qué columna está buscando?'])}
  else{
    if(allFx)pts+=5;items.push([allFx,allFx?'C2:C13 tienen fórmula.':'Hay celdas de C2:C13 sin fórmula: selecciona C2 y presiona “Rellenar hacia abajo”.']);
    if(okExist)pts+=8;items.push([okExist,okExist?'Los 10 códigos que sí están en el maestro aparecen como existentes.':vals.some(isErr)?`Aparece un error (${esc(shownErr(vals))}): si COINCIDIR no encuentra el código devuelve #N/A; mantén el ESERROR que lo convierte en “NO EXISTE”.`:'Códigos que sí existen aparecen como NO EXISTE: COINCIDIR debe buscar en la columna de códigos del maestro ($E$2:$E$13), no en la de áreas.']);
    const c3=okMiss&&okExist;if(c3)pts+=7;items.push([c3,c3?'EMP-0O8 (escrito con letra O) y EMP-013 (ingreso reciente) quedan marcados como NO EXISTE.':okMiss?'Las filas 8 y 12 dicen NO EXISTE, pero el control no distingue: primero corrige los códigos existentes.':'EMP-0O8 (fila 8) y EMP-013 (fila 12) no están en el maestro y deben mostrar NO EXISTE.']);
    if(okTot)pts+=5;items.push([okTot,okTot?'C15 cuenta 2 códigos inexistentes con una fórmula.':!h.get('C15')?'Falta el total en C15: usa =CONTAR.SI(C2:C13;"NO EXISTE").':!h.get('C15').startsWith('=')?'C15 debe ser una fórmula, no un número escrito a mano.':`C15 muestra ${esc(h.display('C15'))}; con el control corregido debería contar 2.`]);}
  const res={};R.forEach(r=>{const x=v('C'+r);res['C'+r]=MISSING.includes(r)?txt(x)==='NO EXISTE':(x!==''&&!isErr(x)&&txt(x)!=='NO EXISTE')});res.C15=okTot;mark(3,res);
  return {pts,items}}

/* ---- Desafío 4 ---- */
function check4(){const h=H[4].h,v=k=>h.value(k);const R=rows(2,6);const items=[];let pts=0;
  const expOk=R.map((r,i)=>txt(v('E'+r))===EXP4[i]);const fxOk=R.map((r,i)=>h.get('F'+r).startsWith('=')&&txt(v('F'+r))===EXP4[i]);
  pts+=expOk.filter(Boolean).length*2+fxOk.filter(Boolean).length*2;
  const ne=expOk.filter(Boolean).length,nf_=fxOk.filter(Boolean).length;
  items.push([ne===5,ne===5?'Tus 5 resultados esperados son correctos.':`Resultados esperados correctos: ${ne} de 5.${R.map((r,i)=>expOk[i]?'':`<br/>· <b>${CASES[i][0]}</b>: ${h.get('E'+r)?'revisa tu predicción':'escribe OK o REVISAR'}; ${CASEHINT[i]}`).join('')}`]);
  const fv=R.map(r=>v('F'+r));const empty=R.every(r=>!h.get('F'+r));
  items.push([nf_===5,nf_===5?'Tu fórmula reproduce los 5 resultados esperados.':empty?'Falta la fórmula en F2: copia tu fórmula corregida del desafío 2 y cambia el rango de parámetros a $I$2:$I$6 y $J$2:$J$6. Luego rellena hacia abajo.':fv.includes('#¿NOMBRE?')?'Aparece #¿NOMBRE?: revisa el separador (;) y el nombre de las funciones.':fv.includes('#N/A')?'Aparece #N/A: en esta hoja los parámetros están en I2:J6; fíjalos con $.':R.some(r=>!h.get('F'+r).startsWith('='))?'Hay casos sin fórmula en F2:F6: selecciona F2 y rellena hacia abajo.':`La fórmula reproduce ${nf_} de 5 casos. Revisa el operador: la regla es “más de 12” (&gt;) y bono distinto (&lt;&gt;).`]);
  const res={};R.forEach((r,i)=>{if(h.get('E'+r))res['E'+r]=expOk[i];if(h.get('F'+r))res['F'+r]=fxOk[i]});mark(4,res);
  return {pts,items}}

const CHECK={1:check1,2:check2,3:check3,4:check4};
function bestOf(n){return Math.max(best[n],(S&&S.first&&+S.first['lab2a_b'+n])||0)}
Object.assign(window.LESSON,{
  score(){return [1,2,3,4].reduce((a,n)=>a+bestOf(n),0)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);
    $('#labPct').textContent=sc+'%';$('#labState').textContent=sc>=70?'Aprobado':'Pendiente';$('#labState').style.color=sc>=70?'var(--good)':'var(--bad)';$('#labTries').textContent=tries;
    $('#labDetail').innerHTML=`<div class="checks2">${[1,2,3,4].map(n=>{const b=bestOf(n);return `<div class="${b===MAX[n]?'ok':'no'}">Desafío ${n} · ${NAMES[n]}: <b>${b} / ${MAX[n]}</b>${b<MAX[n]?' · puedes mejorarlo':''}</div>`}).join('')}</div>`;
    const g=(n,k)=>H[n]?H[n].h.get(k):'';
    $('#labLib').innerHTML=[['Desafío 1 · D2',g(1,'D2')],['Desafío 2 · E2',g(2,'E2')],['Desafío 3 · C2',g(3,'C2')],['Desafío 3 · C15',g(3,'C15')],['Desafío 4 · F2',g(4,'F2')]]
      .map(([t,f],i)=>`<div class="promptbox"><b>${t}:</b> ${f?esc(f):'(sin fórmula)'}${f&&IA[i+1]&&i<3&&nf(f)===nf(IA[i+1])?' <i>(fórmula original de la IA, sin corregir)</i>':''}</div>`).join('')},
  init(api){S=api.S;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    build();
    document.querySelectorAll('[data-fill]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.fill,cfg=H[n],k=cfg.h.sel;
      if(!cfg.fill.includes(k.replace(/\d+/,''))||k.replace(/[A-Z]+/,'')!=='2'){document.getElementById('out'+n).innerHTML=`<div class="alert-row">Selecciona primero ${cfg.fill.map(c=>c+'2').join(' o ')} (la celda con tu fórmula) y luego presiona “Rellenar hacia abajo”.</div>`;return}
      cfg.h.fillDown(k,cfg.last);document.getElementById('out'+n).innerHTML=`<div class="hint" style="margin-top:8px">Fórmula de ${k} copiada hasta la fila ${cfg.last}. Revisa los resultados y presiona “Revisar”.</div>`}));
    document.querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.check;tries++;
      const r=CHECK[n]();render(n,r.items,r.pts,r.extra);best[n]=Math.max(best[n],r.pts);S.first['lab2a_b'+n]=best[n]=Math.max(best[n],bestOf(n));api.done('d'+n)}))}
});
})();
