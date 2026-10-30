/* Evaluación final del curso
   Parte 1: 20 preguntas (5 por módulo, M1.P1…M4.P5) con feedback inmediato.
   Parte 2: laboratorio de análisis integrador (cuatro tareas, una por módulo).
   Al terminar se descarga un PDF con los resultados (generado en el navegador, sin conexión).
   Nota = 50 % Parte 1 + 50 % Parte 2. Aprobación: L.pass (60 % por defecto, exigencia del curso). */
(function(){
const L0=window.LESSON,P=L0.p1,SOLO=!!L0.soloP2,PASS=Math.round((L0.pass||0.6)*100); /* SOLO: versión con solo la Parte 2 (la Parte 1 va como cuestionario Moodle XML) */
let api=null,S=null,hoja=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MOD=['Módulo 1 · Fundamentos de IA','Módulo 2 · Revisión asistida por IA','Módulo 3 · Análisis e informes con IA','Módulo 4 · Automatización'];
const L4='ABCD';

/* ---------- Datos de la Parte 2 ---------- */
const COLS=[['Código EMP',1,'Reemplaza al nombre y al RUT: permite analizar sin identificar.'],['Nombre completo',0,'Identifica a la persona y el análisis no lo necesita.'],['RUT',0,'Identificador directo: nunca se entrega a la IA.'],['Área',1,'Necesaria para comparar por área.'],['Período',1,'Necesario para comparar octubre y noviembre.'],['Horas extra',1,'Concepto que se analiza.'],['Bonos',1,'Concepto que se analiza.'],['Total de haberes',1,'Permite cuadrar con el sistema.'],['Diagnóstico de licencia',0,'Dato de salud: sensible según la Ley 21.719.'],['Cuenta bancaria',0,'Dato financiero que el análisis no necesita.']];
const PROMPTS=['“Analiza esta planilla y dime qué pasó en noviembre.”',
 '“Actúa como analista de remuneraciones de AndesCorp. Con la tabla adjunta (códigos EMP, área, período, horas extra, bonos y total de haberes de octubre y noviembre, cuadrada con el sistema), calcula la variación por área y señala posibles inconsistencias. No inventes datos ni causas: marca como hipótesis lo que no puedas comprobar. Entrega una tabla y tres conclusiones breves.”',
 '“Eres experto legal. Revisa si a las personas les pagaron bien y corrige directamente lo que esté mal.”'];
const PR_OK=1,PR_FB=['Le falta rol, contexto, información, restricciones y formato: la IA tendrá que suponer.','Correcto: rol, tarea, contexto, información, restricciones y formato, con la regla de no inventar.','La IA no corrige pagos ni da asesoría legal; además, la instrucción no define datos ni formato.'];
const ACC=['Corregir','Investigar','Descartar'];
const ALERTS=[
 {a:'EMP-217: bono de producción pagado dos veces en noviembre.',e:'Hay dos registros del mismo bono en el mes; la novedad aprobada es una sola.',c:0,f:'Es un error confirmado por la evidencia: se corrige en el sistema antes de pagar.'},
 {a:'EMP-088: 60 horas extra en el mes, muy sobre su promedio.',e:'La asistencia aprobada registra 60 horas por un turno especial autorizado por la jefatura.',c:2,f:'Es un falso positivo: la evidencia respalda las horas. Se descarta y se registra el respaldo.'},
 {a:'EMP-301: sin cotización AFP en noviembre.',e:'Ingresó el 28 de noviembre; el contrato está en trámite y no hay certificado de afiliación en la carpeta.',c:1,f:'Falta información para decidir: se investiga con Personas antes de cerrar.'},
 {a:'Planta: horas extra +38 % respecto de octubre.',e:'Operaciones informó un pedido especial de fin de año; la asistencia aprobada cuadra con la nómina.',c:2,f:'La variación está explicada y respaldada: se descarta como error y se informa como hecho con su causa.'},
 {a:'EMP-150: líquido a pagar negativo.',e:'El anticipo de noviembre aparece cargado dos veces; solo hay un anticipo aprobado.',c:0,f:'Error confirmado: se corrige el descuento duplicado en el sistema.'},
 {a:'La IA indica que la tasa AFP de EMP-040 “debería ser 12 %”.',e:'La tasa del sistema coincide con la tabla oficial del período.',c:2,f:'Premisa errónea de la IA: la fuente oficial respalda el valor del sistema. Se descarta.'}];
const AREAS=[['Ventas',159800,152400],['Operaciones',128900,124100],['Planta',125700,131900],['Bodega',64300,63500],['Otras áreas',59180,56100]];
const CONCL=['“Todas las áreas bajaron por el fin del bono anual.”',
 '“El costo total bajó 1,8 % ($9,9 M) por el fin del bono anual de octubre. Planta es la única área que sube (+4,9 %): se debe confirmar con Operaciones si se explica por las horas extra del pedido especial antes de informarlo como causa.”',
 '“Planta explica toda la baja del costo de noviembre.”'];
const CONCL_OK=1,CONCL_FB=['Planta sube +4,9 %: no todas las áreas bajaron.','Correcto: cifras verificadas, el área que va contra la tendencia y la hipótesis marcada como tal.','Planta sube; no puede explicar una baja. Confunde la dirección del cambio.'];
const DQ=[
 {t:'1 · Problema que se aborda primero',o:['El diseño del informe a la gerencia','Los duplicados de bonos y anticipos en la carga de novedades: se repiten cada mes y afectan el pago','El cálculo de finiquitos'],c:1,f:'Los duplicados son repetitivos, tienen regla clara y su error llega al pago: alto impacto y esfuerzo bajo.'},
 {t:'2 · Herramienta',o:['Que la IA cargue las novedades directamente en el sistema','Un desarrollo propio que reemplace el sistema de remuneraciones','Formulario único de novedades y control automático de duplicados en planilla, con alertas de la IA'],c:2,f:'La herramienta más simple que resuelve el problema; la IA señala y no carga en el sistema oficial.'},
 {t:'3 · Control humano',o:['Camila revisa cada duplicado marcado antes de cargar, y Rodrigo aprueba la nómina con el resumen de alertas','Revisión después del pago, si hay reclamos','Sin control: la planilla basta'],c:0,f:'El control va antes de cargar y antes de pagar, con un segundo revisor.'},
 {t:'4 · Indicador de éxito',o:['Número de veces que se usa la planilla','Duplicados detectados después del pago y horas de revisión, comparados con la línea base de los últimos tres meses','La percepción del equipo'],c:1,f:'Indicadores de calidad y tiempo, medidos contra una línea base.'}];

/* ---------- Estado (en suspend_data vía S.first.fe) ---------- */
function ST(){if(!S.first.fe)S.first.fe={p1:Array(P.length).fill(-1),a:{c:Array(COLS.length).fill(-1),p:-1,ok:0},b:{d:Array(ALERTS.length).fill(-1),ok:0},c:{chk:0,cc:-1},d:{v:[-1,-1,-1,-1],t:'',ok:0},n:''};return S.first.fe}
const p1Score=st=>st.p1.filter((a,i)=>a===P[i].c).length;
const p1Mod=(st,m)=>st.p1.slice(m*5,m*5+5).filter((a,i)=>a===P[m*5+i].c).length;
function taskScores(st){
  const a=st.a.ok?Math.round((st.a.c.filter((v,i)=>v===COLS[i][1]).length/COLS.length*70)+(st.a.p===PR_OK?30:0)):0;
  const b=st.b.ok?Math.round(st.b.d.filter((v,i)=>v===ALERTS[i].c).length/ALERTS.length*100):0;
  const c=Math.round(st.c.chk/2*60+(st.c.cc===CONCL_OK?40:0));
  const d=st.d.ok?Math.round(st.d.v.filter((v,i)=>v===DQ[i].c).length/DQ.length*100):0;
  return [a,b,c,d]}
function totals(st){const p1=P.length?Math.round(p1Score(st)/P.length*100):0,t=taskScores(st),p2=Math.round(t.reduce((x,y)=>x+y,0)/4);return SOLO?{p1:0,p2,t,fin:p2}:{p1,p2,t,fin:Math.round(p1*0.5+p2*0.5)}}

/* ---------- Parte 1 ---------- */
let qi=0;
function p1Render(){const st=ST(),root=$('#p1Root');if(!root)return;
  const answered=st.p1.filter(a=>a>=0).length;
  const dots=P.map((q,i)=>{const a=st.p1[i];return `<i class="${a<0?(i===qi?'now':''):(a===q.c?'g':'b')}" title="${q.id}"></i>`}).join('');
  if(answered===P.length&&qi>=P.length){
    root.innerHTML=`<div class="fe-dots">${dots}</div><div class="fe-sum"><h3>Parte 1 completada · ${p1Score(st)} de ${P.length} correctas (${Math.round(p1Score(st)/P.length*100)} %)</h3>
      <div class="fe-mods">${MOD.map((m,k)=>`<div><b>${m}</b><span class="fe-bar"><span style="width:${p1Mod(st,k)/5*100}%"></span></span><small>${p1Mod(st,k)} de 5</small></div>`).join('')}</div>
      <p>Presiona <b>Siguiente</b> para comenzar la Parte 2: el laboratorio de análisis.</p></div>`;api.done('p1');return}
  if(qi>=P.length)qi=st.p1.findIndex(a=>a<0);
  const q=P[qi],a=st.p1[qi],m=+q.id[1]-1;
  root.innerHTML=`<div class="fe-dots" aria-hidden="true">${dots}</div>
   <div class="fe-q"><div class="fe-qhead"><span class="fe-id">${q.id}</span><span>${MOD[m]} · ${q.tema}</span><span class="fe-n">Pregunta ${qi+1} de ${P.length}</span></div>
   <h3>${q.q}</h3><div class="options">${q.o.map((o,j)=>`<button class="opt ${a<0?'':(j===q.c?'good':(j===a?'bad':'dim'))}" type="button" data-j="${j}" ${a>=0?'disabled':''}><span class="letter">${L4[j]}</span><span>${o}</span></button>`).join('')}</div>
   ${a>=0?`<div class="feedback ${a===q.c?'good':'bad'}"><strong>${a===q.c?'✓ Respuesta correcta.':'✕ Respuesta incorrecta.'}</strong> <span class="fb-body">${q.f[a]}${a!==q.c?` <br/><b>La correcta es la ${L4[q.c]}:</b> ${q.f[q.c]}`:''}</span></div>
   <div style="margin-top:12px"><button class="small-btn primary" type="button" id="p1Next">${st.p1.filter(x=>x<0).length?'Siguiente pregunta →':'Ver resumen de la Parte 1 →'}</button></div>`:''}</div>`;
  root.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{if(st.p1[qi]>=0)return;st.p1[qi]=+b.dataset.j;api.done('p1a');p1Render()}));
  const nx=$('#p1Next');if(nx)nx.addEventListener('click',()=>{const n=st.p1.findIndex(x=>x<0);qi=n<0?P.length:n;p1Render();root.scrollIntoView({behavior:'smooth',block:'start'})})}

