# Plantilla de cursos SCORM para Moodle

Este repositorio es la base para producir cursos e-learning: programa y storyboard en Word, planilla de codificación SENCE, lecciones interactivas SCORM 1.2, laboratorios con simulador, evaluación diagnóstica y evaluaciones, cuestionarios Moodle XML, PDF, carruseles, videos con voz y casos Mindsmith. La autora crea cada curso nuevo con «Use this template» en GitHub y abre una sesión de Claude sobre ese repositorio.

Las habilidades, el estándar y el motor sirven para **todos los cursos** que se creen con esta plantilla, de cualquier tema. Los ejemplos (curso de remuneraciones, programa y diagnóstico HACCP) son solo referencias de formato y nivel: su contenido nunca se copia a otro curso.

## Antes de cualquier trabajo
1. Lee `docs/estandar-cursos.md` (estándar obligatorio) y `docs/componentes.md` (motor y componentes).
2. Curso nuevo: cuando la autora dice «vamos a hacer el curso» y sube el archivo del programa, **ese archivo es el programa**. Usa **crear-programa** para crear el storyboard desde él y pregunta si las evaluaciones Parte 2 de los módulos serán **tareas o foros** (preferencia: tareas). Con la aprobación de la autora: planilla SENCE (**codificador-cursos-sence**), configuración (**crear-curso**) y recién entonces los recursos, empezando por la bienvenida (**crear-bienvenida**). No produzcas recursos antes de la aprobación.
3. Curso ya armado: usa **actualizar-curso** para llevarlo al estándar vigente (lee `docs/pendientes-estandar.md` si existe).
4. Si `curso.json` todavía dice «Nombre del curso», el curso no está configurado.
5. La competencia, los aprendizajes esperados, los criterios y las horas viven solo en `curso.json` → `"sence"` (copiados de la planilla SENCE). Cada vez que cambia la planilla se actualiza ahí y se regeneran todos los recursos que los muestran (estándar §10).
6. El programa aprobado y `docs/diseno-curso.md` mandan sobre los valores por defecto del estándar.

## Habilidades del proyecto (`.claude/skills/`)
- **crear-programa**: programa del curso (de qué se trata, público, temario con horas, recursos por módulo, elenco, evaluación y aprobación) y storyboard, en Word.
- **codificador-cursos-sence**: planilla de codificación SENCE (Res. Ex. 1560, Bloom, checklist anti-rechazo) desde el programa aprobado.
- **crear-curso**: con el programa aprobado, completa `curso.json` (incluidos `sence`, `colores` y `marca`) y `docs/diseno-curso.md`, y crea la estructura de carpetas.
- **crear-bienvenida**: presentación del curso (HTML), guía del participante (PDF) e instrucciones de bienvenida (TXT para Moodle), con los colores del curso.
- **actualizar-curso**: lleva un curso ya armado al estándar vigente (bienvenida, Parte 2 como tareas, instrucciones de la evaluación final, fuente única SENCE).
- **crear-leccion**: produce una lección SCORM con el flujo estándar.
- **crear-laboratorio**: laboratorio con simulador (Excel u otro), primero como HTML para revisión.
- **crear-evaluacion**: tarea con rúbrica de cada módulo (Parte 2: instrucción TXT, plantilla Word y rúbrica), instrucciones TXT de la evaluación final, evaluación diagnóstica y de salida con comparador (gráfico de araña de inicio y final, PDF), evaluación ramificada de módulo y evaluación final del curso (Parte 1 XML, Parte 2 caso aplicado SCORM).
- **recursos-modulo**: cuestionario XML, carruseles, PDF, video del módulo, imágenes de Canva y caso Mindsmith.
- **generar-voz**: entorno Chatterbox, narración y control de calidad.
- **entregar-modulo**: pruebas, empaquetado y entrega a la autora.
- **remotion-\***: skills oficiales de Remotion (copiadas de `remotion-dev/skills`, v4.0.539) para crear, editar y renderizar videos con Remotion. Punto de entrada: **remotion-best-practices**. Para actualizarlas: `npx skills add remotion-dev/skills`.

