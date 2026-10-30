/* Laboratorio 2B · Auditoría del cierre: 12 registros con errores
   Etapa 1: clasificar las alertas de la IA (confirmada / falso positivo + evidencia).
   Etapa 2: columnas de control en el simulador de Excel (hoja.js).
   Etapa 3: acción por registro + nota de hallazgos con plantilla. */
(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>typeof n==='number'?n.toLocaleString('es-CL'):n;
const money=n=>'$'+fmt(n);
/* Código, Área, Días, Sueldo base, Horas extra, Valor hora, HE pagadas, Bono, AFP, Total haberes */
const HEAD=['Código','Área','Días trab.','Sueldo base','Horas extra','Valor hora','HE pagadas','Bono','AFP','Total haberes'];
const DATA=[
 ['EMP-101','Ventas',30,900000,4,5000,30000,45000,'Modelo',957000],
 ['EMP-102','Operaciones',30,720000,10,4000,60000,0,'Habitat',780000],
 ['EMP-103','Planta',30,1080000,12,6000,72000,50000,'Capital',1202000],
 ['EMP-104','Bodega',30,810000,8,4500,54000,40000,'Provida',904000],
 ['EMP-105','Planta',30,1440000,8,8000,96000,0,'Cuprum',1536000],
 ['EMP-106','Finanzas',30,1260000,0,7000,0,0,'Modelo',1260000],
 ['EMP-107','Ventas',30,990000,6,5500,49500,160000,'Uno',1199500],
 ['EMP-108','Operaciones',30,1350000,6,7500,90000,0,'Habitat',1440000],
 ['EMP-109','Finanzas',30,1170000,0,6500,0,70000,'PlanVital',1240000],
 ['EMP-110','Bodega',32,630000,14,3500,73500,30000,'Capital',775500],
 ['EMP-111','Planta',28,900000,5,5000,37500,50000,'Provida',927500],
 ['EMP-112','Ventas',30,1080000,3,6000,27000,60000,'Modelo',1107000]];
const BONOS=[['EMP-101',45000,'B-0451'],['EMP-103',50000,'B-0452'],['EMP-104',40000,'B-0453'],['EMP-107',80000,'B-0457'],['EMP-109',70000,'B-0454'],
 ['EMP-110',30000,'B-0455'],['EMP-111',50000,'B-0456'],['EMP-107',80000,'B-0457'],['EMP-112',60000,'B-0458']];
const B0=17,B1=B0+BONOS.length-1; // filas de la carga de bonos en la hoja (17 a 25)

/* ---- Etapa 1: alertas de la IA ---- */
const VERD=['Confirmada','Falso positivo'];
const ALERTS=[
 {code:'EMP-103',t:'Las horas extra pagadas ($72.000) no aplican el recargo de 50 %.',v:0,
  ev:['El monto está bien: coincide con horas × valor hora.','12 h × $6.000 = $72.000: se pagó sin recargo; con × 1,5 corresponde $108.000.','Planta usa otro valor hora, por eso el monto es distinto.'],e:1,
  why:'Confirmada: 12 × 6.000 × 1,5 = $108.000; faltan $36.000.',hv:'Recalcula: horas × valor hora × 1,5. ¿Coincide con lo pagado?',he:'La evidencia debe mostrar el cálculo con la regla del recargo, no solo horas × valor hora.'},
 {code:'EMP-105',t:'El pago de horas extra ($96.000) es 50 % mayor que horas × valor hora ($64.000): posible pago en exceso.',v:1,
  ev:['Se pagó de más: debió pagarse $64.000.','EMP-105 tiene el sueldo más alto, por eso hay que revisarlo.','8 h × $8.000 × 1,5 = $96.000: ese 50 % adicional es el recargo legal.'],e:2,
  why:'Falso positivo: la IA olvidó el recargo. 8 × 8.000 × 1,5 = $96.000, exactamente lo pagado.',hv:'Aplica la regla completa (× 1,5). ¿Hay realmente una diferencia?',he:'Un sueldo alto no es evidencia de error. Busca el cálculo que explica el monto.'},
 {code:'EMP-107',t:'El bono de producción está cargado dos veces.',v:0,
  ev:['La carga de bonos tiene dos filas de EMP-107 con el mismo folio (B-0457) y el bono pagado es $160.000 = 2 × $80.000.','Ventas suele tener bonos altos; no es un error.','El bono es correcto porque EMP-107 hizo horas extra.'],e:0,
  why:'Confirmada: mismo código, mismo monto y mismo folio dos veces en la carga.',hv:'Revisa la carga de bonos: ¿cuántas veces aparece EMP-107 y con qué folio?',he:'La evidencia está en la carga de bonos, no en el área ni en las horas extra.'},
 {code:'EMP-109',t:'Registra 30 días trabajados, pero octubre tiene 31 días: falta pagar un día.',v:1,
  ev:['AndesCorp liquida el sueldo mensual sobre base 30 días: 30 días es un mes completo.','Falta pagar un día: debió registrar 31.','Como no tiene horas extra, le faltan días.'],e:0,
  why:'Falso positivo: con base 30 días, 30 días trabajados es el mes completo.',hv:'Revisa la regla de la base de días del cierre.',he:'Las horas extra no tienen relación con los días. ¿Qué dice la regla de los 30 días?'},
 {code:'EMP-110',t:'Registra 32 días trabajados, más que el máximo de un mes.',v:0,
  ev:['Las 14 horas extra explican los días adicionales.','El mes se liquida con máximo 30 días; con 32 días el sueldo proporcional sube a $672.000 en vez de $630.000.','Es posible porque octubre tiene 31 días y hubo un domingo trabajado.'],e:1,
  why:'Confirmada: 32 días superan la base de 30 e inflan el sueldo proporcional en $42.000.',hv:'¿Cuál es el máximo de días que admite la base mensual?',he:'Las horas extra se pagan aparte y la base es de 30 días: busca la evidencia que use esa regla.'},
 {code:'EMP-107',t:'El total de haberes ($1.199.500) queda $80.000 sobre lo que corresponde.',v:0,
  ev:['Es falso positivo: si la suma cuadra, el total no puede estar mal.','El total está mal porque sus horas extra no tienen recargo.','La suma cuadra, pero arrastra el bono duplicado: el total correcto es $1.119.500.'],e:2,
  why:'Confirmada: es la consecuencia de la alerta 3. Al eliminar la carga duplicada, el total baja a $1.119.500.',hv:'Que la suma cuadre no basta: ¿son correctos los componentes que suma?',he:'Sus horas extra sí tienen recargo (6 × 5.500 × 1,5 = $49.500). Busca qué componente está inflado.'},
 {code:'EMP-101',t:'El total de haberes ($957.000) no coincide con la suma de sus componentes.',v:0,
  ev:['La diferencia se explica por el redondeo del valor hora.','$900.000 + $30.000 + $45.000 = $975.000: el total registrado tiene dígitos invertidos (−$18.000).','El total es correcto: la IA sumó dos veces el bono.'],e:1,
  why:'Confirmada: 900.000 + 30.000 + 45.000 = $975.000; se registró $957.000.',hv:'Suma sueldo proporcional + horas extra + bono y compara con el total.',he:'No hay redondeos en estos montos. Haz la suma y compárala.'}];

/* ---- Etapa 3: acción esperada por registro (0 sin acción, 1 corregir, 2 investigar) ---- */
const ACTS=['Sin acción','Corregir antes del pago','Investigar con jefatura'];
const IA_OF={'EMP-101':'Alerta 7','EMP-103':'Alerta 1','EMP-105':'Alerta 2 (falso positivo)','EMP-107':'Alertas 3 y 6','EMP-109':'Alerta 4 (falso positivo)','EMP-110':'Alerta 5'};
const EXP=[
 {a:1,why:'Total con dígitos invertidos: se corrige a $975.000.',h:['Tu control P muestra −$18.000 en el total.','','La causa es clara (digitación) y el valor correcto se calcula: no necesitas a la jefatura.']},
 {a:0,why:'Sus controles están en cero.',h:['','10 h × $4.000 × 1,5 = $60.000 y el total cuadra: no hay nada que corregir.','10 h × $4.000 × 1,5 = $60.000 y el total cuadra: no hay nada que investigar.']},
 {a:1,why:'Faltan $36.000 de recargo: se corrige a $108.000 antes del pago.',h:['Tu control M muestra −$36.000 en horas extra.','','La regla del recargo es clara: el valor correcto se calcula sin consultar a nadie.']},
 {a:0,why:'Controles en cero: sin acción.',h:['','8 h × $4.500 × 1,5 = $54.000, un bono en la carga y el total cuadra.','8 h × $4.500 × 1,5 = $54.000, un bono en la carga y el total cuadra.']},
 {a:0,why:'Falso positivo de la IA: el pago incluye el recargo legal.',h:['','Es el falso positivo de la IA: tu control M está en 0.','Es el falso positivo de la IA: tu control M está en 0. No hay nada que investigar.']},
 {a:0,why:'Sin horas extra ni bono: total = sueldo base.',h:['','Sin horas extra ni bono, el total es el sueldo base: no hay diferencia.','Sin horas extra ni bono, el total es el sueldo base: no hay diferencia.']},
 {a:1,why:'Carga duplicada (folio B-0457): se elimina una y el total baja $80.000.',h:['Tu control O muestra 2 cargas de bono para este código.','','El folio repetido demuestra la duplicación: se corrige eliminando una carga.']},
 {a:2,why:'Se pagó con recargo de 100 %: confirma con la jefatura si existe un pacto con recargo mayor antes de corregir.',h:['Tu control M muestra +$22.500: la IA no lo vio.','La ley fija un recargo mínimo de 50 %, no un máximo: primero confirma si hay un pacto con recargo mayor.','']},
 {a:0,why:'Falso positivo de la IA: 30 días es un mes completo.',h:['','Es el falso positivo de la IA: con base 30 días, el mes está completo.','Es el falso positivo de la IA: con base 30 días, el mes está completo.']},
 {a:2,why:'No sabes cuántos días trabajó realmente: confirma la asistencia con la jefatura y luego recalcula.',h:['Tu control N marca más de 30 días.','¿A cuántos días lo corregirías? Necesitas el dato real de asistencia: primero investiga.','']},
 {a:0,why:'28 días es válido: sueldo proporcional $840.000 y el total cuadra.',h:['','28 días está dentro de la base de 30 y el sueldo proporcional ($840.000) está bien calculado.','28 días está dentro de la base de 30 y el sueldo proporcional ($840.000) está bien calculado.']},
 {a:1,why:'El total omitió el bono de $60.000: se corrige a $1.167.000.',h:['Tu control P muestra −$60.000: la IA no lo vio.','','El bono está respaldado en la carga y falta en el total: la corrección es clara.']}];

/* ---- Valores esperados de las columnas de control ---- */
const EXPCOL={
  L:DATA.map(r=>r[4]*r[5]*1.5),
  M:DATA.map(r=>r[6]-r[4]*r[5]*1.5),
  O:DATA.map(r=>BONOS.filter(b=>b[0]===r[0]).length),
  P:DATA.map(r=>r[9]-(r[3]/30*r[2]+r[6]+r[7]))};
const CTRL=['L','M','N','O','P'],R0=2,R1=13;

let S=null,api=null,hoja=null,tries=0;
let st={s1:null,s3:null,s2:0,nt:0,note:''}; // s1/s3: puntaje de la primera revisión
function save(){if(S)S.first.l2b=Object.assign({},st,{note:undefined})}

/* ===== Etapa 1 ===== */
function buildE1(){
  document.querySelector('#aiTable tbody').innerHTML=ALERTS.map((a,i)=>`<tr><td>${i+1}</td><td>${a.code}</td><td>${esc(a.t)}</td></tr>`).join('');
  const num=[3,4,5,6,7,9];
  document.getElementById('dataTable').innerHTML=`<thead><tr>${HEAD.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${DATA.map(r=>`<tr>${r.map((v,i)=>`<td class="${num.includes(i)||i===2||i===4?'n':''}">${num.includes(i)?money(v):v}</td>`).join('')}</tr>`).join('')}</tbody>`;
  document.getElementById('bonoTable').innerHTML=`<thead><tr><th>Código</th><th>Bono</th><th>Folio</th></tr></thead><tbody>${BONOS.map(b=>`<tr><td>${b[0]}</td><td class="n">${money(b[1])}</td><td>${b[2]}</td></tr>`).join('')}</tbody>`;
  document.getElementById('alList').innerHTML=ALERTS.map((a,i)=>`<div class="al-card" data-i="${i}"><div class="al-t"><b class="num">${i+1}</b>${a.code} · ${esc(a.t)}</div>
    <div class="al-sel"><label>Veredicto<select class="l2-select v" aria-label="Veredicto de la alerta ${i+1}"><option value="">Elige…</option>${VERD.map((o,j)=>`<option value="${j}">${o}</option>`).join('')}</select></label>
    <label>Evidencia<select class="l2-select e" aria-label="Evidencia de la alerta ${i+1}"><option value="">Elige…</option>${a.ev.map((o,j)=>`<option value="${j}">${esc(o)}</option>`).join('')}</select></label></div><div class="al-fb"></div></div>`).join('')}
function checkE1(){const cards=[...document.querySelectorAll('#alList .al-card')],out=document.getElementById('e1Out');
  const ans=cards.map(c=>[c.querySelector('.v').value,c.querySelector('.e').value]);
  if(ans.some(a=>a[0]===''||a[1]==='')){out.innerHTML='<div class="alert-row">Elige el veredicto y la evidencia de las 7 alertas antes de revisar.</div>';return}
  tries++;let pts=0,ok=0;
  cards.forEach((c,i)=>{const a=ALERTS[i],gv=+ans[i][0]===a.v,ge=+ans[i][1]===a.e;pts+=(gv?3:0)+(ge?2:0);if(gv&&ge)ok++;
    c.classList.toggle('good',gv&&ge);c.classList.toggle('bad',!(gv&&ge));
    c.querySelector('.al-fb').innerHTML=gv&&ge?`✓ ${a.why}`:!gv?`✕ <b>Veredicto:</b> ${a.hv}`:`✕ <b>Evidencia:</b> ${a.he}`;
    if(gv&&ge)c.querySelectorAll('select').forEach(s=>s.disabled=true)});
  const first=st.s1===null;if(first){st.s1=pts;save()}
  document.getElementById('e1tick').textContent=`${ok} / 7`;document.getElementById('e1task').classList.toggle('ok',ok===7);
  out.innerHTML=(first?`<div class="l2-score"><span>Primera revisión: ${pts} / 35 puntos</span></div>`:'')+
    (ok===7?'<div class="ok-row">✓ Informe auditado: 5 alertas confirmadas y 2 falsos positivos. Fíjate que la IA <b>no</b> dijo nada de EMP-108 ni EMP-112. ¿Están realmente bien? Lo verás con tus controles en la etapa 2.</div>'
    :`<div class="alert-row">Tienes ${ok} de 7 alertas bien resueltas. Corrige las marcadas en rojo con ayuda del feedback y vuelve a revisar.</div>`);
  if(ok===7)api.done('e1')}

/* ===== Etapa 2 ===== */
function buildE2(){const data={},locked=[];const COLS='ABCDEFGHIJ';
  HEAD.forEach((h,i)=>{data[COLS[i]+'1']=h;locked.push(COLS[i]+'1')});
  DATA.forEach((row,r)=>row.forEach((v,i)=>{const k=COLS[i]+(r+2);data[k]=String(v);locked.push(k)}));
  [['L1','HE recalculada'],['M1','Dif. HE'],['N1','Días > 30'],['O1','Veces en carga bonos'],['P1','Dif. total']].forEach(([k,v])=>{data[k]=v;locked.push(k)});
  data['A15']='CARGA DE BONOS DEL MES (sistema)';data['A16']='Código';data['B16']='Bono';data['C16']='Folio';
  BONOS.forEach((b,i)=>{data['A'+(B0+i)]=b[0];data['B'+(B0+i)]=String(b[1]);data['C'+(B0+i)]=b[2]});
  const rows=B1;
  for(let c=0;c<16;c++)for(let r=1;r<=rows;r++){const k=String.fromCharCode(65+c)+r;const editable=CTRL.includes(k[0])&&r>=R0&&r<=R1;if(!editable&&!locked.includes(k))locked.push(k)}
  hoja=Hoja(document.getElementById('hoja2'),{cols:16,rows,data,locked,start:'L2'});
  [...'ABCDEFGHIJ'].map(c=>c+'1').concat(['L1','M1','N1','O1','P1','A16','B16','C16','A15']).forEach(k=>hoja.cells[k].classList.add('hdr'))}
const isErr=v=>typeof v==='string'&&v.startsWith('#');
function checkE2(){const v=k=>hoja.value(k),out=[];let ok=0;tries++;
  const rows=[];for(let r=R0;r<=R1;r++)rows.push(r);
  const allF=c=>rows.every(r=>hoja.get(c+r).startsWith('='));
  const anyEmpty=c=>rows.some(r=>hoja.get(c+r)==='');
  const anyErr=c=>rows.some(r=>isErr(v(c+r)));
  const numCol=(c,label,absOk,hintF)=>{const exp=EXPCOL[c];const good=rows.map((r,i)=>{const x=v(c+r);return typeof x==='number'&&(absOk?Math.abs(Math.abs(x)-Math.abs(exp[i]))<0.5:Math.abs(x-exp[i])<0.5)});
    good.forEach((g,i)=>mark(c+rows[i],g));const all=good.every(Boolean)&&allF(c);
    let msg;if(all)msg=`Columna ${c} (${label}) correcta en las 12 filas.`;
    else if(anyEmpty(c))msg=`Columna ${c} (${label}): faltan filas. Escribe la fórmula en ${c}2 y usa “Rellenar hacia abajo”.`;
    else if(anyErr(c))msg=`Columna ${c} (${label}): hay celdas con error. Revisa el punto y coma (;) entre argumentos y la coma decimal (1,5).`;
    else if(good.every(Boolean))msg=`Columna ${c} (${label}): los valores coinciden, pero usa fórmulas en vez de escribir los números.`;
    else msg=`Columna ${c} (${label}): ${good.filter(Boolean).length} de 12 filas correctas. ${hintF()}`;
    out.push([all,msg]);return all};
  numCol('L','HE recalculada',false,()=>/1[.]5/.test(hoja.get('L2'))?'Usa coma decimal: 1,5.':'Debe ser horas (E) × valor hora (F) × 1,5.');
  numCol('M','Dif. HE',true,()=>'Resta lo pagado (G) menos tu recálculo (L) en la misma fila.');
  // N: el registro con más de 30 días debe quedar marcado distinto de todos los demás
  {const vals=rows.map(r=>v('N'+r)),idx=DATA.findIndex(d=>d[2]>30);const key=x=>typeof x==='boolean'?(x?'V':'F'):String(x).toUpperCase();
    const flagged=key(vals[idx]),others=vals.filter((_,i)=>i!==idx).map(key);
    const refC=rows.every(r=>new RegExp('C\\$?'+r+'(?!\\d)').test(hoja.get('N'+r).toUpperCase()));
    const good=allF('N')&&refC&&!vals.some(isErr)&&others.every(o=>o===others[0])&&flagged!==others[0]&&vals.every(x=>x!=='');
    rows.forEach((r,i)=>{const td=hoja.cells['N'+r];td.classList.toggle('ok',good);td.classList.toggle('bad',!good&&(isErr(vals[i])||(hoja.get('N'+r)!==''&&!hoja.get('N'+r).startsWith('='))))});
    out.push([good,good?'Columna N (días > 30) correcta: marca solo el registro con más de 30 días.':anyEmpty('N')?'Columna N (días > 30): faltan filas. Rellena desde N2 hasta N13.':anyErr('N')?'Columna N (días > 30): hay celdas con error. Prueba =SI(C2>30;"REVISAR";"OK").':!refC?'Columna N (días > 30): cada fila debe evaluar los días de su propia fila (columna C).':'Columna N (días > 30): la marca debe distinguir solo los registros con más de 30 días. Revisa la condición (> 30).']);
    if(good)ok++}
  const oGood=numCol('O','veces en carga de bonos',false,()=>hoja.get('O3').includes('$')?'Cuenta el código de la fila (A) dentro de la carga de bonos (A17:A25).':'Fija el rango con $ ($A$17:$A$25) para que no se desplace al rellenar hacia abajo.');
  numCol('P','Dif. total',true,()=>'Calcula J menos (D/30×C + G + H) en la misma fila.');
  ok=out.filter(o=>o[0]).length;st.s2=Math.max(st.s2,ok);save();
  const all=ok===5;
  document.getElementById('e2Out').innerHTML=`<div class="checks2">${out.map(o=>`<div class="${o[0]?'ok':'no'}">${o[0]?'✓':'✕'} ${o[1]}</div>`).join('')}</div>`+
    (all?'<div class="ok-row" style="margin-top:8px">✓ ¡Controles listos! Ahora lee los resultados en tu hoja: ¿qué filas muestran una diferencia distinta de 0, más de 30 días o más de una carga de bono? Compáralas con las alertas de la IA. Llevarás estos resultados a la etapa 3.</div>':'');
  if(all)api.done('e2');return all}
function mark(k,good){const td=hoja.cells[k];td.classList.toggle('ok',!!good);td.classList.toggle('bad',!good&&hoja.get(k)!=='')}

/* ===== Etapa 3 ===== */
function ctlChips(i){const r=i+2;const d=k=>hoja?hoja.display(k):'—',val=k=>hoja?hoja.value(k):'';
  const f=(k,bad)=>`<span class="${bad?'flag':''}">${k}</span>`;
  const m=val('M'+r),o=val('O'+r),p=val('P'+r);const nFlag=nOdd(r);
  return f('Dif. HE: '+d('M'+r),typeof m==='number'&&Math.abs(m)>0.5)+f('Días: '+d('N'+r),nFlag)+f('Bonos: '+d('O'+r),typeof o==='number'&&o>1)+f('Dif. total: '+d('P'+r),typeof p==='number'&&Math.abs(p)>0.5)}
function nOdd(r){if(!hoja)return false;const key=x=>typeof x==='boolean'?(x?'V':'F'):String(x).toUpperCase();const ks=[];for(let k=R0;k<=R1;k++)ks.push(key(hoja.value('N'+k)));const cnt={};ks.forEach(k=>cnt[k]=(cnt[k]||0)+1);const maj=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];const me=key(hoja.value('N'+r));return me!==maj&&me!==''}
function buildE3(){document.getElementById('actGrid').innerHTML=DATA.map((d,i)=>`<div class="act-card" data-i="${i}"><div class="act-head"><strong>${d[0]}</strong><span class="act-tag">${d[1]}</span><span class="act-tag ${IA_OF[d[0]]?'ia':''}">${IA_OF[d[0]]?'IA: '+IA_OF[d[0]]:'IA: sin alerta'}</span></div>
  <div class="act-ctl"></div><label>Acción<select class="l2-select a" aria-label="Acción para ${d[0]}"><option value="">Elige…</option>${ACTS.map((o,j)=>`<option value="${j}">${o}</option>`).join('')}</select></label><div class="al-fb"></div></div>`).join('');
  document.querySelectorAll('#actGrid select').forEach(s=>s.addEventListener('change',fillNoteActs))}
