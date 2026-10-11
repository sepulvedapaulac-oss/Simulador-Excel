/* Evaluación final del Módulo 2 · Caso ramificado "Cierre de remuneraciones bajo revisión"
   Motor de ramificación propio: cada nodo tiene una situación, tres decisiones con puntaje
   (óptima 3 · aceptable 2 · riesgosa 0), consecuencia narrada y nodo siguiente propio.
   Nota SCORM = puntaje acumulado / máximo posible de la ruta recorrida (mejor intento). */
(function(){
const PTS={opt:3,acc:2,risk:0};
const KIND={opt:'Decisión óptima',acc:'Decisión aceptable',risk:'Decisión riesgosa'};
const ICON={opt:'✓',acc:'◐',risk:'✕'};
const COMP={
  datos:{t:'Preparación de datos',
    hi:'Preparas la información con criterio: herramienta autorizada, datos mínimos con códigos y cuadratura antes de usar IA.',
    mid:'Cuidas los datos, pero aún pierdes tiempo o dejas la preparación incompleta. Planifica la tabla mínima y su cuadratura desde el inicio.',
    lo:'Expusiste más datos de los necesarios o usaste una herramienta no autorizada. Repasa los datos mínimos y el uso responsable (lecciones 1.4 y 2.1).'},
  formulas:{t:'Fórmulas de control',
    hi:'Pruebas cada fórmula con casos conocidos antes de copiarla, y detectas cuando la IA propone una lógica equivocada.',
    mid:'Revisas las fórmulas, pero delegas parte de la verificación en la propia IA. Prueba siempre con un caso que debería dar VERDADERO y otro que debería dar FALSO (lección 2.2).',
    lo:'Aplicaste fórmulas sin probarlas. Una fórmula sugerida por IA es un borrador: pruébala con casos conocidos y casos borde (lección 2.2).'},
  alertas:{t:'Tratamiento de alertas de IA',
    hi:'Tratas cada alerta como una hipótesis: la clasificas en corregir, investigar o descartar y la contrastas con la fuente.',
    mid:'Atiendes las alertas, pero sin evidencia completa o dejando casos abiertos. Clasifica todas y respalda cada decisión (lección 2.3).',
    lo:'Aceptaste o aplicaste alertas sin verificarlas, o pediste a la IA que corrigiera. La IA señala y tú verificas; el sistema calcula (lección 2.3).'},
  validacion:{t:'Validación y documentación',
    hi:'Validas antes de cerrar y dejas un registro de control que cualquiera puede auditar.',
    mid:'Validas parcialmente o documentas poco. Completa los controles finales y registra decisión, evidencia y responsable (lección 2.4).',
    lo:'Cerraste sin validar o sin dejar registro. Repasa la secuencia de validación y el registro de control (lección 2.4).'}
};
const ROUTE={A:'Ruta A · Revisión preparada',B:'Ruta B · Contra el reloj',C:'Ruta C · Incidente de datos'};
const ai=(t)=>`<div class="ev-msg ev-ai"><span class="avatar">IA</span><div><span class="who">Asistente de IA</span><p>${t}</p></div></div>`;
const person=(who,t,cls='mgr',ini='R')=>`<div class="ev-msg"><span class="avatar ${cls}">${ini}</span><div><span class="who">${who}</span><p>${t}</p></div></div>`;

/* ---------- Mapa de nodos ---------- */
const NODES={
N1:{t:'¿Qué datos subimos y dónde?',time:'28 oct · 09:00',left:'Faltan 2 días',comp:'datos',
  sit:`<p>La exportación completa del sistema trae 38 columnas: nombre, RUT, dirección, cuenta bancaria, AFP, salud, diagnósticos de licencias médicas y todos los haberes y descuentos. Un colega te dice que con un chatbot gratuito “lo resuelves en diez minutos”.</p>${person('Rodrigo','“Parte cuando quieras. Lo importante es que no se nos escape nada.”')}`,
  q:'¿Cómo empiezas la revisión con IA?',
  opts:[
   {k:'risk',s:'Exportación completa en un chatbot gratuito',t:'Pegar la exportación completa en el chatbot gratuito, que es más rápido, y pedirle que revise todo.',next:'C2',
    c:'El archivo con nombres, RUT, cuentas bancarias y diagnósticos de 420 personas queda en un servicio externo sin acuerdo de tratamiento de datos. A los veinte minutos, el área de TI detecta la carga y llama a Rodrigo.',
    why:'Las herramientas gratuitas personales no están autorizadas y los diagnósticos son datos sensibles. Con la Ley 21.719 la minimización y la seguridad de los datos son obligaciones, no buenas prácticas opcionales.',
    fx:'Datos personales y sensibles de 420 trabajadores quedaron en una herramienta no autorizada.'},
   {k:'opt',s:'Tabla mínima con códigos en el asistente corporativo',t:'Preparar una tabla mínima: código EMP-001…, área, concepto y monto de cada haber y descuento. Sin nombre, RUT, cuenta ni diagnósticos. Usarla solo en el asistente corporativo autorizado.',next:'A3',
    c:'En cuarenta minutos tienes una base de 1.940 filas, una por concepto, identificadas solo con códigos. Rodrigo la revisa y te da luz verde para trabajar con el asistente corporativo.',
    why:'Herramienta autorizada más datos mínimos: la IA recibe solo lo necesario para la tarea y la tabla de equivalencias de códigos queda dentro de AndesCorp.'},
   {k:'acc',s:'Esperar confirmación antes de usar IA',t:'No subir nada todavía: preguntarle a Rodrigo qué herramienta y qué datos están permitidos, y esperar su respuesta.',next:'B2',
    c:'Rodrigo está en reuniones toda la mañana y responde a las 13:00. No hubo riesgo para los datos, pero perdiste la mañana y ahora trabajas contra el reloj.',
    why:'Preguntar es seguro, pero el criterio ya lo conocías: asistente corporativo y datos mínimos. Esperar sin preparar nada consume el tiempo que necesitas para validar.',
    obs:'Se perdió media jornada esperando una autorización que ya estaba definida en la política.'}]},

C2:{t:'Contener el problema',time:'28 oct · 09:40',left:'Faltan 2 días',comp:'datos',
  sit:`${person('Rodrigo','“TI me avisa que subiste la planilla completa a un chatbot externo. ¿Qué hacemos ahora?”')}<p>El archivo ya está en el servicio externo. La revisión del cierre sigue pendiente.</p>`,
  q:'¿Qué haces?',
  opts:[
   {k:'acc',s:'Borrar el chat y avisar solo a Rodrigo',t:'Borrar la conversación del chatbot, explicarle verbalmente a Rodrigo lo que pasó y seguir con la revisión.',next:'B3',
    c:'Rodrigo agradece la franqueza, pero no queda registro del incidente ni se activa el protocolo. Semanas después, auditoría pregunta por la carga detectada por TI y no hay documentación.',
    why:'Reconocer el error está bien, pero un incidente con datos personales debe registrarse y escalarse según el protocolo interno para evaluar el riesgo y las medidas.',
    obs:'El incidente de datos no quedó registrado ni escalado según el protocolo.'},
   {k:'risk',s:'Seguir en el chatbot porque “ya está subido”',t:'Seguir trabajando en el chatbot gratuito: el archivo ya está ahí y cambiar de herramienta haría perder más tiempo.',next:'B3',
    c:'Rodrigo te detiene y te pide pasar de inmediato al asistente corporativo. El incidente se amplía: ahora hay más consultas con datos personales en el servicio externo.',
    why:'Que el daño ya exista no justifica ampliarlo. Lo primero es contener: dejar de usar la herramienta no autorizada.',
    fx:'Se siguió usando una herramienta no autorizada después de detectar el incidente.'},
   {k:'opt',s:'Contener, reportar y rehacer con datos mínimos',t:'Dejar de usar el chatbot, borrar el historial si la herramienta lo permite, reportar el incidente según el protocolo con Rodrigo y el encargado de datos, y rehacer la base como tabla mínima en el asistente corporativo.',next:'B3',
    c:'El encargado de datos registra el incidente y evalúa las medidas. A las 11:30 tienes la tabla mínima con códigos lista en el asistente corporativo. Perdiste tiempo, pero el cierre sigue bajo control.',
    why:'Contener, reportar y corregir el proceso es la respuesta correcta ante un incidente. Ocultarlo o minimizarlo agrava las consecuencias.'}]},

B2:{t:'Medio día menos',time:'28 oct · 13:00',left:'Faltan 2 días',comp:'datos',
  sit:`${person('Rodrigo','“Confirmado: solo el asistente corporativo y solo datos mínimos. Y Finanzas pregunta si podemos cerrar hoy a las 18:00.”')}<p>Tienes la exportación completa abierta. Preparar bien la base toma cerca de una hora.</p>`,
  q:'¿Cómo preparas la base para la IA?',
  opts:[
   {k:'acc',s:'Tabla mínima sin cuadratura',t:'Armar la tabla mínima con códigos y subirla de inmediato. La cuadratura con el sistema “la hacemos después”.',next:'B3',
    c:'La tabla queda bien protegida, pero no verificas que tenga los 420 trabajadores. Más tarde descubres que faltaban 6 registros de Bodega que se filtraron por error al copiar.',
    why:'Sin cuadratura no sabes si la IA está revisando la base completa. Contar registros y comparar totales con el sistema toma minutos.',
    obs:'La base enviada a la IA no se cuadró con el sistema antes de revisarla.'},
   {k:'opt',s:'Tabla mínima cuadrada y plazo realista',t:'Armar la tabla mínima con códigos, cuadrarla con el sistema (420 trabajadores y total de haberes) y proponer a Rodrigo cerrar mañana a las 12:00, con tiempo para validar.',next:'B3',
    c:'La base cuadra: 420 códigos y el mismo total de haberes que el sistema. Rodrigo negocia con Finanzas el nuevo plazo, que sigue dentro del calendario de pago.',
    why:'La cuadratura es tu primer control: asegura que la IA revisa toda la información y nada más que la necesaria. Un plazo realista protege la validación.'},
   {k:'risk',s:'Exportación completa al asistente corporativo',t:'Subir la exportación completa al asistente corporativo: está autorizado, así que da lo mismo qué columnas lleve.',next:'B3',
    c:'El asistente recibe nombres, RUT, cuentas y diagnósticos que no necesita para revisar el cierre. Rodrigo te pide eliminar la carga y repetirla con datos mínimos.',
    why:'Una herramienta autorizada no elimina el principio de minimización: solo se entregan los datos necesarios para la tarea.',
    fx:'Se entregaron datos sensibles innecesarios a la IA, aunque fuera la herramienta autorizada.'}]},

A3:{t:'La fórmula que propone la IA',time:'28 oct · 10:30',left:'Faltan 2 días',comp:'formulas',
  sit:`<p>Antes de pedir la revisión, le pides al asistente una fórmula de control para marcar haberes duplicados en tu base (columna A: código, columna C: concepto).</p>${ai('Usa esta fórmula en la columna F y cópiala hacia abajo:<span class="promptbox" style="display:block">=CONTAR.SI($A$2:$A$1941;A2)&gt;1</span>Si devuelve VERDADERO, el haber está duplicado.')}`,
  q:'¿Qué haces con la fórmula?',
  opts:[
   {k:'acc',s:'Pedir a la IA que revise su fórmula',t:'Pedirle a la IA que revise su propia fórmula y aplicar la versión que entregue, comprobando que funcione en una fila.',next:'M4',
    c:'La IA corrige la fórmula a código más concepto. La pruebas en una fila sin duplicado y da FALSO. Funciona, aunque no probaste un caso con duplicado real.',
    why:'Pedir una revisión ayuda, pero la verificación es tuya: un solo caso no basta. Prueba al menos un caso que debe dar VERDADERO y otro que debe dar FALSO.',
    obs:'La fórmula de duplicados se validó con un solo caso de prueba.'},
   {k:'risk',s:'Copiarla en todas las filas sin probar',t:'Copiarla en las 1.940 filas: la escribió la IA y las referencias absolutas se ven correctas.',next:'X1',
    c:'La columna F se llena de VERDADERO. La fórmula marca 388 registros como duplicados.',
    why:'La fórmula cuenta solo el código. Como cada trabajador tiene varios conceptos (sueldo, gratificación, bonos), casi todos aparecen “duplicados”. Una fórmula sin probar es solo un borrador.',
    fx:'Se aplicó una fórmula de control sin probarla y generó alertas falsas.'},
   {k:'opt',s:'Probar con casos conocidos y corregir',t:'Probarla con tres casos conocidos: un trabajador con sueldo y bono (no es duplicado), el bono repetido de prueba y un caso con un solo concepto. Corregir la lógica si falla.',next:'M4',
    c:'El primer caso da VERDADERO cuando debería dar FALSO: la fórmula cuenta solo el código. La corriges a <code>=CONTAR.SI.CONJUNTO($A$2:$A$1941;A2;$C$2:$C$1941;C2)&gt;1</code> y los tres casos dan el resultado esperado.',
    why:'Probar con casos que deben dar VERDADERO y FALSO revela la lógica equivocada antes de que contamine la revisión. Registras la fórmula probada en tu control.'}]},

X1:{t:'388 “duplicados”',time:'28 oct · 11:15',left:'Faltan 2 días',comp:'formulas',
  sit:`${person('Rodrigo','“¿388 haberes duplicados? Eso sería un desastre. ¿Le aviso a Finanzas?”')}<p>Tu columna de control marca casi todos los registros. La IA, en cambio, solo mencionó un posible bono duplicado.</p>`,
  q:'¿Cómo resuelves la contradicción?',
  opts:[
   {k:'opt',s:'Contrastar casos con el sistema y corregir la fórmula',t:'Pedirle a Rodrigo que espere, revisar tres registros marcados contra la liquidación del sistema y corregir la fórmula para que compare código y concepto.',next:'M4',
    c:'Los tres registros tienen sueldo y gratificación, no duplicados. Corriges la fórmula a código más concepto y queda un solo caso: EMP-217, con dos bonos de producción.',
    why:'Cuando una fórmula y la IA se contradicen, la fuente decide: la liquidación del sistema. Luego corriges la fórmula y la vuelves a probar.'},
   {k:'risk',s:'Avisar a Finanzas de 388 duplicados',t:'Avisarle a Finanzas que hay 388 duplicados para que estén preparados.',next:'M4',
    c:'Finanzas congela el proceso de pago y convoca a una reunión de urgencia. Una hora después debes explicar que era un error de tu fórmula.',
    why:'Escalar un resultado sin verificarlo traslada el error a otras áreas y daña la confianza en el control.',
    fx:'Se informó a Finanzas un error inexistente sin verificarlo, lo que detuvo el proceso de pago.'},
   {k:'acc',s:'Confiar en la IA y descartar la fórmula',t:'Confiar en la IA, que solo vio un duplicado, y borrar la columna de control.',next:'M4',
    c:'Pierdes el control propio y quedas dependiendo solo de lo que diga la IA. Esta vez acierta, pero no tienes cómo demostrarlo.',
    why:'No se trata de elegir entre la IA y la fórmula, sino de corregir la fórmula y contrastar ambas con la fuente.',
    obs:'Se eliminó un control propio en vez de corregirlo, y la revisión quedó dependiendo solo de la IA.'}]},

B3:{t:'La instrucción para la IA',time:'28 oct · 15:00',left:'Faltan 2 días',comp:'alertas',
  sit:`<p>La tabla mínima ya está en el asistente corporativo. Ahora debes pedirle la revisión del cierre de octubre. Tienes a mano la regla de horas extra (recargo mínimo de 50 % sobre el sueldo convenido), la tabla de bonos y la tabla de tasas de AFP vigente (valores ilustrativos).</p>`,
  q:'¿Qué instrucción le das?',
  opts:[
   {k:'opt',s:'Instrucción completa con restricciones y formato',t:'“Actúa como analista de remuneraciones. Revisa el cierre de octubre de AndesCorp con la tabla adjunta (código, área, concepto, monto) y las reglas que te entrego. Marca posibles inconsistencias, pero no corrijas ni inventes valores; si falta información, indícalo. Entrega una tabla con código, alerta, evidencia y regla aplicada.”',next:'M4',
    c:'La IA entrega cuatro alertas ordenadas, cada una con la evidencia y la regla. Sabes exactamente qué verificar.',
    why:'Tarea, contexto, información, restricciones y formato: la respuesta es concreta y verificable, y la IA no modifica datos.'},
   {k:'acc',s:'Instrucción breve sin restricciones',t:'“Revisa estas liquidaciones de octubre y lista las inconsistencias en una tabla.”',next:'M4',
    c:'La IA entrega una tabla útil, pero mezcla alertas con suposiciones y no cita la regla que aplicó. Te toma más tiempo distinguir qué verificar.',
    why:'Falta contexto (reglas de AndesCorp) y restricciones (no corregir, no inventar, indicar si falta información).',
    obs:'La instrucción a la IA no fijó reglas ni restricciones, y las alertas llegaron sin evidencia.'},
   {k:'risk',s:'Pedir a la IA que corrija la planilla',t:'“Corrige los errores de la planilla y devuélvemela lista para pagar.”',next:'M4',
    c:'La IA devuelve una planilla “corregida” con cambios que no explica. La descartas, pero perdiste una hora y tienes que volver a pedir solo las alertas.',
    why:'La IA asiste y el sistema calcula. Pedirle que corrija montos la convierte en quien decide pagos sin respaldo.',
    fx:'Se le pidió a la IA corregir montos de pago directamente.'}]},

M4:{t:'Llegan las alertas',time:'28 oct · 16:30',left:'Faltan 2 días',comp:'alertas',
  sit:`<p>El asistente entrega cuatro alertas sobre la base de octubre:</p>
  <div class="tblwrap"><table class="datatbl"><thead><tr><th>#</th><th>Alerta de la IA</th><th>Evidencia</th></tr></thead><tbody>
  <tr><td>1</td><td>Horas extra en Planta</td><td>14 trabajadores con más del doble de horas extra que en septiembre</td></tr>
  <tr><td>2</td><td>Bono duplicado</td><td>EMP-217 recibe dos veces el bono de producción ($120.000 c/u)</td></tr>
  <tr><td>3</td><td>AFP con tasa anterior</td><td>31 registros con una tasa de cotización distinta a la tabla vigente</td></tr>
  <tr><td>4</td><td>Sueldo base fuera de rango</td><td>EMP-088: sueldo base 45 % mayor que en septiembre</td></tr></tbody></table></div>`,
  q:'¿Cómo tratas las cuatro alertas?',
  opts:[
   {k:'acc',s:'Priorizar por monto y dejar el resto',t:'Investigar primero las alertas de mayor impacto en dinero (AFP y horas extra) y dejar las demás para después del cierre.',next:'M5',
    c:'Avanzas rápido en las alertas grandes. El bono duplicado de EMP-217 queda pendiente y casi se paga dos veces; lo detecta Rodrigo al revisar tu lista.',
    why:'Priorizar está bien, pero toda alerta debe quedar clasificada antes del cierre. Una alerta “pequeña” puede ser un error cierto.',
    obs:'Algunas alertas quedaron sin clasificar antes del cierre.'},
   {k:'opt',s:'Clasificar cada alerta y verificar en la fuente',t:'Clasificar cada alerta en corregir, investigar o descartar, y verificar cada una en la fuente (sistema, registro de asistencia, contratos) antes de tocar cualquier dato.',next:'M5',
    c:'Horas extra de Planta: el registro de asistencia muestra que una semana se importó dos veces en 6 casos (corregir en el sistema); los otros 8 tienen respaldo. Bono de EMP-217: duplicado confirmado (corregir). AFP: investigar la tabla de parámetros. EMP-088: investigar.',
    why:'Cada alerta es una hipótesis. Clasificar y contrastar con la fuente evita corregir lo que está bien y dejar pasar lo que está mal.'},
   {k:'risk',s:'Pedir a la IA que corrija las cuatro',t:'Pedirle a la IA que corrija las cuatro alertas directamente en la planilla y cargar el resultado.',next:'M5B',
    c:'La IA “corrige” todo: baja las horas extra de los 14 trabajadores de Planta, elimina un bono, cambia las tasas y devuelve el sueldo de EMP-088 al de septiembre. Los totales ya no cuadran con el sistema.',
    why:'Una alerta no es un error confirmado. Corregir sin verificar puede introducir errores nuevos y saltarse el sistema, que es donde se calcula.',
    fx:'Se aplicaron correcciones de la IA sin verificar las alertas en la fuente.'}]},

M5:{t:'EMP-088: ¿error o ascenso?',time:'29 oct · 09:30',left:'Falta 1 día',comp:'alertas',
  sit:`<p>La alerta 4 sigue abierta: el sueldo base de EMP-088 subió 45 % respecto de septiembre. La IA lo califica como “probable error de digitación”.</p>${person('Jefa de Operaciones','“¿Te puedo ayudar? Ando corta de tiempo hoy.”','',`O`)}`,
  q:'¿Cómo resuelves la alerta?',
  opts:[
   {k:'risk',s:'Revertir el sueldo al de septiembre',t:'Revertir el sueldo al monto de septiembre: la IA dice que es un error de digitación.',next:'M6',
    c:'Al día siguiente la persona reclama: había sido ascendida a supervisora desde el 1 de octubre. Hay que reliquidar y pedir disculpas.',
    why:'Era un falso positivo. Una variación grande no es un error por sí misma: hay que revisar el respaldo (contrato o anexo).',
    fx:'Se revirtió un ascenso legítimo por confiar en una alerta falsa de la IA.'},
   {k:'acc',s:'Consultar por correo y dejarla abierta',t:'Escribirle a la jefa de Operaciones y dejar la alerta abierta hasta que responda.',next:'M6',
    c:'La jefa responde a las 18:00 confirmando el ascenso. La alerta se resuelve, pero queda solo un correo como respaldo y sin el documento del ascenso.',
    why:'Consultar es razonable, pero la evidencia formal es el anexo de contrato firmado, que estaba disponible en la carpeta del trabajador.',
    obs:'El falso positivo se cerró con un correo, sin el documento de respaldo.'},
   {k:'opt',s:'Verificar el anexo y descartar con evidencia',t:'Revisar la carpeta del trabajador: si hay un anexo de contrato firmado, descartar la alerta y registrar el motivo y el documento.',next:'M6',
    c:'Encuentras el anexo firmado: ascenso a supervisora desde el 1 de octubre. Descartas la alerta como falso positivo y lo registras con el documento como evidencia.',
    why:'Descartar también es una decisión que se documenta: qué se revisó, qué se encontró y por qué no es error.'}]},

M5B:{t:'Corrección en cadena',time:'29 oct · 09:30',left:'Falta 1 día',comp:'validacion',
  sit:`<p>Al revisar la planilla que corrigió la IA, el total de haberes es $2,1 millones menor que el del sistema. No sabes exactamente qué cambió en cada registro.</p>${person('Rodrigo','“¿Por qué no cuadra? ¿Qué cambios hizo la IA?”')}`,
  q:'¿Qué haces?',
  opts:[
   {k:'acc',s:'Revisar y revertir solo lo que la IA cambió',t:'Comparar la planilla corregida con la original, revisar cada cambio y revertir los que no tengan respaldo.',next:'M6',
    c:'Encuentras los cambios y reviertes la mayoría. Te toma la mañana completa y aun así dudas de dos registros.',
    why:'Revisar cambio por cambio es posible, pero es lento y propenso a errores. Partir desde la fuente es más seguro.',
    obs:'Se trabajó sobre una planilla modificada por la IA en vez de volver a la fuente.'},
   {k:'opt',s:'Descartar la planilla y volver a la fuente',t:'Descartar la planilla modificada, volver a la exportación original del sistema y tratar cada alerta: clasificar, verificar y corregir solo en el sistema.',next:'M6',
    c:'En dos horas resuelves las alertas desde cero: corriges en el sistema las horas extra importadas dos veces (6 casos) y el bono de EMP-217, y descartas EMP-088 con su anexo de ascenso.',
    why:'Cuando una corrección no se puede trazar, se descarta y se vuelve a la fuente. El sistema calcula y cada cambio queda con respaldo.'},
   {k:'risk',s:'Aceptar los cambios porque la IA los explicó',t:'Aceptar los cambios: la IA explicó cada corrección de forma convincente.',next:'M6',
    c:'Se mantienen las horas extra recortadas en Planta, aunque 8 de ellas tenían respaldo, y el sueldo revertido de EMP-088. Los errores llegan a las liquidaciones.',
    why:'Una explicación convincente no es evidencia. La validación se hace contra la fuente, no contra el relato de la IA.',
    fx:'Se pagaron horas extra recortadas sin respaldo y un sueldo revertido por error.'}]},

M6:{t:'La fórmula de la tasa AFP',time:'29 oct · 11:00',left:'Falta 1 día',comp:'formulas',
  sit:`<p>Confirmaste que 31 registros usan la tasa de la tabla anterior. Para comprobar la tasa correcta de cada registro, la IA sugiere esta fórmula sobre tu tabla de tasas (AFP ficticias, valores ilustrativos):</p>${ai('<span class="promptbox" style="display:block">=BUSCARV(D2;Tasas!$A$2:$B$6;2;VERDADERO)</span>Devuelve la tasa vigente de la AFP de cada trabajador.')}
  <div class="tblwrap"><table class="datatbl"><thead><tr><th>Tasas!A · AFP</th><th>Tasas!B · Tasa (ilustrativa)</th></tr></thead><tbody>
  <tr><td>Cordillera</td><td>11,2 %</td></tr><tr><td>Pacífico</td><td>11,5 %</td></tr><tr><td>Austral</td><td>10,9 %</td></tr><tr><td>Litoral</td><td>11,4 %</td></tr><tr><td>Andina</td><td>11,1 %</td></tr></tbody></table></div>`,
  q:'¿Qué haces antes de usarla?',
  opts:[
   {k:'opt',s:'Probar con casos conocidos y usar coincidencia exacta',t:'Probarla con una AFP de cada fila de la tabla y comparar con la tasa esperada. Si falla, cambiar a coincidencia exacta (FALSO) o usar BUSCARX.',next:'M7',
    c:'Para “Andina” la fórmula devuelve 11,4 %, la tasa de Litoral: con VERDADERO busca una coincidencia aproximada y la tabla no está ordenada. Con FALSO, las cinco pruebas dan la tasa correcta. Actualizas la tabla de parámetros en el sistema y reprocesas los 31 registros.',
    why:'BUSCARV con VERDADERO exige la tabla ordenada y puede devolver un valor equivocado sin mostrar error. Para buscar un nombre exacto se usa FALSO o BUSCARX.'},
   {k:'risk',s:'Aplicarla y corregir los 31 a mano',t:'Aplicarla en las 420 filas y corregir a mano en la planilla las tasas que difieran.',next:'M7',
    c:'La fórmula asigna tasas equivocadas a quienes están en Andina y Austral. Corriges a mano 58 registros, 27 de ellos sin error real, y fuera del sistema.',
    why:'Una fórmula sin probar más correcciones manuales fuera del sistema multiplican el error. La corrección se hace en los parámetros del sistema.',
    fx:'Se corrigieron tasas de AFP a mano con una fórmula sin probar, introduciendo 27 errores nuevos.'},
   {k:'acc',s:'Pedir a la IA que la revise',t:'Preguntarle a la IA si la fórmula es correcta y usar la versión que proponga, revisando un registro.',next:'M7',
    c:'La IA cambia a FALSO y explica por qué. Revisas un registro y coincide. El resultado es correcto, pero solo probaste una AFP.',
    why:'La IA puede corregirse, pero la prueba es tuya: una fila por cada AFP de la tabla es una prueba rápida y completa.',
    obs:'La fórmula de tasas se validó con un solo registro.'}]},

M7:{t:'La presión de la gerencia',time:'29 oct · 17:00',left:'Falta 1 día',comp:'validacion',
  sit:`${person('Gerente de Finanzas','“Camila, la IA ya revisó todo, ¿verdad? Cerremos hoy y enviemos la nómina al banco.”','',`F`)}<p>Las correcciones están cargadas en el sistema, pero aún no corres los controles finales: cuadratura de totales contra el sistema y revisión de una muestra de los registros corregidos.</p>`,
  q:'¿Qué respondes?',
  opts:[
   {k:'risk',s:'Cerrar ya: “la IA revisó todo”',t:'Cerrar ahora: la IA revisó las 420 liquidaciones y las correcciones están cargadas.',next:'M8',
    c:'La nómina sale sin la cuadratura final. Al día siguiente aparecen diferencias que no alcanzas a explicar antes del pago.',
    why:'La revisión de la IA no reemplaza la validación. Los controles finales comprueban que las correcciones quedaron bien en el sistema.',
    fx:'Se cerró sin cuadratura final ni revisión de los registros corregidos.'},
   {k:'opt',s:'Controles finales y cierre mañana 12:00',t:'Explicar qué falta y por qué: correr la cuadratura contra el sistema y revisar una muestra de los registros corregidos, y confirmar el cierre mañana a las 12:00, a tiempo para el banco.',next:'M8',
    c:'La cuadratura cuadra y la muestra de 20 registros corregidos está correcta. La gerente acepta el plazo porque entiende el riesgo y el pago sale a tiempo.',
    why:'Validar antes de cerrar y comunicar con argumentos permite cumplir el plazo sin sacrificar el control.'},
   {k:'acc',s:'Cerrar hoy solo con la cuadratura',t:'Correr solo la cuadratura de totales, cerrar hoy y dejar la revisión de la muestra para la próxima semana.',next:'M8',
    c:'Los totales cuadran y cierras hoy. La semana siguiente, al revisar la muestra, encuentras un registro de horas extra mal corregido que se ajusta en noviembre.',
    why:'La cuadratura detecta diferencias globales, pero no errores que se compensan. La muestra de registros corregidos es parte de la validación.',
    obs:'La revisión de los registros corregidos se postergó para después del pago.'}]},

M8:{t:'El registro del cierre',time:'30 oct · 09:00',left:'Día del cierre',comp:'validacion',
  sit:`${person('Rodrigo','“Auditoría interna va a revisar cómo usamos IA en este cierre. ¿Qué dejamos registrado?”')}`,
  q:'¿Cómo documentas el cierre?',
  opts:[
   {k:'acc',s:'Correo resumen a Rodrigo',t:'Enviar un correo a Rodrigo con un resumen de las correcciones realizadas.',next:'FIN',
    c:'Auditoría encuentra el correo útil, pero pregunta qué datos se usaron, qué instrucción se dio a la IA y por qué se descartó EMP-088. Debes reconstruirlo de memoria.',
    why:'Un resumen no permite auditar el proceso. Falta la trazabilidad: datos usados, instrucciones, alertas, evidencia y responsables.',
    obs:'La documentación del cierre fue un resumen sin trazabilidad.'},
   {k:'opt',s:'Registro de control completo',t:'Completar el registro de control: herramienta y datos usados (tabla mínima con códigos), instrucción dada a la IA, cada alerta con su decisión y evidencia, fórmulas probadas, cambios hechos en el sistema y quién validó.',next:'FIN',
    c:'Auditoría revisa el registro en veinte minutos y lo propone como modelo para los próximos cierres asistidos por IA.',
    why:'El registro de control hace visible el criterio humano detrás de cada decisión y permite repetir y auditar el proceso.'},
   {k:'risk',s:'Sin registro: “ya está en el sistema”',t:'No documentar nada más: los cambios ya están en el sistema y la nómina se pagó.',next:'FIN',
    c:'Auditoría no puede saber qué revisó la IA ni por qué se cambiaron registros. El uso de IA en cierres queda suspendido hasta definir controles.',
    why:'Sin registro no hay trazabilidad. Si algo falla, nadie puede reconstruir qué se hizo ni por qué.',
    fx:'No quedó registro de cómo se usó la IA ni de las decisiones tomadas.'}]}
};

/* ---------- Utilidades del grafo ---------- */
const memo={};
function depth(n){if(n==='FIN')return 0;if(memo[n]!=null)return memo[n];memo[n]=1+Math.max(...NODES[n].opts.map(o=>depth(o.next)));return memo[n]}
const bestOpt=n=>NODES[n].opts.findIndex(o=>o.k==='opt');
const letter=i=>'ABC'[i];
function outcome(pct){return pct>=85?{k:'clean',t:'Cierre limpio'}:pct>=60?{k:'obs',t:'Cierre con observaciones'}:{k:'inc',t:'Cierre con incidente'}}
const OUT_TXT={
  clean:'El jueves 30 de octubre AndesCorp paga las 420 remuneraciones a tiempo. Los errores reales (horas extra importadas dos veces, el bono duplicado de EMP-217 y las tasas AFP) se corrigieron en el sistema con respaldo, y el falso positivo de EMP-088 quedó descartado con evidencia.',
  obs:'El pago sale a tiempo, pero auditoría interna deja observaciones sobre el proceso. Algunas decisiones quedaron sin evidencia suficiente o con controles incompletos, y hay ajustes que se arrastran a noviembre.',
  inc:'El cierre termina con un incidente: hay pagos erróneos que obligan a reliquidar o un problema con los datos personales que debe informarse. El uso de IA en el cierre queda en revisión hasta definir controles.'};

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
  let h=`<div class="ev-head"><div class="ev-when"><span class="clock">${n.time}</span><span class="pill warn">${n.left} para el cierre</span>${route?`<span class="pill info">${ROUTE[route]}</span>`:''}</div>
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
  h+=`</div><details class="ev-exp" ${expOpen()?'open':''}><summary>🗂️ Expediente del cierre <span class="pill info">${done}</span></summary><div class="ev-exp-body">
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
