# Ejemplo de tarea con rúbrica (evaluación del módulo · Parte 2), tomado del curso de servicio al cliente.
# Se copia a src/moduloN/tarea.py y se adapta; el aprendizaje esperado sale de curso.json → "sence".
# Compilar: python3 tools/build_tarea.py src/moduloN/tarea.py
MODULO = 2
TITULO = "Una conversación que se puede salvar"
DURACION = 90
INTRO = ["**A continuación pondrás en práctica lo aprendido en el Módulo 2.** Vas a leer una conversación de chat en la que una clienta pidió ayuda urgente "
         "y fue mal atendida. Tu misión es ponerte en el lugar de quien la atendió y demostrar cómo debió comunicarse."]
PASOS = [
    ("Lee el caso (10 minutos).", "Lee la conversación entre Patricia, la clienta, e Ignacio, quien la atendió, y los datos de la incidencia que Ignacio tenía en su sistema. Cada mensaje tiene una hora: úsala para indicar de qué mensaje hablas."),
    ("Parte 1 de la plantilla: encuentra cuatro errores de comunicación (25 minutos).", "Elige cuatro mensajes de Ignacio que estuvieron mal. En cada fila escribe la hora del mensaje, qué hizo mal, qué barrera o pilar de la comunicación efectiva se vio afectado y cómo debió hacerlo. La primera fila es un ejemplo resuelto: no cuenta como una de tus cuatro."),
    ("Parte 2: reescribe tres respuestas con escucha activa (20 minutos).", "Elige tres momentos de la conversación y escribe la frase exacta que Ignacio debió decir. Usa una técnica de escucha activa distinta en cada una y explica en una o dos líneas por qué ayuda."),
    ("Parte 3: escribe el correo que Patricia debió recibir (25 minutos).", "Escribe entre 150 y 250 palabras, con las seis partes de un buen correo, e incluye la hora estimada de reparación y el bono de datos."),
    ("Parte 4: explica qué le faltó a Ignacio en inteligencia emocional (10 minutos).", "En 80 a 120 palabras, nombra el componente que le faltó, muéstralo con mensajes concretos y explica cómo debió aplicarlo."),
]
HERRAMIENTAS = [
    ("Barreras de la comunicación", "físicas, semánticas, psicológicas y culturales."),
    ("Pilares de la comunicación efectiva", "claridad, empatía y oportunidad."),
    ("Técnicas de escucha activa", "parafrasear, preguntas clarificadoras, validar emociones, resumir y señales de atención."),
]
CASO = {"titulo": "Sin internet y sin respuesta", "bloques": [
    "**Patricia Navarro**, de 52 años, es clienta de Conecta Sur hace seis años y trabaja como contadora independiente desde su casa. El miércoles 14 de octubre, a las 9:05, su internet dejó de funcionar. La atendió **Ignacio**, del equipo de chat.",
    {"cols": ["Hora", "Quién", "Mensaje"], "filas": [
        ["9:12", "Patricia", "Buenos días. Desde las 9 no tengo internet y hoy tengo que enviar declaraciones antes de las 13:00. ¿Me pueden ayudar?"],
        ["9:47", "Ignacio", "Hola. ¿Cuál es su RUT?"],
        ["9:55", "Ignacio", "Su servicio presenta una incidencia masiva en el nodo TMU-04. Se generó la OT 88213 y quedó derivada a N2."],
        ["10:04", "Ignacio", "Como le dije, es una incidencia masiva. No depende de mí. DEBE ESPERAR."]]},
    "**Datos de la incidencia** (visibles para Ignacio): la reparación se estimó para las 12:30 y Conecta Sur puede activar, sin costo, un bono de 20 GB de datos móviles.",
]}
RUBRICA = [
    {"criterio": "Reconoce fallas y barreras de comunicación", "peso": 25,
     "alto": "Cuatro fallas en mensajes distintos, cada una con la barrera o el pilar bien nombrado y una estrategia concreta.",
     "niveles": ["Identifica cuatro fallas en mensajes distintos, nombra correctamente la barrera o el pilar y propone una estrategia pertinente.",
                 "Identifica cuatro fallas; en una la barrera o la estrategia es imprecisa.",
                 "Identifica dos o tres fallas, o las cuatro con varias barreras mal nombradas.",
                 "Identifica menos de dos fallas o no las relaciona con barreras ni estrategias."]},
    {"criterio": "Reconoce técnicas de escucha activa", "peso": 20,
     "alto": "Tres técnicas distintas, con frases que corresponden a la técnica y al momento de la conversación.",
     "niveles": ["Usa tres técnicas distintas, cada frase corresponde a la técnica y explica por qué ayuda.",
                 "Usa tres técnicas; una frase no corresponde del todo o la explicación es general.",
                 "Usa dos técnicas correctas, o tres poco adaptadas al caso.",
                 "No usa técnicas de escucha activa."]},
    {"criterio": "Comunica por escrito de forma clara, empática y oportuna", "peso": 35,
     "alto": "Correo con sus seis partes, que valida la emoción, explica sin tecnicismos, da el plazo y el bono y deja un canal de contacto.",
     "niveles": ["Correo con las seis partes, valida la emoción, explica sin tecnicismos, entrega plazo y alternativa y deja un canal de contacto.",
                 "Tiene las seis partes, pero omite el plazo o la alternativa, o tiene errores de forma.",
                 "Le faltan dos partes, usa tecnicismos o no valida la emoción.",
                 "No redacta el correo o repite los errores del caso."]},
    {"criterio": "Reconoce principios de inteligencia emocional", "peso": 20,
     "alto": "Nombra el componente que faltó, lo vincula con mensajes concretos y explica cómo debió aplicarse.",
     "niveles": ["Nombra con precisión el componente, lo vincula con mensajes concretos y explica cómo aplicarlo.",
                 "Nombra un componente pertinente, sin vincularlo con mensajes concretos.",
                 "Nombra un componente, pero la explicación es general o confunde conceptos.",
                 "No identifica ningún componente."]},
]
PLANTILLA = [
    {"titulo": "Parte 1 · Fallas de comunicación", "inst": "Completa cuatro filas además del ejemplo; usa mensajes distintos de la conversación.",
     "cols": ["Hora", "Qué falló", "Barrera o pilar afectado", "Estrategia que debió usarse"], "anchos": [12, 30, 25, 33], "filas": 4,
     "ejemplo": ["Ejemplo · 9:55", "Usa términos internos que la clienta no entiende.", "Barrera semántica; falla la claridad.", "Explicar en lenguaje sencillo qué pasó y cuándo se resuelve."]},
    {"titulo": "Parte 2 · Escucha activa", "inst": "Elige tres técnicas distintas.", "cols": ["Hora", "Técnica", "Frase que debió decir", "Por qué ayuda"], "anchos": [12, 18, 40, 30], "filas": 3},
    {"titulo": "Parte 3 · Respuesta escrita (150 a 250 palabras)", "inst": "Redacta el correo de seguimiento que debió recibir Patricia.", "encabezado": "Correo", "lineas": ["Asunto:"]},
    {"titulo": "Parte 4 · Inteligencia emocional (80 a 120 palabras)", "inst": "¿Qué componente le faltó a quien atendió? Vincúlalo con mensajes concretos.", "alto": 5},
]
PAUTA = ["Fallas esperadas: demora de 35 minutos sin disculpa (9:47, oportunidad); tecnicismos «nodo», «OT», «N2» (9:55, barrera semántica); mayúsculas y «no depende de mí» (10:04, empatía y barrera psicológica); cierre que culpa a la clienta (10:09).",
         "Correo: debe incluir la hora estimada (12:30) y el bono de 20 GB; la clienta no puede esperar hasta las 13:00 sin alternativa.",
         "Inteligencia emocional: empatía o autorregulación, con mensajes concretos (10:04, 10:09)."]
