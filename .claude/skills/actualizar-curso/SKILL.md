---
name: actualizar-curso
description: Lleva un curso ya armado al estándar vigente de la plantilla - bienvenida de tres piezas, evaluaciones Parte 2 de los módulos como tareas con rúbrica (Res. Ex. SENCE 2484 y 2486), instrucciones TXT de la evaluación final, fuente única SENCE en curso.json y lecciones sin competencia ni AE. Úsala cuando la autora diga «aplica el estándar», «actualiza el curso», «pasa la Parte 2 a tareas» o al abrir un curso que tiene docs/pendientes-estandar.md.
---
# Actualizar un curso ya armado al estándar

Lee primero `docs/estandar-cursos.md` (§0, §1, §7 y §10) y, si existe, `docs/pendientes-estandar.md`: ahí está el inventario de lo que este curso ya tiene y lo que le falta. No borres recursos existentes: se reemplazan solo cuando el nuevo está listo y probado.

## 1. Fuente única SENCE
1. Ubica la planilla SENCE vigente del curso (la última solicitud presentada o aprobada; si hubo rechazo, la corregida).
2. Copia a `curso.json` → `"sence"`: número de solicitud, competencia, AE, criterios y horas por módulo, **textuales**.
3. Si el curso tenía esos textos repetidos en otros archivos (datos de la presentación, lecciones, evaluaciones), haz que los lean de `curso.json` o corrígelos para que digan exactamente lo mismo.
4. Si la planilla está rechazada u observada, corrígela antes con `codificador-cursos-sence` (lee sus `reglas-aprendidas.md`).

## 2. Colores
Toma la paleta de los recursos que el curso ya tiene (presentación, lecciones, PDF) y regístrala en `curso.json` → `"colores"` y `"marca"`. Si usa la paleta por defecto, deja `"colores": {}`.

## 3. Bienvenida
Habilidad `crear-bienvenida`. Reutiliza los textos de la presentación y la guía existentes; corrige lo que no coincida con la planilla.

## 4. Evaluación Parte 2 de cada módulo → tarea con rúbrica
1. Para cada módulo, parte del instrumento actual de la Parte 2 (laboratorio SCORM, caso ramificado, producto declarado en la planilla) y conviértelo en tarea: el mismo caso y las mismas decisiones, ahora respondidas por escrito en una plantilla Word, con rúbrica de 3 a 5 criterios (habilidad `crear-evaluacion`, «Tarea con rúbrica»).
2. La tarea evidencia el verbo del AE del módulo y el producto que declara la planilla. Datos normativos solo verificados (fuentes del curso).
3. El SCORM anterior puede quedar como actividad práctica formativa si la autora quiere; avísale y registra la decisión.
4. Revisa que los pesos de la planilla, la presentación, la guía y Moodle digan lo mismo (Parte 1 + Parte 2 por módulo).

## 5. Evaluación final
Crea `src/evaluacion-curso/instrucciones.py` desde el ejemplo y compila `python3 tools/build_moodle.py final`: instrucción general, Parte 1 y Parte 2 en TXT, coherentes con los instrumentos reales (número de preguntas, puntos, tareas del caso integrador).

## 6. Lecciones
Busca en lecciones SCORM y su fuente («aprendizaje esperado», «competencia», «criterio de evaluación») y quita esos textos; recompila y prueba las lecciones que cambien.

## 7. Cierre
- Actualiza `docs/pendientes-estandar.md` (lo hecho y lo que queda) y `docs/diseno-curso.md`.
- Prueba en escritorio y 390 px. Empaqueta (`pack.py bienvenida`, `pack.py N`, `pack.py curso`), commit y push en la rama de trabajo.
- Entrega a la autora: lista de recursos nuevos, qué cambió en la planilla y qué debe actualizar en Moodle.
