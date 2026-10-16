# Del contacto al seguimiento: recorrido práctico por un CRM

Video explicativo (Módulo 4) · plataforma de demostración: HubSpot (plan gratuito) · caso: Casa Nativa.

- `Video_Recorrido_CRM.mp4` + `.srt` — video final con narración de Ninoska y subtítulos.
- `stage.html` — recreación de la interfaz de HubSpot (contactos, ficha, nota, tarea, filtros avanzados, segmentos) usada para renderizar las escenas.
- `locucion.json` — guion por escena (g01–g15); `audio/` — narraciones; `sessions.json` — sesiones de ElevenLabs.
- `render.js` — `NODE_PATH=$(npm root -g) node render.js salida.mp4 [carpeta_preview]`.

**Privacidad:** todos los contactos son ficticios (Daniela Soto, Andrés Pérez, Carla Muñoz, Fernanda Rojas, Tomás Herrera, Josefina Lagos, Matías Fuentes y Valeria Núñez). Los correos usan el dominio de ejemplo `ejemplo.cl` y los teléfonos el patrón `+56 9 0000 01xx`. No se muestran datos de clientes reales. Las pantallas de HubSpot requieren inicio de sesión, por eso la interfaz es una recreación con fines educativos (se indica en pantalla).

Duración: 6:18. Nueve escenas suman una frase breve que describe lo que se ve en pantalla (campo `q` de locucion.json = fracción del guion original; `render.js` la pasa a `R()` para sincronizar la animación).

Secuencia: información dispersa → qué es un CRM → contactos → ficha → propiedades (interés, tipo de cliente) → historial → nota → tarea (próxima acción) → filtros → segmento guardado → segmentos nuevo/recurrente/inactivo → registro y fidelización → ciclo de 5 pasos → 3 preguntas → cierre.