## Estructura
- `curso.json`: nombre del curso, organismo capacitador, plataforma, ponderación, datos por módulo (títulos, ID de Mindsmith), `sence` (competencia, AE, criterios y horas: fuente única), `colores` y `marca`. Los compiladores lo leen.
- `docs/programa/`: programa, storyboard y planilla SENCE del curso (Markdown → Word con `tools/build_doc.py`); plantillas en `docs/plantillas/`.
- `src/evaluacion-diagnostica/` (con `banco.py`), `src/evaluacion-salida/`; `src/moduloN/leccion-N-X/`, `lab-NA/`, `lab-NB/`, `evaluacion-final/`; `src/evaluacion-curso/` (Parte 1 `cuestionario.py` + Parte 2 SCORM); `src/bienvenida/` (`presentacion.py`, `bienvenida.py`); `src/moduloN/tarea.py` (Parte 2); `src/evaluacion-curso/instrucciones.py`; `src/moduloN/cuestionario.py`, `carruseles.py`, `video.py`, `pdf/*.html`; `src/img/iNN_hero.jpg`, `iNN_b.jpg`.
- `src/ejemplos/`: patrones de referencia probados (lección con y sin voz, matriz para clasificar, diagrama con stepper, laboratorios, evaluación diagnóstica, evaluaciones, programa HACCP). Se copian y adaptan; no se entregan.
- `tools/`: motor (`engine.js`, `base.css`, `hoja.js`), compiladores `build_*.py` (incluye `build_doc.py` para Word), `voz/`, `test/`, `entrega/pack.py`.
- `dist/`: compilados (se versionan). `entregas/`: paquetes para la autora (no se versionan).

## Comandos
```bash
python3 tools/build_doc.py docs/programa/programa.md docs/programa/storyboard.md   # programa y storyboard en Word
python3 tools/build_lesson.py src/<ruta> --voice none     # vista previa sin audio
python3 tools/build_lesson.py src/<ruta>                  # con voz (requiere bash tools/voz/setup.sh)
python3 tools/build_xml.py src/moduloN/cuestionario.py
python3 tools/build_tarea.py src/moduloN/tarea.py         # Parte 2: instrucción TXT, plantilla Word y rúbrica
python3 tools/build_presentacion.py src/bienvenida/presentacion.py   # presentación HTML y guía PDF
python3 tools/build_moodle.py bienvenida|final|todo      # textos TXT para Moodle
python3 tools/build_carousel.py src/moduloN/carruseles.py
python3 tools/build_pdf.py src/moduloN/pdf/<archivo>.html
python3 tools/build_video.py src/moduloN/video.py
node tools/test/run_lesson.js dist/<ruta> salida [mobile]
STEPS=pasos.json node tools/test/brute_lesson.js dist/<ruta> salida [mobile]
node tools/test/comparador.js dist/evaluacion-diagnostica dist/evaluacion-salida salida [mobile]
python3 tools/entrega/pack.py N            # también: bienvenida, diagnostico, curso, programa
```
Requisitos del contenedor: Python 3 con python-docx (Word), Node con Playwright y Chromium (para pruebas, PDF y video), ffmpeg (video), pypdf y pdftoppm (revisión de PDF); LibreOffice (`soffice`) opcional para revisar los Word como PDF.

## Reglas que no se negocian
- Probar en escritorio y móvil (390×844) antes de cada commit: sin errores de JavaScript ni desborde horizontal.
- Feedback en todas las alternativas de toda pregunta. Lenguaje neutro en género. Datos siempre ficticios.
- La respuesta correcta no puede estar siempre en la misma letra: el motor desordena las alternativas de lecciones, laboratorios y evaluaciones, y al redactar se reparte la correcta entre A, B, C y D, sin que sea siempre la más larga.
- Storytelling con elenco diverso: el protagonismo rota entre personas de distintos géneros y edades; no siempre una mujer ni siempre la misma persona.
- Nunca usar la palabra «determinístico».
- Voz solo con herramientas gratuitas y de código abierto (Chatterbox + Whisper). Nada pagado sin consentimiento.
- Canva: no guardar ni confirmar diseños en la cuenta de la autora; transacciones temporales que se cancelan.
- Casos Mindsmith sin publicar: los publica la autora.
- Las lecciones SCORM no muestran la competencia, los aprendizajes esperados ni los criterios de evaluación.
- Cada módulo tiene su evaluación Parte 2 como tarea con rúbrica (o foro) corregida por el tutor (Res. Ex. SENCE N.º 2484 y N.º 2486).
- Cada recurso usa los colores de su curso (`curso.json` → `colores`); los textos para Moodle van en TXT con estilos en línea.
- Entregar por módulo, completo (zip + archivos sueltos) y con LEEME.
- Commit y push en la rama de trabajo; pull requests solo si la autora los pide.