function refreshE3(){document.querySelectorAll('#actGrid .act-card').forEach((c,i)=>c.querySelector('.act-ctl').innerHTML=ctlChips(i))}
function checkE3(){const cards=[...document.querySelectorAll('#actGrid .act-card')],out=document.getElementById('e3Out');
  const ans=cards.map(c=>c.querySelector('select').value);
  if(ans.some(a=>a==='')){out.innerHTML='<div class="alert-row">Elige una acción para los 12 registros antes de revisar.</div>';return}
  tries++;let pts=0,ok=0;
  cards.forEach((c,i)=>{const e=EXP[i],a=+ans[i],good=a===e.a,half=!good&&e.a>0&&a>0;pts+=good?2.5:half?1:0;if(good)ok++;
    c.classList.toggle('good',good);c.classList.toggle('half',half);c.classList.toggle('bad',!good&&!half);
    c.querySelector('.al-fb').innerHTML=good?`✓ ${e.why}`:`${half?'◐ Detectaste el problema, pero revisa la acción.':'✕'} ${e.h[a]}`;
    if(good)c.querySelector('select').disabled=true});
  const first=st.s3===null;if(first){st.s3=pts;save()}
  document.getElementById('e3tick').textContent=`${ok} / 12`;document.getElementById('e3task').classList.toggle('ok',ok===12);
  out.innerHTML=(first?`<div class="l2-score"><span>Primera revisión: ${fmt(pts)} / 30 puntos</span></div>`:'')+
    (ok===12?'<div class="ok-row">✓ Decisiones correctas: 4 registros a corregir (EMP-101, EMP-103, EMP-107, EMP-112), 2 a investigar (EMP-108, EMP-110) y 6 sin acción. Ahora redacta la nota para Rodrigo.</div>'
    :`<div class="alert-row">Tienes ${ok} de 12 registros bien resueltos. Usa tus controles y el feedback de cada tarjeta para corregir.</div>`);
  if(ok===12)api.done('e3');fillNoteActs()}
