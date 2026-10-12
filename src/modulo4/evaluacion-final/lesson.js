/* Evaluación final del Módulo 4 · Caso ramificado "Modernizando el cierre mensual"
   Motor de ramificación propio: cada nodo tiene una situación, tres decisiones con puntaje
   (óptima 3 · aceptable 2 · riesgosa 0), consecuencia narrada y nodo siguiente propio.
   Nota SCORM = puntaje acumulado / máximo posible de la ruta recorrida (mejor intento). */
(function(){
const PTS={opt:3,acc:2,risk:0};
const KIND={opt:'Decisión óptima',acc:'Decisión aceptable',risk:'Decisión riesgosa'};
const ICON={opt:'✓',acc:'◐',risk:'✕'};
const COMP={
  priorizar:{t:'Priorización de oportunidades',
    hi:'Eliges qué automatizar con un inventario, criterios claros y una línea base, sin exponer datos.',
    mid:'Priorizas con buena intención, pero sin medir o con pasos incompletos. Usa la matriz de impacto y esfuerzo y mide antes de empezar (lección 4.1).',
    lo:'Partiste por la herramienta o por una tarea de alto riesgo. Repasa los criterios y la matriz de la lección 4.1.'},
  asistentes:{t:'Configuración de asistentes',
    hi:'Configuras la IA con rol, fuentes, datos mínimos y una regla clara para marcar y derivar lo dudoso.',
    mid:'La IA funciona, pero con instrucciones genéricas que dejan dudas sin marcar. Define rol, fuentes, límites y derivación (lección 4.2).',
    lo:'Diste a la IA acceso o autonomía que no necesitaba. Repasa la configuración de asistentes de la lección 4.2.'},
  flujo:{t:'Flujo con control humano',
    hi:'Ubicas el control humano antes de cargar y pagar, con evidencia y un reemplazo definido.',
    mid:'Hay controles, pero parciales o fuera de tiempo. Revisa dónde va cada punto de control (lección 4.3).',
    lo:'Dejaste que la IA cargara, corrigiera o aprobara sin revisión. Repasa el flujo asistido de la lección 4.3.'},
  proyecto:{t:'Medición y escalamiento',
    hi:'Mides contra la línea base y escalas por etapas, con documentación y controles intactos.',
    mid:'Muestras resultados, pero sin evidencia suficiente o escalando demasiado rápido. Usa la rúbrica del proyecto (lección 4.4).',
    lo:'Informaste cifras sin respaldo o quitaste controles. Repasa el proyecto integrador de la lección 4.4.'}
};
const ROUTE={A:'Ruta A · Inventario priorizado',B:'Ruta B · Sin línea base',C:'Ruta C · Herramienta primero'};
const ai=(t)=>`<div class="ev-msg ev-ai"><span class="avatar">IA</span><div><span class="who">Asistente corporativo</span><p>${t}</p></div></div>`;
const person=(who,t,cls='mgr',ini='R')=>`<div class="ev-msg"><span class="avatar ${cls}">${ini}</span><div><span class="who">${who}</span><p>${t}</p></div></div>`;
const rod=t=>person('Rodrigo · jefe de Compensaciones',t);
const ger=t=>person('Andrea Rivas · gerenta general',t,'mgr','A');
const ASIS=(time,left)=>({t:'Instrucciones para la IA',time,left,comp:'asistentes',
  sit:`<p>La tarea del piloto es consolidar las novedades que envían las jefaturas. Debes escribir las instrucciones permanentes del asistente corporativo que las ordenará.</p>${ai('“Estoy listo. ¿Qué debo hacer con los correos de novedades?”')}`,
  q:'¿Qué instrucciones le das?',
  opts:[
   {k:'acc',s:'Instrucción genérica',t:'“Ordena las novedades de este mes en una tabla.”',next:'M4',
    c:'La tabla sale ordenada, pero el asistente interpreta a su manera las novedades ambiguas y no marca ninguna como dudosa.',
    why:'Sin reglas ni formato, la IA completa lo que falta con supuestos. Las instrucciones deben pedir que marque lo dudoso.',
    obs:'Las instrucciones del asistente no pedían marcar las novedades ambiguas.'},
   {k:'risk',s:'Acceso total y carga directa',t:'Darle acceso a toda la casilla de Compensaciones, incluidas licencias médicas, y que cargue las novedades directo en el sistema.',next:'M4',
    c:'El asistente lee correos con diagnósticos que no necesita y carga en el sistema dos novedades mal interpretadas.',
    why:'La IA recibe solo lo que necesita y no carga en el sistema oficial: una persona valida antes.',
    fx:'El asistente accedió a datos sensibles innecesarios y cargó novedades sin validación.'},
   {k:'opt',s:'Rol, datos mínimos, formato y marcas',t:'Rol de apoyo a Compensaciones; usar solo el formulario de novedades con códigos EMP; entregar la tabla de carga con columnas fijas y marcar como “dudosa” toda novedad sin monto, concepto o aprobación.',next:'M4',
    c:'El asistente entrega 59 novedades listas y 5 marcadas como dudosas, con el motivo de cada una.',
    why:'Rol, fuentes, datos mínimos, formato y una regla para lo dudoso: la IA asiste y deja visible lo que debe revisar una persona.'}]});
const NODES={
N1:{t:'¿Por dónde empezar?',time:'Lun 1 dic · 09:00',left:'Faltan 5 días',comp:'priorizar',
  sit:`${rod('“La gerencia aprobó modernizar el cierre. Leí que la IA puede hacerlo todo: automaticémoslo completo desde diciembre.”')}${ger('“El viernes quiero ver una propuesta concreta y un primer resultado.”')}<p>El cierre toma seis días hábiles. Un proveedor ofrece una herramienta que “calcula finiquitos con IA”.</p>`,
  q:'¿Cómo parte Camila?',
  opts:[
   {k:'acc',s:'La tarea que más molesta',t:'Elegir la tarea que el equipo considera más tediosa, responder consultas de trabajadores, y empezar de inmediato.',next:'B2',
    c:'El equipo está motivado, pero nadie sabe cuántas horas toma hoy esa tarea ni cuántos errores tiene.',
    why:'Una tarea molesta puede ser buena candidata, pero sin inventario ni línea base no hay forma de priorizar ni de demostrar el resultado.',
    obs:'La tarea del piloto se eligió sin inventario ni medición previa.'},
   {k:'risk',s:'Partir por la herramienta',t:'Contratar la herramienta del proveedor y automatizar el cálculo de finiquitos.',next:'C2',
    c:'El proveedor agenda una prueba para el martes y pide la base histórica de finiquitos para “entrenar” la herramienta.',
    why:'Los finiquitos tienen poco volumen, mucho criterio y efecto legal directo. Además, partir por la herramienta invierte el orden.',
    fx:'El proyecto partió por una herramienta para una tarea de alto riesgo legal.'},
   {k:'opt',s:'Inventario y matriz',t:'Hacer un inventario de tareas con horas y errores, ubicarlas en la matriz de impacto y esfuerzo y partir por consolidar novedades: 10 horas al mes y 6 errores.',next:'A3',
    c:'En medio día Camila tiene el inventario. Consolidar novedades es una victoria rápida: repetitiva, con regla clara y con línea base medida.',
    why:'Inventario, criterios, matriz y línea base: la prioridad queda justificada y el resultado se podrá medir.'}]},

C2:{t:'La prueba del proveedor',time:'Mar 2 dic · 09:00',left:'Faltan 4 días',comp:'priorizar',
  sit:`${person('Ejecutivo del proveedor','“Para la demostración necesitamos la base de finiquitos de los últimos tres años, con RUT, montos y causales.”','ia','P')}<p>No hay contrato de tratamiento de datos con este proveedor.</p>`,
  q:'¿Qué hace Camila?',
  opts:[
   {k:'opt',s:'Detener y volver al inventario',t:'No entregar datos, informar a Rodrigo que la herramienta no está autorizada y volver a priorizar con un inventario de tareas.',next:'B3',
    c:'Rodrigo acepta. Camila arma el inventario esa tarde y elige consolidar novedades, con 10 horas y 6 errores al mes como línea base.',
    why:'Sin autorización ni acuerdo de datos no se comparte información. Reconocer el error de enfoque a tiempo salva el proyecto.'},
   {k:'acc',s:'Datos ficticios para la demo',t:'Ofrecer datos sintéticos para la demostración y seguir evaluando la herramienta de finiquitos.',next:'B3',
    c:'La demo funciona con datos ficticios, pero el proyecto sigue apuntando a una tarea de alto riesgo y se pierde un día.',
    why:'Los datos sintéticos protegen a las personas, pero no corrigen la prioridad: los finiquitos no son un buen primer piloto.',
    obs:'Se dedicó tiempo a evaluar una herramienta para una tarea de alto riesgo antes de priorizar.'},
   {k:'risk',s:'Entregar la base',t:'Enviar la base: es solo para una demostración.',next:'B3',
    c:'Datos personales de 140 exempleados quedan en manos de un tercero sin acuerdo de tratamiento. El área de protección de datos abre un incidente.',
    why:'Compartir datos personales sin autorización ni acuerdo infringe la política de datos y la ley (Ley 21.719).',
    fx:'Se entregaron datos personales a un proveedor sin autorización ni acuerdo de tratamiento.'}]},

B2:{t:'Sin línea base',time:'Mar 2 dic · 09:00',left:'Faltan 4 días',comp:'priorizar',
  sit:`${rod('“¿Cuánto tiempo nos va a ahorrar el asistente de consultas? La gerenta lo va a preguntar.”')}<p>Nadie registró cuántas consultas llegan ni cuánto tiempo toman.</p>`,
  q:'¿Qué responde Camila?',
  opts:[
   {k:'risk',s:'Una cifra optimista',t:'“Unas 40 horas al mes”, según un artículo sobre asistentes de IA.',next:'B3',
    c:'La cifra queda escrita en la propuesta. Cuando se mida, no se va a cumplir.',
    why:'Una cifra sin medición propia compromete la credibilidad del proyecto.',
    fx:'La propuesta incluyó un ahorro sin medición propia.'},
   {k:'acc',s:'Una estimación del equipo',t:'Pedir al equipo una estimación a ojo y usarla como referencia.',next:'B3',
    c:'El equipo estima 15 horas. Es mejor que nada, pero nadie sabe si es real.',
    why:'Una estimación ayuda a empezar, pero la línea base debe medirse.',
    obs:'La línea base se estimó a ojo en vez de medirse.'},
   {k:'opt',s:'Medir y reordenar',t:'Medir esta semana horas y errores de las tareas candidatas y ubicarlas en la matriz; partir por la que resulte victoria rápida.',next:'B3',
    c:'La medición muestra que consolidar novedades toma 10 horas y tiene 6 errores al mes: es la mejor candidata. Las consultas quedan como proyecto mayor.',
    why:'Medir antes de prometer permite priorizar bien y demostrar el resultado.'}]},

A3:ASIS('Lun 1 dic · 15:00','Faltan 5 días'),
B3:ASIS('Mar 2 dic · 15:00','Faltan 4 días'),

M4:{t:'Una novedad ambigua',time:'Mié 3 dic · 10:00',left:'Faltan 3 días',comp:'flujo',
  sit:`<p>Entre las novedades de diciembre aparece una de Planta: “pagar lo mismo del mes pasado a EMP-144, más lo de la campaña”.</p>`,
  q:'¿Cómo entra esa novedad al cierre?',
  opts:[
   {k:'risk',s:'Que la IA la interprete y cargue',t:'Dejar que la IA interprete “lo de la campaña” con el historial y cargue el monto en el sistema.',next:'M5',
    c:'La IA suma un bono de campaña de otro año. EMP-144 recibe $80.000 que nadie aprobó.',
    why:'Lo ambiguo lo aclara una persona con quien lo envió. La IA no carga en el sistema oficial.',
    fx:'Se pagó un monto interpretado por la IA sin aprobación de la jefatura.'},
   {k:'opt',s:'Validar con la jefatura antes de cargar',t:'Marcarla como dudosa, pedir a la jefatura de Planta el concepto y monto aprobados, y cargarla solo con esa respuesta.',next:'M5',
    c:'La jefatura responde en una hora: es un bono de turno de $45.000. Camila lo carga con el correo como respaldo.',
    why:'Control humano antes de cargar, con evidencia registrada.'},
   {k:'acc',s:'Revisar una muestra',t:'Revisar al azar el 10 % de las novedades y cargar el resto como vienen.',next:'M5',
    c:'La novedad de EMP-144 no cae en la muestra. Por suerte, la jefatura avisa a tiempo y se corrige antes del cálculo.',
    why:'Una muestra sirve para controlar lo rutinario, pero lo que la IA marcó como dudoso se revisa siempre.',
    obs:'Las novedades marcadas como dudosas se revisaron por muestreo y no una a una.'}]},

M5:{t:'Las alertas de la IA',time:'Jue 4 dic · 11:00',left:'Faltan 2 días',comp:'flujo',
  sit:`<p>El sistema ya calculó. Los controles y la IA señalan tres alertas:</p>${ai('“1) EMP-317 aparece dos veces. 2) EMP-052 tiene horas extra 40 % sobre su promedio. 3) Los bonos bajaron 38 % respecto de noviembre.”')}`,
  q:'¿Qué hace Camila con las alertas?',
  opts:[
   {k:'opt',s:'Revisar cada alerta con evidencia',t:'Revisar cada alerta contra la fuente: corregir el duplicado en el sistema, confirmar las horas de EMP-052 con asistencia y explicar la baja de bonos.',next:'M6',
    c:'El duplicado era real y se corrige. Las horas de EMP-052 están aprobadas por un turno especial. La baja de bonos se explica por el bono anual pagado en noviembre.',
    why:'Corregir, investigar o descartar, siempre con evidencia y corrigiendo en el sistema oficial.'},
   {k:'risk',s:'Que la IA corrija sola',t:'Autorizar a la IA para que corrija automáticamente en el sistema todo lo que señaló.',next:'M6',
    c:'La IA elimina el duplicado, pero también rebaja las horas aprobadas de EMP-052. Él recibe un pago menor y reclama.',
    why:'Una alerta no es un error confirmado. Las correcciones las decide una persona con evidencia.',
    fx:'La IA corrigió registros en el sistema sin revisión, incluido un falso positivo.'},
   {k:'acc',s:'Solo la alerta de mayor monto',t:'Revisar solo el duplicado, que afecta el pago, y dejar las otras dos para enero.',next:'M6',
    c:'El duplicado se corrige. Las otras dos alertas resultan correctas, pero quedan sin explicar en la bitácora.',
    why:'Priorizar está bien, pero toda alerta se cierra con una decisión registrada antes de aprobar.',
    obs:'Dos alertas quedaron sin revisar ni registrar antes de la aprobación.'}]},

M6:{t:'La aprobación',time:'Vie 5 dic · 09:00',left:'Falta 1 día',comp:'flujo',
  sit:`<p>Todo está revisado y el archivo del banco debe enviarse hoy a las 13:00. Rodrigo está con licencia médica.</p>`,
  q:'¿Quién aprueba la nómina?',
  opts:[
   {k:'acc',s:'Esperar a Rodrigo',t:'Esperar el regreso de Rodrigo el lunes y pagar con dos días de atraso, avisando a los trabajadores.',next:'M7',
    c:'El control se mantiene, pero 422 personas reciben su sueldo tarde y llegan varias consultas.',
    why:'El control es correcto, pero el flujo necesitaba un reemplazo definido para la aprobación.',
    obs:'El flujo no tenía un reemplazo definido para aprobar y el pago se atrasó.'},
   {k:'opt',s:'Aprueba el reemplazo definido',t:'Que apruebe la subgerenta de Personas, reemplazo definido en el flujo, con el resumen de alertas y la hoja de controles.',next:'M7',
    c:'La subgerenta revisa el resumen y aprueba a las 11:30, con nombre y fecha. El pago sale a tiempo.',
    why:'Cuatro ojos con evidencia y un reemplazo definido: el control no depende de una sola persona.'},
   {k:'risk',s:'Camila aprueba sola',t:'Aprobar ella misma: conoce mejor que nadie el cierre.',next:'M7',
    c:'El pago sale a tiempo, pero sin segundo revisor. Auditoría lo detecta en la revisión trimestral.',
    why:'Quien prepara no aprueba: sin segundo revisor no hay control independiente.',
    fx:'La nómina se aprobó sin segundo revisor.'}]},

M7:{t:'¿Funcionó el piloto?',time:'Vie 5 dic · 15:00',left:'Faltan 2 horas',comp:'proyecto',
  sit:`<p>El cierre de diciembre terminó. Camila prepara los resultados para la gerencia.</p>${ai('“Puedo redactar que el piloto ahorró un 80 % del tiempo, como indican estudios del sector.”')}`,
  q:'¿Qué resultados presenta?',
  opts:[
   {k:'risk',s:'La cifra de la IA',t:'Usar el 80 % que propone la IA: suena convincente.',next:'M8',
    c:'Andrea pregunta de dónde sale el 80 %. Camila no puede respaldarlo y la gerencia pide rehacer la presentación.',
    why:'Una cifra de estudios ajenos no es un resultado propio. Se informa lo medido.',
    fx:'Se presentó a la gerencia un ahorro sin respaldo en la medición propia.'},
   {k:'acc',s:'Percepción del equipo',t:'Presentar una encuesta: al equipo le parece que el cierre fue “mucho más rápido”.',next:'M8',
    c:'La gerencia valora la percepción, pero pide cifras antes de ampliar el proyecto.',
    why:'La percepción complementa, pero la decisión necesita los indicadores medidos contra la línea base.',
    obs:'Los resultados se presentaron con percepciones y sin comparación con la línea base.'},
   {k:'opt',s:'Comparación con la línea base',t:'Mostrar la medición: consolidar novedades bajó de 10 a 3 horas y los errores, de 6 a 1, con la bitácora como respaldo.',next:'M8',
    c:'Andrea revisa las cifras y la bitácora. “Esto es lo que necesitaba ver.”',
    why:'Indicadores propios, comparados con la línea base y respaldados por la bitácora.'}]},

M8:{t:'El siguiente paso',time:'Vie 5 dic · 17:00',left:'Última decisión',comp:'proyecto',
  sit:`${ger('“Me convencieron. ¿Cómo seguimos?”')}`,
  q:'¿Qué propone Camila?',
  opts:[
   {k:'acc',s:'Todo el cierre en enero',t:'Aplicar IA a todas las etapas del cierre desde enero, con el mismo equipo.',next:'FIN',
    c:'La gerencia aprueba, pero el equipo no alcanza a documentar ni probar cada etapa. Enero será exigente.',
    why:'Escalar demasiado rápido aumenta el riesgo. Se avanza por etapas, documentando y probando.',
    obs:'Se propuso escalar a todo el cierre sin etapas ni documentación.'},
   {k:'opt',s:'Escalar por etapas, con controles',t:'Mantener el piloto, documentar el procedimiento, capacitar a un reemplazo y sumar en marzo el control de horas extra, con su propia línea base.',next:'FIN',
    c:'La gerencia aprueba el plan. El proyecto crece con controles, responsables y medición en cada etapa.',
    why:'Documentación, reemplazo y extensión gradual: el proyecto es sostenible y auditable.'},
   {k:'risk',s:'Quitar los controles',t:'Eliminar la validación de novedades: el piloto mostró que la IA casi no se equivoca.',next:'FIN',
    c:'En febrero, una novedad mal interpretada se paga sin que nadie la revise.',
    why:'Que haya pocos errores es mérito del control humano. Quitarlo devuelve el riesgo al pago.',
    fx:'Se propuso eliminar el control humano después del piloto.'}]}
};

/* ---------- Utilidades del grafo ---------- */
const memo={};
function depth(n){if(n==='FIN')return 0;if(memo[n]!=null)return memo[n];memo[n]=1+Math.max(...NODES[n].opts.map(o=>depth(o.next)));return memo[n]}
const bestOpt=n=>NODES[n].opts.findIndex(o=>o.k==='opt');
const letter=i=>'ABC'[i];
function outcome(pct){return pct>=85?{k:'clean',t:'Proyecto aprobado'}:pct>=60?{k:'obs',t:'Proyecto con observaciones'}:{k:'inc',t:'Proyecto detenido'}}
const OUT_TXT={
  clean:'El viernes 5 de diciembre la gerencia aprueba el proyecto. El piloto redujo la consolidación de novedades de 10 a 3 horas y los errores de 6 a 1, sin exponer datos y con control humano en cada punto clave. El plan sigue por etapas, documentado y medido.',
  obs:'La gerencia aprueba continuar, pero con observaciones: hubo pasos sin medición, controles parciales o un escalamiento apresurado. Camila debe ajustar el plan antes de ampliar el proyecto.',
  inc:'La gerencia detiene el proyecto: hubo pagos sin aprobación, datos expuestos o cifras sin respaldo. Antes de retomar, el equipo debe rediseñar el flujo con controles y medición.'};

/* ---------- Estado (se guarda en suspend_data mediante S.first) ---------- */
let api=null;
const fresh=(prev)=>({cur:'N1',path:[],picked:null,attempt:prev?prev.attempt+1:1,best:prev?prev.best:null,last:prev?prev.last:null});
function ST(){const f=api.S.first;if(!f.ev||!f.ev.cur)f.ev=fresh();return f.ev}
function total(path){return path.reduce((a,e)=>a+PTS[NODES[e.n].opts[e.o].k],0)}
function result(st){const pts=total(st.path),max=st.path.length*3,pct=Math.round(pts/max*100);
  const comps={};st.path.forEach(e=>{const c=NODES[e.n].comp;comps[c]=comps[c]||{p:0,m:0};comps[c].p+=PTS[NODES[e.n].opts[e.o].k];comps[c].m+=3});
  return {pts,max,pct,route:routeOf(st.path),path:st.path.map(e=>({n:e.n,o:e.o})),comps,attempt:st.attempt}}
function routeOf(path){const f=path[0];if(!f)return '';return {A3:'A',B2:'B',C2:'C'}[NODES.N1.opts[f.o].next]}

/* ---------- Render del caso ---------- */
const $=s=>document.querySelector(s);
function render(){
  const st=ST(),root=$('#evCase');if(!root)return;const n=NODES[st.cur];
  const done=st.path.length,remaining=st.picked!=null?depth(n.opts[st.picked].next):depth(st.cur),tot=done+remaining;
  const curNum=st.picked!=null?done:done+1;
  const dots=st.path.map(e=>`<i class="${NODES[e.n].opts[e.o].k}" title="${esc(NODES[e.n].t)}"></i>`).join('')+(st.picked==null?'<i class="now" title="Decisión actual"></i>':'')+Array.from({length:Math.max(0,tot-done-(st.picked==null?1:0))},()=>'<i></i>').join('');
  const pts=total(st.path),route=routeOf(st.path);
  let h=`<div class="ev-head"><div class="ev-when"><span class="clock">${n.time}</span><span class="pill warn">${n.left} para la presentación</span>${route?`<span class="pill info">${ROUTE[route]}</span>`:''}</div>
    <span class="ev-count">Decisión ${curNum} de hasta ${tot} · ${pts} pts</span>
    <div class="ev-bar" role="progressbar" aria-label="Avance del caso" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${done}"><span style="width:${Math.round(done/tot*100)}%"></span></div>
    <div class="ev-dots" aria-hidden="true">${dots}</div></div>
  <div class="ev-layout"><div class="ev-node" data-node="${st.cur}">
    <span class="eyebrow">${COMP[n.comp].t}</span>
    <h2>${n.t}</h2><div class="ev-sit">${n.sit}</div>
    <p class="ev-q">${n.q}</p>
    <div class="ev-opts" role="group" aria-label="Decisiones">${n.opts.map((o,i)=>{
      const sel=st.picked===i,cls=st.picked==null?'':sel?`sel ${o.k}`:(o.k==='opt'?'best dim':'dim');
      return `<button class="ev-opt ${cls}" type="button" data-o="${i}" ${st.picked!=null?'disabled':''} ${sel?'aria-pressed="true"':''}><span class="letter">${sel?ICON[o.k]:letter(i)}</span><span>${o.t}</span></button>`}).join('')}</div>`;
  if(st.picked!=null){const o=n.opts[st.picked],b=bestOpt(st.cur);
    h+=`<div class="ev-fb ${o.k}" tabindex="-1"><div class="ev-fb-head"><span>${ICON[o.k]} ${KIND[o.k]}</span><span class="pts">+${PTS[o.k]} de 3 pts</span></div>
      <div class="ev-fb-body"><h4>Lo que pasa</h4><p>${o.c}</p><h4>Criterio</h4><p>${o.why}</p>
      ${o.k!=='opt'?`<div class="ev-best"><b>La decisión óptima era la ${letter(b)}:</b> ${n.opts[b].s}.</div>`:''}
      <div class="ev-next" style="margin-top:12px"><button class="small-btn primary" type="button" id="evNext">${o.next==='FIN'?'Ver el desenlace →':'Continuar →'}</button></div></div></div>`}
  h+=`</div><details class="ev-exp" ${expOpen()?'open':''}><summary>🗂️ Expediente del proyecto <span class="pill info">${done}</span></summary><div class="ev-exp-body">
    ${st.path.length?st.path.map((e,i)=>{const nn=NODES[e.n],o=nn.opts[e.o];return `<div class="ev-entry ${o.k}"><span class="t">${i+1} · ${nn.time} · ${nn.t}</span><span class="d">${o.s}</span><span class="pill ${o.k==='opt'?'good':o.k==='acc'?'warn':'bad'}" style="margin-top:4px">${KIND[o.k].replace('Decisión ','')} · +${PTS[o.k]}</span></div>`}).join('')
      :'<p class="ev-empty">Aquí quedarán registradas tus decisiones, como en un registro de control.</p>'}
    <div class="ev-total">Puntaje: ${pts} de ${done*3} pts posibles hasta ahora</div></div></details></div>`;
  root.innerHTML=h;
  root.querySelectorAll('.ev-opt').forEach(b=>b.addEventListener('click',()=>choose(+b.dataset.o)));
  const nx=root.querySelector('#evNext');if(nx)nx.addEventListener('click',advance);
  const ex=root.querySelector('.ev-exp');if(ex)ex.addEventListener('toggle',()=>{expState=ex.open});
}
let expState=null;
const expOpen=()=>expState!=null?expState:window.innerWidth>1180;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function choose(i){const st=ST();if(st.picked!=null)return;st.picked=i;st.path.push({n:st.cur,o:i});api.done('dec');render();
  const fb=document.querySelector('.ev-fb');if(fb){fb.scrollIntoView({behavior:'smooth',block:'nearest'});fb.focus({preventScroll:true})}}
function advance(){const st=ST();const nx=NODES[st.cur].opts[st.picked].next;
  if(nx==='FIN'){const r=result(st);st.last=r;if(!st.best||r.pct>=st.best.pct)st.best=r;st.cur='END';st.picked=null;api.done('fin');document.getElementById('nextBtn').click();return}
  st.cur=nx;st.picked=null;api.done('dec');render();const c=document.getElementById('evCase');if(c)c.scrollIntoView({behavior:'smooth',block:'start'})}
function restart(){const old=ST();api.S.first.ev=fresh(old);api.S.done.delete('fin');api.done('retry');render();api.go(2)}

/* ---------- Pantalla final ---------- */
function report(){const st=api.S.first.ev,el=$('#evReport');if(!el)return;
  if(!st||!st.last){el.innerHTML=`<h2>Aún no completas el caso</h2><p>Recorre el caso hasta el desenlace para ver tu puntaje.</p><button class="small-btn primary" type="button" id="evGo">Ir al caso →</button>`;
    $('#evGo').addEventListener('click',()=>api.go(2));return}
  const r=st.last,oc=outcome(r.pct),pass=r.pct>=70,col=oc.k==='clean'?'var(--good)':oc.k==='obs'?'var(--amber)':'var(--bad)';
  const fx=r.path.map(e=>NODES[e.n].opts[e.o]).filter(o=>o.k==='risk'&&o.fx).map(o=>o.fx);
  const obs=r.path.map(e=>NODES[e.n].opts[e.o]).filter(o=>o.k==='acc'&&o.obs).map(o=>o.obs);
  const inProgress=st.cur!=='END';
  el.innerHTML=`<h2>${oc.t}</h2>
  ${inProgress?`<div class="story" style="margin-top:6px">Tienes un intento en curso (intento ${st.attempt}). Aquí ves el resultado de tu último intento completado.</div>`:''}
  <div class="ev-outcome ${oc.k}"><div class="ev-ring" style="background:conic-gradient(${col} ${r.pct*3.6}deg,var(--track) 0)"><span>${r.pct}%</span></div>
    <div><h3>${oc.t} · ${r.pts} de ${r.max} puntos</h3><p>${OUT_TXT[oc.k]}</p>
    ${fx.length?`<p style="margin-top:8px"><b>Lo que causó el incidente o el riesgo:</b></p><ul>${fx.map(t=>`<li>${t}</li>`).join('')}</ul>`:''}
    ${obs.length?`<p style="margin-top:8px"><b>Observaciones de auditoría:</b></p><ul>${obs.map(t=>`<li>${t}</li>`).join('')}</ul>`:''}</div></div>
  <div class="report" style="text-align:left">
    <div class="metric"><div class="big">${r.pct}%</div><small>Nota del intento ${r.attempt} (${r.pts} de ${r.max} pts)</small></div>
    <div class="metric"><div class="big" style="color:${pass?'var(--good)':'var(--bad)'}">${pass?'Aprobado':'No aprobado'}</div><small>Aprobación con 70 %</small></div>
    <div class="metric"><div class="big">${st.best?st.best.pct:r.pct}%</div><small>Mejor intento (nota registrada en Moodle)</small></div>
  </div>
  <h3 style="margin-top:20px">Ruta recorrida · ${ROUTE[r.route]}</h3>
  <div class="ev-route">${r.path.map((e,i)=>{const o=NODES[e.n].opts[e.o];return `${i?'<span class="arr">→</span>':''}<span class="n ${o.k}" title="${esc(KIND[o.k])}">${i+1}. ${NODES[e.n].t}</span>`}).join('')}<span class="arr">→</span><span class="n">${oc.t}</span></div>
  <div class="tblwrap"><table class="ev-steps"><thead><tr><th>#</th><th>Momento</th><th>Tu decisión</th><th class="hide-m">Tipo</th><th>Pts</th></tr></thead><tbody>
  ${r.path.map((e,i)=>{const nn=NODES[e.n],o=nn.opts[e.o];return `<tr><td>${i+1}</td><td><b>${nn.t}</b><br/><small>${nn.time}</small></td><td>${o.s}${o.k!=='opt'?`<br/><small>Óptima: ${nn.opts[bestOpt(e.n)].s}</small>`:''}</td><td class="hide-m"><span class="pill ${o.k==='opt'?'good':o.k==='acc'?'warn':'bad'}">${KIND[o.k].replace('Decisión ','')}</span></td><td class="p">${PTS[o.k]} / 3</td></tr>`}).join('')}
  </tbody></table></div>
  <h3 style="margin-top:20px">Retroalimentación por competencia</h3>
  ${Object.keys(COMP).filter(c=>r.comps[c]).map(c=>{const v=r.comps[c],p=Math.round(v.p/v.m*100),lv=p>=85?'hi':p>=60?'mid':'lo';
    const lab={hi:['good','Logrado'],mid:['warn','En desarrollo'],lo:['bad','Por reforzar']}[lv];
    return `<div class="ev-comp"><div class="top"><b>${COMP[c].t}</b><small>${v.p} de ${v.m} pts</small><span class="pill ${lab[0]}">${lab[1]} · ${p}%</span></div>
      <div class="ev-cbar"><span style="width:${p}%;background:${lv==='hi'?'var(--good)':lv==='mid'?'var(--amber)':'var(--bad)'}"></span></div><p>${COMP[c][lv]}</p></div>`}).join('')}
  <div class="completion-actions" style="justify-content:flex-start"><button class="small-btn primary" type="button" id="evRetry">↺ Reintentar el caso</button>${inProgress?'<button class="small-btn" type="button" id="evResume">Volver al intento en curso</button>':''}</div>`;
  $('#evRetry').addEventListener('click',restart);
  const rs=$('#evResume');if(rs)rs.addEventListener('click',()=>api.go(2));
}

Object.assign(window.LESSON,{
  pass:0.7,
  nodes:NODES,
  score(){const st=api&&api.S.first.ev;return st&&st.best?st.best.pct:0},
  report,
  init(a){api=a;
    document.getElementById('startLab').addEventListener('click',()=>{api.done('start');document.getElementById('nextBtn').click()});
    const show=()=>{const st=ST();if(st.cur==='END'){/* caso terminado: se muestra el último nodo como resumen */renderDone()}else render()};
    function renderDone(){const st=ST(),root=$('#evCase');root.innerHTML=`<span class="lab-badge">Caso completado</span><h2>Llegaste al desenlace</h2><p>Revisa tu resultado en la pantalla siguiente o vuelve a recorrer el caso tomando otras decisiones.</p><div class="completion-actions" style="justify-content:flex-start"><button class="small-btn primary" type="button" id="evSee">Ver el desenlace →</button><button class="small-btn" type="button" id="evAgain">↺ Reintentar el caso</button></div>`;
      $('#evSee').addEventListener('click',()=>{api.S.max=Math.max(api.S.max,3);api.go(3)});$('#evAgain').addEventListener('click',restart)}
    window.LESSON._show=show;
    show();setTimeout(show,0); /* tras restaurar suspend_data */
    /* re-render al entrar en la pantalla del caso */
    const caseSlide=document.getElementById('evCase').closest('section');
    new MutationObserver(()=>{if(caseSlide.classList.contains('active'))show()}).observe(caseSlide,{attributes:true,attributeFilter:['class']});
  }
});
})();
