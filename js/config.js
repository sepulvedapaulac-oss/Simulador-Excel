/* =========================================================================
 * CONFIGURACIÓN DEL SIMULADOR — edite estos valores
 * ========================================================================= */
window.SIM_CONFIG = {
  // Nombre que aparece en el encabezado
  ORG_NAME: 'Tremen Partner',

  // URL de la aplicación web de Google Apps Script (ver README, paso 2).
  // Mientras esté vacía, los resultados se guardan solo en el navegador (modo demostración).
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
