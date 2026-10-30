/* Laboratorio 4A · Hoja de controles de cierre con fórmulas (diferencia, estado, pendientes y listo para aprobar) */
(function(){
const C=[['Dotación pagada vs maestro de personal',422,422,0],['Total haberes vs libro (miles $)',541380,541380,1],['Horas extra nómina vs asistencia (horas)',1284,1262,0],
 ['Cotizaciones vs planilla previsional (miles $)',58910,58910,1],['Líquido a pagar vs archivo banco (miles $)',412660,412540,1],['Bonos nómina vs novedades aprobadas (miles $)',27900,27900,1]];
const R=[2,3,4,5,6,7];let hoja=null,S=null,best=0;const NCHK=5;
function build(){const data={},locked=[];const L=(k,v)=>{if(v!==undefined)data[k]=String(v);locked.push(k)};
  ['Control','Sistema','Fuente de control','Tolerancia','Diferencia','Estado'].forEach((h,i)=>L('ABCDEF'[i]+'1',h));
  C.forEach((r,i)=>r.forEach((v,c)=>L('ABCD'[c]+(i+2),v)));
  L('A9','Controles en REVISAR');L('A10','¿Listo para aprobar?');['B8','C8','D8','E8','F8','A8','B9','C9','D9','E9','B10','C10','D10','E10'].forEach(k=>L(k));
  hoja=Hoja(document.getElementById('hoja1'),{cols:6,rows:10,data,locked,start:'E2'});
  ['A1','B1','C1','D1','E1','F1','A9','A10'].forEach(k=>hoja.cells[k].classList.add('hdr'))}
function check(){const v=k=>hoja.value(k),f=k=>hoja.get(k),out=[];const isF=k=>f(k).startsWith('=');
  const eOk=R.every(r=>isF('E'+r)&&v('E'+r)===Math.abs(v('B'+r)-v('C'+r)));
  const eNeg=R.some(r=>isF('E'+r)&&v('E'+r)===v('B'+r)-v('C'+r)&&v('B'+r)<v('C'+r));
  out.push([eOk,eOk?'Columna E: diferencias correctas en las seis filas (22 horas y $120 mil).':R.some(r=>!f('E'+r))?'Columna E: faltan filas. Escribe =ABS(B2-C2) en E2 y rellena hasta la fila 7.':eNeg?'Columna E: usa ABS para que la diferencia no tenga signo.':'Columna E: revisa la fórmula; debe ser la diferencia entre B y C sin signo.']);
  const exp=r=>Math.abs(v('B'+r)-v('C'+r))<=v('D'+r)?'OK':'REVISAR';
  const norm=x=>String(x).trim().toUpperCase();
  const fOk=R.every(r=>isF('F'+r)&&/^=SI\(/i.test(f('F'+r))&&norm(v('F'+r))===exp(r));
  out.push([fOk,fOk?'Columna F: estados correctos; horas extra y líquido a pagar quedan en “REVISAR”.':R.some(r=>!f('F'+r))?'Columna F: faltan filas. Escribe la fórmula SI en F2 y rellena hasta la fila 7.':!R.every(r=>/^=SI\(/i.test(f('F'+r)||''))?'Columna F: usa la función SI para que el estado se calcule solo.':'Columna F: revisa la condición; “OK” cuando la diferencia (E) es menor o igual a la tolerancia (D).']);
  const tolRef=fOk&&R.every(r=>new RegExp('D\\$?'+r,'i').test(f('F'+r)));
  out.push([tolRef,tolRef?'Tolerancia por fila: cada estado compara con su propia tolerancia (columna D).':'Tolerancia: el estado de cada fila debe compararse con la tolerancia de esa misma fila (D2, D3…), no con un número fijo.']);
  const f9=/CONTAR\.SI\(/i.test(f('F9'))&&v('F9')===2;
  out.push([f9,f9?'F9: dos controles pendientes, contados con CONTAR.SI.':!f('F9')?'F9: escribe =CONTAR.SI(F2:F7;"REVISAR").':'F9: debe contar las celdas “REVISAR” del rango F2:F7 con CONTAR.SI.']);
  const f10=/^=SI\(/i.test(f('F10'))&&/F9/i.test(f('F10'))&&norm(v('F10'))==='PENDIENTE';
  out.push([f10,f10?'F10: “PENDIENTE”, porque aún hay controles por revisar.':!f('F10')?'F10: escribe =SI(F9=0;"LISTO";"PENDIENTE").':'F10: usa SI sobre F9: “LISTO” solo si F9 es cero.']);
  const ok=out.filter(o=>o[0]).length;best=Math.max(best,ok);S.first.l4a_best=Math.max(best,S.first.l4a_best||0);
  [['E',0],['F',1]].forEach(([c,i])=>R.forEach(r=>{const td=hoja.cells[c+r];td.classList.toggle('ok',out[i][0]);td.classList.toggle('bad',!out[i][0]&&f(c+r)!=='')}));
  [['F9',3],['F10',4]].forEach(([k,i])=>{const td=hoja.cells[k];td.classList.toggle('ok',out[i][0]);td.classList.toggle('bad',!out[i][0]&&f(k)!=='')});
  document.getElementById('checkOut').innerHTML=`<div class="checks2">${out.map(o=>`<div class="${o[0]?'ok':'no'}">${o[0]?'✓':'✕'} ${o[1]}</div>`).join('')}</div>${ok===NCHK?'<div class="ok-row" style="margin-top:8px">✓ ¡Hoja de controles lista! Ahora decide qué hacer con los dos controles pendientes.</div>':''}`;
  return ok===NCHK}
const bestCalc=()=>Math.max(best,(S&&S.first.l4a_best)||0);
Object.assign(window.LESSON,{
  score(){const d=['v1','v2','v3'].filter(k=>S.first[k]===true).length;return Math.round(bestCalc()/NCHK*70+d/3*30)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);$('#labPct').textContent=sc+'%';$('#labCalc').textContent=`${bestCalc()} / ${NCHK}`;
    $('#labState').textContent=sc>=70?'Buen dominio':'Sigue practicando';$('#labState').style.color=sc>=70?'var(--good)':'var(--teal-ink)'},
  init(api){S=api.S;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    build();
    document.getElementById('fillBtn').addEventListener('click',()=>{const k=hoja.sel;if(!['E','F'].includes(k[0])||k.slice(1)!=='2'){document.getElementById('checkOut').innerHTML='<div class="alert-row">Selecciona primero E2 o F2 (la celda con tu fórmula) y luego presiona “Rellenar hacia abajo”.</div>';return}hoja.fillDown(k,7)});
    document.getElementById('checkBtn').addEventListener('click',()=>{if(check())api.done('tabla')})}
});
})();
