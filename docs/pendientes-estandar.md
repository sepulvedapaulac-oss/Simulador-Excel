# Pendientes para llevar el curso al estándar (octubre de 2026)

Curso: **Inteligencia Artificial aplicada a la Gestión de Remuneraciones**. Generado al aplicar el estándar de la plantilla. Úsalo con la habilidad **actualizar-curso**: marca lo que se complete y borra este archivo cuando no quede nada pendiente.

## Inventario frente al estándar

| Elemento del estándar | Estado | Lo que hay hoy |
|---|:-:|---|
| `curso.json` → `sence` (competencia, AE, criterios, horas) | ✅ | Completo (4 AE) |
| `curso.json` → `colores` y `marca` | ⬜ | Paleta por defecto de tools/base.css (registrar la del curso si es otra) |
| Bienvenida · presentación HTML | ✅ | dist/curso/Presentacion_del_curso.html |
| Bienvenida · guía del participante PDF | ✅ | dist/curso/Guia_del_participante_IA_Remuneraciones.pdf |
| Bienvenida · instrucciones TXT | ⬜ | — |
| Módulo 1 · Parte 2 tarea con rúbrica (TXT, plantilla Word, rúbrica) | ⬜ | — |
| Módulo 2 · Parte 2 tarea con rúbrica (TXT, plantilla Word, rúbrica) | ⬜ | — |
| Módulo 3 · Parte 2 tarea con rúbrica (TXT, plantilla Word, rúbrica) | ⬜ | — |
| Módulo 4 · Parte 2 tarea con rúbrica (TXT, plantilla Word, rúbrica) | ⬜ | — |
| Evaluación final · instrucción general, Parte 1 y Parte 2 en TXT | ⬜ | — |
| Lecciones sin competencia, AE ni criterios | ✅ | No se encontraron |

## Notas de este curso

- Curso armado en la rama `ccr-82420ce4-vyunoh` del repositorio `Simulador-Excel` (4 módulos, 60 h). Esta rama parte de esa. Es el curso del que nació la plantilla: sus instrucciones anteriores se conservan completas al final de `CLAUDE.md`.
- Se creó `curso.json` (no existía) con la competencia, los 4 AE, los criterios y las horas de `src/curso/datos.py` (planilla SENCE), y la ponderación vigente que indica `CLAUDE.md` (laboratorios 10 %, evaluaciones de módulo 20 %, evaluación final 35 % + 35 %; en `evaluacion` quedó «actividades 30»). **Verificar contra la planilla SENCE presentada** y anotar el número de solicitud.
- Evaluación Parte 2 actual: evaluaciones ramificadas SCORM en los módulos 2 a 4 («Cierre bajo revisión», «La gerencia necesita respuestas», «Modernizando el cierre»); el módulo 1 solo tiene cuestionario. Convertirlas en **tareas con rúbrica** (`tools/build_tarea.py`) y actualizar la planilla SENCE y la ponderación en el mismo cambio. Preguntar a la autora si el módulo 1 lleva tarea.
- Bienvenida: existen la presentación (`dist/curso/Presentacion_del_curso.html`) y la guía PDF. Falta el TXT (`tools/build_moodle.py bienvenida`) y que la presentación lea los AE de `curso.json`.
- Evaluación final: existe la instrucción de la Parte 2 (`docs/`); faltan la instrucción general y la de la Parte 1 en TXT (`tools/build_moodle.py final`).
- Colores: paleta por defecto verde azulado y azul petróleo (`tools/base.css`), `colores` vacío.
- `tools/build_pdf.py` y `tools/entrega/pack.py` tienen cambios propios y no se reemplazaron.
