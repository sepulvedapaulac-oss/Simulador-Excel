---
name: crear-evaluacion
description: Crea la tarea con rúbrica de cada módulo (Parte 2: instrucción TXT, plantilla Word y rúbrica), las instrucciones TXT de la evaluación final (general, Parte 1 y Parte 2), la evaluación diagnóstica del curso y la evaluación de salida con comparador (SCORM sin nota, gráfico de araña de inicio y final, módulos por repasar y PDF), la evaluación final ramificada de un módulo o la evaluación final del curso (Parte 1 preguntas en Moodle XML a 2 puntos y Parte 2 caso aplicado integrador en SCORM con PDF de resultados).
---
# Crear una evaluación

## Evaluación diagnóstica (inicio) y de salida con comparador (final), sin nota
Las dos comparten el motor `tools/diagnostico.js`, que se incluye solo con `"diag": true`; las carpetas no llevan `lesson.js`. También comparten el banco de preguntas.

1. Copia `src/ejemplos/evaluacion-diagnostica` a `src/evaluacion-diagnostica/` y `src/ejemplos/evaluacion-salida` a `src/evaluacion-salida/`.
2. Escribe `src/evaluacion-diagnostica/banco.py`:
   - `CURSO`, `CURSO_ID` (único por curso: une la entrada con la salida) y `LABEL`.
   - `DIMS`: una por módulo, con `c` (M1…), `t`, orientación `ok` y `rep`, y `repaso` (lecciones y recursos que conviene repasar si queda débil al final).
   - `Q_ENTRADA`: **5 preguntas por módulo, una por cada unidad del temario** del programa (`u`), contextualizadas en el caso, con 4 alternativas y **feedback en cada una**. Miden lo que se va a enseñar, no cultura general.
   - `Q_SALIDA`: **forma paralela**, con las mismas unidades y dificultad pero preguntas distintas. La entrada muestra las respuestas en el feedback; repetirlas inflaría el avance.
   - `NIVELES`: por defecto ≥ 80 % «Dominio», ≥ 60 % «Base parcial» y el resto «Por desarrollar».
   - `banco.py` valida que haya 5 por módulo con feedback completo. El gráfico de araña necesita al menos tres módulos.
3. Los `lesson.py` solo cambian si cambia el nombre del zip. Ajusta los textos de los `content.html` si cambia la cantidad de preguntas.
4. Cómo se unen:
   - La entrada guarda su resultado en el navegador (por curso y participante) y entrega un código corto en pantalla y en el PDF.
   - La salida lo lee sola; si no lo encuentra (otro equipo o navegador), pide el código.
   - Ambas quedan «completed» en SCORM, sin nota mínima.
5. Ubicación en Moodle: la diagnóstica al inicio del curso; la de salida después del último módulo y antes de la evaluación final, para que el repaso sirva de preparación.
6. Prueba el flujo completo (entrada → salida en el mismo navegador → salida con código en un navegador limpio) en escritorio y móvil, y revisa los PDF con `pdftoppm`:
   ```bash
   node tools/test/comparador.js dist/evaluacion-diagnostica dist/evaluacion-salida salida [mobile]
   ```