/* ---------- Tarea A · Módulo 1 ---------- */
function aRender(){const st=ST().a,root=$('#taRoot');if(!root)return;
  root.innerHTML=`<div class="fe-cols">${COLS.map((c,i)=>{const v=st.c[i],good=st.ok&&v===c[1];return `<div class="fe-col ${st.ok?(good?'ok':'no'):''}"><b>${c[0]}</b><span class="fe-tg"><button type="button" data-i="${i}" data-v="1" class="${v===1?'on':''}" ${st.ok?'disabled':''}>Incluir</button><button type="button" data-i="${i}" data-v="0" class="${v===0?'on':''}" ${st.ok?'disabled':''}>Excluir</button></span>${st.ok?`<small>${good?'✓':'✕'} ${c[1]?'Se incluye':'Se excluye'}: ${c[2]}</small>`:''}</div>`}).join('')}</div>
   <h3 style="margin-top:16px">¿Qué instrucción le das al asistente corporativo?</h3>
   <div class="options">${PROMPTS.map((p,j)=>`<button class="opt ${st.p===j?'sel':''} ${st.ok?(j===PR_OK?'good':(j===st.p?'bad':'dim')):''}" type="button" data-p="${j}" ${st.ok?'disabled':''}><span class="letter">${L4[j]}</span><span>${p}</span></button>`).join('')}</div>
   ${st.ok?`<div class="feedback ${st.p===PR_OK?'good':'bad'}"><strong>Instrucción:</strong> <span class="fb-body">${PR_FB[st.p]}</span></div><div class="ok-row" style="margin-top:8px">Tarea 1 registrada: ${taskScores(ST())[0]} %.</div>`
     :`<button class="small-btn primary" type="button" id="taOk" style="margin-top:12px" ${st.c.includes(-1)||st.p<0?'disabled':''}>Confirmar tarea 1</button><p class="hint" style="margin-top:6px">Al confirmar, tu respuesta queda registrada y verás la retroalimentación.</p>`}`;
  root.querySelectorAll('.fe-tg button').forEach(b=>b.addEventListener('click',()=>{st.c[+b.dataset.i]=+b.dataset.v;aRender()}));
  root.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>{st.p=+b.dataset.p;aRender()}));
  const ok=$('#taOk');if(ok)ok.addEventListener('click',()=>{st.ok=1;api.done('ta');aRender()})}

