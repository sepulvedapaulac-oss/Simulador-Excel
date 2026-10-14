# Encargo: actividades prácticas y evaluaciones (curso Legislación Laboral, Chile, octubre de 2026)

Personaje recurrente: **Camila**, del Equipo de Personas de **Horizonte Servicios** (empresa de servicios, Santiago). Todo en español de Chile, lenguaje claro y autoexplicativo (curso asincrónico). **Sin voz** (no hay narración ni audio). Montos de ejemplo en pesos chilenos; nunca el valor de la UF en pesos.

**Datos legales: usar SOLO los de `fuentes_moduloN/HECHOS_LEGALES.md`** (y el contenido de las lecciones en `fuentes_moduloN/` o `fuentes_moduloN/original/`). No inventar artículos, plazos ni cifras. Si algo no está en los hechos, no lo uses.

## Motor y herramientas (skill `.claude/skills/leccion-interactiva-scorm/`)
- Motor de casos y laboratorios: `assets/ev_caso.js` + `assets/ev_caso.css`. La fuente es un HTML con `const CASO={...}` (datos) y el marcador `/*{{ENGINE}}*/`. **Ejemplo de referencia completo:** `fuentes_evaluaciones/m3/ap1.html` (léelo entero antes de empezar; copia su estructura).
- Tipos de etapa: `decision` (opciones con `pts` y `fb`, `siguiente` por opción = ramificación, `ideal` = lo recomendable), `abierta` (`verbo`: Describe/Explica/Analiza, `consigna`, `minPalabras`, `modelo`, `criterios`; sin nota automática), `multi` (`items` con `ok` y `fb`, `pts`), `clasificar` (`categorias`, `items` con `cat` y `fb`, `pts`), `numero` (`campos` con `valor`, `tol`, `unidad`; `solucion`; `pts`), `ordenar` (`items` en el orden correcto; el motor pide la posición; `pts`). Toda etapa calificada lleva `competencia` (id de `CASO.competencias`, con `nombre`, `fortaleza`, `mejora`, `repasar`). La etapa sin `siguiente` cierra el caso. `expediente` = documentos del caso visibles todo el tiempo.
- Al final el motor muestra: nota y puntaje (envía a Moodle `score.raw`, `passed/failed` con 80%), **retroalimentación global** (barras por competencia, fortalezas y aspectos a mejorar), **informe descargable** (HTML) e impresión/PDF, y registra las respuestas en `cmi.interactions`.
- Construir: `python3 .claude/skills/leccion-interactiva-scorm/scripts/build.py caso fuente.html --title "..." --id LEGLAB_M3_AP1 --name Nombre_Archivo --out out/`
- Probar (obligatorio): `python3 .../scripts/check_layout.py out/Nombre.html cap/` y `python3 .../scripts/test_caso.py out/Nombre.html cap/ primera|ultima|azar` (las tres estrategias deben dar `RECORRIDO OK`). **Mira las capturas** (`cap/caso_*.png`) en 1366 y 375 px.
- Preguntas XML: `python3 .../scripts/xml_quiz.py preguntas.json out/Nombre` → `Nombre.xml` (Moodle XML) + `Nombre_vista_previa.html`. Lee el encabezado del script para el formato JSON. Debe terminar en `OK`.

## A. Actividades prácticas (2 por módulo, módulos 3, 4 y 5) — `build.py caso`, `tipo:'actividad'`
- Casos prácticos con **escenarios ramificados**: la decisión cambia lo que pasa después (al menos **2 puntos de ramificación** con caminos distintos y consecuencias visibles; un error puede llevar a una escena de "corregir el rumbo").
- El participante debe **describir, explicar y analizar**: cada actividad tiene 4–5 decisiones (`decision`, 2 pts la mejor, 1 pt una parcial, 0 la riesgosa) y 2–3 respuestas de desarrollo (`abierta`) con verbos distintos; entre las dos actividades del módulo aparecen los tres verbos.
- **Todos los caminos** hasta el final deben pasar por la misma cantidad de decisiones calificadas (para que el máximo sea comparable). 6–9 etapas por actividad, 25–35 min.
- Las dos actividades del módulo cubren lecciones distintas del módulo y situaciones distintas (no repetir el caso de la otra actividad ni el del laboratorio).
- `curso:'LEGISLACIÓN LABORAL · MÓDULO N · ACTIVIDAD PRÁCTICA k'`, `codigo:'MN_APk'`, id SCORM `LEGLAB_MN_APk`.

