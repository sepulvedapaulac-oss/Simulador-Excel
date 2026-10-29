# Estándar de producción de cursos SCORM para Moodle

Este estándar resume cómo se producen los cursos con esta plantilla. Nació del curso «Inteligencia Artificial aplicada a la Gestión de Remuneraciones» (40 h, 4 módulos, 16 lecciones). Todo lo que sigue es el punto de partida por defecto: la autora puede cambiar cualquier elemento en el programa del curso (`docs/programa/programa.md`) y en su diseño (`docs/diseno-curso.md`).

## 0. Flujo de un curso nuevo
1. **La autora dice «vamos a hacer el curso» y sube el archivo del programa** (Word, PDF u otro). Ese archivo **es** el programa: no se redacta otro. Si no hay archivo, se redacta el programa con `crear-programa`.
2. **Storyboard** (habilidad `crear-programa`) a partir del archivo, respetando su temario textual. En esa misma entrega se pregunta a la autora si las evaluaciones Parte 2 de los módulos serán **tareas o foros** (Res. Ex. SENCE N.º 2484 y N.º 2486; por defecto, tareas).
3. **Aprobación de la autora.** No se produce nada antes.
4. **Planilla SENCE** (habilidad `codificador-cursos-sence`) desde el programa y el storyboard aprobados. Al cerrarla se copia su competencia, aprendizajes esperados, criterios y horas a `curso.json` → `"sence"` (sección 10).
5. **Configuración** (`crear-curso`): `curso.json` (incluidos `"colores"` y `"marca"`) y `docs/diseno-curso.md`.
6. **Recursos**: bienvenida (sección 1), evaluación diagnóstica, luego módulo por módulo (con su tarea o foro), y al cierre la evaluación de salida con comparador y la evaluación final en dos partes con sus instrucciones.

## 1. Estructura por defecto de un curso
| Elemento | Por defecto |
|---|---|
| Módulos | Los del programa (por defecto 5). Las horas ascienden según la complejidad del aprendizaje esperado (por ejemplo, 8-9-10-11-12 en 50 h); las lecciones no muestran tiempo estimado |
| Lecciones por módulo | 4, SCORM 1.2. Las lecciones **x.1 y x.3 van con voz**; las **x.2 y x.4 sin voz** |
| Plataforma | Moodle. Responsivo para PC y móvil, tema claro y oscuro automático |
| Evaluación del curso | Diagnóstica al inicio y de salida al final (sin nota, con comparador). Nota final = actividades de los módulos 40 % + evaluación final Parte 1 20 % + Parte 2 40 % |
| Aprobación | **Curso:** nota 4,0 en escala de 1,0 a 7,0 con 60 % de exigencia sobre el logro ponderado (actividades 40 % + evaluación final Parte 1 20 % + Parte 2 40 %); conversión en la sección 3. **Cada actividad:** los SCORM con nota se marcan «aprobados» desde 70 % (`pass` 0.7) y la comprobación de cada lección pide 80 % para avanzar. Son reglas distintas: el estado de una actividad no cambia la nota del curso |
| Caso conductor | Empresa ficticia y elenco diverso que recorre todo el curso; el protagonismo rota (ver sección 4). Todos los datos son ficticios |

### Recursos por módulo
| # | Recurso | Cantidad | Formato |
|---|---|---|---|
| 1 | Lecciones interactivas con video integrado | 4 | SCORM 1.2 |
| 2 | Video de presentación del módulo | 1 | MP4 1080p, con voz, **sin música**, subtítulos `.vtt` |
| 3 | Material PDF (guía, checklist, plantilla, protocolo…) | 2 | PDF |
| 4 | Resumen tipo carrusel | 1 | HTML |
| 5 | Glosario tipo carrusel | 1 | HTML |
| 6 | Laboratorios prácticos (simulador) | 2 | HTML para revisión → SCORM 1.2 con nota |
| 7 | Evaluación del módulo · Parte 1: cuestionario de selección múltiple | 10 preguntas | Moodle XML |
| 8 | Evaluación del módulo · Parte 2: **tarea con rúbrica** (o foro, si la autora lo elige) | 1 por módulo | Tarea de Moodle: instrucción TXT + plantilla Word + rúbrica (`tools/build_tarea.py`) |
| 8b | Evaluación ramificada (opcional) | Según el programa | SCORM 1.2, como actividad práctica |
| 9 | Caso de análisis en Mindsmith | 1 | Mindsmith (solo casos) |