function fillNoteActs(){const cards=[...document.querySelectorAll('#actGrid .act-card')];const pick=a=>cards.filter(c=>c.querySelector('select').value===String(a)).map(c=>{const i=+c.dataset.i;return `${DATA[i][0]}: ${EXP[i].a===a?EXP[i].why:'(revisar motivo)'}`}).join('\n');
  ['nt0','nt1'].forEach((id,k)=>{const ta=document.getElementById(id);if(!ta.dataset.edited)ta.value=pick(k+1)})}
const has=(txt,code)=>new RegExp('(^|[^0-9])(EMP-?)?'+code+'(?![0-9])','i').test(txt);
function makeNote(){const f=[0,1,2,3,4].map(i=>document.getElementById('nt'+i).value.trim());const out=document.getElementById('ntOut');
  if(f.slice(2).some(x=>!x)){out.innerHTML='<div class="alert-row">Completa al menos las líneas de falsos positivos, errores no detectados y control propuesto.</div>';return}
  const chk=[];let pts=0;
  const fp=['105','109'].filter(c=>has(f[2],c)),wrongFp=['101','103','107','110','108','112'].filter(c=>has(f[2],c));
  pts+=fp.length;chk.push([fp.length===2&&!wrongFp.length,fp.length===2?(wrongFp.length?`Falsos positivos: incluiste también ${wrongFp.map(c=>'EMP-'+c).join(', ')}, que tiene un error real.`:'Falsos positivos bien identificados: EMP-105 y EMP-109.'):'Falsos positivos: revisa qué alertas de la IA descartaste en la etapa 1 (son dos).']);
  const nd=['108','112'].filter(c=>has(f[3],c));pts+=nd.length;
  chk.push([nd.length===2,nd.length===2?'Errores no detectados por la IA bien informados: EMP-108 y EMP-112.':'Errores no detectados: ¿qué registros con diferencia no aparecían en el informe de la IA? (son dos).']);
  const words=f[4].split(/\s+/).filter(Boolean).length;if(words>=6)pts+=1;
  chk.push([words>=6,words>=6?'Propuesta de control concreta.':'Control propuesto: descríbelo en al menos una frase completa (qué control, cuándo y quién lo revisa).']);
  if(wrongFp.length)pts=Math.max(0,pts-1);
  st.nt=Math.max(st.nt,pts);tries++;
  const note=`NOTA DE HALLAZGOS · CIERRE OCTUBRE · AndesCorp (muestra de 12 registros seudonimizados)\nPara: Rodrigo, jefe de Compensaciones\n\n1. Corregir antes del pago:\n${f[0]||'—'}\n\n2. Investigar con jefatura:\n${f[1]||'—'}\n\n3. Alertas de la IA descartadas (falsos positivos):\n${f[2]}\n\n4. Errores que la IA no detectó:\n${f[3]}\n\n5. Control propuesto para el próximo cierre:\n${f[4]}\n\nVerificado con columnas de control en Excel (recálculo de horas extra, días > 30, carga de bonos y total de haberes).`;
  st.note=note;save();
  out.innerHTML=`<div class="checks2">${chk.map(c=>`<div class="${c[0]?'ok':'no'}">${c[0]?'✓':'✕'} ${c[1]}</div>`).join('')}</div><div class="l2-score"><span>Nota: ${pts} / 5 puntos (se guarda tu mejor versión: ${st.nt} / 5)</span></div>
    <div class="out"><strong>Tu nota de hallazgos</strong><div class="promptbox" id="noteTxt">${esc(note)}</div><div style="margin-top:10px"><button class="small-btn" type="button" id="copyNote">Copiar nota</button></div></div>`;
  document.getElementById('copyNote').addEventListener('click',copyNote);
  api.done('nota')}
