---
name: crear-laboratorio
description: Construye un laboratorio práctico con simulador (Excel en español u otro simulador propio) con nota SCORM. Úsala para los laboratorios A y B de cada módulo.
---
# Crear un laboratorio

1. Revisa el laboratorio asignado en `docs/diseno-curso.md`.
2. Ejemplos: `src/ejemplos/laboratorio-simulador-excel` (usa `tools/hoja.js`, `"hoja": true`) y `src/ejemplos/laboratorio-simulador-flujo` (simulador propio con incidentes).
3. Estructura: Misión (botón «Comenzar» con `api.done('start')`) → Etapa 1 práctica con revisión automática y reintento → Etapa 2 de decisiones o reflexión → Resultados con `LESSON.score()` y `LESSON.report()`.
4. `lesson.py` con `"lab": true`, `"pass": 0.7`. Guarda el mejor intento en `S.first` para que quede en SCORM.
5. Datos 100 % sintéticos y coherentes con el caso; verifica todas las cifras (sumas, porcentajes) antes de escribir el feedback.
6. Prueba con un archivo de pasos en `tools/test/steps/` que recorra la ruta correcta (debe dar 100) y otra con errores; escritorio y móvil.
7. Entrega primero para revisión de la autora. La narración en laboratorios solo se agrega si ella la aprueba.
