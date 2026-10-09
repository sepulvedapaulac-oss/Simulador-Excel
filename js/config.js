/* =========================================================================
 * CONFIGURACIÓN DEL SIMULADOR — edite estos valores
 * ========================================================================= */
window.SIM_CONFIG = {
  // Nombre que aparece en el encabezado
  ORG_NAME: 'Tremen Partner',

  // URL de la aplicación web de Google Apps Script (ver README, paso 2).
  // Mientras esté vacía, los resultados se guardan solo en el navegador (modo demostración).
  APPS_SCRIPT_URL: '',

  // Porcentaje mínimo para aprobar un nivel y avanzar al siguiente
  PASS_PERCENT: 60,

  // Tiempo máximo por nivel, en minutos (0 = sin límite)
  TIME_LIMITS: { basico: 30, intermedio: 40, avanzado: 45 },

  // true: si el alumno no aprueba un nivel, la evaluación termina ahí.
  // false: el alumno rinde los tres niveles siempre.
  ADAPTIVE: true,

  // Mostrar al alumno el detalle de lo logrado en cada actividad al finalizar
  SHOW_DETAIL_TO_STUDENT: true,
};
