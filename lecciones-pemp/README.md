# Lecciones PEMP · Módulo 1 (estándar SCORM 1.2)

Lecciones 1.1 a 1.5 del curso **Operación Segura de Plataformas Elevadoras Móviles de Personal**, rehechas con un diseño común y con interacciones distintas en cada pantalla. Se mantiene la paleta original del curso: azul `#171697`, marino `#10154e`, turquesa `#00a5ab` y amarillo `#f4c542`.

## Entregables (`dist/`)

| Lección | HTML autocontenido | Paquete para Moodle |
|---|---|---|
| 1.1 Cuando elevar también es una decisión | `Leccion_1_1_Cuando_elevar_es_una_decision.html` | `…_SCORM12.zip` |
| 1.2 Familias de PEMP | `Leccion_1_2_Familias_de_PEMP.html` | `…_SCORM12.zip` |
| 1.3 Componentes que sostienen la operación | `Leccion_1_3_Componentes_que_sostienen_la_operacion.html` | `…_SCORM12.zip` |
| 1.4 Personas, responsabilidades y límites | `Leccion_1_4_Personas_responsabilidades_y_limites.html` | `…_SCORM12.zip` |
| 1.5 Los riesgos aparecen antes de subir | `Leccion_1_5_Los_riesgos_aparecen_antes_de_subir.html` | `…_SCORM12.zip` |

## Estructura común (11 pantallas)

1. **Inicio**: caso con Camila (personaje recurrente) y decisión con consecuencias.
2. **Explicación en video**: video propio animado de 6 capítulos, narrado por Ninoska, con subtítulos y capítulos. Se desbloquea al verlos todos.
3. a 7. **Contenido**: cinco pantallas, cada una con una interacción distinta.
8. **Caso aplicado**: caso ramificado de tres decisiones con consecuencias.
9. **Comprobación**: 5 preguntas, retroalimentación inmediata, letra correcta variada, mínimo 80 % y reintento con pantallas sugeridas para repasar.
10. **Transferencia**: plan aplicado al propio trabajo (exige haber aprobado).
11. **Finalización**: puntaje, decisiones acertadas al primer intento y botones para repasar.

Panel de ruta lateral con navegación bloqueada hasta completar cada pantalla; al terminar, navegación libre. Narración de Ninoska en cada pantalla con opción de narración automática. Funciona en celular y en modo oscuro.

## Interacciones por lección

| Pantalla | 1.1 Decisión | 1.2 Familias | 1.3 Componentes | 1.4 Personas | 1.5 Riesgos |
|---|---|---|---|---|---|
| 3 | Acordeón | Tarjetas que giran | Proceso paso a paso | Tarjetas que giran | Unir conceptos |
| 4 | Proceso paso a paso | Pestañas | Puntos sobre imagen | Pestañas | Acordeón |
| 5 | Conversación | Clasificar (arrastrar) | Acordeón | Clasificar (arrastrar) | Puntos sobre escena |
| 6 | Puntos sobre imagen | Mito o realidad | Completar frases | Conversación por radio | Mazo de señales |
| 7 | Mazo (alcance del curso) | Unir conceptos | Ordenar pasos | Mito o realidad | Ordenar pasos |

Ninguna interacción se repite dentro de una lección y cada lección cambia respecto de la anterior.

## SCORM 1.2

- `cmi.core.lesson_status`: `incomplete` mientras se avanza; `passed` al llegar a la finalización (comprobación ≥ 80 % y transferencia completa).
- `cmi.core.score.raw`: mejor puntaje de la comprobación (0–100).
- `cmi.core.lesson_location` y `cmi.suspend_data`: reanudación en la pantalla y con el avance guardado.

## Reconstruir y probar

```bash
python3 build.py --all                 # genera dist/*.html y dist/*_SCORM12.zip
python3 build.py --all --narr          # exporta los textos de narración a media/<id>/narracion.json
node tests/run.js dist/Leccion_1_2_Familias_de_PEMP.html   # diseño (escritorio, celular, oscuro) + recorrido en LMS simulado
node tests/video_check.js dist/Leccion_1_2_Familias_de_PEMP.html
```

- `engine/`: diseño (`lesson.css`), motor (`lesson.js`) y plantilla (`shell.html`) comunes a todas las lecciones.
- `src/`: contenido de cada lección (pantallas, textos del video y de la narración).
- `media/<id>/img`: imágenes originales de cada lección; `media/<id>/aud`: narraciones (voz Ninoska, ElevenLabs).
- `tests/lms_mock.html`: LMS SCORM 1.2 simulado para probar estado, nota y reanudación (`tests/lms_mock.html?src=/dist/<archivo>.html&log=1`).
- Para reiniciar el avance en una vista previa sin LMS, abrir el HTML con `?reset=1`.
