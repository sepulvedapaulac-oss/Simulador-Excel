# Producción de medios

## Narración (ElevenLabs)
- Herramienta: `creative_generate_speech`, modelo `eleven_multilingual_v2`, voz **Ninoska** `zl1Ut8dvwcVSuQSB9XkG`, `generations_count: 1`.
- Un archivo por pantalla (`p01`, `p03`… según `data-audio`), uno por escena del video (`video_1` … `video_N`) y `quiz` para la comprobación. El texto narrado debe coincidir con lo que se ve (en el video, con `lines`).
- Consultar `creative_get_flow_run_status` hasta completar; descargar y recodificar:
  `ffmpeg -y -i in.mp3 -ac 1 -b:a 64k aud/p01.mp3`
- Escribir `data-dur` con la duración real (m:ss).

## Imágenes
- Preferido: Canva (`generate-image` / búsqueda de recursos). Si la red bloquea la descarga de canva.com, usar ElevenLabs `creative_generate_image` (modelo `bytedance-seedream-5-pro`) y avisar cómo habilitar el dominio.
- Estilo: fotografía realista de oficina latinoamericana, luz natural, sin texto en la imagen. Guardar como `img/<nombre>.jpg` (≤1600 px, calidad 82) y referenciar con `{{IMG:nombre}}`.
- Nunca reutilizar una imagen de otra lección.

## Video
- Por defecto: video propio animado (escenas HTML + audio por escena) con el reproductor del motor.
- HeyGen solo si su composición está habilitada para el agente; si no, avisar y usar el video propio.
