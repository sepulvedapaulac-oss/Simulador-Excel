# Datos de la presentación del curso y de la guía del participante (ejemplo del curso DS N.º 44; solo formato y nivel).
# Se copia a src/bienvenida/presentacion.py y se adapta. Compilar: python3 tools/build_presentacion.py src/bienvenida/presentacion.py
# La competencia, los aprendizajes esperados ("aprend"), los criterios y las horas totales por módulo NO se escriben aquí:
# salen de curso.json → "sence" (fuente única). Aquí van la distribución horaria ("h": plataforma, autónomo, evaluación),
# las lecciones, los recursos y los textos de metodología, que deben coincidir con la planilla SENCE.

CURSO = "Gestión Preventiva de Riesgos Laborales según el Decreto Supremo N.º 44"
CORTO = "Gestión Preventiva DS N.º 44"
MODALIDAD = "E-learning asincrónico, a tu propio ritmo"
HORAS = 50
PLATAFORMA = "Aula virtual Tremen Partner (Moodle). Consultas de contenido a la facilitadora por la mensajería del aula."
PUBLICO = ("Supervisores(as), jefes(as) de turno y jefes(as) de área de operaciones que dirigen equipos de trabajo y que, en su área, "
           "ejecutan y controlan las medidas preventivas: verifican las condiciones de trabajo, aplican la matriz de riesgos de los puestos, "
           "dan seguimiento al programa de trabajo preventivo y actúan ante incidentes y accidentes del trabajo.")
REQUISITOS = ["Experiencia en la supervisión o coordinación de equipos de trabajo operativos.",
              "Conocimientos básicos en prevención de riesgos laborales."]
CASO = ("Andina Operaciones, una empresa ficticia multirrubro con cinco áreas: centro de distribución, taller de mantención, "
        "planta de envasado, oficinas y servicios en terreno. Asumes el rol de jefatura de turno junto a Dani Fuentes (Prevención), "
        "Cami Soto (Comité Paritario) y René Contreras (Gerencia). Todos los datos del curso son ficticios.")
BIENVENIDA = ("El curso te prepara para aplicar la gestión preventiva que exige el Decreto Supremo N.º 44: identificar responsabilidades, "
              "evaluar riesgos en la MIPER, elegir controles según la jerarquía, hacer seguimiento con indicadores y actuar correctamente "
              "ante un accidente del trabajo.")
IDEA_CLAVE = "Prevenir es gestionar: identificar, evaluar, controlar y verificar, con la participación de las personas trabajadoras."

