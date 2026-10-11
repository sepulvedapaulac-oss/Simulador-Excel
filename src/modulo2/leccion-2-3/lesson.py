# Genera lesson.json de la Lección 2.3 (con voz)
import json, pathlib
L = {
 "id": "ia_rem_l23", "ident": "IAREM_M2_L23", "zip_name": "Leccion_2_3_Deteccion_de_inconsistencias",
 "title": "Lección 2.3 — Detección asistida de inconsistencias",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 2 · LECCIÓN 2.3",
 "voice": True, "pass": 0.8,
 "narration": {
  "p01": "Te damos la bienvenida a la lección dos punto tres. Es el cierre de octubre en AndesCorp. El asistente de inteligencia artificial revisó cuatrocientas veinte liquidaciones y le entregó a Camila diez alertas. ¿Qué debería hacer con ellas? Lee el informe y decide.",
  "p03": "No todas las inconsistencias son iguales. Algunas nacen en los datos, otras en el cálculo, otras en los parámetros y otras en las reglas internas o en el contrato. Abre cada pestaña y mira qué evidencia confirma cada tipo.",
  "p04": "Esta es la tabla de alertas que entregó la inteligencia artificial. Para cada una, decide si corresponde corregir, investigar o descartar. Ojo: hay errores reales, pero también falsos positivos que tienen una explicación válida.",
  "p05": "Una alerta se confirma o se descarta con evidencia. Une cada inconsistencia con el control o el documento que permite comprobarla.",
  "p06": "Las diez alertas están resueltas y Rodrigo quiere cerrar. Pero el control habitual de Camila muestra una diferencia que la inteligencia artificial no señaló. ¿Qué hace ahora? Decide.",
  "quiz": "Comprueba lo aprendido. Son cinco preguntas y necesitas al menos cuatro correctas para finalizar. Cada respuesta incluye una explicación.",
  "p08": "Lleva esto a tu trabajo. Arma tu matriz personal de alertas: qué criterio revisará la inteligencia artificial, qué evidencia lo confirma y quién decide. Después compárala con el modelo.",
  "p09": "Terminaste la lección dos punto tres. Recuerda: la inteligencia artificial señala, tú confirmas con evidencia, decides y documentas. En la próxima lección verás cómo validar resultados y controlar la calidad antes del cierre."
 },
 "video": {"voice": True, "scenes": [
  {"t": "Lo que la IA hace bien", "lines": [
    "La inteligencia artificial es muy buena comparando muchos registros contra las reglas que le entregas.",
    "En minutos puede revisar cientos de liquidaciones y señalar patrones o diferencias que se salen de lo esperado."],
   "html": "<div class=\"v-final\">Señalar <em>patrones</em> y <em>diferencias</em></div><div class=\"v-chk\"><span data-at=\"0\">Reglas entregadas</span><span data-at=\"1\">Cientos de registros</span><span data-at=\"1\">Variaciones atípicas</span></div>"},
  {"t": "Una alerta no es un error", "lines": [
    "Cada alerta es una hipótesis, no una conclusión.",
    "Puede ser un error real, algo que falta investigar, o un falso positivo que tiene una explicación válida."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Alerta = hipótesis</div><div data-at=\"1\">Error real</div><div data-at=\"1\">Falta investigar</div><div data-at=\"1\">Falso positivo</div></div>"},
  {"t": "Falsos positivos y omisiones", "lines": [
    "La inteligencia artificial solo conoce las reglas y los datos que le diste. Si no sabe que hubo un turno extra aprobado, marcará el alza de horas como sospechosa.",
    "Y si no recibió una regla, puede pasar por alto un error real. Por eso tus controles habituales siguen vigentes."],
   "html": "<div class=\"v-vs\"><div data-at=\"0\"><b>Falso positivo</b>Marca algo correcto<small>Le faltaba contexto</small></div><div class=\"warn\" data-at=\"1\"><b>Omisión</b>No ve un error real<small>Le faltaba la regla</small></div></div>"},
  {"t": "Evidencia y decisión", "lines": [
    "Para cada alerta, busca la evidencia en la fuente: el control de asistencia, el contrato, la tabla de parámetros o la aprobación de la jefatura.",
    "Con esa evidencia decides si corresponde corregir, investigar o descartar. La decisión es siempre de una persona."],
   "html": "<div class=\"v-icons\"><div><span class=\"i\">🔧</span>Corregir</div><div><span class=\"i\">🔎</span>Investigar</div><div><span class=\"i\">✓</span>Descartar</div><div class=\"dim\" data-at=\"1\"><span class=\"i\">👤</span>Decide una persona</div></div>"},
  {"t": "Documentar", "lines": [
    "Registra cada alerta con su evidencia, la decisión, el responsable y la fecha, también las que descartaste.",
    "Así el cierre queda respaldado y la próxima revisión parte con mejores reglas."],
   "html": "<div class=\"v-final\">Sin <em>registro</em>, no hay respaldo</div><div class=\"v-chk\"><span data-at=\"0\">Evidencia</span><span data-at=\"0\">Decisión</span><span data-at=\"0\">Responsable</span><span data-at=\"1\">Mejores reglas</span></div>"}
 ]},
 "alerts": [
  {"emp": "EMP-014", "area": "Ventas", "t": "Bono de cumplimiento registrado dos veces en octubre.", "dato": "Dos líneas del haber «Bono cumplimiento», de $85.000 cada una. Novedades aprobadas: una sola.", "d": "c", "kind": "Error real",
   "why": "La evidencia es concluyente: el registro de novedades tiene una sola aprobación. Se elimina la línea duplicada en el sistema y se deja constancia en el registro de alertas.",
   "hint": "Compara con el registro de novedades: ¿cuántos bonos se aprobaron?"},
  {"emp": "EMP-027", "area": "Planta", "t": "Horas extra subieron de 6 a 22 respecto de septiembre.", "dato": "Turno extra del 14 al 18 de octubre aprobado por la jefatura de Planta. El control de asistencia coincide.", "d": "d", "kind": "Falso positivo",
   "why": "El alza tiene respaldo: turno extra aprobado y asistencia que coincide. Se descarta la alerta, anotando la autorización como evidencia. La IA no conocía ese turno.",
   "hint": "La variación es grande, pero mira el dato: ¿existe una autorización y la asistencia coincide?"},
  {"emp": "EMP-033", "area": "Finanzas", "t": "Cotización de AFP calculada con la tasa del mes anterior.", "dato": "Tasa aplicada 11,44 %. Tabla de parámetros de octubre para esa AFP: 11,27 % (valores ilustrativos del curso).", "d": "c", "kind": "Error real",
   "why": "Es un parámetro desactualizado. Se verifica la tasa en la fuente oficial, se corrige en la tabla de parámetros del sistema y se revisan todas las personas afiliadas a esa AFP, no solo este caso.",
   "hint": "El dato muestra una tasa distinta a la tabla vigente del período. ¿Qué falta para actuar?"},
  {"emp": "EMP-041", "area": "Bodega", "t": "Días trabajados mayores que los días del mes.", "dato": "Días trabajados: 32. Octubre tiene 31 días. El control de asistencia registra 31.", "d": "c", "kind": "Error real",
   "why": "El valor es imposible y el control de asistencia indica el dato correcto. Se corrige el registro con esa fuente como respaldo.",
   "hint": "¿Puede alguien trabajar 32 días en un mes de 31? ¿Qué dice el control de asistencia?"},
  {"emp": "EMP-052", "area": "Operaciones", "t": "Persona desvinculada con sueldo completo en octubre.", "dato": "Fecha de término en la ficha: 30 de septiembre. Documento de término firmado en el expediente.", "d": "c", "kind": "Error real",
   "why": "La ficha y el documento de término confirman que no corresponde pago de remuneración en octubre. Se excluye de la nómina antes del pago y se avisa a quien gestiona el finiquito.",
   "hint": "La fecha de término está respaldada por un documento firmado. ¿Debería recibir sueldo en octubre?"},
  {"emp": "EMP-063", "area": "Ventas", "t": "Comisión de octubre 3,1 veces mayor que su promedio de seis meses.", "dato": "Aún no llega el reporte de ventas validado por el área comercial.", "d": "i", "kind": "Requiere investigar",
   "why": "Puede ser una venta grande y legítima, o un error de carga. Sin el reporte de ventas validado no puedes concluir: se pide la evidencia y se decide antes del pago.",
   "hint": "Una comisión alta puede ser legítima. ¿Ya tienes la evidencia para corregirla o descartarla?"},
  {"emp": "EMP-078", "area": "Planta", "t": "Sueldo base 4,5 % mayor que en septiembre.", "dato": "Anexo de contrato firmado con reajuste vigente desde el 1 de octubre, registrado en el sistema.", "d": "d", "kind": "Falso positivo",
   "why": "El cambio está respaldado por un anexo de contrato vigente. Se descarta la alerta y se anota el anexo como evidencia.",
   "hint": "Mira el dato: ¿hay un documento que explique el cambio de sueldo?"},
  {"emp": "EMP-085", "area": "Bodega", "t": "Licencia médica de 5 días sin efecto en los días pagados.", "dato": "La licencia aparece en el correo de la jefatura, pero no en el registro de licencias del sistema.", "d": "i", "kind": "Requiere investigar",
   "why": "Falta confirmar si la licencia fue ingresada y tramitada, y cómo se aplica según la política interna. Se investiga con el registro de licencias antes de tocar el pago.",
   "hint": "La información está incompleta: el correo dice una cosa y el sistema otra. ¿Puedes decidir ya?"},
  {"emp": "EMP-090", "area": "Finanzas", "t": "Misma cuenta de depósito que otra persona (EMP-112).", "dato": "Ambas fichas tienen la misma cuenta bancaria. No hay registro de cambio reciente.", "d": "i", "kind": "Requiere investigar",
   "why": "Puede ser un error de digitación o algo que requiere escalar. Se revisan los datos maestros y los respaldos del cambio de cuenta con la jefatura antes de pagar.",
   "hint": "Hay una señal de riesgo, pero todavía no sabes cuál de las dos fichas está mal ni por qué."},
  {"emp": "EMP-101", "area": "Varias áreas", "t": "38 personas reciben exactamente la misma gratificación con sueldos distintos.", "dato": "Gratificación según el art. 50 del Código del Trabajo, con tope anual de 4,75 ingresos mínimos mensuales.", "d": "d", "kind": "Falso positivo",
   "why": "Con el artículo 50, quienes superan el tope reciben el mismo monto mensual. La IA no conocía esa regla. Se descarta, verificando el tope con el ingreso mínimo vigente, y se agrega la regla a la instrucción del próximo cierre.",
   "hint": "Piensa en la gratificación del artículo 50 y su tope. ¿Es raro que varias personas reciban lo mismo?"}
 ],
 "pairs": {"pairs": {
  "order": [3, 0, 5, 1, 4, 2],
  "hint": "Pregúntate dónde está el dato original que confirma o descarta esa inconsistencia.",
  "items": [
   ["Bono pagado dos veces en el mismo mes", "Registro de novedades aprobadas del mes", "La aprobación de la novedad muestra cuántos bonos corresponden. Si hay una sola, la segunda línea es un duplicado."],
   ["Días trabajados mayores que los días del mes", "Control de asistencia y fechas de ingreso o término", "La asistencia registrada es la fuente del dato. Permite corregir con respaldo."],
   ["Tasa de AFP distinta de la vigente", "Tabla de parámetros del período verificada en la fuente oficial", "Los parámetros se contrastan con la fuente oficial del período, no con la memoria de la IA ni con el mes anterior."],
   ["Pago a una persona desvinculada", "Fecha de término en la ficha y documento de término firmado", "El documento firmado confirma desde cuándo no corresponde pagar remuneración."],
   ["Alza fuerte de horas extra frente al mes anterior", "Autorización de horas extra de la jefatura y registro de asistencia", "Si hay autorización y la asistencia coincide, la alerta es un falso positivo."],
   ["Sueldo base distinto al del mes anterior", "Anexo de contrato con el reajuste y su fecha de vigencia", "El anexo explica el cambio. Sin anexo, la diferencia debe investigarse."]
  ]}},
 "builders": {"matriz": {
  "title": "Mi matriz personal de alertas", "colA": "Criterio", "colB": "Evidencia",
  "rows": [
   {"label": "Alerta estándar: días trabajados mayores que los días del mes · ¿Con qué evidencia la confirmas?", "options": ["Le pido a la IA que lo vuelva a revisar", "Control de asistencia y fechas de ingreso o término", "Promedio de días trabajados del área"], "model": 1,
    "why": "<b>Modelo:</b> el control de asistencia es la fuente original del dato. Volver a preguntar a la IA no agrega evidencia, y un promedio no prueba nada sobre una persona."},
   {"label": "Misma alerta · ¿Quién decide y corrige?", "options": ["La IA, porque fue la que la detectó", "Analista de remuneraciones, con aprobación de la jefatura de Compensaciones", "La persona afectada, cuando revise su liquidación"], "model": 1,
    "why": "<b>Modelo:</b> la IA señala; la analista confirma y corrige, y la jefatura aprueba según el procedimiento del área."},
   {"type": "text", "label": "Mi alerta 1 · Criterio que revisará la IA", "ph": "Ej.: horas extra que superan en más de 50 % el promedio de tres meses"},
   {"type": "text", "label": "Mi alerta 1 · Evidencia que la confirma o descarta", "ph": "Ej.: autorización de la jefatura y control de asistencia"},
   {"type": "text", "label": "Mi alerta 1 · Responsable de decidir", "ph": "Ej.: analista de remuneraciones; aprueba jefatura"},
   {"type": "text", "label": "Mi alerta 2 · Criterio que revisará la IA", "ph": "Ej.: tasa de AFP distinta de la tabla del período"},
   {"type": "text", "label": "Mi alerta 2 · Evidencia que la confirma o descarta", "ph": "Ej.: tabla de parámetros verificada en la fuente oficial"},
   {"type": "text", "label": "Mi alerta 2 · Responsable de decidir", "ph": "Ej.: analista que mantiene los parámetros"},
   {"label": "¿Dónde registrarás cada decisión?", "options": ["En la conversación con la IA", "En un registro de alertas del cierre: alerta, evidencia, decisión, responsable y fecha", "Solo anoto las alertas que terminan en corrección"], "model": 1,
    "why": "<b>Modelo:</b> un registro del cierre, fuera del chat, con todas las alertas, también las descartadas y su justificación."}
  ]}},
 "quiz": [
  {"q": "La IA marca como sospechosa un alza de horas extra. El registro muestra un turno extra aprobado y la asistencia coincide. ¿Qué haces?",
   "o": ["Corriges las horas al promedio de los meses anteriores.", "Descartas la alerta y anotas la autorización y la asistencia como evidencia.", "La dejas sin registrar, porque no era un error."], "c": 1,
   "f": ["Corregir un dato que está respaldado crea un error nuevo y afecta el pago de la persona.", "Correcto: es un falso positivo. Se descarta con evidencia y queda documentado.", "Las alertas descartadas también se registran: el respaldo del cierre incluye por qué se descartaron."]},
  {"q": "¿Qué es un falso positivo en la detección asistida de inconsistencias?",
   "o": ["Una alerta que señala algo que, revisada la evidencia, está correcto.", "Un error real que la IA no detectó.", "Una alerta que la IA corrigió por su cuenta."], "c": 0,
   "f": ["Correcto: la alerta parecía un problema, pero tiene una explicación válida que la IA no conocía.", "Eso es una omisión, el riesgo contrario: por eso mantienes tus controles habituales.", "La IA no debe corregir datos: señala, y una persona decide."]},
  {"q": "La tasa de AFP aplicada a una persona no coincide con la tabla del período. ¿Cuál es la mejor acción?",
   "o": ["Corregir solo esa liquidación y seguir con el cierre.", "Pedirle a la IA la tasa correcta y aplicarla.", "Verificar la tasa en la fuente oficial, corregir el parámetro en el sistema y revisar a todas las personas afiliadas a esa AFP."], "c": 2,
   "f": ["Un parámetro desactualizado suele afectar a varias personas; corregir un solo caso deja errores en los demás.", "La IA puede entregar una tasa equivocada o desactualizada; los parámetros se verifican en la fuente oficial.", "Correcto: el error está en el parámetro, así que se corrige en su origen y se revisan todos los afectados."]},
  {"q": "La IA entregó diez alertas y ninguna sobre el recargo de horas extra, pero tu control muestra una diferencia. ¿Por qué pudo pasar?",
   "o": ["Porque la IA nunca se equivoca: tu control debe estar mal.", "Porque la IA revisa contra las reglas y datos que recibió; si no tenía la regla del recargo, pudo pasar por alto el error.", "Porque las diferencias pequeñas no importan en el cierre."], "c": 1,
   "f": ["La IA sí puede omitir errores. Tu control es una evidencia que debes investigar.", "Correcto: la IA no reemplaza tus controles. Investiga la diferencia y agrega la regla a la instrucción del próximo cierre.", "Toda diferencia en un pago requiere explicación antes de cerrar."]},
  {"q": "¿Qué debe contener el registro de alertas del cierre?",
   "o": ["Solo las alertas que terminaron en corrección.", "La conversación completa con la IA.", "Cada alerta con su evidencia, la decisión, el responsable y la fecha, incluidas las descartadas."], "c": 2,
   "f": ["Sin las descartadas no se puede saber por qué se aceptó un dato que parecía extraño.", "Un chat no es un registro ordenado: no muestra la evidencia revisada ni quién decidió.", "Correcto: así el cierre queda respaldado y cualquier persona puede reconstruir cada decisión."]}
 ]
}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
