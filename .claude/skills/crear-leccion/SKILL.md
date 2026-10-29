---
name: crear-leccion
description: Produce una lección SCORM 1.2 interactiva del curso con el flujo estándar (gancho, video, herramientas, caso, comprobación, transferencia y cierre). Úsala para cada lección x.1 a x.4 de un módulo.
---
# Crear una lección

1. Revisa en `docs/diseno-curso.md` el objetivo y las herramientas asignadas a la lección, y el caso conductor.
2. Parte de un ejemplo: `src/ejemplos/leccion-con-voz` (x.1 y x.3) o `src/ejemplos/leccion-sin-voz` (x.2 y x.4). Para clasificar en matriz usa `leccion-matriz-clasificar`; para diagramas con puntos, ordenar pasos y stepper, `leccion-diagrama-stepper`. Catálogo completo en `docs/componentes.md`.
3. Copia a `src/moduloN/leccion-N-X/` y adapta `lesson.py` (`id`, `ident` único, `zip_name`, `title`, `course_label`, `voice`, narración, video, comprobación y datos de componentes), `content.html` y `lesson.js` si hay componentes propios.
4. Flujo obligatorio: Inicio con decisión → Video por capítulos → 2 o 3 herramientas interactivas distintas → Caso con decisiones encadenadas → Comprobación de 5 preguntas (80 %) → Transferencia con respuesta modelo → Finalización.
5. Redacción: español neutro, tuteo, lenguaje neutro en género, feedback en todas las alternativas, sin «determinístico». Reparte la respuesta correcta entre A, B, C y D: no siempre la misma letra ni la más larga. El motor desordena las alternativas por persona; en componentes propios usa `api.shuffle`. En lecciones con voz, la narración va con números y siglas escritos con palabras.
6. No pongas en la lección la competencia, los aprendizajes esperados ni los criterios de evaluación: viven en la bienvenida, las tareas y la evaluación final (estándar §10).
7. Imágenes: `img/iNN_hero.jpg` e `img/iNN_b.jpg` con `alt` que describa lo que muestra la imagen.
8. Compila con `--voice none` y prueba en escritorio y móvil (`run_lesson.js`, o `brute_lesson.js` con pasos si tiene componentes propios). Revisa capturas: textos cortados, puntos que tapan contenido, selectores truncados, tablas en móvil.
9. Commit y push. La voz se genera después (habilidad `generar-voz`), en segundo plano.