# Distribución horaria (plataforma, trabajo autónomo, evaluación) por aprendizaje esperado, según el formulario.
MODULOS = [
 {"n": 1, "ae": "AE1", "titulo": "Marco de la gestión preventiva y Decreto Supremo N.º 44", "corto": "Marco preventivo y DS 44", "h": (5, 1.5, 1.5), "img": "i11_hero.jpg",
  "alt": "Pasillo de un centro de distribución con racks, una grúa horquilla y una persona con chaleco reflectante",
  "como": "Lecciones interactivas sobre fundamentos preventivos, la Ley N.º 16.744, el DS N.º 44, actores y responsabilidades; análisis de situaciones laborales y laboratorios para identificar obligaciones.",
  "lecc": ["1.1 Fundamentos de la prevención de riesgos laborales", "1.2 Ley N.º 16.744 y marco normativo de la seguridad y salud en el trabajo",
           "1.3 DS N.º 44: ámbito y principios de la gestión preventiva", "1.4 Obligaciones de la entidad empleadora, las personas trabajadoras y los organismos administradores",
           "1.5 Sistema de gestión y estructura preventiva según el tamaño"], "video": ["1.1", "1.3"],
  "labs": ["1A · Clasificador de casos de la Ley N.º 16.744", "1B · Estructura preventiva según dotación (Excel)"],
  "pdf": ["Guía: Ley N.º 16.744 y DS N.º 44", "Estructura preventiva según dotación", "Checklist de obligaciones de la entidad empleadora", "Ficha: qué hacer ante cada evento"],
  "vcont": "Ley N.º 16.744 y DS N.º 44: cómo se conectan y qué exigen", "ram": "¿Quién responde? El accidente del andén", "p2": "evaluación ramificada «¿Quién responde? El accidente del andén»"},
 {"n": 2, "ae": "AE2", "titulo": "Identificación de peligros y evaluación de riesgos", "corto": "Peligros y riesgos", "h": (7, 4, 1), "img": "i24_hero.jpg",
  "alt": "Línea de envasado con máquinas y personas trabajando",
  "como": "Revisión de peligros, métodos de identificación, evaluación de riesgos y MIPER mediante análisis de fotografías, clasificación de riesgos y simuladores de Excel.",
  "lecc": ["2.1 Peligros y factores de riesgo", "2.2 Métodos para identificar peligros", "2.3 La MIPER", "2.4 Evaluación, valoración y priorización",
           "2.5 Enfoque de género y personas especialmente sensibles"], "video": ["2.1", "2.3"],
  "labs": ["2A · MIPER en Excel", "2B · Priorización de riesgos (Excel)"],
  "pdf": ["Guía para construir y actualizar una MIPER", "Plantilla MIPER por puesto de trabajo", "Pauta de recorrido para identificar peligros", "Ficha: enfoque de género y personas especialmente sensibles"],
  "vcont": "Cómo construir una MIPER paso a paso", "ram": "La MIPER del recorrido", "p2": "evaluación ramificada «La MIPER del recorrido»"},
 {"n": 3, "ae": "AE3", "titulo": "Control de riesgos y planificación preventiva", "corto": "Control y programa", "h": (6, 2.5, 1.5), "img": "i13_hero.jpg",
  "alt": "Compresor industrial junto a bancos de trabajo en un taller",
  "como": "Análisis de la jerarquía de medidas, controles colectivos, medidas administrativas, EPP y planificación preventiva mediante escenarios de selección de controles y resolución de casos.",
  "lecc": ["3.1 Prelación de las medidas preventivas", "3.2 Programa de trabajo preventivo", "3.3 EPP y seguridad en máquinas",
           "3.4 Riesgo grave e inminente y emergencias", "3.5 Medidas correctivas y mejora continua"], "video": ["3.1", "3.4"],
  "labs": ["3A · Programa de trabajo preventivo (Excel)", "3B · Simulador de emergencia"],
  "pdf": ["Guía de la prelación de medidas preventivas", "Plantilla de programa de trabajo preventivo", "Checklist de EPP", "Protocolo ante riesgo grave e inminente y plan de emergencias"],
  "vcont": "La prelación aplicada a casos reales", "ram": "¿Qué control priorizar?", "p2": "caso práctico con rúbrica «Plan de control del taller de mantención», corregido por la facilitadora"},
 {"n": 4, "ae": "AE4", "titulo": "Instrumentos para la gestión y seguimiento preventivo", "corto": "Seguimiento", "h": (6, 2.5, 1.5), "img": "i41_hero.jpg",
  "alt": "Dos personas recorren un andén de carga con una pauta de inspección",
  "como": "Revisión de inspecciones, indicadores de seguridad, seguimiento de hallazgos, verificación de medidas y mapas de riesgos mediante ejercicios de registro, análisis de indicadores y simulaciones de seguimiento.",
  "lecc": ["4.1 Inspecciones y seguimiento de medidas", "4.2 Evaluación y auditoría de la gestión preventiva", "4.3 Registros e indicadores",
           "4.4 Mapas de riesgos", "4.5 Información, capacitación y participación"], "video": ["4.1", "4.3"],
  "labs": ["4A · Tablero de indicadores (Excel)", "4B · Inspección y mapa de riesgos"],
  "pdf": ["Pauta de inspección y seguimiento de hallazgos", "Ficha de registros e indicadores de SST", "Guía para elaborar el mapa de riesgos", "Plan de información y capacitación"],
  "vcont": "Indicadores de SST: cómo calcularlos e interpretarlos", "ram": "¿Funcionaron las medidas?", "p2": "caso práctico con rúbrica «Seguimiento de medidas en la planta de envasado», corregido por la facilitadora"},
 {"n": 5, "ae": "AE5", "titulo": "Responsabilidades y cumplimiento del DS N.º 44", "corto": "Responsabilidades", "h": (5, 1.5, 3.5), "img": "i44_hero.jpg",
  "alt": "Brigadista presta primeros auxilios a una persona en una bodega",
  "como": "Análisis de responsabilidades legales, procedimientos ante accidentes graves, notificaciones, denuncias, suspensión de faenas y reanudación, con un caso simulado de caída de altura y la fundamentación de decisiones preventivas.",
  "lecc": ["5.1 Comité Paritario de Higiene y Seguridad", "5.2 Departamento de Prevención y empresas de menor tamaño",
           "5.3 Reglamento Interno y coordinación entre empleadoras", "5.4 Actuación frente a accidentes, incidentes y enfermedades",
           "5.5 Organismos administradores, fiscalización y consecuencias"], "video": ["5.1", "5.4"],
  "labs": ["5A · Investigación del accidente", "5B · Autodiagnóstico de cumplimiento DS N.º 44 (Excel)"],
  "pdf": ["Guía de funcionamiento del Comité Paritario", "Guía del Delegado de SST y del encargado en empresas de menor tamaño", "Protocolo de actuación ante accidentes del trabajo", "Checklist de preparación para una fiscalización"],
  "vcont": "Qué hacer frente a un accidente del trabajo", "ram": "Frente al accidente", "p2": "caso práctico con rúbrica «Accidente en el taller de mantención», corregido por la facilitadora"},
]

