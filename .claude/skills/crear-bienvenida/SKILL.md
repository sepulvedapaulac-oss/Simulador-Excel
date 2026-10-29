---
name: crear-bienvenida
description: Crea la bienvenida del curso para la primera sección de Moodle, con los colores del curso: presentación del curso (HTML), guía del participante (PDF) e instrucciones de bienvenida (TXT para el código fuente de Moodle). Úsala al configurar un curso, cuando la autora pida la bienvenida, la presentación o la guía, o cuando cambie la planilla SENCE.
---
# Crear la bienvenida del curso

Son tres piezas que siempre van juntas (estándar §1, «Bienvenida del curso»). Referencia de formato y nivel: `src/ejemplos/bienvenida/referencia/` (curso de servicio al cliente). Su contenido no se copia a otro curso.

## 1. Antes de escribir
- `curso.json` → `"sence"` debe tener competencia, AE, criterios y horas de la planilla SENCE vigente (fuente única, estándar §10). Si falta, complétalo desde la planilla; si no hay planilla, usa primero `codificador-cursos-sence`.
- `curso.json` → `"colores"` y `"marca"`: la paleta y el texto del encabezado del curso. Si el curso ya tiene recursos, toma los colores de ellos (presentación anterior, lecciones, `tools/base.css` o CSS del curso); no inventes una paleta.
- Revisa qué existe realmente en el curso (lecciones, laboratorios, tareas, evaluaciones): la bienvenida declara solo lo que existe y coincide con la planilla.

## 2. Presentación (HTML) y guía del participante (PDF)
1. Copia `src/ejemplos/bienvenida/presentacion.py` a `src/bienvenida/presentacion.py` y adapta: curso, modalidad, plataforma, público, requisitos, caso conductor, tutor o facilitador (`FACILITADORA` con `rol`), acompañamiento, metodología, módulos (lecciones, laboratorios, PDF, Parte 2 = tarea con rúbrica), distribución horaria (`h`: plataforma, autónomo, evaluación, que suma las horas de la planilla), recorrido, ponderación (`EVAL`), norma, instrumentos de la evaluación final, diagnóstico, requisitos técnicos e imágenes (`IMAGENES`).
2. No escribas la competencia ni los AE: salen de `curso.json`.
3. `python3 tools/build_presentacion.py src/bienvenida/presentacion.py` → `dist/bienvenida/Presentacion_del_curso.html` y `Guia_del_participante.pdf`.
4. Si el curso ya tiene su propio generador de presentación (por ejemplo `src/curso/generar.py`), puedes conservarlo, pero haz que lea la competencia y los AE de `curso.json` → `"sence"` y que use los mismos nombres de salida.

## 3. Instrucciones de bienvenida (TXT)
1. Copia `src/ejemplos/bienvenida/bienvenida.py` a `src/bienvenida/bienvenida.py`: lema, número de lecciones, ciclo de trabajo del curso y cierre.
2. `python3 tools/build_moodle.py bienvenida` → `dist/bienvenida/Bienvenida_Moodle.txt`. Se pega en Moodle en la descripción de la primera sección (editor › Código fuente). En la misma sección se suben la presentación (Recurso › Archivo, o incrustada) y la guía PDF.

## 4. Revisar y entregar
- Presentación: escritorio y 390 px, tema claro y oscuro, sin desborde ni errores de JavaScript. Guía: `pdftoppm`, sin páginas casi vacías ni tablas cortadas. TXT: ábrelo en un navegador a 390 px.
- Lenguaje neutro en género, datos ficticios, sin «determinístico».
- `python3 tools/entrega/pack.py bienvenida`, commit y push.
