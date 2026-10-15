# Curso «Inteligencia Artificial aplicada a la Gestión de Remuneraciones»

Este repositorio produce un curso de 40 h, 4 módulos y 16 lecciones SCORM 1.2 para Moodle. Público: analistas de remuneraciones en Chile. Español neutro latinoamericano, tuteo, lenguaje neutro en género. Caso conductor: **Camila** (analista) y **Rodrigo** (jefe de Compensaciones) en **AndesCorp** (empresa ficticia). Todos los datos son ficticios.

Rama de trabajo: `ccr-82420ce4-vyunoh`. No crear pull requests salvo que la autora lo pida.

## Estado (octubre 2026)
Los cuatro módulos están terminados, con voz en las lecciones x.1 y x.3, y entregados a la autora.
- Evaluación final del curso (`src/evaluacion-curso/`): un SCORM con Parte 1 (20 preguntas M1.P1…M4.P5, en `preguntas.py`, también como banco XML) y Parte 2 (laboratorio de análisis con cuatro tareas, una por módulo, con simulador de Excel). Nota 50/50, aprobación 70 %. Al final descarga un PDF de resultados generado en el navegador (sin librerías externas). Prueba: `PDF_OUT=salida.pdf STEPS=tools/test/steps/stepsfe_opt.json node tools/test/brute_lesson.js dist/evaluacion-curso salida`.
- Inicio del curso (fuente: planilla SENCE, 60 h, 4 AE; datos en `src/curso/datos.py`): carrusel `dist/curso/Presentacion_del_curso.html` (`python3 tools/build_carousel.py src/curso/presentacion.py`), PDF `dist/curso/Guia_del_participante_IA_Remuneraciones.pdf` (`src/curso/pdf/guia-participante.html`) y evaluación diagnóstica sin nota `src/evaluacion-diagnostica/` (autoevaluación + 20 preguntas D1.1…D4.5, radar de competencias y PDF; correr `python3 src/evaluacion-diagnostica/lesson.py` antes de compilar; prueba con `STEPS=tools/test/steps/diagnostico.json` y `PDF_OUT`). Textos de Moodle para evaluaciones en `docs/moodle-instrucciones-evaluaciones.md`.
- Pendiente de decisión de la autora: agregar narración a los laboratorios (hoy sin voz).
- Casos Mindsmith creados y **sin publicar** (la autora los publica): M1 `cmv38d6dx000007nooffs3n54`, M2 `cmv38qdi3000006k1j4nd1mfc`, M3 `cmv4svhtu000006l33odfrudv`, M4 `cmv4tzacm000006pdw1ewhn55`.

## Recursos por módulo
4 lecciones (x.1 y x.3 con voz; x.2 y x.4 sin voz) · laboratorios A y B (SCORM con nota, aprobación 70 %) · evaluación final ramificada desde el Módulo 2 · cuestionario Moodle XML de 10 preguntas con feedback en cada alternativa · 2 PDF · carruseles HTML de resumen y glosario · video MP4 1080p con voz, sin música, con subtítulos `.vtt` · 1 caso Mindsmith. Detalle completo en `docs/diseno-recursos.md`; reglas de redacción y exactitud normativa en `docs/brief-produccion.md`.

## Estructura
- `src/moduloN/leccion-N-X/` · `lab-NA/` · `lab-NB/` · `evaluacion-final/`: cada carpeta tiene `lesson.py` (genera `lesson.json`), `content.html` (pantallas `<section class="slide">`) y `lesson.js` opcional con componentes propios.
- `src/moduloN/cuestionario.py`, `carruseles.py`, `video.py`, `pdf/*.html`: fuentes de XML, carruseles, video y PDF.
- `src/img/iNN_hero.jpg`, `iNN_b.jpg`: imágenes de cada lección (Canva).
- `tools/`: `engine.js` + `base.css` (motor y estilo, homologado con la lección de referencia 5.1, teal/navy), `hoja.js` (simulador de Excel en español), `build_*.py` (compiladores), `voz/` (narración), `test/` (pruebas), `entrega/pack.py` (empaquetado).
- `dist/`: todo lo compilado (se versiona). Zips SCORM en `dist/*_SCORM12.zip`; XML, PDF, HTML y video en `dist/moduloN/`.

## Comandos
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

## Voz
- Solo herramientas gratuitas y de código abierto: Chatterbox Multilingual (voz clonada desde `tools/voz/referencia_latina.wav`, acento latino neutro, versión «más viva») con control de calidad por Whisper. No usar servicios pagos (por ejemplo ElevenLabs) sin consentimiento.
- El entorno de voz no se guarda en el repositorio. En un contenedor nuevo hay que recrearlo: entorno Python en `/tmp/cbx2` (o la ruta de `CBX_PYTHON`) con `chatterbox-tts==0.1.7`, `torch==2.6.0`, `torchaudio==2.6.0` y `faster-whisper==1.2.1`.
- La caché de audio (`.cache/tts`) tampoco se versiona; los audios ya compilados están en `dist/`.
- Los avisos «REVISAR» del control de calidad suelen ser falsas alarmas por números escritos en cifras («3.3» en vez de «tres punto tres»); si la transcripción es distinta, reformular la frase y regenerar.
- Generar audio tarda alrededor de una hora por lección; correrlo en segundo plano.

## Reglas
- Nunca usar la palabra «determinístico».
- Canva: no guardar ni confirmar diseños en la cuenta de la autora; usar transacciones temporales y cancelarlas.
- Entregar por módulo y completo (zip + archivos sueltos), con LEEME que indique dónde va cada recurso en Moodle.
