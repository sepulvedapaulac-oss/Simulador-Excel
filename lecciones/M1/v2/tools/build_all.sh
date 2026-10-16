#!/bin/sh
# Construye las 3 lecciones del Módulo 1 con la estructura de la Lección 3.1 (SCORM 1.2)
cd "$(dirname "$0")/.."
python3 tools/build.py L1 --num 1.1 --title "¿Qué tan digital es tu PYME?" --id PYMES_M1_L11 --name Leccion_1_1_Madurez_Digital
python3 tools/build.py L2 --num 1.2 --title "Tu ecosistema de trabajo digital" --id PYMES_M1_L12 --name Leccion_1_2_Ecosistema_Productividad
python3 tools/build.py L3 --num 1.3 --title "Organiza y protege tus archivos en la nube" --id PYMES_M1_L13 --name Leccion_1_3_Archivos_Nube_Seguridad
python3 tools/artifact_preview.py dist >/dev/null