/* ---------- Tarea B · Módulo 2 ---------- */
function bRender(){const st=ST().b,root=$('#tbRoot');if(!root)return;
  root.innerHTML=`<div class="tblwrap"><table class="fe-al"><thead><tr><th>#</th><th>Alerta de la IA</th><th>Evidencia revisada</th><th>Tu decisión</th></tr></thead><tbody>${ALERTS.map((r,i)=>{const v=st.d[i],good=v===r.c;return `<tr class="${st.ok?(good?'ok':'no'):''}"><td>${i+1}</td><td>${r.a}</td><td>${r.e}</td><td><select data-i="${i}" ${st.ok?'disabled':''} aria-label="Decisión para la alerta ${i+1}"><option value="">Elige…</option>${ACC.map((x,j)=>`<option value="${j}" ${v===j?'selected':''}>${x}</option>`).join('')}</select>${st.ok?`<small>${good?'✓':'✕ Correcto: '+ACC[r.c]+'.'} ${r.f}</small>`:''}</td></tr>`}).join('')}</tbody></table></div>
   ${st.ok?`<div class="ok-row" style="margin-top:8px">Tarea 2 registrada: ${taskScores(ST())[1]} %.</div>`:`<button class="small-btn primary" type="button" id="tbOk" style="margin-top:12px" ${st.d.includes(-1)?'disabled':''}>Confirmar tarea 2</button>`}`;
  root.querySelectorAll('select').forEach(s=>s.addEventListener('change',()=>{st.d[+s.dataset.i]=s.value===''?-1:+s.value;bRender()}));
  const ok=$('#tbOk');if(ok)ok.addEventListener('click',()=>{st.ok=1;api.done('tb');bRender()})}

