# Genera lesson.json de la Lección 4.4 (sin narración)
import json, pathlib

L = {
 "id": "ia_rem_l44", "ident": "IAREM_M4_L44", "zip_name": "Leccion_4_4_Proyecto_integrador",
 "title": "Lección 4.4 — Proyecto integrador",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 4 · LECCIÓN 4.4",
 "voice": False, "pass": 0.8,
 "video": {"voice": False, "scenes": [
  {"t": "Todo el curso en un proyecto", "lines": [
    "El proyecto integrador reúne lo aprendido: datos protegidos, instrucciones, validación, análisis y automatización.",
    "El objetivo es una propuesta concreta para mejorar una parte de tu proceso."],
   "html": "<div class=\"v-chk\"><span data-at=\"0\">Datos</span><span data-at=\"0\">Instrucciones</span><span data-at=\"0\">Validación</span><span data-at=\"1\">Análisis</span><span data-at=\"1\">Automatización</span></div>"},
  {"t": "Problema medido", "lines": [
    "Todo proyecto parte de un problema con cifras: horas al mes, errores o reclamos.",
    "Esas cifras son la línea base contra la que se medirá el resultado."],
   "html": "<div class=\"v-final\">Sin <em>línea base</em>,<br/>no hay resultado que mostrar.</div>"},
  {"t": "Solución con control", "lines": [
    "La solución usa la herramienta más simple que resuelve la tarea, con datos mínimos.",
    "Incluye un punto de control humano antes de pagar y un responsable definido."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Herramienta más simple</div><div data-at=\"0\">Datos mínimos</div><div data-at=\"1\">Control humano y responsable</div></div>"},
  {"t": "Piloto antes de escalar", "lines": [
    "Se prueba primero con datos ficticios y luego con un piloto corto.",
    "Se mide, se ajusta y recién entonces se amplía a otras áreas."],
   "html": "<div class=\"v-icons\"><div><span class=\"i\">🧪</span>Probar</div><div><span class=\"i\">🚀</span>Piloto</div><div class=\"dim\" data-at=\"1\"><span class=\"i\">📊</span>Medir y escalar</div></div>"},
  {"t": "Tu turno", "lines": [
    "En esta lección construirás tu proyecto, revisarás un plan de implementación y lo autoevaluarás con una rúbrica.",
    "Al final tendrás una ficha lista para presentar en tu trabajo."],
   "html": "<div class=\"v-final\">Un proyecto <em>concreto</em>,<br/>listo para presentar.</div>"}
 ]},
 "builders": {"proyecto": {
  "title": "Mi proyecto de mejora con IA",
  "rows": [
   {"type": "text", "label": "Nombre del proyecto", "ph": "Ej.: control asistido de horas extra antes del cálculo"},
   {"type": "text", "label": "Problema y línea base", "ph": "Ej.: 8 horas al mes de cuadratura manual y 4 errores detectados después del pago"},
   {"label": "1 · Alcance", "options": ["Todo el proceso de remuneraciones de una vez", "Una tarea acotada, repetitiva y con regla clara", "Una tarea que depende del criterio de una persona"], "model": 1,
    "why": "<b>Modelo:</b> una tarea acotada y repetitiva. Lo que funciona en una tarea después se amplía."},
   {"label": "2 · Datos", "options": ["La exportación completa del sistema", "Solo las columnas necesarias, con códigos en vez de identificadores, en una herramienta autorizada", "Datos personales en una herramienta gratuita, porque es más rápida"], "model": 1,
    "why": "<b>Modelo:</b> datos mínimos, seudonimizados y en una herramienta autorizada por la empresa."},
   {"label": "3 · Herramienta", "options": ["IA generativa para todo", "La más simple que resuelve la tarea: sistema, planilla, flujo o IA donde aporte", "Un desarrollo propio desde cero"], "model": 1,
    "why": "<b>Modelo:</b> la herramienta más simple. La IA, donde aporta en textos, clasificación o alertas."},
   {"label": "4 · Control humano", "options": ["Revisión después del pago", "Una persona revisa lo señalado y aprueba antes de cargar o pagar, con un reemplazo definido", "Sin revisión: la herramienta es confiable"], "model": 1,
    "why": "<b>Modelo:</b> control antes del pago, con responsable y reemplazo."},
   {"label": "5 · Indicador", "options": ["La percepción del equipo", "Horas y errores con línea base, meta y plazo", "Número de usos de la herramienta"], "model": 1,
    "why": "<b>Modelo:</b> indicadores de tiempo y calidad con línea base, meta y plazo."},
   {"label": "6 · Implementación", "options": ["Lanzamiento completo el próximo mes", "Prueba con datos ficticios, piloto de tres meses, medición y ajuste antes de escalar", "Esperar a que otra área lo haga primero"], "model": 1,
    "why": "<b>Modelo:</b> por etapas, con piloto y medición. Así el riesgo se mantiene bajo."}
  ]}},
 "panels": {"linea": [
  {"t": "Semanas 1 y 2 · Medir la línea base", "html": "<p>Camila registra durante dos cierres cuánto tiempo toma la cuadratura de horas extra y cuántos errores aparecen después del pago: <b>8 horas y 4 errores al mes</b>.</p>"},
  {"t": "Semana 3 · Aprobaciones", "html": "<p>Presenta la ficha a su jefatura y consulta a Tecnología y al área de protección de datos: herramienta autorizada, datos mínimos y responsables definidos.</p>"},
  {"t": "Semanas 4 y 5 · Prueba con datos ficticios", "html": "<p>Prueba la planilla de cuadratura y la instrucción de alertas con datos sintéticos, incluidos casos borde: ceros, duplicados, licencias e ingresos del mes.</p>"},
  {"t": "Semanas 6 a 9 · Piloto", "html": "<p>Usa el nuevo control en dos cierres reales, en paralelo con el método anterior durante el primero, para comparar resultados.</p>"},
  {"t": "Semanas 10 y 11 · Medir y ajustar", "html": "<p>Compara con la línea base: <b>de 8 a 3 horas y de 4 a 0 errores después del pago</b>. Ajusta las reglas que generaron alertas innecesarias.</p>"},
  {"t": "Semana 12 · Escalar y documentar", "html": "<p>Documenta el procedimiento, capacita a un reemplazo y propone extenderlo a otro concepto, como los bonos variables.</p>"}
 ]},
 "quiz": [
  {"q": "¿Qué elemento debe tener primero un proyecto de mejora con IA?",
   "o": ["El nombre de la herramienta.", "Un problema medido con su línea base.", "El presupuesto de licencias."], "c": 1,
   "f": ["La herramienta se elige después de entender el problema.", "Correcto: el problema medido justifica el proyecto y permite medir el resultado.", "El costo importa, pero se evalúa frente al beneficio, que nace del problema medido."]},
  {"q": "¿Por qué conviene probar primero con datos ficticios?",
   "o": ["Para no exponer datos reales mientras se ajustan las reglas y se prueban casos borde.", "Porque los datos reales son más lentos.", "No conviene: se prueba directo con datos reales."], "c": 0,
   "f": ["Correcto: los datos sintéticos permiten equivocarse sin riesgo para las personas.", "La velocidad no es el motivo; lo es la protección de los datos.", "Probar con datos reales desde el inicio expone información sin necesidad."]},
  {"q": "La gerencia pregunta qué pasa si la IA se equivoca. ¿Cuál es la mejor respuesta?",
   "o": ["“No se equivoca.”", "“Una persona revisa lo que señala antes del cálculo y hay un control independiente.”", "“Lo corregimos el mes siguiente.”"], "c": 1,
   "f": ["Toda herramienta puede equivocarse; prometer lo contrario resta credibilidad.", "Correcto: el riesgo se controla con revisión humana y un control independiente.", "Corregir después significa que el error ya se pagó."]},
  {"q": "¿Qué indicador permite evaluar mejor el piloto?",
   "o": ["Horas al mes y errores después del pago, comparados con la línea base.", "Cuántas personas usan la herramienta.", "Si al equipo le gusta."], "c": 0,
   "f": ["Correcto: tiempo y calidad, contra la línea base, muestran el resultado real.", "El uso mide actividad, no resultado.", "La percepción complementa, pero no permite decidir."]},
  {"q": "El piloto funcionó. ¿Cuál es el siguiente paso recomendado?",
   "o": ["Aplicarlo a todo el proceso de inmediato y sin documentación.", "Documentar el procedimiento, capacitar a un reemplazo y extenderlo a otra tarea por etapas.", "Detener el proyecto porque ya se probó."], "c": 1,
   "f": ["Escalar sin documentar ni capacitar crea dependencia de una sola persona.", "Correcto: documentación, reemplazo y extensión gradual.", "Un piloto exitoso es la base para extender la mejora."]}
 ]
}
p = pathlib.Path(__file__).with_name("lesson.json")
p.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
