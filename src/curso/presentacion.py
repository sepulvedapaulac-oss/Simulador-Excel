# Carrusel interactivo de presentación del curso: competencia, metodología, módulos y evaluación.
# python3 tools/build_carousel.py src/curso/presentacion.py  ->  dist/curso/Presentacion_del_curso.html
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from datos import *

TITLE = "Presentación del curso"
SUB = f"{CURSO} · {MODALIDAD} · {HORAS} horas"
FOOT = "Presentación del curso"
FILE = "Presentacion_del_curso.html"


def hb(rows):
    mx = max(r[1] for r in rows)
    return '<div class="hb">' + "".join(f'<div><span>{r[0]}</span><i><b style="width:{r[1] / mx * 100:.0f}%"></b></i><strong>{r[2]}</strong></div>' for r in rows) + "</div>"


def modulo(m):
    p, a, e = m["dist"]
    lecc = "".join(f"<li>Lección {l}</li>" for l in m["lecciones"])
    extra = (f'<li><b>Evaluación del módulo (10 % de la nota):</b> cuestionario (4 %) y tarea de caso práctico «{m["tarea"]}» con plantilla, corregida por la tutora con rúbrica (6 %)</li>'
             if m["tarea"] else '<li><b>Evaluación del módulo (10 % de la nota):</b> cuestionario de 10 preguntas</li>')
    return {"kicker": f"Módulo {m['n']} · {m['horas']} horas", "title": m["titulo"],
            "body": f'<div class="ae"><small>Aprendizaje esperado {m["ae"]}</small>{m["aprendizaje"]}</div>'
                    f'<p><b>Cómo lo lograrás:</b> {m["como"]}</p><ul class="points">{lecc}</ul>'
                    f'<table class="mini"><tbody><tr><td>🧪 Laboratorios (práctica sin nota)</td><td>{m["labs"][0].split(" · ")[1]} · {m["labs"][1].split(" · ")[1]}</td></tr>'
                    f'<tr><td>📄 PDF</td><td>{m["pdf"][0]} · {m["pdf"][1]}</td></tr>'
                    f'<tr><td>⏱ Horas</td><td>{fh(p)} h plataforma · {fh(a)} h trabajo autónomo · {fh(e)} h evaluación</td></tr></tbody></table>'
                    f'<ul class="points"><li><b>Además:</b> video de bienvenida y resumen y glosario interactivos</li>{extra}</ul>',
            "img": m["img"], "alt": m["alt"],
            "key": f"Criterio de evaluación: {m['criterio']}"}


