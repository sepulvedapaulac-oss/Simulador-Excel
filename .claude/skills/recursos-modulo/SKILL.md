---
name: recursos-modulo
description: Produce los recursos complementarios de un módulo: cuestionario Moodle XML, carruseles de resumen y glosario, dos PDF, video de presentación, imágenes de Canva y caso Mindsmith.
---
# Recursos del módulo

- **Cuestionario XML**: `src/moduloN/cuestionario.py` con 10 preguntas contextualizadas, 4 alternativas, la correcta repartida entre posiciones y feedback en cada una (ejemplo `src/ejemplos/cuestionario.py`) → `python3 tools/build_xml.py`.
- **Carruseles**: `src/moduloN/carruseles.py` con RESUMEN (unas 10 tarjetas) y GLOSARIO (15 a 20 términos) → `tools/build_carousel.py`. Revisa en móvil.
- **PDF**: `src/moduloN/pdf/*.html` con el comentario de metadatos JSON (ejemplo `src/ejemplos/pdf/guia.html`) → `tools/build_pdf.py`. Revisa con `pdftoppm`: páginas casi vacías (quita `class="page"` que fuerce saltos) y tablas cortadas.
- **Video del módulo**: `src/moduloN/video.py` (ejemplo `src/ejemplos/video.py`), sin música → `tools/build_video.py` (requiere el entorno de voz). Revisa duración, `.vtt` y un fotograma.
- **Imágenes (Canva)**: `generate-image` con estilo fotográfico realista y paleta teal/navy; para mayor resolución, abrir una transacción temporal sobre un diseño de trabajo, insertar la imagen a página completa, tomar la vista previa y **cancelar** la transacción. Nunca guardar en la cuenta de la autora. Guarda en `src/img/iNN_*.jpg` y ajusta los `alt`.
- **Caso Mindsmith**: `create_lesson` en español con el caso del módulo (unas 8 páginas, preguntas con feedback en cada alternativa, datos exactos del módulo). Si devuelve un storyboard vacío, construye las páginas con `edit_lesson`. Déjalo sin publicar y registra su ID en `curso.json` (`modulos.N.mindsmith`).
