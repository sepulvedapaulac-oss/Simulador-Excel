/* Laboratorio 3A · Variaciones mensuales por área en el simulador de Excel */
(function(){
const AREAS=[['Ventas',150200,159800],['Operaciones',120400,128900],['Planta',110300,125700],['Bodega',62100,64300],['Otras áreas',55000,59180]];
let hoja=null,S=null,best=0;const NCHK=5;
const sep=AREAS.reduce((a,r)=>a+r[1],0),oct=AREAS.reduce((a,r)=>a+r[2],0),dT=oct-sep;
function build(){const data={},locked=[];const L=(k,v)=>{if(v!==undefined)data[k]=String(v);locked.push(k)};
  ['Área','Sep (miles $)','Oct (miles $)','Var. absoluta','Var. %','Participación %'].forEach((h,i)=>L('ABCDEF'[i]+'1',h));
  AREAS.forEach((r,i)=>{L('A'+(i+2),r[0]);L('B'+(i+2),r[1]);L('C'+(i+2),r[2])});
  L('A7','TOTAL');L('B7','=SUMA(B2:B6)');L('C7','=SUMA(C2:C6)');
  hoja=Hoja(document.getElementById('hoja1'),{cols:6,rows:7,data,locked,start:'D2'});
  ['A1','B1','C1','D1','E1','F1','A7'].forEach(k=>hoja.cells[k].classList.add('hdr'))}
function check(){const v=k=>hoja.value(k),f=k=>hoja.get(k),out=[];const R=[2,3,4,5,6,7];
  const near=(x,e,t)=>typeof x==='number'&&Math.abs(x-e)<=t;
  const dOk=R.every(r=>f('D'+r).startsWith('=')&&near(v('D'+r),v('C'+r)-v('B'+r),0.5));
  out.push([dOk,dOk?'Columna D: variación absoluta correcta en las seis filas, incluido el total ($39.880 mil).':R.some(r=>!f('D'+r))?'Columna D: faltan filas. Escribe =C2-B2 en D2 y rellena hasta la fila 7.':'Columna D: revisa la fórmula; debe ser octubre menos septiembre (C − B).']);
  const eOk=R.every(r=>{const ex=(v('C'+r)-v('B'+r))/v('B'+r)*100;return f('E'+r).startsWith('=')&&near(v('E'+r),ex,0.06)});
  const eFrac=R.every(r=>near(v('E'+r),(v('C'+r)-v('B'+r))/v('B'+r),0.001));
  out.push([eOk,eOk?'Columna E: variación porcentual correcta (Planta +14,0 %, total +8,0 %).':eFrac?'Columna E: el cálculo está bien, pero multiplica por 100 para expresarlo en %: =REDONDEAR(D2/B2*100;1).':R.some(r=>!f('E'+r))?'Columna E: faltan filas. Rellena desde E2 hasta E7.':'Columna E: divide la variación por el valor de septiembre (B), no por el de octubre.']);
  const F=[2,3,4,5,6];const fOk=F.every(r=>f('F'+r).startsWith('=')&&near(v('F'+r),v('D'+r)/dT*100,0.06));
  const shifted=F.some(r=>/D\$?[89]|D\$?1[0-9]/i.test(f('F'+r)));
  out.push([fOk,fOk?'Columna F: participación correcta; Planta aporta 38,6 % de la variación.':shifted?'Columna F: al rellenar, el total se desplazó (D8, D9…). Fija el divisor con $D$7.':F.some(r=>!f('F'+r))?'Columna F: faltan filas. Rellena desde F2 hasta F6.':'Columna F: divide la variación del área (D) por la variación total ($D$7) y multiplica por 100.']);
  const f7=v('F7'),f7ok=/SUMA\(/i.test(f('F7'))&&near(f7,100,0.3);
  out.push([f7ok,f7ok?'Control F7: las participaciones suman 100.':!f('F7')?'Control F7: escribe =SUMA(F2:F6). Debe dar 100.':`Control F7: suma ${hoja.display('F7')}; si no da 100, revisa la columna F.`]);
  const ref=fOk&&F.every(r=>/\$D\$7/i.test(f('F'+r)));
  out.push([ref,ref?'Referencia absoluta: usaste $D$7, así el total no se desplaza al copiar.':'Referencia absoluta: usa $D$7 en la columna F para que el total quede fijo al rellenar hacia abajo.']);
  const ok=out.filter(o=>o[0]).length;best=Math.max(best,ok);S.first.l3a_best=Math.max(best,S.first.l3a_best||0);
  const map={D:R,E:R,F:F};Object.entries(map).forEach(([c,rows])=>rows.forEach(r=>{const td=hoja.cells[c+r];const good=out[{D:0,E:1,F:2}[c]][0];td.classList.toggle('ok',good);td.classList.toggle('bad',!good&&f(c+r)!=='')}));
  document.getElementById('checkOut').innerHTML=`<div class="checks2">${out.map(o=>`<div class="${o[0]?'ok':'no'}">${o[0]?'✓':'✕'} ${o[1]}</div>`).join('')}</div>${ok===NCHK?'<div class="ok-row" style="margin-top:8px">✓ ¡Cálculos verificados! Ahora compara tu columna F con la conclusión de la IA en la etapa 2.</div>':''}`;
  return ok===NCHK}
const bestCalc=()=>Math.max(best,(S&&S.first.l3a_best)||0);
Object.assign(window.LESSON,{
  score(){const v=['v1','v2','v3'].filter(k=>S.first[k]===true).length;return Math.round(bestCalc()/NCHK*70+v/3*30)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);$('#labPct').textContent=sc+'%';$('#labCalc').textContent=`${bestCalc()} / ${NCHK}`;
    $('#labState').textContent=sc>=70?'Buen dominio':'Sigue practicando';$('#labState').style.color=sc>=70?'var(--good)':'var(--teal-ink)'},
  init(api){S=api.S;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    build();
    document.getElementById('fillBtn').addEventListener('click',()=>{const k=hoja.sel,c=k[0];if(!['D','E','F'].includes(c)||k.slice(1)!=='2'){document.getElementById('checkOut').innerHTML='<div class="alert-row">Selecciona primero D2, E2 o F2 (la celda con tu fórmula) y luego presiona “Rellenar hacia abajo”.</div>';return}hoja.fillDown(k,c==='F'?6:7)});
    document.getElementById('checkBtn').addEventListener('click',()=>{if(check())api.done('tabla')})}
});
})();
