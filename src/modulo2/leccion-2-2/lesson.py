# Genera lesson.json de la Lección 2.2 (sin narración)
import json, pathlib
L = {
 "id": "ia_rem_l22", "ident": "IAREM_M2_L22", "zip_name": "Leccion_2_2_IA_y_formulas_de_Excel",
 "title": "Lección 2.2 — IA como asistente para fórmulas de Excel",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 2 · LECCIÓN 2.2",
 "voice": False, "pass": 0.8, "hoja": True,
 "video": {"voice": False, "scenes": [
  {"t": "Una fórmula en segundos", "lines": [
    "La IA puede escribir y explicar una fórmula de Excel en segundos.",
    "Pero una fórmula que se ve bien no siempre calcula bien: la IA escribe y tú pruebas."],
   "html": "<div class=\"v-final\">La IA <em>escribe</em> · tú <em>pruebas</em></div><div class=\"v-chk\"><span data-at=\"0\">Escribir fórmulas</span><span data-at=\"0\">Explicarlas paso a paso</span><span data-at=\"1\">Probarlas antes de usarlas</span></div>"},
  {"t": "Pedir con contexto", "lines": [
    "Una buena solicitud indica las columnas, la regla de negocio y en qué celda irá la fórmula.",
    "Y aclara la versión: Excel en español usa nombres de funciones en español y punto y coma entre argumentos."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Columnas y celdas (sin datos de personas)</div><div data-at=\"0\">Regla: recargo mínimo de 50 %</div><div data-at=\"1\">Excel en español · separador ;</div><div data-at=\"1\">Cómo la vas a copiar</div></div>"},
  {"t": "Cuatro errores típicos", "lines": [
    "Algunos errores se repiten: referencias sin el signo dólar y BUSCARV sin coincidencia exacta.",
    "También aparecen comas en vez de punto y coma, y funciones escritas en inglés."],
   "html": "<div class=\"v-log\"><div class=\"bad\" data-at=\"0\"><span>=D2*E2*I2</span><span>sin $</span></div><div class=\"bad\" data-at=\"0\"><span>=BUSCARV(I4;A2:E9;5)</span><span>sin FALSO</span></div><div class=\"bad\" data-at=\"1\"><span>=SUMAR.SI(B2:B9,…)</span><span>coma</span></div><div class=\"bad\" data-at=\"1\"><span>=COUNTIF(D2:D9;…)</span><span>inglés</span></div></div>"},
  {"t": "Probar con casos conocidos", "lines": [
    "Antes de usar una fórmula, pruébala con casos cuyo resultado ya conoces.",
    "Ocho horas extra con un valor hora de 4.000 pesos y recargo de 50 % deben dar 48.000 pesos."],
   "html": "<div class=\"v-eq\"><span>8</span><span class=\"op\">×</span><span>$4.000</span><span class=\"op\">×</span><span>1,5</span><span class=\"op\">=</span><span class=\"q\" data-at=\"1\">$48.000</span></div><div class=\"v-sub\">Caso conocido: el resultado que la fórmula debe reproducir</div>"},
  {"t": "Casos borde y copia", "lines": [
    "Incluye casos borde: cero horas, una celda vacía o un código que no existe.",
    "Después de copiar la fórmula, revisa la primera fila, una del medio y la última."],
   "html": "<div class=\"v-chk\" style=\"margin-top:0\"><span data-at=\"0\">0 horas → $0</span><span data-at=\"0\">Celda vacía</span><span data-at=\"0\">Código inexistente → aviso</span><span data-at=\"1\">Primera fila</span><span data-at=\"1\">Fila del medio</span><span data-at=\"1\">Última fila</span></div>"},
  {"t": "Entender y documentar", "lines": [
    "Pide a la IA que explique la fórmula paso a paso: si no la entiendes, no la uses.",
    "Documenta la fórmula y las pruebas que hiciste, para que otra persona pueda revisarla."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Pedir la explicación</div><div data-at=\"0\">Probar con casos conocidos</div><div data-at=\"1\">Documentar fórmula y pruebas</div><div data-at=\"1\">Revisión antes del cierre</div></div>"}
 ]},
 "builders": {"plantilla": {
  "title": "Mi plantilla para pedir fórmulas a la IA",
  "rows": [
   {"type": "text", "label": "¿Qué debe calcular o controlar la fórmula?", "ph": "Ej.: marcar con REVISAR las filas donde el monto de horas extra no coincida con horas × valor hora × 1,5"},
   {"type": "text", "label": "Columnas y celdas (sin datos de personas)", "ph": "Ej.: D2:D420 horas extra, E2:E420 valor hora, G2:G420 monto pagado; la fórmula va en H2 y se copia hasta H420"},
   {"type": "text", "label": "Regla de negocio", "ph": "Ej.: recargo mínimo de 50 % (valor hora × 1,5); tolerancia de $1 por redondeo"},
   {"label": "Versión de Excel", "options": ["Excel en español (funciones en español, separador ;)", "Excel en inglés (separador ,)", "No lo indico"]},
   {"label": "Qué pides de vuelta", "options": ["Fórmula + explicación paso a paso + casos de prueba sugeridos", "Solo la fórmula", "Que la IA calcule los resultados por mí"]},
   {"type": "text", "label": "Casos de prueba que conoces (con su resultado esperado)", "ph": "Ej.: 8 h × $4.000 → $48.000; 0 h → $0; código inexistente → aviso"}
  ]}},
 "quiz": [
  {"q": "Camila necesita una fórmula para el monto de horas extra. ¿Qué solicitud tiene más probabilidades de funcionar a la primera?",
   "o": ["“Dame una fórmula de horas extra”.",
         "“Excel en español. D2:D9 tiene horas extra, E2:E9 el valor hora e I2 el recargo 1,5. Necesito la fórmula para F2 que copiaré hasta F9; explícala”.",
         "“Te pego la planilla con nombres y RUT para que entiendas el contexto”.",
         "“Calcula tú los montos de horas extra de las 420 personas”."], "c": 1,
   "f": ["Sin columnas, regla ni versión, la IA tiene que adivinar y suele responder con celdas inventadas o en inglés.",
         "Correcto: indica columnas, regla, celda de destino, cómo se copiará y la versión de Excel.",
         "Para escribir una fórmula basta con describir las columnas; los nombres y el RUT exponen datos personales sin aportar nada.",
         "La IA asiste con la fórmula; el cálculo lo hace la planilla o el sistema, que es donde se verifica."]},
  {"q": "La fórmula =D2*E2*I2 funciona en F2, pero al copiarla hacia abajo F3 y las siguientes muestran 0. ¿Cuál es la causa?",
   "o": ["El valor hora está mal en todas las filas.", "La referencia a I2 no está fijada: al copiar se convierte en I3, I4… que están vacías.", "Excel no permite multiplicar tres celdas.", "Falta la función SUMA."], "c": 1,
   "f": ["Si el valor hora estuviera mal, F2 también fallaría.", "Correcto: se corrige con $I$2 (referencia absoluta), y D2 y E2 siguen siendo relativas.", "Sí se puede: el problema está en la referencia que se desplaza.", "No se está sumando nada; es una multiplicación por fila."]},
  {"q": "La IA propone =BUSCARV(I4;A2:E9;5) para traer el valor hora de un código. ¿Qué riesgo tiene?",
   "o": ["Ninguno: BUSCARV siempre busca el valor exacto.", "Sin el cuarto argumento FALSO, puede devolver el valor de otra fila cuando el código no existe o la tabla no está ordenada.", "Que solo funciona con números.", "Que no se puede copiar a otras celdas."], "c": 1,
   "f": ["Sin el cuarto argumento, BUSCARV usa coincidencia aproximada.", "Correcto: para códigos se usa =BUSCARV(I4;$A$2:$E$9;5;FALSO), que muestra #N/A si el código no existe.", "BUSCARV también busca textos como EMP-007.", "Se puede copiar; el riesgo es devolver un dato de otra persona."]},
  {"q": "Rodrigo pide el total de horas extra del área Planta, solo de los casos con más de 10 horas. ¿Qué función conviene pedir?",
   "o": ["CONTAR.SI", "SUMAR.SI.CONJUNTO", "REDONDEAR", "SI.ERROR"], "c": 1,
   "f": ["CONTAR.SI cuenta casos; no suma horas, y admite un solo criterio.", "Correcto: suma con varias condiciones, por ejemplo =SUMAR.SI.CONJUNTO(D2:D9;B2:B9;\"Planta\";D2:D9;\">10\").", "REDONDEAR ajusta decimales; no filtra ni suma.", "SI.ERROR reemplaza errores; no filtra ni suma."]},
  {"q": "¿Cuándo está lista para usarse una fórmula propuesta por la IA?",
   "o": ["Cuando la IA confirma que está correcta.", "Cuando no muestra errores en la primera fila.", "Cuando la probaste con casos de resultado conocido, incluidos casos borde, y cuadraste un total de control.", "Cuando es la fórmula más larga que propuso."], "c": 2,
   "f": ["La IA puede repetir su propio error; la verificación es tuya.", "Una primera fila correcta puede esconder errores al copiar (por ejemplo, referencias sin $).", "Correcto: casos conocidos, casos borde (0 horas, código inexistente) y un total de control.", "La longitud no indica exactitud; a menudo, la más simple es la más fácil de revisar."]}
 ]
}
pathlib.Path(__file__).with_name("lesson.json").write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
