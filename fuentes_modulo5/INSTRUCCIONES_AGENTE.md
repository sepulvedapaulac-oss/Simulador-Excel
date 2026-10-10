# Encargo: reconstruir una lección del Módulo 5 (Legislación Laboral) con el estándar de la habilidad

Habilidad (LÉELA COMPLETA primero): /home/user/Simulador-Excel/.claude/skills/leccion-interactiva-scorm/
 - SKILL.md, references/interacciones.md, references/estandares.md
 - Ejemplos completos y funcionando: templates/ejemplos/leccion_2_6.html … leccion_2_9.html (copia la estructura: topbar, botón y panel de ruta, secciones .slide con data-title/data-audio/data-dur/data-gate/data-gate-msg, nav inferior, script con AUD, LESSON_ID, FIRST_KEYS, VIDEO, Q, /*{{ENGINE}}*/, JS de cada componente y /*{{TAIL}}*/ al final).
 - CSS disponible: assets/base.css, comp.css, comp2.css (no los modifiques; si necesitas estilos nuevos agrégalos en un <style> adicional DENTRO del mismo <style> de la fuente, después de /*{{COMPCSS}}*/, con tokens var(--...) para que funcione en modo oscuro y celular).
 - Constructor: scripts/build.py ; revisión: scripts/check_layout.py
