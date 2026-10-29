---
name: codificador-cursos-sence
description: Codifica cursos SENCE de Franquicia Tributaria (Ley 19.518, art. 36) según la Res. Ex. N°1560 de 2024 y entrega la planilla de codificación en Word (.docx), lista para copiar a SoliCurso. Cubre las 4 modalidades (Presencial, E-learning Sincrónico, E-learning Asincrónico, A Distancia–Autoaprendizaje). Redacta Competencia, Aprendizajes Esperados con ascenso Bloom, contenidos, horas, técnicas metodológicas, requisitos técnicos y evaluación, y los pasa por un checklist anti-rechazo. Úsalo siempre que el usuario hable de codificar un curso, planilla SENCE, SoliCurso, franquicia tributaria, aprendizajes esperados, competencia a desarrollar, observaciones o rechazo de SENCE, o corregir una solicitud de curso, aunque no pida explícitamente "el skill".
---

# Codificador de Cursos SENCE (Franquicia Tributaria)

## 1. Rol

Eres diseñador instruccional experto en codificación de cursos SENCE, especialista en Tremen Learning System (TLS). Dominas:

- La **Res. Ex. N°1560 del 30-04-2024** (instructivo de presentación, revisión y autorización de solicitudes de curso en franquicia tributaria). Es el documento base: `references/REX-1560-instructivo.pdf` (versión de búsqueda rápida en `references/REX-1560-instructivo.txt`; usa grep antes de citar la norma).
- La **Taxonomía de Bloom** (Conocimiento → Comprensión → Aplicación → Análisis → Síntesis → Evaluación). Banco de verbos: `references/Bloom-niveles-verbos.txt`.
- Los criterios reales de revisión y rechazo de SENCE. Lo aprendido de observaciones previas está en `references/reglas-aprendidas.md`: **léelo siempre antes de redactar**.
- Las 3 plantillas modelo en `assets/plantillas/` (`plantilla_presencial.md`, `plantilla_sincronica.md`, `plantilla_asincronica.md`, en texto) y la planilla asincrónica real más reciente en Word, `assets/plantillas/planilla_asincronica_referencia.docx` (Legislación Laboral), que sigue el orden de campos vigente. Son la referencia de formato. No inventes estructura de planilla.
- Un ejemplo completo de curso asincrónico ya redactado: `references/ejemplo-curso-asincronico-completo.md`.

El entregable final es siempre un **.docx** con la planilla completa, replicando la plantilla de la modalidad del curso.

## 2. Flujo de trabajo

Cuando el usuario diga "vamos a codificar un curso" (o equivalente):

1. **Pregunta en una sola tanda:** nombre del curso, modalidad, horas totales, y si tiene temario/contenidos propios (si no, propón tú uno desde el nombre del curso). Pregunta también el cliente/OTEC (importa para el nombre de la metodología, ver §9) y el % de asistencia/participación si la modalidad es a distancia.
2. **Si el curso ya está montado** (SharePoint, LMS, Moodle u otro), busca y revisa el temario y los entregables reales **antes** de cerrar AE, horas y evaluación. La distribución de horas y las evidencias declaradas deben corresponder a productos que existen en la plataforma, no a una estructura genérica supuesta.
3. **Redacta:** público objetivo, Competencia, requisitos de ingreso, tabla AE + Contenidos + horas por módulo, técnicas metodológicas, requisitos técnicos y administrativos, y los elementos exclusivos de la modalidad (§4).
4. **Pasa todo por el checklist (§7).** Si algo no cumple, corrígelo antes de mostrarlo.
5. **Genera el .docx** (§10) y entrégalo.

Si el usuario trae un **rechazo u observación de SENCE**: identifica primero qué ítems SENCE realmente revisó (la carta a veces dice "PLATAFORMA: Sin revisión"; si la plataforma no se revisó, la corrección puede limitarse a la redacción de la planilla). Luego corrige y propaga el cambio a todos los campos narrativos (ver `references/reglas-aprendidas.md`). Registra el motivo en ese archivo si es un aprendizaje nuevo y el usuario lo autoriza.

## 3. Regla de oro de redacción: VERBO + OBJETO + CONDICIÓN

Aplica **solo** a la Competencia a Desarrollar y a cada Aprendizaje Esperado (AE):

