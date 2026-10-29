---
name: crear-curso
description: Configura un curso nuevo a partir de la plantilla. Úsala cuando la autora pida crear o iniciar un curso, o cuando curso.json todavía diga «Nombre del curso».
---
# Crear un curso nuevo

Orden: **programa y storyboard → aprobación de la autora → planilla SENCE → configuración → producción módulo por módulo.**

1. Si no existe `docs/programa/programa.md` aprobado, usa primero la habilidad **crear-programa**: ahí se hacen las preguntas a la autora y se deciden público, temario, horas, recursos, elenco y evaluación. No produzcas recursos antes de la aprobación.
2. Con el programa aprobado, haz la planilla SENCE con la habilidad **codificador-cursos-sence**, salvo que la autora diga que el curso no se codifica.
3. Lee `docs/estandar-cursos.md`. Todo lo que el programa no defina toma el valor por defecto del estándar.
4. Completa `curso.json`:
   - `nombre`, `nombre_corto`, `publico`, `otec`, `plataforma`, `modalidad` y `participacion_minima` (requisito administrativo SENCE: 40 % por defecto en asincrónico).
   - `modulos.N.titulo`.
   - `evaluacion`: ponderación y aprobación, por defecto 40/20/40 con nota 4,0 y 60 % de exigencia; `parte2_modulo`: `"tarea"` o `"foro"` (lo que eligió la autora).
   - `sence`: competencia, AE, criterios, horas y número de solicitud, copiados de la planilla SENCE (fuente única, estándar §10).
   - `colores` y `marca`: la paleta del curso y el texto del encabezado (estándar §7). Si el curso usa la paleta por defecto, deja `colores` vacío.
   - `relator`: cómo se nombra a quien corrige las tareas («tutora», «facilitadora», «relator o tutor»).
5. Completa `docs/diseno-curso.md` desde el programa:
   - ficha y caso conductor con el elenco;
   - mapa de lecciones con objetivos y herramientas interactivas, sin repetir combinaciones;
   - recursos por módulo;
   - evaluación diagnóstica (entrada) y de salida con comparador;
   - evaluación final en dos partes;
   - ponderación en Moodle.
6. Crea las carpetas `src/moduloN/`, `src/evaluacion-diagnostica/`, `src/evaluacion-salida/` y `src/evaluacion-curso/`. Reserva las imágenes `src/img/iNN_hero.jpg` e `iNN_b.jpg` (copias de marcador hasta generarlas en Canva).
7. Produce primero la **bienvenida** (habilidad `crear-bienvenida`) y la evaluación diagnóstica (habilidad `crear-evaluacion`). Después avanza **módulo por módulo** y entrega cada uno completo (habilidad `entregar-modulo`). Al cierre van la evaluación de salida con comparador y la evaluación final del curso.
8. Commit y push de la configuración.
