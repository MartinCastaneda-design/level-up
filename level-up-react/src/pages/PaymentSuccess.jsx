import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { formatCLP } from '../utils/formatters';

export const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener datos pasados por state en la navegación, o fallback a última orden en localStorage
  const stateOrder = location.state?.order;
  let orden = stateOrder;

  if (!orden) {
    try {
      const historial = JSON.parse(localStorage.getItem('historial_compras')) || [];
      if (historial.length > 0) {
        orden = historial[0];
      }
    } catch (e) {
      orden = null;
    }
  }

  // Fallback por defecto si se accede directamente a la URL
  const ordenFinal = orden || {
    id: 'ORD-DEMO',
    fecha: new Date().toLocaleDateString('es-CL'),
    total: 0,
    puntos: 0,
    items: [],
    cliente: { nombre: 'Gamer', email: 'gamer@levelup.cl', metodoPago: 'webpay' }
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* Tarjeta de Éxito */}
          <div className="card gamer-card border-success p-4 p-md-5 text-center shadow-lg position-relative overflow-hidden mb-4">
            <div className="mb-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25 p-4 mb-2"
                style={{ width: '90px', height: '90px' }}
              >
                <i className="bi bi-check-circle-fill text-success display-4"></i>
              </div>
            </div>

            <h1 className="h2 text-white brand-font mb-2">¡PAGO REALIZADO CON ÉXITO!</h1>
            <p className="text-secondary mb-4">
              Tu transacción ha sido procesada correctamente. Hemos enviado el comprobante a tu correo electrónico.
            </p>

            {/* Ficha Resumen de Orden */}
            <div className="bg-dark rounded-3 p-3 p-md-4 text-start border border-secondary mb-4">
              <div className="row g-3">
                <div className="col-6 col-sm-3">
                  <span className="text-secondary small d-block">N° DE ORDEN</span>
                  <strong className="text-info font-monospace">{ordenFinal.id}</strong>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-secondary small d-block">FECHA</span>
                  <strong className="text-white">{ordenFinal.fecha}</strong>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-secondary small d-block">MÉTODO DE PAGO</span>
                  <strong className="text-white text-uppercase">{ordenFinal.cliente?.metodoPago || 'Webpay Plus'}</strong>
                </div>
                <div className="col-6 col-sm-3">
                  <span className="text-secondary small d-block">PUNTOS GANADOS</span>
                  <span className="badge bg-warning text-dark fw-bold">+{ordenFinal.puntos || 0} pts</span>
                </div>
              </div>

              <hr className="border-secondary my-3" />

              {/* Detalle de Artículos */}
              <h5 className="text-white h6 mb-3">
                <i className="bi bi-bag-check me-2 text-info"></i>Resumen de Productos:
              </h5>
              {ordenFinal.items && ordenFinal.items.length > 0 ? (
                <ul className="list-group list-group-flush mb-3">
                  {ordenFinal.items.map((item, index) => (
                    <li
                      key={index}
                      className="list-group-item bg-transparent text-secondary d-flex justify-content-between align-items-center px-0 py-2 border-secondary"
                    >
                      <div>
                        <span className="text-white fw-semibold">{item.nombre}</span>
                        <span className="text-muted small ms-2">x{item.cantidad}</span>
                      </div>
                      <span className="text-success font-monospace">{formatCLP(item.precio * item.cantidad)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted small mb-3">Orden generada correctamente en el sistema.</p>
              )}

              <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
                <span className="h6 text-white mb-0">Total Pagado:</span>
                <span className="h4 text-success font-monospace mb-0 fw-bold">{formatCLP(ordenFinal.total)}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link to="/perfil" className="btn btn-outline-info">
                <i className="bi bi-clock-history me-2"></i>Ver en Mi Historial
              </Link>
              <Link to="/catalogo" className="btn btn-primary-gamer">
                <i className="bi bi-controller me-2"></i>Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccess;
