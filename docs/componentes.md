# Catálogo de componentes del motor (`tools/engine.js`)

Cada lección es una carpeta `src/<modulo>/<leccion>/` con:
- `lesson.py`: genera `lesson.json` (metadatos, narración, video, comprobación y datos de los componentes).
- `content.html`: las pantallas, cada una `<section class="slide" data-title="…" data-gate="clave">`.
- `lesson.js` (opcional): componentes propios con `Object.assign(window.LESSON, {init(api){…}})`. `api` trae `$`, `$$`, `done(clave)`, `feedback`, `S` (estado; `S.first` se guarda en SCORM), `esc`, `go(i)` y `shuffle(lista)`. Todo componente propio con alternativas usa `api.shuffle` y guarda el orden en su estado (como `evaluacion-ramificada`).

## Metadatos (`lesson.py`)
`id`, `ident` (identificador SCORM único), `zip_name`, `title`, `course_label` (texto de la barra superior), `voice` (true/false), `pass` (0.8 lecciones, 0.7 laboratorios), `lab` (true en laboratorios y evaluaciones con nota propia), `diag` (true en las evaluaciones diagnóstica y de salida: estado «completed», sin nota mínima; `modo` «entrada» o «salida»), `hoja` (true si usa el simulador de Excel).

## Compuertas y avance
- `data-gate="a b c"`: la pantalla se desbloquea cuando se completan todas esas claves (`api.done('a')`).
- `data-gate-msg`: mensaje si se intenta avanzar antes.
- `data-audio="p03"` en la pantalla: narración `narration.p03` (solo lecciones con voz).
- `data-report` en la última pantalla: muestra métricas (`#fPct`, `#fEsc`) o llama a `LESSON.report()`.

## Componentes por atributo
| Atributo | Qué hace | Datos en `lesson.py` | Ejemplo |
|---|---|---|---|
| `data-choice="k" data-correct="B"` | Decisión con alternativas en orden aleatorio (letras según la posición; `data-opt` y los `<template data-for="k-A">` no cambian; `data-fixed` mantiene el orden) y feedback; `data-then` abre la fase siguiente | — (todo en HTML) | `leccion-con-voz`, pantalla 1 y caso |
| `data-flip="k"` | Tarjetas que se voltean | — | `leccion-con-voz` |
| `data-acc="k"` | Acordeón | — | `leccion-con-voz` |
| `data-tabs="k"` | Pestañas | — | `leccion-sin-voz` |
| `data-sort="k"` | Clasificar arrastrando o tocando en columnas | `sorts.k = {bins, items, order}` | `leccion-matriz-clasificar` |
| `data-hotspot="k"` | Puntos sobre una imagen o diagrama con panel de explicación | `hotspots.k = [{t, lvl, html}]` | `leccion-diagrama-stepper` |
| `data-pairs="k"` | Emparejar | `pairs.k = {items:[[izq, der]]}` | — |
| `data-panel="k"` | Línea de tiempo con panel | `panels.k = [{t, html}]` | Curso original, lección 3.4 y 4.4 |
| `data-yn="k"` | Checklist sí/no con explicación y respuesta modelo | `yn.k = [[texto, 1/0, explicación]]` | Curso original, lecciones 3.4 y 4.2 |
| `data-builder="k"` | Constructor personal con selectores, respuesta modelo y copiar | `builders.k = {title, rows}` | Pantallas de transferencia |
| `data-seltable="k"` | Tabla de clasificación con selectores | `seltables.k = {options, rows}` | — |
| Video (`#player`) | Reproductor por capítulos con subtítulos y transcripción | `video = {voice, scenes:[{t, lines, html}]}` | Todas las lecciones |
| Comprobación (`#qcard`) | 5 preguntas con feedback por alternativa, en orden aleatorio por intento (`fixed: true` lo mantiene) | `quiz = [{q, o, c, f}]` | Todas las lecciones |

