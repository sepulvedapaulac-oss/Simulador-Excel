# Genera lesson.json de la Lección 1.2 (sin narración)
import json, pathlib
OPTS_DATA = ["Datos ficticios o información pública", "Datos agregados o anonimizados", "Datos personales o salariales reales"]
OPTS_TOOL = ["Herramienta pública con cuenta personal", "IA integrada en la ofimática corporativa", "Plataforma de IA corporativa aprobada por TI", "Extensión o servicio no revisado por TI"]
L = {
 "id": "ia_rem_l12", "ident": "IAREM_M1_L12", "zip_name": "Leccion_1_2_Herramientas_de_IA",
 "title": "Lección 1.2 — Herramientas de IA para el trabajo cotidiano",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 1 · LECCIÓN 1.2",
 "voice": False, "pass": 0.8,
 "video": {"voice": False, "scenes": [
  {"t": "No todas las IA son iguales", "lines": [
    "Hoy la inteligencia artificial está en muchos lugares: en un chat, dentro de la planilla, en el lector de documentos y en plataformas de análisis.",
    "Todas usan modelos parecidos, pero se diferencian en para qué sirven y en cómo tratan tus datos."],
   "html": "<div class=\"v-icons\"><div><span class=\"i\">💬</span>Chat</div><div><span class=\"i\">📊</span>Planilla</div><div><span class=\"i\">📄</span>Documentos</div><div class=\"dim\" data-at=\"1\"><span class=\"i\">🔎</span>Análisis</div></div>"},
  {"t": "Asistentes conversacionales", "lines": [
    "Los asistentes conversacionales sirven para explicar, resolver dudas y redactar borradores.",
    "Son ideales para entender una fórmula o preparar una respuesta, sin ingresar datos personales."],
   "html": "<div class=\"v-final\">💬 <em>Conversar</em>, explicar y redactar</div><div class=\"v-chk\"><span data-at=\"0\">Explicar fórmulas</span><span data-at=\"0\">Redactar borradores</span><span data-at=\"1\">Sin datos personales</span></div>"},
  {"t": "IA dentro de tus aplicaciones", "lines": [
    "La IA integrada en la planilla o el correo trabaja dentro del archivo, con la cuenta de la empresa.",
    "Sugiere fórmulas y columnas de control sin copiar los datos a otro sistema."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Trabaja dentro del archivo</div><div data-at=\"0\">Usa la cuenta corporativa</div><div data-at=\"1\">Sugiere fórmulas de control</div></div>"},
  {"t": "Documentos y datos", "lines": [
    "Las herramientas de lectura resumen contratos y reglamentos; las de análisis encuentran patrones en una base de datos.",
    "En ambos casos, pide referencias verificables y trabaja con datos anonimizados."],
   "html": "<div class=\"v-vs\"><div data-at=\"0\"><b>📄 Documentos</b>Resumir y extraer<small>Pide la cláusula o página</small></div><div data-at=\"1\"><b>🔎 Datos</b>Patrones y variaciones<small>Con datos anonimizados</small></div></div>"},
  {"t": "Pública o corporativa", "lines": [
    "La gran diferencia está en el entorno: una herramienta pública con cuenta personal no tiene acuerdos de confidencialidad con tu empresa.",
    "Un entorno corporativo autorizado define dónde se procesan los datos, quién accede y deja registro."],
   "html": "<div class=\"v-vs\"><div class=\"warn\" data-at=\"0\"><b>Pública</b>Sin acuerdos con tu empresa<small>Solo datos ficticios</small></div><div data-at=\"1\"><b>Corporativa autorizada</b>Accesos, registro y contrato<small>Datos mínimos necesarios</small></div></div>"},
  {"t": "La pregunta clave", "lines": [
    "Antes de elegir una herramienta por lo que hace, pregúntate: ¿está autorizada para el tipo de datos que voy a usar?",
    "Primero el entorno, después los datos mínimos y, por último, la modalidad."],
   "html": "<div class=\"v-steps\"><div data-at=\"1\">Entorno autorizado</div><div data-at=\"1\">Datos mínimos</div><div data-at=\"1\">Modalidad adecuada</div></div>"}
 ]},
 "pairs": {"pairs": {
  "order": [2, 0, 3, 1],
  "hint": "Fíjate en dónde ocurre la tarea (una conversación, dentro de un archivo, un documento largo o una base de datos).",
  "items": [
   ["Entender qué hace una fórmula anidada que heredaste", "💬 Asistente conversacional", "Explicar una fórmula es una conversación: no requiere datos personales y el resultado se verifica probando la fórmula."],
   ["Crear una columna de control directamente en tu planilla corporativa", "📊 IA integrada en la ofimática", "Trabaja dentro del archivo con la cuenta de la empresa, sin copiar los datos a otro sistema."],
   ["Extraer las cláusulas de bonos de un contrato colectivo de 60 páginas", "📄 Lectura y explicación de documentos", "Resume y extrae condiciones de documentos largos; pide la cláusula para verificar contra el original."],
   ["Encontrar valores atípicos de horas extra en una base sintética de 250 registros", "🔎 Análisis de datos", "Detecta patrones y variaciones en bases de datos; con datos sintéticos el riesgo de confidencialidad desaparece."]
  ]}},
 "builders": {"ficha": {
  "title": "Mi ficha de selección de herramienta",
  "rows": [
   {"type": "text", "label": "Tarea que quieres apoyar con IA", "ph": "Ej.: revisar la lógica de la planilla de horas extra"},
   {"label": "Tipo de datos que usarás", "options": OPTS_DATA},
   {"label": "Herramienta que piensas usar", "options": OPTS_TOOL},
   {"label": "Control antes de usar el resultado", "options": ["Probar con casos conocidos", "Contrastar con la fuente oficial o el documento original", "Revisión de una segunda persona", "Ninguno: uso directo del resultado"]}
  ]}},
 "quiz": [
  {"q": "¿Qué diferencia principal hay entre una herramienta pública con cuenta personal y un entorno corporativo autorizado?",
   "o": ["La calidad de las respuestas.", "Cómo se tratan los datos: dónde se procesan, quién accede y qué acuerdos de confidencialidad existen.", "El idioma en que responden.", "No hay diferencias relevantes."], "c": 1,
   "f": ["Ambas pueden dar respuestas de calidad parecida; la diferencia clave está en el tratamiento de los datos.", "Correcto: el entorno define si puedes usar la herramienta con información interna o salarial.", "El idioma no es el criterio de seguridad que importa.", "Sí las hay: los acuerdos, el control de accesos y el registro cambian por completo el riesgo."]},
  {"q": "Camila quiere crear una columna de control dentro de su planilla corporativa. ¿Qué modalidad es la más adecuada?",
   "o": ["IA integrada en la ofimática corporativa.", "Una extensión gratuita no revisada por TI.", "Un chat público copiando toda la planilla.", "Un lector de PDF con IA."], "c": 0,
   "f": ["Correcto: trabaja dentro del archivo y con la cuenta de la empresa, sin copiar los datos.", "Un servicio no revisado por TI no debe recibir información interna.", "Copiar la planilla a un chat público expone información salarial.", "Un lector de PDF no está pensado para crear fórmulas dentro de una planilla."]},
  {"q": "La plataforma corporativa está aprobada por TI. ¿Qué datos debería cargar Camila para analizar variaciones de horas extra por área?",
   "o": ["La base completa, porque el entorno está autorizado.", "Nombres y montos, sin RUT.", "Código interno, área, horas extra y monto; sin datos bancarios ni identificadores directos.", "Solo los RUT."], "c": 2,
   "f": ["El principio de minimización aplica igual: solo lo necesario para la tarea.", "El nombre junto al monto sigue identificando a cada persona.", "Correcto: son los datos mínimos que necesita el análisis.", "El RUT es un identificador directo y no aporta al análisis de variaciones."]},
  {"q": "¿Qué conviene pedir al usar IA para resumir un contrato colectivo?",
   "o": ["Que responda sin referencias para que sea más breve.", "La cláusula o página de cada punto, para verificar contra el original.", "Que reemplace al contrato en adelante.", "Nada: los resúmenes de IA no tienen errores."], "c": 1,
   "f": ["Sin referencias no podrás comprobar si el resumen es fiel al documento.", "Correcto: la referencia permite verificar cada punto en el documento original.", "El resumen es una ayuda; el documento original sigue siendo la fuente válida.", "Los resúmenes pueden omitir o distorsionar condiciones; por eso se verifican."]},
  {"q": "Si no sabes dónde procesa los datos una herramienta, ¿cómo debes tratarla?",
   "o": ["Como una herramienta corporativa.", "Como una herramienta pública: sin datos reales hasta que TI la revise.", "Depende de si es gratuita.", "Como una herramienta segura si tiene buenas reseñas."], "c": 1,
   "f": ["Sin información sobre el tratamiento de datos no puedes asumir que es segura.", "Correcto: ante la duda, trátala como pública y consulta a TI.", "Que sea gratuita o pagada no indica cómo trata los datos.", "Las reseñas de otros usuarios no reemplazan una revisión de seguridad."]}
 ]
}
p = pathlib.Path(__file__).with_name("lesson.json")
p.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
