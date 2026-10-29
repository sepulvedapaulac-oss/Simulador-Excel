# Instrucciones de la evaluación final para Moodle (ejemplo del curso DS N.º 44). Se copia a src/evaluacion-curso/instrucciones.py.
# Competencia y criterios salen de curso.json → "sence"; los pesos de cada parte, de curso.json → "evaluacion".
# Compilar: python3 tools/build_moodle.py final → instrucción general, Parte 1 y Parte 2 en dist/evaluacion-curso/*.txt
ANTES = [
    "Usa un computador. La Parte 2 incluye un simulador que se trabaja mejor con teclado y pantalla grande.",
    "Tus respuestas se guardan automáticamente. Si sales, al volver continúas donde quedaste.",
    "Las respuestas ya registradas no se pueden cambiar.",
]
PARTE1 = {
    "instrumento": "Cuestionario situacional",
    "preguntas": 25, "puntos": 2,
    "sobre": "sobre situaciones de trabajo en Andina Operaciones",
    "como": ["Lee la situación y las cuatro alternativas.",
             "Elige la alternativa que mejor responde según la normativa del curso.",
             "Al elegir, tu respuesta queda registrada y verás de inmediato si es correcta o incorrecta, con su explicación.",
             "Presiona **Siguiente pregunta** para continuar."],
    "ten_en_cuenta": ["Cada pregunta se responde **una sola vez**. Lee con calma antes de elegir.",
                      "Al terminar verás tus puntos por criterio. Presiona **Siguiente** para pasar a la Parte 2."],
}
PARTE2 = {
    "instrumento": "Caso práctico integrador",
    "caso": "Asumes la jefatura de turno del **andén norte** del centro de distribución de Andina Operaciones. Recibes los antecedentes del último trimestre y una MIPER incompleta.",
    # (nombre de la tarea, qué debe hacer la persona, puntaje); una por criterio, en el orden de los criterios
    "tareas": [("Actores y obligaciones", "Indicar qué actor tiene cada obligación (5 decisiones de 2 puntos).", 10),
               ("Riesgos y MIPER", "Identificar riesgos y completar la MIPER en el simulador de Excel.", 10),
               ("Controles", "Mantener o corregir cada medida según la jerarquía de controles.", 10),
               ("Indicadores y seguimiento", "Calcular indicadores, planificar la inspección y cerrar hallazgos.", 10),
               ("Actuación y cumplimiento", "Decidir frente a un accidente grave y fundamentar para la gerencia.", 10)],
    "como": ["Responde todas las decisiones de la tarea.",
             "Presiona **Confirmar tarea**: verás qué decisiones son correctas y la explicación de las incorrectas.",
             "Una vez registrada la tarea, verás la mejor opción de cada decisión y los puntos obtenidos."],
    "ten_en_cuenta": ["Tienes **una sola oportunidad de revisión por tarea**."],
}
RESULTADOS = "Al terminar verás tu puntaje total, los puntos de cada parte y por criterio. Descarga tu PDF de resultados y guárdalo como evidencia."
