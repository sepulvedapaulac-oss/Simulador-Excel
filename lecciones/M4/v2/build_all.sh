#!/bin/sh
# Arma las tres lecciones del Módulo 4 con el motor del Módulo 1.
cd "$(dirname "$0")"
B="python3 ../../M1/v2/tools/build.py --root . --module 4 --shared-audio L11 $*"
$B L11 --num 4.1 --title "De contactos dispersos a clientes que vuelven" --id PYMES_M4_L41 --name Leccion_4_1_De_Contactos_Dispersos_a_Clientes_que_Vuelven
$B L12 --num 4.2 --title "Usa tus datos para decidir" --id PYMES_M4_L42 --name Leccion_4_2_Usa_tus_Datos_para_Decidir
$B L13 --num 4.3 --title "Construye tu plan de acción digital" --id PYMES_M4_L43 --name Leccion_4_3_Construye_tu_Plan_de_Accion_Digital
python3 ../../M1/v2/tools/artifact_preview.py dist >/dev/null