/* ---------- Tarea C · Módulo 3 (simulador de Excel) ---------- */
function cBuild(){const el=$('#hojaFE');if(!el||hoja)return;const data={},locked=[];const Lk=(k,v)=>{if(v!==undefined)data[k]=String(v);locked.push(k)};
  ['Área','Oct (miles $)','Nov (miles $)','Var. absoluta','Var. %'].forEach((h,i)=>Lk('ABCDE'[i]+'1',h));
  AREAS.forEach((r,i)=>{Lk('A'+(i+2),r[0]);Lk('B'+(i+2),r[1]);Lk('C'+(i+2),r[2])});
  Lk('A7','TOTAL');Lk('B7','=SUMA(B2:B6)');Lk('C7','=SUMA(C2:C6)');
  hoja=Hoja(el,{cols:5,rows:7,data,locked,start:'D2'});['A1','B1','C1','D1','E1','A7'].forEach(k=>hoja.cells[k].classList.add('hdr'))}
function cCheck(){const v=k=>hoja.value(k),f=k=>hoja.get(k),R=[2,3,4,5,6,7],out=[];const near=(x,e,t)=>typeof x==='number'&&Math.abs(x-e)<=t;
  const dOk=R.every(r=>f('D'+r).startsWith('=')&&near(v('D'+r),v('C'+r)-v('B'+r),0.5));
  out.push([dOk,dOk?'Columna D: variación absoluta correcta en las seis filas (total −$9.880 mil).':R.some(r=>!f('D'+r))?'Columna D: faltan filas. Escribe =C2-B2 en D2 y rellena hasta la fila 7.':'Columna D: debe ser noviembre menos octubre (C − B).']);
  const eOk=R.every(r=>f('E'+r).startsWith('=')&&near(v('E'+r),(v('C'+r)-v('B'+r))/v('B'+r)*100,0.06));
  const frac=R.every(r=>near(v('E'+r),(v('C'+r)-v('B'+r))/v('B'+r),0.001));
  out.push([eOk,eOk?'Columna E: variación porcentual correcta (Planta +4,9 %, total −1,8 %).':frac?'Columna E: multiplica por 100 para expresarlo en %, por ejemplo =REDONDEAR(D2/B2*100;1).':R.some(r=>!f('E'+r))?'Columna E: faltan filas. Rellena desde E2 hasta E7.':'Columna E: divide la variación (D) por el valor de octubre (B).']);
  const st=ST().c,n=out.filter(o=>o[0]).length;st.chk=Math.max(st.chk,n);
  [['D',0],['E',1]].forEach(([c,i])=>R.forEach(r=>{const td=hoja.cells[c+r];td.classList.toggle('ok',out[i][0]);td.classList.toggle('bad',!out[i][0]&&f(c+r)!=='')}));
  $('#tcOut').innerHTML=`<div class="checks2">${out.map(o=>`<div class="${o[0]?'ok':'no'}">${o[0]?'✓':'✕'} ${o[1]}</div>`).join('')}</div>`;cConcl()}
function cConcl(){const st=ST().c,root=$('#tcConcl');if(!root)return;
  root.innerHTML=`<h3 style="margin-top:16px">¿Qué conclusión llevarías a la gerencia?</h3>${st.chk<2&&st.cc<0?'<p class="hint">Se habilita cuando tus dos columnas estén en verde.</p>':''}
   <div class="options">${CONCL.map((c,j)=>`<button class="opt ${st.cc<0?'':(j===CONCL_OK?'good':(j===st.cc?'bad':'dim'))}" type="button" data-j="${j}" ${st.cc>=0||st.chk<2?'disabled':''}><span class="letter">${L4[j]}</span><span>${c}</span></button>`).join('')}</div>
   ${st.cc>=0?`<div class="feedback ${st.cc===CONCL_OK?'good':'bad'}"><strong>${st.cc===CONCL_OK?'✓ Conclusión correcta.':'✕ Conclusión incorrecta.'}</strong> <span class="fb-body">${CONCL_FB[st.cc]}</span></div><div class="ok-row" style="margin-top:8px">Tarea 3 registrada: ${taskScores(ST())[2]} %.</div>`:''}`;
  root.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{if(st.cc>=0)return;st.cc=+b.dataset.j;api.done('tc');cConcl()}))}

