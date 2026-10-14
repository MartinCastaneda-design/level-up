import React from 'react';
import { formatCLP } from '../utils/formatters';

export const OrderSummary = ({ subtotal = 0, descuento = 0, porcentajeDescuento = 0, total = 0, puntosGanar = 0, children }) => {
  return (
    <div className="card gamer-card p-4 sticky-top" style={{ top: '90px' }}>
      <h4 className="h5 text-white brand-font mb-3 pb-2 border-bottom border-secondary">
        Resumen del Pedido
      </h4>

      <div className="d-flex justify-content-between text-muted mb-2">
        <span>Subtotal:</span>
        <span className="text-light">{formatCLP(subtotal)}</span>
      </div>

      {descuento > 0 && (
        <div className="d-flex justify-content-between text-warning mb-2">
          <span>Descuento aplicado ({porcentajeDescuento}%):</span>
          <span>-{formatCLP(descuento)}</span>
        </div>
      )}

      <div className="d-flex justify-content-between text-muted mb-3">
        <span>Costo de Despacho:</span>
        <span className="text-success fw-bold">Gratis</span>
      </div>

      <hr className="border-secondary my-3" />

      {puntosGanar > 0 && (
        <div
          className="p-3 mb-3 rounded-3 d-flex align-items-center justify-content-between"
          style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-coin text-warning fs-4"></i>
            <div>
              <strong className="text-white small d-block">Puntos LevelUp que ganarás:</strong>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>1 punto por cada $1.000 gastados</span>
            </div>
          </div>
          <span className="badge bg-warning text-dark fs-6 fw-bold px-3 py-2 shadow-sm">
            +{puntosGanar} pts
          </span>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-baseline mb-4">
        <span className="text-white fw-bold fs-5">Total a Pagar:</span>
        <span className="price-tag fs-2">{formatCLP(total)}</span>
      </div>

      {children}
    </div>
  );
};

export default OrderSummary;
