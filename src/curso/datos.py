# Datos oficiales del curso (fuente: Planilla de codificación SENCE, e-learning asincrónico)
# Los usan el carrusel de presentación, el PDF guía del curso y la evaluación diagnóstica.

CURSO = "Inteligencia Artificial aplicada a la Gestión de Remuneraciones"
MODALIDAD = "E-learning asincrónico"
HORAS = 60
PLATAFORMA = "Aula virtual Tremen Partner (Moodle)"
COMPETENCIA = "Analizar procedimientos de gestión de remuneraciones con inteligencia artificial en el cierre mensual, de acuerdo a criterios de protección de información salarial."

PUBLICO = ("Analistas de remuneraciones, analistas de compensaciones y analistas de recursos humanos que calculan, revisan y reportan "
           "remuneraciones, elaboran informes de variaciones mensuales y controlan el cierre.")
REQUISITOS = ["Conocimientos básicos del proceso de remuneraciones (haberes, descuentos y liquidación de sueldo).",
              "Manejo básico de planillas de cálculo a nivel usuario.",
              "Experiencia de apoyo o ejecución en procesos de remuneraciones o de recursos humanos."]

# Distribución horaria total (metodología Tremen Learning System)
DIST = [("Plataforma", 36, "60"), ("Trabajo autónomo", 16.5, "27,5"), ("Evaluación", 7.5, "12,5")]

MODULOS = [
 {"n": 1, "titulo": "Fundamentos de IA", "horas": 12, "dist": (7, 4, 1), "ae": "AE1",
  "aprendizaje": "Identificar herramientas de inteligencia artificial en la gestión de remuneraciones, de acuerdo a criterios de uso responsable de información salarial.",
  "criterio": "Identifica herramientas de inteligencia artificial en la gestión de remuneraciones, de acuerdo a criterios de uso responsable de información salarial.",
  "como": "Unidades interactivas y dos laboratorios en que reconoces herramientas, elaboras prompts y clasificas datos según su sensibilidad.",
  "lecciones": ["1.1 ¿Qué puede hacer la IA por un analista de remuneraciones?", "1.2 Herramientas de IA para el trabajo cotidiano",
                "1.3 Cómo elaborar prompts efectivos", "1.4 Uso responsable de IA y protección de información salarial"],
  "labs": ["Laboratorio 1A · Laboratorio de prompts", "Laboratorio 1B · Semáforo de datos: anonimizar una planilla"],
  "pdf": ["Guía: IA generativa en remuneraciones, usos y límites", "Checklist de uso responsable y protección de datos"],
  "ramificada": None, "tarea": None, "img": "i11_hero.jpg", "alt": "Analista de remuneraciones trabajando con un asistente de IA en su computador"},
 {"n": 2, "titulo": "IA para revisión y validación de remuneraciones", "horas": 14, "dist": (9, 3.5, 1.5), "ae": "AE2",
  "aprendizaje": "Describir procedimientos de revisión de remuneraciones con inteligencia artificial en el cálculo mensual, de acuerdo a protocolos de validación de resultados.",
  "criterio": "Describe procedimientos de revisión de remuneraciones con inteligencia artificial en el cálculo mensual, de acuerdo a protocolos de validación de resultados.",
  "como": "Escenarios narrados y dos laboratorios en que describes cómo la IA revisa información, apoya fórmulas de control en Excel y detecta inconsistencias, y aplicas criterios para validar resultados.",
  "lecciones": ["2.1 La información que debe revisar la IA", "2.2 IA como asistente para fórmulas de Excel",
                "2.3 Detección asistida de inconsistencias", "2.4 Validación y control de calidad"],
  "labs": ["Laboratorio 2A · Fórmulas de control", "Laboratorio 2B · Auditoría del cierre"],
  "pdf": ["Guía de fórmulas de control en Excel", "Protocolo de validación de resultados de IA"],
  "ramificada": None, "tarea": "Revisión asistida del cierre de octubre", "img": "i23_hero.jpg", "alt": "Analista revisando una tabla de alertas en la pantalla"},
 {"n": 3, "titulo": "Análisis de datos y reportes de remuneraciones con IA", "horas": 16, "dist": (10, 4.5, 1.5), "ae": "AE3",
  "aprendizaje": "Interpretar variaciones mensuales de remuneraciones en reportes con inteligencia artificial, de acuerdo a indicadores de gestión.",
  "criterio": "Interpreta variaciones mensuales de remuneraciones en reportes con inteligencia artificial, de acuerdo a indicadores de gestión.",
  "como": "Unidades interactivas y dos laboratorios en que preparas datos, interpretas variaciones por área y construyes indicadores con su gráfico; luego aplicas lo aprendido en un informe ejecutivo.",
  "lecciones": ["3.1 Preparación de datos para análisis", "3.2 Variaciones mensuales",
                "3.3 Indicadores y visualización", "3.4 Informes ejecutivos con IA"],
  "labs": ["Laboratorio 3A · Variaciones mensuales por área", "Laboratorio 3B · Tablero de indicadores"],
  "pdf": ["Guía de preparación de datos y diccionario de variables", "Plantilla de informe ejecutivo"],
  "ramificada": None, "tarea": "Informe de variación de noviembre para la gerencia", "img": "i33_hero.jpg", "alt": "Analista revisando un tablero de indicadores con gráficos"},
 {"n": 4, "titulo": "Automatización y productividad", "horas": 18, "dist": (10, 4.5, 3.5), "ae": "AE4",
  "aprendizaje": "Analizar flujos de trabajo de remuneraciones con inteligencia artificial en el cierre mensual, de acuerdo a criterios de control de calidad.",
  "criterio": "Analiza flujos de trabajo de remuneraciones con inteligencia artificial en el cierre mensual, de acuerdo a criterios de control de calidad.",
  "como": "Unidades interactivas, dos laboratorios y un caso práctico integrador en que diagnosticas oportunidades de automatización y fundamentas decisiones sobre un flujo asistido de remuneraciones.",
  "lecciones": ["4.1 Oportunidades de automatización", "4.2 Asistentes de IA para tareas administrativas",
                "4.3 Flujo de remuneraciones asistido por IA", "4.4 Proyecto integrador"],
  "labs": ["Laboratorio 4A · Checklist de cierre con controles automáticos", "Laboratorio 4B · Simulador de flujo con puntos de control"],
  "pdf": ["Biblioteca de prompts para remuneraciones", "Guía para diseñar un flujo de cierre asistido por IA y rúbrica"],
  "ramificada": None, "tarea": "Rediseño asistido de la carga de novedades", "img": "i43_hero.jpg", "alt": "Diagrama de un flujo de trabajo con puntos de control proyectado en una pantalla"},
]