### Bienvenida del curso (primera sección de Moodle)
Tres piezas, con los **colores del curso** (sección 7) y los datos de `curso.json` → `"sence"`:
1. **Presentación del curso** (HTML autocontenido, carrusel con tema claro y oscuro): bienvenida, competencia y aprendizajes esperados, público y requisitos, metodología, acompañamiento del tutor o facilitador, distribución horaria, una tarjeta por módulo, recorrido sugerido, formato de evaluación, evaluación final, diagnóstico y requisitos técnicos.
2. **Guía del participante** (PDF A4 con portada): competencia y aprendizajes esperados, metodología, distribución horaria, módulos, recorrido sugerido, formato de evaluación, diagnóstico y requisitos técnicos.
3. **Instrucciones de bienvenida** (TXT para el código fuente de Moodle, `python3 tools/build_moodle.py bienvenida`): encabezado con la marca, horas, módulos y lecciones; competencia; tarjetas desplegables con el aprendizaje esperado de cada módulo; ciclo de trabajo del curso y cierre que invita a la evaluación diagnóstica.
Referencia de formato: `src/ejemplos/bienvenida/` (curso de servicio al cliente).

### Inicio del curso
- **Evaluación diagnóstica** en SCORM, sin nota: **5 preguntas por módulo, una por cada unidad del temario** que se va a enseñar, con feedback en cada alternativa (alternativas en orden aleatorio por persona).
- Al terminar muestra el perfil de entrada por módulo en un **gráfico de araña** (radar), con una recomendación por módulo.
- El participante **descarga un PDF con el gráfico y un código de entrada** (por ejemplo, `D-35241-K`).
- Ejemplo: `src/ejemplos/evaluacion-diagnostica/` (preguntas en `banco.py`).

### Cierre del curso
- **Evaluación de salida con comparador** en SCORM, sin nota, al terminar el último módulo y antes de la evaluación final:
  - **Forma paralela** del diagnóstico: mismas unidades y dificultad, preguntas distintas.
  - Muestra el **mismo gráfico de araña con el inicio y el final superpuestos**, el avance por módulo y **qué módulos repasar** (los más débiles, con sus lecciones y recursos) antes de la evaluación final.
  - Recupera el resultado de entrada desde el navegador, o con el código del PDF de diagnóstico si la persona cambió de equipo.
  - PDF descargable. Ejemplo: `src/ejemplos/evaluacion-salida/`.
- **Evaluación final del curso** en dos partes que integran todo el contenido. Lleva tres textos TXT para Moodle (`python3 tools/build_moodle.py final`, datos en `src/evaluacion-curso/instrucciones.py`):
  - **Instrucción general**, antes de la Parte 1: qué mide (la competencia), las dos partes y su peso en la nota, «Antes de comenzar», tabla de puntaje y aprobación, y tabla criterio × Parte 1 × Parte 2.
  - **Instrucción de la Parte 1**: qué encontrarás, cómo responder, ten en cuenta y criterios evaluados.
  - **Instrucción de la Parte 2**: el caso, tabla de tareas (una por criterio, con puntaje), cómo responder y resultados.
  - **Parte 1 · Preguntas de contenido**: cinco preguntas de selección múltiple por módulo, identificadas como `M1.P1 … Mn.P5`, de **2 puntos cada una**, con feedback en cada alternativa. Se entrega en **Moodle XML**.
  - **Parte 2 · Caso aplicado integrador**: SCORM con nota. Un caso del caso conductor con una tarea por módulo, en el que la persona integra todo lo aprendido. Al terminar **descarga un PDF con sus resultados**.
  - Ejemplo de las dos partes: `src/ejemplos/evaluacion-final-curso/`.
