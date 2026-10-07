# Lista de control antes de entregar

## Diseño instruccional
- [ ] Objetivo claro por pantalla; texto breve, en segunda persona, español neutro de Chile.
- [ ] Personaje recurrente y contexto de empresa coherentes en todo el curso.
- [ ] Cada caja de contenido tiene interacción; ninguna interacción se repite en la lección.
- [ ] Eyebrows describen el contenido, nunca la herramienta.
- [ ] Retroalimentación explica por qué (correcta e incorrecta) y permite reintentar.
- [ ] Comprobación: 5 preguntas, letras correctas variadas, mínimo 80%, reintento.
- [ ] Finalización solo con ≥80%; panel de ruta libre después de terminar.
- [ ] Fuentes normativas al pie; contenido verificado y vigente a la fecha.

## Medios
- [ ] Imágenes únicas (no repetidas entre lecciones), con `alt` descriptivo.
- [ ] Narración de Ninoska por pantalla + audio por escena del video; mp3 64 kbps mono.
- [ ] Video con subtítulos, capítulos y control de sonido.

## Técnica
- [ ] Sin errores JS; sin desbordes en 1366 px y 375 px (`check_layout.py`).
- [ ] Modo oscuro legible; `[hidden]{display:none!important}` presente.
- [ ] SCORM 1.2: `lesson_status` (incomplete → passed/failed o completed), `score.raw`, `suspend_data`, `lesson_location`, `session_time`; reanuda donde quedó.
- [ ] Recorrido completo probado con Playwright (aprobar, reprobar y reintentar).
- [ ] Nombres de archivo: `Leccion_X_Y_Titulo_corto` (sin tildes ni espacios).