PRESENTACION = [
 {"kicker": "Bienvenida", "title": CURSO,
  "body": f"Este curso te prepara para usar la inteligencia artificial en tu trabajo diario con remuneraciones: revisar, analizar, reportar y mejorar el cierre mensual, <b>sin poner en riesgo la exactitud ni la información salarial de las personas</b>.",
  "points": [f"<b>Modalidad:</b> {MODALIDAD}, a tu ritmo", f"<b>Duración:</b> {HORAS} horas en 4 módulos", f"<b>Plataforma:</b> {PLATAFORMA}",
             "<b>Caso conductor:</b> Camila, analista de remuneraciones, y Rodrigo, jefe de Compensaciones, en AndesCorp (empresa ficticia)"],
  "img": "i11_hero.jpg", "alt": "Analista de remuneraciones trabajando con un asistente de IA en su computador",
  "key": "Todos los datos del curso son ficticios: puedes practicar sin riesgo."},
 {"kicker": "Competencia a desarrollar", "title": "Lo que serás capaz de hacer al terminar",
  "body": f'<div class="ae"><small>Competencia del curso</small>{COMPETENCIA}</div><p>La competencia se construye paso a paso con <b>cuatro aprendizajes esperados</b>, uno por módulo:</p>',
  "points": [f"<b>{m['ae']} · Módulo {m['n']}:</b> {m['aprendizaje']}" for m in MODULOS],
  "key": "Cada aprendizaje esperado se evalúa con su propio criterio y con las actividades prácticas del módulo."},
 {"kicker": "Para quién es", "title": "Público y requisitos de ingreso",
  "body": PUBLICO, "points": REQUISITOS,
  "img": "i21_hero.jpg", "alt": "Analista revisando una liquidación de sueldo en la pantalla",
  "key": "No necesitas saber programar ni tener experiencia previa con inteligencia artificial."},
 {"kicker": "Metodología", "title": "Tremen Learning System (TLS)",
  "body": "El curso integra tres estrategias que se repiten en cada módulo: aprendes con una historia, decides en escenarios realistas y practicas en simuladores.",
  "points": ["<b>Storytelling:</b> sigues a Camila y Rodrigo en situaciones reales del cierre de remuneraciones.",
             "<b>Escenarios de decisión:</b> eliges qué hacer y ves las consecuencias, con retroalimentación en cada alternativa.",
             "<b>Laboratorios interactivos:</b> practicas en simuladores, como una hoja de cálculo en español con fórmulas reales.",
             "<b>Transferencia al trabajo:</b> cada lección termina con una plantilla o ficha que puedes copiar y usar en tu empresa."],
  "img": "i13_hero.jpg", "alt": "Analista escribiendo una instrucción para un asistente de IA",
  "key": "Aprendes haciendo: cada concepto se aplica de inmediato en una decisión o un ejercicio."},
 {"kicker": "Metodología", "title": "¿Qué harás, cómo y con qué?",
  "body": '<div class="tri"><div><b>¿Qué harás?</b>Recorrerás 4 módulos con video, narración y actividades interactivas: identificarás herramientas, describirás la revisión asistida, interpretarás variaciones e indicadores y analizarás un flujo de trabajo asistido por IA.</div>'
          '<div><b>¿Cómo lo harás?</b>Con unidades interactivas, escenarios narrados y 8 laboratorios de práctica, a tu propio ritmo. Evidencias tu aprendizaje con cuestionarios, tareas de caso práctico en los módulos 2 a 4 que corrige la tutora con rúbrica y un caso práctico integrador final.</div>'
          '<div><b>¿Con qué y dónde?</b>En el aula virtual Moodle: 16 lecciones SCORM, 4 videos de bienvenida, 8 laboratorios, 8 guías y plantillas PDF, resumen y glosario por módulo, plantillas de los casos y mensajería con la tutora.</div></div>',
  "key": "Las consultas se realizan por la mensajería interna de la plataforma."},
 {"kicker": "Distribución horaria", "title": f"Tus {HORAS} horas de dedicación",
  "body": hb([(n, h, f"{fh(h)} h · {pc} %") for n, h, pc in DIST]) +
          '<div class="tw"><table class="mini"><thead><tr><th>Módulo</th><th>Plataf.</th><th>Autón.</th><th>Eval.</th><th>Total</th></tr></thead><tbody>' +
          "".join(f'<tr><td><b>M{m["n"]}</b> {m["titulo"]}</td><td class="n">{fh(m["dist"][0])} h</td><td class="n">{fh(m["dist"][1])} h</td><td class="n">{fh(m["dist"][2])} h</td><td class="n">{m["horas"]} h</td></tr>' for m in MODULOS) +
          f'<tr class="tot"><td>Total</td><td class="n">{fh(DIST[0][1])} h</td><td class="n">{fh(DIST[1][1])} h</td><td class="n">{fh(DIST[2][1])} h</td><td class="n">{HORAS} h</td></tr></tbody></table></div><p style="font-size:.85rem;color:var(--muted)">Plataf.: horas en plataforma · Autón.: trabajo autónomo · Eval.: evaluación.</p>',
  "key": "Organiza tu semana: avanzar un poco cada día rinde más que una sola sesión larga."},
 *[modulo(m) for m in MODULOS],
 {"kicker": "Recorrido de cada módulo", "title": "El orden sugerido dentro de un módulo",
  "body": '<ol class="steps"><li><b>Video de bienvenida</b> del módulo</li><li><b>Lecciones x.1 y x.2</b> y el primer PDF de apoyo</li><li><b>Laboratorio A</b>: practicas lo aprendido</li>'
          '<li><b>Lecciones x.3 y x.4</b> y el segundo PDF</li><li><b>Laboratorio B</b>: aplicas en un caso más completo</li><li><b>Resumen y glosario</b> interactivos para repasar</li>'
          '<li><b>Evaluación del módulo</b>: cuestionario y, en los módulos 2 a 4, tarea de caso práctico con plantilla que corrige la tutora con rúbrica. Debes aprobarla.</li></ol>',
  "key": "Debes aprobar la evaluación de cada módulo. Los laboratorios son práctica sin nota, pero cuentan para tu avance."},
 {"kicker": "Formato de evaluación", "title": "Cómo se calcula tu nota final",
  "body": '<table class="mini"><thead><tr><th>Componente</th><th>Peso</th></tr></thead><tbody>' +
          "".join(f'<tr><td>{n}</td><td class="n">{p} %</td></tr>' for n, p in PONDERACION) +
          '<tr class="tot"><td>Total</td><td class="n">100 %</td></tr></tbody></table>',
  "points": [ESCALA, APROBACION, "En los módulos 2, 3 y 4, la evaluación del módulo combina el cuestionario (40 % del módulo) y una tarea de caso práctico (60 % del módulo) que la tutora corrige con rúbrica de 100 puntos y retroalimentación por criterio en un plazo máximo de 48 horas hábiles.", FORMATIVOS],
  "key": f"Requisito administrativo: {ADMIN[0].lower() + ADMIN[1:]}"},
 {"kicker": "Instrumentos de evaluación", "title": "Qué se evalúa en cada etapa",
  "body": '<table class="mini"><thead><tr><th>Etapa</th><th>Instrumento</th></tr></thead><tbody>' +
          "".join(f'<tr><td>Módulo {m["n"]} ({m["ae"]})</td><td>Laboratorios (práctica sin nota): {m["labs"][0].split(" · ")[1].lower()} y {m["labs"][1].split(" · ")[1].lower()}. Evaluación: cuestionario de 10 preguntas{" (4 %) y tarea «" + m["tarea"] + "» con plantilla, corregida por la tutora con rúbrica de 100 puntos (6 %)" if m["tarea"] else " (10 %)"}.</td></tr>' for m in MODULOS) +
          '<tr><td>Evaluación final · Parte 1 (20 %)</td><td>Cuestionario de 20 preguntas de selección múltiple (5 por AE, M1.P1 a M4.P5), con corrección automática, 1 hora.</td></tr>'
          '<tr><td>Evaluación final · Parte 2 (40 %)</td><td>Caso práctico integrador con 4 tareas, una por aprendizaje esperado, con puntaje por tarea, corrección automática y PDF de resultados, 1 hora.</td></tr></tbody></table>',
  "key": "Al terminar la evaluación final descargas un PDF con tus resultados."},
 {"kicker": "Antes de empezar", "title": "Evaluación diagnóstica y mapa de competencias",
  "body": "Antes del Módulo 1 responderás una <b>evaluación diagnóstica</b> breve, sin nota. Primero te autoevalúas en cada aprendizaje esperado y luego respondes 20 preguntas de situaciones reales, cinco por módulo.",
  "points": ["Al terminar verás tu <b>mapa de competencias</b>: un radar con tu resultado y tu autopercepción en cada aprendizaje esperado.",
             "Recibirás una ruta sugerida con las lecciones en que conviene poner más atención.",
             "Podrás <b>descargar un PDF</b> con tu mapa y todas tus respuestas."],
  "img": "i44_hero.jpg", "alt": "Analista presentando un plan con una línea de tiempo proyectada en una pantalla",
  "key": "El diagnóstico no afecta tu nota: responde con honestidad para que tu ruta sea útil."},
 {"kicker": "Requisitos técnicos", "title": "Lo que necesitas para el curso",
  "points": ["Computador con Windows 10 o superior, macOS o Linux actual, con al menos 4 GB de RAM.",
             "Navegador actualizado (Chrome, Edge o Firefox) con JavaScript habilitado.",
             "Conexión a internet de al menos 5 Mbps.", "Audífonos o parlantes para la narración de las lecciones.",
             "Lector de PDF y planilla de cálculo (Excel o equivalente)."],
  "body": "Las lecciones también se adaptan al celular, pero te recomendamos usar un computador para los laboratorios con simulador de Excel.",
  "key": "¡Te damos la bienvenida! Comienza por la evaluación diagnóstica."},
]
