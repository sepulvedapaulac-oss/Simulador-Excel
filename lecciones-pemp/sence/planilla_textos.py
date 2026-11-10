# Textos de la planilla de codificación SENCE (solicitud 1957755), separados para medirlos y verificarlos.
NOMBRE = 'Procedimientos para la Operación Segura de Plataformas Elevadoras Móviles de Personal'

CARACTERISTICAS = ('Operadores(as) de plataformas elevadoras móviles de personal de tijera y de brazo articulado o telescópico, '
 'técnicos(as) de mantenimiento y montadores(as) que ejecutan trabajos en altura con estos equipos en bodegas, centros de distribución, '
 'plantas industriales y faenas de construcción. En sus funciones inspeccionan el equipo antes de usarlo, posicionan y operan la plataforma, '
 'controlan el área de trabajo y responden ante desviaciones o emergencias. La capacitación tiene por finalidad fortalecer el análisis de '
 'los procedimientos de operación segura de estos equipos, contribuyendo a prevenir caídas, volcamientos, atrapamientos y contactos con '
 'estructuras, de acuerdo con los protocolos operacionales y procedimientos de la organización.')

REQUISITOS_INGRESO = ('Experiencia laboral en trabajos en altura, mantenimiento, montaje, logística o bodegaje, en los que se utilicen '
 'o se requiera utilizar plataformas elevadoras móviles de personal.')

COMPETENCIA = 'Analizar procedimientos de operación segura de plataformas elevadoras móviles de personal de acuerdo a protocolos operacionales'

AE = [
 'Identificar elementos operacionales de plataformas elevadoras móviles de personal de acuerdo a características técnicas del equipo.',
 'Describir condiciones preoperacionales de plataformas elevadoras móviles de personal de acuerdo a criterios de inspección segura.',
 'Analizar procedimientos de operación de plataformas de tijera de acuerdo a secuencia segura de maniobra.',
 'Analizar procedimientos de operación de plataformas articuladas o telescópicas de acuerdo a condiciones seguras de maniobra.',
 'Analizar decisiones operacionales de plataformas elevadoras móviles de personal de acuerdo a protocolos de respuesta ante condiciones anormales.',
]
CRITERIOS = [a.replace('Identificar','Identifica',1).replace('Describir','Describe',1).replace('Analizar','Analiza',1) for a in AE]

CONTENIDOS = [
 ['Módulo 1: Comprender el equipo antes de elevar','Cuando elevar también es una decisión','Familias de PEMP: no todas se mueven igual',
  'Componentes que sostienen la operación','Personas, responsabilidades y límites','Los riesgos aparecen antes de subir',
  'Mapa de categorías y componentes','Riesgos críticos de las PEMP','Resumen y glosario del módulo 1'],
 ['Módulo 2: Inspeccionar, planificar y decidir','El manual y la placa mandan','Inspección visual: mirar con intención',
  'Controles y funciones antes del trabajo','El entorno también se inspecciona','Apto, condicionado o detenido',
  'Guía de inspección','Matriz equipo, entorno y tarea','Resumen y glosario del módulo 2'],
 ['Módulo 3: Operar una plataforma de tijera con control','La tijera eleva verticalmente, pero el riesgo se mueve','Posicionar antes de elevar',
  'Desplazar, elevar y bajar en secuencia','Trabajar dentro de la plataforma','Cerrar la operación sin dejar riesgos',
  'Secuencia segura de operación de tijera','Resumen y glosario del módulo 3'],
 ['Módulo 4: Operar brazos articulados y telescópicos','Articular o extender cambia la maniobra','Detener, asegurar, alertar y reportar',
  'Incidentes, accidentes y casi accidentes','Pérdida de estabilidad, inclinación y riesgo de vuelco','La emergencia que no debes tocar',
  'Diferencias entre brazos articulados y telescópicos','Riesgos de alcance, giro y atrapamiento','Resumen y glosario del módulo 4'],
 ['Módulo 5: Integrar decisiones, responder y cerrar','Planificar la tarea completa','Cuando la condición cambia',
  'Emergencia: actuar sin improvisar','Después del evento, el equipo no vuelve solo','Una operación segura se demuestra con decisiones',
  'Respuesta, comunicación y reporte','Misión integradora: una operación segura de principio a fin','Resumen y glosario del módulo 5'],
]
# Desglose por AE en minutos: plataforma, autónomo, evaluación
HORAS = [8, 9, 10, 10, 13]
DESGLOSE = [(300, 60, 120), (300, 135, 105), (285, 210, 105), (300, 195, 105), (355, 155, 270)]

URL = 'https://granviacapacitacion.cl/login.html'

