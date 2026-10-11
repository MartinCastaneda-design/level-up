/**
 * Utilidades de formateo para la tienda Level-Up Gamer
 */

/**
 * Formatea un número al estándar de moneda peso chileno (CLP)
 * Ej: 29990 -> $29.990
 * @param {number} valor 
 * @returns {string}
 */
export function formatCLP(valor) {
  const monto = Number(valor) || 0;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(monto);
}

/**
 * Formatea una fecha o timestamp a formato legible chileno (DD/MM/AAAA)
 * @param {Date|string|number} fecha 
 * @returns {string}
 */
export function formatDateCL(fecha = new Date()) {
  return new Date(fecha).toLocaleDateString('es-CL');
}