## B. Evaluación de cada módulo (módulos 2, 3, 4 y 5), en 2 partes
1. **Preguntas** (`preguntas.json` → XML): **10** de selección múltiple, ids `mN.p1` … `mN.p10`, **2 puntos cada una**, 4 opciones, 1 correcta, retroalimentación para **cada** opción + `fb_correcta` y `fb_incorrecta`. **Al menos 5 de caso práctico** (`tipo:'caso'`, con una situación concreta de Camila u otra persona) y el resto de concepto. Posición de la correcta variada. Distractores plausibles. Cubrir todas las lecciones del módulo. `categoria:'Legislación laboral/Módulo N/Evaluación del módulo N'`, `puntaje:2`.
2. **Laboratorio de trabajo** (`build.py caso`, `tipo:'laboratorio'`): Camila recibe un expediente realista (documentos en `expediente`: correos, contratos, planillas, registros, tablas) y debe resolver 8–10 tareas de aplicación usando **varios tipos** (`multi`, `clasificar`, `numero` si hay cálculos, `ordenar`, `decision`, y 1–2 `abierta`). 20–30 pts en total. Cada tarea da su retroalimentación; al final el motor da nota, retroalimentación global e informe. `curso:'LEGISLACIÓN LABORAL · MÓDULO N · EVALUACIÓN · LABORATORIO'`, `codigo:'MN_LAB'`, id SCORM `LEGLAB_MN_LAB`, `eyebrow:'Evaluación del módulo N · Parte 2'`.

## C. Evaluación final, en 2 partes
1. **Preguntas**: **4 por módulo, módulos 1 a 5 = 20**, ids `ef.p1` … `ef.p20` (ef.p1–p4 módulo 1, p5–p8 módulo 2, …), 2 puntos cada una, retroalimentación correcta/incorrecta y por opción, mezcla de concepto y caso (al menos 10 de caso). `categoria:'Legislación laboral/Evaluación final'`.
2. **Caso integrador** (laboratorio, `tipo:'laboratorio'`): un caso práctico único de Horizonte Servicios que obligue a aplicar lo aprendido en **todos los módulos (1 a 5)**, con ramificación en al menos 2 decisiones y tareas de aplicación de varios tipos; 12–16 etapas; competencias = una por módulo. El propio laboratorio da la retroalimentación por tarea, la nota final, la retroalimentación global y el informe descargable. `codigo:'EF_CI'`, id `LEGLAB_EF_CI`.

## Entrega de cada encargo
- Fuentes en `fuentes_evaluaciones/mN/` (o `final/`): `ap1.html`, `ap2.html`, `lab.html`, `preguntas.json`; salidas de prueba en `out/` y `cap/` (no se versionan).
- Construir los entregables finales en `entregables/modulo_N/` (o `entregables/evaluacion_final/`) con estos nombres:
  - `Actividad_practica_N_1_<Titulo_corto>` y `Actividad_practica_N_2_<Titulo_corto>` (.html + _SCORM12.zip)
  - `Evaluacion_modulo_N_parte1_preguntas.xml` + `_vista_previa.html`
  - `Evaluacion_modulo_N_parte2_laboratorio_<Titulo_corto>` (.html + _SCORM12.zip)
  - Final: `Evaluacion_final_parte1_preguntas.xml` (+ vista previa) y `Evaluacion_final_parte2_caso_integrador_<Titulo_corto>` (.html + _SCORM12.zip)
  - Borra el `.artifact.html` de `entregables/`.
- No hacer commits ni publicar nada. Al terminar, informa: lista de archivos, resumen de cada caso (ramas y decisiones), tabla de preguntas (id · tipo · tema · letra correcta), resultados de las pruebas y cualquier dato que no pudiste verificar.