TUTOR1 = ('[COMPLETAR] Nombre del tutor experto en plataformas elevadoras - profesión (por ejemplo, ingeniero(a) en prevención de riesgos) - tutor experto.',
 '[COMPLETAR] Experiencia docente: años como relator(a) o facilitador(a) de cursos de trabajo en altura o equipos de levante para personas adultas.',
 '[COMPLETAR] Experiencia laboral: empresa, cargo y años en operación, supervisión o prevención de riesgos con plataformas elevadoras.',
 'Función formativa: revisa y califica con la rúbrica declarada la Evaluación final parte 2 (caso integrador) y deja en el aula virtual una retroalimentación escrita individual con lo logrado y lo que debe reforzar, en un plazo máximo de 5 días hábiles desde la entrega; responde las consultas técnicas de los módulos 1 a 5.')
TUTOR2 = ('Paula Alejandra Sepúlveda Caniuqueo - Ing. en RRHH - diseñadora instruccional - tutora de seguimiento.',
 'Experiencia docente: diseñadora instruccional con experiencia en el desarrollo de programas de formación e-learning para personas adultas e implementación de aulas virtuales Moodle, 2011-2026.',
 'Experiencia laboral: Academia Adity - Product Manager, 2017-2022.',
 'Función formativa: acompaña el avance de cada participante en los módulos 1 a 5, envía en el aula virtual orientaciones de estudio al término de cada módulo a quienes tengan actividades pendientes y revisa junto al tutor experto la retroalimentación de la Evaluación final parte 2.')

def hm(m):
    h, r = divmod(m, 60)
    return f'{h} h' + (f' {r} min' if r else '') if h else f'{r} min'

TECNICAS = (
'¿Qué hará? El participante desarrollará el curso en el aula virtual Moodle con la metodología TLS (Tremen Learning System): casos de la operación real, decisiones con consecuencias y laboratorios. '
'Cada módulo incluye 5 lecciones interactivas SCORM con video, ejercicios y preguntas de comprobación con retroalimentación inmediata, guías PDF, resumen y glosario, 2 actividades prácticas (desafío y laboratorio) y una evaluación. '
'Cada AE aborda un tramo del proceso de operación (conocer el equipo, prepararlo, operar la tijera, operar el brazo y responder ante condiciones anormales) y entrega insumos que el AE5 y la evaluación final integran en un caso completo. '
'Instancia obligatoria de retroalimentación: la Evaluación final parte 2 es un caso integrador que el participante entrega en el aula virtual; el tutor experto lo califica con rúbrica y deja una retroalimentación escrita individual en un plazo máximo de 5 días hábiles, registrada en la plataforma.\n'
'¿Cómo lo hará? Tiempos de referencia: lección interactiva 40 min, actividad práctica 30 min, guía PDF 15 min, resumen y glosario 10 min, cuestionario 1 h, caso aplicado con rúbrica 45 min. '
'AE1 - 8 h (' + AE[0] + '): 5 lecciones, 2 prácticas, 2 guías y resumen = 5 h plataforma; 1 h autónomo para completar el mapa de categorías y componentes con un equipo de su trabajo; 2 h evaluación (diagnóstico formativo 1 h y cuestionario 1 h). '
'AE2 - 9 h (' + AE[1] + '): 5 h plataforma; 2 h 15 min autónomo para aplicar la guía de inspección y la matriz equipo, entorno y tarea; 1 h 45 min evaluación (cuestionario y caso con veredicto de inspección). '
'AE3 - 10 h (' + AE[2] + '): 5 lecciones, 2 prácticas, 1 guía y resumen = 4 h 45 min plataforma; 3 h 30 min autónomo para aplicar la secuencia segura de tijera a una tarea de su trabajo; 1 h 45 min evaluación (cuestionario y caso de posicionamiento y cierre). '
'AE4 - 10 h (' + AE[3] + '): 5 h plataforma; 3 h 15 min autónomo para analizar el alcance, giro y atrapamiento de una maniobra con brazo; 1 h 45 min evaluación (cuestionario y caso de respuesta y reporte). '
'AE5 - 13 h (' + AE[4] + '): 5 lecciones, 2 prácticas, guía, resumen, misión integradora y cierre = 5 h 55 min plataforma; 2 h 35 min autónomo para preparar el plan de operación del caso final; 4 h 30 min evaluación (cuestionario, caso, evaluación final parte 1 de 1 h y parte 2 de 1 h 45 min).\n'
'¿Con qué y dónde lo hará? Aula virtual Moodle con 25 lecciones interactivas SCORM, 10 actividades prácticas SCORM, 8 guías PDF, 5 resúmenes y glosarios, misión integradora, framework de cierre, foro de avisos, cuestionarios y tarea con rúbrica.\n'
'Distribución horaria total: AE1 8 h, AE2 9 h, AE3 10 h, AE4 10 h, AE5 13 h = 50 h: 25 h 40 min plataforma (51%), 12 h 35 min trabajo autónomo (25%) y 11 h 45 min evaluación (24%).')

