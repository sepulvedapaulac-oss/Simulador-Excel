# Componentes faltantes para completar la estructura del curso en Moodle

Curso: **Herramientas Digitales para el Crecimiento de PYMES** (20 h, asincrónico).

## Qué se agregó por módulo

| Módulo | PDF (herramientas descargables) | Actividades prácticas (SCORM 1.2) | Evaluación Parte 1 (Moodle XML) | Evaluación Parte 2 – casos (SCORM 1.2) |
|---|---|---|---|---|
| 1 | `M1/recursos/pdf/M1_PDF1_Checklist_Madurez_Digital.pdf` (versión PDF rellenable del checklist que hoy está en HTML) · ya existe en Moodle la *Guía: Organización y seguridad en la nube* | `Practica_M1_A1_Laboratorio_Nube` · `Simulador_M1_Herramientas_M365` | `M1_Evaluacion.xml` (M1.P1–M1.P10) | — |
| 2 | `M2_PDF1_Checklist_Perfil_Comercial.pdf` · `M2_PDF2_Matriz_Canales_Mapa_Venta.pdf` | `Practica_M2_A1_Laboratorio_Perfil_Pedidos` · `Simulador_M2_Margen_por_Canal` | `M2_Evaluacion_Parte1.xml` (M2.P1–M2.P10) | `Evaluacion_M2_Parte2_Casos_SCORM12.zip` (M2.P11–M2.P20) |
| 3 | `M3_PDF1_Cliente_Ideal_Calendario_Checklist_Visual.pdf` · `M3_PDF2_Planificador_Campana_Respuestas_Automaticas.pdf` | `Practica_M3_A1_Laboratorio_Publicacion` · `Simulador_M3_Campana_Presupuesto` | `M3_Evaluacion_Parte1.xml` (M3.P1–M3.P10) | `Evaluacion_M3_Parte2_Casos_SCORM12.zip` (M3.P11–M3.P20) |
| 4 | `M4_PDF1_Base_Clientes_Guia_Indicadores.pdf` · `M4_PDF2_Plan_Accion_Digital.pdf` | `Practica_M4_A1_Laboratorio_CRM` · `Simulador_M4_Indicadores` | `M4_Evaluacion_Parte1.xml` (M4.P1–M4.P10) | `Evaluacion_M4_Parte2_Casos_SCORM12.zip` (M4.P11–M4.P20) |
| Curso | — | — | `Evaluacion_Final_Parte1.xml` (EF.P1–EF.P20) | `Evaluacion_Final_Parte2_Caso_Integrador_SCORM12.zip` (EF.P21–EF.P30) · además `Evaluacion_Diagnostica_Integral_SCORM12.zip` (diagnóstico sin nota) |

Cada pregunta vale **2 puntos**: evaluación por módulo y cada Parte 2 = 10 × 2 = **20 puntos**; evaluación final Parte 1 = 20 × 2 = **40 puntos**; evaluación final Parte 2 (caso integrador) = 10 × 2 = **20 puntos**.

**Parte 2 (SCORM, formato actividad):** cada pregunta es un caso con datos para analizar, calcular, clasificar, priorizar o detectar errores en pantallas recreadas. La respuesta se registra sin mostrar la corrección; al terminar se ve el puntaje, el detalle por pregunta (con su ID) y la revisión completa con la retroalimentación. Aprueba con 60% (exigencia estándar; ajustable). En Moodle: *Calificación máxima* = 20 para que el porcentaje del paquete se convierta en puntos, e *Intentos* según la política del curso (dentro de un intento la evaluación se responde una sola vez).
Cada pregunta (XML y SCORM) trae retroalimentación de respuesta correcta / incorrecta con su explicación.

## Cómo cargarlo en Moodle

**Preguntas (XML)**
1. Curso → *Más* → *Banco de preguntas* → *Importar* → formato **Moodle XML** → subir cada archivo de `4_Evaluaciones_XML/`. Cada archivo crea su propia categoría (por ejemplo, *Herramientas Digitales PYMES / Módulo 2 / Evaluación Parte 1*) y cada pregunta queda con nombre e ID (M2.P1…).
2. En el módulo, *Añadir una actividad* → **Cuestionario** (por ejemplo, “Evaluación Módulo 2 – Parte 1”) → *Preguntas* → *Agregar desde el banco de preguntas* → seleccionar la categoría → agregar las 10. La nota de cada pregunta ya viene en 2 (calificación máxima 20).
3. Recomendado en *Opciones de revisión*: mostrar “Retroalimentación específica” y “Retroalimentación general” después de enviar. Las alternativas se barajan solas.

**Actividades prácticas, evaluaciones Parte 2 y diagnóstico (SCORM)**
*Añadir una actividad* → **Paquete SCORM** → subir el `.zip`. Sugerido: *Método de calificación* = “Calificación más alta”; *Intentos* = ilimitados.
- Actividades (laboratorios): nota sobre 100, aprueban con 80 (el paquete informa “passed/failed”).
- Simuladores: se completan al resolver 3 casos; la nota es el % de casos correctos (pueden seguir practicando).
- Evaluaciones Parte 2 (módulos 2–4 y caso integrador final): 10 preguntas de 2 puntos; *Calificación máxima* = 20; aprueban con 60%; *Intentos* según la política del curso.
- Diagnóstico: sin nota de aprobación; entrega mapa de competencias y PDF de resultados.

**PDF**: *Añadir una actividad o un recurso* → **Archivo**. Son rellenables (se completan en el computador con Adobe Reader, el navegador o similar) y también imprimibles.

## Notas
- Las pantallas de plataformas (WhatsApp Business, Canva, Meta Ads, HubSpot, GA4) son recreaciones simplificadas; las empresas y contactos son ficticios.
- Las actividades prácticas no tienen narración de voz: la cuenta de ElevenLabs quedó sin créditos.
