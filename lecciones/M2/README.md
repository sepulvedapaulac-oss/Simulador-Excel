# Módulo 2 · Lecciones SCORM 1.2 (estructura homologada con la Lección 3.1)

Curso *Herramientas Digitales para el Crecimiento de PYMES*. Personaje recurrente: Marcela, dueña de “Casa Nativa” (decoración hecha a mano). Adaptación de los SCORM 4, 5 y 6 originales.

| Lección | Paquete SCORM (`v2/dist/`) |
|---|---|
| 2.1 Convierte tu presencia digital en un canal comercial | `Leccion_2_1_Presencia_Digital_Canal_Comercial_SCORM12.zip` |
| 2.2 ¿Tienda propia o marketplace? | `Leccion_2_2_Tienda_Propia_o_Marketplace_SCORM12.zip` |
| 2.3 Del pago a la entrega | `Leccion_2_3_Del_Pago_a_la_Entrega_SCORM12.zip` |

Usa el mismo motor del Módulo 1 (`../M1/v2/tools`). 11 pantallas por lección: inicio con caso y decisión → video (560×300, ampliable, temas clave debajo) → 5 actividades distintas → caso aplicado con 2 decisiones → comprobación (mínimo 80%) → transferencia (checklist + respuesta modelo) → finalización.

- `v2/data/L*.json`: guiones de narración y escenas del video (voz Ninoska · ElevenLabs). `sessions_L*.json`: sesiones de generación.
- `v2/audio/L*/`: narraciones mp3 (quiz y p10 se comparten desde `L4`). `img/`: imágenes realistas generadas con IA.
- `v2/build_all.sh`: arma las tres lecciones. Con `--preview` acepta narraciones faltantes (pantallas sin botón de audio y video con pistas silenciosas).
- Prueba: `node ../M1/v2/tools/test_v2.js v2/dist/<lección>/index.html <carpeta-capturas>`.
