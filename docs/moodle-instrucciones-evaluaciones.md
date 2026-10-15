# Instrucciones para Moodle · Evaluaciones de módulo y evaluación final

Texto listo para pegar en **General → Descripción** de cada actividad, más la configuración sugerida de las otras secciones. Marca «Muestra la descripción en la página del curso» si quieres que el texto se vea sin entrar a la actividad.

---

## Evaluación Módulo 1 · 2 · 3 · 4 (cuestionario Moodle XML de 10 preguntas)

**Nombre:** Evaluación Módulo N

**Descripción** (cambia N y el tema del módulo):

> **Evaluación del Módulo N: [tema del módulo]**
>
> Esta evaluación te permite comprobar lo que aprendiste en las cuatro lecciones del módulo. Tiene **10 preguntas de selección múltiple** basadas en situaciones del caso de Camila en AndesCorp.
>
> **Antes de comenzar**
> - Cada pregunta tiene cuatro alternativas y una sola respuesta correcta.
> - Al responder verás si tu respuesta es correcta o incorrecta, con la explicación de cada alternativa.
> - Tienes **2 intentos**. Se considera tu mejor resultado.
> - Es una evaluación **formativa**: te ayuda a identificar qué repasar y no se pondera en la nota final del curso.
> - Tiempo estimado: 20 minutos.
>
> Te recomendamos responderla después de completar las cuatro lecciones, los laboratorios y el caso del módulo.

Temas por módulo para la primera línea:
- Módulo 1: Fundamentos de IA
- Módulo 2: IA para revisión y validación de remuneraciones
- Módulo 3: Análisis de datos y reportes de remuneraciones con IA
- Módulo 4: Automatización y productividad

**Configuración sugerida**

| Sección | Ajuste |
|---|---|
| Temporalización | Sin fecha de cierre (curso asincrónico). Límite de tiempo: desactivado, o 30 minutos si quieres un límite. |
| Calificación | Intentos permitidos: 2. Método: calificación más alta. Calificación para aprobar: 70 % (7 de 10). |
| Esquema | Página nueva: cada pregunta. |
| Comportamiento de las preguntas | Ordenar al azar las respuestas: Sí. Comportamiento: **Retroalimentación inmediata** (muestra el feedback de cada alternativa al responder). |
| Opciones de revisión | Marcar todo en «Inmediatamente después de cada intento» y «Después de cerrar el cuestionario»: el intento, si fue correcta, puntos, retroalimentación específica y general, respuesta correcta. |
| Preguntas | Agregar → del banco de preguntas → categoría importada del archivo `Cuestionario_ModuloN_Moodle.xml` → las 10 preguntas. |

---

## Evaluación final del curso

El paquete SCORM `Evaluacion_final_del_curso_SCORM12.zip` ya contiene **las dos partes** y calcula la nota con 50 % cada una (equivale a 30 % + 30 % de la nota del curso). Hay dos formas de montarla:

- **Opción A (recomendada):** una sola actividad SCORM con peso 60 % en el libro de calificaciones.
- **Opción B:** Parte 1 como cuestionario Moodle (banco `Evaluacion_final_curso_Parte1_Moodle.xml`, 30 %) y Parte 2 con el SCORM (30 %). En este caso el SCORM vuelve a mostrar la Parte 1, así que avísale al equipo antes de elegir esta opción.

### Opción A · Actividad SCORM «Evaluación final del curso»

**Nombre:** Evaluación final del curso

**Descripción:**

> **Evaluación final del curso**
>
> Esta evaluación integra lo aprendido en los cuatro módulos y equivale al **60 % de tu nota final**. Tiene dos partes:
>
> **Parte 1 · Cuestionario (30 %).** 20 preguntas de selección múltiple, cinco por módulo, identificadas como M1.P1 a M4.P5. Al responder cada una verás si es correcta, con su explicación. Cada pregunta se responde una sola vez.
>
> **Parte 2 · Caso práctico integrador (30 %).** Un caso de cierre mensual de AndesCorp con cuatro tareas, una por módulo: preparar los datos y la instrucción para la IA, decidir qué hacer con las alertas, analizar una variación en el simulador de Excel y proponer una mejora con control humano.
>
> **Antes de comenzar**
> - Completa los cuatro módulos.
> - Reserva unos 90 minutos. Si sales, tu avance queda guardado y puedes continuar donde quedaste.
> - Al terminar podrás **descargar un PDF con tus resultados**.
>
> Escala de 1,0 a 7,0. Nota mínima de aprobación del curso: 4,0 en la nota final ponderada.

**Configuración sugerida (SCORM):** Paquete: subir el zip tal cual. Método de calificación: calificación más alta. Intentos: 1. Mostrar: en la misma ventana (o ventana nueva si el tema de Moodle recorta la pantalla). Completitud: «Estado: aprobado» y «Calificación requerida».

### Opción B · Cuestionario «Evaluación final · Parte 1»

**Nombre:** Evaluación final · Parte 1: Cuestionario

**Descripción:**

> **Evaluación final · Parte 1: Cuestionario**
>
> Esta parte equivale al **30 % de tu nota final**. Tiene **20 preguntas de selección múltiple**, cinco por cada módulo del curso, identificadas como M1.P1 a M4.P5.
>
> **Antes de comenzar**
> - Cada pregunta tiene cuatro alternativas y una sola respuesta correcta.
> - Tienes **1 intento** y 40 minutos.
> - Al enviar el intento verás tu resultado y la explicación de cada alternativa.
>
> Después continúa con la **Parte 2: caso práctico integrador**.

| Sección | Ajuste |
|---|---|
| Temporalización | Límite de tiempo: 40 minutos. Cuando el tiempo termina: el intento se envía automáticamente. |
| Calificación | Intentos permitidos: 1. Calificación para aprobar: 70 %. |
| Esquema | Página nueva: cada pregunta. |
| Comportamiento de las preguntas | Ordenar al azar las respuestas: Sí. Comportamiento: **Retroalimentación diferida**. |
| Opciones de revisión | «Inmediatamente después del intento»: el intento, si fue correcta, puntos, retroalimentación específica, respuesta correcta. |
