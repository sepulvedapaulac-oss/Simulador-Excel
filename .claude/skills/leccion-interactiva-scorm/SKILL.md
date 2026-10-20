---
name: leccion-interactiva-scorm
description: Crea lecciones interactivas tipo Rise para cursos asincrónicos en Moodle a partir de un guion o contenido, con panel de ruta lateral, narración de voz, video explicativo, una interacción distinta por pantalla, comprobación con mínimo de 80% y paquete SCORM 1.2. También crea actividades prácticas evaluadas y simuladores de práctica con el mismo estilo. Úsala cuando pidan "crear una lección", "lección tipo Rise", "lección interactiva", "transformar a SCORM", "actividad práctica para evaluar", "simulador para practicar" o entreguen un guion de lección o un módulo de un curso e-learning.
---

# Lección interactiva + SCORM 1.2

Estándar de lecciones para cursos **asincrónicos** (no hay docente que explique): todo debe entenderse solo, cada pantalla tiene una interacción y el avance queda registrado en Moodle.

## Qué entrega cada pedido

| Pedido | Entregables |
|---|---|
| Lección | `Leccion_X_Y_Titulo.html` autocontenido + `Leccion_X_Y_Titulo_SCORM12.zip` + vista previa publicada |
| Actividad práctica | igual, tipo `actividad` (nota sobre 100, aprueba con 80%) |
| Simulador | igual, tipo `simulador` (completado tras 3 casos, nota = % de aciertos) |

## Flujo de trabajo

1. **Leer el contenido** y verificar que sea correcto y vigente (normas, cifras, fechas). Corregir y avisar qué se cambió. No inventar datos: si falta información, se dice.
2. **Planificar el mapa de pantallas** (tabla: pantalla · objetivo · interacción · clave de bloqueo). Seguir la estructura estándar de abajo y el catálogo de `references/interacciones.md`. **No repetir el tipo de interacción dentro de una lección** y variar respecto de la lección anterior del mismo módulo.
3. **Escribir la fuente** copiando el ejemplo más parecido de `templates/ejemplos/` (las lecciones 2.6 a 2.9 cubren casi todo el catálogo) y reemplazando el contenido. Mantener los marcadores `/*{{BASECSS}}*/`, `/*{{COMPCSS}}*/`, `/*{{ENGINE}}*/`, `{{AUDIO_JSON}}`, `{{VDURS}}`, `{{IMG:nombre}}`, `/*{{TAIL}}*/`.
4. **Producir medios** según `references/produccion.md`: imágenes únicas (Canva preferido; si no está disponible, ElevenLabs), narración con la voz de Ninoska en ElevenLabs (un audio por pantalla + uno por escena de video), video propio animado (o HeyGen si está habilitado).
5. **Construir**: `python3 scripts/build.py leccion fuente.html --title "Lección X.Y — Título" --id CURSO_MX_LXY --name Leccion_X_Y_Titulo --img img/ --aud aud/ --out salida/`
6. **Probar** (obligatorio antes de entregar): `python3 scripts/check_layout.py salida/Leccion_X_Y_Titulo.html` (errores JS y textos fuera de su cuadro en escritorio y celular) + un recorrido completo con Playwright: avanzar resolviendo cada actividad, fallar la comprobación y reintentar, aprobar con ≥80%, ver la finalización, y probar el SCORM en `scripts/lms_mock.html` (estado, nota y reanudación). Mirar las capturas.
7. **Entregar**: commit/push si hay repositorio, publicar el `.artifact.html` como vista previa, enviar el zip SCORM y explicar en español qué contiene, cómo se aprueba y qué limitaciones tiene.

## Estructura estándar de una lección (10–11 pantallas)

1. **Inicio** – caso con el personaje recurrente (situación real del trabajo) + pregunta de decisión con consecuencias.
2. **Explicación** – video narrado de 5–7 escenas con subtítulos y capítulos (bloqueo: verlo completo o recorrer todos los capítulos).
3. a 7. **Contenido** – 4 o 5 pantallas, cada una con una interacción distinta (hotspot, flashcards, línea de tiempo, pestañas, acordeón, ordenar, clasificar, completar, unir, simulador, etc.).
8. **Caso aplicado** – decisión ramificada o caso integrador.
9. **Comprobación** – 5 preguntas, retroalimentación inmediata, **letra correcta variada (A, B, C, D)**, mínimo **80%**.
10. **Transferencia** – actividad aplicada a su propio trabajo; exige además haber aprobado (`data-gate="... pass"`).
11. **Finalización** – solo accesible con ≥80%; resume puntaje y decisiones acertadas al primer intento, con botones para repasar.

## Reglas que siempre se cumplen

Ver la lista completa en `references/estandares.md`. Las esenciales:

- **Panel de ruta lateral**: navegación bloqueada al principio (cada pantalla se desbloquea al completar su actividad); al terminar la lección, navegación libre para repasar.
- **Toda caja de contenido es interactiva**; no hay bloques de texto estáticos.
- **Los encabezados (eyebrow) no nombran la herramienta** ("Paso", "Acordeón", "Proceso"…): describen el contenido.
- **Imágenes únicas** que no se repiten entre lecciones.
- **Narración de Ninoska** en cada pantalla, con botón para escuchar y opción de narración automática.
- **Lenguaje claro y autoexplicativo**, retroalimentación que explica el porqué, fuentes al pie.
- Funciona en celular sin desbordes y en modo oscuro.

## Actividades prácticas y simuladores

- Actividad: partir de `templates/ejemplos/actividad_1.html` o `actividad_2.html`. Cada `.etask` lleva `data-pts`, `data-title`, `data-lesson`; se califica con `grade(id, obtenido, máximo, explicación)` o, para opción múltiple, con `data-auto="mc"`. Una respuesta por tarea, corrección explicada, resultado por tarea con la lección a repasar y nuevo intento.
- Simulador: partir de `templates/ejemplos/simulador.html` (pestañas Calculadora / Practicar, casos aleatorios con corrección y solución paso a paso). Declarar en pantalla lo que el simulador **no** calcula.
- Construir con `build.py actividad ...` o `build.py simulador ...`.

## Cómo pedírmelo

Basta con entregar el guion o el contenido y decir, por ejemplo:
"Crea la lección 3.2 del curso *Prevención de Riesgos*, módulo 3, con este guion. Personaje: Andrés, supervisor de bodega en Logística Sur."
Si no se indica, se pregunta solo lo imprescindible: nombre del curso y módulo, número de lección y personaje recurrente.