- **Ponderación por defecto**: actividades de los módulos 40 %, Parte 1 20 % y Parte 2 40 %.

### Evaluación de cada módulo (Res. Ex. SENCE N.º 2484 y N.º 2486)
- **Parte 1 · Cuestionario** (Moodle XML, corrección automática con feedback en cada alternativa).
- **Parte 2 · Tarea con rúbrica** corregida por el tutor o facilitador (o **foro**, si la autora lo elige al iniciar el curso). Es la intervención verificable del tutor que exige SENCE. Cada tarea entrega tres archivos (`python3 tools/build_tarea.py src/moduloN/tarea.py`):
  - **Instrucción TXT** para la descripción de la Tarea en Moodle: encabezado, introducción, «Antes de empezar» (aprendizaje esperado, duración, plazo, qué necesitas, qué entregas, calificación), paso a paso con minutos, herramientas del módulo, criterios de evaluación, el caso, la rúbrica completa, la conversión de puntaje a nota y el aviso para descargar la plantilla.
  - **Plantilla de respuesta** en Word para la persona participante: datos, tablas con una fila de ejemplo resuelto (✎) y filas en blanco, y espacios de texto con extensión indicada.
  - **Rúbrica y pauta de corrección** en Word para el tutor: 3 a 5 criterios con peso (suman 100) y 4 niveles (Excelente 100 %, Bueno 75 %, Suficiente 50 %, Insuficiente 0 %), respuestas esperadas y registro de corrección.
- Ejemplo: `src/ejemplos/tarea/tarea.py`. Los cursos ya armados pasan su Parte 2 (SCORM o laboratorio) a tarea con rúbrica.

## 2. Estructura de cada lección
1. **Inicio** con gancho interactivo: una situación del caso y una decisión con feedback de consecuencia.
2. **Video integrado** por capítulos, con subtítulos y transcripción (con voz en x.1 y x.3; textos animados en x.2 y x.4).
3. **Dos o tres pantallas con herramientas interactivas distintas** (ver `docs/componentes.md`). Ninguna lección repite la combinación de otra.
4. **Caso aplicado** con decisiones encadenadas y feedback de consecuencia en cada alternativa.
5. **Comprobación**: 5 preguntas con feedback en cada alternativa; se necesita 80 % (4 de 5) y se puede reintentar.
6. **Transferencia al trabajo**: un constructor o plantilla personal con respuesta modelo y botón de copiar.
7. **Finalización**: métricas, idea final y botones para repasar.
Cada pantalla se desbloquea al completar su interacción (`data-gate`). SCORM registra `lesson_status`, `score.raw` y `suspend_data` para retomar.

**Las lecciones SCORM no muestran la competencia, los aprendizajes esperados ni los criterios de evaluación.** Esos textos viven solo en la bienvenida, las instrucciones TXT, las tareas, las rúbricas y la evaluación final (sección 10), para que un cambio en la planilla SENCE no obligue a recompilar lecciones.

## 3. Laboratorios y evaluaciones
- **Laboratorios**: simuladores aplicativos con datos sintéticos, retroalimentación inmediata y reintento. El principal es el **simulador de Excel en español** (`tools/hoja.js`: fórmulas con punto y coma, funciones en español, relleno hacia abajo). Se construyen primero como HTML para revisión de la autora y luego se empaquetan como SCORM con nota. La narración en laboratorios solo se agrega si la autora la aprueba.
- **Evaluación ramificada**: caso de 7 a 8 decisiones con tres opciones (óptima 3, aceptable 2, riesgosa 0 puntos); la primera decisión abre tres rutas; nota = puntaje / máximo de la ruta (mejor intento); desenlace según el puntaje (≥85 %, 60–84 %, <60 %) y feedback por competencia. Ejemplo: `src/ejemplos/evaluacion-ramificada/`.