/* ---------- Tarea D · Módulo 4 ---------- */
function dRender(){const st=ST().d,root=$('#tdRoot');if(!root)return;
  root.innerHTML=`<div class="fe-dq">${DQ.map((q,i)=>{const v=st.v[i];return `<label class="field">${q.t}<select data-i="${i}" ${st.ok?'disabled':''}><option value="">Elige…</option>${q.o.map((o,j)=>`<option value="${j}" ${v===j?'selected':''}>${o}</option>`).join('')}</select>${st.ok?`<small class="${v===q.c?'okc':'noc'}">${v===q.c?'✓':'✕ Mejor opción: '+q.o[q.c]+'.'} ${q.f}</small>`:''}</label>`}).join('')}
   <label class="field">5 · Tu recomendación para la gerencia <small>3 a 5 líneas: qué propones, cómo se controla y cómo medirás el resultado. Se incluye en tu PDF de resultados.</small>
   <textarea id="tdTxt" maxlength="600" rows="5" ${st.ok?'disabled':''} placeholder="Ej.: Propongo un formulario único de novedades con control automático de duplicados…">${esc(st.t)}</textarea><small id="tdCnt"></small></label></div>
   ${st.ok?`<div class="ok-row" style="margin-top:8px">Tarea 4 registrada: ${taskScores(ST())[3]} %.</div>`:`<button class="small-btn primary" type="button" id="tdOk" style="margin-top:6px">Confirmar tarea 4</button>`}`;
  const upd=()=>{const ok=$('#tdOk'),n=st.t.trim().length;if($('#tdCnt'))$('#tdCnt').textContent=st.ok?'':(n<40?`Escribe al menos 40 caracteres (${n}/40).`:`${n}/600 caracteres.`);if(ok)ok.disabled=st.v.includes(-1)||n<40};
  root.querySelectorAll('select').forEach(s=>s.addEventListener('change',()=>{st.v[+s.dataset.i]=s.value===''?-1:+s.value;upd()}));
  const ta=$('#tdTxt');if(ta)ta.addEventListener('input',()=>{st.t=ta.value.slice(0,600);upd()});
  const ok=$('#tdOk');if(ok)ok.addEventListener('click',()=>{st.ok=1;api.done('td');dRender()});upd()}

/* ---------- Resultados ---------- */
const LV=p=>p>=85?['Logrado','good']:p>=60?['En desarrollo','warn']:['Por reforzar','bad'];
const COMPTXT=[['Proteges los datos y das instrucciones completas a la IA.','Repasa la minimización de datos y la estructura de las instrucciones (lecciones 1.3 y 1.4).'],
 ['Revisas los resultados de la IA con evidencia y criterios claros.','Repasa el tratamiento de alertas y la validación con cuatro ojos (lecciones 2.3 y 2.4).'],
 ['Calculas, verificas y comunicas las variaciones con honestidad.','Repasa la variación porcentual, los gráficos honestos y la diferencia entre hecho e hipótesis (lecciones 3.2 a 3.4).'],
 ['Propones automatizaciones acotadas, con control humano y medición.','Repasa la priorización, el control humano y la línea base (lecciones 4.1 a 4.4).']];
const TASKN=['Tarea 1 · Datos e instrucción (M1)','Tarea 2 · Alertas de la IA (M2)','Tarea 3 · Variación en Excel (M3)','Tarea 4 · Propuesta de mejora (M4)'];
function comps(st){const t=taskScores(st);if(SOLO)return t;return [0,1,2,3].map(m=>Math.round((p1Mod(st,m)/5*100+t[m])/2))}
function studentName(){try{let w=window,n=0;while(w&&!w.API&&w.parent&&w.parent!==w&&n<10){w=w.parent;n++}if(w&&w.API){const v=String(w.API.LMSGetValue('cmi.core.student_name')||'');if(v){const p=v.split(',');return p.length===2?(p[1].trim()+' '+p[0].trim()):v}}}catch(e){}return ''}
function p1Block(st){return `<div><h3>Parte 1 por módulo</h3>${MOD.map((m,k)=>`<div class="fe-mrow"><span>${m}</span><span class="fe-bar"><span style="width:${p1Mod(st,k)/5*100}%"></span></span><b>${p1Mod(st,k)}/5</b></div>`).join('')}</div>
   `}