function copyNote(e){const b=e.currentTarget;(navigator.clipboard?navigator.clipboard.writeText(st.note):Promise.reject()).then(()=>{b.textContent='✓ Copiada'},()=>{b.textContent='Selecciona y copia el texto'})}

/* ===== Puntaje y reinicio ===== */
const s2pts=()=>st.s2*6;
function resetLab(){st.s1=null;st.s3=null;st.nt=0;st.note='';save();
  document.querySelectorAll('#alList .al-card,#actGrid .act-card').forEach(c=>{c.classList.remove('good','bad','half');c.querySelector('.al-fb').innerHTML='';c.querySelectorAll('select').forEach(s=>{s.disabled=false;s.value=''})});
  ['e1Out','e3Out','ntOut'].forEach(id=>document.getElementById(id).innerHTML='');
  [0,1,2,3,4].forEach(i=>{const t=document.getElementById('nt'+i);t.value='';delete t.dataset.edited});
  document.getElementById('e1tick').textContent='0 / 7';document.getElementById('e3tick').textContent='0 / 12';
  document.getElementById('e1task').classList.remove('ok');document.getElementById('e3task').classList.remove('ok');
  ['e1','e3','nota'].forEach(k=>S.done.delete(k));api.go(1)}

Object.assign(window.LESSON,{
  score(){return Math.round((st.s1||0)+s2pts()+(st.s3||0)+st.nt)},
  report(){const sc=this.score(),$=s=>document.querySelector(s);
    $('#labPct').textContent=sc+'%';$('#labState').textContent=sc>=70?'Buen dominio':'Sigue practicando';$('#labState').style.color=sc>=70?'var(--good)':'var(--teal-ink)';$('#labTries').textContent=tries;
    const rows=[[st.s1||0,35,'Etapa 1 · Informe de la IA (primera revisión)',28],[s2pts(),30,'Etapa 2 · Columnas de control en Excel',30],[st.s3||0,30,'Etapa 3 · Acciones por registro (primera revisión)',24],[st.nt,5,'Etapa 3 · Nota de hallazgos (mejor versión)',4]];
    $('#labDetail').innerHTML=`<div class="checks2">${rows.map(r=>`<div class="${r[0]>=r[3]?'ok':'no'}">${r[2]}: <b>${fmt(r[0])} / ${r[1]}</b>${r[0]<r[3]?' · repasa esta etapa':''}</div>`).join('')}</div>`+
      (sc<70?'<div class="alert-row">Te conviene practicar otra vez: presiona “Reintentar el laboratorio”: tus fórmulas de la etapa 2 se conservan y vuelves a clasificar las alertas y a decidir las acciones.</div>':'');
    $('#labNote').innerHTML=st.note?`<div class="promptbox">${esc(st.note)}</div><div style="margin-top:8px"><button class="small-btn" type="button" id="copyNote2">Copiar nota</button></div>`:'<p class="hint">Aún no generas tu nota.</p>';
    const c2=$('#copyNote2');if(c2)c2.addEventListener('click',copyNote)},
  init(a){api=a;S=a.S;
    if(S.first.l2b){const p=S.first.l2b;st.s1=p.s1==null?null:p.s1;st.s3=p.s3==null?null:p.s3;st.s2=p.s2||0;st.nt=p.nt||0}
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    buildE1();buildE2();buildE3();
    document.getElementById('e1Check').addEventListener('click',checkE1);
    document.getElementById('fillBtn').addEventListener('click',()=>{const k=hoja.sel;if(!CTRL.includes(k[0])||k.slice(1)!=='2'){document.getElementById('e2Out').innerHTML='<div class="alert-row">Selecciona primero la celda de la fila 2 con tu fórmula (L2, M2, N2, O2 o P2) y luego presiona “Rellenar hacia abajo”.</div>';return}hoja.fillDown(k,R1)});
    document.getElementById('e2Check').addEventListener('click',checkE2);
    document.getElementById('e3Check').addEventListener('click',checkE3);
    document.getElementById('ntBtn').addEventListener('click',makeNote);
    ['nt0','nt1'].forEach(id=>document.getElementById(id).addEventListener('input',e=>{e.target.dataset.edited='1'}));
    document.getElementById('retryLab').addEventListener('click',resetLab);
    // al entrar a la etapa 3, refrescar los resultados de los controles
    const sec3=document.getElementById('actGrid').closest('section');
    new MutationObserver(()=>{if(sec3.classList.contains('active'))refreshE3()}).observe(sec3,{attributes:true,attributeFilter:['class']});
    refreshE3()}
});
})();
