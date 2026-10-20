# Catálogo de interacciones

Cada interacción ya tiene estilos en `assets/comp.css` / `assets/comp2.css` (busca el comentario indicado) y un ejemplo funcionando en `templates/ejemplos/`. Para reutilizarla: copia el HTML de la `<section>` y el bloque JS con el mismo comentario del ejemplo, cambia el contenido y la clave de bloqueo (`data-gate`). Al completarse, el JS llama a `done('clave')`.

| Interacción | Uso didáctico | Estilo (comentario CSS) | Ejemplo · clave |
|---|---|---|---|
| Chat de inicio + decisión | Abrir con un caso conversado | Chat de inicio | leccion_2_6 · `hook` |
| Formulario por revisar | Detectar errores en un documento | Formulario de solicitud | leccion_2_9 · `hook` |
| Etiqueta despegable | Revelar el caso con un gesto | Etiqueta despegable | leccion_2_8 · `hook` |
| Video narrado con capítulos | Explicación central | Escenas de video | todas · `video` |
| Línea del día / línea de tiempo | Secuencias horarias o cronológicas | Línea del día | leccion_2_6 · `day` |
| Simulador con controles | Explorar límites moviendo valores | Simulador | leccion_2_6 · `sim` |
| Tarjetas que se voltean | Concepto ↔ explicación | Tarjetas que se voltean | leccion_2_6 · `cards` |
| Calculadora guiada | Practicar una fórmula | Calculadora | leccion_2_6 · `calc` |
| Hotspots en imagen | Explorar partes de una escena | Hotspots en imagen | leccion_2_6 · `hs` |
| Decisión ramificada | Caso aplicado con consecuencias | (branch en base) | leccion_2_6 · `caso` |
| Ordenar pasos | Procedimientos | Ordenar pasos | leccion_2_6 · `order` |
| Acordeón | Propósitos o categorías | Acordeón | leccion_2_7 · `acc` |
| Pestañas con imagen | Comparar sistemas u opciones | Pestañas con imagen | leccion_2_7 · `tabs` |
| Verdadero o falso | Mitos y errores comunes | Verdadero o falso | leccion_2_7 · `tf` |
| Simulador de celular | Procesos digitales | Simulador de celular | leccion_2_7 · `phone` |
| Línea de evidencias / auditoría | Revisar registros | Línea de evidencias | leccion_2_7 · `ev aud` |
| Clasificar en columnas | Categorizar casos | Clasificar en columnas | leccion_2_7 · `bins` |
| Completar la definición | Elementos de un concepto legal | Completar la definición | leccion_2_8 · `cloze` |
| Unir parejas | Término ↔ definición | Unir parejas | leccion_2_8 · `pairs` |
| Interruptores por línea | Marcar líneas de un documento | Interruptores por línea | leccion_2_8 · `tog` |
| Flujo / cálculo paso a paso | Procesos de cálculo | Flujo de liquidación | leccion_2_8 · `calc28` |
| Ronda rápida | Clasificación contra el tiempo | Ronda rápida | leccion_2_8 · `qf` |
| Comparador antes/después | Documento incorrecto vs. correcto | Comparador antes/después | leccion_2_8 · `cmp` |
| Árbol de decisión | Preguntas encadenadas | Árbol de decisión | leccion_2_9 · `tree` |
| Barras con topes | Ajustar valores a límites | Barras de topes | leccion_2_9 · `caps` |
| Fichas por descubrir | Listas de prohibiciones o reglas | Fichas por descubrir | leccion_2_9 · `tiles` |
| Tabla con selectores | Clasificar varios casos a la vez | Tabla con selectores | leccion_2_9 · `tbl` |
| Veredicto por línea | Caso integrador línea a línea | Veredicto por línea | leccion_2_9 · `vl` |
| Lista Sí/No + respuesta modelo | Transferencia al propio trabajo | Lista Sí/No | leccion_2_9 · `yn model` |
| Comprobación (5 preguntas) | Evaluación con 80% | (base) | todas · `quiz` / `pass` |

## Piezas comunes del motor (`assets/engine.js`)

- `<section class="slide" data-title="…" data-audio="p03" data-dur="0:13" data-gate="clave1 clave2" data-gate-msg="Qué falta hacer">`: pantalla con narración y bloqueo.
- Decisión con consecuencias: `<div class="options" data-choice="clave" data-correct="B">` + `<template data-for="clave-A">…</template>` por opción (botón `.retry` para volver a intentar). La respuesta al primer intento se guarda para el informe final (`FIRST_KEYS`).
- `const Q=[{q,o:[…],c:índice,f:'explicación'}]`: preguntas de la comprobación (variar `c`).
- `const VIDEO={durs:{{VDURS}},scenes:[{t,lines:[…],html}]}`: escenas; `data-at="n"` muestra un elemento al llegar a la línea n.
- `data-report` en la última pantalla; `#fPct`, `#fEsc` muestran resultados; `data-goto="n"` para botones de repaso.
