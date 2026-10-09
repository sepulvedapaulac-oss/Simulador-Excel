/* =========================================================================
 * CONFIGURACIÓN DEL SIMULADOR — edite estos valores
 * ========================================================================= */
window.SIM_CONFIG = {
  // Nombre que aparece en el encabezado
  ORG_NAME: 'Tremen Partner',

  // Dónde se guardan los resultados de los alumnos: 'microsoft' o 'google'.
  // Mientras no se complete la URL correspondiente, el simulador funciona en
  // modo demostración (los resultados quedan solo en el navegador).
  BACKEND: 'microsoft',

  // --- Opción Microsoft: Excel en OneDrive/SharePoint + Power Automate (backend/MICROSOFT.md)
  // URL del flujo "Guardar resultado" (disparador "Cuando se recibe una solicitud HTTP").
  POWER_AUTOMATE_SAVE_URL: '',
  // (Opcional) URL del flujo "Listar resultados", para ver la tabla en el Panel docente.
  POWER_AUTOMATE_LIST_URL: '',
  // (Opcional) Enlace al archivo Excel de resultados, para abrirlo desde el Panel docente.
  EXCEL_RESULTS_URL: '',

  // --- Opción Google: Google Sheets + Apps Script (backend/Code.gs)
  APPS_SCRIPT_URL: '',

  // Uso interno para recomendar el curso (no se muestra al alumno como nota):
  // se considera que el alumno "domina" un nivel si logra este % de sus actividades.
  // El curso recomendado es el primer nivel que no domina.
  MASTERY_PERCENT: 70,

  // Tiempo máximo por nivel, en minutos (0 = sin límite)
  TIME_LIMITS: { basico: 30, intermedio: 40, avanzado: 45 },

  // Mostrar al alumno el detalle de lo logrado en cada actividad al finalizar
  SHOW_DETAIL_TO_STUDENT: true,
};
