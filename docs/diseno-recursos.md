# Diseño de recursos — IA aplicada a la Gestión de Remuneraciones

Versión ajustada del diseño instruccional (base: conversación "Diseño curso IA remuneraciones").
Plataforma: **Moodle**. Formato visual de referencia: `referencia/Leccion_5_1_..._SCORM12.zip`.

## 1. Ficha general

| Elemento | Definición |
|---|---|
| Duración total | **40 horas** (10 h de dedicación por módulo). Las lecciones **no** muestran tiempo estimado. |
| Estructura | 4 módulos · 16 lecciones SCORM 1.2 (se mantienen las 16 del diseño original) |
| Público | Analistas de remuneraciones con experiencia, principiantes en IA |
| Caso transversal | Camila Torres, analista senior en AndesCorp (empresa ficticia, 250 colaboradores) |
| Dispositivos | PC y móvil, diseño responsivo, tema claro/oscuro automático |
| Aprobación | 70 % de logro global |

## 2. Inventario de recursos por módulo

| # | Recurso | Por módulo | Total | Formato / destino |
|---|---|---:|---:|---|
| 1 | Lecciones interactivas con video integrado | 4 | 16 | SCORM 1.2 (HTML) |
| 2 | Video del módulo incrustado en Moodle | 1 | 4 | MP4 + subtítulos `.vtt` |
| 3 | Material PDF | 2 | 8 | PDF descargable |
| 4 | Resumen tipo carrusel | 1 | 4 | HTML |
| 5 | Glosario tipo carrusel | 1 | 4 | HTML |
| 6 | Laboratorios prácticos (simulador) | 2 | 8 | Artefacto HTML |
| 7 | Cuestionario de selección múltiple (10 preguntas) | 1 | 4 (40 preguntas) | Moodle XML |
| 8 | Evaluación final aplicada: caso ramificado | 1 (desde M2) | 3 | Laboratorio SCORM 1.2 |
| 9 | Caso de análisis en Mindsmith | 4 (1 por lección) | 16 | Mindsmith (solo casos) |

Imágenes: **Canva**, estilo fotográfico realista, coherente con la referencia.

## 3. Reglas transversales

### 3.1 Lecciones SCORM
- **Todas** tienen video integrado: un reproductor con escenario oscuro, capítulos y subtítulos, como en la referencia 5.1.
- **Narración alternada:** las lecciones x.1 y x.3 van **con voz**; las x.2 y x.4 van **sin voz** (el video muestra textos animados y subtítulos).
- Voz: **Catalina (Chile)**, `es-CL-CatalinaNeural` de Microsoft, gratuita mediante `edge-tts`.
- Cada lección combina **herramientas interactivas distintas** (ver §5). Ninguna repite la combinación de otra.
- Las pantallas se desbloquean al completar la interacción, como en la referencia (`data-gate`).
- Se registra en SCORM: `lesson_status`, `score.raw` y `suspend_data` para retomar el avance.

### 3.2 Cuestionarios Moodle XML
- 10 preguntas de selección múltiple por módulo, con 4 alternativas y una sola correcta.
- **Feedback en cada alternativa**, sea correcta o incorrecta, con la explicación del criterio. También feedback general por pregunta.
- Preguntas contextualizadas en el caso de Camila, no de memoria.

### 3.3 Laboratorios (artefactos HTML)
- Son simuladores aplicativos. El principal es un **simulador de Excel en el navegador**: celdas, fórmulas, validación y comprobación automática.
- Usan datos 100 % sintéticos, con retroalimentación inmediata y opción de reintentar.

### 3.4 Evaluación final ramificada (módulos 2, 3 y 4)
- Es un laboratorio SCORM con un caso que se bifurca según las decisiones: cada decisión abre consecuencias distintas.
- Feedback en cada nodo y puntaje enviado a Moodle.

### 3.5 Mindsmith
- Solo casos de análisis: 1 por lección, 16 en total. Complementan la lección y no la reemplazan.

## 4. Sistema visual (homologado con la referencia 5.1)

- **Layout:** panel lateral fijo con la ruta de la lección en PC (≥980 px), que en móvil pasa a ser un botón "Ruta". Barra superior fija con progreso. Pantallas tipo tarjeta (radio 28 px). Barra inferior de navegación.
- **Paleta (tokens CSS, iguales en todos los recursos HTML):**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--teal` | `#0f7a82` | `#3cc2c0` | Acento principal, progreso |
| `--teal2` | `#2bc2b1` | `#2bc2b1` | Degradado, foco |
| `--navy` | `#173f4e` | `#9fd6dc` | Títulos de panel |
| `--ink` | `#172431` | `#e4eef1` | Texto |
| `--bg` / `--bg2` | `#dbe3e6` / `#eef2f4` | `#0c161b` / `#101d23` | Fondo |
| `--surface` | `#ffffff` | `#15242c` | Tarjetas |
| `--violet` | `#6c3dd1` | `#b69bff` | Etiquetas secundarias |
| `--amber` | `#c97d0e` | `#f0a83a` | Historia / alertas |
| `--good` / `--bad` | `#166534` / `#9e1c40` | `#8fe0a6` / `#ff9db4` | Feedback |
| `--stage` | `#10303c` | `#10303c` | Escenario del video (siempre oscuro) |

- Tipografía del sistema (`system-ui`). Títulos con `clamp()`. Respeta `prefers-color-scheme`.
- La misma hoja de estilos base se usa en lecciones, laboratorios, carruseles y evaluaciones.

## 5. Mapa de lecciones y herramientas interactivas

