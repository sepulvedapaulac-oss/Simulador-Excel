#!/bin/bash
# construye las 7 lecciones con medios reales y deja html+zip en la raíz del repo
cd /home/user/Simulador-Excel/fuentes_modulo4
B=../.claude/skills/leccion-interactiva-scorm/scripts
while IFS='|' read d n t; do
  python3 $B/build.py leccion $d/src.html --title "$t" --id LEGLAB_M4_${d^^} --name Leccion --img $d/img --aud $d/aud --out $d/out >/dev/null || { echo "FALLA build $d"; continue; }
  python3 $B/build.py leccion $d/src.html --title "$t" --id LEGLAB_M4_${d^^} --name $n --img $d/img --aud $d/aud --out $d/final >/dev/null
  cp $d/final/$n.html $d/final/${n}_SCORM12.zip ..
  echo "$d ok $(du -h ../$n.html | cut -f1) $(du -h ../${n}_SCORM12.zip | cut -f1)"
done <<'L'
l41|Leccion_4_1_Entorno_seguro|Lección 4.1 — El derecho a trabajar en un entorno seguro
l42|Leccion_4_2_Distinguir_acoso_y_violencia|Lección 4.2 — Distinguir acoso laboral, acoso sexual y violencia
l43|Leccion_4_3_Prevenir_antes_de_reaccionar|Lección 4.3 — Prevenir antes de reaccionar
l44|Leccion_4_4_Protocolo_como_herramienta|Lección 4.4 — El protocolo como herramienta de gestión
l45|Leccion_4_5_Denuncia|Lección 4.5 — ¿Qué ocurre cuando se presenta una denuncia?
l46|Leccion_4_6_Investigacion_y_resguardo|Lección 4.6 — Investigación y medidas de resguardo
l47|Leccion_4_7_Conflicto_no_es_acoso|Lección 4.7 — Conflicto no es lo mismo que acoso
L
