# Video · Configuración de un perfil comercial en WhatsApp Business

MP4 1920×1080 · voz Ninoska (ElevenLabs) · subtítulos incrustados + `.srt` · ~5:40.

- Interfaz **recreada** de WhatsApp Business para Android (Casa Nativa, empresa ficticia), con toque destacado, acercamientos a las opciones clave y aviso en pantalla de que es una recreación. Las fotos de productos son imágenes del curso generadas con IA.
- Etiquetas: en versiones recientes se llaman «Listas» (Centro de ayuda de WhatsApp); catálogo con «País de origen» y «Añadir al catálogo». Para usar tomas de los videos oficiales del Centro de ayuda se requiere permitir `*.fbcdn.net` (y `whatsappbusiness.com`).
- Verificación de cobros (oct. 2026): la app WhatsApp Business sigue gratuita; desde el 1 de octubre de 2026 la Plataforma de WhatsApp Business (API) cobra los mensajes de servicio sobre 1.000 al mes por número (Meta for Developers, «Pricing on the WhatsApp Business Platform»). Se explica en el tramo 2.

Archivos: `locucion.json` (guion por tramo y segundos extra de acción), `audio/t01–t14.mp3`, `stage.html` (escenas), `render.js`, `img/` (productos y logo).

Regenerar: `NODE_PATH=$(npm root -g) node render.js Video3_Perfil_Comercial_WhatsApp_Business.mp4` (requiere Playwright/Chromium y ffmpeg).