## Notas propias de este curso (instrucciones anteriores, se mantienen)

Este repositorio es el curso «Inteligencia Artificial aplicada a la Gestión de Remuneraciones», del que nació la plantilla. Lo que sigue son sus instrucciones previas; el estándar de arriba manda cuando se contradicen.

## Curso «Inteligencia Artificial aplicada a la Gestión de Remuneraciones»

Este repositorio produce un curso de 40 h, 4 módulos y 16 lecciones SCORM 1.2 para Moodle. Público: analistas de remuneraciones en Chile. Español neutro latinoamericano, tuteo, lenguaje neutro en género. Caso conductor: **Camila** (analista) y **Rodrigo** (jefe de Compensaciones) en **AndesCorp** (empresa ficticia). Todos los datos son ficticios.

Rama de trabajo: `ccr-82420ce4-vyunoh`. No crear pull requests salvo que la autora lo pida.

### Estado (octubre 2026)
Los cuatro módulos están terminados, con voz en las lecciones x.1 y x.3, y entregados a la autora.
- Evaluación final del curso (`src/evaluacion-curso/`): un SCORM con Parte 1 (20 preguntas M1.P1…M4.P5, en `preguntas.py`, también como banco XML) y Parte 2 (laboratorio de análisis con cuatro tareas, una por módulo, con simulador de Excel). Nota 50/50, aprobación 70 %. Al final descarga un PDF de resultados generado en el navegador (sin librerías externas). Prueba: `PDF_OUT=salida.pdf STEPS=tools/test/steps/stepsfe_opt.json node tools/test/brute_lesson.js dist/evaluacion-curso salida`.
- Inicio del curso (fuente: planilla SENCE, 60 h, 4 AE; datos en `src/curso/datos.py`): carrusel `dist/curso/Presentacion_del_curso.html` (`python3 tools/build_carousel.py src/curso/presentacion.py`), PDF `dist/curso/Guia_del_participante_IA_Remuneraciones.pdf` (`src/curso/pdf/guia-participante.html`) y evaluación diagnóstica sin nota `src/evaluacion-diagnostica/` (autoevaluación + 20 preguntas D1.1…D4.5, radar de competencias y PDF; correr `python3 src/evaluacion-diagnostica/lesson.py` antes de compilar; prueba con `STEPS=tools/test/steps/diagnostico.json` y `PDF_OUT`). Textos de Moodle para evaluaciones en `docs/moodle-instrucciones-evaluaciones.md` (secuencia: 4 cuestionarios de módulo → Parte 1 XML → Parte 2 SCORM).
- Evaluación final · Parte 2 sola (`src/evaluacion-curso-parte2/`, zip `Evaluacion_final_Parte2_caso_practico`): su `lesson.py` copia `lesson.js` y `content.html` de `src/evaluacion-curso` (bandera `soloP2`, sin la pantalla de la Parte 1). Si se edita la evaluación final, correr `python3 src/evaluacion-curso-parte2/lesson.py` y recompilar ambas.
- Ponderación vigente (decidida por la autora): laboratorios 10 % · evaluaciones de módulo 20 % (M1 cuestionario; M2–M4 cuestionario + ramificada, 2,5 % c/u) · evaluación final 70 % (Parte 1 35 %, Parte 2 35 %). Se debe aprobar cada evaluación de módulo y ambas partes de la final. Fuente única en `src/curso/datos.py` (`PONDERACION`, `APROBACION`) y `docs/diseno-recursos.md` §7.
- Pendiente de decisión de la autora: agregar narración a los laboratorios (hoy sin voz).
- Casos Mindsmith creados y **sin publicar** (la autora los publica): M1 `cmv38d6dx000007nooffs3n54`, M2 `cmv38qdi3000006k1j4nd1mfc`, M3 `cmv4svhtu000006l33odfrudv`, M4 `cmv4tzacm000006pdw1ewhn55`.

