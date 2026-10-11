# Brief de producción de lecciones SCORM (para cada autor/agente)

Curso: **Inteligencia Artificial aplicada a la Gestión de Remuneraciones** (Chile, 40 h, 4 módulos, 16 lecciones SCORM 1.2 para Moodle).
Público: analistas y asistentes de remuneraciones. Español neutro latinoamericano, tono profesional y cercano, tuteo.
Hilo narrativo: **Camila**, analista de remuneraciones de **AndesCorp** (empresa ficticia, 420 trabajadores; áreas Ventas, Operaciones, Finanzas, Planta, Bodega). Jefe: **Rodrigo**, jefe de Compensaciones. Todos los datos son ficticios.

## Lo que ya existe (léelo antes de escribir)
- Especificación general: `docs/diseno-recursos.md` (sección 5 = mapa de lecciones y herramientas).
- Motor de lecciones: `tools/engine.js` (componentes por atributos `data-*`), estilos `tools/base.css`, compilador `tools/build_lesson.py`, simulador de planilla `tools/hoja.js`.
- Lecciones modelo aprobadas por la autora:
  - `src/modulo1/leccion-1-1` (con voz) y `src/modulo1/leccion-1-3` (con voz) → patrón de narración (`narration` + `data-audio`) y video con voz.
  - `src/modulo1/leccion-1-2` y `src/modulo1/leccion-1-4` (sin voz) → patrón sin narración.
  - Laboratorios: `src/modulo1/lab-1a`, `src/modulo1/lab-1b` (este usa `hoja.js`).
- Cada lección es una carpeta con `lesson.py` (genera `lesson.json`), `content.html` (pantallas `<section class="slide" ...>`), `lesson.js` (ganchos propios, opcional).

## Reglas obligatorias
1. **Estructura de cada lección** (como las modelo): Inicio con gancho interactivo → Video integrado por capítulos → 2–3 pantallas con las herramientas interactivas asignadas → Caso aplicado con decisiones y feedback → Comprobación (quiz de 5 preguntas con feedback en cada alternativa) → Transferencia al trabajo (constructor/plantilla personal) → Finalización. Sin tiempos estimados en ninguna parte.
2. **Herramientas interactivas**: usa las asignadas a tu lección en `docs/diseno-recursos.md` §5. Si un componente no existe en `engine.js`, impleméntalo **dentro de tu lección** (`lesson.js` + un bloque `<style>` al inicio de `content.html`), usando los tokens CSS existentes (`var(--teal)`, `var(--surface)`, etc.) para que funcione en tema claro y oscuro. Registra la completitud con `api.done('clave')` y compuertas `data-gate`.
3. **NO modifiques nada en `tools/`** (ni engine.js, base.css, build_lesson.py, hoja.js, test/). Otros autores trabajan en paralelo. Si de verdad necesitas un cambio compartido, descríbelo en tu informe final.
4. **NO hagas git commit ni push.** Solo crea/edita archivos dentro de tu carpeta `src/moduloN/<tu-carpeta>/`.
5. Lecciones **con voz** (x.1 y x.3): `"voice": true`, textos de narración en `narration` y video con `"voice": true`, como en 1.1/1.3. La narración se escribe para ser leída en voz alta: números y siglas escritos con palabras ("cuarenta y dos horas", "Ley veintiún mil setecientos diecinueve", "A F P"), frases cortas, sin paréntesis ni símbolos. Nunca uses la palabra "determinístico".
   Lecciones **sin voz** (x.2 y x.4): `"voice": false`, video sin voz (textos animados), como 1.2/1.4.
6. **Imágenes**: usa solo `img/iNN_hero.jpg` e `img/iNN_b.jpg` de tu lección (NN = 21, 22…), ya reservadas en `src/img/` (de momento son marcadores; se reemplazan después por imágenes de Canva). Escribe un `alt` descriptivo.
7. **Exactitud normativa (Chile)**: no inventes normas. Si usas cifras de parámetros (UF, UTM, topes, tasas), preséntalas como **valores ilustrativos del curso** y recuerda verificarlas en la fuente oficial. Datos que sí puedes usar: horas extraordinarias con recargo mínimo de 50 % sobre el sueldo convenido (Código del Trabajo, art. 32); jornada ordinaria máxima de 42 horas semanales desde el 26 de abril de 2026 (Ley 21.561, que la reduce gradualmente a 40 horas en 2028); gratificación legal (art. 47 y art. 50, este último con tope de 4,75 ingresos mínimos mensuales anuales); Ley 21.719 de protección de datos (plenamente exigible desde el 1 de diciembre de 2026).
8. **Coherencia con el Módulo 1**: la IA asiste y el sistema calcula; herramientas autorizadas; datos mínimos (códigos EMP-001…, sin nombre ni RUT); instrucciones con tarea, contexto, información, restricciones y formato; verificar siempre.
9. **Responsivo**: debe verse bien a 1440×900 y a 390×844 (móvil), sin scroll horizontal, en tema claro y oscuro.

## Compilar y probar
```bash
python3 tools/build_lesson.py src/moduloN/<carpeta> --voice none     # vista previa sin generar audio
node tools/test/run_lesson.js dist/moduloN/<carpeta> <dir_capturas>          # escritorio
node tools/test/run_lesson.js dist/moduloN/<carpeta> <dir_capturas> mobile   # móvil
```
`run_lesson.js` resuelve los componentes del motor. Para tus componentes propios, si el recorrido se detiene, escribe tu propio script de Playwright en tu directorio temporal (no en `tools/`), usando `require('/opt/node22/lib/node_modules/playwright')`. Revisa las capturas (escritorio y móvil, claro y oscuro) y corrige lo que se vea mal. Sin errores en consola.

## Informe final (breve)
Carpeta creada, lista de pantallas y herramientas usadas, resultado de las pruebas (escritorio/móvil, errores de consola), cambios compartidos que propones (si los hay) y, para lecciones con voz, el número de textos de narración.
