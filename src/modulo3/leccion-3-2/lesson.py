# Genera lesson.json de la Lección 3.2 (sin narración)
import json, pathlib

L = {
 "id": "ia_rem_l32", "ident": "IAREM_M3_L32", "zip_name": "Leccion_3_2_Variaciones_mensuales",
 "title": "Lección 3.2 — Variaciones mensuales",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 3 · LECCIÓN 3.2",
 "voice": False, "pass": 0.8,
 "video": {"voice": False, "scenes": [
  {"t": "¿Cuánto y por qué?", "lines": [
    "Una variación tiene dos preguntas: cuánto cambió y qué lo explica.",
    "La IA ayuda a calcular y ordenar, pero la explicación se valida con los datos."],
   "html": "<div class=\"v-vs\"><div data-at=\"0\"><b>¿Cuánto?</b>Variación absoluta y porcentual<small>Cálculo</small></div><div data-at=\"1\"><b>¿Por qué?</b>Componentes y causas<small>Explicación verificada</small></div></div>"},
  {"t": "Absoluta y porcentual", "lines": [
    "La variación absoluta es la diferencia en pesos: octubre menos septiembre.",
    "La porcentual divide esa diferencia por el valor de septiembre. Siempre se informan juntas."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Absoluta = Oct − Sep</div><div data-at=\"1\">Porcentual = (Oct − Sep) / Sep</div></div>"},
  {"t": "Descomponer la variación", "lines": [
    "El total se descompone en efectos: más personas, reajustes, horas extra y bonos.",
    "Cada efecto se calcula por separado y la suma debe cuadrar con la variación total."],
   "html": "<div class=\"v-chk\"><span data-at=\"0\">Dotación</span><span data-at=\"0\">Reajuste</span><span data-at=\"1\">Horas extra</span><span data-at=\"1\">Bonos</span></div>"},
  {"t": "Hecho, hipótesis o error", "lines": [
    "Un informe de IA mezcla hechos calculados, hipótesis sobre las causas y, a veces, errores.",
    "Un hecho se comprueba con la base. Una hipótesis se confirma con una fuente. Un error se corrige."],
   "html": "<div class=\"v-icons\"><div><span class=\"i\">✅</span>Hecho</div><div><span class=\"i\">❓</span>Hipótesis</div><div class=\"dim\" data-at=\"1\"><span class=\"i\">✕</span>Error</div></div>"},
  {"t": "La regla de oro", "lines": [
    "Ninguna explicación llega a la gerencia sin cuadrar con los números.",
    "En esta lección calcularás la variación de octubre y separarás hechos de hipótesis."],
   "html": "<div class=\"v-final\">Si los efectos no <em>suman</em> la variación,<br/>falta algo.</div>"}
 ]},
 "sorts": {"hhe": {
  "bins": [{"id": "hecho", "title": "Hecho", "sub": "Se comprueba con la base", "cls": "good-bin"},
           {"id": "hip", "title": "Hipótesis", "sub": "Requiere una fuente que la confirme", "cls": "mid-bin"},
           {"id": "err", "title": "Error", "sub": "Contradice los datos", "cls": "bad-bin"}],
  "order": [3, 6, 0, 7, 2, 5, 1, 4],
  "items": [
   {"t": "El costo total subió de $498,0 M a $537,9 M (+8,0 %).", "bin": "hecho", "why": "Se calcula directamente con la base cuadrada: 537,88 / 498,0 − 1 = 8,0 %.", "hint": "¿Se puede comprobar con una resta y una división?"},
   {"t": "La dotación pasó de 412 a 420 personas.", "bin": "hecho", "why": "Es un conteo de registros de cada mes, cuadrado con el sistema.", "hint": "Es un conteo de la base."},
   {"t": "Las horas extra subieron 18 % ($18,0 M a $21,2 M).", "bin": "hecho", "why": "21,24 / 18,0 − 1 = 18 %: se comprueba con la base.", "hint": "Haz la división."},
   {"t": "Los bonos subieron 69 % ($26,8 M a $45,4 M).", "bin": "hecho", "why": "45,4 / 26,8 − 1 = 69 %. Es un cálculo; la causa es otra pregunta.", "hint": "Separa el cálculo de su causa."},
   {"t": "El alza de bonos se debe al pago del bono anual de cumplimiento en octubre.", "bin": "hip", "why": "Es probable, pero se confirma con la novedad aprobada del bono anual antes de informarlo.", "hint": "¿Qué documento lo confirmaría?"},
   {"t": "El alza de horas extra de Planta se repetirá en noviembre.", "bin": "hip", "why": "Es una proyección: depende de si el pedido especial continúa. Se confirma con Operaciones.", "hint": "¿Los datos de octubre permiten afirmarlo?"},
   {"t": "El reajuste de 2 % explica la mayor parte del alza.", "bin": "err", "why": "El reajuste explica $9,24 M de $39,88 M (23 %). El efecto más grande son los bonos ($18,6 M).", "hint": "Compara el efecto del reajuste con la variación total."},
   {"t": "El costo por trabajador bajó en octubre.", "bin": "err", "why": "Subió: de $1,209 M (498,0 / 412) a $1,281 M (537,88 / 420).", "hint": "Divide el costo por la dotación de cada mes."}
  ]}},
 "builders": {"var": {
  "title": "Mi instrucción para analizar una variación",
  "rows": [
   {"type": "text", "label": "Variación que necesitas explicar", "ph": "Ej.: aumento del costo de remuneraciones de Ventas entre agosto y septiembre"},
   {"label": "1 · Datos que entregarás", "options": ["La exportación completa del sistema", "Base agregada por área y componente de los dos meses, cuadrada con el sistema, con su diccionario", "Solo el total de cada mes"], "model": 1,
    "why": "<b>Modelo:</b> agregados por área y componente, cuadrados y documentados. Con solo totales no se puede descomponer; con la exportación completa expones datos innecesarios."},
   {"label": "2 · Cálculos que pedirás", "options": ["Que la IA “explique el alza”", "Variación absoluta y porcentual por componente y efectos (dotación, reajuste, horas extra, bonos) que sumen la variación total", "Solo el porcentaje total"], "model": 1,
    "why": "<b>Modelo:</b> cálculos explícitos y una descomposición que cuadre. Así puedes verificar cada cifra."},
   {"label": "3 · Restricción clave", "options": ["Ninguna", "Separar hechos calculados de hipótesis y marcar qué fuente confirmaría cada hipótesis", "Que redacte con tono positivo"], "model": 1,
    "why": "<b>Modelo:</b> la IA debe distinguir lo calculado de lo supuesto. Las hipótesis se confirman antes de informarlas."},
   {"label": "4 · Formato", "options": ["Un párrafo largo", "Tabla de efectos más tres conclusiones de máximo dos líneas", "Una presentación de diez diapositivas"], "model": 1,
    "why": "<b>Modelo:</b> una tabla verificable y conclusiones breves, listas para el informe ejecutivo de la lección 3.4."}
  ]}},
 "quiz": [
  {"q": "El costo de un área pasó de $40 M a $46 M. ¿Cuál es la variación?",
   "o": ["$6 M y 15 %.", "$6 M y 13 %.", "$46 M y 6 %."], "c": 0,
   "f": ["Correcto: absoluta = 46 − 40 = $6 M; porcentual = 6 / 40 = 15 %.", "13 % sería dividir por 46: la porcentual se calcula sobre el valor inicial (40).", "Confunde el valor final con la variación."]},
  {"q": "Un área de 2 personas sube su costo 50 % y Ventas, de 120 personas, sube 3 %. ¿Qué conviene destacar?",
   "o": ["El 50 %, porque es el porcentaje más alto.", "Ambos con su variación absoluta en pesos, para dimensionar el impacto real.", "Ninguno: los porcentajes no sirven."], "c": 1,
   "f": ["Un porcentaje alto sobre una base pequeña puede ser poco dinero. Sin la cifra absoluta, el informe exagera.", "Correcto: porcentaje y monto juntos permiten comparar impactos.", "Los porcentajes sirven, pero siempre acompañados de la cifra absoluta."]},
  {"q": "La IA descompone la variación en cuatro efectos que suman $35 M, pero la variación total es $39,9 M. ¿Qué haces?",
   "o": ["Informo los cuatro efectos: la diferencia es menor.", "Busco el efecto que falta o el error de cálculo antes de informar.", "Ajusto un efecto para que cuadre."], "c": 1,
   "f": ["Casi $5 M sin explicar es una diferencia relevante: algo falta o está mal calculado.", "Correcto: los efectos deben sumar la variación total; si no, falta un componente o hay un error.", "Forzar el cuadre esconde el problema."]},
  {"q": "¿Cuál de estas afirmaciones es una hipótesis?",
   "o": ["La dotación pasó de 412 a 420 personas.", "El alza de horas extra se debe a un pedido especial de Planta.", "Los bonos subieron $18,6 M."], "c": 1,
   "f": ["Es un hecho: un conteo verificable en la base.", "Correcto: es una causa probable que se confirma con Operaciones o con la novedad aprobada.", "Es un hecho calculado con la base."]},
  {"q": "La IA afirma que “el costo por trabajador bajó”. Septiembre: $498,0 M y 412 personas; octubre: $537,9 M y 420. ¿Qué concluyes?",
   "o": ["Es correcto.", "Es un error: subió de $1,21 M a $1,28 M por persona.", "No se puede saber."], "c": 1,
   "f": ["498,0 / 412 = 1,209 y 537,9 / 420 = 1,281: subió.", "Correcto: verifica siempre los cálculos de la IA con la base.", "Con el costo y la dotación se calcula directamente."]}
 ]
}
p = pathlib.Path(__file__).with_name("lesson.json")
p.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
