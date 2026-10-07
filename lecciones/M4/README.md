# Módulo 4 · Lecciones SCORM 1.2 (estructura homologada con la Lección 3.1)

Curso *Herramientas Digitales para el Crecimiento de PYMES*. Personaje recurrente: Marcela, dueña de “Casa Nativa”. Adaptación de los SCORM 11, 12 y 13 originales.

| Lección | Paquete SCORM (`v2/dist/`) |
|---|---|
| 4.1 De contactos dispersos a clientes que vuelven | `Leccion_4_1_De_Contactos_Dispersos_a_Clientes_que_Vuelven_SCORM12.zip` |
| 4.2 Usa tus datos para decidir | `Leccion_4_2_Usa_tus_Datos_para_Decidir_SCORM12.zip` |
| 4.3 Construye tu plan de acción digital | `Leccion_4_3_Construye_tu_Plan_de_Accion_Digital_SCORM12.zip` |

Motor: `../M1/v2/tools`. 11 pantallas por lección (caso con decisión, video ampliable con temas clave, 5 actividades, caso con 2 decisiones, comprobación 80%, transferencia con respuesta modelo, reporte).

- `img/`: fotos realistas generadas con IA (m11_*, m12_*, m13_*) y **capturas recreadas de plataformas** (crm_ficha, crm_lista, crm_tareas, crm_planilla, ga4_adq, ga4_paginas, ga4_eventos, looker_panel, plan_tablero), generadas desde `ui/screens.html` con `ui/shot.js`. Datos ficticios.
- Actualizaciones verificadas (octubre de 2026): Google Analytics 4 usa “eventos clave” (antes “conversiones”) y el informe Adquisición › Adquisición de tráfico por “grupo de canales predeterminado de la sesión”; Chile cuenta con la Ley 21.719 de protección de datos personales.
- `v2/data/L*.json`: narración y escenas del video (voz Ninoska). `v2/audio/L*/` (quiz y p10 compartidos desde `L11`).
- `v2/build_all.sh` arma las tres lecciones. Prueba: `node ../M1/v2/tools/test_v2.js v2/dist/<lección>/index.html <carpeta>`.
