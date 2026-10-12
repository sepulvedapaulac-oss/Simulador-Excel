# Genera lesson.json de la Lección 4.3 (con narración)
import json, pathlib

OPT_IA = ["Que la IA calcule las liquidaciones finales",
          "Que la IA ordene, clasifique o redacte borradores en la etapa, y señale lo dudoso",
          "Que la IA apruebe los resultados para ahorrar tiempo"]
OPT_SIS = ["Una planilla paralela con fórmulas propias",
           "El sistema de remuneraciones, que es la fuente oficial",
           "La respuesta de la IA"]
OPT_CTRL = ["Después del pago, si alguien reclama",
            "Antes de que el resultado se cargue al sistema o se pague, con criterio definido",
            "No hace falta si la IA está bien configurada"]
OPT_REG = ["No se registra nada para no perder tiempo",
           "Quién revisó, qué decidió, con qué evidencia y cuándo",
           "Solo la respuesta final de la IA"]

L = {
 "id": "ia_rem_l43", "ident": "IAREM_M4_L43", "zip_name": "Leccion_4_3_Flujo_de_remuneraciones_asistido_por_IA",
 "title": "Lección 4.3 — Flujo de remuneraciones asistido por IA",
 "course_label": "IA EN REMUNERACIONES · MÓDULO 4 · LECCIÓN 4.3",
 "voice": True, "pass": 0.8,
 "narration": {
  "p01": "Te damos la bienvenida a la lección cuatro punto tres. El piloto de novedades redujo el trabajo de diez a tres horas al mes. Ahora Rodrigo quiere rediseñar el cierre completo y saber qué hace la inteligencia artificial, qué hace el sistema y dónde revisa una persona.",
  "p03": "Estos son los siete pasos del nuevo cierre asistido, pero están desordenados. Usa las flechas para ponerlos en orden y luego comprueba. Piensa qué necesita estar listo antes de cada paso.",
  "p04": "En el diagrama, cada etapa tiene un actor principal: la inteligencia artificial asiste, el sistema calcula y una persona decide. Toca cada número para ver qué ocurre y qué registro queda.",
  "p05": "Camila ejecuta el primer cierre asistido, el de noviembre. En cada etapa aparece una situación real. Elige la mejor decisión y observa cómo se completa la bitácora del cierre.",
  "quiz": "Llegó el momento de comprobar lo aprendido. Son cinco preguntas y necesitas al menos cuatro correctas para finalizar la lección. Cada alternativa tiene su explicación.",
  "p07": "Ahora diseña una etapa asistida de tu propio proceso. Define qué hace la inteligencia artificial, qué hace el sistema, dónde va el control humano y qué queda registrado. Después compáralo con la respuesta modelo.",
  "p08": "Terminaste la lección cuatro punto tres. Recuerda: la inteligencia artificial asiste, el sistema calcula y una persona decide antes de pagar, dejando registro de cada paso. En la próxima lección armarás tu proyecto integrador."
 },
 "video": {"voice": True, "scenes": [
  {"t": "Tres actores", "lines": [
    "En un cierre asistido trabajan tres actores: la inteligencia artificial, el sistema de remuneraciones y las personas.",
    "Cada uno hace lo que mejor sabe hacer."],
   "html": "<div class=\"v-icons\"><div><span class=\"i\">✦</span>IA asiste</div><div><span class=\"i\">🏢</span>Sistema calcula</div><div class=\"dim\" data-at=\"1\"><span class=\"i\">🧑‍💼</span>Persona decide</div></div>"},
  {"t": "Lo que hace la IA", "lines": [
    "La IA ordena novedades, clasifica correos, señala posibles inconsistencias y redacta borradores.",
    "No calcula las liquidaciones oficiales ni aprueba nada."],
   "html": "<div class=\"v-chk\"><span data-at=\"0\">Ordena</span><span data-at=\"0\">Clasifica</span><span data-at=\"0\">Señala</span><span data-at=\"1\">Redacta borradores</span></div>"},
  {"t": "Lo que hace el sistema", "lines": [
    "El sistema de remuneraciones calcula las liquidaciones con los parámetros vigentes.",
    "Es la fuente oficial: toda corrección se hace ahí, con respaldo."],
   "html": "<div class=\"v-final\">El sistema es la <em>fuente oficial</em>.</div>"},
  {"t": "Dónde decide una persona", "lines": [
    "Una persona valida las novedades dudosas, revisa las alertas y aprueba la nómina con un segundo revisor.",
    "Cada punto de control va antes de que algo se vuelva oficial o se pague."],
   "html": "<div class=\"v-steps\"><div data-at=\"0\">Validar novedades</div><div data-at=\"1\">Revisar alertas</div><div data-at=\"1\">Aprobar con cuatro ojos</div></div>"},
  {"t": "Todo queda registrado", "lines": [
    "Cada decisión deja un registro: quién revisó, qué decidió y con qué evidencia.",
    "En esta lección ordenarás el flujo y ejecutarás el primer cierre asistido con Camila."],
   "html": "<div class=\"v-final\">IA asiste, sistema calcula,<br/>persona <em>decide</em>.</div>"}
 ]},
 "order": {"flujo": {"steps": [
   {"t": "Recibir las novedades por formulario; la IA las ordena y marca las dudosas", "why": "La entrada ordenada es la base de todo el flujo."},
   {"t": "Validar con las jefaturas las novedades marcadas", "why": "Primer control humano: nada ambiguo entra al sistema."},
   {"t": "Cargar las novedades y calcular en el sistema de remuneraciones", "why": "El sistema calcula con los parámetros vigentes: es la fuente oficial."},
   {"t": "Ejecutar los controles automáticos: cuadraturas y alertas de la IA", "why": "Fórmulas e IA comparan contra el mes anterior y las reglas, y señalan diferencias."},
   {"t": "Revisar cada alerta y corregir en el sistema con respaldo", "why": "Segundo control humano: corregir, investigar o descartar con evidencia."},
   {"t": "Aprobar la nómina con un segundo revisor", "why": "Cuatro ojos antes de pagar."},
   {"t": "Pagar, enviar el informe de variaciones y archivar la bitácora", "why": "La IA redacta el borrador del informe; la bitácora deja la trazabilidad."}
  ], "start": [4, 0, 6, 2, 5, 1, 3]}},
 "hotspots": {"diag": [
  {"t": "1. Novedades · la IA asiste", "lvl": ["mid", "IA con revisión"],
   "html": "<div><b>Qué pasa:</b> las jefaturas envían novedades por un formulario. La IA las ordena en la planilla de carga y marca las ambiguas o fuera de rango.</div><div><b>Registro:</b> planilla de novedades con la columna “marcada por IA” y el motivo.</div>"},
  {"t": "2. Validación · decide una persona", "lvl": ["ok", "Control humano"],
   "html": "<div><b>Qué pasa:</b> Camila aclara cada novedad marcada con la jefatura que la envió. Solo entran al sistema las novedades confirmadas.</div><div><b>Registro:</b> respuesta de la jefatura y fecha de validación.</div>"},
  {"t": "3. Cálculo · el sistema", "lvl": ["ok", "Fuente oficial"],
   "html": "<div><b>Qué pasa:</b> el sistema de remuneraciones calcula las liquidaciones con los parámetros vigentes del período.</div><div><b>Registro:</b> libro de remuneraciones y parámetros usados. La IA nunca reemplaza este cálculo.</div>"},
  {"t": "4. Controles · la IA asiste", "lvl": ["mid", "IA con revisión"],
   "html": "<div><b>Qué pasa:</b> fórmulas de cuadratura comparan totales con el mes anterior y la IA señala posibles inconsistencias: duplicados, montos fuera de rango, topes.</div><div><b>Registro:</b> lista de alertas con su clasificación: corregir, investigar o descartar.</div>"},
  {"t": "5. Aprobación · decide una persona", "lvl": ["ok", "Cuatro ojos"],
   "html": "<div><b>Qué pasa:</b> Rodrigo revisa las alertas resueltas y los totales, y aprueba la nómina antes del pago. La IA redacta el borrador del informe de variaciones, que Camila verifica.</div><div><b>Registro:</b> aprobación con nombre y fecha, y bitácora del cierre archivada.</div>"}
 ]},
 "stepper": [
  {"t": "Novedades", "ctx": "Llegan 64 novedades por el formulario. La IA marca 5 como dudosas; una dice: “bono especial Planta, monto por confirmar”.",
   "q": "¿Qué hace Camila con las novedades marcadas?",
   "o": ["Carga las 64 tal como llegaron: la jefatura sabrá lo que pide.",
         "Carga las 59 confirmadas y aclara las 5 marcadas con cada jefatura antes de cargarlas.",
         "Le pide a la IA que estime el monto del bono especial."],
   "c": 1,
   "f": ["Cargar “monto por confirmar” lleva a pagar algo que nadie aprobó.",
         "Las novedades claras avanzan y las dudosas se validan con quien las envió. Nada ambiguo entra al sistema.",
         "La IA no sabe cuál es el monto aprobado. Inventarlo es pagar sin respaldo."],
   "log": "Novedades: 59 cargadas; 5 validadas con jefaturas (bono especial Planta confirmado por correo)."},
  {"t": "Cálculo", "ctx": "Con las novedades confirmadas, toca calcular las liquidaciones de noviembre.",
   "q": "¿Dónde se calculan?",
   "o": ["En el sistema de remuneraciones, con los parámetros vigentes del período.",
         "En una planilla que generó la IA, porque es más rápida.",
         "En el sistema, pero con los parámetros del año pasado para comparar."],
   "c": 0,
   "f": ["El sistema es la fuente oficial y usa los parámetros vigentes.",
         "Una planilla paralela no es oficial y puede tener fórmulas con errores que nadie revisó.",
         "Para pagar se usan los parámetros vigentes; la comparación se hace en los controles."],
   "log": "Cálculo: liquidaciones de noviembre en el sistema con parámetros vigentes."},
  {"t": "Controles", "ctx": "Los controles automáticos muestran estas diferencias contra octubre:",
   "table": [["Control", "Octubre", "Noviembre"], ["Dotación", "420", "422"], ["Horas extra Planta", "$9.120.000", "$9.120.000"], ["Bonos", "$45.400.000", "$27.900.000"], ["Registros duplicados", "0", "1"]],
   "q": "¿Qué alerta debe revisarse con más urgencia antes de aprobar?",
   "o": ["La baja de bonos: siempre es un error.",
         "El registro duplicado, porque podría generar un doble pago.",
         "Ninguna: los controles ya hicieron el trabajo."],
   "c": 1,
   "f": ["La baja de bonos se explica: en octubre se pagó el bono anual. Se verifica, pero no es urgente.",
         "Un duplicado puede pagar dos veces a una persona. Se revisa y corrige en el sistema antes de aprobar.",
         "Los controles señalan; una persona revisa y decide."],
   "log": "Controles: duplicado EMP-317 corregido en el sistema; baja de bonos explicada por el bono anual de octubre."},
  {"t": "Aprobación", "ctx": "Todo está revisado. Rodrigo está en una reunión y el pago debe enviarse hoy.",
   "q": "¿Cómo se aprueba la nómina?",
   "o": ["Camila la aprueba sola para no atrasar el pago.",
         "Rodrigo revisa el resumen de alertas resueltas y los totales, y aprueba con su nombre y fecha.",
         "La IA genera una aprobación automática con la firma de Rodrigo."],
   "c": 1,
   "f": ["Sin segundo revisor no hay control independiente.",
         "Cuatro ojos con evidencia: Rodrigo aprueba con el resumen que preparó Camila.",
         "Una aprobación automática no es una aprobación: nadie revisó."],
   "log": "Aprobación: Rodrigo aprueba la nómina con el resumen de alertas (29-11, 16:40)."},
  {"t": "Informe y registro", "ctx": "Tras el pago, la IA propone un borrador del informe de variaciones de noviembre.",
   "q": "¿Qué hace Camila antes de enviarlo y cerrar?",
   "o": ["Lo envía tal cual: la IA usó los datos del sistema.",
         "Verifica cada cifra con el libro de remuneraciones, marca las hipótesis y archiva el informe junto con la bitácora.",
         "Borra la bitácora porque el pago ya se hizo."],
   "c": 1,
   "f": ["La IA puede equivocarse al redactar: cada cifra se verifica.",
         "Informe verificado y bitácora archivada: el cierre queda completo y auditable.",
         "La bitácora es la evidencia del cierre: se archiva, no se borra."],
   "log": "Informe: cifras verificadas con el libro; informe y bitácora archivados en la carpeta del cierre."}
 ],
 "builders": {"etapa": {
  "title": "Mi etapa asistida por IA",
  "rows": [
   {"type": "text", "label": "Etapa de tu proceso", "ph": "Ej.: control de horas extra antes del cálculo"},
   {"label": "1 · Qué hace la IA", "options": OPT_IA, "model": 1,
    "why": "<b>Modelo:</b> la IA ordena, clasifica, redacta y señala. No calcula lo oficial ni aprueba."},
   {"label": "2 · Dónde se calcula lo oficial", "options": OPT_SIS, "model": 1,
    "why": "<b>Modelo:</b> el sistema de remuneraciones. Una planilla paralela o una respuesta de IA no son oficiales."},
   {"label": "3 · Punto de control humano", "options": OPT_CTRL, "model": 1,
    "why": "<b>Modelo:</b> antes de cargar o pagar, con un criterio definido. Después del pago, el control llega tarde."},
   {"label": "4 · Registro", "options": OPT_REG, "model": 1,
    "why": "<b>Modelo:</b> quién revisó, qué decidió, con qué evidencia y cuándo. Eso es trazabilidad."},
   {"type": "text", "label": "Responsable de la etapa (opcional)", "ph": "Ej.: analista de remuneraciones; aprueba la jefatura de Compensaciones"}
  ]}},
 "quiz": [
  {"q": "En un cierre asistido, ¿quién calcula las liquidaciones oficiales?",
   "o": ["La IA.", "El sistema de remuneraciones.", "Una planilla paralela."], "c": 1,
   "f": ["La IA asiste, pero no reemplaza el cálculo oficial.", "Correcto: el sistema calcula con los parámetros vigentes y es la fuente oficial.", "Una planilla paralela no es oficial y puede tener errores sin revisar."]},
  {"q": "¿Qué debe ocurrir con una novedad que la IA marcó como dudosa?",
   "o": ["Cargarla igual.", "Validarla con la jefatura antes de cargarla.", "Que la IA complete el dato faltante."], "c": 1,
   "f": ["Cargar lo dudoso es pagar sin respaldo.", "Correcto: lo ambiguo se aclara con quien lo envió.", "La IA no conoce el dato aprobado; completarlo sería inventar."]},
  {"q": "¿Cuál es el orden correcto?",
   "o": ["Calcular, validar novedades, pagar, revisar alertas.", "Validar novedades, calcular, revisar alertas, aprobar y pagar.", "Aprobar, calcular, validar novedades, pagar."], "c": 1,
   "f": ["Revisar alertas después de pagar llega tarde.", "Correcto: cada paso necesita que el anterior esté listo.", "No se puede aprobar algo que aún no se calcula."]},
  {"q": "¿Qué registro deja un punto de control humano?",
   "o": ["Ninguno, para ahorrar tiempo.", "Quién revisó, qué decidió, con qué evidencia y cuándo.", "Solo la respuesta de la IA."], "c": 1,
   "f": ["Sin registro no hay trazabilidad ni forma de auditar el cierre.", "Correcto: es la evidencia que permite reconstruir cada decisión.", "La respuesta de la IA no dice qué decidió la persona ni por qué."]},
  {"q": "Rodrigo no está disponible y hay que pagar hoy. ¿Qué es lo correcto?",
   "o": ["Que Camila apruebe sola.", "Que apruebe el reemplazo definido para esa función, con la misma evidencia.", "Que la IA apruebe automáticamente."], "c": 1,
   "f": ["Sin segundo revisor se pierde el control independiente.", "Correcto: el flujo debe tener un reemplazo definido para la aprobación.", "Una aprobación automática no es una revisión."]}
 ]
}
p = pathlib.Path(__file__).with_name("lesson.json")
p.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
print("lesson.json OK")