# Evaluación (planilla SENCE 1961128, Requisitos Técnicos)
# 4 evaluaciones de módulo × 10 % = 40 % + evaluación final Parte 1 20 % + Parte 2 40 % = 100 %.
# M1: cuestionario 10 %. M2–M4: cuestionario 40 % del módulo (4 % del curso) + tarea de caso práctico 60 % del módulo (6 % del curso).
# Diagnóstico, comprobaciones de las lecciones y laboratorios: formativos, sin nota (peso 0).
PONDERACION = [("Evaluación del Módulo 1: cuestionario", "10"),
               ("Evaluación del Módulo 2: cuestionario (4 %) y tarea de caso práctico corregida por la tutora (6 %)", "10"),
               ("Evaluación del Módulo 3: cuestionario (4 %) y tarea de caso práctico corregida por la tutora (6 %)", "10"),
               ("Evaluación del Módulo 4: cuestionario (4 %) y tarea de caso práctico corregida por la tutora (6 %)", "10"),
               ("Evaluación final · Parte 1: cuestionario de 20 preguntas", "20"),
               ("Evaluación final · Parte 2: caso práctico integrador", "40")]
FORMATIVOS = ("La evaluación diagnóstica, las comprobaciones de las lecciones y los laboratorios son formativos: "
              "tienen retroalimentación, no ponderan en la nota y cuentan para tu avance.")
APROBACION = ("Para aprobar el curso debes aprobar la evaluación de cada módulo y las dos partes de la evaluación final, "
              "y obtener 4,0 o más en la nota final ponderada.")
ESCALA = "Escala de 1,0 a 7,0 con 60 % de exigencia (60 % de logro = 4,0). Nota mínima de aprobación: 4,0 en la nota final ponderada."
ADMIN = "Asistencia mínima de 40 % (avance registrado en la plataforma)."


def fh(x):
    """Horas en formato chileno: 3.5 -> «3,5»."""
    return (f"{x:g}").replace(".", ",")