MATERIAL = [
 ('Lecciones interactivas en formato SCORM, con video, ejercicios y preguntas de comprobación (formativas)', 25),
 ('Actividades prácticas SCORM: desafíos y laboratorios de decisión (formativas)', 10),
 ('Guías PDF de apoyo', 8),
 ('Resumen y glosario interactivo por módulo', 5),
 ('Misión integradora, framework de cierre y cierre del curso (recursos HTML)', 3),
 ('Evaluación diagnóstica (formativa, sin nota)', 1),
 ('Evaluación de módulo parte 1: cuestionario de 10 preguntas (sumativa)', 5),
 ('Evaluación de módulo parte 2: caso aplicado con rúbrica, módulos 2 a 5 (sumativa)', 4),
 ('Evaluación final parte 1: cuestionario de 20 preguntas (sumativa)', 1),
 ('Evaluación final parte 2: caso integrador con rúbrica revisado por el tutor (sumativa)', 1),
 ('Foro de avisos del curso', 1),
]

EVALUACION = (
'Se evaluará el logro de cada aprendizaje esperado con evaluaciones de módulo (40%) y una evaluación final en dos partes (60%). '
'AE1: cuestionario del módulo 1 (10 preguntas, 20 puntos, 1 h), 8%. '
'AE2 a AE5: en cada módulo, parte 1 cuestionario (10 preguntas, 20 puntos, 1 h) 4% y parte 2 caso aplicado con rúbrica de 5 criterios (100 puntos, 45 min), en el que el participante completa registros, marca evidencias, clasifica situaciones, ordena secuencias y emite un veredicto justificado, 4%: 8% por módulo y 32% en total. '
'Evaluación final parte 1: cuestionario de 20 preguntas de selección múltiple sobre los cinco AE (40 puntos, 1 h, 3 intentos), 20%. '
'Evaluación final parte 2: caso integrador de desarrollo (1 h 45 min) evaluado con rúbrica de 5 secciones asociadas a los AE (AE1 15 puntos, AE2 20, AE3 20, AE4 20 y AE5 25; total 100 puntos), con cuatro niveles (Excelente, Bueno, Regular e Insuficiente), revisado por el tutor experto con retroalimentación escrita en el aula virtual, 40%. '
'Total: 8% + 32% + 20% + 40% = 100%. La evaluación diagnóstica, las lecciones y las actividades prácticas son formativas, sin ponderación. '
'Tiempo total de evaluación: diagnóstico 1 h + 5 cuestionarios de módulo x 1 h + 4 casos x 45 min + final parte 1 1 h + final parte 2 1 h 45 min = 11 h 45 min.')

NORMA = ('Escala de 1,0 a 7,0 con 60% de exigencia; nota mínima de aprobación 4,0. Cada puntaje se convierte a porcentaje de logro (obtenido / máximo x 100) y luego a nota: con 60% o más, 4,0 + 3 x (% - 60) / 40; bajo 60%, 1,0 + 3 x % / 60 (12 de 20, 24 de 40 y 60 de 100 puntos = 4,0). '
 'Nota final: suma de cada nota por su ponderación (módulo 1 8%, módulos 2 a 5 32%, final parte 1 20%, final parte 2 40% = 100%), con un decimal. Aprueba con nota final 4,0 o más, aunque alguna evaluación tenga nota inferior a 4,0.')

INFRA = ('Se utilizará plataforma LMS/Aula virtual. Servidor: para asegurar la continuidad operativa del servicio que tiene por objetivo reinicio de plataforma en no menos de 24 horas, '
 'respaldo automático de la base de datos de los cursos, up time de 95% y conectividad que permite concurrencia de participantes.')

EQUIPOS = [
 'Audio mediante parlantes o audífonos',
 'Navegador Google Chrome, Microsoft Edge o Mozilla Firefox actualizado',
 'Conexión a internet mínima de 10 Mbps de descarga y 2 Mbps de subida',
 'LMS Moodle compatible con SCORM, recursos multimedia, actividades interactivas y evaluaciones',
 'Servidor con respaldo de información y continuidad operativa',
 'Lector de documentos PDF',
 'Equipo computacional con procesador dual core de 2 GHz o superior, mínimo 4 GB RAM y resolución 1366 x 768 o superior',
 'Sistema operativo Windows 10 o superior, macOS 12 o equivalente compatible',
]
