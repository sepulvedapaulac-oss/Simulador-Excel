#!/bin/sh
# Arma las cuatro lecciones del Módulo 3 con el motor del Módulo 1.
cd "$(dirname "$0")"
B="python3 ../../M1/v2/tools/build.py --root . --module 3 --shared-audio L7 $*"
$B L7 --num 3.1 --title "Hablarle a la audiencia correcta" --id PYMES_M3_L31 --name Leccion_3_1_Hablarle_a_la_Audiencia_Correcta
$B L8 --num 3.2 --title "Una marca reconocible y accesible" --id PYMES_M3_L32 --name Leccion_3_2_Marca_Reconocible_y_Accesible
$B L9 --num 3.3 --title "Invertir en publicidad sin perder el control" --id PYMES_M3_L33 --name Leccion_3_3_Publicidad_sin_Perder_el_Control
$B L10 --num 3.4 --title "Automatizar sin perder el trato humano" --id PYMES_M3_L34 --name Leccion_3_4_Automatizar_sin_Perder_el_Trato_Humano
python3 ../../M1/v2/tools/artifact_preview.py dist >/dev/null
