---
name: entregar-modulo
description: Verifica y entrega un módulo terminado (o la evaluación diagnóstica, la evaluación final del curso o el programa en Word) a la autora: pruebas, empaquetado con LEEME, zip y archivos sueltos.
---
# Entregar un módulo

1. Verifica que estén todos los recursos del módulo según `docs/diseno-curso.md` (lecciones, laboratorios, evaluación Parte 1 XML, Parte 2 tarea con su TXT, plantilla Word y rúbrica, 2 PDF, carruseles, video + .vtt, caso Mindsmith).
2. Prueba cada SCORM en escritorio y móvil; sin errores de JavaScript ni desborde. Las lecciones con voz deben tener sus audios.
3. Commit y push de todo lo compilado.
4. Empaqueta: `python3 tools/entrega/pack.py N`. Para el resto usa `bienvenida` (presentación, guía y TXT), `diagnostico` (evaluación diagnóstica), `curso` (evaluación final: Parte 1 XML y Parte 2 SCORM) o `programa` (programa, storyboard y planilla SENCE en Word). Genera `entregas/<nombre>/` con LEEME y su zip.
5. Envía el zip **y además los archivos sueltos** (SCORM, XML, PDF, HTML, MP4, VTT), porque algunas apps no muestran el contenido de un zip.
6. En el mensaje: lista de recursos, resultado de las pruebas, enlaces Mindsmith (sin publicar) y lo que queda pendiente de decisión de la autora.