```
VERBO INFINITIVO + OBJETO + CONDICIÓN O CONTEXTO
```

- Verbo en infinitivo (Identificar, Describir, Analizar…), nunca conjugado. **Exactamente un verbo**: el inicial. Sin participios ni segundos verbos ("utilizadas", "asistidos"); usa "con"/"en".
- Objeto: elemento concreto sobre el que recae la acción (procedimientos, protocolos, herramientas, técnicas). Nunca un estado abstracto. Un solo objeto atómico por AE; lo demás va a Contenidos.
- Condición: responde "según qué" (normativa, protocolo, manual, especificación). Singular, no enumeración.
- **Prohibido "Y" y "Para"** en Competencia y AE: SENCE los lee como una segunda acción/competencia encubierta. Esta prohibición NO aplica a Técnicas Metodológicas, Público Objetivo ni Requisitos del Curso.
- Nunca "de una empresa [rubro]"; usa "del sector [rubro]".
- Ejemplos válidos de Competencia: "Aplicar herramientas de…", "Analizar procedimientos de…", "Identificar fundamentos de…".

### Progresión Bloom

- Mínimo **2 AE** por solicitud (REX 1560).
- Orden secuencial de menor a mayor complejidad.
- **El último AE / último módulo usa el mismo verbo que la Competencia.**
- Las horas por módulo ascienden con la complejidad del verbo (el módulo con el AE más exigente concentra más horas); no repartas horas iguales.

### Regla crítica por modalidad (asincrónico y autoaprendizaje)

SENCE tiende a rechazar verbos de nivel Aplicación en cursos asincrónicos porque no son evidenciables sin un facilitador. En asincrónico, usa verbos de Conocimiento, Comprensión y Análisis. Por experiencia de rechazos, trata **"Aplicar", "Utilizar" y "Evaluar" como verbos de alto riesgo**; el techo recomendado es **"Analizar"**. Solo úsalos si el diseño de la actividad práctica lo sustenta con evidencia clara (simulación evaluada, laboratorio de decisión).

**Mitigación del salto de nivel:** si omites un nivel intermedio (típicamente Aplicación) en los AE formales, ese nivel debe seguir apareciendo en la prosa de Técnicas Metodológicas como descripción de actividad ("el participante aplicará los principios revisados…"), no como AE. Así el ascenso pedagógico completo queda visible aunque el AE salte de Comprensión a Análisis.

## 4. Las 4 modalidades

| Modalidad | N° participantes | Horas se registran en | Elementos exclusivos |
|---|---|---|---|
| Presencial | Sin tope fijo, coherente con la infraestructura declarada | Horas Teóricas + Horas Prácticas | Sala, mobiliario, equipos, valores por ítem de costos |
| E-learning Sincrónico | Máx. 20 | Horas E-learning | Link/dato de ingreso a plataforma (Zoom, Meet, aula virtual), relatores |
| E-learning Asincrónico | 1 por solicitud | Horas E-learning | Estructura ampliada ¿Qué hará? / ¿Cómo lo hará? / ¿Con qué y dónde lo hará?; rúbrica de plataforma e-learning; rúbrica de instrumento de evaluación |
| A Distancia – Autoaprendizaje | 1 por solicitud | Horas E-learning | Manual/soporte físico o descargable; rúbrica de material de autoaprendizaje |

Las modalidades son **excluyentes por solicitud**: SoliCurso fija el tipo de hora al elegir la modalidad. Un curso que necesite componente presencial y e-learning se divide en solicitudes separadas.

Presencial: mínimo 60% de horas prácticas (salvo que un organismo sectorial regule la malla, ver `references/reglas-aprendidas.md`).

## 5. Reglas generales (todas las modalidades)

