#!/bin/sh
# Construye las 3 lecciones del Módulo 1 (HTML autocontenido + SCORM 1.2)
cd "$(dirname "$0")/.."
python3 tools/build.py src/L1_Madurez_Digital.html --title "Lección 1 — ¿Qué tan digital es tu PYME?" --id PYMES_M1_L1 --name Leccion_1_1_Madurez_Digital --img img --out dist
python3 tools/build.py src/L2_Ecosistema_Productividad.html --title "Lección 2 — Tu ecosistema de trabajo digital" --id PYMES_M1_L2 --name Leccion_1_2_Ecosistema_Productividad --img img --out dist
python3 tools/build.py src/L3_Archivos_Nube_Seguridad.html --title "Lección 3 — Organiza y protege tus archivos en la nube" --id PYMES_M1_L3 --name Leccion_1_3_Archivos_Nube_Seguridad --img img --out dist
