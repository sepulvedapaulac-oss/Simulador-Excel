/* Evaluación final del Módulo 3 · Caso ramificado "La gerencia necesita respuestas"
   Motor de ramificación propio: cada nodo tiene una situación, tres decisiones con puntaje
   (óptima 3 · aceptable 2 · riesgosa 0), consecuencia narrada y nodo siguiente propio.
   Nota SCORM = puntaje acumulado / máximo posible de la ruta recorrida (mejor intento). */
(function(){
const PTS={opt:3,acc:2,risk:0};
const KIND={opt:'Decisión óptima',acc:'Decisión aceptable',risk:'Decisión riesgosa'};
const ICON={opt:'✓',acc:'◐',risk:'✕'};
const COMP={
  datos:{t:'Preparación de datos',
    hi:'Preparas una base limpia, mínima y cuadrada con el sistema antes de analizar, y reaccionas bien ante un problema de datos.',
    mid:'Cuidas los datos, pero dejas diferencias sin resolver o pasos incompletos. Cuadra siempre conteo y totales antes de analizar (lección 3.1).',
    lo:'Analizaste con una base sin cuadrar o con datos que no correspondían. Repasa la preparación, protección y cuadratura de datos (lección 3.1).'},
  analisis:{t:'Análisis de variaciones',
    hi:'Descompones la variación en efectos que suman el total y verificas cada conclusión de la IA con tus cálculos.',
    mid:'Revisas las conclusiones, pero delegas parte de la verificación en la propia IA. Calcula los efectos y la participación por área tú (lección 3.2).',
    lo:'Aceptaste conclusiones de la IA sin calcular. Un informe fluido no es un análisis verificado (lección 3.2).'},
  visual:{t:'Indicadores y gráficos',
    hi:'Eliges indicadores con fórmula y gráficos honestos: eje en cero, título con conclusión y fuente.',
    mid:'Corriges parte de los problemas, pero quedan elementos que distraen o indicadores sin explicar. Repasa las trampas de los gráficos (lección 3.3).',
    lo:'Publicaste gráficos o indicadores que exageran o contradicen los datos. Repasa la lección 3.3.'},
  informe:{t:'Informe ejecutivo y validación',
    hi:'Revisas el borrador frase por frase, separas hechos de hipótesis y envías con segunda lectura y trazabilidad.',
    mid:'Mejoras el borrador, pero dejas afirmaciones sin respaldo o validas a medias. Usa el checklist de envío (lección 3.4).',
    lo:'Enviaste afirmaciones erróneas o sin respaldo. La IA redacta; tú respondes por cada frase (lección 3.4).'}
};
const ROUTE={A:'Ruta A · Base preparada',B:'Ruta B · Datos a medias',C:'Ruta C · Incidente de datos'};
const ai=(t)=>`<div class="ev-msg ev-ai"><span class="avatar">IA</span><div><span class="who">Asistente corporativo</span><p>${t}</p></div></div>`;
const person=(who,t,cls='mgr',ini='R')=>`<div class="ev-msg"><span class="avatar ${cls}">${ini}</span><div><span class="who">${who}</span><p>${t}</p></div></div>`;
const ger=t=>person('Andrea Rivas · gerenta general',t,'mgr','A');
const ANALISIS=(time,left)=>({t:'La conclusión de la IA',time,left,comp:'analisis',
  sit:`<p>Con la base lista, pides al asistente corporativo un primer análisis de la variación.</p>${ai('“El costo subió 8,0 % ($39,9 M), explicado principalmente por el reajuste de 2 % aplicado en octubre.”')}<p>En la carpeta de novedades de octubre hay un bono anual de cumplimiento aprobado.</p>`,
  q:'¿Qué haces con esa conclusión?',
  opts:[
   {k:'opt',s:'Descomponer la variación en efectos',t:'Calcular los efectos de dotación, reajuste, horas extra y bonos, y comprobar que sumen los $39,9 M.',next:'M4',
    c:'Los efectos suman exactamente $39,9 M: bonos +$18,6 M (bono anual), reajuste +$9,2 M, dotación +$8,8 M y horas extra +$3,2 M. El reajuste explica solo el 23 %.',
    why:'Una conclusión se verifica con una descomposición que cuadre con el total. Así se detecta que la causa principal es un pago único.'},
   {k:'acc',s:'Pedir a la IA que revise su cálculo',t:'Pedirle al asistente que “revise si el reajuste es la causa principal” y usar su segunda respuesta.',next:'M4',
    c:'La IA corrige y menciona los bonos, pero sin cifras que sumen el total. Tienes una conclusión más cercana, pero no verificada por ti.',
    why:'La IA puede mejorar su respuesta, pero no es una verificación. La descomposición con tus fórmulas es la que respalda el informe.',
    obs:'La causa principal del alza se aceptó sin una descomposición propia que cuadrara con el total.'},
   {k:'risk',s:'Aceptar la conclusión',t:'Aceptarla: el reajuste es conocido por todos y la explicación suena razonable.',next:'M4',
    c:'El informe atribuirá el alza al reajuste, que es permanente. La gerencia podría recortar presupuesto pensando que el costo seguirá 8 % arriba.',
    why:'El reajuste explica $9,2 M de $39,9 M. La causa principal es el bono anual, un pago único: la decisión de la gerencia cambia por completo.',
    fx:'El informe atribuyó el alza al reajuste, cuando la causa principal era un pago único.'}]});
const NODES={
N1:{t:'¿Con qué base partes?',time:'Lun 3 nov · 09:00',left:'Faltan 2 días',comp:'datos',
  sit:`${ger('“Necesito entender por qué subimos 8 % en octubre. Quiero un informe y un tablero para el miércoles a las 12:00.”')}<p>Tienes la exportación completa del sistema (38 columnas, con RUT y diagnósticos de licencias) y un resumen por área que Finanzas envió el viernes.</p>`,
  q:'¿Cómo preparas la información para el análisis?',
  opts:[
   {k:'risk',s:'Exportación completa al asistente corporativo',t:'Subir la exportación completa al asistente corporativo: está autorizado, así que no importa qué columnas lleve.',next:'C2',
    c:'La carga incluye RUT, cuentas bancarias y diagnósticos de 420 personas. A media mañana, el encargado de datos detecta la carga en el registro de uso.',
    why:'Una herramienta autorizada no elimina la obligación de minimizar: el análisis no necesita identificadores ni datos de salud (Ley 21.719).',
    fx:'Se cargaron datos personales y sensibles innecesarios en el asistente corporativo.'},
   {k:'opt',s:'Base limpia, mínima y cuadrada',t:'Preparar una base con código, área, período, conceptos y estado; agregar Finanzas en “Otras áreas”, limpiar duplicados y cuadrar conteo y total con el sistema.',next:'A3',
    c:'Al cuadrar aparecen dos ingresos del 28 de octubre que la exportación omitía. Con 420 registros y $537,9 M, la base cuadra con el sistema.',
    why:'Pregunta clara, datos mínimos, grupos pequeños agregados y cuadratura: la base es confiable antes de entregarla a la IA.'},
   {k:'acc',s:'Usar el resumen de Finanzas',t:'Usar directamente el resumen por área que envió Finanzas: ya está agregado y no tiene datos personales.',next:'B2',
    c:'El resumen protege los datos, pero no sabes cómo se armó. Al revisarlo el martes, no cuadra con el sistema.',
    why:'Agregar protege, pero una base de terceros se cuadra antes de usarla. Ganas tiempo hoy y lo pierdes mañana.',
    obs:'Se partió de un resumen de terceros sin cuadrarlo con el sistema.'}]},

C2:{t:'Contener el problema',time:'Lun 3 nov · 11:30',left:'Faltan 2 días',comp:'datos',
  sit:`${person('Encargado de datos','“Vi que cargaste la exportación completa, con RUT y diagnósticos, al asistente. ¿Qué vas a hacer?”','ia','E')}<p>El análisis aún no empieza y la entrega es el miércoles.</p>`,
  q:'¿Cómo respondes?',
  opts:[
   {k:'opt',s:'Detener, reportar y rehacer con datos mínimos',t:'Dejar de usar esa conversación, registrar el incidente según el protocolo y rehacer la base mínima, agregada y cuadrada.',next:'B3',
    c:'El encargado registra el incidente y solicita eliminar la conversación. A las 16:00 tienes la base mínima cuadrada, con medio día de retraso.',
    why:'Contener, reportar y corregir el proceso es la respuesta correcta ante un incidente con datos personales.'},
   {k:'acc',s:'Borrar columnas en la misma conversación',t:'Pedirle al asistente que “ignore” las columnas sensibles y seguir trabajando en la misma conversación.',next:'B3',
    c:'Los datos ya fueron cargados y quedan en el historial. El análisis continúa, pero el incidente no se registra formalmente.',
    why:'Pedir a la IA que ignore datos no los elimina. El incidente debe registrarse y la base rehacerse con datos mínimos.',
    obs:'El incidente de datos no se registró formalmente y la conversación siguió con datos sensibles.'},
   {k:'risk',s:'Seguir: la herramienta es corporativa',t:'Responder que no hay problema porque el asistente está autorizado, y continuar.',next:'B3',
    c:'El encargado escala el caso a la gerencia. El informe del miércoles llega con una nota de incumplimiento de la política de datos.',
    why:'Autorizada no significa que todo dato pueda cargarse. La minimización y la proporcionalidad aplican siempre.',
    fx:'Se mantuvieron datos sensibles en el asistente después de detectar el incidente.'}]},

B2:{t:'El resumen no cuadra',time:'Mar 4 nov · 09:00',left:'Falta 1 día',comp:'datos',
  sit:`<p>El resumen de Finanzas suma 418 personas y $531,2 M. El sistema informa 420 personas y $537,9 M para octubre.</p>${person('Rodrigo · jefe de Compensaciones','“La diferencia es chica. ¿Seguimos igual para llegar al miércoles?”')}`,
  q:'¿Qué haces con la diferencia?',
  opts:[
   {k:'opt',s:'Buscar la diferencia y cuadrar',t:'Rehacer la base desde el sistema, encontrar los dos registros faltantes y cuadrar conteo y total antes de analizar.',next:'B3',
    c:'Los faltantes son dos ingresos del 28 de octubre ($6,7 M). Con la base cuadrada, el análisis empieza a las 11:00.',
    why:'Los registros faltantes podían explicar parte de la variación. La cuadratura va antes que el análisis.'},
   {k:'acc',s:'Anotar la diferencia y seguir',t:'Seguir con el resumen y agregar una nota al pie: “diferencia de 2 personas con el sistema”.',next:'B3',
    c:'El análisis se hace sobre una base incompleta. La nota alerta, pero $6,7 M de la variación quedan sin explicar.',
    why:'Transparentar la diferencia es mejor que ocultarla, pero un análisis sobre una base sin cuadrar puede atribuir mal las causas.',
    obs:'El análisis se hizo sobre una base que no cuadraba con el sistema.'},
   {k:'risk',s:'Pedir a la IA que estime lo que falta',t:'Pedirle al asistente que estime los dos registros faltantes para completar la base.',next:'B3',
    c:'La IA inventa dos registros “promedio”. La base parece cuadrar, pero con datos ficticios dentro.',
    why:'La IA no sabe qué falta: cualquier estimación es inventada y contamina todo el análisis.',
    fx:'Se completó la base con registros estimados por la IA.'}]},

A3:ANALISIS('Lun 3 nov · 15:00','Faltan 2 días'),
B3:ANALISIS('Mar 4 nov · 11:30','Falta 1 día'),

M4:{t:'¿Qué área explica el alza?',time:'Mar 4 nov · 15:00',left:'Falta 1 día',comp:'analisis',
  sit:`${ai('“Ventas es el área que más explica el alza: aporta más de la mitad del aumento. Planta subió poco.”')}<p>Costo por área (miles $), septiembre → octubre: Ventas 150.200 → 159.800 · Operaciones 120.400 → 128.900 · Planta 110.300 → 125.700 · Bodega 62.100 → 64.300 · Otras 55.000 → 59.180.</p>`,
  q:'¿Qué concluyes?',
  opts:[
   {k:'risk',s:'Aceptar que Ventas explica la mitad',t:'Aceptar la conclusión: Ventas es el área más grande.',next:'M5',
    c:'El informe pondrá el foco en Ventas, que aporta solo el 24 %. Las horas extra de Planta quedan fuera de la conversación.',
    why:'La IA confundió nivel con cambio: Ventas es la más grande, pero Planta es la que más varió.',
    fx:'El informe atribuyó el alza a Ventas, cuando Planta aportaba la mayor parte.'},
   {k:'opt',s:'Calcular la participación por área',t:'Calcular variación absoluta, porcentual y participación de cada área en la variación total, comprobando que sumen 100 %.',next:'M5',
    c:'Planta aporta el 38,6 % (+$15,4 M, +14,0 %), Ventas el 24,1 % y Operaciones el 21,3 %. La conclusión de la IA era un error.',
    why:'La participación en la variación responde “dónde” con precisión y se verifica con una suma de control.'},
   {k:'acc',s:'Informar las variaciones porcentuales',t:'Informar solo la variación porcentual de cada área, sin participación ni montos.',next:'M5',
    c:'Planta aparece con +14 %, pero sin montos la gerencia no dimensiona cuánto aporta cada área al total.',
    why:'El porcentaje compara áreas, pero sin monto ni participación no explica el total. Faltó la mitad del análisis.',
    obs:'Las áreas se compararon solo con porcentajes, sin montos ni participación.'}]},

M5:{t:'El gráfico del tablero',time:'Mar 4 nov · 17:00',left:'Falta 1 día',comp:'visual',
  sit:`<p>La IA propone el gráfico principal: barras en 3D de colores distintos, eje vertical desde 300 horas y el título “Gráfico 1”. Planta parece tener casi cuatro veces las horas de Ventas.</p>${person('Rodrigo · jefe de Compensaciones','“Me gusta, se nota el problema de Planta.”')}`,
  q:'¿Qué haces con el gráfico?',
  opts:[
   {k:'acc',s:'Corregir solo el eje',t:'Mantener las barras en 3D y los colores, pero hacer partir el eje en cero.',next:'M6',
    c:'La proporción ahora es correcta, pero el 3D y los colores siguen dificultando la lectura. Falta título y fuente.',
    why:'El eje era el problema más grave, pero un gráfico honesto también es claro: barras planas, acento, título con conclusión y fuente.',
    obs:'El gráfico principal mantuvo efectos 3D y no indicó fuente ni período.'},
   {k:'risk',s:'Dejarlo así para mostrar el problema',t:'Dejarlo así: exagera, pero ayuda a que la gerencia tome en serio a Planta.',next:'M6',
    c:'En la reunión, la gerenta pregunta por qué Planta “cuadruplica” a Ventas. Al revisar, el gráfico pierde credibilidad y con él todo el tablero.',
    why:'Un gráfico informa; no convence. Exagerar daña la confianza en todo el análisis.',
    fx:'Se presentó un gráfico con el eje truncado que exageraba las diferencias.'},
   {k:'opt',s:'Rehacerlo honesto',t:'Barras planas de un color con Planta destacada, eje en cero, título con la conclusión y fuente con período.',next:'M6',
    c:'“Planta concentra el 32 % de las horas extra de octubre. Fuente: asistencia aprobada, octubre 2026.” Se lee en segundos.',
    why:'Eje en cero, un color de acento, título con la idea y fuente: el gráfico es claro y verificable.'}]},

M6:{t:'Un indicador sospechoso',time:'Mié 5 nov · 08:30',left:'Faltan 3 horas y media',comp:'visual',
  sit:`${ai('“Indicador destacado: el costo por trabajador bajó en octubre gracias a los nuevos ingresos.”')}<p>Septiembre: $498,0 M y 412 personas. Octubre: $537,9 M y 420 personas.</p>`,
  q:'¿Qué haces con ese indicador?',
  opts:[
   {k:'opt',s:'Recalcularlo y explicarlo',t:'Recalcular el costo promedio por persona y mostrar que subió, explicando que el bono anual lo infla este mes.',next:'M7',
    c:'Subió de $1,21 M a $1,28 M por persona. Con el bono anual explicado, el indicador cuenta la historia correcta.',
    why:'Cada indicador se verifica con su fórmula: costo total / dotación. La IA afirmó lo contrario de lo que dicen los datos.'},
   {k:'acc',s:'Quitarlo del tablero',t:'Quitar el indicador del tablero para no arriesgarse.',next:'M7',
    c:'El tablero queda sin errores, pero pierde un indicador útil que la gerencia suele preguntar.',
    why:'Evitar el error es mejor que publicarlo, pero lo correcto era recalcularlo: es un indicador clave.',
    obs:'Se eliminó un indicador clave en lugar de recalcularlo.'},
   {k:'risk',s:'Publicarlo',t:'Publicarlo: es una buena noticia para la gerencia.',next:'M7',
    c:'La gerenta lo menciona en el comité. Finanzas lo contradice con sus propias cifras.',
    why:'537,9 / 420 = 1,28 y 498,0 / 412 = 1,21: subió. Publicar sin verificar daña la credibilidad del área.',
    fx:'Se publicó un indicador que contradecía los datos.'}]},

M7:{t:'El borrador del informe',time:'Mié 5 nov · 10:00',left:'Faltan 2 horas',comp:'informe',
  sit:`<p>El borrador de la IA está bien redactado, pero incluye: “las horas extra de Planta subieron por mala planificación de la jefatura” y “según la Circular N.º 3.214 de la Dirección del Trabajo, estas variaciones son normales”.</p>`,
  q:'¿Cómo editas el borrador?',
  opts:[
   {k:'opt',s:'Editar frase por frase',t:'Reemplazar el juicio por hechos y una hipótesis marcada (“pedido especial, por confirmar con Operaciones”), eliminar la circular no verificada y revisar cada cifra con la base.',next:'M8',
    c:'El informe queda con hechos cuantificados, hipótesis marcadas y sin referencias inventadas.',
    why:'Hechos con cifras, causas con fuente o marcadas como hipótesis, y ninguna referencia sin verificar.'},
   {k:'acc',s:'Suavizar el tono',t:'Cambiar “mala planificación” por “posibles problemas de planificación” y dejar la circular.',next:'M8',
    c:'El tono mejora, pero sigue siendo un juicio sin evidencia y la circular no existe.',
    why:'Suavizar no corrige: el juicio sigue sin respaldo y la referencia sigue sin verificar.',
    obs:'El informe mantuvo una referencia normativa no verificada y un juicio sin evidencia.'},
   {k:'risk',s:'Enviar el borrador tal cual',t:'Dejarlo así: está bien escrito y la circular le da autoridad.',next:'M8',
    c:'La jefa de Planta reclama por el juicio sobre su equipo y Legal no encuentra la circular citada.',
    why:'Un borrador fluido no es un informe verificado. La IA puede inventar referencias con apariencia oficial.',
    fx:'El informe incluyó un juicio sobre personas y una referencia normativa inexistente.'}]},

M8:{t:'La presión del envío',time:'Mié 5 nov · 11:30',left:'Falta media hora',comp:'informe',
  sit:`${person('Rodrigo · jefe de Compensaciones','“No hay tiempo para que otro lo lea. Envíalo ya.”')}<p>Nadie más ha revisado el informe. La gerenta pidió una recomendación concreta para noviembre.</p>`,
  q:'¿Cómo cierras la entrega?',
  opts:[
   {k:'risk',s:'Enviar prometiendo volver a septiembre',t:'Enviarlo ya, con la recomendación: “noviembre volverá al nivel de septiembre ($498 M)”.',next:'FIN',
    c:'En noviembre el costo llega a $519 M: los ingresos y el reajuste eran permanentes. La gerencia pide explicaciones.',
    why:'Sin el bono anual, noviembre se estima cerca de $519 M (+4 %). Una promesa sin supuestos explícitos se convierte en un error.',
    fx:'Se envió una proyección errónea sin segunda lectura.'},
   {k:'acc',s:'Enviar y pedir revisión después',t:'Enviarlo ya con la recomendación de presupuestar $519 M, y pedirle a Rodrigo que lo lea después.',next:'FIN',
    c:'La recomendación es correcta, pero una cifra del tablero tenía un error de tipeo que nadie vio antes del envío.',
    why:'La segunda lectura sirve antes de enviar, no después.',
    obs:'El informe se envió sin segunda lectura previa.'},
   {k:'opt',s:'Diez minutos de cuatro ojos y envío trazable',t:'Leerlo con Rodrigo contra la tabla de efectos, enviarlo con la recomendación de presupuestar $519 M y confirmar las horas extra con Operaciones, y guardar la versión enviada con la base.',next:'FIN',
    c:'Rodrigo detecta un error de tipeo en el tablero y lo corrigen. El informe llega a las 11:55, verificado y con respaldo.',
    why:'Segunda lectura, recomendación con supuestos explícitos y trazabilidad: el informe resiste cualquier pregunta.'}]}
};

/* ---------- Utilidades del grafo ---------- */
const memo={};
function depth(n){if(n==='FIN')return 0;if(memo[n]!=null)return memo[n];memo[n]=1+Math.max(...NODES[n].opts.map(o=>depth(o.next)));return memo[n]}
const bestOpt=n=>NODES[n].opts.findIndex(o=>o.k==='opt');
const letter=i=>'ABC'[i];
function outcome(pct){return pct>=85?{k:'clean',t:'Informe sólido'}:pct>=60?{k:'obs',t:'Informe con observaciones'}:{k:'inc',t:'Informe con errores'}}
const OUT_TXT={
  clean:'El miércoles 5 de noviembre a las 12:00 la gerenta Andrea Rivas recibe un informe breve y verificado: la base cuadra con el sistema, el alza de 8,0 % ($39,9 M) está descompuesta en dotación, reajuste, horas extra y bonos, y el tablero muestra los indicadores sin trampas visuales. Gerencia presupuesta noviembre con esas cifras.',
  obs:'El informe llega a tiempo y la conclusión principal es correcta, pero gerencia pide aclaraciones: hay cifras sin respaldo, algún gráfico confuso o hipótesis presentadas como hechos. Camila debe enviar una versión corregida.',
  inc:'El informe llega con errores: cifras que no cuadran con el sistema, una causa atribuida al área equivocada o datos personales expuestos. Gerencia toma una decisión de presupuesto sobre información incorrecta y pide rehacer el análisis.'};

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
  let h=`<div class="ev-head"><div class="ev-when"><span class="clock">${n.time}</span><span class="pill warn">${n.left} para la entrega</span>${route?`<span class="pill info">${ROUTE[route]}</span>`:''}</div>
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
  h+=`</div><details class="ev-exp" ${expOpen()?'open':''}><summary>🗂️ Expediente del informe <span class="pill info">${done}</span></summary><div class="ev-exp-body">
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
