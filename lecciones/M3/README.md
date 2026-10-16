# Módulo 3 · Lecciones SCORM 1.2 (estructura homologada con la Lección 3.1)

Curso *Herramientas Digitales para el Crecimiento de PYMES*. Personaje recurrente: Marcela, dueña de “Casa Nativa” (decoración hecha a mano). Adaptación de los SCORM 7, 8, 9 y 10 originales.

| Lección | Paquete SCORM (`v2/dist/`) |
|---|---|
| 3.1 Hablarle a la audiencia correcta | `Leccion_3_1_Hablarle_a_la_Audiencia_Correcta_SCORM12.zip` |
| 3.2 Una marca reconocible y accesible | `Leccion_3_2_Marca_Reconocible_y_Accesible_SCORM12.zip` |
| 3.3 Invertir en publicidad sin perder el control | `Leccion_3_3_Publicidad_sin_Perder_el_Control_SCORM12.zip` |
| 3.4 Automatizar sin perder el trato humano | `Leccion_3_4_Automatizar_sin_Perder_el_Trato_Humano_SCORM12.zip` |

Usa el mismo motor del Módulo 1 (`../M1/v2/tools`). 11 pantallas por lección: inicio con caso y decisión → video (560×300, ampliable, temas clave debajo) → 5 actividades distintas → caso aplicado con 2 decisiones → comprobación (mínimo 80%) → transferencia (checklist + respuesta modelo) → finalización.

- `v2/data/L*.json`: guiones de narración y escenas del video (voz Ninoska · ElevenLabs). `sessions_L*.json` e `img_sessions.json`: sesiones de generación.
- `v2/audio/L*/`: narraciones mp3 (quiz y p10 se comparten desde `L7`). `img/`: imágenes realistas generadas con IA.
- `v2/build_all.sh`: arma las cuatro lecciones (`--preview` acepta narraciones faltantes).
- Prueba: `node ../M1/v2/tools/test_v2.js v2/dist/<lección>/index.html <carpeta-capturas>`.
- La Lección 3.4 menciona el agente de IA de WhatsApp Business (disponibilidad gradual, costo según uso, desactiva los mensajes de bienvenida y ausencia), según el Centro de ayuda de WhatsApp a octubre de 2026.
