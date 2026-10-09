#!/bin/sh
# Construye las 3 lecciones del Módulo 2 con el motor del Módulo 1 (estructura de la Lección 3.1, SCORM 1.2).
# Agrega --preview mientras falten narraciones: esas pantallas quedan sin botón de audio y el video usa pistas silenciosas.
cd "$(dirname "$0")"
B="python3 ../../M1/v2/tools/build.py --root . --module 2 --shared-audio L4 $*"
$B L4 --num 2.1 --title "Convierte tu presencia digital en un canal comercial" --id PYMES_M2_L21 --name Leccion_2_1_Presencia_Digital_Canal_Comercial
$B L5 --num 2.2 --title "¿Tienda propia o marketplace?" --id PYMES_M2_L22 --name Leccion_2_2_Tienda_Propia_o_Marketplace
$B L6 --num 2.3 --title "Del pago a la entrega" --id PYMES_M2_L23 --name Leccion_2_3_Del_Pago_a_la_Entrega
python3 ../../M1/v2/tools/artifact_preview.py dist >/dev/null
