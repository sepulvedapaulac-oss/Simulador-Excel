# Genera lesson.json de la Lección 3.3 (con narración)
import json, pathlib

L = {
 "id": "ia_rem_l33", "ident": "IAREM_M3_L33", "zip_name": "Leccion_3_3_Indicadores_y_visualizacion",
 "title": "Lección 3.3 — Indicadores y visualización",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 3 · LECCIÓN 3.3",
 "voice": True, "pass": 0.8,
 "narration": {
  "p01": "Te damos la bienvenida a la lección tres punto tres. La gerencia quiere un tablero con los indicadores de remuneraciones de octubre. Camila le pidió a la inteligencia artificial que propusiera los gráficos y recibió una primera versión. Antes de usarla, mira lo que propuso.",
  "p03": "Cada pregunta de la gerencia necesita un tipo de gráfico distinto. Para cada pregunta, elige el gráfico que la responde mejor y mira cómo se ve con los datos de AndesCorp.",
  "p04": "Este es el gráfico que la inteligencia artificial propuso para mostrar las horas extra por área. Se ve muy bien, pero tiene cinco problemas que pueden engañar a quien lo lee. Toca cada punto numerado para descubrirlos.",
  "p05": "Un indicador sin fórmula es solo una cifra. Une cada indicador con la fórmula que lo calcula. Así sabrás qué pedirle a la inteligencia artificial y cómo verificar su resultado.",
  "p06": "Camila arma el tablero para la gerencia. Tiene que elegir los indicadores principales y decidir qué hacer con un gráfico que exagera una diferencia. Toma las decisiones con ella.",
  "quiz": "Llegó el momento de comprobar lo aprendido. Son cinco preguntas y necesitas al menos cuatro correctas para finalizar la lección. Cada alternativa tiene su explicación.",
  "p08": "Ahora diseña la ficha de un indicador para tu trabajo: su nombre, su fórmula, su fuente, el gráfico que usarás y el control que harás antes de publicarlo. Después compárala con la respuesta modelo.",
  "p09": "Terminaste la lección tres punto tres. Recuerda: cada indicador necesita una fórmula y una fuente, y cada pregunta tiene su gráfico. Revisa siempre los ejes, las escalas y las fuentes de los gráficos que propone la inteligencia artificial. En la próxima lección escribirás el informe ejecutivo."
 },
 "video": {"voice": True, "scenes": [
  {"t": "De datos a decisiones", "lines": [
    "Un tablero sirve si ayuda a decidir. Por eso empieza con las preguntas de la gerencia, no con los gráficos.",
    "Cada pregunta define qué indicador calcular y cómo mostrarlo."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Pregunta</div><div data-at=\"1\">Indicador</div><div data-at=\"1\">Gráfico</div></div>"},
  {"t": "Indicadores con fórmula", "lines": [
    "Un indicador tiene nombre, fórmula, fuente y período. Por ejemplo, el costo promedio por persona es el costo total del mes dividido por la dotación.",
    "Si no puedes escribir la fórmula, no sabrás si el número es correcto."],
   "html": "<div class=\"v-final\">Costo promedio = <em>costo total</em> / dotación</div><div class=\"v-chk\"><span data-at=\"1\">Fórmula</span><span data-at=\"1\">Fuente</span><span data-at=\"1\">Período</span></div>"},
  {"t": "El gráfico adecuado", "lines": [
    "Para comparar áreas, barras. Para mostrar la evolución en el tiempo, líneas. Para la composición de un total, barras apiladas o un gráfico de anillo con pocas categorías.",
    "Para ver la relación entre dos variables, un gráfico de dispersión."],
   "html": "<div class=\"v-icons\"><div><span class=\"i\">📊</span>Comparar</div><div><span class=\"i\">📈</span>Evolución</div><div class=\"dim\" data-at=\"1\"><span class=\"i\">🍩</span>Composición</div></div>"},
  {"t": "Gráficos que engañan", "lines": [
    "Un eje que no parte en cero, efectos en tres dimensiones o colores que no significan nada pueden exagerar una diferencia.",
    "La inteligencia artificial propone gráficos atractivos, pero no siempre honestos. La revisión es tuya."],
   "html": "<div class=\"v-vs\"><div class=\"warn\" data-at=\"0\"><b>Engaña</b>Eje truncado, 3D, sin fuente<small>Exagera diferencias</small></div><div data-at=\"1\"><b>Informa</b>Eje en cero, título claro, fuente<small>Se lee en segundos</small></div></div>"},
  {"t": "Antes de publicar", "lines": [
    "Antes de publicar un tablero, cuadra cada cifra con la base y revisa ejes, escalas, títulos y fuentes.",
    "En esta lección elegirás gráficos, encontrarás trampas y unirás indicadores con sus fórmulas."],
   "html": "<div class=\"v-final\">Cifras <em>cuadradas</em>,<br/>gráficos honestos.</div>"}
 ]},
 "hotspots": {"eng": [
  {"t": "1. El eje vertical no parte en cero", "lvl": ["no", "Exagera la diferencia"],
   "html": "<div>El eje empieza en 300 horas. Planta (520 h) parece tener <b>casi cuatro veces</b> las horas de Ventas (360 h), cuando en realidad tiene 1,4 veces.</div><div><b>Corrección:</b> en gráficos de barras, el eje parte en cero.</div>"},
  {"t": "2. Efecto en tres dimensiones", "lvl": ["no", "Distorsiona la lectura"],
   "html": "<div>La profundidad hace que las barras del fondo se vean más grandes y dificulta leer el valor exacto.</div><div><b>Corrección:</b> barras planas, sin sombras ni perspectiva.</div>"},
  {"t": "3. Colores sin significado", "lvl": ["mid", "Confunde"],
   "html": "<div>Cada barra tiene un color distinto, pero los colores no representan nada. El lector busca un significado que no existe.</div><div><b>Corrección:</b> un solo color y, si quieres destacar algo, un color de acento para esa barra.</div>"},
  {"t": "4. Título que no dice nada", "lvl": ["mid", "No guía la lectura"],
   "html": "<div>“Gráfico 1” no dice qué muestra ni qué concluir.</div><div><b>Corrección:</b> un título con la idea: “Planta concentra el 32 % de las horas extra de octubre”.</div>"},
  {"t": "5. Sin fuente ni período", "lvl": ["no", "No se puede verificar"],
   "html": "<div>No indica de dónde salen los datos ni a qué mes corresponden.</div><div><b>Corrección:</b> “Fuente: registro de asistencia aprobado, octubre 2026. Datos ficticios.”</div>"}
 ]},
 "pairs": {"kpi": {
  "order": [3, 0, 4, 1, 2],
  "hint": "Piensa en qué se divide por qué: ¿el resultado es un monto por persona, una proporción o un cambio entre meses?",
  "items": [
   ["Costo promedio por persona", "Costo total del mes / dotación del mes", "Muestra cuánto cuesta en promedio cada trabajador. Cambia si entran personas con sueldos distintos."],
   ["Peso de las horas extra", "Monto de horas extra / total de haberes", "Indica qué parte del costo se va en horas extra. Un alza sostenida puede señalar falta de dotación."],
   ["Variación mensual del costo", "(Costo del mes − costo del mes anterior) / costo del mes anterior", "Siempre se divide por el mes base. Se informa junto a la variación en pesos."],
   ["Participación de los bonos", "Total de bonos / total de haberes", "Muestra cuánto del costo es variable. Un pago único (como un bono anual) la infla ese mes."],
   ["Tasa de ingresos del mes", "Ingresos del mes / dotación al inicio del mes", "Ayuda a explicar el efecto dotación en la variación del costo."]
  ]}},
 "builders": {"ficha": {
  "title": "Ficha de mi indicador",
  "rows": [
   {"type": "text", "label": "Nombre del indicador", "ph": "Ej.: peso de las horas extra sobre el total de haberes"},
   {"type": "text", "label": "Fórmula", "ph": "Ej.: monto de horas extra del mes / total de haberes del mes"},
   {"label": "Fuente de los datos", "options": ["Lo que responda la IA", "La base cuadrada con el sistema de remuneraciones, con su diccionario", "Una planilla antigua del área"], "model": 1,
    "why": "<b>Modelo:</b> la base cuadrada y documentada. La IA calcula sobre lo que le entregas; no es una fuente."},
   {"label": "Gráfico", "options": ["El que proponga la IA, sin revisar", "El que responde la pregunta: barras para comparar, líneas para evolución", "Un gráfico en 3D para que se vea mejor"], "model": 1,
    "why": "<b>Modelo:</b> el tipo de gráfico sale de la pregunta. Los efectos 3D distorsionan."},
   {"label": "Control antes de publicar", "options": ["Ninguno", "Cuadrar la cifra con la base y revisar ejes, título, fuente y período", "Pedirle a la IA que lo revise"], "model": 1,
    "why": "<b>Modelo:</b> la cifra se cuadra con la base y el gráfico se revisa contra la lista de trampas."}
  ]}},
 "quiz": [
  {"q": "La gerencia quiere ver cómo evolucionó el costo mensual durante el último año. ¿Qué gráfico usas?",
   "o": ["Gráfico de líneas.", "Gráfico de anillo.", "Tabla de 12 columnas sin gráfico."], "c": 0,
   "f": ["Correcto: las líneas muestran tendencias en el tiempo.", "El anillo muestra la composición de un total en un momento, no la evolución.", "Una tabla sirve como respaldo, pero la tendencia se lee mejor en líneas."]},
  {"q": "Un gráfico de barras de horas extra empieza su eje en 300. ¿Cuál es el problema?",
   "o": ["Ninguno, se ve más claro.", "Exagera las diferencias entre áreas.", "Hace que todas las barras se vean iguales."], "c": 1,
   "f": ["Se ve más dramático, no más claro: la diferencia parece mayor de lo que es.", "Correcto: en barras, el eje debe partir en cero para comparar proporciones reales.", "Ocurre lo contrario: las diferencias se agrandan."]},
  {"q": "¿Cómo se calcula el peso de las horas extra?",
   "o": ["Horas extra / dotación.", "Monto de horas extra / total de haberes.", "Total de haberes / horas extra."], "c": 1,
   "f": ["Eso da horas extra por persona, otro indicador.", "Correcto: indica qué proporción del costo corresponde a horas extra.", "Está invertido: no da una proporción interpretable."]},
  {"q": "La IA entregó un tablero con cifras que no coinciden con la base. ¿Qué haces?",
   "o": ["Lo publico: la diferencia es pequeña.", "Identifico qué indicador no cuadra, reviso la fórmula y corrijo antes de publicar.", "Pido a la IA que ajuste la base a sus cifras."], "c": 1,
   "f": ["Una cifra que no cuadra destruye la confianza en todo el tablero.", "Correcto: cada cifra se cuadra con la base antes de publicar.", "La base cuadrada es la referencia; no se ajusta a un resultado."]},
  {"q": "¿Qué título es mejor para un gráfico de horas extra por área?",
   "o": ["“Gráfico 1”.", "“Planta concentra el 32 % de las horas extra de octubre”.", "“Horas extra”."], "c": 1,
   "f": ["No dice qué muestra ni qué concluir.", "Correcto: el título comunica la idea principal y el período.", "Dice el tema, pero no la conclusión ni el período."]}
 ]
}
p = pathlib.Path(__file__).with_name("lesson.json")
p.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
