# Datos del curso para la Presentación y la Guía del participante.
# Fuente: Planilla de codificación SENCE (competencia, aprendizajes esperados, horas, público,
# requisitos) y materiales realmente construidos del curso (actividades, PDF, evaluaciones).

CURSO = "Legislación Laboral"
COMPETENCIA = "Analizar disposiciones de la legislación laboral según el Código del Trabajo."
HORAS = 60
MODALIDAD = "E-learning asincrónico, a tu propio ritmo"
PLATAFORMA = "Aula virtual Tremen Partner (Moodle). Consultas al tutor por mensajería y foro del aula, con respuesta en un plazo máximo de 48 horas hábiles."
PUBLICO = ("Analistas de recursos humanos, analistas de remuneraciones, analistas de personal y analistas administrativos "
           "que gestionan contratos de trabajo, control de jornada y asistencia, solicitudes laborales y la documentación "
           "del término de la relación laboral.")
REQUISITOS = [
    "Experiencia laboral en funciones administrativas o de gestión de personas que impliquen manejo de contratos, registros de asistencia, remuneraciones o documentación laboral.",
    "Manejo de herramientas digitales a nivel usuario.",
    "No se requieren conocimientos jurídicos previos.",
]
CASO = ("Camila, del Equipo de Personas de Horizonte Servicios, una empresa ficticia de servicios en Santiago. "
        "Todos los datos del curso son ficticios.")
IDEA_CURSO = "La ley fija mínimos: un acuerdo entre las partes no puede dejar sin efecto un derecho laboral."

DIST = {"plataforma": 36, "autonomo": 16, "evaluacion": 8}

MODULOS = [
 dict(n=1, titulo="Fundamentos de la legislación laboral chilena", corto="Fundamentos", horas=9, plat=6, aut=2, ev=1,
      ae="Identificar principios del Derecho Laboral según el Código del Trabajo.",
      criterio="Identifica principios del Derecho Laboral según el Código del Trabajo.",
      como="Microlecciones interactivas y un caso aplicado en que reconoces principios, fuentes, organismos fiscalizadores y obligaciones de las partes; luego elaboras el diagnóstico de riesgos de una situación laboral.",
      lecciones=["1.1 ¿Por qué existe el Derecho Laboral?","1.2 ¿De dónde provienen las reglas laborales?","1.3 ¿Quién fiscaliza y orienta?","1.4 Dos partes, derechos y obligaciones","1.5 Derechos que no pueden simplemente dejarse sin efecto"],
      caso="1.6 Caso aplicado: decisiones cotidianas que pueden generar incumplimientos",
      actividades=["Revisión preventiva","Construye el diagnóstico"],
      pdf=["Ficha de diagnóstico de riesgos laborales","Mapa rápido de derechos, obligaciones y límites laborales"],
      evaluacion="Producto del módulo: diagnóstico de riesgos de una situación laboral",
      img="m1"),
 dict(n=2, titulo="Contratación, jornada de trabajo y remuneraciones", corto="Contrato, jornada y remuneraciones", horas=11, plat=7, aut=3, ev=1,
      ae="Describir condiciones del contrato individual de trabajo según el Código del Trabajo.",
      criterio="Describe condiciones del contrato individual de trabajo según el Código del Trabajo.",
      como="Microlecciones, comparadores interactivos y documentos simulados en que describes el contrato, la jornada, las horas extraordinarias, el registro de asistencia, las remuneraciones y los descuentos.",
      lecciones=["2.1 La relación laboral comienza","2.2 No todos los contratos funcionan igual","2.3 ¿Qué debe decir el contrato?","2.4 Organizar el tiempo de trabajo","2.5 Ley de 40 Horas en la práctica","2.6 Cuando la jornada se extiende","2.7 Registrar para demostrar","2.8 Leer una remuneración","2.9 ¿Qué puede descontarse?"],
      caso="2.10 Caso aplicado: jornada, registro y horas extraordinarias",
      actividades=["Jornada y horas extra","Remuneraciones y descuentos"],
      pdf=["Ficha de revisión de contrato y jornada","Guía rápida: jornada, horas extraordinarias y remuneraciones 2026"],
      evaluacion="Cuestionario de 10 preguntas y laboratorio «Auditoría de jornada y sueldo»",
      img="m2"),
 dict(n=3, titulo="Derechos laborales, conciliación y corresponsabilidad", corto="Derechos laborales", horas=12, plat=7, aut=4, ev=1,
      ae="Explicar derechos laborales según el Código del Trabajo.",
      criterio="Explica derechos laborales según el Código del Trabajo.",
      como="Microlecciones y escenarios ramificados en que explicas derechos fundamentales, igualdad de trato, protección familiar, conciliación, cuidados, feriado, permisos e inclusión, y resuelves con fundamentación una solicitud laboral.",
      lecciones=["3.1 Derechos fundamentales dentro de la empresa","3.2 Igualdad de trato y no discriminación","3.3 Maternidad, paternidad y protección familiar","3.4 Conciliar trabajo y vida personal","3.5 Personas que ejercen labores de cuidado","3.6 Gestionar solicitudes vinculadas a responsabilidades familiares","3.7 Feriado, permisos y licencias","3.8 Inclusión laboral"],
      caso="3.9 Caso aplicado: conciliación, cuidados y organización del trabajo",
      actividades=["Teletrabajo para una persona cuidadora","Selección sin discriminación"],
      pdf=["Ficha para resolver solicitudes laborales con fundamentación","Mapa de derechos: dignidad, protección familiar, conciliación e inclusión"],
      evaluacion="Cuestionario de 10 preguntas y laboratorio «Cierre anual de Personas»",
      img="m3"),
 dict(n=4, titulo="Prevención del acoso, violencia y gestión de relaciones laborales", corto="Acoso y violencia", horas=13, plat=8, aut=4, ev=1,
      ae="Distinguir conductas de acoso según la Ley N° 21.643.",
      criterio="Distingue conductas de acoso según la Ley N° 21.643.",
      como="Microlecciones y actividades de clasificación en que distingues acoso laboral, acoso sexual, violencia y conflicto, junto con las medidas de prevención, denuncia, investigación y resguardo.",
      lecciones=["4.1 El derecho a trabajar en un entorno seguro","4.2 Distinguir acoso laboral, acoso sexual y violencia","4.3 Prevenir antes de reaccionar","4.4 El protocolo como herramienta de gestión","4.5 ¿Qué ocurre cuando se presenta una denuncia?","4.6 Investigación y medidas de resguardo","4.7 Conflicto no es lo mismo que acoso"],
      caso="4.8 Caso aplicado: ¿conflicto, acoso o violencia laboral?",
      actividades=["Denuncia y resguardo","¿Conflicto o acoso?"],
      pdf=["Ficha de clasificación: conflicto, acoso o violencia","Ruta de actuación Ley Karin"],
      evaluacion="Cuestionario de 10 preguntas y laboratorio «Protocolo y denuncia»",
      img="m4"),
 dict(n=5, titulo="Término de la relación laboral y cumplimiento normativo", corto="Término y cumplimiento", horas=15, plat=8, aut=3, ev=4,
      ae="Analizar procedimientos de término del contrato de trabajo según el Código del Trabajo.",
      criterio="Analiza procedimientos de término del contrato de trabajo según el Código del Trabajo.",
      como="Microlecciones y un caso integrador en que analizas causales, comunicación del término, indemnizaciones, finiquito, fiscalización y evidencia de cumplimiento; luego rindes la evaluación final del curso.",
      lecciones=["5.1 ¿Cómo puede terminar una relación laboral?","5.2 Renuncia, acuerdo y vencimiento","5.3 Necesidades de la empresa y otras causales","5.4 Comunicar correctamente el término","5.5 Indemnizaciones y prestaciones asociadas","5.6 Finiquito y formalización del cierre","5.7 Fiscalización laboral","5.8 La evidencia también es cumplimiento","5.9 ¿Qué ocurre cuando se incumple?"],
      caso="5.10 Caso integrador final: decisiones laborales desde la contratación hasta el término",
      actividades=["Causal y carta de despido","Plazo fijo y mutuo acuerdo"],
      pdf=["Auditoría simplificada del término de la relación laboral","Mapa del cierre: causales, plazos, pagos y evidencia"],
      evaluacion="Cuestionario de 10 preguntas y laboratorio «Finiquito e indemnizaciones»",
      img="m5"),
]
N_LECC = sum(len(m["lecciones"]) for m in MODULOS)

