# Genera lesson.json de la Lección 3.1 (con narración)
import json, pathlib

OPT_PREG = ["Analizar “todo lo que se pueda” con la base completa",
            "Una pregunta concreta: qué explica la variación del costo por área entre dos meses",
            "Que la IA proponga qué analizar"]
OPT_VARS = ["Todas las columnas de la exportación del sistema",
            "Solo las variables que responden la pregunta (código, área, período, conceptos y estado)",
            "Solo el total de la empresa por mes"]
OPT_PROT = ["Ninguna: la herramienta es corporativa",
            "Seudonimizar con códigos y agregar los grupos de menos de cinco personas",
            "Borrar la columna de nombre y dejar el RUT"]
OPT_CTRL = ["No hace falta: la IA detecta los errores",
            "Conteo de registros y totales de la base cuadrados con el sistema antes de entregarla",
            "Revisar a ojo las primeras diez filas"]

L = {
 "id": "ia_rem_l31", "ident": "IAREM_M3_L31", "zip_name": "Leccion_3_1_Preparacion_de_datos",
 "title": "Lección 3.1 — Preparación de datos para análisis",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 3 · LECCIÓN 3.1",
 "voice": True, "pass": 0.8,
 "narration": {
  "p01": "Te damos la bienvenida a la lección tres punto uno, la primera del módulo de análisis e informes con inteligencia artificial. La gerencia quiere entender por qué subió el costo de remuneraciones de octubre. Camila tiene la exportación del sistema y debe decidir cómo empezar.",
  "p03": "Esta es una parte de la exportación de octubre. Tiene seis problemas típicos: espacios sobrantes, mayúsculas distintas, un registro duplicado, un monto guardado como texto, un área vacía y una fila de total mezclada con los datos. Toca cada celda marcada y elige cómo corregirla.",
  "p04": "Después de limpiar, hay que proteger los datos. Existen cuatro formas de hacerlo, y cada una sirve para algo distinto. Voltea cada tarjeta y descubre cuándo conviene usarla.",
  "p05": "La inteligencia artificial interpreta mejor una base cuando sabe qué significa cada columna. Para eso existe el diccionario de variables. Abre cada elemento y revisa qué debe incluir.",
  "p06": "Camila prepara la base para analizar la variación de octubre. Tiene que decidir cómo proteger un área con pocas personas, cómo comprobar que la base está completa y qué entregarle a la inteligencia artificial. Toma las decisiones con ella.",
  "quiz": "Llegó el momento de comprobar lo aprendido. Son cinco preguntas y necesitas al menos cuatro correctas para finalizar la lección. Cada alternativa tiene su explicación.",
  "p08": "Ahora arma tu propio plan de preparación de datos para un análisis de tu trabajo. Elige la pregunta, las variables, la protección y el control de cuadratura. Después compáralo con la respuesta modelo y cópialo.",
  "p09": "Terminaste la lección tres punto uno. Recuerda: antes de analizar con inteligencia artificial, define la pregunta, limpia la base, protege los datos, documenta las variables y cuadra los totales con el sistema. En la próxima lección analizarás las variaciones mensuales."
 },
 "video": {"voice": True, "scenes": [
  {"t": "Datos de calidad, análisis de calidad", "lines": [
    "Un análisis con inteligencia artificial nunca es mejor que los datos que recibe.",
    "Si la base tiene duplicados, áreas mal escritas o montos con formatos mezclados, la conclusión será equivocada, aunque esté muy bien redactada."],
   "html": "<div class=\"v-vs\"><div class=\"warn\" data-at=\"0\"><b>Base sin preparar</b>Duplicados, formatos mezclados<small>Conclusiones erradas</small></div><div data-at=\"1\"><b>Base preparada</b>Limpia, protegida y cuadrada<small>Conclusiones confiables</small></div></div>"},
  {"t": "Primero, la pregunta", "lines": [
    "Todo empieza con una pregunta concreta. Por ejemplo: qué explica la variación del costo por área entre septiembre y octubre.",
    "La pregunta define qué variables se necesitan y cuáles sobran."],
   "html": "<div class=\"v-final\">¿Qué <em>explica</em> la variación?</div><div class=\"v-chk\"><span data-at=\"1\">Código</span><span data-at=\"1\">Área</span><span data-at=\"1\">Período</span><span data-at=\"1\">Conceptos</span></div>"},
  {"t": "Limpiar la base", "lines": [
    "Luego se limpia: espacios sobrantes, mayúsculas distintas, duplicados, montos guardados como texto y filas de totales mezcladas con los datos.",
    "Un dato atípico no se borra sin antes verificar si es un error o un hecho real."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Formatos unificados</div><div data-at=\"0\">Duplicados revisados</div><div data-at=\"1\">Atípicos verificados, no borrados</div></div>"},
  {"t": "Proteger los datos", "lines": [
    "Después se protege la información: se reemplazan nombres por códigos, se agrupan los totales o se usan datos sintéticos para probar.",
    "Los grupos muy pequeños se agregan, porque con menos de cinco personas es fácil reconocer a alguien."],
   "html": "<div class=\"v-icons\"><div><span class=\"i\">🔑</span>Códigos</div><div><span class=\"i\">📊</span>Agregados</div><div class=\"dim\" data-at=\"1\"><span class=\"i\">🧪</span>Sintéticos</div></div>"},
  {"t": "Documentar y cuadrar", "lines": [
    "Por último, se documenta cada variable en un diccionario y se cuadran los totales con el sistema.",
    "Si la base no cuadra, el análisis no empieza. En esta lección prepararás la base con Camila."],
   "html": "<div class=\"v-final\">Si no <em>cuadra</em>,<br/>no se analiza.</div><div class=\"v-chk\"><span data-at=\"0\">Diccionario</span><span data-at=\"1\">Cuadratura</span></div>"}
 ]},
 "builders": {"plan": {
  "title": "Mi plan de preparación de datos",
  "rows": [
   {"type": "text", "label": "Análisis que quieres hacer", "ph": "Ej.: explicar la variación de horas extra de Planta entre agosto y septiembre"},
   {"label": "1 · Pregunta de análisis", "options": OPT_PREG, "model": 1,
    "why": "<b>Modelo:</b> una pregunta concreta define qué variables necesitas y cómo verás si la respuesta es correcta."},
   {"label": "2 · Variables", "options": OPT_VARS, "model": 1,
    "why": "<b>Modelo:</b> solo las variables que responden la pregunta. Las columnas de más exponen datos y agregan ruido; un total no permite explicar nada."},
   {"label": "3 · Protección", "options": OPT_PROT, "model": 1,
    "why": "<b>Modelo:</b> códigos en vez de identificadores y agregación de grupos pequeños. El RUT es un identificador directo, aunque se borre el nombre."},
   {"label": "4 · Control antes de entregar", "options": OPT_CTRL, "model": 1,
    "why": "<b>Modelo:</b> conteo de registros y totales cuadrados con el sistema. Si la base no cuadra, cualquier conclusión puede estar mal."},
   {"type": "text", "label": "Variable que definirías en tu diccionario (opcional)", "ph": "Ej.: bonos = bonos variables del mes, en pesos, sin gratificación"}
  ]}},
 "quiz": [
  {"q": "¿Por qué se define la pregunta de análisis antes de preparar la base?",
   "o": ["Porque determina qué variables se necesitan y cuáles sobran.", "Porque la IA no acepta bases sin pregunta.", "No es necesario: primero se limpia todo."], "c": 0,
   "f": ["Correcto: la pregunta guía la selección de variables, la limpieza y la forma de validar la respuesta.", "La IA acepta cualquier base; el problema es que sin pregunta el análisis no tiene foco.", "Limpiar sin saber qué se analizará hace perder tiempo en columnas que no se usarán."]},
  {"q": "En la base aparece una persona con 200 horas extra en el mes. ¿Qué haces?",
   "o": ["La elimino: es claramente un error.", "La verifico contra la asistencia antes de decidir si es error o un hecho real.", "La dejo y la IA se encargará."], "c": 1,
   "f": ["Borrar un atípico sin verificar puede ocultar un error real de pago o una situación legítima.", "Correcto: un valor atípico se verifica en la fuente; recién entonces se corrige o se explica.", "La IA no sabe si el dato es real: necesita que la base esté verificada."]},
  {"q": "El área Finanzas tiene solo tres personas. ¿Cómo la presentas en un análisis por área?",
   "o": ["Tal cual, con sus montos individuales y códigos.", "Agregada con otra área o como “otras áreas”, porque con tan pocas personas se puede reconocer a alguien.", "La elimino del análisis."], "c": 1,
   "f": ["Con tres personas, aun con códigos, es fácil deducir quién es quién.", "Correcto: los grupos pequeños se agregan para evitar la reidentificación.", "Eliminarla distorsiona los totales; basta con agregarla."]},
  {"q": "¿Para qué sirve el diccionario de variables al trabajar con IA?",
   "o": ["Para que la IA y cualquier lector sepan qué significa cada columna, su unidad y su fuente.", "Para traducir la base al inglés.", "Para reemplazar la cuadratura."], "c": 0,
   "f": ["Correcto: evita interpretaciones erróneas, como suponer que “bonos” incluye la gratificación.", "El objetivo es precisar significados, no traducir.", "La cuadratura sigue siendo necesaria: el diccionario explica, no verifica."]},
  {"q": "La base tiene 418 registros y el sistema informa 420 trabajadores. ¿Qué haces?",
   "o": ["Entrego la base igual: la diferencia es pequeña.", "Busco los dos registros faltantes y no analizo hasta que la base cuadre.", "Le pido a la IA que estime los dos faltantes."], "c": 1,
   "f": ["Dos registros pueden ser justamente los que explican la variación (por ejemplo, ingresos del mes).", "Correcto: si la base no cuadra con el sistema, el análisis no empieza.", "La IA no puede saber qué datos faltan; inventaría valores."]}
 ]
}
p = pathlib.Path(__file__).with_name("lesson.json")
p.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