function report(){const st=ST(),el=$('#feReport');if(!el)return;const T=totals(st),pass=T.fin>=PASS,C=comps(st),col=pass?'var(--good)':'var(--bad)';
  if(!st.n)st.n=studentName();
  el.innerHTML=`<div class="ev-outcome ${pass?'clean':'inc'}"><div class="ev-ring" style="background:conic-gradient(${col} ${T.fin*3.6}deg,var(--track) 0)"><span>${T.fin}%</span></div>
    <div><h3>${pass?'Aprobado':'No aprobado'} · ${SOLO?'Parte 2':'Nota final'} ${T.fin} %</h3><p>${SOLO?`Caso práctico integrador: cuatro tareas, una por módulo. Se aprueba con ${PASS} %.`:`Parte 1 (preguntas): <b>${T.p1} %</b> · Parte 2 (laboratorio de análisis): <b>${T.p2} %</b>. La nota final pondera ambas partes en 50 % y se aprueba con ${PASS} %.`}</p></div></div>
   <div class="grid-2" style="margin-top:14px">${SOLO?'':p1Block(st)}<div><h3>Parte 2 por tarea</h3>${TASKN.map((n,k)=>`<div class="fe-mrow"><span>${n}</span><span class="fe-bar"><span style="width:${T.t[k]}%"></span></span><b>${T.t[k]}%</b></div>`).join('')}</div></div>
   <h3 style="margin-top:16px">Retroalimentación por competencia</h3>
   ${C.map((p,k)=>{const l=LV(p);return `<div class="ev-comp"><div class="top"><b>${MOD[k]}</b><span class="pill ${l[1]}">${l[0]} · ${p}%</span></div><p>${p>=85?COMPTXT[k][0]:COMPTXT[k][1]}</p></div>`}).join('')}
   <div class="callout" style="margin-top:14px"><strong>Descarga tus resultados</strong>
     <label class="field" style="margin-top:8px">Nombre que aparecerá en el PDF<input type="text" id="feName" maxlength="80" value="${esc(st.n)}" placeholder="Escribe tu nombre"/></label>
     <button class="small-btn primary" type="button" id="fePdf" style="margin-top:10px">⬇ Descargar PDF de resultados</button><span class="hint" id="fePdfMsg" style="margin-left:8px"></span></div>`;
  $('#feName').addEventListener('input',e=>{st.n=e.target.value.slice(0,80)});
  $('#fePdf').addEventListener('click',()=>{try{downloadPDF(st);$('#fePdfMsg').textContent='PDF generado.'}catch(e){$('#fePdfMsg').textContent='No se pudo generar el PDF: '+e.message}})}

/* ---------- PDF (generador propio, Helvetica WinAnsi, A4) ---------- */
const HW=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const SPECIAL={'€':128,'‚':130,'„':132,'…':133,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151};
function winAnsi(s){let o='';for(const ch of String(s)){let c=ch.codePointAt(0);
  if(SPECIAL[ch]){o+=String.fromCharCode(SPECIAL[ch]);continue}
  if(ch==='✓'){o+='OK';continue}if(ch==='✕'){o+='X';continue}if(ch==='→'){o+='->';continue}if(ch==='≥'){o+='>=';continue}if(ch==='−'){o+='-';continue}
  if(c<32)continue;if(c<127||(c>=160&&c<=255)){o+=ch;continue}o+='?'}return o}
