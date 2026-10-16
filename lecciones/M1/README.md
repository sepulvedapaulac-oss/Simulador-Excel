# Módulo 1 · Lecciones SCORM 1.2 (estructura homologada con la Lección 3.1)

Curso *Herramientas Digitales para el Crecimiento de PYMES*. Personaje recurrente: María, dueña de “Empanadas Doña María”.

| Lección | Paquete SCORM (`v2/dist/`) |
|---|---|
| 1.1 ¿Qué tan digital es tu PYME? | `Leccion_1_1_Madurez_Digital_SCORM12.zip` |
| 1.2 Tu ecosistema de trabajo digital | `Leccion_1_2_Ecosistema_Productividad_SCORM12.zip` |
| 1.3 Organiza y protege tus archivos en la nube | `Leccion_1_3_Archivos_Nube_Seguridad_SCORM12.zip` |

Cada lección tiene 11 pantallas: inicio con caso y decisión → explicación en video (560×300, ampliable, temas clave debajo) → 5 actividades distintas → caso aplicado con 2 decisiones → comprobación de 5 preguntas (mínimo 80%) → transferencia (checklist + respuesta modelo) → finalización. Ruta lateral con bloqueo, narración automática y SCORM 1.2 (nota, estado *passed*, reanudación).

- `v2/data/L*.json`: guiones de narración y escenas del video (voz Ninoska · ElevenLabs).
- `v2/audio/L*/`: narraciones mp3. `img/`: imágenes realistas generadas con IA.
- `v2/src/L*.html` y `L*.config.js`: pantallas, preguntas y checklist de cada lección.
- `v2/tools/build_all.sh`: arma las tres lecciones; `v2/tools/test_v2.js`: recorrido automático en escritorio y celular.
