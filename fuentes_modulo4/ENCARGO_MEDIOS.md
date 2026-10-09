# Encargo: producir los medios reales de UNA lección del Módulo 4 (carpeta fuentes_modulo4/l4X)

Carga las herramientas con ToolSearch: "select:mcp__ElevenLabs__creative_generate_speech,mcp__ElevenLabs__creative_get_flow_run_status,mcp__ElevenLabs__creative_create_flow,mcp__Canva__generate-image,mcp__Canva__get-generate-image-job".

## A. Narración (ElevenLabs, voz Ninoska) — obligatorio
- Una generación por cada clave de `l4X/narr.json` (17 claves) que NO exista ya como `l4X/aud/<clave>.mp3`.
- Primero `creative_create_flow` (nombre "Lección 4.X narración") y usa ese flow_id en todas las llamadas.
- `creative_generate_speech` con: prompt = texto EXACTO de narr.json, model_id "eleven_multilingual_v2", voice_id "zl1Ut8dvwcVSuQSB9XkG", generations_count 1. Puedes lanzar varias en paralelo (en un mismo mensaje).
- GASTA CRÉDITOS: nunca repitas una llamada de generación para reintentar. Si una falla, anótala y repórtala; no la regeneres.
- Consulta `creative_get_flow_run_status` (flow_id + session_ids, puedes pasar hasta 20 session_ids) hasta all_completed. Toma el `content_url` de cada generación y descárgalo con curl, luego:
  `ffmpeg -y -loglevel error -i _tmp.mp3 -ac 1 -b:a 64k l4X/aud/<clave>.mp3` (borra el temporal). Usa un mapeo clave→session_id que tú anotes al lanzar.
- Verifica que existan los 17 mp3 y que cada duración (ffprobe) sea razonable (palabras/2.2 a palabras/3.2 segundos).
- Ejecuta: `python3 /home/user/Simulador-Excel/.claude/skills/leccion-interactiva-scorm/scripts/fixdur.py /home/user/Simulador-Excel/fuentes_modulo4/l4X` (actualiza data-dur en src.html).
- Si src.html tiene un rótulo con la duración total del video (p. ej. "1 min 15 s"), actualízalo con la suma real de video_1..video_7.

## B. Imágenes (Canva) — SOLO si tu encargo lo indica
- Para cada clave de `l4X/imgs.json`: `mcp__Canva__generate-image` con prompt = texto del json y aspectRatio según lo que diga el prompt (3:2 → LANDSCAPE_3_2, 16:9 → LANDSCAPE_16_9). Una sola llamada por imagen (gasta créditos).
- Consulta `mcp__Canva__get-generate-image-job` hasta SUCCESS; anota el media id (empieza con "M").
- Mira la miniatura: si la imagen tiene texto legible grosero, personas deformes o no corresponde, repórtalo (no regeneres sin motivo grave; máximo 1 regeneración por imagen).
- Escribe `l4X/media_ids.json` = {"i4X_nombre": "MAxxxx", ...}. NO intentes descargar ni exportar las imágenes (eso lo hace la sesión principal).
- Si la lección tiene hotspots sobre una imagen, describe en tu reporte dónde quedaron realmente los elementos en la miniatura (en % aproximado) para ajustar los puntos después.

## No hagas
- No modifiques el contenido pedagógico ni narr.json. No construyas el SCORM final. No hagas commits.

## Reporte final (breve)
claves generadas y duración de cada una, total de video, fallos, media ids (si aplica) y observaciones de las imágenes.
