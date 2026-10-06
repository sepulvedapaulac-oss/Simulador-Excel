# Módulo 1 · Lecciones estandarizadas (SCORM 1.2)

Curso *Herramientas Digitales para el Crecimiento de PYMES*. Personaje recurrente: María, dueña de “Empanadas Doña María”.

| Lección | Fuente | Entregables (`dist/`) |
|---|---|---|
| 1.1 ¿Qué tan digital es tu PYME? | `src/L1_Madurez_Digital.html` | `Leccion_1_1_Madurez_Digital.html` + `_SCORM12.zip` |
| 1.2 Tu ecosistema de trabajo digital | `src/L2_Ecosistema_Productividad.html` | `Leccion_1_2_Ecosistema_Productividad.html` + `_SCORM12.zip` |
| 1.3 Organiza y protege tus archivos en la nube | `src/L3_Archivos_Nube_Seguridad.html` | `Leccion_1_3_Archivos_Nube_Seguridad.html` + `_SCORM12.zip` |

Estructura común (11 pantallas): caso con decisión → video narrado por capítulos → 5 interacciones distintas → caso ramificado → comprobación de 5 preguntas (mínimo 80%) → transferencia → finalización.

- `tools/build_all.sh` reconstruye todo; `tools/build.py` arma HTML autocontenido, ZIP SCORM 1.2 y vista previa.
- `tools/test_lesson.js` recorre la lección en escritorio y celular (bloqueos, falla y reintento, SCORM, reanudación, desbordes).
- `img/` imágenes realistas generadas con IA (ElevenLabs · Seedream 5 Pro), únicas por lección.
- Narración: voz del navegador (es) mientras no existan los audios de Ninoska; para usarlos, definir `window.LESSON_AUDIO = {"texto narrado": "archivo.mp3"}`.