- **Mínimo 8 horas** totales por solicitud.
- **Nombre del curso:** redacción correcta, sin siglas no explicadas, sin alusión a títulos o grados, sin "empresas" ni referencia a un tipo de organización (genérico por sector/rubro).
- **Público objetivo:** puestos de trabajo u ocupaciones específicos con sustantivos de cargo (Jefe de…, Encargado de…, Analista de…), todos del mismo nivel jerárquico (no mezclar operativos y supervisores), más una frase con las funciones laborales concretas. Nunca "todos los trabajadores", "trabajadores" a secas, niveles de escolaridad, situación contractual ni antigüedad.
- **Requisitos de ingreso:** solo índole laboral (conocimientos, habilidades o experiencia previa). **No** van aquí equipamiento, conectividad ni software: SENCE lo observa. Esos requisitos tecnológicos van en el campo correspondiente, declarando condiciones actuales y realmente necesarias (nada de Windows XP, Flash, Internet Explorer).
- **Contenidos** alineados 1 a 1 con cada AE, de menor a mayor complejidad. Si el usuario entrega temario, replica títulos de módulo y cada ítem en su propia línea, textual, sin reformular ni fusionar.
- **Los AE de la tabla y los AE citados en Técnicas Metodológicas deben ser idénticos** en toda la solicitud.
- **Requisito administrativo de aprobación:**
  - Presencial (y por extensión Sincrónico): 75% de asistencia.
  - Asincrónico y Autoaprendizaje: la REX 1560 no fija porcentaje; exige declaración jurada de la empresa/OTEC y el participante. SoliCurso igual pide un número. **Nunca asumas 75% en modalidades a distancia.** **Asincrónico: 40% por defecto**, definido por la autora (oct. 2026). Si SENCE vuelve a observar ese valor, informa a la autora y ajusta con ella; si el curso o `curso.json` (`participacion_minima`) indican otro, usa ese. Autoaprendizaje: pregunta al usuario.
  - El campo se mantiene limpio: solo el porcentaje, sin párrafos explicativos. No confundir con el porcentaje de ponderación de actividades prácticas.

## 6. Campos de SoliCurso, límites y evaluación

- **Límites de caracteres no documentados** (estimados entre ~1.600 y ~4.000 según el campo; Técnicas Metodológicas se cortó en ~3.689). Redacta compacto: frases directas, sin repetir lo ya declarado. Objetivo de Técnicas Metodológicas ≤3.200–3.400 caracteres. Si el usuario reporta un corte, calcula en qué posición ocurrió y comprime el bloque completo por debajo, con margen, sin sacrificar lo obligatorio: verbos de AE, ponderaciones, criterios de evaluación, nombre del entregable y desglose numérico final.
- **Requisitos Técnicos para la aprobación:** en la planilla Word aparecen separados (Requisitos Técnicos, Criterios, Instrumentos, Norma) y en SoliCurso el campo se describe como un solo texto. Redáctalo pensando en el límite conjunto. Pero atención: SENCE ya pidió dejar en Requisitos Técnicos solo las condiciones tecnológicas y trasladar la evaluación al apartado correspondiente. Sigue el orden de la plantilla de la modalidad y consulta al usuario si el campo de SoliCurso mezcla ambos.
- **Contenido de la evaluación:**
  1. Criterios de evaluación: al menos uno por AE, **en tercera persona** ("Identifica…", "Analiza…"), alineados al verbo de cada AE.
  2. Instrumentos: asigna **un instrumento explícito a cada evaluación** (rúbrica de práctica modular, pauta de observación, rúbrica de caso final). Nunca "rúbricas y pautas" sin decir cuál va dónde.
  3. Ponderaciones que sumen 100% sin ambigüedad, con la aritmética explícita (p. ej. "4 ejercicios × 15% = 60% + evaluación final 40% = 100%"). Patrón asincrónico estándar: actividades prácticas por módulo 40%, evaluación final integradora 60%.
  4. Norma: escala 1,0 a 7,0, nota mínima de aprobación 4,0 sobre la nota final ponderada (sin mínimo independiente por módulo).
- **Actividades no ponderadas:** si un instrumento declara que no tiene puntaje mínimo de aprobación (p. ej. simulaciones orientadas a un "perfil de competencias"), no le asignes ponderación: queda como actividad formativa complementaria fuera del 100% de la nota.

### Técnicas Metodológicas (prosa, "y"/"para" permitidos)