| Lección | Voz | Herramientas interactivas principales | Caso Mindsmith |
|---|:-:|---|---|
| **1.1** ¿Qué puede hacer la IA por un analista? | ✅ | Clasificar arrastrando · Hotspot (ciclo de remuneraciones) · Flashcards | ¿Le confiarías esta tarea a la IA? |
| **1.2** Herramientas de IA para el trabajo cotidiano | — | Pestañas · Emparejar · Tabla comparativa | Camila elige herramienta |
| **1.3** Cómo elaborar prompts efectivos | ✅ | Constructor de prompts · Deslizador antes/después · Acordeón | Mejorar un prompt vago |
| **1.4** Uso responsable y protección de datos | — | Decisiones por escenario · Línea de tiempo (Ley 21.719) · Checklist | La base real en herramienta pública |
| **2.1** La información que debe revisar la IA | ✅ | Hotspot sobre liquidación · Clasificar haberes · Acordeón | Registros incompletos |
| **2.2** IA como asistente para fórmulas de Excel | — | Chat IA simulado · Flashcards de funciones · Probador de fórmulas | La búsqueda que asocia mal |
| **2.3** Detección asistida de inconsistencias | ✅ | Tabla de alertas (corregir/investigar/descartar) · Pestañas · Emparejar | Anomalía vs. error |
| **2.4** Validación y control de calidad | — | Ordenar secuencia · Resaltar la premisa errónea · Stepper | La IA con un supuesto falso |
| **3.1** Preparación de datos para análisis | ✅ | Limpiar tabla · Flashcards (agregado/anonimizado/sintético) · Acordeón | Tres bases, tres formatos |
| **3.2** Variaciones mensuales | — | Calculadora con deslizador · Clasificar hecho/hipótesis/error · Pestañas | El 8 % de aumento |
| **3.3** Indicadores y visualización | ✅ | Selector de gráficos · Hotspot (gráfico engañoso) · Emparejar | El gráfico que exagera |
| **3.4** Informes ejecutivos con IA | — | Editor de informe (marcar frases) · Línea de tiempo · Checklist | Informe con afirmaciones sin respaldo |
| **4.1** Oportunidades de automatización | ✅ | Matriz esfuerzo-impacto arrastrable · Flashcards · Pestañas | Mapa del cierre de Camila |
| **4.2** Asistentes de IA para tareas administrativas | — | Chat IA simulado (configura tu asistente) · Acordeón · Checklist | Respuestas a consultas frecuentes |
| **4.3** Flujo de remuneraciones asistido por IA | ✅ | Ordenar flujo arrastrando · Hotspot (diagrama) · Stepper | Dónde va el control humano |
| **4.4** Proyecto integrador | — | Constructor guiado del proyecto · Línea de tiempo de implementación · Rúbrica de autoevaluación | Propuesta para la gerencia |

Todas las lecciones incluyen, además: video integrado, comprobación breve, transferencia al trabajo y pantalla de finalización.

## 6. Recursos complementarios por módulo

| Módulo | PDF 1 | PDF 2 | Laboratorio A | Laboratorio B | Evaluación final ramificada |
|---|---|---|---|---|---|
| **1** Fundamentos | Guía: IA generativa en remuneraciones, usos y límites | Checklist de uso responsable y protección de datos | Laboratorio de prompts (respuestas IA simuladas) | Semáforo de datos: anonimizar una planilla en el simulador Excel | — (se evalúa con el cuestionario XML) |
| **2** Revisión | Guía de fórmulas de control en Excel | Protocolo de validación de resultados de IA | Fórmulas de control (BUSCARX/SI/COINCIDIR con casos de prueba) | Auditoría del cierre: 12 registros con errores | "Cierre de remuneraciones bajo revisión" |
| **3** Análisis | Guía de preparación de datos y diccionario de variables | Plantilla de informe ejecutivo | Variaciones mensuales (absoluta, %, por área) | Tablero de indicadores (KPI y gráficos) | "La gerencia necesita respuestas" |
| **4** Automatización | Biblioteca de prompts para remuneraciones | Guía para diseñar un flujo de cierre asistido por IA y rúbrica | Checklist de cierre con controles automáticos | Simulador de flujo con puntos de control | "Modernizando el cierre mensual" |

Cada módulo incluye además: **1 video Moodle** (presentación y síntesis del módulo, con Catalina), **resumen carrusel** y **glosario carrusel**.

## 7. Evaluación (propuesta de ponderación en Moodle)

Cada módulo pesa 25 %.

| Componente | Módulo 1 | Módulos 2–4 |
|---|---:|---:|
| Cuestionario XML (10 preguntas) | 50 % | 30 % |
| Laboratorios A + B | 50 % | 30 % |
| Evaluación final ramificada (SCORM) | — | 40 % |

## 8. Pendientes técnicos

1. **Voz Catalina:** el entorno de desarrollo debe permitir el dominio `speech.platform.bing.com` para generar los MP3 con `edge-tts`.
2. **Canva:** autorizar el conector de Canva para obtener y exportar las imágenes.
3. **Mindsmith:** conectado (organización "Equipo de paula"). Los casos se crean al producir cada lección.

## 9. Orden de producción

1. Lección modelo **1.1** (con voz) y **1.2** (sin voz), para validar los patrones visual y técnico.
2. Laboratorios y cuestionario XML del módulo 1, más resumen, glosario y PDF.
3. Video Moodle del módulo 1 y casos Mindsmith 1.1–1.4.
4. Repetir para los módulos 2–4, sumando la evaluación final ramificada.
5. Prueba en Moodle (PC y móvil) y verificación del registro SCORM.