# Persona facilitadora (Res. Ex. 2484 y 2486): la misma de la planilla SENCE (src/sence/planilla.js). No cambia durante la vigencia.
FACILITADORA = {"rol": "facilitadora", "nombre": "Elizabeth Acuña Bozo", "profesion": "Ingeniera en Prevención de Riesgos",
                "exp": "Relatora de programas de prevención de riesgos laborales, seguridad laboral y DS N.º 44, con experiencia en proyectos de detección de exposiciones a riesgos laborales."}
ACOMP = ["<b>Retroalimenta tus tareas de los módulos 3, 4 y 5:</b> las corrige con la rúbrica y te escribe qué lograste, qué corregir y cómo mejorar, en un plazo máximo de 48 horas hábiles. Si obtienes menos de 70 puntos, te reabre la entrega una vez.",
         "<b>Las tareas son obligatorias:</b> cuando la tarea queda aprobada se abre el módulo siguiente (la del módulo 5 abre la evaluación final), y son requisito para aprobar el curso.",
         "<b>Acompaña tu avance:</b> al inicio revisa tu mapa de competencias y te sugiere en qué poner atención; cada semana revisa el avance y te escribe si llevas 7 días sin avanzar.",
         "<b>Responde tus consultas de contenido</b> por la mensajería del aula, en el mismo plazo. Las consultas técnicas las atiende la mesa de ayuda."]

METODO = [("Storytelling", "Sigues el caso de Andina Operaciones en situaciones reales de trabajo, con lecciones narradas y videos."),
          ("Escenarios de decisión", "Eliges qué hacer y ves las consecuencias, con retroalimentación en cada alternativa."),
          ("Laboratorios interactivos", "Practicas en simuladores: hojas de cálculo en español con fórmulas reales (MIPER, programa, indicadores) y simuladores de flujo."),
          ("Transferencia al trabajo", "Cada lección termina con un constructor para llevar lo aprendido a tu propio lugar de trabajo.")]
QUE = ("Recorrerás 5 módulos con lecciones narradas, videos y actividades interactivas: identificarás responsabilidades preventivas, "
       "describirás riesgos laborales, distinguirás medidas de control y analizarás instrumentos de seguimiento y procedimientos "
       "de actuación ante accidentes, conforme al DS N.º 44.")
COMO = ("Con 25 lecciones interactivas, escenarios laborales simulados, 2 laboratorios por módulo, cuestionarios y evaluaciones ramificadas "
        "con retroalimentación automática, casos prácticos con rúbrica en los módulos 3 a 5 corregidos por la facilitadora y una evaluación final "
        "integradora basada en el caso de Andina Operaciones, a tu propio ritmo.")
CON = ("En el aula virtual Moodle: 25 lecciones SCORM con voz (10 con video integrado), 10 videos de módulo, 10 laboratorios, "
       "20 PDF de apoyo, resumen y glosario por módulo, cuestionarios y evaluaciones con retroalimentación automática.")