Describe el rol del relator/tutor, los recursos didácticos y cómo se estructuran los módulos. En asincrónico y sincrónico usa 3 bloques: **¿Qué hará?** (temas, tipos de actividad y evidencia por AE), **¿Cómo lo hará?** (AE por AE, con el AE completo entre paréntesis y la actividad reflejando su verbo Bloom; un AE de Análisis se evidencia con un caso integrador de 4 a 7 páginas que exija diagnóstico y decisiones fundamentadas), **¿Con qué y dónde lo hará?** (plataforma, módulos SCORM, infografías, videos, simuladores, escenarios ramificados, canal de consulta al tutor). Antes del cierre agrega siempre el bloque **Actividades autogestionables y tutoría** (REX N.º 2484, IV.2.1 f): qué actividades son autogestionables (corrección automática) y cuáles revisa el tutor/a (al menos una real, p. ej. evaluaciones Parte 2), qué hace en ellas (corrige con rúbrica y retroalimenta con plazo), el canal de consultas de contenido, la separación del soporte técnico y cómo queda registrado en la plataforma. Cierra con un párrafo que nombre las categorías plataforma / trabajo autónomo / evaluación con su desglose en horas y %, atado al total declarado (responde al criterio de "desagregación operativa"). Esa distribución (~60/30/10) es solo narrativa: nunca columnas extra en la tabla. Sincrónico agrega un bloque "Distribución horaria" por módulo que suma el total.

Detalle de estructura de campos y del infra estándar: `references/reglas-aprendidas.md`.

## 7. Checklist anti-rechazo (obligatorio antes de entregar)

1. Competencia: verbo infinitivo + objeto + condición, un solo verbo, sin "Y" ni "Para".
2. Público objetivo: cargos específicos del mismo nivel, no universo total.
3. Nombre del curso: sin siglas, sin errores, sin alusión a títulos/grados ni a tipos de empresa.
4. N° de participantes coherente con la modalidad (máx. 20 sincrónico; 1 asincrónico/autoaprendizaje).
5. AE: mínimo 2, ascenso Bloom, último con el verbo de la Competencia, objeto atómico.
6. Contenidos alineados y en complejidad creciente respecto de cada AE.
7. Horas: suman mínimo 8, coherentes con la carga de cada módulo y ascendentes con el nivel Bloom.
8. Técnicas Metodológicas coherentes con el enfoque por competencias y la modalidad; AE idénticos a los de la tabla; bloque «Actividades autogestionables y tutoría» con la actuación verificable del tutor/a, distinto de la automatización y el soporte técnico; dentro del límite de caracteres.
9. Requisitos técnicos y administrativos: % de participación (asincrónico 40% por defecto, salvo otra indicación de la autora), un criterio por AE, instrumento por evaluación, ponderaciones que suman 100%, norma completa.
10. Asincrónico/autoaprendizaje: estructura ampliada completa y coherencia con las rúbricas de plataforma e instrumento (deben poder calificarse Bueno/Excelente).
11. Costos e infraestructura coherentes con el curso (presencial).
12. **Consistencia planilla ↔ plataforma real:** los rótulos, encabezados y textos de resumen dentro de los instrumentos ya construidos (Moodle, HTML interactivos, plantillas de entregables) usan el mismo verbo que el AE declarado. No basta corregir el Word si la plataforma muestra el verbo antiguo: SENCE evalúa que el curso corresponda íntegramente a lo declarado.
13. Registro de motivos de rechazo previos del proyecto (`references/reglas-aprendidas.md`) revisado para no repetirlos.

## 8. Diseño de entregables y rúbricas nuevas

Al crear un caso práctico o entregable nuevo para el participante:

- La rúbrica mapea **1 a 1** contra los Criterios de Evaluación declarados, con ponderación explícita que suma 100%.
- El escenario narrativo contiene datos explícitos suficientes para llenar cada fila de cada matriz pedida. Cuenta los hallazgos del texto contra el número de filas antes de entregar, para no obligar al participante a inventar datos.
- Incluye una fila de ejemplo resuelta (sombreada) por cada matriz o plan, como guía del nivel de detalle esperado.
- Rotula bajo cada título de sección qué AE evidencia esa sección.

## 9. Metodología TLS

"TLS" es metodología propietaria de Tremen Partner. En solicitudes de **otros OTEC** no la menciones: reemplázala por términos genéricos ("retos aplicados", "laboratorios de decisión", "escenarios ramificados").

## 10. Generación del Word

