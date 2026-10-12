# Genera lesson.json de la Lección 3.4 (sin narración)
import json, pathlib

L = {
 "id": "ia_rem_l34", "ident": "IAREM_M3_L34", "zip_name": "Leccion_3_4_Informes_ejecutivos_con_IA",
 "title": "Lección 3.4 — Informes ejecutivos con IA",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 3 · LECCIÓN 3.4",
 "voice": False, "pass": 0.8,
 "video": {"voice": False, "scenes": [
  {"t": "Un informe para decidir", "lines": [
    "Un informe ejecutivo responde una pregunta y propone una acción, en una página.",
    "La IA ayuda a redactar, pero cada cifra y cada afirmación son tu responsabilidad."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Pregunta</div><div data-at=\"0\">Respuesta con cifras</div><div data-at=\"1\">Acción recomendada</div></div>"},
  {"t": "La estructura", "lines": [
    "Primero la conclusión, luego las cifras que la respaldan y al final la recomendación.",
    "Cada cifra con su fuente y su período."],
   "html": "<div class=\"v-chk\"><span data-at=\"0\">Conclusión</span><span data-at=\"0\">Cifras</span><span data-at=\"1\">Recomendación</span><span data-at=\"1\">Fuente</span></div>"},
  {"t": "Lo que se revisa en un borrador de IA", "lines": [
    "Cifras que no cuadran, hipótesis escritas como hechos, juicios sobre personas, datos personales y referencias inventadas.",
    "Una frase errónea basta para perder la confianza de la gerencia."],
   "html": "<div class=\"v-vs\"><div class=\"warn\" data-at=\"0\"><b>Se corrige</b>Cifras, juicios, datos personales<small>Referencias inventadas</small></div><div data-at=\"1\"><b>Se mantiene</b>Hechos verificados<small>Hipótesis marcadas</small></div></div>"},
  {"t": "Antes de enviar", "lines": [
    "Antes de enviar, verifica cifras contra la base, pide una segunda lectura y deja registro de la versión enviada.",
    "En esta lección editarás el borrador que la IA preparó para la gerencia."],
   "html": "<div class=\"v-final\">La IA <em>redacta</em>.<br/>Tú <em>firmas</em>.</div>"}
 ]},
 "panels": {"linea": [
  {"t": "Día 1 · Definir la pregunta y el destinatario", "html": "<p>Qué decisión debe tomar la gerencia con el informe: “¿El alza de octubre se repetirá?”. Define también el nivel de detalle: la gerencia necesita una página, no el libro de remuneraciones.</p>"},
  {"t": "Día 1 · Preparar y cuadrar la base", "html": "<p>Base limpia, protegida y cuadrada con el sistema (lección 3.1). Sin cuadratura, el informe no empieza.</p>"},
  {"t": "Día 2 · Calcular y descomponer", "html": "<p>Variación absoluta y porcentual, y efectos que sumen la variación (lección 3.2). Indicadores y gráficos honestos (lección 3.3).</p>"},
  {"t": "Día 2 · Borrador con IA", "html": "<p>La IA redacta a partir de la tabla de efectos verificada y una instrucción con estructura, tono y extensión. Nunca a partir de la base completa con datos personales.</p>"},
  {"t": "Día 3 · Verificar cada frase", "html": "<p>Cada cifra se contrasta con la base; cada hipótesis se marca o se confirma; se eliminan juicios, datos personales y referencias sin fuente.</p>"},
  {"t": "Día 3 · Segunda lectura y envío", "html": "<p>Otra persona revisa el informe (cuatro ojos). Se envía con fuente y período, y se guarda la versión enviada junto con la base usada.</p>"}
 ]},
 "yn": {"envio": [
  ["¿Cada cifra del informe coincide con la base cuadrada?", 1, "Sí: es la primera verificación. Una cifra que no cuadra invalida el informe completo."],
  ["¿Puedo dejar una causa probable escrita como un hecho si la IA la propuso?", 0, "No: una hipótesis se confirma con una fuente o se presenta como hipótesis, con lo que falta verificar."],
  ["¿Es necesario mencionar a personas identificables para explicar un ingreso de alto costo?", 0, "No: basta con el efecto agregado (“ingresos del mes”). Un cargo único puede identificar a la persona."],
  ["¿Debo verificar que las normas o circulares citadas existan?", 1, "Sí: la IA puede inventar referencias con apariencia oficial."],
  ["¿El informe indica fuente y período de los datos?", 1, "Sí: permite verificar y evita confusiones con otros meses."],
  ["¿Puedo enviarlo sin que nadie más lo lea si tengo poco tiempo?", 0, "No: la segunda lectura detecta errores que quien escribió no ve."]
 ]},
 "quiz": [
  {"q": "¿Cuál es el orden recomendado de un informe ejecutivo?",
   "o": ["Metodología, datos, conclusión al final.", "Conclusión, cifras que la respaldan y recomendación.", "Gráficos sin texto."], "c": 1,
   "f": ["La gerencia lee el inicio: si la conclusión está al final, puede no llegar a ella.", "Correcto: primero la respuesta, luego el respaldo y la acción.", "Los gráficos necesitan una conclusión escrita que guíe la lectura."]},
  {"q": "El borrador de la IA dice: “Las horas extra subieron por mala planificación de la jefatura”. ¿Qué haces?",
   "o": ["Lo dejo: suena convincente.", "Lo reemplazo por un hecho verificable y, si corresponde, una hipótesis marcada: “subieron 18 %; Operaciones informa un pedido especial (por confirmar)”.", "Lo cambio por “la jefatura no supo planificar”."], "c": 1,
   "f": ["Es un juicio sobre personas sin evidencia.", "Correcto: hechos con cifras y causas con su fuente o marcadas como hipótesis.", "Sigue siendo un juicio sin evidencia."]},
  {"q": "El borrador cita la “Circular N.º 3.214 de la Dirección del Trabajo”. ¿Qué haces?",
   "o": ["La mantengo: da autoridad al informe.", "Verifico en la fuente oficial que exista y diga eso; si no, la elimino.", "Cambio el número por otro."], "c": 1,
   "f": ["Una referencia inventada daña la credibilidad del informe y de quien lo firma.", "Correcto: toda referencia normativa se verifica en la fuente oficial.", "Cambiar el número no la hace real."]},
  {"q": "¿Qué datos debería recibir la IA para redactar el informe?",
   "o": ["La base completa con nombres, para que sea más precisa.", "La tabla de efectos verificada y los indicadores agregados, con una instrucción de estructura y tono.", "Nada: que escriba un informe genérico."], "c": 1,
   "f": ["Para redactar no necesita datos personales.", "Correcto: datos agregados y verificados, más una instrucción clara.", "Un informe genérico no responde la pregunta de la gerencia."]},
  {"q": "¿Qué se guarda después de enviar el informe?",
   "o": ["Nada.", "La versión enviada, la base usada y quién lo revisó.", "Solo el chat con la IA."], "c": 1,
   "f": ["Sin registro no se puede responder una pregunta posterior.", "Correcto: trazabilidad del informe.", "El chat no reemplaza la base ni la versión enviada."]}
 ]
}
p = pathlib.Path(__file__).with_name("lesson.json")
p.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
