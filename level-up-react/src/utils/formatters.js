
export function formatCLP(valor) {
  const monto = Number(valor) || 0;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(monto);
}

export function formatDateCL(fecha = new Date()) {
  return new Date(fecha).toLocaleDateString('es-CL');
}