### Nota del curso
**Cómo se calcula la nota del curso:**
1. Logro ponderado = 40 % × promedio de las actividades de los módulos + 20 % × Evaluación final Parte 1 + 40 % × Evaluación final Parte 2.
2. Ese logro se convierte a nota de 1,0 a 7,0 con 60 % de exigencia:
   - bajo 60 %: nota = 1 + 3 × logro ÷ 60;
   - desde 60 %: nota = 4 + 3 × (logro − 60) ÷ 40.
3. Equivalencias: 60 % = 4,0 (aprueba), 80 % = 5,5 y 100 % = 7,0.

El 70 % que marca «aprobado» en cada SCORM con nota es el estado de esa actividad; la aprobación del curso es la nota 4,0 sobre el logro ponderado.

## 4. Redacción
- Español neutro latinoamericano, tuteo, **lenguaje neutro en género** (sin suponer género por el nombre).
- Frases cortas, tono profesional y cercano. Preguntas contextualizadas en el caso, no de memoria.
- Feedback en **todas** las alternativas (correctas e incorrectas), explicando el criterio.
- **Posición de la respuesta correcta variada**, en todo recurso con alternativas (comprobaciones, decisiones, casos, laboratorios, evaluaciones y cuestionarios XML):
  - El motor muestra las alternativas en orden aleatorio por persona: comprobación (nuevo orden en cada intento), decisiones `data-choice`, evaluación ramificada, diagnóstico, salida y Parte 2 de la evaluación final.
  - Moodle desordena las del XML (`shuffleanswers`).
  - Aun así, al redactar se reparte la correcta entre A, B, C y D. La correcta no es siempre la más larga ni la más matizada, y las incorrectas son plausibles.
  - Solo se fija el orden cuando las alternativas lo exigen, por ejemplo una escala o «Todas las anteriores» (`fixed`).
- Exactitud normativa: no inventar normas, artículos ni circulares. Las cifras de parámetros se presentan como valores ilustrativos y se recuerda verificarlas en la fuente oficial.
- Palabras que no se usan: «determinístico». (La autora puede agregar otras en `CLAUDE.md`).
- **Storytelling con elenco diverso**: el caso conductor tiene 4 a 6 personas de distintos géneros, edades y orígenes. El protagonismo **rota entre módulos y lecciones**, y no recae siempre en una mujer ni en la misma persona. Nadie queda fijo en el rol de quien se equivoca, de quien manda o de quien apoya, y no hay estereotipos de rol por género. El elenco se define en el programa y se respeta en lecciones, videos, laboratorios y evaluaciones.
- **Aprendizajes esperados** (cuando el curso se codifica en SENCE): verbo infinitivo + objeto + condición, ascenso Bloom, mismos verbos en la plataforma. Reglas en la habilidad `codificador-cursos-sence`.

## 5. Voz
- Solo herramientas gratuitas y de código abierto: **Chatterbox Multilingual** (Resemble AI, licencia MIT), voz clonada desde `tools/voz/referencia_latina.wav` (español latino neutro, voz femenina cálida), versión «más viva»: `exaggeration 0.75`, `cfg_weight 0.35`, idioma `es`. Control de calidad por frase con **faster-whisper** (modelo «small»): transcribe, compara, reintenta y recorta ruidos finales.
- No usar servicios pagos (por ejemplo ElevenLabs) sin consentimiento de la autora.
- La narración se escribe para leerse en voz alta: números y siglas con palabras («tres punto uno», «ocho por ciento», «A F P»), sin paréntesis ni símbolos.
- Instalar el entorno: `bash tools/voz/setup.sh`. Generar audio toma cerca de una hora por lección: correrlo en segundo plano. La caché (`.cache/tts`) permite retomar si se interrumpe.
- Los avisos «REVISAR» del control de calidad suelen ser falsas alarmas por números en cifras. Si la transcripción dice otra cosa, reformular la frase y regenerar.