## Tarea con rúbrica de cada módulo (Parte 2)
Es la evaluación del módulo que corrige el tutor (Res. Ex. SENCE N.º 2484 y N.º 2486). Si la autora eligió foro (`curso.json` → `evaluacion.parte2_modulo`), escribe la consigna del foro con la misma estructura de instrucción y una rúbrica de participación.
1. Copia `src/ejemplos/tarea/tarea.py` a `src/moduloN/tarea.py`. El aprendizaje esperado no se escribe: sale de `curso.json` → `"sence"`.
2. Completa: `TITULO`, `DURACION` (minutos), `INTRO`, `PASOS` (cada parte de la plantilla con sus minutos; el paso «Revisa y entrega» lo agrega el compilador), `HERRAMIENTAS` del módulo, `CASO` (párrafos y tablas, con el elenco y datos ficticios), `RUBRICA` (3 a 5 criterios que suman 100, cada uno con «para lograr el nivel más alto» y 4 descripciones de nivel), `PLANTILLA` (partes con tabla y fila de ejemplo resuelto, o texto con extensión) y `PAUTA` (respuestas esperadas para el tutor).
3. La tarea evidencia el verbo del AE (identificar, describir, analizar…) y el producto que declara la planilla SENCE para ese módulo. Datos legales solo verificados.
4. Compila: `python3 tools/build_tarea.py src/moduloN/tarea.py` → `dist/moduloN/tarea/` (TXT, plantilla y rúbrica). Revisa el TXT en escritorio y en 390 px y los Word convertidos a PDF.
5. En Moodle: Agregar actividad › Tarea; descripción = TXT (Código fuente); archivo adicional = plantilla Word; calificación con rúbrica o guía de evaluación con los mismos criterios; la rúbrica Word queda para el tutor.

## Instrucciones de la evaluación final (TXT)
Copia `src/ejemplos/evaluacion-final-curso/instrucciones.py` a `src/evaluacion-curso/instrucciones.py`, ajusta el caso, las tareas (una por criterio, con puntaje) y los textos de la Parte 1, y compila `python3 tools/build_moodle.py final`. La competencia, los criterios y los pesos salen de `curso.json`; nunca se escriben a mano.

## Evaluación ramificada de módulo (actividad práctica opcional)
1. Parte de `src/ejemplos/evaluacion-ramificada`. En `lesson.js` se reemplazan `COMP` (4 competencias del módulo), `ROUTE`, los `NODES` y los textos de desenlace.
2. Grafo:
   - N1 tiene tres opciones: óptima → A3, aceptable → B2, riesgosa → C2.
   - C2 y B2 llevan a B3; A3 y B3 llevan al primer nodo común.
   - Siguen 5 nodos comunes hasta FIN, para 7 u 8 decisiones por ruta.
   - Cada opción lleva `k` (opt/acc/risk), `s`, `t`, `next`, `c` (consecuencia) y `why` (criterio); además `obs` en las aceptables y `fx` en las riesgosas.
3. Valida el grafo con un script (nodos sin destino, tipos repetidos) y prueba las tres rutas (óptima 100, aceptable ~67, riesgosa 0) en escritorio y móvil.

## Evaluación final del curso (dos partes)
Parte de `src/ejemplos/evaluacion-final-curso` y cópiala a `src/evaluacion-curso/`.

**Parte 1 · Preguntas de contenido (Moodle XML).**
- `preguntas.py`: 5 preguntas por módulo, identificadas `M1.P1 … Mn.P5`, con 4 alternativas y feedback en cada una.
- Las preguntas cubren el contenido de todo el curso, contextualizadas en el caso.
- `cuestionario.py` define `POINTS = 2` (2 puntos por pregunta).
- Compila: `python3 tools/build_xml.py src/evaluacion-curso/cuestionario.py`.

**Parte 2 · Caso aplicado integrador (SCORM con nota).**
- Un caso del caso conductor que integra todo el curso, con una tarea por módulo: datos, simulador, decisiones con evidencia y propuesta con texto libre.
- La persona debe combinar lo aprendido en todos los módulos para resolverlo.
- Nota = promedio de las tareas. Al final se descarga el PDF de resultados (generador propio en `lesson.js`, sin librerías externas).
- Prueba y revisa el PDF con `pdftoppm`:
  ```bash
  PDF_OUT=salida.pdf STEPS=… node tools/test/brute_lesson.js dist/evaluacion-curso salida
  ```

**Ponderación en el curso:** por defecto actividades 40 %, Parte 1 20 % y Parte 2 40 % (ver `docs/diseno-curso.md`). El `pass` del SCORM sigue la exigencia del programa (70 % en el ejemplo).
