#!/bin/bash
# Reconstruye las 8 actividades prácticas / simuladores (SCORM 1.2). Ejecutar desde lecciones/practicas
set -e
b(){ python3 tools/build.py "src/$1.html" --tipo "$2" --id "$3" --name "$4" --title "$5" --module "$6" --img img --out dist; }
b M1_A1 actividad PYMES_M1_A1 Practica_M1_A1_Laboratorio_Nube "Laboratorio: ordena, comparte y protege la nube del negocio" 1
b M1_A2 simulador PYMES_M1_S2 Simulador_M1_Herramientas_M365 "Simulador: elige la herramienta de Microsoft 365 adecuada" 1
b M2_A1 actividad PYMES_M2_A1 Practica_M2_A1_Laboratorio_Perfil_Pedidos "Laboratorio: audita y mejora el perfil comercial y el flujo de pedidos" 2
b M2_A2 simulador PYMES_M2_S2 Simulador_M2_Margen_por_Canal "Simulador: ¿cuánto queda por venta en cada canal?" 2
b M3_A1 actividad PYMES_M3_A1 Practica_M3_A1_Laboratorio_Publicacion "Laboratorio: diseña una publicación clara y accesible" 3
b M3_A2 simulador PYMES_M3_S2 Simulador_M3_Campana_Presupuesto "Simulador de campaña con presupuesto acotado" 3
b M4_A1 actividad PYMES_M4_A1 Practica_M4_A1_Laboratorio_CRM "Laboratorio CRM: organiza y segmenta la base de Casa Nativa" 4
b M4_A2 simulador PYMES_M4_S2 Simulador_M4_Indicadores "Simulador de indicadores: lee tus datos y decide" 4
