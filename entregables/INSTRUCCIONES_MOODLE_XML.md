# Cómo subir las evaluaciones en XML a Moodle — Legislación Laboral

Estas instrucciones sirven para la **Parte 1 (preguntas)** de cada evaluación. La Parte 2 (laboratorio) se sube como *Paquete SCORM*.

## Archivos

| Evaluación | Archivo XML | Preguntas | Puntaje | Categoría que se crea en el banco |
|---|---|---|---|---|
| Módulo 2 | `modulo_2/Evaluacion_modulo_2_parte1_preguntas.xml` | m2.p1 – m2.p10 | 10 × 2 = 20 | Legislación laboral › Módulo 2 › Evaluación del módulo 2 |
| Módulo 3 | `modulo_3/Evaluacion_modulo_3_parte1_preguntas.xml` | m3.p1 – m3.p10 | 10 × 2 = 20 | Legislación laboral › Módulo 3 › Evaluación del módulo 3 |
| Módulo 4 | `modulo_4/Evaluacion_modulo_4_parte1_preguntas.xml` | m4.p1 – m4.p10 | 10 × 2 = 20 | Legislación laboral › Módulo 4 › Evaluación del módulo 4 |
| Módulo 5 | `modulo_5/Evaluacion_modulo_5_parte1_preguntas.xml` | m5.p1 – m5.p10 | 10 × 2 = 20 | Legislación laboral › Módulo 5 › Evaluación del módulo 5 |
| Final | `evaluacion_final/Evaluacion_final_parte1_preguntas.xml` | ef.p1 – ef.p20 | 20 × 2 = 40 | Legislación laboral › Evaluación final |

Cada XML tiene al lado un archivo `_vista_previa.html` que puedes abrir en el navegador para revisar las preguntas, la respuesta correcta y la retroalimentación antes de subirlas.

> **Módulo 1:** el curso no tiene un XML de evaluación del módulo 1 (las evaluaciones en XML se pidieron desde el módulo 2). Si se necesita, se crea con el mismo formato: 10 preguntas `m1.p1` a `m1.p10`.

---

## Paso 1 · Importar las preguntas al banco

1. Entra al curso y abre el **Banco de preguntas**:
   - Moodle 4.0 a 4.5: menú del curso **Más › Banco de preguntas**.
   - Moodle 5.0 o superior: el banco está dentro del cuestionario. Primero crea el cuestionario (Paso 2) y luego entra en **Cuestionario › Banco de preguntas**.
2. En la lista desplegable de la parte superior, elige **Importar**.
3. En **Formato de archivo**, marca **Formato Moodle XML**.
4. En **General**, deja marcadas las casillas **Obtener categoría desde el archivo** y **Obtener contexto desde el archivo**. Así Moodle crea solo la categoría de la tabla anterior.
5. En **Importar preguntas desde archivo**, arrastra el XML del módulo y presiona **Importar**.
6. Moodle muestra la lista de preguntas importadas (10 en cada módulo, 20 en la final). Presiona **Continuar**.
7. Revisa que estén en la categoría correcta y que cada pregunta valga **2 puntos**.

> Importa cada archivo **una sola vez**. Si lo vuelves a importar, las preguntas quedan duplicadas en el banco.

## Paso 2 · Crear el cuestionario

1. Activa la edición. En la sección del módulo, elige **Añadir una actividad o un recurso › Cuestionario**.
2. Nombre sugerido: **Evaluación del módulo N · Parte 1** (en la final: **Evaluación final · Parte 1**).
3. Configuración recomendada:

| Sección | Opción | Valor sugerido |
|---|---|---|
| Temporalización | Abrir / cerrar / límite de tiempo | Según tu calendario (sugerencia: 30 min en los módulos, 50 min en la final) |
| Calificación | Calificación para aprobar | 16 de 20 en los módulos y 32 de 40 en la final (80 %, igual que los laboratorios). Ajústalo si tu institución usa otra exigencia. |
| Calificación | Intentos permitidos | 2 |
| Calificación | Método de calificación | Calificación más alta |
| Esquema | Página nueva | Cada pregunta |
| Comportamiento de las preguntas | Ordenar al azar las respuestas | Sí |
| Comportamiento de las preguntas | Cómo se comportan las preguntas | Retroalimentación diferida |
| Opciones de revisión | Inmediatamente después de cada intento | Marcar: El intento, Si es correcta, Puntos, Retroalimentación específica, Retroalimentación general y Retroalimentación global |
| Opciones de revisión | Después de cerrar el cuestionario | Lo mismo, y además **La respuesta correcta** |

4. Presiona **Guardar cambios y mostrar**.

## Paso 3 · Agregar las preguntas al cuestionario

1. En el cuestionario, entra en **Preguntas**.
2. Presiona **Agregar › + del banco de preguntas**.
3. Elige la categoría del módulo (por ejemplo, *Evaluación del módulo 3*), marca **todas** las preguntas y presiona **Agregar preguntas seleccionadas al cuestionario**.
4. Revisa en esa misma página:
   - **Total de puntos:** 20,00 en los módulos y 40,00 en la final.
   - **Calificación máxima:** escribe 20 (o 40). Si tu libro de calificaciones usa otra escala, por ejemplo 100 o 7,0, escribe ese valor y Moodle convierte los puntos.
   - Si quieres que el orden de las preguntas cambie para cada persona, marca **Mezclar** arriba a la derecha.

## Paso 4 · Probar antes de abrir

1. Presiona **Vista previa** y responde algunas preguntas bien y otras mal.
2. Al terminar el intento, comprueba que aparezcan el puntaje, la retroalimentación de la alternativa elegida y la retroalimentación de respuesta correcta o incorrecta.
3. Las vistas previas no cuentan en el libro de calificaciones.

## Orden dentro de cada módulo

Lecciones → 2 PDF → Actividad práctica 1 y 2 → Resumen y glosario → **Evaluación Parte 1 (este cuestionario)** → Evaluación Parte 2 (laboratorio SCORM).
La evaluación final (Parte 1 y Parte 2) va en una sección propia al final del curso.

## Problemas frecuentes

| Problema | Solución |
|---|---|
| «Error de formato» al importar | Verifica que elegiste **Formato Moodle XML**, no GIFT ni Aiken. |
| Las preguntas aparecen dos veces | Se importó el archivo dos veces. Borra la categoría duplicada desde **Banco de preguntas › Categorías**. |
| No aparece la retroalimentación al terminar | Revisa las **Opciones de revisión** del Paso 2. |
| El total no es 20 (o 40) | Alguna pregunta tiene otro puntaje en **Preguntas**. Déjala en 2. |