## Componentes propios ya resueltos (reutilizables desde los ejemplos o el curso original)
- **Simulador de Excel** (`tools/hoja.js`, `"hoja": true`): `Hoja(el, {cols, rows, data, locked, start})`, `hoja.value(k)`, `hoja.get(k)`, `hoja.fillDown(k, filaFinal)`. Ver `laboratorio-simulador-excel`.
- **Ordenar secuencia** y **stepper guiado con bitácora**: `leccion-diagrama-stepper` (prueba con `tools/test/steps/ordenar-secuencia.json`).
- **Simulador de flujo con incidentes**: `laboratorio-simulador-flujo`.
- **Caso ramificado** con rutas, expediente y retroalimentación por competencia: `evaluacion-ramificada`.
- **Evaluación diagnóstica y de salida con comparador** (`"diag": true`, motor `tools/diagnostico.js`): SCORM «completed», sin nota para aprobar.
  - `evaluacion-diagnostica` (`"modo": "entrada"`): perfil en gráfico de araña, código de entrada y PDF.
  - `evaluacion-salida` (`"modo": "salida"`): inicio y final superpuestos, avance por módulo, módulos por repasar y PDF.
  - Los datos están en `evaluacion-diagnostica/banco.py`: 5 preguntas por módulo y unidad, con formas paralelas de entrada y salida.
  - Prueba: `tools/test/comparador.js`.
- **Evaluación final del curso**: Parte 1 en Moodle XML (`cuestionario.py` con `POINTS = 2`) y Parte 2, caso aplicado integrador con PDF de resultados (generador de PDF propio, sin librerías externas): `evaluacion-final-curso`.

## Recursos fuera de las lecciones
- Textos para Moodle (TXT, estilos en línea, colores del curso; base `tools/moodle.py`):
  - Bienvenida: `src/bienvenida/bienvenida.py` → `python3 tools/build_moodle.py bienvenida` → `dist/bienvenida/Bienvenida_Moodle.txt`.
  - Evaluación final: `src/evaluacion-curso/instrucciones.py` → `python3 tools/build_moodle.py final` → instrucción general, Parte 1 y Parte 2 en `dist/evaluacion-curso/`.
  - Competencia, AE, criterios y horas salen de `curso.json` → `"sence"`; los colores, de `curso.json` → `"colores"` o de `tools/base.css`.
- Tarea con rúbrica (evaluación del módulo · Parte 2): `src/moduloN/tarea.py` (ejemplo `src/ejemplos/tarea/tarea.py`) → `python3 tools/build_tarea.py src/moduloN/tarea.py` → `dist/moduloN/tarea/`: instrucción TXT, plantilla de respuesta Word y rúbrica con pauta para el tutor.
- Cuestionario XML: `src/<modulo>/cuestionario.py` → `python3 tools/build_xml.py …`. `POINTS` fija el puntaje por pregunta (1 por defecto; 2 en la Parte 1 de la evaluación final).
- Programa, storyboard y planilla SENCE: `docs/programa/*.md` (plantillas en `docs/plantillas/`) → `python3 tools/build_doc.py …` (Word).
- Carruseles: `src/<modulo>/carruseles.py` (RESUMEN y GLOSARIO) → `tools/build_carousel.py`.
- PDF: `src/<modulo>/pdf/*.html` con metadatos en un comentario JSON → `tools/build_pdf.py`.
- Video del módulo: `src/<modulo>/video.py` (escenas con `say`; cada frase después de la primera revela una viñeta) → `tools/build_video.py`.

## Pruebas
- `node tools/test/run_lesson.js dist/<ruta> salida [mobile]`: recorre lecciones que solo usan componentes del motor.
- `STEPS=pasos.json node tools/test/brute_lesson.js dist/<ruta> salida [mobile]`: interactúa al azar y ejecuta pasos dirigidos (`cell`, `sel`, `click`, `eval`) para componentes propios; informa puntaje, desborde y errores. Con `PDF_OUT=archivo.pdf` descarga el PDF de resultados si la pantalla final lo ofrece.