### Recursos por módulo
4 lecciones (x.1 y x.3 con voz; x.2 y x.4 sin voz) · laboratorios A y B (SCORM con nota, aprobación 70 %) · evaluación final ramificada desde el Módulo 2 · cuestionario Moodle XML de 10 preguntas con feedback en cada alternativa · 2 PDF · carruseles HTML de resumen y glosario · video MP4 1080p con voz, sin música, con subtítulos `.vtt` · 1 caso Mindsmith. Detalle completo en `docs/diseno-recursos.md`; reglas de redacción y exactitud normativa en `docs/brief-produccion.md`.

### Estructura
- `src/moduloN/leccion-N-X/` · `lab-NA/` · `lab-NB/` · `evaluacion-final/`: cada carpeta tiene `lesson.py` (genera `lesson.json`), `content.html` (pantallas `<section class="slide">`) y `lesson.js` opcional con componentes propios.
- `src/moduloN/cuestionario.py`, `carruseles.py`, `video.py`, `pdf/*.html`: fuentes de XML, carruseles, video y PDF.
- `src/img/iNN_hero.jpg`, `iNN_b.jpg`: imágenes de cada lección (Canva).
- `tools/`: `engine.js` + `base.css` (motor y estilo, homologado con la lección de referencia 5.1, teal/navy), `hoja.js` (simulador de Excel en español), `build_*.py` (compiladores), `voz/` (narración), `test/` (pruebas), `entrega/pack.py` (empaquetado).
- `dist/`: todo lo compilado (se versiona). Zips SCORM en `dist/*_SCORM12.zip`; XML, PDF, HTML y video en `dist/moduloN/`.

### Comandos
```bash
python3 tools/build_lesson.py src/moduloN/<carpeta> --voice none   # vista previa sin audio
python3 tools/build_lesson.py src/moduloN/<carpeta>                # con voz (Chatterbox)
python3 tools/build_xml.py src/moduloN/cuestionario.py
python3 tools/build_carousel.py src/moduloN/carruseles.py
python3 tools/build_pdf.py src/moduloN/pdf/<archivo>.html
python3 tools/build_video.py src/moduloN/video.py
node tools/test/run_lesson.js dist/moduloN/<carpeta> salida [mobile]      # lecciones con componentes del motor
STEPS=tools/test/steps/<archivo>.json node tools/test/brute_lesson.js dist/moduloN/<carpeta> salida [mobile]   # componentes propios, labs y evaluaciones
python3 tools/entrega/pack.py N     # carpeta + zip de entrega del módulo N en entregas/ (no versionado)
```
Antes de commit: probar en escritorio y móvil (390×844), sin errores de JavaScript ni desborde horizontal.

### Voz
- Solo herramientas gratuitas y de código abierto: Chatterbox Multilingual (voz clonada desde `tools/voz/referencia_latina.wav`, acento latino neutro, versión «más viva») con control de calidad por Whisper. No usar servicios pagos (por ejemplo ElevenLabs) sin consentimiento.
- El entorno de voz no se guarda en el repositorio. En un contenedor nuevo hay que recrearlo: entorno Python en `/tmp/cbx2` (o la ruta de `CBX_PYTHON`) con `chatterbox-tts==0.1.7`, `torch==2.6.0`, `torchaudio==2.6.0` y `faster-whisper==1.2.1`.
- La caché de audio (`.cache/tts`) tampoco se versiona; los audios ya compilados están en `dist/`.
- Los avisos «REVISAR» del control de calidad suelen ser falsas alarmas por números escritos en cifras («3.3» en vez de «tres punto tres»); si la transcripción es distinta, reformular la frase y regenerar.
- Generar audio tarda alrededor de una hora por lección; correrlo en segundo plano.

### Reglas
- Nunca usar la palabra «determinístico».
- Canva: no guardar ni confirmar diseños en la cuenta de la autora; usar transacciones temporales y cancelarlas.
- Entregar por módulo y completo (zip + archivos sueltos), con LEEME que indique dónde va cada recurso en Moodle.
