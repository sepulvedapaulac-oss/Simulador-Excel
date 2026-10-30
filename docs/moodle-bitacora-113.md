# Bitácora de Moodle · Curso 113 «Inteligencia Artificial aplicada a la Gestión de Remuneraciones»

Aula virtual: aulavirtual.tremenpartner.com (Moodle 4.5). Fuente de verdad: planilla SENCE **1961128** (presentada). La autora autorizó corregir en Moodle, y en el repositorio cuando hay que recompilar, lo que difiera de la planilla.
Fecha de los cambios: 30-10-2026 (UTC). No se borró ninguna actividad, intento, envío ni calificación: lo que sobra se ocultó. Antes de cada bloque se tomaron capturas y después se verificó releyendo el formulario o la página.

## 1. Recompilado en el repositorio
| Recurso | Cambio | Prueba (escritorio y 390×844) |
|---|---|---|
| `Evaluacion_final_Parte2_caso_practico_SCORM12.zip` | Aprobación 60 % (`pass` 0.6 por `lesson.py`, sin 70 fijo en `lesson.js`), «equivale al 40 % de la nota final», 60 puntos = 4,0. Mismo umbral en el resultado y en el PDF. | Sin errores JS ni desborde; SCORM informa `passed` y 100 con la pauta óptima |
| 8 laboratorios (`Laboratorio_1A` … `4B`) | Práctica sin nota: `"practice": True`, el motor informa `completed` (no `passed/failed`); textos «Es una práctica sin nota: no pondera en tu nota final y cuenta para tu avance»; estado «Buen dominio / Sigue practicando» en vez de «Aprobado / Pendiente». (Rehace el cambio del commit local descartado f7a96f2.) | Sin errores JS ni desborde; 1B sin pasos automáticos (carga y avanza hasta la etapa 2) |
| `Evaluacion_diagnostica_integral_SCORM12.zip` | Competencia y AE de la planilla; informa `completed` (antes `failed` por `pass: 0`, que el motor trataba como 70 %). | Sin errores JS ni desborde |
| Presentación del curso (HTML) y Guía del participante (PDF) | Competencia «… en el cierre mensual, de acuerdo a …», AE con «de acuerdo a» y «en el cálculo/cierre mensual», horas 36 / 16,5 / 7,5 (60 / 27,5 / 12,5 %) y por módulo, ponderación 10 + 3 × (4 + 6) + 20 + 40, tareas con rúbrica corregidas por la tutora, laboratorios sin nota, escala 1,0–7,0 al 60 %, asistencia mínima 40 %. Sin evaluaciones ramificadas ni casos de análisis. | Sin errores JS ni desborde (presentación); PDF revisado como imagen |
| `Evaluacion_final_del_curso_SCORM12.zip` (P1 + P2 juntas, no se usa en el curso 113) | Aprobación 60 % por coherencia. | — |

Plantillas Word de las tareas (descargadas de Moodle, con la rúbrica al final): `dist/modulo2|3|4/Evaluacion_MN_Parte2_*.docx`.