RECORRIDO = [
    ("Microlecciones del módulo", "en orden, incluido el caso aplicado"),
    ("Dos PDF de apoyo", "una ficha de trabajo y una guía o mapa para consultar"),
    ("Actividades prácticas 1 y 2", "casos con escenarios ramificados para practicar"),
    ("Resumen y glosario", "interactivos, para repasar"),
    ("Evaluación del módulo", "cuestionario y laboratorio de aplicación. Debes aprobarla."),
]

EVAL = [  # componente, peso
    ("Evaluación del Módulo 1", "8 %"),
    ("Evaluación del Módulo 2: cuestionario y laboratorio", "8 %"),
    ("Evaluación del Módulo 3: cuestionario y laboratorio", "8 %"),
    ("Evaluación del Módulo 4: cuestionario y laboratorio", "8 %"),
    ("Evaluación del Módulo 5: cuestionario y laboratorio", "8 %"),
    ("Evaluación final · Parte 1: cuestionario de 20 preguntas", "30 %"),
    ("Evaluación final · Parte 2: caso práctico integrador", "30 %"),
]
NORMA = ("Escala de 1,0 a 7,0 con 60 % de exigencia. Nota mínima de aprobación: 4,0 en la nota final ponderada del curso. "
         "Requisito administrativo: completar el 100 % de las actividades obligatorias del aula virtual.")

REQ_TEC = [
    "Computador o notebook con Windows 10 o superior, o macOS 11 o superior.",
    "Procesador de doble núcleo y 4 GB de memoria RAM como mínimo.",
    "Conexión a internet de banda ancha de 10 Mbps o superior.",
    "Navegador actualizado (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).",
    "Parlantes o audífonos para los videos y la narración.",
    "Los recursos funcionan dentro del aula virtual: no necesitas instalar programas.",
]
