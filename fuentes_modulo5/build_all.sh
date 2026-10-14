#!/bin/bash
# construye las 5 lecciones del módulo 5; usa aud/ (Ninoska) si existe, si no ph/aud (relleno)
cd /home/user/Simulador-Excel/fuentes_modulo5
B=../.claude/skills/leccion-interactiva-scorm/scripts
FINAL=${FINAL:-0}
while IFS='|' read d n t; do
  A=$d/aud; [ -d $A ] && [ "$(ls $A | wc -l)" -ge 17 ] || A=$d/ph/aud
  python3 $B/build.py leccion $d/src.html --title "$t" --id LEGLAB_M5_${d^^} --name Leccion --img $d/img --aud $A --out $d/out
  if [ "$FINAL" = 1 ]; then
    python3 $B/build.py leccion $d/src.html --title "$t" --id LEGLAB_M5_${d^^} --name $n --img $d/img --aud $A --out $d/final
    cp $d/final/$n.html $d/final/${n}_SCORM12.zip ..
  fi
done <<'L'
l51|Leccion_5_1_Como_puede_terminar_una_relacion_laboral|Lección 5.1 — ¿Cómo puede terminar una relación laboral?
l52|Leccion_5_2_Renuncia_acuerdo_y_vencimiento|Lección 5.2 — Renuncia, mutuo acuerdo y vencimiento del plazo
l53|Leccion_5_3_Necesidades_de_la_empresa_y_otras_causales|Lección 5.3 — Necesidades de la empresa y otras causales
l54|Leccion_5_4_Comunicar_correctamente_el_termino|Lección 5.4 — Comunicar correctamente el término
l55|Leccion_5_5_Indemnizaciones_y_prestaciones_asociadas|Lección 5.5 — Indemnizaciones y prestaciones asociadas
l56|Leccion_5_6_Finiquito_y_formalizacion_del_cierre|Lección 5.6 — Finiquito y formalización del cierre
l57|Leccion_5_7_Fiscalizacion_laboral|Lección 5.7 — Fiscalización laboral
l58|Leccion_5_8_La_evidencia_tambien_es_cumplimiento|Lección 5.8 — La evidencia también es cumplimiento
l59|Leccion_5_9_Que_ocurre_cuando_se_incumple|Lección 5.9 — ¿Qué ocurre cuando se incumple?
L
