# Evaluaciones Parte 2 en SCORM (formato de actividad, modo evaluación)

Motor: el de `lecciones/practicas` (leer `lecciones/practicas/GUIA_AUTOR.md` y el modelo `lecciones/practicas/src/M1_A1.html`). Tipos de tarea: mc, multi, match, order, num, hot.

Modo evaluación (`--tipo evaluacion`):
- La respuesta se registra sin mostrar la corrección; al final se ve el puntaje, el detalle por pregunta y un botón "Revisar mis respuestas y la retroalimentación" que muestra cada pregunta corregida con su `.why`.
- Un solo envío por intento de Moodle (los intentos los controla Moodle).
- Aprobación: 60% (exigencia estándar). Cada pregunta = `data-pts="2"`; 10 preguntas = 20 puntos.

Reglas de contenido:
- `data-id` y `data-title` con el ID: `data-id="M2.P11" data-title="M2.P11 · Margen por unidad"`; `data-lesson` = lección a repasar.
- Cada pregunta es un CASO con datos concretos (tabla `.data` dentro de `.tablewrap`, conversación, panel recreado `.mock`, `.kpi`) que exige analizar, calcular o priorizar. Nivel más avanzado que la Parte 1.
- Variar las interacciones (no solo opción múltiple): cálculos con `num` (tolerancia explícita en el enunciado), clasificar con `match`, priorizar con `order`, diagnosticar con `hot` o `multi`. Máximo 4 preguntas del mismo tipo.
- `.why` explica la respuesta correcta y el error típico (retroalimentación correcta/incorrecta).
- Intro (`#intro`): caso del personaje, instrucciones (10 preguntas, 2 pts c/u, 20 pts, aprueba con 60%, la corrección se ve al final), `<p class="muted best"></p>` y botón `data-start` "Comenzar la evaluación →".
- Verificar toda la matemática. Datos de plataformas como datos del caso. Empresas ficticias. Nunca "Tremen learning studio". No fijar la fecha de vigencia de la Ley 21.719.

Construir (desde lecciones/evaluaciones):
python3 ../practicas/tools/build.py scorm_src/X.html --tipo evaluacion --pass 60 --id PYMES_M2_EV2 --name Evaluacion_M2_Parte2_Casos --title "Evaluación Módulo 2 · Parte 2: análisis de casos" --module 2 --img ../practicas/img --out scorm_dist
Probar: NODE_PATH=$(npm root -g) node ../practicas/tools/test_act.js scorm_dist/<name>/index.html <capturas>  y  node ../practicas/tools/test_scorm.js scorm_dist/<name>/index.html (debe dar raw 100 passed). Mirar capturas escritorio y celular, también la vista de revisión final (clic en #revBtn).