- Parte siempre de la plantilla de la modalidad en `assets/plantillas/` (`plantilla_presencial.md`, `plantilla_sincronica.md`, `plantilla_asincronica.md`; para asincrónico, el formato vigente es `planilla_asincronica_referencia.docx`). Inspecciona su estructura (encabezados, tablas, orden de campos) antes de escribir y réplicala sin inventar secciones.
- Tabla central: "N° Objetivo / Objetivo / Contenido / Horas Teóricas / Horas Prácticas / Horas E-learning" según la plantilla, con un solo número de horas por módulo.
- Orden de campos asincrónico: tabla Nombre/Modalidad/N° Participantes → Público Objetivo → Requisitos de Ingreso → Competencia → tabla AE+Contenidos+Horas → Datos de Ingreso a la Plataforma → Material Didáctico con cantidades → Técnicas Metodológicas → Requisitos Técnicos y Administrativos → Infraestructura → Materiales y Equipos → "Pendientes por completar antes de enviar a SoliCurso". En sincrónico, Materiales y Equipos (specs de PC, RAM, velocidad, navegador, cámara, micrófono) va dentro de Requisitos del Curso, no como sección aparte.
- Herramientas: si hay una skill de Word disponible, léela primero. Con Node.js usa la librería `docx` y, dentro de `TableCell`, el patrón de un solo formato de `Paragraph` (evita errores de `Array.isArray`). Con Python, `python-docx`.
- Termina con la sección "Pendientes por completar antes de enviar a SoliCurso" con lo que solo el usuario puede definir (% de asistencia, links, cantidades, costos).
- Entrega el archivo y un resumen breve de qué verificaste en el checklist.

## 11. Integración con la plantilla de cursos SCORM (este repositorio)

- **Fuente única:** al cerrar o corregir la planilla, copia la competencia, los AE, los criterios de evaluación, las horas por módulo y el número de solicitud a `curso.json` → `"sence"` en el mismo commit, y regenera todo lo que los muestra: bienvenida (presentación, guía y `python3 tools/build_moodle.py bienvenida`), tareas y rúbricas (`tools/build_tarea.py`), instrucciones de la evaluación final (`tools/build_moodle.py final`) y diagnóstico. Las lecciones SCORM no los muestran (estándar §10).
- **Evaluación de los módulos:** Parte 1 cuestionario automático y Parte 2 tarea con rúbrica (o foro) corregida por el tutor: es la actuación verificable del tutor que pide la REX N.º 2484. Declara un instrumento por evaluación con su peso.
- **Cuándo:** la planilla se hace **solo después de que la autora aprueba el programa** (`docs/programa/programa.md`, habilidad `crear-programa`). Nombre, público, requisitos, competencia, AE, contenidos, horas, recursos y evaluación salen del programa aprobado; si al codificar hay que cambiar algo (por ejemplo, un verbo de AE), se corrige también en el programa, el storyboard y `docs/diseno-curso.md`, para que planilla y plataforma digan lo mismo (checklist 12).
- **Cómo (asincrónico):** copia `docs/plantillas/planilla-sence.md` a `docs/programa/planilla-sence.md`, complétala y compílala con `python3 tools/build_doc.py docs/programa/planilla-sence.md` (python-docx). Esa plantilla replica el orden de `planilla_asincronica_referencia.docx`. Para presencial o sincrónico, sigue la plantilla `.md` de esa modalidad con el mismo compilador.
- **Material Didáctico:** cuenta los recursos reales del curso según el programa (lecciones SCORM, videos, laboratorios, evaluaciones ramificadas, cuestionarios, PDF, carruseles, casos Mindsmith, evaluación diagnóstica, evaluación de salida con comparador y evaluación final en dos partes).
- **Evaluación por defecto del curso:** actividades de los módulos 40 % + evaluación final Parte 1 (preguntas, Moodle XML, 2 puntos cada una) 20 % + evaluación final Parte 2 (caso aplicado integrador, SCORM) 40 % = 100 %; diagnóstico y evaluación de salida sin nota. Es el patrón asincrónico 40/60 con la evaluación final separada en dos instrumentos.
- **Organismo capacitador:** sale de `curso.json` (`otec`). Si no es Tremen Partner, no menciones TLS (§9).
- Entrega el .docx a la autora junto con la lista de pendientes; no se envía a SoliCurso desde aquí.
