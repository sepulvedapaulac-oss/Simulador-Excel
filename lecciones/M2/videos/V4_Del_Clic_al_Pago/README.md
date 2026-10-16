# Video 4 · Del clic al pago: cómo funciona una compra digital

MP4 1920×1080 · voz Ninoska (ElevenLabs) · subtítulos incrustados + `.srt` · ~4:45.

Caso Casa Nativa (empresa ficticia): lámpara decorativa de ratán $39.990 + despacho $3.990 = $43.980 → pago con tarjeta → pago aprobado → pedido #CN-1045 → en preparación.

- Recreación **neutra** de tienda en línea, pasarela de pago y panel de pedidos (no corresponde a ninguna plataforma específica), con cursor destacado y aviso en pantalla.
- 13 tramos de locución tal como el guion (`locucion.json`); pausa de 1,1 s entre escenas, sin silencios largos.
- Imágenes: lámpara generada con IA (`img/p_lampara.jpg`), fotos del curso (`m4_cliente`, `m6_preparacion`) y logo de Casa Nativa.

Regenerar: `NODE_PATH=$(npm root -g) node render.js Video4_Del_Clic_al_Pago.mp4` (requiere Playwright/Chromium y ffmpeg).