## 6. Imágenes
- **Canva**, estilo fotográfico realista, coherente con la paleta (teal y navy). Dos por lección: `src/img/iNN_hero.jpg` e `iNN_b.jpg` (NN = módulo y lección, por ejemplo `i23_hero.jpg`), 600×450 o mayor.
- **No guardar ni confirmar diseños en la cuenta de Canva de la autora**: para obtener mayor resolución se usan transacciones temporales de edición que se cancelan al final.
- Todo `<img>` lleva un `alt` que describe lo que realmente muestra la imagen.

## 7. Sistema visual
Homologado con la lección de referencia (teal/navy): panel lateral con la ruta en PC, botón «Ruta» en móvil, barra superior con progreso, tarjetas redondeadas y barra de navegación inferior. Los tokens de color están en `tools/base.css` y se usan en todos los recursos HTML (lecciones, laboratorios, carruseles y evaluaciones). Tipografía del sistema.

**Colores de cada curso.** Cada curso conserva la paleta con que se diseñó (por ejemplo, TLS azul y amarillo en servicio al cliente; verde azulado y azul petróleo por defecto). Se declara en `curso.json` → `"colores"` (`oscuro`, `primario`, `acento`, `acento_txt`, `destaque`, `claro`, `suave`, `linea`, `alterna`, `tinta`) y `"marca"` (texto del encabezado). Si falta, se usa la de `tools/base.css`. La usan la bienvenida, las instrucciones TXT, las tareas y las rúbricas.

## 8. Calidad antes de entregar
- Compilar y probar cada recurso en escritorio (1440×900) y móvil (390×844): sin errores de JavaScript ni desborde horizontal, en tema claro y oscuro.
- Revisar las capturas: textos que se corten, puntos de hotspot que tapen contenido, selectores truncados, tablas que no quepan en móvil.
- Videos: revisar duración, subtítulos `.vtt` y un fotograma.
- PDF: revisar páginas casi vacías y tablas que se corten.

## 9. Entrega
- Bienvenida: `python3 tools/entrega/pack.py bienvenida` (presentación HTML, guía PDF e instrucciones TXT).
- Cada módulo incluye su carpeta `tarea/` (instrucción TXT, plantilla Word y rúbrica).
- Programa, storyboard y planilla SENCE: Word (`python3 tools/build_doc.py docs/programa/<archivo>.md`), antes de producir.
- Por módulo y completo: zip + archivos sueltos (por si la autora no puede abrir el zip), con un **LEEME** que indica dónde va cada recurso en Moodle. Comando: `python3 tools/entrega/pack.py N`.
- Los casos de Mindsmith quedan **sin publicar**: la autora los revisa y publica.
- Si Mindsmith devuelve un storyboard vacío al crear el caso, se construyen las páginas con una edición posterior.

## 10. Fuente única de la información SENCE
- La competencia, los aprendizajes esperados, los criterios de evaluación y las horas por módulo se escriben **una sola vez**, en `curso.json` → `"sence"`, copiados de la planilla SENCE aprobada:
  ```json
  "sence": {"competencia": "...", "ae": ["...", "..."], "criterios": ["...", "..."], "horas": [9, 11, 12, 13, 15], "solicitud": "N.º de solicitud"}
  ```
  Si `criterios` falta, se deriva de cada AE en tercera persona («Identificar…» → «Identifica…»).
- Los compiladores (`build_moodle.py`, `build_tarea.py`, presentación y guía) leen de ahí. **Cada vez que se actualiza la planilla SENCE** se actualiza `"sence"` en el mismo commit y se regeneran todos los recursos donde aparecen: bienvenida (presentación, guía y TXT), tareas y rúbricas, instrucciones de la evaluación final, evaluación diagnóstica y de salida (si muestran los AE). Las lecciones SCORM no los muestran.
- Textos para Moodle: se entregan en `.txt` con HTML de estilos en línea, sin `<style>`, `<script>`, flex, grid ni degradados (el filtro de Moodle los elimina). Se pegan en el editor › Código fuente.
