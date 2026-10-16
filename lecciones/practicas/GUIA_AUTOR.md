# Guía para crear actividades prácticas y simuladores (SCORM 1.2)

Modelos: `src/M1_A1.html` (actividad evaluada) y `src/M2_A2.html` (simulador). Copia el más parecido.
Motor: `tools/practica.js` + `tools/practica.css` (no modificar sin necesidad; si lo cambias, verifica que M1_A1 y M2_A2 sigan funcionando).

## Actividad evaluada (nota sobre 100, aprueba con 80)
- `<section id="intro" class="card">` con caso del personaje (avatar `img/maria_avatar.jpg` M1 o `img/marcela_avatar.jpg` M2–M4), qué lección aplica, `.steps` y `<button class="btn" data-start>`. Incluye `<p class="muted best"></p>`.
- 5–7 tareas `<section class="etask card" data-id data-pts data-title data-lesson data-auto="...">` con `<h2>`, enunciado, el control y al final `<div class="why"><h4>Por qué</h4>…</div>`. Los puntos suman 100.
- Tipos (`data-auto`), NO repetir más de 2 veces el mismo tipo y variar:
  - `mc`: `.opts > label.opt[data-ok] > input[type=radio name=único]` (una correcta; se barajan).
  - `multi`: igual con checkbox; varias `data-ok`; acierto suma, error descuenta.
  - `match`: filas `.mrow` = `<span>ítem</span><select data-ans="valor">…</select><span class="mk"></span>`.
  - `order`: `<ol class="ord"><li data-pos="1">…` (se barajan; el estudiante usa ↑↓).
  - `num`: `<input type="text" inputmode="decimal" data-ans="123" data-tol="1" data-show="$123">` dentro de `.numgrid label`.
  - `hot`: dentro de `.mock` (barra `.bar` + interfaz recreada) botones `<button class="hs" [data-ok]>` que se marcan (encontrar errores/riesgos).
- Recrea interfaces de plataformas (WhatsApp Business, Canva, Meta Ads, HubSpot, GA4…) de forma simplificada con `.mock`, tablas `.data` dentro de `.tablewrap`, `.kpi`.
- La explicación (`.why`) dice por qué, no solo cuál.

## Simulador (completa 3 casos; nota = % de casos correctos)
- `#intro` + `<section id="sim" hidden>` con pestañas `.tab[data-pane]` y paneles `.pane` (`#pPract` obligatorio con `#simCount`, `#simCase`, `#simCheck`, `#simNext`, `#simMsg`; segundo panel: calculadora o herramienta de referencia).
- `<script data-sim>` define `window.SIM={min:3, gen(), render(caso, el), check(caso, el) -> null | {ok, sol:html}, solve(caso, el) /*solo para pruebas*/, calc() /*opcional*/}`. Casos aleatorios realistas, solución paso a paso.
- Declarar en pantalla (`.note`) lo que el simulador NO calcula/considera.

## Construir y probar
python3 tools/build.py src/X.html --tipo actividad|simulador --id PYMES_M{n}_{A1|S2} --name Practica_M{n}_... --title "…" --module n --img img --out dist
NODE_PATH=$(npm root -g) node tools/test_act.js dist/<name>/index.html <carpeta_capturas>   (actividad)
NODE_PATH=$(npm root -g) node tools/test_sim.js dist/<name>/index.html <carpeta_capturas>   (simulador)
Mirar las capturas (escritorio y celular): sin errores JS, sin desbordes, sin scroll horizontal.

## Contenido
Español de Chile, claro y autoexplicativo; empresas ficticias (María/Empanadas Doña María en M1; Marcela/Casa Nativa en M2–M4); datos de plataformas vigentes a 2026 y genéricos (cifras como datos del caso). Nunca "Tremen learning studio". Basarse en las lecciones `lecciones/M{n}/v2/src/*.html`, `data/*.json` y videos `lecciones/M*/videos/*/locucion.json`, pero con ítems nuevos (transferencia), no copiados de la lección.