## 2. Cambios en Moodle
| cmid / elemento | Antes | Después |
|---|---|---|
| 5676 Evaluación final parte 2 | Paquete `Evaluacion_final_del_curso_SCORM12.zip` (P1 + P2, 35 %, 70 %); texto «4,0 con 70 puntos», «35 %»; para aprobar 0 | Paquete `Evaluacion_final_Parte2_caso_practico_SCORM12.zip`; texto «4,0 con 60 puntos (60 % de exigencia)» y «40 %»; completitud con estado «aprobado» o «completado»; ítem del libro: para aprobar 60 |
| 5628 | «Actividad práctica Laboratorio 1:Laboratorio de prompts», paquete con nota | «Laboratorio 1A: laboratorio de prompts», paquete de práctica |
| 5629 | «Actividad práctica laboratorio 2:  Semáforo de datos y tabla segura» | «Laboratorio 1B: semáforo de datos y tabla segura», paquete de práctica |
| 5635, 5644, 5649, 5650, 5662, 5663 | Paquetes con «Aprobado/Pendiente» al 70 % | Paquetes de práctica (mismo nombre de archivo) |
| 5711 Evalúa tu nivel de conocimiento | Diagnóstico con AE antiguos, estado `failed` | Paquete recompilado |
| 5630 Evaluación Módulo 1 | Máx. 7; aprobar 4,00 (57 %); 1 hora; texto «5 %», «70 %», «2 intentos» | Máx. 10; aprobar 6 (60 %); 30 min; 3 intentos; texto de la planilla (10 %) |
| 5640 Evaluación Módulo 2 - Parte 1 | Máx. 7; aprobar 4,00; 1 hora; intentos sin límite; texto «ramificada 2,5 %» | Máx. 10; aprobar 6; 30 min; 3 intentos; texto: 40 % del módulo (4 %) + tarea 60 % (6 %) |
| 5655 Evaluación Módulo 3 - Parte 1 | Igual que M2 (3 intentos) | Igual que M2 |
| 5665 Evaluación Módulo 4 - parte 1 | Igual que M2; nombre con «parte» | Igual que M2; nombre «Evaluación Módulo 4 - Parte 1» |
| 5677 Evaluación final parte 1 | Máx. 7 (40 puntos de preguntas); aprobar 4,00; «4,0 con 14 puntos» | Máx. 20; aprobar 12 (60 %); texto «4,0 con 12 puntos», 20 %, 3 intentos |
| 6061, 6062, 6063 Tareas Parte 2 (M2–M4) | Existían con instrucciones y plantilla Word; aprobar 70; «Calificación simple directa» | Aprobar 60; calificación avanzada «Rúbrica» lista para usar, con los 4 criterios × 3 niveles (100 puntos) de la plantilla |
| 5632, 5645–5648 | «2.2: …», «Lección 3.1 …» … | «2.2 IA como asistente para fórmulas de Excel», «3.1 Preparación de datos para análisis», «3.2 …», «3.3 …», «3.4 …» (títulos de la planilla, numeración uniforme; «2.4 Validación y control de calidad» queda igual que en la planilla) |
| 5636, 5651 | «Guía formulas de control en Excel», «Gua preparación de datos y diccionario» | «Guía fórmulas de control en Excel», «Guía preparación de datos y diccionario» |
| 5705, 5706, 5707, 5708 Casos aplicados (Mindsmith, SCORM) | Visibles, sin estar en la planilla | **Ocultos** (no se borran; peso 0) |
| 5710 Presentación del curso, 5709 Guía del participante | Ponderación 10/20/70, competencia sin «en el cierre mensual» | Archivos recompilados (mismo nombre) |
| Sección 5 «Evaluación» (resumen) | «Parte 1 (30 %)», «Parte 2 (30 %)», 90 minutos | Parte 1 20 % y Parte 2 40 % (60 % en total), 1 h + 1 h, aprobación 12/20 y 60/100, escala al 60 % |
| Letras del curso | Letras del sitio A–F | 61 letras 1,0–7,0: bajo 60 % nota = 1 + 3·x/60; desde 60 % nota = 4 + 3·(x−60)/40 (truncada a la décima); 60 % = 4,0, 80 % = 5,5, 100 % = 7,0 |
| Libro: pesos | Natural sin sobrescribir: 38 ítems con 2,999 % cada uno | Natural con pesos fijos: M1 cuestionario 10; M2–M4 cuestionario 4 + tarea 6; final P1 20; final P2 40; los demás 0 (fijo, visibles) |
| Libro: total del curso | Real; para aprobar 0 | «Letra (porcentaje)»; para aprobar 276 de 460 (60 %) |
| Libro: 9 ítems evaluados | Real | «Real (letra)» (por ejemplo, 6,00 (4,0)) |

## 3. Libro resultante (verificado al final)
| Ítem | Máx. | Para aprobar | Peso |
|---|---:|---:|---:|
| Evaluación Módulo 1 (cuestionario) | 10 | 6 | 10 % |
| Evaluación Módulo 2 - Parte 1 / Parte 2 (tarea) | 10 / 100 | 6 / 60 | 4 % / 6 % |
| Evaluación Módulo 3 - Parte 1 / Parte 2 (tarea) | 10 / 100 | 6 / 60 | 4 % / 6 % |
| Evaluación Módulo 4 - Parte 1 / Parte 2 (tarea) | 10 / 100 | 6 / 60 | 4 % / 6 % |
| Evaluación final parte 1 | 20 | 12 | 20 % |
| Evaluación final parte 2 (SCORM) | 100 | 60 | 40 % |
| Diagnóstico, 16 lecciones, 8 laboratorios, 4 casos ocultos | 100 | — | 0 % |
| **Total del curso** | 460 | 276 (60 % = 4,0) | 100 % |

Comprobación: 10 + 3 × (4 + 6) + 20 + 40 = 100.

## 4. Material visible frente a la planilla (13. Material didáctico)
16 SCORM de lecciones · 8 laboratorios · 8 PDF · 4 videos de bienvenida (Vimeo, en las etiquetas de cada módulo) · presentación y guía · 4 resúmenes · 4 glosarios · 4 cuestionarios de módulo · 3 tareas con plantilla y rúbrica · evaluación final parte 1 y parte 2 · evaluación diagnóstica = 56. Ocultos: 4 casos aplicados.

## 5. Pendiente para la autora (no se hace en Moodle)
- SoliCurso: corregir la profesión de Marcela Paz Palma Castillo si corresponde.
- Finalización del curso: si quiere exigir «aprobar cada evaluación», configurar en *Finalización del curso* la condición «calificación de aprobado» en los 9 ítems evaluados (no se tocó).
- Las vistas de verificación del reproductor SCORM se hicieron con la cuenta administradora en modo revisión.