const base=ch=>{const n=ch.normalize('NFD').replace(/[̀-ͯ]/g,'');return n.charCodeAt(0)||32};
function tw(s,size,bold){let w=0;for(const ch of winAnsi(s)){const c=ch.charCodeAt(0),b=c<127?c:base(ch);w+=(b>=32&&b<=126?HW[b-32]:556)}return w*size/1000*(bold?1.06:1)}
function wrap(s,size,bold,maxw){const out=[];String(s).split('\n').forEach(par=>{let line='';par.split(/\s+/).forEach(word=>{const t=line?line+' '+word:word;if(tw(t,size,bold)>maxw&&line){out.push(line);line=word}else line=t});out.push(line)});return out}
function pdfEsc(s){return winAnsi(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function buildPDF(draw){const W=595,H=842,M=48;const pages=[];let ops=[],y=0;
  const rgb=h=>{const n=parseInt(h.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255].map(x=>x.toFixed(3)).join(' ')};
  const doc={W,M,get y(){return y},set y(v){y=v},
    newPage(){if(ops.length)pages.push(ops.join('\n'));ops=[];y=H-M;
      ops.push(`${rgb('#5f7180')} rg BT /F1 8 Tf ${M} 24 Td (${pdfEsc('IA aplicada a la Gestión de Remuneraciones · Evaluación final del curso')}) Tj ET`);
      ops.push(`BT /F1 8 Tf ${W-M-40} 24 Td (${pdfEsc('Página '+(pages.length+1))}) Tj ET`)},
    need(h){if(y-h<50)doc.newPage()},
    rect(x,yy,w,h,col){ops.push(`${rgb(col)} rg ${x} ${yy} ${w} ${h} re f`)},
    text(x,yy,s,size=10,bold=false,col='#172431'){ops.push(`${rgb(col)} rg BT /${bold?'F2':'F1'} ${size} Tf ${x.toFixed(1)} ${yy.toFixed(1)} Td (${pdfEsc(s)}) Tj ET`)},
    para(s,size=10,bold=false,col='#172431',x=M,maxw=W-2*M,lead=1.35){const ls=wrap(s,size,bold,maxw);ls.forEach(l=>{doc.need(size*lead);y-=size*lead;doc.text(x,y,l,size,bold,col)});return ls.length},
    gap(h){y-=h},
    table(cols,rows,opt={}){const size=opt.size||8.6,pad=4;const X=[M];cols.forEach(c=>X.push(X[X.length-1]+c.w));
      const head=()=>{doc.need(size*2+pad*2);const h=size*1.4+pad*2;doc.rect(M,y-h,X[X.length-1]-M,h,'#123b4a');cols.forEach((c,i)=>doc.text(X[i]+pad,y-h+pad+2,c.t,size,true,'#ffffff'));y-=h};
      head();rows.forEach((r,ri)=>{const cells=r.map((v,i)=>wrap(v,size,false,cols[i].w-2*pad));const n=Math.max(...cells.map(c=>c.length));const h=n*size*1.3+pad*2;
        if(y-h<50){doc.newPage();head()}
        if(ri%2===0)doc.rect(M,y-h,X[X.length-1]-M,h,'#f1f6f7');
        cells.forEach((ls,i)=>ls.forEach((l,k)=>doc.text(X[i]+pad,y-pad-size*(k+1)*1.3+size*0.3,l,size,false,(opt.color&&opt.color(ri,i))||'#172431')));y-=h})}};
  doc.newPage();draw(doc);pages.push(ops.join('\n'));
  /* ensamblado */
  const objs=[];const add=s=>{objs.push(s);return objs.length};
  add('<< /Type /Catalog /Pages 2 0 R >>');add('PAGES');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids=[];pages.forEach(c=>{const cs=add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`);kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cs} 0 R >>`))});
  objs[1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
  let out='%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';const off=[];objs.forEach((o,i)=>{off.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
  const xref=out.length;out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes=new Uint8Array(out.length);for(let i=0;i<out.length;i++)bytes[i]=out.charCodeAt(i)&255;return bytes}
function downloadPDF(st){const T=totals(st),C=comps(st),pass=T.fin>=PASS,d=new Date(),fecha=d.toLocaleDateString('es-CL',{day:'2-digit',month:'long',year:'numeric'})+' · '+d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
  const bytes=buildPDF(doc=>{const M=doc.M,W=doc.W;
    doc.rect(0,842-118,W,118,'#123b4a');doc.rect(0,842-122,W,4,'#159aa3');
    doc.text(M,842-44,'IA APLICADA A LA GESTIÓN DE REMUNERACIONES',9,true,'#7fd8d0');
    doc.text(M,842-72,SOLO?'Resultados · Evaluación final, Parte 2':'Resultados de la evaluación final del curso',20,true,'#ffffff');
    doc.text(M,842-94,SOLO?'Caso práctico integrador: una tarea por módulo':'Parte 1: preguntas por módulo · Parte 2: laboratorio de análisis integrador',10,false,'#d7ecee');
    doc.y=842-150;
    doc.text(M,doc.y,'Participante:',10,true);{const ls=wrap(st.n||'(sin nombre)',10,false,W-2*M-80);ls.forEach((l,i)=>{if(i)doc.gap(13);doc.text(M+80,doc.y,l,10)})}doc.gap(16);
    doc.text(M,doc.y,'Fecha:',10,true);doc.text(M+80,doc.y,fecha,10);doc.gap(26);
    const bx=doc.y-62;doc.rect(M,bx,W-2*M,70,pass?'#e6f5ec':'#fdecee');
    doc.text(M+16,bx+42,(pass?'APROBADO':'NO APROBADO')+(SOLO?' · Parte 2: ':' · Nota final ')+T.fin+' %',16,true,pass?'#1d7a46':'#b3263e');
    doc.text(M+16,bx+20,SOLO?'Caso práctico integrador  ·  Aprobación con '+PASS+' %':'Parte 1: '+T.p1+' %  ·  Parte 2: '+T.p2+' %  ·  Ponderación 50 % / 50 %  ·  Aprobación con '+PASS+' %',10,false,'#172431');
    doc.y=bx-24;
    doc.text(M,doc.y,'Resumen por módulo',13,true,'#123b4a');doc.gap(10);
    if(SOLO){doc.table([{t:'Módulo',w:220},{t:'Tarea de la Parte 2',w:170},{t:'Competencia',w:109}],
      [0,1,2,3].map(k=>[MOD[k],TASKN[k].split(' · ')[1].replace(/ \(M\d\)/,'')+': '+T.t[k]+' %',LV(C[k])[0]+' · '+C[k]+' %']))}else{
    doc.table([{t:'Módulo',w:200},{t:'Parte 1',w:70},{t:'Tarea de la Parte 2',w:130},{t:'Competencia',w:99}],
      [0,1,2,3].map(k=>[MOD[k],p1Mod(st,k)+' de 5',TASKN[k].split(' · ')[1].replace(/ \(M\d\)/,'')+': '+T.t[k]+' %',LV(C[k])[0]+' · '+C[k]+' %']));
    doc.gap(18);doc.need(30);doc.text(M,doc.y,'Parte 1 · Preguntas de selección múltiple',13,true,'#123b4a');doc.gap(10);
    doc.table([{t:'ID',w:44},{t:'Tema',w:190},{t:'Tu respuesta',w:70},{t:'Correcta',w:60},{t:'Resultado',w:135}],
      P.map((q,i)=>{const a=st.p1[i];return [q.id,q.tema,a>=0?L4[a]:'—',L4[q.c],a===q.c?'Correcta':'Incorrecta']}),{color:(r,c)=>c===4?(st.p1[r]===P[r].c?'#1d7a46':'#b3263e'):null});
    }
    doc.gap(24);doc.need(40);doc.text(M,doc.y,SOLO?'Detalle por tarea':'Parte 2 · Laboratorio de análisis integrador',13,true,'#123b4a');doc.gap(4);
    const ta=st.a,tb=st.b,tc=st.c,td=st.d;
    const rowsB=ALERTS.map((r,i)=>[String(i+1),r.a,tb.d[i]>=0?ACC[tb.d[i]]:'—',ACC[r.c]]);
    doc.para('Tarea 1 · Datos e instrucción para la IA (Módulo 1): '+T.t[0]+' %',10.5,true);
    doc.para('Columnas bien clasificadas: '+ta.c.filter((v,i)=>v===COLS[i][1]).length+' de '+COLS.length+'. Instrucción elegida: '+(ta.p>=0?L4[ta.p]:'—')+(ta.p===PR_OK?' (correcta).':' (la correcta era la B, con rol, contexto, restricciones y formato).'),9.5);
    doc.gap(8);doc.para('Tarea 2 · Decisiones sobre las alertas de la IA (Módulo 2): '+T.t[1]+' %',10.5,true);doc.gap(6);
    doc.table([{t:'#',w:24},{t:'Alerta',w:295},{t:'Tu decisión',w:90},{t:'Esperada',w:90}],rowsB,{color:(r,c)=>c===2?(tb.d[r]===ALERTS[r].c?'#1d7a46':'#b3263e'):null});
    doc.gap(10);doc.para('Tarea 3 · Variación de noviembre en el simulador de Excel (Módulo 3): '+T.t[2]+' %',10.5,true);
    doc.para('Columnas correctas en el simulador: '+tc.chk+' de 2. Conclusión elegida: '+(tc.cc>=0?L4[tc.cc]:'—')+(tc.cc===CONCL_OK?' (correcta: baja de 1,8 % por el fin del bono anual; Planta sube +4,9 % y se marca como hipótesis).':' (la correcta era la B).'),9.5);
    doc.gap(8);doc.para('Tarea 4 · Propuesta de mejora con control humano (Módulo 4): '+T.t[3]+' %',10.5,true);
    DQ.forEach((q,i)=>doc.para(q.t+': '+(td.v[i]>=0?q.o[td.v[i]]:'—')+(td.v[i]===q.c?'  [correcta]':'  [mejor opción: '+q.o[q.c]+']'),9));
    doc.gap(6);doc.para('Tu recomendación para la gerencia:',9.5,true);doc.para(td.t||'(sin texto)',9.5,false,'#28404e');
    doc.gap(26);doc.need(40);doc.text(M,doc.y,'Retroalimentación por competencia',13,true,'#123b4a');doc.gap(4);
    C.forEach((p,k)=>{doc.para(MOD[k]+' · '+LV(p)[0]+' ('+p+' %)',10,true);doc.para(p>=85?COMPTXT[k][0]:COMPTXT[k][1],9.5)});
    doc.gap(14);doc.para('Evaluación con caso simulado y datos ficticios. Documento generado automáticamente al finalizar la evaluación.',8,false,'#5f7180')});
  const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=(SOLO?'Resultados_evaluacion_final_Parte2_':'Resultados_evaluacion_final_')+((st.n||'participante').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'')||'participante')+'.pdf';
  document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},4000);window.__lastPdf=bytes}

/* ---------- Integración con el motor ---------- */
Object.assign(window.LESSON,{
  pass:PASS/100,
  score(){return S&&S.first.fe?totals(ST()).fin:0},
  report,
  init(a){api=a;S=a.S;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    const show=()=>{qi=0;const st=ST();const n=st.p1.findIndex(x=>x<0);qi=n<0?P.length:n;p1Render();aRender();bRender();cBuild();cConcl();if(ST().c.chk)$('#tcOut').innerHTML=`<p class="hint">Mejor resultado registrado: ${ST().c.chk} de 2 columnas correctas.</p>`;dRender()};
    show();setTimeout(show,0);
    const fb=document.getElementById('fillBtn');if(fb)fb.addEventListener('click',()=>{const k=hoja.sel;if(!['D','E'].includes(k[0])||k.slice(1)!=='2'){$('#tcOut').innerHTML='<div class="alert-row">Selecciona primero D2 o E2 (la celda con tu fórmula) y luego presiona “Rellenar hacia abajo”.</div>';return}hoja.fillDown(k,7)});
    const cb=document.getElementById('checkBtn');if(cb)cb.addEventListener('click',cCheck)}
});
})();