Hechos legales: ../HECHOS_LEGALES.md (usa solo esos datos; puedes redactar, pero no inventar cifras, plazos ni artículos).
Ejemplo de test de recorrido con Playwright: /home/user/Simulador-Excel/fuentes_modulo3/l38/test.py (y fuentes completas de referencia en fuentes_modulo3/l3*/) (ejecutable de Chromium: glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')).

## Lo que debes entregar en tu carpeta de trabajo
1. `src.html` — fuente de la lección con marcadores (/*{{BASECSS}}*/, /*{{COMPCSS}}*/, /*{{ENGINE}}*/, {{AUDIO_JSON}}, {{VDURS}}, {{IMG:nombre}}, /*{{TAIL}}*/). Encabezado del curso: "LEGISLACIÓN LABORAL · MÓDULO 5 · LECCIÓN 5.X". LESSON_ID='l5X'.
2. `narr.json` — {"p01": "texto narrado…", "p03": "…", …, "video_1": "…", …, "video_7": "…", "quiz": "…"}. Una clave por cada data-audio usado y una por escena de video (video_N = las `lines` de esa escena unidas, idéntico texto). Narración en segunda persona, cálida y clara, 20–45 s por pantalla (≈ 50–110 palabras), español de Chile neutro. La narración orienta: qué ves, qué debes hacer y por qué importa (no lee todo el texto).
3. `imgs.json` — {"i5X_nombre": "prompt detallado en español para una fotografía realista…", …}: 4 imágenes ÚNICAS por lección (portada + 3 de contenido, p. ej. para hotspot, pestañas, caso). Personas latinoamericanas en oficinas/empresas chilenas, luz natural, sin texto legible en la imagen. Camila (Equipo de Personas de Horizonte Servicios): mujer de 30 años, cabello oscuro recogido, blusa azul. Indica relación de aspecto deseada en el prompt (3:2 horizontal salvo que el componente pida otra).
4. `test.py` — recorrido Playwright completo sobre `out/Leccion.html`: resuelve cada actividad (incluida al menos una respuesta incorrecta con reintento), pasa el video recorriendo capítulos, hace la comprobación una vez reprobando (<80%) y luego aprobando, llega a Finalización, verifica que la navegación queda libre, sin errores JS (page.on('pageerror')). Imprime "RECORRIDO OK" al final.
5. Construye con medios de relleno para probar: crea `ph/img/<nombre>.jpg` (placeholder con PIL, 1500x1000, color sólido) y `ph/aud/<clave>.mp3` (silencio con ffmpeg: `ffmpeg -y -f lavfi -i anullsrc=r=22050:cl=mono -t <segundos estimados=palabras/2.6> -b:a 32k ph/aud/<clave>.mp3`), luego:
   `python3 /home/user/Simulador-Excel/.claude/skills/leccion-interactiva-scorm/scripts/build.py leccion src.html --title "Lección 5.X — Título" --id LEGLAB_M5_L5X --name Leccion --img ph/img --aud ph/aud --out out`
   `python3 …/scripts/check_layout.py out/Leccion.html cap` → sin errores ni desbordes; mira las capturas (Read sobre las png) y corrige lo que se vea mal.
   `python3 test.py` → RECORRIDO OK.
   Itera hasta que todo pase. NO generes audio ni imágenes reales, NO uses herramientas de ElevenLabs/Canva, NO hagas commits ni publiques nada.

## Reglas de contenido (obligatorias)
- 11 pantallas: Inicio (caso + decisión con consecuencias, data-choice con template por opción y botón reintentar) · Explicación (video de 7 escenas, cada escena con `lines` y `html` animado con data-at) · 4 o 5 pantallas de contenido · Caso aplicado · Comprobación (5 preguntas; índices correctos variados, p. ej. 1,2,0,3,1 — nunca todas iguales; 3–4 opciones) · Transferencia (exige además "pass") · Finalización (data-report, #fPct, #fEsc, botones data-goto para repasar).
- CADA caja de contenido es interactiva; no repitas un tipo de interacción dentro de la lección; usa exactamente el plan de interacciones que se te asigna (puedes ajustar detalles).
- Los eyebrow describen el contenido (p. ej. "Lección 5.2 · Formas de término"), NUNCA el nombre de la herramienta (prohibido: "Acordeón", "Flashcards", "Paso", "Proceso", "Hotspot", "Pestañas", "Línea de tiempo", "Actividad", "Interacción").
- Curso asincrónico: cada pantalla debe explicarse sola: instrucción clara de qué hacer ("Haz clic en…"), retroalimentación que explica el porqué, data-gate-msg útil.
- Fuente normativa al pie de las pantallas con contenido legal (`<p class="sources">`).
- Conserva el sentido y la meta de aprendizaje de la lección original (te la doy abajo) pero enriquécela con los hechos legales.
- Funciona en celular (375 px) sin textos fuera de sus cajas.
Al terminar, responde con: lista de pantallas (título · interacción · clave), claves de audio, nombres de imágenes, y resultado de las pruebas.

## AHORRO DE CRÉDITOS DE VOZ (obligatorio en esta tanda)
- Narraciones de pantalla: 35–55 palabras (≈ 15–22 s). Solo orientan qué hacer y por qué importa.
- Escenas de video: 20–35 palabras por escena (`lines` breves). 7 escenas.
- Escribe los números en la narración de forma que se lean bien (p. ej. "Ley veintiún mil quince" en narr.json aunque en pantalla diga "Ley 21.015"); en video_N las `lines` en pantalla pueden tener cifras, pero narr.json debe tener el texto que se pronunciará (la equivalencia de contenido debe ser exacta).
- No uses "Bienvenida/Bienvenido": usa "Te damos la bienvenida".

## Módulo 5 — Ley Karin (agregado)
- Contenido original de cada lección: `fuentes_modulo5/l5X/original.txt` (meta de aprendizaje, caso, conceptos, decisión). Conserva su meta y su caso, corrige y enriquece con `fuentes_modulo5/HECHOS_LEGALES.md`. El original tenía 8 pantallas pobres (acordeón genérico repetido); NO copies ese acordeón genérico ni el cierre repetido.
- Inicio (hook) en una de las variantes de los ejemplos: chat en celular (leccion_2_6), dos versiones (leccion_2_7), etiqueta despegable (leccion_2_8) o formulario por revisar (leccion_2_9) — usa la asignada.
- Variedad pedida por la clienta: cada lección usa herramientas distintas (hotspot, acordeón, tarjetas que se voltean, pestañas, línea de tiempo, cuadros de texto, imagen realista…), y no debe parecerse a las demás lecciones del módulo. Usa EXACTAMENTE el plan asignado.
- Temas sensibles (acoso, violencia): lenguaje respetuoso, sin detalles gráficos; ejemplos concretos pero sobrios. Personas: "persona denunciante", "persona denunciada".
- Pie de fuente: usa el de HECHOS_LEGALES.md (ajústalo a los artículos pertinentes).
- Las imágenes (imgs.json) deben ser distintas a las de las otras lecciones del módulo: varía escenarios (mesón de atención a clientes, sala de reuniones, oficina abierta, terreno, sala de entrevistas privada, call center, pasillo, comedor), personajes secundarios y encuadre. Nada de escenas violentas explícitas.
## Módulo 5 — Término de la relación laboral (agregado)
- Contenido original de cada lección: `fuentes_modulo5/l5X/original.txt`. Conserva su meta y su caso; corrige y enriquece con `fuentes_modulo5/HECHOS_LEGALES.md`. El original tenía 8 pantallas pobres con un acordeón genérico repetido: NO lo copies.
- Ejemplo completo y funcionando de una lección del módulo anterior: `fuentes_modulo4/l4*/src.html` y `test.py` (mismo motor). Imágenes de prueba: crea placeholders como allí.
- Inicio (hook) en la variante asignada: chat en celular (leccion_2_6), dos versiones (leccion_2_7), etiqueta despegable (leccion_2_8) o formulario por revisar (leccion_2_9).
- Variedad pedida por la clienta: cada lección usa herramientas distintas (hotspot, acordeón, tarjetas que se voltean, pestañas, línea de tiempo, imagen realista…) y no debe parecerse a las demás. Usa EXACTAMENTE el plan asignado. Incluye al menos una imagen realista grande en alguna pantalla de contenido además de la portada.
- Lenguaje respetuoso: un término de contrato afecta a personas; evita tono frío. "Persona trabajadora".
- Montos: usa remuneraciones de ejemplo redondas y por debajo del tope (p. ej. $900.000) para no depender del valor de la UF; nunca escribas el valor en pesos de la UF.
- Imágenes (imgs.json) distintas entre lecciones y respecto del módulo 4: varía escenarios (notaría, oficina de RR.HH., bodega, obra de construcción, sala de reuniones, escritorio con documentos, oficina de correos, pasillo), personajes secundarios y encuadre. Si hay hotspots, describe la composición con posiciones en %.
