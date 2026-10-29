---
name: generar-voz
description: Genera la narración de las lecciones con voz y de los videos de módulo con Chatterbox (gratuito, local) y control de calidad con Whisper.
---
# Generar la voz

1. Si no existe el entorno (`/tmp/cbx2/bin/python` o `$CBX_PYTHON`), instálalo: `bash tools/voz/setup.sh`.
2. Voz del curso: Chatterbox Multilingual, idioma `es`, referencia `tools/voz/referencia_latina.wav`, `exaggeration 0.75`, `cfg_weight 0.35` (versión «más viva»). No uses servicios pagos sin consentimiento.
3. Lanza en segundo plano y en cadena (cerca de una hora por lección): `python3 tools/build_lesson.py src/moduloN/leccion-N-1 > /tmp/buildN1.log 2>&1; …; python3 tools/build_video.py src/moduloN/video.py > /tmp/videoN.log 2>&1`. Usa un archivo con el PID para esperar, no `pgrep` sobre el mismo comando.
4. Si el proceso se interrumpe (reinicio del contenedor), vuelve a lanzarlo: la caché `.cache/tts` conserva lo ya generado.
5. Mientras corre, la carpeta `dist/` de esa lección queda vacía: no hagas commit de esos borrados; espera a que termine.
6. Revisa los avisos «REVISAR» del log: los de números en cifras son falsas alarmas; si la transcripción es otra frase, reformula el texto en `lesson.py` y vuelve a compilar (solo se regenera esa frase).
7. Prueba la lección compilada en escritorio y móvil, y haz commit de `dist/` con los audios.