RECORRIDO = ["<b>Video de presentación</b> del módulo y <b>glosario</b> para consultar durante todo el módulo.",
             "<b>Lecciones del primer bloque</b>, con sus PDF de apoyo y el <b>video de contenido</b>.",
             "<b>Laboratorio A</b>: practicas lo aprendido en un simulador.",
             "<b>Lecciones del siguiente bloque</b> y sus PDF.",
             "<b>Laboratorio B</b>: aplicas en un caso más completo.",
             "<b>Resumen</b> interactivo del módulo para repasar.",
             "<b>Cuestionario</b> de 10 preguntas (evaluación de conocimiento, parte 1).",
             "<b>Evaluación del módulo, parte 2</b>: evaluación ramificada en los módulos 1 y 2, y caso práctico con rúbrica en los módulos 3 a 5."]
ESTRUCTURA_LECCION = ("Cada lección sigue la misma estructura: una situación inicial con una decisión, narración o video por capítulos, "
                      "dos o tres actividades interactivas, el recuadro «Lo que dice el DS N.º 44», un caso aplicado de Andina, "
                      "una comprobación de cinco preguntas, un constructor de transferencia al trabajo y un cierre.")

# Ponderación (planilla SENCE de reingreso, src/sence): 5 módulos × 8 % = 40 % (parte 1 cuestionario 3,2 %; parte 2 4,8 %)
# + evaluación final parte 1 30 % + parte 2 30 % = 100 %. Laboratorios, diagnóstico y prácticas: formativos (sin nota).
EVAL = [("Cuestionario de cada módulo, parte 1 (3,2 % por módulo)", "16 %"),
        ("Parte 2 de cada módulo (4,8 % por módulo): evaluación ramificada en los módulos 1 y 2; caso práctico con rúbrica, corregido por la facilitadora, en los módulos 3 a 5", "24 %"),
        ("Evaluación final integradora · Parte 1: cuestionario situacional de 25 preguntas", "30 %"),
        ("Evaluación final integradora · Parte 2: caso práctico de Andina Operaciones con cinco tareas", "30 %")]
NORMA = ["Escala de notas de 1,0 a 7,0, con un porcentaje de exigencia del 70 %.",
         "Nota mínima de aprobación: 4,0 en la nota final ponderada.",
         "Actividades y evaluaciones de módulo: 40 % (8 % por módulo). Evaluación final integradora: 60 %."]
INSTRUMENTOS_FINAL = [("Evaluación final · Parte 1 (50 puntos)", "Cuestionario situacional de 25 preguntas de selección única (M1.P1 a M5.P5), 2 puntos cada una: cinco preguntas (10 puntos) por criterio de evaluación, con calificación automática y retroalimentación por alternativa."),
                      ("Evaluación final · Parte 2 (50 puntos)", "Caso práctico de Andina Operaciones con cinco tareas de 10 puntos, una por criterio de evaluación: responsabilidades preventivas, MIPER, medidas de control, seguimiento preventivo y actuación ante accidentes. Retroalimentación por decisión y una oportunidad de revisión por tarea. Aprobación de la evaluación final: 70 de 100 puntos.")]

DIAG = ["<b>Autoevaluación:</b> indicas cómo te percibes en cada uno de los cinco aprendizajes esperados.",
        "<b>Situaciones:</b> respondes 25 preguntas de selección múltiple, una por lección (cinco por módulo)."]

TECNICOS = ["Computador o notebook con Windows 10 o superior, o macOS 11 o superior, con procesador de doble núcleo y al menos 4 GB de RAM.",
            "Navegador web actualizado (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).",
            "Conexión a internet de banda ancha de 10 Mbps o superior.",
            "Parlantes o audífonos para la narración de las lecciones y los videos.",
            "Lector de PDF (por ejemplo, Adobe Acrobat Reader). Los recursos se ejecutan dentro del aula virtual; no necesitas instalar otro software."]

# Imágenes de las tarjetas generales (archivo en src/img, alt que describe la imagen). Si falta una clave, la tarjeta va sin imagen.
IMAGENES = {"bienvenida": ("i11_hero.jpg", "Equipo reunido en una sala revisando documentos"),
            "publico": ("i41_hero.jpg", "Dos personas recorren un andén de carga con una pauta de inspección"),
            "metodologia": ("i43_hero.jpg", "Persona revisando en un computador un tablero con indicadores"),
            "tutor": ("i14_equipo.jpg", "Una profesional explica un tablero en pantalla a dos colegas"),
            "diagnostico": ("i12_hero.jpg", "Persona completando una pauta en su computador")}
